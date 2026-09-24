// READY-time verification for the v3 artboards.
//
// A .dc.html cannot render on its own — DCLogic only exists inside the canvas payload. So this
// builds a faithful preview per artboard: it unwraps <x-dc>/<helmet>, resolves the {{ bindings }}
// to their initial values, and re-attaches the component's imperative half as a plain script.
// That measures everything except the DCLogic runtime itself, which only Root's authenticated
// native test can confirm. Writes each measured height back into canvas.json.
//
//   node claude-handoff/verify.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'node:url';

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const BUILD = path.join(HERE, 'build');
const PREVIEW = path.join(BUILD, 'preview');
const CANVAS = path.join(BUILD, 'canvas.json');

// Initial-state values for the bindings, matching renderVals() on first paint.
const INITIAL = {
  rootCls: '', moOn: 'false', moLabel: 'Pause motion', navCls: 'reader-nav',
  menuExpanded: 'false', stepDetail: '', checkStatus: 'Nothing ticked yet.',
  d0on: 'true', d1on: 'false', d2on: 'false', d3on: 'false',
};

function preview(file) {
  const src = fs.readFileSync(file, 'utf8');
  const css = (src.match(/<helmet>\s*<style>([\s\S]*?)<\/style>\s*<\/helmet>/) || [])[1] || '';
  let body = (src.match(/<\/helmet>\s*([\s\S]*?)<\/x-dc>/) || [])[1] || '';
  const script = (src.match(/<script data-dc-script[^>]*>([\s\S]*?)<\/script>/) || [])[1] || '';
  body = body.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (m, k) =>
    Object.prototype.hasOwnProperty.call(INITIAL, k) ? INITIAL[k] : '');
  // onClick is the canvas dialect; strip it and drive the imperative half directly.
  body = body.replace(/\s*onClick="[^"]*"/g, '');
  const imperative = script
    .replace(/class Component extends DCLogic[\s\S]*$/, '')
    .concat(`
      document.querySelectorAll('[data-target]').forEach(function (b) {
        b.addEventListener('click', function () { go(b.dataset.target); });
      });
      const steps = document.querySelectorAll('[data-step]');
      const detail = document.getElementById('diagram-detail');
      if (detail && STEPS.length) detail.textContent = STEPS[0];
      steps.forEach(function (b, i) {
        b.addEventListener('click', function () {
          steps.forEach(function (x, j) { x.setAttribute('aria-pressed', String(i === j)); });
          if (detail) detail.textContent = STEPS[i];
        });
      });
      wire(function (t) { const e = document.getElementById('check-status'); if (e) e.textContent = t; });
    `);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body>${body}<script>${imperative}<\/script></body></html>`;
}

fs.rmSync(PREVIEW, { recursive: true, force: true });
fs.mkdirSync(PREVIEW, { recursive: true });
for (const f of fs.readdirSync(path.join(BUILD, 'assets')))
  fs.copyFileSync(path.join(BUILD, 'assets', f), path.join(PREVIEW, f));

const canvas = fs.existsSync(CANVAS) ? JSON.parse(fs.readFileSync(CANVAS, 'utf8')) : null;
const targets = fs.readdirSync(BUILD)
  .filter(f => /^(Book\d|BrandArt|Library)\.dc\.html$/.test(f)).sort();
const browser = await chromium.launch();
let failures = 0;

for (const name of targets) {
  const dc = fs.readFileSync(path.join(BUILD, name), 'utf8');
  const bare = (dc.match(/href="#/g) || []).length;
  const cv = dc.includes('content-visibility');
  const isBook = /^Book\d/.test(name);
  const isBrand = name === 'BrandArt.dc.html';
  const pf = path.join(PREVIEW, name.replace('.dc.html', '.html'));
  fs.writeFileSync(pf, preview(path.join(BUILD, name)));

  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pg.goto(pathToFileURL(pf).href, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  // Mid-document art is loading="lazy" and never enters the viewport on a 37 000px page, so
  // naturalWidth would read 0 for a perfectly good file. Force every image to fetch, then wait.
  await pg.evaluate(async () => {
    [...document.images].forEach(i => { i.loading = 'eager'; });
    await Promise.all([...document.images].map(i => i.complete
      ? null : new Promise(r => { i.addEventListener('load', r); i.addEventListener('error', r); })));
  });
  await pg.waitForTimeout(300);

  const r = await pg.evaluate(() => ({
    words: document.body.textContent.split(/\s+/).filter(Boolean).length,
    chapters: document.querySelectorAll('.chapter').length,
    navButtons: document.querySelectorAll('.chapter-links button').length,
    images: document.images.length,
    broken: [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')),
    height: document.documentElement.scrollHeight,
    oflDesktop: document.documentElement.scrollWidth > innerWidth,
    targets: [...document.querySelectorAll('[data-target]')].map(b => b.dataset.target),
    // sources, not just covers
    citationRefs: document.querySelectorAll('.citation-ref').length,
    citationDetails: document.querySelectorAll('.chapter-citations details').length,
    externalLinks: [...document.querySelectorAll('a[href^="http"]')].length,
    localHrefsLeft: [...document.querySelectorAll('a[href]')]
      .map(a => a.getAttribute('href'))
      .filter(h => !/^(https?:|mailto:|tel:)/i.test(h)).length,
    // exercises.js actually initialised?
    exerciseRoot: !!document.getElementById('exercise-root'),
    exerciseControls: ['exercise-save', 'exercise-reset', 'exercise-download', 'exercise-output',
      'specific-exercise'].filter(id => document.getElementById(id)).length,
    exerciseFields: document.querySelectorAll('#exercise-root input,#exercise-root select,#exercise-root textarea').length,
    bookData: !!document.getElementById('book-data'),
    exportNote: !!document.querySelector('#workbench .artboard-note a[href^="https://drive.google.com"]'),
    galleryTabs: document.querySelectorAll('[data-gallery]').length,
    galleryFigures: document.querySelectorAll('#brand-gallery figure').length,
    galleryCategory: (document.getElementById('brand-gallery') || {}).dataset?.category || null,
  }));

  // Gallery: click through all three categories and count what each renders.
  let gallery = null;
  if (r.galleryTabs) {
    gallery = {};
    for (const cat of ['agents', 'services', 'imagery']) {
      await pg.click(`[data-gallery="${cat}"]`);
      await pg.waitForTimeout(220);
      gallery[cat] = await pg.evaluate(() => {
        const imgs = [...document.querySelectorAll('#brand-gallery img')];
        return {
          figures: document.querySelectorAll('#brand-gallery figure').length,
          broken: imgs.filter(i => !i.naturalWidth).length,
          motion: document.querySelectorAll('#brand-gallery .motion-study').length,
          // The canvas runtime only substitutes files entries in STATIC source; a relative src
          // written by innerHTML resolves against the artifact origin and 404s. Locally it would
          // load fine, so this must be asserted, not eyeballed.
          relativeSrc: imgs.filter(i => !(i.getAttribute('src') || '').startsWith('data:')).length,
        };
      });
    }
    gallery.total = gallery.agents.figures + gallery.services.figures + gallery.imagery.figures;
  }

  // ---- native-shaped sandbox: opaque origin, no allow-forms, no allow-same-origin ----
  // This is the environment the artboard actually runs in: localStorage THROWS and form
  // submission is refused before 'submit' is dispatched. The plain preview above cannot show
  // either failure, which is exactly how the dead submit button reached the published artifact.
  let sandbox = null;
  if (isBook) {
    const wrap = path.join(PREVIEW, name.replace('.dc.html', '-sandboxed.html'));
    fs.writeFileSync(wrap, `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style>
