#!/usr/bin/env node
/**
 * Key-safe Google Maps integration for static Momentum concept pages.
 *
 * The default path is Google's native output=embed route. It renders the real
 * Google Maps UI without putting an application key in the page source. An
 * optional same-origin runtime endpoint can upgrade the iframe to the Maps
 * Embed API when a separately restricted browser key is authorized. The
 * endpoint is intentionally a contract only; this tool never reads or writes
 * its response and never accepts a key on the command line.
 *
 * Usage (dry run):
 *   node google-maps-integration.mjs \
 *     --sites-root ../site/sites --manifest selected.json
 *
 * Usage (explicit write):
 *   node google-maps-integration.mjs \
 *     --sites-root ../site/sites --manifest selected.json --write
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const TOOL_NAME = 'momentum-google-maps-integration';
const DEFAULT_MAP_ID = 'location-map';
const MAP_MARKER = 'data-google-map';
const STYLE_MARKER = 'data-google-map-style';
const RUNTIME_MARKER = 'data-google-map-runtime';
const STATIC_KEY_PATTERN = /AIza[0-9A-Za-z_-]{20,}/;
const GOOGLE_MAPS_HOSTS = new Set([
  'google.com',
  'www.google.com',
  'maps.google.com',
  'maps.app.goo.gl',
  'g.co',
]);

const htmlEscape = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const decodeHtmlAttribute = (value) => String(value ?? '')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#x27;|&#39;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

function isGoogleMapsUrl(value) {
  const raw = clean(value);
  if (!raw) return false;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return false;
  }
  if (!/^https?:$/i.test(url.protocol)) return false;
  const host = url.hostname.toLowerCase().replace(/^www\./, 'www.');
  if (!GOOGLE_MAPS_HOSTS.has(host)) return false;
  if (host === 'google.com' || host === 'www.google.com') return /\/maps(?:\/|$)/i.test(url.pathname);
  return true;
}

function normalizeMapsUrl(value) {
  const raw = clean(value);
  if (!raw || !isGoogleMapsUrl(raw)) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function finiteCoordinate(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function coordinateQuery(row) {
  const location = row?.location && typeof row.location === 'object' ? row.location : {};
  const lat = finiteCoordinate(row?.latitude ?? row?.lat ?? location.latitude ?? location.lat, -90, 90);
  const lng = finiteCoordinate(row?.longitude ?? row?.lng ?? location.longitude ?? location.lng, -180, 180);
  return lat === null || lng === null ? '' : `${lat},${lng}`;
}

function mapsUrlQuery(value) {
  const normalized = normalizeMapsUrl(value);
  if (!normalized) return '';
  try {
    const url = new URL(normalized);
    for (const key of ['query', 'q', 'destination']) {
      const query = clean(url.searchParams.get(key));
      if (query) return query;
    }
  } catch {
    // normalizeMapsUrl has already validated the host; a malformed URL here
    // simply falls back to the explicit address/name fields.
  }
  return '';
}

function recordQuery(record) {
  const row = record || {};
  return clean(
    coordinateQuery(row)
      || row.mapQuery
      || row.map_query
      || row.address
      || row.formattedAddress
      || row.contact?.address
      || mapsUrlQuery(row.mapsUrl || row.maps_url || row.googleMapsUrl || row.google_maps_url)
      || [row.name || row.business || row.business_name, row.city, row.state].filter(Boolean).join(', '),
  );
}

function isSlugLikeName(name, slug) {
  const value = clean(name).toLowerCase();
  const route = clean(slug).toLowerCase();
  if (!value || !route) return false;
  return value === route || value.replace(/[^a-z0-9]+/g, '-') === route;
}

/**
 * A map query is considered verified when it comes from a concrete address,
 * coordinates, an explicit query, or a Google Maps URL query. A business plus
 * an explicit locality is an allowed fallback; a bare business/slug is not.
 * This prevents a missing source address from silently becoming a map pin for
 * a route slug that Google may resolve to the wrong place.
 */
function hasVerifiedMapInput(record = {}) {
  const normalized = normalizeRecord(record);
  if (coordinateQuery(record) || normalized.address || normalized.mapQuery || mapsUrlQuery(normalized.mapsUrl)) {
    return true;
  }
  return Boolean(normalized.name && (normalized.city || normalized.state));
}

