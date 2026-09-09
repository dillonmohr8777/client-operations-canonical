'use strict';
/**
 * QA gate. Every delivered file is measured against the output profile and
 * the result is a hard pass/fail, not a vibe. This is what lets Momentum
 * hand a client 20 audiobooks without listening to all 13 hours twice.
 *
 * Listening is still required for pronunciation and tone. This catches the
 * things a human ear is bad at judging consistently: level, peak, floor,
 * dropouts, and runtime outliers.
 */
const fs = require('fs');
const { FFMPEG, runQuiet, probeDuration, hms } = require('./util');
const { measureVolume, measureLoudness } = require('./master');

/** Per-frame RMS, used for a percentile-based noise floor. */
function frameRmsLevels(file) {
  const r = runQuiet(FFMPEG, [
    '-i', file, '-af',
    'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-',
    '-f', 'null', '-',
  ]);
  const levels = [];
  for (const m of String(r.out).matchAll(/RMS_level=(-?[\d.]+|-inf)/g)) {
    const v = m[1] === '-inf' ? -120 : parseFloat(m[1]);
    if (Number.isFinite(v)) levels.push(v);
  }
  return levels;
}

/**
 * Noise floor = 5th-percentile frame RMS, ignoring true digital silence.
 *
 * The quietest real frames are room tone and inter-sentence gaps, which is what
 * a retail QC check actually measures. Frames at or below DIGITAL_SILENCE_DB are
 * encoder padding (LAME writes silent frames at the head of every MP3) rather
 * than noise, and including them pins the answer at -120 dB on every file, which
 * looks like a spotless noise floor and measures nothing. A genuine mid-file
 * dropout is caught by longestSilence, not here.
 */
const DIGITAL_SILENCE_DB = -100;

function measureNoiseFloor(file) {
  const levels = frameRmsLevels(file)
    .filter((v) => v > DIGITAL_SILENCE_DB)
    .sort((a, b) => a - b);
  if (!levels.length) return null;
  return levels[Math.floor(levels.length * 0.05)];
}

/** Longest continuous silence, to catch a segment that failed to synthesize. */
function longestSilence(file, thresholdDb) {
  const r = runQuiet(FFMPEG, ['-i', file, '-af', `silencedetect=noise=${thresholdDb || -50}dB:d=1.0`, '-f', 'null', '-']);
  let longest = 0;
  for (const m of String(r.out).matchAll(/silence_duration:\s*([\d.]+)/g)) {
    longest = Math.max(longest, parseFloat(m[1]));
  }
  return longest;
}

function check(name, ok, actual, expected, severity) {
  return { name, ok, actual, expected, severity: severity || (ok ? 'info' : 'fail') };
}

