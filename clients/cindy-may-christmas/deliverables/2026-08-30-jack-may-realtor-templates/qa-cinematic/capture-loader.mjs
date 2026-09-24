import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const target = process.argv[2];
const outputDirectory = process.argv[3];
const delayMedia = process.argv.includes("--delay-media");
const mobile = process.argv.includes("--mobile");

if (!target || !outputDirectory) {
  throw new Error("Usage: node capture-loader.mjs <url> <output-directory> [--delay-media]");
}

await fs.mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

const context = await browser.newContext({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  isMobile: mobile,
  reducedMotion: "no-preference",
});

const page = await context.newPage();

if (delayMedia) {
  await page.route("**/*.mp4*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3200));
    await route.continue();
  });
}

const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });

const captureTimes = [0, 240, 520, 860, 1240, 1680, 2160];
let elapsed = 0;

for (const captureTime of captureTimes) {
  await page.waitForTimeout(captureTime - elapsed);
  elapsed = captureTime;
  const filename = `loader-${String(captureTime).padStart(4, "0")}ms.png`;
  await page.screenshot({ path: path.join(outputDirectory, filename) });
}

const state = await page.evaluate(() => ({
  loaderHidden: document.querySelector("[data-loader]")?.hidden ?? null,
  loaderClass: document.querySelector("[data-loader]")?.className ?? null,
  logoRect: document.querySelector(".film-loader__mark img")?.getBoundingClientRect().toJSON() ?? null,
  bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));

await fs.writeFile(
  path.join(outputDirectory, "capture.json"),
  `${JSON.stringify({ target, captureTimes, state, errors }, null, 2)}\n`,
  "utf8",
);

await browser.close();
