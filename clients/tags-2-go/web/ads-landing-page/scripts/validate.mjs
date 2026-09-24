import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const notaryDocumentsHtml = await readFile(resolve(root, 'notary-documents.html'), 'utf8');
const failures = [];

const requireText = (label, value) => {
  if (!html.includes(value)) failures.push(`${label}: missing ${value}`);
};

requireText('direction contract', 'seed a79de15d');
requireText('canonical URL', 'https://tags2go.pro/philadelphia-title-registration-services/');
requireText('verified phone', 'tel:+12154940300');
requireText('verified address', '6001 Torresdale Avenue');
requireText('verified email', 'info@tags2go.pro');
requireText('independent disclosure', 'not PennDOT, a government agency, or a government website');
requireText('reduced motion', 'prefers-reduced-motion: reduce');
requireText('skip link', 'Skip to main content');
requireText('single h1', '<h1 id="page-title">');

const h1Count = (html.match(/<h1\b/g) || []).length;
if (h1Count !== 1) failures.push(`heading hierarchy: expected 1 h1, found ${h1Count}`);

const badClaims = ['same day', 'guaranteed', 'official PennDOT website', 'government office', 'five-star'];
for (const claim of badClaims) {
  if (html.toLowerCase().includes(claim)) failures.push(`unsupported claim present: ${claim}`);
}

const requireNotaryText = (label, value) => {
  if (!notaryDocumentsHtml.includes(value)) failures.push(`${label}: missing ${value}`);
};

requireNotaryText('notary canonical URL', 'https://tags2go.pro/philadelphia-notary-document-services/');
requireNotaryText('notary verified phone', 'tel:+12154940300');
requireNotaryText('notary verified address', '6001 Torresdale Avenue');
requireNotaryText('notary verified email', 'info@tags2go.pro');
requireNotaryText('notary Google tag', 'AW-18264347578');
requireNotaryText('notary reduced motion', 'prefers-reduced-motion: reduce');
requireNotaryText('notary skip link', 'Skip to main content');
requireNotaryText('notary single h1', '<h1 id="page-title">');

const notaryH1Count = (notaryDocumentsHtml.match(/<h1\b/g) || []).length;
if (notaryH1Count !== 1) failures.push(`notary heading hierarchy: expected 1 h1, found ${notaryH1Count}`);

const excludedNotaryPageTerms = [
  'concept', 'illustration', 'illustrative', 'prototype', 'mockup', 'staging',
  'penndot', 'government agency', 'vehicle registration', 'title transfer',
  'license plate', 'driver\'s license', 'temporary tag', 'dmv'
];
for (const term of excludedNotaryPageTerms) {
  if (notaryDocumentsHtml.toLowerCase().includes(term)) failures.push(`notary page contains excluded term: ${term}`);
}

const allowedNotaryExternalSchemes = [
  'https://tags2go.pro/philadelphia-notary-document-services/',
  'tel:+12154940300',
  'mailto:info@tags2go.pro'
];
const notaryDestinations = [...notaryDocumentsHtml.matchAll(/href="([^"#]+)"/g)].map((match) => match[1]);
for (const destination of notaryDestinations) {
  if (!allowedNotaryExternalSchemes.some((allowed) => destination.startsWith(allowed))) {
    failures.push(`notary page has an unexpected external route: ${destination}`);
  }
}

const links = [...html.matchAll(/href="(https?:\/\/[^"#]+)"/g)].map((match) => match[1]);
const uniqueLinks = [...new Set(links)];
const canonical = 'https://tags2go.pro/philadelphia-title-registration-services/';
const prepublishLinks = uniqueLinks.filter((url) => url !== canonical);
for (const url of prepublishLinks) {
  const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  if (!response.ok) failures.push(`link health: ${url} returned ${response.status}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${prepublishLinks.length} prepublication external URLs and both landing-page structures.`);
