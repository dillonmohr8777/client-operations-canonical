'use strict';
/**
 * OpenAI TTS. Cheapest credible delivery voice, ~7x under ElevenLabs.
 * No voice cloning: you pick from the stock voice set.
 * gpt-4o-mini-tts accepts a plain-English `instructions` string that steers
 * tone, which is how you get "measured, warm, authoritative" out of it.
 */
const fs = require('fs');
const path = require('path');
const { withRetry } = require('../http');
const { ensureDir } = require('../util');

module.exports = {
  label: 'OpenAI TTS',
  requiresEnv: ['OPENAI_API_KEY'],
  defaultModel: 'gpt-4o-mini-tts',
  defaultVoice: 'onyx',
  format: 'mp3',
  usdPerMillionChars: 15,
  maxChars: 4000,

  async synth({ text, outFile, voice, model, settings }) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not set');
    ensureDir(path.dirname(outFile));
    const s = settings || {};

    const body = {
      model: model || this.defaultModel,
      voice: voice || this.defaultVoice,
      input: text,
      response_format: s.outputFormat || 'mp3',
    };
    if (s.instructions && String(body.model).startsWith('gpt-4o')) body.instructions = s.instructions;
    if (s.speed != null) body.speed = s.speed;

    const buf = await withRetry(
      () => fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(async (r) => {
        if (!r.ok) {
          const err = new Error(`OpenAI HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
          err.status = r.status;
          throw err;
        }
        return Buffer.from(await r.arrayBuffer());
      }),
      { label: 'openai tts' },
    );

    fs.writeFileSync(outFile, buf);
    return { file: outFile, chars: text.length, format: 'mp3' };
  },
};
