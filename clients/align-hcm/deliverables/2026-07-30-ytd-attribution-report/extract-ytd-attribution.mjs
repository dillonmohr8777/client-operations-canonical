import fs from 'node:fs';
import path from 'node:path';

const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
if (!token) throw new Error('HUBSPOT_PRIVATE_APP_TOKEN is required');

const portalId = '242825734';
const reportEnd = new Date('2026-07-31T03:59:59.999Z');
const ytdStart = new Date('2026-01-01T05:00:00.000Z');
const outDir = process.cwd();

async function hs(endpoint, options = {}, attempt = 0) {
  const response = await fetch(`https://api.hubapi.com${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 429 && attempt < 6) {
    const retry = Number(response.headers.get('retry-after')) || Math.min(8, attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, retry * 1000));
    return hs(endpoint, options, attempt + 1);
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 500) };
  }

  if (!response.ok) {
    throw new Error(`HubSpot ${response.status} for ${endpoint}: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return data;
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isoDate(value) {
  const parsed = asDate(value);
  return parsed ? parsed.toISOString().slice(0, 10) : '';
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeName(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function displayMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(asNumber(value));
}

function csvValue(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

const propertyMeta = await hs('/crm/v3/properties/contacts');
const availableProperties = new Set((propertyMeta.results || []).map((item) => item.name));
const desiredProperties = [
  'company',
  'createdate',
  'lifecyclestage',
  'hs_analytics_source',
  'hs_analytics_source_data_1',
  'hs_analytics_source_data_2',
  'hs_latest_source',
  'hs_latest_source_data_1',
  'hs_latest_source_data_2',
  'hs_analytics_first_referrer',
  'hs_analytics_first_url',
  'hs_analytics_first_visit_timestamp',
  'hs_analytics_last_referrer',
  'hs_analytics_last_url',
  'hs_analytics_last_visit_timestamp',
  'first_conversion_date',
  'first_conversion_event_name',
  'recent_conversion_date',
  'recent_conversion_event_name',
  'hs_social_linkedin_clicks',
  'hs_social_facebook_clicks',
  'hs_social_twitter_clicks',
  'hs_social_num_broadcast_clicks',
  'hs_social_last_engagement',
  'align_first_landing_page',
  'align_first_referrer',
  'align_first_social_platform',
  'align_first_utm_campaign',
  'align_first_utm_content',
  'align_first_utm_medium',
  'align_first_utm_source',
  'align_first_utm_term',
  'align_last_landing_page',
  'align_last_referrer',
  'align_last_social_platform',
  'align_last_utm_campaign',
  'align_last_utm_content',
  'align_last_utm_medium',
  'align_last_utm_source',
  'align_last_utm_term',
  'align_self_reported_source',
  'align_conversion_page',
  'align_conversion_type',
  'align_content_slug',
  'align_content_topic',
].filter((name) => availableProperties.has(name));

async function searchYtdContacts() {
  const results = [];
  let after = 0;
  do {
    const body = {
      filterGroups: [{
        filters: [
          { propertyName: 'createdate', operator: 'GTE', value: String(ytdStart.getTime()) },
          { propertyName: 'createdate', operator: 'LTE', value: String(reportEnd.getTime()) },
        ],
      }],
      properties: desiredProperties,
      sorts: ['createdate'],
      limit: 200,
      after,
    };
    const page = await hs('/crm/v3/objects/contacts/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    results.push(...(page.results || []));
    after = page.paging?.next?.after;
  } while (after);
  return results;
}

const AI_PATTERN = /\b(ai[_ -]?referrals?|chatgpt|openai|perplexity|claude|anthropic|gemini|bard|copilot|poe|you\.com|phind|meta ai|grok|deepseek|mistral)\b/i;
const SOCIAL_PATTERN = /\b(social[_ -]?media|linkedin|facebook|instagram|threads|twitter|x\.com|tiktok|youtube|reddit)\b/i;
const SEARCH_PATTERN = /\b(organic[_ -]?search|google|bing|msn|yahoo|duckduckgo|search engine)\b/i;

function evidenceEntries(properties) {
  const orderedFields = [
    ['native original source', 'hs_analytics_source', 'native'],
    ['original source detail', 'hs_analytics_source_data_1', 'native'],
    ['original source detail', 'hs_analytics_source_data_2', 'native'],
    ['first referrer', 'align_first_referrer', 'first'],
    ['first UTM source', 'align_first_utm_source', 'first'],
    ['first UTM medium', 'align_first_utm_medium', 'first'],
    ['first social platform', 'align_first_social_platform', 'first'],
    ['HubSpot first referrer', 'hs_analytics_first_referrer', 'first'],
    ['first landing page', 'align_first_landing_page', 'first'],
    ['HubSpot first URL', 'hs_analytics_first_url', 'first'],
    ['self-reported source', 'align_self_reported_source', 'self-reported'],
    ['latest source', 'hs_latest_source', 'latest'],
    ['latest source detail', 'hs_latest_source_data_1', 'latest'],
    ['latest source detail', 'hs_latest_source_data_2', 'latest'],
    ['last referrer', 'align_last_referrer', 'latest'],
    ['last UTM source', 'align_last_utm_source', 'latest'],
    ['last UTM medium', 'align_last_utm_medium', 'latest'],
    ['last social platform', 'align_last_social_platform', 'latest'],
    ['HubSpot last referrer', 'hs_analytics_last_referrer', 'latest'],
    ['last landing page', 'align_last_landing_page', 'latest'],
    ['HubSpot last URL', 'hs_analytics_last_url', 'latest'],
  ];

  return orderedFields
    .map(([label, field, position]) => ({
      label,
      field,
      position,
      value: cleanText(properties[field]),
    }))
    .filter((item) => item.value);
}

function classifyContact(contact) {
  const properties = contact.properties || {};
  const entries = evidenceEntries(properties);
  const nativeSource = cleanText(properties.hs_analytics_source).toUpperCase();

  let channel = '';
  let matched = [];
  if (nativeSource === 'AI_REFERRALS') {
    channel = 'AI Search & Assistants';
    matched = entries.filter((entry) => AI_PATTERN.test(entry.value) || entry.field === 'hs_analytics_source');
  } else if (nativeSource === 'SOCIAL_MEDIA') {
    channel = 'Organic Social';
    matched = entries.filter((entry) => SOCIAL_PATTERN.test(entry.value) || entry.field === 'hs_analytics_source');
  } else if (nativeSource === 'ORGANIC_SEARCH') {
    channel = 'Organic Search';
    matched = entries.filter((entry) => SEARCH_PATTERN.test(entry.value) || entry.field === 'hs_analytics_source');
  } else {
    const firstEvidence = entries.filter((entry) => entry.position !== 'latest');
    const lastEvidence = entries.filter((entry) => entry.position === 'latest');
    const searchOrder = [firstEvidence, lastEvidence];
    for (const pool of searchOrder) {
      if (pool.some((entry) => AI_PATTERN.test(entry.value))) {
        channel = 'AI Search & Assistants';
        matched = pool.filter((entry) => AI_PATTERN.test(entry.value));
        break;
      }
      if (pool.some((entry) => SOCIAL_PATTERN.test(entry.value))) {
        channel = 'Organic Social';
        matched = pool.filter((entry) => SOCIAL_PATTERN.test(entry.value));
        break;
      }
      if (pool.some((entry) => SEARCH_PATTERN.test(entry.value))) {
        channel = 'Organic Search';
        matched = pool.filter((entry) => SEARCH_PATTERN.test(entry.value));
        break;
      }
    }
  }

  if (!channel) return null;

  const recovered = !['AI_REFERRALS', 'SOCIAL_MEDIA', 'ORGANIC_SEARCH'].includes(nativeSource);
  const recoveredFromOffline = nativeSource === 'OFFLINE';
  const evidence = matched
    .slice(0, 3)
    .map((entry) => `${entry.label}: ${entry.value}`)
    .join(' · ');
  const hasFirstPartyProof = matched.some((entry) => ['native', 'first'].includes(entry.position));
  const confidence = recovered
    ? (hasFirstPartyProof ? 'High — deterministic recovery' : 'Medium — latest-touch recovery')
    : 'High — HubSpot native source';

  return {
    contactId: String(contact.id),
    createdAt: properties.createdate,
    channel,
    nativeSource: nativeSource || 'UNKNOWN',
    recovered,
    recoveredFromOffline,
    confidence,
    evidence,
    companyProperty: cleanText(properties.company),
    lifecycleStage: cleanText(properties.lifecyclestage),
    firstConversionDate: properties.first_conversion_date || '',
    firstConversion: cleanText(properties.first_conversion_event_name),
    latestConversionDate: properties.recent_conversion_date || '',
    latestConversion: cleanText(properties.recent_conversion_event_name),
    contactDealIds: [],
    companyIds: [],
  };
}

const allContacts = await searchYtdContacts();
const classifiedContacts = allContacts
  .map(classifyContact)
  .filter(Boolean);

const offlineContacts = allContacts.filter(
  (contact) => cleanText(contact.properties?.hs_analytics_source).toUpperCase() === 'OFFLINE',
);
const offlineRecordSourceCounts = Object.entries(
  Object.groupBy(offlineContacts, (contact) => cleanText(contact.properties?.hs_analytics_source_data_1) || 'Unspecified'),
)
  .map(([source, items]) => ({ source, contacts: items.length }))
  .sort((a, b) => b.contacts - a.contacts);

async function hydrateContactAssociations(item) {
  const contact = await hs(
    `/crm/v3/objects/contacts/${encodeURIComponent(item.contactId)}?properties=company&associations=companies,deals`,
  );
  item.companyProperty = cleanText(contact.properties?.company) || item.companyProperty;
  item.companyIds = (contact.associations?.companies?.results || []).map((entry) => String(entry.id));
  item.contactDealIds = (contact.associations?.deals?.results || []).map((entry) => String(entry.id));
}

for (let index = 0; index < classifiedContacts.length; index += 8) {
  await Promise.all(classifiedContacts.slice(index, index + 8).map(hydrateContactAssociations));
}

const companyCache = new Map();
async function getCompany(companyId) {
  if (!companyCache.has(companyId)) {
    companyCache.set(
      companyId,
      hs(
        `/crm/v3/objects/companies/${encodeURIComponent(companyId)}?properties=name,domain,website&associations=deals`,
      ),
    );
  }
  return companyCache.get(companyId);
}

const companyGroups = new Map();
for (const contact of classifiedContacts) {
  let companyId = contact.companyIds[0] || '';
  let companyName = contact.companyProperty;
  let companyDomain = '';
  let companyDealIds = [];

  if (companyId) {
    const company = await getCompany(companyId);
    companyName = cleanText(company.properties?.name) || companyName;
    companyDomain = cleanText(company.properties?.domain);
    companyDealIds = (company.associations?.deals?.results || []).map((entry) => String(entry.id));
  }

  if (!companyName) companyName = 'Organization not captured';
  contact.resolvedCompanyId = companyId;
  contact.resolvedCompanyName = companyName;
  contact.resolvedCompanyDomain = companyDomain;
  contact.companyDealIds = companyDealIds;
  const normalizedCompanyName = normalizeName(companyName);
  const key = normalizedCompanyName ? `name:${normalizedCompanyName}` : 'unresolved';
  if (!companyGroups.has(key)) {
    companyGroups.set(key, {
      groupKey: key,
      companyId,
      company: companyName,
      domain: companyDomain,
      firstSeen: contact.createdAt,
      contactIds: new Set(),
      channels: new Set(),
      nativeSources: new Set(),
      confidences: new Set(),
      evidence: new Set(),
      recoveredContacts: 0,
      recoveredOfflineContacts: 0,
      dealIds: new Set(companyDealIds),
      firstConversions: new Set(),
    });
  }

  const group = companyGroups.get(key);
  if (asDate(contact.createdAt) < asDate(group.firstSeen)) group.firstSeen = contact.createdAt;
  group.contactIds.add(contact.contactId);
  group.channels.add(contact.channel);
  group.nativeSources.add(contact.nativeSource);
  group.confidences.add(contact.confidence);
  if (contact.evidence) group.evidence.add(contact.evidence);
  if (contact.recovered) group.recoveredContacts += 1;
  if (contact.recoveredFromOffline) group.recoveredOfflineContacts += 1;
  contact.contactDealIds.forEach((dealId) => group.dealIds.add(dealId));
  if (contact.firstConversion) {
    group.firstConversions.add(
      `${isoDate(contact.firstConversionDate || contact.createdAt)} ${contact.firstConversion}`.trim(),
    );
  }
}

const pipelines = await hs('/crm/v3/pipelines/deals');
const pipelineLabels = new Map();
const stageLabels = new Map();
for (const pipeline of pipelines.results || []) {
  pipelineLabels.set(String(pipeline.id), cleanText(pipeline.label) || String(pipeline.id));
  for (const stage of pipeline.stages || []) {
    stageLabels.set(String(stage.id), cleanText(stage.label) || String(stage.id));
  }
}

const allDealIds = [...new Set([...companyGroups.values()].flatMap((group) => [...group.dealIds]))];
const dealProperties = [
  'dealname',
  'amount',
  'createdate',
  'closedate',
  'dealstage',
  'pipeline',
  'hs_is_closed',
  'hs_is_closed_won',
  'dealtype',
  'lead_source',
];
const dealMap = new Map();

for (let index = 0; index < allDealIds.length; index += 100) {
  const ids = allDealIds.slice(index, index + 100);
  const response = await hs('/crm/v3/objects/deals/batch/read', {
    method: 'POST',
    body: JSON.stringify({
      properties: dealProperties,
      inputs: ids.map((id) => ({ id })),
    }),
  });
  for (const deal of response.results || []) dealMap.set(String(deal.id), deal);
}

function normalizeDeal(deal) {
  const properties = deal.properties || {};
  const pipeline = pipelineLabels.get(String(properties.pipeline)) || cleanText(properties.pipeline);
  const stage = stageLabels.get(String(properties.dealstage)) || cleanText(properties.dealstage);
  const isTest = /\btest\b/i.test(pipeline);
  const isWon = properties.hs_is_closed_won === 'true' || /\bclosed\s*won\b|\bwon\b$/i.test(stage);
  const isLost = /\bclosed\s*lost\b|\blost\b$/i.test(stage);
  const isOpen = !isWon && !isLost;
  return {
    id: String(deal.id),
    name: cleanText(properties.dealname),
    amount: asNumber(properties.amount),
    createdAt: properties.createdate || '',
    closeDate: properties.closedate || '',
    pipeline,
    stage,
    isWon,
    isLost,
    isOpen,
    isTest,
    dealType: cleanText(properties.dealtype),
    leadSource: cleanText(properties.lead_source),
  };
}

const normalizedDeals = new Map(
  [...dealMap.entries()].map(([id, deal]) => [id, normalizeDeal(deal)]),
);

function newReportGroup(key, contact, companyName) {
  return {
    groupKey: key,
    companyId: contact.resolvedCompanyId || '',
    company: companyName,
    domain: contact.resolvedCompanyDomain || '',
    firstSeen: contact.createdAt,
    contactIds: new Set(),
    channels: new Set(),
    nativeSources: new Set(),
    confidences: new Set(),
    evidence: new Set(),
    recoveredContacts: 0,
    recoveredOfflineContacts: 0,
    dealIds: new Set(contact.companyDealIds || []),
    firstConversions: new Set(),
  };
}

function addContactToReportGroup(group, contact) {
  if (asDate(contact.createdAt) < asDate(group.firstSeen)) group.firstSeen = contact.createdAt;
  group.contactIds.add(contact.contactId);
  group.channels.add(contact.channel);
  group.nativeSources.add(contact.nativeSource);
  group.confidences.add(contact.confidence);
  if (contact.evidence) group.evidence.add(contact.evidence);
  if (contact.recovered) group.recoveredContacts += 1;
  if (contact.recoveredFromOffline) group.recoveredOfflineContacts += 1;
  (contact.contactDealIds || []).forEach((dealId) => group.dealIds.add(dealId));
  if (contact.firstConversion) {
    group.firstConversions.add(
      `${isoDate(contact.firstConversionDate || contact.createdAt)} ${contact.firstConversion}`.trim(),
    );
  }
}

function companyNameFromDeal(contact) {
  const deal = (contact.contactDealIds || [])
    .map((dealId) => normalizedDeals.get(dealId))
    .find((item) => item && !item.isTest && item.name);
  if (!deal) return '';
  return cleanText(deal.name.split(/\s[-–—]\s/)[0]);
}

const reportCompanyGroups = new Map();
for (const contact of classifiedContacts) {
  let companyName = contact.resolvedCompanyName;
  if (!companyName || companyName === 'Organization not captured') {
    companyName = companyNameFromDeal(contact) || 'Organization not captured';
  }
  const normalizedCompanyName = normalizeName(companyName);
  const key = normalizedCompanyName ? `name:${normalizedCompanyName}` : 'unresolved';
  if (!reportCompanyGroups.has(key)) {
    reportCompanyGroups.set(key, newReportGroup(key, contact, companyName));
  }
  addContactToReportGroup(reportCompanyGroups.get(key), contact);
}

const companies = [...reportCompanyGroups.values()]
  .map((group) => {
    const deals = [...group.dealIds]
      .map((dealId) => normalizedDeals.get(dealId))
      .filter((deal) => deal && !deal.isTest);
    const wonDeals = deals.filter((deal) => {
      const closed = asDate(deal.closeDate);
      return deal.isWon && closed && closed >= ytdStart && closed <= reportEnd;
    });
    const openDeals = deals.filter((deal) => deal.isOpen);
    const confidence = group.confidences.has('High — HubSpot native source')
      ? 'High — HubSpot native source'
      : group.confidences.has('High — deterministic recovery')
        ? 'High — deterministic recovery'
        : 'Medium — latest-touch recovery';
    return {
      groupKey: group.groupKey,
      companyId: group.companyId,
      company: group.company,
      domain: group.domain,
      firstSeen: isoDate(group.firstSeen),
      channels: [...group.channels].sort(),
      nativeSources: [...group.nativeSources].sort(),
      attributedContacts: group.contactIds.size,
      recoveredContacts: group.recoveredContacts,
      recoveredOfflineContacts: group.recoveredOfflineContacts,
      confidence,
      evidence: [...group.evidence].slice(0, 4),
      firstConversions: [...group.firstConversions].sort().slice(0, 4),
      wonDeals: wonDeals.map((deal) => ({
        name: deal.name,
        amount: deal.amount,
        closeDate: isoDate(deal.closeDate),
        pipeline: deal.pipeline,
        stage: deal.stage,
      })),
      openDeals: openDeals.map((deal) => ({
        name: deal.name,
        amount: deal.amount,
        createdAt: isoDate(deal.createdAt),
        pipeline: deal.pipeline,
        stage: deal.stage,
      })),
      wonCount: wonDeals.length,
      wonRevenue: wonDeals.reduce((sum, deal) => sum + deal.amount, 0),
      openCount: openDeals.length,
      openPipeline: openDeals.reduce((sum, deal) => sum + deal.amount, 0),
    };
  })
  .sort((a, b) => {
    if (b.wonRevenue !== a.wonRevenue) return b.wonRevenue - a.wonRevenue;
    if (b.openPipeline !== a.openPipeline) return b.openPipeline - a.openPipeline;
    return a.company.localeCompare(b.company);
  });

const uniqueWonDeals = new Map();
const uniqueOpenDeals = new Map();
for (const company of companies) {
  const group = reportCompanyGroups.get(company.groupKey);
  for (const dealId of group?.dealIds || []) {
    const deal = normalizedDeals.get(dealId);
    if (!deal || deal.isTest) continue;
    const closed = asDate(deal.closeDate);
    if (deal.isWon && closed && closed >= ytdStart && closed <= reportEnd) {
      uniqueWonDeals.set(deal.id, deal);
    } else if (deal.isOpen) {
      uniqueOpenDeals.set(deal.id, deal);
    }
  }
}

const channelOrder = ['Organic Search', 'Organic Social', 'AI Search & Assistants'];
const channelSummary = channelOrder.map((channel) => {
  const channelCompanies = companies.filter((company) => company.channels.includes(channel));
  const channelContacts = classifiedContacts.filter((contact) => contact.channel === channel);
  const wonDealIds = new Set();
  const openDealIds = new Set();
  for (const company of channelCompanies) {
    for (const dealId of reportCompanyGroups.get(company.groupKey)?.dealIds || []) {
      const deal = normalizedDeals.get(dealId);
      if (!deal || deal.isTest) continue;
      const closed = asDate(deal.closeDate);
      if (deal.isWon && closed && closed >= ytdStart && closed <= reportEnd) wonDealIds.add(deal.id);
      if (deal.isOpen) openDealIds.add(deal.id);
    }
  }
  return {
    channel,
    contacts: channelContacts.length,
    companies: channelCompanies.length,
    recoveredContacts: channelContacts.filter((contact) => contact.recovered).length,
    recoveredOfflineContacts: channelContacts.filter((contact) => contact.recoveredFromOffline).length,
    wonDeals: wonDealIds.size,
    wonRevenue: [...wonDealIds].reduce((sum, id) => sum + normalizedDeals.get(id).amount, 0),
    openDeals: openDealIds.size,
    openPipeline: [...openDealIds].reduce((sum, id) => sum + normalizedDeals.get(id).amount, 0),
  };
});

const totals = {
  ytdContacts: allContacts.length,
  attributedContacts: classifiedContacts.length,
  knownCompanies: companies.filter((company) => company.company !== 'Organization not captured').length,
  externalKnownCompanies: companies.filter(
    (company) => company.company !== 'Organization not captured'
      && !/^align(?: hcm)?$/i.test(company.company),
  ).length,
  internalNamedCompanies: companies.filter((company) => /^align(?: hcm)?$/i.test(company.company)).length,
  companyRows: companies.length,
  companiesWithWonRevenue: companies.filter((company) => company.wonCount > 0).length,
  companiesWithOpenPipeline: companies.filter((company) => company.openCount > 0).length,
  wonDeals: uniqueWonDeals.size,
  wonRevenue: [...uniqueWonDeals.values()].reduce((sum, deal) => sum + deal.amount, 0),
  openDeals: uniqueOpenDeals.size,
  openPipeline: [...uniqueOpenDeals.values()].reduce((sum, deal) => sum + deal.amount, 0),
  recoveredContacts: classifiedContacts.filter((contact) => contact.recovered).length,
  recoveredOfflineContacts: classifiedContacts.filter((contact) => contact.recoveredFromOffline).length,
  offlineContacts: offlineContacts.length,
  unresolvedOfflineContacts: offlineContacts.length
    - classifiedContacts.filter((contact) => contact.recoveredFromOffline).length,
};

const payload = {
  generatedAt: new Date().toISOString(),
  reportThrough: reportEnd.toISOString(),
  portalId,
  methodology: {
    contactCohort: 'Contacts created January 1 through July 30, 2026.',
    includedChannels: channelOrder,
    companyGrouping: 'Primary associated company; falls back to the contact Company property.',
    wonDefinition: 'Associated deal explicitly in a Closed Won stage with a 2026 close date.',
    openDefinition: 'Associated deal not in an explicit Closed Won or Closed Lost stage. This treats Expressing Interest as open despite the portal flag defect.',
    attributionBoundary: 'A company is included only when at least one 2026 contact has native or deterministic evidence for organic search, organic social, or AI assistant discovery.',
  },
  totals,
  channelSummary,
  offline: {
    recordSourceBreakdown: offlineRecordSourceCounts,
    contacts: offlineContacts.length,
    recoveredToRequestedChannels: totals.recoveredOfflineContacts,
    unresolved: totals.unresolvedOfflineContacts,
  },
  companies,
};

const jsonPath = path.join(outDir, 'ytd-company-attribution.json');
fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

const csvHeaders = [
  'Company',
  'First seen',
  'Channel',
  'Attributed contacts',
  'Recovered contacts',
  'Confidence',
  'Evidence',
  'Closed won deals',
  'Closed won revenue',
  'Open deals',
  'Open pipeline',
  'Deal detail',
];
const csvRows = companies.map((company) => [
  company.company,
  company.firstSeen,
  company.channels.join(' + '),
  company.attributedContacts,
  company.recoveredContacts,
  company.confidence,
  company.evidence.join(' | '),
  company.wonCount,
  company.wonRevenue,
  company.openCount,
  company.openPipeline,
  [
    ...company.wonDeals.map((deal) => `WON: ${deal.name} (${displayMoney(deal.amount)})`),
    ...company.openDeals.map((deal) => `OPEN: ${deal.name} (${displayMoney(deal.amount)}; ${deal.stage})`),
  ].join(' | '),
]);
const csv = [
  csvHeaders.map(csvValue).join(','),
  ...csvRows.map((row) => row.map(csvValue).join(',')),
].join('\r\n');
const csvPath = path.join(outDir, 'ytd-company-attribution.csv');
fs.writeFileSync(csvPath, csv);

console.log(JSON.stringify({
  generatedAt: payload.generatedAt,
  totals,
  channelSummary,
  offline: payload.offline,
  companyPreview: companies.slice(0, 8).map((company) => ({
    company: company.company,
    channels: company.channels,
    wonCount: company.wonCount,
    wonRevenue: company.wonRevenue,
    openCount: company.openCount,
    openPipeline: company.openPipeline,
  })),
  files: { jsonPath, csvPath },
}, null, 2));
