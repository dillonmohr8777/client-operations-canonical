# Slack reply draft - #360marketing, to Jason Fallon + Sean

**Status: DRAFT. Not sent. Approval-gated.**
Thread: Jason asked how easy course-to-audiobook is with AI voice over, and what
it costs. Global Leader Solutions, Dr. Andrew Campbell, 20+ courses,
10-30 pages each. Sean already replied "very easy".

---

## Primary draft (send this)

> @Jason Fallon Sean's right that it's easy, but the narration isn't the part
> that costs anything. The AI voice for his entire 20-course catalogue runs
> about $70 on the premium engine. Basically free.
>
> The real work is that course text is written for a screen. Every "see the
> diagram below" and "fill in the blank" has to get caught and rewritten before
> it gets read aloud to someone in their car. That's the job, and it's about
> 3 hours per course.
>
> I built the pipeline for this today and ran a sample module through it end to
> end - chaptered audiobook file, mastered to spec, QA'd. Happy to play it for
> you both.
>
> Ballpark for him: **$10-14.5k for all 20**, depending on whether we clone
> Dr. Campbell's actual voice or use a stock premium one. For a personal-brand
> leadership catalogue I'd clone his. Same 20 titles with human narrators is
> $50k+.
>
> Better opening move: **$1,500 for one course as a pilot**, credited back
> against the full project. He hears his own voice reading his own material
> before committing to 20.
>
> One thing to flag before anyone promises Audible: ACX won't accept
> AI-narrated files produced outside their system. Not a problem for what he
> probably wants - his course platform, a private member podcast feed, or
> direct sale off his site all take it fine, and honestly that's where course
> audio makes money anyway. Just don't want it promised in a proposal.
>
> What I need from him: exact course count, and whether the 10-30 pages are
> workbook pages or video transcripts. Price barely moves on page count, but
> course count drives it.

## If Jason asks for the cost breakdown

> Engine cost for the whole catalogue, ~708k characters / ~13 hours of audio:
> ElevenLabs $71, OpenAI $11, Google $0 on their free tier. That's the entire
> AI bill.
>
> Our side is prep, proof-listening and QA at roughly 3.25 hrs/course, plus
> about 12 hrs of one-time setup for the voice, the pronunciation lexicon and
> the credits template. That's what the $10-14.5k covers.

## If he asks "can we just do it cheaper"

> We can - $500/course on a stock voice instead of $725 on his cloned one. What
> I wouldn't cut is the proof pass. I run every book twice: once on a free
> offline voice to catch bad chapter breaks and mispronounced names, then once
> on the paid engine after the script is signed off. Skipping that is how you
> pay twice for 20 books.

---

## Notes for Dillon before sending

- Sean already said "very easy" and got a check-mark react. This reply agrees
  with him and then adds the part he skipped, rather than correcting him.
- The $70 number is the hook. It reframes the conversation off "what does AI
  cost" and onto "what does production cost", which is where our margin is.
- Do not promise Audible. See `docs/distribution.md`.
- Pricing verified 2026-08-19, expires 2026-11-19. Re-verify before a contract.
- Numbers reproduce with:
  `node integrations/audiobook-factory/bin/afx.js quote --courses 20 --pages 10-30`
