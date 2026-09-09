'use strict';
/**
 * Google Cloud Text-to-Speech. Chirp 3 HD ships 1,000,000 free characters a
 * month, which covers this entire catalogue at zero API cost if the run is
 * spread across two billing months.
 */
const fs = require('fs');
const path = require('path');
const { withRetry, httpPost } = require('../http');
const { ensureDir } = require('../util');

module.exports = {
  label: 'Google Cloud Text-to-Speech',
  requiresEnv: ['GOOGLE_TTS_API_KEY'],
  defaultModel: 'chirp-3-hd',
  defaultVoice: 'en-US-Chirp3-HD-Charon',
  format: 'mp3',
  usdPerMillionChars: 30,
  maxChars: 4800,

  async synth({ text, outFile, voice, settings }) {
    const key = process.env.GOOGLE_TTS_API_KEY;
    if (!key) throw new Error('GOOGLE_TTS_API_KEY is not set');
    ensureDir(path.dirname(outFile));
    const s = settings || {};
    const voiceName = voice || this.defaultVoice;

    const body = {
      input: { text },
      voice: { languageCode: s.languageCode || voiceName.split('-').slice(0, 2).join('-'), name: voiceName },
      audioConfig: {
        audioEncoding: 'MP3',
        sampleRateHertz: s.sampleRate || 44100,
        speakingRate: s.speakingRate || 1.0,
        pitch: s.pitch || 0.0,
        effectsProfileId: s.effectsProfile || ['headphone-class-device'],
      },
    };

    const json = await withRetry(
      () => httpPost(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      { label: 'google tts' },
    );

    if (!json.audioContent) throw new Error('Google TTS returned no audioContent');
    fs.writeFileSync(outFile, Buffer.from(json.audioContent, 'base64'));
    return { file: outFile, chars: text.length, format: 'mp3' };
  },
};
