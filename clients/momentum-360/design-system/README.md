# Momentum design system

Version 0.1.0 · September 4, 2026 · Internal working foundation

This connects the Momentum brand assets, presentation engine, website migration requirements, and quality rules in one client folder. It extends the existing `client-deck` system; it does not replace that installed skill or claim that the production websites have been migrated.

## Start here

- [Backend and access map](BACKEND-ACCESS.md): the two websites, responsible people, source evidence, and ready-to-send access requests.
- [System architecture](SYSTEM.md): brand boundaries, tokens, typography, layout, component contracts, imagery, content, and adoption.
- [Automatic presentation animation](MOTION.md): the actual installed engine, motion roles, authoring contract, and playback limits.
- [Source registry](system.json): machine-readable sources and surface status.
- [Verification receipt](VERIFICATION.md): measured checks, the animation fix, and remaining website gates.
- [Generated tokens](output/tokens.json), [CSS variables](output/tokens.css), and [WordPress theme fragment](output/momentum-digital.theme-fragment.json).
- [Editable motion proof](output/motion-proof/momentum-digital-design-motion-proof.pptx) and [PDF reference](output/motion-proof/momentum-digital-design-motion-proof.pdf). The PDF is static; play the PPTX in PowerPoint to see motion.

## What exists now

| Surface | Evidence | Adoption state |
| --- | --- | --- |
| Momentum Digital presentations | Today's installed brand JSON, kit, artwork, and deck | Existing engine; new proof produced locally |
| Need Momentum production website | Today's deck source notes plus freshly retrieved technical conversations | Observed palette; WordPress account and staging inventory pending |
| Momentum 360 email | Today's signature source and its documented incumbent identity | Extracted for reuse; signature remains a review draft |
| Momentum 360 production website | Exact logo source and technical conversations | Corporate website theme extraction pending |
| Momentum 360 reporting | Established dark dashboard contract | Preserve incumbent shell; numerical evidence is report-specific |
| M360 Orbit | Separate product guidelines | Product-specific identity; not a corporate default |
| Need Momentum Signal/Map | Existing concept DESIGN.md and assets | Review prototypes; not production website authority |

## Rebuild

```powershell
node scripts/build-system.mjs
node scripts/build-system.mjs --check
node scripts/build-motion-proof.mjs
pwsh -File scripts/verify-motion-proof.ps1
```

The token build reads the current installed brand definition and source-located artwork, checks contrast and source integrity, and exports namespaced variables plus a **draft** Gutenberg theme fragment. It never uploads files or changes WordPress. `--check` verifies the generated artifacts against current source files without rewriting them. Source drift causes a failure so a changed brand cannot silently reuse stale output.

The verification command requires Windows with desktop PowerPoint and uses hidden COM opening. The token and deck builds themselves use Node and the installed skill; native choreography uses Python's standard library.

Set `MOMENTUM_DECK_SKILL_ROOT` only when the existing `client-deck` skill is installed elsewhere. The default is the current user's `.claude/skills/client-deck`. Do not copy the kit into another installation to fix a path.

## Next adoption step

Obaid is the evidenced Need Momentum technical access route; Mac is the escalation. For Momentum 360, coordinate Jason/Sean with Muhammad. After an individual account and staging route are verified, inventory the actual themes/builders and adapt these source-backed tokens to one representative page before touching shared site globals.

No message, website change, hosting change, or production deployment is part of this foundation release. The local access requests are ready for Dillon's approval if he wants them sent.
