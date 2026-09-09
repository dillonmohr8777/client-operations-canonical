# WordPress release checklist

## Site login

- Use Bluehost first: `https://www.bluehost.com/my-account/login`, user `AMICLEAN`, or Sign in with Google as `dillonmohr8777@gmail.com`.
- Unlock Bitwarden as `pollotharuler@gmail.com` and autofill on Bluehost only.
- Bluehost verify codes go to Corinne, same as 2026-08-20.
- Do not enter the Bluehost password on `https://ami-cleaning.com/wp-login.php`.
- After Bluehost is open, use the hosting WordPress entry, then continue the checks below.

## Prepublication

- Use the ten canonical slugs in `content-manifest.csv`.
- Upload the matching WebP as the featured image and set the exact alt text, caption and attribution.
- Preserve one H1 supplied by the post title; body sections begin at H2.
- Set the SEO title and meta description from each file’s frontmatter.
- Use AMI Commercial Cleaning Services as the organizational author unless the existing site has a different approved author convention.
- Do not add an image title attribute as a substitute for alt text.
- Keep all internal links in their contextual paragraphs.
- Open external CDC, EPA and OSHA citations in the same tab unless the site’s established accessible pattern clearly does otherwise.

## Structured data

- Confirm whether the active SEO plugin already emits `Article` or `BlogPosting` schema.
- Add FAQ structured data only once. Use the three visible questions and answers in each article; never mark up hidden or different FAQ copy.
- Include publisher name and logo only from verified site settings.
- Use the final WordPress featured-image URL and canonical article URL.
- Validate with Schema.org Validator and Google Rich Results Test. A valid result is eligibility, not a promise of a rich result.

## Accessibility and quality

- Confirm heading order, descriptive links and list semantics in the rendered page.
- Verify keyboard navigation and visible focus through the header, article links and CTA.
- Verify text contrast and that no image conveys required text.
- Test desktop and mobile for overflow, cropped captions and obscured controls.
- Confirm the featured-image alt field persists in the rendered HTML.
- Check browser console for errors.

## SEO release checks

- Canonical points to the live article URL.
- Article is indexable and included in the XML sitemap.
- Only one URL version resolves as canonical.
- SEO title and meta description are unique.
- Internal links return 200 and point to the intended AMI service or industry page.
- External citations return 200 and remain relevant.
- Request indexing after the page is final; record the release date and live URL in `publication-log.csv`.

