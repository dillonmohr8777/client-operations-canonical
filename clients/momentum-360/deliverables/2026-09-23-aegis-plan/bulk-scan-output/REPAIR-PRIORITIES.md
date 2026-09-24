# NeedMomentum scan repair priorities

September23, 2026. Coverage: 90 discovered requested URLs resolved to 89 unique final pages; all captured successfully. 1,513 results are 17 checks per page. Public DOM captured in the authorized browser. Drafts only; findings do not establish traffic impact or Google-selected canonical behavior.

## 1. Canonical targeting — 13 pages

Eight pages point to /local-seo/: social media management, Facebook Ads, LinkedIn marketing, Microsoft Ads, AI marketing, AI SEO, AEO/GEO, and email marketing. Five point to /web-design/: technical SEO, ecommerce SEO, graphic design strategies, Shopify web design, and local SEO for lawyers.

These mismatches span different service topics and warrant the first CMS investigation. The exact old/new candidates and captured titles are in canonical-repairs.json. Confirm whether the page should be independently indexed before applying any self-canonical. Identify and fix the originating SEO field or shared template rather than injecting a second canonical.

## 2. Conversion links — five drafted repairs

link-repairs.json records the malformed homepage Instagram URL and four call-label/destination mismatches on local SEO, GBP management, About and Web Design. The Instagram replacement is supported by a clean link on the same page. Conflicting phone numbers need an authoritative routing decision; a visually different number may be intentional call tracking.

## 3. Heading structure — eight multiple-H1 pages

The SEO audit page already has a corrected unpublished draft29608. Other affected pages: Facebook/Instagram ad design, Amazon SEO, marketing brochure, gyms, real-estate SEO, automotive case study and office locations. Keep one meaningful page heading and assign section headings by structure. The gyms page needs a page-level heading rather than blindly preserving its first section title. Also review the 40 heading-level skips in context.

## 4. Shared layout defects —13 pages with duplicate IDs

Find the source widget/template for each repeated ID before changing it; preserve anchor, accordion and form associations. Do not globally strip IDs or patch only the rendered DOM. Group fixes by shared template to avoid editing the same defect on dozens of pages.

## 5. Review-only signals

Image dimensions, accessible-name/label candidates and third-party iframe titles are DOM heuristics. Confirm layout reservation/computed accessibility and widget ownership before treating them as defects. The scan does not measure Core Web Vitals, successful form delivery, HTTP indexing headers, robots.txt or ranking change. Query-string sharing links are excluded from malformed-URL counts.

## Next execution boundary

Apply verified metadata/template repairs in isolated WordPress staging or unpublished copies, capture before/after, then request release approval for the exact diff. The current source capture is not a WordPress export or a backup. Hosting restore, production endpoint and mail/CRM sandbox routing remain unresolved release prerequisites.
