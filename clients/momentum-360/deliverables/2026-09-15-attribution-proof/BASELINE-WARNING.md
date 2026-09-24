# Baseline warning, read before writing any proof claim

Verified 2026-09-15 from `raw/gsc/<property>/full16__2025-05-13_2026-09-12__dims-date__type-web__final.json`.

Google Search Console only returns data from the date a property was verified.
A property verified in mid 2026 therefore reports **zero** for any window before
that date. That zero is missing data, not measured absence of traffic.

## First date with any impression, per property

| Property | Days of history | First impression | Baseline usable |
|---|---|---|---|
| sc-domain_barcrawlusa.com | 488 | 2025-05-13 | **yes, full** |
| https_bigorange.marketing | 488 | 2025-05-13 | **yes, full** |
| https_www.zenspatropicana.com | 85 | 2026-06-21 | no |
| sc-domain_shadow-heating.com | 62 | 2026-07-15 | no |
| https_www.alignhcm.com | 48 | 2026-07-27 | no |
| sc-domain_ami-cleaning.com | 73 | 2026-07-02 | no |
| https_ironicineptocracy.com | 155 | 2026-05-10 | no |
| sc-domain_immohrtalmarketing.com | 19 | 2026-08-25 | no |
| https_revive-systems.com | 0 | none, file empty | no |
| sc-domain_revive-systems.com | 0 | none, file empty | no |
| sc-domain_momentumvirtualtours.com | 0 | none, file empty | no |

## Consequences, binding

1. **Only barcrawlusa.com and bigorange.marketing may carry a before and after
   claim.** Every other property gets a current state claim only, phrased as
   "in the first N weeks of measurement", never as growth, lift, or increase.

2. **The winA window is invalid for every property except those two.** Any
   winA to winB delta computed on the others is the verification date, not the
   work. Do not put it in PROOF-TABLE.csv. Do not put it in EVIDENCE.md.

3. Align HCM shows 553 clicks, 94,217 impressions, average position 16.2 across
   48 days of history. That is a real and strong current state. It is **not**
   a lift from zero and must never be written as one.

4. bigorange.marketing is **down** year over year on clicks, 610 to 313 for
   August, a fall of 49 percent, while average position improved from 38.7 to
   26.8. Both facts are real. It does not belong in a sales asset without the
   explanation for that divergence, and BigOrange should be checked against
   `registry/clients.json` before being treated as a Momentum client at all.

5. The three empty properties are a finding for GAPS.md. Either the property is
   wrong, the verification is broken, or the site has no search presence. Say
   which, or say it is unresolved.

## The defensible headline

Bar Crawl USA, same property, full history, like for like August against August:

    clicks       1,254  ->  2,300   ( +83% )
    impressions 52,666  -> 70,567   ( +34% )
    avg position  18.6  ->   12.0   ( improved 6.6 positions )

That row is the one to lead with, because it survives scrutiny.
