'use strict';
// Synthetic-only staging of the existing audit engine, no external delivery.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.join(require('node:os').homedir(), 'repos/dillon-os');
const app = path.join(root, '_os/radar-engine');
const privateDir = path.join(root, '12_Brain/private/radar-engine/aegis-staging');
const envFile = path.join(privateDir, 'stage-env.json');
const compose = ['compose', '-p', 'aegis-radar-staging', '-f', path.join(app, 'docker-compose.yml')];
function environment() {
  if (!fs.existsSync(envFile)) {
    cp.execFileSync('git', ['check-ignore', '12_Brain/private/radar-engine/aegis-staging/stage-env.json'], { cwd: root, stdio: 'pipe' });
    fs.mkdirSync(privateDir, { recursive: true });
    const password = crypto.randomBytes(24).toString('hex');
    fs.writeFileSync(envFile, JSON.stringify({
      RADAR_V2_PG_USER: 'aegis_stage', RADAR_V2_PG_PASSWORD: password,
      RADAR_V2_PG_DATABASE: 'aegis_stage', RADAR_V2_PG_VOLUME: 'aegis_radar_staging_pg', RADAR_V2_DB_PORT: '5433',
      DATABASE_URL: `postgres://aegis_stage:${password}@127.0.0.1:5433/aegis_stage`,
      RADAR_V2_FIELD_KEY: crypto.randomBytes(32).toString('hex'), RADAR_V2_QA_TOKEN: crypto.randomBytes(32).toString('hex'),
      RADAR_V2_HOST: '127.0.0.1', RADAR_V2_PORT: '4343', RADAR_V2_STAGING: 'true',
      RADAR_V2_PUBLIC_ORIGIN: 'https://desktop-4ahkec4.tailade026.ts.net:8446',
      RADAR_V2_STORAGE_DIR: path.join(privateDir, 'artifacts'), RADAR_V2_KILL_SWITCH: 'true',
      RADAR_V2_ENABLE_REPORT_DELIVERY: 'false', RADAR_V2_ENABLE_EMAIL: 'false', RADAR_V2_ENABLE_CRM: 'false',
      RADAR_V2_ENABLE_OUTREACH: 'false', RADAR_V2_ENABLE_SLACK: 'false', RADAR_V2_CAPTCHA: 'off',
    }, null, 2), { flag: 'wx', mode: 0o600 });
  }
  return { ...process.env, ...JSON.parse(fs.readFileSync(envFile, 'utf8')) };
}
const env = environment();
Object.assign(process.env, env);
const { migrate, createStore } = require(path.join(app, 'lib/store.ts'));
const { loadConfig } = require(path.join(app, 'lib/config.ts'));
const { createAdapters } = require(path.join(app, 'lib/adapters.ts'));
const { createServer } = require(path.join(app, 'lib/web.ts'));
const { createCampaign, processIntakeAuditJob } = require(path.join(app, 'lib/pipeline.ts'));
const { processJobs } = require(path.join(app, 'lib/jobs.ts'));
const fixtureHtml = fs.readFileSync(path.join(app, 'fixtures/cedar-ridge-hvac/index.html'), 'utf8');
const fetchPageFn = async url => {
  assert.ok(new URL(url).hostname.endsWith('.example'), 'Staging scans accept synthetic .example domains only');
  return { ok: true, status: 200, finalUrl: url, html: fixtureHtml, body: fixtureHtml, headers: { 'content-type': 'text/html' }, bytes: Buffer.byteLength(fixtureHtml), responseMs: 1, hops: [{ url, status: 200 }] };
};
function docker(args) { return cp.execFileSync('docker', [...compose, ...args], { env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }); }
async function main() {
  if (process.argv[2] === 'setup') {
    docker(['up', '-d']);
    for (let i = 0; i < 40; i++) {
      try { docker(['exec', '-T', 'postgres', 'pg_isready', '-U', env.RADAR_V2_PG_USER]); break; }
      catch { if (i === 39) throw new Error('Staging PostgreSQL did not become ready'); await new Promise(resolve => setTimeout(resolve, 500)); }
    }
    await migrate(env.DATABASE_URL);
    console.log(JSON.stringify({ databaseReady: true, privateBind: '127.0.0.1:5433', volume: env.RADAR_V2_PG_VOLUME }));
    return;
  }
  if (process.argv[2] === 'serve') {
    const cfg = loadConfig();
    const store = await createStore({ databaseUrl: cfg.databaseUrl, requirePersistent: true });
    const campaign = store.findOne('campaigns', row => row.name === 'Aegis synthetic staging') || await createCampaign(store, { name: 'Aegis synthetic staging', owner: 'local-staging' });
    await store.flush();
    const server = createServer({ store, adapters: createAdapters(cfg), campaign, cfg });
    server.listen(cfg.port, cfg.host, () => console.log(JSON.stringify({ ready: true, url: cfg.publicOrigin, syntheticOnly: true, scanner: 'local fixture only' })));
    let stopped = false;
    const tick = async () => {
      try { await processJobs(store, { 'intake.audit': payload => processIntakeAuditJob(store, cfg, payload, { fetchPageFn }) }, { workerId: 'aegis-synthetic-staging', max: 1 }); }
      catch (error) { console.error(JSON.stringify({ workerError: error.name })); }
      if (!stopped) setTimeout(tick, 1000).unref();
    };
    server.once('close', () => { stopped = true; });
    void tick();
    return;
  }
  if (process.argv[2] === 'check') {
    const cfg = loadConfig();
    const base = cfg.publicOrigin;
    assert.equal((await fetch(base + '/health')).status, 200);
    const invalid = await fetch(base + '/intake', { method: 'POST', body: new URLSearchParams({}), redirect: 'manual' });
    assert.equal(invalid.status, 400);
    const website = `https://synthetic-${Date.now()}.example`;
    const accepted = await fetch(base + '/intake', { method: 'POST', body: new URLSearchParams({ name: 'Synthetic staging test', phone: '2155550100', email: 'synthetic@example.com', website, business_description: 'Synthetic fixture only; no real business.', goals: 'Test staging workflow', consent_analyze: 'on' }), redirect: 'manual' });
    assert.equal(accepted.status, 303);
    const statusPath = accepted.headers.get('location');
    let store, sub, report, job;
    try {
      store = await createStore({ databaseUrl: cfg.databaseUrl, requirePersistent: true });
      for (let attempt = 0; attempt < 90; attempt++) {
        await store.hydrate();
        sub = store.findOne('intake_submissions', row => row.website === website);
        job = sub && store.findOne('jobs', row => row.payload?.submission_id === sub.id);
        report = sub && store.findOne('reports', row => row.prospect_id === sub.prospect_id);
        if (job?.status === 'succeeded' && report) break;
        assert.notEqual(job?.status, 'dead_letter', 'synthetic audit worker failed');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      assert.equal(job?.status, 'succeeded');
      const gated = await fetch(base + '/r/' + report.access_token);
      assert.notEqual(gated.status, 200, 'report must be gated before QA');
      const approval = await fetch(`${base}/qa/${sub.prospect_id}/approve?token=${cfg.qaToken}`, { method: 'POST', body: new URLSearchParams({ reason: 'Synthetic staging acceptance only' }), redirect: 'manual' });
      assert.equal(approval.status, 303);
      const rendered = await fetch(base + '/r/' + report.access_token);
      assert.equal(rendered.status, 200);
      assert.match(await rendered.text(), /Momentum Digital/);
      assert.equal((await fetch(base + statusPath)).status, 200);
      const adapters = createAdapters(cfg);
      const email = await adapters.email.send({ to: 'synthetic@example.com', subject: 'Synthetic audit', body: 'Staging test only' });
      const crm = await adapters.crm.handoff({ domain: new URL(website).hostname, report_id: report.id, synthetic: true });
      assert.equal(email.sent, false);
      assert.equal(email.dryRun, true);
      assert.notEqual(crm.liveWrite, true);
      const receipt = { observedAt: new Date().toISOString(), pass: true, base, syntheticOnly: true, scanner: 'local fixture', invalidPost: invalid.status, acceptedPost: accepted.status, job: job.status, qa: approval.status, report: rendered.status, email, crm: { liveWrite: crm.liveWrite, written: crm.written, reason: crm.reason }, submissionId: sub.id, reportId: report.id, providerDeliveryVerified: false };
      fs.writeFileSync(path.join(__dirname, 'staging-flow-receipt.json'), JSON.stringify(receipt, null, 2));
      console.log(JSON.stringify(receipt));
    } finally { if (store) await store.close(); }
    return;
  }
  throw new Error('Usage: stage-intake.cjs setup | serve | check');
}
main().catch(error => { console.error(JSON.stringify({ pass: false, errorType: error.name, code: error.code || null })); process.exitCode = 1; });
