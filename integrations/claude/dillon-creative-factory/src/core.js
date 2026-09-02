import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { access, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const here = path.dirname(fileURLToPath(import.meta.url));
export const integrationRoot = path.resolve(here, '..');
export const repoRoot = path.resolve(integrationRoot, '..', '..', '..');
export const agentVaultRoot = process.env.DCF_AGENT_VAULT_ROOT || 'C:\\Users\\dillo\\Documents\\Codex\\projects\\agent-vault';

const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json', '.html', '.css', '.yml', '.yaml']);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);
const FONT_EXTENSIONS = new Set(['.woff', '.woff2', '.ttf', '.otf']);
const PRIVATE_NAMES = /(?:credential|secret|token|cookie|password|raw[-_ ]?(?:mail|message|communication|session)|\.env)/i;

export function jsonResult(value) {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    structuredContent: value
  };
}

export function errorResult(message, details = {}) {
  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify({ ok: false, error: message, ...details }, null, 2) }]
  };
}

export function assertWithin(root, target, label = 'path') {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`${label} escapes its allowed root`);
  return resolvedTarget;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function loadRegistry() {
  const registry = await readJson(path.join(repoRoot, 'registry', 'clients.json'));
  return registry.clients || [];
}

export async function resolveClient(query) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) throw new Error('clientId is required');
  const clients = await loadRegistry();
  const matches = clients.filter((client) =>
    [client.id, client.displayName, ...(client.aliases || [])].some((value) => String(value).toLowerCase() === needle)
  );
  if (matches.length !== 1) throw new Error(matches.length ? `Ambiguous client: ${query}` : `Unknown client: ${query}`);
  const client = matches[0];
  if (client.status !== 'active') throw new Error(`Client is not active: ${client.id}`);
  const clientRoot = assertWithin(repoRoot, path.join(repoRoot, client.folder), 'client folder');
  return { client, clientRoot };
}

async function walk(root, options = {}, current = root, results = []) {
  const { maxFiles = 600, maxDepth = 6, depth = 0 } = options;
  if (results.length >= maxFiles || depth > maxDepth) return results;
  for (const entry of await readdir(current, { withFileTypes: true })) {
    if (results.length >= maxFiles) break;
    if (entry.name === 'node_modules' || entry.name === '.git' || PRIVATE_NAMES.test(entry.name)) continue;
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) await walk(root, { ...options, depth: depth + 1 }, full, results);
    else if (entry.isFile()) results.push(full);
  }
  return results;
}

async function readSafeText(file, maxChars = 24_000) {
  if (PRIVATE_NAMES.test(file) || !TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) return '';
  return (await readFile(file, 'utf8')).slice(0, maxChars);
}

function relativeList(root, files) {
  return files.map((file) => path.relative(root, file).replaceAll('\\', '/'));
}

