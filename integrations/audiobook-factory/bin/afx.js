#!/usr/bin/env node
'use strict';
/**
 * afx - the audiobook factory CLI.
 *
 *   afx providers                     which engines are configured
 *   afx estimate <job.json>           cost + runtime before spending anything
 *   afx estimate --courses 20 --pages 10-30
 *   afx script <job.json>             build the narration script only
 *   afx build <job.json>              script -> synth -> master -> package -> QA
 *   afx qa <job.json>                 re-grade what is already built
 *
 * Synthesis is cached by content hash, so a failed run at chapter 18 of 20
 * resumes without re-paying for chapters 1 through 17.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const { readJson, writeJson, ensureDir, slug, usd, hms, sha1, probeDuration, log, warn } = require(path.join(ROOT, 'lib/util'));
const cost = require(path.join(ROOT, 'lib/cost'));
const scriptLib = require(path.join(ROOT, 'lib/script'));
const providers = require(path.join(ROOT, 'lib/providers'));
const master = require(path.join(ROOT, 'lib/master'));
const packager = require(path.join(ROOT, 'lib/packager'));
const qa = require(path.join(ROOT, 'lib/qa'));
const quoteLib = require(path.join(ROOT, 'lib/quote'));

/* ------------------------------------------------------------------- args */

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      out[k] = v !== undefined ? v : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
    } else out._.push(a);
  }
  return out;
}

function resolveJob(p) {
  const file = path.resolve(p);
  const job = readJson(file);
  job.__dir = path.dirname(file);
  job.__file = file;
  return job;
}

function loadProfile(job, override) {
  const id = override || job.profile || 'podcast';
  const p = path.join(ROOT, 'config', 'profiles', `${id}.json`);
  if (!fs.existsSync(p)) throw new Error(`unknown profile "${id}". available: ${fs.readdirSync(path.join(ROOT, 'config/profiles')).map((f) => f.replace('.json', '')).join(', ')}`);
  return readJson(p);
}

function loadLexicon(job) {
  if (!job.lexiconFile) return job.lexicon || {};
  const p = path.isAbsolute(job.lexiconFile) ? job.lexiconFile : path.resolve(job.__dir, job.lexiconFile);
  const fromFile = fs.existsSync(p) ? readJson(p) : {};
  return Object.assign({}, fromFile.terms || fromFile, job.lexicon || {});
}

/* ---------------------------------------------------------------- extract */

function extractSource(src, jobDir) {
  const file = path.isAbsolute(src.file) ? src.file : path.resolve(jobDir, src.file);
  if (!fs.existsSync(file)) throw new Error(`source not found: ${file}`);
  const text = execFileSync('python3', [path.join(ROOT, 'lib/extract.py'), file], {
    encoding: 'utf8', maxBuffer: 128 * 1024 * 1024,
  });
  return { file: path.basename(file), title: src.title || path.basename(file, path.extname(file)), text };
}

/* --------------------------------------------------------------- commands */

function cmdProviders() {
  log('\nEngines\n');
  for (const p of providers.list()) {
    const status = p.requiresEnv.length === 0 ? 'ready (no key needed)' : (p.ready ? 'ready' : `needs ${p.requiresEnv.join(' + ')}`);
    log(`  ${p.id.padEnd(12)} ${String(p.label).padEnd(34)} ${status}`);
  }
  const pr = cost.pricing();
  log(`\nPricing verified ${pr.verified}, expires ${pr.expires}${cost.pricingIsStale() ? '  ** STALE - re-verify **' : ''}\n`);
}

