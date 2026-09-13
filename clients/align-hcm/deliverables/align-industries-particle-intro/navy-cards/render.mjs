import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'frames');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;

// The container ships chromium-1194; this playwright build expects a newer one,
// so point it at the pre-installed binary rather than downloading.
// Serve over HTTP so the canvas is not tainted by file:// origins.
const http = await import('http');
const mime = { '.html': 'text/html', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'intro.html';
  const file = path.join(here, rel);
  if (!file.startsWith(here) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--force-device-scale-factor=1'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => { console.error('PAGE ERROR:', e.message); process.exit(1); });

await page.goto(`http://127.0.0.1:${port}/intro.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });

const total = await page.evaluate(() => window.__total);
const count = await page.evaluate(() => window.__count);
console.log(`particles: ${count}   frames: ${total}`);

const canvas = await page.$('#stage');
const list = only ?? [...Array(total).keys()];
for (const i of list) {
  await page.evaluate(f => window.drawFrame(f), i);
  await canvas.screenshot({ path: path.join(outDir, `f${String(i).padStart(4, '0')}.png`) });
}
console.log(`wrote ${list.length} frames to ${outDir}`);
await browser.close();
server.close();
