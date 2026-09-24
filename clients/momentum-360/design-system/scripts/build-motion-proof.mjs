import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const skill = process.env.MOMENTUM_DECK_SKILL_ROOT || path.join(os.homedir(), '.claude', 'skills', 'client-deck');
const { Deck } = await import(pathToFileURL(path.join(skill, 'lib', 'deck-kit.mjs')).href);

// Ponytail: reuse the installed branded layouts and native choreographer.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'output', 'motion-proof');
const evidence = path.join(root, 'evidence');
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(evidence, { recursive: true });
const started = performance.now();
const sources = {
  brand: `${skill}/brands/momentum-digital.json`,
  kit: `${skill}/lib/deck-kit.mjs`,
  motion: `${skill}/scripts/choreograph.py`,
  guide: `${skill}/SKILL.md`,
};
const deck = new Deck('momentum-digital', {
  title: 'Momentum Digital | Design and motion proof',
  author: 'Dillon Mohr',
  subject: 'Internal editable presentation specimen; subtle native animation',
  animationStyle: 'subtle',
});
// Semantic text exception: retain source brand tokens/artwork; use existing
// high-contrast companions for small text and static furniture only.
const originalText = deck.text.bind(deck);
deck.text = (slide, content, options) => {
  const dark = slide.background?.color === deck.C.navy;
  const adjusted = { ...options };
  if (adjusted.color === deck.C.blue && adjusted.size < 18) adjusted.color = dark ? deck.C.blueLift : deck.C.blueDeep;
  if (['foot', 'static'].includes(adjusted.role)) adjusted.color = dark ? deck.C.onDarkSoft : deck.C.slate;
  return originalText(slide, content, adjusted);
};
const note = (s, body, keys) => deck.notes(s, `${body} Internal specimen, not marketing results.`, keys.map(k => sources[k]));
const foot = (s, dark = false) => deck.foot(s, 'Internal system specimen | Momentum Digital / Need Momentum | 04 Sep 2026', { dark });

let s = deck.title({
  kicker: 'Design + motion system',
  title: 'Built to move.\nEasy to edit.',
  sub: 'A reusable system for Momentum Digital.',
  foot: 'INTERNAL SPECIMEN  /  04 SEP 2026',
});
note(s, 'Opening specimen. Uses the existing Momentum Digital lockup, blue, navy, Arial deck typography and full-bleed motif. This proof does not establish Momentum 360 brand tokens.', ['brand', 'kit']);

s = deck.slide({ kicker: 'Foundation', title: 'One system. Clear ownership.', sub: 'The content changes. The design rules stay consistent.' });
deck.rows(s, [
  { head: 'Brand', body: 'The verified client profile owns color, logo assets, typography and contact identity.' },
  { head: 'Composition', body: 'Reusable slide layouts own hierarchy, whitespace, rules and the light / dark rhythm.' },
  { head: 'Motion', body: 'Semantic roles determine entrance behavior automatically when the file is saved.' },
], { x: deck.M, y: s._top + 0.18, w: deck.CW, gap: 0.36, bottom: deck.BOT });
foot(s);
note(s, 'Architecture explanation of the installed client-deck workflow. Brand fields reside in JSON; layout methods reside in Deck; Deck.save calls choreograph.py.', ['brand', 'kit', 'motion']);

s = deck.slide({ kicker: 'Type specimen', title: 'Hierarchy does the work.', sub: 'Native text, shared baselines and open space.' });
deck.statRow(s, [
  { value: '54', label: 'Display / pt', sub: 'A short, confident opening statement.' },
  { value: '14', label: 'Body / pt', sub: 'Readable supporting copy with room to breathe.' },
  { value: '10.5', label: 'Caption / pt', sub: 'Quiet labels and source furniture.' },
], { y: s._top + 0.40, size: deck.T.statXl, height: 2.1, bottom: deck.BOT });
foot(s);
note(s, 'The figures are typography tokens, not performance statistics: type.display=54, type.body=14 and type.caption=10.5 in momentum-digital.json. The specimen figures themselves use statXl=62. Deck text uses Arial for portability; web typography remains a separate implementation concern.', ['brand', 'kit']);

s = deck.section({ num: 1, kicker: 'Presentation behavior', title: 'Motion with purpose.', sub: 'Small moves guide attention. Native shapes stay editable.' });
foot(s, true);
note(s, 'Section specimen demonstrates the numeral settle role, heading rise and logo fade. Subtle is explicitly selected for this proof even though the installed Deck constructor defaults to bold.', ['kit', 'motion']);

