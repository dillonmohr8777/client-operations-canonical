// Render one book: completeness/overflow stats, interaction smoke-test, PDF, screenshots; writes measured height into canvas.json.
import { chromium } from 'playwright'; import fs from 'fs'; import path from 'path'; import { pathToFileURL } from 'node:url';
const [O, MD, CJ, N] = process.argv.slice(2); const n = +N;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 900 } });
await pg.goto(pathToFileURL(path.join(O, `ebook${n}-standalone.html`)).href, { waitUntil: 'networkidle' });
await pg.evaluate(() => document.fonts.ready); await pg.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
const md = fs.readFileSync(MD, 'utf8').replace(/^---[\s\S]*?\n---\n/, '');
const mdWords = md.replace(/\[source:[^\]]*\]/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/[#*_`>|\-\[\]]/g, ' ').split(/\s+/).filter(Boolean).length;
const mdSrc = (md.match(/\[source:/g) || []).length, mdRev = (md.match(/<!--/g) || []).length;
const r = await pg.evaluate(() => ({
  words: document.querySelector('main').textContent.split(/\s+/).filter(Boolean).length,
  src: document.querySelectorAll('cite.src').length, rev: document.querySelectorAll('.rev').length,
  sections: document.querySelectorAll('section.ch').length, chapters: document.querySelectorAll('section.ch[data-n]').length,
  chnav: document.querySelectorAll('.chnav').length, tabs: document.querySelectorAll('nav.toc .tab').length,
  wsRows: document.querySelectorAll('.wsl li').length, dgmBtns: document.querySelectorAll('.dgm button').length,
  etched: document.querySelectorAll('svg.sb-icon-etched').length,
  h: (()=>{const ss=[...document.querySelectorAll('section.ch')];ss.forEach(x=>x.style.contentVisibility='visible');const hh=document.documentElement.scrollHeight;ss.forEach(x=>x.style.contentVisibility='');return hh})(), ofl: document.documentElement.scrollWidth > innerWidth,
  broken: [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')),
  fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i),
  tocDesktop: (()=>{const t=document.querySelectorAll('nav.toc .tab');const vis=[...t].filter(x=>x.getBoundingClientRect().height>0).length;return {total:t.length, visible:vis, railH: Math.round(document.querySelector('nav.toc').getBoundingClientRect().height)}})()
}));
// interaction smoke-test (standalone mirror of the DCLogic states)
await pg.click('.dgm button:nth-of-type(3)');
await pg.click('.wsl li:nth-child(1)'); await pg.click('.wsl li:nth-child(2)');
await pg.click('.ribbon button:nth-of-type(1)');
await pg.waitForTimeout(250);
const act = await pg.evaluate(() => ({
  dgmPressed: document.querySelectorAll('.dgm button[aria-pressed=true]').length,
  dgmOut: (document.querySelector('.dgm .out') || {}).textContent?.trim().slice(0, 60),
  wsDone: document.querySelectorAll('.wsl li.done').length,
  score: (document.querySelector('.score .n') || {}).textContent?.trim(),
  srcHidden: document.querySelector('.scrapbook').classList.contains('nosrc'),
  srcLabel: document.querySelector('.ribbon button').textContent.trim()
}));
await pg.click('.ribbon button:nth-of-type(1)'); // restore sources for the PDF
await pg.setViewportSize({ width: 390, height: 800 }); await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(400);
const mob = await pg.evaluate(() => ({ ofl: document.documentElement.scrollWidth > innerWidth,
  navH: Math.round(document.querySelector('nav.toc').getBoundingClientRect().height),
  tabsVisible: [...document.querySelectorAll('nav.toc .tab')].filter(x=>x.getBoundingClientRect().height>0).length,
  coverTop: Math.round(document.querySelector('.cover').getBoundingClientRect().top) }));
await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(O, `b${n}-mobile.png`) });
await pg.setViewportSize({ width: 1200, height: 900 }); await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(400);
await pg.screenshot({ path: path.join(O, `b${n}-cover.png`) });
for (const [sel, name] of [['.board', 'route'], ['section[data-n="1"] .op', 'opener'], ['.dgm', 'diagram'], ['.ws', 'worksheet']]) {
  const el = await pg.$(sel); if (!el) continue;
  await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(320);
  await el.screenshot({ path: path.join(O, `b${n}-${name}.png`) }).catch(() => {});
}
await pg.emulateMedia({ media: 'print', reducedMotion: 'reduce' }); await pg.waitForTimeout(300);
const pdf = path.join(O, `ebook${n}-REVIEW-DRAFT.pdf`);
await pg.pdf({ path: pdf, format: 'Letter', printBackground: true, margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' } });
const pages = (fs.readFileSync(pdf).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
const cj = JSON.parse(fs.readFileSync(CJ, 'utf8')); for (const a of cj.artboards) if (a.file === `Ebook${n}.dc.html`) a.h = r.h + 120;
fs.writeFileSync(CJ, JSON.stringify(cj, null, 2));
console.log(JSON.stringify({ book: n, mdWords, rendered: r.words, sources: `${r.src}/${mdSrc}`, reviewNotes: `${r.rev}/${mdRev}`,
  sections: r.sections, chapters: r.chapters, chapterNavs: r.chnav, tabs: r.tabs, etchedIcons: r.etched,
  interactions: act, heightPx: r.h, overflow: { desktop: r.ofl, mobile: mob.ofl },
  tocDesktop: r.tocDesktop, tocMobile: { navH: mob.navH, tabsVisible: mob.tabsVisible }, mobileCoverTopPx: mob.coverTop,
  broken: r.broken, fonts: r.fonts, pdfPages: pages, pdfKB: Math.round(fs.statSync(pdf).size / 1024) }));
await b.close();
