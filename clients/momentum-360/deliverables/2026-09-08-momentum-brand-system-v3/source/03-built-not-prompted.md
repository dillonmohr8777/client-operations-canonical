---
title: "Built, Not Prompted"
subtitle: "AI in design, video and content production without losing the brand. Generate the material. Composite the brand. Gate the output with measurement."
author: Dillon Mohr
series: "Momentum AI Field Notes, No. 3"
status: draft
publishable: false
publishable_reason: >
  Offer prices are proposed assumptions per plan/PLAN.md header, not approved or sent.
  Two design-system audit files report different pair counts (evidence-bank §E.10) and need
  reconciling. Mascot and founder-likeness pieces referenced in chapters 5-6 await written
  acceptance (batch/DELIVERY.md). The Lyria price is a ledger figure, not a verified rate-card
  figure. No client named in the anonymisation map has given permission, so all client
  examples are anonymised; Mac's sign-off on named-case use and on prices is still open.
  Draft date 2026-09-07.
target_query: "ai marketing tools for small business"
primary_keywords:
  - ai marketing tools
  - ai tools for small businesses
  - brand voice
  - what is brand voice
  - brand voice guidelines
  - ai video generator for marketing
  - how to create a marketing video with ai
  - ai marketing agency
word_count: 8388
word_count_method: "body after front matter, excluding [source: ...] tags; 8923 including them"
sources:
  citation_key:
    batch: "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\momentum-360\\deliverables\\2026-09-07-google-aistudio-batch\\"
    audit: "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\momentum-360\\deliverables\\2026-09-05-momentum-design-system\\"
    plan: "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\momentum-360\\deliverables\\2026-09-04-ai-division-plan\\"
    video: "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\momentum-360\\deliverables\\2026-09-07-ai-division-video-batch\\"
    reports: "C:\\Users\\dillo\\Documents\\Codex\\projects\\client-operations\\clients\\momentum-360\\deliverables\\2026-08-31-august-2026-paid-media-monthly-reports\\"
    vault: "C:\\Users\\dillo\\repos\\dillon-os\\12_Brain\\03_Concepts\\"
  files:
    - batch/PRODUCTION-BATCH.md
    - batch/DELIVERY.md
    - batch/budget.json
    - batch/SPOT-EDL.md
    - batch/SPOT-SCRIPT.md
    - batch/review/30s_v3_director_review.md
    - batch/research/copy-skills-scan.md
    - batch/research/evidence-bank.md
    - batch/research/aeo-geo-topic-research.md
    - batch/refs/analysis/16acc20e.md, 84e6931b.md, dcba6119.md, e1d559e0.md, fa06592b.md
    - audit/AUDIT.md
    - plan/PLAN.md
    - video/README.md
    - reports/reports-data.mjs (line 3, via evidence-bank)
    - vault/Dillon Voice Profile.md
    - https://ai.google.dev/gemini-api/docs/pricing (as fetched 2026-09-07, per batch/PRODUCTION-BATCH.md)
---

# Built, Not Prompted

*AI in design, video and content production without losing the brand. Generate the material. Composite the brand. Gate the output with measurement.*

Momentum AI Field Notes, No. 3. Draft, 2026-09-07. Working title.

**How to read the citations.** Every number in this book carries a source in square brackets. `batch/` is the production folder for 2026-09-07, `audit/` the design-system audit of 2026-09-05, `plan/` the AI division plan of 2026-09-04, `video/` the locally rendered film batch, `vault/` the voice profile. Full paths are in the front matter.

---

## Who this is for, and who it isn't

This is for the owner of a local service business, or the office manager who does the Facebook, who has tried Canva's AI or asked ChatGPT for a caption and got something that could have belonged to any business in the county. You don't want better prompts. You want a way of working where the output comes out looking like you, every time, without you standing over it.

It's also for the small agency producing for that owner. Most of what's in here is what we do on our own account, with the numbers we measured on our own work.

It isn't for you if you want a prompt library. There are none in here. It isn't for you if you need proof that AI-made creative produced leads or revenue. I don't have that proof, and I'll say so at the points where you'd expect it. And it isn't for you if you want to skip the measuring part. The measuring part is the book.

Everything here comes from one day. On 2026-09-07 we generated 28 stills and 12 video clips on Google's models under a hard $25 cap, cut a 30-second launch spot plus a :15 and a :06 the same day, bought a music bed for four cents, and had a model review the cut with timecodes. [source: batch/DELIVERY.md] That was two days after an audit of ten live sites we'd built found 37 of 120 colour pairs failing the contrast standard. [source: audit/AUDIT.md §1] That's the evidence. Where a chapter needs something I don't have, it says so.

One rule runs through all of it: your logo never touches a model.

---

## 1. Why does AI output look generic, and is a better prompt the fix?

Generic output is a system problem, not a prompt problem. A prompt is one input. The reference set, the brand file, the compositing step and the gate are the others. On 2026-09-07 two sessions ran on the same key with the same brief. One followed five reference films and shipped. One produced a generic white robot and was shelved. The prompts weren't the difference. The system was. [source: batch/DELIVERY.md; batch/PRODUCTION-BATCH.md §0]

Here's what happened. Two production sessions ran in parallel on my Gemini key that day. The second one spent $1.70 on five hero images and five short video clips. [source: batch/DELIVERY.md] They were competent. They were also a generic white humanoid robot, a glass UI on a black phone, and torn-paper rowhouses, none of which is us. They contradicted the five reference films the brand had already made, and they broke a standing rule against generic AI mascots. [source: batch/DELIVERY.md] They're still on disk. Nothing was deleted. Nothing was used.

I'd like to say the first session got it right from the start. It didn't. My own first production spec was written off a matte reinterpretation from an earlier render batch, not off the reference films, and it got the materials, the mascot and the accent colour wrong. [source: batch/PRODUCTION-BATCH.md, header] Three corrections came out of actually watching the references:

1. Glass is real. The launch film uses glossy translucent blue glass with polished gold beads next to matte cardstock. I'd written "all matte". [source: batch/PRODUCTION-BATCH.md §0]
2. Momo, the assistant character, is a sphere with a flat bottom, two vertical white oval eyes and a thin antenna capped with a yellow bead. Not the blob I'd described. There's a second character too, a flat disc with a curly antenna, and they are not the same character. [source: batch/PRODUCTION-BATCH.md §0]
3. There isn't one accent colour. The launch and Momo films use yellow-gold, `#FACD00` and `#F5C43C`. The services film uses burnt orange, `#D06214`. "Not one accent. Do not force them together." [source: batch/PRODUCTION-BATCH.md §0]

