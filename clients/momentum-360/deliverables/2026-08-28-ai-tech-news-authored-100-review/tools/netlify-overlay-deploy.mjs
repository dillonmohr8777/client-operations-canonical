import { createReadStream } from 'node:fs';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map((value, index, all) => {
  if (!value.startsWith('--')) return [];
  const key = value.slice(2);
  const next = all[index + 1];
  return [key, next && !next.startsWith('--') ? next : true];
}).filter((entry) => entry.length));

const siteId = String(args['site-id'] || '');
const mode = String(args.mode || 'dry-run');
const mappingPath = args.mapping ? path.resolve(String(args.mapping)) : null;
const deployIdToPromote = args['deploy-id'] ? String(args['deploy-id']) : null;
const title = String(args.title || 'Authored 100 best-25 QA overlay');

if (!/^[0-9a-f-]{36}$/i.test(siteId)) throw new Error('A valid --site-id is required.');
if (!['dry-run', 'draft', 'promote'].includes(mode)) throw new Error('--mode must be dry-run, draft, or promote.');
if (mode === 'promote' && !deployIdToPromote) throw new Error('--deploy-id is required for promote mode.');
if (mode !== 'promote' && !mappingPath) throw new Error('--mapping is required for dry-run and draft modes.');

const npmRoot = process.platform === 'win32'
  ? path.join(process.env.APPDATA || '', 'npm', 'node_modules')
  : '/usr/local/lib/node_modules';
const cliRoot = path.join(npmRoot, 'netlify-cli');
const [{ NetlifyAPI }, { getToken }] = await Promise.all([
  import(pathToFileURL(path.join(cliRoot, 'dist', 'index.js')).href),
  import(pathToFileURL(path.join(cliRoot, 'dist', 'utils', 'command-helpers.js')).href),
]);
const [token] = await getToken();
if (!token) throw new Error('Netlify CLI authentication is unavailable.');
const api = new NetlifyAPI(token);

const waitForReady = async (deployId, timeoutMs = 180_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const deploy = await api.getSiteDeploy({ siteId, deployId });
    if (deploy.state === 'ready') return deploy;
    if (deploy.state === 'error') throw new Error(deploy.error_message || `Deploy ${deployId} failed.`);
    await new Promise((resolve) => setTimeout(resolve, 1_500));
  }
  throw new Error(`Timed out waiting for deploy ${deployId}.`);
};

if (mode === 'promote') {
  const restored = await api.restoreSiteDeploy({ siteId, deployId: deployIdToPromote });
  const ready = await waitForReady(restored.id || deployIdToPromote);
  process.stdout.write(`${JSON.stringify({
    mode,
    siteId,
    deployId: ready.id,
    state: ready.state,
    url: ready.ssl_url || ready.url,
    publishedAt: ready.published_at || null,
  }, null, 2)}\n`);
  process.exit(0);
}

const mapping = JSON.parse(await readFile(mappingPath, 'utf8'));
if (!Array.isArray(mapping.overlays) || mapping.overlays.length === 0) {
  throw new Error('Mapping must contain a non-empty overlays array.');
}

const normalizeDestination = (value) => {
  const normalized = `/${String(value || '').replaceAll('\\', '/').replace(/^\/+/, '')}`;
  if (normalized.includes('/../') || normalized.endsWith('/..')) throw new Error(`Unsafe destination: ${value}`);
  return normalized;
};

const walk = async (root) => {
  const output = [];
  const visit = async (current) => {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in overlays: ${absolute}`);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) output.push(absolute);
    }
  };
  await visit(root);
  return output;
};

const sha1File = async (filePath) => createHash('sha1').update(await readFile(filePath)).digest('hex');
const liveFiles = await api.listSiteFiles({ siteId });
if (!Array.isArray(liveFiles) || liveFiles.length === 0) throw new Error('Live site file manifest is empty.');

const files = Object.fromEntries(liveFiles.map((file) => [normalizeDestination(file.path), file.sha]));
const overlayBySha = new Map();
const overlayPaths = new Set();

for (const overlay of mapping.overlays) {
  const source = path.resolve(String(overlay.source));
  const stats = await lstat(source);
  if (stats.isSymbolicLink()) throw new Error(`Symlink overlay rejected: ${source}`);
  const destination = normalizeDestination(overlay.destination);
  const sourceFiles = stats.isDirectory() ? await walk(source) : [source];
  const sourceRoot = stats.isDirectory() ? source : path.dirname(source);

  for (const filePath of sourceFiles) {
    const relative = stats.isDirectory() ? path.relative(sourceRoot, filePath).replaceAll('\\', '/') : '';
    const target = stats.isDirectory() ? normalizeDestination(`${destination}/${relative}`) : destination;
    if (overlayPaths.has(target)) throw new Error(`Duplicate overlay destination: ${target}`);
    const sha = await sha1File(filePath);
    files[target] = sha;
    overlayPaths.add(target);
    const bucket = overlayBySha.get(sha) || [];
    bucket.push({ filePath, target });
    overlayBySha.set(sha, bucket);
  }
}

const summary = {
  mode,
  siteId,
  mapping: mappingPath,
  inheritedFileCount: liveFiles.length,
  finalFileCount: Object.keys(files).length,
  overlayFileCount: overlayPaths.size,
  overlayDestinations: mapping.overlays.map(({ source, destination }) => ({ source, destination })),
};

if (mode === 'dry-run') {
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  process.exit(0);
}

const created = await api.createSiteDeploy({
  siteId,
  title,
  body: { draft: true, deploy_source: 'cli' },
});
const deployId = created.id;
if (!deployId) throw new Error('Netlify did not return a deploy ID.');

const diff = await api.updateSiteDeploy({
  siteId,
  deploy_id: deployId,
  body: { files, draft: true, async: false },
});
const required = Array.isArray(diff.required) ? diff.required : [];
const uploadList = required.flatMap((sha) => overlayBySha.get(sha) || []);
const missingRequired = required.filter((sha) => !overlayBySha.has(sha));
if (missingRequired.length) {
  throw new Error(`Netlify requested ${missingRequired.length} inherited hashes that are unavailable locally.`);
}

const concurrency = 6;
for (let offset = 0; offset < uploadList.length; offset += concurrency) {
  const batch = uploadList.slice(offset, offset + concurrency);
  await Promise.all(batch.map(({ filePath, target }) => api.uploadDeployFile({
    body: () => createReadStream(filePath),
    deployId,
    path: encodeURI(target),
  })));
}

const ready = await waitForReady(deployId);
process.stdout.write(`${JSON.stringify({
  ...summary,
  deployId,
  state: ready.state,
  draft: true,
  url: ready.ssl_url || ready.deploy_ssl_url || ready.url,
  requiredHashCount: required.length,
  uploadedFileCount: uploadList.length,
}, null, 2)}\n`);
