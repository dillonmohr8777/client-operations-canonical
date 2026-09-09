'use strict';
/**
 * Packaging. Turns mastered chapter files into the things a client can
 * actually publish: a chaptered M4B, per-chapter files, a chapter sheet, a
 * private-podcast RSS feed, and a manifest.
 *
 * Chapter marks are written as ffmetadata so players show real chapter names
 * rather than "Track 07".
 */
const fs = require('fs');
const path = require('path');
const { FFMPEG, runQuiet, ensureDir, probeDuration, hms, writeJson } = require('./util');

function escapeMeta(s) {
  return String(s).replace(/([=;#\\\n])/g, '\\$1');
}

/** ffmetadata chapter block from cumulative chapter durations. */
function buildChapterMetadata(chapters, book) {
  const L = [';FFMETADATA1'];
  L.push(`title=${escapeMeta(book.title)}`);
  if (book.author) L.push(`artist=${escapeMeta(book.author)}`);
  if (book.author) L.push(`album_artist=${escapeMeta(book.author)}`);
  L.push(`album=${escapeMeta(book.title)}`);
  if (book.narrator) L.push(`composer=${escapeMeta(book.narrator)}`);
  if (book.year) L.push(`date=${escapeMeta(book.year)}`);
  if (book.genre) L.push(`genre=${escapeMeta(book.genre)}`);
  if (book.publisher) L.push(`publisher=${escapeMeta(book.publisher)}`);
  if (book.description) L.push(`description=${escapeMeta(book.description)}`);
  if (book.copyright) L.push(`copyright=${escapeMeta(book.copyright)}`);

  let startMs = 0;
  for (const ch of chapters) {
    const endMs = startMs + Math.round(ch.durationSec * 1000);
    L.push('');
    L.push('[CHAPTER]');
    L.push('TIMEBASE=1/1000');
    L.push(`START=${startMs}`);
    L.push(`END=${Math.max(endMs - 1, startMs + 1)}`);
    L.push(`title=${escapeMeta(ch.title)}`);
    startMs = endMs;
  }
  return L.join('\n') + '\n';
}

/** Concatenate mastered chapters into one chaptered M4B. */
function buildM4B({ chapters, outFile, book, workDir, bitrateKbps, coverFile }) {
  ensureDir(path.dirname(outFile));
  ensureDir(workDir);

  const listFile = path.join(workDir, 'm4b-concat.txt');
  fs.writeFileSync(listFile, chapters.map((c) => `file '${path.resolve(c.file).replace(/'/g, "'\\''")}'`).join('\n') + '\n');

  const metaFile = path.join(workDir, 'm4b-chapters.txt');
  fs.writeFileSync(metaFile, buildChapterMetadata(chapters, book));

  const args = ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-i', metaFile];
  if (coverFile && fs.existsSync(coverFile)) args.push('-i', coverFile);

  args.push('-map', '0:a', '-map_metadata', '1', '-map_chapters', '1');
  if (coverFile && fs.existsSync(coverFile)) {
    args.push('-map', '2:v', '-c:v', 'copy', '-disposition:v:0', 'attached_pic');
  }
  args.push('-c:a', 'aac', '-b:a', `${bitrateKbps || 96}k`, '-ac', '1', '-movflags', '+faststart', '-f', 'mp4', outFile);

  const r = runQuiet(FFMPEG, args);
  if (!r.ok) throw new Error(`M4B build failed: ${String(r.out).slice(-600)}`);
  return { file: outFile, durationSec: probeDuration(outFile), bytes: fs.statSync(outFile).size };
}

/** Human-readable chapter sheet. */
function writeChapterSheet(chapters, outFile) {
  ensureDir(path.dirname(outFile));
  const L = [];
  let t = 0;
  for (const ch of chapters) {
    L.push(`${hms(t)}  ${ch.title}`);
    t += ch.durationSec;
  }
  L.push(`${hms(t)}  [end]`);
  fs.writeFileSync(outFile, L.join('\n') + '\n');
  return outFile;
}

/**
 * Private-podcast RSS. For a course catalogue this is usually the real
 * distribution path: the client drops the feed URL into their member area and
 * students listen in whatever podcast app they already use.
 */
function writeRssFeed({ chapters, outFile, book, baseUrl }) {
  ensureDir(path.dirname(outFile));
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const now = new Date().toUTCString();
  const items = chapters.map((ch, i) => {
    const url = `${String(baseUrl || '').replace(/\/$/, '')}/${encodeURIComponent(path.basename(ch.file))}`;
    const bytes = fs.existsSync(ch.file) ? fs.statSync(ch.file).size : 0;
    const type = ch.file.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg';
    return [
      '    <item>',
      `      <title>${esc(`${i + 1}. ${ch.title}`)}</title>`,
      `      <itunes:episode>${i + 1}</itunes:episode>`,
      `      <guid isPermaLink="false">${esc(book.title)}-${i + 1}</guid>`,
      `      <pubDate>${now}</pubDate>`,
      `      <enclosure url="${esc(url)}" length="${bytes}" type="${type}"/>`,
      `      <itunes:duration>${hms(ch.durationSec)}</itunes:duration>`,
      `      <itunes:explicit>false</itunes:explicit>`,
      '    </item>',
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    `    <title>${esc(book.title)}</title>`,
    `    <link>${esc(book.link || baseUrl || '')}</link>`,
    `    <description>${esc(book.description || '')}</description>`,
    '    <language>en-us</language>',
    `    <itunes:author>${esc(book.author || '')}</itunes:author>`,
    `    <itunes:summary>${esc(book.description || '')}</itunes:summary>`,
    '    <itunes:explicit>false</itunes:explicit>',
    '    <itunes:block>Yes</itunes:block>',
    `    <copyright>${esc(book.copyright || '')}</copyright>`,
    book.coverUrl ? `    <itunes:image href="${esc(book.coverUrl)}"/>` : '',
    items,
    '  </channel>',
    '</rss>',
  ].filter(Boolean).join('\n');

  fs.writeFileSync(outFile, xml + '\n');
  return outFile;
}

function writeManifest({ chapters, outFile, book, profile, cost }) {
  const manifest = {
    book,
    profile: profile.id,
    generated: new Date().toISOString(),
    totalDurationSec: chapters.reduce((n, c) => n + c.durationSec, 0),
    totalDurationHms: hms(chapters.reduce((n, c) => n + c.durationSec, 0)),
    chapterCount: chapters.length,
    cost: cost || null,
    chapters: chapters.map((c, i) => ({
      index: i + 1,
      title: c.title,
      file: path.basename(c.file),
      durationSec: Math.round(c.durationSec * 100) / 100,
      durationHms: hms(c.durationSec),
      bytes: fs.existsSync(c.file) ? fs.statSync(c.file).size : 0,
    })),
  };
  writeJson(outFile, manifest);
  return manifest;
}

module.exports = { buildM4B, buildChapterMetadata, writeChapterSheet, writeRssFeed, writeManifest };
