import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
await page.goto(new URL('../report.html', import.meta.url).href, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
for (const index of [0, 1, 2, 3, 4, 5, 6, 7]) {
  await page.locator('.sheet').nth(index).screenshot({ path: fileURLToPath(new URL(`./seasonal-page-${index + 1}.png`, import.meta.url)) });
}
await browser.close();
