import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pilotDir = path.resolve(here, '..', '2026-09-01-hubspot-chronos-forecast-pilot');
const siteDir = path.join(here, 'site');
const assetDir = path.join(siteDir, 'assets');

const paths = {
  scoring: path.join(pilotDir, 'scoring-receipt.json'),
  run: path.join(pilotDir, 'forecast-run.json'),
  request: path.join(pilotDir, 'forecast-request.json'),
  evidence: path.join(pilotDir, 'inputs', 'hubspot-forecast-evidence-manifest.json'),
  csv: path.join(pilotDir, 'inputs', 'hubspot-contacts-created-weekly.csv'),
  report: path.join(pilotDir, 'momentum-360-hubspot-chronos-forecast-pilot-report.md'),
  logo: path.resolve(here, '..', '2026-07-27-workshop-outreach-campaign', 'assets', 'momentum-360-logo.png'),
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const sha256 = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

for (const [name, filePath] of Object.entries(paths)) {
  invariant(fs.existsSync(filePath), `Missing ${name} source: ${filePath}`);
}

const scoring = readJson(paths.scoring);
const run = readJson(paths.run);
const request = readJson(paths.request);
const evidence = readJson(paths.evidence);
const output = run.target_outputs?.[0];

invariant(scoring.clientId === 'momentum-360', 'Unexpected client route.');
invariant(scoring.portalId === '50612503', 'Unexpected HubSpot portal.');
invariant(scoring.experimentId === 'EXP-JASON-HUBSPOT-CHRONOS-20260901', 'Unexpected experiment.');
invariant(scoring.validation?.exactIdentityAssertions === 'passed', 'Scoring identity assertions did not pass.');
invariant(run.model_id === 'amazon/chronos-2' && run.used_for === 'research', 'Unexpected model or use lane.');
invariant(run.status === 'ok' && run.horizon === 12, 'Forecast run is not the approved 12-step result.');
invariant(request.request_id === run.request_id, 'Request and run do not match.');
invariant(evidence.portalId === scoring.portalId, 'Evidence portal does not match scoring portal.');
invariant(output?.series_id === 'hubspot_contacts_created', 'Unexpected forecast target.');

const csvRows = fs.readFileSync(paths.csv, 'utf8').trim().split(/\r?\n/).slice(1).map((line) => {
  const [week, target, value] = line.split(',');
  return { week, target, value: Number(value) };
});
invariant(csvRows.length === evidence.selectedTarget.completeWeeklySteps, 'CSV step count does not match evidence.');
invariant(csvRows.every((row) => row.target === scoring.target && Number.isFinite(row.value)), 'CSV target or value is invalid.');

const holdoutRows = csvRows.slice(scoring.contextSteps, scoring.contextSteps + scoring.holdoutSteps);
invariant(holdoutRows.length === run.horizon, 'Holdout horizon is incomplete.');
invariant(holdoutRows[0].week === scoring.holdoutStart && holdoutRows.at(-1).week === scoring.holdoutEnd, 'Holdout dates do not match scoring receipt.');
invariant(JSON.stringify(holdoutRows.map((row) => row.value)) === JSON.stringify(scoring.actual), 'Holdout values do not match scoring receipt.');

const quantileKeys = ['p10', 'p20', 'p30', 'p40', 'p50', 'p60', 'p70', 'p80', 'p90'];
for (const key of quantileKeys) {
  invariant(Array.isArray(output.quantiles?.[key]) && output.quantiles[key].length === run.horizon, `Missing ${key} output.`);
}

const dashboardData = {
  meta: {
    title: 'Momentum 360 Forecast Specialist Pilot',
    account: 'Jason Fallon / Momentum 360',
    experimentId: scoring.experimentId,
    generatedAt: scoring.generatedAt,
    reviewedAt: '2026-09-01',
    evidenceWindow: `${scoring.holdoutStart} to ${scoring.holdoutEnd}`,
    targetLabel: 'HubSpot contacts created per week',
    targetBoundary: 'CRM creation activity, not verified leads, qualified leads, conversions, deals, demand, or revenue.',
  },
  verdict: {
    headline: 'The system worked. The model did not earn promotion.',
    state: 'RETAIN / EVIDENCE ONLY',
    summary: 'Chronos-2 completed the governed forecast path, produced nine quantile bands, and beat the trailing-four-week mean. It finished slightly behind persistence and its uncertainty band was under-calibrated.',
    decision: 'Improve the target data and run rolling-origin tests before any planning or automation proposal.',
  },
  metrics: {
    chronos: scoring.model.metrics,
    persistence: scoring.baselines.persistence.metrics,
    trailingMean: scoring.baselines.trailingFourWeekMean.metrics,
    persistenceValue: scoring.baselines.persistence.value,
    trailingMeanValue: scoring.baselines.trailingFourWeekMean.value,
    coverageObserved: scoring.model.p10P90CoveragePercent,
    coverageIntended: 80,
    meanBandWidth: scoring.model.meanP10P90Width,
    p50AboveActualSteps: scoring.model.p50AboveActualSteps,
  },
  holdout: {
    dates: holdoutRows.map((row) => row.week),
    actual: scoring.actual,
    point: scoring.model.point,
    persistence: holdoutRows.map(() => scoring.baselines.persistence.value),
    quantiles: output.quantiles,
  },
  history: {
    dates: csvRows.map((row) => row.week),
    values: csvRows.map((row) => row.value),
    contextSteps: scoring.contextSteps,
    holdoutSteps: scoring.holdoutSteps,
    extremeWeeks: evidence.selectedTarget.qualityWarning.extremeWeeks,
  },
  dataQuality: {
    status: 'MATERIAL WARNING',
    shareInTwoWeeks: evidence.selectedTarget.qualityWarning.shareOfCompleteWindow,
    recordsInTwoWeeks: evidence.selectedTarget.qualityWarning.recordsInExtremeWeeks,
    completeWindowRecords: evidence.selectedTarget.completeWindowRecordCount,
    completeWeeks: evidence.selectedTarget.completeWeeklySteps,
    missingWeeks: evidence.selectedTarget.missingness.missingWeeksOnGrid,
    invalidCreatedates: evidence.selectedTarget.missingness.invalidOrMissingCreatedateRecords,
    interpretation: evidence.selectedTarget.qualityWarning.interpretation,
  },
  access: [
    ['Contacts', evidence.sourceSnapshot.contacts],
    ['Companies', evidence.sourceSnapshot.companies],
    ['Deals', evidence.sourceSnapshot.deals],
    ['Calls', evidence.sourceSnapshot.calls],
    ['Meetings', evidence.sourceSnapshot.meetings],
    ['Tasks', evidence.sourceSnapshot.tasks],
    ['Owners', evidence.sourceSnapshot.owners],
    ['Forms', evidence.sourceSnapshot.forms],
    ['Deal pipelines', evidence.sourceSnapshot.dealPipelines],
  ],
  coverage: {
    channelMappingPercent: evidence.sourceSnapshot.provisionalChannelMappingCoveragePercent,
  },
  nextExperiment: [
    ['Explain the two spikes', 'Use HubSpot import and audit history to classify the 2025-11-17 and 2026-02-02 concentrations.'],
    ['Define an organic target', 'Exclude test, spam, duplicate, and imported records without rewriting raw evidence.'],
    ['Capture historical transitions', 'Preserve immutable source and lifecycle events before channel or qualified-lead forecasting.'],
    ['Add approved future facts', 'Use scheduled webinars, promotions, holidays, and fixed budget calendars only when documented.'],
    ['Run rolling-origin tests', 'Require Chronos to beat persistence and a suitable seasonal baseline across several windows.'],
    ['Recalibrate uncertainty', 'Require observed p10-p90 coverage near the intended 80% before promotion.'],
  ],
  safety: [
    'No CRM writes or HubSpot configuration changes',
    'No spend, send, publish, or conversion authority',
    'No scheduled automation or production promotion',
    'TimesFM-3 received no Momentum 360 data',
    'Conversion reporting is pending validation',
  ],
  provenance: {
    model: run.model_id,
    runtime: run.runtime_id,
    license: run.license_lane,
    dataClass: run.client_experiment.data_class,
    sources: ['Momentum 360 HubSpot aggregate read-only evidence', 'Chronos-2 forecast run receipt', 'Held-out scoring receipt'],
  },
};

fs.mkdirSync(assetDir, { recursive: true });
fs.copyFileSync(paths.logo, path.join(assetDir, 'momentum-360-logo.png'));
fs.writeFileSync(
  path.join(siteDir, 'data.js'),
  `/* Generated from verified pilot receipts. Do not hand-edit. */\nwindow.MOMENTUM_FORECAST = ${JSON.stringify(dashboardData, null, 2)};\n`,
  'utf8',
);

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  clientId: scoring.clientId,
  portalId: scoring.portalId,
  experimentId: scoring.experimentId,
  output: 'site/data.js',
  sourceHashes: Object.fromEntries(
    Object.entries(paths).map(([name, filePath]) => [name, sha256(filePath)]),
  ),
  outputHashes: {
    data: sha256(path.join(siteDir, 'data.js')),
    logo: sha256(path.join(assetDir, 'momentum-360-logo.png')),
  },
};
fs.writeFileSync(path.join(here, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ status: 'ok', clientId: scoring.clientId, portalId: scoring.portalId, output: manifest.output }, null, 2));
