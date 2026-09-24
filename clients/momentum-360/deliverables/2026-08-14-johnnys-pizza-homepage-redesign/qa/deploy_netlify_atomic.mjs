import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const [phase, siteId, sourceArgument, receiptDirectoryArgument] = process.argv.slice(2);
if (!['draft', 'production'].includes(phase) || !siteId || !sourceArgument || !receiptDirectoryArgument) {
  throw new Error("usage: deploy_netlify_atomic.mjs <draft|production> <site-id> <route-source-dir> <receipt-directory>");
}

const expectedSiteName = "phl-2026-w33b";
const expectedSiteUrl = "https://phl-2026-w33b.netlify.app";
const targetPrefix = "/sites/johnny-s-pizza/";
const expectedHeadersSha = "71318049c19e0444afa000b8381598033e79dc14";
const sourceRoot = path.resolve(sourceArgument);
const receiptDirectory = path.resolve(receiptDirectoryArgument);
const receiptPath = path.join(receiptDirectory, `${phase}-receipt.json`);
const cliRoot = path.join(process.env.APPDATA, "npm", "node_modules", "netlify-cli");

if (existsSync(receiptPath)) throw new Error(`Refusing to overwrite existing receipt: ${receiptPath}`);
if (!existsSync(path.join(sourceRoot, "index.html")) || !existsSync(path.join(sourceRoot, "assets"))) {
  throw new Error(`Route source is incomplete: ${sourceRoot}`);
}

const [{ NetlifyAPI }, { getToken }] = await Promise.all([
  import(pathToFileURL(path.join(cliRoot, "dist", "index.js")).href),
  import(pathToFileURL(path.join(cliRoot, "dist", "utils", "command-helpers.js")).href),
]);
const [token, tokenSource] = await getToken();
if (!token) throw new Error("Netlify CLI authentication is unavailable");
const api = new NetlifyAPI(token, { userAgent: "codex-johnnys-homepage-atomic-deploy/1.0" });

