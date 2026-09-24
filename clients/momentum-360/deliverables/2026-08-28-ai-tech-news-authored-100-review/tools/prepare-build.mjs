import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const projectRoot = path.resolve(import.meta.dirname, '..');
const siteRoot = path.join(projectRoot, 'site');
const sitesRoot = path.join(siteRoot, 'sites');
const selectedUnslop = new Set(JSON.parse(await fs.readFile(path.join(projectRoot, 'selected-unslop.json'), 'utf8')));

const sourceRoots = {
  batch2: 'C:/Users/dillo/Documents/Codex/2026-08-05/all-100-websites-that-we-ve/publish-packages/b2',
  batch3: 'C:/Users/dillo/Documents/Codex/2026-08-05/all-100-websites-that-we-ve/publish-packages/b3/sites',
  batch4: 'C:/Users/dillo/Documents/Codex/2026-08-05/all-100-websites-that-we-ve/publish-packages/b4/sites'
};

const cohortSets = {};
for (const [cohort, root] of Object.entries(sourceRoots)) {
  cohortSets[cohort] = new Set((await fs.readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name));
}

const siteDirectories = (await fs.readdir(sitesRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (siteDirectories.length !== 100) {
  throw new Error(`Expected 100 site directories, found ${siteDirectories.length}`);
}

const htmlDecode = (value = '') => value
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&nbsp;/gi, ' ');

const stripTags = (value = '') => htmlDecode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const cleanBusinessName = (value = '') => value
  .replace(/\s*\(\s*\d{1,3}\s*\/\s*\d{1,3}\s*\)\s*/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim();

const cleanVisitorCopy = (value = '') => value
  .replace(/&amp;amp;/gi, '&amp;')
  .replace(/\s*\(\s*\d{1,3}\s*\/\s*\d{1,3}\s*\)\s*/g, ' ')
  .replace(/\s+[—–]\s+/g, ', ')
  .replace(/[—–]/g, ', ')
  .replace(/\u00a0/g, ' ')
  .replace(/ {2,}/g, ' ');

const openingVariants = ['rise', 'focus', 'wipe', 'settle'];
const openingFor = (slug) => openingVariants[crypto.createHash('sha256').update(slug).digest()[0] % openingVariants.length];

const cohortFor = (slug) => {
  if (selectedUnslop.has(slug)) return 'unslop25';
  for (const cohort of ['batch2', 'batch3', 'batch4']) {
    if (cohortSets[cohort].has(slug)) return cohort;
  }
  throw new Error(`No cohort binding for ${slug}`);
};

const extractJsonLd = (html) => {
  const matches = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of matches) {
    try {
      const value = JSON.parse(match[1]);
      if (value && typeof value === 'object') return value;
    } catch {}
  }
  return {};
};

const alphaState = async (filePath) => {
  if (/\.svg$/i.test(filePath)) {
    const source = await fs.readFile(filePath, 'utf8');
    const fullBackground = /<rect\b[^>]*(?:width=["'](?:100%|\d{3,})["'])[^>]*(?:height=["'](?:100%|\d{3,})["'])/i.test(source);
    return { transparent: !fullBackground, hasAlpha: true, svg: true, fullBackground };
  }

  const image = sharp(filePath, { failOn: 'none' });
  const metadata = await image.metadata();
  const stats = await image.stats();
  const alpha = stats.channels[3];
  return {
    transparent: Boolean(metadata.hasAlpha && alpha && alpha.min < 250),
    hasAlpha: Boolean(metadata.hasAlpha),
    svg: false,
    width: metadata.width,
    height: metadata.height,
    alphaMin: alpha?.min ?? 255
  };
};

const makeTransparentDerivative = async (inputPath, outputPath) => {
  const image = sharp(inputPath, { failOn: 'none' }).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const points = [
    0,
    (info.width - 1) * info.channels,
    (info.height - 1) * info.width * info.channels,
    ((info.height * info.width) - 1) * info.channels
  ];
  const background = [0, 1, 2].map((channel) => Math.round(points.reduce((sum, offset) => sum + data[offset + channel], 0) / points.length));
  const cornerSpread = Math.max(...points.flatMap((offset) => [0, 1, 2].map((channel) => Math.abs(data[offset + channel] - background[channel]))));

  if (cornerSpread > 34) {
    await sharp(inputPath, { failOn: 'none' }).ensureAlpha().png().toFile(outputPath);
    return { converted: false, reason: 'corner_background_not_uniform', background, cornerSpread };
  }

  for (let offset = 0; offset < data.length; offset += info.channels) {
    const distance = Math.sqrt(
      ((data[offset] - background[0]) ** 2) +
      ((data[offset + 1] - background[1]) ** 2) +
      ((data[offset + 2] - background[2]) ** 2)
    );
    const originalAlpha = data[offset + 3];
    if (distance <= 14) data[offset + 3] = 0;
    else if (distance < 48) data[offset + 3] = Math.round(originalAlpha * ((distance - 14) / 34));
  }

  await sharp(data, { raw: info }).png().toFile(outputPath);
  return { converted: true, reason: 'corner_background_removed', background, cornerSpread };
};

const chooseLogo = async (sitePath) => {
  const assetsPath = path.join(sitePath, 'assets');
  const files = (await fs.readdir(assetsPath))
    .filter((file) => /^logo[^/]*\.(?:svg|png|webp|jpe?g)$/i.test(file));

  if (!files.length) return { state: 'missing', source: null, output: null };

  const inspected = [];
  for (const file of files) {
    const filePath = path.join(assetsPath, file);
    inspected.push({ file, filePath, ...(await alphaState(filePath)) });
  }

  inspected.sort((a, b) => {
    const score = (item) => (item.transparent ? 100 : 0) + (item.svg ? 20 : 0) + (/source|original/i.test(item.file) ? 10 : 0) - (/display/i.test(item.file) ? 2 : 0);
    return score(b) - score(a);
  });

  const selected = inspected[0];
  if (selected.svg && selected.transparent) {
    return { state: 'transparent_source', source: selected.file, output: selected.file, inspected };
  }

  const output = 'logo-transparent.png';
  const outputPath = path.join(assetsPath, output);
  if (selected.transparent) {
    await sharp(selected.filePath, { failOn: 'none' }).png().toFile(outputPath);
    return { state: 'transparent_derivative', source: selected.file, output, inspected };
  }

  const conversion = await makeTransparentDerivative(selected.filePath, outputPath);
  const verified = await alphaState(outputPath);
  return {
    state: verified.transparent ? 'background_removed_from_exact_source' : 'opaque_hold',
    source: selected.file,
    output,
    conversion,
    verified,
    inspected
  };
};

const replaceBadHeroIntro = (html, business, city) => {
  const heroMatch = html.match(/(<section\b[^>]*class=["'][^"']*hero[^"']*["'][^>]*>)([\s\S]*?)(<\/section>)/i);
  if (!heroMatch) return { html, changed: false };

  const firstParagraph = heroMatch[2].match(/<p\b([^>]*)>([\s\S]*?)<\/p>/i);
  if (!firstParagraph) return { html, changed: false };

  const currentText = stripTags(firstParagraph[2]);
  const bad = /translucent|reflected edges|layered finishes|shift with the scroll|digital front door|practical .* questions|direct route|visual system|surface decisions|one on one/i.test(currentText);
  if (!bad) return { html, changed: false };

  const serviceMatch = html.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i);
  const service = serviceMatch ? stripTags(serviceMatch[1]).replace(/[.!?]+$/g, '') : 'the work shown here';
  const location = city ? ` in ${city}` : '';
  const replacement = `${business} presents ${service.toLowerCase()}${location}. See the work, understand the approach, and contact the team directly when you are ready to talk through a project.`;
  const updatedHero = heroMatch[2].replace(firstParagraph[0], `<p${firstParagraph[1]}>${replacement}</p>`);
  return { html: html.replace(heroMatch[0], `${heroMatch[1]}${updatedHero}${heroMatch[3]}`), changed: true };
};

const manifest = [];

for (const slug of siteDirectories) {
  const sitePath = path.join(sitesRoot, slug);
  const indexPath = path.join(sitePath, 'index.html');
  let html = await fs.readFile(indexPath, 'utf8');
  const cohort = cohortFor(slug);

  html = cleanVisitorCopy(html);
  html = html.replace(/\n?<meta\s+name=["']generator["'][^>]*>/i, '');
  html = html.replace(/<a\b[^>]*href=["']mailto:[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '');
  html = html.replace(/<[^>]+(?:class|id)=["'][^"']*\bqr(?:code)?\b[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '');

  const jsonLd = extractJsonLd(html);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const rawBusiness = jsonLd.name || titleMatch?.[1]?.split('|')[0] || slug.replace(/-/g, ' ');
  const business = cleanBusinessName(htmlDecode(rawBusiness));
  const city = cleanBusinessName(jsonLd.address?.addressLocality || '');

  html = html.replace(/<title>([\s\S]*?)<\/title>/i, (whole, title) => `<title>${cleanBusinessName(title)}</title>`);
  html = html.replace(/("name"\s*:\s*")([^"]+)(")/i, (whole, before, name, after) => `${before}${cleanBusinessName(name)}${after}`);

  const intro = replaceBadHeroIntro(html, business, city);
  html = intro.html;

  const logo = await chooseLogo(sitePath);
  if (logo.output) {
    html = html.replace(/(<img\b[^>]*\bsrc=["'])assets\/logo[^"']*(["'][^>]*>)/gi, `$1assets/${logo.output}$2`);
    html = html.replace(/(<link\b[^>]*\brel=["']icon["'][^>]*\bhref=["'])assets\/logo[^"']*(["'][^>]*>)/gi, `$1assets/${logo.output}$2`);
  }

  const opening = openingFor(slug);
  html = html.replace(/<body\b/i, `<body data-review-build="authored-100" data-review-cohort="${cohort}" data-review-slug="${slug}" data-review-opening="${opening}"`);

  if (!/review-system\.css/i.test(html)) {
    html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="../../review-system.css">\n</head>');
  }
  if (!/review-system\.js/i.test(html)) {
    html = html.replace(/<\/body>/i, '<script src="../../review-system.js"></script>\n</body>');
  }

  html = html.replace(/<img\b(?![^>]*\bloading=)([^>]*\bsrc=["'](?!assets\/(?:logo|collage-1|image-1|hero))[^"']+["'][^>]*)>/gi, '<img loading="lazy"$1>');

  await fs.writeFile(indexPath, html, 'utf8');

  manifest.push({
    slug,
    business,
    cohort,
    route: `sites/${slug}/`,
    officialUrl: jsonLd.url || null,
    city: city || null,
    opening,
    heroIntroRewritten: intro.changed,
    logoState: logo.state,
    logoSource: logo.source,
    logoOutput: logo.output
  });
}

const counts = Object.fromEntries(['batch2', 'batch3', 'batch4', 'unslop25'].map((cohort) => [cohort, manifest.filter((row) => row.cohort === cohort).length]));
await fs.writeFile(path.join(projectRoot, 'review-manifest.json'), JSON.stringify({ total: manifest.length, counts, sites: manifest }, null, 2));
console.log(JSON.stringify({ total: manifest.length, counts, logoStates: Object.groupBy(manifest, (row) => row.logoState) }, null, 2));
