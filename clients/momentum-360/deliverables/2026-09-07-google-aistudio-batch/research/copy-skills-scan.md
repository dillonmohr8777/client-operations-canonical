# Copy-skills scan: GitHub agent skills for brand-launch ad copy and :30 spot scripts

Scan date: 2026-09-07. Read-only research; nothing installed or cloned.
Method: GitHub code search (`filename:SKILL.md` + terms) and repo search via the GitHub MCP, cross-checked with web search. Every SKILL.md below was fetched and read in full; star counts and `updated_at` come from the GitHub API on the scan date. "Updated" is repo-level last activity, not necessarily last commit to that skill file.

## Searches run

GitHub code search (all `filename:SKILL.md`): `"copywriting"` (34,688 hits), `"advertising" "script"`, `"brand launch"` (282), `"tagline"`, `"video script" ad`, `"30-second" OR ":30" "spot" commercial`, `"brand film" OR "anthem" OR "manifesto" commercial script`, `"end card" tagline "seconds"` (184), `repo:anthropics/skills marketing OR copywriting OR advertising` (0 hits).
GitHub repo search: `copywriting skill SKILL.md claude`, plus batched `repo:` lookups for star/date metadata.
Web search: `github "SKILL.md" copywriting skill claude advertising 2026`; `"awesome claude skills" marketing copywriting`; `github claude skill "TV commercial" OR "video ad script" SKILL.md`.

