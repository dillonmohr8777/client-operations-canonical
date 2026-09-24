import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
const target = new URL('../report.html', import.meta.url);
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(target.href);
const result = await page.evaluate(() => ({
  viewport: window.innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  offenders: [...document.querySelectorAll('body *')]
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        className: element.className,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        text: (element.textContent || '').trim().slice(0, 70)
      };
    })
    .filter((item) => item.right > window.innerWidth + 1 || item.left < -1)
    .slice(0, 40)
}));
console.log(JSON.stringify(result, null, 2));
await page.locator('.page').first().screenshot({
  path: fileURLToPath(new URL('./mobile-playwright.png', import.meta.url))
});
await browser.close();
