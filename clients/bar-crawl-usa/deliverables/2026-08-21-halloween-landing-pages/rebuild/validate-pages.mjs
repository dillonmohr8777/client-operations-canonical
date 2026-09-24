import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const pages = JSON.parse(fs.readFileSync(path.join(root, 'pages.json'), 'utf8'));
const errors = [];
const rows = [];
const seenHeroes = new Map();

const count = (html, pattern) => (html.match(pattern) || []).length;
const textOnly = (html) => html
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

for (const page of pages) {
  const file = path.join(root, 'fragments', `${page.slug}.html`);
  if (!fs.existsSync(file)) {
    errors.push(`${page.slug}: fragment missing`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const visible = textOnly(html);
  const words = visible.match(/\b[\p{L}\p{N}’'-]+\b/gu)?.length || 0;
  const sections = count(html, /<section\b/gi);
  const images = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*\balt="([^"]+)"[^>]*>/gi)];
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const faqs = count(html, /<details\b/gi);
  const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const json = [];
  for (const match of jsonBlocks) {
    try { json.push(JSON.parse(match[1])); }
    catch { errors.push(`${page.slug}: invalid JSON-LD`); }
  }

  const hero = images[0]?.[1];
  if (hero) {
    if (seenHeroes.has(hero)) errors.push(`${page.slug}: hero duplicates ${seenHeroes.get(hero)}`);
    seenHeroes.set(hero, page.slug);
  }

  if (words < 600) errors.push(`${page.slug}: only ${words} visible words`);
  if (sections < 8) errors.push(`${page.slug}: only ${sections} sections`);
  if (images.length < 3) errors.push(`${page.slug}: only ${images.length} images`);
  if (images.some((m) => !m[2].trim())) errors.push(`${page.slug}: empty image alt text`);
  if (h1s.length !== 1) errors.push(`${page.slug}: expected one H1, found ${h1s.length}`);
  if (h1s[0] && textOnly(h1s[0][1]) !== page.h1) errors.push(`${page.slug}: H1 does not match source data`);
  if (faqs !== 5) errors.push(`${page.slug}: expected five visible FAQs, found ${faqs}`);
  if (!json.some((x) => x['@type'] === 'FAQPage' && x.mainEntity?.length === faqs)) errors.push(`${page.slug}: FAQ schema mismatch`);
  if (!json.some((x) => x['@type'] === 'BreadcrumbList' && x.itemListElement?.length === 3)) errors.push(`${page.slug}: breadcrumb schema mismatch`);
  for (const required of [page.event, page.hub, 'https://barcrawlusa.com/boos-booze-halloween-bar-crawl/', page.official[1]]) {
    if (!html.includes(`href="${required}"`)) errors.push(`${page.slug}: missing required link ${required}`);
  }
  if (/screenshot|screen shot/i.test(page.heroAlt)) errors.push(`${page.slug}: screenshot used as hero imagery`);
  if (page.slug !== 'cincinnati-halloween-bar-crawl-2026' && /party Cincy won.t forget/i.test(visible)) errors.push(`${page.slug}: copied Cincinnati sentence present`);
  if (/[\u2010-\u2015-]/.test(visible)) errors.push(`${page.slug}: visible dash punctuation present`);

  rows.push({slug: page.slug, words, sections, images: images.length, faqs, jsonLd: json.length, uniqueHero: Boolean(hero)});
}

const bySlug = Object.fromEntries(pages.map((p) => [p.slug, fs.readFileSync(path.join(root, 'fragments', `${p.slug}.html`), 'utf8')]));
if (!/No verified 2026 Midtown Halloween record is public/.test(bySlug['atlanta-halloween-bar-crawls-2026']) || /Bubbles & Bites/i.test(bySlug['atlanta-halloween-bar-crawls-2026'])) errors.push('Atlanta: Midtown source gate is not preserved');
if (/October 25/.test(bySlug['cleveland-halloween-bar-crawls-2026'])) errors.push('Cleveland: stale Lakewood October 25 date present');
if (!/Crawl 4 PM to 10 PM/.test(bySlug['portland-me-halloween-bar-crawl-2026']) || !/after party at 11 PM/i.test(bySlug['portland-me-halloween-bar-crawl-2026'])) errors.push('Portland: crawl and after party windows are not separated');
if (/3 PM to 10 PM/.test(bySlug['sarasota-halloween-bar-crawl-2026']) || !/Registration 3 PM to 6 PM/.test(bySlug['sarasota-halloween-bar-crawl-2026'])) errors.push('Sarasota: unsupported whole event window present');

console.table(rows);
if (errors.length) {
  console.error(`\n${errors.length} validation error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`\nValidated ${rows.length} complete, source-safe draft fragments.`);
