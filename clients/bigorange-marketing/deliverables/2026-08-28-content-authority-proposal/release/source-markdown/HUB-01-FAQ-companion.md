# Visible FAQ and Matching Schema Candidate

Status: factual-review draft. Public use requires Janice approval. The visible answers and JSON-LD below are intentionally identical in substance. Google limits FAQ rich-result visibility and does not guarantee a rich result, so the value of these answers is reader usefulness and content clarity.

## Visible FAQ copy

### Who is this marketing system for?

The pilot focuses on custom home builders, while the operating model can also support production builders and developers when the audience, project type, geography, and sales process are clearly defined. Remodeler intent should be evaluated separately before it is added to this pillar.

Permission: `?`  
Source: Janice, main recording `01:30-02:40`, `06:03-08:38`, and `31:25-31:53`.

### Are referrals enough for a home builder?

Referrals can be valuable and high trust. They are less reliable when the business needs steadier volume, wants people relocating into the market, or wants to shift its project mix. Search, proof, content, and follow-up strengthen referrals and create additional discovery paths.

Permission: `?`  
Source: Janice, main recording `18:09-19:31`.

### What should a home builder website show first?

Lead with excellent, relevant project photography. Pair it with a clear statement of who the builder helps, where the team works, what it builds, and the next step.

Permission: `?`  
Source: Janice, main recording `19:33-22:11`; the copy structure is BigOrange editorial synthesis.

### Should a custom home builder publish pricing?

Publish a responsible range when the team can define the geography, assumptions, date, and inclusions. When a range would mislead, explain the cost drivers and the point in the process when a useful number becomes possible.

Permission: `?`  
Source: Janice, main recording `14:47-15:16` and `22:13-23:10`.

### What should count as a qualified builder lead?

A raised hand is a marketing lead. A qualified opportunity also needs agreed criteria for geography, project type, investment, timing, decision authority, land or plan status, and working style. BigOrange and the builder should define those fields together before reporting qualified-lead performance.

Permission: `?`  
Source: Janice, main recording `31:41-32:29`; detailed scoring fields are proposed and still require sales/CRM approval.

### How long should a builder expect marketing to take?

The first 90 days can establish the website, content, measurement, and follow-up foundation. Six months is a more realistic first momentum window. Actual timing depends on the starting point, implementation speed, market, competition, distribution, and sales response.

Permission: `?`  
Source: Janice, overflow recording `00:00-00:40`.

### Can BigOrange guarantee rankings, leads, or AI-answer placement?

No responsible agency can guarantee a ranking, lead count, revenue result, or placement in a changing generated answer. BigOrange can improve the controllable foundation and report what is actually observable.

Permission: BigOrange policy/editorial statement; leadership approval required.  
Source: current official Google guidance and the pilot's evidence rules.

### Can one interview really create months of content?

One focused interview can create source material for multiple assets. Every public asset still requires fact-checking, permission, editing, and approval. AI accelerates the workflow; it does not replace the expert or publisher.

Permission: BigOrange editorial workflow statement; Janice and leadership review required.  
Source: the approved pilot workflow and interview-derived production process.

## JSON-LD candidate

Install only after the visible FAQ is approved and present on the page. Keep one coherent schema graph and avoid plugin duplication.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Who is this marketing system for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The pilot focuses on custom home builders, while the operating model can also support production builders and developers when the audience, project type, geography, and sales process are clearly defined. Remodeler intent should be evaluated separately before it is added to this pillar."
      }
    },
    {
      "@type": "Question",
      "name": "Are referrals enough for a home builder?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Referrals can be valuable and high trust. They are less reliable when the business needs steadier volume, wants people relocating into the market, or wants to shift its project mix. Search, proof, content, and follow-up strengthen referrals and create additional discovery paths."
      }
    },
    {
      "@type": "Question",
      "name": "What should a home builder website show first?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Lead with excellent, relevant project photography. Pair it with a clear statement of who the builder helps, where the team works, what it builds, and the next step."
      }
    },
    {
      "@type": "Question",
      "name": "Should a custom home builder publish pricing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Publish a responsible range when the team can define the geography, assumptions, date, and inclusions. When a range would mislead, explain the cost drivers and the point in the process when a useful number becomes possible."
      }
    },
    {
      "@type": "Question",
      "name": "What should count as a qualified builder lead?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A raised hand is a marketing lead. A qualified opportunity also needs agreed criteria for geography, project type, investment, timing, decision authority, land or plan status, and working style. BigOrange and the builder should define those fields together before reporting qualified-lead performance."
      }
    },
    {
      "@type": "Question",
      "name": "How long should a builder expect marketing to take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The first 90 days can establish the website, content, measurement, and follow-up foundation. Six months is a more realistic first momentum window. Actual timing depends on the starting point, implementation speed, market, competition, distribution, and sales response."
      }
    },
    {
      "@type": "Question",
      "name": "Can BigOrange guarantee rankings, leads, or AI-answer placement?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No responsible agency can guarantee a ranking, lead count, revenue result, or placement in a changing generated answer. BigOrange can improve the controllable foundation and report what is actually observable."
      }
    },
    {
      "@type": "Question",
      "name": "Can one interview really create months of content?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "One focused interview can create source material for multiple assets. Every public asset still requires fact-checking, permission, editing, and approval. AI accelerates the workflow; it does not replace the expert or publisher."
      }
    }
  ]
}
```

## QA gate

- [ ] Janice approves edited answers and assigns public-use permission.
- [ ] Leadership approves the audience, claims, and guarantee language.
- [ ] Visible questions and answers match the schema exactly.
- [ ] The FAQ is present in static page content.
- [ ] Only one FAQPage object is emitted.
- [ ] Structured data passes syntax validation.
- [ ] No Google rich-result outcome is promised.
