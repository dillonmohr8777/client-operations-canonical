import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const notaryDocumentsHtml = await readFile(resolve(root, 'notary-documents.html'), 'utf8');

await mkdir(resolve(dist, 'assets'), { recursive: true });
await writeFile(resolve(dist, 'index.html'), html, 'utf8');
await writeFile(resolve(dist, 'notary-documents.html'), notaryDocumentsHtml, 'utf8');
await cp(resolve(root, 'assets'), resolve(dist, 'assets'), { recursive: true, force: true });

console.log('Built both landing-page routes.');