None of those corrections came from a better prompt. They came from copying the five films to disk, making contact sheets, and having a model (Gemini 3.5 Flash) write a shot-by-shot analysis of each: shot list, materials, lighting, palette with hex codes, camera, cut count, type, character, provenance, motion language. [source: batch/PRODUCTION-BATCH.md §0; batch/refs/analysis/] Then the prompts were written against those facts, hex codes included.

That's the whole difference between prompted and built. Prompted means the model is the process. Built means the model is one step in a process that already knows what the brand is and checks the result. The delivery note for the day puts it in one line: "Google generated; this machine orchestrated and edited." [source: batch/DELIVERY.md]

Three things exist before anything gets generated:

- The brand, written down. Voice, facts you can state, claims you can't. Chapter 2.
- The tokens. Colour, type, spacing, radius, in a file the tools read. Chapter 3.
- The gate. A check that fails the render on a number. Chapter 4.

Then three things happen to every piece:

- Generate the material. Scenes, textures, motion, plates. Nothing with letters in it.
- Composite the brand. The logo, the words, the labels, from canonical files. Chapter 5.
- Gate the output. Scan it, review it, and have a person say yes or no. Chapter 6.

If you take one thing from this chapter: the reason your AI output looks like everyone else's is that everyone else is also just prompting. The model has no memory of you. Give it one, outside the prompt.

---

## 2. What is a brand voice, and how do I write one down so AI can follow it?

A brand voice is the words you use, the words you never use, how you open and close, and the claims you're allowed to make. Written down properly it's one page of counts and examples, not adjectives. We built mine from 479 of my own messages. The measured result: zero uses of the seventeen words marketing copy is usually made of. That's a voice a model can follow. [source: vault/Dillon Voice Profile.md]

"Friendly but professional" is not a voice. A model can't do anything with it, and neither can a freelancer. What a model can follow is a list of things that are true about how you write, with numbers.

Here's ours. It was built from 479 substantive Slack messages I typed between 2026-01-19 and 2026-09-02, filtered to exclude anything an automation posted under my name. Average message: 182 characters. [source: vault/Dillon Voice Profile.md] Across those 479 messages there were zero instances of any of the seventeen stock words the profile checks for: synergy, holistic, best-in-class, robust, circle back, touch base, deliverables, stakeholders, ecosystem, and the eight hype adjectives every agency website is built from. The full list is in the file. One "bandwidth". Two "solutions". [source: vault/Dillon Voice Profile.md] So the first line of the brand file is a list of seventeen words that never appear, and any copy containing one of them isn't in the voice no matter how well it's built.

The rest of the file is mechanics you can count:

- Hyphens, not em dashes: 33 to 5. [source: vault/Dillon Voice Profile.md]
- Contractions: 159 "I'll" against 15 "I will". [source: vault/Dillon Voice Profile.md]
- "Just" is the most-used softener, 102 times. [source: vault/Dillon Voice Profile.md]
- Two registers, never blended in one paragraph. The peer register (fast, warm, occasionally profane) is for people who already know me. The operator register (number first, then the comparison, then the next action) is the one that drives anything with a client's name on it. [source: vault/Dillon Voice Profile.md]
- Structural moves: open with the outcome, end on who does what next, name the gap instead of bluffing, ask in numbered items so nobody guesses. [source: vault/Dillon Voice Profile.md]

The profile also says what it doesn't cover. It's Slack only, workplace only, 2026. Cold voice to strangers is "an extrapolation from Register B and should be validated against real replies before scaling." [source: vault/Dillon Voice Profile.md] Your file should have the same paragraph. A voice measured from one channel is a voice for that channel until proven otherwise.

**The claims list.** The second half of a brand file is what you're allowed to say. For the launch spot, the script opens with "Facts in play, and only these": Philadelphia, since 2015, needmomentum.com, Momentum Digital, four lanes, the character's name, and three lines of copy. Every other line in the spot is lifted word for word from the five reference films. [source: batch/SPOT-SCRIPT.md, header] Then there's the section I think matters more, "What I deliberately did not say": no named-lead match-back, because it's true on one account of four and the plan says it can't be sold until it's fixed; no numbers at all; no client names; no guarantees on rankings, citations, leads or revenue; no prices; no founder names; no hype vocabulary. [source: batch/SPOT-SCRIPT.md §F]

Both lists go in the file. The first is what the model may say. The second is what it may not, and why. When a model drafts a caption that says "we guarantee results", the file is what fails it.

A note from a research pass the same day: we read twelve GitHub "copywriting skill" files in full to see what the crowd had encoded, and pulled fourteen rules out of them. [source: batch/research/copy-skills-scan.md] The one that survived best: every claim carries a number, a name or a timeframe, and a proof claim without backing gets cut, not softened. [source: batch/research/copy-skills-scan.md, rule 11] Also worth knowing: the largest skills repository we checked, at 175,000 stars, had no marketing or copywriting skill at all. [source: batch/research/copy-skills-scan.md] Nobody has done this for you.

**How to write yours on Monday.** Pull 200 to 500 messages you actually wrote to customers. Emails, texts, whatever you have. Count the words you never use. Count how you open. Count contractions and dashes. Write the ten facts you can prove about the business, with the proof. Write the claims you can't make and why. Split it into the register for people who know you and the register for people who don't. One page. Date it. That's the file. It'll be wrong in places and it'll still beat "friendly but professional".

---

## 3. How do I keep colour, type and logo consistent across AI output?

Put the brand in a file that the tools read instead of in someone's taste. Every colour as a hex code with a job, three fonts, a spacing scale, a short list of radii. Then the rule that runs this book: your logo never touches a model. Generate the scene, place the exact logo file on top, and check the bytes.

Start with the logo, because it's the clearest case.

A model draws letters. It doesn't draw your letters. Ask an image model to put your wordmark in a scene and you'll get something that looks like it from across the room and wrong from a foot away. So the rule on every job in the batch is one line: "Logos are never generated." [source: batch/PRODUCTION-BATCH.md §1] The mark and wordmark are composited from one canonical folder, and the copies used in the render project were verified SHA-256-identical to that source. [source: video/README.md, "Provenance"] Same bytes, or it isn't the logo.

