import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidence = join(root, "evidence", "orange-press-brick-build");
mkdirSync(evidence, { recursive: true });

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

const server = createServer((request, response) => {
  const raw = decodeURIComponent((request.url || "/").split("?")[0]);
  const relativePath = raw.endsWith("/") ? `${raw}index.html` : raw;
  const target = resolve(root, `.${normalize(relativePath)}`);
  if (!target.startsWith(root)) return response.writeHead(403).end("Forbidden");
  try {
    response.writeHead(200, { "Content-Type": mime[extname(target)] || "application/octet-stream" });
    response.end(readFileSync(target));
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const port = server.address().port;
const browser = await chromium.launch({ headless: true });

const scenarios = [
  { name: "desktop", width: 1440, height: 900, reducedMotion: "no-preference", frames: [250, 1000, 2200, 3600, 4700, 5600, 6800] },
  { name: "mobile", width: 390, height: 844, reducedMotion: "no-preference", frames: [1600, 4000, 6800] },
  { name: "narrow", width: 320, height: 780, reducedMotion: "no-preference", frames: [6800] },
  { name: "reduced", width: 390, height: 844, reducedMotion: "reduce", frames: [250] }
];

const report = { target: `http://127.0.0.1:${port}/orange-press/`, scenarios: [], failures: [] };

try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      reducedMotion: scenario.reducedMotion
    });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(report.target, { waitUntil: "domcontentloaded" });
    if (response?.status() !== 200) report.failures.push(`${scenario.name}: HTTP ${response?.status()}`);
    await page.evaluate(async () => { await document.fonts.ready; });
    const section = page.locator(".brick-build");
    await section.scrollIntoViewIfNeeded();
    let elapsed = 0;
    const frameStates = [];
    for (let index = 0; index < scenario.frames.length; index += 1) {
      const wait = scenario.frames[index] - elapsed;
      if (wait > 0) await page.waitForTimeout(wait);
      elapsed = scenario.frames[index];
      await section.screenshot({ path: join(evidence, `${scenario.name}-${String(index + 1).padStart(2, "0")}-${elapsed}ms.png`) });
      frameStates.push(await page.evaluate((frameElapsed) => {
        const wrongBrick = document.querySelector(".brick-unit--wrong");
        const masonry = document.querySelector(".brick-build__masonry");
        const exact = document.querySelector(".brick-build__exact");
        const transform = wrongBrick ? getComputedStyle(wrongBrick).transform : "none";
        const matrix = transform === "none" ? null : new DOMMatrix(transform);
        return {
          elapsed: frameElapsed,
          wrongBrickAngle: matrix ? Math.round(Math.atan2(matrix.b, matrix.a) * 180 / Math.PI) : 0,
          wrongBrickOpacity: wrongBrick ? Number(getComputedStyle(wrongBrick).opacity) : 0,
          masonryOpacity: masonry ? Number(getComputedStyle(masonry).opacity) : 0,
          maskImage: masonry ? getComputedStyle(masonry).maskImage || getComputedStyle(masonry).webkitMaskImage : "none",
          exactOpacity: exact ? Number(getComputedStyle(exact).opacity) : 0
        };
      }, elapsed));
    }

    const state = await page.evaluate(() => {
      const sectionElement = document.querySelector(".brick-build");
      const logo = document.querySelector(".brick-build__exact");
      const wrongBrick = document.querySelector(".brick-unit--wrong");
      const sectionRect = sectionElement.getBoundingClientRect();
      const logoStyle = getComputedStyle(logo);
      const overflowElements = Array.from(document.querySelectorAll("body *"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            tag: element.tagName,
            id: element.id,
            className: typeof element.className === "string" ? element.className : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            overflowX: style.overflowX,
            position: style.position,
            transform: style.transform
          };
        })
        .filter((entry) => entry.width > 0 && (entry.left < -1 || entry.right > innerWidth + 1))
        .slice(0, 40);
      return {
        classes: sectionElement.className,
        brickCount: document.querySelectorAll(".brick-unit").length,
        logoComplete: logo.complete && logo.naturalWidth > 0,
        logoOpacity: Number(logoStyle.opacity),
        logoVisible: logoStyle.visibility !== "hidden" && logoStyle.display !== "none",
        wrongBrickTransform: wrongBrick ? getComputedStyle(wrongBrick).transform : null,
        sectionSafeInline: sectionRect.left >= -1 && sectionRect.right <= innerWidth + 1,
        documentOverflow: document.documentElement.scrollWidth - innerWidth,
        overflowElements,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        hiddenBricks: Array.from(document.querySelectorAll(".brick-unit")).every((brick) => {
          const style = getComputedStyle(brick);
          return style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0;
        })
      };
    });

    if (state.brickCount !== 32) report.failures.push(`${scenario.name}: expected 32 bricks, found ${state.brickCount}`);
    if (!state.logoComplete) report.failures.push(`${scenario.name}: exact logo did not load`);
    if (!state.sectionSafeInline || state.documentOverflow > 1) report.failures.push(`${scenario.name}: horizontal overflow ${state.documentOverflow}px`);
    if (scenario.reducedMotion === "reduce" && (!state.logoVisible || state.logoOpacity < 0.99)) report.failures.push(`${scenario.name}: reduced-motion logo is not immediately visible`);
    if (scenario.reducedMotion !== "reduce" && scenario.frames.at(-1) >= 6500 && (!state.classes.includes("is-built") || state.logoOpacity < 0.99)) report.failures.push(`${scenario.name}: sequence did not resolve to the exact logo`);
    if (scenario.name === "desktop") {
      const wrongFrame = frameStates.find((frame) => Math.abs(frame.wrongBrickAngle) >= 45 && frame.wrongBrickOpacity > 0.8 && frame.exactOpacity < 0.1);
      const correctedFrame = wrongFrame && frameStates.find((frame) => frame.elapsed > wrongFrame.elapsed && Math.abs(frame.wrongBrickAngle) <= 5 && frame.wrongBrickOpacity > 0.9 && frame.exactOpacity < 0.1);
      const finalFrame = frameStates.find((frame) => frame.elapsed === 6800);
      if (!wrongFrame) report.failures.push("desktop: wrong brick was not visibly misaligned before the exact logo reveal");
      if (!correctedFrame) report.failures.push("desktop: wrong brick did not flip flush before the exact logo reveal");
      if (!wrongFrame || wrongFrame.maskImage === "none") report.failures.push("desktop: masonry is not clipped to the exact approved logo silhouette");
      if (!finalFrame || finalFrame.exactOpacity < 0.99 || finalFrame.masonryOpacity > 0.05) report.failures.push("desktop: exact logo did not cleanly replace the brick mosaic");
    }
    if (errors.length) report.failures.push(`${scenario.name}: console errors: ${errors.join(" | ")}`);

    report.scenarios.push({ ...scenario, errors, frameStates, state });
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}

writeFileSync(join(evidence, "qa.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ evidence, failures: report.failures }, null, 2));
if (report.failures.length) process.exitCode = 1;
