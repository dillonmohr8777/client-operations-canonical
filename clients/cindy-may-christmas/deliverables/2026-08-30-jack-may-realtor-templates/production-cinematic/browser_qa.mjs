import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "cinematic-site");
const QA = path.join(ROOT, "qa-cinematic");
const port = Number(process.env.JACK_MAY_QA_PORT || 63824);
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0]);
  const absolute = path.resolve(SITE, decoded.replace(/^\/+/, "") || "index.html");
  return absolute.startsWith(SITE) ? absolute : null;
}

function serve(request, response) {
  const filePath = safePath(request.url);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404); response.end("Not found"); return;
  }
  const stat = fs.statSync(filePath);
  const type = mime[path.extname(filePath).toLowerCase()] || "application/octet-stream";
  response.setHeader("cache-control", "no-store");
  response.setHeader("accept-ranges", "bytes");
  if (request.method === "HEAD") { response.writeHead(200, { "content-type": type, "content-length": stat.size }); response.end(); return; }
  const range = request.headers.range;
  if (range?.startsWith("bytes=")) {
    const [startText, endText] = range.slice(6).split("-");
    const start = Math.max(0, Number.parseInt(startText, 10) || 0);
    const end = Math.min(stat.size - 1, endText ? Number.parseInt(endText, 10) : stat.size - 1);
    if (start <= end && start < stat.size) {
      response.writeHead(206, { "content-type": type, "content-length": end - start + 1, "content-range": `bytes ${start}-${end}/${stat.size}` });
      fs.createReadStream(filePath, { start, end }).pipe(response); return;
    }
  }
  response.writeHead(200, { "content-type": type, "content-length": stat.size });
  fs.createReadStream(filePath).pipe(response);
}

async function clickAndCapture(page, selector) {
  const href = await page.locator(selector).getAttribute("href");
  await page.evaluate((targetSelector) => {
    window.__M360_V2_CLICK_TRACE__ = null;
    const handler = (event) => {
      const target = event.target;
      const link = target instanceof Element ? target.closest(targetSelector) : null;
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      window.__M360_V2_CLICK_TRACE__ = { selector: targetSelector, href: link.href };
      document.removeEventListener("click", handler, true);
    };
    document.addEventListener("click", handler, true);
  }, selector);
  await page.locator(selector).click({ noWaitAfter: true, timeout: 10000 });
  await page.waitForTimeout(80);
  const trace = await page.evaluate(() => window.__M360_V2_CLICK_TRACE__);
  return {
    selector,
    href,
    clickActivated: Boolean(trace?.href),
    interceptedHref: trace?.href || null,
  };
}

async function inspect(page, viewport, screenshotName) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror:${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console:${message.text()}`); });
  await page.setViewportSize(viewport);
  await page.goto(`http://127.0.0.1:${port}/index.html?qa=${viewport[0]}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__M360_V2_READY__ === true, null, { timeout: 30000 });
  await page.waitForTimeout(120);
  const motionStart = await page.evaluate(() => document.querySelector("#film-video")?.currentTime || 0);
  await page.waitForTimeout(700);
  const motionEnd = await page.evaluate(() => document.querySelector("#film-video")?.currentTime || 0);
  const initial = await page.evaluate(() => {
    const video = document.querySelector("#film-video");
    const loader = document.querySelector("[data-loader]");
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, duration: video?.duration, readyState: video?.readyState, loaderExiting: loader?.classList.contains("is-exiting"), state: window.__M360_V2_STATE__ };
  });
  await page.screenshot({ path: path.join(QA, screenshotName), fullPage: false, animations: "disabled" });
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.querySelector(".reel").offsetHeight - innerHeight); });
  await page.waitForTimeout(140);
  const atEnd = await page.evaluate(() => ({ state: window.__M360_V2_STATE__, currentTime: document.querySelector("#film-video")?.currentTime, releaseTop: document.querySelector("#release")?.getBoundingClientRect().top }));
  await page.evaluate(() => document.querySelector("#release")?.scrollIntoView({ block: "start", behavior: "auto" }));
  await page.waitForTimeout(100);
  const ctaBox = await page.locator("#release .button--primary").boundingBox();
  await page.screenshot({ path: path.join(QA, screenshotName.replace(".png", "-final.png")), fullPage: false, animations: "disabled" });
  const progressChecks = [];
  for (const progress of [0.25, 0.5, 0.75]) {
    await page.evaluate((ratio) => {
      const reel = document.querySelector(".reel");
      window.scrollTo(0, ratio * Math.max(1, reel.offsetHeight - innerHeight));
    }, progress);
    await page.waitForTimeout(160);
    progressChecks.push(await page.evaluate(() => ({
      stateProgress: window.__M360_V2_STATE__?.scrollProgress,
      currentTime: document.querySelector("#film-video")?.currentTime,
      readyState: document.querySelector("#film-video")?.readyState,
    })));
  }
  return { viewport, initial, openingMotion: { start: motionStart, end: motionEnd, advanced: motionEnd > motionStart + 0.2 }, atEnd, progressChecks, ctaBox, errors };
}

