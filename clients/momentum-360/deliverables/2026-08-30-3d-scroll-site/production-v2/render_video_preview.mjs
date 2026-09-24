import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site-v2");
const OUT = path.join(ROOT, "production-v2", "video-renders");
const port = Number(process.env.M360_VIDEO_PORT || 63822);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};

const timeline = [
  { id: "arrival", folder: "01-aerial", label: "AERIAL ARRIVAL", start: 0.05, end: 3.2, scrollStart: 0, scrollEnd: 1 / 6 },
  { id: "pool", folder: "02-rear-pool", label: "REAR POOL", start: 3.2, end: 7.2, scrollStart: 1 / 6, scrollEnd: 2 / 6 },
  { id: "marble", folder: "03-marble-living", label: "MARBLE LIVING / KITCHEN", start: 7.2, end: 10.3, scrollStart: 2 / 6, scrollEnd: 3 / 6 },
  { id: "game", folder: "04-dark-game", label: "DARK GAME ROOM", start: 10.3, end: 14.5, scrollStart: 3 / 6, scrollEnd: 4 / 6 },
  { id: "foyer", folder: "05-foyer-stairs", label: "FOYER / RED ART / STAIRS", start: 14.5, end: 18.5, scrollStart: 4 / 6, scrollEnd: 5 / 6 },
  { id: "momentum", folder: "06-front-hero", label: "FRONT EXTERIOR HERO", start: 18.5, end: 20.18, scrollStart: 5 / 6, scrollEnd: 1 },
];

function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0]);
  const relative = decoded.replace(/^\/+/, "") || "index.html";
  const absolute = path.resolve(SITE, relative);
  return absolute.startsWith(SITE) ? absolute : null;
}

function serve(request, response) {
  const filePath = safePath(request.url);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  const stat = fs.statSync(filePath);
  const type = mime[path.extname(filePath).toLowerCase()] || "application/octet-stream";
  response.setHeader("cache-control", "no-store");
  response.setHeader("accept-ranges", "bytes");
  if (request.method === "HEAD") {
    response.writeHead(200, { "content-type": type, "content-length": stat.size });
    response.end();
    return;
  }
  const range = request.headers.range;
  if (range && range.startsWith("bytes=")) {
    const [startText, endText] = range.slice(6).split("-");
    const start = Math.max(0, Number.parseInt(startText, 10) || 0);
    const end = Math.min(stat.size - 1, endText ? Number.parseInt(endText, 10) : stat.size - 1);
    if (start <= end && start < stat.size) {
      response.writeHead(206, {
        "content-type": type,
        "content-length": end - start + 1,
        "content-range": `bytes ${start}-${end}/${stat.size}`,
      });
      fs.createReadStream(filePath, { start, end }).pipe(response);
      return;
    }
  }
  response.writeHead(200, { "content-type": type, "content-length": stat.size });
  fs.createReadStream(filePath).pipe(response);
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const server = http.createServer(serve);
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${port}/index.html?render=video`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__M360_V2_READY__ === true, null, { timeout: 30000 });
    const media = await page.evaluate(() => ({ duration: document.querySelector("#film-video")?.duration, readyState: document.querySelector("#film-video")?.readyState }));
    fs.writeFileSync(path.join(OUT, "render-metadata.json"), JSON.stringify({ source: "site-v2/assets/media/momentum-higgsfield-walkthrough.mp4", viewport: [1280, 720], framesPerShot: 8, media, timeline }, null, 2));

    const assertions = [];
    for (const [shotIndex, shot] of timeline.entries()) {
      const shotDir = path.join(OUT, shot.folder);
      fs.mkdirSync(shotDir, { recursive: true });
      for (let frame = 0; frame < 8; frame += 1) {
        const local = frame / 7;
        let progress = shot.scrollStart + (shot.scrollEnd - shot.scrollStart) * local;
        // Avoid pixel rounding landing on the adjacent chapter at exact cuts.
        if (frame === 0 && shotIndex > 0) progress += 0.0005;
        if (frame === 7 && shotIndex < timeline.length - 1) progress -= 0.0005;
        progress = Math.min(0.9999, Math.max(0, progress));
        const expectedTime = shot.start + (shot.end - shot.start) * local;
        await page.evaluate((ratio) => {
          document.documentElement.style.scrollBehavior = "auto";
          const reel = document.querySelector(".reel");
          window.scrollTo(0, ratio * Math.max(1, reel.offsetHeight - innerHeight));
        }, progress);
        await page.waitForTimeout(150);
        const observed = await page.evaluate(() => {
          const video = document.querySelector("#film-video");
          const active = document.querySelector(".film-beat.is-current");
          return {
            activeId: active?.id,
            label: active?.querySelector(".beat-index")?.textContent?.trim(),
            currentTime: video?.currentTime,
            stateProgress: window.__M360_V2_STATE__?.scrollProgress,
            stateShotId: window.__M360_V2_STATE__?.activeShotId,
          };
        });
        if (observed.activeId !== shot.id || observed.stateShotId !== shot.id || !observed.label?.includes(shot.label) || Math.abs(observed.currentTime - expectedTime) > 0.2) {
          throw new Error(`timeline assertion failed for ${shot.id} frame ${frame}: ${JSON.stringify({ expectedTime, observed })}`);
        }
        assertions.push({ id: shot.id, frame, progress, expectedTime, observed });
        await page.screenshot({ path: path.join(shotDir, `frame-${String(frame).padStart(2, "0")}.png`), animations: "disabled" });
      }
      console.log(`rendered:${shot.id}:8:${shot.start.toFixed(2)}-${shot.end.toFixed(2)}s:asserted`);
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(OUT, "desktop-arrival-1280x720.png"), animations: "disabled" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(OUT, "mobile-arrival-390x844.png"), animations: "disabled" });
    fs.writeFileSync(path.join(OUT, "timeline-assertions.json"), JSON.stringify({ timeline, assertions }, null, 2));
    console.log(`preview:complete:${OUT}`);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
