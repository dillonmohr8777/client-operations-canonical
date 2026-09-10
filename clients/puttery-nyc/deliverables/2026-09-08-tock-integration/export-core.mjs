import { existsSync, renameSync, rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const runtime = 'C:/Users/dillo/Documents/Codex/worktrees/client-ops-claude-creative-factory-20260902/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook';
const { summarizeReservation, hashPayload } = await import(pathToFileURL(runtime + '/receiver/src/tock.mjs'));
const { ReservationStore } = await import(pathToFileURL(runtime + '/receiver/src/store.mjs'));

export function parseSourceJson(text) {
  return JSON.parse(text, (key, value, context) => typeof value === 'number' && !Number.isSafeInteger(value)
    && /^\d+$/.test(context?.source ?? '') ? context.source : value);
}
export function isNYC(row) {
  const group = row?.business?.businessGroupId ?? row?.businessGroupId;
  return String(row?.business?.id) === '37824' && (group == null || String(group) === '28086');
}
export function selectLatest(exported, webhook) {
  if (!exported) return { row: webhook, source: 'webhook', comparison: 'liveOnly' };
  if (!webhook) return { row: exported, source: 'export', comparison: 'exportOnly' };
  if (BigInt(exported.version_id) > BigInt(webhook.version_id)) return { row: exported, source: 'export', comparison: 'exportNewer' };
  if (BigInt(exported.version_id) < BigInt(webhook.version_id)) return { row: webhook, source: 'webhook', comparison: 'liveNewer' };
  const safe = row => { const s = JSON.parse(row.safe_summary_json); delete s.payloadHash; return JSON.stringify(s); };
  // Equal versions prefer the webhook; differing normalized fields remain a review gate.
  return { row: webhook, source: 'webhook', comparison: safe(exported) === safe(webhook) ? 'matched' : 'normalizedMismatch' };
}
export async function buildSnapshot(pages, finalPath) {
  const tempPath = finalPath + '.' + randomUUID() + '.building';
  const snapshot = new ReservationStore(tempPath);
  const receipt = { exportFiles: 0, rows: 0, filtered: 0, invalid: 0, invalidReasons: {}, conflicts: 0 };
  let committed = false;
  try {
    for await (const rows of pages) {
      if (!Array.isArray(rows) || rows.length > 5000) throw new Error('invalid_export_shape');
      receipt.exportFiles++;
      for (const row of rows) {
        receipt.rows++;
        if (!isNYC(row)) { receipt.filtered++; continue; }
        let summary;
        try { summary = summarizeReservation(row, hashPayload(row)); }
        catch (error) {
          receipt.invalid++;
          const reason = /missing a valid uint64 (id|business.id|versionId)/.exec(error.message)?.[1] ?? 'invalid_shape';
          receipt.invalidReasons[reason] = (receipt.invalidReasons[reason] || 0) + 1;
          continue;
        }
        if (snapshot.apply(summary) === 'conflict') receipt.conflicts++;
      }
    }
    if (!receipt.exportFiles) throw new Error('empty_snapshot');
    receipt.snapshotStates = snapshot.db.prepare('SELECT count(*) n FROM reservation_state').get().n;
    if (!receipt.snapshotStates || receipt.filtered || receipt.conflicts) throw new Error('snapshot_validation_failed');
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    receipt.venueDaySamples = snapshot.db.prepare(`SELECT substr(json_extract(safe_summary_json,'$.serviceDateTime'),1,10) day,
      count(*) reservations FROM reservation_state WHERE day GLOB '????-??-??' AND day < ?
      GROUP BY day ORDER BY day DESC LIMIT 2`).all(today);
    receipt.sampleGrain = 'distinct latest reservation states by Tock venue-local serviceDateTime date; not completed visits or conversions';
    snapshot.close();
    // A closed database has checkpointed its WAL. Only complete downloads replace the prior file.
    renameSync(tempPath, finalPath);
    committed = true;
    return receipt;
  } finally {
    if (!committed) {
      try { snapshot.close(); } catch {}
      for (const suffix of ['', '-wal', '-shm']) rmSync(tempPath + suffix, { force: true });
    }
  }
}
export function readCombinedSnapshot(exportPath, webhookPath) {
  const rows = new Map();
  const stats = { exportStates: 0, liveStates: 0, exportOnly: 0, liveOnly: 0, exportNewer: 0, liveNewer: 0, matched: 0, normalizedMismatch: 0 };
  let latestWebhookAt = null;
  let webhookDeliveries = 0;
  let openConflicts = 0;
  for (const [path, source] of [[exportPath, 'export'], [webhookPath, 'webhook']]) {
    if (!existsSync(path)) continue;
    const db = new DatabaseSync(path, { readOnly: true });
    try {
      db.exec('PRAGMA query_only=ON; PRAGMA busy_timeout=5000; BEGIN');
      for (const row of db.prepare('SELECT * FROM reservation_state WHERE business_id = ?').iterate('37824')) {
        if (source === 'export') { rows.set(row.reservation_id, { row, source, comparison: 'exportOnly' }); stats.exportStates++; }
        else { rows.set(row.reservation_id, selectLatest(rows.get(row.reservation_id)?.row, row)); stats.liveStates++; }
      }
      if (source === 'webhook') {
        const state = db.prepare('SELECT count(*) n,max(received_at) latest FROM deliveries').get();
        webhookDeliveries = state.n; latestWebhookAt = state.latest;
        openConflicts = db.prepare("SELECT count(*) n FROM conflicts WHERE status='open'").get().n;
      }
      db.exec('COMMIT');
    } finally { db.close(); }
  }
  for (const entry of rows.values()) stats[entry.comparison]++;
  return { rows: [...rows.values()], stats: { ...stats, combinedStates: rows.size, webhookDeliveries, latestWebhookAt, openConflicts,
    grain: 'distinct reservation IDs; greatest uint64 version wins; webhook wins equal versions; normalized differences flagged',
    reconciliationState: 'version_merge_verified_financial_reconciliation_pending' } };
}
export function combinedStatus(exportPath, webhookPath) {
  return readCombinedSnapshot(exportPath, webhookPath).stats;
}
