'use strict';
/**
 * Azure AI Speech. Worth it only if the client is already on Azure or the
 * volume justifies a commitment tier ($7.50/1M vs $22 pay-as-you-go).
 * Azure speaks SSML, which gives the most direct control over pauses.
 */
const fs = require('fs');
const path = require('path');
const { withRetry } = require('../http');
const { ensureDir } = require('../util');

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

module.exports = {
  label: 'Azure AI Speech',
  requiresEnv: ['AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION'],
  defaultModel: 'neural-hd',
  defaultVoice: 'en-US-AndrewMultilingualNeural',
  format: 'mp3',
  usdPerMillionChars: 22,
  maxChars: 4800,

  async synth({ text, outFile, voice, settings }) {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region) throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION must both be set');
    ensureDir(path.dirname(outFile));
    const s = settings || {};
    const voiceName = voice || this.defaultVoice;

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">` +
      `<voice name="${voiceName}">` +
      `<mstts:express-as style="${s.style || 'narration-professional'}">` +
      `<prosody rate="${s.rate || '0%'}" pitch="${s.pitch || '0%'}">${escapeXml(text)}</prosody>` +
      `</mstts:express-as></voice></speak>`;

    const buf = await withRetry(
      () => fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': s.outputFormat || 'audio-48khz-192kbitrate-mono-mp3',
          'User-Agent': 'audiobook-factory',
        },
        body: ssml,
      }).then(async (r) => {
        if (!r.ok) {
          const err = new Error(`Azure HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
          err.status = r.status;
          throw err;
        }
        return Buffer.from(await r.arrayBuffer());
      }),
      { label: 'azure tts' },
    );

    fs.writeFileSync(outFile, buf);
    return { file: outFile, chars: text.length, format: 'mp3' };
  },
};
