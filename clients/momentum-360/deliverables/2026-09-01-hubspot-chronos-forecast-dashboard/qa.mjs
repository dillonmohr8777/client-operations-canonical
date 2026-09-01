import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './local-server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(here, 'site');
const qaDir = path.join(here, 'qa');
const liveBaseUrl = (process.env.MOMENTUM_FORECAST_BASE_URL || '').replace(/\/$/, '');
const workspaceModules = process.env.CODEX_WORKSPACE_NODE_MODULES
  || 'C:\\Users\\dillo\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(workspaceModules, 'playwright'));

const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};
const forbiddenPublicText = [
  '50612503',
  'hubspot://',
  'C:\\Users\\',
  'direct-user-approval',
  'df776a927381',
  'protected service-key',
  'future forecast',
];

fs.mkdirSync(qaDir, { recursive: true });
const staticServer = liveBaseUrl ? null : await startStaticServer(siteDir);
const origin = liveBaseUrl || staticServer.origin;
const browser = await chromium.launch({ headless: true });
const results = [];

async function inspect(name, fileName, viewport, options = {}) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: options.reducedMotion || 'no-preference',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`));

  const navigationResponse = await page.goto(`${origin}/${fileName}`, { waitUntil: 'load' });
  invariant(navigationResponse?.ok(), `${name}: navigation returned ${navigationResponse?.status()}.`);
  const responseHeaders = await navigationResponse.allHeaders();
  if (liveBaseUrl) {
    invariant(/noindex/i.test(responseHeaders['x-robots-tag'] || ''), `${name}: live X-Robots-Tag is missing noindex.`);
    invariant(/no-store/i.test(responseHeaders['cache-control'] || ''), `${name}: live Cache-Control is missing no-store.`);
  }
  await page.waitForFunction(() => window.MOMENTUM_DASHBOARD_READY === true);
  await page.evaluate(() => document.fonts.ready);
  const facts = await page.evaluate(() => ({
    title: document.title,
    text: document.body.innerText,
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflowElements: [...document.querySelectorAll('body *')].filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
    }).slice(0, 12).map((node) => `${node.tagName.toLowerCase()}#${node.id || ''}.${node.className || ''}:${Math.round(node.getBoundingClientRect().left)}..${Math.round(node.getBoundingClientRect().right)}`),
    rootOverflowElements: [...document.querySelectorAll('body *')].filter((node) => {
      const rect = node.getBoundingClientRect();
      return !node.closest('table') && rect.right > document.documentElement.clientWidth + 1 && rect.right < document.documentElement.clientWidth + 100;
    }).slice(0, 20).map((node) => `${node.tagName.toLowerCase()}#${node.id || ''}.${node.className || ''}:${Math.round(node.getBoundingClientRect().left)}..${Math.round(node.getBoundingClientRect().right)}`),
    robots: document.querySelector('meta[name="robots"]')?.content || '',
    status: document.querySelector('[data-verdict-state]')?.textContent?.trim() || '',
    charts: [...document.querySelectorAll('svg[role="img"]')].map((svg) => svg.getAttribute('aria-label')),
    brokenImages: [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
    bodyChildren: [...document.body.childNodes].filter((node) => !(node.nodeType === Node.TEXT_NODE && !node.textContent.trim())).map((node) => node.nodeType === Node.COMMENT_NODE ? 'comment' : node.nodeName.toLowerCase()),
    targetBlanks: [...document.querySelectorAll('a[target="_blank"]')].map((link) => link.href),
    interactiveLabels: [...document.querySelectorAll('button,a[href],summary')].map((node) => (node.getAttribute('aria-label') || node.textContent || '').trim()).filter(Boolean),
    fontChecks: {
      display: document.fonts.check('16px "Space Grotesk"'),
      body: document.fonts.check('16px "DM Sans"'),
    },
  }));

  invariant(facts.title.includes('Momentum 360'), `${name}: document title is not branded.`);
  invariant(/noindex/i.test(facts.robots) && /nofollow/i.test(facts.robots), `${name}: robots meta is missing.`);
  invariant(facts.scrollWidth <= facts.width + 1, `${name}: horizontal overflow ${facts.scrollWidth} > ${facts.width}; ${facts.overflowElements.join(', ')}; root candidates: ${facts.rootOverflowElements.join(', ')}.`);
  invariant(/RETAIN/i.test(facts.status), `${name}: evidence-only status is not visible.`);
  invariant(facts.bodyChildren[0] !== 'comment', `${name}: public HTML exposes an internal direction contract.`);
  invariant(facts.brokenImages.length === 0, `${name}: broken images: ${facts.brokenImages.join(', ')}`);
  invariant(facts.fontChecks.display && facts.fontChecks.body, `${name}: self-hosted brand fonts did not load.`);
  invariant(facts.targetBlanks.length === 0, `${name}: unexpected new-tab links.`);
  invariant(facts.charts.length >= (fileName === 'brief.html' ? 3 : 2), `${name}: accessible chart coverage is incomplete.`);
  invariant(consoleErrors.length === 0, `${name}: console errors: ${consoleErrors.join('; ')}`);
  invariant(failedRequests.length === 0, `${name}: failed requests: ${failedRequests.join('; ')}`);
  for (const term of forbiddenPublicText) {
    invariant(!facts.text.includes(term), `${name}: public text exposes forbidden term: ${term}`);
  }
  invariant(facts.text.includes('Conversion reporting is pending validation'), `${name}: conversion boundary is missing.`);
  invariant(facts.text.includes('held-out'), `${name}: held-out evaluation language is missing.`);

  if (fileName === 'index.html') {
    const tabCount = await page.locator('[role="tab"]').count();
    invariant(tabCount === 4, `${name}: expected four dashboard tabs, found ${tabCount}.`);
    await page.locator('[role="tab"]').nth(1).focus();
    await page.keyboard.press('Enter');
    invariant(await page.locator('[role="tab"]').nth(1).getAttribute('aria-selected') === 'true', `${name}: keyboard tab activation failed.`);
    invariant(await page.locator('[role="tabpanel"]:not([hidden])').count() === 1, `${name}: active tabpanel state is invalid.`);
    await page.locator('[role="tab"]').first().click();
    const downloadHref = await page.locator('a[download]').first().getAttribute('href');
    invariant(downloadHref?.endsWith('Momentum-360-Forecast-Pilot-Executive-Brief.pdf'), `${name}: PDF download target is wrong.`);
    if (liveBaseUrl) {
      const pdfResponse = await context.request.get(new URL(downloadHref, `${origin}/`).href);
      invariant(pdfResponse.ok(), `${name}: live PDF returned ${pdfResponse.status()}.`);
      invariant(/application\/pdf/i.test(pdfResponse.headers()['content-type'] || ''), `${name}: live PDF content type is wrong.`);
      invariant((await pdfResponse.body()).length === 567426, `${name}: live PDF bytes do not match the verified artifact.`);
    }
  }

  if (options.reducedMotion === 'reduce') {
    const animated = await page.evaluate(() => [...document.querySelectorAll('*')].filter((node) => {
      const style = getComputedStyle(node);
      const duration = style.animationDuration.split(',').some((value) => parseFloat(value) > 0.01);
      const transition = style.transitionDuration.split(',').some((value) => parseFloat(value) > 0.01);
      return duration || transition;
    }).slice(0, 10).map((node) => node.tagName));
    invariant(animated.length === 0, `${name}: reduced motion leaves animation active on ${animated.join(', ')}.`);
  }

  await page.screenshot({ path: path.join(qaDir, `${name}.png`), fullPage: true });
  results.push({ name, fileName, viewport, consoleErrors, failedRequests, facts: { ...facts, text: undefined } });
  await context.close();
}

for (const htmlName of ['index.html', 'brief.html']) {
  const html = fs.readFileSync(path.join(siteDir, htmlName), 'utf8');
  invariant(!/THESIS:|OWN-WORLD:|FIRST VIEWPORT:|93c99373/.test(html), `${htmlName}: internal design metadata is public.`);
}

try {
  await inspect('dashboard-desktop', 'index.html', { width: 1440, height: 1000 });
  await inspect('dashboard-mobile', 'index.html', { width: 390, height: 844 });
  await inspect('dashboard-reduced-motion', 'index.html', { width: 1024, height: 800 }, { reducedMotion: 'reduce' });
  await inspect('brief-screen', 'brief.html', { width: 816, height: 1056 }, { reducedMotion: 'reduce' });
} finally {
  await browser.close();
  if (staticServer) await staticServer.close();
}

const report = { schemaVersion: 1, generatedAt: new Date().toISOString(), status: 'pass', origin, results };
const reportName = liveBaseUrl ? 'live-browser-qa.json' : 'browser-qa.json';
fs.writeFileSync(path.join(qaDir, reportName), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ status: report.status, checks: results.map((result) => result.name) }, null, 2));
