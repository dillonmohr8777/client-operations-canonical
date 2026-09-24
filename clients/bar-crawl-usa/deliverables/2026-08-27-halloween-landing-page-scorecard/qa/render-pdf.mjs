import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const target = new URL('../report.html', import.meta.url);
const output = fileURLToPath(new URL('../Bar-Crawl-USA-Halloween-Landing-Page-Launch-Scorecard-2026-08-27.pdf', import.meta.url));
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });
await page.goto(target.href, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: output, format: 'Letter', printBackground: true, preferCSSPageSize: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
await browser.close();
console.log(output);

