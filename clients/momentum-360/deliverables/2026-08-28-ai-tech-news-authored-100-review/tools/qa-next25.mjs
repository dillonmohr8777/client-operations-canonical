import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium, request as playwrightRequest } from 'playwright';

/**
 * Deterministic, manifest-driven QA for a 25-site Momentum 360 batch.
 *
 * The runner is intentionally independent of the selection/build pipeline. It
 * reads a manifest, visits each demo at desktop and mobile widths, and writes
 * one bounded JSON receipt. A sample subset can be selected with --only or
 * --limit while preserving the source manifest's 25-entry validation.
 */

const projectRoot = path.resolve(import.meta.dirname, '..');
const RUNNER_VERSION = '1.0.0';
const REQUIRED_MANIFEST_COUNT = 25;
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
];
const ASSET_RESOURCE_TYPES = new Set(['image', 'font', 'stylesheet', 'script']);
// Keep map telemetry narrow: fonts.googleapis.com and other Google services
// are not proof that a Google Map loaded. Include the Maps JS host, Maps
// static hosts, and the /maps path on google.com/maps.google.com only.
const MAP_URL_RE = /(?:https?:)?\/\/(?:maps\.google\.com|(?:www\.)?google\.com\/maps|maps\.googleapis\.com|maps\.gstatic\.com)(?:[\/?#:]|$)|(?:https?:)?\/\/[^/]*googleusercontent\.com\/(?:maps?|maptiles)(?:[\/?#:]|$)/i;
const MAP_EMBED_URL_RE = /(?:www\.)?google\.com\/maps(?:\/[^?]*)?\/embed|(?:www\.)?google\.com\/maps\?[^#]*\boutput=embed|maps\.google\.com\/(?:maps(?:\/[^?]*)?\/embed|\?[^#]*\boutput=embed)/i;

const args = process.argv.slice(2);
const positional = [];
const options = {
  baseUrl: null,
  cohortBasesPath: null,
  cohortBases: null,
  only: null,
  limit: null,
  concurrency: 3,
  screenshots: false,
  screenshotDir: null,
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (!arg.startsWith('--')) {
    positional.push(arg);
    continue;
  }
  const [key, inlineValue] = arg.slice(2).split('=', 2);
  const nextValue = inlineValue ?? args[index + 1];
  const consumesNext = inlineValue === undefined && nextValue && !nextValue.startsWith('--');
  if (consumesNext) index += 1;
  if (key === 'base-url') options.baseUrl = nextValue || null;
  else if (key === 'cohort-bases-json') options.cohortBasesPath = nextValue || null;
  else if (key === 'only') options.only = (nextValue || '').split(',').map((value) => value.trim()).filter(Boolean);
  else if (key === 'limit') options.limit = Number.parseInt(nextValue, 10);
  else if (key === 'concurrency') options.concurrency = Number.parseInt(nextValue, 10);
  else if (key === 'screenshots') options.screenshots = true;
  else if (key === 'screenshot-dir') options.screenshotDir = nextValue || null;
  else throw new Error(`Unknown option: --${key}`);
}

const manifestArg = positional[0];
if (!manifestArg) {
  throw new Error('Usage: node tools\\qa-next25.mjs <manifest.json> [report.json] [--base-url URL] [--cohort-bases-json file.json] [--only slug,...] [--limit N] [--screenshots]');
}
const reportArg = positional[1] || 'qa-next25-report.json';
if (!/^[a-z0-9][a-z0-9._-]*\.json$/i.test(path.basename(reportArg)) && !path.isAbsolute(reportArg)) {
  throw new Error('The report filename must be a simple .json basename or an explicit path.');
}
if (!Number.isFinite(options.concurrency) || options.concurrency < 1) options.concurrency = 1;
options.concurrency = Math.min(4, Math.floor(options.concurrency));
if (options.limit !== null && (!Number.isFinite(options.limit) || options.limit < 1)) {
  throw new Error('--limit must be a positive integer.');
}

const reportPath = path.isAbsolute(reportArg) ? reportArg : path.join(projectRoot, reportArg);
const manifestPath = path.isAbsolute(manifestArg) ? manifestArg : path.resolve(process.cwd(), manifestArg);

const asString = (value) => (value === null || value === undefined ? '' : String(value).trim());
const decodeHtml = (value) => asString(value)
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&#(x?[0-9a-f]+);/gi, (whole, raw) => {
    const hex = /^x/i.test(raw);
    const code = Number.parseInt(hex ? raw.slice(1) : raw, hex ? 16 : 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
  });
const normalizeText = (value) => decodeHtml(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const identityTokens = (value) => normalizeText(value)
  .split(' ')
  .filter((token) => token.length >= 3)
  .filter((token) => !new Set(['and', 'the', 'inc', 'llc', 'co', 'company', 'services', 'center', 'corp', 'corporation']).has(token));
const normalizeDigits = (value) => asString(value).replace(/\D/g, '');
const lastTen = (value) => normalizeDigits(value).slice(-10);
const hashFile = async (filePath) => crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex');
const unique = (values) => [...new Set(values)];
const pushLimited = (array, value, limit = 100) => {
  if (array.length < limit) array.push(value);
};
const redactDiagnosticUrl = (value) => {
  try {
    const parsed = new URL(String(value));
    for (const key of ['key', 'token', 'signature']) {
      if (parsed.searchParams.has(key)) parsed.searchParams.set(key, 'REDACTED');
    }
    return parsed.href;
  } catch {
    return String(value).replace(/([?&](?:key|token|signature)=)[^&#\s]+/gi, '$1REDACTED');
  }
};
const isBenignGoogleEmbedViewportNoise = (entry) => {
  const combined = `${entry?.url || ''} ${entry?.text || ''} ${entry?.error || ''}`;
  const viewportNoise = /MapsJsInternalService\/GetViewportInfo/i.test(combined)
    && /(?:ERR_FAILED|blocked by CORS policy|maps\.googleapis\.com\/\$rpc)/i.test(combined);
  const transientTileNoise = /(?:www\.)?google\.com\/maps\/vt\?/i.test(combined)
    && /(?:status of 500|\b500\b)/i.test(combined);
  return viewportNoise || transientTileNoise;
};

function flattenAddress(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(flattenAddress).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return [
      value.streetAddress,
      value.street_address,
      value.addressLocality,
      value.city,
      value.addressRegion,
      value.state,
      value.postalCode,
      value.zip,
    ].map(asString).filter(Boolean).join(', ');
  }
  return asString(value);
}

function pickFirst(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && asString(value)) return value;
  }
  return null;
}

function deriveSlug(item, index) {
  const explicit = pickFirst(item, ['slug', 'id', 'key', 'handle']);
  if (explicit) return asString(explicit);
  const route = pickFirst(item, ['route', 'path']);
  if (route) return asString(route).split(/[\\/]/).filter(Boolean).at(-1).replace(/\/$/, '');
  const business = pickFirst(item, ['business', 'name', 'company', 'title']);
  return normalizeText(business || `entry-${index + 1}`).replace(/\s+/g, '-') || `entry-${index + 1}`;
}

function deriveUrl(item, manifestMeta, baseUrl, index) {
  const explicit = pickFirst(item, ['demo_url', 'demoUrl', 'preview_url', 'previewUrl', 'url', 'href']);
  const route = pickFirst(item, ['route', 'path']);
  const rootBase = baseUrl || pickFirst(manifestMeta, ['base_url', 'baseUrl', 'preview_base_url', 'previewBaseUrl']);
  const candidate = explicit || (route && rootBase ? new URL(route, rootBase).href : null);
  if (!candidate) return null;
  try {
    return new URL(candidate, rootBase || undefined).href;
  } catch {
    throw new Error(`Manifest entry ${index + 1} has an invalid demo URL: ${candidate}`);
  }
}

function normalizeManifest(raw, baseUrl, cohortBases = null) {
  const items = Array.isArray(raw)
    ? raw
    : (raw?.prospects || raw?.sites || raw?.rows || raw?.entries || raw?.items);
  if (!Array.isArray(items)) throw new Error('Manifest must be an array or expose prospects, sites, rows, entries, or items.');
  const normalized = items.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`Manifest entry ${index + 1} is not an object.`);
    const slug = deriveSlug(item, index);
    const business = asString(pickFirst(item, ['business', 'name', 'company', 'prospect', 'title'])) || slug;
    const cohort = asString(pickFirst(item, ['cohort', 'batch', 'group'])) || null;
    const explicitUrl = deriveUrl(item, raw, baseUrl, index);
    const cohortBase = cohort && cohortBases ? cohortBases[cohort] : null;
    const url = cohortBase && explicitUrl
      ? new URL(new URL(explicitUrl).pathname, cohortBase).href
      : (baseUrl
        ? new URL(`sites/${encodeURIComponent(slug)}/`, baseUrl).href
        : explicitUrl);
    if (!url || !/^https?:$/i.test(new URL(url).protocol)) throw new Error(`Manifest entry ${index + 1} (${business}) is missing an http(s) demo URL.`);
    return {
      rank: Number.isFinite(Number(item.rank)) ? Number(item.rank) : index + 1,
      slug,
      business,
      cohort,
      demoUrl: url,
      expectedPhone: asString(pickFirst(item, ['phone', 'telephone', 'phone_number', 'phoneNumber'])) || null,
      expectedAddress: flattenAddress(pickFirst(item, ['address', 'full_address', 'fullAddress', 'street_address', 'streetAddress'])) || null,
      source: item,
    };
  });
  return { meta: raw && !Array.isArray(raw) ? raw : {}, entries: normalized };
}

