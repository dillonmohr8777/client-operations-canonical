'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); return p; }
function sha1(s) { return crypto.createHash('sha1').update(s).digest('hex'); }
function slug(s) {
  return String(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 60) || 'untitled';
}
function pad(n, w = 2) { return String(n).padStart(w, '0'); }
function usd(n) { return '$' + Number(n).toFixed(2); }

function hms(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Resolve an ffmpeg/ffprobe binary: PATH first, then the npm ffmpeg-static fallback. */
function bin(name) {
  try { return execFileSync('sh', ['-c', `command -v ${name}`], { encoding: 'utf8' }).trim() || name; }
  catch { return name; }
}
const FFMPEG = bin('ffmpeg');
const FFPROBE = bin('ffprobe');

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}
/**
 * Run a command capturing BOTH streams. ffmpeg writes its loudnorm and
 * volumedetect reports to stderr, so stdout-only capture silently loses every
 * measurement the mastering and QA stages depend on.
 */
function runQuiet(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || '') + (r.stderr || '');
  return { ok: r.status === 0 && !r.error, out, status: r.status, err: r.error };
}

/** ffprobe a media file for duration in seconds. */
function probeDuration(file) {
  const r = runQuiet(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  if (!r.ok) return 0;
  const v = parseFloat(String(r.out).trim());
  return Number.isFinite(v) ? v : 0;
}

/** Character count that matches how vendors bill: the exact string sent to the API. */
function billableChars(text) { return String(text).length; }

function log(...a) { console.log(...a); }
function warn(...a) { console.warn('  ! ', ...a); }

module.exports = {
  ROOT, readJson, writeJson, ensureDir, sha1, slug, pad, usd, hms,
  FFMPEG, FFPROBE, run, runQuiet, probeDuration, billableChars, log, warn,
};
