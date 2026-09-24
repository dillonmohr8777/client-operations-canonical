import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const localBaseUrl = process.argv[2] || null;
const urlOverrides = process.env.BEST25_URL_OVERRIDES_JSON
  ? JSON.parse(process.env.BEST25_URL_OVERRIDES_JSON)
  : null;
const exactShortlistMode = Boolean(localBaseUrl || urlOverrides);
const onlySlugs = process.env.BEST25_ONLY_SLUGS
  ? new Set(process.env.BEST25_ONLY_SLUGS.split(',').map((value) => value.trim()).filter(Boolean))
  : null;
const outputFile = process.env.BEST25_OUTPUT_FILE
  || (localBaseUrl ? 'qa-best25-local.json' : urlOverrides ? 'qa-best25-deploy-preview.json' : 'qa-best25-candidates.json');
const outputFolder = process.env.BEST25_QA_DIR
  || (localBaseUrl ? 'best25-local' : urlOverrides ? 'best25-deploy-preview' : 'best25-candidates');
const auditMode = process.env.BEST25_AUDIT_MODE
  || (localBaseUrl ? 'local-hardened' : urlOverrides ? 'deploy-preview' : 'public-historical');
const workerCount = Math.max(1, Math.min(3, Number.parseInt(process.env.BEST25_QA_CONCURRENCY || '3', 10) || 3));
const sourceQa = JSON.parse(await fs.readFile(path.join(root, 'qa-live-historical.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'review-manifest.json'), 'utf8'));
const verifiedExternalLinkExceptions = new Map([
  ['https://www.jdvelectric.com/', 'First-party page independently retrieved on 2026-08-30; the QA request client is receiving a Cloudflare 521.']
]);

const candidateSlugs = [
  'bustleton-services',
  'e-and-e-cleaning',
  'lawrence-kassan-podiatry',
  'marthas-sophisticated-shine',
  'mayfair-family-chiropractic',
  'mayfair-fence',
  'northeast-family-foot-care',
  'patriot-fence-and-ironworks',
  'philly-medical-and-rehab-associates',
  'pt-in-philly',
  'rhi-construction',
  'rufus-chiropractic-and-wellness',
  'scrc-accident-and-injury-center',
  'all-phase-electric-co',
  'bill-frusco-plumbing-heating-cooling',
  'borden-heating-cooling-inc',
  'brandon-electric-inc',
  'centrum-mechanical-services',
  'charles-schillinger-company',
  'dunryte-electric-inc',
  'ernest-d-menold-inc',
  'gallagher-fabrication-machine',
  'h-g-sign-company',
  'jdv-electric-llc',
  'k-a-m-sheet-metal-fab',
  'waste-gas-fabricating-company-inc',
  'young-s-electrical-services-inc',
  'metalmorphose-iron-studio',
  'new-pennsburg-diner',
  'peking-gourmet'
];
const sourceShortlistSlugs = [
  'h-g-sign-company',
  'new-pennsburg-diner',
  'dunryte-electric-inc',
  'mayfair-fence',
  'peking-gourmet',
  'metalmorphose-iron-studio',
  'e-and-e-cleaning',
  'philly-medical-and-rehab-associates',
  'marthas-sophisticated-shine',
  'pt-in-philly',
  'bustleton-services',
  'k-a-m-sheet-metal-fab',
  'young-s-electrical-services-inc',
  'patriot-fence-and-ironworks',
  'mayfair-family-chiropractic',
  'borden-heating-cooling-inc',
  'brandon-electric-inc',
  'centrum-mechanical-services',
  'rufus-chiropractic-and-wellness',
  'cleaned-by-d-d-llc',
  'jdv-electric-llc',
  'charles-schillinger-company',
  'lawrence-kassan-podiatry',
  'rhi-construction',
  'scrc-accident-and-injury-center'
];

const sourceBySlug = new Map(sourceQa.rows.map((row) => [row.slug, row]));
const manifestBySlug = new Map(manifest.sites.map((row) => [row.slug, row]));
const selectedCandidateSlugs = (exactShortlistMode ? sourceShortlistSlugs : candidateSlugs)
  .filter((slug) => !onlySlugs || onlySlugs.has(slug));
const candidates = selectedCandidateSlugs.map((slug) => {
  const source = sourceBySlug.get(slug);
  const item = manifestBySlug.get(slug);
  if (!source || !item) throw new Error(`Missing candidate evidence for ${slug}`);
  const overriddenUrl = urlOverrides?.[slug];
  if (urlOverrides && !overriddenUrl) throw new Error(`Missing URL override for ${slug}`);
  return { slug, business: item.business, cohort: item.cohort, url: overriddenUrl || (localBaseUrl ? new URL(item.route, localBaseUrl).href : source.url) };
});

const outputRoot = path.join(root, 'qa', outputFolder);
const axePath = path.join(root, 'qa', 'best25-candidates', 'axe-runtime', 'node_modules', 'axe-core', 'axe.min.js');
await fs.mkdir(path.join(outputRoot, 'screenshots', 'desktop'), { recursive: true });
await fs.mkdir(path.join(outputRoot, 'screenshots', 'mobile'), { recursive: true });

const layouts = [
  { name: 'mobile320', width: 320, height: 800, mobile: true },
  { name: 'mobile390', width: 390, height: 844, mobile: true },
  { name: 'tablet768', width: 768, height: 1024, mobile: false },
  { name: 'zoom200', width: 720, height: 900, mobile: false },
  { name: 'desktop1440', width: 1440, height: 900, mobile: false }
];

const browser = await chromium.launch({ headless: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const significantTokens = (value) => String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((word) => word.length >= 4 && !['company', 'services', 'center', 'incorporated'].includes(word));
const normalizeUrl = (value) => {
  const parsed = new URL(value);
  parsed.hash = '';
  parsed.pathname = parsed.pathname.replace(/\/+$/, '/') || '/';
  return parsed.href;
};

async function pageSnapshot(page, candidate, layout) {
  return page.evaluate(({ business, layoutName, slug }) => {
    const visible = (el) => {
      if (!el) return false;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 1 && rect.height > 1;
    };
    const text = (el) => (el?.innerText || el?.textContent || el?.getAttribute?.('aria-label') || el?.getAttribute?.('alt') || el?.querySelector?.('img[alt]')?.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
    const rectData = (el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) };
    };
    const all = [...document.querySelectorAll('body *')];
    const h1s = [...document.querySelectorAll('h1')];
    const visibleH1 = h1s.find(visible);
    const headingLevels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).map((el) => ({ level: Number(el.tagName.slice(1)), text: text(el).slice(0, 100) }));
    const headingSkips = headingLevels.slice(1).flatMap((current, index) => current.level > headingLevels[index].level + 1 ? [{ from: headingLevels[index], to: current }] : []);
    const logoElements = all.filter((el) => {
      const haystack = `${el.tagName} ${el.getAttribute?.('src') || ''} ${el.getAttribute?.('alt') || ''} ${el.getAttribute?.('class') || ''} ${el.getAttribute?.('id') || ''}`;
      return /logo|brand-mark|wordmark/i.test(haystack) && visible(el);
    });
    const logoOpening = logoElements.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top < innerHeight && r.bottom > 0;
    });
    const hero = visibleH1?.closest('section,header,main') || document.querySelector('main section, main header, .hero, [class*="hero"]');
    const heroRect = hero?.getBoundingClientRect();
    const heroVisuals = all.filter((el) => {
      if (!visible(el)) return false;
      const r = el.getBoundingClientRect();
      if (r.top >= innerHeight || r.bottom <= 0 || r.width < 80 || r.height < 80) return false;
      const style = getComputedStyle(el);
      const isImage = el.tagName === 'IMG' && !/logo/i.test(`${el.getAttribute('src') || ''} ${el.getAttribute('alt') || ''}`);
      const isBackground = style.backgroundImage && style.backgroundImage !== 'none';
      const isVideo = el.tagName === 'VIDEO' || el.tagName === 'CANVAS' || el.tagName === 'SVG';
      return isImage || isBackground || isVideo;
    }).map((el) => ({ tag: el.tagName, className: String(el.className || '').slice(0, 100), rect: rectData(el) })).slice(0, 20);
    const images = [...document.images].map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.getAttribute('alt'),
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      visible: visible(img),
      rect: rectData(img)
    }));
    const phoneLinks = [...document.querySelectorAll('a[href^="tel:"]')].map((el) => {
      const href = el.getAttribute('href') || '';
      const digits = href.replace(/\D/g, '');
      return { href, digits, text: text(el), visible: visible(el), rect: rectData(el) };
    });
    const anchors = [...document.querySelectorAll('a[href]')].map((el) => ({ href: el.getAttribute('href'), text: text(el).slice(0, 120), visible: visible(el) }));
    const hashLinks = anchors.filter((a) => a.href?.startsWith('#') && a.href.length > 1).map((a) => ({ ...a, targetExists: Boolean(document.getElementById(decodeURIComponent(a.href.slice(1)))) }));
    const controls = [...document.querySelectorAll('a[href],button,input,select,textarea,[role="button"],[tabindex]')].filter((el) => visible(el) && !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true').map((el) => {
      const style = getComputedStyle(el);
      const r = rectData(el);
      const inlineTextExempt = el.tagName === 'A' && style.display === 'inline' && ['P','LI','SPAN'].includes(el.parentElement?.tagName);
      return {
        tag: el.tagName,
        text: text(el).slice(0, 100),
        href: el.getAttribute('href'),
        role: el.getAttribute('role'),
        tabIndex: el.tabIndex,
        accessibleName: text(el),
        rect: r,
        inlineTextExempt,
        targetTooSmall: !inlineTextExempt && (r.width < 24 || r.height < 24)
      };
    });
    const unlabeledControls = [...document.querySelectorAll('input,select,textarea')].filter((el) => {
      if (el.type === 'hidden' || !visible(el)) return false;
      const labels = el.labels ? [...el.labels] : [];
      return !labels.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.getAttribute('title');
    }).map((el) => ({ tag: el.tagName, type: el.getAttribute('type'), name: el.getAttribute('name') }));
    const unnamedInteractives = controls.filter((control) => !control.accessibleName && !['INPUT','SELECT','TEXTAREA'].includes(control.tag));
    const landmarks = {
      main: document.querySelectorAll('main,[role="main"]').length,
      header: document.querySelectorAll('body > header,header[role="banner"],[role="banner"]').length,
      footer: document.querySelectorAll('body > footer,footer[role="contentinfo"],[role="contentinfo"]').length,
      nav: document.querySelectorAll('nav,[role="navigation"]').length
    };
    const navs = [...document.querySelectorAll('nav,[role="navigation"]')];
    const unnamedNavs = navs.length > 1 ? navs.filter((el) => !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).length : 0;
    const overflowElements = all.filter((el) => {
      if (!visible(el) || el.getAttribute('aria-hidden') === 'true') return false;
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (style.position === 'fixed') return false;
      return r.left < -2 || r.right > innerWidth + 2;
    }).slice(0, 20).map((el) => ({ tag: el.tagName, className: String(el.className || '').slice(0, 100), rect: rectData(el) }));

    const parseColor = (value) => {
      const match = String(value).match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const values = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      if (values.length < 3 || values.some((v) => !Number.isFinite(v))) return null;
      return { r: values[0], g: values[1], b: values[2], a: values[3] ?? 1 };
    };
    const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
    const luminance = ({ r, g, b }) => [r,g,b].map((value) => value / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126,.7152,.0722][index], 0);
    const ratio = (a, b) => { const l1 = luminance(a); const l2 = luminance(b); return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05); };
    const directText = (el) => [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    const contrastFailures = all.filter((el) => visible(el) && directText(el)).flatMap((el) => {
      const style = getComputedStyle(el);
      let fg = parseColor(style.color);
      if (!fg) return [];
      const ownBackground = parseColor(style.backgroundColor);
      const ownBackgroundOpaque = Boolean(ownBackground && ownBackground.a >= .95 && style.backgroundImage === 'none');
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      let cursor = el;
      let uncertain = false;
      while (cursor) {
        const cs = getComputedStyle(cursor);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') { uncertain = true; break; }
        const candidate = parseColor(cs.backgroundColor);
        if (candidate && candidate.a > 0) {
          bg = candidate.a < 1 ? blend(candidate, bg) : candidate;
          if (candidate.a >= .99) break;
        }
        cursor = cursor.parentElement;
      }
      if (uncertain) return [];
      if (fg.a < 1) fg = blend(fg, bg);
      const fontSize = Number.parseFloat(style.fontSize) || 16;
      const weight = Number.parseInt(style.fontWeight, 10) || 400;
      const large = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
      const required = large ? 3 : 4.5;
      const actual = ratio(fg, bg);
      return actual + .05 < required ? [{
        tag: el.tagName,
        className: String(el.className || '').slice(0, 160),
        text: text(el).slice(0, 100),
        ratio: Number(actual.toFixed(2)),
        required,
        fontSize,
        weight,
        color: style.color,
        backgroundColor: style.backgroundColor,
        ownBackgroundOpaque
      }] : [];
    }).slice(0, 30);
    const sentenceFragments = [...document.querySelectorAll('p')]
      .filter((el) => visible(el))
      .map((el) => text(el))
      .filter((value) => /\b(?:a|an|the|and|or)\.$/i.test(value))
      .slice(0, 20);
    const hoursValueSuspects = all
      .filter((el) => visible(el) && /^hours$/i.test(text(el)) && el.children.length === 0)
      .flatMap((label) => {
        const container = label.parentElement;
        if (!container) return [];
        const value = [...container.querySelectorAll('strong,p')].map((el) => text(el)).find(Boolean) || text(container).replace(/^hours\s*/i, '').trim();
        if (!value || /\b(?:confirm|closed|open|appointment|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|am|pm|24\s*hour)\b/i.test(value)) return [];
        return [{ value: value.slice(0, 140), html: container.outerHTML.slice(0, 500) }];
      }).slice(0, 20);
    const genericMediaLabels = [...document.querySelectorAll('figcaption,.cap')]
      .filter((el) => visible(el) && /(?:service photograph\s*\d+|\bimg_\d+\.(?:jpe?g|png|webp)\b|\b[^\s<>]+_edited[^\s<>]*\.(?:jpe?g|png|webp)\b)/i.test(text(el)))
      .map((el) => text(el).slice(0, 140))
      .slice(0, 20);
    const verticalMismatchPatternsBySlug = {
      'cleaned-by-d-d-llc': [/repair discussion/i, /louder, warmer/i, /model numbers/i, /\bdiagnos(?:is|tic)\b/i],
      'h-g-sign-company': [/repair discussion/i, /louder, warmer/i, /guessed diagnosis/i, /final diagnosis/i, /diagnostic next step/i, /name the symptom/i],
      'k-a-m-sheet-metal-fab': [/repair discussion/i, /louder, warmer/i, /guessed diagnosis/i, /final diagnosis/i, /diagnostic next step/i, /name the symptom/i, /800 Pine Hill/i, /\bmachining\b/i, /\bwelding\b/i, /tooling or fixtures/i, /automation or integration/i],
      'charles-schillinger-company': [/repair discussion/i, /louder, warmer/i, /guessed diagnosis/i, /final diagnosis/i, /diagnostic next step/i, /name the symptom/i, /interior and exterior remodeling/i, /construction studies/i, /automation or integration/i]
    };
    const verticalMismatchPatterns = verticalMismatchPatternsBySlug[slug] || [];
    const verticalMismatchTerms = verticalMismatchPatterns
      .filter((pattern) => pattern.test(document.body.innerText))
      .map((pattern) => pattern.source);
    const normalizeIdentity = (value) => String(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\b(inc|llc|company)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const normalizedBody = normalizeIdentity(document.body.innerText);
    const normalizedBusiness = normalizeIdentity(business);

    return {
      layoutName,
      title: document.title,
      lang: document.documentElement.getAttribute('lang'),
      robots: document.querySelector('meta[name="robots" i]')?.getAttribute('content') || '',
      h1s: h1s.map((el) => ({ text: text(el), visible: visible(el), rect: rectData(el) })),
      visibleH1InOpening: Boolean(visibleH1 && visibleH1.getBoundingClientRect().top < innerHeight && visibleH1.getBoundingClientRect().bottom > 0),
      headingLevels,
      headingSkips,
      logoCount: logoElements.length,
      logoOpening,
      heroVisible: visible(hero),
      heroInOpening: Boolean(heroRect && heroRect.top < innerHeight && heroRect.bottom > 0),
      heroVisuals,
      images,
      phoneLinks,
      anchors,
      hashLinks,
      controls,
      unlabeledControls,
      unnamedInteractives,
      landmarks,
      unnamedNavs,
      overflow: document.documentElement.scrollWidth > innerWidth + 2,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth,
      overflowElements,
      contrastFailures,
      sentenceFragments,
      hoursValueSuspects,
      genericMediaLabels,
      verticalMismatchTerms,
      businessTextFound: Boolean(normalizedBusiness && normalizedBody.includes(normalizedBusiness))
    };
  }, { business: candidate.business, layoutName: layout.name, slug: candidate.slug });
}

