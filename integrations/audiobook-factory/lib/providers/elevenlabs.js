'use strict';
/**
 * ElevenLabs. The delivery voice for anything sold to a listener, and the
 * only option here that can clone Dr. Campbell's own voice.
 *
 * Long-form matters: previous_text / next_text carry prosody across segment
 * boundaries, and previous_request_ids stitches consecutive requests so the
 * seams between 2,400-character chunks stop being audible.
 */
const fs = require('fs');
const path = require('path');
const { withRetry, httpPost } = require('../http');
const { ensureDir } = require('../util');

const BASE = 'https://api.elevenlabs.io/v1';

module.exports = {
  label: 'ElevenLabs',
  requiresEnv: ['ELEVENLABS_API_KEY'],
  defaultModel: 'eleven_multilingual_v2',
  defaultVoice: 'JBFqnCBsd6RMkjVDRZzb',
  format: 'mp3',
  usdPerMillionChars: 100,
  maxChars: 4800,

  async synth({ text, outFile, voice, model, settings, context }) {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
    ensureDir(path.dirname(outFile));
    const s = settings || {};
    const ctx = context || {};

    const body = {
      text,
      model_id: model || this.defaultModel,
      voice_settings: {
        stability: s.stability != null ? s.stability : 0.5,
        similarity_boost: s.similarityBoost != null ? s.similarityBoost : 0.8,
        style: s.style != null ? s.style : 0.0,
        use_speaker_boost: s.speakerBoost !== false,
      },
    };
    if (s.seed != null) body.seed = s.seed;
    if (ctx.previousText) body.previous_text = ctx.previousText.slice(-600);
    if (ctx.nextText) body.next_text = ctx.nextText.slice(0, 600);
    if (ctx.previousRequestIds && ctx.previousRequestIds.length) {
      body.previous_request_ids = ctx.previousRequestIds.slice(-3);
    }

    const url = `${BASE}/text-to-speech/${voice || this.defaultVoice}?output_format=${s.outputFormat || 'mp3_44100_128'}`;
    const res = await withRetry(
      () => fetch(url, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify(body),
      }).then(async (r) => {
        if (!r.ok) {
          const err = new Error(`ElevenLabs HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
          err.status = r.status;
          throw err;
        }
        return { buf: Buffer.from(await r.arrayBuffer()), requestId: r.headers.get('request-id') };
      }),
      { label: 'elevenlabs tts' },
    );

    fs.writeFileSync(outFile, res.buf);
    return { file: outFile, chars: text.length, format: 'mp3', requestId: res.requestId };
  },

  /** Remaining quota, so a 400-page run fails before it starts rather than halfway. */
  async quota() {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return null;
    const r = await fetch(`${BASE}/user/subscription`, { headers: { 'xi-api-key': key } });
    if (!r.ok) return null;
    const j = await r.json();
    return { used: j.character_count, limit: j.character_limit, remaining: j.character_limit - j.character_count, tier: j.tier };
  },
};
