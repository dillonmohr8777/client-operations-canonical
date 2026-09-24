import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { founderBySlug } from './founders.mjs';

const root = path.resolve('dist');
const sitesRoot = path.join(root, 'sites');
const banned = [
  /a real street/i,
  /real image/i,
  /generated not photographed/i,
  /work that belongs here/i,
  /different work\. one standard/i,
  /the current site still shows/i,
  /radar flagged/i,
  /on the harvest/i,
  /homepage that names the next step/i,
  /people who already know the shop/i,
  /look at the work/i,
  /ways into the experience/i,
  /private staging concept/i,
  /noindex preview for review/i,
  /industry focus/i,
  /industry context/i,
];

const strip = (html) => html
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalize = (value) => strip(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const slugs = (await readdir(sitesRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const issues = [];
const pages = [];
const proseIndex = new Map();

for (const slug of slugs) {
  const file = path.join(sitesRoot, slug, 'index.html');
  const html = await readFile(file, 'utf8');
  const visible = strip(html);
  const words = visible.split(/\s+/).filter(Boolean).length;
  const h1Count = (html.match(/<h1\b/g) || []).length;
  const bodyIdCount = (html.match(/<body\b/g) || []).length;
  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => strip(match[1])).filter(Boolean);
  const local = new Map();

  if (words < 750) issues.push({ slug, rule: 'word-count', detail: `${words} words` });
  if (h1Count !== 1) issues.push({ slug, rule: 'h1-count', detail: h1Count });
  if (bodyIdCount !== 1) issues.push({ slug, rule: 'body-count', detail: bodyIdCount });
  if (!/<meta name="robots" content="noindex,nofollow">/.test(html)) issues.push({ slug, rule: 'noindex-missing' });
  if (!/@media\(prefers-reduced-motion:reduce\)/.test(html)) issues.push({ slug, rule: 'reduced-motion-missing' });
  if (!/<a class="skip-link" href="#main">/.test(html)) issues.push({ slug, rule: 'skip-link-missing' });
  if (/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>\s*<h[1-6]/i.test(html)) issues.push({ slug, rule: 'adjacent-headings' });
  if ((html.match(/id="logo-magic-ink"/g) || []).length !== 1) issues.push({ slug, rule: 'magic-ink-script-count' });
  if ((html.match(/data-magic-ink-logo/g) || []).length !== 2) issues.push({ slug, rule: 'magic-ink-target-count' });
  if ((html.match(/class="logo-outro-mark"/g) || []).length !== 1) issues.push({ slug, rule: 'magic-ink-logo-count' });
  if (!/blur\(26px\) contrast\(2\.4\) saturate\(\.3\)/.test(html)) issues.push({ slug, rule: 'magic-ink-filter-missing' });
  if (!/opacity 1\.4s ease-out,transform 2\.1s cubic-bezier\(\.17,\.4,\.02,\.99\),filter 2\.3s ease-out/.test(html)) issues.push({ slug, rule: 'magic-ink-timing-missing' });
  if (!/threshold:\.12,rootMargin:'0px 0px -8% 0px'/.test(html)) issues.push({ slug, rule: 'magic-ink-observer-missing' });
  if (/<canvas\b|logo-particle|__phlLogoParticle|getImageData|ctx\.arc|is-dissolving|is-dissolved|data-ink-logo|ink-bloom|is-inked/i.test(html)) issues.push({ slug, rule: 'bubble-logo-system-present' });

  const founder = founderBySlug[slug];
  const founderCardCount = (html.match(/<figure class="founder-card/g) || []).length;
  if (founder && founderCardCount !== founder.people.length) issues.push({ slug, rule: 'founder-card-count', detail: `${founderCardCount}/${founder.people.length}` });
  if (!founder && founderCardCount !== 0) issues.push({ slug, rule: 'unexpected-founder-section', detail: founderCardCount });

  for (const pattern of banned) {
    if (pattern.test(visible)) issues.push({ slug, rule: 'banned-copy', detail: pattern.source });
  }

  for (const paragraph of paragraphs) {
    const key = normalize(paragraph);
    if (key.split(' ').length < 10) continue;
    if (local.has(key)) issues.push({ slug, rule: 'duplicate-paragraph', detail: paragraph });
    local.set(key, true);
    const owners = proseIndex.get(key) || [];
    owners.push(slug);
    proseIndex.set(key, owners);
  }

  const imageRefs = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)].map((match) => match[1]);
  for (const src of imageRefs) {
    if (!src.startsWith('assets/')) continue;
    try { await access(path.join(sitesRoot, slug, src)); }
    catch { issues.push({ slug, rule: 'missing-image', detail: src }); }
  }

  const emptyAlts = [...html.matchAll(/<img\b[^>]*\balt=""[^>]*>/gi)].filter((match) => !/aria-hidden="true"/.test(match[0]));
  if (emptyAlts.length) issues.push({ slug, rule: 'empty-informative-alt', detail: emptyAlts.length });
  if (/alt="[^"]*(generated|real image|photographed)[^"]*"/i.test(html)) issues.push({ slug, rule: 'artifact-alt-copy' });

  pages.push({ slug, words, paragraphs: paragraphs.length, images: imageRefs.length, h1Count });
}

for (const [paragraph, owners] of proseIndex) {
  const uniqueOwners = [...new Set(owners)];
  if (uniqueOwners.length > 1) issues.push({ rule: 'cross-site-duplicate-prose', sites: uniqueOwners, detail: paragraph });
}

const hub = await readFile(path.join(root, 'index.html'), 'utf8');
if ((hub.match(/class='card'/g) || []).length !== 25) issues.push({ rule: 'hub-card-count' });
if (banned.some((pattern) => pattern.test(strip(hub)))) issues.push({ rule: 'hub-banned-copy' });

const report = {
  generatedAt: new Date().toISOString(),
  passed: issues.length === 0,
  summary: {
    sites: pages.length,
    minWords: Math.min(...pages.map((page) => page.words)),
    maxWords: Math.max(...pages.map((page) => page.words)),
    totalImages: pages.reduce((sum, page) => sum + page.images, 0),
    issues: issues.length,
  },
  pages,
  issues,
};

await writeFile(path.resolve('FINAL-QA.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
if (!report.passed) process.exitCode = 1;