async function keyboardAudit(page) {
  const expected = await page.locator('a[href],button,input,select,textarea,[role="button"],[tabindex]').evaluateAll((elements) => elements.filter((el) => {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    const rendered = typeof el.checkVisibility === 'function'
      ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
      : s.display !== 'none' && s.visibility !== 'hidden' && r.width > 1 && r.height > 1;
    return rendered && r.width > 1 && r.height > 1 && !el.disabled && el.tabIndex >= 0 && !el.closest('[aria-hidden="true"]');
  }).map((el, index) => { el.dataset.qaFocusIndex = String(index); return { index, tag: el.tagName, text: (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim().slice(0,80), href: el.getAttribute('href') }; }));
  const visits = [];
  await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0,0); });
  for (let index = 0; index < Math.min(expected.length + 35, 120); index += 1) {
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => {
      const el = document.activeElement;
      const style = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el?.tagName,
        text: (el?.innerText || el?.textContent || el?.getAttribute?.('aria-label') || '').trim().slice(0,80),
        href: el?.getAttribute?.('href'),
        qaFocusIndex: el?.getAttribute?.('data-qa-focus-index'),
        body: el === document.body,
        rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        indicator: (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) || style.boxShadow !== 'none' || style.textDecorationLine.includes('underline')
      };
    });
    visits.push(active);
    if (active.body && index > expected.length) break;
  }
  const visitedIndexes = new Set(visits.filter((row) => row.qaFocusIndex !== null).map((row) => Number(row.qaFocusIndex)));
  const missing = expected.filter((row) => !visitedIndexes.has(row.index)).map((row) => `${row.index}:${row.tag}:${row.href || row.text}`);
  return { expectedCount: expected.length, visitCount: visits.filter((row) => !row.body).length, missing, noVisibleFocus: visits.filter((row) => !row.body).every((row) => !row.indicator), visits };
}

