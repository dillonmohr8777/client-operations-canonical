import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const projectRoot = path.resolve(import.meta.dirname, '..');
const baseUrl = process.argv[2];
if (!baseUrl) throw new Error('Pass the unified viewer URL as the first argument.');
const reportName = process.argv[3] || 'unified-best25-local.json';
if (!/^[a-z0-9][a-z0-9._-]*\.json$/i.test(reportName)) throw new Error('The optional report filename must be a simple .json basename.');

const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, 'best-25-manifest-2026-08-30.json'), 'utf8'));
const prospects = [...manifest.prospects].sort((a, b) => a.rank - b.rank);
const qaRoot = path.join(projectRoot, 'qa');
await fs.mkdir(qaRoot, { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  url: baseUrl,
  expectedProspects: prospects.length,
  assertions: [],
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
  demoResponses: [],
  screenshots: {},
};

const assert = (condition, name, detail = null) => {
  report.assertions.push({ name, pass: Boolean(condition), detail });
  if (!condition) throw new Error(`${name}${detail ? `: ${detail}` : ''}`);
};

const browser = await chromium.launch({ headless: true });

async function attachDiagnostics(page) {
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const location = message.location();
    report.consoleErrors.push({ text: message.text(), url: location.url || null, line: location.lineNumber || null });
  });
  page.on('pageerror', (error) => report.pageErrors.push({ message: error.message, stack: error.stack || null }));
  page.on('requestfailed', (request) => report.requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || 'unknown' }));
}

async function waitForFrameUrl(page, url, timeoutMs = 15_000) {
  const normalized = url.replace(/\/$/, '');
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const frame = page.frames().find((candidate) => candidate.url().replace(/\/$/, '') === normalized);
    if (frame) return frame;
    await page.waitForTimeout(100);
  }

  return null;
}

const normalizedFrameUrl = (value) => value.replace(/\/$/, '');

async function openFinder(page) {
  if (await page.locator('#finder').evaluate((element) => element.open)) return;
  await page.locator('#open-finder').click();
  await page.locator('#finder').waitFor({ state: 'visible' });
}

async function closeFinder(page) {
  if (!await page.locator('#finder').evaluate((element) => element.open)) return;
  await page.locator('#close-finder').click();
  await page.waitForFunction(() => !document.querySelector('#finder')?.open);
}

