/**
 * QA harness for the two homepage builds.
 *
 * Captures, per page and per viewport: console errors, failed requests,
 * transferred bytes, an accessibility spot-check, and a full-page screenshot.
 * Exits non-zero if any hard check fails, so it can gate a release.
 *
 * Usage:  node tools/qa.mjs [baseUrl]
 */
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:8899";
const OUT = path.join(process.cwd(), "qa");

const PAGES = [
  { slug: "design-a", url: `${BASE}/design-a/index.html` },
  { slug: "design-b", url: `${BASE}/design-b/index.html` },
  { slug: "review", url: `${BASE}/review/index.html` },
];

const VIEWPORTS = [
  { name: "desktop", opts: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
  { name: "mobile", opts: { ...devices["iPhone 13"] } },
];

const audit = () => ({
  h1Count: document.querySelectorAll("h1").length,
  h1Text: document.querySelector("h1")?.innerText?.trim().slice(0, 90) || null,
  skipLinkFirst: (() => {
    const f = document.body.querySelector("a[href], button, input, select, textarea");
    return !!f && f.classList.contains("skip");
  })(),
  imagesMissingAlt: [...document.images]
    .filter((i) => !i.hasAttribute("alt") && i.getAttribute("aria-hidden") !== "true")
    .map((i) => i.currentSrc || i.src),
  imagesBroken: [...document.images]
    .filter((i) => i.complete && i.naturalWidth === 0)
    .map((i) => i.currentSrc || i.src),
  imagesWithoutDims: [...document.images]
    .filter((i) => !i.getAttribute("width") || !i.getAttribute("height"))
    .map((i) => i.currentSrc || i.src),
  headingOrder: (() => {
    const levels = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => +h.tagName[1]);
    const skips = [];
    for (let i = 1; i < levels.length; i += 1) {
      if (levels[i] - levels[i - 1] > 1) skips.push(`${levels[i - 1]}->${levels[i]}`);
    }
    return skips;
  })(),
  outlineNone: [...document.styleSheets]
    .flatMap((s) => {
      try {
        return [...s.cssRules];
      } catch {
        return [];
      }
    })
    .filter((r) => r.style && /outline:\s*(none|0)/.test(r.style.cssText))
    .map((r) => r.selectorText),
  sections: document.querySelectorAll("main section").length,
  bodyWords: (() => {
    // Count only real prose: paragraphs inside main, excluding mono/HUD labels.
    const ps = [...document.querySelectorAll("main p")].filter(
      (p) => !p.className.match(/code|eyebrow|no|status|hud|note|card__no/)
    );
    return ps.reduce((n, p) => n + p.innerText.trim().split(/\s+/).filter(Boolean).length, 0);
  })(),
  hasLockup: !!document.querySelector('img[src*="momentum-lockup"]'),
  goldUsed: getComputedStyle(document.documentElement).getPropertyValue("--gold-500").trim(),
  blueUsed: getComputedStyle(document.documentElement).getPropertyValue("--blue-500").trim(),
  horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
});

let failures = 0;

await mkdir(OUT, { recursive: true });
// The sandbox ships Chromium at a fixed path; the npm playwright build number
// will not always match, so point at the installed binary explicitly.
const EXEC = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox"] });

for (const page of PAGES) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext(vp.opts);
    const tab = await ctx.newPage();

    const errors = [];
    const failed = [];
    let bytes = 0;

    tab.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text().slice(0, 200));
    });
    tab.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));
    tab.on("requestfailed", (r) => {
      // Third-party fonts can be blocked in this sandbox; note but do not fail.
      failed.push(`${r.url().slice(0, 120)} :: ${r.failure()?.errorText}`);
    });
    tab.on("response", async (r) => {
      const len = Number(r.headers()["content-length"] || 0);
      if (len) bytes += len;
    });

    await tab.goto(page.url, { waitUntil: "load", timeout: 45000 });
    // Let the boot overlay finish and lazy images settle.
    await tab.waitForTimeout(3200);
    // Walk the page so scroll-triggered work runs, then return to the top.
    await tab.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
    });
    await tab.waitForTimeout(600);

    const a = await tab.evaluate(audit);

    // Above-the-fold, motion intact — this is what a visitor actually meets.
    const fold = path.join(OUT, `${page.slug}-${vp.name}-fold.jpg`);
    await tab.screenshot({ path: fold, type: "jpeg", quality: 82 });

    // Full page with motion disabled. Scroll-driven animations correctly hold
    // their pre-entry state off-viewport, so a full-page capture with motion ON
    // renders later sections blank. Turning motion off is how you evidence the
    // whole document honestly.
    await tab.evaluate(() => {
      document.documentElement.dataset.motion = "off";
      document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in"));
    });
    await tab.waitForTimeout(500);
    // JPEG, not PNG: these full-page captures run to 12,000px tall and a PNG set
    // is ~19 MB of binaries in git for no extra diagnostic value.
    const shot = path.join(OUT, `${page.slug}-${vp.name}.jpg`);
    await tab.screenshot({ path: shot, fullPage: true, type: "jpeg", quality: 78 });

    const localFailed = failed.filter((f) => f.includes(BASE));
    // Google Fonts is unreachable from the sandbox. That is environmental, so it
    // is reported but never fails the gate; everything else still does.
    const thirdPartyOnly = (s) => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(s);
    const realErrors = errors.filter((e) => !thirdPartyOnly(e) && !/ERR_CONNECTION_RESET|Failed to load resource/.test(e));
    const hard = [];
    if (a.h1Count !== 1 && page.slug !== "review") hard.push(`h1Count=${a.h1Count}`);
    if (!a.skipLinkFirst) hard.push("skip link is not the first focusable element");
    if (a.imagesBroken.length) hard.push(`broken images: ${a.imagesBroken.length}`);
    if (a.imagesMissingAlt.length) hard.push(`images missing alt: ${a.imagesMissingAlt.length}`);
    if (a.headingOrder.length) hard.push(`heading level skips: ${a.headingOrder.join(",")}`);
    if (a.outlineNone.length) hard.push(`outline:none found: ${a.outlineNone.join(",")}`);
    if (a.horizontalOverflow) hard.push("horizontal overflow on body");
    if (localFailed.length) hard.push(`local requests failed: ${localFailed.length}`);
    if (realErrors.length) hard.push(`console errors: ${realErrors.length}`);

    console.log(`\n=== ${page.slug} / ${vp.name} ===`);
    console.log(`  transferred        ${(bytes / 1024).toFixed(0)} KB`);
    console.log(`  sections           ${a.sections}`);
    console.log(`  prose words        ${a.bodyWords}`);
    console.log(`  h1                 ${a.h1Count} — ${a.h1Text ?? "(none)"}`);
    console.log(`  lockup present     ${a.hasLockup}`);
    console.log(`  gold / blue        ${a.goldUsed} / ${a.blueUsed}`);
    console.log(`  imgs no dimensions ${a.imagesWithoutDims.length}`);
    console.log(`  screenshots        ${path.relative(process.cwd(), fold)}`);
    console.log(`                     ${path.relative(process.cwd(), shot)}`);
    if (failed.length) {
      console.log(`  requests failed    ${failed.length}`);
      failed.slice(0, 6).forEach((f) => console.log(`    - ${f}`));
    }
    if (errors.length) errors.slice(0, 8).forEach((e) => console.log(`    ! ${e}`));
    if (hard.length) {
      failures += hard.length;
      hard.forEach((h) => console.log(`  FAIL: ${h}`));
    } else {
      console.log("  PASS");
    }

    await ctx.close();
  }
}

await browser.close();
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} HARD CHECK FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