/** Measure one delivered file and grade it against the profile. */
function inspect(file, profile, opts) {
  const o = opts || {};
  const loud = profile.loudness;
  const struct = profile.structure;
  const durationSec = probeDuration(file);
  const vol = measureVolume(file);
  const floor = measureNoiseFloor(file);
  const silence = longestSilence(file);
  const checks = [];

  if (loud.mode === 'lufs') {
    const m = measureLoudness(file, loud);
    const lufs = m ? parseFloat(m.input_i) : null;
    const tp = m ? parseFloat(m.input_tp) : vol.peakDb;
    checks.push(check('integrated loudness',
      lufs != null && Math.abs(lufs - loud.targetLufs) <= loud.lufsToleranceDb,
      lufs != null ? `${lufs.toFixed(1)} LUFS` : 'unmeasured',
      `${loud.targetLufs} +/- ${loud.lufsToleranceDb} LUFS`));
    checks.push(check('true peak',
      tp != null && tp <= loud.truePeakMaxDb + 0.3,
      tp != null ? `${tp.toFixed(1)} dBTP` : 'unmeasured',
      `<= ${loud.truePeakMaxDb} dBTP`));
  } else {
    checks.push(check('RMS level',
      vol.meanDb != null && Math.abs(vol.meanDb - loud.targetRmsDb) <= loud.rmsToleranceDb,
      vol.meanDb != null ? `${vol.meanDb.toFixed(1)} dB` : 'unmeasured',
      `${loud.targetRmsDb} +/- ${loud.rmsToleranceDb} dB`));
    checks.push(check('peak level',
      vol.peakDb != null && vol.peakDb <= loud.truePeakMaxDb + 0.3,
      vol.peakDb != null ? `${vol.peakDb.toFixed(1)} dB` : 'unmeasured',
      `<= ${loud.truePeakMaxDb} dB`));
  }

  if (loud.noiseFloorMaxDb != null) {
    checks.push(check('noise floor',
      floor != null && floor <= loud.noiseFloorMaxDb,
      floor != null ? `${floor.toFixed(1)} dB RMS` : 'unmeasured',
      `<= ${loud.noiseFloorMaxDb} dB RMS`));
  }

  checks.push(check('runtime within file cap',
    durationSec <= (struct.maxFileMinutes || 120) * 60,
    hms(durationSec), `<= ${struct.maxFileMinutes} min`));

  checks.push(check('no dropout',
    silence < (o.maxSilenceSec || 6),
    `${silence.toFixed(1)}s longest silence`,
    `< ${o.maxSilenceSec || 6}s`));

  checks.push(check('file present and non-trivial',
    fs.existsSync(file) && fs.statSync(file).size > 2048 && durationSec > 1,
    fs.existsSync(file) ? `${(fs.statSync(file).size / 1024).toFixed(0)} KB / ${hms(durationSec)}` : 'missing',
    'exists, > 2KB, > 1s'));

  return {
    file, durationSec,
    measured: { meanDb: vol.meanDb, peakDb: vol.peakDb, noiseFloorDb: floor, longestSilenceSec: silence },
    checks,
    pass: checks.every((c) => c.ok),
  };
}

/** Grade a whole book and flag chapters whose runtime is a statistical outlier. */
function inspectBook(files, profile, opts) {
  const results = files.map((f) => inspect(f, profile, opts));
  const durations = results.map((r) => r.durationSec).filter((d) => d > 0);
  const mean = durations.reduce((a, b) => a + b, 0) / (durations.length || 1);
  for (const r of results) {
    // A chapter under 15% of the mean is usually a truncated or failed synthesis.
    if (durations.length > 2 && r.durationSec < mean * 0.15) {
      r.checks.push(check('runtime plausible vs. book average', false,
        hms(r.durationSec), `>= 15% of ${hms(mean)} average`, 'warn'));
      r.pass = false;
    }
  }
  return {
    profile: profile.id,
    generated: new Date().toISOString(),
    fileCount: results.length,
    totalDurationSec: durations.reduce((a, b) => a + b, 0),
    passed: results.filter((r) => r.pass).length,
    failed: results.filter((r) => !r.pass).length,
    pass: results.every((r) => r.pass),
    results,
  };
}

function toMarkdown(report, title) {
  const L = [];
  L.push(`# QA report - ${title || 'audiobook'}`);
  L.push('');
  L.push(`- Profile: \`${report.profile}\``);
  L.push(`- Generated: ${report.generated}`);
  L.push(`- Files: ${report.fileCount} | Total runtime: ${hms(report.totalDurationSec)}`);
  L.push(`- **${report.pass ? 'PASS' : 'FAIL'}** (${report.passed} passed, ${report.failed} failed)`);
  L.push('');
  for (const r of report.results) {
    const name = r.file.split('/').pop();
    L.push(`## ${r.pass ? 'PASS' : 'FAIL'} - ${name}`);
    L.push('');
    L.push('| Check | Result | Measured | Required |');
    L.push('|---|---|---|---|');
    for (const c of r.checks) {
      L.push(`| ${c.name} | ${c.ok ? 'pass' : (c.severity === 'warn' ? 'warn' : 'FAIL')} | ${c.actual} | ${c.expected} |`);
    }
    L.push('');
  }
  return L.join('\n') + '\n';
}

module.exports = { inspect, inspectBook, toMarkdown, measureNoiseFloor, longestSilence, frameRmsLevels };
