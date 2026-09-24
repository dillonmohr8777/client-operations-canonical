const { chromium } = require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const film = process.argv.includes('--film-b') ? 'B' : 'A';
  const full = process.argv.includes('--full');
  const duration = film === 'A' ? 26 : 25;
  const filename = film === 'A' ? 'Film A - Your Next Chapter.dc.html' : 'Film B - Meet Your Next Team.dc.html';
  const out = path.join(__dirname, `${film.toLowerCase()}-${full ? 'frames' : 'samples'}-native`);
  fs.mkdirSync(out, { recursive: true });
  const errors = [];
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1500 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:55923/' + encodeURIComponent(filename), { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForFunction(() => {
      const stage = document.querySelector('[data-om-exportable-video-with-duration-secs]');
      return stage && stage.querySelector('canvas')?.width > 500 && [...stage.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0);
    }, { timeout: 60000 });
    await page.evaluate(() => {
      const stage = document.querySelector('[data-om-exportable-video-with-duration-secs]');
      Object.assign(stage.style, { width: '1920px', height: '1080px', maxWidth: 'none', borderRadius: '0' });
      for (const child of stage.querySelectorAll('div')) if (child.textContent.trim() === 'Drag to turn · ← →') child.style.display = 'none';
    });
    await page.waitForTimeout(800);
    const times = full ? Array.from({ length: duration * 30 }, (_, i) => i / 30) : [0, 4, 12, 20, duration - 0.2];
    for (let i = 0; i < times.length; i++) {
      await page.evaluate(async time => {
        const stage = document.querySelector('[data-om-exportable-video-with-duration-secs]');
        stage.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', { detail: { time } }));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }, times[i]);
      await page.locator('[data-om-exportable-video-with-duration-secs]').screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.png`) });
      if (!full || i % 30 === 0) process.stdout.write(JSON.stringify({ film, frame: i, seconds: times[i] }) + '\n');
    }
    fs.writeFileSync(path.join(out, 'receipt.json'), JSON.stringify({ film, full, width: 1920, height: 1080, fps: 30, frames: times.length, errors }, null, 2));
    if (errors.length) throw new Error(errors.join('; '));
  } finally { await browser.close(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
