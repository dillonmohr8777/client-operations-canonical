# Public-link repair draft

**Status:** Review-only. No CMS content was changed and no repair is claimed live.

The draft uses the captured link arrays in `bulk-scan-pages.json` and the existing parts 1–4, 6–8 (73 page captures total; part 5 was not present). Each evidence locator gives the source capture, page URL, timestamp, and one-based `links[]` position.

| ID | Page | Captured label and current destination | Draft destination | Gate |
|---|---|---|---|---|
| LINK-001 | `/` | `Instagram` → `https://www.instagram.com/needmomentum/https://www.instagram.com/needmomentum/` | `https://www.instagram.com/needmomentum/` | Same-page clean Instagram href supports this exact replacement; review and click-test the CMS draft before any approved publish. |
| LINK-002 | `/local-seo-services/` | `CALL 215-297-6184` → `/free-marketing-audit/` | Unset. Candidate from label: `tel:215-297-6184` | Owner must confirm the intended number. The page also contains a `tel:2152976193` link. |
| LINK-003 | `/google-business-profile-management/` | `CALL 215-297-6190` → `/free-marketing-audit/` | Unset. Candidate from label: `tel:215-297-6190` | Owner must resolve the number: the same capture has two `tel:2152976193` links. |
| LINK-004 | `/about-us/` | `CALL: 215 297-6172` → `tel:2152976190` | Unset. Candidate only if the label is authoritative: `tel:2152976172` | Owner must choose between the displayed 6172 and linked 6190; if 6190 is intended, the label needs correction. |
| LINK-005 | `/web-design/` | `CALL: 215 297-6172` → `tel:2152976190` | Unset. Candidate only if the label is authoritative: `tel:2152976172` | Same ambiguity as LINK-004; owner confirmation required. |

## Evidence notes

- The malformed homepage Instagram link is at index 211 in `bulk-scan-pages.json`. The same capture has the clean account URL at index 6 and another clean account URL with a query string at index 229.
- LINK-002 is at index 195 in `bulk-scan-pages.json`; index 209 on that page has the same `CALL 215-297-6184` label linked to `tel:215-297-6184`. It is useful evidence, but the conflicting phone value elsewhere on the page means the final target remains owner-gated.
- LINK-003 is at index 195 in `bulk-scan-part-1.json`; that page's phone links at indices 8 and 266 dial 6193, while the CTA text says 6190.
- LINK-004 is at index 196 in `bulk-scan-part-8.json`; its page's index-8 link displays and dials 6172.
- LINK-005 is at index 196 in `bulk-scan-part-2.json`; its page's index-8 link displays and dials 6172.
- Facebook and LinkedIn share links embed the page URL in query parameters; those expected share destinations are not treated as duplicated-URL defects.