function isMapNetworkUrl(url) {
  return MAP_URL_RE.test(asString(url));
}

function significantIdentity(value) {
  return unique(identityTokens(value));
}

function identityMatch(business, title, body) {
  const tokens = significantIdentity(business);
  const normalizedTitle = normalizeText(title);
  const normalizedBody = normalizeText(body);
  const titleHits = tokens.filter((token) => normalizedTitle.includes(token));
  const bodyHits = tokens.filter((token) => normalizedBody.includes(token));
  const requiredBodyHits = Math.max(1, Math.ceil(tokens.length * 0.6));
  return {
    tokens,
    titleHits,
    bodyHits,
    requiredBodyHits,
    titleFound: Boolean(tokens.length && titleHits.length >= 1),
    bodyFound: Boolean(tokens.length && (normalizedBody.includes(normalizeText(business)) || bodyHits.length >= requiredBodyHits)),
  };
}

function visibleOnScreen(rect, width, height) {
  return Boolean(rect && rect.width > 1 && rect.height > 1 && rect.right > 0 && rect.bottom > 0 && rect.left < width && rect.top < height);
}

async function attachDiagnostics(page, diagnostics) {
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const location = message.location();
    pushLimited(diagnostics.consoleErrors, {
      text: message.text(),
      url: location.url || null,
      line: location.lineNumber || null,
      column: location.columnNumber || null,
    });
  });
  page.on('pageerror', (error) => pushLimited(diagnostics.pageErrors, { message: error.message, stack: error.stack || null }));
  page.on('request', (requestEvent) => {
    const url = redactDiagnosticUrl(requestEvent.url());
    if (isMapNetworkUrl(url)) pushLimited(diagnostics.mapRequests, { url, type: requestEvent.resourceType(), method: requestEvent.method() });
  });
  page.on('response', (response) => {
    const requestEvent = response.request();
    const url = redactDiagnosticUrl(response.url());
    if (isMapNetworkUrl(url)) {
      pushLimited(diagnostics.mapResponses, { url, type: requestEvent.resourceType(), status: response.status() });
    }
    if (ASSET_RESOURCE_TYPES.has(requestEvent.resourceType()) && response.status() >= 400) {
      const entry = { url, type: requestEvent.resourceType(), status: response.status() };
      if (isMapNetworkUrl(url)) pushLimited(diagnostics.mapAssetFailures, entry);
      else pushLimited(diagnostics.assetFailures, entry);
    }
  });
  page.on('requestfailed', (requestEvent) => {
    const entry = { url: redactDiagnosticUrl(requestEvent.url()), type: requestEvent.resourceType(), error: requestEvent.failure()?.errorText || 'failed' };
    if (isMapNetworkUrl(entry.url)) pushLimited(diagnostics.mapRequestFailures, entry);
    else if (ASSET_RESOURCE_TYPES.has(entry.type)) pushLimited(diagnostics.assetFailures, entry);
    else pushLimited(diagnostics.requestFailures, entry);
  });
}