async function hoverStateContrastAudit(page) {
  const targets = page.locator('figcaption, .caption, .cap');
  const count = await targets.count();
  const results = [];
  for (let index = 0; index < count; index += 1) {
    const target = targets.nth(index);
    const rendered = await target.evaluate((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
    }).catch(() => false);
    if (!rendered) continue;
    const trigger = target.locator('xpath=..');
    await trigger.scrollIntoViewIfNeeded().catch(() => {});
    await trigger.hover({ force: true }).catch(() => {});
    await sleep(450);
    const row = await target.evaluate((el) => {
      const parseColor = (value) => {
        const match = String(value).match(/rgba?\(([^)]+)\)/);
        if (!match) return null;
        const values = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        if (values.length < 3 || values.some((value) => !Number.isFinite(value))) return null;
        return { r: values[0], g: values[1], b: values[2], a: values[3] ?? 1 };
      };
      const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
      const luminance = ({ r, g, b }) => [r,g,b].map((value) => value / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, position) => sum + value * [.2126,.7152,.0722][position], 0);
      const ratio = (a, b) => { const l1 = luminance(a); const l2 = luminance(b); return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05); };
      const style = getComputedStyle(el);
      let foreground = parseColor(style.color);
      let background = parseColor(style.backgroundColor);
      if (!foreground || !background || background.a === 0 || style.backgroundImage !== 'none') return null;
      if (background.a < 1) background = blend(background, { r: 255, g: 255, b: 255, a: 1 });
      if (foreground.a < 1) foreground = blend(foreground, background);
      const fontSize = Number.parseFloat(style.fontSize) || 16;
      const weight = Number.parseInt(style.fontWeight, 10) || 400;
      const required = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700) ? 3 : 4.5;
      const actual = ratio(foreground, background);
      return {
        tag: el.tagName,
        className: String(el.className || '').slice(0, 120),
        text: (el.innerText || el.textContent || '').trim().slice(0, 100),
        color: style.color,
        backgroundColor: style.backgroundColor,
        fontSize,
        weight,
        required,
        ratio: Number(actual.toFixed(2)),
        pass: actual + .05 >= required
      };
    }).catch(() => null);
    if (row) results.push(row);
  }
  return results;
}

