const failures = [];
const pages = [
  {
    url: 'https://tags2go.pro/philadelphia-title-registration-services/',
    required: ['Pennsylvania title and registration help', 'not PennDOT, a government agency, or a government website', 'tel:+12154940300']
  },
  {
    url: 'https://tags2go.pro/philadelphia-notary-document-services/',
    required: ['Local notary and document help in Philadelphia.', 'AW-18264347578', 'tel:+12154940300']
  }
];

const publicFacingDraftTerms = ['concept', 'illustration', 'illustrative', 'prototype', 'mockup', 'staging'];
for (const page of pages) {
  const response = await fetch(page.url, { redirect: 'follow' });
  const body = await response.text();
  if (!response.ok) failures.push(`${page.url} returned ${response.status}`);
  for (const required of page.required) {
    if (!body.includes(required)) failures.push(`${page.url} is missing: ${required}`);
  }
  for (const term of publicFacingDraftTerms) {
    if (body.toLowerCase().includes(term)) failures.push(`${page.url} contains public-facing draft term: ${term}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Verified ${pages.length} live landing pages.`);
