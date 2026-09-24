// Compares the DCLogic go() implementation against native anchor navigation on the same
// page: go() is correct if it puts the heading where a real #href would from a cold load.
import { chromium } from 'playwright'; import path from 'path'; import { pathToFileURL } from 'node:url';
const n = process.argv[2];
const url = pathToFileURL(path.join('out', `ebook${n}-standalone.html`)).href;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 900 } });
const GO = `window.go = function (id) {
  const el = document.getElementById(id); if (!el) return;
  const ss = [].slice.call(document.querySelectorAll('section.ch'));
  ss.forEach(function (x) { x.style.contentVisibility = 'visible'; });
  el.scrollIntoView({ block: 'start' });
  requestAnimationFrame(function () {
    ss.forEach(function (x) { x.style.contentVisibility = ''; });
    el.scrollIntoView({ block: 'start' });
  });
};`;
await pg.goto(url, { waitUntil: 'networkidle' }); await pg.evaluate(() => document.fonts.ready);
const ids = await pg.evaluate(() => [...document.querySelectorAll('nav.toc .tab')].map(a => (a.getAttribute('href') || '').slice(1)).filter(Boolean));
const rows = [];
for (const id of ids) {
  // baseline: a genuinely cold load that navigates by real anchor, exactly as standalone does
  const p1 = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p1.goto(url + '#' + id, { waitUntil: 'networkidle' });
  await p1.evaluate(() => document.fonts.ready); await p1.waitForTimeout(500);
  const anchorY = await p1.evaluate(i => Math.round(document.getElementById(i).getBoundingClientRect().top), id);
  await p1.close();
  // go(): cold load, then jump
  const p2 = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p2.goto(url, { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready);
  await p2.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await p2.addScriptTag({ content: GO });
  await p2.evaluate(i => window.go(i), id); await p2.waitForTimeout(500);
  const goY = await p2.evaluate(i => Math.round(document.getElementById(i).getBoundingClientRect().top), id);
  const inView = await p2.evaluate(i => { const r = document.getElementById(i).getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }, id);
  await p2.close();
  rows.push({ id, anchorY, goY, drift: goY - anchorY, inView });
}
const bad = rows.filter(r => Math.abs(r.drift) > 4 || !r.inView);
console.log(`book ${n}: ${rows.length - bad.length}/${rows.length} match native anchor within 4px` + (bad.length ? '  OFF ' + JSON.stringify(bad) : ''));
await b.close();
