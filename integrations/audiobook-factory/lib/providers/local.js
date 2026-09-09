'use strict';
/**
 * Offline proof voice (espeak-ng). Free, no key, no network.
 *
 * This is NOT a delivery voice. Its job is to prove the whole line before a
 * paid character is spent: chapter splits, pronunciation of client terms,
 * runtime per chapter, packaging, and QA all validate against it. On a
 * 400-page catalogue that is the difference between finding a bad chapter
 * split on page 300 for free versus paying to synthesize it twice.
 */
const fs = require('fs');
const path = require('path');
const { runQuiet, ensureDir } = require('../util');

module.exports = {
  label: 'espeak-ng (offline proof voice)',
  requiresEnv: [],
  defaultModel: 'espeak-ng',
  defaultVoice: 'en-us+m3',
  format: 'wav',
  usdPerMillionChars: 0,

  async synth({ text, outFile, voice, settings }) {
    ensureDir(path.dirname(outFile));
    const s = settings || {};
    const args = [
      '-v', voice || 'en-us+m3',
      '-s', String(s.wordsPerMinute || 150),
      '-p', String(s.pitch != null ? s.pitch : 42),
      '-g', String(s.wordGapMs != null ? s.wordGapMs : 3),
      '-w', outFile,
      text,
    ];
    const r = runQuiet('espeak-ng', args);
    if (!r.ok || !fs.existsSync(outFile)) {
      throw new Error(`espeak-ng failed: ${String(r.out).slice(0, 300)}`);
    }
    return { file: outFile, chars: text.length, format: 'wav' };
  },
};
