'use strict';
/**
 * Turn extracted source text into a narration script:
 * chapterize -> normalize for the ear -> segment into TTS-safe chunks.
 *
 * The normalizer is deliberately conservative. Anything it cannot safely
 * speak it FLAGS for a human rather than silently guessing, because a wrong
 * pronunciation in a leadership course is worse than a held release.
 */
const { sha1, slug } = require('./util');

/* ---------------------------------------------------------------- headings */

const HEADING_RE = /^(#{1,4})\s+(.*)$/;
const NUMBERED_HEADING_RE = /^((chapter|module|lesson|section|part|unit|appendix)\s+([0-9]+|[ivxlc]+|one|two|three|four|five|six|seven|eight|nine|ten))\b[:.\s-]*(.*)$/i;

function looksLikeHeading(line) {
  const t = line.trim();
  if (!t || t.length > 90) return false;
  if (NUMBERED_HEADING_RE.test(t)) return true;
  if (/^[A-Z0-9 '&,:-]{4,90}$/.test(t) && /[A-Z]{2,}/.test(t) && !/[.!?]$/.test(t)) return true;
  return false;
}

/** Split text into chapters at heading boundaries. */
function chapterize(text, opts = {}) {
  const minChars = opts.minChapterChars || 400;
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const chapters = [];
  let current = { title: opts.defaultTitle || 'Introduction', level: 1, lines: [] };

  for (const line of lines) {
    const md = line.match(HEADING_RE);
    let title = null;
    let level = 1;
    if (md) { level = md[1].length; title = md[2].trim(); }
    else if (looksLikeHeading(line)) { title = line.trim(); level = 1; }

    if (title) {
      if (current.lines.join('\n').trim()) chapters.push(current);
      current = { title, level, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.join('\n').trim() || chapters.length === 0) chapters.push(current);

  // Merge runt chapters so we do not ship 8-second "chapters". A runt with a
  // previous chapter folds backward into it; a runt at the very top has nothing
  // behind it, so it is held and folds forward into whatever comes next.
  const merged = [];
  let pending = null;
  for (const ch of chapters) {
    let title = ch.title;
    let level = ch.level;
    let body = ch.lines.join('\n').trim();

    if (pending) {
      body = (pending.body + '\n\n' + title + '\n\n' + body).trim();
      title = pending.title;
      level = pending.level;
      pending = null;
    }

    if (body.length < minChars) {
      const prev = merged[merged.length - 1];
      if (prev) prev.body += '\n\n' + title + '\n\n' + body;
      else pending = { title, level, body };
      continue;
    }
    merged.push({ title, level, body });
  }
  // Held runt that nothing ever followed: keep it rather than drop content.
  if (pending && pending.body.trim()) merged.push(pending);

  return merged.filter((c) => c.body.trim().length > 0);
}

/* -------------------------------------------------------------- normalizer */

const ABBREV = [
  [/\bDr\./g, 'Doctor'], [/\bProf\./g, 'Professor'], [/\bMr\./g, 'Mister'],
  [/\bMrs\./g, 'Missus'], [/\bMs\./g, 'Miz'], [/\bSt\./g, 'Saint'],
  [/\bvs\.?\b/gi, 'versus'], [/\be\.g\.,?/gi, 'for example,'], [/\bi\.e\.,?/gi, 'that is,'],
  [/\betc\./gi, 'et cetera'], [/\bapprox\./gi, 'approximately'], [/\bFig\.\s*(\d+)/gi, 'Figure $1'],
  [/\bU\.S\.A?\./g, 'U S'], [/\bPh\.D\.?/g, 'P H D'], [/\bcf\./gi, 'compare'],
  [/\bNo\.\s*(\d)/g, 'Number $1'], [/&/g, ' and '],
];

const ORDINALS = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth' };

/** Language that only works with something on screen. Audio must not inherit it. */
const VISUAL_PATTERNS = [
  [/\bclick (here|the|on)\b/i, 'on-screen instruction'],
  [/\b(see|as shown|shown|pictured|depicted) (in )?(the )?(figure|diagram|table|chart|image|graphic|slide|screenshot)\b/i, 'visual reference'],
  [/\b(below|above|on the (left|right)|the following (table|diagram|chart))\b/i, 'spatial reference'],
  [/\b(fill in|write in|circle|check|tick) the (blank|box|answer)\b/i, 'worksheet instruction'],
  [/\b(download|print out|print) (the|this|your)\b/i, 'downloadable asset'],
  [/\b(pause|rewind|replay|watch) (the|this) video\b/i, 'video-only instruction'],
  [/\bscan the qr\b/i, 'QR code'],
  [/https?:\/\/\S+/i, 'raw URL'],
  [/\b[\w.+-]+@[\w-]+\.[\w.]+\b/i, 'email address'],
  [/\btable of contents\b/i, 'front matter'],
];

function stripMarkup(t) {
  return String(t)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*(\d+)[.)]\s+/gm, (m, d) => (ORDINALS[+d] ? ORDINALS[+d] + ', ' : ''));
}

function speakNumbers(t) {
  return String(t)
    .replace(/\$([\d,]+(?:\.\d{2})?)/g, (m, n) => n.replace(/,/g, '') + ' dollars')
    .replace(/(\d+(?:\.\d+)?)\s?%/g, '$1 percent')
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, (m, n) => ORDINALS[+n] || m)
    .replace(/(\d),(\d{3})\b/g, '$1$2')
    .replace(/\b(\d+)\s*[-–]\s*(\d+)\b/g, '$1 to $2');
}

/** P.A.C.T. becomes "P. A. C. T." so engines spell it instead of guessing a word. */
function spellDottedAcronyms(t) {
  return String(t).replace(/\b(?:[A-Z]\.){2,}[A-Z]?\.?/g, (m) => {
    return m.replace(/\./g, '').split('').join('. ') + '.';
  });
}

function applyLexicon(t, lexicon) {
  let out = String(t);
  for (const [term, say] of Object.entries(lexicon || {})) {
    const re = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    out = out.replace(re, say);
  }
  return out;
}

function findFlags(text) {
  const flags = [];
  for (const s of splitSentences(text)) {
    for (const [re, kind] of VISUAL_PATTERNS) {
      if (re.test(s)) { flags.push({ kind, sentence: s.trim().slice(0, 200) }); break; }
    }
  }
  return flags;
}

/**
 * Normalize a chapter body for the ear.
 * Returns the speakable text plus anything a human needs to look at.
 */
function normalizeForNarration(raw, opts) {
  const options = opts || {};
  const lexicon = options.lexicon || {};
  const flags = findFlags(raw);

  let t = stripMarkup(raw);
  t = applyLexicon(t, lexicon);      // lexicon first: it may contain dotted forms
  t = spellDottedAcronyms(t);
  for (const [re, rep] of ABBREV) t = t.replace(re, rep);
  t = speakNumbers(t);

  t = t
    .replace(/https?:\/\/(?:www\.)?([^\s/]+)\S*/g, (m, host) => host.replace(/\./g, ' dot '))
    .replace(/([\w.+-]+)@([\w-]+)\.([\w.]+)/g, '$1 at $2 dot $3')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\.{3,}/g, ', ')
    .replace(/\(([^)]{1,80})\)/g, ', $1,')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { text: t, flags };
}

