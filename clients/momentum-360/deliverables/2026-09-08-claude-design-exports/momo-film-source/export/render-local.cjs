const { chromium } = require('C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const full = process.argv.includes('--full');
  const out = path.join(__dirname, full ? 'frames-local' : 'samples-local');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 2052 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:53251/Momo%20-%20Living%20Portfolio%20Film.dc.html', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForFunction(() => document.querySelector('momo-film-stage')?.ready === true, { timeout: 90000 });
    await page.evaluate(() => {
      const stage = document.querySelector('momo-film-stage');
      const root = stage.closest('[data-momo-root]');
      stage.pause();
      Object.assign(root.style, { maxWidth: 'none', width: '1920px', height: '1080px' });
      Object.assign(stage.style, { aspectRatio: 'auto', width: '100%', height: '100%' });
      stage.resize();
    });
    await page.waitForTimeout(800);
    const times = full ? Array.from({ length: 900 }, (_, i) => i / 30) : [0, 6, 15, 22, 28.4];
    for (let i = 0; i < times.length; i++) {
      await page.evaluate(t => document.querySelector('momo-film-stage').renderFrameAt(t), times[i]);
      await page.waitForFunction(() => document.querySelector('momo-film-stage').videos.every(v => !v.attached || v.el.readyState >= 2), { timeout: 15000 });
      await page.evaluate(async t => {
        const stage = document.querySelector('momo-film-stage');
        await stage.renderFrameAt(t);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        stage.draw();
      }, times[i]);
      await page.locator('[data-momo-root]').screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.png`) });
      if (!full || i % 30 === 0) process.stdout.write(JSON.stringify({ frame: i, seconds: times[i] }) + '\n');
    }
    fs.writeFileSync(path.join(out, 'receipt.json'), JSON.stringify({ full, width: 1920, height: 1080, fps: 30, frames: times.length, times: full ? undefined : times, errors }, null, 2));
    if (errors.length) throw new Error('Page errors: ' + errors.join('; '));
  } finally { await browser.close(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
