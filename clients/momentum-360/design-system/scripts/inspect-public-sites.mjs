import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const unique = items => [...new Set(items)];
const sites = [
  ['momentum-digital', 'https://www.needmomentum.com/'],
  ['momentum-360', 'https://www.momentumvirtualtours.com/'],
];
const receipts = [];
for (const [brand, url] of sites) {
  const receipt = { brand, url, checkedAt: new Date().toISOString() };
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    const html = await response.text();
    Object.assign(receipt, {
      status: response.status,
      finalPath: new URL(response.url).origin + new URL(response.url).pathname,
      server: response.headers.get('server'),
      title: html.match(/<title>([^<]*)/i)?.[1] ?? null,
      challenge: /Robot Challenge Screen|powCaptcha|sgcaptcha/.test(html),
    });
    if (!receipt.challenge && response.ok) {
      receipt.generators = unique([...html.matchAll(/<meta[^>]*name=['"]generator['"][^>]*>/gi)].map(m => m[0]));
      receipt.themes = unique([...html.matchAll(/wp-content\/themes\/([^/"'\s?]+)/g)].map(m => m[1]));
      receipt.plugins = unique([...html.matchAll(/wp-content\/plugins\/([^/"'\s?]+)/g)].map(m => m[1]));
      receipt.stylesheets = unique([...html.matchAll(/<link[^>]+href=['"]([^'"]+\.css[^'"]*)/gi)].map(m => m[1].replaceAll('&amp;', '&')));
      receipt.logos = unique([...html.matchAll(/(?:src|data-src)=['"]([^'"]*(?:logo|Logo)[^'"]*)/g)].map(m => m[1])).filter(x => !x.startsWith('data:')).slice(0,15);
      receipt.integrations = unique([...html.matchAll(/(?:https?:)?\/\/(?:[^/"'\s]*\.)?(?:17hats\.com|hubspot\.com|hsforms\.com|hs-scripts\.com|callrail\.com|googletagmanager\.com|calendly\.com)[^"'<>\s]*/g)].map(m => new URL(m[0].startsWith('//') ? 'https:' + m[0] : m[0]).hostname));
      const paletteCss = receipt.stylesheets.filter(x => /elementor\/css\/post-\d+\.css/.test(x)).slice(0,4);
      receipt.elementor = [];
      for (const cssUrl of paletteCss) {
        const cssResponse = await fetch(new URL(cssUrl, url), { signal: AbortSignal.timeout(15000) });
        const css = await cssResponse.text();
        receipt.elementor.push({ url: cssUrl, status: cssResponse.status, globals: unique([...css.matchAll(/--e-global-[a-zA-Z0-9_-]+\s*:\s*[^;}]+/g)].map(m => m[0])), fonts: unique([...css.matchAll(/font-family\s*:\s*[^;}]+/g)].map(m=>m[0])).slice(0,12) });
      }
    }
  } catch (error) { receipt.error = error.message; }
  receipts.push(receipt);
}
await fs.mkdir(path.join(root, 'evidence'), { recursive: true });
await fs.writeFile(path.join(root, 'evidence', 'public-sites.json'), JSON.stringify(receipts, null, 2) + '\n');
console.log(JSON.stringify(receipts, null, 2));