Negative result worth recording: `anthropics/skills` (175k stars) has no marketing, copywriting, or advertising skill. Its `skills/` directory is: academy-guide, algorithmic-art, brand-guidelines (Anthropic's own identity), canvas-design, claude-api, discernment-nudge, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx.

## Candidates (12), ranked by usefulness for a :30 brand-launch spot

### 1. iart-ai/ad-video-skills — launch-video
- URL: https://github.com/iart-ai/ad-video-skills
- SKILL.md: `skills/launch-video/SKILL.md`; the load-bearing file is `skills/launch-video/references/launch-structure.md`
- Updated 2026-09-06 | 8 stars | created 2026-06-22
- Method: the only skill found that is explicitly a *launch film* format at :30. Encodes hook (0-3s) -> tease (3-9s) -> reveal on the music drop (9-13s) -> feature montage (13-25s, one benefit per shot, 0.6-1.0s each, cut on transients) -> end card (25-30s, hold >=2s). Two hard rules: sound design leads picture (lock the track, mark the drop, cut to it), and cut anything not premium. Includes a full shot-by-shot timecode template with visual/motion/audio/cut per beat, re-proportioning to 15s and 60s ("the hook never gets longer, only the montage scales"), and multi-aspect safe zones (design hero/logo/CTA inside the 1:1 center square).
- :30 usability: Direct. This is the closest thing to a brand-launch spot spec. Adds beat timing, reveal mechanics, and end-card discipline. Weak on words (it is a motion skill, not a copy skill).
- Red flags: 8 stars, single vendor (iart.ai) with UTM footer; Remotion/GSAP-oriented. No license file checked in this scan.

### 2. JohnsonYe/immer-films — commercial-direction
- URL: https://github.com/JohnsonYe/immer-films
- SKILL.md: `.claude/skills/commercial-direction/SKILL.md` (duplicate at `.agents/skills/commercial-direction/SKILL.md`)
- Updated 2026-07-26 | 0 stars | created 2026-03-06
- Method: a genre-and-format catalog for commercials. Duration taxonomy table (6s/10s/15s/20s/30s/45s/60s/90s/2min+) with VO word counts, scene counts, and average shot length per duration; a 3-act :30 beat template (hook 0-5, empathy 5-10, solution 10-15, proof 15-20, emotional peak 20-25, CTA + brand lock 25-30); 40+ commercial styles including Manifesto/Anthem (flagged "brand launches"); a brand-reveal-timing table; pacing conventions by cuts-per-minute; emotional arc table per ad type; platform specs.
- :30 usability: Direct as a format reference. Adds the VO word budget (65-75 words at :30), 5-10 scenes, 2-3s average shot length, and the anthem/manifesto category.
- Red flags: 0 stars, personal project, no license visible, no updates since July. Treat as a reference doc, not a maintained package.

### 3. 0xzgbot/forge-nps-v01 — 30_second_tv_spot (Cinesmith)
- URL: https://github.com/0xzgbot/forge-nps-v01
- SKILL.md: `hermes_home/skills/30_second_tv_spot/SKILL.md`
- Updated 2026-08-30 | 6 stars | MIT (frontmatter) | created 2026-04-24
- Method: the one skill named for the :30 TV unit. Problem (0-8) -> solution/tension (8-20) -> payoff/CTA (20-30); brand-reveal timing rule (early 0-5s for known brands, mid 12-18s for story spots, late 20-25s for suspense; end card 3-5s mandatory; product visible >=5s total); attention data (dwell <14s, drop-off after 15s, emotion needed in first 5s); cut rate 8-15 cuts per :30; six archetypes with second-by-second beats (Problem-Solution, Emotional Payoff, Comedy Punchline, Product Hero, Before/After, Testimonial); a :30 beat chart with visual-density column; negative-prompt list ("15-second pacing stretched to 30", "brand reveal too early without context", "talking head only").
- :30 usability: Direct. Best single source for reveal timing and cut density. Written for AI video generation prompts, so copy guidance is thin.
- Red flags: Hermes-agent format (not Claude-native), auto-generated description field ("DESCRIPTION."), citation footnotes reference sources not included. Part of a large local-AI pipeline repo, not a standalone skill.

### 4. zubair-trabzada/ai-ads-claude — ads-video + ads-hooks
- URL: https://github.com/zubair-trabzada/ai-ads-claude
- SKILL.md: `skills/ads-video/SKILL.md`, `skills/ads-hooks/SKILL.md`
- Updated 2026-09-07 | 244 stars | created 2026-04-06
- Method: ads-video produces 9 scripts (3 frameworks x 15/30/60s): Hook-Demo-CTA, Problem-Solution-Proof, UGC testimonial. Each length has hard constraints; for :30: 65-80 VO words, 4-6 text cards, hook in first 3s (before the 5s skip), a 7-row timing table (0-3 hook, 3-7, 7-12, 12-18, 18-24, 24-28 CTA, 28-30 end card), B-roll list, storyboard, director's notes. ads-hooks encodes 5 psychological hook angles and a 7-test hook quality gate (3-second test, specificity test, curiosity-gap test, say-it-out-loud test).
- :30 usability: Directly usable as a script template. Performance/DTC bias (every script ends with an offer CTA), so it needs the brand-launch overlay from #1-3.
- Red flags: none serious. Active, 15-skill suite, license not verified in this scan.

### 5. indranilbanerjee/digital-marketing-pro — video-script
- URL: https://github.com/indranilbanerjee/digital-marketing-pro
- SKILL.md: `skills/video-script/SKILL.md` (companion `skills/ad-creative/SKILL.md`)
- Updated 2026-09-07 | 796 stars | created 2026-02-11
- Method: distinguishes organic vs ad "physics". Per-format ad rules in step 2.4: 6s bumper = one message, brand visible by second 2; 15s skippable = hook and core message both land before the 5s skip; 30s spot = "room for one arc (PAS or before/after), still front-loaded, pay off early and again late"; UGC-style must still carry ad disclosure. Requires 3 hook variants (different technique each), timestamped script with visual and audio columns, CTA placement map, retention sag points, thumbnail text 1-3 words (7 max), and a claims/brand-voice gate before delivery.
- :30 usability: Direct. Adds the "one arc, pay off twice" rule and the gating discipline. Heavily wired to its own brand-profile file system.
- Red flags: large plugin with hard dependencies on `~/.claude-marketing/` state; the skill is thin on its own without the surrounding system.

### 6. boraoztunc/skills — ogilvy
- URL: https://github.com/boraoztunc/skills
- SKILL.md: `ogilvy/SKILL.md`
- Updated 2026-09-06 | 290 stars | MIT | created 2026-03-30
- Method: Ogilvy's hierarchy: positioning first (what it does, for whom; psychological over demographic), then one promise, then brand image, then the big idea. A dedicated TV/video section: exciting opening, problem-solution with proof, on-camera voice beats voiceover, music backgrounds reduce recall, build a mnemonic burr, "logorrhea kills, let the visual carry the story". Explicit rule: "New products deserve loud launches... the moment of newness is the single easiest moment to generate interest." Ten diagnostic questions.
- :30 usability: Indirect but strongest on brand-launch strategy. The "inject news / don't bury the launch" rule and "one promise, go the whole hog" are the copy spine for a new-division spot.
- Red flags: none. Well-sourced, compact.

### 7. wondelai/skills — made-to-stick
- URL: https://github.com/wondelai/skills
- SKILL.md: `made-to-stick/SKILL.md`
- Updated 2026-09-07 | 2,120 stars | MIT | v1.4.0
- Method: Heath brothers' SUCCESs (Simple, Unexpected, Concrete, Credible, Emotional, Stories) as a 1-10 scored diagnostic. Commander's Intent ("if people remember ONE thing"), curse-of-knowledge, "if you say three things you say nothing", human-scale statistics, identity framing ("what would someone like me do"). Triggers on "tagline".
- :30 usability: Indirect. Use as a scoring pass on the script and tagline candidates; the Unexpected and Concrete traits are where launch spots usually fail.
- Red flags: Amazon affiliate links in the file. Otherwise solid.

### 8. arnabbagxd/Brand-building-skills — brand-launch + brand-messaging
- URL: https://github.com/arnabbagxd/Brand-building-skills
- SKILL.md: `skills/brand-launch/SKILL.md`, `skills/brand-messaging/SKILL.md`
- Updated 2026-09-07 | 615 stars | created 2026-06-11
- Method: brand-launch is a rollout plan (internal first, asset checklist, launch-day sequence table, 30-day post-launch, rebrand continuity messaging). Its one copy-relevant construct is the "launch narrative: the single most important thing the launch should communicate (not a tagline, the strategic story)". brand-messaging builds the hierarchy: core message ("[Brand] helps [audience] [outcome] by [how]"), 4-5 tagline options at 3-7 words each tagged functional/emotional/aspirational/witty, key messages at 5-8 words with a proof point each, and a "things not to say" list.
- :30 usability: Upstream. It gives the messaging inputs a spot needs (one launch narrative, tagline at 3-7 words, proof points) but does not write the spot.
- Red flags: brand-launch is a project-management doc; content-plan row lists "brand story video / reel, 60-sec" but gives no script guidance.

### 9. robpalmer99/claude-code-copywriting-skills — ad-copy
- URL: https://github.com/robpalmer99/claude-code-copywriting-skills
- SKILL.md: `ad-copy/SKILL.md`
- Updated 2026-09-07 | 28 stars | CC-BY-4.0 | created 2026-05-06
- Method: Schwartz awareness levels drive length and angle; "sell the click vs sell the solution"; WHY/WHAT/HOW; 8 hook types; UGC 15-60s beat structure (hook 0-3, problem 3-10, mechanism 10-25, result 25-40, CTA 40-60); "So What?" chain three levels deep; banned-word list (AI tells and ad cliches); Flesch-Kincaid grade 6; final 8-question check.
- :30 usability: Partial. Direct-response social ad craft; the "So What?" chain and banned-word list transfer, the UGC structures do not fit a brand spot.
- Red flags: heavy supplement/weight-loss example register; not brand-launch oriented.

### 10. SupercmoHQ/superCMO-skills — writing-video-scripts + writing-ad-copy
- URL: https://github.com/SupercmoHQ/superCMO-skills
- SKILL.md: `skills/writing-video-scripts/SKILL.md`, `skills/writing-ad-copy/SKILL.md`
- Updated 2026-09-07 | 34 stars | Apache-2.0 | created 2026-07-24
- Method: writing-video-scripts is a pure VO-budget skill: 2-3 words per second target, 3 wps hard ceiling ("a 15-second clip fails at 46 words"), hook must fit 3 seconds = 6-10 words, write the whole monologue then split per clip at breath points, no dashes/brackets/stage directions in spoken lines, make each point once. writing-ad-copy: vary the angle not the words, proof claims need backing or get cut.
- :30 usability: Direct for the VO layer. The word-per-second math and "sounds spoken not read" rules are the most concrete VO guidance found.
- Red flags: young repo, 7 open issues, part of a product ecosystem.

### 11. igoroliveirg/claude-copy — ad
- URL: https://github.com/igoroliveirg/claude-copy
- SKILL.md: `skills/ad/SKILL.md`
- Updated 2026-08-04 | 5 stars | created 2026-03-11
- Method: Hormozi three-part ad machine (hook/meat/CTA), Value Equation, 5 ad types (includes Story Ad with "brand manifesto" listed), 10 frameworks, "write 50 hooks", CTA must answer what/how/when/what-I-get/what-next, "button/final line max 8 words".
- :30 usability: Partial. The CTA construction and "name your audience explicitly" rule transfer; the rest is direct-response.
- Red flags: 5 stars, no update in a month, derivative of paid Hormozi material (attribution but licensing of source content unclear).

### 12. eiwru/creative-director-skill — creative-director
- URL: https://github.com/eiwru/creative-director-skill
- SKILL.md: `creative-director/SKILL.md`
- Updated 2026-09-07 | 10 stars | created 2026-03-09
- Method: concepting, not copy. Insight format "[audience] wants X, but Y stands in the way, because Z"; idea levels (Big Idea for a brand launch vs Campaign vs Execution); 6 weighted scoring criteria; Specificity Test ("replace the brand with a competitor, still works? originality <= 5"); "Simplicity as Violence: if it can't be explained in one sentence it's a plan, not an idea".
- :30 usability: Upstream. Use to pressure-test the spot's central idea before scripting.
- Red flags: small, ambitious scoring claims (Cannes calibration) are unverifiable.

### Also seen, not shortlisted
- coreyhaines31/marketingskills `skills/copywriting/SKILL.md` (48k stars, updated 2026-09-07): web-page conversion copy; principles transfer (clarity over cleverness, one idea per section, "Now you can" test) but no video or launch guidance.
- vibe-motion/skills `brand-launch-video-star/SKILL.md` (1,168 stars, updated 2026-09-07): named "brand launch" but is an asset-authenticity and Remotion motion skill. Its `references/story-patterns.md` has a useful "28-30 second premium launch" beat list (restrained brand establishment -> product interaction -> mechanism -> capabilities -> results -> hero claim -> premium logo lockup) and copy limits (1-5 words impact copy, 6-12 words supporting, one message per beat).
- guangjun5952/tvc-ai-director (49 stars, updated 2026-09-07): Chinese-language TVC studio router; the interesting `tvc-*` specialist skills and brief-gate questions exist but the router outputs Chinese by default.
- leosssvip-dot/remotion-ad-video-skill (106 stars): performance ad video; useful beat budgets (hook inside 2s with product visible, CTA holds >=2.5s, no scene >2.5s without a secondary beat) but 15s-default and app-install oriented.
- coleschaffer/copywritingskills-rmbc `skills/fb-ad-copy` (30 stars): RMBC, Meta character limits; not video.
- tech-leads-club/agent-skills paid-creative-ai (5,143 stars): media buying and testing, not copy.
- pexoai/pexo-skills video-ad (776 stars): API relay to a hosted generator, "relay, don't create"; no method.
- glacierphonk/naming (97 stars): naming, with a `taglines.md` reference not fetched.

## Synthesized rules for a :30 brand-launch spot

Only rules that are concrete and attributable. Where two skills agree the numbers are given as the tighter range.

1. **Budget the voiceover at 65-75 words for :30 (hard ceiling 3 words/second, target 2-3).** A :30 written at 90 words will be read too fast or padded; cut words, never speed delivery. (SupercmoHQ writing-video-scripts; JohnsonYe commercial-direction; zubair-trabzada ads-video says 65-80.)
2. **The hook is 6-10 words and must land inside 3 seconds; on YouTube it must land before the 5-second skip.** Write it last, after you know what the body delivers. (SupercmoHQ; zubair-trabzada ads-hooks; digital-marketing-pro video-script; igoroliveirg claude-copy.)
3. **A :30 holds exactly one arc and pays off twice: early and late.** Assume drop-off every second; front-load the point, then re-land it at the end. Six beats for a launch: hook 0-5, empathy/friction 5-10, reveal 10-15, proof 15-20, emotional peak 20-25, CTA + brand lock 25-30. (digital-marketing-pro video-script; JohnsonYe commercial-direction; 0xzgbot 30_second_tv_spot.)
4. **Pick the brand-reveal timing deliberately: mid (12-18s) for a story-led launch, late (20-25s) if the spot is built on suspense, early (0-5s) only if the parent brand is already known.** For a new division of a known brand, the parent mark can appear early and the new-division mark lands mid. (0xzgbot 30_second_tv_spot; iart-ai puts the reveal on the music drop at ~9s.)
5. **Product/brand visible for at least 5 seconds total; the end card is a 3-5 second hold (minimum 2s) of logo + tagline + one CTA, with nothing else moving.** (0xzgbot; iart-ai launch-video; JohnsonYe.)
6. **One benefit per shot, one message per beat; montage shots run 0.6-1.0s each, 8-15 cuts across the :30, average shot 2-3s outside the montage.** Copy on screen: 1-5 words for impact lines, 6-12 for a supporting claim. (iart-ai; vibe-motion story-patterns; 0xzgbot; JohnsonYe.)
7. **Lock the music first and cut to its transients; the reveal snaps on the drop frame, not near it.** Never score a finished cut. (iart-ai launch-video.)
8. **Lead with the news. A launch is the one moment newness is free attention; put the announcement in the hook, not the body.** One promise, executed completely; if the brief has two messages that is two spots. (boraoztunc ogilvy; digital-marketing-pro bumper rule generalised.)
9. **Positioning before copy: answer "what does it do and who is it for" in a psychological, not demographic, frame, and name the audience explicitly in the spot.** A hook that speaks to everyone speaks to no one. (boraoztunc ogilvy; igoroliveirg claude-copy.)
10. **Tagline: 3-7 words, one primary message, sayable aloud; generate 4-5 tagged functional/emotional/aspirational/witty and pick one.** Do not invent a line that could be mistaken for an official slogan without labelling it a concept. (arnabbagxd brand-messaging; vibe-motion story-patterns.)
11. **Every claim carries a number, a name, or a timeframe, and proof claims without backing get cut, not softened.** "Reviewers say" is acceptable attribution; an invented stat is not. (coleschaffer fb-ad-copy; SupercmoHQ writing-ad-copy; zubair-trabzada ads-hooks truth test.)
12. **Run the Specificity Test before scripting: swap in a competitor's name; if the spot still works, the idea is not yours yet.** Then the Simplicity test: the idea in one sentence. (eiwru creative-director; wondelai made-to-stick Commander's Intent.)
13. **Write spoken lines as speech: contractions, fragments, no dashes, no stage directions in the VO text, make each point once.** On-camera voice outperforms voiceover in Ogilvy's data; music beds reduce recall, so keep the bed under the words. (SupercmoHQ; boraoztunc ogilvy.)
14. **Design the hero, logo and CTA inside the 1:1 center square so the 16:9 master reframes to 9:16 and 1:1; keep text out of the top 12% and bottom 18% of vertical.** (iart-ai launch-video.)

## Verification notes

- All 12 shortlisted SKILL.md paths were fetched and read in full via the GitHub API on 2026-09-07; reference files fetched: iart-ai `launch-structure.md`, vibe-motion `story-patterns.md`.
- Star counts and updated dates are from the GitHub repository API at scan time.
- Licenses recorded only where stated in the SKILL.md frontmatter or repo listing (ogilvy MIT, made-to-stick MIT, 30_second_tv_spot MIT, robpalmer CC-BY-4.0, superCMO Apache-2.0). Others unverified.
- GitHub MCP was available and used; web search used for cross-checking only.
