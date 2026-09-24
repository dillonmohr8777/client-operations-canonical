import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const dir = "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/nexla/deliverables/2026-08-24-weekly-report-2026-08-17-to-2026-08-23";
const period = "August 17 to August 23, 2026";
const pdf = path.join(dir, "nexla-weekly-report-2026-08-17-to-2026-08-23.pdf");
const data = {
  client: "Nexla",
  reporting_window: "2026-08-17 through 2026-08-23",
  prepared: "2026-08-24",
  evidence_mode: "deliverable and communication research only",
  metrics: [["Audit delivered", "Aug 20"], ["Proposed budget", "$2,000 monthly"], ["Campaign structure", "Brand + Nonbrand"], ["Build state", "Unpublished"], ["Client inputs", "3 pending"], ["Live Ads read", "Out of scope"]],
  work: [
    "Completed and delivered the client facing Google Ads audit with a clear account diagnosis and next step plan.",
    "Specified a protected Brand campaign and tightly controlled Nonbrand test around Agent Data Layer, MCP, enterprise data integration, and data products.",
    "Updated the working budget discussion from $1,000 to a proposed $2,000 monthly allocation while preserving the need for a final Brand and Nonbrand split.",
    "Kept the campaign build unpublished while waiting for landing page and conversion tracking confirmation."
  ],
  next: "Confirm the preferred Enterprise Data Layer and MCP landing pages, define the primary conversion, and verify whether it is tracked in Google Ads, GA4, or both before locking the budget split or publishing the campaign.",
  sources: ["Gmail thread Following Up / Google Audit, Aug 20 to Aug 21", "Nexla Google Ads Audit, delivered Aug 20", "Canonical Nexla campaign plan and client context"]
};
const esc = s => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page{size:Letter;margin:0}*{box-sizing:border-box}body{margin:0;background:#dce4eb;font-family:Arial,Helvetica,sans-serif;color:#12263a}.page{width:8.5in;height:11in;padding:.65in;background:#f5f8fb;position:relative;page-break-after:always;overflow:hidden}.cover{background:#071a2d;color:white}.cover:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 22%,#5ee3c455,transparent 24%),linear-gradient(135deg,transparent 55%,#1674ff22)}.brand{position:relative;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#ffffffa8}.eyebrow{position:relative;margin-top:1.15in;color:#5ee3c4;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}h1{position:relative;font-size:49px;line-height:.95;letter-spacing:-.055em;margin:16px 0}.client{position:relative;font-size:28px;font-weight:900}.summary{position:relative;font-size:15px;line-height:1.55;max-width:6in;margin-top:30px;color:#ffffffe0}.wordmark{position:absolute;right:.7in;bottom:.78in;width:2.15in;height:1.1in;border:1px solid #5ee3c466;background:#ffffff0d;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff}.range{position:absolute;left:.7in;bottom:.84in;font-size:11px;color:#ffffff9c}.head{display:flex;justify-content:space-between;align-items:end;border-bottom:1px solid #17324a24;padding-bottom:17px}.k{color:#087eaa;font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}h2{font-size:29px;letter-spacing:-.04em;margin:6px 0 0}.small{font-size:10px;color:#64717d;text-align:right}.intro{font-size:13px;line-height:1.58;color:#40505d;margin-top:20px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}.metric{background:white;border:1px solid #17324a22;border-top:4px solid #18bda0;border-radius:7px;padding:14px;min-height:1.05in}.ml{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#697681;font-weight:800}.mv{font-size:22px;font-weight:900;margin-top:10px;color:#071a2d}.work{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px}.card{background:white;border:1px solid #17324a22;border-radius:7px;padding:16px;min-height:1.52in}.card b{font-size:12px;color:#071a2d}.card p{font-size:10.5px;line-height:1.52;color:#4b5a65}.next{margin-top:20px;background:#071a2d;color:white;padding:17px;border-left:6px solid #5ee3c4;font-size:12px;line-height:1.5}.sources{margin-top:22px;padding:17px;background:white;border:1px solid #17324a22;border-radius:7px}.sources li{font-size:10.5px;line-height:1.45;margin-bottom:9px;color:#465661}.footer{position:absolute;left:.65in;right:.65in;bottom:.28in;border-top:1px solid #17324a22;padding-top:8px;font-size:8px;color:#6b7781;display:flex;justify-content:space-between;text-transform:uppercase;letter-spacing:.08em}.cover .footer{border-color:#ffffff22;color:#ffffff77}
</style></head><body>
<section class="page cover"><div class="brand">Momentum 360 · Weekly client report</div><div class="eyebrow">Search growth planning</div><h1>Weekly<br>marketing report</h1><div class="client">Nexla</div><div class="summary">This week moved the Google Ads program from account diagnosis into a controlled launch plan. The audit was delivered, the budget discussion advanced to $2,000 monthly, and the proposed Brand and Nonbrand structure remains unpublished until landing pages and conversion tracking are confirmed.</div><div class="range">Reporting window<br><b>${period}</b></div><div class="wordmark">NEXLA</div><div class="footer"><span>Nexla</span><span>01 / 03</span></div></section>
<section class="page"><div class="head"><div><div class="k">01 · Current signal</div><h2>Weekly snapshot</h2></div><div class="small">${period}<br>Verified sources only</div></div><p class="intro">The strongest value delivered this week was a clear, approval ready path from the existing account into protected Brand coverage and a measured Nonbrand test. No live account metrics are repeated here because Nexla is outside this workflow's authorized live Ads scope.</p><div class="metrics">${data.metrics.map(m=>`<div class="metric"><div class="ml">${esc(m[0])}</div><div class="mv">${esc(m[1])}</div></div>`).join("")}</div><div class="next"><b>Next read</b><br>${esc(data.next)}</div><div class="sources"><b>Reporting guardrail</b><p class="intro">The audit, campaign plan, and current email thread are verified. The campaign is a proposal and remains unpublished. Conversion reporting is pending validation.</p></div><div class="footer"><span>Nexla</span><span>02 / 03</span></div></section>
<section class="page"><div class="head"><div><div class="k">02 · Work and evidence</div><h2>What moved this week</h2></div><div class="small">Client specific<br>Deliverable research</div></div><div class="work">${data.work.map((w,i)=>`<div class="card"><b>${String(i+1).padStart(2,"0")} · ${["Audit delivery","Campaign design","Budget direction","Launch boundary"][i]}</b><p>${esc(w)}</p></div>`).join("")}</div><div class="sources"><div class="k">Source map</div><ul>${data.sources.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div><div class="next"><b>Recommended next action</b><br>${esc(data.next)}</div><div class="footer"><span>Nexla</span><span>03 / 03</span></div></section>
</body></html>`;

fs.mkdirSync(dir, { recursive: true });
const reportHtml = path.join(dir, "report.html");
fs.writeFileSync(reportHtml, html);
fs.writeFileSync(path.join(dir, "source-data.json"), JSON.stringify(data, null, 2));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(`file:///${reportHtml.replaceAll("\\", "/")}`, { waitUntil: "networkidle" });
await page.pdf({ path: pdf, format: "Letter", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await page.screenshot({ path: path.join(dir, "qa-full-page.png"), fullPage: true });
await browser.close();
console.log(JSON.stringify({ client: "Nexla", pdf }, null, 2));
