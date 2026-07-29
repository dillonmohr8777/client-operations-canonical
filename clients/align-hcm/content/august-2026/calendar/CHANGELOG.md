# August 2026 content calendar — revision log

## 0042 (from 0041)

Rebalances the month to **three posts a week** by moving one post, not several.

`HR at the Table` moves from Mon Aug 24 to Wed Aug 12. Nothing else changes: all
twelve posts survive, one date changed, and the deck stays in date order.

| Week | 0041 | 0042 |
|---|---|---|
| Aug 3–7 | 3 | 3 |
| Aug 10–14 | 2 | 3 |
| Aug 17–21 | 3 | 3 |
| Aug 24–28 | 4 | 3 |

The cover's cadence line goes back to `three posts per week`, which is now exactly
true for every working week.

### Why that post moved and not another

Two assets on the slate are still unproduced: the Joann video on Aug 20 and Moe's
Four Decisions on Aug 27, whose ASSET row reads `to record`. Moving either earlier
would compress a production runway, so both stayed put. That left three produced
candidates in the four-post week:

| Candidate | Effect if moved to Aug 12 |
|---|---|
| Peco, Aug 25 | two case studies in week two, and Beumer and Peco are both manufacturing stories |
| Different Missions, Aug 28 | lands two days from Public Service Cannot Pause, both public-sector animations |
| **HR at the Table, Aug 24** | week two gets a case study, a podcast, and an animation |

The result keeps **exactly one case study per week** (GTAA, Beumer, Troon, Peco)
and puts no two same-theme posts next to each other.

| Week | Mix |
|---|---|
| Aug 3–7 | brand video, founder blog, case study |
| Aug 10–14 | case study, podcast, animation |
| Aug 17–21 | case study, animation, talking-head video |
| Aug 24–28 | case study, expert video, animation |

Aug 31 stays empty. A single Monday in a fifth week is a weak place to close a
month, and the alternative was leaving a two-post week.

### Verification

Page order is asserted to be chronological, the set of post titles is compared
against 0041 so nothing can be lost or duplicated by the reorder, and the
case-study audit runs on the output. Titles are matched by their 15pt display span
rather than reading order, because on a redated page the redrawn eyebrow is appended
after the title in the content stream.

Open weekdays now: Aug 4, 7, 11, 13, 18, 21, 24, 26, 31.

## 0041 (from 0040)

Aug 12 is deleted, so the industries film backs one post rather than two. Aug 19
keeps it. 14 pages to 13, thirteen posts to twelve.

Aug 12 returns to an unscheduled weekday, which leaves Aug 7, Aug 12, Aug 26, and
Aug 31 all open.

### Knock-on edits

* Original animations drop from four to three, so the slate summary now reads
  *twelve posts: three original animations, four static case studies, one brand
  video, one founder blog post, one podcast conversation, and two expert and
  talking head videos.*
* **The cover's cadence claim was no longer true.** With Aug 12 gone the week of
  Aug 10 carries two posts, against a cover that promised *three or four posts per
  week*. That line now reads *two to four*.

| Week | Posts |
|---|---|
| Aug 3–7 | 3 |
| Aug 10–14 | **2** |
| Aug 17–21 | 3 |
| Aug 24–28 | 4 |
| Aug 31 | 0 |

Worth a decision rather than leaving as is: Aug 12 is an open Wednesday in the one
light week, and `Implementation Starts Before Kickoff` (AN01) is a produced and
QA'd 30s animation that has had nowhere to go since 0038 displaced it from Aug 5.
Putting it on Aug 12 would restore the three-post week and use the asset.

### Verification

The case-study audit from 0039 runs on the output and all four pages are correct,
which matters because page 4 and page 12 still share image xref 40 and page 4
depends on the GTAA overlay surviving the page deletion. Every surviving page was
compared word-for-word against 0040.

## 0040 (from 0039)

Aug 12 is rewritten as industry solutions so the copy matches the still already on
it. The Align Academy training angle comes off the slate.

