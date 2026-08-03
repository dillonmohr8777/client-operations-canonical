/**
 * QA gate for the MOTION build.
 *
 * Beyond the usual a11y/weight checks this asserts the specific things the
 * review asked for, so a regression fails the build rather than shipping:
 *
 *   - no horizontal overflow at 320 / 390 / 768 / 1440   ("why is it so cut off")
 *   - no canvas whose CSS box is wider than its container (the root cause)
 *   - every resolve mechanic reaches its crisp end state and its canvas is gone
 *   - no text below 16px                                  ("bigger")
 *   - no black/near-black section ground                   ("no black sections")
 *   - the word "signal" appears nowhere in visible text
 *
 * Usage: node tools/qa.mjs [baseUrl]
 */
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:8903";
const OUT = path.join(process.cwd(), "qa");
const EXEC = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const VIEWPORTS = [
  { name: "w320", opts: { viewport: { width: 320, height: 720 } } },
  { name: "mobile", opts: { ...devices["iPhone 13"] } },
  { name: "w768", opts: { viewport: { width: 768, height: 1024 } } },
  { name: "desktop", opts: { viewport: { width: 1440, height: 900 } } },
];

const NEAR_BLACK = (rgb) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb || "");
  if (!m) return false;
  const [r, g, b] = [+m[1], +m[2], +m[3]];
  // #020711 and darker. The navy ground (#071632) must NOT trip this.
  return r + g + b < 40;
};

const audit = () => {
  const bad = [];
  const push = (k, v) => bad.push(k + ": " + v);

  // horizontal overflow, element-level
  const inScroller = (el) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    return false;
  };
  const over = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || el.closest(".sr-only")) continue;
    // Elements parked entirely off-screen left (honeypots, visually-hidden
    // idioms) are deliberate, not overflow.
    if (r.right <= 0) continue;
    if (r.right > window.innerWidth + 1.5 || r.left < -1.5) {
      if (inScroller(el)) continue; // a horizontal scroll track is meant to overflow
      over.push(
        (el.tagName.toLowerCase() + "." + (el.className || "").toString().split(" ")[0]).slice(0, 44) +
          " right=" + Math.round(r.right) + " w=" + Math.round(r.width)
      );
    }
  }

  // canvases wider than their container — the exact bug this build fixes
  const canvasBad = [];
  for (const cv of document.querySelectorAll("canvas")) {
    const r = cv.getBoundingClientRect();
    const host = cv.classList.contains("nm-field") ? document.documentElement : cv.parentElement;
    const hr = host.getBoundingClientRect();
    const limit = cv.classList.contains("nm-field") ? window.innerWidth : hr.width;
    if (r.width > limit + 1.5) {
      canvasBad.push(`${cv.className || "canvas"} css=${Math.round(r.width)} limit=${Math.round(limit)}`);
    }
    if (!cv.style.width) canvasBad.push(`${cv.className || "canvas"} has no style.width (lays out at attribute width)`);
  }

  // text under 16px
  const small = [];
  for (const el of document.querySelectorAll("p,li,a,h1,h2,h3,span,button,label,input,textarea,cite,b,strong")) {
    if (!el.textContent || !el.textContent.trim()) continue;
    if (el.closest(".sr-only") || el.classList.contains("sr-only")) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs && fs < 15.5) small.push(`${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} ${fs}px`);
  }

  // black grounds
  const blacks = [];
  for (const el of document.querySelectorAll("section,footer,header,main,body")) {
    const bg = getComputedStyle(el).backgroundColor;
    if (NEARBLACK(bg)) blacks.push(`${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} ${bg}`);
  }

  return {
    over,
    canvasBad,
    small: [...new Set(small)],
    blacks,
    h1Count: document.querySelectorAll("h1").length,
    skipFirst: (() => {
      const f = document.body.querySelector("a[href],button,input,select,textarea");
      return !!f && f.classList.contains("skip");
    })(),
    noAlt: [...document.images].filter((i) => !i.hasAttribute("alt") && i.getAttribute("aria-hidden") !== "true").length,
    broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
    noDims: [...document.images].filter((i) => !i.getAttribute("width") || !i.getAttribute("height")).length,
    signal: (document.body.innerText.match(/signal/gi) || []).length,
    docH: document.body.scrollHeight,
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  };
};

