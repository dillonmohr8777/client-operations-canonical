#!/usr/bin/env node
'use strict';
// Fixed public GET scope. No cookies, login, form submissions or CMS writes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const shared = path.join(require('node:os').homedir(), 'repos/dillon-os/_os/automation/lib');
const { httpGet } = require(path.join(shared, 'net.js'));
const { analyzeHtml } = require(path.join(shared, 'sentinel.js'));
const origin = 'https://www.needmomentum.com';
const pages = ['/', '/free-website-seo-audit/', '/contact/', '/marketing-prices/'];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const clean = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] || '';
}
function inspect(route, response) {
  const body = String(response.body || '');
  const result = { route, http: response.status || 0, status: 'unverified', checks: [], observed: {} };
  if (/sgcaptcha|captcha-delivery|verify (?:that )?you are human|checking your browser|challenge-platform/i.test(body) || [202, 401, 403, 429].includes(response.status)) {
    result.status = 'blocked';
    result.reason = 'Automated observation blocked; browser verification needed. Not proof of outage.';
    return result;
  }
  if (!response.ok || response.status !== 200 || response.truncated) {
    result.reason = response.truncated ? 'Response exceeds capture limit; analysis incomplete.' : 'HTTP/network observation requires independent verification.';
    return result;
  }
  if (!/<html\b/i.test(body) || !/<title\b/i.test(body)) {
    result.reason = 'Expected HTML document not observed.';
    return result;
  }
  const metas = body.match(/<meta\b[^>]*>/gi) || [];
  const links = body.match(/<link\b[^>]*>/gi) || [];
  const robots = metas.filter(t => /^(robots|googlebot)$/i.test(attr(t, 'name'))).map(t => attr(t, 'content')).join(',');
  const canonical = links.filter(t => attr(t, 'rel').toLowerCase().split(/\s+/).includes('canonical')).map(t => attr(t, 'href'));
  result.observed = {
    title: clean(body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]),
    h1: (body.match(/<h1\b/gi) || []).length,
    canonical,
    gtm: [...new Set(body.match(/GTM-[A-Z0-9]+/g) || [])].sort(),
  };
  result.checks = analyzeHtml(body, {}).checks.map(c => ({ id: c.id, ok: c.ok }));
  result.checks.push({ id: 'indexable_directives', ok: !/\b(noindex|none)\b/i.test(`${robots},${response.headers?.['x-robots-tag'] || ''}`) });
  result.checks.push({ id: 'one_h1', ok: result.observed.h1 === 1 });
  result.checks.push({ id: 'self_canonical', ok: canonical.length === 1 && canonical[0] === origin + route });
  result.checks.push({ id: 'gtm_expected', ok: result.observed.gtm.includes('GTM-57PVS88') });
  result.checks.push({ id: 'no_extra_gtm', ok: result.observed.gtm.every(id => id === 'GTM-57PVS88') });
  if (route === '/free-website-seo-audit/') {
    const article = body.match(/<article\b[^>]*>[\s\S]*?<\/article>/i)?.[0];
    result.checks.push({ id: 'audit_main_form_markup', ok: article ? /<form\b|<iframe\b|data-momentum-audit/i.test(article) : null });
  }
  result.status = result.checks.some(c => c.ok === false) ? 'review' : 'observed';
  result.bodyHash = hash(body);
  result.bytes = response.bytes ?? Buffer.byteLength(body);
  result.responseMs = response.responseMs ?? null;
  return result;
}
function signature(results) {
  return hash(JSON.stringify(results.map(({ bodyHash, bytes, responseMs, ...stable }) => stable)));
}
function selfTest() {
  const html = '<html><head><title>Momentum</title><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://www.needmomentum.com/"></head><body><h1>Momentum</h1><script src="https://www.googletagmanager.com/gtm.js?id=GTM-57PVS88"></script></body></html>';
  const response = { ok: true, status: 200, body: html, headers: {} };
  assert.equal(inspect('/', response).status, 'observed');
  assert.equal(inspect('/', { ...response, body: '<html><title>Verify you are human</title></html>' }).status, 'blocked');
  assert.equal(inspect('/', { ...response, status: 202 }).status, 'blocked');
  assert.equal(inspect('/', { ...response, status: 500 }).status, 'unverified');
  assert.equal(inspect('/', { ...response, truncated: true }).status, 'unverified');
  assert.equal(inspect('/', { ...response, headers: { 'x-robots-tag': 'noindex' } }).status, 'review');
  assert.equal(inspect('/', { ...response, body: html.replace('</head>', '<meta content="noindex" name="robots"></head>') }).status, 'review');
  const audit = inspect('/free-website-seo-audit/', { ...response, body: html.replace('</body>', '<article>Audit copy only</article><footer><form></form></footer></body>') });
  assert.equal(audit.checks.find(c => c.id === 'audit_main_form_markup').ok, false);
  const baseline = inspect('/', response);
  assert.equal(signature([baseline]), signature([{ ...baseline, bodyHash: 'changed-dynamic-content', responseMs: 999 }]));
  assert.notEqual(signature([baseline]), signature([{ ...baseline, status: 'blocked' }]));
  console.log('PASS: observation classification, indexing, audit/footer separation and delta stability. No network.');
}
async function run() {
  const runtime = path.join(__dirname, 'watchdog-output');
  fs.mkdirSync(runtime, { recursive: true });
  const lock = path.join(runtime, 'running.lock');
  const lockFd = fs.openSync(lock, 'wx'); // stale lock is an explicit operator repair, never a duplicate run.
  try {
    const results = [];
    for (const route of pages) {
      const response = await httpGet(origin + route, { method: 'GET', maxRedirects: 0, timeoutMs: 12000, maxBytes: 3_000_000, userAgent: 'Momentum-Aegis-ReadOnly/1.0' });
      results.push(inspect(route, response));
      // Stop on a site-wide challenge instead of paying for repeated blocked requests.
      if (route === '/' && results[0].status === 'blocked') break;
    }
    const latest = path.join(runtime, 'latest.json');
    const previous = fs.existsSync(latest) ? JSON.parse(fs.readFileSync(latest, 'utf8')) : null;
    const current = { observedAt: new Date().toISOString(), scope: 'needmomentum-public-get-only', scriptHash: hash(fs.readFileSync(__filename)), signature: signature(results), results };
    current.changed = current.signature !== previous?.signature;
    current.previousObservedAt = previous?.observedAt || null;
    const temp = path.join(runtime, 'latest.tmp');
    fs.writeFileSync(temp, JSON.stringify(current, null, 2) + '\n');
    fs.renameSync(temp, latest);
    if (current.changed) fs.appendFileSync(path.join(runtime, 'changes.jsonl'), JSON.stringify(current) + '\n');
    console.log(JSON.stringify({ observedAt: current.observedAt, changed: current.changed, states: results.map(r => ({ route: r.route, status: r.status })), receipt: latest }));
  } finally {
    fs.closeSync(lockFd);
    fs.unlinkSync(lock);
  }
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--self-test') selfTest();
  else if (args.length === 1 && args[0] === '--live') run().catch(error => { console.error(error.code === 'EEXIST' ? 'Run lock exists; inspect prior process before recovery.' : error.message); process.exitCode = 1; });
  else { console.log('Usage: node watch-public.cjs --self-test | --live'); process.exitCode = 2; }
}
module.exports = { inspect, signature };