The same applies to every word. "All copy and UI labels are editing overlays." [source: batch/PRODUCTION-BATCH.md §1] Not one letter in the 30-second spot was generated. Every line was placed in an editor, in a named typeface, at a named position, over a plate that had no text in it. [source: batch/SPOT-SCRIPT.md, header] To keep the model from putting text in anyway, every prompt ends with the same negative list, which starts: "text, letters, words, numbers, logos, watermarks, UI labels, captions, subtitles, faces, people, hands, purple, violet, magenta, neon". [source: batch/PRODUCTION-BATCH.md §1]

Faces follow the same rule. "Faces are composited from authorised portraits or absent. Never generated." [source: batch/PRODUCTION-BATCH.md §1] We have ten authorised clean portraits on disk. Whether any founder's face appears in the launch visual is gated on written acceptance from the two people it concerns. [source: batch/PRODUCTION-BATCH.md, Prompt 5] Until then the skyline runs empty.

Two smaller logo rules from the prospect-site system we run: never display a logo above about 1.4 times its native width, and when no usable logo exists, fall back to a typographic wordmark rather than inventing one. On a repair pass of 296 prospect sites, 30 logos were harvested and 70 sites got the typographic fallback. [source: batch/research/evidence-bank.md §C, "Prospect Radar" and "Radar perfect pass"] A stretched logo and a made-up logo are the two commonest ways an AI-built page announces itself.

**Now the tokens.** A token file is the brand as data: a brand colour as a hex value, a display font by name, a radius in pixels, and so on, each with a name the tools call it by. The tools read the file. Nobody types a colour by hand.

Here's what that buys. When we audited ten live prospect sites, all ten defined the same 68 custom properties. 61 were identical across all ten. Seven varied, and they were exactly the seven that should vary, the per-prospect tint: brand, second brand, accent, ink, paper, and the two on-colours. [source: audit/AUDIT.md §2.1] Same three fonts on all ten. Same six radii. Same easing curve. The audit's own words: "the kit is disciplined." [source: audit/AUDIT.md §2.1] That discipline didn't come from care. It came from the fact that there was one file and the generator couldn't drift from it.

Compare our own marketing site, which was built by hand over years: five font families, twenty distinct border radii, fourteen different transition timings, and two different brand oranges on one page. [source: audit/AUDIT.md §2.4] Nobody chose that. It accumulated. A token file is how you stop accumulation.

Some specifics from the day's spec, so you can see what a usable token file looks like for creative work rather than a website:

- Two palettes, not one forced together. The launch palette: royal `#0A3498`, lit blue `#1D4ED8`, gold `#FACD00`, white, cream `#FDF9F3`. The paper palette: beige `#EFECE6`, charcoal `#1A1510`, navy `#0B4A75`, blue `#1255B2`, orange `#D06214`, yellow `#F5C43C`. Each colour has a job written next to it: "one word or one element per frame", "the closing studio card only". [source: batch/PRODUCTION-BATCH.md §1] "The references do not share a palette, so the spec does not pretend they do." [source: batch/PRODUCTION-BATCH.md §1]
- Type with limits the assembler can enforce: Montserrat 800 for display, no more than four words a line and two lines; Poppins 500 for sublines; Caveat for handwriting, lowercase, five words or fewer. [source: batch/SPOT-SCRIPT.md, header]
- A materials line and a camera line per palette, because "matte cardstock, locked orthographic camera" is a brand decision as much as a colour is. [source: batch/PRODUCTION-BATCH.md §1]

One more piece of evidence that the file approach holds under pressure. On a directory product we're building for a client, the admin panel had roughly 110 lines of hard-coded hex colours. The hardening pass took that to zero, and a test now asserts it stays at zero. [source: batch/research/evidence-bank.md §A.14] If a colour isn't a token, the build fails. That's the whole method in one line.

Where the file lives: one place, referenced by path from every project. Don't paste a copy into each tool. A copied palette is exactly how two oranges end up on one page.

---

## 4. How do I know a design fails the design test?

You measure it. The design test is a contrast ratio on every text-on-background pair, checked against WCAG AA: 4.5:1 for normal text, 3:1 for large text. On 2026-09-05 we measured ten live sites we'd built, 120 pairs, and 37 failed. The replacement system carries 31 pairs at zero failures, and its build script refuses to render if any pair fails. [source: audit/AUDIT.md §1]

The figures in this chapter come from the audit at `audit/AUDIT.md`, dated 2026-09-05. A second audit file exists at `C:\Users\dillo\Documents\Codex\momentum-design-system\AUDIT.md` and reports different counts: 29 pairs and 0 failures for the new system, and per-pair-type failure rates of 9, 8 and 2 out of 10. [source: batch/research/evidence-bank.md §E.10] I'm citing the first. The two need reconciling before this book leaves the building.

Here's how the measurement was done, because a measurement you can't describe isn't one. Ten live prospect builds were fetched as shipped HTML. Every token block was parsed in document order. Contrast was computed from those tokens by a script, then independently re-measured in a real browser from the computed style of every element that owned a visible text node. Both paths agreed. [source: audit/AUDIT.md §1] Ten sites times twelve pairs is 120 pairs. 37 fail AA. The new system: 31 pairs, 0 fail. [source: audit/AUDIT.md §1, line 17]

Three defects account for most of it, and none of them is a per-site mistake.

**(a) The accent colour printed on the brand colour.** The hero eyebrow on these sites uses the accent token as text on the brand-colour field. Measured ratios ran from 1.01:1 to 2.72:1 against a 4.5 requirement. [source: audit/AUDIT.md §2.2(a)] At 1.01:1 the text is invisible. Not faint. Invisible. The audit's heading counts six of ten sites; the table under it lists nine rows, every one under 4.5. [source: audit/AUDIT.md §2.2(a)] Either way the cause is the same: one token doing two jobs. The accent was chosen to work as a field, a button you tap, and then printed as text on another saturated field. Our orange, `#f58320`, scores 7.19:1 as a field with near-black text on it, and 2.58:1 as text on white. [source: audit/AUDIT.md §2.2(a)] No orange can do both. That's arithmetic, not taste.

**(b) Muted text on panels, nine of ten sites, 4.28:1 to 4.49:1.** Nine near-misses in a row is "a formula, not an accident". The muted colour was derived by mixing ink into paper, and validated against paper. Then it was rendered inside cards, whose background is a different token. It was tested on a surface it never appears on. One site missed by 0.01. [source: audit/AUDIT.md §2.2(b)]

