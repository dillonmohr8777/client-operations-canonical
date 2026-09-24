import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidence = join(root, "evidence");
const remoteUrl = process.env.ORANGE_PRESS_URL || "";
mkdirSync(evidence, { recursive: true });

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

const server = createServer((request, response) => {
  const raw = decodeURIComponent((request.url || "/").split("?")[0]);
  const relativePath = raw.endsWith("/") ? `${raw}index.html` : raw;
  const target = resolve(root, `.${normalize(relativePath)}`);
  if (!target.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    response.writeHead(200, { "Content-Type": mime[extname(target)] || "application/octet-stream" });
    response.end(readFileSync(target));
  } catch {
    response.writeHead(404).end("Not found");
  }
});

const scrollToSection = async (page, selector) => {
  await page.evaluate((sectionSelector) => {
    const section = document.querySelector(sectionSelector);
    const header = document.querySelector(".masthead");
    window.scrollTo(0, Math.max(0, section.offsetTop - (header?.offsetHeight || 0)));
  }, selector);
  await page.waitForTimeout(300);
};

const styleSnapshot = (locator) => locator.evaluate((element) => {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    backgroundColor: style.backgroundColor,
    color: style.color,
    boxShadow: style.boxShadow,
    transform: style.transform,
    opacity: style.opacity,
    clipPath: style.clipPath,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    safeInline: rect.left >= 9 && rect.right <= innerWidth - 9,
    visibleInViewport: rect.top < innerHeight && rect.bottom > 0
  };
});

const performMouseDrag = async (page, rail) => {
  const box = await rail.boundingBox();
  if (!box) return null;
  const y = box.y + box.height * 0.54;
  const startX = box.x + box.width * 0.72;
  const endX = box.x + box.width * 0.28;
  const before = await rail.evaluate((element) => element.scrollLeft);
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  const after = await rail.evaluate((element) => element.scrollLeft);
  return { before, after, delta: Math.abs(after - before) };
};

const performTouchSwipe = async (context, page, rail) => {
  const box = await rail.boundingBox();
  if (!box) return null;
  const y = box.y + box.height * 0.54;
  const startX = box.x + box.width * 0.76;
  const endX = box.x + box.width * 0.24;
  const before = await rail.evaluate((element) => element.scrollLeft);
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y, radiusX: 4, radiusY: 4, force: 1 }]
  });
  for (let step = 1; step <= 10; step += 1) {
    const x = startX + ((endX - startX) * step) / 10;
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y, radiusX: 4, radiusY: 4, force: 1 }]
    });
    await page.waitForTimeout(28);
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await session.detach();
  await page.waitForTimeout(1200);
  const after = await rail.evaluate((element) => element.scrollLeft);
  return { before, after, delta: Math.abs(after - before) };
};

const testRail = async ({
  page,
  context,
  view,
  name,
  sectionSelector,
  railSelector,
  cardSelector,
  statusSelector,
  nextSelector,
  hoverSelector
}) => {
  await scrollToSection(page, sectionSelector);
  const rail = page.locator(railSelector);
  const status = page.locator(statusSelector);
  const start = {
    scrollLeft: await rail.evaluate((element) => element.scrollLeft),
    status: (await status.textContent())?.trim()
  };

  await page.waitForTimeout(view.motion ? 2600 : 2200);
  if (view.motion) {
    await page.waitForFunction(
      ({ selector, initial }) => document.querySelector(selector)?.textContent?.trim() !== initial,
      { selector: statusSelector, initial: start.status },
      { timeout: 1600 }
    ).catch(() => {});
  }
  const afterAuto = {
    scrollLeft: await rail.evaluate((element) => element.scrollLeft),
    status: (await status.textContent())?.trim()
  };

  const activeCard = page.locator(`${railSelector} ${cardSelector}.is-active`).first();
  const activeHoverTarget = hoverSelector ? activeCard.locator(hoverSelector).first() : activeCard;
  const hoverBefore = await styleSnapshot(activeHoverTarget);
  if (hoverSelector) await activeHoverTarget.hover({ force: true });
  else await activeCard.hover();
  await page.waitForTimeout(view.motion ? 720 : 80);
  const hoverAfter = await styleSnapshot(activeHoverTarget);
  const hoverChanged = ["backgroundColor", "color", "boxShadow", "transform"]
    .some((property) => hoverBefore[property] !== hoverAfter[property]);
  await page.locator(sectionSelector).screenshot({
    path: join(evidence, `orange-press-${view.name}-${name}-hover.png`)
  });

  const beforeNext = {
    scrollLeft: await rail.evaluate((element) => element.scrollLeft),
    status: (await status.textContent())?.trim()
  };
  await scrollToSection(page, sectionSelector);
  await page.locator(nextSelector).click();
  await page.waitForTimeout(view.motion ? 900 : 100);
  const afterNext = {
    scrollLeft: await rail.evaluate((element) => element.scrollLeft),
    status: (await status.textContent())?.trim()
  };

  await rail.focus();
  await rail.press("Home");
  await page.waitForTimeout(view.motion ? 900 : 100);
  const homeStatus = (await status.textContent())?.trim();
  await rail.press("ArrowRight");
  await page.waitForTimeout(view.motion ? 900 : 100);
  const arrowStatus = (await status.textContent())?.trim();

  let directManipulation = null;
  if (view.input === "mouse") directManipulation = await performMouseDrag(page, rail);
  if (view.input === "touch") directManipulation = await performTouchSwipe(context, page, rail);

  const metrics = await rail.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    activeCount: element.querySelectorAll(".is-active").length,
    snapType: getComputedStyle(element).scrollSnapType,
    current: element.querySelector(".is-active")?.getAttribute("aria-current") || null
  }));

  return {
    start,
    afterAuto,
    autoDelta: Math.abs(afterAuto.scrollLeft - start.scrollLeft),
    hoverBefore,
    hoverAfter,
    hoverChanged,
    beforeNext,
    afterNext,
    nextDelta: Math.abs(afterNext.scrollLeft - beforeNext.scrollLeft),
    homeStatus,
    arrowStatus,
    directManipulation,
    metrics
  };
};

