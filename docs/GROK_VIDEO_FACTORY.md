# Cursor Grok 4.5 Video Factory

## Outcome

This system converts exact client profiles and approved source manifests into client-separated vertical-video plans, generation prompts, local proof cuts, deterministic QA, and approval-ready artifacts.

Grok 4.5 inside Cursor is the orchestrator and evaluator. It does not masquerade as the video renderer. Rendering has two separate lanes:

1. the authenticated paid Grok Imagine web experience, which consumes the existing plan allowance
2. the xAI video API, which stays disabled until a verified API route and explicit incremental spend approval exist

## Default creative system

The portfolio default is **reference-first animated comic-book video**.

Every client generation must include:

1. a verified transparent client logo, or a clean logo render derived from a verified brand source
2. at least one approved client, product, service, location, or style reference image
3. one exact comic substyle selected for the client and campaign
4. a production prompt that defines composition, camera motion, subject motion, environmental motion, transitions, lighting, palette, audio, output settings, and negative constraints
5. a separate exact-logo end card or post-production overlay when Grok cannot preserve the logo perfectly

Text-only client generation is prohibited. A missing or ambiguous logo blocks
rendering instead of allowing a guessed wordmark or another client's artwork.

### Comic substyles

| Substyle | Best fit |
|---|---|
| Kinetic superhero | home services, transformations, high-energy offers |
| Premium graphic novel | law, B2B, financial, complex problem solving |
| Retro pop-art | retail, food, events, bold consumer campaigns |
| Clean editorial comic | software, HCM, education, explainers |
| Gentle wellness comic | wellness and health education without patient claims |

### Reference-first render sequence

1. Resolve the active client through `registry/clients.json`.
2. Validate the logo and every reference image visually and record provenance.
3. Generate a branded comic keyframe with the references attached.
4. Review the keyframe before consuming video allowance.
5. Animate the approved keyframe with image-to-video.
6. Review opening, middle, and closing frames for continuity and artifacts.
7. Add an exact, non-generated logo end card or overlay when required.
8. Inspect codec, duration, dimensions, audio, file size, and checksum.
9. Keep the result local until the exact preview is approved for delivery.

## First portfolio

| Client | Monthly target | Current render readiness |
|---|---:|---|
| Fagan Painting | 6 | Verified logo available; comic reference pack still needs approved project media for project claims |
| Onsite Concrete & Landscape | 6 | Verified logo available; comic reference pack still needs approved jobsite media for project claims |
| Pro Fence & Deck | 6 | Licensed stock-category references available; verified logo remains a render blocker |
| Hope Wellness Center | 4 | Verified logo and illustration references available; health-safety review is mandatory |

Total initial capacity: 22 finished concepts per month.

## Commands

Create a batch:

```powershell
.\scripts\New-GrokVideoFactoryBatch.ps1 -BatchId 2026-07-28-breakthrough-pilot
```

Run Cursor Grok 4.5 planning:

```powershell
.\scripts\Invoke-CursorGrokVideoFactory.ps1 -BatchId 2026-07-28-breakthrough-pilot
```

Validate:

```powershell
.\scripts\Test-GrokVideoFactoryBatch.ps1 -BatchId 2026-07-28-breakthrough-pilot
```

Render the Pro Fence licensed-stock proof:

```powershell
.\scripts\New-ProFenceVideoProof.ps1 -BatchId 2026-07-28-breakthrough-pilot
```

## Approval and spend boundary

- Batch planning, prompt creation, deterministic QA, and local FFmpeg proofs are local and reversible.
- Paid-plan Grok Imagine generation may proceed only from a verified authenticated session and a passed local concept, and it remains a review draft.
- API generation requires a verified `XAI_API_KEY` route, exact source approval, passed preflight, and explicit incremental spend approval.
- Sending, scheduling, posting, or publishing always requires the exact preview and approval.