| | Was | Now |
|---|---|---|
| Title | Train for the Job, Not the Screen | **One Foundation, Not One Size** |
| Headline | One HCM system creates very different learning needs. | One workforce foundation, without flattening industry complexity. |
| Angle | Align Academy role-based training | the four operating decisions behind one shared foundation |

The still is unchanged and the copy now walks the exact four cards it shows:
design for the work itself, connect coverage and time and pay, make workforce risk
visible, keep the platform relevant.

### Aug 12 and Aug 19 share a film, deliberately

Both posts now draw on the 64.6s industries video, so they were given different
cuts of it rather than the same message twice:

* **Aug 19** keeps the thesis. `Different work. One standard for operational trust.`
* **Aug 12** takes the `how Align helps` panel, which is what its still shows.

Aug 12's ASSET row says `segment of the 64.6s industries film` rather than
restating the full runtime, so the reuse is visible on the page instead of looking
like two separate videos. Worth a look when the slate is reviewed: two posts a week
apart off one film is defensible, but it is a judgement call rather than a
requirement.

### Slate composition is unchanged

Aug 12 was already counted as an original animation and the industries film is one,
so the page 1 summary still reads correctly at thirteen posts with four original
animations. Only the grid cell title changed.

## 0039 (from 0038)

**Bug fix.** The GTAA page had been showing the Peco Foods artwork since 0036.
Page 4 now carries the GTAA one-pager again. Nothing else changed: every page's
text is identical to 0038 and the other three case-study pages were already
correct.

### What went wrong

0036 built the Peco page with `fullcopy_page` from the GTAA page. A full copy
shares the image XObject with its source, so the later `replace_image` call on the
clone rewrote the single object both pages pointed at. The Peco page came out right
and the GTAA page silently inherited Peco's artwork.

It survived three revisions because the 0036 check only compared image
*dimensions*, and all four stills are 576x1024. The visual review that round
covered the new Peco page and page 1, not page 4.

### Why the fix is an overlay

Page 4 and page 12 still both reference xref 40, so `replace_image` cannot fix
this: it would put GTAA's artwork on the Peco page instead. 0039 inserts the GTAA
still as a new image object on page 4 only, on the exact frame the old one
occupied, so it covers it completely and page 12 is untouched.

### The check that should have existed

`build/build-0039.py` audits by decoding the image actually visible in each
case-study frame and hashing its pixels against the source files in
`case-study-statics/`. It runs before and after the fix and asserts all four pages
match. Two details it has to get right: pick the *last* image landing on the frame,
since an overlay sits on top of the old one in content-stream order, and match on
the frame rect so the drop-shadow image behind it is skipped.

| Page | Expected | 0038 | 0039 |
|---|---|---|---|
| 4 | GTAA | Peco | GTAA |
| 5 | Beumer | Beumer | Beumer |
| 8 | Troon | Troon | Troon |
| 12 | Peco | Peco | Peco |

## 0038 (from 0037)

Blog swap and two deletions. The deck goes from 16 pages to 14, and the month from
fifteen posts to thirteen.

| Page | Date | Was | Now |
|---|---|---|---|
| 3 | Wed Aug 5 | Implementation Starts Before Kickoff | **Don't Let the Demos Decide** — the HCM Vendor Selection Checklist blog |
| 5 | Fri Aug 7 | Six Things Before Payroll Implementation | removed; its replacement blog now sits on Aug 5 |
| 6 | Wed Aug 12 | Train for the Job, Not the Screen | unchanged copy, **interim still** from the industries video |
| 14 | Wed Aug 26 | One System, Three Learning Paths | removed as a duplicate of the Aug 12 training message |

Aug 7, Aug 26, and Aug 31 are all unscheduled weekdays now.

### Aug 5, the new blog post

Copy is drawn from the checklist itself, filed here as
`hcm-vendor-selection-checklist-draft.pdf`. Its spine is Maher's own framing:
disciplined evaluations turn into presentation contests, and the fix is a better
decision model rather than better demos. The still is the supplied hero image,
padded to the frame's 16:9 with the card's own navy so nothing stretches.

Two things to confirm before this ships:

