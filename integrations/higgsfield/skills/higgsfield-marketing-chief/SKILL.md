---
name: higgsfield-marketing-chief
description: Use Higgsfield MCP, CLI, and official skills for client image, video, audio, UGC, faceless, product, and website creative. Prefer Cursor MCP over the ChatGPT plugin. Load bundled workflows before generating. Credit spend is approval-gated.
---

# Higgsfield for Marketing Chief

Use this skill whenever Dillon asks for Higgsfield, Grok-alternative studio work, UGC, faceless video, product photography, ad multiplier, thumbnails, Soul characters, or Higgsfield websites.

## Why this beats the ChatGPT plugin

The ChatGPT Higgsfield plugin is a thin connector. It cannot generate audio, cannot run the Website Building skill, and commonly returns a plan for a 16-second clip instead of executing. Cursor MCP in this workspace exposes the full tool surface, including `get_workflow_instructions`, `generate_image`, `generate_video`, `generate_audio`, website tools, and 16 bundled workflows.

Higgsfield Supercomputer slash skills are a different product. Do not treat them as CLI skills or as a second Marketing Chief queue.

## Surfaces

| Surface | Production | Use |
|---|---|---|
| Cursor MCP `https://mcp.higgsfield.ai/mcp` | yes | Default in Cursor Cloud and Cursor Desktop |
| Local CLI + `npx skills add higgsfield-ai/skills` | yes | DESKTOP-4AHKEC4 and AHCM-3LCQVF4 coding agents |
| Cursor Marketplace plugin | yes | Same MCP after Add and sign in |
| ChatGPT plugin | no | Missing audio and website building |
| Supercomputer `/` skills | no | Separate product |

## Preflight

1. Run `scripts/Invoke-Higgsfield.ps1 -Action Status`.
2. Run `scripts/Invoke-Higgsfield.ps1 -Action Doctor`.
3. For live MCP health without spend, call `balance` and `models_explore` with `action=list`.
4. Do not print tokens, cookies, or raw account secrets.

## Execution rule

Never answer "I have a good plan" and stop.

1. Call `get_workflow_instructions` with no argument.
2. Call it again with the matching workflow name.
3. Collect the verified client logo and at least one approved reference. Block if either is missing or ambiguous.
4. If the work spends credits, stop for Dillon's exact approval unless a current standing envelope already covers that generation.
5. Import references through Higgsfield media tools. Do not assume a chat attachment is already a Higgsfield `media_id`.
6. Generate, wait, inspect, and package a local review artifact under the exact client folder.
7. Publishing, posting, scheduling, TikTok publish, website deploy, and paid-media upload remain separately gated.

## Duration

A single `generate_video` clip is typically 15 seconds or less. If Dillon asks for 16 seconds or longer, load `faceless-video`, a UGC workflow, or `video-editing` and stitch scenes. Do not force one oversized clip.

## Client creative lock

- Resolve `registry/clients.json` first.
- Attach a verified client logo or a clean render from a verified brand source.
- Attach at least one approved client, product, service, location, or style reference.
- Preserve logo spelling, proportions, colors, and geometry. Prefer an exact-logo end card over a redrawn logo.
- Never reuse another portfolio client's assets.
- Prohibit gibberish text, warped logos, unverified claims, synthetic testimonials, extra limbs, and cross-client brand elements.
- Grok Imagine stays animated comic-book unless Dillon picks another direction for that exact creative. Higgsfield does not silently replace that default.

## Website work

Load `website-builder-flow` before any Higgsfield website tool. Higgsfield website deploy or publish is approval-gated. Momentum 360 `AI Tech News` still uses the existing `dillon-os` site factory from pull request 226. Do not build a parallel generator.

## CLI on the writer machines

```powershell
pwsh -NoProfile -File .\scripts\Install-HiggsfieldCapability.ps1
pwsh -NoProfile -File .\scripts\Install-HiggsfieldCapability.ps1 -InstallCli
higgsfield auth login
npx skills add higgsfield-ai/skills
pwsh -NoProfile -File .\scripts\Invoke-Higgsfield.ps1 -Action Status
```

`higgsfield auth login` is a human authentication handoff. Do not automate the browser sign-in or store the session in this repository.

## Official companion skills

After CLI install, the official pack from `higgsfield-ai/skills` is: `higgsfield-generate`, `higgsfield-soul-id`, `higgsfield-product-photoshoot`, `higgsfield-brandkit`, `higgsfield-marketplace-cards`, `higgsfield-websites`, `higgsfield-video-explainer`, `higgsfield-youtube-thumbnail`, and `higgsfield-game-generation`. Those skills still obey this repo's approval, routing, and logo-lock rules.

## Evidence

Return redacted locators only: workflow id, model id, generation id, local review path, and whether spend was approved. Never write raw secrets or raw private communications into canonical state.
