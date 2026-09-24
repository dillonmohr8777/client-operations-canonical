import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportPath = path.join(root, 'align-hcm-july-2026-attribution-report.html');
const dataPath = path.join(root, 'ytd-company-attribution.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let html = fs.readFileSync(reportPath, 'utf8');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function compactMoney(value) {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 ? 1 : 0)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(amount % 1_000 ? 1 : 0)}K`;
  return money(amount);
}

function friendlyEvidence(value) {
  return String(value ?? '')
    .replaceAll('https://www.', '')
    .replaceAll('https://', '')
    .replaceAll(/\/(?=\s|$)/g, '')
    .replaceAll('native original source:', 'HubSpot source:')
    .replaceAll('original source detail:', 'source detail:')
    .replaceAll('HubSpot first referrer:', 'first referrer:')
    .replaceAll('HubSpot last referrer:', 'last referrer:');
}

function channelClass(channel) {
  if (channel === 'Organic Search') return 'ch-search';
  if (channel === 'Organic Social') return 'ch-social';
  return 'ch-ai';
}

function channelShort(channel) {
  return channel === 'AI Search & Assistants' ? 'AI search' : channel;
}

function renderChannelBadges(channels) {
  return channels.map((channel) => (
    `<span class="channel-tag ${channelClass(channel)}">${escapeHtml(channelShort(channel))}</span>`
  )).join(' ');
}

function renderEvidence(company) {
  const evidence = company.evidence.map(friendlyEvidence).slice(0, 2);
  const recovery = company.recoveredContacts > 0
    ? `<span class="recovery-note">${company.recoveredContacts} contact${company.recoveredContacts === 1 ? '' : 's'} recovered from a non-channel native bucket</span>`
    : '';
  return `<div class="evidence-copy">${evidence.map(escapeHtml).join('<br>')}</div>${recovery}`;
}

function renderDealStatus(company) {
  const lines = [];
  for (const deal of company.wonDeals) {
    lines.push(`<span class="deal-line deal-won"><b>Won</b> ${escapeHtml(deal.name)} · ${money(deal.amount)}</span>`);
  }
  for (const deal of company.openDeals) {
    const amount = deal.amount ? money(deal.amount) : 'amount pending';
    lines.push(`<span class="deal-line deal-open"><b>Open</b> ${escapeHtml(deal.name)} · ${amount}<small>${escapeHtml(deal.stage)}</small></span>`);
  }
  return lines.length ? lines.join('') : '<span class="quiet">No associated won or open deal</span>';
}

function companyRow(company) {
  const isInternal = /^align(?: hcm)?$/i.test(company.company);
  const isUnresolved = company.company === 'Organization not captured';
  const dataChannels = company.channels.map((channel) => (
    channel === 'Organic Search' ? 'search'
      : channel === 'Organic Social' ? 'social'
        : 'ai'
  )).join(' ');
  const hasDeal = company.wonCount + company.openCount > 0 ? 'yes' : 'no';
  const companyNote = isInternal
    ? '<span class="company-note">Internal/self-owned record</span>'
    : isUnresolved
      ? '<span class="company-note">13 records need Company enrichment; two deal-linked records were resolved separately as Haisla and Parrys Pizza.</span>'
      : company.domain
        ? `<span class="company-note">${escapeHtml(company.domain)}</span>`
        : '';
  return `<tr data-company-row data-channel="${dataChannels}" data-deal="${hasDeal}">
    <td class="company-cell"><b>${escapeHtml(company.company)}</b>${companyNote}</td>
    <td>${escapeHtml(company.firstSeen)}</td>
    <td>${renderChannelBadges(company.channels)}<span class="company-note">${company.attributedContacts} attributed contact${company.attributedContacts === 1 ? '' : 's'}</span></td>
    <td>${renderEvidence(company)}</td>
    <td>${renderDealStatus(company)}</td>
  </tr>`;
}

const companyRows = data.companies.map(companyRow).join('\n');
const externalCompanies = data.totals.externalKnownCompanies;
const internalCompanies = data.totals.internalNamedCompanies;
const unpricedOpenDeals = data.companies.reduce(
  (sum, company) => sum + company.openDeals.filter((deal) => !deal.amount).length,
  0,
);