try {
  assert(prospects.length === 25, 'manifest contains exactly 25 prospects', prospects.length);
  assert(new Set(prospects.map((item) => item.slug)).size === 25, 'manifest slugs are unique');
  assert(new Set(prospects.map((item) => item.demo_url)).size === 25, 'manifest demo URLs are unique');

  const requestContext = await browser.newContext();
  const responses = await Promise.all(prospects.map(async (prospect) => {
    const response = await requestContext.request.get(prospect.demo_url, { timeout: 30_000 });
    const headers = response.headers();
    return {
      rank: prospect.rank,
      business: prospect.business,
      url: prospect.demo_url,
      status: response.status(),
      xFrameOptions: headers['x-frame-options'] || null,
      contentSecurityPolicy: headers['content-security-policy'] || null,
      robots: headers['x-robots-tag'] || null,
    };
  }));
  report.demoResponses = responses;
  await requestContext.close();
  assert(responses.every((item) => item.status === 200), 'all 25 production demos return HTTP 200', responses.filter((item) => item.status !== 200));
  assert(responses.every((item) => !item.xFrameOptions), 'all 25 demos permit iframe review', responses.filter((item) => item.xFrameOptions));
  assert(responses.every((item) => !/frame-ancestors/i.test(item.contentSecurityPolicy || '')), 'no demo blocks the unified frame with CSP');
  assert(responses.every((item) => /noindex/i.test(item.robots || '')), 'all 25 demos retain noindex headers');

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await desktop.newPage();
  await attachDiagnostics(page);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForFunction(() => document.querySelectorAll('.filmstrip .prospect-button').length === 25);
  await page.waitForFunction(() => {
    const frame = document.querySelector('#concept-frame');
    return Boolean(frame) && frame.getBoundingClientRect().height >= 240;
  });
  await page.waitForTimeout(1_800);

  assert(await page.locator('.filmstrip .prospect-button').count() === 25, 'desktop renders 25 ranked filmstrip controls');
  assert(!await page.locator('#review-stage').evaluate((element) => element.inert), 'desktop keeps the persistent review stage interactive');
  assert((await page.locator('#active-business').textContent())?.trim() === prospects[0].business, 'desktop loads rank 1 into the live stage');
  const rankOneFrame = await waitForFrameUrl(page, prospects[0].demo_url);
  assert(Boolean(rankOneFrame), 'desktop embeds the rank 1 production demo', page.frames().map((frame) => frame.url()));
  await rankOneFrame.waitForSelector('body', { state: 'attached', timeout: 15_000 });
  const rankOneVisible = await page.locator('#concept-frame').evaluate((frame) => frame.getBoundingClientRect().height >= 240)
    && await rankOneFrame.locator('body').evaluate((element) => element.childElementCount > 0);
  assert(rankOneVisible, 'embedded rank 1 demo renders visible body content');
  assert(await page.locator('.filmstrip .prospect-button[aria-current="true"]').count() === 1, 'desktop has exactly one active prospect');
  assert(await page.locator('.status.hold').isVisible(), 'desktop keeps the Mail Hold status visible');

  const desktopShell = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    innerWidth,
    innerHeight,
    bodyOverflow: getComputedStyle(document.body).overflow,
    stageHeight: document.querySelector('.stage')?.getBoundingClientRect().height || 0,
    pageScroll: document.documentElement.scrollHeight <= innerHeight + 1,
  }));
  assert(desktopShell.scrollWidth <= desktopShell.innerWidth + 1, 'desktop has no horizontal overflow', desktopShell);
  assert(desktopShell.pageScroll, 'desktop review shell does not scroll vertically', desktopShell);
  assert(desktopShell.stageHeight >= 560, 'desktop live stage fills the working viewport', desktopShell.stageHeight);
  assert(desktopShell.bodyOverflow === 'hidden', 'desktop locks the review shell', desktopShell.bodyOverflow);

  await openFinder(page);
  await page.locator('#result-count').waitFor({ state: 'visible' });
  assert(await page.locator('#prospect-jump option').count() === 25, 'jump menu contains all 25 ranked prospects');
  assert(!await page.locator('#prospect-jump').isDisabled(), 'jump menu is available after the manifest loads');
  assert((await page.locator('[data-cohort-count="batch2"]').textContent())?.trim() === '12', 'Batch 2 tab exposes its prospect count');
  assert((await page.locator('[data-cohort-count="batch4"]').textContent())?.trim() === '10', 'Batch 4 tab exposes its prospect count');
  assert((await page.locator('[data-cohort-count="unslop25"]').textContent())?.trim() === '3', 'Unslop tab exposes its prospect count');

  await page.locator('[data-cohort="batch2"]').click();
  assert(await page.locator('.finder-choice').count() === 12, 'Batch 2 filter returns 12 prospects');
  await page.locator('[data-cohort="batch4"]').click();
  assert(await page.locator('.finder-choice').count() === 10, 'Batch 4 filter returns 10 prospects');
  await page.locator('[data-cohort="unslop25"]').click();
  assert(await page.locator('.finder-choice').count() === 3, 'Unslop filter returns 3 prospects');
  await page.locator('[data-cohort="all"]').click();

  await page.locator('#prospect-search').fill('K.A.M.');
  assert(await page.locator('.finder-choice').count() === 1, 'search finds K.A.M. uniquely');
  assert(await page.locator('#clear-search').isVisible(), 'search exposes a visible clear action');
  await page.locator('#clear-search').click();
  assert(await page.locator('.finder-choice').count() === 25, 'clear action restores all 25 prospects');
  assert((await page.locator('#prospect-search').inputValue()) === '', 'clear action empties the search field');

  await page.locator('[data-cohort="batch2"]').click();
  await page.locator('#prospect-search').fill('Mayfair');
  await page.locator('#prospect-jump').selectOption('scrc-accident-and-injury-center');
  assert((await page.locator('#active-business').textContent())?.trim() === 'SCRC Accident & Injury Center', 'jumping to rank 25 updates the stage');
  assert((await page.locator('#prospect-search').inputValue()) === '', 'global jump clears the search');
  assert((await page.locator('[data-cohort="all"]').getAttribute('aria-selected')) === 'true', 'global jump restores the all-prospects sequence');
  assert(await page.locator('.finder-choice').count() === 25, 'global jump restores all 25 finder rows');
  assert((await page.locator('#prospect-jump').inputValue()) === 'scrc-accident-and-injury-center', 'jump menu stays synchronized to the selected prospect');
  assert((await page.locator('#active-phone').textContent())?.trim() === '267-286-0934', 'selected prospect shows the verified phone');
  assert((await page.locator('#open-demo').getAttribute('href')) === prospects[24].demo_url, 'selected prospect exposes the exact production demo URL');
  await closeFinder(page);

  await page.locator('[data-viewport="phone"]').click();
  await page.waitForTimeout(550);
  const phoneWidth = await page.locator('.frame-shell').evaluate((element) => element.getBoundingClientRect().width);
  assert(phoneWidth <= 391 && phoneWidth >= 370, 'phone preview constrains the live stage', phoneWidth);
  await page.locator('[data-viewport="desktop"]').click();

  await page.keyboard.press('/');
  assert(await page.locator('#finder').evaluate((element) => element.open), 'slash shortcut opens Find');
  assert(await page.locator('#prospect-search').evaluate((element) => document.activeElement === element), 'slash shortcut focuses search');
  await closeFinder(page);

  await page.locator('.filmstrip [data-slug="h-g-sign-company"]').click();
  await page.waitForFunction(() => document.querySelector('#preview-loading')?.hidden === true);
  await page.waitForTimeout(300);
  assert((await page.locator('#active-business').textContent())?.trim() === prospects[0].business, 'desktop proof returns to rank 1');

  const desktopShot = path.join(qaRoot, 'unified-best25-desktop.png');
  await page.screenshot({ path: desktopShot, fullPage: false });
  report.screenshots.desktop = desktopShot;
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: 'no-preference' });
  const mobilePage = await mobile.newPage();
  await attachDiagnostics(mobilePage);
  await mobilePage.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await mobilePage.waitForFunction(() => document.querySelectorAll('.filmstrip .prospect-button').length === 25);
  await mobilePage.waitForTimeout(350);

  const mobileLayout = await mobilePage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth,
    innerHeight,
    pageScroll: document.documentElement.scrollHeight <= innerHeight + 1,
    listCount: document.querySelectorAll('.filmstrip .prospect-button').length,
    stageVisible: (document.querySelector('.stage')?.getBoundingClientRect().height || 0) > 300,
    finderOpen: Boolean(document.querySelector('#finder')?.open),
  }));
  assert(mobileLayout.scrollWidth <= mobileLayout.innerWidth + 1, 'mobile shell has no horizontal overflow', mobileLayout);
  assert(mobileLayout.pageScroll, 'mobile review shell does not scroll vertically', mobileLayout);
  assert(mobileLayout.listCount === 25, 'mobile renders all 25 filmstrip controls');
  assert(mobileLayout.stageVisible, 'mobile shows the live concept immediately', mobileLayout);
  assert(!mobileLayout.finderOpen, 'mobile keeps Find closed until requested');
  assert(!await mobilePage.locator('#review-stage').evaluate((element) => element.inert), 'mobile keeps the live stage interactive');
  assert(await mobilePage.locator('.status.hold').isVisible(), 'mobile keeps the Mail Hold status visible');
  assert((await mobilePage.locator('#active-business').textContent())?.trim() === prospects[0].business, 'mobile loads rank 1 without opening a list first');

  const mobileListShot = path.join(qaRoot, 'unified-best25-mobile-list.png');
  await mobilePage.screenshot({ path: mobileListShot, fullPage: false });
  report.screenshots.mobileList = mobileListShot;

  await openFinder(mobilePage);
  await mobilePage.locator('#prospect-jump').selectOption('new-pennsburg-diner');
  await mobilePage.waitForFunction(() => document.querySelector('#preview-loading')?.hidden === true);
  await mobilePage.waitForTimeout(300);
  assert((await mobilePage.locator('#active-business').textContent())?.trim() === 'The New Pennsburg Diner', 'mobile preview updates to the selected business');
  assert(!await mobilePage.locator('#finder').evaluate((element) => element.open), 'mobile jump closes Find after selection');
  const mobileFrame = mobilePage.frames().find((frame) => normalizedFrameUrl(frame.url()) === normalizedFrameUrl(prospects.find((item) => item.slug === 'new-pennsburg-diner').demo_url));
  assert(Boolean(mobileFrame), 'mobile embeds the selected production demo', mobilePage.frames().map((frame) => frame.url()));
  assert(await mobileFrame.locator('body').isVisible(), 'mobile embedded demo renders visible body content');

  const mobilePreviewShot = path.join(qaRoot, 'unified-best25-mobile-preview.png');
  await mobilePage.screenshot({ path: mobilePreviewShot, fullPage: false });
  report.screenshots.mobilePreview = mobilePreviewShot;
  await mobile.close();

  const reduced = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await reducedPage.waitForFunction(() => document.querySelectorAll('.filmstrip .prospect-button').length === 25);
  const reducedDurations = await reducedPage.evaluate(() => ({
    stage: getComputedStyle(document.querySelector('.stage')).transitionDuration,
    frame: getComputedStyle(document.querySelector('.frame-shell')).transitionDuration,
    chip: getComputedStyle(document.querySelector('.prospect-button')).transitionDuration,
  }));
  assert(Object.values(reducedDurations).every((value) => value === '1e-05s' || value === '0s'), 'reduced motion collapses viewer transitions', reducedDurations);
  await reduced.close();

  const localConsoleErrors = report.consoleErrors.filter((entry) => entry.url?.startsWith(baseUrl));
  const localRequestFailures = report.requestFailures.filter((entry) => entry.url.startsWith(baseUrl));
  assert(localConsoleErrors.length === 0, 'unified viewer has no first-party console errors', localConsoleErrors);
  assert(report.pageErrors.length === 0, 'unified viewer has no page errors', report.pageErrors);
  assert(localRequestFailures.length === 0, 'unified viewer has no first-party request failures', localRequestFailures);

  report.pass = report.assertions.every((item) => item.pass);
} catch (error) {
  report.pass = false;
  report.fatalError = { message: error.message, stack: error.stack || null };
  throw error;
} finally {
  await fs.writeFile(path.join(qaRoot, reportName), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

process.stdout.write(`${JSON.stringify({
  pass: report.pass,
  assertions: report.assertions.length,
  consoleErrors: report.consoleErrors.length,
  pageErrors: report.pageErrors.length,
  requestFailures: report.requestFailures.length,
  screenshots: report.screenshots,
}, null, 2)}\n`);
