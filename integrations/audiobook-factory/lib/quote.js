'use strict';
/**
 * Quote engine. Prices a catalogue from measured character volume plus the
 * labour it actually takes, then applies a target margin.
 *
 * The point of computing rather than guessing: TTS API spend is rounding error
 * (tens of dollars across a whole catalogue), so any quote anchored to "the AI
 * cost" is wrong by an order of magnitude in both directions. The cost that
 * matters is prep, proof-listening and QA per course.
 */
const path = require('path');
const { readJson, ROOT } = require('./util');
const cost = require('./cost');

const RATES = readJson(path.join(ROOT, 'config', 'rates.json'));

function rates() { return RATES; }

function tier(id) {
  const t = RATES.tiers.find((x) => x.id === id);
  if (!t) throw new Error(`unknown tier "${id}". available: ${RATES.tiers.map((x) => x.id).join(', ')}`);
  return t;
}

function sum(obj) { return Object.values(obj).reduce((a, b) => a + b, 0); }

/**
 * Price one catalogue at one tier.
 * `chars` is the measured (or estimated) billable character volume.
 */
function quote({ courses, chars, tierId = 'signature', internalHourlyCost }) {
  const t = tier(tierId);
  const L = RATES.labor;
  const hourly = internalHourlyCost || L.internalHourlyCost;

  const perCourseHours = sum(L.perCourseHours) * t.laborMultiplier;
  const oneTimeHours = sum(L.oneTimeHours) * t.laborMultiplier;
  const totalHours = perCourseHours * courses + oneTimeHours;

  const api = cost.costFor(t.engine.provider, t.engine.model, chars);
  const laborCost = totalHours * hourly;
  const totalCost = laborCost + api.usd;

  const margin = t.targetMarginPct / 100;
  const price = totalCost / (1 - margin);

  const audioHours = cost.charsToAudioSeconds(chars) / 3600;
  const M = RATES.market;

  return {
    tier: t,
    courses,
    chars,
    audioHours,
    engine: t.engine,
    api,
    labor: {
      hourlyCost: hourly,
      perCourseHours: Math.round(perCourseHours * 100) / 100,
      oneTimeHours: Math.round(oneTimeHours * 100) / 100,
      totalHours: Math.round(totalHours * 10) / 10,
      cost: Math.round(laborCost * 100) / 100,
    },
    totalCost: Math.round(totalCost * 100) / 100,
    price: Math.round(price / 50) * 50,
    pricePerCourse: Math.round((price / courses) / 5) * 5,
    pricePerFinishedHour: Math.round(price / audioHours),
    marginPct: t.targetMarginPct,
    humanComparison: {
      narrationOnlyLow: Math.round(audioHours * M.humanNarrationPfhLow),
      narrationOnlyHigh: Math.round(audioHours * M.humanNarrationPfhHigh),
      fullProductionLow: courses * M.humanFullProductionPerTitleLow,
      fullProductionHigh: courses * M.humanFullProductionPerTitleHigh,
    },
  };
}

function quoteAllTiers(opts) {
  return RATES.tiers.map((t) => quote(Object.assign({}, opts, { tierId: t.id })));
}

/**
 * Price a single-course pilot.
 *
 * Naively quoting `quote({courses: 1})` loads the entire one-time setup onto
 * one course and lands near the price of the whole catalogue, which is not a
 * sellable offer. A pilot only needs the setup that the pilot itself consumes
 * (voice, lexicon, credits template); distribution setup and catalogue sign-off
 * belong to the full engagement. The pilot fee is credited against the
 * catalogue if the client proceeds, so it is a deposit, not a surcharge.
 */
function pilotQuote({ chars, tierId = 'signature', internalHourlyCost }) {
  const t = tier(tierId);
  const L = RATES.labor;
  const hourly = internalHourlyCost || L.internalHourlyCost;

  const setupForPilot = (L.oneTimeHours.voiceSetupOrClone + L.oneTimeHours.lexiconBuild +
    L.oneTimeHours.creditsAndBrandTemplate) * t.laborMultiplier;
  const courseHours = sum(L.perCourseHours) * t.laborMultiplier;
  const hours = setupForPilot + courseHours;

  const api = cost.costFor(t.engine.provider, t.engine.model, chars);
  const totalCost = hours * hourly + api.usd;
  // A pilot carries a lower margin on purpose: it buys the catalogue decision.
  const price = totalCost / (1 - 0.55);

  return {
    tier: t,
    hours: Math.round(hours * 10) / 10,
    api,
    totalCost: Math.round(totalCost * 100) / 100,
    price: Math.round(price / 50) * 50,
    creditedAgainstCatalogue: true,
  };
}

module.exports = { quote, quoteAllTiers, pilotQuote, rates, tier };