**(c) Headings on the deep field, seven of ten sites, 1.78:1 to 2.86:1** against a 3.0 requirement for large text. Both colours were derived from the same hue, so the darker one was always too close to the lighter one. [source: audit/AUDIT.md §2.2(c)]

Two smaller ones: one site loaded five font families instead of the kit's three, and one shipped a violet brand colour, `#583E7D`, "the closest any live build comes to the AI-purple line". [source: audit/AUDIT.md §2.3] Two other prospect builds shipped the kit's unmodified demo palette, and a third carried the demo navy. [source: plan/PLAN.md, "The design proof"] A prospect got a page in colours that weren't theirs. That's a generator without a gate.

And then the finding I'd rather not print but will: our own homepage measured worse than the prospect sites. Body copy at `#888888` on `#f5f5f5` is 3.25:1, "a WordPress default nobody chose". [source: audit/AUDIT.md §2.4] The sites a generator built from a token file were more coherent than the site people built by hand. That's the argument for the file.

**The fix is structural.** The accent is split into three tokens by job: one for fields, one for the label on that field (7.19:1), one for accent-coloured text on paper (6.18:1). Muted text is validated on both surfaces it appears on (6.25:1 and 5.43:1). The deep field gets its own measured on-colours instead of being derived. Radii go from six to four. [source: audit/AUDIT.md §3] One pair still can't pass at body size. Orange text on the brand blue tops out at 3.44:1 for any orange that still reads as ours, so it's declared large-text-only at 3.14:1, and small orange text is routed to the dark field, where it reads at 8.51:1. [source: audit/AUDIT.md §3] Stated, not shipped as a silent failure.

**The gate catches its own builder.** Four failures were found in the new system itself, by measuring it the same way: the hero and footer were dark fields not picking up the dark-field text colours (2.70:1 and 2.74:1), the footer gradient had been measured at its deep end rather than its worst stop, and the nav overflowed the page by 19 pixels at 375 wide and 23 at 768. [source: audit/AUDIT.md §3] All fixed before it shipped, because the script wouldn't render otherwise. It's tested with no horizontal overflow at 320, 375, 390, 768, 1024, 1440 and 1920 pixels. [source: audit/AUDIT.md §4]

**Check the ruler.** The first version of the in-browser probe misread a colour format and reported about a dozen false failures at 1.2:1. [source: audit/AUDIT.md §1] So the contrast script now asserts two known values, 21.00:1 for white on black and 4.54:1 for `#767676` on white, before it measures anything. "A contrast tool that has not been checked against a known value is not evidence." [source: audit/AUDIT.md §1] If you buy a tool for this, ask it those two questions first.

The same gate runs on other work now. Two pre-sale audit PDFs were regenerated only to clear AA contrast defects. [source: batch/research/evidence-bank.md §C, "AI Search Snapshot"] The directory client's hardening pass fixed seven contrast failures, the worst at 2.88:1. [source: batch/research/evidence-bank.md §A.14] An entertainment-venue client's dashboard refresh passed 43 of 43 checks with zero accessibility violations. [source: batch/research/evidence-bank.md §A.15] A 25-site release gate checked contrast at every width from 320 to 1440 and passed 25 of 25. [source: batch/research/evidence-bank.md §B, S20]

One honesty note the plan itself insists on: "never fails the design test" is true of the new system's gate, not of the work we'd already shipped. [source: plan/PLAN.md, "The thesis"] Thirty-seven failures were real and they were ours. The gate is the promise going forward. Anyone who tells you their AI output never fails a design test, and can't show you the count of failures it caught last month, hasn't got a gate.

---

## 5. Can AI make my marketing video, and will it look cheap?

Yes, and it will look cheap if the model does the whole job. On 2026-09-07 we generated 28 stills and 12 video clips under a $25 cap, spent about $13.79 across the key, and cut a :30, a :15 and a :06 the same day. What kept it from looking cheap: the model made the material. The brand and every word were composited afterwards. [source: batch/DELIVERY.md; batch/budget.json]

**The bill first.** Hard cap: $25.00, set after the first Google charge. This session: 28 stills, one Veo Lite test, eleven Veo Fast clips, one Lyria music bed and five reference analyses, about $12.09. The parallel session on the same key: $1.70. Key total: about $13.79. Every failed request was unbilled. [source: batch/DELIVERY.md; batch/budget.json]

The prices, as verified on Google's pricing page that day. They will change. The date matters more than the number.

| Model | Price, verified 2026-09-07 |
|---|---|
| Gemini 2.5 Flash Image (stills) | $0.039 per image |
| Gemini 3.1 Flash Image | $0.067 at 1K |
| Gemini 3 Pro Image | $0.067 at 1K batch, $0.12 at 4K |
| Veo 3.1 Lite (video) | $0.05 per second at 720p, $0.08 at 1080p |
| Veo 3.1 Fast | $0.10 per second at 720p, $0.12 at 1080p |
| Veo 3.1 Standard | $0.40 per second at 720p to 1080p, $0.60 at 4K |

[source: batch/PRODUCTION-BATCH.md §0, "Verified prices", from ai.google.dev/gemini-api/docs/pricing]

So an 8-second Fast clip at 1080p is $0.96. [source: batch/budget.json] The 30.6-second Lyria 3 instrumental bed cost $0.04. [source: batch/DELIVERY.md] That Lyria figure is from the spend ledger, not the verified price table, which didn't cover music. Treat it as what we paid, not the rate card.

**What to generate.** The clearest guidance in the whole batch is about the launch film: "abstract, textured, no text, no faces, no character to keep consistent. That is exactly the content Veo does well." [source: batch/PRODUCTION-BATCH.md, Prompt 1] Fold physics, refraction on glass, a gold cable in macro, fireworks over a plaza. The best clip of the day was the fireworks: two rockets rise, burst symmetrically blue and white, smoke drifts, a second pair lower, camera locked, plaza steady. The QA verdict was one word, "Excellent." [source: batch/PRODUCTION-BATCH.md §3] Fireworks are "the one thing sprites do badly and Veo does well." [source: batch/PRODUCTION-BATCH.md, Prompt 5] The three clean Fast clips in the first video run each rendered in 80 to 88 seconds. [source: batch/PRODUCTION-BATCH.md §3]