async function waitForPage(page) {
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(900);
}

async function scrollToBottom(page) {
  await page.evaluate(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.max(320, Math.floor(innerHeight * .72));
    let position = 0;
    while (position < Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0)) {
      window.scrollTo({ top: position, behavior: 'instant' });
      await pause(90);
      position += step;
    }
    window.scrollTo({ top: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0), behavior: 'instant' });
    await pause(650);
  });
  await page.waitForFunction(() => [...document.images].every((image) => image.complete), null, { timeout: 6_000 }).catch(() => {});
}

async function collectSnapshot(page, candidate, viewport) {
  return page.evaluate(({ expectedBusiness, expectedPhone, width, height }) => {
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 1 && rect.height > 1;
    };
    const rectData = (element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
    };
    const accessibleName = (element) => (element.innerText || element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
    const title = document.title || '';
    const bodyText = (document.body?.innerText || document.body?.textContent || '').replace(/\s+/g, ' ').trim();
    const images = [...document.images].map((image) => ({
      src: image.currentSrc || image.src || image.getAttribute('src') || '',
      alt: image.getAttribute('alt'),
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      visible: visible(image),
      rect: rectData(image),
    }));
    const phoneLinks = [...document.querySelectorAll('a[href^="tel:"]')].map((element) => ({
      href: element.getAttribute('href') || '',
      digits: (element.getAttribute('href') || '').replace(/\D/g, ''),
      text: accessibleName(element),
      visible: visible(element),
      rect: rectData(element),
    }));
    const anchors = [...document.querySelectorAll('a[href]')].map((element) => ({
      href: element.getAttribute('href') || '',
      text: accessibleName(element),
      visible: visible(element),
      ariaHidden: element.getAttribute('aria-hidden') === 'true',
      rect: rectData(element),
    }));
    const mapLinks = anchors.filter((anchor) => /(?:google\.com\/maps|maps\.google\.com)/i.test(anchor.href) && anchor.visible && !anchor.ariaHidden);
    const focusables = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,iframe,video[controls],audio[controls],[role="button"],[tabindex]')]
      .filter((element) => {
        if (element.disabled || element.getAttribute('aria-hidden') === 'true' || element.closest('[aria-hidden="true"],[inert]')) return false;
        if (element.tabIndex < 0) return false;
        return visible(element);
      })
      .map((element, index) => {
        element.dataset.qaNext25FocusIndex = String(index);
        return { index, tag: element.tagName, text: accessibleName(element).slice(0, 120), href: element.getAttribute('href'), tabIndex: element.tabIndex, rect: rectData(element) };
      });
    const overflowElements = [...document.querySelectorAll('body *')]
      .filter((element) => {
        if (!visible(element) || element.getAttribute('aria-hidden') === 'true') return false;
        const style = getComputedStyle(element);
        if (style.position === 'fixed' || style.position === 'sticky') return false;
        const rect = element.getBoundingClientRect();
        return rect.left < -2 || rect.right > width + 2;
      })
      .slice(0, 20)
      .map((element) => ({ tag: element.tagName, id: element.id || null, className: String(element.className || '').slice(0, 140), rect: rectData(element) }));
    const robotsMeta = document.querySelector('meta[name="robots" i]')?.getAttribute('content') || '';
    const identity = {
      title,
      bodyTextLength: bodyText.length,
      titleFound: false,
      bodyFound: false,
      titleHits: [],
      bodyHits: [],
      tokens: [],
      requiredBodyHits: 0,
    };
    const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    const tokens = [...new Set(normalize(expectedBusiness).split(' ').filter((token) => token.length >= 3 && !['and', 'the', 'inc', 'llc', 'co', 'company', 'services', 'center', 'corp', 'corporation'].includes(token)))];
    const titleNormalized = normalize(title);
    const bodyNormalized = normalize(bodyText);
    const titleHits = tokens.filter((token) => titleNormalized.includes(token));
    const bodyHits = tokens.filter((token) => bodyNormalized.includes(token));
    identity.tokens = tokens;
    identity.titleHits = titleHits;
    identity.bodyHits = bodyHits;
    identity.requiredBodyHits = Math.max(1, Math.ceil(tokens.length * .6));
    identity.titleFound = Boolean(tokens.length && titleHits.length >= 1);
    identity.bodyFound = Boolean(tokens.length && (bodyNormalized.includes(normalize(expectedBusiness)) || bodyHits.length >= identity.requiredBodyHits));
    const expectedDigits = String(expectedPhone || '').replace(/\D/g, '').slice(-10);
    const validPhoneLinks = phoneLinks.filter((link) => [10, 11].includes(link.digits.length) && link.visible);
    const phone = {
      expectedDigits: expectedDigits || null,
      validVisible: validPhoneLinks,
      expectedMatch: Boolean(expectedDigits && validPhoneLinks.some((link) => link.digits.slice(-10) === expectedDigits)),
      hasValidVisible: validPhoneLinks.length > 0,
    };
    return {
      title,
      robotsMeta,
      metaNoindex: /\bnoindex\b/i.test(robotsMeta),
      bodyTextLength: bodyText.length,
      identity,
      phone,
      images,
      brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0),
      incompleteImages: images.filter((image) => !image.complete),
      emptyAltImages: images.filter((image) => image.alt === null),
      anchors,
      mapLinks,
      focusables,
      overflow: document.documentElement.scrollWidth > width + 2,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth || 0,
      innerWidth: width,
      innerHeight: height,
      overflowElements,
    };
  }, {
    expectedBusiness: candidate.business,
    expectedPhone: candidate.expectedPhone,
    width: viewport.width,
    height: viewport.height,
  });
}

