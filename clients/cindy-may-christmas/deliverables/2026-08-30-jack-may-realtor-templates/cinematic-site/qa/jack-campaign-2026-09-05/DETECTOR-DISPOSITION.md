# Impeccable detector disposition — Jack seller campaign / cinematic

Status: clean detector pass (`exit 0`) on 2026-09-05 for the private review artifact.

## Command and scope

```text
node C:\Users\dillo\.agents\skills\impeccable\scripts\detect.mjs --json cinematic-site/index.html cinematic-site/styles.css cinematic-site/refinements.css cinematic-site/script.js
```

The command was run from the template root. The clean JSON receipt is
`detector-cinematic-clean.json`; it contains an empty findings array.

## Narrow inherited-source exceptions

The shared detector config at
`..\..\.impeccable\config.json` (resolved template-root path:
`C:\Users\dillo\Documents\Codex\projects\client-operations\clients\cindy-may-christmas\deliverables\2026-08-30-jack-may-realtor-templates\.impeccable\config.json`)
contains only file-scoped value ignores for the inherited
`cinematic-site/styles.css`:

- `design-system-color=*` for the committed film palette literals (lines 110, 391, 410, 639, 775, 843, 931, 990, 1045, 1135, 1192, 1542, 1784).
- `design-system-font-size=*` for the committed baseline type declarations (lines 201, 301, 318, 347, 457, 475, 551, 602, 713, 755, 802, 813, 886, 960, 1015, 1023, 1059, 1096, 1105, 1160, 1179, 1330, 1350, 1358, 1364, 1379, 1385, 1393, 1418, 1435, 1439, 1443, 1864, 1871).
- `layout-transition=*` for the inherited service-card hover padding transition (line 871), retained because it is part of the approved interaction and is outside this refinement's scope.

These entries are scoped to `cinematic-site/styles.css`; no detector rule is
disabled project-wide and no exception applies to the changed
`cinematic-site/refinements.css` or `script.js`.

## Intentional changed-file tokens

The motion and image treatment in `cinematic-site/refinements.css` uses the
existing cinematic palette, type roles, and motion language recorded in the
owning template `DESIGN.md` and `.impeccable/design.json` sidecar. The sidecar
was not hand-edited. The changed refinement file produced no detector findings
before or after the inherited-source exceptions.

## Disposition

The detector gate is clean for the scoped targets. This is a narrow private
review disposition, not a claim that the inherited baseline has been rewritten;
future edits to `styles.css` should be reviewed without assuming these values
are universally acceptable.