**What to shoot, draw or rig instead.** Faces: composited from authorised portraits or absent. Consistent characters: risky. The mascot loop closed perfectly using a first-frame-equals-last-frame trick, and then "sprouts limbs mid-hop". [source: batch/DELIVERY.md] The fix was three words in the prompt, "no limbs ever", and a second version queued. [source: batch/PRODUCTION-BATCH.md §0] For anything that has to be the same in every shot, a local animation rig "cannot drift" and costs nothing in credits; the plan was to generate one clip and compare, not to assume. [source: batch/PRODUCTION-BATCH.md, Prompts 3 and 4]

**What to overlay.** Every word. The logo. UI labels. The flat-lay of app cards carries a tiny label, "Illustrative UI — not client work", because the reference film did and because it's true. [source: batch/PRODUCTION-BATCH.md, Prompt 2]

**What went wrong, and got caught.** The first launch clip: for its first five seconds a generated mechanical arm entered from upper-left and handled the object. "Invented, a QC reject." The last three seconds were clean and were cut out as a usable tail; a second take came back clean. [source: batch/PRODUCTION-BATCH.md §3; batch/DELIVERY.md] The Momo hero still came back with a black-screen iPhone instead of the cream blank phone the prompt asked for; regenerated once with harder wording, the first version kept on disk with a label. [source: batch/PRODUCTION-BATCH.md §3] Two plain empty end-cards tripped the generator's recitation filter, which refused to make a blank cream field, so both were made locally in Python at the exact hex with grain added. "Zero cost, deterministic, and the honest route for a blank field anyway." [source: batch/PRODUCTION-BATCH.md §3] Of 19 stills in the first run, 17 came back, and 16 of those 17 were on-language against the references. [source: batch/PRODUCTION-BATCH.md §3]

**The quota you can't see.** After twelve successful video renders that day, every further request returned a "resource exhausted" error with no retry time. Google doesn't publish the per-tier number; the only place to see it is your own dashboard. [source: batch/PRODUCTION-BATCH.md §0] Separately, more than three Fast jobs at once hit a concurrency ceiling, and that ceiling is per key, not per process. [source: batch/PRODUCTION-BATCH.md §0] The consequence in the finished spot: four shots are stills with a slow push instead of video (the scrapbook opener, the bird lift-off, Momo at the phone, the paper city) because their clips were in the queue when the window closed. Eleven clips sit in a manifest at $10.56, inside the cap, and drop into the edit when the window resets. [source: batch/DELIVERY.md]

That's the practical lesson for anyone planning a video day: the cheap route has to exist before you start. Stills plus local motion for everything, so the generated clips are upgrades, not dependencies. The prior batch of division films, eleven of twelve planned pieces, rendered locally at zero generator spend. [source: video/README.md] The costed routes for this batch ran from $0.78 (twenty stills, all motion local) to $10.38 (ten clips on Veo); the recommended middle was $5.58. [source: batch/PRODUCTION-BATCH.md §3]

**One more thing that bit.** Two models on Google's list, Gemini 2.5 Flash and 2.5 Pro, returned "no longer available to new users" when called, while the model list still advertised them. [source: batch/PRODUCTION-BATCH.md §0] Verify on your own key, the day you use it, before you promise a client anything.

**The cut.** Thirty seconds, 16:9, 24 frames a second, assembled locally in Remotion with the clips as sources and every overlay as a component. [source: batch/SPOT-EDL.md, "Assembly"] Hard cuts throughout except one twelve-frame dissolve into the end card. [source: batch/SPOT-EDL.md] Music from the third version on, at -16 LUFS. No voiceover: the recommended script is silent-first, so it works muted in a feed. [source: batch/DELIVERY.md; batch/SPOT-SCRIPT.md] The two lines it opens and closes on are the only positioning in the piece: "we built a machine." in handwriting, and "Momentum built the machine. Now we build yours." on the end card. [source: batch/SPOT-SCRIPT.md §A, §B]

Will it look cheap? Where the model was allowed to invent, yes: the arm, the limbs, the black phone. Where the model was given a plate to make and nothing else, no. That's not a Veo verdict. That's the division of labour.

Nothing here claims a comparison against any other generator. No verified per-piece baseline exists in our files, and the batch record says so. [source: batch/PRODUCTION-BATCH.md §3]

---

## 6. Who checks the output before it ships?

Two gates and a person. The first gate is mechanical: scan every frame for forbidden colours, verify the logo bytes, measure contrast, fail the render on any of them. The second is a model review with timecodes, treated as notes. On our :30, Gemini 3.8 Flash logged eleven shots, moved two cuts by frames, flagged three defects and wrote "Close." A person made the cuts. [source: batch/review/30s_v3_director_review.md; batch/DELIVERY.md]

This is the third leg of the rule, gate the output with measurement, and it's the one the outline for this book didn't have a chapter for. It needs one, because it's where "built" is actually enforced.

**Gate one: things a script can check.** On the division film batch, a QA script scans every frame of every piece for forbidden hues, purple and violet outright and orange beyond a small accent area, and writes a report. Orange sampled at 0.0% of frame area on every piece: a dot and a thin rule, never a wash. [source: video/README.md] The wordmark PNGs are hash-checked against the canonical logo. [source: video/README.md, "Provenance"] Contact sheets get rendered for every clip and every still so a human can look at every frame at once instead of scrubbing. [source: batch/DELIVERY.md; batch/clips/] And the design system's contrast gate applies to every card, end-card and overlay the same as it does to a web page. [source: audit/AUDIT.md §1]

None of this needs judgement. That's the point. A colour is either in the file or it isn't. A hash matches or it doesn't. A ratio clears 4.5 or it doesn't. Put every check that can be a number here, so the human's attention goes where it's needed.

**Gate two: the review.** After the third cut of the :30, a model (Gemini 3.8 Flash, per the delivery note) was given the video and asked for a director's review in a fixed shape. What came back: [source: batch/review/30s_v3_director_review.md; batch/DELIVERY.md]

- A shot log, eleven shots with in and out timecodes to the frame.
- Music to picture: the cut into the triangle row "lags the beat by roughly 6 frames; advance cut to 00:07.00 to catch the percussion entry." The cut to the UI cards is early; "push back by 4 frames to 00:15.24 to hit the snare transient." The fireworks cut "hits the orchestral swell naturally and requires no shift."
- Two shots that read as stills, the bird plate and the paper museum, with a suggested fix for each.
- Type, line by line: which lines are legible at TV distance, which hold long enough, and one lower subhead that is "too condensed and low-contrast for brief TV exposure."
- The end card: the mark "resolves smoothly from the particle ring", the "AI" suffix matches the parent wordmark in weight and tracking, and the hold runs from 00:27.20 to 00:30.00, about 2.3 seconds, "sufficient for linear broadcast."
- Three defects with timecodes: mesh tearing at 00:09.18, edge distortion at 00:12.15, temporal smearing on the firework trails at 00:25.10.
- Three edits, ranked. Verdict: "Close."

