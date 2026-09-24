'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CHECKS = [
  ['capture', 'Public DOM capture', p => verdict(p.blocked ? 'advisory' : 'pass', p.blocked ? 'Capture was blocked; content checks are unavailable.' : 'Public DOM capture completed.')],
  ['title', 'Title metadata', p => metadata(p.title, 'title', 15, 70)],
  ['description', 'Description metadata', p => metadata(p.description, 'description', 50, 160)],
  ['canonical', 'Canonical URL', canonical],
  ['robots', 'Indexability', robots],
  ['h1', 'H1 heading', h1],
  ['heading_order', 'Heading order', headingOrder],
  ['lang', 'Document language', language],
  ['viewport', 'Viewport', viewport],
  ['images', 'Image alternatives and dimensions', images],
  ['link_names', 'Link accessible names', linkNames],
  ['duplicate_scheme_links', 'Malformed duplicated-scheme links', duplicateSchemes],
  ['duplicate_ids', 'Duplicate IDs', duplicateIds],
  ['iframe_titles', 'Iframe titles', iframeTitles],
  ['form_labels', 'Form field labels', formLabels],
  ['jsonld', 'JSON-LD syntax', jsonld],
  ['open_graph', 'Open Graph metadata', () => verdict('na', 'Open Graph fields are not present in the capture schema.')],
];
const CONTENT = new Set(CHECKS.map(c => c[0]).filter(id => !['capture', 'open_graph'].includes(id)));
const REQUIRED_ARRAYS = ['canonical', 'h1', 'headings', 'images', 'links', 'forms', 'buttons', 'iframes', 'ids', 'jsonld'];
const REQUIRED_FIELDS = ['requestedUrl', 'url', 'title', 'lang', 'description', 'robots', 'canonical', 'viewport', 'h1', 'headings', 'images', 'links', 'forms', 'buttons', 'iframes', 'ids', 'jsonld', 'bodyTextLength', 'blocked', 'capturedAt'];

