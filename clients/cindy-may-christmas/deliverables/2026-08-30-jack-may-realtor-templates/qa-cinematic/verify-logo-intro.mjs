import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const target = process.argv[2];
const outputDirectory = process.argv[3];

if (!target || !outputDirectory) {
  throw new Error("Usage: node verify-logo-intro.mjs <url> <output-directory>");
}

await fs.mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

const configurations = [
  { name: "desktop", viewport: { width: 1280, height: 720 }, reducedMotion: "no-preference" },
  { name: "mobile", viewport: { width: 390, height: 844 }, reducedMotion: "no-preference", isMobile: true },
  { name: "reduced", viewport: { width: 1280, height: 720 }, reducedMotion: "reduce" },
];

const results = [];

for (const configuration of configurations) {
  const context = await browser.newContext({
    viewport: configuration.viewport,
    reducedMotion: configuration.reducedMotion,
    isMobile: configuration.isMobile ?? false,
  });
  const page = await context.newPage();
  const errors = [];
  const failedResponses = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(`${target}${target.includes("?") ? "&" : "?"}qa=${configuration.name}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await page.waitForSelector("[data-loader]", { state: "hidden", timeout: 15000 });
  await page.waitForTimeout(300);

  const snapshot = await page.evaluate(() => {
    const logoImages = [...document.querySelectorAll(".may-logo-transparent")];
    const video = document.querySelector("#film-video");
    const searchLink = document.querySelector(".site-nav__action");
    const stage = document.querySelector("[data-stage]");

    return {
      particles: document.querySelectorAll(".film-loader__particle").length,
      legacyPlates: document.querySelectorAll(".may-logo-plate").length,
      legacyOrbits: document.querySelectorAll(".film-loader__orbit").length,
      logoImages: logoImages.map((image) => ({
        src: image.getAttribute("src"),
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      })),
      headerLogoVisible: Boolean(logoImages[1]?.getBoundingClientRect().width),
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stageVisible: Boolean(stage?.getBoundingClientRect().height),
      searchHref: searchLink?.href ?? null,
      video: {
        readyState: video?.readyState ?? null,
        duration: Number.isFinite(video?.duration) ? Number(video.duration.toFixed(3)) : null,
        currentTime: Number.isFinite(video?.currentTime) ? Number(video.currentTime.toFixed(3)) : null,
      },
      state: window.__M360_V3_STATE__ ?? null,
    };
  });

  await page.screenshot({
    path: path.join(outputDirectory, `${configuration.name}-page.png`),
    fullPage: false,
  });

  results.push({ configuration, errors, failedResponses, snapshot });
  await context.close();
}

await browser.close();

const report = { target, generatedAt: new Date().toISOString(), results };
await fs.writeFile(path.join(outputDirectory, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
