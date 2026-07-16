# Marketing Design Standard

Last updated: 2026-07-16
Status: global evaluation baseline; client contracts and accepted references remain authoritative

## Purpose

Good design is not a synonym for "premium." Every important visual deliverable needs a reference-backed contract, exact output requirements, rendered inspection, and recorded corrections. This standard supplies the reusable core without flattening different clients or formats into one aesthetic.

## Context load order

1. Current brief, audience, job, distribution surface, and exact dimensions.
2. Client `CLIENT.md`, brand assets, design contract, and current campaign context.
3. Accepted client references and explicit anti-references.
4. Deliverable-specific requirements.
5. This global QA baseline.

Never transfer a motif, palette, font, component, chart style, or visual claim between clients without evidence that it belongs there.

## Required design contract

Before high-value production, establish or explicitly mark unknown:

- audience and desired response;
- format, dimensions, breakpoints, duration, and delivery surface;
- brand assets and usage constraints;
- typography system and fallback behavior;
- color roles and minimum contrast;
- imagery or illustration direction;
- density, whitespace, and hierarchy preferences;
- accepted references and why they work;
- anti-references and why they fail;
- factual content and proof sources;
- accessibility, compliance, and platform constraints;
- definition of done and approval owner.

If the contract is incomplete, the Maker may create a labeled exploratory direction. It may not present invented choices as approved brand rules.

## Production loop

Use a bounded Maker and Verifier loop for consequential creative:

1. Normalize the brief and exact outputs.
2. Choose a direction from evidence, not a generic trend.
3. Build at the final aspect ratio and representative content density.
4. Render every required surface or page.
5. Inspect visually at useful overview and detail scales.
6. Run factual, accessibility, overflow, and output checks.
7. Revise against named defects.
8. Stop after three review cycles and surface the unresolved tradeoff if one remains.

The Verifier evaluates the rendered artifact, not just source code or file existence.

## Global QA rubric

Score each applicable dimension from 0 to 2.

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Outcome and hierarchy | Purpose or primary action is unclear | Understandable with competing emphasis | Immediate, intentional reading path |
| Typography | Broken, unreadable, or arbitrary | Serviceable but inconsistent | Deliberate scale, rhythm, and measure |
| Spacing and alignment | Obvious collisions or drift | Mostly consistent with weak areas | Coherent grid and optical balance |
| Contrast and accessibility | Fails readability or required access | Borderline or incompletely checked | Readable and verified for the surface |
| Brand fidelity | Wrong or generic identity | Uses assets without a coherent system | Recognizably and correctly on brand |
| Content density | Overflow, emptiness, or scanning failure | Acceptable with avoidable compression | Information is paced for the use case |
| Originality and fit | Template-like or trend pasted | Competent but generic | Specific to audience, brand, and message |
| Asset quality | Pixelated, distorted, inconsistent, or unlicensed | Mixed quality | Crisp, consistent, appropriate, traceable |
| Responsive or format behavior | Breaks at required sizes | Main size works; edge cases weak | Required sizes and states are verified |
| Factual integrity | Visual labels or claims are unsupported | Minor uncertainty is labeled | Every material claim and chart label is sourced |

A review-ready artifact has no zero in an applicable dimension, no unresolved overflow or factual defect, and an average of at least 1.6. A beautiful artifact with incorrect content fails.

## Deliverable-specific checks

### Slides and PDFs

- Inspect every rendered page at overview and 100 percent scale.
- Verify page order, margins, recurring elements, widow and orphan behavior, and export fidelity.
- Charts expose metric definition, timeframe, source, and unknowns.
- Editable source, final PDF, individual page renders, and QA record exist when required by the brief.

### Websites and landing pages

- Render required desktop and mobile sizes plus meaningful intermediate states.
- Check navigation, primary action, forms, validation, focus order, keyboard access, contrast, loading, and overflow.
- Live readback verifies the deployed result only after deployment is separately approved.
- A local source change alone is not proof of a live fix.

### Ads and social graphics

- Build at exact platform sizes and inspect safe zones, crop behavior, legibility, and thumb-stop hierarchy.
- Claims, offers, prices, dates, and calls to action match the approved source.
- Variants change a meaningful hypothesis rather than decoration alone.

### Motion and video

- Check the first three seconds, pacing, text dwell time, captions, audio balance, transition consistency, platform crop, and final frame.
- Inspect representative frames and the full playback.
- The storyboard and exported video must agree.

### Dashboards and reports

- KPI names, math, date ranges, sources, freshness, and missing fields are explicit.
- Lead and conversion-event counts use whole integers for Momentum 360 outputs.
- Visual polish never masks stale or inaccessible data.

## Common failure patterns

- Generic AI gradients, glow, glass cards, and random icons without brand evidence.
- A logo and palette applied to an otherwise unrelated template.
- Inconsistent radius, spacing, shadows, or type hierarchy.
- Fake charts, sample metrics presented as real, or stale screenshots presented as current.
- Decorative density that buries the decision or call to action.
- One desktop screenshot treated as responsive QA.
- File-existence checks treated as design review.
- Endless revisions without naming the defect or tradeoff.

## Design learning protocol

For an accepted, modified, or rejected direction, record a redacted correction in `state/corrections.jsonl` with client, deliverable, reference or artifact locator, the exact visual delta, why it mattered, and confidence. Store accepted and anti-reference locators in the client folder. Do not copy private client assets into a shared corpus without authorization.

Repeated corrections should update the relevant client contract. Global preferences belong here only when they consistently apply across clients or Dillon makes them a standing rule.
