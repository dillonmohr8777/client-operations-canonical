import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const dataPath = path.join(root, "data", "market-intelligence.json");
const templatePath = path.join(root, "dashboard-shell.template.html");
const shellPath = path.join(root, "dashboard-shell.html");
const payloadPath = path.join(root, "dashboard-payload.json");
const outputPath = path.join(root, "dashboard.html");
const distDir = path.join(root, "dist");
const distIndexPath = path.join(distDir, "index.html");
const distHeadersPath = path.join(distDir, "_headers");
const logoPath = path.resolve(root, "..", "..", "github", "align-hcm-lead-intelligence", "assets", "brand", "align-hcm-primary.png");
const embedder = "C:\\Users\\dillo\\.codex\\plugins\\cache\\role-specific-plugins\\data-analytics\\0.2.6\\skills\\build-report\\scripts\\embed_html_report_runtime.py";

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const template = fs.readFileSync(templatePath, "utf8");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function metric(label, value, note, source, id) {
  return `<article class="metric"><div class="label">${escapeHtml(label)}</div><div class="value"><span class="source-tooltip" tabindex="0" aria-describedby="${id}">${escapeHtml(value)}<span class="source-tooltip-content" id="${id}" role="tooltip">${escapeHtml(source)}</span></span></div><div class="note">${escapeHtml(note)}</div></article>`;
}

const align = data.companies.find(company => company.name === "Align HCM");
const metrics = [
  metric("Companies mapped", data.companies.length, "Align plus five competitors", "Source: reviewed company set in market-intelligence.json", "source-metric-1"),
  metric("Official pages", data.sources.length, "Primary-source review", "Source: official source registry in market-intelligence.json", "source-metric-2"),
  metric("Align coverage", `${align.capabilities.length}/11`, "Confirmed categories", "Source: Align official homepage and services page", "source-metric-3"),
  metric("Watchdog health", `${data.metadata.watchdog.successfulSources}/11`, "Sources completed", "Source: local press-watchdog run at 2026-07-27T00:50:22Z", "source-metric-4"),
  metric("New signals", data.metadata.watchdog.newSignals, "Latest incremental run", "Source: local press-watchdog incremental result", "source-metric-5")
].join("");

function fallbackBars(rows, maximum, color) {
  return `<table class="fallback-table"><caption class="sr-only">${escapeHtml(rows.map(row => `${row.name}: ${row.value}`).join(", "))}</caption><tbody>${rows.map(row =>
    `<tr><th scope="row">${escapeHtml(row.name)}</th><td><span class="fallback-track"><span class="fallback-fill" style="--w:${Math.max(2, row.value / maximum * 100)}%;--c:${color}"></span></span></td><td>${escapeHtml(row.value)}</td></tr>`
  ).join("")}</tbody></table>`;
}

const capabilityRows = data.companies
  .map(company => ({ name: company.name, value: company.capabilities.length }))
  .sort((a, b) => b.value - a.value);

const opportunityRows = data.opportunities.map(item => ({ name: item.name, value: item.score }));

const competitorTable = `<table><caption>Six-company competitive comparison</caption><thead><tr><th>Company</th><th>Platforms</th><th>Positioning</th><th>Confirmed strengths</th><th>Align separation</th></tr></thead><tbody>${data.companies.map(company =>
  `<tr class="company-row" data-platforms="${escapeHtml(company.platforms.join("|"))}"><td><strong>${escapeHtml(company.name)}</strong></td><td><div class="platforms">${company.platforms.map(platform => `<span class="platform">${escapeHtml(platform)}</span>`).join("")}</div></td><td>${escapeHtml(company.positioning)}</td><td>${escapeHtml(company.confirmedStrengths)}</td><td>${escapeHtml(company.separation)}</td></tr>`
).join("")}</tbody></table>`;

const competitorBriefs = data.companies.filter(company => company.type === "Competitor").map(company =>
  `<article class="brief" data-platforms="${escapeHtml(company.platforms.join("|"))}"><h3>${escapeHtml(company.name)}</h3><div class="brief-meta">${escapeHtml(company.platforms.join(" • "))} • ${company.capabilities.length} of 11 categories confirmed</div><div class="brief-grid"><div class="brief-block"><b>Proof on reviewed pages</b><p>${escapeHtml(company.proof)}</p></div><div class="brief-block"><b>Sales landmine</b><p>${escapeHtml(company.landmine)}</p></div><div class="brief-block"><b>Discovery question</b><p>${escapeHtml(company.discovery)}</p></div><div class="brief-block"><b>Official source</b><p>${company.sources.map((source, index) => `<a href="${escapeHtml(source)}" target="_blank" rel="noopener">${index === 0 ? "Primary page" : `Source ${index + 1}`}</a>`).join(" • ")}</p></div></div></article>`
).join("");

