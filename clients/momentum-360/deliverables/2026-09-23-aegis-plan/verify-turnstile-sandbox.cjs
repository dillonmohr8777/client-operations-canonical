// Cloudflare's published dummy keys, never production credentials.
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { captchaAdapter } = require(path.join(require('node:os').homedir(), 'repos/dillon-os/_os/radar-engine/lib/adapters.ts'));
async function run() {
  process.env.RADAR_V2_CAPTCHA_LIVE = 'true';
  const cfg = { captcha: 'turnstile', captchaSecret: '1x0000000000000000000000000000000AA', captchaExpectedHostname: 'example.com', captchaExpectedAction: '' };
  const token = 'XXXX.DUMMY.TOKEN.XXXX';
  const checks = {};
  checks.validDummy = await captchaAdapter(cfg).verify(token);
  checks.rejectedDummy = await captchaAdapter({ ...cfg, captchaSecret: '2x0000000000000000000000000000000AA' }).verify(token);
  checks.wrongHostname = await captchaAdapter({ ...cfg, captchaExpectedHostname: 'unapproved.example' }).verify(token);
  assert.deepEqual(checks.validDummy, { ok: true, state: 'verified' });
  assert.deepEqual(checks.rejectedDummy, { ok: false, state: 'provider-rejected' });
  assert.deepEqual(checks.wrongHostname, { ok: false, state: 'hostname-mismatch' });
  const receipt = { observedAt: new Date().toISOString(), pass: true, scope: 'real Cloudflare endpoint with official test keys and dummy token', checks, productionWidgetVerified: false, customerDataSent: false };
  fs.writeFileSync(path.join(__dirname, 'turnstile-sandbox-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify(receipt));
}
run().catch(error => { console.error(error.name + ': ' + error.message); process.exitCode = 1; });
