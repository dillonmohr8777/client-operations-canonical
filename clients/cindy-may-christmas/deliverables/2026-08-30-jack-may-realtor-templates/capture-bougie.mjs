import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "screenshots", "bougie");

const targets = [
  { id: "bougie-01-aaron-kirman", name: "Aaron Kirman", url: "https://aaronkirman.com/" },
  { id: "bougie-02-christies-socal", name: "Christie's International Real Estate Southern California", url: "https://christiesresocal.com/" },
  { id: "bougie-03-williams", name: "Williams & Williams Estates", url: "https://thewilliamsestates.com/" },
  { id: "bougie-04-beverly-hills-estates", name: "The Beverly Hills Estates", url: "https://thebeverlyhillsestates.com/" },
  { id: "bougie-05-hilton-hyland", name: "Hilton & Hyland", url: "https://hiltonhyland.com/" },
  { id: "bougie-06-wea", name: "Westside Estate Agency", url: "https://weahomes.com/" },
  { id: "bougie-07-joyce-rey", name: "Joyce Rey", url: "https://joycerey.com/" },
  { id: "bougie-08-jade-mills", name: "Jade Mills Estates", url: "https://jademillsestates.com/" },
  { id: "bougie-09-carolwood", name: "Carolwood Estates", url: "https://carolwoodre.com/" },
  { id: "bougie-10-drew-fenton", name: "Drew Fenton", url: "https://drewfenton.com/" },
  { id: "bougie-11-linda-may", name: "Linda May", url: "https://www.lindamay.com/" },
  { id: "bougie-12-cortazzo", name: "Chris Cortazzo", url: "https://chriscortazzo.com/" },
  { id: "bougie-13-oppenheim", name: "The Oppenheim Group", url: "https://ogroup.com/" },
  { id: "bougie-14-the-agency", name: "The Agency", url: "https://www.theagencyre.com/" },
  { id: "bougie-15-serhant", name: "SERHANT.", url: "https://serhant.com/" },
  { id: "bougie-16-josh-flagg", name: "Josh Flagg", url: "https://joshflagg.com/" },
  { id: "bougie-17-altman", name: "The Altman Brothers", url: "https://www.thealtmanbrothers.com/" },
  { id: "bougie-18-leslie-garfield", name: "Leslie Garfield", url: "https://lesliegarfield.com/" },
  { id: "bougie-19-john-taylor", name: "John Taylor", url: "https://www.john-taylor.com/" },
  { id: "bougie-20-beauchamp", name: "Beauchamp Estates", url: "https://www.beauchamp.com/" },
  { id: "bougie-21-barnes", name: "BARNES International", url: "https://www.barnes-international.com/" },
  { id: "bougie-22-sothebys", name: "Sotheby's International Realty", url: "https://www.sothebysrealty.com/" },
  { id: "bougie-23-knight-frank", name: "Knight Frank", url: "https://www.knightfrank.com/" },
  { id: "bougie-24-christies", name: "Christie's International Real Estate", url: "https://www.christiesrealestate.com/" },
  { id: "bougie-25-111w57", name: "111 West 57th Street", url: "https://111w57.com/" },
  { id: "bougie-26-432-park", name: "432 Park Avenue", url: "https://www.432parkavenue.com/" },
  { id: "bougie-27-one57", name: "One57", url: "https://one57.com/" },
  { id: "bougie-28-central-park-tower", name: "Central Park Tower", url: "https://centralparktower.com/" },
  { id: "bougie-29-turnberry", name: "Turnberry Ocean Club", url: "https://turnberryoceanclub.com/" },
  { id: "bougie-30-aman-ny", name: "Aman New York Residences", url: "https://www.aman.com/hotels/aman-new-york/residences" },
  { id: "bougie-31-barry", name: "Barry Estates", url: "https://www.barryestates.com/" },
  { id: "bougie-32-ginger", name: "Ginger Martin + Co", url: "https://gingermartin.com/" },
  { id: "bougie-33-louise", name: "Louise Phillips Forbes", url: "https://louisephillipsforbes.com/" },
  { id: "bougie-34-saslove", name: "Saslove & Warwick", url: "https://saslovewarwick.com/" },
  { id: "bougie-35-dahler", name: "Dahler & Co", url: "https://30arealestatefl.com/" }
];

const cookieButtons = [
  "button:has-text('Accept all')",
  "button:has-text('Accept All')",
  "button:has-text('ACCEPT ALL')",
  "button:has-text('Accept')",
  "button:has-text('I Agree')",
  "button:has-text('Agree')",
  "button:has-text('Got it')",
  "[id*='accept' i]",
  "[class*='accept' i] button"
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
    await page.waitForTimeout(2200);
    for (const selector of cookieButtons) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 400 })) {
          await btn.click({ timeout: 1500 });
          await page.waitForTimeout(600);
          break;
        }
      } catch {
        // keep looking
      }
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
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
await writeFile(path.join(__dirname, "capture-bougie-results.json"), JSON.stringify(results, null, 2));
console.log(`Captured ${results.filter((r) => r.ok).length}/${results.length}`);
