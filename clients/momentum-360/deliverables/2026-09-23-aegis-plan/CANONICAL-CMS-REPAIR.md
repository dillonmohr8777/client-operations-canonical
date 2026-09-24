# Canonical source repair — September 23, 2026

- Confirmed on original WordPress page27496 (AI SEO Marketing): Yoast SEO > Advanced > Canonical URL explicitly stores `https://www.needmomentum.com/local-seo/`.
- Original permalink is `https://www.needmomentum.com/ai-seo-marketing/`. This confirms the rendered mismatch comes from an explicit page SEO field for this sample; do not infer the same storage source for all 13 pages without checking.
- Used the existing Copy to a new draft action; created draft29610. Review title: AI SEO Marketing — Aegis Canonical Review Draft.
- Changed only the review title and draft canonical to `https://www.needmomentum.com/ai-seo-marketing/`.
- Save Draft returned “Page draft updated.” Reloaded editor readback shows Status: Draft and the corrected canonical. Original27496 was not updated or published.
- Review: https://www.needmomentum.com/wp-admin/post.php?post=29610&action=edit
- Before release, confirm intended independent indexation, preserve original permalink, apply only the approved metadata change to original27496 and read back one canonical in public HTML. Do not publish this duplicate page as a new public URL.
- Other12 candidates remain local repair records in bulk-scan-output/canonical-repairs.json. Their individual CMS field sources remain unverified.

## September24 authorized production correction
Original27496 now has the self-canonical https://www.needmomentum.com/ai-seo-marketing/ . WordPress save, persisted field and rendered browser readback passed. Title/H1/robots unchanged; duplicate29610 remains unpublished. Before value and rollback are in CANONICAL-27496-RELEASE.md. Anonymous fetch meets the host challenge202; crawler-visible cache state remains unverified.
