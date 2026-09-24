import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const projectRoot = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, 'review-manifest.json'), 'utf8'));
const baseUrl = process.argv[2];

if (!baseUrl) throw new Error('Pass the loopback preview URL as the first argument.');

const outputRoot = path.join(projectRoot, 'qa', 'screenshots');
await fs.mkdir(path.join(outputRoot, 'desktop'), { recursive: true });
await fs.mkdir(path.join(outputRoot, 'mobile'), { recursive: true });

const browser = await chromium.launch({ headless: true });
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true }
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const step = Math.max(360, Math.round(innerHeight * .72));
    let y = 0;
    let height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    while (y < height) {
      scrollTo({ top: y, behavior: 'instant' });
      await pause(70);
      y += step;
      height = Math.max(height, document.body.scrollHeight, document.documentElement.scrollHeight);
    }
    scrollTo({ top: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight), behavior: 'instant' });
    await pause(220);
  });

  await page.waitForFunction(
    () => [...document.images].every((image) => image.complete),
    null,
    { timeout: 5000 }
  ).catch(() => {});
}

async function inspect(page, viewportName) {
  return page.evaluate((viewportName) => {
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > .01 && rect.width > 1 && rect.height > 1;
    };

    const images = [...document.images].map((image) => ({
      src: image.getAttribute('src') || '',
      alt: image.getAttribute('alt'),
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      visible: visible(image),
      rect: image.getBoundingClientRect().toJSON()
    }));
    const logos = images.filter((image) => /logo/i.test(image.src) && image.visible);
    const h1 = document.querySelector('h1');
    const hero = h1?.closest('section') || document.querySelector('main section');
    const heroImages = [...(hero?.querySelectorAll('img') || [])].filter((image) => !/logo/i.test(image.getAttribute('src') || '') && visible(image));
    const heroRect = hero?.getBoundingClientRect();
    const bodyText = document.body.innerText.replace(/\s+/g, ' ').trim();
    const offenders = [...document.querySelectorAll('body *')].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left < -3 || rect.right > innerWidth + 3;
    }).slice(0, 12).map((element) => ({ tag: element.tagName, className: String(element.className || '').slice(0, 120), rect: element.getBoundingClientRect().toJSON() }));
    const h1Style = h1 ? getComputedStyle(h1) : null;
    const bodyStyle = getComputedStyle(document.body);
    const firstLogoNearTop = logos.some((logo) => logo.rect.top < Math.min(240, innerHeight * .34) && logo.rect.bottom > 0);

    return {
      viewportName,
      title: document.title,
      bodyTextLength: bodyText.length,
      h1: h1?.innerText.trim() || '',
      h1Visible: visible(h1),
      h1FontFamily: h1Style?.fontFamily || '',
      h1FontSize: h1Style ? Number.parseFloat(h1Style.fontSize) : 0,
      bodyFontFamily: bodyStyle.fontFamily,
      bodyFontSize: Number.parseFloat(bodyStyle.fontSize),
      fontStatus: document.fonts?.status || 'unsupported',
      overflow: document.documentElement.scrollWidth > innerWidth + 3,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth,
      offenders,
      imageCount: images.length,
      brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0),
      emptyAltImages: images.filter((image) => image.alt === null),
      visibleLogoCount: logos.length,
      firstLogoNearTop,
      heroVisible: visible(hero),
      heroHeight: heroRect?.height || 0,
      heroImageCount: heroImages.length,
      heroImageInFirstViewport: heroImages.some((image) => {
        const rect = image.getBoundingClientRect();
        return rect.top < innerHeight && rect.bottom > 0;
      }),
      encodedText: /&(?:amp|quot|#\d+);/i.test(bodyText),
      dashPunctuation: /[—–]/.test(bodyText),
      batchCounter: /\(\s*\d{1,3}\s*\/\s*\d{1,3}\s*\)/.test(bodyText),
      mailOrQr: Boolean(document.querySelector('a[href^="mailto:"]')) || /\bQR(?: code)?\b/i.test(bodyText),
      runtimeBrokenImages: Number(document.documentElement.dataset.reviewBrokenImages || 0),
      reviewReady: document.documentElement.dataset.reviewReady === 'true'
    };
  }, viewportName);
}

async function inspectBottomLogo(page) {
  return page.evaluate(async () => {
    const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const logos = [...document.images].filter((image) => /logo/i.test(image.getAttribute('src') || ''));
    const visible = logos.filter((image) => {
      const style = getComputedStyle(image);
      const rect = image.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
    });
    const bottom = visible.at(-1);
    if (!bottom) return false;
    bottom.scrollIntoView({ block: 'center', behavior: 'instant' });
    await pause(100);
    const rect = bottom.getBoundingClientRect();
    return rect.top < innerHeight && rect.bottom > 0;
  });
}

