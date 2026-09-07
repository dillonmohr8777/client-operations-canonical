# Which Claude model to use for the next few days

This is a routing note for Claude Code, not a Design run. Recheck live rates before a long session. Figures below are public list prices as of early September 2026, per million tokens.

## Use this

| Job | Model | Why |
|---|---|---|
| **Default for the flush** | **Claude Sonnet 5** | Best intelligence per dollar for long HTML, interactive ebooks, and Design-style loops. List is $3 in / $15 out after the Sep 1, 2026 intro expired. Full 1M context, no long-context surcharge. |
| **One hard pass** | **Claude Opus 5** | Highest Claude intelligence on the current tables (~61 index). Same $5 in as older Opus, $25 out. Use it once: Book 01 cover-to-CTA, or the Snapshot studio. Then go back to Sonnet and copy the system. |
| **Mechanical only** | **Claude Haiku 4.5** | $1 / $5. Extract a checklist, rename files, turn a chapter into a caption sheet. Do not let it design. |

If Claude Code shows **Sonnet 4.6** and not Sonnet 5, use 4.6 as the daily driver. Same price band, a step down in intelligence. Still the right default over Opus for a multi-day rebuild.

## Do not use

| Model | Why not, this week |
|---|---|
| **Claude Fable 5** | About $10 / $50. Near-Opus intelligence at 2x Opus price. Waste for ebook iteration. |
| **Opus on every turn** | Output is the expensive side. A Design session is output-heavy. Opus all day will burn the budget and not make the books better after the first good pass. |
| **Max effort / extended thinking by default** | Time-to-first-token on max-effort Claude can run to minutes. Use it only when Sonnet is actually stuck on structure or claims. |

## Token efficiency that actually matters

1. **Claude 4.7+ tokenizers count more tokens than OpenAI for the same text** (about 30% in one August 2026 bake-off). Attaching the whole Sep 4/5 kit every turn is how you lose. Attach `CLAUDE-CODE-HANDOFF.md` plus one seed file.
2. **Prompt cache the handoff.** Same system lock, same facts, every turn. That is the real discount, not a cheaper model.
3. **One artifact per turn.** Book 01, then Book 02, then the diagnostic. Do not ask for five ebooks in one prompt.
4. **Seeds are wireframes.** Point Claude Code at the HTML. Do not paste the HTML into the prompt.

## This machine's OmniRoute note

OmniRoute 3.8.48 is up. Its "best combo" for planning just now is `glm-5.3-flash-remote`. That is a cheap local route, not a Claude Code Design model. Ignore it for this flush. Claude Code should stay on Sonnet 5, with one Opus 5 pass.

Sources for the price and intelligence band: Artificial Analysis / Convly 2026 index tables; Anthropic list prices (Sonnet 5 intro ended 2026-09-01); Spheron and Beri 2026 rate-card writeups. Recheck in the Claude Code model picker before you start.
