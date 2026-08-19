'use strict';
/**
 * Provider registry. Every provider exposes the same shape:
 *   synth({ text, outFile, voice, model, settings, context }) -> { file, chars, format }
 *
 * API keys are read from the environment at call time and never logged,
 * persisted, or echoed. Swapping the delivery voice is a --provider flag.
 */
const { withRetry, httpPost } = require('../http');

const providers = {
  local: require('./local'),
  elevenlabs: require('./elevenlabs'),
  openai: require('./openai'),
  google: require('./google'),
  azure: require('./azure'),
};

function get(name) {
  const p = providers[name];
  if (!p) throw new Error(`unknown provider "${name}". available: ${Object.keys(providers).join(', ')}`);
  return p;
}

function list() {
  return Object.entries(providers).map(([id, p]) => ({
    id,
    label: p.label,
    requiresEnv: p.requiresEnv || [],
    ready: (p.requiresEnv || []).every((k) => !!process.env[k]),
    defaultModel: p.defaultModel,
    defaultVoice: p.defaultVoice,
  }));
}

module.exports = { get, list, withRetry, httpPost, providers };
