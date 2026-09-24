import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const dataPath = path.join(root, "data", "market-intelligence.json");
const statePath = path.join(root, "data", "weekly-source-state.json");
const snapshotDir = path.join(root, "snapshots");
const logsDir = path.join(root, "logs");
const dryRun = process.argv.includes("--dry-run");
const apiKey = process.env.FIRECRAWL_API_KEY;
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isoSlug(date) {
  return date.toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function scrape(source) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: source.url,
        formats: ["markdown"],
        onlyMainContent: true,
        maxAge: 0,
        storeInCache: false,
        timeout: 60000
      })
    });
    if (response.ok) {
      const result = await response.json();
      const markdown = result?.data?.markdown ?? "";
      if (!markdown) throw new Error(`Firecrawl returned no markdown for ${source.url}`);
      return {
        company: source.company,
        title: result?.data?.metadata?.title || source.title,
        url: source.url,
        statusCode: result?.data?.metadata?.statusCode || 200,
        contentHash: sha256(markdown),
        markdown
      };
    }
    const body = await response.text();
    if (response.status !== 429 || attempt === 3) {
      throw new Error(`Firecrawl ${response.status} for ${source.url}: ${body.slice(0, 240)}`);
    }
    const retryAfter = Number(response.headers.get("retry-after") || attempt * 5);
    await sleep(Math.min(retryAfter * 1000, 30000));
  }
}

function runBuild() {
  const build = spawnSync("node", [path.join(scriptDir, "build-dashboard.mjs")], {
    cwd: root,
    encoding: "utf8"
  });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout || "Dashboard build failed.");
  return build.stdout.trim();
}

if (dryRun) {
  if (!Array.isArray(data.sources) || data.sources.length === 0) throw new Error("No official sources are configured.");
  const nonHttps = data.sources.filter(source => !source.url.startsWith("https://"));
  if (nonHttps.length) throw new Error(`Non-HTTPS sources found: ${nonHttps.map(source => source.url).join(", ")}`);
  const duplicates = data.sources.filter((source, index, all) => all.findIndex(item => item.url === source.url) !== index);
  if (duplicates.length) throw new Error(`Duplicate sources found: ${duplicates.map(source => source.url).join(", ")}`);
  const buildOutput = runBuild();
  process.stdout.write(JSON.stringify({
    ok: true,
    mode: "dry-run",
    sourcesValidated: data.sources.length,
    buildOutput
  }, null, 2));
  process.exit(0);
}

if (!apiKey) {
  process.stderr.write("FIRECRAWL_API_KEY is required for a live weekly refresh. Use --dry-run to validate locally.\n");
  process.exit(2);
}

fs.mkdirSync(snapshotDir, { recursive: true });
fs.mkdirSync(logsDir, { recursive: true });

const startedAt = new Date();
const previous = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf8")) : { sources: [] };
const previousByUrl = new Map((previous.sources || []).map(source => [source.url, source]));
const successes = [];
const failures = [];

for (const source of data.sources) {
  try {
    successes.push(await scrape(source));
  } catch (error) {
    failures.push({ company: source.company, url: source.url, error: String(error.message || error) });
  }
}

const sourceState = successes.map(source => ({
  company: source.company,
  title: source.title,
  url: source.url,
  statusCode: source.statusCode,
  contentHash: source.contentHash,
  changed: previousByUrl.has(source.url) && previousByUrl.get(source.url).contentHash !== source.contentHash,
  baseline: !previousByUrl.has(source.url)
}));
const changedSources = sourceState.filter(source => source.changed);
const finishedAt = new Date();
const runRecord = {
  runId: isoSlug(startedAt),
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  mode: previous.sources?.length ? "incremental" : "baseline",
  sourceCount: data.sources.length,
  successfulSources: successes.length,
  failures,
  changedSources,
  safety: {
    externalDelivery: false,
    publishing: false,
    crmWrites: false,
    semanticClaimsAutoUpdated: false
  }
};

fs.writeFileSync(path.join(snapshotDir, `${runRecord.runId}.json`), JSON.stringify({
  ...runRecord,
  pages: successes
}, null, 2), "utf8");
fs.writeFileSync(statePath, JSON.stringify({
  generatedAt: finishedAt.toISOString(),
  sources: sourceState
}, null, 2), "utf8");
fs.writeFileSync(path.join(logsDir, "latest-refresh.json"), JSON.stringify(runRecord, null, 2), "utf8");

const buildOutput = runBuild();
process.stdout.write(JSON.stringify({ ...runRecord, buildOutput }, null, 2));
if (failures.length) process.exit(3);