const channelRows = data.channelSummary.map((channel) => `<tr>
  <td><b>${escapeHtml(channel.channel)}</b></td>
  <td class="n">${channel.contacts}</td>
  <td class="n">${channel.companies}</td>
  <td class="n">${channel.recoveredContacts}</td>
  <td class="n">${channel.wonDeals ? `${channel.wonDeals} · ${money(channel.wonRevenue)}` : '—'}</td>
  <td class="n">${channel.openDeals ? `${channel.openDeals} · ${channel.openPipeline ? money(channel.openPipeline) : 'amount pending'}` : '—'}</td>
</tr>`).join('\n');

const offlineRows = data.offline.recordSourceBreakdown.map((row) => `<tr>
  <td><b>${escapeHtml(row.source.replaceAll('_', ' '))}</b></td>
  <td class="n">${row.contacts.toLocaleString('en-US')}</td>
  <td class="n">${(row.contacts / data.offline.contacts * 100).toFixed(1)}%</td>
</tr>`).join('\n');

const additionCss = `
/* BEGIN YTD ATTRIBUTION ADDENDUM CSS */
.ytd-ribbon{margin:32px 0 0;padding:16px 18px;border-radius:14px;background:linear-gradient(100deg,rgba(240,90,40,.17),rgba(18,184,166,.08));box-shadow:0 18px 50px rgba(0,0,0,.18);display:flex;gap:14px;align-items:flex-start}
.ytd-ribbon svg{width:22px;min-width:22px;margin-top:2px;color:var(--orange)}
.ytd-ribbon p{margin:0;color:var(--ink-2);font-size:14px;line-height:1.65}
.ytd-ribbon b{color:var(--ink)}
.ledger-hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(250px,.7fr);gap:22px;align-items:stretch}
.ledger-proof{padding:26px;background:linear-gradient(145deg,rgba(240,90,40,.14),rgba(18,184,166,.07));border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.ledger-proof h3{font-family:var(--head);font-size:clamp(25px,4vw,40px);line-height:1.06;letter-spacing:-.03em;margin:0 0 16px;color:var(--ink)}
.ledger-proof p{margin:0;color:var(--ink-2);font-size:15px;line-height:1.7;max-width:66ch}
.ledger-aside{padding:24px;border-radius:16px;background:rgba(247,240,226,.045)}
.ledger-aside .mini-stat{padding:13px 0;border-bottom:1px solid var(--hairline)}
.ledger-aside .mini-stat:first-child{padding-top:0}.ledger-aside .mini-stat:last-child{padding-bottom:0;border:0}
.mini-stat b{display:block;font-family:var(--head);font-size:25px;letter-spacing:-.02em;color:var(--ink)}
.mini-stat span{display:block;margin-top:3px;font-size:12.5px;color:var(--ink-3)}
.ledger-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:24px 0 12px}
.ledger-search,.ledger-select{min-height:42px;border:1px solid var(--line);border-radius:10px;background:#071522;color:var(--ink);font:600 13px var(--body);padding:10px 13px}
.ledger-search{flex:1 1 280px}.ledger-select{flex:0 1 210px}
.ledger-search::placeholder{color:#aeb7bd}.ledger-search:focus,.ledger-select:focus{outline:2px solid var(--teal);outline-offset:2px}
.ledger-count{margin-left:auto;color:var(--ink-3);font-size:12.5px;font-variant-numeric:tabular-nums}
.company-table{min-width:1080px}.company-table th:nth-child(1){width:17%}.company-table th:nth-child(2){width:9%}.company-table th:nth-child(3){width:16%}.company-table th:nth-child(4){width:31%}.company-table th:nth-child(5){width:27%}
.company-table td{vertical-align:top;font-size:13px;line-height:1.5}
.company-cell b{font-family:var(--head);font-size:14px;color:var(--ink)}
.company-note{display:block;margin-top:5px;color:var(--ink-3);font-size:11.5px;line-height:1.4}
.channel-tag{display:inline-block;margin:0 4px 5px 0;padding:4px 7px;border-radius:6px;font-size:10.5px;font-weight:800;letter-spacing:.025em}
.ch-search{background:rgba(240,90,40,.16);color:#ff9f73}.ch-social{background:rgba(151,112,255,.16);color:#c9b5ff}.ch-ai{background:rgba(18,184,166,.16);color:#6ee4d3}
.evidence-copy{color:var(--ink-2);font-size:12px;line-height:1.55;overflow-wrap:anywhere}
.recovery-note{display:block;margin-top:7px;color:#6ee4d3;font-size:11.5px}
.deal-line{display:block;padding:8px 0;border-bottom:1px solid var(--hairline);color:var(--ink-2)}
.deal-line:last-child{border:0}.deal-line b{display:inline-block;margin-right:5px;color:var(--ink)}
.deal-line small{display:block;margin-top:3px;color:var(--ink-3)}
.deal-won b{color:var(--good)}.deal-open b{color:var(--teal)}.quiet{color:var(--ink-3);font-size:12px}
.source-map{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:26px 0;background:rgba(247,240,226,.035);border-radius:16px;overflow:hidden}
.source-step{padding:22px 20px;min-height:170px;border-right:1px solid var(--hairline)}
.source-step:last-child{border:0}.source-step span{font-family:var(--head);font-weight:800;color:var(--orange);font-size:12px}
.source-step h3{font-family:var(--head);font-size:16px;margin:9px 0 9px;color:var(--ink)}
.source-step p{font-size:12.5px;line-height:1.55;color:var(--ink-3);margin:0}
.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.setting{padding:18px 20px;border-radius:14px;background:rgba(247,240,226,.04)}
.setting h3{font-family:var(--head);font-size:15px;color:var(--ink);margin:0 0 8px}
.setting p{font-size:13px;color:var(--ink-3);line-height:1.55;margin:0}
.setting .state{display:block;margin-top:10px;color:var(--teal);font-size:11.5px;font-weight:800;letter-spacing:.025em;text-transform:uppercase}
.setting .state.pending{color:#ffbd73}
.data-link{display:inline-flex;align-items:center;min-height:40px;margin-top:15px;padding:9px 13px;border-radius:9px;background:var(--orange);color:#2a0f05;font-family:var(--head);font-size:12.5px;font-weight:800;text-decoration:none}
.data-link:hover{filter:brightness(1.08)}.data-link:focus-visible{outline:2px solid var(--teal);outline-offset:3px}
.source-links a{color:var(--teal)}
@media(max-width:760px){.ledger-hero,.settings-grid{grid-template-columns:1fr}.source-map{grid-template-columns:1fr 1fr}.source-step:nth-child(2){border-right:0}.source-step:nth-child(-n+2){border-bottom:1px solid var(--hairline)}.ledger-count{width:100%;margin-left:0}}
@media(max-width:500px){.source-map{grid-template-columns:1fr}.source-step,.source-step:nth-child(2){border-right:0;border-bottom:1px solid var(--hairline)}.source-step:last-child{border-bottom:0}}
@media print{.ledger-controls{display:none}.company-table{min-width:0}.company-table td,.company-table th{font-size:9px}.source-map{break-inside:avoid}}
/* END YTD ATTRIBUTION ADDENDUM CSS */
`;

