'use strict';
/**
 * Mastering. Raw TTS output is not a deliverable: it is loud in the wrong
 * places, has no room tone, and drifts in level between segments. This module
 * concatenates a chapter's segments and masters the result to a named profile
 * (ACX RMS spec, or LUFS for podcast/LMS).
 *
 * Loudness is measured then applied in two passes, because single-pass
 * loudnorm only approximates the target and ACX rejects on exactly that.
 */
const fs = require('fs');
const path = require('path');
const { FFMPEG, runQuiet, ensureDir, probeDuration } = require('./util');

/** Voice-shaping chain applied before loudness. Order matters. */
function voiceChain(opts) {
  const o = opts || {};
  const links = [
    `highpass=f=${o.highpassHz || 80}`,                 // kill rumble/DC
    `lowpass=f=${o.lowpassHz || 14000}`,                // tame synthetic fizz
    'deesser=i=0.4',                                    // sibilance
    `acompressor=threshold=${o.compThresholdDb || -18}dB:ratio=${o.compRatio || 3}:attack=5:release=140:makeup=1`,
  ];
  if (o.denoise !== false) links.splice(1, 0, 'afftdn=nf=-30');
  return links.join(',');
}

/**
 * Generate a room-tone file at a target RMS level. Digital silence sounds dead
 * and reads as a dropout; ACX also measures a noise floor, so the tone is
 * generated then measured and corrected rather than trusted.
 *
 * `roomToneDb` is the target RMS in dBFS (not peak amplitude).
 */
function makeRoomTone(seconds, outFile, opts) {
  const o = opts || {};
  const targetRms = o.roomToneDb != null ? o.roomToneDb : -65;
  const sr = o.sampleRate || 44100;
  ensureDir(path.dirname(outFile));

  const raw = outFile + '.raw.wav';
  let r = runQuiet(FFMPEG, [
    '-y', '-f', 'lavfi',
    `-i`, `anoisesrc=d=${seconds}:c=pink:r=${sr}:a=0.05`,
    '-ac', '1', '-c:a', 'pcm_s16le', raw,
  ]);
  if (!r.ok) throw new Error(`room tone generation failed: ${String(r.out).slice(-400)}`);

  const v = measureVolume(raw);
  const gain = v.meanDb == null ? 0 : (targetRms - v.meanDb);
  r = runQuiet(FFMPEG, ['-y', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB`, '-ac', '1', '-c:a', 'pcm_s16le', outFile]);
  try { fs.unlinkSync(raw); } catch { /* best effort */ }
  if (!r.ok) throw new Error(`room tone level correction failed: ${String(r.out).slice(-400)}`);
  return outFile;
}

/** Concatenate files via the concat demuxer, normalizing everything to PCM first. */
function concatToWav(files, outFile, sampleRate) {
  const sr = sampleRate || 44100;
  ensureDir(path.dirname(outFile));
  const listFile = outFile + '.list.txt';
  fs.writeFileSync(listFile, files.map((f) => `file '${path.resolve(f).replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const r = runQuiet(FFMPEG, [
    '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-ar', String(sr), '-ac', '1', '-c:a', 'pcm_s16le', outFile,
  ]);
  fs.unlinkSync(listFile);
  if (!r.ok) throw new Error(`concat failed: ${String(r.out).slice(-500)}`);
  return outFile;
}

/** Pass 1 of loudnorm: measure. Returns the JSON block ffmpeg prints to stderr. */
function measureLoudness(file, target) {
  const r = runQuiet(FFMPEG, [
    '-i', file, '-af',
    `loudnorm=I=${target.targetLufs}:TP=${target.truePeakMaxDb}:LRA=${target.loudnessRangeMax || 8}:print_format=json`,
    '-f', 'null', '-',
  ]);
  const out = String(r.out);
  const m = out.match(/\{[\s\S]*?\}/g);
  if (!m) return null;
  try { return JSON.parse(m[m.length - 1]); } catch { return null; }
}

