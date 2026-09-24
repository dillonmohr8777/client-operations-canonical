import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const projectRoot = path.resolve(import.meta.dirname, '..');
const siteRoot = path.join(projectRoot, 'site');
const sitesRoot = path.join(siteRoot, 'sites');
const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, 'review-manifest.json'), 'utf8'));

const decode = (value = '') => value
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&#(x?[0-9a-f]+);/gi, (whole, raw) => {
    const hex = /^x/i.test(raw);
    const code = Number.parseInt(hex ? raw.slice(1) : raw, hex ? 16 : 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
  });

const visibleText = (html) => decode(html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' '));

const localImageSources = (html) => [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
  .map((match) => match[1])
  .filter((source) => !/^(?:data:|https?:|\/\/)/i.test(source));

const hashFile = async (filePath) => crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex');

const rows = [];

for (const item of manifest.sites) {
  const sitePath = path.join(sitesRoot, item.slug);
  const indexPath = path.join(sitePath, 'index.html');
  const html = await fs.readFile(indexPath, 'utf8');
  const text = visibleText(html);
  const sources = localImageSources(html);
  const broken = [];
  const hashes = [];

  for (const source of sources) {
    const resolved = path.resolve(sitePath, source.split(/[?#]/)[0]);
    try {
      const stats = await fs.stat(resolved);
      if (!stats.isFile()) broken.push(source);
      else hashes.push({ source, hash: await hashFile(resolved) });
    } catch {
      broken.push(source);
    }
  }

  const logoSources = sources.filter((source) => /logo/i.test(source));
  const uniqueLogos = [...new Set(logoSources)];
  let logoTransparent = false;
  let logoDimensions = null;
  if (item.logoOutput) {
    const logoPath = path.join(sitePath, 'assets', item.logoOutput);
    if (/\.svg$/i.test(logoPath)) {
      logoTransparent = true;
    } else {
      const image = sharp(logoPath, { failOn: 'none' });
      const metadata = await image.metadata();
      const stats = await image.stats();
      logoTransparent = Boolean(metadata.hasAlpha && stats.channels[3] && stats.channels[3].min < 250);
      logoDimensions = [metadata.width, metadata.height];
    }
  }

  const nonLogo = hashes.filter((entry) => !/logo/i.test(entry.source));
  const duplicateGroups = Object.values(Object.groupBy(nonLogo, (entry) => entry.hash)).filter((group) => group.length > 1);
  const hasTopLogo = /<header\b[\s\S]*?<img\b[^>]*(?:src|class)=["'][^"']*logo[^"']*["'][^>]*>[\s\S]*?<\/header>/i.test(html);
  const hasBottomLogo = /(?:<footer\b[\s\S]*?<img\b[^>]*(?:src|class)=["'][^"']*logo[^"']*["'][^>]*>[\s\S]*?<\/footer>|class=["'][^"']*(?:logo-finale|footmark|review-footer-logo)[^"']*["'][\s\S]*?<img\b[^>]*(?:src|class)=["'][^"']*logo)/i.test(html);
  const logoTagCount = (html.match(/<img\b[^>]*(?:\bsrc=["'][^"']*logo[^"']*["']|\bclass=["'][^"']*logo[^"']*["'])[^>]*>/gi) || []).length;
  const invalidTelephoneLinks = [...html.matchAll(/href=["']tel:([^"']+)["']/gi)]
    .map((match) => match[1].replace(/\D/g, ''))
    .filter((digits) => ![10, 11].includes(digits.length));

  const issues = [];
  if (!/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) && !/content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html)) issues.push('noindex_missing');
  if (broken.length) issues.push('broken_local_images');
  if (nonLogo.length < 5) issues.push('insufficient_imagery');
  if (duplicateGroups.length) issues.push('duplicate_non_logo_images');
  if (!logoTransparent) issues.push('logo_not_transparent');
  if (!hasTopLogo) issues.push('top_logo_missing');
  if (!hasBottomLogo) issues.push('bottom_logo_missing');
  if (logoTagCount !== 2) issues.push('logo_count_not_two');
  if (/&amp;|&quot;|&#\d+;/i.test(text)) issues.push('visible_encoded_entity');
  if (/[—–]/.test(text)) issues.push('dash_punctuation');
  if (/\(\s*\d{1,3}\s*\/\s*\d{1,3}\s*\)/.test(text)) issues.push('batch_counter_visible');
  if (/mailto:|\bqr(?: code|code)?\b/i.test(html)) issues.push('mail_or_qr_present');
  if (invalidTelephoneLinks.length) issues.push('invalid_phone_link');
  if (/gets a private concept homepage, not a mailed pitch|Details stay with them|\bGe in touch\b/i.test(text)) issues.push('internal_or_broken_copy');
  if (!/review-system\.css/i.test(html) || !/review-system\.js/i.test(html)) issues.push('review_layer_missing');

  rows.push({
    ...item,
    imageCount: nonLogo.length,
    broken,
    duplicateGroups: duplicateGroups.map((group) => group.map((entry) => entry.source)),
    logoSources: uniqueLogos,
    logoTransparent,
    logoDimensions,
    hasTopLogo,
    hasBottomLogo,
    logoTagCount,
    invalidTelephoneLinks,
    issues,
    pass: issues.length === 0
  });
}

const report = {
  total: rows.length,
  pass: rows.filter((row) => row.pass).length,
  hold: rows.filter((row) => !row.pass).length,
  issueCounts: Object.fromEntries(Object.entries(Object.groupBy(rows.flatMap((row) => row.issues), (issue) => issue)).map(([issue, values]) => [issue, values.length])),
  rows
};

await fs.writeFile(path.join(projectRoot, 'qa-structural.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ total: report.total, pass: report.pass, hold: report.hold, issueCounts: report.issueCounts }, null, 2));
if (report.hold) process.exitCode = 2;
