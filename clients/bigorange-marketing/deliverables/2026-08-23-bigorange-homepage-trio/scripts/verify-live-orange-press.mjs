import { chromium } from "playwright";

const base = "https://bigorange-orange-press.netlify.app/";
const canonicalSource =
  "https://bigorange.marketing/marketing-agency-for-builders/";

const response = await fetch(base, { redirect: "follow" });
const html = await response.text();

const assetPaths = [
  ...html.matchAll(/(?:src|href)=["'](assets\/[^"']+)["']/g),
].map((match) => match[1]);
const uniqueAssetPaths = [
  ...new Set([...assetPaths, "styles.css", "brand-particles.js", "script.js"]),
];

const assetChecks = await Promise.all(
  uniqueAssetPaths.map(async (asset) => {
    const assetResponse = await fetch(new URL(asset, base));
    return { asset, status: assetResponse.status };
  }),
);

const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null;
const canonical = html.match(
  /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i,
)?.[1] ?? null;
const industrySources = [
  ...html.matchAll(
    /<article class=["']swim-card[\s\S]*?<img[^>]+src=["']([^"']+)/g,
  ),
].map((match) => match[1]);
const contentSources = [...html.matchAll(/<img[^>]+src=["']([^"']+)/g)]
  .map((match) => match[1])
  .filter((source) => !source.toLowerCase().includes("logo"));

const report = {
  status: response.status,
  title,
  canonical,
  robotsMeta: /<meta[^>]+name=["']robots["'][^>]+content=["']noindex,\s*nofollow/i.test(
    html,
  ),
  robotsHeader: response.headers.get("x-robots-tag"),
  conceptLanguage: /concept imagery|conceptual design-review/i.test(html),
  industryCount: industrySources.length,
  industryUnique: new Set(industrySources).size,
  contentImageCount: contentSources.length,
  contentImageUnique: new Set(contentSources).size,
  canvasCount: (html.match(/<canvas\b/g) ?? []).length,
  assetChecks,
  interactions: {},
};

const elementStyle = (locator) => locator.evaluate((element) => {
  const style = getComputedStyle(element);
  return {
    boxShadow: style.boxShadow,
    transform: style.transform,
    backgroundColor: style.backgroundColor,
  };
});

const manipulateRail = async (context, page, rail, input) => {
  const box = await rail.boundingBox();
  if (!box) return null;
  const viewport = page.viewportSize();
  const visibleTop = Math.max(0, box.y);
  const visibleBottom = Math.min(viewport?.height || box.y + box.height, box.y + box.height);
  if (visibleBottom - visibleTop < 80) return null;
  const y = visibleTop + (visibleBottom - visibleTop) * 0.58;
  const startX = box.x + box.width * 0.74;
  const endX = box.x + box.width * 0.26;
  const before = await rail.evaluate((element) => element.scrollLeft);

  if (input === "mouse") {
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();
  } else {
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: startX, y, radiusX: 4, radiusY: 4, force: 1 }],
    });
    for (let step = 1; step <= 10; step += 1) {
      const x = startX + ((endX - startX) * step) / 10;
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y, radiusX: 4, radiusY: 4, force: 1 }],
      });
      await page.waitForTimeout(28);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await session.detach();
  }

  await page.waitForTimeout(1100);
  const after = await rail.evaluate((element) => element.scrollLeft);
  return { before, after, delta: Math.abs(after - before) };
};

