import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const reportDir =
  "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/kimberly-james-bridal/deliverables/2026-08-24-weekly-report-2026-08-17-to-2026-08-23";
const htmlPath = path.join(reportDir, "report.html");
const pdfPath = path.join(
  reportDir,
  "kimberly-james-bridal-weekly-report-2026-08-17-to-2026-08-23-UPDATED.pdf",
);
const screenshotPath = path.join(reportDir, "qa-full-page-with-leads.png");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(`file:///${htmlPath.replaceAll("\\", "/")}`, {
  waitUntil: "networkidle",
});
await page.pdf({
  path: pdfPath,
  format: "Letter",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await page.screenshot({ path: screenshotPath, fullPage: true });
await browser.close();

console.log(JSON.stringify({ pdfPath, screenshotPath }, null, 2));
