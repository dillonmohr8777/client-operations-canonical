import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const root = path.dirname(fileURLToPath(import.meta.url));
const reportsRoot = path.join(root, "reports");
const qaRoot = path.join(root, "qa-renders-current");
fs.mkdirSync(qaRoot, { recursive:true });

const ids = fs.readdirSync(reportsRoot).filter(id => fs.existsSync(path.join(reportsRoot, id, "index.html")));
const browser = await chromium.launch({ headless:true });
const results = [];
try {
  for (const id of ids) {
    const html = path.join(reportsRoot, id, "index.html");
    const pdf = path.join(reportsRoot, id, `${id}-weekly-report-2026-08-17-to-2026-08-23.pdf`);
    const canonicalPdf = path.join(reportsRoot, id, "report.pdf");
    const page = await browser.newPage({ viewport:{ width:1200, height:900 }, deviceScaleFactor:1 });
    const errors = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`file:///${html.replaceAll("\\", "/")}`, { waitUntil:"networkidle" });
    await page.emulateMedia({ media:"print" });
    await page.pdf({ path:pdf, format:"Letter", printBackground:true, preferCSSPageSize:true, margin:{ top:0, right:0, bottom:0, left:0 } });
    fs.copyFileSync(pdf, canonicalPdf);
    await page.screenshot({ path:path.join(qaRoot, `${id}-full-page.png`), fullPage:true });
    const pageCount = await page.locator(".page").count();
    await page.close();
    results.push({ id, pdf, pageCount, errors });
  }
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(root, "qa-current.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(JSON.stringify(results, null, 2));
