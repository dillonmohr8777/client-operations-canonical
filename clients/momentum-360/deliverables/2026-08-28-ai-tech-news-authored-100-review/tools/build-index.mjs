import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const siteRoot = path.join(projectRoot, 'site');
const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, 'review-manifest.json'), 'utf8'));
const qa = JSON.parse(await fs.readFile(path.join(projectRoot, 'qa-structural.json'), 'utf8'));

if (manifest.total !== 100 || qa.pass !== 100) {
  throw new Error(`Index build requires 100 manifest routes and 100 structural passes. Found ${manifest.total} and ${qa.pass}.`);
}

const groupLabels = {
  batch2: 'Philadelphia Batch 2',
  batch3: 'Philadelphia Batch 3',
  batch4: 'Philadelphia Batch 4',
  unslop25: 'Selected Unslop 25'
};

const groups = ['batch2', 'batch3', 'batch4', 'unslop25'].map((cohort) => ({
  cohort,
  label: groupLabels[cohort],
  rows: manifest.sites.filter((site) => site.cohort === cohort).sort((a, b) => a.business.localeCompare(b.business))
}));

const listMarkup = groups.map((group) => `
  <section class="collection" data-group="${group.cohort}">
    <header class="collection-heading">
      <h2>${group.label}</h2>
      <span>${group.rows.length} concepts</span>
    </header>
    <ol>
      ${group.rows.map((site, index) => `
        <li data-search="${site.business.toLowerCase()} ${site.city?.toLowerCase() || ''}">
          <a href="${site.route}">
            <span class="number">${String(index + 1).padStart(2, '0')}</span>
            <span class="identity"><strong>${site.business}</strong>${site.city ? `<small>${site.city}</small>` : ''}</span>
            <span class="status">QA pass</span>
            <span class="open" aria-hidden="true">Open</span>
          </a>
        </li>`).join('')}
    </ol>
  </section>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="#11120f">
  <title>Authored 100 | Private Concept Review</title>
  <meta name="description" content="A private review list of one hundred authored prospect homepage concepts from Philadelphia Batches 2 through 4 and the selected unslop cohort.">
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <a class="skip" href="#concepts">Skip to concepts</a>
  <header class="masthead">
    <p>Momentum 360 private review</p>
    <div>
      <h1>100 authored concepts</h1>
      <span>75 batch concepts plus the selected 25 unslop builds</span>
    </div>
  </header>

  <main id="concepts">
    <div class="toolbar" role="search">
      <label for="search">Find a business</label>
      <input id="search" type="search" autocomplete="off" placeholder="Start typing a name or city">
      <p><strong id="visible-count">100</strong> concepts visible</p>
    </div>
    ${listMarkup}
  </main>

  <footer>
    <strong>Private concept review</strong>
    <span>No mail. No QR. Noindex.</span>
  </footer>

  <script>
    const input = document.querySelector('#search');
    const rows = [...document.querySelectorAll('.collection li')];
    const groups = [...document.querySelectorAll('.collection')];
    const count = document.querySelector('#visible-count');

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      rows.forEach((row) => {
        const match = !query || row.dataset.search.includes(query);
        row.hidden = !match;
        if (match) visible += 1;
      });
      groups.forEach((group) => {
        group.hidden = !group.querySelector('li:not([hidden])');
      });
      count.textContent = String(visible);
    });
  </script>
</body>
</html>`;

const css = `:root{--paper:#f3f0e8;--ink:#11120f;--muted:#66685f;--line:#c8c5ba;--signal:#b9ff66;--ease:cubic-bezier(.16,1,.3,1)}
*{box-sizing:border-box}
html{background:var(--ink);scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-rendering:optimizeLegibility}
a{color:inherit;text-decoration:none}
.skip{position:fixed;left:16px;top:-80px;z-index:20;background:var(--signal);padding:12px 16px;font-weight:800}.skip:focus{top:16px}
.masthead{min-height:72svh;background:var(--ink);color:var(--paper);padding:clamp(28px,5vw,72px);display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}
.masthead>p{margin:0;color:var(--signal);font-size:.78rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.masthead>div{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,32rem);gap:clamp(24px,6vw,96px);align-items:end}
.masthead h1{max-width:9ch;margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(4rem,11vw,10rem);font-weight:400;letter-spacing:-.04em;line-height:.8;animation:arrive 900ms var(--ease) both}
.masthead span{max-width:32ch;color:#c7c8c0;font-size:clamp(1.1rem,2vw,1.6rem);animation:arrive 800ms 100ms var(--ease) both}
@keyframes arrive{from{opacity:.01;transform:translateY(24px)}to{opacity:1;transform:none}}
main{width:min(1180px,calc(100% - 40px));margin-inline:auto;padding:clamp(64px,9vw,128px) 0}
.toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px 24px;align-items:end;margin-bottom:clamp(64px,9vw,112px)}
.toolbar label{grid-column:1/-1;font-family:Georgia,"Times New Roman",serif;font-size:clamp(2rem,4vw,4rem);line-height:1}
.toolbar input{width:100%;border:0;border-bottom:2px solid var(--ink);background:transparent;padding:16px 0;font:inherit;font-size:1.1rem;border-radius:0;outline:none}.toolbar input:focus{border-color:#477c00}.toolbar p{margin:0 0 16px;color:var(--muted);white-space:nowrap}
.collection{margin-top:clamp(72px,10vw,132px)}
.collection-heading{display:flex;align-items:end;justify-content:space-between;gap:24px;border-bottom:2px solid var(--ink);padding-bottom:18px}
.collection-heading h2{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(2rem,4.5vw,4.5rem);font-weight:400;letter-spacing:-.035em;line-height:.95}.collection-heading span{color:var(--muted);white-space:nowrap}
ol{margin:0;padding:0;list-style:none}
li{border-bottom:1px solid var(--line)}
li a{display:grid;grid-template-columns:52px minmax(0,1fr) 88px 54px;gap:18px;align-items:center;min-height:94px;padding:18px 4px;transition:padding .35s var(--ease),background .35s var(--ease)}
li a:hover,li a:focus-visible{background:#e7e3d7;padding-inline:18px;outline:0}
.number{color:var(--muted);font-variant-numeric:tabular-nums}.identity{display:flex;flex-direction:column;gap:2px;min-width:0}.identity strong{font-size:clamp(1.05rem,2vw,1.35rem);overflow-wrap:anywhere}.identity small{color:var(--muted)}
.status{justify-self:end;background:#d9f6b5;padding:5px 9px;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.open{justify-self:end;font-weight:750}
footer{background:var(--ink);color:var(--paper);padding:clamp(36px,6vw,72px);display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}footer span{color:#aaaca4}
[hidden]{display:none!important}
@media(max-width:720px){.masthead{min-height:65svh}.masthead>div{grid-template-columns:1fr}.masthead h1{font-size:clamp(3.7rem,21vw,7rem)}main{width:min(100% - 28px,1180px)}.toolbar{grid-template-columns:1fr}.toolbar p{margin:0}.collection-heading{align-items:start;flex-direction:column}.collection-heading h2{font-size:clamp(2.3rem,12vw,4.4rem)}li a{grid-template-columns:34px minmax(0,1fr) 48px;gap:12px}.status{display:none}.open{font-size:.85rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.masthead h1,.masthead span{animation:none}*{transition-duration:.01ms!important}}
`;

await fs.writeFile(path.join(siteRoot, 'index.html'), html);
await fs.writeFile(path.join(siteRoot, 'index.css'), css);
await fs.writeFile(path.join(siteRoot, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
await fs.writeFile(path.join(siteRoot, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n');
console.log(JSON.stringify({ index: path.join(siteRoot, 'index.html'), groups: Object.fromEntries(groups.map((group) => [group.cohort, group.rows.length])), total: manifest.total }, null, 2));
