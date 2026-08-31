import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "screenshots", "big-homes");

const targets = [
  { id: "big-01-bespoke", name: "Bespoke Real Estate", url: "https://www.bespokerealestate.com/" },
  { id: "big-02-landvest", name: "LandVest", url: "https://landvest.com/" },
  { id: "big-03-briggs", name: "Briggs Freeman Sotheby's", url: "https://www.briggsfreeman.com/" },
  { id: "big-04-premier", name: "Premier Sotheby's", url: "https://www.premiersothebysrealty.com/" },
  { id: "big-05-dunes", name: "Dunes Properties", url: "https://dunesproperties.com/" },
  { id: "big-06-moreland", name: "Moreland Properties", url: "https://moreland.com/" },
  { id: "big-07-william-means", name: "William Means Real Estate", url: "https://charlestonrealestate.com/" },
  { id: "big-08-saunders", name: "Saunders Hamptons", url: "https://www.hamptonsrealestate.com/eng" },
  { id: "big-09-john-r-wood", name: "John R. Wood Properties", url: "https://www.johnrwood.com/" },
  { id: "big-10-michael-saunders", name: "Michael Saunders", url: "https://www.michaelsaunders.com/" },
  { id: "big-11-vanguard", name: "Vanguard Properties", url: "https://vanguardproperties.com/" },
  { id: "big-12-william-pitt", name: "William Pitt Sotheby's", url: "https://www.williampitt.com/" },
  { id: "big-13-slifer", name: "Slifer Smith & Frampton", url: "https://www.slifersmithandframpton.com/" },
  { id: "big-14-one-sothebys", name: "ONE Sotheby's", url: "https://www.onesothebysrealty.com/" },
  { id: "big-15-town-country", name: "Town & Country", url: "https://www.townandcountryrealestate.com/" },
  { id: "big-16-village", name: "Village Properties", url: "https://villagesite.com/" },
  { id: "big-17-barry", name: "Barry Estates", url: "https://www.barryestates.com/" },
  { id: "big-18-kumara", name: "Kumara Wilcoxon", url: "https://kumarawilcoxon.com/" },
  { id: "big-19-drew", name: "Drew Fenton", url: "https://drewfenton.com/" },
  { id: "big-20-wea", name: "Westside Estate Agency", url: "https://weahomes.com/" },
  { id: "big-21-jade", name: "Jade Mills Estates", url: "https://jademillsestates.com/" },
  { id: "big-22-cortazzo", name: "Chris Cortazzo", url: "https://chriscortazzo.com/" },
  { id: "big-23-joyce", name: "Joyce Rey", url: "https://joycerey.com/" },
  { id: "big-24-buse", name: "Buse Agency", url: "https://buse.agency/" },
  { id: "big-25-gingermartin", name: "Ginger Martin + Co", url: "https://gingermartin.com/" },
  { id: "big-26-wfp", name: "Washington Fine Properties", url: "https://www.wfp.com/" },
  { id: "big-27-allie-beth", name: "Allie Beth Allman", url: "https://www.alliebeth.com/" }
];

const cookieButtons = [
  "button:has-text('Accept all')",
  "button:has-text('Accept All')",
  "button:has-text('ACCEPT ALL')",
  "button:has-text('Accept')",
  "button:has-text('I Agree')",
  "button:has-text('Agree')",
  "button:has-text('Got it')",
  "button:has-text('Allow all')"
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-dev-shm-usage"]
});

const results = [];

for (const target of targets) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    locale: "en-US"
  });
  const page = await context.newPage();
  const file = `${target.id}.jpg`;
  const filePath = path.join(outDir, file);
  const started = Date.now();
  try {
    const response = await page.goto(target.url, {
      waitUntil: "domcontentloaded",
      timeout: 45000
    });
    await page.waitForTimeout(2400);
    for (const selector of cookieButtons) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 400 })) {
          await btn.click({ timeout: 1500 });
          await page.waitForTimeout(500);
          break;
        }
      } catch {
        // keep looking
      }
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);
    await page.screenshot({
      path: filePath,
      type: "jpeg",
      quality: 78,
      fullPage: false
    });
    results.push({
      ...target,
      ok: true,
      status: response?.status() ?? null,
      finalUrl: page.url(),
      title: await page.title(),
      file,
      ms: Date.now() - started
    });
    console.log(`OK ${target.id} ${response?.status()} ${page.url()}`);
  } catch (error) {
    results.push({
      ...target,
      ok: false,
      error: String(error?.message || error),
      file: null,
      ms: Date.now() - started
    });
    console.error(`FAIL ${target.id}: ${error?.message || error}`);
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(path.join(__dirname, "capture-big-homes-results.json"), JSON.stringify(results, null, 2));
console.log(`Captured ${results.filter((r) => r.ok).length}/${results.length}`);
