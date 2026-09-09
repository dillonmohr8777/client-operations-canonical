# Does Google de-rank AI-assisted content?

Prepared for BigOrange Marketing — September 3, 2026
Follow-up to the question raised on the Sept 3 pilot review call.

## Why this document exists

On the call, two claims were made and neither was supported at the time.

- **Dillon's claim:** including some Gemini-generated content helps a page rank.
- **Emelia's concern:** "if the search engines think you used AI to build your pages, it will de-rank you."

Dillon undertook to find the research. This is that research. The short version is
that **Dillon's claim is unsupported and is withdrawn**. Emelia's concern identifies
a real publishing risk, but current public guidance frames that risk around content
quality, value, oversight and intent rather than a documented automatic penalty for
AI assistance alone.

## 1. Google's documented position

Google's published guidance focuses on the purpose and quality of content rather than
the production tool. From *Google Search's guidance about AI-generated content*
(Search Central Blog, 8 February 2023):

> "Using AI doesn't give content any special gains. It's just content. If it is useful, helpful, original, and satisfies aspects of E-E-A-T, it might do well in Search. If it doesn't, it might not."

https://developers.google.com/search/blog/2023/02/google-search-and-ai-content

That guidance documents no special ranking benefit for content merely because Gemini
or another model helped produce it. It also does not describe an automatic,
method-only ranking penalty. It is not evidence that every AI-assisted page is safe;
Google's spam policies and people-first guidance still apply to the resulting page.

## 2. What Google actually penalises

From the March 2024 core update and spam policy announcement:

> "Scaled content abuse is when many pages are generated for the primary purpose of manipulating Search rankings and not helping users... no matter whether content is produced through automation, human efforts, or some combination."

https://developers.google.com/search/blog/2024/03/core-update-spam-policies

The documented policy target is scaled content created primarily to manipulate search
rankings, regardless of whether people, automation, or both produced it. That makes
editorial value and intent the defensible decision criteria. It does not support a
blanket claim that a particular tool either earns or loses rankings.

## 3. Where the de-ranking belief came from — and why it was reasonable

**Bing's current webmaster guidelines also focus on the resulting publishing
practice.** They say large-scale content produced without adequate oversight,
quality control or editorial review may be excluded from indexing. This brief does
not assign a date or motive to changes in Bing's wording because no first-party Bing
change log was found for that claim.

The defensible conclusion is narrow: the current public Google and Bing guidance
reviewed here does not document a blanket ranking penalty triggered merely by AI
assistance. Scale, value, accuracy, oversight and manipulative intent remain material
risks.

## 4. What the independent evidence actually shows

This is where it gets more interesting than "the claim is false", and where the caution earns its keep.

| Finding | Evidence | Source | Strength |
| --- | --- | --- | --- |
| AI-detector score has effectively no correlation with rank position | r = 0.011 across 600,000 pages | Ahrefs, Jul 2025 | Moderate — observational and detector-dependent |
| High-AI-share pages received 2-3x fewer impressions than low/moderate-AI pages in a separate study | 80,861 pages with Search Console data; ranking-content sample of ~150k pages | Ahrefs, Jul 2026 | Moderate — authors explicitly flag authority, content type and recency as confounds |
| Human-written pages hold #1 far more often | 80% vs 9% at position #1; n=42,000 pages / 20,000 keywords | Semrush, Apr 2026 | Moderate — AI detectors are unreliable |
| One cohort of AI-generated articles on new domains lost search visibility after early gains | 2,000 articles across 20 new domains; around the three-month mark, the share appearing in the top 100 fell from 28% to 3%, then remained low through the 16-month observation window | SE Ranking, Mar 2026 longitudinal cohort report | Low to moderate — publisher-run observation without a matched control group; it does not establish that AI use caused the decline |
| Gemini-produced content ranks better for being Gemini-produced | none found | — | **No evidence. Unsupported rumour.** |

These studies measure different outcomes and use imperfect AI detectors, so they
cannot establish that AI use caused a ranking change. The responsible reading is
that detector scores alone are not a useful release rule, while unedited, thin,
unoriginal content published at scale presents both performance and policy risk.

## 5. What this means for the builder authority hub

The finding that matters for this project is not the verdict. It is the risk profile.

**In our favour:** the SE Ranking new-domain cohort used brand-new domains with no
subsequent content updates, backlinks or additional optimization.
BigOrange is an established domain with 299 published posts in the September 1,
2026 public crawl. Emelia's Moz export dated August 14, 2026 showed 17 tracked
builder terms on `/marketing-agency-for-builders/`, including 13 in positions 1–3.
That is a dated snapshot, not a claim about current rankings, and the experiment's
failure mode does not straightforwardly transfer.

**Against us:** the proposed package contains closely related pages. Publishing them
without distinct reader jobs, approved expertise, editorial review and staged QA
would increase duplication and scaled-content risk. Local JSON-LD candidates,
answer blocks and headings do not by themselves prove that a page is useful or ready
to publish.

**So the mitigation is the same whichever side of the argument was right:**

1. Give every approved page one distinct reader job, accurate visible content and a
   named human review before anything ships.
2. Add Janice's approved subject-matter experience where permission allows. That
   supports the experience and expertise qualities in Google's people-first guidance;
   it is not a ranking guarantee.
3. Stage the releases rather than publishing the set at once.
4. Keep a named human editor accountable for each page.

That is roughly what the original concern was protecting against. The instinct was sound.

## 6. Corrections on the record

- The claim that adding Gemini output helps rankings is **withdrawn**. No supporting
  evidence was found in the reviewed sources. It was described on the call as
  something picked up secondhand and labelled a rumour.
- The claim that search engines automatically de-rank pages for being AI-built is
  **not documented in the current public Google or Bing guidance reviewed here**.
  This is not a promise that AI-assisted pages will rank or avoid quality systems.
- Neither correction changes the build plan, because the mitigation for the real risk — depth, expertise, editing, staged release — is what a good content programme looks like anyway.

## Sources

- Google, *Guidance about AI-generated content*, 8 Feb 2023 — https://developers.google.com/search/blog/2023/02/google-search-and-ai-content
- Google, *March 2024 core update and new spam policies*, 5 Mar 2024 — https://developers.google.com/search/blog/2024/03/core-update-spam-policies
- Google, *Spam policies for Google web search* (scaled content abuse) — https://developers.google.com/search/docs/essentials/spam-policies
- Google, *Using generative AI content* — https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Ahrefs, AI-content correlation study, 7 Jul 2025 — https://ahrefs.com/blog/ai-generated-content-does-not-hurt-your-google-rankings/
- Ahrefs, AI share and search-performance study, 27 Jul 2026 — https://ahrefs.com/blog/google-doesnt-punish-ai-content/
- Semrush, human vs AI ranking study, 1 Apr 2026 — https://www.semrush.com/blog/does-ai-content-rank-in-search-data-study/
- SE Ranking, 16-month longitudinal cohort report, 19 Mar 2026 — https://seranking.com/blog/ai-content-experiment/
- Bing, *Webmaster Guidelines* (current guidance) — https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a?success=true

Note on evidence quality: none of the large studies are peer-reviewed causal evidence.
They rely on third-party AI detectors of imperfect accuracy, observational comparisons,
or publisher-run cohorts without matched controls. Where they conflict, that is said
above rather than smoothed over.