const ytdSection = `
<!-- BEGIN YTD ATTRIBUTION ADDENDUM -->
<!-- ============ 09 ============ -->
<section id="ytd-attribution">
  <div class="shead"><span class="snum">09</span><h2>The year-to-date company and revenue ledger</h2></div>
  <p class="slede">This is the missing roll-up: every 2026 contact with direct or recovered evidence for organic
  search, organic social, or AI discovery, grouped into companies and reconciled to the deals associated with
  those records. <strong>It is positive, traceable, and intentionally does not count a deal twice.</strong></p>

  <div class="ledger-hero">
    <div class="ledger-proof">
      <h3>Marketing discovery is already attached to revenue — and to live pipeline.</h3>
      <p><b>${data.totals.wonDeals} closed-won engagement worth ${money(data.totals.wonRevenue)}</b> is directly
      connected to this channel cohort. There are also <b>${data.totals.openDeals} currently open deals</b>:
      ${money(data.totals.openPipeline)} is entered today, and ${unpricedOpenDeals} AI-linked deal${unpricedOpenDeals === 1 ? '' : 's'}
      still need an amount. This is an evidence register, not a modeled revenue claim.</p>
      <a class="data-link" href="ytd-company-attribution.csv" download>Download the company ledger</a>
    </div>
    <div class="ledger-aside">
      <div class="mini-stat"><b>${data.totals.attributedContacts}</b><span>YTD contacts with qualifying channel evidence</span></div>
      <div class="mini-stat"><b>${externalCompanies}</b><span>Named external companies in the CRM</span></div>
      <div class="mini-stat"><b>${data.totals.recoveredContacts}</b><span>Contacts recovered from a misleading native source bucket</span></div>
      <div class="mini-stat"><b>${internalCompanies}</b><span>Internal Align company rows retained for source fidelity</span></div>
    </div>
  </div>

  <div class="tscroll" style="margin-top:24px">
    <table>
      <thead><tr><th>Channel</th><th class="n">Contacts</th><th class="n">Company rows</th><th class="n">Recovered</th><th class="n">Closed won</th><th class="n">Open now</th></tr></thead>
      <tbody>${channelRows}</tbody>
    </table>
  </div>

  <div class="grid2">
    <div class="panel"><h3>Organic search has proven commercial value</h3>
      <p>${data.channelSummary[0].contacts} qualifying contacts map to ${data.channelSummary[0].companies} company rows.
      The cohort carries <b>${money(data.channelSummary[0].wonRevenue)} in explicit 2026 closed-won revenue</b> and
      <b>${money(data.channelSummary[0].openPipeline)} in entered open pipeline</b>. The won engagement and current
      open deal are both SmartCare work, reinforcing the July demand signal.</p>
    </div>
    <div class="panel"><h3>AI discovery has crossed into pipeline</h3>
      <p>${data.channelSummary[2].contacts} contacts are tied to AI assistants, resolving to
      ${data.channelSummary[2].companies} company rows. <b>Two associated deals are currently open</b>, one for managed
      payroll and one for SmartRescue. Neither has an amount yet, so the report preserves the pipeline count without
      inventing a value.</p>
    </div>
  </div>

  <div class="ledger-controls" aria-label="Company ledger filters">
    <input class="ledger-search" id="companySearch" type="search" placeholder="Search company, channel, evidence, or deal" aria-label="Search the company ledger">
    <select class="ledger-select" id="channelFilter" aria-label="Filter company ledger">
      <option value="all">All qualifying companies</option>
      <option value="search">Organic search</option>
      <option value="social">Organic social</option>
      <option value="ai">AI search</option>
      <option value="deals">Has won or open deal</option>
    </select>
    <span class="ledger-count" id="companyCount">${data.companies.length} rows shown</span>
  </div>
  <div class="tscroll">
    <table class="company-table">
      <thead><tr><th>Company</th><th>First seen</th><th>Channel</th><th>Attribution evidence</th><th>Won or open deal</th></tr></thead>
      <tbody id="companyRows">${companyRows}</tbody>
    </table>
  </div>
  <p class="fnote">Company names come from HubSpot company associations or the contact Company field. When neither
  existed but a deal was attached, the organization name was recovered from the deal name. No individual contact
  names, emails, phone numbers, or lost-deal detail are included.</p>
</section>

<!-- ============ 10 ============ -->
<section id="offline-recovery">
  <div class="shead"><span class="snum">10</span><h2>What “Offline Sources” means — and how we fix it</h2></div>
  <p class="slede">The Offline bucket is not one broken marketing channel. It is the CRM’s record-entry taxonomy:
  integrations, imports, prospecting extensions, manual creation, meetings, and connected inboxes.
  <strong>GA4 improves the future journey; it cannot manufacture historical browser evidence.</strong></p>

  <div class="tiles">
    <div class="tile"><div class="tile-k">YTD records marked Offline</div><span class="tile-v">${data.offline.contacts.toLocaleString('en-US')}</span><div class="tile-n">Mostly integrations and imports</div></div>
    <div class="tile t-teal"><div class="tile-k">Non-channel records already recovered</div><span class="tile-v">${data.totals.recoveredContacts}</span><div class="tile-n">From referrer, UTM, or latest-touch proof</div></div>
    <div class="tile t-mute"><div class="tile-k">Offline records with deterministic channel proof</div><span class="tile-v">${data.offline.recoveredToRequestedChannels}</span><div class="tile-n">Do not guess or relabel the rest</div></div>
    <div class="tile t-good"><div class="tile-k">Forward attribution fields live</div><span class="tile-v">21</span><div class="tile-n">First/last touch, content and conversion context</div></div>
  </div>

  <div class="grid2">
    <div class="panel">
      <h3>The current Offline population is operational data</h3>
      <div class="tscroll"><table><thead><tr><th>HubSpot record source</th><th class="n">Contacts</th><th class="n">Share</th></tr></thead><tbody>${offlineRows}</tbody></table></div>
    </div>
    <div class="panel"><h3>The right correction is additive, not destructive</h3>
      <p>Keep HubSpot’s native Original Traffic Source untouched for auditability. Add a normalized reporting
      field beside it: <b>Attributed Discovery Channel</b>, plus <b>Attribution Confidence</b> and
      <b>Attribution Evidence</b>. A workflow may populate those fields when referrer, UTM, click ID, social
      platform, or self-reported source provides deterministic proof.</p>
      <p>This preserves the truth of how a record entered HubSpot while still giving marketing an accurate
      channel view.</p>
    </div>
  </div>

  <div class="source-map" aria-label="Offline source remediation sequence">
    <div class="source-step"><span>STEP 1 · LIVE</span><h3>Capture every forward touch</h3><p>First and last UTM, referrer, landing page, social platform, click IDs, conversion type, content and CTA are now written at conversion.</p></div>
    <div class="source-step"><span>STEP 2 · HUBSPOT</span><h3>Normalize beside the native source</h3><p>Create the reporting channel, confidence and evidence properties. Never overwrite Original Traffic Source.</p></div>
    <div class="source-step"><span>STEP 3 · WORKFLOW</span><h3>Recover only what can be proved</h3><p>Classify Google/Bing, LinkedIn and AI assistants from deterministic values. Leave every unsupported record unresolved.</p></div>
    <div class="source-step"><span>STEP 4 · REVENUE</span><h3>Carry evidence into the deal</h3><p>Require a primary contact and copy the opportunity-source fields at deal creation so attribution survives through Closed Won.</p></div>
  </div>

  <div class="call c-good">
    <h4>What changes now that GA4 is live</h4>
    <p>From July 30 forward, GA4 supplies the behavioral layer: landing pages, engaged sessions, content depth,
    CTA clicks, meeting starts, form success, and assisted paths. HubSpot remains the revenue system of record.
    The join is the campaign/referrer/click evidence stored on the contact — not a rewrite of historical Offline
    values.</p>
  </div>
</section>

<!-- ============ 11 ============ -->
<section id="measurement-stack">
  <div class="shead"><span class="snum">11</span><h2>The deeper measurement stack is now in place</h2></div>
  <p class="slede">Google Analytics now aids the attribution path exactly where HubSpot is weakest: behavior
  before conversion. HubSpot keeps the company, lifecycle, deal, stage, and revenue truth.
  <strong>Together they create a full forward-looking path; neither tool can backfill events it never received.</strong></p>

  <div class="tiles">
    <div class="tile t-good"><div class="tile-k">Correct GA4 stream live</div><span class="tile-v">G-0Y6</span><div class="tile-n">G-0Y6LQTTBRJ verified in realtime</div></div>
    <div class="tile t-teal"><div class="tile-k">Data retention</div><span class="tile-v">14<small>mo</small></span><div class="tile-n">Events and users</div></div>
    <div class="tile"><div class="tile-k">Registered attribution dimensions</div><span class="tile-v">7</span><div class="tile-n">Channel, form, content and resource context</div></div>
    <div class="tile"><div class="tile-k">Search Console baseline</div><span class="tile-v">6,368</span><div class="tile-n">Impressions across Jul 27 to 29</div></div>
  </div>

  <div class="settings-grid">
    <div class="setting"><h3>GA4 collection and enhanced measurement</h3><p>The correct stream is deployed on the live HubSpot site; realtime users verified collection. Enhanced measurement is enabled and duplicate automatic form interactions are disabled.</p><span class="state">Confirmed live</span></div>
    <div class="setting"><h3>Search Console linked to GA4</h3><p>The verified URL-prefix property for alignhcm.com is linked. Its first visible baseline contained 64 clicks, 6,368 impressions, 1.0% CTR and average position 17 across July 27 to 29.</p><span class="state">Confirmed linked</span></div>
    <div class="setting"><h3>GA4 business key event</h3><p><code>generate_lead</code> should become the primary key event after GA4 observes the first real occurrence. Keep <code>form_submitted</code> informational so one submission is not counted twice.</p><span class="state pending">Pending first observed event</span></div>
    <div class="setting"><h3>HubSpot pipeline-stage metadata</h3><p>Expressing Interest is still internally flagged as closed in three live pipelines. Reporting now overrides that defect by reading the explicit stage label, but the pipeline metadata should be corrected at the source.</p><span class="state pending">Admin correction needed</span></div>
    <div class="setting"><h3>Private-app analytics and social scopes</h3><p>The current terminal token can read CRM and CMS records, but the social endpoints return a missing-scope response and traffic/session analytics remain unavailable through this route. Add read scopes for social, analytics/traffic, forms/events, campaigns and marketing events.</p><span class="state pending">Reauthorization needed</span></div>
    <div class="setting"><h3>Native HubSpot content connection</h3><p>Reauthorize the connected HubSpot app for campaigns, site pages, blog posts, landing pages and marketing events. Connect the LinkedIn company page in Marketing &gt; Social to retrieve company-page impressions, clicks, interactions and audience metrics where the subscription supports them. HubSpot does not provide the full personal-profile impression and audience view for Maher; retain LinkedIn’s native export for that layer.</p><span class="state pending">Portal connection needed</span></div>
    <div class="setting"><h3>Programmatic GA4 retrieval</h3><p>For durable scheduled reporting, add a Google Analytics Data API credential or BigQuery export. The browser property is configured, but a programmatic read identity is still needed for unattended session and event retrieval.</p><span class="state pending">Data API path needed</span></div>
    <div class="setting"><h3>Revenue attribution dataset</h3><p>Build one reporting dataset keyed by contact, company and deal: native source, normalized channel, first touch, lead-creation touch, assists, opportunity source, stage and amount. The CSV delivered with this report is the first company-level snapshot.</p><span class="state">Snapshot delivered</span></div>
  </div>

  <div class="call c-teal">
    <h4>The practical answer: yes, Google Analytics helps — from this point forward</h4>
    <p>GA4 can now explain what anonymous visitors did before they became known contacts. Search Console explains
    what Google queries and pages created the click. HubSpot explains which company the person belongs to and
    whether the journey became pipeline or revenue. The next reporting cycle can join those three layers without
    pretending that pre-activation GA4 history exists.</p>
  </div>
</section>
<!-- END YTD ATTRIBUTION ADDENDUM -->
`;

