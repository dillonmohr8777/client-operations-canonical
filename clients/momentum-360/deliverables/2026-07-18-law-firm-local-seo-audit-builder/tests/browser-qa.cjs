const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "verification");
const baseUrl = (process.env.QA_BASE_URL || "http://localhost:4179").replace(/\/$/, "");
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(output, "audit-empty-desktop.png"), fullPage: true });

  await page.locator("#firm").fill("Frederick Legal Group");
  await page.locator("#city").fill("Philadelphia");
  await page.locator("#practice").selectOption({ label: "Personal Injury" });
  await page.locator("#website").fill("https://example.com");
  await page.locator("#profile-url").fill("https://maps.google.com/");
  await page.locator("#screenshot").setInputFiles(path.join(output, "audit-empty-desktop.png"));
  await page.locator("#run-audit").click();
  await page.locator('#status-panel[data-state="success"]').waitFor({ timeout: 20000 });

  const score = await page.locator("#score-value").innerText();
  const findingCount = await page.locator("#finding-grid article").count();
  const screenshotVisible = await page.locator("#screenshot-preview").isVisible();
  await page.screenshot({ path: path.join(output, "audit-success-desktop.png"), fullPage: true });
  await page.locator("#clear-screenshot").click();
  await page.pdf({
    path: path.join(output, "mac-law-firm-audit-sample.pdf"),
    format: "Letter",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });

  await page.goto(`${baseUrl}/?mode=ranker`, { waitUntil: "networkidle" });
  const rankerTitle = await page.locator("#builder-title").innerText();
  await page.screenshot({ path: path.join(output, "ranker-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.screenshot({ path: path.join(output, "audit-mobile.png"), fullPage: true });

  const result = {
    status: consoleErrors.length || pageErrors.length ? "failed" : "passed",
    baseUrl,
    auditScore: Number(score),
    findingCount,
    uploadedScreenshotVisible: screenshotVisible,
    rankerTitle,
    mobileHorizontalOverflow: mobileOverflow,
    consoleErrors,
    pageErrors,
  };
  fs.writeFileSync(path.join(output, "browser-qa.json"), `${JSON.stringify(result, null, 2)}\n`);
  await browser.close();
  console.log(JSON.stringify(result));
  if (result.status !== "passed" || mobileOverflow || !screenshotVisible || findingCount !== 4) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