function slugify(value) {
  return String(value || 'draft').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'draft';
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function artifactDir(clientRoot, kind, name) {
  const target = assertWithin(clientRoot, path.join(clientRoot, 'deliverables', 'claude-drafts', `${stamp()}-${slugify(kind)}-${slugify(name)}`), 'artifact directory');
  await mkdir(target, { recursive: true });
  return target;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function textBlock(title, value) {
  return `## ${title}\n\n${value || 'Pending source input.'}\n`;
}

export async function getClientBrandKit({ clientId }) {
  const { client, clientRoot } = await resolveClient(clientId);
  const files = await walk(clientRoot, { maxFiles: 500, maxDepth: 5 });
  const assets = files.filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const fonts = files.filter((file) => FONT_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const authority = files.filter((file) => /(?:^|[\\/])(CLIENT|PRODUCT|DESIGN)\.md$/i.test(file) || /[\\/]context[\\/]/i.test(file)).slice(0, 18);
  const authorityText = (await Promise.all(authority.map((file) => readSafeText(file, 12_000)))).join('\n');
  const colors = [...new Set(authorityText.match(/#[0-9a-f]{3,8}\b/gi) || [])].slice(0, 24);
  const fontMentions = [...new Set([...authorityText.matchAll(/font(?:-family)?\s*[:=]\s*["']?([^\n;"']+)/gi)].map((match) => match[1].trim()))].slice(0, 16);
  return {
    ok: true,
    client: { id: client.id, displayName: client.displayName, status: client.status },
    authorityFiles: relativeList(clientRoot, authority),
    approvedAssetCandidates: relativeList(clientRoot, assets).slice(0, 120),
    fontFiles: relativeList(clientRoot, fonts).slice(0, 40),
    extractedColors: colors,
    extractedFontMentions: fontMentions,
    voiceSource: authority.find((file) => /voice/i.test(file)) ? relativeList(clientRoot, authority.filter((file) => /voice/i.test(file))) : [],
    caveat: 'Candidates come only from the resolved client folder. Claude must prefer explicit approved/verified labels and stop on ambiguous provenance.'
  };
}

function validatePublicHttps(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== 'https:') throw new Error(`Only HTTPS public sources are allowed: ${rawUrl}`);
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
    throw new Error(`Private or loopback source blocked: ${rawUrl}`);
  }
  return url;
}

async function fetchPublicText(rawUrl, maxChars = 14_000) {
  const url = validatePublicHttps(rawUrl);
  const response = await fetch(url, { headers: { 'user-agent': 'DillonCreativeFactory/0.1 (+research-only)' }, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`${url.hostname} returned HTTP ${response.status}`);
  const html = (await response.text()).slice(0, 150_000);
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return { url: url.href, title: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/<[^>]+>/g, '').trim(), text: text.slice(0, maxChars), fetchedAt: new Date().toISOString() };
}

export async function buildCampaignBrief({ clientId, campaignName, objective, audience, sourceUrls = [], notes = '' }) {
  const { client, clientRoot } = await resolveClient(clientId);
  const brand = await getClientBrandKit({ clientId });
  const research = [];
  const errors = [];
  for (const url of sourceUrls.slice(0, 6)) {
    try { research.push(await fetchPublicText(url)); } catch (error) { errors.push({ url, error: error.message }); }
  }
  const dir = await artifactDir(clientRoot, 'campaign-brief', campaignName);
  const brief = {
    schemaVersion: 1,
    status: 'draft',
    clientId: client.id,
    campaignName,
    objective,
    audience,
    notes,
    brandAuthority: brand.authorityFiles,
    approvedAssetCandidates: brand.approvedAssetCandidates.slice(0, 30),
    research: research.map(({ url, title, fetchedAt, text }) => ({ url, title, fetchedAt, excerpt: text.slice(0, 2200) })),
    researchErrors: errors,
    gates: ['No unsupported claims', 'No cross-client assets', 'No sending, publishing, spend, CRM write, or live deployment']
  };
  const output = path.join(dir, 'campaign-brief.json');
  await writeFile(output, `${JSON.stringify(brief, null, 2)}\n`, 'utf8');
  return { ok: true, status: 'draft', artifact: path.relative(repoRoot, output).replaceAll('\\', '/'), brief };
}

export async function createContentPack({ clientId, campaignName, sourceText, primaryCta, channels = ['blog', 'email', 'social-carousel', 'video-script', 'landing-page'] }) {
  const { client, clientRoot } = await resolveClient(clientId);
  const dir = await artifactDir(clientRoot, 'content-pack', campaignName);
  const source = String(sourceText).trim();
  const common = `Client: ${client.displayName}\nCampaign: ${campaignName}\nPrimary CTA: ${primaryCta}\nStatus: DRAFT — approval required before external use.\n\nSource of truth:\n${source}\n`;
  const templates = {
    blog: `# ${campaignName}\n\n${textBlock('Reader promise', source.slice(0, 900))}${textBlock('Draft structure', 'Opening context\n\nThree evidence-backed sections\n\nPractical takeaway\n\nCTA: ' + primaryCta)}`,
    email: `# Email draft\n\nSubject: ${campaignName}\n\n${source.slice(0, 1200)}\n\n${primaryCta}\n`,
    'social-carousel': `# Social carousel\n\nSlide 1: ${campaignName}\n\nSlide 2: The problem\n\nSlide 3: What the source establishes\n\nSlide 4: Practical next step\n\nSlide 5: ${primaryCta}\n`,
    'video-script': `# Video script\n\nHook: ${campaignName}\n\nVoiceover source points:\n${source.slice(0, 1400)}\n\nClose: ${primaryCta}\n`,
    'landing-page': `# Landing page draft\n\n## ${campaignName}\n\n${source.slice(0, 1500)}\n\n### Next step\n\n${primaryCta}\n`
  };
  const created = [];
  for (const channel of channels) {
    if (!templates[channel]) continue;
    const file = path.join(dir, `${slugify(channel)}.md`);
    await writeFile(file, `${common}\n${templates[channel]}`, 'utf8');
    created.push(path.relative(repoRoot, file).replaceAll('\\', '/'));
  }
  await writeFile(path.join(dir, 'manifest.json'), `${JSON.stringify({ schemaVersion: 1, status: 'draft', clientId: client.id, campaignName, sourceDigest: sha256(source), channels, createdAt: new Date().toISOString() }, null, 2)}\n`);
  return { ok: true, status: 'draft', artifacts: created, externalActionAttempted: false };
}

export async function createDesignDraft({ clientId, campaignName, platform, briefPath, format = 'presentation' }) {
  const { client, clientRoot } = await resolveClient(clientId);
  const brand = await getClientBrandKit({ clientId });
  const dir = await artifactDir(clientRoot, 'design-draft', campaignName);
  const manifest = {
    schemaVersion: 1,
    status: 'adapter-ready-draft',
    clientId: client.id,
    campaignName,
    platform,
    format,
    briefPath,
    brandAuthority: brand.authorityFiles,
    assets: brand.approvedAssetCandidates.slice(0, 30),
    adapterState: process.env[`DCF_${String(platform).toUpperCase()}_ENABLED`] === 'true' ? 'configured' : 'not-connected',
    instruction: 'Create a private draft only. Do not publish, share externally, or substitute assets from another client.'
  };
  const output = path.join(dir, `${slugify(platform)}-design-draft.json`);
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
  return { ok: true, status: manifest.adapterState === 'configured' ? 'ready-for-adapter' : 'adapter-not-connected', artifact: path.relative(repoRoot, output).replaceAll('\\', '/'), manifest };
}

export async function findFreeAiTool({ query, modality, limit = 8 }) {
  const searches = [query, `${query}-${modality}`, modality];
  let spaces = [];
  for (const candidate of searches) {
    const search = encodeURIComponent(String(candidate).trim().replace(/\s+/g, '-'));
    const response = await fetch(`https://huggingface.co/api/spaces?search=${search}&limit=${Math.min(limit * 3, 30)}&sort=likes`, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Hugging Face returned HTTP ${response.status}`);
    spaces = await response.json();
    if (spaces.length) break;
  }
  const results = spaces.filter((space) => !/higgsfield/i.test(space.id || '')).slice(0, limit).map((space) => ({
    id: space.id,
    url: `https://huggingface.co/spaces/${space.id}`,
    likes: space.likes ?? null,
    sdk: space.sdk ?? null,
    status: space.runtime?.stage ?? null,
    freeStatus: 'verify-on-open',
    note: 'Listed by Hugging Face Spaces; availability, queue time, license, and free usage can change.'
  }));
  return { ok: true, provider: 'Hugging Face Spaces', excluded: ['Higgsfield'], query, modality, results };
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: options.cwd, windowsHide: true, shell: false, env: { ...process.env, ...(options.env || {}) } });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error(`${command} timed out`)); }, options.timeout || 120_000);
    child.stdout.on('data', (chunk) => { stdout += chunk; if (stdout.length > 40_000) stdout = stdout.slice(-40_000); });
    child.stderr.on('data', (chunk) => { stderr += chunk; if (stderr.length > 40_000) stderr = stderr.slice(-40_000); });
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
  });
}

export async function buildWebsitePreview({ clientId, sitePath }) {
  const { client, clientRoot } = await resolveClient(clientId);
  const siteRoot = assertWithin(clientRoot, path.resolve(clientRoot, sitePath), 'sitePath');
  const packageFile = path.join(siteRoot, 'package.json');
  const pkg = await readJson(packageFile);
  if (!pkg.scripts?.build) throw new Error('The resolved site has no npm build script');
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = await runProcess(npmCommand, ['run', 'build'], { cwd: siteRoot, timeout: 300_000 });
  const manifest = { schemaVersion: 1, clientId: client.id, sitePath: path.relative(clientRoot, siteRoot).replaceAll('\\', '/'), command: 'npm run build', exitCode: result.code, stdoutTail: result.stdout.slice(-8000), stderrTail: result.stderr.slice(-8000), liveDeploymentAttempted: false, createdAt: new Date().toISOString() };
  const output = path.join(siteRoot, '.claude-preview.json');
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
  return { ok: result.code === 0, status: result.code === 0 ? 'preview-built' : 'build-failed', artifact: path.relative(repoRoot, output).replaceAll('\\', '/'), ...manifest };
}

function chromeExecutable() {
  const candidates = [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'].filter(Boolean);
  return candidates[0];
}

export async function runVisualQa({ clientId, url, label = 'visual-qa' }) {
  const { client, clientRoot } = await resolveClient(clientId);
  const target = new URL(url);
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Visual QA accepts only HTTP(S) URLs');
  const { chromium } = await import('playwright-core');
  const executablePath = chromeExecutable();
  await access(executablePath);
  const dir = await artifactDir(clientRoot, 'visual-qa', label);
  const browser = await chromium.launch({ executablePath, headless: true });
  const checks = [];
  try {
    for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport });
      const consoleErrors = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      const response = await page.goto(target.href, { waitUntil: 'networkidle', timeout: 45_000 });
      const screenshot = path.join(dir, `${viewport.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      const evaluation = await page.evaluate(() => ({
        title: document.title,
        lang: document.documentElement.lang || null,
        viewportMeta: Boolean(document.querySelector('meta[name="viewport"]')),
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        imagesWithoutAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
        unlabeledControls: [...document.querySelectorAll('input,select,textarea')].filter((control) => !control.labels?.length && !control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby')).length,
        headings: [...document.querySelectorAll('h1')].length
      }));
      checks.push({ viewport, httpStatus: response?.status() ?? null, screenshot: path.relative(repoRoot, screenshot).replaceAll('\\', '/'), consoleErrors: consoleErrors.slice(0, 20), ...evaluation });
      await page.close();
    }
  } finally { await browser.close(); }
  const report = { schemaVersion: 1, clientId: client.id, url: target.href, status: checks.every((c) => c.httpStatus < 400 && !c.horizontalOverflow && c.consoleErrors.length === 0) ? 'passed-basic-gates' : 'findings', checks, note: 'Automated baseline only; branding authority still requires human visual review.' };
  const output = path.join(dir, 'visual-qa.json');
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  return { ok: true, artifact: path.relative(repoRoot, output).replaceAll('\\', '/'), report };
}

export async function inspectMedia({ clientId, mediaPath, extractFrames = true }) {
  const { client, clientRoot } = await resolveClient(clientId);
  const input = assertWithin(clientRoot, path.resolve(clientRoot, mediaPath), 'mediaPath');
  const probe = await runProcess('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size,bit_rate:stream=index,codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels:stream_tags=language,title', '-of', 'json', input], { timeout: 60_000 });
  if (probe.code !== 0) throw new Error(`ffprobe failed: ${probe.stderr.slice(-1200)}`);
  const metadata = JSON.parse(probe.stdout);
  const duration = Number(metadata.format?.duration || 0);
  const dir = await artifactDir(clientRoot, 'media-inspection', path.basename(input, path.extname(input)));
  const frames = [];
  if (extractFrames && duration > 0) {
    for (const [name, ratio] of [['opening', 0.1], ['middle', 0.5], ['closing', 0.9]]) {
      const frame = path.join(dir, `${name}.jpg`);
      const result = await runProcess('ffmpeg', ['-y', '-ss', String(duration * ratio), '-i', input, '-frames:v', '1', '-q:v', '2', frame], { timeout: 90_000 });
      if (result.code === 0) frames.push(path.relative(repoRoot, frame).replaceAll('\\', '/'));
    }
  }
  const report = { schemaVersion: 1, clientId: client.id, mediaPath: path.relative(clientRoot, input).replaceAll('\\', '/'), durationSeconds: duration, sizeBytes: Number(metadata.format?.size || 0), streams: metadata.streams || [], hasAudio: metadata.streams?.some((s) => s.codec_type === 'audio') || false, hasVideo: metadata.streams?.some((s) => s.codec_type === 'video') || false, hasCaptions: metadata.streams?.some((s) => s.codec_type === 'subtitle') || false, representativeFrames: frames };
  const output = path.join(dir, 'media-inspection.json');
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  return { ok: true, artifact: path.relative(repoRoot, output).replaceAll('\\', '/'), report };
}

export async function researchProspect({ businessName, websiteUrl, location = '' }) {
  const source = await fetchPublicText(websiteUrl, 20_000);
  const clients = await loadRegistry();
  const normalized = slugify(businessName);
  const duplicates = clients.filter((client) => slugify(client.displayName) === normalized || (client.aliases || []).some((alias) => slugify(alias) === normalized)).map((client) => client.id);
  return { ok: true, status: duplicates.length ? 'duplicate-client-match' : 'researched', businessName, location, firstPartySource: source.url, pageTitle: source.title, evidenceExcerpt: source.text.slice(0, 5000), duplicateClientIds: duplicates, caveat: 'First-party website evidence only. Identity, location fit, and logo provenance must be confirmed before creative use.' };
}

export async function packageClientDelivery({ clientId, name, artifactPaths, format = 'zip' }) {
  const { client, clientRoot } = await resolveClient(clientId);
  const files = [];
  for (const artifactPath of artifactPaths.slice(0, 50)) {
    const full = assertWithin(clientRoot, path.resolve(clientRoot, artifactPath), 'artifactPath');
    if ((await stat(full)).isFile()) files.push(full);
  }
  if (!files.length) throw new Error('No valid client artifacts supplied');
  const dir = await artifactDir(clientRoot, 'delivery-package', name);
  const manifestFiles = await Promise.all(relativeList(clientRoot, files).map(async (file, index) => ({ path: file, sha256: sha256(await readFile(files[index])) })));
  const manifest = { schemaVersion: 1, clientId: client.id, name, status: 'packaged-not-sent', files: manifestFiles, createdAt: new Date().toISOString(), externalActionAttempted: false };
  const manifestPath = path.join(dir, 'delivery-manifest.json');
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  if (format === 'manifest') return { ok: true, status: manifest.status, artifact: path.relative(repoRoot, manifestPath).replaceAll('\\', '/') };
  const zipPath = path.join(dir, `${slugify(name)}.zip`);
  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve); output.on('error', reject); archive.on('error', reject); archive.pipe(output);
    for (const file of files) archive.file(file, { name: path.basename(file) });
    archive.file(manifestPath, { name: 'delivery-manifest.json' });
    archive.finalize();
  });
  return { ok: true, status: manifest.status, artifact: path.relative(repoRoot, zipPath).replaceAll('\\', '/'), fileCount: files.length };
}

export async function searchAgentVault({ query, limit = 12 }) {
  const root = path.resolve(agentVaultRoot);
  const files = (await walk(root, { maxFiles: 900, maxDepth: 7 })).filter((file) => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()) && !/[\\/]notes[\\/]inbox[\\/]/i.test(file));
  const needle = String(query).toLowerCase();
  const matches = [];
  for (const file of files) {
    const text = await readSafeText(file, 80_000);
    const index = text.toLowerCase().indexOf(needle);
    if (index < 0) continue;
    matches.push({ path: path.relative(root, file).replaceAll('\\', '/'), excerpt: text.slice(Math.max(0, index - 220), index + needle.length + 420).replace(/\s+/g, ' ').trim() });
    if (matches.length >= limit) break;
  }
  return { ok: true, source: 'redacted-agent-vault', query, matches, rawCredentialsSearched: false, rawCommunicationsSearched: false };
}

export async function getApprovalBoard({ clientId } = {}) {
  const queue = await readJson(path.join(repoRoot, 'queue', 'work-items.json'));
  let items = queue.workItems || [];
  if (clientId) {
    const { client } = await resolveClient(clientId);
    items = items.filter((item) => item.clientId === client.id);
  }
  const board = { ready: [], blocked: [], needsApproval: [] };
  for (const item of items) {
    const view = { id: item.id, clientId: item.clientId, title: item.title, status: item.status, priority: item.priority?.level, nextAction: item.nextAction, approval: item.approval?.status || null };
    if (item.approval?.status === 'pending') board.needsApproval.push(view);
    else if (['blocked', 'failed', 'quarantined'].includes(item.status)) board.blocked.push(view);
    else if (['ready', 'in_progress', 'review', 'pending'].includes(item.status)) board.ready.push(view);
  }
  return { ok: true, queueRevision: queue.revision, generatedAt: new Date().toISOString(), ...board };
}
