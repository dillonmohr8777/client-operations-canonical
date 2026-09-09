---
title: "Missed-call text-back: the first text, the next three, and what to log"
slug: missed-call-text-back-first-text-what-to-log
target_query: "missed call text back"
intent: informational
feeds_ebook: "B - From Missed Call to Booked Job"
meta_description: "The exact first text, the next three, when a human takes over, and the log fields that let you trace a booked job back to the ad that produced it."
publish_week: 3
sources:
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\research\aeo-geo-topic-research.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\research\evidence-bank.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\PLAN.md
---

# Missed-call text-back: the first text, the next three, and what to log

By Dillon Mohr, Momentum Digital, Philadelphia

Missed-call text-back is an automatic text sent to a caller you didn't answer, within seconds, that says who you are, that you saw the call, and how to get what they need. It's the cheapest fix for a leaking phone line. The first text matters. What you log after it matters more.

Below is the script we use, the three texts after it, the rule for when a person takes over, and the log fields that make the whole thing worth something later.

## What is missed-call text-back and why does it work?

"Missed call text back" gets about 390 searches per month in the US. The first result is a setup screen from a software help center. The rest are vendors. Nobody on page one tells you what the text should say.

It works because of timing. The caller is still holding the phone. They just heard your voicemail, or nothing. A text that arrives within seconds catches them before they dial the next name on the list.

The reason you need it is your answer rate. On our own agency's tracked line in July 2026, through the 27th, 263 calls came in and 162 of them were missed. We have text-back live on that line now, with after-hours routing from 10 PM to 6 AM. I'd rather show you our number than quote someone else's.

## What should the first text say?

Here's the one we run, with the blanks filled for a trade:

> Hi, this is [Business Name]. Sorry we missed your call. Are you calling about [top service]? Reply here and a person will get back to you during business hours today. Reply STOP to opt out.

Five rules in that text:

1. **Name yourself.** They may have called four companies.
2. **Say you saw it.** "Sorry we missed your call" does more work than any offer.
3. **Ask one question.** Not a menu. One.
4. **Give an honest window.** "During business hours today" if that's true. Not "right away" if nobody's on it.
5. **Include the opt-out.** The STOP line is the minimum. Talk to your phone provider about consent rules where you operate. This isn't legal advice.

Keep it short enough to read on a lock screen. No link. No "AI". No promise you can't keep at 9 PM on a Sunday.

## What are the next three texts?

Four touches total. Then stop.

**Text 2, ten minutes later, only if there's no reply.** One clarifying question. "Is this for a repair or a new install, and what's the best time to reach you?"

**Text 3, next business morning, from a person.** The machine drafts it. A human reads it, fixes one line, and sends it under their own name. "Hi, this is [Name] at [Business]. I saw you called yesterday about [service]. I've got [time] open today if that works."

**Text 4, two days later, the close with an out.** "Last one from me. If you still need [service], reply and I'll set it up. If not, no worries at all."

Then the sequence ends. Anything past four is noise, and noise trains people to ignore you.

## When does a human take over?

The first reply from the caller ends the automation. Full stop. A person picks up the thread from there.

Beyond that, some things go straight to a human no matter what: a price question, an emergency, a complaint, anything medical or legal. The automation's job is to hold the caller for a few minutes, not to have the conversation.

And be honest about hours. If nobody is staffed overnight, the text says business hours. Don't promise 24/7 unless you pay for 24/7.

## What should I log?

This is the part that pays off months later. Every missed call gets a row with these fields:

| Field | Why it matters |
|---|---|
| Caller number | The key for everything else |
| Call timestamp | Speed is measured from here |
| Line or tracking number it came in on | This is your source. Without it you can never say which ad produced the job |
| Text 1 sent timestamp | Proves the automation fired |
| First reply timestamp | Time to first response, the number that matters |
| Human owner | Somebody's name. Not "the office" |
| Disposition | Booked, quoted, not a fit, spam, no reply |
| Job booked (Y/N) and value | The only row that pays the bills |

Two reasons to be strict about this.

First, dedup. For a Pittsburgh painting company we reviewed every automation run over four weeks in the summer of 2026: 22 runs, and only 4 were real inquiries. The other 18 were solicitations, tests and duplicate replies. Without a disposition field, that business would have reported 22 leads. It had four.

Second, the owner field. On our own line, every call was linked to a contact record. 100%. And the owner field was filled in on 0% of them. Every call had a person's name attached and nobody's name responsible for it. That's the field people skip, and it's the one that decides whether the callback happens.

Fill the log in and you've built the bridge to the question every owner eventually asks: which leads did my ads actually produce? Skip it and that question can never be answered.

## FAQ

**Is missed-call text-back legal?**
Rules on texting vary by state, and you need consent handling and a working STOP option at minimum. Ask your phone provider or a lawyer. This post isn't legal advice.

**What if the caller is a spam robot?**
Log it as spam and let the sequence end on no reply. Four texts to a robot cost cents. One missed real customer costs a job.

**Do I need an AI for this?**
No. Texts 1 and 2 are fixed automations. If an AI is involved at all, it drafts texts 3 and 4 for a person to send.

## The next step

If you want someone to look at how calls reach you and where they leak, I'll do a 15-minute snapshot: three observations with the evidence for each, and one suggested next step. Free. No deck, no pitch. Reach me through needmomentum.com.
