# September 2026 commission sheet, update 2026-09-15

Updates the 2026-09-02 packet. Local evidence only. Nothing was written to the
live Google Sheet, nothing sent, nothing posted.

Live tab this mirrors: `September Commissions` on
[Dillon Mohr - Momentum 360 Commission Sheet](https://docs.google.com/spreadsheets/d/1upQYyOhaMjgR__8XAYJ0NAoA_pEO6C1Lgb3jt_X2e9s/edit#gid=85502086)

## What changed

| Change | Amount | Evidence |
| --- | ---: | --- |
| **AI Director monthly stipend, NEW** | **+$500** | Mac, Slack group DM with Sean, 2026-09-15 12:57 EDT |
| **GT Clinic upgraded from provisional to SIGNED** | $450, unchanged | Contract signature panel, signed 2026-09-09 |
| Nexla status hardened from "provisional" to active | $500, unchanged | GA4 access + GTM v61 published, verified 2026-09-15 |
| Two new pipeline rows, **no dollar value** | $0 | Both intros dated 2026-09-15, neither closed |

**September expected pay: $7,900.** That is $7,400 in client commissions,
unchanged, plus the $500 AI Director stipend, which is new.

## The stipend is not a client stipend

Worth stating plainly because it was described that way. Mac's exact words in
the Slack DM:

> "as new AI Director I want to start giving you a monthly extra stipend pay for
> this role as like a manager and growth lead AI expert for Momentum brands and
> client ideas etc etc. I want to flush out this role and get you extra
> compensation for it. I'm going to add $500 for September but want this role and
> number to grow over time. Sound good?"

Dillon accepted in the same thread. So this is **recurring role compensation for
the AI Director title**, not a per-client payment, and it is explicitly intended
to grow. It is on its own line rather than mixed into client commissions so the
commission math stays clean and so next month's increase is easy to track.

## GT Clinic is now signed

The 2026-09-02 packet carried GT Clinic at $450 as "expected/provisional,
unsigned." It is signed:

- Ghazala Farooqui signed 2026-09-09; Jesse signed 2026-09-03
- Accepted 17hats quote `brgoeLawllWB`, quote 7776543
- $900/month Google Local Marketing Package, six-month initial term
- Kickoff call held 2026-09-15
- The optional $600 one-time AI website redesign is **excluded** from the
  commission basis, matching how the quote itself separates it

$450 is unchanged, 50 percent of $900. Only the status hardened.

## No new closed client was added

Two AI introductions happened 2026-09-15. Neither is a client yet, so neither
carries a dollar figure. Putting a number on either one would be a guess.

**Tom Scanlon**, trading community. Mac's "Meet my AI Team" email, 20:10 UTC,
introducing Dillon and Jesse. Mac's framing: "We can definitely use AI to help
build you a website and digital presence. From there we can probably create a new
strategy using AI to build up your paid community for trading." No scope, no
pricing, no signature. Mac closed with "I'll let them follow up to schedule
something."

**Walker Group NYC**, Wayne Brown. Jesse's "Marketing Introduction," 19:35 UTC,
saying he "was able to match pricing we discussed." Wayne replied at 22:55 UTC:
"Thank you but I have no idea what you propose. Can you send a sample of what
this looks like." That is a request for a proposal, not an agreement.

## Open question for Dillon

Which of those two is the "new AI client," and what is the actual agreed number?
Once there is a signed scope or a stated rate, it becomes a real line with a
commission basis. Until then both stay at TBD.

---

# Bridge verification addendum, 2026-09-15 17:00 EDT

Dillon asked to add Phases 4 and 5 as will-be-paid and said Phase 5 was
basically done, and explicitly asked to be double checked. Fable 5.1 checked it
against the live repos, Netlify deploys, open PRs, Slack and Gmail.

## Correction: the phases are not $1,500 each

The prior packet assumed six equal $7,500 milestones. The contract milestones
are unequal, and the payment history proves it: Phase 1 paid $1,000 on a $5,000
milestone, Phase 2 paid $1,300 on a $6,500 milestone. Both are exactly 20
percent. Phase 3 being $1,500 is a coincidence of a $7,500 milestone.

| Phase | Contract name | Client fee | Dillon 20% |
| --- | --- | ---: | ---: |
| 1 | Discovery, Requirements, Architecture | $5,000 | $1,000 paid July |
| 2 | UX, Product Flow, Data Model | $6,500 | $1,300 paid August |
| 3 | Accounts, Authentication, Verification | $7,500 | $1,500 |
| 4 | Directory MVP | $13,500 | **$2,700** |
| 5 | Early Engagement Layer | $4,500 | **$900** |
| 6 | Admin, Security, QA, Launch | $8,000 | $1,600 |

Phases 4 and 5 together are **$3,600**, not the $3,000 previously recorded.
Phase 4 alone is worth three times Phase 5.

## Good news the prior packet had backwards

Phase 3's note said it was excluded until Tori paid. **Tori already paid.** Mac
in `#bridge-software-development` 2026-09-03: "She has already paid for first 3
milestones." Melissa 2026-09-09: "she paid for 2 phases to give herself some
time and we slammed through it."

So the $1,500 is no longer waiting on the client. It is waiting on Mac paying
Dillon's share, and there is no message anywhere confirming that payout
happened. That is a direct ask Dillon can make.

## Phase 5 is not basically done

What is live on production: the screens. Posting modes, follow, repost, boost
preview, merged via PR #17 and deployed 2026-09-13.

What is not true: any of it working. Production's own recovery doc states the
backend router "does not mount the proposed posts, favorites or notifications
services." Persistence exists only in backend PR #1, which is open and
unreviewed, and frontend PR #20, which is a draft whose own body says it stays
draft until the backend is merged, migrated and proven on staging. Production is
not even bound to the API: the dev bundle contains the Render backend URL, the
production bundle does not.

Dillon's own email to Tori on 2026-09-05 says it plainly: "The interactive
features here use sample data and local demo behavior. Connecting them to real
accounts, records, publishing, and payments is still a separate development
step."

Phase 5 also cannot close before Phase 4, because verified-profile posts depend
on the directory profiles that PR #1 creates.

## What actually gates the $3,600

1. Backend PR #1 merged and migrated
2. Frontend PR #20 released out of draft
3. Production bound to the real API instead of preview mode
4. Written acceptance from Tori, which has never been given for any milestone
5. Mac invoicing M4 and M5, and Tori paying

## A gap worth closing this week

The Milestones 1-3 report that asks Tori for route-by-route sign-off was never
sent to her. It exists at `deliverables/2026-09-03-milestones-1-3-report/` and
the only send went to Dillon's own inbox. What Tori actually received on
2026-09-05 was the companion site and redesign demo links. Her next commitment
is feedback "by Wednesday at the latest," 2026-09-16, and that feedback is on
the redesign demo, not the production review URL.

Getting one written acceptance on the record is the cheapest thing available
and it is what every future milestone invoice will lean on.

## Sheet treatment

Phases 4, 5 and 6 are on the sheet with their real values and real gates, in a
clearly separated stretch block below the expected total. They are not folded
into September expected income, because on this engagement payment has tracked
Tori's sign-off and Mac's invoice, and neither exists for M4 or M5.

- September expected pay: **$7,900**
- If Phases 4 and 5 both close: **$11,500**