async function inspectSite(item) {
  const result = { slug: item.slug, business: item.business, cohort: item.cohort, route: item.route, viewports: {}, issues: [] };

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: Boolean(viewport.isMobile),
      reducedMotion: 'no-preference'
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const localRequestFailures = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      if (request.url().startsWith(baseUrl)) localRequestFailures.push(`${request.url()} :: ${request.failure()?.errorText || 'failed'}`);
    });

    const response = await page.goto(new URL(item.route, baseUrl).href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => document.documentElement.dataset.reviewReady === 'true', null, { timeout: 5000 }).catch(() => {});
    await page.evaluate(() => document.fonts?.ready).catch(() => {});
    await sleep(950);
    const firstScreen = await inspect(page, viewportName);
    await page.screenshot({ path: path.join(outputRoot, viewportName, `${item.slug}.jpg`), type: 'jpeg', quality: 76, fullPage: false });
    await scrollThrough(page);
    const loadedScreen = await inspect(page, viewportName);
    const bottomLogoVisible = await inspectBottomLogo(page);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));

    if (viewportName === 'desktop') {
      await page.screenshot({ path: path.join(outputRoot, 'desktop', `${item.slug}-full.jpg`), type: 'jpeg', quality: 58, fullPage: true });
    }

    result.viewports[viewportName] = {
      status: response?.status() || 0,
      ...firstScreen,
      imageCount: loadedScreen.imageCount,
      brokenImages: loadedScreen.brokenImages,
      emptyAltImages: loadedScreen.emptyAltImages,
      runtimeBrokenImages: loadedScreen.runtimeBrokenImages,
      bottomLogoVisible,
      consoleErrors,
      pageErrors,
      localRequestFailures
    };

    const prefix = `${viewportName}:`;
    if (!response?.ok()) result.issues.push(`${prefix}http_${response?.status() || 0}`);
    if (!firstScreen.h1Visible) result.issues.push(`${prefix}h1_not_visible`);
    if (!firstScreen.heroVisible) result.issues.push(`${prefix}hero_not_visible`);
    if (!firstScreen.heroImageInFirstViewport) result.issues.push(`${prefix}hero_image_missing_from_opening`);
    if (firstScreen.overflow) result.issues.push(`${prefix}horizontal_overflow`);
    if (loadedScreen.brokenImages.length || loadedScreen.runtimeBrokenImages) result.issues.push(`${prefix}broken_images`);
    if (loadedScreen.emptyAltImages.length) result.issues.push(`${prefix}missing_alt_attribute`);
    if (firstScreen.visibleLogoCount !== 2) result.issues.push(`${prefix}visible_logo_count_${firstScreen.visibleLogoCount}`);
    if (!firstScreen.firstLogoNearTop) result.issues.push(`${prefix}top_logo_not_in_opening`);
    if (!bottomLogoVisible) result.issues.push(`${prefix}bottom_logo_not_visible`);
    if (firstScreen.encodedText) result.issues.push(`${prefix}encoded_text`);
    if (firstScreen.dashPunctuation) result.issues.push(`${prefix}dash_punctuation`);
    if (firstScreen.batchCounter) result.issues.push(`${prefix}batch_counter`);
    if (firstScreen.mailOrQr) result.issues.push(`${prefix}mail_or_qr`);
    if (firstScreen.bodyFontSize < 15) result.issues.push(`${prefix}body_font_too_small`);
    if (firstScreen.h1FontSize < 28 || firstScreen.h1FontSize > 150) result.issues.push(`${prefix}h1_scale_outlier`);
    if (firstScreen.fontStatus !== 'loaded') result.issues.push(`${prefix}fonts_not_loaded`);
    if (consoleErrors.length) result.issues.push(`${prefix}console_error`);
    if (pageErrors.length) result.issues.push(`${prefix}page_error`);
    if (localRequestFailures.length) result.issues.push(`${prefix}local_request_failure`);
    if (!firstScreen.reviewReady) result.issues.push(`${prefix}review_script_not_ready`);

    await context.close();
  }

  result.issues = [...new Set(result.issues)];
  result.pass = result.issues.length === 0;
  return result;
}

const results = new Array(manifest.sites.length);
let nextIndex = 0;
let completed = 0;
const workerCount = 4;

async function worker() {
  while (true) {
    const index = nextIndex;
    nextIndex += 1;
    if (index >= manifest.sites.length) return;
    const item = manifest.sites[index];
    results[index] = await inspectSite(item);
    completed += 1;
    if (completed % 5 === 0 || completed === manifest.sites.length) {
      console.log(`RENDER_QA ${completed}/${manifest.sites.length} holds=${results.filter(Boolean).filter((row) => !row.pass).length}`);
    }
  }
}

try {
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
} finally {
  await browser.close();
}

const report = {
  total: results.length,
  pass: results.filter((row) => row.pass).length,
  hold: results.filter((row) => !row.pass).length,
  issueCounts: Object.fromEntries(Object.entries(Object.groupBy(results.flatMap((row) => row.issues), (issue) => issue)).map(([issue, values]) => [issue, values.length])),
  rows: results
};

await fs.writeFile(path.join(projectRoot, 'qa-rendered.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ total: report.total, pass: report.pass, hold: report.hold, issueCounts: report.issueCounts }, null, 2));
if (report.hold) process.exitCode = 2;
