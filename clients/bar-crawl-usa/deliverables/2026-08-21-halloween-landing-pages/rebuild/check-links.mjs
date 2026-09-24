import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const pages = JSON.parse(fs.readFileSync(path.join(root, 'pages.json'), 'utf8'));
const urls = new Set();

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, 'fragments', `${page.slug}.html`), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="(https:\/\/[^"#]+)"/g)) urls.add(match[1]);
}

const results = await Promise.all([...urls].map(async (url) => {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {Range: 'bytes=0-0'},
      signal: AbortSignal.timeout(20000),
    });
    return {url, status: response.status, ok: response.ok};
  } catch (error) {
    return {url, status: 0, ok: false, error: error.message};
  }
}));

const failures = results.filter((result) => !result.ok);
console.log(`Checked ${results.length} unique image and destination URLs.`);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log('All image and destination URLs resolved successfully.');