What was applied: the fold cut moved to the percussion entry, the services cut to the snare, the caps lines scaled up 20%, lateral drift added to the still plates, and the ending rebuilt. [source: batch/DELIVERY.md] What wasn't: the three defects. They're in generated footage. You don't fix those in post; you regenerate or you accept them, and that's a person's decision, not a note.

Two cautions about model review, both from doing it.

First, it can't tell you whether the brand is right. It has no idea what our blue is. Brand correctness came from gate one and from the reference analyses; the review is good at timing, legibility and defects, and it should be asked only about those.

Second, I didn't independently verify every frame it flagged. The notes we applied were checked by eye at the timecode. The three defects were not re-examined frame by frame for this book. A model's review is evidence that something is worth looking at, not evidence that it's wrong. Treat it as a very fast junior editor with no memory and no stake.

**The person.** Two decisions in the day's record were human and couldn't have been otherwise. A tagline was cut from the ending of the third and fourth versions. [source: batch/DELIVERY.md] And when the quota hit, the record says: "No further Veo spend: Dillon called it." [source: batch/DELIVERY.md] A gate that never lets a person say stop isn't a gate.

One more discipline, from a different client. Ten landing pages we built for an events company scored 92 out of 100 on our own readiness scorecard, and the last line of the evidence file says that number "is an internal launch readiness score. It is not a Google ranking, an AIOSEO score, or a ranking guarantee." [source: batch/research/evidence-bank.md §B, S14] Label your scores. A number you invented is not a measurement of anything outside the room.

Nothing from 2026-09-07 was published. Mascot and founder-likeness pieces still wait on written acceptance from the two people concerned. [source: batch/DELIVERY.md, "Gates that still stand"] The gate held.

---

## 7. Which AI marketing tools are worth it for a small business?

The ones that honour a hex code, keep your logo out of the model, show a price per unit before you run, and can be swapped for something free when they stop. I can vouch only for the tools we ran on 2026-09-07, at the prices verified that day. I have no test evidence on the rest, and I'm not going to rank tools I haven't measured.

The outline for this book asked for "tools that respect a brand file, tools that do not." I can't write that chapter honestly. We didn't test Canva's AI, Adobe's, or any of the all-in-one marketing suites against a brand file. What I can give you is four tests, each of which came from something that actually happened, and the list of what we used with what it cost.

**Test 1: does it honour the number you give it?** The stills model was told `16:9` in a config field and returned 1344 by 768. [source: batch/PRODUCTION-BATCH.md §0] Hex codes in prompts held across the batch, with the exceptions in chapter 5. If a tool takes "blue" but not `#1255B2`, it's a toy.

**Test 2: does it give you a plate?** The output has to be something you can put your logo on, not something that already has a logo-shaped object in it. If the tool's pitch is "upload your logo and we'll put it in the scene", that's the model touching the logo, and the result will be approximately yours.

**Test 3: does it show a unit price before it runs?** Our ledger prices each job before it starts, $0.039 for a still and $0.96 for a Fast clip, debits it, and refuses any job that would cross the cap, so a crash can't under-count. [source: batch/budget.json; batch/PRODUCTION-BATCH.md §0] A tool with a monthly subscription and a vague credits balance can't be budgeted per piece, and per-piece is the only way you'll know what a campaign cost.

**Test 4: does a free route exist when it stops?** It will stop. A quota ended our video day at render twelve with no warning and no published number. [source: batch/PRODUCTION-BATCH.md §0] A filter refused to make a blank cream rectangle. [source: batch/PRODUCTION-BATCH.md §3] Two models on the list returned "no longer available". [source: batch/PRODUCTION-BATCH.md §0] Each time, the answer was local and free: a Python script for the blank fields, a local render project for motion, a queue that waits. If your whole pipeline is one vendor's app, your whole pipeline has that vendor's quota.

**What we used, and what it's for.**

| Tool | Job | What it cost, 2026-09-07 |
|---|---|---|
| Gemini 2.5 Flash Image | stills, plates, product-sheet props | $0.039 each |
| Veo 3.1 Fast, 8s at 1080p | motion with physics: folds, cable, fireworks; loops via a last-frame constraint | $0.96 per clip |
| Veo 3.1 Lite, 4s at 720p | plates only; no last-frame, no reference images | $0.20 per clip |
| Gemini 3.5 Flash | shot-by-shot analysis of the five reference films | token-priced, small |
| Gemini 3.8 Flash | director's review of the cut, with timecodes | token-priced, small |
| Lyria 3 Clip | 30.6-second instrumental bed | $0.04 |
| Remotion | assembly, overlays, local motion, the whole prior film batch | $0 on Google |
| Python (PIL) | blank fields at exact hex with grain | $0 |
| A contrast script | the gate, self-checked against two known values | $0 |

[source: batch/PRODUCTION-BATCH.md §0 and §3; batch/DELIVERY.md; batch/budget.json; audit/AUDIT.md §1]

Total model spend for the day, both sessions: about $13.79. [source: batch/DELIVERY.md] The tools were not the expensive part. The references, the token file and the gates cost nothing in credits and most of the day in attention. If someone sells you a tool as the answer, they're selling the cheap part.

About 4,400 people a month search "ai marketing tools". [source: batch/research/aeo-geo-topic-research.md, cluster 9] The list is what people want and the least important thing in this book. Any tool that passes the four tests will do. Most of the difference between good and generic is in the files it reads and the gate it runs through.

One rule for whatever you pick: reference the token file by path. Don't paste the palette into each tool's brand kit. Copies drift, and the drift is what we measured.

---

## 8. What should an AI marketing agency deliver each month, and what does it cost?

A written scope with a number on it and a list of what's excluded. Ours, as proposed in our 2026-09-04 plan and not yet approved: a Campaign Production System at $750 setup and $1,250 a month. One brand, one brief, four original concepts, up to eight size variants, one readiness summary, six hours of delivery. No shoot, no custom animation, no paid placement, no lift claim. [source: plan/PLAN.md, "Three offers"]

Here's the scope as the plan states it, and I want to be plain that the plan calls its prices "proposed assumptions" and says "No offer has been approved or sent through this work." [source: plan/PLAN.md, header]