s = deck.slide({ kicker: 'Role vocabulary', title: 'Every role has a move.', dark: true });
deck.rows(s, [
  { head: 'Titles rise', body: 'A short fade and upward motion introduces the hierarchy.' },
  { head: 'Figures scale', body: 'A restrained scale change gives large typography emphasis.' },
  { head: 'Rules draw', body: 'Directional wipes reveal structure between content groups.' },
  { head: 'Footers stay', body: 'Footnotes and page numbers remain static throughout the sequence.' },
], { x: deck.M, y: s._top + 0.30, w: deck.CW, gap: 0.25, dark: true, bottom: deck.BOT });
foot(s, true);
note(s, 'Behavior summary: title/display/sub roles combine fade with translation; figure/hero/step-num roles fade and scale upward; numeral fades and scales downward; rule-h and rule-v wipe; foot/static roles are excluded.', ['motion']);

s = deck.slide({ kicker: 'Automatic workflow', title: 'From content to presentation.', sub: 'One save operation applies the selected motion style.' });
deck.steps(s, [
  { head: 'Load brand', body: 'Resolve the exact client profile and approved assets.' },
  { head: 'Add content', body: 'Choose layouts, keep claims sourced and add speaker notes.' },
  { head: 'Save deck', body: 'Write editable slides and apply role-aware native timing.' },
  { head: 'Verify', body: 'Open in PowerPoint, check effects and inspect every slide.' },
], { y: s._top + 0.28, height: 2.30, bottom: deck.BOT });
foot(s);
note(s, 'Four steps describe the existing skill workflow, not a client delivery commitment. The build script uses Deck.save with animationStyle subtle; verification opens PowerPoint without a window and inspects native timeline effects.', ['guide', 'kit', 'motion']);

s = deck.slide({ kicker: 'Editable handoff', title: 'A file you can keep editing.', sub: 'The presentation remains a PowerPoint document.' });
// PptxGenJS assigns a table the following shape id; keep the table last to avoid
// a collision with a footer added after it.
foot(s);
deck.table(s, [
  ['Element', 'Stored as', 'Presenter can edit'],
  ['Headlines and copy', 'Native text shapes', 'Wording, weight and placement'],
  ['Process and figures', 'Native shapes and text', 'Order, labels and values'],
  ['This comparison', 'Native PowerPoint table', 'Rows, columns and cell copy'],
  ['Motion', 'Native slide timing', 'Effects in the Animation Pane'],
], { x: deck.M, y: s._top + 0.12, w: deck.CW, colW: [3.1, 3.8, deck.CW - 6.9], rowH: 0.53 });
note(s, 'Editable structure is verified by native text and graphicFrame/table elements in the PPTX plus PowerPoint COM opening. Logo and monogram are image assets. PDF/PNG outputs are static review exports and do not demonstrate playback.', ['kit', 'motion']);

s = deck.title({
  kicker: 'Reusable by design',
  title: 'Build once.\nPresent clearly.',
  sub: 'The next deck begins with this system: branded layouts, sourced content and native motion.',
  foot: 'EDITABLE PPTX  /  SUBTLE MOTION  /  INTERNAL REVIEW',
});
note(s, 'Closing specimen. This proof reuses the installed Momentum Digital brand and kit. Future clients require their own verified brand profiles. Motion remains editable native PowerPoint timing; no video is embedded or exported.', ['guide', 'brand', 'kit', 'motion']);

const pptx = path.join(out, 'momentum-digital-design-motion-proof.pptx');
await deck.save(pptx, { animationStyle: 'subtle' });
if (deck.warnings.length) throw new Error(`Fit warnings: ${deck.warnings.join('; ')}`);
fs.writeFileSync(path.join(out, 'SOURCES.md'), `# Momentum Digital design and motion proof\n\nInternal specimen built 2026-09-04. No marketing metrics, prices, client results or testimonials are asserted. Momentum Digital / Need Momentum branding only.\n\n| Slides | Evidence | Purpose |\n|---|---|---|\n| 1, 3, 8 | ${sources.brand} | Existing brand assets and type tokens |\n| 1-8 | ${sources.kit} | Native editable layouts |\n| 2, 4-8 | ${sources.motion} | Role mapping and subtle motion |\n| 6, 8 | ${sources.guide} | Build and review workflow |\n\nEach slide includes source notes. The numbers 54, 14 and 10.5 are points from the brand type scale, not marketing results. PDF and PNG are static review exports. Open the PPTX in PowerPoint to inspect or play native motion.\n`);
const receipt = { builtAt: new Date().toISOString(), pptx, slides: 8, brand: 'momentum-digital', style: 'subtle', fitWarnings: deck.warnings, semanticTextException: 'Small blue text uses existing blueDeep on white or blueLift on navy. Static footers/page numbers use slate on white or onDarkSoft on navy. Primitive brand tokens and logo artwork remain unchanged.', elapsedSeconds: +((performance.now() - started) / 1000).toFixed(2), sources };
fs.writeFileSync(path.join(evidence, 'motion-proof-build.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt));
