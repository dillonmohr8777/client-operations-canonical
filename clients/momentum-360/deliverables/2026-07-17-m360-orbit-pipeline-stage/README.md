# M360 Orbit

M360 Orbit is Momentum 360's 19-specialist AI marketing command center.

Canonical live app: https://m360-orbit-deep-pipeline.netlify.app/

This workspace contains:

- `site/` — the redesigned static product and lead-generation page
- `netlify/functions/ask.mjs` — the specialist router and OpenAI Responses API multi-agent function
- `lib/agents.mjs` — the canonical 19-agent roster, routing rules, and starter playbooks
- `lib/knowledge.mjs` — the deep operating contracts, evidence rules, handoffs, and approval gates
- `PRODUCT.md` and `DESIGN.md` — the durable product and visual-system context
- `test/` — router and function fallback tests
- `docs/BUSINESS_PLAN.md` — positioning, pricing, unit economics, GTM, and 90-day plan
- `docs/BRAND_GUIDELINES.md` — logo, color, typography, voice, and product UI rules
- `docs/SALES_PLAYBOOK.md` — demo, qualification, objections, and outbound scripts
- `docs/ACCESSIBILITY_AUDIT.md` — WCAG 2.2 AA scan, fixes, and responsive evidence
- `docs/RELEASE_REPORT.md` — final production deployment and live verification evidence
- `.agents/marketing-context.md` — shared product-marketing foundation
- `source-recovery/` — preserved copy of the previous live site and public brand assets

## Product identity

- Name: **M360 Orbit**
- Tagline: **Every angle. One next move.**
- Promise: 19 specialist agents, one command center, and a human team when it is time to execute.

## Local verification

```powershell
npm test
npm run check
```

To run the full Netlify function locally:

```powershell
npx netlify dev
```

The app has an evidence-safe deep-plan fallback when `OPENAI_API_KEY` is not configured. It never presents search-engine snippets as verified live research.

## Environment variables

Configure these in Netlify, never in committed files:

- `OPENAI_API_KEY` — required for live model responses
- `OPENAI_MODEL` — optional; defaults to `gpt-5.6`
- `SAFETY_SALT` — optional salt used to hash a stable abuse-prevention identifier

## Deployment

`netlify.toml` publishes `site/`, deploys `netlify/functions/`, maps `/api/ask`, and sets security headers.

```powershell
npx netlify deploy --build --prod
```

Before production deployment:

1. Confirm the CLI is linked to the existing `momentum-360-agents` Netlify project.
2. Confirm `OPENAI_API_KEY` exists in the site's environment.
3. Run the test and syntax-check scripts.
4. Verify one prompt from each of the four squads.
5. Confirm the Netlify `orbit-lead` form appears in the Forms dashboard.
6. Connect the saved-plan lead flow to HubSpot after the approved form/portal IDs are available.

## Source and privacy notes

- The public preview rejects short/oversized input, supports a server-side trap field, and asks users not to submit confidential data.
- Model responses are sent with `store: false`.
- Complex requests may coordinate up to three additional specialists through the Responses multi-agent beta; the primary specialist owns the public final answer.
- If the beta is unavailable, the function retries through the standard single-agent Responses path.
- The API key is used only server-side.
- Generated output is escaped before limited Markdown rendering.
- The corporate Momentum 360 logo is preserved without alteration.
