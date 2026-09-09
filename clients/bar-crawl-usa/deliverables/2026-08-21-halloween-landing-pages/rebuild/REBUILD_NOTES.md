# Bar Crawl USA Halloween Landing Page Rebuild

## Scope

Ten WordPress drafts, IDs 16601 through 16646, are being rebuilt for Atlanta, Cleveland, Cincinnati, Columbia, Greenville, Portland, St. Pete, Macon, Roswell, and Sarasota. Dillon authorized publication of this exact ten page set on August 26, 2026 after final quality assurance.

## August 26 layout decision

Atlanta, Cleveland, Cincinnati, Columbia, and Greenville use the established 2026 Tacos and Tequila campaign rhythm: centered headline, local hook, decisive ticket action, real event photography, narrative modules, and a visible FAQ finish.

Portland, St. Pete, Macon, Roswell, and Sarasota each use a distinct composition while staying inside the Bar Crawl USA navy, white, local accent, real photography, and direct response system.

All visible copy is generated without dash punctuation. Old event posters with stale dates were removed from hero placement. The pages use current attendee photography and verified media library assets instead.

## 2026 cross-reference

The current `page-sitemap.xml` was reviewed on August 21, 2026. Ten comparable 2026 city campaign pages were then inspected through the public WordPress REST API:

- Atlanta Taco and Tequila, page 16022
- Cleveland Taco and Tequila, page 15831
- Cincinnati Taco and Tequila, page 15706
- Columbia Taco and Tequila, page 15339
- Greenville Taco and Tequila, page 15320
- Portland Taco and Tequila, page 15379
- St. Petersburg Taco and Tequila, page 15366
- Macon Taco and Tequila, page 15708
- Roswell Taco and Tequila, page 15344
- Sarasota Taco and Tequila, page 15374

Those pages consistently used four narrative headline modules, four images, and a visible FAQ section. The Halloween rebuild preserves the proven narrative rhythm while improving the information architecture to nine sections: hero and answer, quick facts, edition decision, ticket value, route, proof gallery, arrival planning, costume and group guidance, FAQ, related discovery, and a final action.

## Content and media quality floor

- 648 to 777 visible words per page before site header and footer content.
- Nine substantive `<section>` elements per page.
- One unique H1 and five visible FAQs per page.
- Three city-relevant media-library photographs per page, including a unique hero.
- No browser screenshots or composite screenshots are used as page imagery.
- City hub, Halloween theme hub, official event page, and one authoritative local planning resource are linked.
- Visible FAQs match the included FAQPage JSON-LD; breadcrumb JSON-LD matches the page hierarchy.

## Source corrections locked into the copy

- Atlanta Midtown remains clearly marked as pending because no verified 2026 Halloween record is public. No Bubbles & Bites facts are reused.
- Lakewood uses the confirmed October 31 headline date, not the stale October 25 sentence in the source body.
- Portland keeps the 4 PM to 10 PM crawl window separate from the 11 PM Porthole after-party.
- Sarasota states the 3 PM to 6 PM registration window and 10 PM after-party without inventing a single full-event operating window.
- Non-Cincinnati pages contain no copied Cincinnati sentence.

## WordPress implementation contract

Each generated fragment is designed for one Elementor HTML widget or equivalent Custom HTML block inside the existing WordPress page shell. AIOSEO title and meta description must be copied from `pages.json`. Publish only the ten exact page IDs in this packet, then verify the live page, sitemap, links, images, and mobile layout.

`prepare-publication.mjs` generates `publication-payloads.json` for the exact ten IDs. Every payload preserves the page as a draft, writes the fragment into a native Elementor HTML widget, sets the page title and slug, and hides the duplicate theme title. Production execution must update and preview the drafts first. Change status to `publish` only after the authenticated draft readback proves the correct ID, slug, title, content, Elementor data, images, and links.