/* --------------------------------------------------------------- segmenting */

const ABBR_SET = new Set(['mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'jr', 'sr', 'vs', 'etc', 'inc', 'ltd', 'co', 'approx', 'no', 'fig', 'vol', 'ed']);

/**
 * Sentence split by index scan. Skips a period that ends a known abbreviation
 * or a single capital letter, so "Dr. Campbell" and a spelled "P. A. C. T."
 * stay in one piece.
 */
function splitSentences(text) {
  const t = String(text);
  const bounds = [];
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c !== '.' && c !== '!' && c !== '?') continue;
    if (!/^\s+["'(]?[A-Z0-9]/.test(t.slice(i + 1, i + 8))) continue;
    if (c === '.') {
      const m = t.slice(Math.max(0, i - 12), i).match(/([A-Za-z]+)$/);
      const w = m ? m[1] : '';
      if (ABBR_SET.has(w.toLowerCase())) continue;
      if (w.length === 1 && /[A-Z]/.test(w)) continue;
    }
    bounds.push(i + 1);
  }
  const out = [];
  let start = 0;
  for (const b of bounds) { out.push(t.slice(start, b).trim()); start = b; }
  out.push(t.slice(start).trim());
  return out.filter((s) => s.length > 0);
}

/**
 * Chunk a chapter into request-sized segments, never mid-sentence.
 * Paragraph boundaries are preserved so the engine keeps its breath pauses.
 */
function segment(text, maxChars) {
  const cap = maxChars || 2400;
  const segments = [];
  let buf = '';
  const flush = () => { if (buf.trim()) segments.push(buf.trim()); buf = ''; };

  for (const para of String(text).split(/\n\s*\n/)) {
    const p = para.trim();
    if (!p) continue;
    if ((buf + '\n\n' + p).length <= cap) { buf = buf ? buf + '\n\n' + p : p; continue; }
    flush();
    if (p.length <= cap) { buf = p; continue; }
    for (const s of splitSentences(p)) {
      if ((buf + ' ' + s).length <= cap) { buf = buf ? buf + ' ' + s : s; continue; }
      flush();
      if (s.length <= cap) { buf = s; continue; }
      // A single sentence longer than the cap: break on commas as a last resort.
      let rest = s;
      while (rest.length > cap) {
        let cut = rest.lastIndexOf(', ', cap);
        if (cut < cap * 0.4) cut = rest.lastIndexOf(' ', cap);
        if (cut <= 0) cut = cap;
        segments.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      buf = rest;
    }
  }
  flush();
  return segments;
}

/* ----------------------------------------------------------------- assembly */

function buildScript(opts) {
  const { title, author, sources } = opts;
  const lexicon = opts.lexicon || {};
  const maxChars = opts.maxChars || 2400;
  const minChapterChars = opts.minChapterChars || 400;
  const credits = opts.credits || {};
  const chapters = [];
  const allFlags = [];

  for (const src of sources) {
    for (const ch of chapterize(src.text, { defaultTitle: src.title, minChapterChars })) {
      const norm = normalizeForNarration(ch.body, { lexicon });
      if (!norm.text.trim()) continue;
      const segs = segment(norm.text, maxChars);
      const chars = segs.reduce((n, s) => n + s.length, 0);
      const id = String(chapters.length + 1).padStart(2, '0') + '-' + slug(ch.title);
      chapters.push({
        id,
        index: chapters.length + 1,
        title: ch.title,
        sourceFile: src.file,
        chars,
        segments: segs.map((textSeg, i) => ({
          id: id + '#' + String(i + 1).padStart(3, '0'),
          hash: sha1(textSeg),
          chars: textSeg.length,
          text: textSeg,
        })),
      });
      for (const f of norm.flags) allFlags.push(Object.assign({}, f, { chapter: ch.title, sourceFile: src.file }));
    }
  }

  if (credits.opening) {
    chapters.unshift({
      id: '00-opening-credits', index: 0, title: 'Opening Credits', sourceFile: '(generated)',
      chars: credits.opening.length,
      segments: [{ id: '00-opening-credits#001', hash: sha1(credits.opening), chars: credits.opening.length, text: credits.opening }],
    });
  }
  if (credits.closing) {
    chapters.push({
      id: '99-closing-credits', index: chapters.length, title: 'Closing Credits', sourceFile: '(generated)',
      chars: credits.closing.length,
      segments: [{ id: '99-closing-credits#001', hash: sha1(credits.closing), chars: credits.closing.length, text: credits.closing }],
    });
  }

  chapters.forEach((c, i) => { c.index = i + 1; });
  return {
    title,
    author,
    generated: new Date().toISOString(),
    totalChars: chapters.reduce((n, c) => n + c.chars, 0),
    totalSegments: chapters.reduce((n, c) => n + c.segments.length, 0),
    chapterCount: chapters.length,
    flags: allFlags,
    chapters,
  };
}

module.exports = { chapterize, normalizeForNarration, segment, splitSentences, buildScript, findFlags, looksLikeHeading };