const searchConsoleSection = `
<!-- ============ 08 ============ -->
<section>
  <div class="shead"><span class="snum">08</span><h2>Search visibility now has a verified baseline</h2></div>
  <p class="slede">Search Console is linked to GA4. The accessible property begins on July 27, so this is a
  three-day baseline rather than a full-month trend. <strong>It already shows meaningful demand across service,
  integration, implementation and buyer-guide content.</strong></p>
  <div class="tiles">
    <div class="tile"><div class="tile-k">Organic clicks</div><span class="tile-v">64</span><div class="tile-n">July 27 to 29</div></div>
    <div class="tile t-teal"><div class="tile-k">Search impressions</div><span class="tile-v">6,368</span><div class="tile-n">More than 2,100 per day</div></div>
    <div class="tile"><div class="tile-k">Click-through rate</div><span class="tile-v">1.0<small>%</small></span><div class="tile-n">Immediate optimization headroom</div></div>
    <div class="tile"><div class="tile-k">Average position</div><span class="tile-v">17</span><div class="tile-n">Many terms within striking distance</div></div>
  </div>
  <div class="tscroll">
    <table><thead><tr><th>Date</th><th class="n">Clicks</th><th class="n">Impressions</th></tr></thead>
      <tbody><tr><td><b>Jul 27</b></td><td class="n">19</td><td class="n">2,134</td></tr>
      <tr><td><b>Jul 28</b></td><td class="n">24</td><td class="n">2,182</td></tr>
      <tr><td><b>Jul 29</b></td><td class="n">21</td><td class="n">2,052</td></tr>
      <tr><td><b>Three-day baseline</b></td><td class="n"><b>64</b></td><td class="n"><b>6,368</b></td></tr></tbody>
    </table>
  </div>
  <div class="grid2">
    <div class="panel"><h3>Pages already winning clicks</h3><p>The homepage, Careers, the Strategic Buyer’s Guide to UKG, the UKG partner page and About led the first visible click set.</p></div>
    <div class="panel"><h3>The clearest near-term opportunity</h3><p>High-impression topics with limited clicks include Workday implementation, HCM integration and services, HR data integration, HRIS implementation checklists, data migration and HCM implementation challenges. These are the titles and snippets most worth tightening first.</p></div>
  </div>
</section>`;

