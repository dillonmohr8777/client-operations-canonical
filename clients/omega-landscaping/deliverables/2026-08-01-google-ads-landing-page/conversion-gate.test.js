// Does the Ads conversion fire only on a genuinely accepted submission?
// Run: node conversion-gate.test.js
//
// Why this exists: until 2026-09-14 the conversion fired inside the form's
// submit handler, i.e. on click -- before Netlify ran netlify-honeypot and
// before the POST was accepted. Every bot the honeypot caught was reported to
// Google Ads as a conversion, and Smart Bidding optimised against it.

const assert = require('assert');
const fs = require('fs');

function runThankYouGate({ marker, referrer, storageWorks = true }) {
  const html = fs.readFileSync('thank-you/index.html', 'utf8');
  const block = html.match(/\(function \(\) \{[\s\S]*?\}\)\(\);/)[0];

  let fired = false;
  const store = { omega_submit_pending: marker };
  const sandbox = {
    gtag: () => { fired = true; },
    document: { referrer },
    window: { location: { origin: 'https://omega-landscaping-landing-page.netlify.app' } },
    sessionStorage: {
      getItem: (k) => { if (!storageWorks) throw new Error('denied'); return store[k] ?? null; },
      removeItem: (k) => { delete store[k]; },
    },
  };
  new Function('gtag', 'document', 'window', 'sessionStorage', block)(
    sandbox.gtag, sandbox.document, sandbox.window, sandbox.sessionStorage
  );
  return { fired, markerLeft: store.omega_submit_pending };
}

const ORIGIN = 'https://omega-landscaping-landing-page.netlify.app/';

// A real lead: submitted, Netlify accepted, redirected here.
assert.strictEqual(runThankYouGate({ marker: '1', referrer: ORIGIN }).fired, true,
  'a genuine accepted submission MUST fire the conversion');

// Direct visit / bookmark / shared link: never submitted anything.
assert.strictEqual(runThankYouGate({ marker: null, referrer: '' }).fired, false,
  'a direct visit MUST NOT fire a conversion');

// Refresh after a real lead: marker was consumed, must not double count.
assert.strictEqual(runThankYouGate({ marker: null, referrer: ORIGIN }).fired, false,
  'a refresh MUST NOT fire a second conversion');

// The marker is consumed, not left behind for the next page view.
assert.strictEqual(runThankYouGate({ marker: '1', referrer: ORIGIN }).markerLeft, undefined,
  'the pending marker MUST be cleared once consumed');

// Private mode: sessionStorage throws, fall back to same-origin referrer.
assert.strictEqual(runThankYouGate({ marker: null, referrer: ORIGIN, storageWorks: false }).fired, true,
  'private mode with a same-origin referrer SHOULD still count the lead');
assert.strictEqual(runThankYouGate({ marker: null, referrer: '', storageWorks: false }).fired, false,
  'private mode with no referrer MUST NOT count');

// The premature fire must be gone from the submit handler for good.
const js = fs.readFileSync('script.js', 'utf8');
const submitHandler = js.slice(js.indexOf("form?.addEventListener('submit'"));
assert.ok(!/gtag\(\s*'event'\s*,\s*'conversion'/.test(submitHandler),
  'the submit handler MUST NOT fire an Ads conversion -- it runs before Netlify accepts');

console.log('conversion gate: 7/7 passed');
