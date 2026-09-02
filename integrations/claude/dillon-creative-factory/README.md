# Dillon Creative Factory for Claude

This is the Claude-facing MCP layer for `client-operations-canonical`. Version 0.1 is intentionally limited to read-only operations and client-separated artifact creation.

## Working tools

- `get_client_brand_kit`
- `build_campaign_brief`
- `create_content_pack`
- `create_design_draft`
- `find_free_ai_tool`
- `build_website_preview`
- `run_visual_qa`
- `inspect_media`
- `research_prospect`
- `package_client_delivery`
- `search_agent_vault`
- `get_approval_board`

The first version cannot send messages, publish content, spend money, write to CRM records, change canonical queue state, expose credentials, or deploy a live site.

## Local setup

```powershell
npm install
npm test
npm run export:sessions
claude mcp add --scope user dillon-creative-factory -- node C:\Users\dillo\Documents\Codex\projects\client-operations\integrations\claude\dillon-creative-factory\src\index.js
```

The repository also contains a project-scoped `.mcp.json`, so Claude Code sees the server when launched from the repo after the branch is merged.

## Adapter stack

| Adapter | v0.1 state | Boundary |
| --- | --- | --- |
| Canva | Manifest-ready | Private design drafts only after exact OAuth account is connected |
| Hugging Face | Working discovery | Searches Spaces; Higgsfield excluded; current free status must be verified |
| Figma | Manifest-ready | Draft files only after exact OAuth account is connected |
| Cloudflare Browser Rendering | Planned remote QA adapter | No tunnel or public binding in local v0.1 |
| Notion | Planned context adapter | Read-only until exact workspace and database are verified |
| Vercel | Planned preview adapter | Preview creation only; production deployment remains gated |

The same tool functions can later be wrapped with Streamable HTTP and deployed to Cloudflare Workers or Vercel. A remote deployment must add authentication, per-client authorization, request logging without content capture, rate limits, and an artifact store. Do not expose local filesystem paths or the agent-vault over a public endpoint.

## Session continuity

`session-index/claude-sessions.json` inventories every local Claude Code session without committing raw sessions. It contains metadata, counts, hashes, tool names, and branch names only. Prompts, model responses, tool payloads, attachments, raw communications, full local paths, and credentials are excluded.

## Verification

```powershell
npm run verify
```

The test suite validates client routing, path containment, brand-kit isolation, queue readback, the MCP stdio handshake, all tool names, and a live read-only tool call.

For a release-time exact session snapshot, run `npm run export:sessions` followed by `node scripts/export-claude-sessions.mjs --check --strict`. Normal verification checks the privacy/schema contract without failing just because another Claude session starts concurrently.