async function inspectMap(page, diagnostics, viewport) {
  return page.evaluate(({ mapRequests, mapResponses, mapRequestFailures, viewportWidth, viewportHeight, mapUrlPattern, mapEmbedPattern }) => {
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 1 && rect.height > 1;
    };
    const rectData = (element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
    };
    const inViewport = (rect) => Boolean(rect.width > 1 && rect.height > 1 && rect.right > 0 && rect.bottom > 0 && rect.x < viewportWidth && rect.y < viewportHeight);
    const accessibleName = (element) => (element.innerText || element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
    const isMapUrl = (href) => new RegExp(mapUrlPattern, 'i').test(String(href || ''));
    const isEmbedUrl = (src) => new RegExp(mapEmbedPattern, 'i').test(String(src || ''));
    const visibleMapFallbacks = [...document.querySelectorAll('a[href]')].map((element) => ({
      element,
      href: element.getAttribute('href') || '',
      name: accessibleName(element),
      visible: visible(element),
      ariaHidden: element.getAttribute('aria-hidden') === 'true',
      rect: rectData(element),
    })).filter((item) => isMapUrl(item.href) && item.visible && !item.ariaHidden && item.name);
    const iframeElements = [...document.querySelectorAll('iframe[data-google-map-embed], iframe[src*="google.com/maps/embed" i], iframe[src*="maps.google.com/maps/embed" i], iframe[src*="maps.google.com/?output=embed" i], iframe[src*="google.com/maps?output=embed" i]')];
    const canvasElements = [...document.querySelectorAll('[data-google-map-canvas]')];
    const explicitRegions = [...document.querySelectorAll('[data-google-map]')];
    const allTargets = [...new Set([...iframeElements, ...canvasElements])];
    const nearestRegion = (element) => element.closest('[data-google-map], section, footer, main') || element.parentElement;
    const nearbyFallbacks = (element, region) => {
      const mapRect = element.getBoundingClientRect();
      return visibleMapFallbacks.filter((link) => {
        const sameRegion = region && (region.contains(link.element) || link.element.closest('[data-google-map], section, footer, main') === region);
        const distance = Math.min(Math.abs(link.rect.top - mapRect.bottom), Math.abs(link.rect.bottom - mapRect.top));
        return sameRegion || distance <= 520;
      }).map(({ element: unused, ...link }) => link);
    };
    const loadedState = (element) => {
      const values = [
        element.getAttribute('data-map-state'),
        element.getAttribute('data-google-map-state'),
        element.getAttribute('data-loaded'),
        element.getAttribute('data-map-loaded'),
        element.getAttribute('data-status'),
        element.getAttribute('data-ready'),
      ].map((value) => String(value || '').toLowerCase());
      const classLoaded = [...element.classList].some((value) => /(?:^|[-_])(loaded|ready|active|complete|success)(?:$|[-_])/i.test(value));
      return values.some((value) => /^(true|yes|1|loaded|ready|active|complete|success)$/.test(value)) || element.getAttribute('aria-busy') === 'false' || classLoaded;
    };
    const embeds = iframeElements.map((element) => {
      const src = element.getAttribute('src') || '';
      const rect = rectData(element);
      const region = nearestRegion(element);
      const fallbacks = nearbyFallbacks(element, region);
      return {
        kind: 'iframe',
        src,
        validSrc: isEmbedUrl(src),
        visible: visible(element),
        bottomVisible: inViewport(rect),
        rect,
        title: element.getAttribute('title') || '',
        ariaLabel: element.getAttribute('aria-label') || '',
        accessible: Boolean(element.getAttribute('title')?.trim() || element.getAttribute('aria-label')?.trim()),
        loading: (element.getAttribute('loading') || '').toLowerCase(),
        fallbackLinks: fallbacks,
      };
    });
    const canvases = canvasElements.map((element) => {
      const rect = rectData(element);
      const region = nearestRegion(element);
      const fallbacks = nearbyFallbacks(element, region);
      const visualDescendants = [...element.querySelectorAll('canvas, .gm-style, .gm-style-mtc, img[src*="googleusercontent" i], img[src*="googleapis" i], [role="application"]')].filter(visible);
      return {
        kind: 'canvas',
        visible: visible(element),
        bottomVisible: inViewport(rect),
        rect,
        loadedState: loadedState(element),
        visualProof: visualDescendants.length > 0,
        visualProofCount: visualDescendants.length,
        fallbackLinks: fallbacks,
      };
    });
    const targetSummary = [...embeds, ...canvases];
    const issues = [];
    if (!targetSummary.length) issues.push('map_integration_missing');
    for (const embed of embeds) {
      const prefix = 'map_embed';
      if (!embed.validSrc) issues.push(`${prefix}_source_invalid`);
      if (!embed.accessible) issues.push(`${prefix}_accessible_name_missing`);
      if (embed.loading !== 'lazy') issues.push(`${prefix}_not_lazy`);
      if (!embed.visible || !embed.bottomVisible || embed.rect.width <= 1 || embed.rect.height <= 1) issues.push(`${prefix}_not_bottom_visible`);
      if (!embed.fallbackLinks.length) issues.push(`${prefix}_directions_fallback_missing`);
    }
    for (const canvas of canvases) {
      const prefix = 'map_canvas';
      if (!canvas.loadedState) issues.push(`${prefix}_loaded_state_missing`);
      if (!canvas.visualProof) issues.push(`${prefix}_visual_proof_missing`);
      if (!canvas.visible || !canvas.bottomVisible || canvas.rect.width <= 1 || canvas.rect.height <= 1) issues.push(`${prefix}_not_bottom_visible`);
      if (!canvas.fallbackLinks.length) issues.push(`${prefix}_directions_fallback_missing`);
    }
    const validFallbacks = visibleMapFallbacks.map(({ element: unused, ...link }) => link);
    if (targetSummary.length && !targetSummary.some((target) => target.fallbackLinks.length)) issues.push('map_directions_fallback_missing');
    if (canvases.length && !mapRequests.some((entry) => isMapUrl(entry.url))) issues.push('map_canvas_runtime_not_observed');
    const blockingRuntimeFailures = mapRequestFailures.filter((entry) => !/MapsJsInternalService\/GetViewportInfo/i.test(`${entry.url || ''} ${entry.error || ''}`));
    const blockingResponses = mapResponses.filter((entry) => entry.status >= 400
      && !(/(?:www\.)?google\.com\/maps\/vt\?/i.test(entry.url || '') && entry.status === 500));
    if (blockingResponses.length || blockingRuntimeFailures.length) issues.push('map_runtime_request_failure');
    return {
      targetCount: targetSummary.length,
      explicitRegionCount: explicitRegions.length,
      iframeCount: embeds.length,
      canvasCount: canvases.length,
      embeds,
      canvases,
      fallbackLinks: validFallbacks,
      runtimeRequests: mapRequests,
      runtimeResponses: mapResponses,
      runtimeRequestFailures: mapRequestFailures,
      runtimeObserved: mapRequests.length > 0,
      pass: issues.length === 0,
      issues: [...new Set(issues)],
    };
  }, {
    mapRequests: diagnostics.mapRequests,
    mapResponses: diagnostics.mapResponses,
    mapRequestFailures: diagnostics.mapRequestFailures,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    mapUrlPattern: MAP_URL_RE.source,
    mapEmbedPattern: MAP_EMBED_URL_RE.source,
  });
}

