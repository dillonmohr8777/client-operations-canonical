import { mkdir, writeFile } from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { founderImageSources } from './founders.mjs';

const root = path.resolve('dist', 'sites');

function download(url, allowInvalidCertificate = false, redirects = 0) {
  if (redirects > 5) throw new Error(`Too many redirects for ${url}`);
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PHL-W35-site-build/1.0)' },
      rejectUnauthorized: !allowInvalidCertificate,
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        resolve(download(new URL(response.headers.location, url).href, allowInvalidCertificate, redirects + 1));
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({
        bytes: Buffer.concat(chunks),
        contentType: response.headers['content-type'] || '',
      }));
    });
    request.on('error', reject);
  });
}

const report = [];
for (const item of founderImageSources) {
  const targetDir = path.join(root, item.slug, 'assets');
  const target = path.join(targetDir, item.localFile);
  await mkdir(targetDir, { recursive: true });
  const result = await download(item.sourceImage, item.allowInvalidCertificate);
  if (!result.contentType.startsWith('image/')) throw new Error(`Expected image for ${item.sourceImage}, received ${result.contentType}`);
  if (result.bytes.length < 5000) throw new Error(`Image was unexpectedly small: ${item.sourceImage}`);
  await writeFile(target, result.bytes);
  report.push({ ...item, bytes: result.bytes.length, contentType: result.contentType });
}

await writeFile(path.resolve('FOUNDER-PHOTO-SOURCES.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), images: report }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ downloaded: report.length, report: 'FOUNDER-PHOTO-SOURCES.json' }, null, 2));
