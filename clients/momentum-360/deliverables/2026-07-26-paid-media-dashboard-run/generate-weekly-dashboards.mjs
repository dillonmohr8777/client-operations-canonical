import fs from "node:fs";
import path from "node:path";

await import("./restore-standard-dashboard-template.mjs");
process.exit(0);

const repo = path.resolve(import.meta.dirname, "../../../..");
const period = "July 20–26, 2026";

const reports = [
  {
    slug: "kimberly-james-bridal",
    client: "Kimberly James Bridal",
    title: "Paid Media Weekly Report",
    platforms: ["Google Ads", "Meta Ads"],
    sourceStatus: "Google verified through Jul 26 · Meta verified through Jul 25",
    signal: "Paid media generated efficient traffic across both channels, with Google click volume accelerating and Meta landing-page visits holding below fifty cents each.",
    metrics: [
      ["Total media spend", "$202.23", "Google + Meta, shown separately below"],
      ["Google clicks", "282", "2.76% account CTR"],
      ["Meta landing-page views", "123", "$0.47 per view"],
      ["Total impressions", "16,211", "10,212 Google · 5,999 Meta"],
    ],
    sections: [
      {
        platform: "Google Ads",
        status: "Verified through Jul 26",
        note: "The account delivered 10,212 impressions and 282 clicks on $144.48 in spend. Average CPC was $0.51, while conversion reporting remains pending validation against appointment outcomes.",
        metrics: [
          ["Spend", "$144.48"],
          ["Impressions", "10,212"],
          ["Clicks", "282"],
          ["Avg. CPC", "$0.51"],
        ],
        campaigns: [
          ["Campaign #1 · Performance Max", "Paused", "$142.62", "10,185", "281 clicks"],
          ["Local Bridal · Philadelphia Search", "Active", "$1.86", "27", "1 click"],
        ],
      },
      {
        platform: "Meta Ads",
        status: "Verified through Jul 25",
        note: "The active carousel traffic campaign produced 123 landing-page views from 5,999 impressions. Meta has not finalized Jul 26 rows yet, so that day remains pending platform latency.",
        metrics: [
          ["Spend", "$57.75"],
          ["Impressions", "5,999"],
          ["Reach", "4,462"],
          ["Cost / landing-page view", "$0.47"],
        ],
        campaigns: [
          ["Website Carousel · Philadelphia", "Active", "$57.75", "5,999", "123 landing-page views"],
        ],
      },
    ],
    interpretation: "Google supplied the larger traffic pool, while Meta supplied a clean, low-cost landing-page-view signal. The channels should remain separately measured until appointment and lead-quality reconciliation is complete.",
    next: "Validate appointment outcomes by source, keep the live Google search campaign learning, and move Meta lead creative forward only after the current draft review is complete.",
    slack: `🔴 Kimberly James Bridal | ${period} paid media update

Dashboard: https://kimberly-james-bridal-2026-06-06.netlify.app

Google and Meta kept traffic efficient this week while the appointment-quality layer is reconciled.

• Google Ads: $144.48 spend, 10,212 impressions, 282 clicks, 2.76% CTR, and $0.51 average CPC
• Meta Ads: $57.75 spend, 5,999 impressions, 4,462 reach, and 123 landing-page views at $0.47 each
• Combined media spend: $202.23
• Conversion reporting is pending validation against appointment outcomes

Next: reconcile appointments by source, preserve Google search learning, and complete the Meta lead-creative review.`,
  },
  {
    slug: "omega-landscaping",
    client: "Omega Landscaping",
    title: "Google Ads Weekly Report",
    platforms: ["Google Ads"],
    sourceStatus: "Google Ads verified through Jul 26",
    signal: "Performance Max carried Colorado Springs demand and recorded one Google-counted conversion event while maintaining a focused, single-campaign account.",
    metrics: [
      ["Spend", "$271.93", "Performance Max"],
      ["Impressions", "1,492", "Colorado Springs delivery"],
      ["Clicks", "45", "3.02% CTR"],
      ["Tracked event", "1", "Awaiting named-lead validation"],
    ],
    sections: [
      {
        platform: "Google Ads",
        status: "Verified through Jul 26",
        note: "The active Performance Max campaign delivered 1,492 impressions, 71 interactions, and 45 clicks. Google counted one conversion event at $271.93, pending reconciliation to a named call, form, or CRM record.",
        metrics: [
          ["Spend", "$271.93"],
          ["Interactions", "71"],
          ["Clicks", "45"],
          ["CTR", "3.02%"],
        ],
        campaigns: [
          ["Colorado Springs · Performance Max", "Active", "$271.93", "1,492", "1 tracked event"],
        ],
      },
    ],
    interpretation: "The account is concentrated in the intended active campaign, which keeps the optimization story clean. The next decision should depend on lead identity and project quality, not platform count alone.",
    next: "Reconcile the Google-counted event against calls, forms, inbox, and CRM records before changing budget or relaunching Search.",
    slack: `🔴 Omega Landscaping | ${period} ads update

Dashboard: https://omega-landscaping-2026-06-06.netlify.app

Performance Max kept Omega visible across Colorado Springs and produced one Google-counted conversion event awaiting named-lead validation.

• $271.93 Google Ads spend
• 1,492 impressions and 71 interactions
• 45 clicks at a 3.02% CTR
• 1 tracked conversion event pending call, form, inbox, and CRM reconciliation

Next: confirm the lead identity and project quality before changing budget or rebuilding Search.`,
  },
  {
    slug: "onsite-concrete-landscape",
    client: "Onsite Concrete & Landscape",
    title: "Google Ads Weekly Report",
    platforms: ["Google Ads"],
    sourceStatus: "Google Ads verified through Jul 26",
    signal: "Onsite generated six tracked conversion events on modest spend, with Performance Max producing the account’s strongest measurable action signal.",
    metrics: [
      ["Account spend", "$60.36", "All account activity"],
      ["Impressions", "11,008", "Account total"],
      ["Clicks", "344", "Account total"],
      ["Tracked events", "6", "Whole-integer Google count"],
    ],
    sections: [
      {
        platform: "Google Ads",
        status: "Verified through Jul 26",
        note: "The account delivered 11,008 impressions and 344 clicks on $60.36 in spend. Performance Max recorded all six visible tracked events on $23.13 in campaign spend.",
        metrics: [
          ["Spend", "$60.36"],
          ["Impressions", "11,008"],
          ["Clicks", "344"],
          ["Tracked events", "6"],
        ],
        campaigns: [
          ["Onsite Concrete & Landscape · Smart", "Active", "$37.23", "10,551", "277 clicks"],
          ["Leads · Performance Max", "Active", "$23.13", "457", "6 tracked events"],
        ],
      },
    ],
    interpretation: "Performance Max is the measurable action engine, while the Smart campaign supplies most of the reach and click volume. Named contact outcomes still determine which events represent qualified estimates.",
    next: "Reconcile the six tracked events against call, form, inbox, and CRM records, then use the qualified-estimate mix to guide the next budget decision.",
    slack: `Onsite Concrete & Landscape | ${period} update

Dashboard: https://onsite-concrete-construction-2026-06-06.netlify.app

Onsite generated six tracked conversion events on modest spend, with Performance Max producing the strongest measurable action signal.

• $60.36 Google Ads spend
• 11,008 impressions
• 344 clicks
• 6 tracked conversion events, with named-contact validation in progress
• Performance Max produced the six visible events on $23.13 in campaign spend

Next: reconcile the tracked events to qualified estimates, then tune budget around the confirmed contact mix.`,
  },
  {
    slug: "fagan-painting",
    client: "Fagan Painting",
    title: "Meta Closeout and Organic Search Transition",
    platforms: ["Meta Ads", "AEO", "GEO", "SEO"],
    sourceStatus: "Meta verified through Jul 25 · handoff and organic transition active",
    signal: "Fagan recorded six Meta lead-form results from the leading delivered campaign, and the ongoing lane is moving to coordinated AEO, GEO, and SEO.",
    metrics: [
      ["Spend", "$478.14", "Two campaigns with delivery"],
      ["Impressions", "10,563", "Campaign-total delivery"],
      ["Lead-form results", "6", "Whole-integer Meta count"],
      ["Primary CPL", "$56.75", "Six-lead campaign"],
    ],
    sections: [
      {
        platform: "Meta Ads",
        status: "Verified through Jul 25",
        note: "Two campaigns recorded delivery during the confirmed period. The leading campaign produced six lead-form results on $340.48 in spend. Meta has not finalized Jul 26 rows yet.",
        metrics: [
          ["Spend", "$478.14"],
          ["Impressions", "10,563"],
          ["Lead-form results", "6"],
          ["Primary cost / lead", "$56.75"],
        ],
        campaigns: [
          ["Primary First Optimized Lead Campaign", "Delivered · now off", "$137.66", "2,253", "Lead reporting pending validation"],
          ["Pittsburgh 25mi Lead Campaign · Copy", "Delivered · handoff", "$340.48", "8,310", "6 lead forms"],
        ],
      },
      {
        platform: "AEO, GEO, and SEO",
        status: "Transition active",
        note: "Dillon's continuing work is moving to answer-focused organic visibility coordinated with Phil and Mac. The first lane covers service-page answers, homeowner FAQs, local painting topics, internal links, and structured content.",
        metrics: [
          ["Program status", "Initiated"],
          ["Coordination", "Phil + Mac"],
          ["Baseline", "Next review"],
          ["First content lane", "Service pages + FAQs"],
        ],
        campaigns: [
          ["Answer-ready service pages", "Priority mapping", "—", "—", "Baseline pending"],
          ["Homeowner FAQ system", "Question inventory", "—", "—", "First sprint"],
          ["Local painting topics", "SEO coordination", "—", "—", "Internal-link plan"],
        ],
      },
    ],
    interpretation: "The six-lead campaign is the final paid-social acquisition story for this reporting window. Facebook management is transitioning to Benson and Legacy Paint Holdings, while the ongoing opportunity moves into AEO, GEO, and SEO coordinated with the existing organic program.",
    next: "Complete the Meta handoff record, establish the organic and AI citation baseline, and align the first answer-focused service page and FAQ priorities with Phil and Mac.",
    slack: `Fagan Painting | ${period} Meta update

Dashboard: https://fagan-painting-2026-07-06.netlify.app

Fagan recorded six Meta lead-form results from the leading delivered campaign. Facebook management is transitioning to Benson and Legacy Paint Holdings, and the ongoing lane is shifting to coordinated AEO, GEO, and SEO.

• $478.14 total Meta spend across two campaigns with delivery
• 10,563 campaign impressions
• 6 lead-form results
• $56.75 cost per lead on the six-lead campaign

Next: complete the Meta handoff record, establish the organic and AI citation baseline, and align the first answer-focused service page and FAQ priorities with Phil and Mac.`,
  },
  {
    slug: "fresh-blends-kwik-trip",
    client: "Fresh Blends / Kwik Trip",
    title: "Google Ads Delivery Status",
    platforms: ["Google Ads"],
    sourceStatus: "Google Ads verified through Jul 26",
    signal: "Fresh Blends remained separate from Replenish, and its Ice Box campaigns stayed paused with no current-week delivery asserted.",
    metrics: [
      ["Delivery status", "Paused", "Shared child account"],
      ["Ice Box campaigns", "4", "Campaigns remain paused"],
      ["Current-week spend", "—", "No active delivery asserted"],
      ["Reporting boundary", "Separate", "Not blended with Replenish"],
    ],
    sections: [
      {
        platform: "Google Ads",
        status: "Verified through Jul 26",
        note: "The Fresh Blends / Kwik Trip Ice Box campaigns are paused in the shared Replenish child account. This status report intentionally excludes Replenish store campaigns and does not publish an active-ads performance claim.",
        metrics: [
          ["Active delivery", "Paused"],
          ["Campaigns reviewed", "4"],
          ["Replenish metrics", "Excluded"],
          ["Conversion reporting", "Pending validation"],
        ],
        campaigns: [
          ["Kwik Trip #633 · Ice Box · PMax", "Paused", "—", "—", "No delivery asserted"],
          ["Kwik Trip #1110 · Ice Box · PMax", "Paused", "—", "—", "No delivery asserted"],
          ["Two additional Ice Box campaigns", "Paused", "—", "—", "No delivery asserted"],
        ],
      },
    ],
    interpretation: "Fresh Blends is a distinct reporting lane even though it shares a Google Ads child account with Replenish. The correct weekly result is a verified delivery-status report, not a blended KPI total.",
    next: "Keep the Ice Box campaigns paused until launch authority, store scope, and measurement definitions are confirmed.",
    slack: `Fresh Blends / Kwik Trip | ${period} delivery status

Dashboard: https://fresh-blends-2026-05-31-report.netlify.app

Fresh Blends remains a separate reporting lane from Replenish. The four Ice Box campaigns are paused, so this week’s update is a verified delivery-status report rather than an active-ads KPI claim.

• Four Ice Box campaigns reviewed
• Campaign delivery remains paused
• Replenish store metrics are excluded
• Conversion reporting remains pending validation

Next: confirm launch authority, store scope, and measurement definitions before any restart.`,
  },
];

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function renderSection(section) {
  const metrics = section.metrics
    .map(([label, value]) => `<div class="mini-metric"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`)
    .join("");
  const rows = section.campaigns
    .map(
      ([name, state, spend, impressions, result]) => `
        <tr>
          <th scope="row">${esc(name)}</th>
          <td><span class="state">${esc(state)}</span></td>
          <td>${esc(spend)}</td>
          <td>${esc(impressions)}</td>
          <td>${esc(result)}</td>
        </tr>`,
    )
    .join("");
  return `
    <section class="platform-panel" aria-labelledby="${esc(section.platform.toLowerCase().replaceAll(" ", "-"))}">
      <div class="platform-heading">
        <div>
          <span class="platform-label">${esc(section.platform)}</span>
          <h2 id="${esc(section.platform.toLowerCase().replaceAll(" ", "-"))}">${esc(section.platform)} performance</h2>
        </div>
        <span class="verified">${esc(section.status)}</span>
      </div>
      <p class="section-read">${esc(section.note)}</p>
      <div class="mini-metrics">${metrics}</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Campaign</th><th>Status</th><th>Spend</th><th>Impressions</th><th>Result</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

function render(report) {
  const metricRibbon = report.metrics
    .map(
      ([label, value, detail]) => `
      <div class="metric">
        <span>${esc(label)}</span>
        <strong>${esc(value)}</strong>
        <small>${esc(detail)}</small>
      </div>`,
    )
    .join("");
  const platformChips = report.platforms.map((platform) => `<span>${esc(platform)}</span>`).join("");
  return `<!doctype html>
<!--
THESIS: Weekly paid-media truth in one reading path; rejects the disconnected metric-card wall.
OWN-WORLD: Near-black Momentum canvas, continuous blue metric ribbon, amber signal rule, crisp tabular data.
STORY: Identify the week, read the signal, verify each channel, understand the next move.
FIRST VIEWPORT: Client and coverage above a full-width signal statement and divided KPI ribbon.
FORM: Established Momentum 360 operate/read surface, preserved from the stable client dashboards.
-->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${esc(report.client)} paid media report for ${esc(period)}.">
  <title>${esc(report.client)} · ${esc(report.title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --canvas: #020617;
      --field: #071225;
      --field-2: #0b1930;
      --rule: #1e2f4f;
      --text: #f8fafc;
      --muted: #a9bad5;
      --blue: #2563eb;
      --blue-soft: #54a2ff;
      --amber: #f59e0b;
      --green: #10b981;
      --shadow: 0 20px 55px rgba(0, 0, 0, .28);
    }
    * { box-sizing: border-box; }
    html { background: var(--canvas); scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background:
        radial-gradient(circle at 88% 5%, rgba(37, 99, 235, .22), transparent 28rem),
        linear-gradient(155deg, #020617 0%, #030a19 55%, #061329 100%);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    a { color: var(--blue-soft); }
    a:focus-visible { outline: 3px solid var(--amber); outline-offset: 4px; }
    .shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 34px 0 60px; }
    .masthead { display: flex; justify-content: space-between; gap: 28px; align-items: flex-start; }
    .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: -.02em; }
    .brand-mark { width: 34px; height: 34px; border-radius: 12px; background: var(--blue); box-shadow: 8px 8px 24px rgba(0, 0, 0, .28); position: relative; }
    .brand-mark::after { content: ""; position: absolute; inset: 8px; border: 2px solid white; border-radius: 50%; border-right-color: transparent; }
    .source-box { max-width: 390px; text-align: right; color: var(--muted); font-size: .83rem; }
    .source-box strong { display: block; color: var(--green); font-weight: 720; }
    .hero { padding: 72px 0 38px; display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(270px, .6fr); gap: 46px; align-items: end; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
    .chips span, .platform-label, .verified { border-radius: 999px; padding: 6px 10px; font-size: .75rem; font-weight: 760; letter-spacing: .02em; }
    .chips span, .platform-label { background: rgba(37, 99, 235, .2); color: #bcd6ff; }
    h1 { margin: 0; max-width: 11ch; font-size: clamp(2.8rem, 7vw, 5.7rem); line-height: .93; letter-spacing: -.04em; }
    .period { border-top: 1px solid var(--rule); padding-top: 18px; }
    .period span { display: block; color: var(--muted); font-size: .82rem; }
    .period strong { display: block; margin-top: 4px; font-size: 1.35rem; letter-spacing: -.02em; }
    .signal { position: relative; padding: 26px 0 30px 24px; border-top: 1px solid var(--amber); }
    .signal::before { content: ""; position: absolute; left: 0; top: -1px; width: 18%; height: 3px; background: var(--amber); transform-origin: left; animation: signal-in 700ms cubic-bezier(.16, 1, .3, 1) both; }
    .signal p { margin: 0; max-width: 72ch; font-size: clamp(1.35rem, 2.3vw, 2rem); line-height: 1.32; letter-spacing: -.025em; text-wrap: balance; }
    .metric-ribbon { display: grid; grid-template-columns: repeat(4, 1fr); background: linear-gradient(110deg, #0c2f70, #0a2350); border-radius: 16px; box-shadow: var(--shadow); overflow: hidden; }
    .metric { min-height: 150px; padding: 26px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,.16); }
    .metric:last-child { border-right: 0; }
    .metric span, .mini-metric span { color: #c7dcff; font-size: .78rem; font-weight: 700; }
    .metric strong { font-size: clamp(1.9rem, 3vw, 3rem); line-height: 1; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
    .metric small { color: #b8cae5; }
    .platform-panel { margin-top: 34px; padding: 34px; background: rgba(7, 18, 37, .9); border: 1px solid var(--rule); border-radius: 16px; box-shadow: var(--shadow); }
    .platform-heading { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
    .platform-heading h2 { margin: 12px 0 0; font-size: clamp(1.8rem, 3vw, 2.8rem); line-height: 1; letter-spacing: -.03em; }
    .verified { background: rgba(16, 185, 129, .15); color: #91f1ca; white-space: nowrap; }
    .section-read { max-width: 73ch; margin: 24px 0 0; color: var(--muted); font-size: 1.04rem; }
    .mini-metrics { display: grid; grid-template-columns: repeat(4, 1fr); margin: 30px 0 26px; border-block: 1px solid var(--rule); }
    .mini-metric { padding: 20px 18px 20px 0; }
    .mini-metric strong { display: block; margin-top: 5px; font-size: 1.55rem; letter-spacing: -.025em; font-variant-numeric: tabular-nums; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; min-width: 760px; border-collapse: collapse; font-variant-numeric: tabular-nums; }
    th, td { padding: 15px 14px; border-bottom: 1px solid var(--rule); text-align: left; vertical-align: top; }
    thead th { color: var(--muted); font-size: .76rem; font-weight: 750; }
    tbody th { max-width: 32rem; font-weight: 670; }
    td { color: #d7e2f3; }
    .state { color: #c7dcff; }
    .readout { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; margin-top: 34px; }
    .readout article { padding: 32px 0; border-top: 1px solid var(--rule); }
    .readout h2 { margin: 0 0 12px; font-size: 1.35rem; letter-spacing: -.02em; }
    .readout p { margin: 0; color: var(--muted); }
    .next { color: var(--text) !important; font-size: 1.18rem; }
    footer { margin-top: 38px; padding-top: 22px; border-top: 1px solid var(--rule); color: var(--muted); font-size: .82rem; display: flex; justify-content: space-between; gap: 24px; }
    @keyframes signal-in { from { transform: scaleX(.08); opacity: .4; } to { transform: scaleX(1); opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; animation: none !important; } }
    @media (max-width: 840px) {
      .shell { width: min(100% - 28px, 1180px); }
      .masthead, .platform-heading, footer { flex-direction: column; }
      .source-box { text-align: left; }
      .hero { grid-template-columns: 1fr; padding-top: 52px; }
      h1 { max-width: 12ch; }
      .metric-ribbon { grid-template-columns: 1fr 1fr; }
      .metric:nth-child(2) { border-right: 0; }
      .metric:nth-child(-n+2) { border-bottom: 1px solid rgba(255,255,255,.16); }
      .mini-metrics, .readout { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 540px) {
      .shell { padding-top: 24px; }
      .hero { padding-top: 42px; }
      h1 { font-size: clamp(2.55rem, 15vw, 4.4rem); }
      .metric-ribbon, .mini-metrics, .readout { grid-template-columns: 1fr; }
      .metric { min-height: 128px; border-right: 0; border-bottom: 1px solid rgba(255,255,255,.16); }
      .metric:last-child { border-bottom: 0; }
      .platform-panel { padding: 24px 18px; }
      .mini-metric { border-bottom: 1px solid var(--rule); }
    }
    @media print {
      body { background: white; color: #0f172a; }
      .shell { width: 100%; padding: 0; }
      .platform-panel, .metric-ribbon { box-shadow: none; break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="masthead">
      <div class="brand"><span class="brand-mark" aria-hidden="true"></span><span>Momentum 360</span></div>
      <div class="source-box"><strong>Verified platform read</strong>${esc(report.sourceStatus)}</div>
    </header>
    <section class="hero">
      <div>
        <div class="chips">${platformChips}</div>
        <h1>${esc(report.client)}</h1>
      </div>
      <div class="period"><span>${esc(report.title)}</span><strong>${esc(period)}</strong></div>
    </section>
    <section class="signal" aria-label="Weekly performance signal"><p>${esc(report.signal)}</p></section>
    <section class="metric-ribbon" aria-label="Key performance indicators">${metricRibbon}</section>
${report.sections.map(renderSection).join("")}
    <section class="readout">
      <article><h2>What this means</h2><p>${esc(report.interpretation)}</p></article>
      <article><h2>Next move</h2><p class="next">${esc(report.next)}</p></article>
    </section>
    <footer>
      <span>Source: authenticated Google Ads and Meta Ads Manager readbacks.</span>
      <span>Meta Jul 26 data remains pending platform latency where noted.</span>
    </footer>
  </main>
</body>
</html>`;
}

for (const report of reports) {
  const outDir = path.join(repo, "clients", report.slug, "deliverables", "2026-07-26-weekly-performance-dashboard");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), render(report), "utf8");
  fs.writeFileSync(path.join(outDir, "source-data.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(outDir, "slack-ready-update.md"), `${report.slack}\n`, "utf8");
}

console.log(`Generated ${reports.length} weekly dashboards.`);
