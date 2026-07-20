# M360 Orbit Accessibility Audit

Audit date: July 9, 2026  
Target: WCAG 2.2 Level AA  
Scope: `site/index.html`, `site/styles.css`, and `site/app.js`

## Outcome

The release passed the automated HTML scan with zero findings after remediation. Keyboard, responsive, reduced-motion, semantic structure, focus treatment, form labels, status announcements, and touch-target behavior were also reviewed manually.

## Scan

- The project accessibility scanner inspected the production HTML for image alternatives, form names, ARIA conflicts, landmarks, heading structure, skip navigation, and status messaging.
- Initial result: 10 findings. Four landmark/background findings were parser false positives caused by scanning the CSS file as HTML; the remaining issues were remediated.
- Final result: 1 file scanned, 0 issues.
- The CSS contrast helper found no statically extractable foreground/background pairs because the design primarily uses custom properties and layered gradients. Critical pairs were therefore reviewed against their rendered backgrounds.

## Fixes made

- Replaced pseudo-tab semantics on the roster filter with native toggle buttons and `aria-pressed` state.
- Added explicit, visible labeling for the plan email field.
- Removed an unnecessary focusable honeypot from the interactive question form and labeled the hidden Netlify bot field.
- Added explicit `aria-live="assertive"` behavior to the error region.
- Added Escape-to-close behavior and focus restoration for the mobile navigation.
- Increased roster action touch targets and added anchor scroll offsets for the fixed header.
- Preserved visible focus rings and reduced-motion support.
- Made reveal content visible by default so a script failure cannot hide core page content.

## Manual verification

- Semantic page structure includes header, two labeled navigation regions, one main landmark, sections, and footer.
- The first focusable control is a skip link targeting the main content.
- All interactive controls are native links, buttons, inputs, selects, textareas, details, or summaries.
- Forms have programmatic labels, clear error/status regions, autocomplete hints, and no color-only instructions.
- Mobile navigation opens and closes with the trigger, closes after link activation, and closes with Escape while returning focus.
- Responsive renders were checked at 1440px, 390px, and 320px; no mobile clipping remains.
- Motion is disabled when `prefers-reduced-motion: reduce` is active.
- Focus indicators use a high-visibility cyan outline with spacing from the focused element.
- Primary buttons and navigation controls meet or exceed the WCAG 2.2 minimum target-size expectation.

## Evidence

- Automated command: `python C:\Users\dillo\.codex\skills\a11y-audit\scripts\a11y_scanner.py site\index.html --json`
- Test command: `node --test`
- Syntax commands: `node --check site\app.js`, `node --check netlify\functions\ask.mjs`, `node --check lib\agents.mjs`
- Responsive captures: `artifacts/m360-desktop.png`, `artifacts/m360-playwright-390.png`, `artifacts/m360-playwright-320.png`, `artifacts/m360-command-390.png`, `artifacts/m360-roster-390.png`, and `artifacts/m360-plans-390.png`

## Residual validation

Before any major future component or color-system change, rerun the automated scan and manually test the changed workflow with a keyboard and a screen reader. A third-party automated scanner can supplement this audit after deployment, but it should not replace manual testing.
