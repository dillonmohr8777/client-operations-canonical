import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const signature = await fs.readFile(path.join(dir, 'signature.html'), 'utf8');
await fs.writeFile(path.join(dir, 'preview.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dillon Mohr | Momentum 360 signature preview</title>
<style>html{background:#fff;color:#14314f;font-family:Arial,Helvetica,sans-serif}body{margin:0;padding:16px}a:focus-visible{outline:2px solid #075ca8;outline-offset:3px}::selection{color:#14314f;background:#f2b84b}main{max-width:640px}h1{font-size:22px;line-height:1.3;margin:0 0 12px}p{font-size:16px;line-height:1.5;margin:0 0 12px}.review-note{margin-top:24px;color:#526679;max-width:52ch}#signature{background:#fff}</style></head>
<body><main><h1>Momentum 360 signature</h1><p>Review draft for Dillon’s Momentum correspondence. Use signature-only.html to copy the signature without these review notes.</p><div id="signature">${signature}</div><p class="review-note">All contact details remain live text. The PNG logo is unchanged. This static-first edition contains no animation, tracking, scripts, or external fonts. Both the preview and paste-ready HTML retain the existing public logo URL.</p></main></body></html>`);
await fs.writeFile(path.join(dir, 'signature-only.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Copy Momentum 360 signature</title></head><body style="margin:0;padding:16px;background:#ffffff;">${signature}</body></html>`);
console.log('preview.html and signature-only.html generated; public image URL preserved for pasting.');