const resolveState = () => ({
  pending: [...document.querySelectorAll("[data-assemble-logo],[data-assemble-text]")].map((el) => {
    const target = el.hasAttribute("data-assemble-logo") ? el.querySelector("img") : el;
    return {
      kind: el.hasAttribute("data-assemble-logo") ? "logo" : "text",
      opacity: getComputedStyle(target).opacity,
      canvasLeft: el.querySelectorAll("canvas").length,
      fired: el.dataset.done === "1",
    };
  }),
});

let failures = 0;
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox"] });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext(vp.opts);
  const tab = await ctx.newPage();
  const errors = [];
  const failed = [];
  let bytes = 0;
  tab.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  tab.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 160)));
  tab.on("requestfailed", (r) => failed.push(r.url().slice(0, 100)));
  tab.on("response", (r) => {
    const l = Number(r.headers()["content-length"] || 0);
    if (l) bytes += l;
  });

  await tab.addInitScript(() => {
    window.NEARBLACK = (rgb) => {
      const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(rgb || "");
      if (!m) return false;
      // A transparent background is not a black background.
      if (m[4] !== undefined && parseFloat(m[4]) < 0.02) return false;
      return +m[1] + +m[2] + +m[3] < 40;
    };
  });

  await tab.goto(`${BASE}/index.html`, { waitUntil: "load", timeout: 45000 });
  await tab.waitForTimeout(1200);

  // Walk the page so every resolve mechanic has a chance to fire, at a pace the
  // IntersectionObserver can actually keep up with.
  await tab.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 260));
    }
  });
  await tab.waitForTimeout(2200); // let the last 1150ms assembly finish
  const res = await tab.evaluate(resolveState);
  await tab.evaluate(() => window.scrollTo(0, 0));
  await tab.waitForTimeout(500);

  const a = await tab.evaluate(audit);
  const shot = path.join(OUT, `motion-${vp.name}.jpg`);
  await tab.screenshot({ path: shot, type: "jpeg", quality: 82 });

  const realErr = errors.filter((e) => !/favicon/i.test(e));
  const hard = [];
  if (a.over.length) hard.push(`horizontal overflow x${a.over.length}: ${a.over.slice(0, 3).join(" | ")}`);
  if (a.canvasBad.length) hard.push(`canvas sizing: ${a.canvasBad.join(" | ")}`);
  if (a.small.length) hard.push(`text under 16px x${a.small.length}: ${a.small.slice(0, 4).join(" | ")}`);
  if (a.blacks.length) hard.push(`black ground: ${a.blacks.join(" | ")}`);
  if (a.h1Count !== 1) hard.push(`h1Count=${a.h1Count}`);
  if (!a.skipFirst) hard.push("skip link not first focusable");
  if (a.noAlt) hard.push(`images missing alt: ${a.noAlt}`);
  if (a.broken) hard.push(`broken images: ${a.broken}`);
  if (a.noDims) hard.push(`images without width/height: ${a.noDims}`);
  if (a.signal) hard.push(`visible "signal" occurrences: ${a.signal}`);
  if (failed.length) hard.push(`requests failed: ${failed.length} (${failed[0]})`);
  if (realErr.length) hard.push(`console errors: ${realErr.length} :: ${realErr[0]}`);
  // every mechanic must have fired AND landed crisp AND cleaned up its canvas
  for (const r of res.pending) {
    if (!r.fired) hard.push(`${r.kind} assembly never fired`);
    else if (r.opacity !== "1") hard.push(`${r.kind} did not resolve crisp (opacity=${r.opacity})`);
    else if (r.canvasLeft) hard.push(`${r.kind} left ${r.canvasLeft} canvas behind`);
  }

  console.log(`\n=== ${vp.name} (${a.innerW}px) ===`);
  console.log(`  transferred   ${(bytes / 1024).toFixed(0)} KB   docH ${a.docH}   scrollW ${a.scrollW}`);
  console.log(`  resolve       ${res.pending.map((r) => `${r.kind}:${r.fired ? "fired" : "NO"}/op${r.opacity}/cv${r.canvasLeft}`).join("  ")}`);
  console.log(`  shot          ${path.relative(process.cwd(), shot)}`);
  if (hard.length) {
    failures += hard.length;
    hard.forEach((h) => console.log(`  FAIL: ${h}`));
  } else console.log("  PASS");

  await ctx.close();
}

await browser.close();
console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} HARD FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
