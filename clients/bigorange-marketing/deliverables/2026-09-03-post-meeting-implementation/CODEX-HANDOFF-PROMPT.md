# Continuation prompt for Codex

Copy everything below the line. This assumes the work already in
`clients/bigorange-marketing/deliverables/2026-09-03-post-meeting-implementation/`
is yours and current — it is not a restart.

---

Continue the BigOrange Sept 3 post-meeting implementation. Canonical repo:
`C:\Users\dillo\Documents\Codex\projects\client-operations`.
Read `STATUS.md` and `WORDPRESS-DRAFT-AUTHORITY-CROSSWALK.md` first — they are your own
current state and they supersede any earlier plan.

## Hard boundaries

1. **Nothing is published.** Margee's instruction on the call: Paula reviews, Paula
   publishes. Everything stays `status: draft`.
2. **No email or Slack is sent.** Drafts only, unsent.
3. **Public page 1381 (`/marketing-agency-for-builders/`) stays untouched.**
4. Do not invent client facts, quotes, metrics or FAQ content.
5. Do not write to any WordPress draft until Dillon authorizes a precisely mapped write
   batch (your own gate 10).

## Facts established from the meeting recording

Transcript: `evidence/meeting-transcript.raw.txt`, 52:44, locally transcribed and
timestamped. It is faster-whisper output and lossy — verify wording before quoting it
to the client.

- **There is no Squarespace work.** The word appears once, `[00:35:03]`, where Dillon
  describes his own build tooling. Margee's instruction, `[00:39:08]`: reverse-engineer
  into WordPress. You already corrected this; do not let it creep back.
- **"Deconstruct the code" = make the blogs natively editable**, from Paula's objection
  at `[00:20:00]` — the drafts are one raw HTML block.
- **The de-ranking pushback came from Emelia, not Paula** (`[00:40:41]`; Whisper renders
  her as "Emily"). Paula raised editability. Do not conflate them in any draft — an
  email addressing the wrong person on the wrong objection is worse than no email.
- **The pillar is 5546.** Margee asked for "the one with like a home interior"; 5546's
  hero is a finished interior, 5585's is bare stud framing. 5546 is 39,136 chars against
  5585's 199,751, on a site already carrying a ~36s mobile LCP on the builder page.
- **Site runs Beaver Builder** (62 posts), not Elementor.
- **The admin account has no 2FA and it becomes mandatory September 30, 2026.** Flag this
  to Dillon; access breaks otherwise.

## Commitments Dillon made on the call, still owed

From `[00:40:25]`, Margee: "send me the invoice, send me the block hours it will take to
reverse engineer, and then let me get back to you through email."

1. Invoice — he said he had reached the 35 approved hours.
2. Hours to date.
3. The block-hours estimate. **Conflict on record:** he then said "it's free, don't pay
   me" (`[00:39:51]`) and Margee still asked for the number. Whatever is decided must be
   in writing, not left verbal.
4. The site-defect list — you have this as `CLIENT-SITE-DEFECT-LIST.md` + PDF.
5. Draft page IDs so Paula can review.
6. A self-promised correction note for anything misstated in the presentation.
7. The research for Emelia — `AI-CONTENT-RANKING-RESEARCH.md` + PDF.

## The live decision that blocks everything downstream

Your crosswalk found the real problem: the seven existing article Drafts do not cleanly
cover the contracted 1 → 3 → 9 map. One clear overlap, two possible thematic overlaps,
six mapped files with no existing slot, four existing Drafts with no placement.

**Path A (contracted nine-file map) vs Path B (seven existing Drafts)** is a client
decision, not an implementation detail. Path B is 9–14 remaining hours but **does not
fulfil the contracted map** — say that plainly to Dillon rather than letting the smaller
number look like the finished job. Do not begin either path until BigOrange chooses.

## Next actions, in order

1. Put the Path A / Path B choice in front of Dillon with the scope consequences, and
   get his hours + bill-or-waive decision. Those are the two `[CONFIRM]` markers in the
   email draft.
2. Once both are answered, create the follow-up as an **unsent Gmail draft** on thread
   `19fa4cb8f6812394` — to margee@, cc paula@, emelia@, janice@ — with the attachment
   manifest you built.
3. Hold the write batch until Dillon authorizes the exact mapped set.

## Still blocked on BigOrange

- Artwork for the eight flagged authority candidates.
- ART-01 needs an editorial FAQ set or ships without FAQ schema.
- **Janice's material is permission-gated** — only the Homearama paraphrase at
  `call-recording-2 02:03-02:10` is cleared; the rest is permission-`?`. This is the
  highest-value missing input, because firsthand builder experience is the
  experience-and-expertise signal Google's people-first guidance actually describes.
- The tentative `$8M–$12M` fit threshold must not reach public copy until Margee
  confirms it is real policy.

## Judgement to carry

Publishing a set of closely related pages at once, thin, is a recognisable shape for the
scaled content abuse policy — not because AI wrote them, but because they would be
near-interchangeable and shipped to rank. Stage the releases and get Janice's approved
expertise in first. Frame the reply to Emelia as agreeing with her caution and
correcting only the mechanism; do not frame it as winning an argument.
