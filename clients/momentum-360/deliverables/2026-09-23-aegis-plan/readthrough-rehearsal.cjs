'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.join(os.homedir(), 'repos/dillon-os/_os/radar-engine');
const { migrate, createStore } = require(path.join(root, 'lib/store.ts'));
const { createCampaign, submitIntake, processIntakeAuditJob } = require(path.join(root, 'lib/pipeline.ts'));
const { loadConfig } = require(path.join(root, 'lib/config.ts'));
const { createAdapters } = require(path.join(root, 'lib/adapters.ts'));

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, 'DATABASE_URL is required');
  const url = new URL(databaseUrl);
  assert.equal(url.hostname, '127.0.0.1');

  const previousKey = process.env.RADAR_V2_FIELD_KEY;
  process.env.RADAR_V2_FIELD_KEY = 'ab'.repeat(32);
  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aegis-readthrough-'));
  let writer;
  let reader;
  let outbound = 0;
  const originalFetch = global.fetch;
  try {
    const applied = await migrate(databaseUrl);
    assert.equal(applied.applied, true);
    const cfg = loadConfig({
      databaseUrl,
      captcha: 'off',
      killSwitch: true,
      enableEmail: false,
      enableCrm: false,
      enableOutreach: false,
      enableReportDelivery: false,
      storageDir,
    });
    writer = await createStore({ databaseUrl, requirePersistent: true });
    reader = await createStore({ databaseUrl, requirePersistent: true });
    assert.equal(writer.kind, 'postgres');
    assert.equal(reader.kind, 'postgres');

    const campaign = await createCampaign(writer, {
      id: 'campaign-readthrough-rehearsal',
      name: 'Synthetic readthrough rehearsal',
      owner: 'local-test',
    });
    await writer.flush();
    const intake = await submitIntake(writer, createAdapters(cfg), cfg, campaign, {
      name: 'Synthetic Readthrough',
      phone: '2155550199',
      email: 'readthrough@example.test',
      website: 'https://readthrough.synthetic.example/',
      business_description: 'Synthetic test only',
      goals: 'Verify independent PostgreSQL readthrough',
      consent_analyze: true,
    });
    assert.equal(intake.ok, true);
    await writer.flush();

    assert.equal(reader.get('campaigns', campaign.id), null);
    assert.equal(reader.get('intake_submissions', intake.submission.id), null);
    const loadedCampaign = await reader.readThrough('campaigns', campaign.id);
    const loadedSubmission = await reader.readThrough('intake_submissions', intake.submission.id);
    assert.equal(loadedCampaign.name, campaign.name);
    assert.equal(loadedSubmission.requester_email, 'readthrough@example.test');
    assert.equal(loadedSubmission.growth_goals, 'Verify independent PostgreSQL readthrough');

    const suppression = writer.insert('suppressions', {
      id: 'suppression-readthrough-rehearsal',
      kind: 'domain',
      value_normalized: 'readthrough.synthetic.example',
      reason: 'synthetic suppression to stop before public scan',
      channel: '*',
      source: 'local-test',
    });
    await writer.flush();
    const loadedSuppression = await reader.readThrough('suppressions', suppression.id);
    assert.equal(loadedSuppression.value_normalized, 'readthrough.synthetic.example');

    global.fetch = async () => {
      outbound += 1;
      throw new Error('unexpected external fetch in readthrough rehearsal');
    };
    const jobResult = await processIntakeAuditJob(reader, cfg, {
      submission_id: loadedSubmission.id,
      campaign_id: loadedCampaign.id,
    });
    assert.equal(jobResult.skipped, true);
    assert.equal(jobResult.reason, 'suppressed domain');
    await reader.flush();
    assert.equal(outbound, 0);

    const counts = await writer.query(`
      SELECT
        (SELECT count(*)::int FROM intake_submissions WHERE id = $1) AS submissions,
        (SELECT count(*)::int FROM jobs WHERE idempotency_key = $2) AS audit_jobs,
        (SELECT count(*)::int FROM events WHERE correlation_id = $1 AND type = 'intake.submitted') AS submitted_events,
        (SELECT count(*)::int FROM prospects WHERE id = $3) AS prospects
    `, [intake.submission.id, `intake-audit:${intake.submission.id}`, jobResult.prospect_id]);
    assert.deepEqual(counts.rows[0], { submissions: 1, audit_jobs: 1, submitted_events: 1, prospects: 1 });
    console.log(JSON.stringify({
      pass: true,
      store: 'postgres',
      independentStores: 2,
      initialCacheMisses: 2,
      readThroughHydrated: ['campaigns', 'intake_submissions', 'suppressions'],
      processIntakeAuditJob: { skipped: true, reason: jobResult.reason },
      submissions: counts.rows[0].submissions,
      auditJobs: counts.rows[0].audit_jobs,
      submittedEvents: counts.rows[0].submitted_events,
      prospects: counts.rows[0].prospects,
      externalFetches: outbound,
      syntheticOnly: true,
      observedAt: new Date().toISOString(),
    }));
  } finally {
    global.fetch = originalFetch;
    await reader?.close().catch(() => {});
    await writer?.close().catch(() => {});
    fs.rmSync(storageDir, { recursive: true, force: true });
    if (previousKey == null) delete process.env.RADAR_V2_FIELD_KEY;
    else process.env.RADAR_V2_FIELD_KEY = previousKey;
  }
}

run().catch((error) => {
  console.error(JSON.stringify({
    pass: false,
    errorType: error.name,
    message: error.message,
    stack: String(error.stack).split('\n').slice(0, 5),
  }));
  process.exitCode = 1;
});