function cmdEstimate(args) {
  const pr = cost.pricing();
  if (cost.pricingIsStale()) warn(`pricing table expired ${pr.expires}; re-verify before quoting`);

  let chars, label, breakdown = null;

  if (args._[1]) {
    const job = resolveJob(args._[1]);
    const lexicon = loadLexicon(job);
    const sources = job.sources.map((s) => extractSource(s, job.__dir));
    const built = scriptLib.buildScript({
      title: job.title, author: job.author, sources, lexicon,
      maxChars: job.maxChars || 2400, credits: job.credits || {},
    });
    chars = built.totalChars;
    label = `${job.title} (${built.chapterCount} chapters, ${built.totalSegments} segments)`;
    breakdown = built;
  } else {
    const courses = parseInt(args.courses || '20', 10);
    const [lo, hi] = String(args.pages || '10-30').split('-').map((n) => parseInt(n, 10));
    const wordsPerPage = parseInt(args['words-per-page'] || '300', 10);
    const est = cost.estimateFromPages({ courses, pagesLow: lo, pagesHigh: hi || lo, wordsPerPage });
    log(`\nCatalogue sizing: ${courses} courses, ${lo}-${hi} pages each, ${wordsPerPage} words/page\n`);
    for (const [k, v] of [['low', est.low], ['mid', est.mid], ['high', est.high]]) {
      log(`  ${k.padEnd(5)} ${String(v.totalPages).padStart(4)} pages  ${v.words.toLocaleString().padStart(9)} words  ${v.chars.toLocaleString().padStart(10)} chars  ${(v.audioSeconds / 3600).toFixed(1).padStart(5)} audio hrs`);
    }
    chars = est.mid.chars;
    label = `${courses} courses, midpoint sizing`;
  }

  const hours = cost.charsToAudioSeconds(chars) / 3600;
  log(`\nTTS cost for ${label}`);
  log(`  ${chars.toLocaleString()} characters  =  ${hours.toFixed(1)} finished audio hours\n`);
  log('  ' + 'engine'.padEnd(30) + 'model'.padEnd(26) + 'per 1M'.padStart(9) + 'billable'.padStart(12) + 'cost'.padStart(10) + '   quality');
  log('  ' + '-'.repeat(97));
  for (const r of cost.compareAll(chars)) {
    log('  ' + r.vendorLabel.padEnd(30) + r.model.padEnd(26) +
      usd(r.usdPerMillionChars).padStart(9) + r.billableChars.toLocaleString().padStart(12) +
      usd(r.usd).padStart(10) + '   ' + r.quality);
  }
  log('');
  if (breakdown && breakdown.flags.length) {
    log(`  ${breakdown.flags.length} passages need a human edit before narration (see 'afx script').\n`);
  }
  return { chars, hours };
}

function cmdScript(args) {
  const job = resolveJob(args._[1]);
  const lexicon = loadLexicon(job);
  const outDir = path.resolve(job.__dir, job.outDir || `out/${slug(job.title)}`);
  ensureDir(outDir);

  const sources = job.sources.map((s) => extractSource(s, job.__dir));
  const built = scriptLib.buildScript({
    title: job.title, author: job.author, sources, lexicon,
    maxChars: job.maxChars || 2400, minChapterChars: job.minChapterChars || 400,
    credits: job.credits || {},
  });

  writeJson(path.join(outDir, 'script.json'), built);

  const L = [`# Narration script - ${job.title}`, '', `${built.chapterCount} chapters | ${built.totalSegments} segments | ${built.totalChars.toLocaleString()} characters | ~${(cost.charsToAudioSeconds(built.totalChars) / 3600).toFixed(1)} audio hours`, ''];
  if (built.flags.length) {
    L.push(`## ${built.flags.length} passages flagged for human edit`, '');
    L.push('Course text assumes a screen. These lines do not survive the move to audio:', '');
    L.push('| Chapter | Issue | Passage |', '|---|---|---|');
    for (const f of built.flags) L.push(`| ${f.chapter} | ${f.kind} | ${f.sentence.replace(/\|/g, '/')} |`);
    L.push('');
  }
  L.push('## Chapters', '', '| # | Title | Chars | Est. runtime |', '|---|---|---|---|');
  for (const c of built.chapters) {
    L.push(`| ${c.index} | ${c.title} | ${c.chars.toLocaleString()} | ${hms(cost.charsToAudioSeconds(c.chars))} |`);
  }
  fs.writeFileSync(path.join(outDir, 'script.md'), L.join('\n') + '\n');

  log(`\nScript built: ${built.chapterCount} chapters, ${built.totalSegments} segments, ${built.totalChars.toLocaleString()} chars`);
  log(`Flagged for human edit: ${built.flags.length}`);
  log(`  ${path.relative(process.cwd(), path.join(outDir, 'script.json'))}`);
  log(`  ${path.relative(process.cwd(), path.join(outDir, 'script.md'))}\n`);
  return { job, built, outDir };
}

