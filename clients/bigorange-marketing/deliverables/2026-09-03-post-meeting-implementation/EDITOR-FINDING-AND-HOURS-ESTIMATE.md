# WordPress editability finding and remaining-hours estimate

Verified September 3, 2026 in the authenticated BigOrange WordPress admin by
read-only inspection. No content or settings were changed.

## What the site runs

- The posts screen exposes Beaver Builder for 62 posts.
- WordPress post 5550 opened in Gutenberg code-editing mode as one raw HTML payload,
  which matches Paula's concern that ordinary copy edits require code knowledge.
- Gutenberg and Beaver Builder are not interchangeable. Gutenberg blocks make the
  content editable in the standard WordPress editor. Beaver Builder parity would
  require a separate manual rebuild in the site's proprietary layout data.

## Recommended implementation path

Use Gutenberg blocks for the approved article and sub-pillar drafts. This directly
addresses the editability problem and keeps a reversible source file. Do not describe
the result as Beaver Builder native. If BigOrange requires Beaver Builder parity,
scope that work separately.

## Estimate reconciliation

The original full estimate was 18 to 26 hours. It included local conversion and
preparation that has now been completed in this review package. The remaining site
work for the call-scope batch was initially estimated at 10 to 15 hours. Authenticated
read-only QA now confirms that all seven article Draft records and private routes
already exist. The affected line item is reduced from 3 to 5 hours to 2 to 4 hours,
making the revised remaining estimate **9 to 14 hours for Path B only**. Path B is
exactly article Drafts 5550, 5552, 5619, 5621, 5623, 5625 and 5627 plus the three
proposed subpillars after their titles and URLs are approved. No time is reserved for
creating or locating those seven article records. Their existing content has not been
declared complete or source-matched, so backup, comparison, approved replacement and
rendered validation remain in scope.

| Remaining call-scope work | Hours |
| --- | ---: |
| Back up and reconcile the seven existing article Drafts; import or replace approved content as private drafts | 2–4 |
| Create the three approved sub-pillar drafts from the prepared Gutenberg assets | 2–3 |
| Wire reciprocal pillar, sub-pillar and article links; set approved Yoast fields, categories and tags | 2–3 |
| Run rendered desktop and mobile QA, schema parity checks, link-target checks and rollback readback | 3–4 |
| **Remaining total** | **9–14** |

This estimate covers existing article Drafts 5550, 5552, 5619, 5621, 5623, 5625 and
5627 plus three new sub-pillars. It does not authorize or price implementation of
every authority-package candidate. If the entire 20-file current-target review set is
approved for WordPress, it needs a separate mapped scope.

It also does not cover **Path A: contracted nine-file map**. The crosswalk confirms
only AUTO-01 with 5623 as an exact title-and-purpose overlap. WEB-01 with 5550 and
PPC-01 with 5621 are possible thematic overlaps; six mapped files have no clear
existing Draft counterpart. Path A is not yet estimable until BigOrange approves the
complete existing-versus-new Draft slot map.

**Current relationship: partial overlap plus supplementation, not a validated
replacement set.** The approval choice is **Path A: contracted nine-file map** or
**Path B: seven-existing-Draft batch**. The 9-to-14-hour estimate applies to Path B
only. **Path B does not fulfill the contracted nine-file map.**

Dillon offered on the call to waive the reverse-engineering block. The hours remain
documented because Margee asked for them; the follow-up draft records the waiver and
still requires Dillon's approval before delivery.

If Beaver Builder parity is required instead of Gutenberg, add approximately 12 to
18 hours and expect a manual rebuild.

## Confirmed private Draft routes

These routes were confirmed by authenticated read-only QA on September 3. They are
not public links, and route existence is not an implementation-completeness claim.

- ID 5546. WordPress status: Draft. Concept direction: Cinematic Authority.
  [Private preview](https://bigorange.marketing/?page_id=5546&preview=true) and
  [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5546&action=edit).
- ID 5585. WordPress status: Draft. Concept direction: Orange Press.
  [Private preview](https://bigorange.marketing/?page_id=5585&preview=true) and
  [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5585&action=edit).
- ID 5550. WordPress status: Draft.
  [Private preview](https://bigorange.marketing/?p=5550&preview=true) and
  [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5550&action=edit).
- ID 5552. WordPress status: Draft.
  [Private preview](https://bigorange.marketing/?p=5552&preview=true) and
  [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5552&action=edit).
- ID 5619. WordPress status: Draft. **11 Home Builder Marketing Ideas.**
  [Private preview](https://bigorange.marketing/?p=5619&preview=true) and
  [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5619&action=edit).
- ID 5621. WordPress status: Draft. **Home Builder Advertising.**
  [Private preview](https://bigorange.marketing/?p=5621&preview=true) and
  [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5621&action=edit).
- ID 5623. WordPress status: Draft. **Home Builder Marketing Automation.**
  [Private preview](https://bigorange.marketing/?p=5623&preview=true) and
  [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5623&action=edit).
- ID 5625. WordPress status: Draft. **How to Choose Home Builder Marketing
  Solutions.** [Private preview](https://bigorange.marketing/?p=5625&preview=true) and
  [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5625&action=edit).
- ID 5627. WordPress status: Draft. **When Should a Custom Home Builder Hire a
  Marketing Agency.** [Private preview](https://bigorange.marketing/?p=5627&preview=true)
  and [WordPress editor](https://bigorange.marketing/wp-admin/post.php?post=5627&action=edit).

## Dated WordPress findings

The September 3 read-only inspection also found the following on the new drafts:

1. The drafts used the `BigOrange Updates` category while an existing
   `Builder Marketing` category appeared to be the intended alternative.
2. Yoast focus keyphrases were not set.
3. Tags were not set.
4. Outgoing internal links were reported as zero in the WordPress list view.

These are dated observations, not current closure claims. Recheck them before any
approved draft-write batch. The local verifier confirms block syntax, JSON-LD parsing,
visible FAQ parity and declared internal-link syntax; it does not prove that a target
URL is live, appropriate or reachable in WordPress.

## Access boundary

The admin notice stated that two-factor authentication becomes required September 30,
2026. Account owners should enroll through the normal human authentication flow.
Nothing in this package authorizes account, security, content or publication changes.
