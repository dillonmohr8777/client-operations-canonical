# Integration-only detector exception

The manual Impeccable detector returned exit 2: 31 findings, zero critical findings, all in the existing dashboard entry page. The categories are nine color advisories, four all-caps labels, one cramped-padding finding, two font advisories, one side-tab accent, eight tiny-text findings, and six undersized-text findings. `integration-status.js` introduced no detector findings.

This change adds operational data wiring and source wording without changing CSS, palette, type, spacing, layout, or motion. These existing findings are covered by the user's explicit requirement to preserve the established dashboard direction and the source package's `qa/detector-exceptions.md`. The narrow exception applies only to that preserved markup; it does not authorize new style deviations or relax future accessibility work. No detector rule was disabled.

The real desktop and mobile page passed the bounded production inspection in `live-browser-check.json`. The detector result is retained as exit 2 with this explanation, not represented as a clean pass.

Final command from the dashboard source package: `npx impeccable detect --json public/index.html public/integration-status.js public/status.js`. Both JavaScript files have no findings. Exit 2 and all 31 existing HTML findings were reverified after the final source changes.
