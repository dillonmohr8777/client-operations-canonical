# Momentum 360 responsive signature

Status: reviewable static-first draft. Not installed, sent, or published. The GIF request remains incomplete.

## Use the right file

- `signature.html`: the paste-ready inline-CSS fragment for an HTML email or draft pipeline.
- `signature-only.html`: the rendered copy surface, containing only the signature. Select the rendered signature and copy it into the signature editor only after review. Do not paste HTML source code as ordinary email text.
- `signature.txt`: plain-text alternative.
- `preview.html`: local review page. Do not copy its review heading or notes into a real email.
- `preview-820.png`, `preview-320.png`, `preview-320-images-blocked.png`: desktop, mobile, and image-blocked inspection evidence.
- `verification.json`: timestamped measured checks; `verify.mjs` reproduces them in hidden Chromium and closes its browser and loopback server afterward.
- `SURFACE.md`: source authority, design decisions, email-specific exceptions, and detector limitations.

Both copy surfaces retain the existing HTTPS logo URL. No local filesystem, loopback URL, data URI, or unhosted image is embedded in the paste-ready signature. `assets/momentum-360-logo.png` is a byte-identical local verification copy, not a newly hosted asset.

## Exact identity

Momentum 360 correspondence from `dillonmohr8777@gmail.com` only. The orchestrator verified the incumbent footer in SENT Gmail message `1a06eaacadc0cc10` on September 4, 2026. The active canonical registry route is `momentum-360`. This is not the IMMOHRTAL signature and must not be installed as a cross-mailbox default.

The name, two titles, telephone, website, company, and city are preserved. The former small two-column footer is now a 280px-wide single column that does not depend on media queries. Its 18px phone and 16px website have separate 44px-high tap areas in the browser check. All essential information is real text, so disabling images does not erase contact details.

## Verified and not verified

The local verifier checks 820px desktop and 320px mobile layouts, no horizontal overflow, image-blocked essential text, reduced-motion setting, keyboard access/focus, phone and website targets, logo HTTP availability and byte identity, text contrast, and page errors. Text contrast against white is 6.76:1, 13.27:1, and 5.94:1. See the JSON receipt for final counts and timing.

The manual Impeccable detector ran in degraded regex mode due missing parser modules. It returned font and preview hierarchy warnings, documented narrowly in `SURFACE.md`; it did not produce a full clean parser-based certification. No shared design system or installed dependency was changed.

No Outlook, Gmail, Apple Mail, physical phone, sent-message, mailbox-save, or forced-dark-mode test has been performed. Browser layout proof is not inbox proof. Final QA should inspect the pasted signature and one approved test email in the actual target clients before replacing an existing signature. A `tel:` link was validated, not dialed. The website URL was validated as the incumbent destination, not used to submit a form.

## GIF follow-through

No GIF is included, and there is no CSS animation pretending to be a GIF. This bounded pass delivers the reliable static version. A later animated option must preserve the exact logo, keep essential contact text outside the image, make the first frame complete, use a short non-looping or finite-loop decorative accent, respect small file size, and have its exact hosted asset plus static fallback tested in the real mail clients. It should remain an optional enhancement, not a dependency for reading or contacting Dillon.

## Reproduce

From this directory, run `node build-preview.mjs`, then `node verify.mjs`. The verifier uses the existing bundled Playwright package and installed headless Chrome without touching the authenticated profile. It serves only the two explicitly allowlisted local preview resources on 127.0.0.1 while testing. Use the existing hidden local-preview helper for interactive review; this package does not create a persistent background process.

Independent final review and Dillon's signature-setting approval remain separate. No canonical queue, existing asset, sending setting, branch, commit, or deployment was changed by this build.