function snippet(value, max = 220) {
  if (typeof value !== 'string') return '';
  const text = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
function verdict(status, message, evidence = []) {
  return { status, message: snippet(message, 300), evidence: evidence.map(v => snippet(v)).filter(Boolean).slice(0, 3) };
}
const text = v => typeof v === 'string' ? v.trim() : '';
const array = v => Array.isArray(v) ? v : null;
function validateRecord(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return ['capture must be an object'];
  const errors = [];
  if (p.blocked === true) {
    const allowed = new Set(['requestedUrl', 'blocked', 'error']);
    const extra = Object.keys(p).filter(key => !allowed.has(key));
    if (extra.length) errors.push(`blocked capture has unexpected fields: ${extra.join(', ')}`);
    const requested = typeof p.requestedUrl === 'string' ? parseUrl(p.requestedUrl) : null;
    if (!requested || !['http:', 'https:'].includes(requested.protocol)) errors.push('requestedUrl must be an absolute HTTP(S) URL');
    if (typeof p.error !== 'string' || !p.error.trim()) errors.push('error must be nonempty text');
    return errors;
  }
  const missing = REQUIRED_FIELDS.filter(key => !Object.prototype.hasOwnProperty.call(p, key));
  if (missing.length) errors.push(`missing fields: ${missing.join(', ')}`);
  for (const key of REQUIRED_ARRAYS) if (!Array.isArray(p[key])) errors.push(`${key} must be an array`);
  for (const key of ['requestedUrl', 'url']) {
    const parsed = typeof p[key] === 'string' ? parseUrl(p[key]) : null;
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) errors.push(`${key} must be an absolute HTTP(S) URL`);
  }
  for (const key of ['title', 'description', 'viewport', 'capturedAt']) if (typeof p[key] !== 'string') errors.push(`${key} must be text`);
  if (p.lang !== null && typeof p.lang !== 'string') errors.push('lang must be text or null');
  if (typeof p.title === 'string' && !p.title.trim()) errors.push('title is empty');
  if (typeof p.capturedAt !== 'string' || !Number.isFinite(Date.parse(p.capturedAt))) errors.push('capturedAt must be a valid timestamp');
  if (typeof p.bodyTextLength !== 'number' || !Number.isSafeInteger(p.bodyTextLength) || p.bodyTextLength <= 0) errors.push('bodyTextLength must be a positive integer');
  if (p.blocked !== false) errors.push('captured row must have blocked=false');
  if (p.robots !== null && p.robots !== undefined && typeof p.robots !== 'string') errors.push('robots must be text or null');
  return errors;
}
function metadata(value, name, min, max) {
  const s = text(value);
  if (!s) return verdict('failure', `${name} is missing or empty.`);
  if (s.length < min || s.length > max) return verdict('advisory', `${name} is ${s.length} characters; common review range is ${min}–${max}.`, [s]);
  return verdict('pass', `${name} is present and ${s.length} characters long.`);
}
function parseUrl(value, base) { try { return new URL(value, base); } catch { return null; } }
function canonical(p) {
  const list = array(p.canonical);
  if (!list) return verdict('failure', 'Canonical link evidence is missing.');
  if (list.length !== 1) return verdict('failure', `Expected one canonical link; found ${list.length}.`, list.slice(0, 3));
  const href = text(list[0]);
  if (!href) return verdict('failure', 'Canonical href is empty.');
  const page = parseUrl(text(p.url) || text(p.requestedUrl));
  const target = parseUrl(href, page ? page.href : undefined);
  if (!target || !['http:', 'https:'].includes(target.protocol)) return verdict('failure', 'Canonical href is not a valid HTTP(S) URL.', [href]);
  if (!page) return verdict('advisory', 'Canonical parsed, but the page URL is unavailable for host/path comparison.', [href]);
  const notes = [];
  if (target.hostname !== page.hostname) notes.push(`host ${target.hostname} differs from page host ${page.hostname}`);
  const cp = target.pathname.replace(/\/$/, '') || '/', pp = page.pathname.replace(/\/$/, '') || '/';
  if (cp !== pp) notes.push(`path ${target.pathname} differs from page path ${page.pathname}`);
  return notes.length ? verdict('advisory', `Canonical is unique and valid; ${notes.join('; ')}.`, [href]) : verdict('pass', 'One valid canonical matches the captured page host and path.');
}
function robots(p) {
  const s = text(p.robots);
  if (!s) return verdict('advisory', 'No robots directive was captured; explicit indexability was not confirmed.');
  return /\bnoindex\b/i.test(s) ? verdict('failure', 'Robots metadata contains noindex.', [s]) : verdict('pass', 'No noindex directive found.', [s]);
}
function h1(p) {
  const list = array(p.h1);
  if (!list) return verdict('failure', 'H1 evidence is missing.');
  if (list.length !== 1) return verdict('failure', `Expected exactly one H1; found ${list.length}.`, list.slice(0, 3));
  return text(list[0]) ? verdict('pass', 'Exactly one nonempty H1 was captured.', [list[0]]) : verdict('failure', 'The single H1 is empty.');
}
function level(v) {
  if (typeof v === 'number' && Number.isInteger(v)) return v;
  const m = String(v ?? '').trim().match(/^h?([1-6])$/i);
  return m ? Number(m[1]) : null;
}
function headingOrder(p) {
  const list = array(p.headings);
  if (!list) return verdict('na', 'Heading outline was not captured.');
  if (!list.length) return verdict('na', 'No headings were captured, so heading order could not be assessed.');
  const levels = list.map(h => level(h && h.level));
  if (levels.some(n => n === null || n < 1 || n > 6)) return verdict('advisory', 'Some heading levels could not be interpreted.', list.slice(0, 3).map(h => h && `${h.level}: ${h.text || ''}`));
  const gaps = [];
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) gaps.push(`H${levels[i - 1]} → H${levels[i]}${list[i] && list[i].text ? ` (${list[i].text})` : ''}`);
  return gaps.length ? verdict('failure', `Heading levels skip a level in ${gaps.length} transition(s).`, gaps) : verdict('pass', 'No downward heading-level gaps were found.');
}
function language(p) {
  const s = text(p.lang);
  if (!s) return verdict('failure', 'Document language is missing.');
  return /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(s) ? verdict('pass', 'Document language is present and tag-shaped.', [s]) : verdict('failure', 'Document language is not a plausible language tag.', [s]);
}
function viewport(p) {
  const s = text(p.viewport);
  if (!s) return verdict('failure', 'Viewport metadata is missing or empty.');
  const tokens = new Map(s.split(',').map(part => { const [key, ...rest] = part.split('='); return [key.trim().toLowerCase(), rest.join('=').trim().toLowerCase()]; }));
  if (tokens.get('user-scalable') === 'no' || (tokens.has('maximum-scale') && Number(tokens.get('maximum-scale')) <= 1)) return verdict('failure', 'Viewport settings restrict user zoom.', [s]);
  return tokens.get('width') === 'device-width' ? verdict('pass', 'Viewport uses device width and does not explicitly restrict zoom.') : verdict('failure', 'Viewport does not set width=device-width.', [s]);
}
function images(p) {
  const list = array(p.images);
  if (!list) return verdict('na', 'Image evidence was not captured.');
  if (!list.length) return verdict('na', 'No images were captured, so image alternatives and dimensions could not be assessed.');
  let missingAlt = 0, unclearAlt = 0, weakDimensions = 0;
  for (const img of list) {
    if (!img || img.alt == null) missingAlt++;
    else if (typeof img.alt !== 'string') unclearAlt++;
    if (!img || !/^[1-9]\d*$/.test(String(img.width ?? '')) || !/^[1-9]\d*$/.test(String(img.height ?? ''))) weakDimensions++;
  }
  const evidence = [`images=${list.length}; missing alt attribute=${missingAlt}; dimensions missing or invalid=${weakDimensions}`];
  if (missingAlt) return verdict('failure', `${missingAlt} image(s) have no alt attribute; empty alt remains valid for decorative images.`, evidence);
  if (unclearAlt || weakDimensions) return verdict('advisory', `${unclearAlt} unclear alt value(s); ${weakDimensions} image(s) lack positive numeric width and height.`, evidence);
  return verdict('pass', 'Every image has an alt attribute and positive numeric dimensions.', evidence);
}
function linkNames(p) {
  const list = array(p.links);
  if (!list) return verdict('na', 'Link evidence was not captured.');
  if (!list.length) return verdict('na', 'No links were captured, so link names could not be assessed.');
  const unnamed = list.filter(a => !a || (![a.text, a.aria, a.title].some(v => text(v)) && a.hasImageAlt !== true));
  const note = 'Markup-only heuristic; computed accessibility was not checked, so this is not a confirmed accessibility failure.';
  return unnamed.length ? verdict('advisory', `${unnamed.length} of ${list.length} link(s) lack a candidate name in captured text/ARIA/title/image-alt fields. ${note}`) : verdict('advisory', `No missing candidate names were found in ${list.length} captured link(s). ${note}`);
}
function repeatedScheme(href) {
  // Sharing URLs legitimately embed another URL in the query or fragment.
  const s = text(href).split(/[?#]/, 1)[0], first = s.match(/https?:\/\//i);
  if (!first) return false;
  const rest = s.slice(first.index + first[0].length);
  return /https?:\/\//i.test(rest) || /^https?\/\//i.test(rest);
}
function duplicateSchemes(p) {
  const list = array(p.links);
  if (!list) return verdict('na', 'Link evidence was not captured.');
  if (!list.length) return verdict('na', 'No links were captured, so hrefs could not be assessed.');
  const bad = list.filter(a => repeatedScheme(a && a.href)).length;
  const missing = list.filter(a => !text(a && a.href)).length;
  const note = 'The collector provides browser-resolved hrefs only; malformed raw markup normalized by the browser cannot be confirmed.';
  return verdict('advisory', `${bad} repeated-scheme pattern(s) found in resolved hrefs; ${missing} href(s) unavailable. ${note}`);
}
function duplicateIds(p) {
  const list = array(p.ids);
  if (!list) return verdict('na', 'ID evidence was not captured.');
  const seen = new Set(), repeated = new Set();
  for (const id of list) if (typeof id === 'string' && id !== '') { if (seen.has(id)) repeated.add(id); else seen.add(id); }
  const empty = list.filter(id => typeof id !== 'string' || !id.trim()).length;
  if (repeated.size) return verdict('failure', `${repeated.size} duplicate ID value(s) were found.`, [...repeated]);
  if (!seen.size) return verdict('na', `No nonempty IDs were captured; ${empty} empty ID value(s) were not compared.`);
  return empty ? verdict('advisory', `${empty} empty ID value(s) could not be compared; no duplicate nonempty IDs were found.`) : verdict('pass', 'No duplicate nonempty IDs were found.');
}
function iframeKind(frame, p) {
  const src = text(frame && frame.src);
  if (!src || /^(?:about:blank|about:srcdoc|data:|blob:)/i.test(src) || /(?:chat|recaptcha|captcha|turnstile|hcaptcha|intercom|tawk|zendesk|crisp|drift|livechat|olark|userway|accessibe)/i.test(src)) return 'dynamic';
  const pageUrl = parseUrl(text(p.url));
  const frameUrl = parseUrl(src, pageUrl && pageUrl.href);
  if (!frameUrl || !['http:', 'https:'].includes(frameUrl.protocol)) return 'dynamic';
  return pageUrl && frameUrl.origin === pageUrl.origin ? 'owned' : 'thirdParty';
}
function iframeTitles(p) {
  const list = array(p.iframes);
  if (!list) return verdict('na', 'Iframe evidence was not captured.');
  if (!list.length) return verdict('na', 'No iframes were captured, so titles could not be assessed.');
  const counts = { owned: 0, thirdParty: 0, dynamic: 0, untitledOwned: 0, untitledThirdParty: 0, untitledDynamic: 0 };
  for (const frame of list) {
    const kind = iframeKind(frame, p);
    counts[kind]++;
    if (!text(frame && frame.title)) counts[`untitled${kind[0].toUpperCase()}${kind.slice(1)}`]++;
  }
  const evidence = [`frames=${list.length}; site-owned=${counts.owned}; third-party=${counts.thirdParty}; dynamic chat/captcha/blank=${counts.dynamic}; untitled owned=${counts.untitledOwned}; untitled third-party=${counts.untitledThirdParty}; untitled dynamic=${counts.untitledDynamic}`];
  if (counts.untitledOwned) return verdict('failure', `${counts.untitledOwned} site-owned iframe(s) have no captured title.`, evidence);
  if (counts.untitledThirdParty) return verdict('advisory', `${counts.untitledThirdParty} stable third-party iframe(s) have no captured title; dynamic chat/captcha/blank frames are reported separately.`, evidence);
  if (counts.untitledDynamic) return verdict('advisory', `${counts.untitledDynamic} dynamic chat/captcha/blank iframe(s) have no captured title; they are not counted as site-owned frame failures.`, evidence);
  return verdict('pass', `All ${list.length} captured iframe titles are nonempty.`, evidence);
}
function formLabels(p) {
  const forms = array(p.forms);
  if (!forms) return verdict('na', 'Form evidence was not captured.');
  const fields = forms.flatMap(f => array(f && f.fields) || []).filter(f => !['hidden', 'submit', 'reset', 'button'].includes(text(f && f.type).toLowerCase()));
  if (!fields.length) return verdict('na', 'No label-requiring form fields were captured.');
  const missing = fields.filter(f => f.hasLabel === false), unclear = fields.filter(f => typeof f.hasLabel !== 'boolean');
  const note = 'Markup-only heuristic; the computed accessibility tree was not checked, so this is not a confirmed accessibility failure.';
  if (missing.length) return verdict('advisory', `${missing.length} of ${fields.length} field(s) lack an explicit label association in the capture. ${note}`);
  if (unclear.length) return verdict('advisory', `Label state is unclear for ${unclear.length} of ${fields.length} field(s). ${note}`);
  return verdict('advisory', `No missing label associations were found for ${fields.length} captured field(s). ${note}`);
}
function jsonld(p) {
  const list = array(p.jsonld);
  if (!list) return verdict('na', 'JSON-LD evidence was not captured.');
  if (!list.length) return verdict('advisory', 'No JSON-LD blocks were captured; structured data is optional.');
  const bad = [];
  for (let i = 0; i < list.length; i++) try { if (typeof list[i] !== 'string') throw 0; JSON.parse(list[i]); } catch { bad.push(`block ${i + 1}: ${String(list[i])}`); }
  return bad.length ? verdict('failure', `${bad.length} of ${list.length} JSON-LD block(s) are not valid JSON.`, bad) : verdict('pass', `All ${list.length} JSON-LD block(s) parse as JSON.`);
}
function analyzeRecord(page, index) {
  const validationErrors = validateRecord(page), blocked = !validationErrors.length && page.blocked === true;
  const invalid = validationErrors.length > 0;
  return {
    pageNumber: index + 1, requestedUrl: snippet(page && page.requestedUrl, 400), url: snippet(page && page.url, 400),
    title: snippet(page && page.title, 180), capturedAt: snippet(page && page.capturedAt, 80),
    captureStatus: invalid ? 'invalid/unverified' : blocked ? 'blocked' : 'inspected', blocked, invalid,
    ...(blocked ? { captureError: snippet(page.error, 220) } : {}),
    ...(invalid ? { validationErrors: validationErrors.map(e => snippet(e, 220)) } : {}),
    checks: CHECKS.map(([id, name, run]) => ({ id, name,
      ...(invalid ? (id === 'capture' ? verdict('failure', 'Capture record is invalid; page contents are unverified.', validationErrors) : verdict('na', 'Capture record is invalid; page contents were not assessed.'))
        : blocked && CONTENT.has(id) ? verdict('na', 'Capture was blocked; page contents were not assessed.') : run(page || {})) })),
  };
}
function buildReport(records, sourceName) {
  if (!Array.isArray(records) || !records.length) throw new Error('Input must contain at least one page capture.');
  const pages = records.map(analyzeRecord), outcomes = { pass: 0, advisory: 0, failure: 0, na: 0 };
  for (const page of pages) for (const check of page.checks) outcomes[check.status]++;
  const checks = CHECKS.map(([id, name]) => {
    const counts = { pass: 0, advisory: 0, failure: 0, na: 0 }, urls = new Map(); let affectedPageCount = 0;
    for (const page of pages) {
      const result = page.checks.find(c => c.id === id); counts[result.status]++;
      if (result.status === 'failure' || result.status === 'advisory') {
        affectedPageCount++;
        const url = page.url || page.requestedUrl || '[URL unavailable]';
        let group = urls.get(url);
        if (!group) { group = { url, pageCount: 0, outcomes: { advisory: 0, failure: 0 } }; urls.set(url, group); }
        group.pageCount++; group.outcomes[result.status]++;
      }
    }
    const affectedUrls = [...urls.values()].sort((a, b) => a.url.localeCompare(b.url));
    return { id, name, counts, affectedPageCount, affectedUrlCount: affectedUrls.length, affectedUrls };
  });
  const blockedPageCount = pages.filter(p => p.captureStatus === 'blocked').length, invalidPageCount = pages.filter(p => p.captureStatus === 'invalid/unverified').length;
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), source: sourceName,
    summary: { pageCount: pages.length, requestedCount: pages.length, inspectedPageCount: pages.length - blockedPageCount - invalidPageCount,
      blockedPageCount, invalidPageCount, checksPerPage: CHECKS.length, checkResultCount: pages.length * CHECKS.length, outcomes }, checks, pages };
}
function markdown(report) {
  const lines = ['# Bulk scan report', '', `Source: \`${report.source}\`  `, `Generated: ${report.generatedAt}  `,
    `Input records: ${report.summary.requestedCount}; inspected: ${report.summary.inspectedPageCount}; blocked: ${report.summary.blockedPageCount}; invalid/unverified: ${report.summary.invalidPageCount}  `,
    `Check results: ${report.summary.checkResultCount} across ${report.summary.checksPerPage} checks per page  `,
    `Pass: ${report.summary.outcomes.pass}; advisory: ${report.summary.outcomes.advisory}; failure: ${report.summary.outcomes.failure}; not applicable: ${report.summary.outcomes.na}`,
    '', '## Check summary', '', '| Check | Pass | Advisory | Failure | N/A | Affected pages | Affected URLs |', '|---|---:|---:|---:|---:|---:|---:|'];
  for (const c of report.checks) lines.push(`| ${c.name} | ${c.counts.pass} | ${c.counts.advisory} | ${c.counts.failure} | ${c.counts.na} | ${c.affectedPageCount} | ${c.affectedUrlCount} |`);
  lines.push('', '## Affected URLs', '');
  for (const c of report.checks) if (c.affectedUrls.length) {
    lines.push(`### ${c.name}`, '');
    for (const g of c.affectedUrls) lines.push(`- ${g.url} — ${g.pageCount} page capture(s); ${g.outcomes.failure} failure(s), ${g.outcomes.advisory} advisory result(s)`);
    lines.push('');
  }
  if (!report.checks.some(c => c.affectedUrls.length)) lines.push('No failures or advisories were recorded.', '');
  lines.push('## Page details', '');
  for (const p of report.pages) {
    lines.push(`### ${p.pageNumber}. ${p.url || p.requestedUrl || '[URL unavailable]'}`, '', `Title: ${p.title || '[missing]'}  `, `Capture: ${p.capturedAt || '[unknown]'} · ${p.captureStatus}${p.captureError ? ` (${p.captureError})` : ''}`, '');
    if (p.validationErrors) lines.push(`Validation: ${p.validationErrors.join('; ')}`, '');
    for (const c of p.checks.filter(r => r.status !== 'pass')) lines.push(`- **${c.status.toUpperCase()} · ${c.name}:** ${c.message}${c.evidence.length ? ` Evidence: ${c.evidence.join('; ')}` : ''}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}
function selfTest() {
  const good = { requestedUrl: 'https://example.test/', url: 'https://example.test/', title: 'Example home page title', lang: 'en-US',
    description: 'A sufficiently descriptive example page used by the embedded analyzer self test.', robots: 'index,follow', canonical: ['https://example.test/'],
    viewport: 'width=device-width, initial-scale=1', h1: ['Welcome'], headings: [{ level: 1, text: 'Welcome' }, { level: 2, text: 'Details' }],
    images: [{ src: '/decorative.svg', alt: '', width: '120', height: '40' }], links: [{ href: '/more', text: 'More information', aria: '', title: '', hasImageAlt: false }],
    forms: [{ fields: [{ type: 'text', name: 'email', hasLabel: true, value: 'PRIVATE_FORM_VALUE' }] }], buttons: [], iframes: [], ids: ['main'], jsonld: ['{"@type":"WebPage"}'],
    bodyTextLength: 120, blocked: false, capturedAt: '2026-09-23T12:00:00Z' };
  const bad = { requestedUrl: 'https://example.test/start', url: 'https://example.test/start', title: 'Example start page title', lang: '', description: '', robots: 'noindex',
    canonical: ['https://other.test/different'], viewport: 'width=device-width, user-scalable=no', h1: ['', 'Second'], headings: [{ level: 1, text: 'Start' }, { level: 3, text: 'Jump' }],
    images: [{ src: '/missing.jpg', alt: null, width: null, height: null }], links: [{ href: 'https://https://bad.test', text: '', aria: '', title: '', hasImageAlt: false }],
    forms: [{ fields: [{ type: 'email', name: 'email', hasLabel: false }] }], buttons: [], iframes: [{ src: '/frame', title: '' }], ids: ['dup', 'dup'], jsonld: ['{broken'],
    bodyTextLength: 100, blocked: false, capturedAt: '2026-09-23T12:01:00Z' };
  const blocked = { requestedUrl: 'https://example.test/blocked', blocked: true, error: 'navigation failed' };
  const invalid = [{ ...good, title: ' ' }, { ...good, images: undefined }, { ...good, bodyTextLength: 0 }, null];
  const report = buildReport([good, bad, blocked, ...invalid], 'self-test.json');
  assert.equal(report.summary.checkResultCount, 7 * CHECKS.length);
  assert.equal(report.summary.inspectedPageCount, 2);
  assert.equal(report.summary.blockedPageCount, 1);
  assert.equal(report.summary.invalidPageCount, 4);
  assert.equal(report.checks.find(c => c.id === 'capture').counts.pass, 2);
  assert.equal(report.pages[0].checks.find(c => c.id === 'images').status, 'pass', 'empty alt is valid');
  assert.equal(report.pages[0].checks.find(c => c.id === 'open_graph').status, 'na');
  for (const id of ['robots', 'h1', 'heading_order', 'viewport', 'images', 'duplicate_ids', 'iframe_titles', 'jsonld']) assert.equal(report.pages[1].checks.find(c => c.id === id).status, 'failure', id);
  assert.equal(report.pages[1].checks.find(c => c.id === 'link_names').status, 'advisory');
  assert.equal(report.pages[1].checks.find(c => c.id === 'duplicate_scheme_links').status, 'advisory');
  assert.equal(report.pages[1].checks.find(c => c.id === 'form_labels').status, 'advisory');
  assert.equal(report.checks.find(c => c.id === 'description').affectedUrlCount, 1);
  assert.equal(report.pages[2].captureStatus, 'blocked');
  assert.equal(report.pages[2].checks.find(c => c.id === 'capture').status, 'advisory');
  assert.equal(report.pages[2].checks.find(c => c.id === 'images').status, 'na');
  for (const page of report.pages.slice(3)) {
    assert.equal(page.captureStatus, 'invalid/unverified');
    assert.equal(page.checks.find(c => c.id === 'capture').status, 'failure');
    assert(page.checks.filter(c => c.id !== 'capture').every(c => c.status === 'na'));
  }
  const empty = buildReport([{ ...good, headings: [], images: [], links: [], forms: [], iframes: [], ids: [], jsonld: [], robots: null }], 'empty-facts.json').pages[0];
  for (const id of ['heading_order', 'images', 'link_names', 'duplicate_scheme_links', 'duplicate_ids', 'iframe_titles', 'form_labels']) assert.equal(empty.checks.find(c => c.id === id).status, 'na', id);
  assert.notEqual(empty.checks.find(c => c.id === 'robots').status, 'pass');
  const frameCheck = iframeTitles({ ...good, iframes: [
    { src: '/owned-frame', title: null }, { src: 'about:blank', title: null },
    { src: 'https://www.google.com/recaptcha/api2/anchor', title: null }, { src: 'https://player.vimeo.com/video/1', title: null },
  ] });
  assert.equal(frameCheck.status, 'failure');
  assert.match(frameCheck.evidence[0], /site-owned=1; third-party=1; dynamic chat\/captcha\/blank=2/);
  const schemeCheck = duplicateSchemes({ links: [
    { href: 'https://https//bad.test' }, { href: 'https://good.test/path/https://bad.test' },
  ] });
  assert.match(schemeCheck.message, /^2 repeated-scheme pattern/);
  assert.match(schemeCheck.message, /browser-resolved hrefs only/);
  assert.equal(repeatedScheme('https://www.facebook.com/sharer.php?u=https://example.test/page'), false);
  assert.equal(repeatedScheme('https://www.instagram.com/needmomentum/https://www.instagram.com/needmomentum/'), true);
  const output = JSON.stringify(report);
  assert(!output.includes('PRIVATE_FORM_VALUE') && !output.includes('/private.js') && !output.includes('scriptSrc'));
  process.stdout.write(`Self-test passed: ${CHECKS.length} checks/page, ${report.summary.checkResultCount} results, privacy projection verified.\n`);
}
function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) return process.stdout.write('Usage: node bulk-scan-analyze.cjs [bulk-scan-pages.json]\n       node bulk-scan-analyze.cjs --self-test\n');
  if (args.length > 1 || args.some(a => a.startsWith('-'))) throw new Error('Expected at most one input JSON path. Use --help for usage.');
  const inputPath = args.length ? path.resolve(args[0]) : path.join(__dirname, 'bulk-scan-pages.json');
  const records = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (!Array.isArray(records)) throw new Error('Input JSON must be an array of page records.');
  const report = buildReport(records, path.basename(inputPath)), out = path.join(__dirname, 'bulk-scan-output');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'bulk-scan-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(out, 'bulk-scan-report.md'), markdown(report), 'utf8');
  process.stdout.write(`Wrote ${report.summary.pageCount} page(s), ${report.summary.checkResultCount} check results to bulk-scan-output.\n`);
}
try { main(); } catch (error) { process.stderr.write(`bulk-scan-analyze: ${error.message}\n`); process.exitCode = 1; }
