import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './local-server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(here, 'site');
const source = path.join(siteDir, 'brief.html');
const downloadsDir = path.join(siteDir, 'downloads');
const output = path.join(downloadsDir, 'Momentum-360-Forecast-Pilot-Executive-Brief.pdf');
const workspaceModules = process.env.CODEX_WORKSPACE_NODE_MODULES
  || 'C:\\Users\\dillo\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';

if (!fs.existsSync(source)) throw new Error(`Missing print brief: ${source}`);
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(workspaceModules, 'playwright'));

fs.mkdirSync(downloadsDir, { recursive: true });
const staticServer = await startStaticServer(siteDir);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  await page.goto(`${staticServer.origin}/brief.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.MOMENTUM_DASHBOARD_READY === true);
  await page.emulateMedia({ media: 'print', colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.pdf({
    path: output,
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    displayHeaderFooter: false,
  });
  if (errors.length) throw new Error(`Brief render errors:\n${errors.join('\n')}`);
} finally {
  await browser.close();
  await staticServer.close();
}

const bytes = fs.statSync(output).size;
if (bytes < 50_000) throw new Error(`Rendered PDF is unexpectedly small: ${bytes} bytes`);
console.log(JSON.stringify({ status: 'ok', output, bytes }, null, 2));
