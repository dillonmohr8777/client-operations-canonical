// Capture the title cards as production assets, no model involved.
//
//   node capture_cards.mjs            -> cards/ (16:9 and 9:16)
//
// For each card N and each orientation:
//   card-N.png          opaque still, the complete final frame (intro/outro beat, reduced-motion frame)
//   card-N.alpha.png    transparent background, for compositing the label over a plate
//   card-N.webm         the animated entry, recorded at 1x, for intro/outro beats
//
// Uses the Playwright that ships with the Codex runtime; nothing new installed.
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PW = "C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright";
const { chromium } = require(PW);

const CARDS = 6;
const OUT = path.join(HERE, "cards");
fs.mkdirSync(OUT, { recursive: true });

// Serve title-cards.html over http so the Google Fonts links resolve the same
// way they do in production; file:// also works but a static server is what
// the QA probes used.
const server = spawnSync("python", ["-c", "print('ok')"]); // sanity: python present for http.server
if (server.status !== 0) throw new Error("python not available for the static server");
const port = 8794;
const { spawn } = await import("node:child_process");
const srv = spawn("python", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: HERE, stdio: "ignore" });
await new Promise(r => setTimeout(r, 1200));

const browser = await chromium.launch();
try {
  for (const vertical of [false, true]) {
    const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
    const tag = vertical ? "9x16" : "16x9";
    for (let n = 0; n < CARDS; n++) {
      const q = `card=${n}${vertical ? "&v=1" : ""}`;
      // 1. stills: complete final state (still=1 disables the entry animation)
      const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(`http://127.0.0.1:${port}/title-cards.html?${q}&still=1`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(OUT, `card-${n}.${tag}.png`), type: "png" });
      // transparent variant: strip the card and stage grounds, keep the type and mark
      await page.addStyleTag({ content: "html,body,.stage,.card{background:transparent!important}" });
      await page.screenshot({ path: path.join(OUT, `card-${n}.${tag}.alpha.png`), type: "png", omitBackground: true });
      await ctx.close();

      // 2. the animated entry, recorded
      const vctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: OUT, size: { width: W, height: H } } });
      const vpage = await vctx.newPage();
      await vpage.goto(`http://127.0.0.1:${port}/title-cards.html?${q}&still=1`, { waitUntil: "networkidle" });
      await vpage.evaluate(() => document.fonts.ready);
      await vpage.addStyleTag({ content: ".hud{display:none!important}" });
      // arm the entry animation from a clean start, then let it run and hold
      await vpage.evaluate(() => { const s = document.querySelector(".stage"); s.classList.remove("run"); void s.offsetWidth; s.classList.add("run"); });
      await vpage.waitForTimeout(2600);
      const video = vpage.video();
      await vctx.close();
      const tmp = await video.path();
      fs.renameSync(tmp, path.join(OUT, `card-${n}.${tag}.webm`));
      console.log(`card ${n} ${tag}: png, alpha.png, webm`);
    }
  }
} finally {
  await browser.close();
  srv.kill();
}

// provenance: the cards derive from offers.json + tokens; record the inputs
const crypto = await import("node:crypto");
const sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const receipt = {
  generatedAt: new Date().toISOString(),
  inputs: {
    "title-cards.html": sha(path.join(HERE, "title-cards.html")),
    "offers.json": sha(path.join(HERE, "..", "offers.json")),
    "assets/momentum-logo-white.png": sha(path.join(HERE, "assets", "momentum-logo-white.png")),
  },
  outputs: fs.readdirSync(OUT).filter(f => /^card-\d/.test(f)).sort(),
  note: "Cards are rendered from the design tokens and offers.json. No model was used. Every price on a card carries the Proposed marking.",
};
fs.writeFileSync(path.join(OUT, "receipt.json"), JSON.stringify(receipt, null, 2));
console.log(`wrote ${receipt.outputs.length} files + receipt.json to ${OUT}`);