async function main() {
  fs.mkdirSync(QA, { recursive: true });
  const server = http.createServer(serve);
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  const required = ["/index.html", "/styles.css", "/script.js", "/assets/media/momentum-higgsfield-walkthrough.mp4", "/assets/media/momentum-higgsfield-walkthrough-m.mp4", "/assets/media/poster.jpg", "/assets/jack/may-team-logo.png", "/assets/jack/jack-may.png", "/assets/fonts/Manrope-Variable.woff2", "/assets/fonts/Unbounded-Variable.woff2"];
  const result = { server: `http://127.0.0.1:${port}/`, http: {}, desktop: null, mobile: null, reducedMotion: null };
  try {
    for (const asset of required) {
      const status = await new Promise((resolve, reject) => {
        const request = http.request(`http://127.0.0.1:${port}${asset}`, { method: "HEAD" }, (response) => { response.resume(); resolve(response.statusCode); });
        request.on("error", reject); request.end();
      });
      result.http[asset] = status;
    }
    const desktop = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    result.ctaHrefs = await (async () => {
      await desktop.goto(`http://127.0.0.1:${port}/index.html?qa=hrefs`, { waitUntil: "domcontentloaded" });
      return desktop.evaluate(() => ({
        listings: document.querySelector("#release .button--primary")?.href,
        contact: document.querySelector("#release .button--text")?.href,
        phone: document.querySelector(".film-beat--final .button--text")?.href,
      }));
    })();
    const expectedCtaHrefs = {
      listings: "https://www.mayteamrealtors.com/Listings/Search/1",
      contact: "https://www.mayteamrealtors.com/contact",
      phone: "tel:+15028553100",
    };
    if (JSON.stringify(result.ctaHrefs) !== JSON.stringify(expectedCtaHrefs)) throw new Error(`CTA href mismatch: ${JSON.stringify(result.ctaHrefs)}`);
    result.ctaClicks = {};
    for (const [key, selector] of Object.entries({
      phone: ".film-beat--final .button--text",
      listings: "#release .button--primary",
      contact: "#release .button--text",
    })) {
      result.ctaClicks[key] = await clickAndCapture(desktop, selector);
    }
    if (Object.values(result.ctaClicks).some((item) => !item.clickActivated || item.interceptedHref !== item.href)) {
      throw new Error(`CTA click interception failed: ${JSON.stringify(result.ctaClicks)}`);
    }
    result.desktop = await inspect(desktop, { width: 1280, height: 720 }, "site-desktop-1280x720.png");
    await desktop.close();
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    result.mobile = await inspect(mobile, { width: 390, height: 844 }, "site-mobile-390x844.png");
    await mobile.close();
    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await reduced.goto(`http://127.0.0.1:${port}/index.html?qa=reduced`, { waitUntil: "domcontentloaded" });
    await reduced.waitForFunction(() => window.__M360_V2_READY__ === true, null, { timeout: 30000 });
    await reduced.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.querySelector(".reel").offsetHeight - innerHeight); });
    await reduced.waitForTimeout(100);
    result.reducedMotion = await reduced.evaluate(() => ({ state: window.__M360_V2_STATE__, currentTime: document.querySelector("#film-video")?.currentTime }));
    await reduced.close();
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
  fs.writeFileSync(path.join(QA, "site-smoke.json"), JSON.stringify(result, null, 2));
  console.log(`qa:http:${JSON.stringify(result.http)}`);
  console.log(`qa:desktop:overflow=${result.desktop.initial.scrollWidth > 1280}:cta=${Boolean(result.desktop.ctaBox)}:errors=${result.desktop.errors.length}`);
  console.log(`qa:mobile:overflow=${result.mobile.initial.scrollWidth > 390}:cta=${Boolean(result.mobile.ctaBox)}:errors=${result.mobile.errors.length}`);
  console.log(`qa:cta-clicks:${JSON.stringify(result.ctaClicks)}`);
  console.log(`qa:reduced-motion:${JSON.stringify(result.reducedMotion)}`);
  console.log(`qa:complete:${QA}`);
}

main().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