* The checklist PDF is marked *Draft for editorial and design review*, so the
  first-comment URL `alignhcm.com/blog/hcm-vendor-selection-checklist` is a
  reasonable guess, not a verified link. Every other post on the slate uses a real
  deep link.
* The blog is explicitly vendor agnostic, which is worth keeping that way in the
  post copy. It currently names no vendor.

### Aug 12's still is a placeholder

The frame is the industries video's `Build one workforce foundation` panel. It is
a capability frame on a training post, so it does not really match the message.
That is deliberate: the request was to put an industries still there, and a
purpose-made screenshot is coming. `video-stills/industries-foundation.png` is the
file to replace.

### Also fixed

* `centre` had slipped into the Aug 19 copy in 0037. The deck is US spelling
  throughout, so it now reads `center`.
* The Aug 5 copy panel ran to y=713.9 in the source deck, which put its bottom
  border straight through the footer text. The new copy is shorter, so the panel is
  normalised to the 689.4 bottom every other page uses and the footer chrome below
  it was rebuilt.

Every page that was not touched is word-for-word identical to 0037. The only
extraction difference on renumbered pages is the reading order of
`Confidential Information` relative to the redrawn page number.

`build/build-0038.py` reproduces this revision from 0037.

## 0037 (from 0036)

Video slate rebuilt. Three pages get a frame grab from their own finished asset
plus fresh copy, and the Maher podcast posts consolidate from three down to one.
The deck goes from 17 pages to 16, and the month from sixteen posts to fifteen.

| Page | Date | Was | Now |
|---|---|---|---|
| 2 | Mon Aug 3 | The Record Trap (Maher clip) | **The Team That Finishes It** — the Who We Are brand video |
| 10 | Wed Aug 19 | Go Live Is the Starting Line (SmartCare) | **Every Industry Depends On It** — the finished industries video |
| 12 | Mon Aug 24 | Treat the Platform Like a Product (Maher recut) | **HR at the Table** — the 2m13s Maher and Brent Skinner conversation |
| 17 | Mon Aug 31 | Speak the CFO's Language (Maher recut) | removed; Aug 31 returns to an unscheduled weekday |

Deleting the last page needed no footer renumbering, and every page that was not
rebuilt was diffed against 0036 and is textually identical.

### The competitor references are now gone

The Aug 19 SmartCare still carried a slide reading
`UKG | Dayforce | Paylocity | Workday | ADP | And more`. Replacing that post with
the industries video removes it. Sweeping the whole deck afterwards, the only
remaining platform-vendor mention is `ADP to UKG Pro` in the Beumer case study on
page 6, which is a factual description of that migration rather than a vendor
list, so it stays.

**Carry-over risk:** the Who We Are video itself still contains the same panel, at
about 21s, showing UKG, Dayforce, Workday, and ADP logos under
`ONE PARTNER, EVERY PLATFORM`. The still chosen for page 2 is from 18.5s and does
not include it, but the video does, so it needs a decision before that post ships.

### Stills

Frames were chosen by scanning each asset rather than grabbing an arbitrary
timestamp. Sources are in `video-stills/`.

* `who-we-are.png` — 18.5s, `We are the team that finishes it.`, the positioning
  line. Alternate worth considering: 10.8s, the five walls with the pill list,
  which is more visually arresting.
* `industries.png` — 8.6s, the title card, which states the video's thesis.
* `maher.png` — 62.5s. The captions animate word by word, so most frames land
  mid-phrase. This was picked by measuring caption ink across the whole video at
  2fps and taking the fullest block, which gives a four-line caption with both
  speakers engaged.

Each still is padded to its frame's exact aspect ratio with the card's own navy
before placement, so nothing is stretched and the padding is invisible against the
card. Page 10's frame is 16:9; pages 2 and 12 use the wider 1200x627 frame.

### Copy

All three posts carry new copy drawn from the asset's own script, wrapped to the
video-page measure of 424pt at 8.1pt. Each lands at exactly eight lines across six
paragraphs, matching the rhythm of the page it replaced.

