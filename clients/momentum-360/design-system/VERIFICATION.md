# Foundation verification

September 4, 2026, America/New_York. Local review release, version 0.1.0.

## Source and token checks

`node scripts/build-system.mjs --check` validates generated data against the current source files. The output tracks 12 source files, six exact asset hashes, seven named surfaces, and three generated profiles. Nine selected semantic text combinations pass the 4.5:1 target. The primitive logo-blue/white combination is 4.23:1 and is explicitly excluded from normal-size text usage in the new adapter and proof.

The WordPress output is a palette fragment in the documented version 3 format, not an installed theme or a verified production configuration. The CSS defines scoped variables only. Independent review ran the installed mechanical detector on the new implementation and reported no findings; this does not constitute browser QA for either production site.

## Native presentation proof

| Check | Result |
| --- | --- |
| Slides | 8 |
| Slides with fade transitions | 8 |
| Native entrance effects | 82 |
| Editable text shapes | 72 |
| Native tables | 1 |
| Static footer/page shapes | 13 |
| Animated static shapes | 0 |
| Source-note blocks | 8 |
| Fit warnings | 0 |
| Maximum entrance envelope | 1.215 seconds |
| PowerPoint opening | Passed, hidden window mode |
| Rerun integrity | Two reapplications preserve every package entry's contents |
| PowerPoint opening after reruns | Passed, hidden window mode |
| Visual inspection | All 8 rendered slides inspected; one opener subtitle fix confirmed |
| Reference exports | PDF and 8 PNG files |

See `evidence/motion-proof-verification.json`, `evidence/motion-proof-build.json`, and `evidence/motion-proof-visual-review.json` for machine receipts and the final PPTX hash.

This checks native timing and PowerPoint acceptance plus resting layout. Slideshow/video playback was not recorded. Compatibility in Keynote, Google Slides, and browser presentation viewers remains unverified.

## Installed animation fix

The proof found that the old transition-removal expression stopped at the nested fade element, leaving an orphaned transition closing tag when a deck was processed again. The installed `C:/Users/dillo/.claude/skills/client-deck/scripts/choreograph.py` received a two-line correction: bound the opening transition tag when removing it, and report zero effects when direct `--style none` writes no object timeline.

The adjacent `scripts/test_choreograph.py` standard-library regression covers three styles across five initial transition forms, including repeated rewrites. All 15 subcases pass. The real deck also passes repeated package-content comparison and PowerPoint opening. The fix applies on the next invocation of the installed deck animation engine; no Codex restart is required. Shared deck defaults and other installed skill files were preserved.

The earlier failed disposable copy is retained only as diagnostic evidence, with an `.invalid-pptx` extension under the diagnostics directory. It is not the presentation deliverable. The proof adds its native table last to avoid an observed table/next-shape ID collision in the installed generator; unique shape IDs are checked. That broader third-party generator issue was not refactored in this release.

## Scope and remaining work

The backend/access map is evidence-backed, and the requests are locally drafted. Current WordPress membership, active themes/builders, staging availability, and global-template permissions remain unverified. Public browser/HTTP checks met the sites' security challenges. No attempt was made to solve those challenges, change permissions, send a request, alter a production site, or deploy this system.

The next production design step is authenticated source extraction and one representative staging-page implementation. Corporate Momentum 360 website tokens, a full component migration, commercial sales-deck sign-off, and additional client profiles remain outside this completed local foundation.

## Independent review

Final independent confirmation passed with no unresolved material findings. It confirmed the current-user skill-path resolver, all 12 source hashes, nine contrast pairs, the installed two-line fix and its 15 regression subcases, resolved rerun evidence, the final presentation hash, and agreement between this document and the machine receipts. The reviewer inspected all eight rendered slides in the initial pass; unchanged visuals were not redundantly rerendered during confirmation.