/** Mean/peak level, used for the ACX RMS spec and for QA. */
function measureVolume(file) {
  const r = runQuiet(FFMPEG, ['-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
  const out = String(r.out);
  const mean = out.match(/mean_volume:\s*(-?[\d.]+) dB/);
  const peak = out.match(/max_volume:\s*(-?[\d.]+) dB/);
  return {
    meanDb: mean ? parseFloat(mean[1]) : null,
    peakDb: peak ? parseFloat(peak[1]) : null,
  };
}

/**
 * Master one chapter: segments -> shaped, level-correct, room-toned file.
 */
function masterChapter({ segmentFiles, outFile, profile, workDir, voiceOpts }) {
  const audio = profile.audio;
  const loud = profile.loudness;
  const struct = profile.structure;
  ensureDir(workDir);
  ensureDir(path.dirname(outFile));

  const sr = audio.sampleRate || 44100;
  const base = path.basename(outFile).replace(/\.[^.]+$/, '');

  // Interleave a short breath between segments so paragraph seams sound intentional.
  const gap = makeRoomTone(voiceOpts && voiceOpts.segmentGapSec != null ? voiceOpts.segmentGapSec : 0.45,
    path.join(workDir, `${base}.gap.wav`), { sampleRate: sr, roomToneDb: loud.noiseFloorMaxDb ? loud.noiseFloorMaxDb - 5 : -65 });

  const interleaved = [];
  segmentFiles.forEach((f, i) => { if (i > 0) interleaved.push(gap); interleaved.push(f); });

  const joined = concatToWav(interleaved, path.join(workDir, `${base}.joined.wav`), sr);

  // Voice shaping.
  const shaped = path.join(workDir, `${base}.shaped.wav`);
  let r = runQuiet(FFMPEG, ['-y', '-i', joined, '-af', voiceChain(voiceOpts), '-ar', String(sr), '-ac', '1', '-c:a', 'pcm_s16le', shaped]);
  if (!r.ok) throw new Error(`voice shaping failed: ${String(r.out).slice(-500)}`);

  // Loudness.
  const leveled = path.join(workDir, `${base}.leveled.wav`);
  if (loud.mode === 'lufs') {
    const m = measureLoudness(shaped, loud);
    let af;
    if (m && Number.isFinite(parseFloat(m.input_i))) {
      af = `loudnorm=I=${loud.targetLufs}:TP=${loud.truePeakMaxDb}:LRA=${loud.loudnessRangeMax || 8}` +
        `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}` +
        `:offset=${m.target_offset || 0}:linear=true:print_format=summary`;
    } else {
      af = `loudnorm=I=${loud.targetLufs}:TP=${loud.truePeakMaxDb}:LRA=${loud.loudnessRangeMax || 8}`;
    }
    r = runQuiet(FFMPEG, ['-y', '-i', shaped, '-af', af, '-ar', String(sr), '-ac', '1', '-c:a', 'pcm_s16le', leveled]);
  } else {
    // ACX is an RMS spec: measure mean level, apply the exact make-up gain, then limit.
    const v = measureVolume(shaped);
    const gain = v.meanDb == null ? 0 : (loud.targetRmsDb - v.meanDb);
    const limitAmp = Math.pow(10, loud.truePeakMaxDb / 20).toFixed(4);
    r = runQuiet(FFMPEG, ['-y', '-i', shaped, '-af',
      `volume=${gain.toFixed(2)}dB,alimiter=limit=${limitAmp}:level=disabled`,
      '-ar', String(sr), '-ac', '1', '-c:a', 'pcm_s16le', leveled]);
  }
  if (!r.ok) throw new Error(`loudness stage failed: ${String(r.out).slice(-500)}`);

  // Head and tail room tone, then encode to the profile's delivery format.
  const head = makeRoomTone(struct.headRoomToneSec || 0.5, path.join(workDir, `${base}.head.wav`), { sampleRate: sr, roomToneDb: -65 });
  const tail = makeRoomTone(struct.tailRoomToneSec || 2.0, path.join(workDir, `${base}.tail.wav`), { sampleRate: sr, roomToneDb: -65 });
  const withTone = concatToWav([head, leveled, tail], path.join(workDir, `${base}.toned.wav`), sr);

  const encArgs = ['-y', '-i', withTone, '-ar', String(sr), '-ac', String(audio.channels || 1)];
  if (audio.codec === 'libmp3lame') encArgs.push('-c:a', 'libmp3lame', '-b:a', `${audio.bitrateKbps}k`);
  else if (audio.codec === 'aac') encArgs.push('-c:a', 'aac', '-b:a', `${audio.bitrateKbps}k`);
  else encArgs.push('-c:a', 'pcm_s16le');
  encArgs.push(outFile);

  r = runQuiet(FFMPEG, encArgs);
  if (!r.ok) throw new Error(`encode failed: ${String(r.out).slice(-500)}`);

  return { file: outFile, durationSec: probeDuration(outFile), bytes: fs.statSync(outFile).size };
}

module.exports = { masterChapter, makeRoomTone, concatToWav, measureLoudness, measureVolume, voiceChain };