if (!remoteUrl) await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const port = remoteUrl ? null : server.address().port;
const browser = await chromium.launch({ headless: true });
const views = [
  { name: "desktop", width: 1440, height: 1000, motion: true, input: "mouse", fullPage: true },
  { name: "tablet", width: 768, height: 900, motion: false, input: null, fullPage: false },
  { name: "mobile", width: 390, height: 844, motion: true, input: "touch", fullPage: true },
  { name: "narrow", width: 320, height: 760, motion: false, input: null, fullPage: false }
];
const report = {
  checkedAt: new Date().toISOString(),
  target: remoteUrl || `http://127.0.0.1:${port}/orange-press/`,
  views: {},
  failures: []
};

try {
  for (const view of views) {
    const context = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      colorScheme: "light",
      hasTouch: view.input === "touch",
      reducedMotion: view.motion ? "no-preference" : "reduce"
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => failedRequests.push(request.url()));

    const response = await page.goto(report.target, { waitUntil: "networkidle" });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(350);
    await page.locator(".hero").screenshot({ path: join(evidence, `orange-press-${view.name}-hero.png`) });

    const signalStart = await page.locator(".signal-track").evaluate((element) => getComputedStyle(element).transform);
    await page.waitForTimeout(300);
    const signalEnd = await page.locator(".signal-track").evaluate((element) => getComputedStyle(element).transform);

    const system = await testRail({
      page,
      context,
      view,
      name: "system",
      sectionSelector: "#system",
      railSelector: "[data-system-rail]",
      cardSelector: "article",
      statusSelector: "[data-system-status]",
      nextSelector: "[data-system-next]",
      hoverSelector: ""
    });

    const industry = await testRail({
      page,
      context,
      view,
      name: "industry",
      sectionSelector: "#industries",
      railSelector: "[data-swim]",
      cardSelector: ".swim-card",
      statusSelector: "[data-swim-status]",
      nextSelector: "[data-swim-next]",
      hoverSelector: ".press-note"
    });

    const logoStage = page.locator(".logo-stage");
    await logoStage.scrollIntoViewIfNeeded();
    if (view.motion) {
      await page.waitForTimeout(900);
      await logoStage.screenshot({ path: join(evidence, `orange-press-${view.name}-logo-motion.png`) });
      await page.waitForFunction(() => document.querySelector(".logo-stage")?.classList.contains("is-resolved"), null, { timeout: 10000 });
      await page.waitForTimeout(420);
    } else {
      await page.waitForTimeout(100);
    }
    await logoStage.screenshot({ path: join(evidence, `orange-press-${view.name}-logo-resolved.png`) });

    const pageChecks = await page.evaluate(() => {
      const logoStageElement = document.querySelector(".logo-stage");
      const finalCall = document.querySelector(".final-call");
      const exactLogo = logoStageElement?.querySelector("img");
      const canvas = logoStageElement?.querySelector("canvas");
      const industryImages = [...document.querySelectorAll("#industries img")];
      const boundaryHeadings = [...document.querySelectorAll("h1,h2,h3")]
        .filter((heading) => !heading.closest("[data-system-rail], [data-swim]"))
        .map((heading) => ({ text: heading.textContent.trim(), rect: heading.getBoundingClientRect() }))
        .filter(({ rect }) => rect.left < -1 || rect.right > innerWidth + 1)
        .map(({ text, rect }) => ({ text, left: rect.left, right: rect.right }));
      const internalHeadingOverflow = [...document.querySelectorAll("h1,h2,h3")]
        .filter((heading) => heading.scrollWidth > heading.clientWidth + 1)
        .map((heading) => heading.textContent.trim());
      return {
        fontsLoaded: document.fonts.status,
        h1Count: document.querySelectorAll("h1").length,
        heroCanvasCount: document.querySelectorAll(".hero canvas").length,
        totalCanvasCount: document.querySelectorAll("canvas").length,
        industryImageCount: industryImages.length,
        uniqueIndustryImageCount: new Set(industryImages.map((image) => image.getAttribute("src"))).size,
        logoStageAfterFinalCall: Boolean(logoStageElement && finalCall && logoStageElement.offsetTop > finalCall.offsetTop),
        exactLogoNaturalWidth: exactLogo?.naturalWidth || 0,
        exactLogoNaturalHeight: exactLogo?.naturalHeight || 0,
        exactLogoOpacity: exactLogo ? getComputedStyle(exactLogo).opacity : null,
        resolvedCanvasOpacity: canvas ? getComputedStyle(canvas).opacity : null,
        canvasDisplay: canvas ? getComputedStyle(canvas).display : null,
        motionReady: document.documentElement.classList.contains("motion-ready"),
        signalAnimationName: getComputedStyle(document.querySelector(".signal-track")).animationName,
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        boundaryHeadings,
        internalHeadingOverflow,
        internalReviewLanguage: /concept imagery|design review|concept iteration/i.test(document.body.innerText)
      };
    });

    if (view.fullPage) {
      await page.screenshot({ path: join(evidence, `orange-press-${view.name}-full.png`), fullPage: true });
    }

    report.views[view.name] = {
      status: response?.status(),
      consoleErrors,
      failedRequests,
      signalStart,
      signalEnd,
      signalMoved: signalStart !== signalEnd,
      system,
      industry,
      ...pageChecks
    };

    await context.close();
  }
} finally {
  await browser.close();
  if (server.listening) server.close();
}