const capabilityMatrix = `<table><caption>Confirmed capability evidence by company</caption><thead><tr><th>Capability</th>${data.companies.map(company => `<th>${escapeHtml(company.name)}</th>`).join("")}</tr></thead><tbody>${data.capabilities.map(capability =>
  `<tr><td><strong>${escapeHtml(capability.label)}</strong></td>${data.companies.map(company => company.capabilities.includes(capability.id) ? '<td><span class="yes" aria-label="Confirmed">● <span class="sr-only">Confirmed</span></span></td>' : '<td><span class="no" aria-label="Not confirmed in reviewed pages">○ <span class="sr-only">Not confirmed in reviewed pages</span></span></td>').join("")}</tr>`
).join("")}</tbody></table>`;

const guidanceCards = data.opportunities.map(item =>
  `<article class="guidance"><div class="rank">Priority ${item.rank} • ${item.score}/100</div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.rationale)}</p><p class="move"><strong>Next move:</strong> ${escapeHtml(item.nextMove)}</p></article>`
).join("");

const sources = data.sources.map(source =>
  `<li><b>${escapeHtml(source.company)}</b><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.title)}</a></li>`
).join("");

const logoData = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;

const replacements = {
  "{{LOGO_DATA_URI}}": logoData,
  "{{METRICS}}": metrics,
  "{{CAPABILITY_FALLBACK}}": fallbackBars(capabilityRows, 11, "#27a591"),
  "{{OPPORTUNITY_FALLBACK}}": fallbackBars(opportunityRows, 100, "#f05a28"),
  "{{COMPETITOR_TABLE}}": competitorTable,
  "{{COMPETITOR_BRIEFS}}": competitorBriefs,
  "{{CAPABILITY_MATRIX}}": capabilityMatrix,
  "{{GUIDANCE_CARDS}}": guidanceCards,
  "{{SOURCES}}": sources
};

let shell = template;
for (const [placeholder, value] of Object.entries(replacements)) shell = shell.replace(placeholder, value);
if (shell.includes("{{")) throw new Error("Unresolved template placeholder remains in dashboard shell.");
fs.writeFileSync(shellPath, shell, "utf8");

const payload = {
  charts: [
    {
      id: "capability-coverage",
      height: 330,
      type: "bar",
      dataset: {
        id: "capability-coverage",
        title: "Confirmed capability coverage",
        data: capabilityRows,
        chart_spec: {
          id: "capability-coverage",
          dataset: "capability-coverage",
          title: "Confirmed capability coverage",
          type: "bar",
          encodings: {
            x: { field: "name", type: "nominal" },
            y: { field: "value", label: "Confirmed categories", type: "quantitative" }
          },
          xAxisTitle: "",
          yAxisTitle: "Confirmed categories",
          valueFormat: "number",
          settings: { orientation: "horizontal", groupMode: "grouped" }
        }
      }
    },
    {
      id: "opportunity-priority",
      height: 330,
      type: "bar",
      dataset: {
        id: "opportunity-priority",
        title: "Strategic opportunity priority",
        data: opportunityRows,
        chart_spec: {
          id: "opportunity-priority",
          dataset: "opportunity-priority",
          title: "Strategic opportunity priority",
          type: "bar",
          encodings: {
            x: { field: "name", type: "nominal" },
            y: { field: "value", label: "Priority score", type: "quantitative" }
          },
          xAxisTitle: "",
          yAxisTitle: "Priority score",
          valueFormat: "number",
          settings: { orientation: "horizontal", groupMode: "grouped" }
        }
      }
    }
  ]
};
fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), "utf8");

const run = spawnSync("python", [embedder, "--input", shellPath, "--payload", payloadPath, "--output", outputPath], {
  cwd: root,
  encoding: "utf8"
});
if (run.status !== 0) {
  process.stderr.write(run.stderr || run.stdout || "Dashboard embed failed.");
  process.exit(run.status ?? 1);
}
fs.mkdirSync(distDir, { recursive: true });
fs.copyFileSync(outputPath, distIndexPath);
fs.writeFileSync(distHeadersPath, `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`, "utf8");
process.stdout.write(run.stdout);
process.stdout.write(`Dashboard built: ${outputPath}\n`);
process.stdout.write(`Netlify package built: ${distIndexPath}\n`);