async function linkAudit(request, baseUrl, anchors, hashLinks) {
  const missingHashes = hashLinks.filter((row) => !row.targetExists);
  const malformed = anchors.filter((row) => !row.href || /^javascript:/i.test(row.href));
  const urls = [...new Set(anchors.map((row) => row.href).filter((href) => /^https?:/i.test(href)).map((href) => new URL(href, baseUrl).href))].slice(0, 12);
  const checked = [];
  for (const url of urls) {
    let result;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await request.get(url, { timeout: 25000, maxRedirects: 8, headers: { Range: 'bytes=0-8192' } });
        result = { url, status: response.status(), ok: response.status() < 400 || [401,403,405,429].includes(response.status()), finalUrl: response.url(), attempts: attempt };
        break;
      } catch (error) {
        result = { url, status: 0, ok: false, error: error.message, attempts: attempt };
        if (attempt < 2) await sleep(400);
      }
    }
    if (!result.ok && verifiedExternalLinkExceptions.has(url)) {
      result = { ...result, ok: true, observedUpstreamStatus: result.status, verifiedException: verifiedExternalLinkExceptions.get(url) };
    }
    checked.push(result);
  }
  return { missingHashes, malformed, checked, broken: checked.filter((row) => !row.ok) };
}

async function reducedMotionAudit(candidate) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(candidate.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.reviewReady === 'true', null, { timeout: 5000 }).catch(() => {});
  await sleep(220);
  const result = await page.evaluate(() => ({
    mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    runningAnimations: document.getAnimations().filter((animation) => animation.playState === 'running').map((animation) => {
      const timing = animation.effect?.getComputedTiming?.() || {};
      const target = animation.effect?.target;
      return { tag: target?.tagName, className: String(target?.className || '').slice(0,100), duration: timing.duration, iterations: timing.iterations, endTime: animation.endTime };
    }).filter((row) => (Number(row.duration) || 0) > 300 || row.iterations === Infinity).slice(0,40)
  }));
  await context.close();
  return result;
}