function normalizeRecord(row = {}) {
  const nestedContact = row.contact && typeof row.contact === 'object' ? row.contact : {};
  const nestedLocation = row.location && typeof row.location === 'object' ? row.location : {};
  const name = clean(row.name || row.business || row.business_name || row.title || row.slug || 'Local business');
  const address = clean(
    row.address
      || row.formattedAddress
      || row.formatted_address
      || nestedContact.address
      || nestedLocation.address,
  );
  const mapsUrl = normalizeMapsUrl(
    row.mapsUrl
      || row.maps_url
      || row.googleMapsUrl
      || row.google_maps_url
      || row.placeUrl
      || row.place_url,
  );
  const city = clean(row.city || row.locality || nestedContact.city || nestedLocation.city);
  const state = clean(row.state || row.region || nestedContact.state || nestedLocation.state);
  const mapQuery = clean(row.mapQuery || row.map_query);
  const query = recordQuery({ ...row, name, address, mapsUrl, city, state, mapQuery });
  return {
    slug: clean(row.slug || row.id || ''),
    name,
    address,
    city,
    state,
    mapsUrl,
    mapQuery,
    query,
  };
}

function parseJsonLd(html) {
  const scripts = [...String(html || '').matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed, ...(Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [])];
      const entity = candidates.find((item) => item && typeof item === 'object' && (item.name || item.address));
      if (entity) return entity;
    } catch {
      // A malformed JSON-LD block must not prevent a Maps link from being used.
    }
  }
  return {};
}

