# Replenish 7-Eleven location finder launch audit

Date: 2026-08-31
Google Ads account: Replenish, CID 627-501-4654
Required destination: https://7eleven.getreplenish.com

## Current campaign evidence

All nine Replenish Performance Max asset groups were opened directly in Google Ads and their current Final URL fields were verified. The four Fresh Blends campaigns in the shared account were excluded.

| Campaign | Campaign ID | Asset group ID | Final URL | Current delivery |
|---|---:|---:|---|---|
| Replenish \| PMAX \| Boca \| Consumer Foot Traffic | 23944102690 | 6721755008 | https://7eleven.getreplenish.com | Ended |
| Replenish \| PMAX \| Miami 56 \| Consumer Foot Traffic | 23944175995 | 6721872897 | https://7eleven.getreplenish.com | Ended |
| Replenish \| PMAX \| Coral Springs \| Consumer Foot Traffic | 23944174558 | 6721872972 | https://7eleven.getreplenish.com | Ended |
| Howard Camaign | 23883827641 | 6715982050 | https://7eleven.getreplenish.com | Ended |
| Pampano Campaign | 23733909990 | 6698510842 | https://7eleven.getreplenish.com | Ended |
| Replenish \| PMAX \| Carmel Mountain 19223 \| Consumer Foot Traffic | 24008391755 | 6728365249 | https://7eleven.getreplenish.com | Ended |
| Replenish \| PMAX \| Miramar 43130 \| Consumer Foot Traffic | 24012722869 | 6728358592 | https://7eleven.getreplenish.com | Ended |
| Replenish \| PMAX \| Solana Beach 4344 \| Consumer Foot Traffic | 24012660853 | 6728355307 | https://7eleven.getreplenish.com | Ended |
| Replenish \| PMAX \| Torrey Del Mar 3458 \| Consumer Foot Traffic | 24012666388 | 6728349483 | https://7eleven.getreplenish.com | Ended |

Observed budget for each campaign: $16.67 per day.

## Finder tracking evidence

The finder is a custom static site on Replenish's Apache host. It contains nine store pages, five in South Florida and four in San Diego.

The live file `assets/analytics.js?v=1782327711`:

1. Captures gclid, gbraid, wbraid, and UTM values in session storage.
2. Calls a generic `get_directions` event when a Google Maps direction link is clicked.
3. Explicitly performs no action when `window.gtag` is absent.

No Google tag, Google Tag Manager container, GA4 tag, or Google Ads tag is loaded on the finder or its location pages. The generic event also does not send the active Google Ads conversion label. Therefore Get Directions clicks on the shared finder do not currently reach Google Ads.

The active Google Ads website conversion is `Get Directions Click (1)`. The implementation previously used on the Netlify pages was:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18057129889"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18057129889');
</script>
```

On a verified Get Directions click, the finder must also call:

```js
gtag('event', 'conversion', {
  send_to: 'AW-18057129889/o0v2CP_o1agcEKHfp6JD'
});
```

The existing `get_directions` event can remain for GA4 reporting, but it is not a substitute for the Google Ads conversion call above.

## Asset corrections required before launch

The Coral Springs campaign is cross-wired to Boca assets:

- Asset group name is `Boca`.
- Headline says `Get Your Smoothie In Boca`.
- Two long headlines mention Boca Raton.
- One description mentions Boca Raton.
- Its sitelinks include an unrelated `IPTV Multiroom Service` asset. The remaining generic sitelinks all point to the same finder root and should be removed or replaced with Replenish-specific links.

Minimum correction set:

- Rename asset group to `Coral Springs`.
- Replace the Boca headline with `Smoothies In Coral Springs`.
- Replace both Boca Raton long headlines with Coral Springs equivalents.
- Replace the Boca Raton description with a Coral Springs equivalent.
- Remove the unrelated and duplicate generic sitelinks from this asset group.

## External launch gates

1. Google advertiser verification shows an invalid Proof of Organization document. Deadline: 2026-09-11. Remaining business tasks are disabled until the document is accepted.
2. The Replenish client access registry contains Google Ads access only. No authorized hosting, FTP, SSH, cPanel, Plesk, or repository locator is registered for the finder.
3. Campaigns must remain ended or paused until the finder conversion fires successfully in Google Ads diagnostics and the advertiser-verification gate is cleared.

## Email state

The response to Mia is saved as an unsent Reply All draft in the original thread. It explains the Netlify tracking history, the shared finder destination, the current measurement gap, and the South Florida availability-copy question without claiming that the campaigns are live.