<iframe sandbox="allow-scripts" src="${name.replace('.dc.html', '.html')}"></iframe>`);
    const sp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await sp.goto(pathToFileURL(wrap).href, { waitUntil: 'networkidle' });
    await sp.waitForTimeout(900);
    const fr = sp.frames().find(f => f !== sp.mainFrame());
    sandbox = { storageThrows: null, actions: {} };
    if (!fr) {
      sandbox.error = 'sandboxed frame not found';
    } else {
      sandbox.storageThrows = await fr.evaluate(() => {
        try { localStorage.setItem('__p', '1'); localStorage.removeItem('__p'); return false; }
        catch (e) { return true; }
      });
      // 1. the exercise form exists and rendered fields
      const has = await fr.evaluate(() => !!document.getElementById('specific-exercise'));
      sandbox.actions.formRendered = has;
      if (has) {
        // 2. fill every field, then click the real submit button
        await fr.evaluate(() => {
          document.querySelectorAll('#specific-exercise input,#specific-exercise textarea')
            .forEach(el => { el.value = el.type === 'number' ? '12' : 'verification entry'; });
          document.querySelectorAll('#specific-exercise select').forEach(s => {
            if (s.options.length > 1) s.selectedIndex = 1;
          });
        });
        const before = await fr.evaluate(() =>
          (document.getElementById('exercise-output') || {}).textContent || '');
        await fr.evaluate(() => {
          const b = document.querySelector('#specific-exercise button[type="submit"]');
          if (b) b.click();
        });
        await sp.waitForTimeout(320);
        const after = await fr.evaluate(() => ({
          out: (document.getElementById('exercise-output') || {}).textContent || '',
          status: (document.querySelector('#exercise-root .exercise-status,#exercise-root [role="status"]') || {}).textContent || '',
        }));
        sandbox.actions.submitChangedOutput = after.out !== before &&
          !/^No observations recorded yet\.?$/.test(after.out.trim());
        sandbox.actions.submitStatus = after.status.slice(0, 60);
        // 3. download button must not throw (it is blocked, but must stay responsive)
        sandbox.actions.downloadClickOk = await fr.evaluate(() => {
          try { const b = document.getElementById('exercise-download'); if (!b) return false; b.click(); return true; }
          catch (e) { return false; }
        });
        await sp.waitForTimeout(200);
        // 4. reset clears the output back to the empty state
        await fr.evaluate(() => { const b = document.getElementById('exercise-reset'); if (b) b.click(); });
        await sp.waitForTimeout(250);
        sandbox.actions.resetCleared = await fr.evaluate(() =>
          /No observations recorded yet|reset/i.test(document.getElementById('exercise-root').textContent));
      }
      // 5. the checklist still reports a count with storage unavailable
      sandbox.actions.checklistResponds = await fr.evaluate(() => {
        const box = document.querySelector('[data-check]');
        const st = document.getElementById('check-status');
        if (!box || !st) return false;
        const before = st.textContent;
        box.click();
        return st.textContent !== before;
      });
      sandbox.actions.exportNoteVisible = await fr.evaluate(() => {
        const n = document.querySelector('#workbench .artboard-note');
        return !!n && n.getBoundingClientRect().height > 0;
      });
    }
    await sp.close();
  }

  // Jump accuracy from a cold position, per target.
  const jumps = [];
  for (const id of [...new Set(r.targets)]) {
    const landed = await pg.evaluate((i) => {
      window.scrollTo(0, 0);
      const el = document.getElementById(i);
      if (!el) return null;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      // A target near the document end cannot reach the top of the viewport — the page runs out of
      // scroll. That is correct behaviour, identical to a native anchor, so treat "as far as the
      // page can go, and visible" as a good landing.
      const atEnd = Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2;
      const top = Math.round(el.getBoundingClientRect().top);
      return { top, atEnd, visible: top >= 0 && top < innerHeight };
    }, id);
    const ok = !!landed && ((landed.top >= -2 && landed.top < 220)
      || (landed.atEnd && landed.visible));
    jumps.push({ id, top: landed ? landed.top : null, atEnd: landed ? landed.atEnd : null, ok });
  }

  await pg.setViewportSize({ width: 390, height: 800 });
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.waitForTimeout(250);
  const oflMobile = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await pg.screenshot({ path: path.join(PREVIEW, name.replace('.dc.html', '-mobile.png')) });
  await pg.setViewportSize({ width: 1440, height: 900 });
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.waitForTimeout(250);
  await pg.screenshot({ path: path.join(PREVIEW, name.replace('.dc.html', '-top.png')) });
  await pg.close();

  const badJumps = jumps.filter(j => !j.ok);
  const problems = [];
  if (bare) problems.push(`${bare} bare anchors`);
  if (cv) problems.push('content-visibility introduced');
  if (r.broken.length) problems.push(`${r.broken.length} broken images`);
  if (r.oflDesktop) problems.push('desktop overflow');
  if (oflMobile) problems.push('mobile overflow');
  if (badJumps.length) problems.push(`${badJumps.length} jumps off-target`);
  if (r.localHrefsLeft) problems.push(`${r.localHrefsLeft} local hrefs left`);
  if (isBook) {
    if (!r.bookData) problems.push('#book-data missing (exercises.js needs it)');
    if (!r.exerciseRoot) problems.push('#exercise-root missing');
    if (r.exerciseControls < 5) problems.push(`exercise controls ${r.exerciseControls}/5 — did exercises.js run?`);
    if (!r.exerciseFields) problems.push('exercise form rendered no fields');
    if (!r.citationRefs || !r.citationDetails) problems.push('citations missing');
  }
  if (isBrand && (!gallery || gallery.total !== 15)) {
    problems.push(`gallery rendered ${gallery ? gallery.total : 0}/15 assets`);
  }
  if (isBrand && gallery && gallery.services.motion !== 6) {
    problems.push(`service icon motion ${gallery ? gallery.services.motion : 0}/6`);
  }
  if (isBrand && gallery && ['agents', 'services', 'imagery'].some(c => gallery[c].broken)) {
    problems.push('broken gallery image');
  }
  if (isBrand && gallery) {
    const rel = ['agents', 'services', 'imagery'].reduce((n, c) => n + gallery[c].relativeSrc, 0);
    if (rel) problems.push(`${rel} gallery images use a relative src — will 404 in the artifact`);
  }
  if (isBook && !r.exportNote) problems.push('export limitation note missing');
  if (isBook && sandbox) {
    const A = sandbox.actions;
    if (sandbox.error) problems.push('sandbox: ' + sandbox.error);
    if (!A.formRendered) problems.push('sandbox: exercise form did not render');
    if (!A.submitChangedOutput) problems.push('sandbox: submit produced no output change');
    if (!A.downloadClickOk) problems.push('sandbox: download control threw');
    if (!A.resetCleared) problems.push('sandbox: reset did not clear');
    if (!A.checklistResponds) problems.push('sandbox: checklist did not respond');
    if (!A.exportNoteVisible) problems.push('sandbox: export note not visible');
  }
  if (problems.length) failures++;
  console.log(JSON.stringify({
    artboard: name, kb: Math.round(fs.statSync(path.join(BUILD, name)).size / 1024),
    words: r.words, chapters: r.chapters, navButtons: r.navButtons,
    images: r.images, broken: r.broken, bareAnchors: bare, contentVisibility: cv,
    jumps: `${jumps.length - badJumps.length}/${jumps.length}`,
    badJumps: badJumps.length ? badJumps.slice(0, 4) : undefined,
    citations: `${r.citationRefs} refs / ${r.citationDetails} details`,
    externalLinksKept: r.externalLinks, localHrefsLeft: r.localHrefsLeft,
    exercises: isBook
      ? `root=${r.exerciseRoot} controls=${r.exerciseControls}/5 fields=${r.exerciseFields}` : undefined,
    gallery: gallery || undefined,
    sandbox: sandbox || undefined,
    heightPx: r.height, overflow: { desktop: r.oflDesktop, mobile: oflMobile },
    verdict: problems.length ? 'FAIL: ' + problems.join('; ') : 'ok',
  }));

  if (canvas) {
    const a = canvas.artboards.find(x => x.file === name);
    if (a) a.h = r.height + 160;
  }
}

if (canvas) fs.writeFileSync(CANVAS, JSON.stringify(canvas, null, 2));
await browser.close();
console.log(failures ? `\n${failures} artboard(s) FAILED — do not seed` : '\nall artboards ok');
process.exit(failures ? 1 : 0);