function deriveIssues(candidate, views, keyboard, links, reducedMotion, errors, performance) {
  const blockers = [];
  const warnings = [];
  const titleTokens = significantTokens(candidate.business);
  for (const [name, view] of Object.entries(views)) {
    const p = `${name}:`;
    if (!view.responseOk) blockers.push(`${p}http_${view.status || 0}`);
    if (view.navigationError) blockers.push(`${p}navigation_error`);
    if (!view.snapshot.title || !titleTokens.some((token) => view.snapshot.title.toLowerCase().includes(token))) blockers.push(`${p}title_identity_mismatch`);
    if (!view.snapshot.businessTextFound) blockers.push(`${p}body_identity_mismatch`);
    if (!/\bnoindex\b/i.test(view.snapshot.robots)) blockers.push(`${p}private_demo_noindex_missing`);
    if (view.snapshot.h1s.length !== 1 || !view.snapshot.h1s[0]?.visible) blockers.push(`${p}h1_missing_multiple_or_hidden`);
    if (!view.snapshot.visibleH1InOpening) blockers.push(`${p}h1_not_in_opening`);
    if (!view.snapshot.logoOpening) blockers.push(`${p}logo_not_in_opening`);
    if (!view.snapshot.heroVisible || !view.snapshot.heroInOpening || view.snapshot.heroVisuals.length === 0) blockers.push(`${p}hero_visual_not_in_opening`);
    if (!view.snapshot.phoneLinks.some((row) => row.visible && [10,11].includes(row.digits.length))) blockers.push(`${p}valid_visible_phone_cta_missing`);
    if (view.snapshot.images.some((row) => row.complete && row.naturalWidth === 0)) blockers.push(`${p}broken_image`);
    if (view.snapshot.images.some((row) => row.alt === null)) blockers.push(`${p}missing_alt_attribute`);
    if (view.snapshot.overflow) blockers.push(`${p}horizontal_overflow`);
    if (view.snapshot.landmarks.main !== 1) blockers.push(`${p}main_landmark_count_${view.snapshot.landmarks.main}`);
    if (view.snapshot.landmarks.header < 1 || view.snapshot.landmarks.footer < 1) warnings.push(`${p}header_or_footer_landmark_missing`);
    if (view.snapshot.unnamedNavs) blockers.push(`${p}multiple_unnamed_navs`);
    if (view.snapshot.unlabeledControls.length) blockers.push(`${p}unlabeled_form_control`);
    if (view.snapshot.unnamedInteractives.length) warnings.push(`${p}possible_unnamed_interactive`);
    if (view.snapshot.headingSkips.length) warnings.push(`${p}heading_level_skip`);
    for (const violation of view.axeViolations || []) {
      if (violation.status === 'incomplete') warnings.push(`${p}axe_incomplete_${violation.id}`);
      else blockers.push(`${p}axe_${violation.id}`);
    }
    if (view.snapshot.contrastFailures.some((row) => ['A','BUTTON'].includes(row.tag) && row.ownBackgroundOpaque)) {
      blockers.push(`${p}solid_control_contrast_failure`);
    }
    if (view.snapshot.sentenceFragments.length) blockers.push(`${p}trailing_sentence_fragment`);
    if (view.snapshot.hoursValueSuspects.length) blockers.push(`${p}hours_field_semantic_mismatch`);
    if (view.snapshot.genericMediaLabels.length) blockers.push(`${p}generic_visible_media_label`);
    if (view.snapshot.verticalMismatchTerms.length) blockers.push(`${p}vertical_copy_mismatch`);
    if ((view.hoverContrast || []).some((row) => !row.pass)) blockers.push(`${p}hover_revealed_text_contrast_failure`);
    if (view.assetFailures.length || view.badAssetResponses.length) blockers.push(`${p}asset_request_failure`);
    if (view.pageErrors.length) blockers.push(`${p}page_error`);
    if (view.consoleErrors.length) blockers.push(`${p}console_error`);
  }
  if (keyboard.missing.length) blockers.push('keyboard:focusable_not_reached');
  if (keyboard.noVisibleFocus && keyboard.expectedCount) blockers.push('keyboard:no_visible_focus_indicator');
  if (links.missingHashes.length || links.malformed.length || links.broken.length) blockers.push('links:broken_or_malformed');
  if (!reducedMotion.mediaMatches) blockers.push('reduced_motion:media_not_emulated');
  if (reducedMotion.runningAnimations.length) blockers.push('reduced_motion:significant_animation_running');
  if (reducedMotion.scrollBehavior === 'smooth') blockers.push('reduced_motion:smooth_scroll_active');
  if (errors.crossOriginRedirect) blockers.push('navigation:unexpected_cross_origin_redirect');
  if (performance.elapsedMs > 15000 || performance.lcpMs > 4500 || performance.transferBytes > 15_000_000) blockers.push('performance:smoke_threshold_exceeded');
  return { blockers: [...new Set(blockers)], warnings: [...new Set(warnings)] };
}

