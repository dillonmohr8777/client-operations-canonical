import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
await page.goto(new URL('../report.html', import.meta.url).href, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
const count = await page.locator('.sheet').count();
for (let index = 0; index < count; index += 1) {
  await page.locator('.sheet').nth(index).screenshot({ path: fileURLToPath(new URL(`./scorecard-page-${index + 1}.png`, import.meta.url)) });
}
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(new URL('../report.html', import.meta.url).href, { waitUntil: 'networkidle' });
await mobile.locator('.sheet').first().screenshot({ path: fileURLToPath(new URL('./mobile-scorecard.png', import.meta.url)), fullPage: true });
await browser.close();
console.log(`Captured ${count} pages.`);
