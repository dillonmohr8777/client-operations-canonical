# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by Dillon: static HTML, CSS, and JavaScript so the evidence package is dependency-light, printable, and durable on Netlify.

## Users

- Dillon is the first reviewer and delivery recipient. He needs to verify what was integrated, what worked, what failed, and what is safe to do next.
- Jason Fallon is the eventual executive audience. He needs a fast, legible explanation of the Momentum 360 HubSpot forecasting pilot without technical theater or unsupported business claims.

## Product Purpose

Turn the verified HubSpot and Chronos pilot evidence into one executive dashboard and companion PDF. Success means a reader can understand within seconds that the architecture worked, the first model did not earn promotion, and the next experiment is clearly defined.

## Positioning

This is not a decorative forecast. It demonstrates a governed specialist lane that separates numeric forecasting from LLM interpretation, compares the model with simple baselines, preserves uncertainty bands, and abstains when the evidence does not justify action.

## Operating Context

- The dashboard is reviewed from a Netlify link on desktop or mobile.
- The PDF is the portable executive record and first-delivery attachment.
- The source package is the verified Momentum 360 HubSpot plus Chronos pilot under `../2026-09-01-hubspot-chronos-forecast-pilot/`.
- The deployment is a dedicated noindex Momentum 360 review surface. Dillon receives it before any client-facing delivery.

## Capabilities and Constraints

- Show the 12-week held-out comparison, point forecast, p10 through p90 uncertainty, baseline metrics, data-quality warning, integration flow, HubSpot access coverage, safety boundaries, and recommended next experiment.
- Lead and event counts use whole integers.
- `HubSpot contacts created` must never be relabeled as leads, qualified leads, conversions, demand, deals, or revenue.
- Conversion reporting is pending validation.
- Chronos-2 remains evidence-only because it did not beat persistence and its p10-p90 band was under-calibrated.
- No CRM writes, workflow changes, spend, sending to Jason, scheduled automation, or production forecast promotion are authorized by the artifact.
- Account-routing identifiers are intentionally present; secrets, contact-level identifiers, and raw communications are excluded.

## Brand Commitments

- Use the verified Momentum 360 circular M logo from the canonical client folder without redrawing it.
- Extend the established Momentum reporting identity: near-black and deep-navy fields, blue interaction accents, amber report labels, crisp executive hierarchy, and restrained motion.
- Keep the voice confident, direct, proof-led, and candid about failure and uncertainty.

## Evidence on Hand

- `../2026-09-01-hubspot-chronos-forecast-pilot/momentum-360-hubspot-chronos-forecast-pilot-report.md`
- `../2026-09-01-hubspot-chronos-forecast-pilot/scoring-receipt.json`
- `../2026-09-01-hubspot-chronos-forecast-pilot/forecast-run.json`
- `../2026-09-01-hubspot-chronos-forecast-pilot/forecast-request.json`
- `../2026-09-01-hubspot-chronos-forecast-pilot/inputs/hubspot-contacts-created-weekly.csv`
- `../2026-07-26-paid-media-dashboard-run/DESIGN.md`
- Verified logo: `../2026-07-27-workshop-outreach-campaign/assets/momentum-360-logo.png`

No testimonial, revenue lift, lead-quality outcome, or operational forecast value has been verified and none may be invented.

## Product Principles

1. The decision comes before the decoration.
2. Every chart exposes its metric, timeframe, and limitation.
3. Failure to beat a simple baseline is a useful system result.
4. Brand expression supports comprehension rather than obscuring state.
5. The same verified data drives the dashboard and PDF.

## Accessibility & Inclusion

Target WCAG 2.2 AA contrast, semantic document structure, keyboard-readable controls, visible focus, reduced-motion support, mobile reflow without horizontal overflow, and complete print output without requiring interaction.
