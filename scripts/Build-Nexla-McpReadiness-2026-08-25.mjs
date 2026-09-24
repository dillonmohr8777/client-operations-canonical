import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const outDir = "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/nexla/deliverables";
const pdfPath = path.join(outDir, "Nexla-MCP-Studio-Paid-Search-Readiness-2026-08-25.pdf");
const htmlPath = path.join(outDir, "Nexla-MCP-Studio-Paid-Search-Readiness-2026-08-25.html");
const qaPath = path.join(outDir, "Nexla-MCP-Studio-Paid-Search-Readiness-2026-08-25-cover.png");
const qaFullPath = path.join(outDir, "Nexla-MCP-Studio-Paid-Search-Readiness-2026-08-25-full.png");

const logoResponse = await fetch("https://nexla.com/n3x_ctx/uploads/2026/02/nexla-logo.svg");
if (!logoResponse.ok) throw new Error(`Official Nexla logo download failed: ${logoResponse.status}`);
const logoSvg = await logoResponse.text();
const logoData = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const variants = [
  ["A", "Hero form plus body form", "~808 px", "Recommended", "Best direct response path for paid Search"],
  ["B", "Video hero plus body form", "~5,495 px", "Hold", "Only form appears far down the mobile page"],
  ["C", "Centered hero plus body form", "~5,336 px", "Hold", "Only form appears far down the mobile page"],
  ["D", "Testimonial hero plus body form", "~5,835 px", "Hold", "Only form appears far down the mobile page"],
  ["General", "Product education page", "No embedded form", "Organic use", "Useful for education, weaker for paid lead capture"]
];

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@page{size:Letter;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#dfe2ea;font-family:Inter,Arial,Helvetica,sans-serif;color:#252531}.page{width:8.5in;height:11in;background:#f8f8fb;position:relative;overflow:hidden;page-break-after:always;padding:.62in .66in}.page:last-child{page-break-after:auto}.cover{background:linear-gradient(142deg,#26213f 0%,#3f337f 54%,#6254ff 100%);color:#fff}.cover:before{content:"";position:absolute;width:5.4in;height:5.4in;border:1px solid #ffffff22;border-radius:50%;right:-2.05in;top:-1.55in;box-shadow:0 0 0 .6in #ffffff08,0 0 0 1.25in #ffffff05}.logo-card{position:relative;display:inline-flex;align-items:center;background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 18px 40px #16112e33}.logo{width:2.4in;height:auto}.eyebrow{position:relative;margin-top:1.15in;color:#d7d2ff;font-weight:800;letter-spacing:.18em;text-transform:uppercase;font-size:10px}.cover h1{position:relative;font-size:46px;line-height:.98;letter-spacing:-.055em;margin:18px 0 22px;max-width:6.5in}.cover .deck{position:relative;font-size:16px;line-height:1.55;color:#f4f2ff;max-width:6.35in}.status-strip{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:38px}.status-card{border:1px solid #ffffff38;background:#ffffff12;border-radius:10px;padding:13px}.status-card small{display:block;text-transform:uppercase;letter-spacing:.1em;color:#d8d3ff;font-size:8px;font-weight:800}.status-card b{display:block;margin-top:7px;font-size:15px}.header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #25253120;padding-bottom:15px}.header img{width:1.45in}.header .meta{text-align:right;font-size:9px;line-height:1.5;color:#747282;text-transform:uppercase;letter-spacing:.09em}.section{color:#6254ff;font-size:9px;letter-spacing:.17em;text-transform:uppercase;font-weight:900;margin-top:25px}h2{font-size:30px;letter-spacing:-.045em;margin:7px 0 12px;line-height:1.08}.lede{font-size:13px;line-height:1.6;color:#555363;max-width:6.85in}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}.card{background:#fff;border:1px solid #25253118;border-radius:10px;padding:16px;box-shadow:0 7px 22px #25253108}.card.purple{border-top:4px solid #6254ff}.card.mint{border-top:4px solid #2ec4a6}.card.amber{border-top:4px solid #f0a64a}.card h3{margin:0 0 8px;font-size:14px}.card p,.card li{font-size:10.5px;line-height:1.52;color:#565463}.card ul{padding-left:18px;margin:8px 0}.metric-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}.metric{background:#fff;border:1px solid #25253118;border-radius:10px;padding:15px;min-height:1.06in}.metric .label{font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:#777585;font-weight:900}.metric .value{font-size:23px;font-weight:900;color:#252531;margin-top:9px;letter-spacing:-.04em}.metric .note{font-size:9px;color:#777585;margin-top:5px;line-height:1.3}.callout{margin-top:18px;background:#2c2743;color:#fff;border-radius:10px;padding:17px 19px;border-left:6px solid #8b80ff;font-size:11.5px;line-height:1.55}.callout strong{color:#ddd8ff}.table{width:100%;border-collapse:separate;border-spacing:0;margin-top:18px;font-size:9.5px;background:#fff;border:1px solid #25253118;border-radius:10px;overflow:hidden}.table th{background:#2c2743;color:#fff;text-align:left;padding:11px 9px;font-size:8px;text-transform:uppercase;letter-spacing:.07em}.table td{padding:10px 9px;border-top:1px solid #25253112;vertical-align:top;line-height:1.4}.pill{display:inline-block;border-radius:999px;padding:4px 7px;font-weight:900;font-size:8px}.pill.go{background:#dff8f0;color:#08725d}.pill.hold{background:#fff0dc;color:#915313}.pill.info{background:#ece9ff;color:#5549d8}.flow{display:grid;grid-template-columns:1fr 28px 1fr 28px 1fr;margin-top:20px;align-items:stretch}.flow-card{background:#fff;border:1px solid #25253118;border-radius:10px;padding:15px}.flow-card b{font-size:12px}.flow-card p{font-size:9.5px;line-height:1.45;color:#5e5b69}.arrow{display:flex;align-items:center;justify-content:center;color:#6254ff;font-size:21px;font-weight:900}.checklist{margin-top:16px}.check{display:grid;grid-template-columns:26px 1fr;gap:10px;background:#fff;border:1px solid #25253116;border-radius:9px;padding:11px 13px;margin-bottom:8px}.check .box{width:20px;height:20px;border-radius:6px;background:#eeeafd;color:#6254ff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900}.check h4{margin:0;font-size:11px}.check p{margin:3px 0 0;font-size:9.5px;line-height:1.4;color:#615f6d}.source{font-size:8.8px;line-height:1.45;color:#777585}.footer{position:absolute;left:.66in;right:.66in;bottom:.28in;display:flex;justify-content:space-between;border-top:1px solid #25253118;padding-top:8px;font-size:7.5px;color:#888594;text-transform:uppercase;letter-spacing:.1em}.cover .footer{border-color:#ffffff24;color:#d7d2ff}.qa{color:#08725d;font-weight:800}.pending{color:#915313;font-weight:800}
</style></head><body>

<section class="page cover">
  <div class="logo-card"><img class="logo" src="${logoData}" alt="Nexla"></div>
  <div class="eyebrow">Google Ads and landing page readiness</div>
  <h1>MCP Studio<br>paid search plan</h1>
  <div class="deck">A live account, landing page, form, and measurement review prepared for Nexla. This packet converts the current audit into a focused launch path while preserving an unpublished state until tracking is validated.</div>
  <div class="status-strip">
    <div class="status-card"><small>Prepared</small><b>August 25, 2026</b></div>
    <div class="status-card"><small>Account</small><b>791 780 2207</b></div>
    <div class="status-card"><small>Current state</small><b>Unpublished</b></div>
  </div>
  <div class="footer"><span>Prepared by Momentum 360 for Nexla</span><span>01 / 06</span></div>
</section>

<section class="page">
  <div class="header"><img src="${logoData}" alt="Nexla"><div class="meta">MCP Studio paid search readiness<br>August 25, 2026</div></div>
  <div class="section">01 · Executive decision</div><h2>The recommended launch path</h2>
  <p class="lede">Use Variant A as the MCP paid search destination, protect the existing Brand campaign, and replace fragmented legacy Nonbrand activity with one tightly controlled MCP Search campaign only after successful conversion validation.</p>
  <div class="metric-grid">
    <div class="metric"><div class="label">Brand budget</div><div class="value">$25</div><div class="note">Per day, protected</div></div>
    <div class="metric"><div class="label">MCP Nonbrand</div><div class="value">$40.75</div><div class="note">Per day after validation</div></div>
    <div class="metric"><div class="label">Average monthly</div><div class="value">≈ $2,000</div><div class="note">Using 30.4 average days</div></div>
  </div>
  <div class="grid">
    <div class="card purple"><h3>What moves forward</h3><ul><li>Variant A for MCP paid Search</li><li>One MCP focused Search campaign</li><li>Phrase and Exact match intent</li><li>UTM and GCLID attribution</li><li>Protected Brand Exact coverage</li></ul></div>
    <div class="card amber"><h3>What remains separate</h3><ul><li>Enterprise Data Layer until a matching page exists</li><li>Legacy Nonbrand campaigns until replacement approval</li><li>Activation until form success is validated</li><li>Advertiser identity until Nexla approval is confirmed</li></ul></div>
  </div>
  <div class="callout"><strong>Decision:</strong> The landing page is ready to serve as the working paid Search candidate. Measurement and account verification remain the release gates.</div>
  <div class="footer"><span>Nexla · Confidential working plan</span><span>02 / 06</span></div>
</section>

<section class="page">
  <div class="header"><img src="${logoData}" alt="Nexla"><div class="meta">Landing page review<br>Desktop and mobile</div></div>
  <div class="section">02 · Landing pages</div><h2>Variant A wins the paid Search role</h2>
  <p class="lede">All supplied MCP pages use the same core content. The practical difference is form access, especially on mobile. Variant A exposes the form near the top and repeats it near the bottom, while the other tested variants defer the only form several thousand pixels.</p>
  <table class="table"><thead><tr><th>Page</th><th>Structure</th><th>First mobile form</th><th>Decision</th><th>Reason</th></tr></thead><tbody>
    ${variants.map((row) => `<tr><td><b>${esc(row[0])}</b></td><td>${esc(row[1])}</td><td>${esc(row[2])}</td><td><span class="pill ${row[3] === "Recommended" ? "go" : row[3] === "Hold" ? "hold" : "info"}">${esc(row[3])}</span></td><td>${esc(row[4])}</td></tr>`).join("")}
  </tbody></table>
  <div class="grid">
    <div class="card mint"><h3>Confirmed form behavior</h3><ul><li>HubSpot form captures GCLID and UTM values</li><li>Variant A includes hero and body forms</li><li>Form ID 663d7e71 eb1c 4e1b 94fe 61cac6f16a90</li><li>Official current positioning supports 1,000 plus connectors</li></ul></div>
    <div class="card amber"><h3>Experience issue</h3><p>The Nexie chat widget obscures a meaningful portion of the landing page on desktop and mobile. Suppress or automatically collapse it on paid campaign destinations.</p></div>
  </div>
  <div class="callout"><strong>Recommended destination:</strong> https://nexla.com/lp/mcp-servers/</div>
  <div class="footer"><span>Nexla · Landing page evidence</span><span>03 / 06</span></div>
</section>

<section class="page">
  <div class="header"><img src="${logoData}" alt="Nexla"><div class="meta">Campaign architecture<br>Controlled proof period</div></div>
  <div class="section">03 · Campaign build</div><h2>A focused MCP Search campaign</h2>
  <p class="lede">The prior draft mixed MCP, enterprise data integration, data products, and agent data themes into one ad group. The replacement plan uses only MCP intent because that is the page and message currently supported by the supplied assets.</p>
  <div class="grid">
    <div class="card purple"><h3>Campaign safeguards</h3><ul><li>United States, presence only</li><li>English language</li><li>Google Search only</li><li>Search Partners off</li><li>Display expansion off</li><li>AI Max off</li><li>Maximize Clicks with $12 maximum CPC</li></ul></div>
    <div class="card mint"><h3>Ad and attribution</h3><ul><li>Ten Phrase and Exact MCP keywords</li><li>Fifteen MCP focused headlines</li><li>Four aligned descriptions</li><li>Display path mcp / servers</li><li>Final URL suffix for campaign, ad group, keyword, and creative attribution</li><li>Current 1,000 plus connector language</li></ul></div>
  </div>
  <div class="flow">
    <div class="flow-card"><b>Protected Brand</b><p>Continue Brand Exact at $25 per day with its own budget and reporting.</p></div><div class="arrow">›</div>
    <div class="flow-card"><b>MCP proof campaign</b><p>Activate at $40.75 per day only after measurement validation.</p></div><div class="arrow">›</div>
    <div class="flow-card"><b>Weekly control</b><p>Review search terms, lead quality, and verified conversion reporting before expansion.</p></div>
  </div>
  <div class="callout"><strong>Legacy transition:</strong> Do not stack the new budget on top of current fragmented Nonbrand activity. Pause the replaced campaigns only when the MCP campaign is approved and ready.</div>
  <div class="footer"><span>Nexla · Campaign architecture</span><span>04 / 06</span></div>
</section>

<section class="page">
  <div class="header"><img src="${logoData}" alt="Nexla"><div class="meta">Measurement review<br>Google Ads, GA4, HubSpot</div></div>
  <div class="section">04 · Measurement</div><h2>Conversion reporting is pending validation</h2>
  <p class="lede">The form preserves paid media attribution, but the success event is not yet mapped cleanly across HubSpot, Google Tag Manager, Google Ads, and GA4. Launch should wait for one verified end to end test.</p>
  <div class="metric-grid">
    <div class="metric"><div class="label">Google Ads action</div><div class="value" style="font-size:18px">Secondary</div><div class="note">HubSpot Demo Request</div></div>
    <div class="metric"><div class="label">Recent tag data</div><div class="value" style="font-size:18px">Pending</div><div class="note">No recent diagnostic signal</div></div>
    <div class="metric"><div class="label">Enhanced coverage</div><div class="value">27%</div><div class="note">Current Google diagnostic</div></div>
  </div>
  <div class="flow">
    <div class="flow-card"><b>HubSpot success</b><p>Use hubspot form success for the exact MCP form.</p></div><div class="arrow">›</div>
    <div class="flow-card"><b>GTM mapping</b><p>Fire the Google Ads demo conversion only on successful submission.</p></div><div class="arrow">›</div>
    <div class="flow-card"><b>GA4 lead event</b><p>Include the new /lp/ paths and verify in DebugView.</p></div>
  </div>
  <div class="grid">
    <div class="card amber"><h3>Current mismatch</h3><p>The Google Ads conversion relies on a generic form submit event. The more reliable HubSpot form success event already exists. The GA4 Demo Submission rule is limited to demo paths and does not cover the supplied landing page paths.</p></div>
    <div class="card purple"><h3>Access requirement</h3><p>The currently authorized Google account does not include Nexla container GTM K7B389B. The Nexla web team can either implement the mapping or grant the agency access.</p></div>
  </div>
  <div class="callout"><strong>Validation standard:</strong> Confirm one successful test submission in HubSpot, GTM preview, GA4 DebugView, and Google Ads diagnostics before activation.</div>
  <div class="footer"><span>Nexla · Measurement readiness</span><span>05 / 06</span></div>
</section>

<section class="page">
  <div class="header"><img src="${logoData}" alt="Nexla"><div class="meta">Release checklist<br>Owners and next actions</div></div>
  <div class="section">05 · Launch gates</div><h2>What needs to happen next</h2>
  <p class="lede">The campaign specification is complete and remains unpublished. These checks preserve a clean Brand and Nonbrand structure and prevent spend from scaling before the primary lead signal is trustworthy.</p>
  <div class="checklist">
    <div class="check"><div class="box">1</div><div><h4>Map the exact HubSpot success event</h4><p>Owner: Nexla web team or agency after GTM K7B389B access is granted.</p></div></div>
    <div class="check"><div class="box">2</div><div><h4>Extend GA4 measurement to the /lp/ paths</h4><p>Confirm the successful event in GA4 DebugView and preserve GCLID and UTM values.</p></div></div>
    <div class="check"><div class="box">3</div><div><h4>Suppress or collapse Nexie</h4><p>Prevent the chat widget from obscuring form and product content on paid destinations.</p></div></div>
    <div class="check"><div class="box">4</div><div><h4>Confirm advertiser identity</h4><p>Google Ads currently shows Saket Saurabh as the verified advertiser. Confirm this is expected or complete Nexla business name approval.</p></div></div>
    <div class="check"><div class="box">5</div><div><h4>Supply the Enterprise Data Layer page</h4><p>Keep that theme separate until an aligned destination is available.</p></div></div>
    <div class="check"><div class="box">6</div><div><h4>Approve the exact replacement plan</h4><p>Preserve Brand at $25 per day, activate MCP Nonbrand at $40.75 per day, and pause only the legacy campaigns being replaced.</p></div></div>
  </div>
  <div class="callout"><strong>Current state:</strong> Draft prepared, unpublished, no new spend activated. Final publication requires the exact launch preview and explicit approval.</div>
  <p class="source"><b>Verified sources:</b> Gmail thread “Following Up / Google Audit,” live Google Ads account 791 780 2207, Google Ads draft 10210296901, public Nexla landing pages, official Nexla MCP Studio and connector pages, live GTM container behavior, and the canonical Nexla client record. Prepared August 25, 2026.</p>
  <div class="footer"><span>Prepared by Momentum 360 for Nexla</span><span>06 / 06</span></div>
</section>

</body></html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(htmlPath, html, "utf8");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1224, height: 1584 }, deviceScaleFactor: 1 });
await page.goto(`file:///${htmlPath.replaceAll("\\", "/")}`, { waitUntil: "networkidle" });
await page.pdf({ path: pdfPath, format: "Letter", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await page.screenshot({ path: qaPath, clip: { x: 0, y: 0, width: 816, height: 1056 } });
await page.screenshot({ path: qaFullPath, fullPage: true });
await browser.close();

const stat = fs.statSync(pdfPath);
console.log(JSON.stringify({ pdfPath, htmlPath, qaPath, qaFullPath, bytes: stat.size }, null, 2));
