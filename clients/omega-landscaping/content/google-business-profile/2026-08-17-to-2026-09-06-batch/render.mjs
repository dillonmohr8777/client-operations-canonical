import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";
import path from "node:path";
import { posts } from "./data.mjs";

const root = path.resolve(import.meta.dirname);
const template = path.join(root, "template.html");
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
const results = [];

for (const post of posts) {
  const output = `omega-gbp-${post.date}-${post.slug}.png`;
  await page.goto(pathToFileURL(template).href, { waitUntil: "networkidle" });
  await page.evaluate((item) => {
    const rootEl = document.querySelector(".post");
    rootEl.classList.add(item.layout);
    document.querySelector(".photo").src = `assets/${item.image}`;
    document.querySelector(".eyebrow").textContent = item.eyebrow;
    document.querySelector(".headline").textContent = item.headline;
    document.querySelector(".subhead").textContent = item.subhead;
    document.querySelector(".proof").textContent = item.proof;
    document.querySelector(".index").textContent = String(item.id).padStart(2, "0");
  }, post);
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
  const overflow = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    bodyWidth: document.body.scrollWidth,
    bodyHeight: document.body.scrollHeight
  }));
  await page.screenshot({ path: path.join(root, output), type: "png" });
  results.push({ id: post.id, output, overflow });
}

const cards = posts.map((post) => {
  const output = `omega-gbp-${post.date}-${post.slug}.png`;
  return `<figure><img src="${output}" alt="Post ${post.id}: ${post.topic}"><figcaption>${String(post.id).padStart(2, "0")} · ${post.date} · ${post.topic}</figcaption></figure>`;
}).join("");
const review = `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#071523;color:#f4edcf;font:16px Arial}h1{margin:0 0 24px;font:700 36px Georgia}main{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}figure{margin:0;background:#102a43;padding:10px;border:1px solid #28558b}img{display:block;width:100%;height:auto}figcaption{padding:10px 4px 3px;line-height:1.25}</style></head><body><h1>Omega GBP · 12 Post Review</h1><main>${cards}</main></body></html>`;
await fs.writeFile(path.join(root, "review.html"), review, "utf8");
const reviewPage = await browser.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 1 });
await reviewPage.goto(pathToFileURL(path.join(root, "review.html")).href, { waitUntil: "networkidle" });
await reviewPage.screenshot({ path: path.join(root, "contact-sheet.png"), fullPage: true, type: "png" });
await browser.close();

await fs.writeFile(path.join(root, "render-results.json"), JSON.stringify({ renderedAt: new Date().toISOString(), posts: results }, null, 2), "utf8");
console.log(JSON.stringify({ rendered: results.length, contactSheet: "contact-sheet.png", results }, null, 2));
