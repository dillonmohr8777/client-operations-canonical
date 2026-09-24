# Lane A research summary

Accessed: 2026-08-28  
Scope: public, business-associated franchise or local-office emails only. No outreach, account access, paywalled sources, LinkedIn-only records, or inferred email patterns.

## Result

- Retained 39 unique rows in `new-franchise-emails.csv`.
- Lowercase-email deduplication: 39 input rows, 39 unique emails, 0 duplicates.
- Retained rows by brand: Home Instead 15, Senior Helpers 17, Always Best Care 5, Home Helpers Home Care 1, BrightStar Care 1.
- `mx_status` is `not_checked` for every row; no DNS/MX check was run.

## Brands and source patterns attempted

### Senior Helpers

- Source pattern: first-party location pages under `https://www.seniorhelpers.com/{state}/{territory}/`, the `sitemap.xml` location inventory, `/meet-the-office/` team pages, and first-party local opening/news posts under `/resources/blogs/`.
- Exact scalable inventory inspected: `https://www.seniorhelpers.com/sitemap.xml` (345 two-segment location URLs and 187 `/meet-the-office/` URLs in the bounded pass).
- Retained 17 direct emails from Costa Mesa, Asheville, Eastern North Dakota, Stillwater, Lake Minnetonka, Inland Empire, Southwest Ohio, Madison, and Olympia pages/posts. The source text explicitly ties each email to a named owner, staff member, office, or caregiver-recruiting function.

### Home Instead

- Source pattern: first-party local franchise team page.
- Exact source: `https://www.homeinstead.com/home-care/usa/nc/mooresville-statesville/455/home-instead-about-us/`.
- Retained 15 emails because the page explicitly identifies each Statesville/Mooresville team member and role (owners, operations, HR, client care, recruiting, scheduling, and related staff).

### Always Best Care

- Source pattern: first-party location/contact pages under `https://alwaysbestcare.com/{territory}/`.
- Retained 5 direct office emails from the Denver/Littleton, Parkville, Middleburg Heights, Roseville, and Seattle location results where the page result included the local office phone and email.

### Home Helpers Home Care

- Source pattern: first-party local community announcement.
- Exact source: `https://homehelpershomecare.com/location/avalon-park-fl/community-blog/lori-williams-brings-home-helpers-home-care-to-avalon-park/`.
- Retained 1 email because the announcement names Lori Williams as the Avalon Park franchise owner and publishes the local business email and phone.

### BrightStar Care

- Source pattern: first-party local blog under `/locations/{territory}/about-us/blog/`.
- Exact source: `https://www.brightstarcare.com/locations/howard-county/about-us/blog/leveraging-artificial-intelligence-to-help-seniors-age-in-place/`.
- Retained 1 email because the Howard County post publishes Karen Holstein's local-agency RSVP email and office line.

### Other brands checked and not retained

- Visiting Angels, Right at Home, FirstLight Home Care, ComForCare, Amada Senior Care, and Homewatch CareGivers: bounded source checks found location directories/forms or corporate contact/pattern pages but no additional directly published local-office email that met all constraints in this lane.

## Rows dropped / validation notes

- Dropped Senior Helpers location/team pages with no directly published email (the sitemap inventory is useful for scale, but most pages expose only forms and phone numbers).
- Dropped generic corporate addresses such as `info@alwaysbestcare.com`; they were not tied to a specific franchise office.
- Dropped email-format examples from LeadIQ/Prospeo and all guessed first-name/last-name patterns.
- Dropped LinkedIn-only contact evidence and pages where the local territory or office association was ambiguous.
- No excluded-brand rows (CertaPro Painters, Synergy HomeCare, Mosquito Squad, Comfort Keepers, 1-800-PACKOUTS, The UPS Store) were added.
- Every retained row includes the exact public source URL, discovery date, and a note describing the direct association. Contact names are left as `Local office` or `Local office staff` where the public source published an office email but did not expose a full name in the captured source text.
