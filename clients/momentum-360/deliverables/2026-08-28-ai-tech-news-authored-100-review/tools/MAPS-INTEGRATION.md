# Google Maps integration

The Authored 100 pages currently expose Google Maps directions links but do
not embed a map. The reusable helper in `google-maps-integration.mjs` adds one
map section immediately before each page footer without changing the page's
business-specific visual direction.

## Safe default

The helper uses Google's native `output=embed` route:

```text
https://www.google.com/maps?q=<verified-query>&output=embed
```

The resulting iframe is the actual Google Maps interface. No application key
is written to the static HTML. A direct Google Maps link remains visible below
the iframe and is also emitted inside `noscript` for browsers that cannot load
the embed.

Google's documented Maps Embed API (`/maps/embed/v1/...`) requires a valid
browser key and a billing-enabled project. The existing `GOOGLE_PLACES_API_KEY`
locator is for server-side Places enrichment and must not be reused in a
browser page. The local route is the DPAPI-wrapped
`%LOCALAPPDATA%\\Codex\\Secrets\\google-places-dillon-os.dpapi`; the GitHub
Actions route is the repository secret with the same environment name. Neither
value is read or emitted by this helper.

## Optional runtime upgrade

When a separately restricted browser key is authorized, pass a same-origin
endpoint to `--runtime-key-endpoint`, for example:

```powershell
node tools/google-maps-integration.mjs `
  --sites-root site/sites `
  --manifest selected-next25.json `
  --runtime-key-endpoint /.netlify/functions/maps-config `
  --write
```

The endpoint contract is `GET` JSON `{ "key": "..." }`. Store its value in a
deployment environment variable named `GOOGLE_MAPS_EMBED_BROWSER_KEY`; never
commit that value, put it in a brief, or place it in static markup. The helper
starts with the keyless native map, then upgrades the iframe only after a
successful same-origin response. Any endpoint failure leaves the native map
and direct link in place.

The browser key must be restricted to the exact deployed host and to the Maps
Embed API. It is a browser credential, not a secret server-side Places key.
No runtime endpoint is assumed or created by this helper.

## Applying a selected batch

The manifest may be an array or an object with `prospects`, `sites`,
`selection`, `rows`, or `items`. Each row needs a safe `slug`; the helper uses
the most authoritative available address, coordinates, Maps query, or
business/locality fields. If the row does not carry a location, an existing
Google Maps directions/search anchor in that page is decoded and used before
the business/locality fallback. A bare business name or route slug is held
rather than guessed. Existing `data-google-map` pages are skipped idempotently.
Pages without a `noindex` robots marker are held rather than changed.

Dry run first:

```powershell
node tools/google-maps-integration.mjs `
  --sites-root site/sites `
  --manifest selected-next25.json
```

Persist only after the dry-run report has the expected 25 slugs:

```powershell
node tools/google-maps-integration.mjs `
  --sites-root site/sites `
  --manifest selected-next25.json `
  --write
```

The process exits with code `2` when one or more rows are held. It never edits
the review manifest or Google Sheet.

## Verification

```powershell
node --test tools/google-maps-integration.test.mjs
```

The tests assert the native iframe URL, responsive and keyboard affordances,
noindex preservation, idempotence, missing-page holds, and zero static Google
API-key patterns.
