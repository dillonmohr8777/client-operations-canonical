# Momentum Slack agent platform research

Date: 2026-09-12

## Read this first

The practical Slack path is not “put a bot in every channel and scrape everything.” Slack now has a first-class agent surface plus a Real-time Search API that can search public channels the authenticated user can access, including public channels the user has not joined, when the app has `search:read.public`. For private channels, DMs, and MPIMs, Slack requires user-granted scopes and user tokens. This matches the live evidence the parent supplied: 43 current membership channels plus public `#360leads` discoverable/readable without joining.

“Grok bot” is also no longer just a vague reference. xAI has an official product called Grok Bot: persistent named bots with their own cloud computers, routines, memory/context, and enterprise controls. That product is different from the xAI developer API. The developer API exposes Grok models, Responses-style calls, function calling, remote MCP, context compaction, async/deferred patterns, and a beta multi-agent research model. I did not find an official xAI Slack-native agent/session API equivalent to Slack’s `agents.sessions.*` or OpenAI’s managed Agents API.

## Official current platform facts

### Slack

- Slack’s agent quickstart supports Slack agents built with Bolt plus common agent frameworks, including an OpenAI Agents SDK sample. Agents can handle DMs, app mentions in channels, and threaded context. Source: [Slack agent quickstart](https://docs.slack.dev/ai/agent-quickstart/).
- Slack’s current agent session UX is described under “Agent sessions”; the actual current Web API methods verified are `agents.sessions.setStatus` and `agents.sessions.rename`. Sessions are thread-scoped, have statuses `processing`, `active`, `suspended`, and `closed`, can show a stop button, and require apps declared as agents plus the documented bot-token scopes. Sources: [Slack Agent sessions](https://docs.slack.dev/ai/agent-sessions/), [agents.sessions.setStatus](https://docs.slack.dev/reference/methods/agents.sessions.setStatus/), [agents.sessions.rename](https://docs.slack.dev/reference/methods/agents.sessions.rename/).
- Slack recommends targeted context. Their context docs say to use `assistant.search.context` for workspace search, `conversations.replies` for full threads, and `conversations.history` sparingly for channel context. Source: [Slack context management](https://docs.slack.dev/ai/agent-context-management/).
- The Real-time Search API searches messages/files/channels/users across Slack through a permissioned search interface. With `search:read.public`, it can search public channel messages in workspaces where the app is installed and the searching user is a workspace member; the user need not be a member of those public channels. Private/DM/MPIM search requires user consent and user-token scopes. Source: [Slack Real-time Search API](https://docs.slack.dev/apis/web-api/real-time-search-api/).
- `conversations.history` still matters for exact thread/channel readback, but token access is narrower: bot tokens read conversations the bot is a member of; user tokens can read the user’s private conversations and all public conversations with proper scopes. Internal and Marketplace apps keep Tier 3 rates; new commercially distributed non-Marketplace apps created after 2025-05-29 can be throttled to 1 request/minute with a 15-item limit. Source: [conversations.history](https://docs.slack.dev/reference/methods/conversations.history/).
- Joining public channels is lawful through `conversations.join` with `channels:join`, but this should be used only when presence is useful. It is not required for public-channel search under RTS. Source: [conversations.join](https://docs.slack.dev/reference/methods/conversations.join/).
- Slack rate limits are per method, per workspace/team, per app. Posting is generally 1 message/second/channel, Events API allows 30,000 deliveries/workspace/app/60 minutes, and 429 responses include `Retry-After`. Source: [Slack rate limits](https://docs.slack.dev/apis/web-api/rate-limits/).

### OpenAI

- OpenAI’s current agent choices are: Agents API for long-running managed Codex-harness work, Agents SDK when the app owns the loop, and Responses API when the app wants direct model/tool control. Source: [OpenAI Agents overview](https://developers.openai.com/api/docs/guides/agents.md).
- The OpenAI Agents API provides durable sessions, managed orchestration, context compaction, recovery, tools/MCP, optional sandbox execution, and subagent delegation. Sources: [Agents API overview](https://developers.openai.com/api/docs/guides/agents-api/overview), [Architecture](https://developers.openai.com/api/docs/guides/agents-api/architecture).
- Agents API sessions are durable and asynchronous. A session keeps configuration, conversation, and saved work; a new message to an idle session starts a turn, while a message during an active turn steers it. Progress can be streamed or handled through webhooks. Source: [Run and continue sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions).
- For work that needs Momentum files, private tools, or a Windows/local executor, use `environment.type: "self_hosted"` and run `codex exec-server` with a restricted environment key. Connections are outbound over WebSocket and should use a separate executor key, not the broad app API key. Source: [Self-hosted sandboxes](https://developers.openai.com/api/docs/guides/agents-api/environments/self-hosted).
- Agents API webhooks support durable execution without holding a stream open. Session events include created, action_required, in_progress, idle, and failed. Source: [Session webhooks](https://developers.openai.com/api/docs/guides/agents-api/sessions/webhooks).
- Responses API remains the lower-level primitive for direct model calls, hosted tools, remote MCP, stateful context, and background mode. Background mode supports async polling and webhooks for long tasks. Sources: [Migrate to Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses), [Background mode](https://developers.openai.com/api/docs/guides/background), [Webhooks](https://developers.openai.com/api/docs/guides/webhooks).
- OpenAI cost evidence verified here only at the category level: Agents API bills selected model usage at API rates; OpenAI tools and OpenAI-hosted sandboxes bill at their standard tool/container rates. Source: [Agents API overview](https://developers.openai.com/api/docs/guides/agents-api/overview).

### xAI / Grok

- Official Grok Bot product pages describe persistent AI teammates that can sign into tools, run routines, work in parallel, keep context, and use their own cloud computers. Source: [Grok Bot](https://x.ai/bot).
- xAI’s enterprise note says each Bot is a worker for a specific job, runs independently on its own cloud computer, can message/share context with other Bots, and enterprise release added access, network, and audit controls. Source: [Grok Bot for Enterprise](https://x.ai/news/grok-bot-for-enterprise).
- xAI’s design note defines Bots as persistent agents with identity, memory, runtime, tools, chats, skills/routines, and artifacts. Source: [Designing Grok Bot](https://x.ai/news/designing-grok-bot).
- xAI developer docs expose a Grok API at `https://api.x.ai/v1`, including OpenAI-compatible Responses calls with `base_url="https://api.x.ai/v1"`, function calling, remote MCP, context compaction, and beta multi-agent research. Sources: [xAI overview](https://docs.x.ai/overview), [Function calling](https://docs.x.ai/docs/tools/function-calling.md), [Remote MCP tools](https://docs.x.ai/docs/tools/remote-mcp.md), [Context compaction](https://docs.x.ai/developers/advanced-api-usage/context-compaction), [Multi Agent](https://docs.x.ai/developers/model-capabilities/text/multi-agent).
- xAI async options are client-side concurrency, Batch API reference, and deferred chat completions. Deferred results are retrievable once within 24 hours. Sources: [Async requests](https://docs.x.ai/developers/advanced-api-usage/async), [Deferred chat completions](https://docs.x.ai/developers/advanced-api-usage/deferred-chat-completions).
- xAI pricing verified: `grok-4.6` is $2/1M input and $6/1M output below 200k prompt tokens, higher at or above 200k prompt tokens; `grok-4.20-multi-agent-0309` is listed at $1.25/1M input and $2.50/1M output below 200k, higher at or above 200k. Tool invocation costs may also apply. Source: [xAI pricing](https://docs.x.ai/developers/pricing).

## Recommended architecture

Build a Slack-native “Momentum Ops Agents” layer first:

1. One internal Slack app declared as an agent.
2. Five named operating modes behind that app: Chief of Staff, Sales/Leads, Client Delivery, Content/Marketing, QA/Systems. Treat these as routing/persona modes unless Momentum explicitly needs five separately mentionable bot users.
3. Slack thread = visible coordination surface. Use `agents.sessions.setStatus` so humans can see `processing`, `suspended`, `active`, or `closed`. The method supports `username`, `icon_emoji`, and `icon_url` display overrides with `chat:write.customize`, but I did not verify a Slack feature that creates five independent bot accounts from one app.
4. Retrieval path:
   - Use Real-time Search for broad workspace discovery and bottleneck scans.
   - Use `conversations.replies` only after search identifies a relevant thread.
   - Use `conversations.history` only for small recent windows around known channels.
   - Do not join every public channel; only join when the agent needs presence, events, or direct ongoing channel participation.
5. Durable work path:
   - Use OpenAI Agents API sessions for long-running work that needs persistence, resumability, tool use, local/self-hosted execution, or handoffs.
   - Use OpenAI Responses background mode for simpler single-job async tasks.
   - Use xAI/Grok API optionally for model comparison, X-search-heavy research, or if Grok Bot itself becomes the chosen product surface.
6. Action gates:
   - Read, summarize, draft, triage, route, and mark internal state automatically.
   - Stop for send/post/publish/spend/MFA/destructive/client messaging, matching the local AGENTS.md boundary.

## Access expansion without crossing lines

Lawful coverage options:

- Public channel discovery: install internal app with `search:read.public` and use RTS under a user/app context.
- Private channels: request user OAuth consent for `search:read.private` and related scopes; private access is per consenting user.
- Exact channel reads: use `conversations.history` with bot membership or user-token access; keep windows narrow.
- Public joining: use `conversations.join` only for channels where the agent should visibly participate or receive events.
- Enterprise-wide governance: if Momentum uses Enterprise Grid, make the app org-ready so a single user token can query accessible workspaces, subject to user/app access.

Avoid:

- Admin-style bulk export as a substitute for user-scoped agent context.
- Silent auto-joining all public channels just to increase read coverage.
- Long-lived local archives of raw Slack history when RTS can retrieve needed context on demand.

## Minimal implementation plan

Phase 1: Slack read-only bottleneck radar.

- Internal Slack agent app.
- Run separate RTS keyword searches for bottleneck terms such as `blocked`, `waiting`, `stuck`, `need approval`, `no response`, and `handoff` across public channels and any user-consented private surfaces. Do not rely on OR syntax in the local Slack connector path.
- Store only structured summaries: channel, permalink, timestamp, owner, blocker, next action, confidence, source query.
- Post only to a private ops review channel or DM, unless explicitly approved.

Phase 2: Dedicated employee agents.

- Create named Slack agent modes/personas backed by the same app and distinct instructions/state. If separately addressable `@Chief`, `@Sales`, etc. users are required, plan separate Slack apps/bot users or another verified Slack multi-identity route.
- Each agent owns a lane and keeps a lightweight durable state object.
- Use OpenAI Agents API sessions for lanes that need continued work, tools, and recovery.

Phase 3: Safe automation.

- Add approved write actions: reacji state, internal draft messages, reminders, task creation.
- Keep client-facing and external messages as draft-only until human approval.

Phase 4: Optional Grok Bot parity/benchmark.

- If the goal is to copy the Grok Bot product pattern, treat it as a product benchmark: named persistent bots, own runtime, status/presence, routines, approval stops.
- If the goal is to use xAI APIs, treat them as model/tool calls inside the same Slack architecture, not as the Slack session/orchestration layer.

## Product capability vs buildable architecture

| Need | Slack native | OpenAI | xAI/Grok | Recommendation |
|---|---|---|---|---|
| Slack-visible worker identity | One agent app can expose sessions and display overrides; separate @mention identities need separate apps/bot users unless another verified route exists | Supplies brain/runtime, not Slack UX | Grok Bot product has identity, API docs do not expose Slack sessions | Start with one Slack app and named modes |
| Broad public channel context | RTS `search:read.public` | Needs Slack tool wrapper | Needs Slack tool wrapper | Use Slack RTS |
| Private channel context | User consent + user token scopes | Needs Slack tool wrapper | Needs Slack tool wrapper | Consent-based only |
| Long-running work | Session status only, not compute | Agents API durable sessions/self-hosted executor | Deferred/async; Grok Bot product if adopted | OpenAI Agents API for custom build |
| Multi-agent work | Agent UX, not model orchestration | Agents API/subagents or Responses multi-agent beta | Grok multi-agent research beta | Use OpenAI for app-controlled agent work; test Grok selectively |
| Costs known from docs | Slack API rate tiers, not LLM cost | Category-level from overview here | Token pricing verified | Track per run; avoid raw-history replay |

## The lazy version that actually holds

Start with one Slack internal agent app, five named agent modes, Real-time Search for discovery, `conversations.replies/history` for exact evidence, and OpenAI Agents API only for the lanes that truly need durable execution. Do not build a second Slack ingestion pipeline yet. Do not auto-join every channel. Do not start with Grok Bot unless the desired product is specifically xAI’s managed Grok Bot, because its public product is not the same thing as the xAI developer API.

Skipped: custom Slack archive, all-channel joiner, bespoke multi-agent framework. Add them only if RTS plus targeted thread reads miss evidence that humans can confirm should have been accessible.

