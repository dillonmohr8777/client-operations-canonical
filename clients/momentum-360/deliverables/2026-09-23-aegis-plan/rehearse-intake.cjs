// Synthetic local Postgres only. Run seed, restart the disposable DB, then verify.
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(require('node:os').homedir(), 'repos/dillon-os/_os/radar-engine');
const { migrate, createStore } = require(path.join(root, 'lib/store.ts'));
const { createCampaign, submitIntake } = require(path.join(root, 'lib/pipeline.ts'));
const { loadConfig } = require(path.join(root, 'lib/config.ts'));
const { createAdapters } = require(path.join(root, 'lib/adapters.ts'));
async function run() {
  const url = new URL(process.env.DATABASE_URL);
  assert.equal(url.hostname, '127.0.0.1');
  assert.equal(url.port, '25432');
  assert.equal(url.pathname, '/aegis_rehearsal');
  const mode = process.argv[2];
  assert.ok(['seed', 'verify'].includes(mode));
  if (mode === 'seed') assert.equal((await migrate(url.href)).applied, true);
  const store = await createStore({ databaseUrl: url.href, requirePersistent: true });
  try {
    assert.equal(store.kind, 'postgres');
    if (mode === 'seed') {
      const cfg = loadConfig({ captcha: 'off', killSwitch: true, enableEmail: false, enableCrm: false });
      const campaign = await createCampaign(store, { name: 'Aegis synthetic persistence rehearsal', owner: 'local-test' });
      const result = await submitIntake(store, createAdapters(cfg), cfg, campaign, {
        name: 'Synthetic Rehearsal', phone: '2155550100', email: 'rehearsal@example.com',
        website: 'https://aegis-rehearsal.example/', business_description: 'Synthetic test only',
        goals: 'Verify persistence after restart', consent_analyze: true,
      });
      assert.equal(result.ok, true);
    }
    const rows = store.find('intake_submissions', row => row.website === 'https://aegis-rehearsal.example');
    assert.equal(rows.length, 1);
    const submission = rows[0];
    assert.equal(submission.growth_goals, 'Verify persistence after restart');
    assert.equal(submission.consent_marketing, false);
    const jobs = await store.query('SELECT id FROM jobs WHERE idempotency_key = $1', [`intake-audit:${submission.id}`]);
    const events = await store.query('SELECT id FROM events WHERE correlation_id = $1 AND type = $2', [submission.id, 'intake.submitted']);
    const raw = await store.query('SELECT requester_email, growth_goals FROM intake_submissions WHERE id = $1', [submission.id]);
    assert.equal(jobs.rows.length, 1);
    assert.equal(events.rows.length, 1);
    assert.match(raw.rows[0].requester_email, /^enc:v1:/);
    assert.match(raw.rows[0].growth_goals, /^enc:v1:/);
    console.log(JSON.stringify({ mode, pass: true, store: store.kind, submissions: 1, auditJobs: 1, submittedEvents: 1, sensitiveFieldsEncrypted: true, externalSends: 0, observedAt: new Date().toISOString() }));
  } finally { await store.close(); }
}
run().catch(error => { console.error(JSON.stringify({pass:false,errorType:error.name,code:error.code,locations:String(error.stack).split('\n').filter(line=>/^\s+at /.test(line)).slice(0,4)})); process.exitCode = 1; });
