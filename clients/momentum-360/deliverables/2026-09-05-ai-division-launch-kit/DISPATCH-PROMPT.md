# Dispatch: Momentum AI founder films

## What to set on the session (the form fields, not the prompt)

| Field | Value |
|---|---|
| Working directory / repo | `C:\Users\dillo\Documents\Codex\projects\client-operations` — the canonical client repo; the kit lives at `clients\momentum-360\deliverables\2026-09-05-ai-division-launch-kit` inside it. **Not** a session lock folder like `pro-fence-deck-claude-handoff-repo`. |
| Additional directories | `C:\Users\dillo\repos\dillon-os` (the vault, workflows, agents), `C:\Users\dillo\repos`, `C:\Users\dillo\Documents\Codex` |
| Permission mode | Full / bypass permissions (no per-tool prompts) |
| Connectors to include | **claude.ai Higgsfield** (already connected at account level), claude.ai Google Drive, claude.ai Slack, claude.ai Gmail |
| Also keep | the local MCPs: marketing-chief-files, agent-memory, dillon-creative-factory, Composio |
| Do not narrow with | `--strict-mcp-config`, `--tools`, an empty MCP file, or plan mode |

If the session starts and `ToolSearch("claude_ai")` returns nothing, the connectors did not load: restart or resume the session. Do not re-authorise anything; the account connector is already connected.

---

## The prompt (paste as the first message)

You are the orchestrator for the Momentum AI division launch. Dillon Mohr has granted this session full tool permissions and the claude.ai connectors, including Higgsfield, with roughly 600 to 800 Higgsfield credits available. Work autonomously; do not ask for approval on steps already authorised below.

Working folder: `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-ai-division-launch-kit`

Read, in this order, before generating anything:
1. `README.md` — what exists and what was measured
2. `video/FOUNDER-INTROS.md` — the job: three founder films (M01 Mac, S01 Sean, MS01 both), prompts, identity lock, wardrobe (suits, as in the founder film), credit math, gates
3. `video/founders/references/PROVENANCE.json` — the reference set with SHA-256 hashes: two canonical portraits, the editorial pair, and `need-momentum-founders-film.mp4` (confirmed motion reference)
4. `video/HIGGSFIELD-PROMPT-PACK.md` and `video/shots.json` — the five lane films and eight stills, run only after the founder films
5. `../2026-09-05-momentum-design-system/tokens/momentum.tokens.css` — the palette every prompt speaks: deep `#0e1a22`, brand `#1e73be`, accent `#f58320`; never cyan, yellow, purple or neon

First actions:
- Discover the Higgsfield tools with `ToolSearch("claude_ai")` and `ToolSearch("higgsfield")`. Use the `claude.ai Higgsfield` connector tools, not the duplicate `higgsfield` registration that needs authentication. If no Higgsfield tools are present, stop and report that the session did not load the account connectors; do not try to authenticate anything.
- Read the account's current credit balance and current per-job costs before the first paid job. The costs in the files are August receipts, not a price list.
- Verify each reference file's SHA-256 matches `PROVENANCE.json` before uploading it as a reference.

Then run `video/FOUNDER-INTROS.md`, in order: M01 keyframe → review at full size (is it him? stop if not) → M01 identity master with Seedance 2.5 `omni_reference` (portrait for identity, the founder film for motion) → review the 0s / 5s / 10s / 15s contact sheet for identity, hands, face clear at the end → accept or reroll once → 4K upscale only an accepted master → S01 the same way → MS01 only if the remaining balance allows one full attempt.

Rules that are not negotiable:
- No model ever draws, redraws, lights or animates the Momentum mark or any text. Plates only. The mark and the cards are composited locally with `video/composite.ps1` and `video/title-cards.html` (`?card=N&still=1&v=1`). Position, opacity and scale only.
- Every on-screen price carries "Proposed · not agreed". The builders assert this.
- Record every job in `video/ledger.json` before the piece is called done: id, piece, step, model, credits, prompt sha256, output sha256, accepted or rejected, running balance.
- Report the running credit total after every render. Stop at 600 credits on this pack regardless of completion. Do not spend into the balance reserved for the 3D world without asking.
- Mac and Sean's likenesses are Momentum's own founders in Momentum's own collateral; they were used the same way on 2026-08-31. Both founders see their own film before it goes anywhere.
- Nothing is sent, posted, published or deployed. Deliver finished MP4s, QA frames and the receipt into `video/out/` and, if Google Drive is available, a private Drive folder named `Momentum AI - founder films - 2026-09-05` with the links reported back. No Slack messages, no emails.
- The twenty-site prospect batch, the website backend and the 3D world belong to other sessions. Do not touch them.

When done, or when blocked, write `video/RUN-REPORT.md`: what was generated, job IDs, credits spent and remaining, what was accepted, what was rejected and why, QA frame paths, and exactly what Dillon needs to decide next.