async function keyboardAudit(page) {
  await page.locator('iframe[data-google-map-embed]').evaluateAll((elements) => elements.forEach((element) => {
    element.dataset.qaNext25PreviousTabindex = element.getAttribute('tabindex') ?? '';
    element.setAttribute('tabindex', '-1');
  }));
  const expected = await page.locator('a[href],button,input,select,textarea,summary,video[controls],audio[controls],[role="button"],[tabindex]:not(iframe)').evaluateAll((elements) => elements.filter((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const rendered = typeof element.checkVisibility === 'function'
      ? element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
      : style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
    return rendered && rect.width > 1 && rect.height > 1 && !element.disabled && element.tabIndex >= 0 && element.getAttribute('aria-hidden') !== 'true' && !element.closest('[aria-hidden="true"],[inert]');
  }).map((element, index) => {
    element.dataset.qaNext25FocusIndex = String(index);
    return { index, tag: element.tagName, text: (element.innerText || element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 120), href: element.getAttribute('href') };
  }));
  const visits = [];
  await page.evaluate(() => {
    document.activeElement?.blur?.();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  const maxTabs = Math.max(2, expected.length + 3);
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return { body: false, qaFocusIndex: null, indicator: false, tag: null, text: '', href: null, rect: null };
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const outlineVisible = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0 && style.outlineColor !== 'rgba(0, 0, 0, 0)';
      const indicator = outlineVisible || style.boxShadow !== 'none' || style.textDecorationLine.includes('underline');
      return {
        body: element === document.body,
        qaFocusIndex: element.getAttribute('data-qa-next25-focus-index'),
        indicator,
        focusVisible: typeof element.matches === 'function' && element.matches(':focus-visible'),
        tag: element.tagName,
        text: (element.innerText || element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        href: element.getAttribute('href'),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom },
      };
    });
    visits.push(active);
    if (active.body && index >= expected.length) break;
  }
  const visitedIndexes = new Set(visits.filter((visit) => visit.qaFocusIndex !== null).map((visit) => Number(visit.qaFocusIndex)));
  const focusVisits = visits.filter((visit) => !visit.body);
  const signature = (item) => `${item.tag}:${item.href || item.text}`;
  const visitedSignatures = new Set(focusVisits.map(signature));
  const missing = expected
    .filter((item) => !visitedIndexes.has(item.index) && !visitedSignatures.has(signature(item)))
    .map((item) => `${item.index}:${item.tag}:${item.href || item.text}`);
  const result = {
    expectedCount: expected.length,
    visitCount: focusVisits.length,
    visitedCount: visitedIndexes.size,
    missing,
    noVisibleFocus: focusVisits.length > 0 && focusVisits.every((visit) => !visit.indicator && !visit.focusVisible),
    visits: focusVisits,
  };
  await page.locator('iframe[data-google-map-embed]').evaluateAll((elements) => elements.forEach((element) => {
    const previous = element.dataset.qaNext25PreviousTabindex;
    delete element.dataset.qaNext25PreviousTabindex;
    if (previous) element.setAttribute('tabindex', previous);
    else element.removeAttribute('tabindex');
  }));
  return result;
}

