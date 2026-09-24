// Frame-exact render harness for "Momo — Living Portfolio Film".
//
// Nothing here runs automatically and nothing here costs money. It drives the
// page's own deterministic API (stage.renderFrameAt) from a local headless
// Chrome, writes a PNG sequence, and hands off to ffmpeg for the MP4.
//
//   npm i puppeteer          (one time, free)
//   npx serve .              (serve the project root on :3000, any static server)
//   node export/render-frames.mjs
//   ffmpeg -framerate 30 -i export/frames/f%05d.png \
//          -c:v libx264 -pix_fmt yuv420p -crf 16 -preset slow \
//          export/momo-ideas-into-motion-16x9.mp4
//
// Add the synthesized score afterwards only if you want it in the master:
//   (enable Sound on the page, use Record master, and mux that WebM's audio)
//
// IMPORTANT: the capture target is [data-momo-root], not <momo-film-stage>.
// The stage element holds only the WebGL canvas; the title, the meta line and
// the end card (logo, "Make your next move.", needmomentum.com) are HTML
// overlays that are siblings of the canvas inside the root. Screenshotting the
// stage alone yields a film with no text.

import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const URL_BASE = process.env.MOMO_URL || 'http://localhost:3000';
// Update if the file is renamed. Hyphen, not em dash, in the current filename.
const PAGE = process.env.MOMO_PAGE || '/Momo%20-%20Living%20Portfolio%20Film.dc.html';
const FPS = Number(process.env.MOMO_FPS || 30);
const DUR = 30;
const W = Number(process.env.MOMO_W || 1920);
const H = Number(process.env.MOMO_H || 1080);
const OUT = 'export/frames';

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--enable-gpu', '--use-gl=angle', '--use-angle=gl-egl', '--autoplay-policy=no-user-gesture-required']
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: Math.round(H * 1.9), deviceScaleFactor: 1 });
await page.goto(URL_BASE + PAGE, { waitUntil: 'networkidle0' });

await page.waitForFunction(() => {
  const s = document.querySelector('momo-film-stage');
  return s && s.ready === true;
}, { timeout: 60000 });

// Lock the frame to the exact master size and stop the clock. Sizing the ROOT
// (not the stage) is what makes the overlays compose against the real frame —
// the stage fills the root, and its ResizeObserver picks the change up.
await page.evaluate((w, h) => {
  const s = document.querySelector('momo-film-stage');
  const root = s.closest('[data-momo-root]');
  s.pause();
  root.style.maxWidth = 'none';
  root.style.width = w + 'px';
  root.style.height = h + 'px';
  s.style.aspectRatio = 'auto';
  s.style.width = '100%';
  s.style.height = '100%';
  s.resize();
  window.__momo = s;
  window.__momoRoot = root;
}, W, H);
await new Promise(r => setTimeout(r, 800));

const total = Math.round(DUR * FPS);
for (let i = 0; i <= total; i++) {
  const t = i / FPS;
  await page.evaluate(t => window.__momo.renderFrameAt(t), t);
  const el = await page.$('[data-momo-root]');
  await el.screenshot({ path: `${OUT}/f${String(i).padStart(5, '0')}.png` });
  if (i % 30 === 0) process.stdout.write(`  ${t.toFixed(1)}s / ${DUR}s\n`);
}

await browser.close();
console.log(`\n${total + 1} frames written to ${OUT}. Run the ffmpeg line above.`);
