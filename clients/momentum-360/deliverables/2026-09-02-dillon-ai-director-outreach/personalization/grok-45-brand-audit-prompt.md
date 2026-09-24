# Grok 4.5 brand audit prompt

Use Grok 4.5 for the cheap first pass. One Erie or Pittsburgh business per run. Do not use Philadelphia radar records.

## Prompt

You are doing a 12 minute public-source brand audit for Dillon Mohr, AI Marketing Director at Momentum. Return only the JSON object.

Business: [EXACT NAME]
Official site: [EXACT URL]
City: [Erie, PA or Pittsburgh, PA]
Phone: [EXACT PHONE IF VISIBLE]
Audit date: [YYYY-MM-DD]

Rules:

1. Open the official site. If it fails, say so and stop after identity.
2. Mark every fact `verified`, `inferred`, or `pending`.
3. Do not invent rankings, traffic, reviews, conversions, citations, or search volume.
4. Do not use Google Maps review text or photos.
5. Do not mention Immortal, Philadelphia radar demos, or other Momentum clients.
6. Do not write medical, legal, or guaranteed outcome claims.
7. Keep the owner-facing observation under 40 words and specific to this business.
8. If the city is Erie, write `openingTwoSentences` as a hometown note. First sentence: Dillon grew up in Erie and is the AI Marketing Director at Momentum. Second sentence: a place reason taken from this official site (street, bayfront, Presque Isle Bay, neighborhood, or published room or offer). Do not invent meals, owners, schools, or "I used to go there." Do not use tourist adjectives. Do not mention Philadelphia.
9. If the city is Pittsburgh, do not use the Erie hometown line.

Return:

```json
{
  "business": "",
  "city": "",
  "officialUrl": "",
  "identity": {
    "name": "",
    "phone": "",
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
  "recommendedProofLinks": [
    "https://www.needmomentum.com/services/",
    "https://www.needmomentum.com/answer-engine-optimization/",
    "https://www.momentumvirtualtours.com/services/"
  ],
  "subjectLine": "",
  "openingTwoSentences": "",
  "disqualifiers": []
}
```

## After Grok returns

1. Reopen the official URL and confirm the observation.
2. Confirm the city is Erie or Pittsburgh, not a radar leftover.
3. Paste confirmed Erie lines into `drafts/template-erie.html`. Paste Pittsburgh lines into `drafts/template.html`.
4. Leave the message unsent until Dillon approves that exact preview from his Gmail.