`build/build-0037.py` reproduces this revision from 0036.

## 0036 (from 0035)

Adds the Peco Foods case study as a fourth static case-study post on
**Tuesday, August 25**, an open weekday. Aug 25 spaces the case studies across
the month (6, 10, 17, 25) rather than doubling them up next to Aug 10 or Aug 17.

The calendar grows from 16 to 17 pages. Peco is page 13, directly after Mon
Aug 24, and the four pages after it were renumbered 14 through 17.

Page 1 was updated to match:

* Aug 25 is promoted from an unscheduled weekday to a posting day, with the
  peach cell tint, the post title, and the `Static case study` type label.
* The slate summary now reads *sixteen posts* and *four static case studies*.

`build/build-peco-page.py` reproduces the change from 0035. The page is built by
cloning the design chrome from the GTAA page, stripping its glyphs, and redrawing
the Peco content in the calendar's own typefaces. Those were identified by
matching measured glyph advances against the original: **Plus Jakarta Sans 800**
for display headlines, **Plus Jakarta Sans 700** for letterspaced caps and grid
titles, **DM Sans 400** for body and footers, **DM Sans 500** for grid type
labels, and **DM Sans 700** for the semibold HEADLINE row. Every other page was
diffed against 0034 and is unchanged apart from the renumbered footers.

### Confirm before scheduling

* The first-comment link points at `alignhcm.com/case-studies` because the
  Peco story's own slug is not recorded anywhere in this repository. The other
  three case-study posts use a specific deep link, so Peco should too.
* Copy figures were taken from the supplied one-pager: 7,000 employees, three
  states, three unions, under six months.

### Still open after 0036

* **Maher video consolidation** and the **industries video** remain unaddressed.
  Both are blocked on source assets that are not in this repository. Cutting the
  three Maher posts and swapping the industries video in for the Aug 19 SmartCare
  post will change the slate counts on page 1 again.
* Pre-existing in 0034 and not touched here: on page 1 the closing line
  *"Nothing is scheduled or published from this document without approval."*
  collides with the footer rule. It needs a fix in the source HTML.

## 0035 (from 0034)

Case-study artwork swap. The three static case-study pages now carry the
approved published one-pagers instead of the earlier in-progress designs.

| Page | Post | Date | Artwork now in place |
|---|---|---|---|
| 4 | GTAA: 12 Priority WFM Needs in Six Months | Thu Aug 6 | `case-study-statics/gtaa-12-priority-needs.jpeg` |
| 6 | Beumer: Seven Years of HR Data, Preserved | Mon Aug 10 | `case-study-statics/beumer-seven-years-hr-history.jpeg` |
| 9 | Troon: HCM Stability at Global Scale | Mon Aug 17 | `case-study-statics/troon-one-workforce-standard.jpeg` |

Replacement was done in place against the existing image frames
(`310.5, 130.7, 538.6, 536.9` pt, 9:16), so page layout, post copy, and
pagination are unchanged. The supplied artwork is 576x1024, which matches
the frame aspect ratio exactly.

Post copy was checked against the new artwork on all three pages and the
figures agree — 1,700+ / 12 / 6 mo for GTAA, 7 yrs / 1,000 / 2 for Beumer,
30,000 / 900+ / 35+ for Troon. No copy edits were needed.

### Open items not addressed in 0035

* **Peco Foods one-pager** — `case-study-statics/peco-foods-practice-that-holds.jpeg`
  is staged here but is not placed in the calendar. The August slate carries
  exactly three static case-study posts (Aug 6, Aug 10, Aug 17), all three of
  which were already spoken for by GTAA, Beumer, and Troon. Placing Peco needs
  a slate decision: a new posting day, or a swap against an existing post.
* **Resolution** — the supplied files are 576x1024 screenshots, about 182 dpi
  inside the calendar frame. That reads cleanly on screen for review and
  approval. The full-resolution exports are still the assets to publish, and
  should replace these before anything is scheduled.
* **Maher video consolidation** and the **industries video** are tracked
  separately; neither is reflected in 0035.
