# VA Claims Edge Phase 2 UI handoff

This package translates the approved VA Claims visual direction into the four frontend surfaces requested before Phase 3.

## Approved visual source

The exact design source of truth is the initial signup sent for review earlier on July 17, including its original assets and live Netlify review build:

`https://va-claims-edge-design-sprint.netlify.app/`

The Phase 2 login and application shell intentionally preserve that build's Epilogue typography, ink and navy field, ivory logo plaque, brand-red actions, cyan focus accents, shield-ribbon artwork, grid ambience, spacing rhythm, and restrained motion.

## Included

- `src/app/globals.css`: locked visual tokens, responsive layout primitives, component states, and reduced-motion behavior.
- `src/app/login/page.js`: production-shaped login UI using the existing Supabase password-auth boundary.
- `src/app/components/AppShell.js`: responsive sidebar, topbar, skip link, and content shell.
- `src/app/dashboard/page.js`: summary cards, client table, and pipeline layout with explicit sample, loading, empty, and error modes.
- `public/`: the exact approved VA Claims Edge logo and shield ribbon assets from the signup source of truth.
- `preview/`: standalone visual review that never connects to Supabase and never stores form data.
- `design-system.md`: the implementation contract for Phase 3.
- `integration-map.md`: exact application order and known adapter checks.
- `developer-checklist.md`: branch, authentication, data-wiring, accessibility, and preview acceptance checks.
- `preflight-report.md`: confirmed local coverage and the claims intentionally withheld until repository access exists.
- `obaid-handoff-draft.txt`: an unsent Slack-ready handoff draft.

## Important boundary

The private source repository was not accessible to Dillon's currently authenticated GitHub account when this package was prepared. These files are integration-ready source, not a claim that the live repository was changed, committed, deployed, or delivered.

Before applying `page.js`, compare the existing Supabase client export with the import in this package and preserve any current redirect or session behavior. `AppShell` includes a standard Supabase sign-out path and accepts an `onSignOut` override for existing application cleanup. No database schema, middleware, credentials, or protected-route logic is changed here.

## Local review

Open `preview/index.html` in a browser. Use the preview controls to switch between login, dashboard, loading, empty, and error states.

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\verify-package.ps1
```

## Recommended integration order

1. Create a branch from the current Phase 2 default branch.
2. Merge the token layer into the existing `src/app/globals.css` without deleting framework directives.
3. Add `src/app/components/AppShell.js`.
4. Replace the login and dashboard placeholders while preserving the existing Supabase client import and routing behavior.
5. Test authentication success, authentication failure, protected redirects, keyboard navigation, mobile layout, reduced motion, and all dashboard states.
6. Have Obaid connect real queries only after the component contract is accepted.

## Data rule

The dashboard values in this handoff are visibly labeled sample data. They are not client metrics and must be replaced by Supabase data or an honest loading, empty, or error state before production use.
