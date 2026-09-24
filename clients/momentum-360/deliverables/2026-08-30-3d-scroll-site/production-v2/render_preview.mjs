import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = path.join(ROOT, "site-v2");
const OUT = path.join(ROOT, "production-v2", "renders");
const port = Number(process.env.M360_PREVIEW_PORT || 63821);

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
};

const safePath = (urlPath) => {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded.replace(/^\/+/, "");
  const absolute = path.resolve(SITE, relative);
  return absolute.startsWith(SITE) ? absolute : null;
};

const server = http.createServer((request, response) => {
  const requested = request.url === "/" ? "/index.html" : request.url;
  const filePath = safePath(requested);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
  fs.createReadStream(filePath).pipe(response);
});

function ensureOutput() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
}

async function main() {
  ensureOutput();
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/index.html?render=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__M360_V2_READY__ === true, null, { timeout: 20000 });

  const manifest = JSON.parse(fs.readFileSync(path.join(SITE, "assets", "layers", "manifest.json"), "utf8"));
  for (const shot of manifest.shots) {
    const shotDir = path.join(OUT, shot.id);
    fs.mkdirSync(shotDir, { recursive: true });
    for (let frame = 0; frame < shot.frameCount; frame += 1) {
      await page.evaluate(([shotIndex, frameIndex]) => {
        window.scrollTo(0, shotIndex * window.innerHeight);
        window.__M360_V2_SET_FRAME__(shotIndex, frameIndex);
      }, [shot.index, frame]);
      await page.waitForTimeout(80);
      await page.screenshot({ path: path.join(shotDir, `frame-${String(frame).padStart(2, "0")}.png`), animations: "disabled" });
    }
    console.log(`rendered:${shot.id}:${shot.frameCount}`);
  }

  await page.evaluate(() => window.__M360_V2_SET_FRAME__(0, 0));
  await page.screenshot({ path: path.join(OUT, "desktop-arrival-1280x720.png"), animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(OUT, "mobile-arrival-390x844.png"), fullPage: false, animations: "disabled" });

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log(`preview:complete:${OUT}`);
}

main().catch(async (error) => {
  console.error(error.stack || error);
  try { server.close(); } catch {}
  process.exitCode = 1;
});
