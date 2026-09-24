import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

async function capture(file, viewport, pages, prefix) {
  const tab = await browser.newPage({ viewport });
  await tab.goto(new URL(file, import.meta.url).href, { waitUntil: 'networkidle' });
  await tab.emulateMedia({ media: 'print' });
  for (const index of pages) {
    await tab.locator('.sheet').nth(index).screenshot({
      path: fileURLToPath(new URL(`./${prefix}-${index + 1}.png`, import.meta.url))
    });
  }
  await tab.close();
}

await capture('../report.html', { width: 816, height: 1056 }, [0, 1, 2, 7], 'plan-page');
await capture('../analytics-report.html', { width: 1056, height: 816 }, [0, 1, 3, 4], 'analytics-page');
await browser.close();