const sha1 = (buffer) => createHash("sha1").update(buffer).digest("hex");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function walk(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...await walk(root, absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

async function waitForReady(deployId, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const deploy = await api.getSiteDeploy({ siteId, deployId });
    if (deploy.state === "ready") return deploy;
    if (deploy.state === "error") throw new Error(deploy.error_message || `Deploy ${deployId} entered error state`);
    await delay(1_500);
  }
  throw new Error(`Timed out waiting for deploy ${deployId}`);
}

const [site, currentFiles] = await Promise.all([
  api.getSite({ siteId }),
  api.listSiteFiles({ siteId }),
]);
if (site.id !== siteId || site.name !== expectedSiteName || site.ssl_url !== expectedSiteUrl) {
  throw new Error(`Netlify target mismatch: expected ${expectedSiteName} at ${expectedSiteUrl}`);
}
if (!Array.isArray(currentFiles) || currentFiles.length < 300) {
  throw new Error(`Unexpectedly small current deploy inventory: ${currentFiles?.length ?? 0}`);
}
const headers = currentFiles.find((file) => file.path === "/_headers");
if (!headers || headers.sha !== expectedHeadersSha) throw new Error("Current deploy no longer has the verified global noindex header");
if (phase === "production" && site.published_deploy?.locked) throw new Error("Published Netlify deploy is locked");

const currentPublishedDeployId = site.published_deploy?.id || null;
const files = Object.fromEntries(currentFiles.map((file) => [file.path, file.sha]));
const currentNonTarget = currentFiles.filter((file) => !file.path.startsWith(targetPrefix));
const currentTarget = currentFiles.filter((file) => file.path.startsWith(targetPrefix));
const localFiles = [path.join(sourceRoot, "index.html"), ...await walk(path.join(sourceRoot, "assets"))];
const uploadBySha = new Map();
const targetRecords = [];

for (const absolute of localFiles) {
  const relative = path.relative(sourceRoot, absolute).split(path.sep).join("/");
  const deployedPath = `${targetPrefix}${relative}`;
  const bytes = await readFile(absolute);
  const hash = sha1(bytes);
  files[deployedPath] = hash;
  targetRecords.push({ path: deployedPath, sha: hash, size: (await stat(absolute)).size });
  if (!uploadBySha.has(hash)) uploadBySha.set(hash, { absolute, deployedPath });
}

const sourceHtml = await readFile(path.join(sourceRoot, "index.html"), "utf8");
if (!sourceHtml.includes('content="noindex,nofollow"')) throw new Error("Route source lost its noindex meta directive");
if (!sourceHtml.includes("47d88ca1")) throw new Error("Route source lost its direction-contract seed");

const sortedManifest = Object.entries(files).sort(([a], [b]) => a.localeCompare(b));
const manifestHash = sha256(JSON.stringify(sortedManifest));
const nonTargetHash = sha256(JSON.stringify(currentNonTarget.map(({ path: filePath, sha }) => [filePath, sha]).sort(([a], [b]) => a.localeCompare(b))));
const targetHash = sha256(JSON.stringify(targetRecords.map(({ path: filePath, sha }) => [filePath, sha]).sort(([a], [b]) => a.localeCompare(b))));

if (phase === "production") {
  const draftReceiptPath = path.join(receiptDirectory, "draft-receipt.json");
  if (!existsSync(draftReceiptPath)) throw new Error("Production deploy requires a verified draft receipt");
  const draftReceipt = JSON.parse(await readFile(draftReceiptPath, "utf8"));
  if (draftReceipt.siteId !== siteId || draftReceipt.manifestHash !== manifestHash || draftReceipt.state !== "ready") {
    throw new Error("Draft receipt does not match the current production manifest");
  }
  if (draftReceipt.baselinePublishedDeployId !== currentPublishedDeployId) {
    throw new Error("The published deploy changed after draft verification; refusing production promotion");
  }
}

const title = phase === "draft"
  ? "Johnny's Pizza homepage redesign — atomic preservation draft"
  : "Johnny's Pizza homepage redesign — preserve phl-2026-w33b batch";
const created = await api.createSiteDeploy({
  siteId,
  title,
  body: { draft: phase === "draft", deploy_source: "cli" },
});
const deployId = created.id;
if (!deployId) throw new Error("Netlify did not return a deploy id");

const diff = await api.updateSiteDeploy({
  siteId,
  deploy_id: deployId,
  body: {
    files,
    async: false,
    draft: phase === "draft",
    framework: "unknown",
    framework_version: "unknown",
  },
});
const required = Array.isArray(diff.required) ? [...new Set(diff.required)] : [];
const unavailable = required.filter((hash) => !uploadBySha.has(hash));
if (unavailable.length) {
  throw new Error(`Netlify requested ${unavailable.length} unchanged hashes that are unavailable locally; atomic preservation stopped`);
}

for (const hash of required) {
  const file = uploadBySha.get(hash);
  await api.uploadDeployFile({
    body: () => createReadStream(file.absolute),
    deployId,
    path: encodeURI(file.deployedPath),
  });
}

const ready = await waitForReady(deployId);
const deployUrl = ready.deploy_ssl_url || ready.ssl_url || ready.deploy_url || ready.url;
if (!deployUrl) throw new Error("Ready deploy did not return a deploy URL");
const isDraft = phase === "draft" && ready.context === "deploy-preview" && !ready.published_at;

const receipt = {
  createdAt: new Date().toISOString(),
  phase,
  siteId,
  siteName: site.name,
  siteUrl: site.ssl_url,
  baselinePublishedDeployId: currentPublishedDeployId,
  deployId,
  deployUrl,
  state: ready.state,
  draft: isDraft,
  context: ready.context || null,
  publishedAt: ready.published_at || null,
  title,
  tokenSource,
  baselineFileCount: currentFiles.length,
  baselineNonTargetFileCount: currentNonTarget.length,
  baselineTargetFileCount: currentTarget.length,
  desiredManifestFileCount: sortedManifest.length,
  desiredTargetFileCount: targetRecords.length,
  requiredUploadCount: required.length,
  manifestHash,
  nonTargetHash,
  targetHash,
  headersSha: headers.sha,
  targetRecords: targetRecords.sort((a, b) => a.path.localeCompare(b.path)),
};
await mkdir(receiptDirectory, { recursive: true });
await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  phase,
  siteId,
  siteName: site.name,
  baselinePublishedDeployId: currentPublishedDeployId,
  deployId,
  deployUrl,
  state: ready.state,
  draft: isDraft,
  context: ready.context || null,
  publishedAt: ready.published_at || null,
  baselineFileCount: currentFiles.length,
  baselineNonTargetFileCount: currentNonTarget.length,
  baselineTargetFileCount: currentTarget.length,
  desiredManifestFileCount: sortedManifest.length,
  desiredTargetFileCount: targetRecords.length,
  requiredUploadCount: required.length,
  manifestHash,
  nonTargetHash,
  targetHash,
  headersSha: headers.sha,
  receiptPath,
}, null, 2));
