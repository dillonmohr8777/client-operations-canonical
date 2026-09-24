# BigOrange Sept 3 review — what was actually asked for

Source: local transcription of the Fireflies recording, "Paula Rae / Margee / Dillon —
Pilot Project Review Next Phase", 2026-09-03 09:00 ET, 52:44.
Transcript: `evidence/meeting-transcript.raw.txt` (faster-whisper small.en — lossy;
verify exact wording before quoting to the client).
Attendees: Margee Moore, Paula, Emelia Pitlick, Dillon. Janice not on the call.

## Two corrections to the working assumptions

**1. There is no Squarespace work.** BigOrange is WordPress on WP Engine.
The word "Squarespace" appears once, at `[00:35:03]`, where Dillon is describing the
three ways his own tooling can build a page — the third being "deconstructing of the
code itself, which I've seen only on Squarespace." That is a description of a build
technique, not a CMS. Margee's closing instruction at `[00:39:08]` is explicit:

> "if you could get those pages reverse engineered into WordPress and then I'd like to
> have Paula look them over and have Paula push them live"

Building anything in Squarespace would be wrong work.

**2. "Deconstruct the code" means make the blogs natively editable in WordPress.**
Paula's objection at `[00:20:00]` is the actual driver:

> "when he says they're in WordPress, what they are is one HTML block where all this
> code is ... it's not editable unless you can edit code"

Dillon agreed and committed to fixing it (`[00:20:44]`). The reversible local answer
is Gutenberg blocks: headings, paragraphs, lists and tables become editable in the
standard WordPress editor while the approved design shell can remain an HTML island.
That is not the same as a Beaver Builder-native rebuild, which requires a separate
manual scope.

## The structural gap — this is the real finding

Margee described the required structure twice, and says it is already written in the
paid pilot document (`[00:16:19]`, quoting Paula reading it):

> "one pillar, three sub pillars, and nine blogs that fan up to those sub pillars"

Same pattern as their existing StoryBrand pillar and MSP marketing pillar. And the
pillar must be the **existing** `/marketing-agency-for-builders/` page upgraded in
place, not a new landing page (`[00:16:57]`).

| Required | Current local evidence | Release state |
| --- | --- | --- |
| 1 pillar (existing URL upgraded) | Public commercial owner is page 1381; concept drafts 5546 and 5585 exist | Written confirmation of the 5546 finished-interior direction is still required |
| 3 sub-pillars | Three Gutenberg proposal assets now exist under `proposed-subpillars/` | Titles and final URLs require Margee's approval; do not import or publish |
| 9 blogs fanning to the sub-pillars | Nine existing authority-package drafts are mapped three per proposed sub-pillar | Mapping is proposed; each page still needs editorial, permission, artwork and site QA gates |

Dillon did not have an answer on sub-pillars during the call (`[00:19:00]`, "Sorry, I
wasn't ready to talk only about the pillars") and proposed a follow-up call early the
following Monday. The local proposal now makes the decision concrete without treating
the themes or provisional slugs as approved.

## Commitments Dillon made on the call

Owed to Margee by email, in her words at `[00:40:25]`: "send me the invoice, send me
the block hours it will take to reverse engineer, and then let me get back to you
through email."

1. **Send the invoice.** He stated he has reached the 35 approved hours (`[00:40:13]`).
2. **Report hours to date.** Margee: "make sure you update me in your hours so far too."
3. **Send a block-hours estimate** to reverse-engineer the pages into WordPress.
   ⚠ Conflict on record: Dillon then said "it's free, don't pay me ... it's all free"
   (`[00:39:51]`). Margee still asked for the estimate. Do not leave this verbal —
   state the hours and state explicitly whether they are waived, in writing.
4. **Send the site-defect list** — the broken items, as a separate PDF. Margee:
   "send us that list of things that are broken on our website and we'll get those
   fixed as well."
5. **Send exact page numbers / URLs** for the private WordPress drafts so Paula can
   review them (`[00:21:03]`).
6. **Send a correction follow-up** for anything misstated in the presentation — he
   committed to this himself at `[00:12:09]`.
7. **Send Emelia the ranking research.** She challenged the claim that adding Gemini
   output helps ranking (`[00:41:32]`):

   > "everything we've been researching to date basically says if the search engines
   > think you used AI to build your pages, it will de-rank you"

   He answered "I will find and I will send you my research." ⚠ He had already
   described the underlying claim as "mainly just a rumor" from Twitter
   (`[00:41:22]`). If supporting evidence does not exist, retract the claim rather
   than send weak sourcing — Emelia owns SEO here and will check it.

## Site findings Dillon presented (already in the Sept 1 package)

The September 1, 2026 public crawl recorded 370 published URLs, 21 published pages
missing from the page sitemap, 15 published pages carrying `nofollow`, four H1s plus
`index, nofollow` on the AI service page, and missing alt text on 8 of 50 homepage
images. The builder-page mobile LCP observation is dated August 20, 2026 and was
approximately 36 seconds. Emelia's Moz snapshot is dated August 14, 2026 and is not
live ranking evidence. The separate `CLIENT-SITE-DEFECT-LIST.md` states the proof
required to close each dated finding.

## Build order

1. Confirm concept draft 5546 as the finished-interior direction. Public page 1381
   remains the commercial owner unless BigOrange approves a specific replacement.
2. Approve or revise the three proposed sub-pillar titles and final URLs. Their local
   Gutenberg assets remain held from WordPress until that decision.
3. Resolve the crosswalk. **Current relationship: partial overlap plus
   supplementation, not a validated replacement set.** AUTO-01 with 5623 is the sole
   exact overlap. WEB-01 with 5550 and PPC-01 with 5621 are possible thematic
   overlaps. Six mapped authority files lack a clear existing Draft counterpart, and
   5552, 5619 **11 Home Builder Marketing Ideas**, 5625 **How to Choose Home Builder
   Marketing Solutions**, and 5627 **When Should a Custom Home Builder Hire a
   Marketing Agency** lack a clear mapped-nine placement.
4. BigOrange chooses **Path A: contracted nine-file map**, or **Path B:
   seven-existing-Draft batch**. Path A implements the nine mapped files into approved
   existing or new private Draft slots. Path A is not yet estimable until that slot
   map is approved. Path B implements 5550, 5552, 5619, 5621 **Home Builder Advertising**,
   5623 **Home Builder Marketing Automation**, 5625 and 5627 plus the three approved
   subpillars; the 9-to-14-hour estimate applies to Path B only. **Path B does not
   fulfill the contracted nine-file map.**
5. Define the exact private-draft write batch and backup/rollback plan.
6. Paula reviews the implemented drafts and Paula publishes. Nothing goes live from
   this side.

## Boundaries

Nothing published. Janice's factual and permission review is still open — most of her
interview material remains permission-`?`. The $8M–$12M fit threshold stays out of
public copy until Margee confirms policy.
