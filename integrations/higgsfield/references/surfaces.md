# Higgsfield surfaces

Official connector docs: [Connect Higgsfield to an AI agent](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent) and [CLI access](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-access-higgsfield-via-cli).

## Production

1. **Cursor MCP.** Hosted URL `https://mcp.higgsfield.ai/mcp`. Project config is `.cursor/mcp.json`. Cursor Cloud already uses this namespace. On Desktop, add Higgsfield from Customize → Marketplace, or keep the project MCP file and sign in when prompted.
2. **Local CLI + official skills.** On `DESKTOP-4AHKEC4` and `AHCM-3LCQVF4`, install the CLI, run `higgsfield auth login`, then `npx skills add higgsfield-ai/skills`. This is the coding-agent path Higgsfield documents for Claude Code, Cursor, and Codex.
3. **Cursor Marketplace plugin.** Same MCP account and credits after Add and sign in.

## Not production

4. **ChatGPT plugin.** Add from the Plugins Directory. Official limits: no audio generation and no Website Building skill. In practice the plugin also lets the model announce a plan for a 16-second clip and stop. Do not route Marketing Chief creative through it.
5. **Higgsfield Supercomputer slash skills.** Built-in `/` functions inside Supercomputer chat. They are not interchangeable with CLI skills and must not become a second Marketing Chief inbox.

## What each production surface can do

| Capability | Cursor MCP | CLI + skills | ChatGPT plugin |
|---|---|---|---|
| Image and video | yes | yes | yes |
| Audio | yes | yes | no |
| Website Building | yes | yes | no |
| Bundled MCP workflows | yes | via MCP or companion skills | no |
| Soul characters | yes | yes | yes |
| Results in higgsfield.ai Assets | yes | yes | yes |

Unlimited models and free generations apply only on higgsfield.ai, not through MCP, CLI, or the ChatGPT plugin. Every connected-agent generation spends plan credits.