async function cmdBuild(args) {
  const { job, built, outDir } = cmdScript(args);
  const profile = loadProfile(job, args.profile);
  const providerId = args.provider || job.provider || 'local';
  const provider = providers.get(providerId);

  for (const k of provider.requiresEnv || []) {
    if (!process.env[k]) throw new Error(`${providerId} needs ${k} in the environment. Set it and re-run; nothing has been spent.`);
  }

  const limit = args.limit ? parseInt(args.limit, 10) : null;
  const chapters = limit ? built.chapters.slice(0, limit) : built.chapters;

  const workDir = path.join(outDir, '.work');
  const cacheDir = path.join(outDir, '.cache', providerId);
  const chapterDir = path.join(outDir, 'chapters');
  [workDir, cacheDir, chapterDir].forEach(ensureDir);

  const voice = args.voice || job.voice || provider.defaultVoice;
  const model = args.model || job.model || provider.defaultModel;
  const settings = Object.assign({}, job.settings || {});
  const ext = provider.format === 'mp3' ? 'mp3' : 'wav';

  log(`Synthesizing with ${provider.label} (voice ${voice}, model ${model})`);
  let charsSent = 0, cacheHits = 0;
  const mastered = [];

  for (const ch of chapters) {
    const segFiles = [];
    for (let i = 0; i < ch.segments.length; i++) {
      const seg = ch.segments[i];
      const key = sha1([providerId, model, voice, JSON.stringify(settings), seg.hash].join('|'));
      const cached = path.join(cacheDir, `${key}.${ext}`);

      if (fs.existsSync(cached) && fs.statSync(cached).size > 1024) {
        cacheHits++;
      } else {
        const context = {
          previousText: i > 0 ? ch.segments[i - 1].text : undefined,
          nextText: i + 1 < ch.segments.length ? ch.segments[i + 1].text : undefined,
        };
        await provider.synth({ text: seg.text, outFile: cached, voice, model, settings, context });
        charsSent += seg.chars;
      }
      segFiles.push(cached);
    }

    const outFile = path.join(chapterDir, `${ch.id}.${profile.audio.container}`);
    const res = master.masterChapter({
      segmentFiles: segFiles, outFile, profile, workDir,
      voiceOpts: Object.assign({ sampleRate: profile.audio.sampleRate }, job.mastering || {}),
    });
    mastered.push({ title: ch.title, file: outFile, durationSec: res.durationSec });
    log(`  [${String(ch.index).padStart(2)}/${chapters.length}] ${hms(res.durationSec)}  ${ch.title}`);
  }

  // Cost actually incurred this run (cache hits are free).
  const rate = cost.pricing().vendors[providerId];
  const modelRate = rate && rate.models[model] ? rate.models[model].usdPerMillionChars : (provider.usdPerMillionChars || 0);
  const spend = (charsSent / 1e6) * modelRate;

  const book = Object.assign({
    title: job.title, author: job.author, narrator: job.narrator || provider.label,
    year: String(new Date().getFullYear()), genre: 'Business', publisher: job.publisher,
    description: job.description, copyright: job.copyright, link: job.link, coverUrl: job.coverUrl,
  }, job.book || {});

  const coverFile = job.cover ? path.resolve(job.__dir, job.cover) : null;
  const m4b = packager.buildM4B({
    chapters: mastered, outFile: path.join(outDir, `${slug(job.title)}.m4b`),
    book, workDir, bitrateKbps: profile.audio.bitrateKbps, coverFile,
  });
  packager.writeChapterSheet(mastered, path.join(outDir, 'chapters.txt'));
  if (job.feedBaseUrl) {
    packager.writeRssFeed({ chapters: mastered, outFile: path.join(outDir, 'feed.xml'), book, baseUrl: job.feedBaseUrl });
  }

  log('\nQA');
  const report = qa.inspectBook(mastered.map((m) => m.file), profile);
  writeJson(path.join(outDir, 'qa-report.json'), report);
  fs.writeFileSync(path.join(outDir, 'qa-report.md'), qa.toMarkdown(report, job.title));
  for (const r of report.results) {
    const failed = r.checks.filter((c) => !c.ok);
    log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${path.basename(r.file)}${failed.length ? '  <- ' + failed.map((c) => c.name).join(', ') : ''}`);
  }

  const manifest = packager.writeManifest({
    chapters: mastered, outFile: path.join(outDir, 'manifest.json'), book, profile,
    cost: { provider: providerId, model, charsSent, cacheHits, usdPerMillionChars: modelRate, usdThisRun: Math.round(spend * 100) / 100 },
  });

  log(`\nBuilt ${mastered.length} chapters, ${hms(manifest.totalDurationSec)} total`);
  log(`  characters synthesized this run: ${charsSent.toLocaleString()} (${cacheHits} segments served from cache)`);
  log(`  spend this run: ${usd(spend)} at ${usd(modelRate)}/1M on ${providerId}`);
  log(`  QA: ${report.pass ? 'PASS' : `FAIL (${report.failed} of ${report.fileCount})`}`);
  log(`  M4B: ${path.relative(process.cwd(), m4b.file)} (${(m4b.bytes / 1024 / 1024).toFixed(1)} MB)\n`);
  return { outDir, report, manifest };
}


function cmdQuote(args) {
  const courses = parseInt(args.courses || '20', 10);
  const [lo, hi] = String(args.pages || '10-30').split('-').map((n) => parseInt(n, 10));
  const wordsPerPage = parseInt(args['words-per-page'] || '300', 10);
  const est = cost.estimateFromPages({ courses, pagesLow: lo, pagesHigh: hi || lo, wordsPerPage });
  const hourly = args.rate ? parseFloat(args.rate) : undefined;

  log(`\nQuote: ${courses} courses, ${lo}-${hi} pages each (${wordsPerPage} words/page)`);
  log(`Sizing runs ${(est.low.audioSeconds / 3600).toFixed(1)} - ${(est.high.audioSeconds / 3600).toFixed(1)} finished audio hours; pricing on the ${(est.mid.audioSeconds / 3600).toFixed(1)}h midpoint.\n`);

  const quotes = quoteLib.quoteAllTiers({ courses, chars: est.mid.chars, internalHourlyCost: hourly });

  log('  ' + 'tier'.padEnd(26) + 'engine'.padEnd(14) + 'API'.padStart(8) + 'labour'.padStart(10) + 'our cost'.padStart(10) + 'price'.padStart(10) + '/course'.padStart(10) + '  margin');
  log('  ' + '-'.repeat(96));
  for (const q of quotes) {
    log('  ' + q.tier.label.padEnd(26) + q.engine.provider.padEnd(14) +
      usd(q.api.usd).padStart(8) + usd(q.labor.cost).padStart(10) +
      usd(q.totalCost).padStart(10) + usd(q.price).padStart(10) +
      usd(q.pricePerCourse).padStart(10) + '   ' + q.marginPct + '%');
  }

  const sig = quotes.find((q) => q.tier.id === 'signature') || quotes[0];
  log('\n  Sensitivity on catalogue size (Signature tier):');
  for (const [k, v] of [['low', est.low], ['mid', est.mid], ['high', est.high]]) {
    const q = quoteLib.quote({ courses, chars: v.chars, tierId: sig.tier.id, internalHourlyCost: hourly });
    log(`    ${k.padEnd(5)} ${(v.audioSeconds / 3600).toFixed(1).padStart(5)}h audio   API ${usd(q.api.usd).padStart(8)}   price ${usd(q.price).padStart(9)}`);
  }

  const h = sig.humanComparison;
  log('\n  Same catalogue with human narration:');
  log(`    narration alone      ${usd(h.narrationOnlyLow)} - ${usd(h.narrationOnlyHigh)}`);
  log(`    full production      ${usd(h.fullProductionLow)} - ${usd(h.fullProductionHigh)}  (${courses} titles)`);
  const pilot = quoteLib.pilotQuote({ chars: Math.round(est.mid.chars / courses), tierId: sig.tier.id, internalHourlyCost: hourly });
  log(`\n  Pilot (1 course, ${sig.tier.label}): ${usd(pilot.price)} - ${pilot.hours}h, credited against the catalogue if they proceed.`);
  log('');
  return quotes;
}

function cmdQa(args) {
  const job = resolveJob(args._[1]);
  const profile = loadProfile(job, args.profile);
  const outDir = path.resolve(job.__dir, job.outDir || `out/${slug(job.title)}`);
  const chapterDir = path.join(outDir, 'chapters');
  if (!fs.existsSync(chapterDir)) throw new Error(`nothing built yet at ${chapterDir}`);
  const files = fs.readdirSync(chapterDir).filter((f) => !f.startsWith('.')).sort().map((f) => path.join(chapterDir, f));
  const report = qa.inspectBook(files, profile);
  writeJson(path.join(outDir, 'qa-report.json'), report);
  fs.writeFileSync(path.join(outDir, 'qa-report.md'), qa.toMarkdown(report, job.title));
  log(qa.toMarkdown(report, job.title));
  return report;
}

/* ------------------------------------------------------------------- main */

const HELP = `
afx - course-to-audiobook factory

  afx providers                    show engines and whether keys are present
  afx estimate --courses 20 --pages 10-30
  afx estimate <job.json>          exact cost from real source files
  afx quote --courses 20 --pages 10-30   client price across tiers
  afx script <job.json>            build narration script + human-edit flags
  afx build <job.json>             full run: synth, master, package, QA
  afx qa <job.json>                re-grade an existing build

Options
  --provider  local | elevenlabs | openai | google | azure
  --profile   podcast | acx | lms
  --voice --model --limit N
`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  try {
    switch (cmd) {
      case 'providers': cmdProviders(); break;
      case 'estimate': cmdEstimate(args); break;
      case 'quote': cmdQuote(args); break;
      case 'script': cmdScript(args); break;
      case 'build': case 'run': await cmdBuild(args); break;
      case 'qa': cmdQa(args); break;
      default: log(HELP);
    }
  } catch (e) {
    console.error(`\nerror: ${e.message}\n`);
    process.exit(1);
  }
}

main();