async function reducedMotionAudit(candidate) {
  const result = {};
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const diagnostics = { consoleErrors: [], pageErrors: [], requestFailures: [], assetFailures: [], mapRequests: [], mapResponses: [], mapRequestFailures: [], mapAssetFailures: [] };
    await attachDiagnostics(page, diagnostics);
    let navigationError = null;
    try {
      await page.goto(candidate.demoUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await waitForPage(page);
    } catch (error) {
      navigationError = error.message;
    }
    const motion = navigationError ? null : await page.evaluate(() => ({
      mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      runningAnimations: document.getAnimations().filter((animation) => {
        const target = animation.effect?.target;
        if (!target || target.closest?.('[data-google-map], [data-google-map-canvas]')) return false;
        const timing = animation.effect?.getComputedTiming?.() || {};
        return (Number(timing.duration) || 0) > 300 || timing.iterations === Infinity;
      }).map((animation) => {
        const timing = animation.effect?.getComputedTiming?.() || {};
        const target = animation.effect?.target;
        return { tag: target?.tagName || null, id: target?.id || null, className: String(target?.className || '').slice(0, 120), duration: timing.duration, iterations: timing.iterations };
      }).slice(0, 40),
    }));
    result[viewport.name] = { navigationError, ...motion, consoleErrors: diagnostics.consoleErrors, pageErrors: diagnostics.pageErrors };
    await context.close();
  }
  return result;
}

