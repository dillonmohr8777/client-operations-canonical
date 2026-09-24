import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const articleRoot = join(projectRoot, "wordpress", "branded-articles");
const evidenceRoot = join(projectRoot, "evidence", "branded-articles-2026-08-31");
mkdirSync(evidenceRoot, { recursive: true });

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

const server = createServer((request, response) => {
  const raw = decodeURIComponent((request.url || "/").split("?")[0]);
  const target = resolve(articleRoot, `.${normalize(raw)}`);
  if (!target.startsWith(articleRoot)) return response.writeHead(403).end("Forbidden");
  try {
    response.writeHead(200, { "Content-Type": mimeTypes[extname(target)] || "application/octet-stream" });
    response.end(readFileSync(target));
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const port = server.address().port;
const browser = await chromium.launch({ headless: true });
const articles = [
  { name: "website-must-include", file: "supporting-article-01-preview.html", expectedSections: 12 },
  { name: "five-builder-articles", file: "supporting-article-02-preview.html", expectedSections: 9 }
];
const views = [
  { name: "desktop", width: 1440, height: 1000, fullPage: true },
  { name: "mobile", width: 390, height: 844, fullPage: true },
  { name: "narrow", width: 320, height: 760, fullPage: false }
];
const report = { checkedAt: new Date().toISOString(), articles: {}, failures: [] };

try {
  for (const article of articles) {
    report.articles[article.name] = {};
    for (const view of views) {
      const context = await browser.newContext({
        viewport: { width: view.width, height: view.height },
        reducedMotion: "reduce",
        colorScheme: "light"
      });
      const page = await context.newPage();
      const consoleErrors = [];
      const failedRequests = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("requestfailed", (request) => failedRequests.push(request.url()));
      const response = await page.goto(`http://127.0.0.1:${port}/${article.file}`, { waitUntil: "networkidle" });
      await page.evaluate(async () => document.fonts?.ready);

      const checks = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        const headings = [...document.querySelectorAll("h1,h2,h3")].map((heading) => ({
          level: Number(heading.tagName.slice(1)),
          text: heading.textContent.trim()
        }));
        const skippedHeadings = headings.filter((heading, index) => index > 0 && heading.level > headings[index - 1].level + 1);
        const images = [...document.images];
        const overflowElements = [...document.body.querySelectorAll("*")]
          .map((element) => ({
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className : "",
            text: element.textContent.trim().slice(0, 80),
            left: element.getBoundingClientRect().left,
            right: element.getBoundingClientRect().right,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth
          }))
          .filter((element) => element.left < -1 || element.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 1)
          .slice(0, 12);
        return {
          fontsLoaded: document.fonts?.status || "unsupported",
          h1Count: document.querySelectorAll("h1").length,
          h2Count: document.querySelectorAll(".bom-article-body h2").length,
          indexLinkCount: document.querySelectorAll(".bom-article-index a").length,
          ctaCount: document.querySelectorAll(".bom-article-close a").length,
          imageCount: images.length,
          unloadedImages: images.filter((image) => !image.complete || image.naturalWidth < 1).map((image) => image.src),
          missingImageAlt: images.filter((image) => !image.alt.trim()).map((image) => image.src),
          duplicateIds,
          skippedHeadings,
          overflowElements,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          articleWidth: document.querySelector("article")?.getBoundingClientRect().width || 0,
          bodyBackground: getComputedStyle(document.body).backgroundColor,
          firstHeading: headings[0]?.text || ""
        };
      });

      if (view.name !== "narrow") {
        await page.locator(".bom-article-hero").screenshot({ path: join(evidenceRoot, `${article.name}-${view.name}-hero.png`) });
      }
      if (view.fullPage) {
        await page.screenshot({ path: join(evidenceRoot, `${article.name}-${view.name}-full.png`), fullPage: true });
      }

      const result = { status: response?.status(), consoleErrors, failedRequests, ...checks };
      report.articles[article.name][view.name] = result;
      const expect = (condition, message) => {
        if (!condition) report.failures.push(`${article.name} ${view.name}: ${message}`);
      };
      expect(result.status === 200, "page did not return HTTP 200");
      expect(result.consoleErrors.length === 0, `console errors: ${result.consoleErrors.join(" | ")}`);
      expect(result.failedRequests.length === 0, `failed requests: ${result.failedRequests.join(" | ")}`);
      expect(result.fontsLoaded === "loaded", "fonts did not finish loading");
      expect(result.h1Count === 1, `expected one h1, found ${result.h1Count}`);
      expect(result.h2Count === article.expectedSections, `expected ${article.expectedSections} article sections, found ${result.h2Count}`);
      expect(result.indexLinkCount === article.expectedSections, "table of contents does not match article sections");
      expect(result.ctaCount === 1, "expected one closing action");
      expect(result.unloadedImages.length === 0, "one or more images did not load");
      expect(result.missingImageAlt.length === 0, "one or more images has empty alt text");
      expect(result.duplicateIds.length === 0, `duplicate IDs: ${result.duplicateIds.join(", ")}`);
      expect(result.skippedHeadings.length === 0, "heading hierarchy skips a level");
      expect(result.overflow <= 1, `${result.overflow}px horizontal overflow`);
      expect(Math.abs(result.articleWidth - view.width) <= 1, `article width ${result.articleWidth}px does not match viewport ${view.width}px`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

const reportPath = join(evidenceRoot, "qa.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2));
if (report.failures.length) throw new Error(JSON.stringify(report, null, 2));
console.log(JSON.stringify({ reportPath, evidenceRoot, failures: report.failures }, null, 2));
