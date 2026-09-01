import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(here, 'inputs', 'hubspot-contacts-created-weekly.csv');
const requestPath = path.join(here, 'forecast-request.json');
const runPath = path.join(here, 'forecast-run.json');
const outputPath = path.join(here, 'scoring-receipt.json');
const routerFlag = process.argv.indexOf('--router');
if (routerFlag < 0 || !process.argv[routerFlag + 1]) {
  throw new Error('Usage: node score-forecast.mjs --router <forecast-route.js>');
}
const routerPath = path.resolve(process.argv[routerFlag + 1]);
if (!fs.existsSync(routerPath)) throw new Error(`Forecast router not found: ${routerPath}`);

const runValidator = (...args) => JSON.parse(execFileSync(
  process.execPath,
  [routerPath, ...args],
  { encoding: 'utf8' },
));

const rows = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1).map((line) => {
  const [week, target, value] = line.split(',');
  return { week, target, value: Number(value) };
});
const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
const run = JSON.parse(fs.readFileSync(runPath, 'utf8'));
const output = run.target_outputs?.[0];
const routeReceipt = runValidator('route', '--from', requestPath);
const runReceipt = runValidator('validate-run', '--from', runPath);
const requireCondition = (condition, message) => {
  if (!condition) throw new Error(message);
};
const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const expected = {
  clientId: 'momentum-360',
  portalId: '50612503',
  requestId: 'forecast-momentum-360-hubspot-contacts-weekly-20260901',
  experimentId: 'EXP-JASON-HUBSPOT-CHRONOS-20260901',
  target: 'hubspot_contacts_created',
  seriesId: 'momentum-360-hubspot-contacts-created-weekly',
  modelId: 'amazon/chronos-2',
  approvalRef: 'direct-user-approval:2026-09-01-jason-hubspot-chronos-pilot',
  inputFingerprint: 'df776a927381ede70f376cee9a34ae4dd9fd42ace1976c9bde1a28ae75a8ff1e',
};