const checkRail = async ({ context, page, motion, input, section, railSelector, cardSelector, hoverSelector, statusSelector }) => {
  await page.mouse.move(2, 2);
  await page.evaluate((selector) => {
    const target = document.querySelector(selector);
    const header = document.querySelector(".masthead");
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, Math.max(0, target.offsetTop - (header?.offsetHeight || 0)));
  }, section);
  await page.waitForTimeout(450);

  const rail = page.locator(railSelector);
  const status = page.locator(statusSelector);
  await page.evaluate((selector) => {
    const target = document.querySelector(selector);
    window.scrollTo(0, Math.max(0, target.getBoundingClientRect().top + window.scrollY - innerHeight * 0.18));
  }, railSelector);
  await page.waitForTimeout(250);
  const start = {
    scrollLeft: await rail.evaluate((element) => element.scrollLeft),
    status: (await status.textContent())?.trim(),
  };
  await page.waitForTimeout(motion ? 2600 : 2200);
  const afterAuto = {
    scrollLeft: await rail.evaluate((element) => element.scrollLeft),
    status: (await status.textContent())?.trim(),
  };

  let hoverChanged = null;
  if (motion) {
    const target = page.locator(`${railSelector} ${cardSelector}.is-active ${hoverSelector}`.trim()).first();
    const before = await elementStyle(target);
    await target.hover();
    await page.waitForTimeout(720);
    const after = await elementStyle(target);
    hoverChanged = JSON.stringify(before) !== JSON.stringify(after);
  }
  await page.mouse.move(2, 2);
  await page.waitForTimeout(60);
  const directManipulation = motion ? await manipulateRail(context, page, rail, input) : null;
  const metrics = await rail.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    snapType: getComputedStyle(element).scrollSnapType,
    activeCount: element.querySelectorAll(".is-active").length,
  }));

  return {
    start,
    afterAuto,
    autoDelta: Math.abs(afterAuto.scrollLeft - start.scrollLeft),
    hoverChanged,
    directManipulation,
    metrics,
  };
};

const browser = await chromium.launch({ headless: true });
try {
  for (const view of [
    { name: "desktop", width: 1440, height: 1000, motion: true, input: "mouse" },
    { name: "mobile", width: 390, height: 844, motion: true, input: "touch" },
    { name: "reduced", width: 390, height: 844, motion: false, input: "touch" },
  ]) {
    const context = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      hasTouch: view.input === "touch",
      reducedMotion: view.motion ? "no-preference" : "reduce",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => failedRequests.push(request.url()));

    const liveResponse = await page.goto(base, { waitUntil: "networkidle" });
    await page.evaluate(async () => { await document.fonts.ready; });
    const system = await checkRail({
      context,
      page,
      motion: view.motion,
      input: view.input,
      section: "#system",
      railSelector: "[data-system-rail]",
      cardSelector: "article",
      hoverSelector: "",
      statusSelector: "[data-system-status]",
    });
    const industry = await checkRail({
      context,
      page,
      motion: view.motion,
      input: view.input,
      section: "#industries",
      railSelector: "[data-swim]",
      cardSelector: ".swim-card",
      hoverSelector: ".press-note",
      statusSelector: "[data-swim-status]",
    });
    const pageMetrics = await page.evaluate(() => ({
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      internalHeadingOverflow: [...document.querySelectorAll("h1,h2,h3")]
        .filter((heading) => heading.scrollWidth > heading.clientWidth + 1)
        .map((heading) => heading.textContent.trim()),
      motionReady: document.documentElement.classList.contains("motion-ready"),
    }));

    report.interactions[view.name] = {
      status: liveResponse?.status(),
      consoleErrors,
      failedRequests,
      system,
      industry,
      ...pageMetrics,
    };
    await context.close();
  }
} finally {
  await browser.close();
}

const valid =
  report.status === 200 &&
  report.canonical === canonicalSource &&
  report.robotsMeta &&
  report.robotsHeader?.includes("noindex") &&
  !report.conceptLanguage &&
  report.industryCount === 5 &&
  report.industryUnique === 5 &&
  report.contentImageCount === 7 &&
  report.contentImageUnique === 7 &&
  report.canvasCount === 1 &&
  report.assetChecks.every(({ status }) => status === 200) &&
  Object.values(report.interactions).every((view) => {
    const motion = view.motionReady;
    const railValid = [view.system, view.industry].every((rail) =>
      rail.metrics.scrollWidth > rail.metrics.clientWidth &&
      rail.metrics.snapType === "x mandatory" &&
      rail.metrics.activeCount === 1 &&
      (motion
        ? rail.autoDelta > 40 && rail.afterAuto.status !== rail.start.status && rail.hoverChanged && rail.directManipulation?.delta > 40
        : rail.autoDelta <= 3 && rail.afterAuto.status === rail.start.status),
    );
    return view.status === 200 &&
      view.consoleErrors.length === 0 &&
      view.failedRequests.length === 0 &&
      view.documentOverflow <= 1 &&
      view.internalHeadingOverflow.length === 0 &&
      railValid;
  });

report.valid = valid;
console.log(JSON.stringify(report, null, 2));
if (!valid) process.exitCode = 1;
