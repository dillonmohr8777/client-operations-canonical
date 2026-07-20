# Integration map

## Target paths

| Package source | Phase 2 target | Integration note |
| --- | --- | --- |
| `src/app/globals.css` | `src/app/globals.css` | Merge tokens and component rules; preserve existing Tailwind directives or imports. |
| `src/app/login/page.js` | `src/app/login/page.js` | Confirm the Supabase client export and preserve the current post-login route. |
| `src/app/components/AppShell.js` | `src/app/components/AppShell.js` | No third-party UI or icon package required. |
| `src/app/dashboard/page.js` | `src/app/dashboard/page.js` | Replace sample state with Obaid's Supabase queries after UI approval. |

## Backend boundaries

The UI calls only the standard `supabase.auth.signInWithPassword` and `supabase.auth.signOut` methods. It does not create tables, alter middleware, change row-level security, or introduce an Anthropic dependency. `AppShell` also accepts an `onSignOut` override when the current application already centralizes session cleanup.

The dashboard fixture is deliberately local and visibly labeled. Obaid can replace `sampleClients`, `sampleStages`, and `sampleSummary` with server or client query results while retaining the state contract.

## Adapter checks before merge

1. Confirm whether `src/app/lib/supabase.js` uses a named or default export.
2. Confirm whether authenticated users land at `/dashboard` or another protected route.
3. Confirm whether the existing auth listener or middleware expects a router refresh after login.
4. Preserve any current audit or notification behavior around login failure.
5. Preserve any current audit, cache cleanup, or notification behavior around sign out by passing it through `onSignOut` when needed.
6. Confirm that the application root imports `src/app/globals.css` once.

## Verification gates

- Existing user can log in and reach the protected route.
- Invalid credentials produce a calm inline error without leaking account details.
- Signed-out users still redirect away from protected pages.
- Sign out clears the Supabase session, returns the user to `/login`, and leaves protected routes inaccessible.
- Sidebar collapses below 900 pixels and can be opened and closed with a keyboard.
- Login and dashboard work at 320, 768, 1024, and 1440 pixel widths.
- Reduced-motion mode removes nonessential motion.
- Ready, loading, empty, and error dashboard states are all reviewable.
- No real claimant records appear in fixtures or screenshots.
