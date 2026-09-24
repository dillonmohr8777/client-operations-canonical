import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "screenshots");

const targets = [
  { id: "jack-01-front-door", group: "jack-builds", name: "Jack May — Front Door / May Team Times", url: "https://jack-may-front-door-ky.netlify.app" },
  { id: "jack-02-louisville-ledger", group: "jack-builds", name: "Jack May — Louisville Ledger / A Clearer Way", url: "https://jack-may-louisville-ledger-ky.netlify.app" },
  { id: "jack-03-neighborhood-signal", group: "jack-builds", name: "Jack May — Neighborhood Signal / One Clear Move", url: "https://jack-may-neighborhood-signal-ky.netlify.app" },
  { id: "jack-current-may-team", group: "jack-current", name: "May Team Realtors official home", url: "https://www.mayteamrealtors.com/" },
  { id: "jack-current-profile", group: "jack-current", name: "Jack May official profile", url: "https://www.mayteamrealtors.com/jackmay" },
  { id: "tpl-01-coughtry", group: "templates", name: "Coughtry Enterprises (Lexington KY)", url: "https://coughtryenterprises.com/" },
  { id: "tpl-02-ginger-martin", group: "templates", name: "Ginger Martin + Co", url: "https://gingermartin.com/" },
  { id: "tpl-03-jade-mills", group: "templates", name: "Jade Mills Estates", url: "https://jademillsestates.com/" },
  { id: "tpl-04-kumara", group: "templates", name: "Kumara Wilcoxon", url: "https://kumarawilcoxon.com/" },
  { id: "tpl-05-carolwood", group: "templates", name: "Carolwood Estates", url: "https://carolwoodre.com/" },
  { id: "tpl-06-louise", group: "templates", name: "Louise Phillips Forbes", url: "https://louisephillipsforbes.com/" },
  { id: "tpl-07-scheinfeld", group: "templates", name: "Philip Scheinfeld Team", url: "https://philipscheinfeld.com/" },
  { id: "tpl-08-carlin", group: "templates", name: "Carlin Wright", url: "https://carlinwright.com/" },
  { id: "tpl-09-baruh", group: "templates", name: "Randy Baruh Team", url: "https://baruhteam.com/" },
  { id: "tpl-10-village", group: "templates", name: "Village Properties", url: "https://www.villageproperties.com/" },
  { id: "tpl-11-fridman", group: "templates", name: "The Fridman Group", url: "https://thefridmangroup.com/" },
  { id: "tpl-12-kelly", group: "templates", name: "Kelly Weisfield", url: "https://kellyweisfield.com/" },
  { id: "tpl-13-rochelle", group: "templates", name: "Rochelle Maize", url: "https://rochelleatlasmaize.com/" },
  { id: "tpl-14-kencel", group: "templates", name: "Robin Kencel Team", url: "https://robinkencel.com/" },
  { id: "tpl-15-saslove", group: "templates", name: "Saslove & Warwick", url: "https://sasloveandwarwick.com/" },
  { id: "tpl-16-buse", group: "templates", name: "Buse Agency", url: "https://buse.agency/" },
  { id: "tpl-17-kink", group: "templates", name: "Kink Winder Real Estate", url: "https://kinkwinder.com/" },
  { id: "tpl-18-hassell", group: "templates", name: "The Hassell Team", url: "https://hassellteam.com/" },
  { id: "tpl-19-blushwood", group: "templates", name: "Blushwood Realty", url: "https://blushwoodrealty.com/" },
  { id: "tpl-20-barry", group: "templates", name: "Barry Estates", url: "https://barryestates.com/" },
  { id: "tpl-21-david-hatef", group: "templates", name: "David Hatef", url: "https://davidhatef.com/" },
  { id: "tpl-22-breitenbach", group: "templates", name: "Breitenbach Advisory", url: "https://breitenbachadvisory.com/" }
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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
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
    await page.waitForTimeout(2800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: filePath,
      type: "jpeg",
      quality: 72,
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
await writeFile(path.join(__dirname, "capture-results.json"), JSON.stringify(results, null, 2));
console.log(`Captured ${results.filter((r) => r.ok).length}/${results.length}`);
