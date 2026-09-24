import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_PORTAL = "242825734";
const PAGE_ID = "341838959292";
const PAGE_PATH = "/align-hcm-smartcare";
const SOURCE_PATH = "Align HCM/templates/SmartCare-live.html";
const PUBLIC_URL = "https://www.alignhcm.com/align-hcm-smartcare";
const API_ROOT = "https://api.hubapi.com";
const EXPECTED_PUBLISHED_HASH = "f1d35ec8458dea4de99e83736e2dcbe0";
const EXPECTED_OPTIMIZATION_HASH = "c3f4139eedef740c5914ab92369c8bb8";
const here = path.dirname(fileURLToPath(import.meta.url));
const token =
  process.env.HUBSPOT_SERVICE_KEY ||
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_PRIVATE_APP_TOKEN;

if (!token) throw new Error("Missing protected Align HCM HubSpot token.");

const command = process.argv[2] || "inspect";

function stamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function md5(value) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function encodedSourcePath(sourcePath) {
  return sourcePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function api(endpoint, options = {}) {
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 1000) };
  }
  if (!response.ok) {
    throw new Error(
      `HubSpot ${response.status} ${endpoint}: ${body?.message || body?.raw || response.statusText}`,
    );
  }
  return body;
}

async function verifyPortal() {
  const identity = await api("/integrations/v1/me");
  const portalId = String(identity.portalId ?? identity.hubId ?? "");
  if (portalId !== EXPECTED_PORTAL) {
    throw new Error(`Portal guard failed: expected ${EXPECTED_PORTAL}, received ${portalId || "unknown"}.`);
  }
  return portalId;
}

async function sourceContent(environment) {
  const endpoint = `/cms/v3/source-code/${environment}/content/${encodedSourcePath(SOURCE_PATH)}`;
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/octet-stream",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HubSpot ${response.status} ${endpoint}: ${text.slice(0, 1000) || response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function uploadSource(environment, bytes) {
  const endpoint = `/cms/v3/source-code/${environment}/content/${encodedSourcePath(SOURCE_PATH)}`;
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "application/octet-stream" }), path.basename(SOURCE_PATH));
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: form,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HubSpot ${response.status} ${endpoint}: ${text.slice(0, 1500) || response.statusText}`);
  }
}

async function validateSource(bytes) {
  const endpoint = `/cms/v3/source-code/draft/validate/${encodedSourcePath(SOURCE_PATH)}`;
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "application/octet-stream" }), path.basename(SOURCE_PATH));
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: form,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HubSpot validation ${response.status}: ${text.slice(0, 2000) || response.statusText}`);
  }
}

function pagePath(page) {
  return new URL(page.url).pathname.replace(/\/+$/, "") || "/";
}

function pageDraftMatchesLive(live, draft) {
  const fields = [
    "attachedStylesheets",
    "footerHtml",
    "headHtml",
    "htmlTitle",
    "layoutSections",
    "metaDescription",
    "name",
    "slug",
    "templatePath",
    "url",
    "widgetContainers",
    "widgets",
  ];
  return fields.every((field) => JSON.stringify(live[field]) === JSON.stringify(draft[field]));
}

