# Detector result and bounded exceptions

The installed Impeccable 4.1.1 manual script returned `[]` with an explicit DEGRADED notice: its HTML parser modules were unavailable. This is not a clean detector pass.

The already available `npx impeccable detect --json index.html styles.css app.js status.js` CLI (4.0.1) completed the fuller static parse. Its output is saved in `detector-npx.json`: **31 warnings, zero critical findings**. The exact detector process exit number was not separately captured because the shell subsequently read its output file; no exact exit code is claimed.

The warnings are addressed by narrow, source-located exceptions rather than suppressing the detector:

- **8 contrast warnings:** static selector evaluation reports dark-muted or bright teal on white. These are dark-surface metadata and state colors in the header, rail, overview, and discovery area at the inspected screen sizes. Browser-rendered axe checks report zero contrast violations on both desktop and mobile. Screen screenshots confirm their actual dark surface. This does not certify a print layout; the print stylesheet has not had a dedicated visual review.
- **20 tiny-text warnings:** 10px and 11px text is restricted to supplementary metadata, question ownership labels, timestamps, status annotations, and source captions. Main actionable copy uses 14–15px with standard line height. These compact labels are an intentional density exception to the generic detector body-text floor; the report does not claim every text element is 14px.
- **1 undersized UI text warning:** the mobile snapshot timestamp is 10px. It is a noninteractive secondary time label, with the important operating state rendered in a much larger heading. This is the same bounded metadata exception.
- **2 cramped-padding warnings:** the financial definition table uses padded cells aligned to an enclosing border; adding outer padding would break the tabular rules. The rail's divider is a structural boundary, while children receive their own inset. Visible rows, controls, and focus rings are spaced correctly in the recorded screenshots.

No detector rule was disabled. These exceptions apply only to this frozen deliverable and should not be copied as universal design policy. Independent QA owns the final verdict; the maker's checks are evidence, not self-certification.
