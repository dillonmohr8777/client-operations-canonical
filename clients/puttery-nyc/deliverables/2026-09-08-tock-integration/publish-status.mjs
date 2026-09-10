import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { combinedStatus } from './export-core.mjs';
const root = join(process.env.LOCALAPPDATA, 'Codex/ClientAccess/PutteryNYC');
try {
  const ledger = combinedStatus(join(root, 'tock-export-snapshot.sqlite'), join(root, 'tock-events.sqlite'));
  let exp = {};
  try { exp = JSON.parse(readFileSync(join(root, 'tock-export-latest.json'), 'utf8')); } catch {}
  // A failed export attempt must not overwrite the last-good public facts or clear known exclusions.
  if (!['synced','synced_with_exclusions'].includes(exp.status)) throw new Error('export_refresh_not_verified');
  const headers = { Authorization: 'Bearer ' + process.env.TOCK_RELAY_DRAIN_TOKEN };
  const response = await fetch('https://puttery-tock-relay.netlify.app/tock/health', { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('relay_health_failed');
  const relay = await response.json();
  if (String(relay.venue) !== '37824' || !relay.ok) throw new Error('wrong_relay');
  const status = { schemaVersion: 1, businessId: '37824', checkedAt: new Date().toISOString(),
    exportCheckedAt: exp.completedAt ?? exp.checkedAt ?? null,
    exportStatus: ['synced','synced_with_exclusions','failed'].includes(exp.status) ? exp.status : 'unavailable',
    exportFiles: exp.exportFiles ?? 0, exportStates: ledger.exportStates, excludedRows: exp.invalid ?? 0,
    combinedStates: ledger.combinedStates, webhookStates: ledger.liveStates, webhookDeliveries: ledger.webhookDeliveries,
    relayPending: relay.pending, relayAcked: relay.acked, openConflicts: ledger.openConflicts,
    tieMismatches: ledger.normalizedMismatch, lastWebhookAt: ledger.latestWebhookAt };
  const saved = await fetch('https://puttery-tock-relay.netlify.app/tock/status', {
    method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(status),
    signal: AbortSignal.timeout(30000)
  });
  if (!saved.ok) throw Object.assign(new Error('status_publish_failed'), { status: saved.status });
  const verified = await fetch('https://puttery-tock-relay.netlify.app/tock/status', { signal: AbortSignal.timeout(30000) });
  const readback = await verified.json();
  if (JSON.stringify(readback) !== JSON.stringify(status)) {
    for (const [key, value] of Object.entries(status)) if (readback[key] !== value) throw new Error('status_readback_mismatch');
  }
  writeFileSync(join(root, 'tock-operational-latest.json'), JSON.stringify({ ...status, merge: ledger }, null, 2));
  console.log(JSON.stringify({ published: true, verified: true, ...status }));
} catch (error) {
  console.log(JSON.stringify({ published: false, errorType: error.name, httpStatus: error.status,
    errorCode: ['export_refresh_not_verified','relay_health_failed','wrong_relay','status_publish_failed','status_readback_mismatch'].includes(error.message) ? error.message : 'operation_failed' })); process.exitCode = 1;
} finally { delete process.env.TOCK_RELAY_DRAIN_TOKEN; }
