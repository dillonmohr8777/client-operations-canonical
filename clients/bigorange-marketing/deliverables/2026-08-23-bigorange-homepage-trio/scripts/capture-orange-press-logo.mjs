import { createServer } from "node:http";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidence = join(root, "evidence", "orange-press-atomic-logo");
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
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "no-preference"
});
const page = await context.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

try {
  const response = await page.goto(`http://127.0.0.1:${port}/orange-press/`, { waitUntil: "networkidle" });
  if (response?.status() !== 200) throw new Error(`Unexpected HTTP status ${response?.status()}.`);
  await page.evaluate(async () => { await document.fonts.ready; });
  const stage = page.locator(".logo-stage");
  await stage.scrollIntoViewIfNeeded();
  const frames = [420, 900, 1660, 2480, 4020];
  let elapsed = 0;
  for (let index = 0; index < frames.length; index += 1) {
    const wait = frames[index] - elapsed;
    if (wait > 0) await page.waitForTimeout(wait);
    elapsed = frames[index];
    await stage.screenshot({ path: join(evidence, `atomic-logo-${String(index + 1).padStart(2, "0")}.png`) });
  }
  if (errors.length) throw new Error(`Console errors: ${errors.join(" | ")}`);
  console.log(JSON.stringify({ evidence, frames, consoleErrors: errors }, null, 2));
} finally {
  await context.close();
  await browser.close();
  server.close();
}
