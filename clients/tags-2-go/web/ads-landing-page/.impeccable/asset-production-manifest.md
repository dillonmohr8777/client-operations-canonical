# Tags 2 Go Ads Landing Page Asset Production Manifest

**Audit date:** 2026-08-13  
**Approved comp:** `.impeccable/mocks/service-counter-split.png`  
**Approval sidecar:** `.impeccable/mocks/service-counter-split.json` (`approved: true`)  
**Surface:** `.impeccable/surfaces/index-html.md`  
**Verdict:** **COMPLETE for the revised production direction.** Both required raster assets are verified and available: the locked logo and the existing live-site key-handoff image used only as illustrative vehicle-service context. The generated comp's branded reception interior is explicitly non-authoritative and creates no production-asset requirement. The comp itself must not be cropped or shipped as an image source.

All relative paths in this manifest resolve from `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\tags-2-go\web\ads-landing-page`.

## Authority and audit boundary

- `PRODUCT.md` and `DESIGN.md` require the exact verified Tags 2 Go shield-and-vehicle logo, genuine business details, and no invented government affiliation, proof, testimonials, prices, timelines, or outcomes.
- The approved comp sidecar declares `assets/tags2go-logo.jpeg` and `assets/service-office.jpg` as source assets and explicitly records that its generated branded reception interior is not production authority.
- The revised surface fidelity inventory defines `assets/service-office.jpg` as illustrative service context only, never as the Tags 2 Go office, staff, or premises. `index.html` preserves that boundary with the visible caption `Illustrative vehicle service context.` and a descriptive illustration alt.
- This manifest audits production media only. It does not approve copy, implement the page, generate imagery, or authorize publication.

## Image-native regions in the approved comp

| ID | Comp region | Required medium and content | Existing candidate | Satisfies? | Production decision |
| --- | --- | --- | --- | --- | --- |
| IMG-01 | Header brand mark at upper left; repeated as the footer brand mark in production | Existing raster: the exact verified shield-and-vehicle Tags 2 Go logo. Its spelling, proportions, colors, and geometry stay locked. | `assets/tags2go-logo.jpeg` | **Yes.** The 512 by 512 JPEG is byte-for-byte identical to the current WordPress media asset recorded in the provenance ledger. | Use the existing file. Size with HTML/CSS; do not redraw, trace, recolor, crop through the mark, or replace it with text or a badge. |
| IMG-02 | Broad second-fold illustrative service image | Existing verified live-site raster showing vehicle keys presented over paperwork. It supplies general vehicle-service context only and must not be presented as the Tags 2 Go office, staff, premises, or documentary proof. | `assets/service-office.jpg` | **Yes.** The 1000 by 667 JPEG is byte-for-byte identical to the current live-site media asset recorded in the provenance ledger. The revised sidecar, surface brief, alt, and visible caption all preserve its illustrative status. | Use the existing file with an explicit illustrative caption and descriptive alt. Do not add a Tags 2 Go logo to the scene, identify the person or setting as Tags 2 Go, or use it as authorization or premises evidence. |

There are no missing image-native production regions. The generated branded reception interior and its wall-mounted logo are disclaimed reference pixels, not production commitments. The remaining icons, arrows, controls, typography, bands, shadows, and layout are authored interface geometry and must remain code-based.

## Existing raster provenance ledger

| Asset | Verified facts | Approved-comp disposition |
| --- | --- | --- |
| `assets/tags2go-logo.jpeg` | 512 by 512 JPEG; SHA-256 `4B0DE743EC46943090BCDE3CD7380FBC02B5453A4F5936D3E00AD140C1E9B853`; exact byte match to `https://tags2go.pro/wp-content/uploads/2026/07/cropped-E5334B67-EF43-4C1F-B486-47D79C64C697.jpeg` on 2026-08-13. It is also named in the approved comp sidecar. | **Use for IMG-01.** This is the verified locked logo. |
| `assets/service-office.jpg` | 1000 by 667 JPEG; SHA-256 `AE5CE4D8E79DD92370462F3F9C5EDCF64E3A4888374DEA4BA65DEB0C3667A16B`; exact byte match to `https://tags2go.pro/wp-content/uploads/2026/07/183.jpg` on 2026-08-13. It is named in the approved comp sidecar. The pixels show a generic key handoff over paperwork. | **Use for IMG-02 only as illustrative vehicle-service context.** Preserve the explicit caption and never claim it depicts the Tags 2 Go office, staff, or premises. |
| `assets/registration-certificate.png` | 512 by 512 PNG; SHA-256 `742D9BD55A4E9D9169332987113D69ACB9E348486199B0FED703744927A85C33`; exact byte match to `https://tags2go.pro/wp-content/uploads/2026/07/registration-certificate.png` on 2026-08-13. The pixels are a generic vehicle-document icon, not an authorization certificate. | **Do not use as documentary proof or as a raster service-router icon.** The approved comp calls for consistent authored inline SVG icons. |
| `assets/hero-current.jpg` | 1000 by 667 JPEG; SHA-256 `89042AA4A4FC366DDEDF25DD50A769565E09A6801628597A7F97070BD36186AE`. No provenance locator appears in the reviewed project files or approved comp sidecar, and no exact hash match was found among the original image URLs referenced by the current homepage on 2026-08-13. The pixels show a generic open office with people at computers. | **Not approved for this comp.** It does not depict the branded Tags 2 Go service counter and has no verified production provenance in the reviewed evidence. |

## Must remain semantic HTML, CSS, SVG, or progressive JavaScript

| Comp ingredient | Required implementation |
| --- | --- |
| Navigation, hero promise, supporting copy, service names, disclosure, address, visit guidance, footer facts | Semantic HTML with real text; never rasterize core UI text. |
| Phone and request controls | Semantic anchors using the real routes, with CSS for shape, state, and responsive behavior. |
| Phone glyphs, four service-router line icons, router arrows, information symbol, location pin, and call-guidance symbol | Authored inline SVG with consistent stroke grammar. Decorative SVG is hidden from assistive technology; meaningful controls retain accessible link names in HTML. |
| Blue promise field, white router panel, mist disclosure band, yellow action fill, dividers, restrained radii, and any permitted soft elevation | CSS using the documented design tokens. These are not raster textures. |
| Asymmetric split, second-fold image/text arrangement, overlaps, spacing, and mobile single-column reflow | Responsive semantic layout and CSS. Preserve topology while adapting, rather than tracing the comp into one desktop image. |
| Route-line draw and restrained reveal | SVG/CSS and a small progressive JavaScript enhancement, with the complete state visible when JavaScript or motion is unavailable and with reduced motion respected. |

## Production gate

**PASS.** The revised direction's production asset set is complete:

1. `assets/tags2go-logo.jpeg` satisfies the locked brand-mark requirement.
2. `assets/service-office.jpg` satisfies the revised illustrative service-context requirement.
3. No production asset may represent the generated branded reception as a real Tags 2 Go location.
4. No authorization document, government seal, staff photograph, testimonial image, or additional raster is required or approved by this manifest.

The pass remains valid only while the key-handoff image is labeled and described as illustrative context. Removing that boundary or presenting the image as documentary proof would reopen the asset gate.