const additionScript = `
<!-- BEGIN YTD ATTRIBUTION ADDENDUM SCRIPT -->
<script>
(function(){
  var search = document.getElementById("companySearch");
  var filter = document.getElementById("channelFilter");
  var count = document.getElementById("companyCount");
  var rows = Array.prototype.slice.call(document.querySelectorAll("[data-company-row]"));
  if(!search || !filter || !count) return;
  function applyLedgerFilter(){
    var query = search.value.trim().toLowerCase();
    var selected = filter.value;
    var shown = 0;
    rows.forEach(function(row){
      var textMatch = !query || row.textContent.toLowerCase().indexOf(query) !== -1;
      var filterMatch = selected === "all"
        || (selected === "deals" && row.dataset.deal === "yes")
        || (row.dataset.channel || "").split(" ").indexOf(selected) !== -1;
      row.hidden = !(textMatch && filterMatch);
      if(!row.hidden) shown += 1;
    });
    count.textContent = shown + (shown === 1 ? " row shown" : " rows shown");
  }
  search.addEventListener("input", applyLedgerFilter);
  filter.addEventListener("change", applyLedgerFilter);
})();
</script>
<!-- END YTD ATTRIBUTION ADDENDUM SCRIPT -->
`;

const cssPattern = /\/\* BEGIN YTD ATTRIBUTION ADDENDUM CSS \*\/[\s\S]*?\/\* END YTD ATTRIBUTION ADDENDUM CSS \*\//;
if (cssPattern.test(html)) {
  html = html.replace(cssPattern, additionCss.trim());
} else {
  html = html.replace('</style>', `${additionCss}\n</style>`);
}

