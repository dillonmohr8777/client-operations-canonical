# Obaid Phase 2 UI handoff

- Observed: 2026-07-17
- Source: exact VA Claims development handoff supplied by Dillon and verified in the active client Slack channel
- Client: VA Claims Edge
- Environment: live Phase 2 application on Vercel, backed by Next.js, Tailwind CSS, Supabase, and protected authentication routes

## Requested UI work

1. Replace the functional login placeholder with the approved VA Claims visual treatment.
2. Lock the colors, typography, spacing, motion, and reusable component rules before Phase 3.
3. Design the authenticated application shell, including the sidebar, topbar, and page layout.
4. Replace the dashboard placeholder with stat cards, a client table, and a pipeline structure that the developer can connect to Supabase.

## Integration map

- Login: `src/app/login/page.js`
- Dashboard: `src/app/dashboard/page.js`
- Shared components: `src/app/components/`
- Global tokens and styles: `src/app/globals.css`
- Existing data client: `src/app/lib/supabase.js`

## Current access state

The live application is reachable and redirects unauthenticated visitors to the login page. The private source repository is not accessible to the currently authenticated Dillon GitHub account, so safe local implementation can proceed but direct repository integration, commit, deployment, or delivery remains gated on access and approval.

The Anthropic integration is not required for this UI milestone and is excluded from the package.