function inferRecordFromHtml(html, record = {}) {
  const source = String(html || '');
  const ld = parseJsonLd(source);
  const ldAddress = typeof ld.address === 'string'
    ? ld.address
    : ld.address && typeof ld.address === 'object'
      ? [ld.address.streetAddress, ld.address.addressLocality, ld.address.addressRegion, ld.address.postalCode]
        .filter(Boolean).join(', ')
      : '';
  const mapHref = decodeHtmlAttribute(source.match(/https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google\.com)[^"'\s<>]*/i)?.[0] || '');
  const title = decodeHtmlAttribute(source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, '') || '');
  const explicitName = clean(record.name || record.business || record.business_name || record.title);
  const sourceName = clean(ld.name || title.replace(/\s*[|•·]\s*[^|•·]+$/, ''));
  const name = explicitName && !isSlugLikeName(explicitName, record.slug) ? explicitName : sourceName || explicitName;
  const titleLocality = title.split(/\s*[|•·]\s*/).map(clean).filter(Boolean).slice(1).find((part) => {
    const words = part.split(/\s+/).filter(Boolean);
    return words.length > 0 && words.length <= 4 && !/[.!?:;]/.test(part);
  }) || '';
  const placeLocality = decodeHtmlAttribute(source.match(/<span\b[^>]*>\s*Place\s*<\/span>\s*<strong\b[^>]*>([\s\S]*?)<\/strong>/i)?.[1]?.replace(/<[^>]+>/g, '') || '');
  const inferredLocality = clean(record.city || record.locality || titleLocality || (placeLocality.split(/\s+/).length <= 4 ? placeLocality : ''));
  return normalizeRecord({
    ...record,
    name,
    address: record.address || ldAddress,
    phone: record.phone || ld.telephone,
    mapsUrl: record.mapsUrl || mapHref,
    mapQuery: record.mapQuery || mapsUrlQuery(mapHref),
    city: inferredLocality,
  });
}

function mapsHref(record) {
  const normalized = normalizeMapsUrl(record?.mapsUrl || record?.maps_url || record?.googleMapsUrl || record?.google_maps_url);
  if (normalized) return normalized;
  const query = recordQuery(record);
  if (!query) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function outputEmbedUrl(record) {
  const query = recordQuery(record);
  if (!query) throw new Error('A verified address, coordinates, Maps query, or business/locality is required.');
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function embedApiUrl(record) {
  const query = recordQuery(record);
  if (!query) throw new Error('A verified address, coordinates, Maps query, or business/locality is required.');
  // The browser key is deliberately absent. The optional runtime loader adds
  // it only after a same-origin endpoint returns an authorized restricted key.
  return `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(query)}`;
}

function validateRuntimeEndpoint(endpoint) {
  const value = clean(endpoint);
  if (!value) return '';
  if (!value.startsWith('/') || value.startsWith('//')) {
    throw new Error('runtime key endpoint must be a same-origin absolute path such as /.netlify/functions/maps-config');
  }
  return value;
}

function mapStyles() {
  return `<style ${STYLE_MARKER}>
.maps-integration{background:var(--deep,#11120f);color:var(--on-deep,#fff);}
.maps-integration__inner{width:min(calc(100% - 2rem),1180px);margin-inline:auto;padding:clamp(3rem,8vw,7rem) 0;}
.maps-integration__heading{max-width:58ch;margin:0 0 clamp(1.25rem,3vw,2rem);}
.maps-integration__heading h2{margin:0;font-size:clamp(1.8rem,4vw,3.8rem);line-height:1.04;text-wrap:balance;}
.maps-integration__heading p{margin:.8rem 0 0;max-width:58ch;opacity:.78;line-height:1.55;}
.maps-integration__frame{width:100%;min-height:280px;aspect-ratio:16/9;overflow:hidden;background:#e7e3d7;border:1px solid rgba(255,255,255,.34);border:1px solid color-mix(in srgb,currentColor 42%,transparent);}
.maps-integration__frame iframe{display:block;width:100%;height:100%;min-height:280px;border:0;}
.maps-integration__footer{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem;}
.maps-integration__privacy{margin:0;max-width:58ch;font-size:.82rem;line-height:1.5;opacity:.72;}
.maps-integration__link{display:inline-flex;align-items:center;justify-content:center;gap:.55rem;min-height:44px;padding:.7rem 1rem;border:1px solid currentColor;color:inherit;text-decoration:none;white-space:nowrap;}
.maps-integration__link:hover{background:color-mix(in srgb,currentColor 12%,transparent);}
.maps-integration__link:focus-visible{outline:3px solid currentColor;outline-offset:3px;}
.maps-integration__fallback{margin:.75rem 0 0;font-size:.9rem;line-height:1.5;}
.maps-integration__fallback a{color:inherit;}
@media (max-width:640px){
  .maps-integration__inner{width:min(calc(100% - 1.5rem),1180px);padding:3.25rem 0;}
  .maps-integration__frame,.maps-integration__frame iframe{min-height:220px;}
  .maps-integration__footer{align-items:flex-start;flex-direction:column;}
  .maps-integration__link{width:100%;}
}
@media (prefers-reduced-motion:reduce){.maps-integration *{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important;}}
</style>`;
}

function runtimeLoader() {
  return `<script ${RUNTIME_MARKER}>
(()=>{
  const root=document.querySelector('[${MAP_MARKER}]');
  if(!root)return;
  const endpoint=root.dataset.mapKeyEndpoint;
  const frame=root.querySelector('iframe');
  const apiSrc=root.dataset.mapApiSrc;
  if(!endpoint||!frame||!apiSrc)return;
  fetch(endpoint,{headers:{Accept:'application/json'},credentials:'same-origin',cache:'no-store'})
    .then((response)=>{if(!response.ok)throw new Error('map key endpoint unavailable');return response.json();})
    .then((payload)=>{
      const key=typeof payload?.key==='string'?payload.key.trim():'';
      if(!/^[A-Za-z0-9_-]{20,256}$/.test(key))throw new Error('map key response rejected');
      const next=new URL(apiSrc,location.href);
      next.searchParams.set('key',key);
      frame.src=next.toString();
      root.dataset.mapMode='embed-api';
    })
    .catch(()=>{root.dataset.mapMode='output-embed';});
})();
</script>`;
}

function buildMapSection(record, options = {}) {
  const normalized = normalizeRecord(record);
  if (!normalized.query) throw new Error(`No map query for ${normalized.name}.`);
  const id = clean(options.id || DEFAULT_MAP_ID).replace(/[^A-Za-z0-9_-]/g, '') || DEFAULT_MAP_ID;
  const endpoint = validateRuntimeEndpoint(options.runtimeKeyEndpoint);
  const business = normalized.name || 'this business';
  const addressLine = normalized.address || [normalized.city, normalized.state].filter(Boolean).join(', ');
  const directions = mapsHref(normalized);
  if (!directions) throw new Error(`No Google Maps directions URL for ${business}.`);
  const outputUrl = outputEmbedUrl(normalized);
  const apiUrl = embedApiUrl(normalized);
  const endpointAttribute = endpoint ? ` data-map-key-endpoint="${htmlEscape(endpoint)}"` : '';
  const addressCopy = addressLine
    ? `<p>${htmlEscape(addressLine)}</p>`
    : '<p>Use the map to confirm the current location before visiting.</p>';
  return `<section class="maps-integration" id="${htmlEscape(id)}" ${MAP_MARKER} data-map-mode="output-embed" data-map-query="${htmlEscape(normalized.query)}" data-map-api-src="${htmlEscape(apiUrl)}"${endpointAttribute} aria-labelledby="${htmlEscape(id)}-heading">
  <div class="maps-integration__inner">
    <div class="maps-integration__heading">
      <h2 id="${htmlEscape(id)}-heading">Find ${htmlEscape(business)} on Google Maps</h2>
      ${addressCopy}
    </div>
    <div class="maps-integration__frame">
      <iframe data-google-map-embed="output-embed" title="Google Map showing ${htmlEscape(business)} location" src="${htmlEscape(outputUrl)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
    <div class="maps-integration__footer">
      <p class="maps-integration__privacy">Google Maps content loads from Google when this section comes into view. Use the direct link if the embedded map is unavailable.</p>
      <a class="maps-integration__link" href="${htmlEscape(directions)}" target="_blank" rel="noopener noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a>
    </div>
    <p class="maps-integration__fallback">Keyboard users can tab to the map or <a href="${htmlEscape(directions)}" target="_blank" rel="noopener noreferrer">open directions in a new tab</a>.</p>
    <noscript><p class="maps-integration__fallback"><a href="${htmlEscape(directions)}" target="_blank" rel="noopener noreferrer">Open ${htmlEscape(business)} in Google Maps</a></p></noscript>
  </div>
</section>`;
}

function hasNoindex(html) {
  return /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html)
    || /<meta\b[^>]*content=["'][^"']*\bnoindex\b[^"']*["'][^>]*name=["']robots["']/i.test(html);
}

function assertNoStaticMapKey(html) {
  if (STATIC_KEY_PATTERN.test(html)) throw new Error('static Google API key pattern detected; map integration is key-safe only');
  if (/GOOGLE_(?:MAPS|PLACES)_API_KEY\s*=/i.test(html)) throw new Error('Google key environment name must not be emitted as page markup');
}

function insertBeforeTag(html, tagPattern, insertion) {
  const match = tagPattern.exec(html);
  if (!match) return '';
  return `${html.slice(0, match.index)}${insertion}${html.slice(match.index)}`;
}

/**
 * Inject a map into one page. No write occurs here; callers decide whether to
 * persist the returned HTML. Existing map markers are treated as idempotent.
 */
function injectMapIntoHtml(html, record, options = {}) {
  if (typeof html !== 'string' || !html.trim()) throw new Error('HTML source is empty.');
  if (options.requireNoindex !== false && !hasNoindex(html)) {
    throw new Error('page is not marked noindex; refusing to add a prospect map');
  }
  assertNoStaticMapKey(html);
  if (html.includes(MAP_MARKER)) {
    return { html, changed: false, status: 'already-integrated', record: normalizeRecord(record) };
  }
  if (new RegExp(`id=["']${DEFAULT_MAP_ID}["']`, 'i').test(html)) {
    throw new Error(`page already contains #${DEFAULT_MAP_ID} without the integration marker`);
  }
  const section = buildMapSection(record, options);
  let output = html;
  if (!output.includes(STYLE_MARKER)) {
    const styled = insertBeforeTag(output, /<\/head>/i, mapStyles());
    output = styled || `${mapStyles()}${output}`;
  }
  const beforeFooter = insertBeforeTag(output, /<footer\b/i, section);
  if (beforeFooter) output = beforeFooter;
  else {
    const beforeMain = insertBeforeTag(output, /<\/main>/i, section);
    output = beforeMain || insertBeforeTag(output, /<\/body>/i, section) || `${output}${section}`;
  }
  if (options.runtimeKeyEndpoint && !output.includes(RUNTIME_MARKER)) {
    const withRuntime = insertBeforeTag(output, /<\/body>/i, runtimeLoader());
    output = withRuntime || `${output}${runtimeLoader()}`;
  }
  assertNoStaticMapKey(output);
  if (options.requireNoindex !== false && !hasNoindex(output)) {
    throw new Error('noindex marker was lost while injecting the map');
  }
  return { html: output, changed: true, status: 'integrated', record: normalizeRecord(record) };
}

function manifestRows(doc) {
  if (Array.isArray(doc)) return doc;
  for (const key of ['prospects', 'sites', 'selection', 'rows', 'items']) {
    if (Array.isArray(doc?.[key])) return doc[key];
  }
  throw new Error('Manifest must be an array or contain prospects, sites, selection, rows, or items.');
}

function atomicWrite(file, value) {
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, value, 'utf8');
  fs.renameSync(temp, file);
}

function applyMapManifest({ sitesRoot, manifest, write = false, runtimeKeyEndpoint = '', requireNoindex = true } = {}) {
  if (!sitesRoot) throw new Error('sitesRoot is required.');
  const root = path.resolve(sitesRoot);
  const rows = manifestRows(manifest);
  const results = [];
  for (const row of rows) {
    const record = normalizeRecord(row);
    const slug = record.slug;
    if (!slug || slug.includes('..') || /[\\/]/.test(slug)) {
      results.push({ slug: slug || null, status: 'hold', reason: 'safe slug is required' });
      continue;
    }
    const file = path.join(root, slug, 'index.html');
    if (!fs.existsSync(file)) {
      results.push({ slug, status: 'hold', reason: 'site index.html not found' });
      continue;
    }
    try {
      const source = fs.readFileSync(file, 'utf8');
      const inferred = inferRecordFromHtml(source, record);
      if (!hasVerifiedMapInput(inferred)) {
        results.push({ slug, status: 'hold', reason: 'no verified map query in manifest or page (address, coordinates, Maps query, or business plus locality required)' });
        continue;
      }
      const result = injectMapIntoHtml(source, inferred, { runtimeKeyEndpoint, requireNoindex });
      if (write && result.changed) atomicWrite(file, result.html);
      results.push({ slug, status: result.status, changed: result.changed, query: inferred.query, file: path.relative(root, file).replace(/\\/g, '/') });
    } catch (error) {
      results.push({ slug, status: 'hold', reason: String(error?.message || error) });
    }
  }
  return {
    tool: TOOL_NAME,
    mode: write ? 'write' : 'dry-run',
    sitesRoot: root,
    total: rows.length,
    integrated: results.filter((row) => row.status === 'integrated').length,
    alreadyIntegrated: results.filter((row) => row.status === 'already-integrated').length,
    holds: results.filter((row) => row.status === 'hold').length,
    staticSecretPolicy: 'no Google API key is emitted into static HTML',
    browserKeyEnvName: 'GOOGLE_MAPS_EMBED_BROWSER_KEY',
    placesKeyEnvName: 'GOOGLE_PLACES_API_KEY',
    results,
  };
}

function parseArgs(argv) {
  const out = { write: false, requireNoindex: true };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--write') out.write = true;
    else if (arg === '--allow-indexable') out.requireNoindex = false;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`);
      out[key] = value;
      index += 1;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function singleRecord(args) {
  return normalizeRecord({
    slug: args.slug,
    name: args.business || args.name,
    address: args.address,
    city: args.city,
    state: args.state,
    mapsUrl: args.mapsUrl || args.mapsURL,
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.sitesRoot) throw new Error('--sites-root is required.');
  let manifest;
  if (args.manifest) {
    if (args.slugs) throw new Error('--manifest and --slugs are mutually exclusive.');
    manifest = JSON.parse(fs.readFileSync(path.resolve(args.manifest), 'utf8'));
  } else if (args.slugs) {
    const slugs = String(args.slugs).split(',').map((value) => value.trim()).filter(Boolean);
    if (!slugs.length) throw new Error('--slugs requires at least one slug.');
    manifest = slugs.map((slug) => ({ slug }));
  } else {
    if (!args.slug) throw new Error('--manifest or --slug is required.');
    manifest = [singleRecord(args)];
  }
  const report = applyMapManifest({
    sitesRoot: args.sitesRoot,
    manifest,
    write: args.write,
    runtimeKeyEndpoint: args.runtimeKeyEndpoint || '',
    requireNoindex: args.requireNoindex,
  });
  console.log(JSON.stringify(report, null, 2));
  if (report.holds) process.exitCode = 2;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

export {
  TOOL_NAME,
  DEFAULT_MAP_ID,
  isGoogleMapsUrl,
  normalizeMapsUrl,
  normalizeRecord,
  recordQuery,
  mapsHref,
  outputEmbedUrl,
  embedApiUrl,
  buildMapSection,
  hasNoindex,
  hasVerifiedMapInput,
  assertNoStaticMapKey,
  inferRecordFromHtml,
  injectMapIntoHtml,
  manifestRows,
  applyMapManifest,
};