const sectionPattern = /<!-- BEGIN YTD ATTRIBUTION ADDENDUM -->[\s\S]*?<!-- END YTD ATTRIBUTION ADDENDUM -->/;
if (sectionPattern.test(html)) {
  html = html.replace(sectionPattern, ytdSection.trim());
} else {
  html = html.replace('<footer class="foot">', `${ytdSection}\n\n<footer class="foot">`);
}

const scriptPattern = /<!-- BEGIN YTD ATTRIBUTION ADDENDUM SCRIPT -->[\s\S]*?<!-- END YTD ATTRIBUTION ADDENDUM SCRIPT -->/;
if (scriptPattern.test(html)) {
  html = html.replace(scriptPattern, additionScript.trim());
} else {
  html = html.replace('</body>', `${additionScript}\n</body>`);
}

html = html.replace(
  /<!-- ============ 08 ============ -->\s*<section>[\s\S]*?<\/section>\s*(?=<footer class="foot">|<!-- BEGIN YTD ATTRIBUTION ADDENDUM -->)/,
  searchConsoleSection.trim(),
);

html = html
  .replace('July brought in <strong>91 new contact records</strong>', 'July brought in <strong>96 new contact records</strong>')
  .replace(
    'This is what July\n  produced, what those buyers are asking for, and what we shipped to earn them.',
    'This is what July produced, what those buyers are asking for, what we shipped to earn them, and how the full 2026 channel cohort connects to companies, open pipeline, and won revenue.',
  )
  .replace(
    'Connecting Search Console adds clicks, impressions and position on top of that, and is the step that\n      turns discovery evidence into ranking data. AI citation counting follows from the same export.',
    'Search Console is now connected and adds clicks, impressions and position to the attribution path. August will be the first full month where clean site capture, GA4 behavior and verified Google Search data can be read together.',
  )
  .replace(
    '<span>Data pulled <b>Jul 30, 2026 · 11:10 UTC</b></span>',
    `<span>CRM reconciled <b>${new Date(data.generatedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC</b></span>`,
  )
  .replace(
    '<p><b style="color:var(--ink-2)">Sources.</b> HubSpot CRM portal 242825734, pulled July 30, 2026 at 11:10 UTC.',
    `<p><b style="color:var(--ink-2)">Sources.</b> HubSpot CRM portal 242825734, company and deal records reconciled ${new Date(data.generatedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC.`,
  )
  .replace(
    /<p><b style="color:var\(--ink-2\)">Scope notes\.<\/b>[\s\S]*?<\/p>/,
    `<p><b style="color:var(--ink-2)">Scope notes.</b> No individual contact details or lost-deal register appear in this report. The YTD company ledger uses contacts created January 1 through July 30 with direct or recovered evidence for organic search, organic social, or AI assistants. GA4 began correct collection on July 30 and cannot backfill historical sessions or events. Search Console is linked, but the accessible property presently begins July 27.</p>`,
  )
  .replace(
    '<p><b style="color:var(--ink-2)">Scope notes.</b> This report is aggregate only and contains no individual',
    '<p><b style="color:var(--ink-2)">Scope notes.</b> This report is aggregate only and contains no individual',
  );

