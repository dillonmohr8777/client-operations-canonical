import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, readdirSync, rmdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';
import { parseSourceJson, isNYC, selectLatest, buildSnapshot, combinedStatus } from './export-core.mjs';
const { validateStatus } = await import(pathToFileURL('C:/Users/dillo/Documents/Codex/worktrees/client-ops-claude-creative-factory-20260902/clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/public-relay/lib/status-core.mjs'));

assert.equal(parseSourceJson('{"id":18446744073709551615}').id, '18446744073709551615');
assert.equal(isNYC({business:{id:'37824'},businessGroupId:'999'}), false);
const row = (v, hash = 'a', total = 100) => ({ version_id: v, safe_summary_json: JSON.stringify({versionId:v,amounts:{totalPriceCents:total},payloadHash:hash}) });
assert.equal(selectLatest(row('18446744073709551615'),row('9007199254740993')).comparison, 'exportNewer');
assert.equal(selectLatest(row('3','different-shape'),row('3')).comparison, 'matched');
assert.equal(selectLatest(row('3','a',200),row('3')).comparison, 'normalizedMismatch');
assert.equal(selectLatest(row('3'),row('3')).source, 'webhook');
const dir = mkdtempSync(join(tmpdir(), 'puttery-export-check-'));
const target = join(dir, 'snapshot.sqlite');
const payload = (id, versionId = '1') => ({ id, versionId, business:{id:'37824',businessGroupId:'28086'}, dateTime:'2026-09-07T12:00:00' });
const count = () => { const db = new DatabaseSync(target,{readOnly:true}); try { return db.prepare('SELECT count(*) n FROM reservation_state').get().n; } finally { db.close(); } };
try {
  const walkin = {walkinId:'3',versionId:'1',business:{id:'37824',businessGroupId:'28086'},dateTime:'2026-09-07T12:00:00',partyState:'LEFT'};
  const result = await buildSnapshot([[payload('1'),payload('2'),payload('2'),walkin,{business:{id:'37824'}}]], target);
  assert.equal(result.snapshotStates, 3); assert.equal(result.invalid, 1); assert.equal(result.venueDaySamples[0].reservations,3);
  const baseline = readFileSync(target);
  async function* failure() { yield [payload('3')]; throw new Error('simulated_download_failure'); }
  await assert.rejects(buildSnapshot(failure(),target));
  assert.deepEqual(readFileSync(target),baseline); assert.equal(count(),3);
  assert.equal(readdirSync(dir).filter(f=>f.includes('.building')).length,0);
  await buildSnapshot([[payload('2','2')]],target);
  assert.equal(count(),1);
  const status = combinedStatus(target,join(dir,'absent.sqlite'));
  assert.equal(status.combinedStates,1); assert.equal(status.exportOnly,1);
  const safe = { schemaVersion:1,businessId:'37824',exportStatus:'synced',checkedAt:new Date().toISOString(),
    exportCheckedAt:null,lastWebhookAt:null,exportFiles:1,exportStates:1,excludedRows:0,combinedStates:1,
    webhookStates:0,webhookDeliveries:0,relayPending:0,relayAcked:0,openConflicts:0,tieMismatches:0 };
  assert.ok(validateStatus(safe));
  assert.equal(validateStatus({...safe,apiKey:'must-never-publish'}),null);
  assert.equal(validateStatus({...safe,webhookDeliveries:-1}),null);
  assert.equal(validateStatus({...safe,businessId:'999'}),null);
  const failedRoot=join(dir,'Codex','ClientAccess','PutteryNYC');
  mkdirSync(failedRoot,{recursive:true});
  writeFileSync(join(failedRoot,'tock-export-latest.json'),JSON.stringify({status:'failed'}));
  const publisher=new URL('./publish-status.mjs',import.meta.url).href;
  const failed=spawnSync(process.execPath,['--input-type=module','-e',
    `globalThis.fetch=()=>{console.log('network_called');throw new Error()};await import(${JSON.stringify(publisher)})`],
    {env:{...process.env,LOCALAPPDATA:dir},encoding:'utf8'});
  assert.equal(failed.status,1);assert.ok(failed.stdout.includes('export_refresh_not_verified'));
  assert.equal(failed.stdout.includes('network_called'),false);
  rmSync(join(failedRoot,'tock-export-latest.json'));
  rmdirSync(failedRoot);rmdirSync(join(dir,'Codex','ClientAccess'));rmdirSync(join(dir,'Codex'));
  console.log(JSON.stringify({passed:true,coverage:['uint64','venue-scope','version-tie','normalized-comparison',
    'invalid-source-exclusion','distinct-day-count','atomic-failure','repeat-removal','combined-grain','public-field-allowlist','failed-refresh-preserves-published-facts']}));
} finally {
  for (const name of readdirSync(dir)) rmSync(join(dir,name));
  rmdirSync(dir);
}