function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`Expected ${label} was not found.`);
  if (text.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one ${label}, but multiple matches were found.`);
  }
  return `${text.slice(0, first)}${after}${text.slice(first + before.length)}`;
}

function transformTemplate(current) {
  const oldGrid = ".journey-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}";
  const newGrid = ".journey-bar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}";
  const oldStage = ".stage{background:rgba(255,255,255,.04);border:1px solid var(--line-dark);border-radius:var(--r);padding:28px;transition:transform .35s cubic-bezier(.22,.68,0,1.2),background .35s ease,border-color .35s ease,box-shadow .35s ease}";
  const newStage = ".stage{background:rgba(255,255,255,.04);border:1px solid var(--line-dark);border-radius:var(--r);padding:32px;min-height:248px;transition:transform .35s cubic-bezier(.25,1,.5,1),background .35s ease,border-color .35s ease}";
  const oldHover = ".stage:hover{transform:translateY(-8px) scale(1.02);background:linear-gradient(180deg,rgba(238,107,47,.22),rgba(238,107,47,.04));border-color:rgba(238,107,47,.5);box-shadow:0 0 0 1px rgba(238,107,47,.3),0 20px 60px rgba(238,107,47,.25),0 8px 20px rgba(0,0,0,.4)}";
  const newHover = ".stage:hover{transform:translateY(-4px);background:linear-gradient(180deg,rgba(238,107,47,.22),rgba(238,107,47,.04));border-color:rgba(238,107,47,.5)}";
  const oldBlock = '<section class="journey" id="journey"><div class="container"><span class="eyebrow on-dark">How SmartCare Works</span><h2><span class="section-title-swipe" data-text="Ongoing Platform Maintenance and Optimization">Ongoing Platform Maintenance and Optimization</span></h2><p class="journey-lede">SmartCare helps your team protect the investment after go-live with structured platform maintenance, proactive improvements, issue triage, roadmap guidance, and expert knowledge transfer.</p><div class="journey-bar"><div class="stage active"><span class="tag">Rapid Fixes</span><h3>Stabilize</h3><p>Establish stability with a prioritized action plan, expert knowledge transfer, proactive issue triage, optimization of your HCM instance, and ongoing monitoring to ensure sustained progress.</p></div><div class="stage"><span class="tag">Proactive Support</span><h3>Essentials</h3><p>Delivering consistent progress through prioritized action management, hands-on knowledge transfer, responsive ticket support, ongoing system enhancements, transparent reporting, and a comprehensive Executive Business Review.</p></div><div class="stage"><span class="tag">Continuous Optimization</span><h3>Accelerate</h3><p>Expand your capabilities with proactive optimization, expert-led module activation, seamless integrations, advanced analytics, and strategic process improvements, all aligned to your business goals and reviewed annually.</p></div><div class="stage"><span class="tag">Strategic partnership</span><h3>Transform</h3><p>Drive enterprise-level impact with senior expertise, executive alignment, strategic roadmap evolution, end-to-end process optimization, prioritized support, and proactive platform management.</p></div></div></div></section>';
  const newBlock = '<section class="journey" id="journey"><div class="container"><span class="eyebrow on-dark">How SmartCare Works</span><h2><span class="section-title-swipe" data-text="Ongoing Platform Maintenance and Optimization">Ongoing Platform Maintenance and Optimization</span></h2><p class="journey-lede">SmartCare helps your team protect the investment after go-live, from rapid stabilization through continuous optimization and senior strategic partnership.</p><div class="journey-bar"><div class="stage active"><span class="tag">Stability &amp; Issue Triage</span><h3>Stabilize</h3><p>Establish stability with a prioritized action plan, proactive issue triage, expert knowledge transfer, and ongoing monitoring that keeps your HCM environment moving forward.</p></div><div class="stage"><span class="tag">Continuous Optimization</span><h3>Optimize</h3><p>Build on a stable foundation with prioritized improvements, ongoing system enhancements, reporting, integrations, module activation, and hands-on knowledge transfer aligned to your business goals.</p></div><div class="stage"><span class="tag">Strategic Partnership</span><h3>Optimize Plus</h3><p>Extend the partnership with senior expertise, executive alignment, strategic roadmap guidance, advanced analytics, end-to-end process optimization, and proactive platform management.</p></div></div></div></section>';

  let next = replaceOnce(current, oldGrid, newGrid, "SmartCare journey grid CSS");
  next = replaceOnce(next, oldStage, newStage, "SmartCare stage CSS");
  next = replaceOnce(next, oldHover, newHover, "SmartCare stage hover CSS");
  next = replaceOnce(next, oldBlock, newBlock, "SmartCare journey HTML");

  const journey = next.slice(next.indexOf('<section class="journey"'), next.indexOf('<section class="managed"'));
  const stageCount = (journey.match(/<div class="stage(?: active)?">/g) || []).length;
  if (stageCount !== 3) throw new Error(`Expected 3 SmartCare stages after transformation; found ${stageCount}.`);
  for (const heading of ["Stabilize", "Optimize", "Optimize Plus"]) {
    if (!journey.includes(`<h3>${heading}</h3>`)) throw new Error(`Missing required tier heading: ${heading}.`);
  }
  for (const removed of ["<h3>Essentials</h3>", "<h3>Accelerate</h3>", "<h3>Transform</h3>"]) {
    if (journey.includes(removed)) throw new Error(`Legacy tier remained after transformation: ${removed}.`);
  }
  return next;
}

async function readCurrentState() {
  const portalId = await verifyPortal();
  const [publishedBytes, draftBytes, livePage, draftPage] = await Promise.all([
    sourceContent("published"),
    sourceContent("draft"),
    api(`/cms/v3/pages/site-pages/${PAGE_ID}?archived=false`),
    api(`/cms/v3/pages/site-pages/${PAGE_ID}/draft`),
  ]);
  if (pagePath(livePage) !== PAGE_PATH || livePage.templatePath !== SOURCE_PATH) {
    throw new Error("SmartCare page identity guard failed.");
  }
  return { portalId, publishedBytes, draftBytes, livePage, draftPage };
}

async function inspect() {
  const state = await readCurrentState();
  const result = {
    generatedAt: new Date().toISOString(),
    mode: "read-only-smartcare-preflight",
    portalId: state.portalId,
    pageId: PAGE_ID,
    pagePath: PAGE_PATH,
    sourcePath: SOURCE_PATH,
    publishedHash: md5(state.publishedBytes),
    draftHash: md5(state.draftBytes),
    sourceDraftMatchesPublished: md5(state.publishedBytes) === md5(state.draftBytes),
    pageDraftMatchesLive: pageDraftMatchesLive(state.livePage, state.draftPage),
    currentPublishedUpdatedAt: state.livePage.updatedAt || null,
  };
  console.log(JSON.stringify(result, null, 2));
}

async function waitForPublicReadback(expectedText) {
  let last = null;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const response = await fetch(`${PUBLIC_URL}?hsCacheBuster=${Date.now()}-${attempt}`, {
      redirect: "follow",
      headers: { "Cache-Control": "no-cache" },
    });
    const html = await response.text();
    last = { attempt, status: response.status, bytes: Buffer.byteLength(html), found: html.includes(expectedText) };
    if (response.ok && last.found) return last;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`Live SmartCare readback did not contain ${expectedText}; last=${JSON.stringify(last)}`);
}

async function deploy() {
  const state = await readCurrentState();
  const publishedHash = md5(state.publishedBytes);
  const draftHash = md5(state.draftBytes);
  if (publishedHash !== EXPECTED_PUBLISHED_HASH) {
    throw new Error(`Published source changed: expected ${EXPECTED_PUBLISHED_HASH}, received ${publishedHash}.`);
  }
  if (draftHash !== publishedHash) {
    throw new Error("Unpublished SmartCare template changes exist; deployment stopped.");
  }
  if (!pageDraftMatchesLive(state.livePage, state.draftPage)) {
    throw new Error("Unpublished SmartCare page changes exist; deployment stopped.");
  }

  const beforeText = state.publishedBytes.toString("utf8");
  const afterText = transformTemplate(beforeText);
  const afterBytes = Buffer.from(afterText, "utf8");
  const afterHash = md5(afterBytes);
  const runDirectory = path.join(here, "artifacts", stamp());
  await fs.mkdir(runDirectory, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(runDirectory, "SmartCare-live.before.html"), state.publishedBytes),
    fs.writeFile(path.join(runDirectory, "SmartCare-live.after.html"), afterBytes),
    fs.writeFile(
      path.join(runDirectory, "SmartCare-page.before.json"),
      JSON.stringify({ live: state.livePage, draft: state.draftPage }, null, 2),
      "utf8",
    ),
  ]);

  await validateSource(afterBytes);
  await uploadSource("draft", afterBytes);
  const draftAfter = await sourceContent("draft");
  if (md5(draftAfter) !== afterHash) throw new Error("Draft source verification failed.");

  const publishedGuard = await sourceContent("published");
  if (md5(publishedGuard) !== publishedHash) throw new Error("Published source changed during deployment.");
  await uploadSource("published", afterBytes);
  const publishedAfter = await sourceContent("published");
  if (md5(publishedAfter) !== afterHash) throw new Error("Published source verification failed.");

  await api(`/cms/v3/pages/site-pages/${PAGE_ID}/draft/push-live`, { method: "POST" });
  const livePageAfter = await api(`/cms/v3/pages/site-pages/${PAGE_ID}?archived=false`);
  if (pagePath(livePageAfter) !== PAGE_PATH || livePageAfter.templatePath !== SOURCE_PATH) {
    throw new Error("SmartCare page rebuild verification failed.");
  }
  const publicReadback = await waitForPublicReadback("<h3>Optimize Plus</h3>");

  const manifest = {
    generatedAt: new Date().toISOString(),
    mode: "published-smartcare-three-tier-section",
    portalId: state.portalId,
    pageId: PAGE_ID,
    pagePath: PAGE_PATH,
    sourcePath: SOURCE_PATH,
    runDirectory,
    beforeHash: publishedHash,
    afterHash,
    sourceDraftMatchesPublished: md5(draftAfter) === md5(publishedAfter),
    pageUpdatedAt: livePageAfter.updatedAt || null,
    publicReadback,
    tiers: ["Stabilize", "Optimize", "Optimize Plus"],
  };
  const manifestPath = path.join(runDirectory, "deployment-manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(JSON.stringify({ ...manifest, manifestPath }, null, 2));
}

function transformOptimizations(current) {
  let next = replaceOnce(
    current,
    ".case .industry{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--orange);font-weight:700}",
    ".case .industry{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#a84216;font-weight:700}",
    "case-study label contrast rule",
  );
  next = replaceOnce(
    next,
    ".footer-bottom small{font-size:13px;color:rgba(255,255,255,.28)}",
    ".footer-bottom small{font-size:13px;color:rgba(255,255,255,.72)}",
    "footer copyright contrast rule",
  );
  next = replaceOnce(
    next,
    ".form-privacy a:hover{text-decoration:underline}",
    ".form-privacy a:hover{text-decoration:underline}#hs-eu-confirmation-button{background:#006b5d!important;color:#fff!important}#hs-eu-decline-button{background:#fff!important;color:#006b5d!important;border-color:#006b5d!important}",
    "cookie banner contrast overrides",
  );
  next = replaceOnce(
    next,
    '<div class="hero-logo"><img src=',
    '<div class="hero-logo"><img width="715" height="445" src=',
    "SmartCare hero image dimensions",
  );

  const fieldPairs = [
    ['<label>Name <span class="req">*</span></label><input type="text" name="name"', '<label for="smartcare-name">Name <span class="req">*</span></label><input id="smartcare-name" type="text" name="name"'],
    ['<label>Work Email <span class="req">*</span></label><input type="email" name="email"', '<label for="smartcare-email">Work Email <span class="req">*</span></label><input id="smartcare-email" type="email" name="email"'],
    ['<label>Phone Number <span class="req">*</span></label><input type="tel" name="phone"', '<label for="smartcare-phone">Phone Number <span class="req">*</span></label><input id="smartcare-phone" type="tel" name="phone"'],
    ['<label>Company <span class="req">*</span></label><input type="text" name="company"', '<label for="smartcare-company">Company <span class="req">*</span></label><input id="smartcare-company" type="text" name="company"'],
    ['<label>How Can We Help? <span class="req">*</span></label><select name="service_interest"', '<label for="smartcare-service-interest">How Can We Help? <span class="req">*</span></label><select id="smartcare-service-interest" name="service_interest"'],
    ['<label>Brief Description</label><textarea name="message"', '<label for="smartcare-message">Brief Description</label><textarea id="smartcare-message" name="message"'],
  ];
  for (const [before, after] of fieldPairs) {
    next = replaceOnce(next, before, after, `form field association: ${after.match(/smartcare-[a-z-]+/)[0]}`);
  }
  return next;
}

async function deployOptimizations() {
  const state = await readCurrentState();
  const publishedHash = md5(state.publishedBytes);
  const draftHash = md5(state.draftBytes);
  if (publishedHash !== EXPECTED_OPTIMIZATION_HASH) {
    throw new Error(`Optimization source guard failed: expected ${EXPECTED_OPTIMIZATION_HASH}, received ${publishedHash}.`);
  }
  if (draftHash !== publishedHash) throw new Error("Unpublished SmartCare template changes exist; optimization stopped.");
  if (!pageDraftMatchesLive(state.livePage, state.draftPage)) {
    throw new Error("Unpublished SmartCare page changes exist; optimization stopped.");
  }

  const beforeText = state.publishedBytes.toString("utf8");
  const afterBytes = Buffer.from(transformOptimizations(beforeText), "utf8");
  const afterHash = md5(afterBytes);
  const runDirectory = path.join(here, "artifacts", stamp());
  await fs.mkdir(runDirectory, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(runDirectory, "SmartCare-live.before.html"), state.publishedBytes),
    fs.writeFile(path.join(runDirectory, "SmartCare-live.after.html"), afterBytes),
    fs.writeFile(path.join(runDirectory, "SmartCare-page.before.json"), JSON.stringify({ live: state.livePage, draft: state.draftPage }, null, 2), "utf8"),
  ]);

  await validateSource(afterBytes);
  await uploadSource("draft", afterBytes);
  if (md5(await sourceContent("draft")) !== afterHash) throw new Error("Optimized draft verification failed.");
  if (md5(await sourceContent("published")) !== publishedHash) throw new Error("Published source changed during optimization.");
  await uploadSource("published", afterBytes);
  if (md5(await sourceContent("published")) !== afterHash) throw new Error("Optimized published source verification failed.");
  await api(`/cms/v3/pages/site-pages/${PAGE_ID}/draft/push-live`, { method: "POST" });
  const livePageAfter = await api(`/cms/v3/pages/site-pages/${PAGE_ID}?archived=false`);
  const publicReadback = await waitForPublicReadback('id="smartcare-service-interest"');

  const manifest = {
    generatedAt: new Date().toISOString(),
    mode: "published-smartcare-accessibility-and-image-optimizations",
    portalId: state.portalId,
    pageId: PAGE_ID,
    pagePath: PAGE_PATH,
    sourcePath: SOURCE_PATH,
    runDirectory,
    beforeHash: publishedHash,
    afterHash,
    sourceDraftMatchesPublished: md5(await sourceContent("draft")) === md5(await sourceContent("published")),
    pageUpdatedAt: livePageAfter.updatedAt || null,
    publicReadback,
    changes: ["explicit form labels", "page image dimensions", "case-label contrast", "footer contrast", "cookie-banner contrast overrides"],
  };
  const manifestPath = path.join(runDirectory, "deployment-manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(JSON.stringify({ ...manifest, manifestPath }, null, 2));
}

if (command === "inspect") {
  await inspect();
} else if (command === "deploy") {
  await deploy();
} else if (command === "optimize") {
  await deployOptimizations();
} else {
  throw new Error(`Unknown command: ${command}`);
}
