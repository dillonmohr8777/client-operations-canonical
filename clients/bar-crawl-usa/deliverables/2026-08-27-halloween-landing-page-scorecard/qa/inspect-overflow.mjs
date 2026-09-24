import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const target = new URL('../report.html', import.meta.url);
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const results = [];
for (const width of [390, 768, 816, 1200]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(target.href, { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    sheetCount: document.querySelectorAll('.sheet').length,
    emptyLinks: [...document.querySelectorAll('a')].filter(link => !link.getAttribute('href')).length,
    missingImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src),
    offenders: [...document.querySelectorAll('body *')].map(element => {
      const rect = element.getBoundingClientRect();
      return { tag: element.tagName, className: element.className, left: Math.round(rect.left), right: Math.round(rect.right), text: (element.textContent || '').trim().slice(0, 60) };
    }).filter(item => item.right > window.innerWidth + 1 || item.left < -1).slice(0, 30)
  }));
  results.push({ ...result, consoleErrors });
  if (width === 390) await page.locator('.sheet').first().screenshot({ path: fileURLToPath(new URL('./mobile-scorecard.png', import.meta.url)) });
  await page.close();
}
console.log(JSON.stringify(results, null, 2));
await browser.close();

