import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const [phase, baseUrlArgument, receiptArgument, sourceArgument, outputArgument] = process.argv.slice(2);
if (!['draft', 'production'].includes(phase) || !baseUrlArgument || !receiptArgument || !sourceArgument || !outputArgument) {
  throw new Error("usage: verify_netlify_atomic.mjs <draft|production> <base-url> <receipt> <route-source-dir> <output-json>");
}

const siteId = "c6011774-3937-4634-9e5c-bada2bf977eb";
const productionUrl = "https://phl-2026-w33b.netlify.app";
const targetPrefix = "/sites/johnny-s-pizza/";
const expectedHeadersSha = "71318049c19e0444afa000b8381598033e79dc14";
const baseUrl = baseUrlArgument.replace(/\/+$/, "");
const receiptPath = path.resolve(receiptArgument);
const sourceRoot = path.resolve(sourceArgument);
const outputPath = path.resolve(outputArgument);
const cliRoot = path.join(process.env.APPDATA, "npm", "node_modules", "netlify-cli");

if (!existsSync(receiptPath)) throw new Error(`Receipt not found: ${receiptPath}`);
if (!existsSync(path.join(sourceRoot, "index.html"))) throw new Error(`Route source not found: ${sourceRoot}`);
if (existsSync(outputPath)) throw new Error(`Refusing to overwrite existing verification report: ${outputPath}`);

const [{ NetlifyAPI }, { getToken }] = await Promise.all([
  import(pathToFileURL(path.join(cliRoot, "dist", "index.js")).href),
  import(pathToFileURL(path.join(cliRoot, "dist", "utils", "command-helpers.js")).href),
]);
const [token] = await getToken();
if (!token) throw new Error("Netlify CLI authentication is unavailable");
const api = new NetlifyAPI(token, { userAgent: "codex-johnnys-homepage-atomic-verify/1.0" });

const sha1 = (buffer) => createHash("sha1").update(buffer).digest("hex");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
if (receipt.siteId !== siteId || receipt.phase !== phase) throw new Error("Receipt identity or phase mismatch");

const [site, currentFiles] = await Promise.all([
  api.getSite({ siteId }),
  api.listSiteFiles({ siteId }),
]);
if (site.id !== siteId || site.name !== "phl-2026-w33b" || site.ssl_url !== productionUrl) {
  throw new Error("Netlify site identity changed before verification");
}
if (phase === "draft" && site.published_deploy?.id !== receipt.baselinePublishedDeployId) {
  throw new Error("Production changed while the draft was being verified");
}
if (phase === "production" && site.published_deploy?.id !== receipt.deployId) {
  throw new Error("The production receipt is not the currently published deploy");
}

const currentNonTarget = currentFiles.filter((file) => !file.path.startsWith(targetPrefix));
const nonTargetHash = sha256(JSON.stringify(currentNonTarget.map(({ path: filePath, sha }) => [filePath, sha]).sort(([a], [b]) => a.localeCompare(b))));
if (nonTargetHash !== receipt.nonTargetHash) throw new Error("Non-target Netlify manifest changed");
const headers = currentFiles.find((file) => file.path === "/_headers");
if (!headers || headers.sha !== expectedHeadersSha) throw new Error("Global noindex header changed");

const encodePath = (deployedPath) => deployedPath.split("/").map(encodeURIComponent).join("/");
async function fetchBytes(root, deployedPath) {
  const response = await fetch(`${root}${encodePath(deployedPath)}`, { redirect: "follow" });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!response.ok) throw new Error(`${response.status} for ${root}${deployedPath}`);
  return { bytes, headers: response.headers, status: response.status };
}

const comparisons = [];
const comparisonQueue = currentNonTarget.filter((file) => file.path !== "/_headers").slice();
async function comparisonWorker() {
  while (comparisonQueue.length) {
    const file = comparisonQueue.shift();
    const [production, candidate] = await Promise.all([
      fetchBytes(productionUrl, file.path),
      fetchBytes(baseUrl, file.path),
    ]);
    const productionSha = sha1(production.bytes);
    const candidateSha = sha1(candidate.bytes);
    comparisons.push({
      path: file.path,
      listedSha: file.sha,
      productionSha,
      candidateSha,
      productionBytes: production.bytes.length,
      candidateBytes: candidate.bytes.length,
      matchesListedSha: productionSha === file.sha,
      candidateMatchesProduction: candidateSha === productionSha,
    });
  }
}
await Promise.all(Array.from({ length: 12 }, () => comparisonWorker()));
const nonTargetMismatches = comparisons.filter((item) => !item.candidateMatchesProduction);
if (nonTargetMismatches.length) throw new Error(`${nonTargetMismatches.length} non-target public files differ`);

const targetChecks = [];
for (const record of receipt.targetRecords) {
  const response = await fetchBytes(baseUrl, record.path);
  const actualSha = sha1(response.bytes);
  targetChecks.push({ path: record.path, expectedSha: record.sha, actualSha, bytes: response.bytes.length, status: response.status });
  if (actualSha !== record.sha) throw new Error(`Target checksum mismatch for ${record.path}`);
}

const routePath = `${targetPrefix}index.html`;
const route = await fetchBytes(baseUrl, routePath);
const html = route.bytes.toString("utf8");
const robotsHeader = route.headers.get("x-robots-tag");
const semantic = {
  noindexHeader: robotsHeader,
  noindexMeta: html.includes('content="noindex,nofollow"'),
  directionSeed: html.includes("47d88ca1"),
  h1Count: (html.match(/<h1\b/g) || []).length,
  title: html.match(/<title>(.*?)<\/title>/)?.[1] || null,
  unsupportedCopyAbsent: !/sells a lot|chef recommendations|chef choices|calzones|salads/i.test(html),
  archivoBlack: html.includes('font-family:"Archivo Black"'),
  selectorAccessibleNames: html.includes('aria-label="Quick order"') && html.includes('aria-label="Dinner table"'),
};
const robotsHeaderLower = robotsHeader?.toLowerCase() || "";
if (!robotsHeaderLower.includes("noindex") || !robotsHeaderLower.includes("nofollow") || !semantic.noindexMeta || !semantic.directionSeed || semantic.h1Count !== 1 || !semantic.unsupportedCopyAbsent || !semantic.archivoBlack || !semantic.selectorAccessibleNames) {
  throw new Error("Candidate route semantic verification failed");
}

const report = {
  verifiedAt: new Date().toISOString(),
  phase,
  siteId,
  candidateDeployId: receipt.deployId,
  candidateBaseUrl: baseUrl,
  currentPublishedDeployId: site.published_deploy?.id || null,
  currentFileCount: currentFiles.length,
  currentNonTargetFileCount: currentNonTarget.length,
  nonTargetHash,
  comparedPublicNonTargetFiles: comparisons.length,
  nonTargetMismatches: nonTargetMismatches.length,
  productionResponsesMatchingListedSha: comparisons.filter((item) => item.matchesListedSha).length,
  edgeProcessedProductionResponses: comparisons.filter((item) => !item.matchesListedSha).map((item) => item.path),
  headersSha: headers.sha,
  verifiedTargetFiles: targetChecks.length,
  semantic,
};
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(JSON.stringify(report, null, 2));
