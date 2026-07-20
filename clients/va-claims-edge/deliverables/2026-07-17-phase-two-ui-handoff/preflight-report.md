# Preflight report

## Confirmed locally

- The package contains the four requested Next.js target files and both approved brand assets.
- The logo and shield-ribbon SHA-256 hashes match the approved signup sources.
- Login retains the standard Supabase password sign-in boundary and a generic failure message.
- The application shell now includes a functional default Supabase sign-out path, an optional application override, a pending label, and an inline failure state.
- All image elements declare intrinsic dimensions to reduce layout shift.
- The product theme, token document, responsive preview, and production CSS now describe the same dark design system.
- Loading, ready, empty, and error dashboard states are present.
- Dashboard fixtures use generic sample labels and are visibly identified as sample data.
- Reduced-motion and reduced-transparency fallbacks are present.
- Keyboard focus styles, semantic headings, skip navigation, table headers, and current-location semantics are present.
- No external dependency was added without access to the real `package.json`.

## Intentionally not claimed

- The package has not been compiled against the private repository's exact Next.js and Tailwind versions.
- Authentication has not been exercised against the live Supabase environment.
- Existing middleware, analytics, audit events, and application-specific cleanup cannot be confirmed without repository access.
- No branch, pull request, Vercel preview, deployment, or external delivery has occurred.

## Required repository checks

Use `developer-checklist.md` after repository access is available. The highest-risk adapter checks are the Supabase export shape, redirect behavior, middleware enforcement, global stylesheet merge, and any existing sign-out cleanup.
