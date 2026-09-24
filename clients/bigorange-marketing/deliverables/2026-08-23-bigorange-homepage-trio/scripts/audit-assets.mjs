import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sites = ['citrus-foundry', 'blueprint-frequency', 'orange-press'];
const expectedContentImages = { 'citrus-foundry': 4, 'blueprint-frequency': 4, 'orange-press': 7 };
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const report = { checkedAt: new Date().toISOString(), sites: {}, duplicates: [], missingReferences: [] };
const contentHashes = new Map();

for (const site of sites) {
  const siteRoot = join(root, site);
  const assetsRoot = join(siteRoot, 'assets');
  const files = readdirSync(assetsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()))
    .map((entry) => join(assetsRoot, entry.name));
  const contentFiles = files.filter((file) => !basename(file).toLowerCase().includes('logo'));
  if (contentFiles.length !== expectedContentImages[site]) throw new Error(`${site}: expected ${expectedContentImages[site]} content images, found ${contentFiles.length}`);
  const entries = contentFiles.map((file) => {
    const bytes = readFileSync(file);
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (contentHashes.has(hash)) report.duplicates.push([relative(root, contentHashes.get(hash)), relative(root, file)]);
    else contentHashes.set(hash, file);
    return { file: relative(root, file).replaceAll('\\', '/'), bytes: statSync(file).size, sha256: hash };
  });
  const html = readFileSync(join(siteRoot, 'index.html'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]).filter((value) => !/^(?:https?:|#|mailto:|tel:)/.test(value));
  for (const ref of refs) {
    const target = resolve(siteRoot, ref.split('#')[0]);
    if (!target.startsWith(siteRoot) || !existsSync(target)) report.missingReferences.push(`${site}/${ref}`);
  }
  report.sites[site] = { contentImages: entries, referencedLocalAssets: refs.length };
}

if (report.duplicates.length) throw new Error(`Duplicate content images found: ${JSON.stringify(report.duplicates)}`);
if (report.missingReferences.length) throw new Error(`Missing local references: ${report.missingReferences.join(', ')}`);
console.log(JSON.stringify(report, null, 2));
