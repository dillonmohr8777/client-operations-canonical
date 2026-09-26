# Higgsfield Marketing Chief integration

Higgsfield is a first-class creative capability in this operating system. Cursor MCP and the local CLI replace the ChatGPT plugin.

This integration is not a second queue. It does not store secrets. Credit spend, publishing, TikTok, website deploy, Soul training, and billing remain approval-gated.

## Why not the ChatGPT plugin

The ChatGPT plugin at [higgsfield.ai/mcp?tab=chatgpt](https://higgsfield.ai/mcp?tab=chatgpt) is a thin connector. Official Higgsfield docs say it cannot generate audio and cannot run Website Building. In practice it also lets the model announce a plan for a 16-second video and stop.

A single Higgsfield clip is typically 15 seconds or less. Longer asks need a bundled workflow and an edit. Cursor MCP already exposes that catalog through `get_workflow_instructions`.

Higgsfield Supercomputer slash skills are a separate product. They are not CLI skills and must not become another Marketing Chief inbox.

## Production path

1. Cursor MCP: `https://mcp.higgsfield.ai/mcp` via `.cursor/mcp.json` or Customize → Marketplace → Higgsfield.
2. Local CLI on `DESKTOP-4AHKEC4` and `AHCM-3LCQVF4`.
3. Official companion skills from [higgsfield-ai/skills](https://github.com/higgsfield-ai/skills).

```powershell
pwsh -NoProfile -File .\scripts\Invoke-Higgsfield.ps1 -Action Status
pwsh -NoProfile -File .\scripts\Invoke-Higgsfield.ps1 -Action Doctor
pwsh -NoProfile -File .\scripts\Invoke-Higgsfield.ps1 -Action Mcp
pwsh -NoProfile -File .\scripts\Install-HiggsfieldCapability.ps1
pwsh -NoProfile -File .\scripts\Install-HiggsfieldCapability.ps1 -InstallCli
higgsfield auth login
npx skills add higgsfield-ai/skills
pwsh -NoProfile -File .\scripts\Test-HiggsfieldCapability.ps1
```

`higgsfield auth login` is a human authentication handoff. Do not put the session, cookies, or tokens in this repository.

## Agent contract

1. Status, then Doctor.
2. Load `get_workflow_instructions` before any `generate_*` call.
3. Require a verified client logo and one approved reference. Block if either is missing.
4. Treat credit spend as spend.
5. Return a local review package. Do not publish.

Read `skills/higgsfield-marketing-chief/SKILL.md`, `references/surfaces.md`, and `references/workflows.md`.
