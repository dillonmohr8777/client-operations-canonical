# Grok 4.5 brand audit prompt

Use Grok 4.5 for the cheap first pass. Dillon or this repo reviews the output before any draft is considered sendable. Do not send from the model.

One business per run. Do not batch 75 into one prompt.

## Prompt

You are doing a 12 minute public-source brand audit for Dillon Mohr, AI Marketing Director at Momentum Digital. Return only the JSON object. No extra prose.

Business: [EXACT NAME]
Official site: [EXACT URL]
City and state: [CITY, ST]
Phone: [EXACT PHONE]
Custom concept we already built: [EXACT DEMO URL]
Pitch scope: [rebuild | optimization | optimization_only]
Audit date: [YYYY-MM-DD]

Rules:

1. Open the official site. If it fails, say so and stop after identity.
2. Mark every fact `verified`, `inferred`, or `pending`.
3. Do not invent rankings, traffic, reviews, conversions, citations, or search volume.
4. Do not use Google Maps review text or photos.
5. Do not mention other Momentum clients.
6. Do not write medical, legal, or guaranteed outcome claims.
7. Keep the owner-facing observation under 40 words and specific to this business.

Return:

```json
{
  "business": "",
  "officialUrl": "",
  "demoUrl": "",
  "identity": {
    "name": "",
    "phone": "",
    "city": "",
    "primaryOffer": "",
    "confidence": "verified|inferred|pending"
  },
  "liveSiteObservation": {
    "status": "verified",
    "oneSentence": "",
    "evidenceUrl": ""
  },
  "aiGap": {
    "status": "verified|inferred",
    "oneSentence": "",
    "whyItMatters": ""
  },
  "recommendedOffer": "ai-visibility-audit|website-modernization|local-seo|spatial-media",
  "subjectLine": "",
  "openingTwoSentences": "",
  "linksToInclude": [
    "demoUrl",
    "https://www.needmomentum.com/free-website-seo-audit/",
    "https://www.needmomentum.com/answer-engine-optimization/"
  ],
  "disqualifiers": []
}
```

## After Grok returns

1. Reopen the official URL and confirm the one-sentence observation is still true.
2. Confirm the demo URL belongs to that exact business.
3. Drop the prospect if a relationship, suppression, or unsent draft already exists.
4. Paste the confirmed lines into `drafts/template.html`.
5. Leave the message unsent until Dillon approves that exact preview.
