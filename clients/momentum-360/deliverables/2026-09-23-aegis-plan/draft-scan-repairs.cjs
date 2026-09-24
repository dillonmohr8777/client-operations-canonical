// Reproducible local draft only: never writes to WordPress.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const report = JSON.parse(fs.readFileSync(path.join(__dirname,'bulk-scan-output/bulk-scan-report.json'),'utf8'));
const repairs = report.pages.filter(p=>p.captureStatus==='inspected').flatMap(p=>p.checks.filter(c=>c.id==='canonical' && c.status==='advisory' && /path .* differs from page path/.test(c.message)).map(c=>({
  page:p.url, title:p.title, capturedAt:p.capturedAt, kind:'canonical-review', priority:'high',
  observed:c.evidence[0], proposed:p.url, state:'draft',
  reason:'A distinct service/topic page points at a different service URL; check whether this consolidation was intentional.',
  applyGate:'Verify CMS canonical source and intended indexable URL, then stage a self-canonical only for independently indexable content. Publishing requires approval.',
  acceptance:'Rendered draft contains exactly one intended canonical; verify redirect target, sitemap and internal links; compare Search Console selected canonical after approved release.',
})));
assert(repairs.every(r=>new URL(r.page).hostname==='www.needmomentum.com' && new URL(r.proposed).hostname==='www.needmomentum.com'));
const output=path.join(__dirname,'bulk-scan-output/canonical-repairs.json');
fs.writeFileSync(output,JSON.stringify({scope:'local review only',repairs},null,2)+'\n');
console.log(JSON.stringify({draftCanonicalRepairs:repairs.length,externalWrites:0,output}));
