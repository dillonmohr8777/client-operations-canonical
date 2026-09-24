import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "file:///C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { reports } from "./reports-data.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

try {
  for (const report of reports) {
    const reportDir = path.join(root, "reports", report.id);
    const htmlPath = path.join(reportDir, "index.html");
    const pdfPath = path.join(reportDir, `${report.id}-august-2026-monthly-report.pdf`);
    const qaDir = path.join(reportDir, "qa-renders");
    fs.mkdirSync(qaDir, { recursive: true });

    const page = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 1.35 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true, tagged: true });

    const pages = page.locator(".page");
    const pageCount = await pages.count();
    for (let index = 0; index < pageCount; index += 1) {
      await pages.nth(index).screenshot({ path: path.join(qaDir, `page-${index + 1}.png`) });
    }

    const links = await page.locator("a").evaluateAll((anchors) => anchors.map((anchor) => ({ text: anchor.textContent?.trim() ?? "", href: anchor.getAttribute("href") ?? "" })));
    const nonPercentageLinks = links.filter((link) => !link.text.includes("%"));

    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ media: "screen" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.close();

    results.push({
      clientId: report.id,
      htmlPath,
      pdfPath,
      pageCount,
      mobileOverflowPx: overflow,
      links,
      nonPercentageLinks,
      pdfSha256: null,
    });
  }
}
finally {
  await browser.close();
}

fs.writeFileSync(path.join(root, "render-results.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(JSON.stringify(results, null, 2));