async function auditCandidate(candidate) {
  const views = {};
  let desktopPage;
  let desktopContext;
  let desktopAnchors;
  let desktopHashes;
  let keyboard;
  let links;
  const performanceSummary = { elapsedMs: 0, lcpMs: 0, transferBytes: 0, resources: 0 };
  let crossOriginRedirect = false;

  for (const layout of layouts) {
    const context = await browser.newContext({ viewport: { width: layout.width, height: layout.height }, isMobile: layout.mobile, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__qaLcp = 0;
      new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__qaLcp = Math.max(window.__qaLcp, entry.renderTime || entry.loadTime || 0); }).observe({ type: 'largest-contentful-paint', buffered: true });
    }).catch(() => {});
    const consoleErrors = [];
    const pageErrors = [];
    const assetFailures = [];
    const badAssetResponses = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => { if (['image','font','stylesheet','script'].includes(request.resourceType())) assetFailures.push({ url: request.url(), type: request.resourceType(), error: request.failure()?.errorText }); });
    page.on('response', (response) => { const type = response.request().resourceType(); if (['image','font','stylesheet','script'].includes(type) && response.status() >= 400) badAssetResponses.push({ url: response.url(), type, status: response.status() }); });
    const started = Date.now();
    let response;
    let navigationError = null;
    try {
      response = await page.goto(candidate.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => {});
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      await page.waitForFunction(() => document.documentElement.dataset.reviewReady === 'true', null, { timeout: 5000 }).catch(() => {});
      await sleep(700);
    } catch (error) {
      navigationError = error.message;
    }
    const elapsedMs = Date.now() - started;
    const finalUrl = page.url();
    if (finalUrl && new URL(finalUrl).origin !== new URL(candidate.url).origin) crossOriginRedirect = true;
    let snapshot = null;
    let axeViolations = [];
    let hoverContrast = [];
    let perf = { lcpMs: 0, transferBytes: 0, resources: 0, loadEventMs: 0 };
    if (!navigationError) {
      snapshot = await pageSnapshot(page, candidate, layout);
      if (layout.name === 'desktop1440') await page.screenshot({ path: path.join(outputRoot, 'screenshots', 'desktop', `${candidate.slug}.jpg`), type: 'jpeg', quality: 74, fullPage: false });
      if (layout.name === 'mobile390') await page.screenshot({ path: path.join(outputRoot, 'screenshots', 'mobile', `${candidate.slug}.jpg`), type: 'jpeg', quality: 74, fullPage: false });
      await page.evaluate(async () => {
        const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(400, innerHeight * .75)) { scrollTo(0, y); await pause(35); }
        const prior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        scrollTo(0, 0);
        await pause(150);
        document.documentElement.style.scrollBehavior = prior;
      });
      const loadedSnapshot = await pageSnapshot(page, candidate, layout);
      if (layout.name === 'mobile390' || layout.name === 'desktop1440') {
        await sleep(350);
        await page.addScriptTag({ path: axePath });
        axeViolations = await page.evaluate(async () => {
          const result = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'] }, resultTypes: ['violations','incomplete'] });
          const compact = (items, status) => items.map((violation) => ({ status, id: violation.id, impact: violation.impact, description: violation.description, help: violation.help, helpUrl: violation.helpUrl, nodes: violation.nodes.map((node) => ({ impact: node.impact, html: node.html.slice(0,500), target: node.target, failureSummary: node.failureSummary })).slice(0,50) }));
          return [...compact(result.violations, 'violation'), ...compact(result.incomplete, 'incomplete')];
        });
      }
      if (layout.name === 'desktop1440') hoverContrast = await hoverStateContrastAudit(page);
      snapshot.images = loadedSnapshot.images;
      snapshot.overflow = snapshot.overflow || loadedSnapshot.overflow;
      snapshot.scrollWidth = Math.max(snapshot.scrollWidth, loadedSnapshot.scrollWidth);
      snapshot.overflowElements = [...snapshot.overflowElements, ...loadedSnapshot.overflowElements].slice(0, 20);
      perf = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        return { lcpMs: window.__qaLcp || 0, transferBytes: resources.reduce((sum, row) => sum + (row.transferSize || 0), 0), resources: resources.length, loadEventMs: nav?.loadEventEnd || 0 };
      });
    }
    views[layout.name] = { status: response?.status() || 0, responseOk: Boolean(response?.ok()), requestedUrl: candidate.url, finalUrl, redirected: finalUrl && normalizeUrl(finalUrl) !== normalizeUrl(candidate.url), navigationError, elapsedMs, snapshot, axeViolations, hoverContrast, consoleErrors: [...new Set(consoleErrors)], pageErrors: [...new Set(pageErrors)], assetFailures, badAssetResponses, performance: perf };
    performanceSummary.elapsedMs = Math.max(performanceSummary.elapsedMs, elapsedMs);
    performanceSummary.lcpMs = Math.max(performanceSummary.lcpMs, perf.lcpMs || 0);
    performanceSummary.transferBytes = Math.max(performanceSummary.transferBytes, perf.transferBytes || 0);
    performanceSummary.resources = Math.max(performanceSummary.resources, perf.resources || 0);
    if (layout.name === 'mobile390' && !navigationError) {
      keyboard = await keyboardAudit(page);
    }
    if (layout.name === 'desktop1440' && !navigationError) {
      desktopPage = page;
      desktopContext = context;
      desktopAnchors = snapshot.anchors;
      desktopHashes = snapshot.hashLinks;
      continue;
    }
    await context.close();
  }
  if (desktopPage) {
    links = await linkAudit(desktopContext.request, candidate.url, desktopAnchors, desktopHashes);
    await desktopContext.close();
  } else {
    links = { missingHashes: [], malformed: [], checked: [], broken: [{ error: 'desktop navigation unavailable' }] };
  }
  keyboard ||= { expectedCount: 0, visitCount: 0, missing: ['mobile navigation unavailable'], noVisibleFocus: true, visits: [] };
  const reducedMotion = await reducedMotionAudit(candidate).catch((error) => ({ mediaMatches: false, scrollBehavior: 'unknown', runningAnimations: [{ error: error.message }] }));
  const issues = deriveIssues(candidate, views, keyboard, links, reducedMotion, { crossOriginRedirect }, performanceSummary);
  const axeNodeCount = Object.values(views).flatMap((view) => view.axeViolations || []).reduce((sum, violation) => sum + violation.nodes.length, 0);
  const severityScore = issues.blockers.length * 100 + axeNodeCount * 4 + issues.warnings.length + performanceSummary.lcpMs / 1000 + performanceSummary.transferBytes / 1_000_000;
  return { ...candidate, pass: issues.blockers.length === 0, severityScore: Number(severityScore.toFixed(3)), issues, performance: performanceSummary, keyboard, links, reducedMotion, views };
}

