# Fable 5.1 / Higgsfield / lane sweep — 2026-09-02

Delta only. No reconnect. No `claude mcp add`. No HeyGen+Higgsfield+Remotion combo. No earth-zoom. Higgsfield still expired. Do not mix Lane A films with Lane B Momentum scroll. Immohrtal / frontend stays Codex-owned (Lane C).

Ponytail posture: one note, reused the prior A/B fetch, fetched C/D/E via fxtwitter + official docs. Did not dump the dirty `dillon-os` tree.

## Workspace integration (this Windows box)

| Surface | Status |
|---|---|
| HeyGen HyperFrames | Connected in the workspace MCP from the prior session. Zero projects. Compose/render disabled for CLI agents. Author via the local `hyperframes` skill / May fork. Not a Higgsfield substitute. |
| Higgsfield MCP | **Not installed.** Zero hits in `C:\Users\dillo\repos` `*.{md,json,toml}`. Not in `dillon-os/.mcp.json` (Landingfolio only). Not in any of the ~35 GitHub repos. Account still expired. No OAuth, no GitHub login. Wait for a paying client + you saying reconnect. |
| Higgsfield skill | Official how-to is [techsy.io Higgsfield MCP for Claude Code](https://techsy.io/en/blog/higgsfield-mcp-claude-code) (hosted `https://mcp.higgsfield.ai/mcp`, five tools, OAuth, 150 free credits/mo as of May 2026). Wrapper: [robonuggets/higgsfield-skill](https://github.com/robonuggets/higgsfield-skill). Neither is in your trees. |
| Remotion / earth-zoom | Absent. |
| Claude Code model pin | `C:\Users\dillo\.claude\settings.json` is still `"model": "fable[1m]"` (Fable 5, not 5.1). Plugins: `ponytail@ponytail`, `obsidian@obsidian-skills`. |
| `claude-skills-repo` PR #9 | July iOS prototype. Still Fable 5. Not a 5.1 routing change. Leave it. |
| Prospect radar | 1,298 tracked / 239 rebuild-qualified as of the prior brief. Your ~1,200 guess was low. |
| Immohrtal | Local clones exist: `immohrtal-website`, `immohrtal-kimi-redesign`. Lane C, Codex owns. Do not mix with Momentum video. |

Install command (documented only; **do not run** until you say reconnect):

```
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

First tool call opens browser OAuth. Tokens expire in weeks (`unauthorized` → `/mcp` → Re-authenticate). Auto-approve only `list_characters` and `get_generation_status`. Never auto-approve `generate_video` (30–60 credits per call).

## Official Fable 5.1 facts

Source: [overview](https://platform.claude.com/docs/en/models/fable-5-1/overview) and [prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1). Released 2026-09-01.

- ID: `claude-fable-5-1`. 1M context, 128K max out. Input $10 / output $50 per MTok. **Cache read $0.25 / MTok** (quarter of Fable 5). Default effort is `high`. Adaptive thinking always on.
- Anthropic's own advice: start most work on **Opus 5**; use Fable 5.1 for long-horizon agentic work or when Opus 5 at higher effort still falls short.
- `medium` on 5.1 roughly matches Fable 5 quality cheaper. `low` can beat smaller models on cost-per-task. `xhigh`/`max` can 8× tokens vs `low`. Pin effort; do not default to Extra High.
- Breaking vs Fable 5: forced tool use errors; earlier models cannot read its thinking blocks; editing earlier turns invalidates thinking. Keep history append-only.
- Harness rules that matter here: pin subagent models; batch independent tool calls; finish the whole task; do not spawn four Fable researchers; targeted edits not whole-file rewrites; CLAUDE.md must actually bind (see chadbartels).
- Claude Code **2.1.257** makes 5.1 the default, adds containment-escape confirmations, and lets you force models on subagents. Box is still pinned to `fable[1m]` until you change it on this machine.

## Lane A — films / AI video ads (Fable directs; HeyGen or Remotion execute)

Never ship these as Momentum scroll sites.

| Link | What it is | Keep? |
|---|---|---|
| [MaxfusionAI 2094871419754574010](https://x.com/MaxfusionAI/status/2094871419754574010) | Origami paper test: Fable 5.1 vs Sol 5.6 writing per-shot prompts. LLM-as-director. | Yes — shot-list director pattern. |
| [NVIDIAGeForce 2094772262545363122](https://x.com/NVIDIAGeForce/status/2094772262545363122) | DLSS 5 / 3D-guided neural rendering. Games, not ads. | No. |
| [hikarun_agi 2094734512718823462](https://x.com/hikarun_agi/status/2094734512718823462) | Paste a reference video; Higgsfield MCP analyzes cuts and generates matching shots in-chat. | Experiment **after** OAuth. One real-estate or luxury-ad prospect, not a factory. |
| [igor_fedorko 2094868307098689580](https://x.com/igor_fedorko/status/2094868307098689580) | Whole luxury-watch ad via Claude→Higgsfield MCP; never opened the UI. Mentions ChatGPT ads. | Same stack. New channel to watch, not to sell yet. |
| [KDicksonDigital 2094818263171547574](https://x.com/KDicksonDigital/status/2094818263171547574) | "Edit the brief. It renders the visuals." | Same brief-to-creative loop. |
| hukamdesign 2094937381313139022 | 404 on fxtwitter/vxtwitter. | Unreachable. |
| [trypitchdotco 2094929516405903588](https://x.com/trypitchdotco/status/2094929516405903588) | Fable 5.1 "one-shots" motion — likely HTML/CSS/JS, not a film render. | Hero motion / explainer, not Higgsfield. |
| nateherk 2090862671885185504 | X Article body not exposed. | Unreachable. Split: ads stay A, site stays C. Never mix Momentum. |

## Lane B — Momentum scroll / property heroes

Keep this pipeline: Claude Code → hero images/video → Hostinger/domain. Do not fold film ads into it.

| Link | What it is | Keep? |
|---|---|---|
| [vamsibatchuk 2094841911001469304](https://x.com/vamsibatchuk/status/2094841911001469304) | Gemini agentic video understanding; cheaper long-footage scrub. | Clip mining from webinars, not scroll sites. |
| [AbdifatahCiilka 2094884873538306260](https://x.com/abdifatahciilka/status/2094884873538306260) | Fable 5.1 house design → cinematic walkthrough "through code." | Direct fit for listing walkthroughs / property reels. |
| [sandy4kad 2094864147133644829](https://x.com/sandy4kad/status/2094864147133644829) | 7-day 7-agent loops; −25% tokens; cache reads $0.25. | Cost pattern for site-factory batches. One job at a time. |
| [dravenip 2093307619561689538](https://x.com/dravenip/status/2093307619561689538) | "$10K websites" via Claude Code + Higgsfield hero video → Hostinger. | Exact Momentum recipe, now public. |
| [JiEnoch 2093667474994548750](https://x.com/JiEnoch/status/2093667474994548750) | One Pinterest image → scroll site. | Fast prospect mockups. |
| [prompt_soru 2094569594383917251](https://x.com/prompt_soru/status/2094569594383917251) | Sponsored. 480p structure check, then 1080p Seedance. | **Staged render.** Use this the first time Higgsfield has credits. |
| [TikTok ZP8cFtmFq](https://www.tiktok.com/t/ZP8cFtmFq/) | Soup: laptop LLM fine-tune. | Mis-filed. Ignore for sites/ads. |

## Lane C — Immohrtal + frontend (Codex only)

| Link | What it is | Keep? |
|---|---|---|
| [JustinGorya 2094873820624793813](https://x.com/JustinGorya/status/2094873820624793813) | DevinCLI + Fable 5.1 **medium** + 2 custom skills → one-prompt site. | Skills + medium effort. Matches Immohrtal. |
| [AdamHoltererer 2094869708298133973](https://x.com/AdamHoltererer/status/2094869708298133973) | Side-by-side: without skills vs with skills. | Skills are the delta. Do not buy more models; ship skills. |
| [daradoescode 2094903466128748684](https://x.com/daradoescode/status/2094903466128748684) | Frontend animation consistency; demo on whichai.dev. | Signal, not a new stack. |
| [ramonpiano_ 2094903445396291616](https://x.com/ramonpiano_/status/2094903445396291616) | 3.5h full redesign. Cheap + good. | Same. |
| [loktar00 2094893993012146650](https://x.com/loktar00/status/2094893993012146650) | "Not a giant leap vs open models." | **Not a sell.** |
| [KairollaAdil 2094903040897884160](https://x.com/KairollaAdil/status/2094903040897884160) | Calls 5.1 a frontend **regression**. Writeup: adilkairolla.dev. | **Not a sell.** Keep Opus 5 as fallback for pixel work. |
| [moderncreator Jack Roberts](https://moderncreator.app/2026-07-17-jack-roberts-fable-5-skill-machine-ship-10-000-looking-websites-from-one-prompt) | Fable 5 (not 5.1) skill machine for $10k-looking sites. | Already your factory thesis. Don't rebuild it. |
| Repos | [immohrtal-website](https://github.com/dillonmohr8777/immohrtal-website), [immohrtal-kimi-redesign](https://github.com/dillonmohr8777/immohrtal-kimi-redesign) | Codex lane. Local clones present. |

## Lane D — slot / cache / quota

| Link | What it is | Keep? |
|---|---|---|
| [Bell_QuoLu 2094938484796723231](https://x.com/Bell_QuoLu/status/2094938484796723231) | Claude Code 2.1.257: 5.1 default, $10/$50/$0.25 cache, force subagent models, tighter auto-mode. | Review auto-approve + external-read after you upgrade. |
| [spacepope 2094912228159836300](https://x.com/spacepope/status/2094912228159836300) | 86.9M cache-read tokens, $115.65, 24% of a 20x Fable quota. | **Quota warning.** Your usage is already off. One job at a time. Medium default. |
| [chadbartels 2094943774413595085](https://x.com/chadbartels/status/2094943774413595085) | 5.1 ignored CLAUDE.md (orchestrator-only) and spawned 4 Fable subagents. | Pin specialists in settings. Do not let 5.1 research-fork. |
| [kazuph 2094940509714485693](https://x.com/kazuph/status/2094940509714485693) | Model missing from picker after update; `/model claude-fable-5-1` works. | How to switch on this box when you choose to. |
| [AI_masaou 2094918267190280505](https://x.com/AI_masaou/status/2094918267190280505) | Hours after launch: 9 parallel 5h windows burned. Thesis: 5.1 is easier, not just stronger. Cache reads 75% cheaper. Effort splitting is mandatory. Cyber work auto-routes to Opus 4.8, bio to Opus 5. Official rec: Opus 5 first, Fable 5.1 when needed. | Matches Anthropic docs. Do not parallel-burn sessions. |

## Lane E — frontend / MCP how-to (do not install)

| Link | What it is | Keep? |
|---|---|---|
| [JustinGorya 2094884554532061489](https://x.com/JustinGorya/status/2094884554532061489) | One-shot websites, basic prompting, high creative output. | Frontend signal. Codex lane. |
| [ivanjurashere 2094897746977439824](https://x.com/ivanjurashere/status/2094897746977439824) | Medical-aesthetics frontend + custom motion prompting. Follows instructions; uses browser automation to fix first-pass; cleaner copy (fewer em dashes). | Prompt + browser QA pattern. |
| [aimlapi 2094879208304685524](https://x.com/aimlapi/status/2094879208304685524) | Fable 5.1 $5.69 vs GPT-5.6 Sol $0.88 on five Three.js scenes. Fable = realism + same one-shot bugs; Sol = cheap consistent low-poly. | Use Sol for cheap 3D drafts; Fable only when realism pays. |
| [techsy Higgsfield MCP](https://techsy.io/en/blog/higgsfield-mcp-claude-code) | 60-second OAuth setup, MCSLA prompt recipe, Soul character IDs, 480p-class iteration via Nano Banana then paid video. Five gotchas: expired OAuth, pending server, user vs project scope, model-name typos (`veo-3.1` not `veo-3`), async video stall. | Wire when you say reconnect **and** a client is paying credits. |
| [robonuggets/higgsfield-skill](https://github.com/robonuggets/higgsfield-skill) | Skill wrapper around the same hosted MCP. | Optional later. Not in your repos. |

## Routing decision (do this; do not re-send the link dump)

1. **Do not install Higgsfield** until you say reconnect and a client budget covers credits. Account is expired.
2. **Do not change the Claude model pin from this cloud session.** When you want 5.1 on the box: `/model claude-fable-5-1` or Claude Code ≥2.1.257. Default effort **medium**. One job at a time.
3. **Pin specialists.** If 5.1 is the lead, force Sonnet/Opus on research subagents. CLAUDE.md "orchestrator only" is not enough (chadbartels).
4. **Lane split is law.** A = Fable shot-lists → HeyGen HyperFrames or Remotion. B = Momentum scroll + property walkthroughs; Higgsfield hero video only after OAuth, 480p then 1080p. C = Immohrtal / frontend = Codex + skills. Never mix A into B.
5. **Skills > model swap.** AdamHoltererer / Jack Roberts / your skills repo already have the delta. Don't open a 5.1 rewrite of PR #9.
6. **First Higgsfield experiment** (after grant): one Momentum real-estate prospect, paste a competitor listing video (hikarun pattern), 480p structure, then one 1080p Seedance hero. Not a factory run.
7. **Money this month is still Puttery**, then the Windows-box auth batch (Bitwarden, Revive OAuth, Align, Higgsfield login when you choose), then Jack Lesser / With Not For. This note does not reopen those queues.

## What this session did not do

- Did not run `claude mcp add`.
- Did not mutate `queue/work-items.json` or `CONTROL.md`.
- Did not create `with-not-for-site` (prior session 403).
- Did not send Slack or Gmail.
- Did not commit the dirty `dillon-os` working tree.