if (!html.includes('class="source-links"')) {
  html = html.replace(
    '<p style="margin-top:16px">Align HCM · Human Capital Management · monthly attribution report</p>',
    `<p class="source-links"><b style="color:var(--ink-2)">Configuration references.</b>
    <a href="https://knowledge.hubspot.com/reports/understand-source-properties">HubSpot traffic-source properties</a> ·
    <a href="https://knowledge.hubspot.com/social/analyze-social-reports">HubSpot social reporting</a> ·
    <a href="https://knowledge.hubspot.com/social/connect-your-social-media-accounts-to-hubspot">HubSpot social connections</a></p>
    <p style="margin-top:16px">Align HCM · Human Capital Management · monthly attribution report</p>`,
  );
}

const mojibake = new Map([
  ['Â·', '·'],
  ['Â©', '©'],
  ['â€”', '—'],
  ['â€“', '–'],
  ['â€™', '’'],
  ['â€˜', '‘'],
  ['â€œ', '“'],
  ['â€', '”'],
  ['â–²', '▲'],
  ['â–¼', '▼'],
  ['â—', '●'],
]);
for (const [bad, good] of mojibake) html = html.replaceAll(bad, good);

fs.writeFileSync(reportPath, html, 'utf8');

console.log(JSON.stringify({
  reportPath,
  bytes: fs.statSync(reportPath).size,
  companyRows: data.companies.length,
  externalCompanies,
  totals: data.totals,
}, null, 2));