| | Campaign Production System, as proposed |
|---|---|
| Setup / monthly | $750 / $1,250, USD, excluding media spend, taxes and third-party pass-through fees |
| Included | One brand, one campaign brief, four original copy/design concepts and up to eight straightforward size variants, plus one results/readiness summary. Reuse approved brand assets. |
| Acceptance | Exact brief and dimensions, brand and claims review, editable agreed files, one consolidated revision round. |
| Excluded | No shoot, custom animation, paid placement, unlimited video or new website. |
| Budget | Total delivery budget 6 hours a month. Setup assumes 5 delivery hours. A tool allowance of $100 a month per client is modelled. |

[source: plan/PLAN.md, "Three offers with finite delivery contracts"; "Economics and capacity"]

The agency's "AI Marketing" category maps onto this. "Social Packages" has no scope, no price and no delivery contract drafted, so it isn't on any deck, and it isn't in this book. [source: plan/PLAN.md, "AI Marketing and Social Packages"]

**What the scope means after this book.** "Reuse approved brand assets" is chapters 2 and 3: the voice file, the claims list, the token file, the canonical logo. "Brand and claims review" is chapter 6: the mechanical gate and the review. "Four concepts and eight variants" is chapter 5's division of labour, at a fixed count so it's a deliverable and not a faucet. The readiness summary is the ledger: what was made, what passed, what was rejected and why, what it cost in credits.

**The sentence most agencies won't put in writing.** "Campaign production is a standalone deliverable; creative quantity is not proof of business lift." [source: plan/PLAN.md, "Three offers"] That's from our own plan. It means a month of production is judged on whether the pieces are on-brand, on-spec and passed the gate. Whether they moved the phone is a separate question, measured separately, reported separately, and I can't promise it.

**What I don't have.** No client has bought a month of this yet. There is no brief-to-four-concepts-to-eight-variants example I can show you, with or without permission, because none has been delivered. [source: plan/PLAN.md, header; batch/research/evidence-bank.md §E] There's no before-and-after for any creative deliverable in our files: no lift, no lead delta, no time saved. [source: batch/research/evidence-bank.md §E.1 to E.3] What exists is internal: the day's batch (28 stills, the clips on disk, three cuts), the design system with its gate, and the audit of ten live sites. That's the portfolio. Judge it as one.

On turnaround, one measured observation and no promise: a 26-slide deck was assembled from the existing brand components in about one hour and fifty-eight minutes. The plan is explicit that this "was about 1h58, not an established under-one-hour SLA." [source: plan/PLAN.md, "What already exists"] One data point is a data point.

**What a monthly report for this should contain.** I'd hold any agency, including us, to this list:

1. Counts: concepts, variants, dimensions, files delivered, in editable form.
2. The gate: pairs measured, failures found, failures fixed, anything declared large-text-only or otherwise flagged rather than hidden.
3. Rejections: what the model produced that was thrown out, and why. (This month: an arm, a set of limbs, a black phone.)
4. The ledger: credits spent per piece, against the cap.
5. Exclusions restated, so nobody thinks the shoot was included.
6. Platform activity, if any, reported separately from inquiries, appointments and revenue. That's our reporting rule for every client: "Platform activity is reported separately from qualified inquiries, appointments, estimates, bookings, and revenue." [source: reports/reports-data.mjs, line 3, via batch/research/evidence-bank.md]

If the report has adjectives where the counts should be, the agency is prompting.

---

## 9. What should I ask an agency that says "AI marketing"?

Ask to see three files before you see a portfolio: the brand file they'd write for you, the token file their tools read, and the gate that fails a render. Then ask where your logo goes. If it goes into a prompt, leave. If they can't name a price per piece, leave slower. Everything below is a question I'd want asked of us.

1. **Where does my logo go?** The right answer: nowhere near a model. It's composited from a canonical file and verified by hash. [source: batch/PRODUCTION-BATCH.md §1; video/README.md] If the answer includes "we upload it", the output will be approximately yours.

2. **Show me a brand file.** Not a PDF of guidelines. A page with counts: words never used, how sentences open, contractions or not, the facts that can be stated, the claims that can't. If it's adjectives, they haven't done it. [source: vault/Dillon Voice Profile.md; batch/SPOT-SCRIPT.md §F]

3. **Show me the tokens, and tell me what's allowed to vary.** Ours: 68 properties, 61 fixed, 7 per-client. [source: audit/AUDIT.md §2.1] An agency that can't answer this has taste, not a system. Taste is fine until the second designer.

4. **What did your gate fail last month?** "Nothing" is the wrong answer. Ours failed 37 of 120 pairs on shipped work and four more in the new system before it shipped. [source: audit/AUDIT.md §1, §3] A gate that catches nothing isn't running.

5. **Have you measured your own website?** Ours: body text at 3.25:1, five font families, twenty radii. [source: audit/AUDIT.md §2.4] An agency that hasn't measured itself will find your failures interesting and its own invisible.

6. **What's the price per piece, and what's the cap?** Ours on 2026-09-07: $0.039 a still, $0.96 an 8-second clip, a $25 cap enforced before each job starts. [source: batch/budget.json] "It's included in the retainer" means they don't know.

7. **What happens when the model stops mid-day?** It will. Ours stopped at twelve renders. [source: batch/PRODUCTION-BATCH.md §0] The answer should be a free route, stills with a push, a local rig, a queue, not "we'll try again tomorrow" with your deadline. [source: batch/DELIVERY.md]

8. **Who reviews, with what?** A mechanical scan for colour, hash and contrast; a model review with timecodes for timing, legibility and defects; a person for the brand and the stop. [source: video/README.md; batch/review/30s_v3_director_review.md] If it's "our creative director looks at it", ask what the creative director can't see. The answer is 1.01:1. [source: audit/AUDIT.md §2.2(a)]

9. **What's excluded?** In writing. Ours: no shoot, no custom animation, no paid placement, no unlimited video, no new website, and no claim that creative quantity is business lift. [source: plan/PLAN.md, "Three offers"]

10. **What will you not say for me?** Ask for the list. Ours, for the launch spot: no numbers, no client names, no guarantees, no prices, no founder names, no hype words, and no named-lead match-back until it's true on every account. [source: batch/SPOT-SCRIPT.md §F] An agency that has never refused to make a claim hasn't been asked to make a false one yet, or has and didn't refuse.

