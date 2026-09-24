import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const outputDir = process.argv[2];

if (!outputDir) {
  throw new Error("Usage: node capture-review-sites.mjs <output-directory>");
}

const sites = [
  {
    slug: "01-terminal-growth-showcase",
    label: "Terminal Growth Showcase",
    url: "https://bigorange-terminal-growth-showcase.netlify.app/",
  },
  {
    slug: "02-growth-signal-showcase",
    label: "Growth Signal Showcase",
    url: "https://bigorange-growth-signal-showcase.netlify.app/",
  },
  {
    slug: "03-industry-signal",
    label: "Industry Signal",
    url: "https://bigorange-marketing-homepage.netlify.app/",
  },
  {
    slug: "04-primary-portfolio",
    label: "Primary Portfolio",
    url: "https://bigorange-marketing-homepage.netlify.app/primary/",
  },
];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const site of sites) {
    const desktop = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const errors = [];
    desktop.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    desktop.on("pageerror", (error) => errors.push(error.message));

    const response = await desktop.goto(site.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await Promise.race([
      desktop.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      }),
      desktop.waitForTimeout(5_000),
    ]);
    await desktop.waitForTimeout(1_000);

    const desktopHero = path.join(outputDir, `${site.slug}-desktop-hero.jpg`);
    await desktop.screenshot({
      path: desktopHero,
      type: "jpeg",
      quality: 84,
      fullPage: false,
    });

    const pageHeight = await desktop.evaluate(() => document.documentElement.scrollHeight);
    const midY = Math.max(0, Math.min(Math.round(pageHeight * 0.42), pageHeight - 1000));
    await desktop.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), midY);
    await desktop.waitForTimeout(250);
    const desktopMid = path.join(outputDir, `${site.slug}-desktop-midpage.jpg`);
    await desktop.screenshot({
      path: desktopMid,
      type: "jpeg",
      quality: 84,
      fullPage: false,
    });

    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    mobile.on("console", (message) => {
      if (message.type() === "error") errors.push(`mobile: ${message.text()}`);
    });
    mobile.on("pageerror", (error) => errors.push(`mobile: ${error.message}`));
    const mobileResponse = await mobile.goto(site.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await Promise.race([
      mobile.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      }),
      mobile.waitForTimeout(5_000),
    ]);
    await mobile.waitForTimeout(1_000);
    const mobileHero = path.join(outputDir, `${site.slug}-mobile-hero.jpg`);
    await mobile.screenshot({
      path: mobileHero,
      type: "jpeg",
      quality: 84,
      fullPage: false,
    });

    results.push({
      ...site,
      title: await desktop.title(),
      desktopStatus: response?.status() ?? null,
      mobileStatus: mobileResponse?.status() ?? null,
      pageHeight,
      midY,
      horizontalOverflowDesktop: await desktop.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
      horizontalOverflowMobile: await mobile.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
      errors,
      screenshots: [desktopHero, desktopMid, mobileHero],
    });

    await desktop.close();
    await mobile.close();
  }
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(outputDir, "capture-manifest.json"),
  `${JSON.stringify({ capturedAt: new Date().toISOString(), sites: results }, null, 2)}\n`,
  "utf8",
);

for (const result of results) {
  console.log(`${result.desktopStatus}/${result.mobileStatus}\t${result.label}\t${result.url}`);
}
