import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  applyMapManifest,
  assertNoStaticMapKey,
  buildMapSection,
  embedApiUrl,
  hasNoindex,
  hasVerifiedMapInput,
  inferRecordFromHtml,
  injectMapIntoHtml,
  isGoogleMapsUrl,
  mapsHref,
  normalizeRecord,
  outputEmbedUrl,
} from './google-maps-integration.mjs';

const sample = {
  slug: 'a-m-electric-inc',
  name: 'A.M. Electric, Inc.',
  address: '2245-47 N. 27th Street, Philadelphia, PA 19132',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=A.M.%20Electric%202245-47%20N.%2027th%20Street%20Philadelphia%20PA%2019132',
};

const page = `<!doctype html><html><head><meta name="robots" content="noindex,nofollow"><title>Sample</title></head><body><main><h1>Sample concept</h1></main><footer><p>Private concept</p></footer></body></html>`;

test('normalizes a Maps-first record and preserves a verified Google URL', () => {
  const record = normalizeRecord(sample);
  assert.equal(record.slug, sample.slug);
  assert.equal(record.address, sample.address);
  assert.equal(record.mapsUrl, sample.mapsUrl);
  assert.equal(record.query, sample.address);
  assert.equal(isGoogleMapsUrl(sample.mapsUrl), true);
  assert.equal(isGoogleMapsUrl('https://example.com/maps?q=bad'), false);
});

test('builds native output=embed and directions URLs without a key', () => {
  const output = outputEmbedUrl(sample);
  assert.match(output, /^https:\/\/www\.google\.com\/maps\?q=/);
  assert.match(output, /output=embed$/);
  assert.doesNotMatch(output, /(?:^|[?&])key=/i);
  assert.equal(mapsHref(sample), sample.mapsUrl);
  const api = embedApiUrl(sample);
  assert.match(api, /\/maps\/embed\/v1\/place\?q=/);
  assert.doesNotMatch(api, /(?:^|[?&])key=/i);
});

test('renders an accessible, responsive map section and runtime key contract', () => {
  const section = buildMapSection(sample, { runtimeKeyEndpoint: '/.netlify/functions/maps-config' });
  assert.match(section, /data-google-map/);
  assert.match(section, /title="Google Map showing A\.M\. Electric, Inc\. location"/);
  assert.match(section, /loading="lazy"/);
  assert.match(section, /data-google-map-embed="output-embed"/);
  assert.match(section, /referrerpolicy="strict-origin-when-cross-origin"/);
  assert.match(section, /Open in Google Maps/);
  assert.match(section, /data-map-key-endpoint="\/.netlify\/functions\/maps-config"/);
  assert.doesNotMatch(section, /AIza|GOOGLE_(?:MAPS|PLACES)_API_KEY/i);
});

test('derives the exact query from an existing directions anchor when manifest data is thin', () => {
  const source = '<title>Example business | Philadelphia</title><a href="https://www.google.com/maps/search/?api=1&amp;query=11%20Hagerty%20Blvd%2C%20Malvern%2C%20PA%2019355">Directions</a>';
  const inferred = inferRecordFromHtml(source, { slug: 'example-business' });
  assert.equal(inferred.query, '11 Hagerty Blvd, Malvern, PA 19355');
  assert.equal(inferred.mapsUrl, 'https://www.google.com/maps/search/?api=1&query=11%20Hagerty%20Blvd%2C%20Malvern%2C%20PA%2019355');
});

test('allows a business plus locality fallback but rejects a bare route slug', () => {
  const inferred = inferRecordFromHtml(
    '<title>Electric Direct | Havertown</title><script type="application/ld+json">{"@type":"LocalBusiness","name":"Electric Direct"}</script>',
    { slug: 'electric-direct' },
  );
  assert.equal(inferred.name, 'Electric Direct');
  assert.equal(inferred.city, 'Havertown');
  assert.equal(inferred.query, 'Electric Direct, Havertown');
  assert.equal(hasVerifiedMapInput(inferred), true);
  assert.equal(hasVerifiedMapInput({ slug: 'electric-direct' }), false);
});

test('injects idempotently before the footer, preserves noindex, and emits no key', () => {
  const first = injectMapIntoHtml(page, sample, { runtimeKeyEndpoint: '/api/maps-config' });
  assert.equal(first.changed, true);
  assert.equal(first.status, 'integrated');
  assert.ok(first.html.indexOf('data-google-map') < first.html.indexOf('<footer'));
  assert.equal(hasNoindex(first.html), true);
  assert.match(first.html, /data-google-map-style/);
  assert.match(first.html, /data-google-map-runtime/);
  assert.doesNotMatch(first.html, /AIza|GOOGLE_(?:MAPS|PLACES)_API_KEY/i);

  const second = injectMapIntoHtml(first.html, sample, { runtimeKeyEndpoint: '/api/maps-config' });
  assert.equal(second.changed, false);
  assert.equal(second.status, 'already-integrated');
});

test('fails closed for indexable pages and static API key patterns', () => {
  assert.throws(() => injectMapIntoHtml(page.replace('noindex,nofollow', 'index,follow'), sample), /not marked noindex/);
  assert.throws(() => assertNoStaticMapKey('<script>const key="AIza1234567890123456789012345"</script>'), /static Google API key/);
  assert.throws(() => buildMapSection(sample, { runtimeKeyEndpoint: 'https://example.com/key' }), /same-origin/);
});

test('applies only manifest slugs and supports a dry run plus explicit write', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'maps-integration-'));
  const target = path.join(root, sample.slug);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'index.html'), page, 'utf8');
  fs.mkdirSync(path.join(root, 'not-selected'), { recursive: true });
  fs.writeFileSync(path.join(root, 'not-selected', 'index.html'), page, 'utf8');

  const dry = applyMapManifest({ sitesRoot: root, manifest: [sample, { ...sample, slug: 'not-present' }] });
  assert.equal(dry.mode, 'dry-run');
  assert.equal(dry.integrated, 1);
  assert.equal(dry.holds, 1);
  assert.equal(fs.readFileSync(path.join(target, 'index.html'), 'utf8'), page);

  const written = applyMapManifest({ sitesRoot: root, manifest: [sample], write: true });
  assert.equal(written.mode, 'write');
  assert.equal(written.integrated, 1);
  assert.match(fs.readFileSync(path.join(target, 'index.html'), 'utf8'), /data-google-map/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'not-selected', 'index.html'), 'utf8'), /data-google-map/);
});

test('holds a slug-only page without a verified location signal', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'maps-hold-'));
  const target = path.join(root, 'generic-business');
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'index.html'), page, 'utf8');

  const report = applyMapManifest({ sitesRoot: root, manifest: [{ slug: 'generic-business' }] });
  assert.equal(report.integrated, 0);
  assert.equal(report.holds, 1);
  assert.match(report.results[0].reason, /no verified map query/);
  assert.equal(fs.readFileSync(path.join(target, 'index.html'), 'utf8'), page);
});
