#!/usr/bin/env node
'use strict';
/** Zero-dependency test suite. Run: npm test */
const assert = require('assert');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const S = require(path.join(ROOT, 'lib/script'));
const C = require(path.join(ROOT, 'lib/cost'));
const P = require(path.join(ROOT, 'lib/packager'));

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  pass  ${name}`); }
  catch (e) { failed++; console.log(`  FAIL  ${name}\n        ${e.message}`); }
}

console.log('\nscript: narration normalization');

test('expands honorifics without breaking the sentence', () => {
  assert.match(S.normalizeForNarration('Dr. Campbell spoke.').text, /^Doctor Campbell spoke\.$/);
});

test('spells dotted acronyms so engines do not guess a word', () => {
  assert.match(S.normalizeForNarration('The P.A.C.T. Framework.').text, /P\. A\. C\. T\./);
});

test('speaks money, percentages and ordinals', () => {
  const t = S.normalizeForNarration('It costs $1,200, up 85% since the 1st year.').text;
  assert.ok(t.includes('1200 dollars'), 'money: ' + t);
  assert.ok(t.includes('85 percent'), 'percent: ' + t);
  assert.ok(t.includes('first year'), 'ordinal: ' + t);
});

test('converts URLs and emails to speakable form', () => {
  const t = S.normalizeForNarration('Visit https://globalleadersolutions.com/pact or mail a@b.com.').text;
  assert.ok(t.includes('globalleadersolutions dot com'), t);
  assert.ok(t.includes('a at b dot com'), t);
});

test('strips markdown without eating the words', () => {
  const t = S.normalizeForNarration('**Bold** and _italic_ and [link](http://x.com).').text;
  assert.strictEqual(t, 'Bold and italic and link.');
});

test('applies the client lexicon', () => {
  const t = S.normalizeForNarration('Taught at Norwich.', { lexicon: { Norwich: 'Norrich' } }).text;
  assert.ok(t.includes('Norrich'), t);
});

console.log('\nscript: flags for human edit');

test('flags on-screen and worksheet language', () => {
  const kinds = S.findFlags('See Figure 3 below. Fill in the blank: ____. Download the worksheet now.').map((f) => f.kind);
  assert.ok(kinds.includes('visual reference'), JSON.stringify(kinds));
  assert.ok(kinds.includes('worksheet instruction'), JSON.stringify(kinds));
});

test('does not flag ordinary prose', () => {
  assert.strictEqual(S.findFlags('Character is a practice, not a trait.').length, 0);
});

console.log('\nscript: sentence splitting');

test('does not split on an abbreviation', () => {
  assert.strictEqual(S.splitSentences('Dr. Campbell spoke. Then he left.').length, 2);
});

test('does not split inside a spelled acronym', () => {
  assert.strictEqual(S.splitSentences('The P. A. C. T. model works. Next.').length, 2);
});

test('splits on question and exclamation marks', () => {
  assert.strictEqual(S.splitSentences('Who leads? You do! Always.').length, 3);
});

console.log('\nscript: segmentation');

test('never exceeds the character cap', () => {
  const long = Array.from({ length: 400 }, (_, i) => `Sentence number ${i} about character and leadership.`).join(' ');
  for (const seg of S.segment(long, 500)) assert.ok(seg.length <= 500, `segment was ${seg.length}`);
});

test('never splits mid-sentence when it can avoid it', () => {
  const text = 'Alpha beta gamma delta. Epsilon zeta eta theta. Iota kappa lambda mu.';
  for (const seg of S.segment(text, 40)) assert.ok(/[.!?]$/.test(seg.trim()), `ragged segment: "${seg}"`);
});

test('breaks a single over-long sentence rather than dropping it', () => {
  const one = 'word '.repeat(300).trim() + '.';
  const segs = S.segment(one, 200);
  assert.ok(segs.length > 1);
  assert.ok(segs.join(' ').replace(/\s+/g, ' ').includes('word word word'));
});

console.log('\nscript: chapterization');

test('splits at markdown headings', () => {
  const body = '# One\n\n' + 'x'.repeat(500) + '\n\n# Two\n\n' + 'y'.repeat(500);
  const chs = S.chapterize(body);
  assert.strictEqual(chs.length, 2);
  assert.strictEqual(chs[0].title, 'One');
});

test('merges a runt chapter backward into the previous one', () => {
  const body = '# One\n\n' + 'x'.repeat(600) + '\n\n# Two\n\nshort';
  const chs = S.chapterize(body, { minChapterChars: 400 });
  assert.strictEqual(chs.length, 1);
  assert.ok(chs[0].body.includes('short'), 'runt content must survive the merge');
});

test('merges a leading runt forward when nothing precedes it', () => {
  const body = '# One\n\nshort\n\n# Two\n\n' + 'y'.repeat(600);
  const chs = S.chapterize(body, { minChapterChars: 400 });
  assert.strictEqual(chs.length, 1);
  assert.strictEqual(chs[0].title, 'One');
  assert.ok(chs[0].body.includes('short') && chs[0].body.includes('yyy'), 'both halves must survive');
});

test('keeps a lone runt rather than dropping the content entirely', () => {
  const chs = S.chapterize('# Only\n\ntiny body', { minChapterChars: 400 });
  assert.strictEqual(chs.length, 1);
  assert.ok(chs[0].body.includes('tiny body'));
});

test('recognises "Module 2" style headings without markdown', () => {
  assert.ok(S.looksLikeHeading('Module 2: Accountability'));
  assert.ok(!S.looksLikeHeading('This is an ordinary sentence that runs on and on and should not be a heading.'));
});

console.log('\ncost model');

test('characters convert to audio hours at the documented pace', () => {
  const hours = C.charsToAudioSeconds(C.pricing().narration.charsPerFinishedHour) / 3600;
  assert.ok(Math.abs(hours - 1) < 0.02, `expected ~1 hour, got ${hours}`);
});

test('free tiers reduce billable characters', () => {
  const r = C.costFor('google', 'chirp-3-hd', 500000);
  assert.strictEqual(r.billableChars, 0);
  assert.strictEqual(r.usd, 0);
});

test('charges only the overage above a free tier', () => {
  const r = C.costFor('google', 'chirp-3-hd', 1500000);
  assert.strictEqual(r.billableChars, 500000);
  assert.strictEqual(r.usd, 15);
});

test('elevenlabs delivery rate matches the published overage rate', () => {
  assert.strictEqual(C.costFor('elevenlabs', 'eleven_multilingual_v2', 1e6, { ignoreFreeTier: true }).usd, 100);
});

test('catalogue sizing brackets low under mid under high', () => {
  const e = C.estimateFromPages({ courses: 20, pagesLow: 10, pagesHigh: 30 });
  assert.ok(e.low.chars < e.mid.chars && e.mid.chars < e.high.chars);
  assert.strictEqual(e.mid.totalPages, 400);
});

test('rejects an unknown vendor or model loudly', () => {
  assert.throws(() => C.costFor('nope', 'x', 1000));
  assert.throws(() => C.costFor('openai', 'not-a-model', 1000));
});

console.log('\npackaging');

test('chapter marks are contiguous and in order', () => {
  const meta = P.buildChapterMetadata(
    [{ title: 'A', durationSec: 10 }, { title: 'B', durationSec: 20 }, { title: 'C', durationSec: 5 }],
    { title: 'Book', author: 'Author' });
  const starts = [...meta.matchAll(/START=(\d+)/g)].map((m) => +m[1]);
  const ends = [...meta.matchAll(/END=(\d+)/g)].map((m) => +m[1]);
  assert.deepStrictEqual(starts, [0, 10000, 30000]);
  assert.ok(ends[0] < starts[1] && ends[1] < starts[2], 'chapters must not overlap');
});

test('escapes metadata that would corrupt the ffmetadata file', () => {
  const meta = P.buildChapterMetadata([{ title: 'Risk = Reward; #1', durationSec: 5 }], { title: 'T' });
  assert.ok(meta.includes('\\=') && meta.includes('\;') && meta.includes('\\#'), meta);
});

console.log('\nquote engine');

const Q = require(path.join(ROOT, 'lib/quote'));

test('price clears cost at the target margin', () => {
  const q = Q.quote({ courses: 20, chars: 708000, tierId: 'signature' });
  assert.ok(q.price > q.totalCost, 'price must exceed cost');
  const realised = (q.price - q.totalCost) / q.price;
  assert.ok(Math.abs(realised - q.marginPct / 100) < 0.02, `margin drifted: ${realised}`);
});

test('labour dominates API spend, which is what makes the model right', () => {
  const q = Q.quote({ courses: 20, chars: 708000, tierId: 'signature' });
  assert.ok(q.labor.cost > q.api.usd * 20, 'labour should dwarf API spend');
});

test('more courses costs more, monotonically', () => {
  const a = Q.quote({ courses: 5, chars: 177000, tierId: 'signature' });
  const b = Q.quote({ courses: 20, chars: 708000, tierId: 'signature' });
  assert.ok(b.price > a.price);
});

test('pilot is priced as an entry offer, not a fifth of the catalogue', () => {
  const cat = Q.quote({ courses: 20, chars: 708000, tierId: 'signature' });
  const pilot = Q.pilotQuote({ chars: 35400, tierId: 'signature' });
  assert.ok(pilot.price < cat.price * 0.25, `pilot too expensive: ${pilot.price} vs ${cat.price}`);
  assert.ok(pilot.price > pilot.totalCost, 'pilot must still clear cost');
});

test('tiers are ordered essential < signature < catalogue', () => {
  const [e, s2, c2] = ['essential', 'signature', 'catalogue']
    .map((id) => Q.quote({ courses: 20, chars: 708000, tierId: id }).price);
  assert.ok(e < s2 && s2 < c2, `${e} ${s2} ${c2}`);
});

test('rejects an unknown tier', () => {
  assert.throws(() => Q.quote({ courses: 1, chars: 1000, tierId: 'platinum' }));
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
