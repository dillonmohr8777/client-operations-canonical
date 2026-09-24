import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const evidence = join(root, 'evidence');
mkdirSync(evidence, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const raw = decodeURIComponent((req.url || '/').split('?')[0]);
  const relativePath = raw.endsWith('/') ? `${raw}index.html` : raw;
  const target = resolve(root, `.${normalize(relativePath)}`);
  if (!target.startsWith(root)) { res.writeHead(403).end('Forbidden'); return; }
  try { const data = readFileSync(target); res.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream' }); res.end(data); }
  catch { res.writeHead(404).end('Not found'); }
});

await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const port = server.address().port;
const browser = await chromium.launch({ headless: true });
const sites = ['citrus-foundry', 'blueprint-frequency', 'orange-press'];
const report = { checkedAt: new Date().toISOString(), port, sites: {} };

for (const site of sites) {
  report.sites[site] = {};
  for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, colorScheme: 'light' });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('requestfailed', (request) => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
    const response = await page.goto(`http://127.0.0.1:${port}/${site}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2800);
    const heroPath = join(evidence, `${site}-${viewport.name}-hero.png`);
    const fullPath = join(evidence, `${site}-${viewport.name}-full.png`);
    await page.screenshot({ path: heroPath });
    const images = page.locator('img');
    for (let index = 0; index < await images.count(); index += 1) {
      await images.nth(index).scrollIntoViewIfNeeded();
      await page.waitForTimeout(65);
    }
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); });
    await page.waitForTimeout(150);
    const checks = await page.evaluate(() => ({
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      canvasCount: document.querySelectorAll('canvas').length,
      imageCount: document.images.length,
      brokenImages: [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
      primaryActions: [...document.querySelectorAll('a')].filter((a) => a.textContent.includes('Schedule a Non-Sales Call')).length,
      robots: document.querySelector('meta[name=robots]')?.content || null,
      overflowElements: [...document.querySelectorAll('body *')].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
      }).slice(0, 20).map((element) => ({ tag: element.tagName, className: element.className, rect: element.getBoundingClientRect().toJSON() }))
    }));
    await page.screenshot({ path: fullPath, fullPage: true });
    report.sites[site][viewport.name] = { status: response?.status(), consoleErrors, failedRequests, ...checks, heroPath, fullPath };
    await context.close();
  }
  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(`http://127.0.0.1:${port}/${site}/`, { waitUntil: 'networkidle' });
  report.sites[site].reducedMotion = await reducedPage.evaluate(() => ({ canvasDisplay: getComputedStyle(document.querySelector('canvas')).display, logoOpacity: getComputedStyle(document.querySelector('canvas')?.parentElement?.querySelector('img')).opacity }));
  await reduced.close();
}

await browser.close();
server.close();
writeFileSync(join(evidence, 'qa.json'), JSON.stringify(report, null, 2));
const failures = [];
for (const [site, views] of Object.entries(report.sites)) for (const name of ['desktop', 'mobile']) {
  const view = views[name];
  if (view.status !== 200 || view.h1Count !== 1 || view.overflow > 1 || view.consoleErrors.length || view.failedRequests.length || view.brokenImages.length || view.primaryActions < 1 || view.robots !== 'noindex,nofollow') failures.push({ site, name, view });
}
if (failures.length) throw new Error(JSON.stringify(failures, null, 2));
console.log(JSON.stringify(report, null, 2));
