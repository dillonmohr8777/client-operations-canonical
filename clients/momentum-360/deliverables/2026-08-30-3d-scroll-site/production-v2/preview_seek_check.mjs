import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QA = path.join(ROOT, "qa-v2");
const base = process.argv[2] || "http://127.0.0.1:62791/";
const url = new URL("index.html?seek-check=blob", base).href;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => window.__M360_V2_READY__ === true, null, { timeout: 30000 });
const checks = [];
for (const ratio of [0, 0.25, 0.5, 0.75, 1]) {
  await page.evaluate((progress) => {
    document.documentElement.style.scrollBehavior = "auto";
    const reel = document.querySelector(".reel");
    window.scrollTo(0, progress * Math.max(1, reel.offsetHeight - innerHeight));
  }, ratio);
  await page.waitForTimeout(220);
  checks.push(await page.evaluate((progress) => ({
    requestedProgress: progress,
    stateProgress: window.__M360_V2_STATE__?.scrollProgress,
    currentTime: document.querySelector("#film-video")?.currentTime,
    readyState: document.querySelector("#film-video")?.readyState,
    transport: window.__M360_V2_STATE__?.mediaReadiness?.transport,
    sourceIsBlob: document.querySelector("#film-video")?.src?.startsWith("blob:"),
  }), ratio));
}
const result = { url, checks, errors };
fs.mkdirSync(QA, { recursive: true });
fs.writeFileSync(path.join(QA, "preview-seek-check.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await browser.close();
