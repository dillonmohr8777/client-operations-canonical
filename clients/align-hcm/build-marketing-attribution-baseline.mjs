import fs from 'node:fs';
import path from 'node:path';

const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
if (!token) throw new Error('HUBSPOT_PRIVATE_APP_TOKEN is required');

const portalId = '242825734';
const root = process.cwd();
const outDir = path.join(root, 'attribution');
const auditPath = 'C:/Users/dillo/Documents/Codex/2026-07-15/what-s-my-hubspot-token-again/outputs/align-hcm-forms/2026-07-15T17-30-36-275Z.json';
const qualificationPath = 'C:/Users/dillo/Documents/Codex/2026-07-15/what-s-my-hubspot-token-again/outputs/align-hcm-lead-intelligence/2026-07-15-ytd-lead-intelligence-report.json';
const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
const qualification = JSON.parse(fs.readFileSync(qualificationPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const programStart = new Date('2026-04-01T00:00:00-04:00');
const ownedWorkLedger = [
  { date: '2026-04-01', channel: 'social', initiative: 'April and May LinkedIn calendars across five Align profiles', evidence: 'Local operating files document completed calendars and cadence', ownership: 'confirmed deliverable; publication not yet verified' },
  { date: '2026-06-16', channel: 'seo_content', initiative: 'Large HubSpot content refresh window begins', evidence: '64 published blog posts show updates within the subsequent 30-day window', ownership: 'HubSpot change verified; individual-editor ownership not exposed' },
  { date: '2026-07-02', channel: 'website', initiative: 'Homepage and broker-page update cluster', evidence: 'HubSpot site-page update timestamps', ownership: 'HubSpot change verified; individual-editor ownership not exposed' },
  { date: '2026-07-10', channel: 'seo_content', initiative: 'SEO blog update batch and public-sector microsites', evidence: 'HubSpot blog timestamps plus local deployed microsite artifacts', ownership: 'microsites confirmed; main-site editor ownership not exposed' },
  { date: '2026-07-14', channel: 'seo_content', initiative: 'Payroll implementation thought-leadership post', evidence: 'HubSpot published post and local publish package', ownership: 'strong local evidence' },
];

async function hs(endpoint, options = {}, attempt = 0) {
  const response = await fetch(`https://api.hubapi.com${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (response.status === 429 && attempt < 5) {
    await new Promise((resolve) => setTimeout(resolve, (Number(response.headers.get('retry-after')) || attempt + 1) * 1000));
    return hs(endpoint, options, attempt + 1);
  }
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 300) }; }
  if (!response.ok) throw new Error(`HubSpot ${response.status} for ${endpoint}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function listAll(endpoint, limit = 100) {
  const results = [];
  let after;
  do {
    const separator = endpoint.includes('?') ? '&' : '?';
    const page = await hs(`${endpoint}${separator}limit=${limit}${after ? `&after=${encodeURIComponent(after)}` : ''}`);
    results.push(...(page.results || []));
    after = page.paging?.next?.after;
  } while (after);
  return results;
}

const contactProperties = [
  'email','firstname','lastname','company','createdate','lifecyclestage','hs_lead_status',
  'hs_analytics_source','hs_analytics_source_data_1','hs_analytics_source_data_2',
  'hs_latest_source','hs_latest_source_data_1','hs_latest_source_data_2','hs_latest_source_timestamp',
  'hs_analytics_first_referrer','hs_analytics_first_timestamp','hs_analytics_first_url','hs_analytics_first_visit_timestamp',
  'hs_analytics_last_referrer','hs_analytics_last_timestamp','hs_analytics_last_url','hs_analytics_last_visit_timestamp',
  'hs_analytics_first_touch_converting_campaign','hs_analytics_last_touch_converting_campaign',
  'first_conversion_date','first_conversion_event_name','recent_conversion_date','recent_conversion_event_name',
  'hs_analytics_num_page_views','hs_analytics_num_visits','hs_social_linkedin_clicks','hs_social_facebook_clicks',
  'hs_social_twitter_clicks','hs_social_num_broadcast_clicks','hs_social_last_engagement',
  'hs_v2_date_entered_opportunity','hs_v2_date_entered_customer','hs_latest_qualified_lead_date',
];
const dealProperties = ['dealname','amount','closedate','dealstage','pipeline','hs_is_closed_won','hs_is_closed','createdate','lead_source','dealtype'];

const pipelines = await hs('/crm/v3/pipelines/deals');
const pipelineLabels = new Map();
const stageLabels = new Map();
const closedStages = new Set();
for (const p of pipelines.results || []) {
  pipelineLabels.set(p.id, p.label);
  for (const s of p.stages || []) {
    stageLabels.set(s.id, s.label);
    if (s.metadata?.isClosed === 'true' || s.metadata?.isClosed === true) closedStages.add(s.id);
  }
}

const contentItems = [];
for (const [type, endpoint] of [
  ['blog', '/cms/v3/blogs/posts?archived=false'],
  ['site_page', '/cms/v3/pages/site-pages?archived=false'],
  ['landing_page', '/cms/v3/pages/landing-pages?archived=false'],
]) {
  try {
    for (const item of await listAll(endpoint)) {
      contentItems.push({ type, id: item.id, name: item.name || item.htmlTitle || item.slug, url: item.url || item.absoluteUrl, updated: item.updated || item.updatedAt || item.publishDate, publishDate: item.publishDate, state: item.state, currentlyPublished: item.currentlyPublished });
    }
  } catch (error) {
    contentItems.push({ type, error: error.message });
  }
}
const contentByUrl = new Map(contentItems.filter((x) => x.url).map((x) => [normalizeUrl(x.url), x]));

function normalizeUrl(value) {
  if (!value) return '';
  try {
    const u = new URL(value);
    return `${u.hostname.replace(/^www\./, '')}${u.pathname.replace(/\/$/, '') || '/'}`.toLowerCase();
  } catch { return String(value).toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/$/, ''); }
}
function n(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function isoDate(value) { return value ? new Date(value).toISOString().slice(0, 10) : ''; }
function money(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0); }
function md(v) { return String(v ?? '').replaceAll('|', '\\|').replaceAll(/\r?\n/g, ' ').trim(); }

const buyerRows = qualification.rows.filter((r) => r.classification === 'Buyer lead');
const submissionsByEmail = new Map();
for (const s of audit.submissions) {
  const email = String(s.email || '').toLowerCase();
  if (!submissionsByEmail.has(email)) submissionsByEmail.set(email, []);
  submissionsByEmail.get(email).push(s);
}

const contactCache = new Map();
const dealCache = new Map();
async function getContact(id) {
  if (!contactCache.has(id)) contactCache.set(id, await hs(`/crm/v3/objects/contacts/${id}?properties=${encodeURIComponent(contactProperties.join(','))}&associations=deals`));
  return contactCache.get(id);
}
async function getDeal(id) {
  if (!dealCache.has(id)) dealCache.set(id, await hs(`/crm/v3/objects/deals/${id}?properties=${encodeURIComponent(dealProperties.join(','))}`));
  return dealCache.get(id);
}

const journeys = [];
for (const lead of buyerRows) {
  const submissions = submissionsByEmail.get(lead.email.toLowerCase()) || [];
  const contactId = submissions.map((s) => s.contactId).find(Boolean);
  let contact = null;
  let error = null;
  try { if (contactId) contact = await getContact(contactId); } catch (e) { error = e.message; }
  const p = contact?.properties || {};
  const dealIds = (contact?.associations?.deals?.results || []).map((d) => d.id);
  const deals = [];
  for (const id of dealIds) {
    try {
      const d = await getDeal(id);
      deals.push({
        id, name: d.properties?.dealname, amount: n(d.properties?.amount), createdate: d.properties?.createdate,
        closedate: d.properties?.closedate, pipeline: pipelineLabels.get(d.properties?.pipeline) || d.properties?.pipeline,
        stage: stageLabels.get(d.properties?.dealstage) || d.properties?.dealstage,
        isClosedWon: d.properties?.hs_is_closed_won === 'true', isClosed: closedStages.has(d.properties?.dealstage),
        leadSource: d.properties?.lead_source || '', dealType: d.properties?.dealtype || '',
      });
    } catch (e) { deals.push({ id, error: e.message }); }
  }
  const submittedAt = submissions.map((s) => s.submittedAt).sort()[0] || lead.firstSubmittedAt;
  const submissionPage = submissions.map((s) => s.pageUrl).find(Boolean) || '';
  const sourceText = [p.hs_analytics_source, p.hs_analytics_source_data_1, p.hs_analytics_source_data_2, p.hs_latest_source, p.hs_latest_source_data_1, p.hs_latest_source_data_2, p.hs_analytics_first_referrer, p.hs_analytics_last_referrer].filter(Boolean).join(' | ');
  const socialClicks = n(p.hs_social_linkedin_clicks) + n(p.hs_social_facebook_clicks) + n(p.hs_social_twitter_clicks) + n(p.hs_social_num_broadcast_clicks);
  const socialDirect = /SOCIAL|linkedin|facebook|twitter|x\.com/i.test(sourceText) || socialClicks > 0;
  const aiDirect = /AI_REFERRALS|chatgpt|perplexity|gemini|copilot|claude/i.test(sourceText) || /utm_source=(chatgpt|perplexity|gemini|copilot|claude)/i.test(p.hs_analytics_first_url || '');
  const organicDirect = /ORGANIC_SEARCH|google|bing|search/i.test(sourceText);
  const campaignDirect = Boolean(p.hs_analytics_first_touch_converting_campaign || p.hs_analytics_last_touch_converting_campaign);
  const pageRecord = contentByUrl.get(normalizeUrl(submissionPage));
  const pageUpdatedBeforeConversion = Boolean(pageRecord?.updated && new Date(pageRecord.updated) >= programStart && new Date(pageRecord.updated) <= new Date(submittedAt));
  const firstUrlRecord = contentByUrl.get(normalizeUrl(p.hs_analytics_first_url));
  const firstUrlUpdatedBeforeVisit = Boolean(firstUrlRecord?.updated && p.hs_analytics_first_visit_timestamp && new Date(firstUrlRecord.updated) >= programStart && new Date(firstUrlRecord.updated) <= new Date(p.hs_analytics_first_visit_timestamp));
  let evidenceTier = 'Unattributed';
  let contributionWeight = 0;
  let contributionReason = 'No source, campaign, social-click, or owned-page evidence ties this lead to the documented marketing work.';
  if (aiDirect) {
    evidenceTier = 'Direct AI/AEO evidence'; contributionWeight = 1;
    contributionReason = 'HubSpot records an AI referral and a traceable AI-tagged landing-page visit.';
  } else if (socialDirect) {
    evidenceTier = 'Direct social evidence'; contributionWeight = 1;
    contributionReason = 'HubSpot source/referrer or tracked social clicks identify a social touch.';
  } else if (organicDirect && (firstUrlUpdatedBeforeVisit || pageUpdatedBeforeConversion)) {
    evidenceTier = 'Direct SEO/content evidence'; contributionWeight = 1;
    contributionReason = 'Organic acquisition and an updated Align content/page touch occurred after the documented program began.';
  } else if (campaignDirect) {
    evidenceTier = 'Direct campaign evidence'; contributionWeight = 1;
    contributionReason = 'HubSpot records a converting campaign touch.';
  } else if (pageUpdatedBeforeConversion || firstUrlUpdatedBeforeVisit) {
    evidenceTier = 'Website/content assisted'; contributionWeight = 0.5;
    contributionReason = 'The journey used a page updated during the program before conversion, but acquisition source is not provably ours.';
  } else if (new Date(submittedAt) >= programStart) {
    evidenceTier = 'Temporal contribution only'; contributionWeight = 0.25;
    contributionReason = 'Lead arrived during the marketing program, but HubSpot lacks a traceable owned touchpoint.';
  }
  const openDeals = deals.filter((d) => !d.isClosed && !d.error);
  const wonDeals = deals.filter((d) => d.isClosedWon && !d.error);
  const totalDealAmount = deals.filter((d) => !d.error).reduce((sum, d) => sum + d.amount, 0);
  const openPipelineAmount = openDeals.reduce((sum, d) => sum + d.amount, 0);
  const wonAmount = wonDeals.reduce((sum, d) => sum + d.amount, 0);
  journeys.push({
    email: lead.email, name: lead.name, company: lead.company, score: lead.score, fit: lead.fit, submittedAt, submissionPage,
    contactId, lifecycleStage: p.lifecyclestage || lead.lifecycleStage || '', leadStatus: p.hs_lead_status || '',
    originalSource: p.hs_analytics_source || '', originalDrilldown1: p.hs_analytics_source_data_1 || '', originalDrilldown2: p.hs_analytics_source_data_2 || '',
    latestSource: p.hs_latest_source || '', latestDrilldown1: p.hs_latest_source_data_1 || '', latestDrilldown2: p.hs_latest_source_data_2 || '',
    firstReferrer: p.hs_analytics_first_referrer || '', firstUrl: p.hs_analytics_first_url || '', firstVisit: p.hs_analytics_first_visit_timestamp || '',
    lastReferrer: p.hs_analytics_last_referrer || '', lastUrl: p.hs_analytics_last_url || '', lastVisit: p.hs_analytics_last_visit_timestamp || '',
    firstCampaign: p.hs_analytics_first_touch_converting_campaign || '', lastCampaign: p.hs_analytics_last_touch_converting_campaign || '',
    firstConversion: p.first_conversion_event_name || '', firstConversionDate: p.first_conversion_date || '',
    sessions: n(p.hs_analytics_num_visits), pageviews: n(p.hs_analytics_num_page_views), socialClicks,
    contentMatch: pageRecord || firstUrlRecord || null, evidenceTier, contributionWeight, contributionReason,
    deals, dealCount: deals.length, totalDealAmount, openPipelineAmount, wonAmount,
    weightedOpenPipelineContribution: openPipelineAmount * contributionWeight,
    weightedWonContribution: wonAmount * contributionWeight,
    error,
  });
}

const byTier = Object.entries(Object.groupBy(journeys, (j) => j.evidenceTier)).map(([tier, xs]) => ({
  tier, leads: xs.length, deals: xs.reduce((s, x) => s + x.dealCount, 0),
  openPipeline: xs.reduce((s, x) => s + x.openPipelineAmount, 0), wonRevenue: xs.reduce((s, x) => s + x.wonAmount, 0),
  weightedOpenPipeline: xs.reduce((s, x) => s + x.weightedOpenPipelineContribution, 0), weightedWon: xs.reduce((s, x) => s + x.weightedWonContribution, 0),
}));
const totals = {
  qualifiedBuyerLeads: journeys.length,
  leadsSinceProgramStart: journeys.filter((j) => new Date(j.submittedAt) >= programStart).length,
  leadsWithDirectEvidence: journeys.filter((j) => j.contributionWeight === 1).length,
  leadsWithAssistedEvidence: journeys.filter((j) => j.contributionWeight === 0.5).length,
  leadsWithTemporalOnly: journeys.filter((j) => j.contributionWeight === 0.25).length,
  leadsUnattributed: journeys.filter((j) => j.contributionWeight === 0).length,
  associatedDeals: journeys.reduce((s, j) => s + j.dealCount, 0),
  openPipeline: journeys.reduce((s, j) => s + j.openPipelineAmount, 0),
  wonRevenue: journeys.reduce((s, j) => s + j.wonAmount, 0),
  evidenceWeightedOpenPipelineContribution: journeys.reduce((s, j) => s + j.weightedOpenPipelineContribution, 0),
  evidenceWeightedWonContribution: journeys.reduce((s, j) => s + j.weightedWonContribution, 0),
};

// Whole-pipeline cohort view. This prevents a form-only analysis from being mistaken for total pipeline attribution.
const allDealItems = await listAll(`/crm/v3/objects/deals?archived=false&properties=${encodeURIComponent(dealProperties.join(','))}&associations=contacts`, 100);
const journeyByContactId = new Map(journeys.filter((j) => j.contactId).map((j) => [String(j.contactId), j]));
const pipelineDeals = [];
for (const d of allDealItems) {
  const created = d.properties?.createdate ? new Date(d.properties.createdate) : null;
  if (!created || created < new Date('2026-01-01T00:00:00-05:00')) continue;
  const contactIds = (d.associations?.contacts?.results || []).map((x) => String(x.id));
  const contacts = [];
  for (const id of contactIds) {
    try {
      const c = await getContact(id);
      const p = c.properties || {};
      const knownJourney = journeyByContactId.get(id);
      const sourceText = [p.hs_analytics_source,p.hs_analytics_source_data_1,p.hs_analytics_source_data_2,p.hs_latest_source,p.hs_latest_source_data_1,p.hs_latest_source_data_2,p.hs_analytics_first_referrer].filter(Boolean).join(' | ');
      let weight = knownJourney?.contributionWeight || 0;
      let evidence = knownJourney?.evidenceTier || 'Unattributed';
      if (!knownJourney && created >= programStart) {
        if (/AI_REFERRALS|chatgpt|perplexity|gemini|copilot|claude/i.test(sourceText)) { weight = 1; evidence = 'Direct AI/AEO evidence'; }
        else if (/SOCIAL_MEDIA|linkedin|facebook|twitter|x\.com/i.test(sourceText)) { weight = 1; evidence = 'Direct social evidence'; }
        else if (p.hs_analytics_first_touch_converting_campaign || p.hs_analytics_last_touch_converting_campaign) { weight = 1; evidence = 'Direct campaign evidence'; }
        else if (/ORGANIC_SEARCH/i.test(sourceText)) { weight = 0.25; evidence = 'Organic source; ownership unproven'; }
      }
      contacts.push({ id, email: p.email || '', originalSource: p.hs_analytics_source || '', sourceDetail: p.hs_analytics_source_data_1 || '', evidence, weight });
    } catch (e) { contacts.push({ id, error: e.message, evidence: 'Unattributed', weight: 0 }); }
  }
  const weight = contacts.length ? Math.max(...contacts.map((c) => c.weight || 0)) : 0;
  const stageId = d.properties?.dealstage;
  const isClosed = closedStages.has(stageId);
  const isWon = d.properties?.hs_is_closed_won === 'true';
  const amount = n(d.properties?.amount);
  pipelineDeals.push({
    id: d.id, name: d.properties?.dealname || '', createdate: d.properties?.createdate, amount,
    pipeline: pipelineLabels.get(d.properties?.pipeline) || d.properties?.pipeline,
    stage: stageLabels.get(stageId) || stageId, isClosed, isWon, contactIds, contacts,
    evidenceWeight: weight, attributedAmount: amount * weight,
  });
}
function cohort(label, start, end) {
  const xs = pipelineDeals.filter((d) => new Date(d.createdate) >= start && new Date(d.createdate) < end);
  const open = xs.filter((d) => !d.isClosed);
  const won = xs.filter((d) => d.isWon);
  const lost = xs.filter((d) => d.isClosed && !d.isWon);
  return {
    label, start: start.toISOString(), end: end.toISOString(), deals: xs.length,
    dealsWithContacts: xs.filter((d) => d.contactIds.length).length,
    openDeals: open.length, openPipeline: open.reduce((s, d) => s + d.amount, 0),
    wonDeals: won.length, wonRevenue: won.reduce((s, d) => s + d.amount, 0),
    lostDeals: lost.length, lostAmount: lost.reduce((s, d) => s + d.amount, 0),
    directOrAssistedDeals: xs.filter((d) => d.evidenceWeight >= 0.5).length,
    evidenceWeightedOpenPipeline: open.reduce((s, d) => s + d.attributedAmount, 0),
    evidenceWeightedWonRevenue: won.reduce((s, d) => s + d.attributedAmount, 0),
  };
}
const now = new Date();
const pipelineCohorts = [
  cohort('Pre-program YTD', new Date('2026-01-01T00:00:00-05:00'), programStart),
  cohort('Documented program period', programStart, new Date(now.getTime() + 1)),
];
const preCohort = pipelineCohorts[0];
const postCohort = pipelineCohorts[1];
const preDays = (new Date(preCohort.end) - new Date(preCohort.start)) / 86400000;
const postDays = (new Date(postCohort.end) - new Date(postCohort.start)) / 86400000;
const programAssessment = {
  openPipelineChange: postCohort.openPipeline - preCohort.openPipeline,
  openPipelineChangePct: preCohort.openPipeline ? ((postCohort.openPipeline / preCohort.openPipeline) - 1) * 100 : null,
  openDealChangePct: preCohort.openDeals ? ((postCohort.openDeals / preCohort.openDeals) - 1) * 100 : null,
  preDealCreationRatePer30Days: preCohort.deals / preDays * 30,
  postDealCreationRatePer30Days: postCohort.deals / postDays * 30,
  dealCreationRateChangePct: ((postCohort.deals / postDays) / (preCohort.deals / preDays) - 1) * 100,
  provenOwnedPipeline: pipelineDeals.filter((d) => new Date(d.createdate) >= programStart && !d.isClosed && d.evidenceWeight === 1).reduce((s, d) => s + d.amount, 0),
  evidenceWeightedPipeline: postCohort.evidenceWeightedOpenPipeline,
  evidenceWeightedSharePct: postCohort.openPipeline ? postCohort.evidenceWeightedOpenPipeline / postCohort.openPipeline * 100 : 0,
  postDealsWithoutContacts: postCohort.deals - postCohort.dealsWithContacts,
};

const table = (rows, cols) => [
  `| ${cols.map((c) => c[0]).join(' | ')} |`, `| ${cols.map(() => '---').join(' | ')} |`,
  ...rows.map((r) => `| ${cols.map((c) => md(typeof c[1] === 'function' ? c[1](r) : r[c[1]])).join(' | ')} |`),
].join('\n');

const report = `# Align HCM Marketing Contribution Baseline\n\n` +
`Generated ${new Date().toISOString()} from live HubSpot CRM data. Private internal analysis. No external actions taken.\n\n` +
`## Executive conclusion\n\n` +
`The current CRM can prove that the website is the conversion surface for the qualified form leads, but it **cannot yet prove that Dillon's social, SEO, or website optimization work created a specific dollar amount of pipeline**. HubSpot's session-level traffic API is blocked, campaign/UTM coverage is incomplete, and most buyer contacts do not have complete journey data.\n\n` +
`Using a conservative evidence-weighted model beginning April 1, 2026, the system found ${totals.leadsSinceProgramStart} qualified buyer leads during the documented marketing program. Direct, assisted, temporal, and unattributed counts are shown below. Dollar attribution is limited to HubSpot deals actually associated with those contacts.\n\n` +
`## Current attribution result\n\n` +
`- Qualified buyer leads reviewed: **${totals.qualifiedBuyerLeads}**\n` +
`- Buyer leads since documented program start: **${totals.leadsSinceProgramStart}**\n` +
`- Direct marketing evidence: **${totals.leadsWithDirectEvidence}**\n` +
`- Website/content-assisted evidence: **${totals.leadsWithAssistedEvidence}**\n` +
`- Temporal contribution only: **${totals.leadsWithTemporalOnly}**\n` +
`- Unattributed: **${totals.leadsUnattributed}**\n` +
`- Associated open pipeline: **${money(totals.openPipeline)}**\n` +
`- Associated closed-won revenue: **${money(totals.wonRevenue)}**\n` +
`- Evidence-weighted open-pipeline contribution: **${money(totals.evidenceWeightedOpenPipelineContribution)}**\n` +
`- Evidence-weighted won contribution: **${money(totals.evidenceWeightedWonContribution)}**\n\n` +
`## Whole-pipeline cohort check\n\n${table(pipelineCohorts, [['Cohort','label'],['Deals','deals'],['Deals with contacts','dealsWithContacts'],['Open deals','openDeals'],['Open pipeline',(r)=>money(r.openPipeline)],['Won deals','wonDeals'],['Won revenue',(r)=>money(r.wonRevenue)],['Lost deals','lostDeals'],['Weighted open contribution',(r)=>money(r.evidenceWeightedOpenPipeline)]])}\n\n` +
`This cohort table includes every HubSpot deal created in 2026, not only website-form buyers. It measures correlation and CRM traceability; the later cohort has had less time to mature.\n\n` +
`## Has the marketing initiative contributed?\n\n` +
`**Yes at the lead level, not yet provably at the revenue level.** One high-value buyer, Lori Dillon at Therapeutic Associates, has direct HubSpot AI/AEO evidence: ChatGPT was the original source, the first URL carried utm_source=chatgpt.com, and she converted on the Support page. She scored 98/100 but has no logged follow-up and no associated deal, demonstrating a real marketing-created opportunity that leaked before pipeline creation. Two additional buyers used pages updated during the program, but their acquisition came through third-party referral tools, so they count only as website-assisted. No qualified buyer currently has traceable social-media evidence.\n\n` +
`The post-program deal cohort has **${money(postCohort.openPipeline)}** in open pipeline versus **${money(preCohort.openPipeline)}** for the pre-program YTD cohort, an increase of **${programAssessment.openPipelineChangePct.toFixed(1)}%**. Open deal count increased **${programAssessment.openDealChangePct.toFixed(1)}%**, but normalized deal creation velocity changed **${programAssessment.dealCreationRateChangePct.toFixed(1)}%**. This means pipeline value and active opportunity count improved while raw deal creation did not.\n\n` +
`Today, **${money(programAssessment.provenOwnedPipeline)}** of open deal value is directly traceable to an owned social/SEO/AEO/campaign touch. The conservative modeled influence estimate is **${money(programAssessment.evidenceWeightedPipeline)}**, or **${programAssessment.evidenceWeightedSharePct.toFixed(2)}%** of the post-program open pipeline. It should not be reported externally as sourced pipeline because it includes a 25% temporal-correlation weight. The difference between it and the full ${money(postCohort.openPipeline)} is primarily a measurement gap, not proof of zero impact.\n\n` +
`## Evidence tiers\n\n${table(byTier, [['Tier','tier'],['Buyer leads','leads'],['Associated deals','deals'],['Open pipeline',(r)=>money(r.openPipeline)],['Won revenue',(r)=>money(r.wonRevenue)],['Weighted open contribution',(r)=>money(r.weightedOpenPipeline)]])}\n\n` +
`Weights are deliberately conservative: direct tracked touch 100%, verified updated-page assist 50%, temporal-only correlation 25%, no evidence 0%. These are management contribution weights, not causal proof.\n\n` +
`## Buyer-level attribution register\n\n${table(journeys, [
  ['Lead','name'],['Company','company'],['Submitted',(r)=>isoDate(r.submittedAt)],['Original source','originalSource'],['Source detail',(r)=>[r.originalDrilldown1,r.originalDrilldown2].filter(Boolean).join(' / ')],
  ['First URL','firstUrl'],['Conversion page','submissionPage'],['Sessions','sessions'],['Social clicks','socialClicks'],['Evidence','evidenceTier'],['Weight',(r)=>`${Math.round(r.contributionWeight*100)}%`],
  ['Deals','dealCount'],['Open pipeline',(r)=>money(r.openPipelineAmount)],['Won',(r)=>money(r.wonAmount)],['Reason','contributionReason'],
])}\n\n` +
`## Owned-work ledger\n\n${table(ownedWorkLedger, [['Date','date'],['Channel','channel'],['Initiative','initiative'],['Evidence','evidence'],['Ownership status','ownership']])}\n\n` +
`## The production attribution model\n\n` +
`1. **First touch:** channel that created the first known session. Use for demand creation.\n` +
`2. **Lead-creation touch:** session and page that produced the first qualified form submission. Use for conversion effectiveness.\n` +
`3. **Assisted touches:** documented social, organic, referral, email, and content interactions before opportunity creation. Use for influence.\n` +
`4. **Opportunity-source touch:** campaign and channel active immediately before lifecycle stage changed to Opportunity. Use for pipeline sourcing.\n` +
`5. **Revenue touch:** distribute won revenue with a 40/20/40 position model across first touch, assists, and opportunity-creation touch.\n` +
`6. **Incrementality layer:** compare pre/post cohorts and controlled campaign periods. Attribution allocates credit; incrementality tests whether the work caused lift.\n\n` +
`## Required tracking changes\n\n` +
`- Add standardized UTMs to every LinkedIn/company/personal-profile post and preserve them into HubSpot contact properties.\n` +
`- Fire form_viewed, form_started, form_submitted, meeting_booked, qualified_lead, and opportunity_created with page, CTA location, campaign, and content ID.\n` +
`- Add hidden fields to all HubSpot forms for first-touch UTM, last-touch UTM, landing page, referrer, CTA location, and content ID.\n` +
`- Require every deal to have a primary associated contact and immutable Original Marketing Source plus current Opportunity Source.\n` +
`- Connect GA4 and Search Console, and grant the HubSpot private app the analytics scope required for source reports.\n` +
`- Maintain the owned-work ledger with publish time, URL/post ID, author/profile, campaign, cost, and UTM.\n` +
`- Report qualified pipeline, not raw contacts: qualified buyers, opportunities, open amount, won amount, sales velocity, and source-quality rate.\n\n` +
`## Interpretation guardrail\n\n` +
`A form submitted on the website proves the website converted the visitor. It does not prove the website or social media originally created the demand. A lead arriving after an optimization is correlation until the source, touchpoint, and timing are captured or an incrementality test shows lift.\n`;

const payload = { generatedAt: new Date().toISOString(), portalId, programStart: programStart.toISOString(), ownedWorkLedger, totals, byTier, programAssessment, pipelineCohorts, pipelineDeals, journeys, contentItems };
fs.writeFileSync(path.join(outDir, 'current-marketing-attribution-baseline.json'), JSON.stringify(payload, null, 2));
fs.writeFileSync(path.join(outDir, 'current-marketing-attribution-baseline.md'), report);
console.log(JSON.stringify({ totals, byTier, files: { report: path.join(outDir, 'current-marketing-attribution-baseline.md'), data: path.join(outDir, 'current-marketing-attribution-baseline.json') } }, null, 2));
