# Global Leader Solutions - course-to-audiobook line

**Date:** 2026-08-19
**Client:** Momentum 360 (Jason Fallon) -> prospect: Global Leader Solutions, Dr. Andrew Campbell
**Ask:** "Turn all of his online courses into audio books. How easy would this be with AI voice over, and any idea of a cost? He has over 20 total."
**Status:** Built and verified. Quote drafted. Nothing sent - Slack reply is approval-gated.

---

## The answer in three lines

1. **Easy, yes - but the narration was never the hard part.** Course text is
   written for a screen. The work is finding every "see the diagram below" and
   "fill in the blank" before it gets narrated to someone driving.
2. **The AI cost is a rounding error: $71 for the entire 20-course catalogue**
   on the premium engine, $0 on Google's free tier. Anyone quoting off "the AI
   cost" is mispricing this by two orders of magnitude.
3. **Quote the catalogue at $10,000-14,500**, or a $1,500 pilot credited back.
   The same 20 titles produced with human narrators run $50,000-200,000.

## What was built

A working production line, committed at
`integrations/audiobook-factory/` in this repo. Not a plan - it runs.

```
node bin/afx.js quote --courses 20 --pages 10-30    # the numbers below
node bin/afx.js build jobs/demo-gls-chapter.json --provider local
```

It ingests `.docx`, `.pdf`, `.md`, `.html` and - importantly for GLS - `.vtt`/`.srt`
video captions, since a video course's real content usually lives in the
transcripts. It chapterizes, rewrites the text for the ear, flags what a human
must fix, synthesizes, masters to a delivery spec, packages a chaptered `.m4b`
plus a private-podcast feed, and grades every file pass/fail on measured audio.

**Verified sample:** a 5-minute module built end to end, 7 chapters, all QA
checks passing against both the podcast spec and the stricter ACX spec
(RMS -20.5 dB, peak -3.3 dB, noise floor -67 dB). 33 unit tests pass.

The sample uses the free offline proof voice, not a delivery voice - ElevenLabs
and the neural model hosts are blocked by our egress policy in that environment.
Same command with a key re-renders it in a cloned voice.

## Sizing

Jason said 10-30 pages each. At 300 words/page:

| | pages | words | characters | finished audio |
|---|---|---|---|---|
| low | 200 | 60,000 | 354,000 | 6.7 h |
| **mid** | **400** | **120,000** | **708,000** | **13.3 h** |
| high | 600 | 180,000 | 1,062,000 | 20.0 h |

About 40 minutes of audio per course at the midpoint.

## What the engines actually cost (verified 2026-08-19)

For the whole 708,000-character catalogue:

| engine | model | per 1M chars | catalogue cost |
|---|---|---|---|
| Google Cloud | Chirp 3 HD | $30 | **$0.00** (1M chars/month free) |
| Azure | Neural HD | $22 | $4.58 |
| OpenAI | gpt-4o-mini-tts | $15 | $10.62 |
| ElevenLabs | Multilingual v2 | $100 | **$70.80** |

ElevenLabs is 7x the price of OpenAI and still costs less than one hour of
anyone's time. Use it. It is the only one that clones Dr. Campbell's own voice,
and for a personal-brand leadership catalogue that is the whole product.

## Price to the client

Computed from labour, not guessed. Full model in
`integrations/audiobook-factory/config/rates.json` at a $65/h loaded internal rate.

| tier | engine | our cost | **price** | per course | margin |
|---|---|---|---|---|---|
| Essential | Google Chirp 3 HD, stock voice | $4,004 | **$10,000** | $500 | 60% |
| **Signature** | ElevenLabs, cloned voice | $5,076 | **$14,500** | $725 | 65% |
| Catalogue + Distribution | + distribution, quarterly refresh | $6,327 | **$18,100** | $905 | 65% |

**Pilot: $1,500** for one course - voice clone, lexicon, credits template, full
production. Credited in full against the catalogue if they proceed. Lead with this.

Two things worth knowing about the shape of this deal:

- **Price is almost flat against page count.** Low to high sizing moves the
  Signature price $14,400 -> $14,600, because API spend is negligible and the
  labour is per-course. Jason does not need to pin down page counts to quote.
  He needs the course count.
- **The cost is proof-listening and prep**, ~3.25 h per course. That is what
  scales, and it is why "just run it through AI" quotes come in wrong.

For comparison, the same catalogue narrated by humans: $2,667-5,333 for
narration alone, $50,000-200,000 for full production across 20 titles.

## The constraint that shapes the deal

**ACX will not accept an AI-narrated file produced outside their system.** Their
submission requirements call for human narration unless separately authorised
and list unauthorised text-to-speech and AI recordings as prohibited.

This is not fatal, and for this client it is probably irrelevant - a course
catalogue's best home is not Audible retail. Full analysis in
`integrations/audiobook-factory/docs/distribution.md`. Short version:

- **Their own course platform / LMS**: no gatekeeper, fastest, lifts completion.
- **Private member podcast feed**: students listen where they already listen.
  The pipeline generates the RSS.
- **Direct sale from their site**: highest margin for them.
- **Aggregators** (Spotify/Findaway, Author's Republic, Kobo): accept AI
  narration, generally with disclosure. The realistic retail path.
- **Audible retail specifically**: needs a human narrator, or Amazon's own
  KDP Virtual Voice off an existing Kindle ebook.

Do not promise Audible in a proposal. Sell the platform and feed, and treat
retail as a separate phase.

## Open questions for Jason before a real quote goes out

1. **How many courses exactly, and what format are the sources in?** 20 was
   "over 20 total". Course count drives price; page count barely does.
2. **Are the 10-30 pages workbook pages or video transcripts?** If the real
   content is video, the transcripts are longer than the workbooks and the
   audio hours go up - though the price barely moves.
3. **Does Dr. Campbell want his own voice cloned?** This is the Essential ->
   Signature decision, and it needs his written consent naming permitted uses.
4. **Where does the audio go?** Platform, member feed, or retail. This changes
   the build profile and whether phase two exists.
5. **Who owns the voice model when the engagement ends?** Settle in writing.

## Next actions

- [ ] Dillon: approve or edit the Slack reply in `slack-reply-draft.md`
- [ ] Send to Jason and Sean in #360marketing
- [ ] On a yes: get one real course's files, run the pilot, book the sign-off call
- [ ] Before any contract: re-verify pricing (`config/pricing.json` expires 2026-11-19)
