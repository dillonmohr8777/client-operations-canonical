# Momentum law-firm local SEO audit builder

## Outcome

This is the canonical reusable source for Mac's law-firm one-pager concept. It closes the documented gap in the earlier prototype: the website check now performs a bounded public-page audit instead of only changing template copy.

## Included

- Audit and ranker presentation modes.
- A server-side public website check with SSRF protection, redirect limits, timeout, and response-size bounds.
- Technical, search, local-relevance, contact, and structured-data findings.
- Local-pack screenshot upload that stays in the browser and appears in the PDF preview.
- Letter-size print/PDF output.
- Explicit no-guarantee ranking language.
- Mobile, loading, empty, error, and success states.

## Local verification

```powershell
npm install
npm run check
npm test
netlify dev
npm run test:browser
```

Open the Netlify Dev URL, run a check against a public website, then use Download PDF.

## Review draft

The isolated Netlify draft is available at:

`https://6a5b063b633e4533b536ff03--momentum-onepager-builder.netlify.app`

This draft does not replace the current production URL.

## Boundaries

- No Google Business Profile is read or changed.
- No CRM record, email, Slack message, ad, or prospect contact is created.
- Uploaded screenshots remain in the browser session.
- This source has not replaced the existing public Netlify site.
- A production deployment requires explicit approval and a verified rollback target.
