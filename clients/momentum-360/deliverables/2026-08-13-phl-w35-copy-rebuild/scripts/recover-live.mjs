import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://phl-2026-w35.netlify.app';
const outDir = path.resolve('dist');

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function save(publicPath) {
  const relativePath = publicPath.replace(/^\//, '');
  const target = path.join(outDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await fetchBuffer(`${origin}${publicPath}`));
}

const hub = (await fetchBuffer(`${origin}/`)).toString('utf8');
const slugs = [...hub.matchAll(/href=['"]\/sites\/([^/]+)\//g)].map((match) => match[1]);
const uniqueSlugs = [...new Set(slugs)];

if (uniqueSlugs.length !== 25) {
  throw new Error(`Expected 25 prospect sites, found ${uniqueSlugs.length}`);
}

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'index.html'), hub, 'utf8');
await writeFile(
  path.join(outDir, '_headers'),
  '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n',
  'utf8',
);

for (const slug of uniqueSlugs) {
  await save(`/sites/${slug}/index.html`);
  await save(`/sites/${slug}/assets/logo.png`);
  for (let index = 1; index <= 13; index += 1) {
    await save(`/sites/${slug}/assets/image-${index}.webp`);
  }
}

console.log(JSON.stringify({ origin, outDir, sites: uniqueSlugs.length, files: 2 + uniqueSlugs.length * 15 }, null, 2));