async function inspectViewport(candidate, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const diagnostics = { consoleErrors: [], pageErrors: [], requestFailures: [], assetFailures: [], mapRequests: [], mapResponses: [], mapRequestFailures: [], mapAssetFailures: [] };
  await attachDiagnostics(page, diagnostics);
  const startedAt = Date.now();
  let response = null;
  let navigationError = null;
  try {
    response = await page.goto(candidate.demoUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await waitForPage(page);
  } catch (error) {
    navigationError = error.message;
  }
  const initialUrl = page.url();
  let snapshot = null;
  let bottomSnapshot = null;
  let map = null;
  let keyboard = null;
  if (!navigationError) {
    snapshot = await collectSnapshot(page, candidate, viewport);
    await scrollToBottom(page);
    bottomSnapshot = await collectSnapshot(page, candidate, viewport);
    await page.locator('[data-google-map]').first().scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(500);
    map = await inspectMap(page, diagnostics, viewport);
    keyboard = await keyboardAudit(page);
    if (options.screenshots) {
      const screenshotRoot = options.screenshotDir
        ? (path.isAbsolute(options.screenshotDir) ? options.screenshotDir : path.join(projectRoot, options.screenshotDir))
        : path.join(projectRoot, 'qa-next25-screenshots');
      await fs.mkdir(screenshotRoot, { recursive: true });
      await page.screenshot({ path: path.join(screenshotRoot, `${candidate.slug}-${viewport.name}.png`), fullPage: false });
    }
  }
  const finalUrl = page.url();
  const elapsedMs = Date.now() - startedAt;
  await context.close();
  return {
    viewport: viewport.name,
    requestedUrl: candidate.demoUrl,
    finalUrl,
    status: response?.status() || 0,
    responseOk: Boolean(response?.ok()),
    elapsedMs,
    navigationError,
    snapshot,
    bottomSnapshot,
    map,
    keyboard,
    consoleErrors: diagnostics.consoleErrors,
    pageErrors: diagnostics.pageErrors,
    requestFailures: diagnostics.requestFailures,
    assetFailures: diagnostics.assetFailures,
    mapAssetFailures: diagnostics.mapAssetFailures,
    mapRequests: diagnostics.mapRequests,
    mapResponses: diagnostics.mapResponses,
    mapRequestFailures: diagnostics.mapRequestFailures,
    crossOriginRedirect: Boolean(finalUrl && initialUrl && new URL(finalUrl).origin !== new URL(candidate.demoUrl).origin),
  };
}

function deriveViewportIssues(view) {
  const issues = [];
  const snapshot = view.bottomSnapshot || view.snapshot;
  if (!view.responseOk) issues.push(`${view.viewport}:http_${view.status || 0}`);
  if (view.navigationError) issues.push(`${view.viewport}:navigation_error`);
  if (view.crossOriginRedirect) issues.push(`${view.viewport}:cross_origin_redirect`);
  if (!snapshot) return [...new Set(issues)];
  if (!snapshot.identity.titleFound) issues.push(`${view.viewport}:identity_title_mismatch`);
  if (!snapshot.identity.bodyFound) issues.push(`${view.viewport}:identity_body_mismatch`);
  if (!snapshot.phone.hasValidVisible) issues.push(`${view.viewport}:phone_valid_visible_missing`);
  if (snapshot.phone.expectedDigits && !snapshot.phone.expectedMatch) issues.push(`${view.viewport}:phone_expected_mismatch`);
  if (snapshot.brokenImages.length) issues.push(`${view.viewport}:broken_images`);
  if (snapshot.incompleteImages.length) issues.push(`${view.viewport}:incomplete_images`);
  if (snapshot.emptyAltImages.length) issues.push(`${view.viewport}:images_missing_alt`);
  if (snapshot.overflow) issues.push(`${view.viewport}:horizontal_overflow`);
  if (view.assetFailures.length) issues.push(`${view.viewport}:asset_request_failure`);
  if (view.consoleErrors.some((entry) => !isBenignGoogleEmbedViewportNoise(entry))) issues.push(`${view.viewport}:console_error`);
  if (view.pageErrors.length) issues.push(`${view.viewport}:page_error`);
  if (view.keyboard?.missing?.length) issues.push(`${view.viewport}:keyboard_focusable_not_reached`);
  if (view.keyboard?.noVisibleFocus) issues.push(`${view.viewport}:keyboard_no_visible_focus`);
  if (view.map && !view.map.pass) issues.push(...view.map.issues.map((issue) => `${view.viewport}:${issue}`));
  return [...new Set(issues)];
}

function deriveReducedMotionIssues(reduced) {
  const issues = [];
  for (const [viewport, result] of Object.entries(reduced || {})) {
    if (result.navigationError) issues.push(`reduced_motion_${viewport}:navigation_error`);
    if (!result.mediaMatches) issues.push(`reduced_motion_${viewport}:media_not_emulated`);
    if (result.scrollBehavior === 'smooth') issues.push(`reduced_motion_${viewport}:smooth_scroll_active`);
    if (result.runningAnimations?.length) issues.push(`reduced_motion_${viewport}:significant_animation_running`);
    if (result.consoleErrors?.length) issues.push(`reduced_motion_${viewport}:console_error`);
    if (result.pageErrors?.length) issues.push(`reduced_motion_${viewport}:page_error`);
  }
  return [...new Set(issues)];
}

async function auditCandidate(candidate, apiContext) {
  const row = {
    rank: candidate.rank,
    slug: candidate.slug,
    business: candidate.business,
    cohort: candidate.cohort,
    demoUrl: candidate.demoUrl,
    expectedPhone: candidate.expectedPhone,
    expectedAddress: candidate.expectedAddress,
    http: null,
    viewports: {},
    reducedMotion: {},
    blockers: [],
    warnings: [],
    pass: false,
  };
  try {
    const response = await apiContext.get(candidate.demoUrl, { timeout: 30_000, maxRedirects: 8 });
    const headers = response.headers();
    row.http = {
      status: response.status(),
      ok: response.ok(),
      finalUrl: response.url(),
      contentType: headers['content-type'] || null,
      robots: headers['x-robots-tag'] || null,
      noindexHeader: /\bnoindex\b/i.test(headers['x-robots-tag'] || ''),
      xFrameOptions: headers['x-frame-options'] || null,
      contentSecurityPolicy: headers['content-security-policy'] || null,
    };
  } catch (error) {
    row.http = { status: 0, ok: false, finalUrl: null, error: error.message, robots: null, noindexHeader: false };
  }
  for (const viewport of VIEWPORTS) {
    try {
      row.viewports[viewport.name] = await inspectViewport(candidate, viewport);
    } catch (error) {
      row.viewports[viewport.name] = {
        viewport: viewport.name,
        requestedUrl: candidate.demoUrl,
        finalUrl: null,
        status: 0,
        responseOk: false,
        elapsedMs: 0,
        navigationError: error.message,
        snapshot: null,
        bottomSnapshot: null,
        map: null,
        keyboard: null,
        consoleErrors: [],
        pageErrors: [],
        requestFailures: [],
        assetFailures: [],
        mapAssetFailures: [],
        mapRequests: [],
        mapResponses: [],
        mapRequestFailures: [],
        crossOriginRedirect: false,
      };
    }
  }
  try {
    row.reducedMotion = await reducedMotionAudit(candidate);
  } catch (error) {
    row.reducedMotion = { error: error.message };
  }
  const viewportIssues = Object.values(row.viewports).flatMap(deriveViewportIssues);
  const reducedIssues = deriveReducedMotionIssues(row.reducedMotion);
  row.blockers = [...new Set([...viewportIssues, ...reducedIssues])];
  if (!row.http.noindexHeader) row.warnings.push('http:noindex_header_missing');
  for (const [name, view] of Object.entries(row.viewports)) {
    const snapshot = view.bottomSnapshot || view.snapshot;
    if (snapshot && !snapshot.metaNoindex) row.warnings.push(`${name}:meta_noindex_missing`);
    if (snapshot && snapshot.overflowElements.length) row.warnings.push(`${name}:overflow_elements_observed`);
  }
  row.pass = row.blockers.length === 0;
  return row;
}

let browser;
let apiContext;
let report;

try {
  const rawManifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const manifestHash = await hashFile(manifestPath);
  if (options.cohortBasesPath) {
    const resolvedCohortBasesPath = path.isAbsolute(options.cohortBasesPath)
      ? options.cohortBasesPath
      : path.resolve(process.cwd(), options.cohortBasesPath);
    options.cohortBases = JSON.parse(await fs.readFile(resolvedCohortBasesPath, 'utf8'));
  }
  const normalizedManifest = normalizeManifest(rawManifest, options.baseUrl, options.cohortBases);
  const sourceEntries = normalizedManifest.entries;
  if (sourceEntries.length !== REQUIRED_MANIFEST_COUNT) {
    throw new Error(`Manifest must contain exactly ${REQUIRED_MANIFEST_COUNT} entries; found ${sourceEntries.length}.`);
  }
  const duplicateSlugs = sourceEntries.filter((entry, index) => sourceEntries.findIndex((other) => other.slug === entry.slug) !== index).map((entry) => entry.slug);
  const duplicateUrls = sourceEntries.filter((entry, index) => sourceEntries.findIndex((other) => other.demoUrl === entry.demoUrl) !== index).map((entry) => entry.demoUrl);
  if (duplicateSlugs.length) throw new Error(`Manifest slugs are not unique: ${unique(duplicateSlugs).join(', ')}`);
  if (duplicateUrls.length) throw new Error(`Manifest demo URLs are not unique: ${unique(duplicateUrls).join(', ')}`);
  let selected = [...sourceEntries].sort((a, b) => a.rank - b.rank || a.slug.localeCompare(b.slug));
  if (options.only?.length) {
    const wanted = new Set(options.only);
    const missing = options.only.filter((slug) => !sourceEntries.some((entry) => entry.slug === slug));
    if (missing.length) throw new Error(`--only references unknown slugs: ${missing.join(', ')}`);
    selected = selected.filter((entry) => wanted.has(entry.slug));
  }
  if (options.limit !== null) selected = selected.slice(0, options.limit);
  if (!selected.length) throw new Error('Selection produced zero manifest entries.');

  browser = await chromium.launch({ headless: true });
  apiContext = await playwrightRequest.newContext({ ignoreHTTPSErrors: true });
  const rows = new Array(selected.length);
  let cursor = 0;
  let completed = 0;
  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= selected.length) return;
      rows[index] = await auditCandidate(selected[index], apiContext);
      completed += 1;
      console.log(`NEXT25_QA ${completed}/${selected.length} ${selected[index].slug} ${rows[index].pass ? 'PASS' : `HOLD(${rows[index].blockers.length})`}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(options.concurrency, selected.length) }, () => worker()));
  const issueCounts = Object.fromEntries(Object.entries(Object.groupBy(rows.flatMap((row) => row.blockers), (issue) => issue)).map(([issue, values]) => [issue, values.length]).sort((a, b) => b[1] - a[1]));
  report = {
    runner: 'momentum-360-qa-next25',
    runnerVersion: RUNNER_VERSION,
    generatedAt: new Date().toISOString(),
    manifestPath,
    manifestSha256: manifestHash,
    requiredManifestCount: REQUIRED_MANIFEST_COUNT,
    manifestEntryCount: sourceEntries.length,
    selectedCount: selected.length,
    sampleMode: selected.length !== REQUIRED_MANIFEST_COUNT,
    options: {
      baseUrl: options.baseUrl,
      only: options.only,
      limit: options.limit,
      concurrency: options.concurrency,
      screenshots: options.screenshots,
    },
    pass: rows.every((row) => row.pass),
    passCount: rows.filter((row) => row.pass).length,
    holdCount: rows.filter((row) => !row.pass).length,
    issueCounts,
    rows,
  };
} catch (error) {
  report = {
    runner: 'momentum-360-qa-next25',
    runnerVersion: RUNNER_VERSION,
    generatedAt: new Date().toISOString(),
    manifestPath,
    selectedCount: 0,
    sampleMode: false,
    pass: false,
    passCount: 0,
    holdCount: 0,
    issueCounts: { runner_error: 1 },
    fatalError: { message: error.message, stack: error.stack || null },
    rows: [],
  };
  process.exitCode = 2;
} finally {
  if (apiContext) await apiContext.dispose().catch(() => {});
  if (browser) await browser.close().catch(() => {});
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

process.stdout.write(`${JSON.stringify({
  pass: report.pass,
  manifestEntryCount: report.manifestEntryCount || 0,
  selectedCount: report.selectedCount || 0,
  passCount: report.passCount || 0,
  holdCount: report.holdCount || 0,
  issueCounts: report.issueCounts || {},
  reportPath,
}, null, 2)}\n`);