If you asked me those ten, you'd get this chapter, plus the gaps: no delivered month to show, no lift evidence, two audit files that need reconciling, and a mascot waiting on two signatures. That's the honest state on 2026-09-07. I'd rather you had it than a portfolio.

---

## Frequently asked questions

**What does "your logo never touches a model" mean in practice?**
The image or video model never sees your logo, in a prompt, an upload or a reference. It makes the scene. Your logo is a file, the same bytes every time, placed on top in an editor and checked by hash. Same for every word on screen. [source: batch/PRODUCTION-BATCH.md §1; video/README.md]

**Do I still need a designer if I use AI?**
You need whoever writes the token file and runs the gate. On the day, the model made 28 stills and 12 clips; a person wrote the references into a spec, composited the brand, applied the review and said stop. [source: batch/DELIVERY.md] The generating was the fast part.

**What is WCAG AA, and why 4.5:1?**
A published accessibility standard. For normal-size text it requires a contrast ratio of at least 4.5:1 between the text and its background; for large text, 3:1. It's a number you can compute from two hex codes, which is why it makes a good gate. Our audit measured against it. [source: audit/AUDIT.md §2.2]

**How much does an AI marketing video cost?**
On 2026-09-07, on Google's models: $0.039 per still, $0.96 per 8-second 1080p Fast clip, $0.04 for a 30.6-second music bed, and the whole day's key spend was about $13.79 under a $25 cap. Assembly was local and cost nothing in credits. [source: batch/PRODUCTION-BATCH.md §0; batch/DELIVERY.md; batch/budget.json] Prices change; check the date.

**Can AI write my brand voice?**
It can count it. You supply the corpus, a few hundred things you actually wrote to customers, and the model tallies words never used, openers, contractions, dashes. Ours came from 479 messages. [source: vault/Dillon Voice Profile.md] The judgement about which register drives client copy is yours.

**Is a brand file the same as a brand guidelines PDF?**
No. A PDF is read by people. A token file is read by the tools, so a colour that isn't in it can't ship. On a client build, roughly 110 hand-typed hex values were reduced to zero and a test keeps it there. [source: batch/research/evidence-bank.md §A.14]

**What do I do about faces and people?**
Composite them from photos you have permission to use, or leave them out. Never generate a face. On our launch visual, portraits wait on written acceptance from the people they'd show. [source: batch/PRODUCTION-BATCH.md §1, Prompt 5]

**Does this work in Canva or another all-in-one tool?**
I don't know. We didn't test them. Apply the four tests in chapter 7: honours a hex code, gives you a plate, shows a unit price, has a free fallback. If a tool passes, the method works in it.

**How will I know the creative is working?**
Separately, and not from the creative count. Platform activity is reported apart from inquiries, appointments and revenue in every report we send, and I have no evidence yet that an AI-produced campaign moved any of those for a client. [source: batch/research/evidence-bank.md §E.1; reports/reports-data.mjs, line 3] Anyone who tells you otherwise should show you the named people.

**Why "built, not prompted" as a title?**
Because it's a statement about how the work is made, which we control, not about what it'll produce, which we can't guarantee. It was picked for the spot for the same reason. [source: batch/SPOT-SCRIPT.md §C, §F] It's a working title.

---

## What to do Monday

A checklist. None of it needs a model.

1. Collect 200 to 500 messages you actually wrote to customers. Count the words you never use. Write them down as the banned list.
2. Write ten facts about the business you can prove, each with where the proof lives. Write the claims you can't make and why. One page. Date it.
3. Find your logo's original file. Put it in one folder. Record its hash. That folder is the only place a logo ever comes from.
4. Write the token file: every brand colour as hex with a job next to it, three fonts at most, a spacing scale, four radii. Note which values may change per campaign and which may not.
5. Measure every text-on-background pair in the token file. Fix or reassign anything under 4.5:1 for body text or 3:1 for large text. If a colour has to be both text and a button, make it two tokens.
6. Measure your current website the same way. Write down the number for your body text. Ours was 3.25:1. [source: audit/AUDIT.md §2.4]
7. Check the ruler: confirm your contrast tool says 21.00:1 for white on black and 4.54:1 for `#767676` on white before you trust it. [source: audit/AUDIT.md §1]
8. Pick the three references your brand actually looks like. Write down their materials, camera, palette and cut rhythm. Prompts come from this, not from adjectives.
9. Set a spend cap in dollars, and a unit price per still and per clip, before generating anything. Decide the free route for each piece first.
10. Write the negative list that goes on every prompt: text, letters, logos, faces, hands, and the colours that aren't yours.
11. Decide who says stop. Name the person. Name what they check that the scripts can't.
12. Write the "will not say" list for the next piece before you write the piece.

If you'd rather someone else did steps 5 to 7 on your site before you start, that's the free 15-minute snapshot: three evidenced observations and a suggested next step, nothing else. [source: plan/PLAN.md, "Three offers"] That's the only ask in this book.

---

## About Momentum AI

Momentum AI is the AI division of Momentum Digital, a Philadelphia marketing agency founded in 2015, at needmomentum.com. [source: batch/SPOT-SCRIPT.md, "Facts in play"; plan/PLAN.md] The division is organised in four lanes: AEO/GEO, AI Design, AI Marketing and AI Automation. [source: batch/SPOT-SCRIPT.md, header; plan/PLAN.md, "What already exists"]

The division's plan, dated 2026-09-04, proposes three scoped offers, each with a written acceptance contract and a six-hour monthly delivery budget: a Lead Operations Pilot ($3,500 setup, $1,500 monthly), an AI Visibility Program ($1,500 setup, $1,500 monthly), and the Campaign Production System described in chapter 8 ($750 setup, $1,250 monthly). All prices are proposed and none had been approved or sent at the time of writing. The visibility program "cannot guarantee rankings, citations, qualified leads or revenue." Named-lead match-back is not sold until it works on every account. [source: plan/PLAN.md, header; "Three offers"; "Match-back"]

The free 15-minute qualification snapshot, three evidenced observations and a suggested next step, is the entry point. [source: plan/PLAN.md, "Three offers"]

Momentum Digital's press release of 2026-08-21 states a third consecutive Inc. 5000 listing. [source: PRWeb release, as fetched in batch/research/aeo-geo-topic-research.md §2] No client described in this book has given permission to be named, so none is.

This book is No. 3 of five in the Momentum AI Field Notes. Its evidence is the production record of 2026-09-07 and the design-system audit of 2026-09-05, cited by path throughout. Written under Dillon Mohr's name.
