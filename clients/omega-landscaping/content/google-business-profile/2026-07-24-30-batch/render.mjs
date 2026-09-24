import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname);
const template = path.join(root, "graphics", "template.html");
const outputs = [
  "omega-gbp-2026-07-24-retaining-walls.png",
  "omega-gbp-2026-07-26-landscape-details.png",
  "omega-gbp-2026-07-28-patio-planning.png",
  "omega-gbp-2026-07-30-colorado-landscape-design.png"
];

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });

for (let index = 0; index < outputs.length; index += 1) {
  await page.goto(`${pathToFileURL(template).href}?i=${index}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(root, outputs[index]), fullPage: false });
}

await browser.close();
