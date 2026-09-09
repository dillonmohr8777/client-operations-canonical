# Momentum Prospect Radar source-proof handoff — 2026-09-05

Status: **7 ready / 3 slots not defensibly fillable**. This is a read-only source
proof; no queue, registry, site, outreach, or deployment mutation occurred.

## Scope and evidence

- Live radar snapshot: `https://momentum-prospect-radar.netlify.app/` — 1,346 rows,
  216 current `queued_build` rows, checked 2026-09-05.
- Initial requested batch: `automation/radar-daily/batches/2026-09-05.json`
  (20 rows). Replacements came only from the live `queued_build` pool.
- Dedupe inputs: `automation/radar-daily/built-registry.json` (nested `.built`),
  `prior-build-index.json`, 238-business manifest, `12_Brain/state/radar/image-briefs`,
  local site-build paths, and `sources/sheet-dedupe.json` (Google Sheets readback,
  checked 2026-09-05T15:52:02Z). Public Slack search returned no corroborating
  result; local Slack Evidence Log was inspected.
- Identity key is `domain:{registrable-domain}`. “Ready” requires a current
  official source plus a reusable exact logo from that source or an exactly
  matched official social account.

## Source-complete substitutions

| Proposed slug | Radar identity / queue row | Official source and factual copy available | Exact logo provenance (download check) | Dedupe result |
|---|---|---|---|---|
| `bimbo-bakeries-usa` | `domain:bimbobakeriesusa.com` · Bimbo Bakeries USA · Bethlehem, Northampton County | [Official site](https://bimbobakeriesusa.com/) and [About Us](https://bimbobakeriesusa.com/about-us): U.S. commercial bakery; bread, bagels, buns, English muffins and sweet baked goods; Grupo Bimbo relationship; people/operations copy. | [Official BBU logo](https://bimbobakeriesusa.com/sites/default/files/2021-05/bbu-logo.png) · PNG 142×75, SHA-256 `DBD3039BA305116B29D9CC2BCB370040685ABD4915E14A0B5C0B747446E47C3B`; RGBA/transparent, exact mark, no transformation. | No matching `.built` key, prior index, Sheet row, manifest/site path, or image brief found. |
| `shady-maple-rv` | `domain:shadymaplerv.com` · Shady Maple RV · East Earl, Lancaster County | [Official site](https://www.shadymaplerv.com/) and [About Us](https://www.shadymaplerv.com/about-us): family-owned RV sales, service, parts, accessories and rentals; Marvin Weaver family acquired it in 2007; 160 Ewell Road, East Earl PA 17519; 717-351-0087. | [Official Shady Maple RV logo](https://assets.interactcp.com/shadymaplerv/images/logo.png) · PNG 401×187, SHA-256 `098C7003F4CB58307FB9E0B57E70AD580C0E0598E548E7A0F7AD7F3E1E795919`; palette transparency present, exact mark, no transformation. | No matching `.built` key, prior index, Sheet row, manifest/site path, or image brief found. |
| `afc-urgent-care-warrington` | `domain:afcurgentcarewarrington.com` · AFC Urgent Care · Warrington, Bucks County | [Official Warrington clinic](https://www.afcurgentcare.com/warrington/): walk-in urgent care, cold/flu, allergies, onsite labs, UTI/STD testing, physicals, pediatric care and X-ray/imaging; 781 Easton Rd, Warrington PA 18976; 215-874-3209. | [Official AFC mark](https://www.afcurgentcare.com/img/upload/logo-light-blue-2-1.png) · PNG 132×132, SHA-256 `CA8D3A6CB2DED28C0EF7BADFBED889C5BB064B671984B07ADBAFA041A6CAEB90`; palette transparency present, exact corporate mark, no transformation. | No matching `.built` key, prior index, Sheet row, manifest/site path, or image brief found. Corporate/franchise logo is explicitly labelled. |
| `trivalley-primary-care` | `domain:trivalleypc.com` · Trivalley Primary Care · Sellersville, Bucks County | [Official Pennridge page](https://www.trivalleypc.com/pennridge-office/) (Cloudflare 403 in direct fetch; official WordPress API page was 200, modified 2024-12-30): primary-care group, community offices; Pennridge office 1105 Bethlehem Pike Unit B3, Sellersville PA 18960. | [Official TriValley logo](https://trivalleypc.com/wp-content/uploads/2023/10/tvpc-crisp-logo2023.png) · PNG 422×241, SHA-256 `1D1838FC180E85A412B5C0353A253E2BBBC0D6265DDF13BD82D3418B7180726D`; RGBA/transparent, exact mark, no transformation. | No matching `.built` key, prior index, Sheet row, manifest/site path, or image brief found. Evidence is live-page/API-backed with a Cloudflare caveat. |
| `ungerer-and-company` | `domain:ungererandcompany.com` · Ungerer & Company · Bethlehem, Northampton County | [Official contact page](https://www.ungererandcompany.com/contact/) and [official LinkedIn company profile](https://www.linkedin.com/company/ungerer-%26-company): privately owned fragrance/flavor business, family owned since 1893; design/development and manufacturing; Bethlehem facility 110 North Commerce Way, Bethlehem PA 18017. | [Exactly matched official LinkedIn logo](https://media.licdn.com/dms/image/v2/C560BAQFajPdbkDRI0A/company-logo_200_200/company-logo_200_200/0/1631315872955?e=2147483647&v=beta&t=22qId40Vc8uX-JtYG8VOJWr7aEoQoG4zgwQqIwp3ygg) · JPEG 200×200, SHA-256 `DD8EA527CAE0867F253FC4530FBFF98E87DD81B6576962A5C828D3F1099F6628`; white-background raster, exact social avatar, no transformation. | No matching `.built` key, prior index, Sheet row, manifest/site path, or image brief found. Official site returned 202, so logo/copy eligibility rests on the exact official LinkedIn profile plus official contact-page result. |
| `d-t-auto-body` | `domain:dandtautobody.com` · D&T Auto Body → D & T Automotive Group · Philadelphia (legacy queue row has blank city) | [Current official site](https://dtautomotivegroup.com/): collision repair, pre-accident restoration, rental coordination and cosmetic services; 6019 Baynton Street, Philadelphia PA 19144; 215-843-2111. The old queue domain is ParkLogic; same business identity is carried by the current D&T site and matching name/address/phone. | [Official D&T Automotive Group logo](https://img1.wsimg.com/isteam/ip/d505a34b-288c-4d33-bd29-24ce3bf6c5b8/NEW%20LOGO%202020%20(1).png) · JPEG payload 500×500, SHA-256 `B5B69A243408CE01656B773B97FF60FCFC3A183BA1EC31C21375742E103072FC`; black-background raster, exact mark, no transformation. | No matching `.built` key, prior index, Sheet row, manifest/site path, or image brief found. Alias and parked-domain caveats must remain attached. |
| `keystone-electronics` | `domain:keyelectron.com` · Keystone Electronics Inc. · York, York County | [Current official site](https://www.keyelectro.com/) and [official LinkedIn profile](https://www.linkedin.com/company/keystone-electronics-inc): ISO/custom electronic assembly; electro-mechanical, cable/harness, PC-board and contract work; 2315 S. Queen Street, York PA 17402; 717-747-5900. Official LinkedIn bridges the old queue domain `keyelectron.com` to the current site. | [Official Keystone logo](https://www.keyelectro.com/content/keystone_electronics_logo.png) · PNG 828×174, SHA-256 `FF82DF4B7EBDC77C21DB5C2F99A1EF6AEE3EDC29D6070CBD4ECF902B6E6EB935`; RGBA/transparent, exact mark, no transformation. | No matching `.built` key, prior index, Sheet row, manifest/site path, or image brief found. Alias bridge is explicitly labelled. |

## Why the requested ten was not reached

The following live candidates were tested as replacements but fail at least one
hard gate. They remain held or excluded and are not source-ready handoffs:

| Candidate | Classification / blocker |
|---|---|
| Forrester Lincoln (`forresterlincoln.com`) | **hold — `NO_RECOVERABLE_EXACT_LOGO`**. Official dealer copy is rich and current, but only branded backdrop/dealer imagery was recoverable; no standalone exact logo asset or exactly matched official social logo. |
| Nathan Bean Contracting LLC | **hold — `NO_EXACT_LOGO`**. Official Lnk.Bio/social profile exists, but the avatar is a photo collage, not a logo. |
| The Village II (`thevillageii.com`) | **hold — `IDENTITY_REBRAND_OR_LOGO_MISMATCH`**. Current source is Soricks Fine Jewelers with a different mark; no defensible exact identity match. |
| Hollywood Nails | **hold — `NO_EXACT_LOGO`**. Official WordPress source has service/location copy but no reusable logo; other same-name pages are wrong-market. |
| Canton Building Supply | **hold — `NO_EXACT_LOGO` + `SOCIAL_LOGO_UNVERIFIED`**. Official page is sparse/generic and does not carry a defensible identity mark. |
| Emergency Rooter Services | **hold — `OG_CARD_ONLY`**. Official site exposes an OG card with phone/address, not a reusable exact logo. |
| Go Vertical | **hold — `IDENTITY_MISMATCH` + `STALE_OR_CLOSED`**. Current source is an Upstate SC residential developer; Philadelphia indoor gym identity is stale/closed. |
| Ming’s Chinese | **do_not_pitch — `DUP_PRIOR_IMAGE_BRIEF`**. Current official logo/source exists, but `12_Brain/state/radar/image-briefs/ming-s-chinese.json` is a prior record. |
| Plastic Surgery Solutions | **do_not_pitch — `DUP_PRIOR_SHEET`**. Current official source/logo exists, but Sheets rows `BUSINESSES 180`, `JESSE 150`, `Cleared133 78`, and `Superseded138 125` are prior records. |
| Advanced Air Services LLC / Casey Williams, DMD / F.M. Berkheimer Inc / Nolt’s Auto Parts #2 | **do_not_pitch — `DUP_PRIOR_BUILD`**. Nested `built-registry.json.built` contains each as `seed-first-20` (2026-09-02/03). |

Additional initial-20 rows (Anthony Gueriera, B-N-B-N, P&C Insurance, Rice Rice,
Ward Insurance, Centurion Construction, E&S Autoparts, Jarman Sales, Ansaris
Pharma, Havercrown Dental, 4/4 Architecture, A New Dawn, Advanced Specialty
Flooring, Allure, Always Dental, Andorra Family Dentistry, Attitude Alley, Big
Head Transport, Bray Auto and Coco Nails) were not promoted because their current
official source/logo gate failed or a prior Sheet/build/image-brief record was
found; they are not silently substituted.

## Duplicate and freshness conclusion

- The seven ready identity keys are unique within the current queue and absent
  from the current nested built registry, prior-build index, 238-business manifest,
  live Sheet dedupe readback, local site-build paths, and image-brief directory.
- Snapshot-only `eligible-candidates.json` is not authoritative for dedupe: its
  apparent no-prior/logo-ready rows were reconciled against current Sheets and
  filesystem records before selection.
- Evidence is current as of 2026-09-05 except where explicitly labelled
  Cloudflare/parked-domain/official-social alias caveat. No external action was
  taken.

