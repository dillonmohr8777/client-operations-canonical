# Omega tracking: focused tool research

Research checked September 5, 2026. This pass evaluated three existing native options against Omega's verified Wix site. No plugin, subscription or new account access was installed.

1. **Wix Event Manager:** a useful candidate for scanning available site events and preparing conversion mappings. Wix supports direct Google Tag application or a GTM JSON export and cautions against configuring the same conversion through both. Confirm feature availability and inspect existing mappings before applying anything. [Official guide](https://support.wix.com/en/article/usar-el-administrador-de-eventos-de-wix)
2. **Existing Google Tag Manager:** inspect the existing GTM-TRPJ69M7 container and the actual successful form event, matching the exact form and conversion label. Wix documents custom events and a Lead-event integration; a generic Lead listener could cover more than this one form, so scope must be established from observed events. A submit-button click alone does not establish an accepted form submission. [Official Wix conversion guide](https://support.wix.com/en/article/tracking-google-ads-conversions-using-wix-custom-code)
3. **Existing Google Tag integration:** confirm AW-16794883273 and its intended destination through Wix Marketing Integrations. Installing another base tag is not justified merely because conversion reporting needs attention. [Google's Wix setup guide](https://support.google.com/google-ads/answer/11622602?hl=en)

Recommended implementation sequence: read existing integration and tag configuration; establish one authoritative success-event path and deduplication; validate an isolated, clearly marked test against the destination receipt; reconcile Google Ads reporting with accepted leads. Preserve separate meanings for phone clicks, connected calls, accepted forms and qualified leads. These are proposed next steps, not completed tracking changes.

The practical finding is that existing native tools cover this problem. An additional optimizer or connector has no demonstrated benefit until event quality and campaign intent are verified.
