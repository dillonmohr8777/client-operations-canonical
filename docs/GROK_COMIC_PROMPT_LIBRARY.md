# Grok reference-first comic prompt library

This is the default client-creative system. Every client render must attach:

1. the verified client logo;
2. at least one approved client or style reference;
3. a client-specific prompt selected from the substyles below.

Text-only client generation is blocked. A filename that contains `logo` is not sufficient verification.

## Production sequence

1. Resolve the exact client through `registry/clients.json`.
2. Read the client's `video-factory/profile.json` and reference manifest.
3. Stop if the exact logo or approved visual reference is missing or ambiguous.
4. Transform the approved client scene into a comic keyframe.
5. Composite the exact logo as a locked flat overlay on the approved keyframe.
6. Use the logo-locked keyframe as the first frame for image-to-video.
7. Inspect the opening, midpoint, and ending frames.
8. Re-composite the exact logo on the final video so the generative model cannot mutate it.
9. Keep delivery and publication approval-gated.

## Scene transformation prompt

> Use the uploaded client scene as the source composition. Transform it into a premium animated-comic keyframe with bold controlled ink outlines, sophisticated cel shading, restrained halftone texture, deliberate focal hierarchy, and clean foreground, midground, and background separation. Preserve the recognizable people, objects, architecture, materials, colors, and camera perspective from the source. Do not invent a different project, customer, employee, testimonial, offer, result, or location. No words, captions, signs, watermarks, fake typography, or gibberish. High-end agency advertising art, grounded rather than childish, with animation-ready layers and physically coherent detail.

## Logo-lock instruction

> The uploaded client logo is the only identity reference. Use it exactly as supplied. Do not redraw, restyle, retype, misspell, warp, recolor, crop, animate, or alter its proportions or geometry. Treat it as a flat, crisp screen-space overlay. No substitute wordmark and no generated typography.

The final logo lock is deterministic: the original verified logo is composited after generation even when Grok appears to preserve it.

## Image-to-video motion prompt

> Animate this exact branded comic keyframe for 10 seconds. Preserve the full first-frame composition. Use premium restrained comic motion: a slow 3 percent camera push, gentle parallax across the existing layers, subtle environmental movement, and one small subject-appropriate accent. The logo panel is locked screen-space artwork and must remain static, crisp, flat, readable, correctly spelled, proportionally identical, and undistorted for the entire clip. Do not add people, objects, words, scene cuts, whip pans, surreal morphing, or random audio. Smooth, physically coherent, high-end agency comic advertising.

## Client-safe comic substyles

| Substyle | Use | Prompt modifier |
|---|---|---|
| Kinetic superhero | Home services, agency, action-oriented local brands | Dynamic perspective, decisive ink lines, controlled speed lines, bold sunlight, practical motion |
| Premium graphic novel | Law, HCM, software, executive content | Editorial composition, restrained palette, subtle ink texture, confident cinematic lighting |
| Retro pop-art | Food, retail, events, seasonal campaigns | Clean halftone fields, punchy palette, graphic shapes, limited playful motion |
| Clean editorial comic | Community development, education, explainers | Documentary framing, accessible color, precise information hierarchy, minimal effects |
| Gentle wellness comic | Wellness and supportive-care education | Soft ink, calm cel shading, organic shapes, slow breathing motion, no clinical outcome implication |

## Negative constraints

- no generated or substitute logos;
- no client or brand blending;
- no fictional testimonials or synthetic project claims;
- no extra fingers, unstable faces, melting tools, bending architecture, or impossible camera motion;
- no text except the exact deterministic logo overlay;
- no upload, delivery, or publication without the existing approval gate.

