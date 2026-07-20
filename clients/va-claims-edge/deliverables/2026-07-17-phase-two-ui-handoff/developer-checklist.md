# Phase 2 integration checklist

Use this checklist inside `vaclaims-dev/vace-platform`. Do not replace working authentication or middleware behavior without comparing it first.

## Before changing files

- Create a review branch from the current default branch.
- Record the current Next.js, React, Tailwind, and Supabase package versions.
- Confirm whether `src/app/lib/supabase.js` exports `supabase` as a named or default export.
- Confirm the current successful-login destination and the signed-out redirect.
- Record any analytics, audit events, notification behavior, or cache cleanup attached to login and sign out.
- Confirm that the root layout imports `src/app/globals.css` exactly once.

## Apply the handoff

- Copy the two approved assets from `public/` without recompressing or renaming them.
- Merge `src/app/globals.css` into the current stylesheet. Preserve existing Tailwind directives and application-level rules.
- Compare the existing login handler with `src/app/login/page.js`. Preserve functional behavior while applying the new structure and classes.
- Add `src/app/components/AppShell.js`. Pass the existing session cleanup function through `onSignOut` if the application already centralizes sign out.
- Replace the dashboard placeholder with `src/app/dashboard/page.js`.
- Replace all `sampleSummary`, `sampleClients`, and `sampleStages` fixtures with authorized Supabase results before production use.
- Map unresolved or missing values to an honest unknown, loading, empty, or error state. Do not infer claim status.

## Authentication verification

- A valid account reaches the protected dashboard.
- Invalid credentials show the generic inline error and do not reveal whether an account exists.
- The pending login state prevents duplicate submissions.
- Sign out clears the Supabase session and returns the user to `/login`.
- The sign-out button shows pending and recoverable error states.
- Browser back navigation cannot reopen protected data after sign out.
- Signed-out visitors remain blocked from every protected route by middleware.

## Product and accessibility verification

- Keyboard navigation reaches the skip link, menu, navigation, table links, and session controls in a logical order.
- Focus remains visible on dark surfaces.
- The mobile navigation opens, closes, and responds to Escape.
- Login and dashboard are checked at 320, 768, 1024, and 1440 pixel widths.
- Reduced-motion mode removes entrance motion without hiding content.
- Loading, ready, empty, and error dashboard states each render independently.
- No real claimant names, records, health data, credentials, or private identifiers appear in fixtures or screenshots.
- Every sample value is removed or remains visibly labeled sample in nonproduction review environments.

## Review branch acceptance

- Run the repository's existing lint, test, and production-build commands.
- Confirm there are no new browser console warnings or errors.
- Create a Vercel preview from the review branch.
- Test authentication and sign out against the intended Supabase environment.
- Share the preview for design and developer review before merging.
- Keep the current production deployment unchanged until the review is approved.