const rows = new Array(candidates.length);
let cursor = 0;
let completed = 0;
async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= candidates.length) return;
    rows[index] = await auditCandidate(candidates[index]);
    completed += 1;
    console.log(`BEST25_QA ${completed}/${candidates.length} ${candidates[index].slug} ${rows[index].pass ? 'PASS' : `HOLD(${rows[index].issues.blockers.length})`}`);
  }
}

try {
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
} finally {
  await browser.close();
}

const ranked = [...rows].sort((a, b) => Number(b.pass) - Number(a.pass) || a.severityScore - b.severityScore || a.slug.localeCompare(b.slug));
const report = {
  generatedAt: new Date().toISOString(),
  gate: `${auditMode}-exhaustive-technical-candidate-gate-v3-axe4130-hover`,
  candidateCount: rows.length,
  pass: rows.filter((row) => row.pass).length,
  hold: rows.filter((row) => !row.pass).length,
  selected25: ranked.slice(0, 25).map((row, index) => ({ rank: index + 1, slug: row.slug, business: row.business, cohort: row.cohort, url: row.url, pass: row.pass, severityScore: row.severityScore, blockers: row.issues.blockers, warnings: row.issues.warnings })),
  excluded5: ranked.slice(25).map((row) => ({ slug: row.slug, business: row.business, cohort: row.cohort, url: row.url, pass: row.pass, severityScore: row.severityScore, blockers: row.issues.blockers, warnings: row.issues.warnings })),
  issueCounts: Object.fromEntries(Object.entries(Object.groupBy(rows.flatMap((row) => row.issues.blockers), (issue) => issue)).map(([issue, values]) => [issue, values.length]).sort((a,b) => b[1]-a[1])),
  rows
};

await fs.writeFile(path.join(root, outputFile), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ candidateCount: report.candidateCount, pass: report.pass, hold: report.hold, selected25: report.selected25.map((row) => `${row.rank}. ${row.slug} ${row.pass ? 'PASS' : 'HOLD'}`), excluded5: report.excluded5.map((row) => row.slug), issueCounts: report.issueCounts }, null, 2));
if (report.pass < candidates.length) process.exitCode = 2;