const expect = (condition, message) => {
  if (!condition) report.failures.push(message);
};

for (const [name, view] of Object.entries(report.views)) {
  const shouldMove = name === "desktop" || name === "mobile";
  const shouldHover = name === "desktop";
  expect(view.status === 200, `${name}: page did not return HTTP 200`);
  expect(view.consoleErrors.length === 0, `${name}: console errors: ${view.consoleErrors.join(" | ")}`);
  expect(view.failedRequests.length === 0, `${name}: failed requests: ${view.failedRequests.join(" | ")}`);
  expect(view.fontsLoaded === "loaded", `${name}: fonts did not finish loading`);
  expect(view.h1Count === 1, `${name}: expected exactly one h1`);
  expect(view.heroCanvasCount === 0, `${name}: hero must not contain particles`);
  expect(view.totalCanvasCount === 1, `${name}: expected only the final logo canvas`);
  expect(view.industryImageCount === 5 && view.uniqueIndustryImageCount === 5, `${name}: builder scenes are missing or duplicated`);
  expect(view.logoStageAfterFinalCall, `${name}: logo stage is not after the final call to action`);
  expect(view.exactLogoNaturalWidth === 1000 && view.exactLogoNaturalHeight === 338, `${name}: exact logo dimensions changed`);
  expect(view.exactLogoOpacity === "1", `${name}: final logo did not resolve visibly`);
  expect(view.documentOverflow <= 1, `${name}: ${view.documentOverflow}px document overflow`);
  expect(view.boundaryHeadings.length === 0, `${name}: headings cross viewport bounds`);
  expect(view.internalHeadingOverflow.length === 0, `${name}: heading text is internally clipped`);
  expect(!view.internalReviewLanguage, `${name}: internal review language leaked into the page`);
  expect(view.motionReady === shouldMove, `${name}: motion mode does not match preference`);
  expect(shouldMove ? view.signalMoved : !view.signalMoved, `${name}: signal marquee motion is incorrect`);
  expect(shouldMove ? view.resolvedCanvasOpacity === "0" : view.canvasDisplay === "none", `${name}: final logo motion did not settle correctly`);

  for (const [railName, rail] of [["system", view.system], ["industry", view.industry]]) {
    expect(rail.metrics.scrollWidth > rail.metrics.clientWidth, `${name} ${railName}: rail is not scrollable`);
    expect(rail.metrics.snapType === "x mandatory", `${name} ${railName}: snap behavior is missing`);
    expect(rail.metrics.activeCount === 1 && rail.metrics.current === "true", `${name} ${railName}: active state is ambiguous`);
    expect(rail.afterNext.status !== rail.beforeNext.status && rail.nextDelta > 20, `${name} ${railName}: next control did not advance one card`);
    expect(rail.homeStatus.startsWith("1 /"), `${name} ${railName}: Home key did not return to the first card`);
    expect(rail.arrowStatus.startsWith("2 /"), `${name} ${railName}: ArrowRight did not advance from Home`);
    expect(shouldMove ? rail.autoDelta > 40 && rail.afterAuto.status !== rail.start.status : rail.autoDelta <= 3 && rail.afterAuto.status === rail.start.status,
      `${name} ${railName}: first automatic movement did not match motion preference`);
    if (shouldHover) expect(rail.hoverChanged, `${name} ${railName}: active text box has no distinct hover response`);
    expect(rail.hoverAfter.visibleInViewport && rail.hoverAfter.safeInline, `${name} ${railName}: hovered text box is clipped`);
    if (rail.directManipulation) expect(rail.directManipulation.delta > 40, `${name} ${railName}: ${name === "mobile" ? "touch swipe" : "mouse drag"} did not move the rail`);
  }
}

writeFileSync(join(evidence, "orange-press-review.json"), JSON.stringify(report, null, 2));
if (report.failures.length) throw new Error(JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
