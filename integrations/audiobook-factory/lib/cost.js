'use strict';
const path = require('path');
const { readJson, ROOT } = require('./util');

const PRICING = readJson(path.join(ROOT, 'config', 'pricing.json'));

function pricing() { return PRICING; }

function pricingIsStale(today = new Date()) {
  return today > new Date(PRICING.expires + 'T23:59:59Z');
}

/** Characters -> finished audio seconds, using the narration constants. */
function charsToAudioSeconds(chars, wpm = PRICING.narration.wordsPerMinute) {
  const words = chars / PRICING.narration.charsPerWord;
  return (words / wpm) * 60;
}

function audioHoursToChars(hours) {
  return hours * PRICING.narration.charsPerFinishedHour;
}

function modelRate(vendorId, modelId) {
  const v = PRICING.vendors[vendorId];
  if (!v) throw new Error(`unknown vendor: ${vendorId}`);
  const m = v.models[modelId];
  if (!m) throw new Error(`unknown model for ${vendorId}: ${modelId} (have: ${Object.keys(v.models).join(', ')})`);
  return m;
}

/**
 * Cost for a character volume on one vendor/model, honouring monthly free tiers.
 * freeCharsAvailable lets the caller model "we already burned some of the free tier".
 */
function costFor(vendorId, modelId, chars, opts = {}) {
  const m = modelRate(vendorId, modelId);
  const free = opts.ignoreFreeTier ? 0 : Math.min(chars, m.freeCharsPerMonth || 0);
  const billable = Math.max(0, chars - free);
  const usd = (billable / 1e6) * m.usdPerMillionChars;
  return {
    vendor: vendorId,
    model: modelId,
    quality: m.quality,
    chars,
    freeChars: free,
    billableChars: billable,
    usdPerMillionChars: m.usdPerMillionChars,
    usd: Math.round(usd * 100) / 100,
    audioSeconds: charsToAudioSeconds(chars),
  };
}

/** Every vendor/model priced against the same character volume, cheapest first. */
function compareAll(chars, opts = {}) {
  const rows = [];
  for (const [vid, v] of Object.entries(PRICING.vendors)) {
    for (const mid of Object.keys(v.models)) {
      if (opts.qualityAtLeast === 'delivery' && v.models[mid].quality !== 'delivery') continue;
      rows.push({ ...costFor(vid, mid, chars, opts), vendorLabel: v.label, tier: v.tier });
    }
  }
  return rows.sort((a, b) => a.usd - b.usd);
}

/** Low / mid / high catalogue sizing from a page-count range. */
function estimateFromPages({ courses, pagesLow, pagesHigh, wordsPerPage = 300 }) {
  const cpw = PRICING.narration.charsPerWord;
  const mk = (pages) => {
    const totalPages = courses * pages;
    const words = totalPages * wordsPerPage;
    const chars = Math.round(words * cpw);
    return { pagesPerCourse: pages, totalPages, words, chars, audioSeconds: charsToAudioSeconds(chars) };
  };
  const low = mk(pagesLow);
  const high = mk(pagesHigh);
  const mid = mk((pagesLow + pagesHigh) / 2);
  return { courses, wordsPerPage, low, mid, high };
}

module.exports = { pricing, pricingIsStale, charsToAudioSeconds, audioHoursToChars, modelRate, costFor, compareAll, estimateFromPages };
