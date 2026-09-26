---
name: higgsfield-marketing-chief
description: Use Higgsfield MCP, CLI, and official skills for client image, video, audio, UGC, faceless, product, and website creative. Prefer Cursor MCP over the ChatGPT plugin. Load bundled workflows before generating. Credit spend is approval-gated.
---

# Higgsfield for Marketing Chief

Canonical copy lives at `integrations/higgsfield/skills/higgsfield-marketing-chief/SKILL.md`. Follow that file.

Use this skill whenever Dillon asks for Higgsfield, studio image/video/audio, UGC, faceless video, product photography, ad multiplier, thumbnails, Soul characters, or Higgsfield websites.

## Production path

- Use Cursor MCP at `https://mcp.higgsfield.ai/mcp` or the local Higgsfield CLI plus `higgsfield-ai/skills`.
- Do not use the ChatGPT plugin as the production path. It has no audio, no website-building skill, and stalls at plan-talk.
- Supercomputer slash skills are not CLI skills and are not a second queue.

## Execute, do not plan-and-stop

1. `scripts/Invoke-Higgsfield.ps1 -Action Status` then `-Action Doctor`.
2. `get_workflow_instructions` with no argument, then the matching workflow.
3. Require a verified client logo plus one approved reference. Block if missing.
4. Treat credit spend as approval-gated.
5. A 16-second or longer video is a multi-scene workflow, not one clip.
6. Outputs are local review drafts. Publishing stays gated.
