import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/dillo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const scriptFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptFile), "..");
const clientsRoot = path.join(projectRoot, "clients");
const reportFolderName = "2026-08-10-weekly-report-2026-08-03-to-2026-08-09";

const clients = [
  {
    slug: "kimberly-james-bridal",
    name: "Kimberly James Bridal",
    shortName: "Kimberly James Bridal",
    location: "Philadelphia, Pennsylvania",
    logoSource: path.join(clientsRoot, "kimberly-james-bridal", "deliverables", "2026-07-26-weekly-performance-dashboard", "assets", "kimberly-james-bridal-byyg7hws.png"),
    theme: {
      ink: "#102e50",
      accent: "#c9a553",
      paper: "#f7f2e8",
      tint: "#eee5d4",
      soft: "#fffaf1",
      dark: "#0b213b"
    },
    executiveSummary: "Kimberly's Meta account produced two paid form leads in the reporting window, while Google Search delivered measurable traffic into the Philadelphia market. The immediate focus is lead follow up and conversion validation, not larger spend.",
    snapshotLabel: "Meta and Google are shown separately",
    metrics: [
      { label: "Meta paid form leads", value: "2", note: "Aug 3 to Aug 9" },
      { label: "Meta cost per lead", value: "$34.40", note: "Qualified form campaign" },
      { label: "Google spend", value: "$156.61", note: "Philadelphia Search" },
      { label: "Google clicks", value: "46", note: "676 impressions · 6.80% CTR" },
      { label: "Google average CPC", value: "$3.40", note: "Current seven day window" },
      { label: "Google optimization score", value: "76%", note: "One image recommendation pending" }
    ],
    channelRows: [
      { channel: "Meta Ads", status: "Active", detail: "Higher Intent form campaign recorded 2 paid form leads at $34.40 per lead. Leads Center showed both in Intake and unassigned." },
      { channel: "Google Ads", status: "Active", detail: "Philadelphia Search recorded $156.61 in spend, 46 clicks, 676 impressions, and a 6.80% click through rate." }
    ],
    work: [
      { tag: "Communication", title: "July recap and August plan delivered", body: "The client report was delivered on August 3 with the appointment path mapped from ad click through form submission and booked consultation." },
      { tag: "Meta", title: "Lead quality system remains in place", body: "The Higher Intent form uses SMS verification, four qualification questions, and four approved boutique images. The current read found two paid form leads for Kimberly's follow up." },
      { tag: "Google", title: "Search campaign reviewed read only", body: "The Philadelphia Search lane is eligible but limited by targeting fewer searches. Google recommended adding images. No recommendation was applied." },
      { tag: "Next", title: "Connect inquiries to appointment outcomes", body: "Route the two new leads to Kimberly, record contact and appointment status, and use that evidence before changing budgets or campaign settings." }
    ],
    watchouts: [
      "Meta and Google remain separate reporting lanes.",
      "Google conversion reporting is pending validation.",
      "No spend, bid, campaign, or form settings were changed in this review."
    ],
    sources: [
      "Meta Ads Manager and Leads Center · account 1249689223687250 · live read for Aug 3 to Aug 9",
      "Google Ads · customer 814-550-6229 · live read for Aug 3 to Aug 9",
      "Gmail thread · Kimberly James Bridal | July recap and August plan",
      "Slack · #kimberly-james-bridal · August 3 report handoff",
      "Canonical paid-media notes · meta-qualified-lead-campaign-2026-07-27.md"
    ],
    links: []
  },
  {
    slug: "omega-landscaping",
    name: "Omega Landscaping and Concrete",
    shortName: "Omega Landscaping and Concrete",
    location: "Colorado Springs, Colorado",
    logoSource: path.join(clientsRoot, "omega-landscaping", "content", "google-business-profile", "2026-07-24-30-batch", "assets", "omega-logo-official.png"),
    theme: {
      ink: "#10233a",
      accent: "#1f61ae",
      paper: "#f5f0dd",
      tint: "#e3e8ee",
      soft: "#fffdf6",
      dark: "#0b1727"
    },
    executiveSummary: "Omega's Search account delivered two reported conversions and continued to send high intent Colorado Springs traffic. The production landing page was published during the week, so the next read should connect the platform events to named project opportunities before expanding reach.",
    snapshotLabel: "Google Ads only for this account",
    metrics: [
      { label: "Reported conversions", value: "2", note: "Google dashboard · Aug 3 to Aug 9" },
      { label: "Impressions", value: "1,050", note: "Google Search and account inventory" },
      { label: "Clicks", value: "56", note: "5.34% CTR" },
      { label: "Google spend", value: "$387.83", note: "High Intent Search campaign" },
      { label: "Average CPC", value: "$6.93", note: "Current seven day window" },
      { label: "Optimization score", value: "84.2%", note: "Display Expansion suggestion not applied" }
    ],
    channelRows: [
      { channel: "Google Ads", status: "Active", detail: "Search | High Intent | Colorado Springs | 2026-07-30 recorded $387.83 in spend, 56 clicks, and 5.34% CTR." },
      { channel: "Landing page", status: "Published", detail: "The dedicated estimate destination was published August 5 with form measurement and preserved campaign parameters verified." }
    ],
    work: [
      { tag: "Release", title: "Paid search landing page published", body: "The Omega estimate page went live on August 5 at omega-landscaping-landing-page.netlify.app. The production readback confirmed the page, form action, tags, and conversion event wiring." },
      { tag: "Local", title: "Google Business Profile rhythm carried forward", body: "Four posts were confirmed live in the prior handoff and a second four post creative package was prepared for the next release, keeping project proof and service intent visible." },
      { tag: "Google", title: "High Intent Search reviewed read only", body: "The campaign was eligible but limited by its bid strategy. Google suggested Display Expansion at +0.8%. That recommendation was left unapplied." },
      { tag: "Next", title: "Reconcile events to real project quality", body: "Match the two reported conversions and any calls or forms to named inquiries and project status before using the account signal to guide budget decisions." }
    ],
    watchouts: [
      "The account is still being evaluated by service and location intent, not blended with other clients.",
      "Reported conversions need CRM and project-quality reconciliation.",
      "No Google recommendation, budget, bid, or campaign setting was changed in this review."
    ],
    sources: [
      "Google Ads · customer 285-398-1364 · live read for Aug 3 to Aug 9",
      "Gmail thread · Omega Landscaping and Concrete | July recap and August plan",
      "Slack · #omega-landscape · August 3 report handoff",
      "Canonical release record · 2026-08-01-google-ads-landing-page/RELEASE.md",
      "Google Business Profile batch · 2026-07-24-30-batch/README.md"
    ],
    links: [{ label: "Live estimate page", href: "https://omega-landscaping-landing-page.netlify.app" }]
  },
  {
    slug: "onsite-concrete-landscape",
    name: "Onsite Concrete and Landscape",
    shortName: "Onsite Concrete and Landscape",
    location: "Vacaville and Fairfield, California",
    logoSource: path.join(clientsRoot, "onsite-concrete-landscape", "video-factory", "references", "logo-verified.png"),
    theme: {
      ink: "#11151a",
      accent: "#f26154",
      paper: "#f4f4f1",
      tint: "#e3e3df",
      soft: "#ffffff",
      dark: "#090b0e"
    },
    executiveSummary: "Onsite's Google Ads dashboard was paused for the reporting window and showed no current delivery. The work this week centered on the monthly handoff, Fairfield search expansion, and keeping conversion measurement ready for the next live campaign read.",
    snapshotLabel: "Google Ads only for this account",
    metrics: [
      { label: "Campaign status", value: "Paused", note: "Live dashboard · Aug 3 to Aug 9" },
      { label: "Google spend", value: "$0.00", note: "Current seven day window" },
      { label: "Impressions", value: "0", note: "No current delivery recorded" },
      { label: "Clicks", value: "0", note: "No current traffic recorded" },
      { label: "Calls", value: "0", note: "Google dashboard" },
      { label: "Measurement", value: "Setup pending", note: "Finish conversion tracking" }
    ],
    channelRows: [
      { channel: "Google Ads", status: "Paused", detail: "The live campaign overview for Aug 3 to Aug 9 showed $0.00 spend, 0 impressions, 0 clicks, and 0 calls." },
      { channel: "SEO and local search", status: "In progress", detail: "Two Fairfield location pages were created and the approved service content and schema work remain the next publishing foundation." }
    ],
    work: [
      { tag: "Communication", title: "July recap and August plan delivered", body: "The monthly report and August plan were handed off on August 3 with the paid campaign rows, measurement correction plan, and qualified estimate focus called out separately." },
      { tag: "SEO", title: "Fairfield expansion advanced", body: "Two service pages were created for Fairfield: concrete walkway extension and concrete driveway extension. The monthly handoff also recorded 31 schemas completed in July." },
      { tag: "Content", title: "Approved service content remains ready", body: "The approved blog batch covering retaining walls, drainage, and pool deck decisions is preserved with its publishing requirements and no unsupported claims." },
      { tag: "Next", title: "Restore measurement before optimization", body: "Finish conversion tracking, verify the campaign state, and match future form and call activity to named estimates before making paid media decisions." }
    ],
    watchouts: [
      "The live account read was paused and no current delivery was available.",
      "Conversion reporting is pending validation while setup is unfinished.",
      "No campaign, budget, bid, or tracking setting was changed in this review."
    ],
    sources: [
      "Google Ads · customer 103-371-5894 · live read for Aug 3 to Aug 9",
      "Gmail thread · Onsite Concrete and Landscape | July recap and August plan",
      "Slack · #onsite-construction · August 3 report and Fairfield handoff",
      "Canonical release record · 2026-08-01-google-ads-landing-page/RELEASE.md",
      "Approved content batch · 2026-07-20-approved-slack-batch/README.md"
    ],
    links: [{ label: "Live estimate page", href: "https://onsite-gads-landing-page.netlify.app" }]
  },
  {
    slug: "replenish-7-eleven",
    name: "Replenish / 7-Eleven",
    shortName: "Replenish / 7-Eleven",
    location: "Brand separated from Fresh Blends",
    logoSource: path.join(clientsRoot, "replenish-7-eleven", "deliverables", "2026-07-29-google-ads-balance-reconciliation", "assets", "7-eleven-logo.png"),
    theme: {
      ink: "#0b3738",
      accent: "#ef252d",
      paper: "#fff8ed",
      tint: "#ffe4cf",
      soft: "#ffffff",
      dark: "#071f22"
    },
    executiveSummary: "Replenish was kept separate from Fresh Blends. The current week was about the brand-separated July delivery and account access and billing follow up. Ads were not delivering during this window, so there is no current-week optimization scorecard to report.",
    snapshotLabel: "No Ads account opened for Replenish in this run",
    metrics: [
      { label: "Current ad delivery", value: "Paused", note: "Billing and access resolution" },
      { label: "Current week spend", value: "Not reported", note: "No current delivery read" },
      { label: "Current week leads", value: "Not reported", note: "Pending fresh activation data" },
      { label: "Report boundary", value: "Replenish only", note: "Fresh Blends remains separate" },
      { label: "Work completed", value: "3 follow ups", note: "Aug 3 to Aug 6 email thread" },
      { label: "Next gate", value: "Billing", note: "Resolve before reactivation" }
    ],
    channelRows: [
      { channel: "Google Ads", status: "Paused", detail: "The existing Aug 4 to Aug 6 email thread states that campaigns were disabled pending payment and account resolution. No Ads account was opened for this report." },
      { channel: "Reporting", status: "Delivered", detail: "The Replenish and 7-Eleven presentation was sent separately on August 3, without blending Fresh Blends performance into the client view." }
    ],
    work: [
      { tag: "Reporting", title: "Brand separated presentation delivered", body: "The Replenish and 7-Eleven presentation was delivered on August 3 with its own logo, campaign totals, direction metrics, and August priorities." },
      { tag: "Account", title: "Access and billing route clarified", body: "The August 4 to August 6 email thread confirmed the account location and identified the Google Ads expert route for payment and access questions." },
      { tag: "Boundary", title: "Fresh Blends kept out of this report", body: "Fresh Blends and Kwik Trip were not blended into the Replenish packet, totals, logo, or next actions." },
      { tag: "Next", title: "Reconcile billing before relaunch", body: "Resolve payment and account ownership first. Once delivery resumes, capture a clean Monday through Sunday window before making optimization recommendations." }
    ],
    watchouts: [
      "No current week Ads metrics were estimated.",
      "No reactivation or campaign change was made.",
      "Fresh Blends / Kwik Trip is a separate brand and is not part of this packet."
    ],
    sources: [
      "Gmail thread · Replenish | July monthly performance and August plan · Aug 3 to Aug 6",
      "Slack · #fresh-blends · August 3 brand-separated presentation handoff",
      "Canonical Replenish balance reconciliation · 2026-07-29-google-ads-balance-reconciliation",
      "User-provided run note · Replenish did not have Ads delivery this week"
    ],
    links: []
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function logoFrame(client) {
  const darkLogo = client.slug === "onsite-concrete-landscape" || client.slug === "omega-landscaping";
  return `<div class="logo-frame ${darkLogo ? "logo-frame-dark" : ""}"><img src="client-logo.png" alt="${escapeHtml(client.name)} logo"></div>`;
}

function metricCards(client) {
  return client.metrics.map((metric) => `<div class="metric-card">
    <div class="metric-label">${escapeHtml(metric.label)}</div>
    <div class="metric-value">${escapeHtml(metric.value)}</div>
    <div class="metric-note">${escapeHtml(metric.note)}</div>
  </div>`).join("");
}

function channelRows(client) {
  return client.channelRows.map((row) => `<div class="channel-row">
    <div class="channel-label">${escapeHtml(row.channel)}</div>
    <div class="status-pill">${escapeHtml(row.status)}</div>
    <div class="channel-detail">${escapeHtml(row.detail)}</div>
  </div>`).join("");
}

function workCards(client) {
  return client.work.map((item) => `<div class="work-card">
    <div class="work-tag">${escapeHtml(item.tag)}</div>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.body)}</p>
  </div>`).join("");
}

function watchouts(client) {
  return client.watchouts.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function sources(client) {
  return client.sources.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function links(client) {
  if (!client.links.length) return "";
  return `<div class="link-strip">${client.links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)} <span>↗</span></a>`).join("")}</div>`;
}

function reportHtml(client) {
  const t = client.theme;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(client.name)} | Weekly Marketing Report | Aug 3 to Aug 9, 2026</title>
  <style>
    :root {
      --ink: ${t.ink};
      --accent: ${t.accent};
      --paper: ${t.paper};
      --tint: ${t.tint};
      --soft: ${t.soft};
      --dark: ${t.dark};
      --muted: #5d6975;
      --line: rgba(16, 35, 58, .14);
    }
    @page { size: Letter; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #dfe4e8; color: var(--ink); font-family: Arial, Helvetica, sans-serif; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 8.5in; height: 11in; position: relative; overflow: hidden; padding: .62in .66in .58in; background: var(--paper); page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .cover { background: var(--dark); color: white; padding: .74in .7in .62in; }
    .cover::after { content: ""; position: absolute; width: 4.6in; height: 4.6in; right: -.9in; bottom: -.9in; border-radius: 50%; border: 1px solid rgba(255,255,255,.12); box-shadow: 0 0 0 28px rgba(255,255,255,.03), 0 0 0 56px rgba(255,255,255,.025); }
    .cover-top { display: flex; align-items: center; justify-content: space-between; gap: 20px; position: relative; z-index: 1; }
    .brand-lockup { display: flex; align-items: center; gap: 11px; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.72); }
    .brand-mark { width: 25px; height: 25px; border-radius: 50%; border: 2px solid var(--accent); display: grid; place-items: center; color: var(--accent); font-size: 11px; font-weight: 800; }
    .period-mini { color: rgba(255,255,255,.62); font-size: 10px; letter-spacing: .04em; }
    .cover-main { position: relative; z-index: 1; margin-top: 1.18in; max-width: 6.55in; }
    .eyebrow { color: var(--accent); font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
    h1 { margin: 13px 0 0; font-size: 43px; line-height: .98; letter-spacing: -.045em; font-weight: 800; }
    .cover-client { margin: 22px 0 0; font-size: 20px; line-height: 1.2; font-weight: 700; color: rgba(255,255,255,.9); }
    .cover-location { margin-top: 9px; font-size: 12px; color: rgba(255,255,255,.62); }
    .cover-rule { margin-top: 32px; width: 72px; border-top: 4px solid var(--accent); }
    .cover-summary { margin-top: 23px; max-width: 5.7in; font-size: 15px; line-height: 1.55; color: rgba(255,255,255,.84); }
    .cover-bottom { position: absolute; left: .7in; right: .7in; bottom: .62in; display: flex; justify-content: space-between; align-items: end; z-index: 1; }
    .cover-bottom-note { max-width: 3.7in; font-size: 10px; line-height: 1.5; color: rgba(255,255,255,.53); }
    .logo-frame { width: 1.95in; height: 1.18in; padding: 13px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.94); border-radius: 7px; box-shadow: 0 14px 32px rgba(0,0,0,.18); }
    .logo-frame-dark { background: rgba(8,12,16,.82); border: 1px solid rgba(255,255,255,.22); }
    .logo-frame img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .section-kicker { color: var(--accent); font-size: 10px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
    .page-header { display: flex; align-items: end; justify-content: space-between; gap: 15px; border-bottom: 1px solid var(--line); padding-bottom: 17px; }
    .page-header h2 { margin: 6px 0 0; font-size: 26px; line-height: 1.08; letter-spacing: -.035em; }
    .page-header .range { color: var(--muted); font-size: 10px; text-align: right; white-space: nowrap; }
    .intro { margin: 19px 0 0; max-width: 6.65in; font-size: 13px; line-height: 1.55; color: #394955; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 20px; }
    .metric-card { min-height: 1.02in; padding: 14px 14px 12px; background: var(--soft); border: 1px solid var(--line); border-top: 3px solid var(--accent); border-radius: 5px; }
    .metric-label { font-size: 9px; line-height: 1.2; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 800; }
    .metric-value { margin-top: 8px; font-size: 24px; line-height: 1; font-weight: 800; letter-spacing: -.04em; color: var(--ink); }
    .metric-note { margin-top: 7px; font-size: 9px; line-height: 1.3; color: var(--muted); }
    .subhead { margin: 25px 0 9px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
    .channel-row { display: grid; grid-template-columns: 1.25in .82in 1fr; gap: 12px; align-items: start; padding: 12px 0; border-top: 1px solid var(--line); }
    .channel-label { font-size: 12px; font-weight: 800; }
    .status-pill { display: inline-flex; justify-content: center; border: 1px solid var(--accent); color: var(--ink); border-radius: 999px; padding: 4px 7px; font-size: 9px; line-height: 1; font-weight: 800; }
    .channel-detail { font-size: 11px; line-height: 1.45; color: #435461; }
    .callout { margin-top: 22px; padding: 15px 16px; background: var(--ink); color: white; border-left: 5px solid var(--accent); border-radius: 4px; }
    .callout strong { color: var(--accent); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
    .callout p { margin: 7px 0 0; font-size: 11px; line-height: 1.48; color: rgba(255,255,255,.83); }
    .work-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 24px; }
    .work-card { min-height: 1.56in; padding: 15px 15px 14px; background: var(--soft); border: 1px solid var(--line); border-radius: 5px; }
    .work-tag { color: var(--accent); font-size: 9px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    .work-card h3 { margin: 8px 0 0; font-size: 15px; line-height: 1.16; letter-spacing: -.02em; }
    .work-card p { margin: 8px 0 0; font-size: 10.7px; line-height: 1.48; color: #465661; }
    .watch-grid { display: grid; grid-template-columns: 1.14fr .86fr; gap: 18px; margin-top: 26px; }
    .watch-panel { padding: 16px; background: var(--tint); border-radius: 5px; }
    .watch-panel h3 { margin: 0; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
    .watch-panel ul, .source-list { margin: 11px 0 0; padding-left: 16px; }
    .watch-panel li, .source-list li { margin: 0 0 8px; font-size: 10px; line-height: 1.4; color: #465661; }
    .source-list li { margin-bottom: 7px; }
    .link-strip { display: flex; gap: 9px; flex-wrap: wrap; margin-top: 19px; }
    .link-strip a { display: inline-block; padding: 8px 10px; border: 1px solid var(--accent); border-radius: 3px; color: var(--ink); font-size: 10px; font-weight: 800; text-decoration: none; }
    .link-strip span { color: var(--accent); }
    .source-meta { margin-top: 20px; padding: 12px 14px; border: 1px solid var(--line); background: var(--soft); border-radius: 4px; font-size: 10px; line-height: 1.45; color: #52616c; }
    .footer { position: absolute; left: .66in; right: .66in; bottom: .28in; display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding-top: 8px; color: var(--muted); font-size: 8px; letter-spacing: .06em; text-transform: uppercase; }
    .footer strong { color: var(--ink); }
    .cover .footer { border-color: rgba(255,255,255,.16); color: rgba(255,255,255,.48); }
    .cover .footer strong { color: white; }
    .page-dark { background: var(--dark); color: white; }
    .page-dark .page-header { border-color: rgba(255,255,255,.16); }
    .page-dark .page-header .range, .page-dark .intro, .page-dark .channel-detail, .page-dark .metric-note { color: rgba(255,255,255,.64); }
    .page-dark .metric-card, .page-dark .work-card, .page-dark .source-meta { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.14); }
    .page-dark .metric-label, .page-dark .watch-panel li, .page-dark .source-list li { color: rgba(255,255,255,.64); }
    .page-dark .metric-value, .page-dark .channel-label, .page-dark .work-card h3 { color: white; }
    .page-dark .work-card p, .page-dark .source-meta { color: rgba(255,255,255,.72); }
    .page-dark .watch-panel { background: rgba(255,255,255,.08); }
    .page-dark .footer { border-color: rgba(255,255,255,.16); color: rgba(255,255,255,.48); }
    .page-dark .footer strong { color: white; }
  </style>
</head>
<body>
  <section class="page cover">
    <div class="cover-top">
      <div class="brand-lockup"><div class="brand-mark">M</div><div>Momentum 360</div></div>
      <div class="period-mini">Weekly client report · 2026</div>
    </div>
    <div class="cover-main">
      <div class="eyebrow">Performance and delivery readback</div>
      <h1>Weekly<br>marketing report</h1>
      <div class="cover-client">${escapeHtml(client.name)}</div>
      <div class="cover-location">${escapeHtml(client.location)}</div>
      <div class="cover-rule"></div>
      <div class="cover-summary">${escapeHtml(client.executiveSummary)}</div>
    </div>
    <div class="cover-bottom">
      <div class="cover-bottom-note">Reporting window<br><strong>August 3 to August 9, 2026</strong><br><br>Prepared August 10, 2026 · read only review</div>
      ${logoFrame(client)}
    </div>
    <div class="footer"><span><strong>${escapeHtml(client.shortName)}</strong></span><span>01 / 04</span></div>
  </section>

  <section class="page">
    <div class="page-header"><div><div class="section-kicker">01 · Current signal</div><h2>Performance snapshot</h2></div><div class="range">Aug 3 to Aug 9, 2026<br>${escapeHtml(client.snapshotLabel)}</div></div>
    <p class="intro">${escapeHtml(client.executiveSummary)}</p>
    <div class="metrics">${metricCards(client)}</div>
    <h3 class="subhead">Account lanes</h3>
    <div>${channelRows(client)}</div>
    <div class="callout"><strong>Read this first</strong><p>Metrics are sourced from the client specific platform or communication evidence listed in the final page. Missing fields remain pending validation. No spend, account, campaign, bid, or publication changes were made as part of this report.</p></div>
    ${links(client)}
    <div class="footer"><span><strong>${escapeHtml(client.shortName)}</strong> · weekly report</span><span>02 / 04</span></div>
  </section>

  <section class="page page-dark">
    <div class="page-header"><div><div class="section-kicker">02 · Work shipped</div><h2>Deliverables and optimization notes</h2></div><div class="range">Prepared Aug 10, 2026</div></div>
    <p class="intro">This is the human handoff for the week: what moved forward, what the live account showed, and what is held for the next verified decision.</p>
    <div class="work-grid">${workCards(client)}</div>
    <div class="watch-grid">
      <div class="watch-panel"><h3>Guardrails</h3><ul>${watchouts(client)}</ul></div>
      <div class="watch-panel"><h3>Client boundary</h3><ul><li>One client and one brand view only.</li><li>Google and Meta stay separate where both exist.</li><li>Recommendations are held until the next evidence check.</li></ul></div>
    </div>
    <div class="footer"><span><strong>${escapeHtml(client.shortName)}</strong> · weekly report</span><span>03 / 04</span></div>
  </section>

  <section class="page">
    <div class="page-header"><div><div class="section-kicker">03 · Evidence map</div><h2>Sources and next read</h2></div><div class="range">Freshness is stated by source</div></div>
    <p class="intro">The packet is intentionally narrow. It records the Aug 3 to Aug 9 account read, the work that was actually evidenced, and the next check needed to move from activity to business outcome.</p>
    <div class="source-meta"><strong>Evidence standard.</strong> Live platform fields are used where the requested account was opened. Gmail, Slack, and canonical client files are used for deliverables and communication. Nothing is estimated when the source was not available.</div>
    <h3 class="subhead">Source map</h3>
    <ul class="source-list">${sources(client)}</ul>
    <div class="watch-grid">
      <div class="watch-panel"><h3>Next Monday read</h3><ul><li>Use the same Monday through Sunday window.</li><li>Reconcile lead or estimate quality before changing spend.</li><li>Keep all client and channel totals separate.</li></ul></div>
      <div class="watch-panel"><h3>Prepared by</h3><ul><li>Dillon Mohr</li><li>AI Marketing Director · Account Manager</li><li>Momentum 360 · Philadelphia</li></ul></div>
    </div>
    <div class="source-meta" style="margin-top:24px"><strong>Delivery state.</strong> The PDF is ready for the client email and Slack draft. External delivery remains unsent until approved.</div>
    <div class="footer"><span><strong>${escapeHtml(client.shortName)}</strong> · weekly report</span><span>04 / 04</span></div>
  </section>
</body>
</html>`;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const client of clients) {
      const clientRoot = path.join(clientsRoot, client.slug);
      const outputDir = path.join(clientRoot, "deliverables", reportFolderName);
      fs.mkdirSync(outputDir, { recursive: true });
      fs.copyFileSync(client.logoSource, path.join(outputDir, "client-logo.png"));
      const html = reportHtml(client);
      const htmlPath = path.join(outputDir, "report.html");
      const pdfPath = path.join(outputDir, `${client.slug}-weekly-report-2026-08-03-to-2026-08-09.pdf`);
      const sourceDataPath = path.join(outputDir, "source-data.json");
      fs.writeFileSync(htmlPath, html, "utf8");
      fs.writeFileSync(sourceDataPath, JSON.stringify({
        client: client.name,
        reporting_window: "2026-08-03 through 2026-08-09",
        prepared: "2026-08-10",
        evidence_mode: "read-only",
        metrics: client.metrics,
        channel_rows: client.channelRows,
        work: client.work,
        watchouts: client.watchouts,
        sources: client.sources,
        logo_source: client.logoSource
      }, null, 2), "utf8");
      const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
      await page.goto(`file:///${htmlPath.replaceAll("\\", "/")}`, { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "print" });
      await page.pdf({ path: pdfPath, format: "Letter", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
      const qaPngPath = path.join(outputDir, "qa-full-page.png");
      await page.screenshot({ path: qaPngPath, fullPage: true });
      await page.close();
      results.push({ client: client.name, pdfPath, htmlPath, qaPngPath, pages: 4 });
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(JSON.stringify(results, null, 2));
}

await main();
