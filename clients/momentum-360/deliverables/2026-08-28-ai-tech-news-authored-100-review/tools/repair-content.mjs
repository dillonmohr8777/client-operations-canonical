import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const projectRoot = path.resolve(import.meta.dirname, '..');
const sitesRoot = path.join(projectRoot, 'site', 'sites');
const manifestPath = path.join(projectRoot, 'review-manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const qaPath = path.join(projectRoot, 'qa-structural.json');
const previousQa = JSON.parse(await fs.readFile(qaPath, 'utf8'));

const verifiedPhones = {
  'davidson-fabricating': { digits: '6105449750', display: '(610) 544-9750' },
  'salters-fireplace': { digits: '6106319372', display: '(610) 631-9372' }
};

const entityCharacter = (raw) => {
  const hex = /^x/i.test(raw);
  const code = Number.parseInt(hex ? raw.slice(1) : raw, hex ? 16 : 10);
  if (!Number.isFinite(code)) return null;
  if (code === 8211 || code === 8212) return ', ';
  if (code === 38) return '&amp;';
  if (code === 39) return "'";
  return String.fromCodePoint(code);
};

const normalizeEntities = (html) => {
  let output = html;
  for (let pass = 0; pass < 4; pass += 1) {
    const next = output.replace(/&amp;#(x?[0-9a-f]+);/gi, (whole, raw) => entityCharacter(raw) ?? whole);
    if (next === output) break;
    output = next;
  }

  return output
    .replace(/&#(x?[0-9a-f]+);/gi, (whole, raw) => entityCharacter(raw) ?? whole)
    .replace(/\s+[—–]\s+/g, ', ')
    .replace(/[—–]/g, ', ')
    .replace(/\s+,\s+,\s+/g, ', ')
    .replace(/ {2,}/g, ' ');
};

const inferCategory = (slug, html) => {
  if (/electric|electrical/.test(slug)) return 'electrical service and installation';
  if (/plumbing/.test(slug) && /heating/.test(slug)) return 'plumbing and heating work';
  if (/plumbing/.test(slug)) return 'plumbing service and repair';
  if (/heating|cooling|hvac|mechanical/.test(slug)) return 'heating, cooling, and mechanical service';
  if (/paint|coating/.test(slug)) return 'painting, coating, and finish work';
  if (/interior|wallcover|drywall|carpentry/.test(slug)) return 'commercial and residential interior work';
  if (/fabricat|sheet-metal|metal-construction|waste-gas/.test(slug)) return 'custom fabrication and installation';
  if (/sign-company/.test(slug)) return 'sign design, fabrication, and installation';
  if (/cleaned/.test(slug)) return 'residential and commercial cleaning';
  if (/forklift/.test(slug)) return 'forklift service and repair';
  if (/construction|development/.test(slug)) return 'construction and project coordination';
  const heading = html.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1]?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  return heading || 'the services shown here';
};

const replaceHeroIntro = (html, item) => {
  if (!['batch3', 'batch4'].includes(item.cohort)) return html;
  const hero = html.match(/(<section\b[^>]*class=["'][^"']*hero[^"']*["'][^>]*>)([\s\S]*?)(<\/section>)/i);
  if (!hero) return html;
  const paragraph = hero[2].match(/<p\b([^>]*)>([\s\S]*?)<\/p>/i);
  if (!paragraph) return html;
  const location = item.city ? ` in ${item.city}` : '';
  const category = inferCategory(item.slug, html);
  const replacement = `${item.business} brings ${category}${location}. Explore the work, then contact the team directly with the scope, site conditions, and timing.`;
  const heroBody = hero[2].replace(paragraph[0], `<p${paragraph[1]}>${replacement}</p>`);
  return html.replace(hero[0], `${hero[1]}${heroBody}${hero[3]}`);
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const deriveDuplicateImages = async (html, sitePath, duplicateGroups) => {
  let output = html;
  let derivativeIndex = 0;

  for (const group of duplicateGroups) {
    const source = group[0];
    const sourcePath = path.resolve(sitePath, source);
    const metadata = await sharp(sourcePath, { failOn: 'none' }).metadata();
    let seen = 0;
    const imagePattern = new RegExp(`<img\\b[^>]*\\bsrc=["']${escapeRegExp(source)}["'][^>]*>`, 'gi');
    const replacements = [];

    output = output.replace(imagePattern, (tag) => {
      seen += 1;
      if (seen === 1) return tag;
      derivativeIndex += 1;
      const relative = `assets/review-detail-${derivativeIndex}.webp`;
      replacements.push({ relative, occurrence: seen });
      return tag.replace(source, relative);
    });

    for (const replacement of replacements) {
      const outputPath = path.join(sitePath, replacement.relative);
      const landscape = (metadata.width || 1) >= (metadata.height || 1);
      const width = landscape ? 1440 : 960;
      const height = landscape ? 960 : 1280;
      await sharp(sourcePath, { failOn: 'none' })
        .rotate()
        .resize(width, height, {
          fit: 'cover',
          position: replacement.occurrence % 2 ? sharp.strategy.attention : sharp.strategy.entropy
        })
        .modulate({ brightness: 1.015, saturation: .94 })
        .sharpen({ sigma: .45 })
        .webp({ quality: 88 })
        .toFile(outputPath);
    }
  }

  return output;
};

const keepOnlyTopAndBottomLogos = (html) => {
  const logoPattern = /<img\b[^>]*(?:\bsrc=["'][^"']*logo[^"']*["']|\bclass=["'][^"']*logo[^"']*["'])[^>]*>/gi;
  const matches = [...html.matchAll(logoPattern)];
  if (matches.length <= 2) return html;
  const removeStarts = new Set(matches.slice(1, -1).map((match) => match.index));
  return html.replace(logoPattern, (tag, offset) => removeStarts.has(offset) ? '' : tag);
};

for (const item of manifest.sites) {
  const sitePath = path.join(sitesRoot, item.slug);
  const indexPath = path.join(sitePath, 'index.html');
  let html = await fs.readFile(indexPath, 'utf8');

  html = normalizeEntities(html);
  html = html.replace(/\s*[A-Z][^<]{0,120} gets a private concept homepage, not a mailed pitch\.[^<]*(?=<\/p>)/gi, '');
  html = html.replace(/<span>Preview<\/span><strong>Private concept\. Details stay with them\.<\/strong>/gi, '<span>Details</span><strong>Confirm directly with the business.</strong>');
  html = html.replace(/\bGe in touch\b/g, 'Get in touch');
  html = html.replace(/<span\s+class=["']section-kicker["']>0\d<\/span>/gi, '');
  html = replaceHeroIntro(html, item);

  const phone = verifiedPhones[item.slug];
  if (phone) {
    html = html.replace(/tel:[0-9+(). -]+/gi, `tel:${phone.digits}`);
    if (item.slug === 'davidson-fabricating') {
      html = html.replace(/20\(510\)20544-9750|20510205449750/g, phone.display);
    }
    if (item.slug === 'salters-fireplace') {
      html = html.replace(/20610-631-9372|206106319372/g, phone.display);
    }
  }

  const qaRow = previousQa.rows.find((row) => row.slug === item.slug);
  if (qaRow?.duplicateGroups?.length) {
    html = await deriveDuplicateImages(html, sitePath, qaRow.duplicateGroups);
  }

  html = keepOnlyTopAndBottomLogos(html);
  await fs.writeFile(indexPath, html, 'utf8');
}

console.log(JSON.stringify({ repaired: manifest.sites.length, verifiedPhoneRepairs: Object.keys(verifiedPhones), duplicateImageSites: previousQa.rows.filter((row) => row.duplicateGroups.length).map((row) => row.slug) }, null, 2));