requireCondition(routeReceipt.status === 'sandbox-eligible', 'Request router did not return sandbox-eligible.');
requireCondition(routeReceipt.client_experiment_authorized === true, 'Client experiment is not authorized.');
requireCondition(runReceipt.ok === true, `Forecast run validation failed: ${(runReceipt.errors || []).join('; ')}`);
requireCondition(request.request_id === expected.requestId, 'Unexpected request identity.');
requireCondition(run.request_id === request.request_id, 'Run request identity does not match request.');
requireCondition(request.client_id === expected.clientId && run.client_id === request.client_id, 'Client route mismatch.');
requireCondition(request.series_id === expected.seriesId && run.series_id === request.series_id, 'Series route mismatch.');
requireCondition(request.model_id === expected.modelId && run.model_id === request.model_id, 'Model route mismatch.');
requireCondition(request.used_for === 'research' && run.used_for === request.used_for, 'Use lane mismatch.');
requireCondition(request.contains_client_series === true && run.contains_client_series === true, 'Client series flag mismatch.');
requireCondition(sameJson(run.source_locators, request.source_locators), 'Run source locators do not match request.');
requireCondition(sameJson(run.client_experiment, request.client_experiment), 'Run experiment receipt does not match request.');
requireCondition(request.client_experiment.experiment_id === expected.experimentId, 'Experiment identity mismatch.');
requireCondition(request.client_experiment.approval_ref === expected.approvalRef, 'Approval reference mismatch.');
requireCondition(request.client_experiment.input_fingerprint === expected.inputFingerprint, 'Input fingerprint mismatch.');
const portalMatch = request.source_locators[0]?.match(/^hubspot:\/\/portal\/(\d+)\//);
requireCondition(portalMatch?.[1] === expected.portalId, 'HubSpot portal source locator mismatch.');
requireCondition(output?.series_id === expected.target, 'Forecast target output mismatch.');
requireCondition(run.status === 'ok', 'Forecast run is not successful.');
requireCondition(['spend', 'send', 'publish', 'conversion-claim'].every(
  (value) => run.forbidden_uses.includes(value),
), 'Forecast run is missing a forbidden-use boundary.');

const contextLength = request.targets[0].values.length;
const holdout = rows.slice(contextLength, contextLength + request.horizon);
const actual = holdout.map((row) => row.value);
const predicted = output.point;

requireCondition(rows.every((row) => row.target === expected.target), 'CSV target identity mismatch.');
requireCondition(sameJson(rows.slice(0, contextLength).map((row) => row.value), request.targets[0].values), 'CSV context does not match request values.');
requireCondition(holdout.length === request.horizon && predicted.length === request.horizon, 'Forecast and holdout horizons must match the request.');
const quantileKeys = Object.keys(output.quantiles).sort();
const expectedQuantiles = ['p10', 'p20', 'p30', 'p40', 'p50', 'p60', 'p70', 'p80', 'p90'];
requireCondition(sameJson(quantileKeys, expectedQuantiles), 'Forecast quantile keys are incomplete.');
for (let step = 0; step < request.horizon; step += 1) {
  const values = expectedQuantiles.map((key) => output.quantiles[key][step]);
  requireCondition(values.every(Number.isFinite), `Non-finite quantile at step ${step}.`);
  requireCondition(values.every((value, index) => index === 0 || value >= values[index - 1]), `Crossing quantile at step ${step}.`);
  requireCondition(Math.abs(output.point[step] - output.quantiles.p50[step]) <= 1e-6, `Point and p50 differ at step ${step}.`);
}

const round = (value, digits = 4) => Number(value.toFixed(digits));
const sha256 = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
const sum = (values) => values.reduce((total, value) => total + value, 0);
const mean = (values) => sum(values) / values.length;
const absErrors = (forecast) => actual.map((value, index) => Math.abs(value - forecast[index]));
const metrics = (forecast) => {
  const absolute = absErrors(forecast);
  const squared = actual.map((value, index) => (value - forecast[index]) ** 2);
  const smapeTerms = actual.map((value, index) => {
    const denominator = Math.abs(value) + Math.abs(forecast[index]);
    return denominator === 0 ? 0 : (2 * Math.abs(value - forecast[index])) / denominator;
  });
  return {
    mae: round(mean(absolute)),
    rmse: round(Math.sqrt(mean(squared))),
    wapePercent: round((sum(absolute) / sum(actual)) * 100, 2),
    smapePercent: round(mean(smapeTerms) * 100, 2),
  };
};

const lastValue = request.targets[0].values.at(-1);
const lastFour = request.targets[0].values.slice(-4);
const baselines = {
  persistence: Array(request.horizon).fill(lastValue),
  trailingFourWeekMean: Array(request.horizon).fill(mean(lastFour)),
};
const p10 = output.quantiles.p10;
const p90 = output.quantiles.p90;
const covered = actual.map((value, index) => value >= p10[index] && value <= p90[index]);
const p50AboveActual = actual.map((value, index) => output.quantiles.p50[index] > value);

const receipt = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  clientId: request.client_id,
  portalId: portalMatch[1],
  experimentId: request.client_experiment.experiment_id,
  validation: {
    routerStatus: routeReceipt.status,
    clientExperimentAuthorized: routeReceipt.client_experiment_authorized,
    runValid: runReceipt.ok,
    exactIdentityAssertions: 'passed',
  },
  provenance: {
    inputCsvSha256: sha256(csvPath),
    requestSha256: sha256(requestPath),
    forecastRunSha256: sha256(runPath),
  },
  target: request.targets[0].series_id,
  aggregation: request.frequency,
  contextSteps: contextLength,
  holdoutSteps: request.horizon,
  holdoutStart: holdout[0].week,
  holdoutEnd: holdout.at(-1).week,
  actual,
  model: {
    id: run.model_id,
    point: predicted,
    metrics: metrics(predicted),
    p10P90CoveragePercent: round((covered.filter(Boolean).length / covered.length) * 100, 2),
    meanP10P90Width: round(mean(p90.map((value, index) => value - p10[index]))),
    p50AboveActualSteps: p50AboveActual.filter(Boolean).length,
  },
  baselines: {
    persistence: {
      value: lastValue,
      metrics: metrics(baselines.persistence),
    },
    trailingFourWeekMean: {
      value: round(mean(lastFour)),
      metrics: metrics(baselines.trailingFourWeekMean),
    },
  },
  comparison: {
    beatsPersistenceOnWape: metrics(predicted).wapePercent < metrics(baselines.persistence).wapePercent,
    beatsTrailingFourWeekMeanOnWape: metrics(predicted).wapePercent < metrics(baselines.trailingFourWeekMean).wapePercent,
    initialHoldoutOnly: true,
    rollingOriginAcceptanceComplete: false,
  },
  dataQuality: {
    materialWarning: true,
    extremeContextWeeks: ['2025-11-17', '2026-02-02'],
    extremeContextRecordSharePercent: 73.39,
    interpretation: 'Likely import, migration, or backfill concentration until independently explained.',
  },
  decision: 'retain-evidence-only-and-require-robust-rolling-origin-review',
  forbiddenUses: ['spend', 'send', 'publish', 'conversion-claim', 'client-facing-performance-claim'],
};

fs.writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
