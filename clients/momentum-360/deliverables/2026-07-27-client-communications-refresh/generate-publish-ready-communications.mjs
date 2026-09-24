import fs from "node:fs/promises";
import path from "node:path";

const repo = process.cwd();
const outputRoot = path.join(
  repo,
  "clients",
  "momentum-360",
  "deliverables",
  "2026-07-27-client-communications-refresh",
);
const emailRoot = path.join(outputRoot, "publish-ready-emails");
const slackRoot = path.join(outputRoot, "publish-ready-slack");
const signature = await fs.readFile(
  "C:\\Users\\dillo\\.codex\\email-assets\\dm-marketing-specialist\\signature.html",
  "utf8",
);

const urls = {
  searchBenchmark:
    "https://www.wordstream.com/blog/2026-google-ads-benchmarks",
  metaBenchmark:
    "https://www.wordstream.com/blog/facebook-ads-benchmarks-2025",
  kjb: "https://kimberly-james-bridal-2026-06-06.netlify.app",
  onsite: "https://onsite-concrete-construction-2026-06-06.netlify.app",
  omega: "https://omega-landscaping-2026-06-06.netlify.app",
  fagan: "https://fagan-painting-2026-07-06.netlify.app",
  fresh: "https://fresh-blends-2026-05-31-report.netlify.app",
  replenish: "https://replenish-2026-06-06.netlify.app",
  nkcdc: "https://nkcdc.org/",
  hope: "https://thehopewellnesscenter.com/",
  barCrawl: "https://barcrawlusa.com/",
  searchConsole: "https://search.google.com/search-console/about",
  vaClaims:
    "https://va-claims-edge-phase-two-review.netlify.app",
  revive: "https://revive-systems.com/",
};

const link = (format, label, url) =>
  format === "email"
    ? `<a href="${url}" style="color:#0b57d0;text-decoration:underline;">${label}</a>`
    : `[${label}](${url})`;

const section = (heading, items) => ({ heading, items });

const clients = [
  {
    slug: "kimberly-james-bridal",
    title: "Kimberly James Bridal Search and qualified Meta lead update",
    channelId: "C0530MVK371",
    channel: "kimberly-james-bridal",
    to: "kimberly@kimberlyjamesbridal.com",
    cc: "sean@needmomentum.com,mac@needmomentum.com,melissarobinn@gmail.com",
    subject: "Kimberly James Bridal Search and qualified Meta lead update",
    greeting: "Hi Kim,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `I wanted to give you a complete update on the two advertising efforts that matter right now: the new Google Search campaign and the qualified Meta lead program. I also refreshed the ${link(format, "Kimberly James Bridal advertising dashboard", urls.kjb)} so you have one clear place to review the same numbers we are discussing here.`,
        },
        {
          type: "p",
          text: "The Search campaign is live for Philadelphia at a twenty dollar daily budget and is still learning. The partial July 27 observation shows $1.86 in spend, 33 impressions, one click, a 3.03% click through rate, and a $1.86 average cost per click.",
        },
        {
          type: "p",
          text: `That early $1.86 cost per click is 58% lower than the $4.44 Apparel, Fashion, and Jewelry search benchmark in the ${link(format, "2026 WordStream Google Ads benchmark report", urls.searchBenchmark)}. I like the direction, but I do not want to overstate one click. The next useful signal will come from the actual search terms, the relevance of the visits, and whether those visits become appointment activity.`,
        },
        {
          type: "p",
          text: "For the July 20 through July 26 Meta reporting window, the account spent $57.75, delivered 5,999 impressions, and reached 4,462 people. The work since then has focused on further qualifying the lead form so the team receives more context before beginning a conversation with each bride.",
        },
        {
          type: "heading",
          text: "What we are improving",
        },
        {
          type: "ul",
          items: [
            "Google Search at a twenty dollar daily budget, currently learning",
            "$57.75 in verified Meta spend for July 20 through July 26",
            "Higher Intent Meta form with SMS phone verification",
            "Four questions covering wedding timing, gown budget, boutique visit timing, and stylist contact readiness",
            "Lower lead volume with a stronger level of interest from the brides who complete the form",
          ],
        },
        {
          type: "p",
          text: "We have been deliberately asking more questions and adding stronger confirmation steps before a submission reaches the boutique. That naturally reduces raw form volume, but the early pattern is encouraging: when a bride does complete the process, there is more interest and more useful information for the stylist to work with. The goal is not to collect the largest possible number of names. The goal is to create more serious boutique conversations.",
        },
        {
          type: "p",
          text: "I will keep tuning the form carefully so the added questions improve quality without creating unnecessary friction for strong prospects. The most useful feedback will be which brides answer the stylist, which conversations show real gown and timing fit, and which submissions become appointments. Lead and appointment reporting is pending validation until those records can be matched.",
        },
        {
          type: "p",
          text: "My focus for the next review is straightforward: watch Search terms closely, protect relevance as bidding learns, review every newly qualified Meta submission, and reconcile appointments by source. Search will keep building a clean local intent sample, while Meta will continue prioritizing stronger interest over raw lead volume.",
        },
      ];
    },
  },
  {
    slug: "onsite-concrete-landscape",
    title: "Onsite Concrete and Landscape weekly Google Ads update",
    channelId: "C087GM7SEJF",
    channel: "onsite-construction",
    to: "onsiteclp@gmail.com",
    cc: "gracieslags@gmail.com,sean@needmomentum.com",
    subject: "Onsite Concrete and Landscape Google Ads update for July 20 through July 26",
    greeting: "Hi Onsite team,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `Here is the complete Google Ads update for July 20 through July 26. I refreshed the ${link(format, "Onsite performance dashboard", urls.onsite)} so the weekly spend, traffic, campaign split, and measurement status are all available in one place.`,
        },
        {
          type: "p",
          text: "The account spent $60.36 during the week and delivered 11,008 impressions with 344 clicks. That equals a 3.12% click through rate and a blended average cost per click of $0.18. The account also shows six Google tracked events. Those events are being treated as reporting pending validation until they are matched with a named call, form, inbox record, or CRM record.",
        },
        {
          type: "heading",
          text: "Last week at a glance",
        },
        {
          type: "ul",
          items: [
            "$60.36 in verified Google Ads spend",
            "11,008 impressions and 344 clicks",
            "3.12% account click through rate",
            "$0.18 blended average cost per click",
            "Six tracked events pending named contact validation",
          ],
        },
        {
          type: "p",
          text: `The $0.18 blended cost per click is approximately 98% lower than the $8.33 Home and Home Improvement search benchmark in the ${link(format, "2026 WordStream Google Ads benchmark report", urls.searchBenchmark)}. That is a strong cost efficiency signal. The account uses a mix of Smart and Performance Max formats, so this is a directional comparison rather than a perfect format match.`,
        },
        {
          type: "p",
          text: "Performance Max produced all six visible tracked events on $23.13 in spend. The Smart campaign supplied most of the reach and click volume. That split is useful because it tells us the account is doing two different jobs: one campaign is generating efficient visibility and traffic, while the other is surfacing the actions that may be closer to an estimate request.",
        },
        {
          type: "p",
          text: "The important next step is not simply increasing budget because click cost is low. It is proving which campaign and which action produced a real opportunity. I am reconciling the six events against calls, forms, inbox activity, and CRM outcomes. Once that match is complete, budget can follow the source that is creating useful conversations rather than the source that only produces inexpensive traffic.",
        },
        {
          type: "p",
          text: "For the next review, I will keep watching traffic quality, confirm the status of every tracked event, and separate genuine estimate opportunities from general site activity. The cost side of the account is performing extremely well against the category reference. The next layer is turning that efficiency into a dependable view of qualified demand.",
        },
      ];
    },
  },
  {
    slug: "omega-landscaping",
    title: "Omega Landscaping weekly Google Ads update",
    channelId: "C09DP3AMNQ7",
    channel: "omega-landscape",
    to: "contact@omegalandscapingco.com",
    cc: "christian@omegalandscapingco.com,john.belaska@needmomentum.com,sam@gadsnomads.com,rachel@needmomentum.com,sean@needmomentum.com,beth@needmomentum.com,info@tipmarketing.com",
    subject: "Omega Landscaping Google Ads update for July 20 through July 26",
    greeting: "Hi Omega team,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `Here is the full Google Ads update for July 20 through July 26. The ${link(format, "Omega performance dashboard", urls.omega)} has been refreshed with the same weekly figures so everyone can review spend, traffic, efficiency, and the current measurement status from one source.`,
        },
        {
          type: "p",
          text: "The account spent $271.93 and delivered 1,492 impressions, 71 interactions, and 45 clicks. The click through rate was 3.02%, and the average cost per click was $6.04. Google also recorded one tracked event during the period. That event is being held as reporting pending validation until it can be matched with a specific call, form, inbox record, or CRM contact.",
        },
        {
          type: "heading",
          text: "Last week at a glance",
        },
        {
          type: "ul",
          items: [
            "$271.93 in verified Google Ads spend",
            "1,492 impressions and 71 total interactions",
            "45 clicks with a 3.02% click through rate",
            "$6.04 average cost per click",
            "One tracked event pending named lead validation",
          ],
        },
        {
          type: "p",
          text: `Omega's $6.04 average cost per click is approximately 27% lower than the $8.33 Home and Home Improvement search benchmark in the ${link(format, "2026 WordStream Google Ads benchmark report", urls.searchBenchmark)}. Since this campaign uses Performance Max inventory, the comparison is directional. Even with that caveat, the account is buying traffic below the current category reference.`,
        },
        {
          type: "p",
          text: "The account remains concentrated in the intended Colorado Springs campaign. That is helpful because it keeps the learning and optimization story focused instead of scattering the budget across unrelated markets. The main question now is whether the tracked activity reflects a project that fits Omega's service area, service mix, and desired project value.",
        },
        {
          type: "p",
          text: "I am not recommending a budget change from the platform event alone. The safer and more useful next step is to identify the person behind the event, confirm the action they took, and understand whether it became a real inquiry. That validation will tell us whether to protect the current structure, refine traffic quality, or redirect spend toward a stronger signal.",
        },
        {
          type: "p",
          text: "For the next review, I will match the event against calls, forms, inbox records, and CRM activity, while continuing to watch cost and interaction quality. The account is ahead of the category reference on click cost. The next proof point is lead identity and project quality, because that is what should determine the next budget decision.",
        },
      ];
    },
  },
  {
    slug: "fagan-painting",
    title: "Fagan Painting Meta handoff and AEO, GEO, and SEO next phase",
    channelId: "C0AMD2E444E",
    channel: "fagan-painting",
    to: "faganpainting@gmail.com",
    cc: "philasyr@gmail.com,mjfrederick334@gmail.com,mrigby@needmomentum.com",
    subject: "Fagan Painting Meta handoff and AEO, GEO, and SEO next phase",
    greeting: "Hi Fagan team,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `Here is the complete Fagan Painting update for July 20 through July 26, along with the transition plan for the work ahead. I refreshed the ${link(format, "Fagan Painting performance dashboard", urls.fagan)} so the team still has a clear record of the final weekly Meta delivery and lead results.`,
        },
        {
          type: "p",
          text: "Across the two campaigns with delivery, the account spent $478.14 and produced 10,563 impressions. Six Meta lead forms were recorded. The campaign that produced those six forms did so at a $56.75 cost per lead. Those are the verified platform numbers for the reporting period.",
        },
        {
          type: "heading",
          text: "Current status and next phase",
        },
        {
          type: "ul",
          items: [
            "$478.14 in total Meta spend across two campaigns with delivery",
            "10,563 impressions",
            "Six Meta lead form results",
            "$56.75 cost per lead on the campaign that produced the forms",
            "Facebook management transitioning to Benson and Legacy Paint Holdings",
            "Continuing focus moving to coordinated AEO, GEO, and SEO",
          ],
        },
        {
          type: "p",
          text: "The lead feedback adds useful context to the platform total. In the recent tightened form group, two reviewed submissions were described as good while another was still awaiting review, and two resulting estimates were discussed at $15,000 and $10,000. That confirms why the lead record, form questions, routing notes, and client feedback should be preserved carefully during the handoff.",
        },
        {
          type: "p",
          text: "Fagan Painting has partnered with Legacy Paint Holdings, and Benson is expected to take over Facebook activity this week. The right move is a clean transition, not a new advertising recommendation. I will organize the current campaign structure, lead form logic, routing path, and available performance context so the incoming team can take the wheel without losing what was learned.",
        },
        {
          type: "p",
          text: "Jim also made the continuing opportunity very clear in the email thread. He is pleased with the direction of the SEO work, wants that program to continue long term, and specifically wants Dillon retained for AI search optimization. The next phase should therefore coordinate the existing SEO work with AEO and GEO instead of treating them as competing services.",
        },
        {
          type: "p",
          text: "The first AEO, GEO, and SEO priorities are answer ready service pages, useful FAQs based on real homeowner questions, clearer local painting topics, stronger internal connections between service and location content, and structured answers that search engines and AI results can understand. That work should be coordinated with Phil and Mac so responsibilities remain clear and the current SEO momentum is protected.",
        },
        {
          type: "p",
          text: "For the next review, I will complete the Meta handoff record, establish the organic search baseline, organize the first answer focused page and FAQ priorities, and define how AEO, GEO, SEO, and future backlink work fit together. Future Fagan updates will measure implementation progress, organic visibility, and qualified search demand rather than presenting ongoing Facebook optimization as our next lane.",
        },
      ];
    },
  },
  {
    slug: "fresh-blends",
    title: "Fresh Blends Kwik Trip campaign readiness update",
    channelId: "C0A8XE76XGR",
    channel: "fresh-blends",
    to: "mia@freshblends.com",
    cc: "sean@needmomentum.com",
    subject: "Fresh Blends Kwik Trip campaign readiness update",
    greeting: "Hi Mia,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `I wanted to give you a complete Fresh Blends update and keep it clearly separated from the Replenish store reporting. The ${link(format, "Fresh Blends campaign dashboard", urls.fresh)} remains the correct place for the Kwik Trip advertising lane and its activation status.`,
        },
        {
          type: "p",
          text: "The four Kwik Trip Ice Box campaigns were reviewed in the shared Google Ads child account. They are currently held for the next approved activation window. Because the campaigns are not actively delivering, I am not presenting weekly spend, cost per click, or an industry comparison as current performance. That would create a misleading read of an inactive campaign set.",
        },
        {
          type: "heading",
          text: "What is confirmed",
        },
        {
          type: "ul",
          items: [
            "Four Kwik Trip Ice Box campaigns remain organized in the correct account",
            "The campaigns are held and not treated as active delivery",
            "Fresh Blends reporting remains separate from Replenish reporting",
            "No current benchmark claim is being made without verified spend",
            "The next report will begin only after active delivery is confirmed",
          ],
        },
        {
          type: "p",
          text: "Keeping the reporting lanes separate matters. Fresh Blends and Replenish may share operational context, but the brands, campaign groups, spend, and outcomes should never be blended into one total. A combined figure would make it harder to understand which stores or campaigns are actually responsible for traffic and performance.",
        },
        {
          type: "p",
          text: "The campaign structure and store group organization are preserved, which means the account does not need to be rebuilt when an activation window is approved. Before delivery resumes, I will verify the intended markets, budgets, creative readiness, landing destinations, and measurement settings. That gives the next active period a clean starting point and makes the first week of reporting easier to trust.",
        },
        {
          type: "p",
          text: "Once the activation timing is approved, I will verify live delivery first. The next update will then cover actual spend, impressions, clicks, click through rate, cost per click, and any downstream outcomes that can be validated. Until then, the accurate status is readiness, not performance.",
        },
        {
          type: "p",
          text: "My next step is to keep the four campaigns ready, preserve the separate Fresh Blends reporting path, and confirm the exact activation window before any performance language is used. That protects the integrity of the update and gives everyone a clear baseline when the campaigns begin moving again.",
        },
      ];
    },
  },
  {
    slug: "replenish-7-eleven",
    title: "Replenish and 7 Eleven weekly campaign update",
    channelId: "C0A8XE76XGR",
    channel: "fresh-blends",
    to: "mia@getreplenish.com",
    cc: "sean@needmomentum.com",
    subject: "Replenish and 7 Eleven performance update for July 20 through July 26",
    greeting: "Hi Mia,",
    attachments: [
      path.join(
        repo,
        "clients",
        "replenish-7-eleven",
        "deliverables",
        "2026-07-26-weekly-performance-presentation",
        "Replenish-Weekly-Performance-2026-07-20-to-2026-07-26-PUBLISH-READY.pptx",
      ),
    ],
    body(format) {
      return [
        {
          type: "p",
          text: `Attached is the polished Replenish and 7 Eleven weekly PowerPoint for July 20 through July 26. This update is intentionally focused only on the four San Diego locations: Torrey Del Mar, Miramar, Carmel Mountain, and Solana Beach. I also refreshed the ${link(format, "live Replenish performance dashboard", urls.replenish)} so it presents the same four location view.`,
        },
        {
          type: "p",
          text: "Together, the four San Diego locations spent $93.47 and delivered 3,411 impressions with 244 clicks. That equals a 7.15% click through rate and a blended average cost per click of $0.38. All four locations were active and generated traffic during the reporting period.",
        },
        {
          type: "heading",
          text: "Four location total",
        },
        {
          type: "ul",
          items: [
            "$93.47 in verified spend",
            "3,411 impressions and 244 clicks",
            "7.15% click through rate",
            "$0.38 blended average cost per click",
          ],
        },
        {
          type: "heading",
          text: "Performance by San Diego location",
        },
        {
          type: "ul",
          items: [
            "Torrey Del Mar spent $33.92, delivered 1,216 impressions and 107 clicks, produced an 8.80% click through rate, and averaged $0.32 per click",
            "Miramar spent $25.45, delivered 1,143 impressions and 67 clicks, produced a 5.86% click through rate, and averaged $0.38 per click",
            "Carmel Mountain spent $21.03, delivered 418 impressions and 42 clicks, produced a 10.05% click through rate, and averaged $0.50 per click",
            "Solana Beach spent $13.07, delivered 634 impressions and 28 clicks, produced a 4.42% click through rate, and averaged $0.47 per click",
          ],
        },
        {
          type: "p",
          text: `The four location blended cost per click of $0.38 is approximately 91% lower than the $4.14 Shopping, Collectibles, and Gifts search benchmark in the ${link(format, "2026 WordStream Google Ads benchmark report", urls.searchBenchmark)}. Because these campaigns use Performance Max inventory, this is a directional cost comparison rather than an exact format match.`,
        },
        {
          type: "p",
          text: "Torrey Del Mar led the four locations in click volume with 107 clicks and also delivered the lowest cost per click at $0.32. Carmel Mountain produced the strongest click through rate at 10.05%. Miramar combined 67 clicks with a $0.38 cost per click, matching the four location blended average. Solana Beach added 28 clicks at $0.47 per click.",
        },
        {
          type: "p",
          text: "The attached PowerPoint is the presentation file for this update, not a hosted presentation link. It includes the four location total, spend distribution, individual location KPIs, cost per click comparison, benchmark context, and next actions. The presentation is a positive performance summary built specifically around the four San Diego locations.",
        },
        {
          type: "p",
          text: "For the next week, the focus is to build on the efficient traffic already coming from these four locations, keep the market level comparison visible, and connect the platform activity with store level outcomes as those records become available.",
        },
      ];
    },
  },
  {
    slug: "nkcdc",
    title: "NKCDC Phase Two growth proposal update",
    channelId: "C0AQB2TF1AB",
    channel: "nkcdc",
    to: "amiller@nkcdc.org",
    cc: "twatts@nkcdc.org,mboyd@nkcdc.org,mjfrederick334@gmail.com,mac@needmomentum.com,sean@needmomentum.com",
    subject: "NKCDC Phase Two growth proposal and working session",
    greeting: "Hi everyone,",
    attachments: [
      path.join(
        repo,
        "clients",
        "nkcdc",
        "deliverables",
        "2026-07-21-NKCDC-Phase-Two-Growth-Proposal-Momentum-Digital.pdf",
      ),
    ],
    body(format) {
      return [
        {
          type: "p",
          text: `Attached is the updated Phase Two growth proposal for ${link(format, "NKCDC", urls.nkcdc)}. I am sending it as a standalone message so the scope, recommendation, and next decision are easy for everyone to review without digging through a previous thread.`,
        },
        {
          type: "p",
          text: "The main recommendation is to treat the next phase as one connected growth program. The website, Google, Meta, landing pages, content, lead follow up, and reporting should work from one shared plan. When those pieces are managed as separate tasks, it becomes harder to see what is driving community awareness, service interest, and meaningful action.",
        },
        {
          type: "heading",
          text: "What the proposal is designed to organize",
        },
        {
          type: "ul",
          items: [
            "Priority programs and the audiences each program needs to reach",
            "Campaign planning across Google and Meta",
            "Landing pages that make the next action clear",
            "Content that supports both awareness and service understanding",
            "Measurement that keeps community activity and business outcomes separate",
            "A practical review rhythm with clear owners and decisions",
          ],
        },
        {
          type: "p",
          text: "The proposal is not meant to add activity for the sake of activity. It is meant to create a cleaner operating system for the work that matters most. Each campaign should have a defined audience, a useful destination, a clear follow up path, and a reporting method that shows what happened after someone engaged.",
        },
        {
          type: "p",
          text: "The website and content layer are especially important because they give every campaign a stronger place to land. The goal is to make the programs easier to understand, improve the path from interest to inquiry, and build reusable content that can support outreach across channels. That creates more value than treating each campaign as an isolated launch.",
        },
        {
          type: "p",
          text: "My recommended next step is a working session where we review the proposal on screen, confirm the priority programs, assign owners, and capture any scope changes before final approval. That session should end with a clear first production sequence rather than another open list of possibilities.",
        },
        {
          type: "p",
          text: "Please review the attached proposal when you have a chance. I will come into the working session prepared to walk through the recommended structure, explain the order of operations, and adjust the plan around the team's most important near term priorities.",
        },
      ];
    },
  },
  {
    slug: "hope-wellness-center",
    title: "Hope Wellness Center content direction update",
    channelId: "C092MVBN8SV",
    channel: "hope-wellness-center",
    to: "psychiatry@hopewellnesscenter.com",
    cc: "john.belaska@needmomentum.com,beth@needmomentum.com,sean@needmomentum.com,jennymcclainmiller@gmail.com",
    subject: "Hope Wellness Center content direction and next production batch",
    greeting: "Hi Hope Wellness Center team,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `I wanted to send a complete content direction update that turns the visual library and service themes into a practical next production batch for ${link(format, "Hope Wellness Center", urls.hope)}. The goal is to make the next set feel consistent, useful, and clearly connected to the questions people have before they reach out.`,
        },
        {
          type: "p",
          text: "The strongest direction is calm, human, and credible. The content should make care feel approachable without becoming vague or overly polished. Real environments, natural expressions, clear service context, and simple language will help people understand what Hope offers and what taking the first step actually feels like.",
        },
        {
          type: "heading",
          text: "Recommended content pillars",
        },
        {
          type: "ul",
          items: [
            "Warm and reassuring introductions to care",
            "Clear explanations of psychiatry and wellness services",
            "Provider trust and what a first visit feels like",
            "Practical answers to common questions and concerns",
            "Supportive reminders that make reaching out feel manageable",
            "Direct invitations to connect when someone is ready",
          ],
        },
        {
          type: "p",
          text: "Each piece should do one clear job. A service education post should explain the service. A provider trust post should help someone understand the person behind the care. A frequently asked question should answer the question directly before adding detail. A first visit piece should reduce uncertainty and make the next action feel simple.",
        },
        {
          type: "p",
          text: "The visual library can support more than one format. The same approved idea can become a short motion post, a static graphic, a story, and a website section when the framing is planned correctly. That gives the team a consistent system instead of a group of unrelated social assets.",
        },
        {
          type: "p",
          text: "For the next batch, I recommend five or six finished pieces with a balanced mix of service education, provider trust, frequently asked questions, first visit expectations, and a direct invitation to connect. That is enough variety to show the system while keeping the review manageable.",
        },
        {
          type: "p",
          text: "The next decision is simply which topics should lead. Once the team confirms the preferred services and questions, I can turn the approved direction into the next production batch with the copy, visual treatment, and call to action aligned from the start.",
        },
      ];
    },
  },
  {
    slug: "bar-crawl-usa",
    title: "Bar Crawl USA August search priorities",
    channelId: "C0AEGE1V5KR",
    channel: "bar-crawl-usa",
    to: "info@barcrawlusa.com",
    cc: "mjfrederick334@gmail.com,sean@needmomentum.com,melissarobinn@gmail.com,beth@needmomentum.com",
    subject: "Bar Crawl USA August search and event priorities",
    greeting: "Hi Bar Crawl USA team,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `With August beginning, I think the strongest next move for ${link(format, "Bar Crawl USA", urls.barCrawl)} is to shift from a broad page creation plan to a more evidence led search program. We should start with the pages that have already earned meaningful visibility over the past few years, then keep only the opportunities that connect to the current event calendar and the searches people will make next.`,
        },
        {
          type: "p",
          text: `The first August task is to use ${link(format, "Google Search Console", urls.searchConsole)} and available site analytics to review roughly the previous three years of page and query performance. We should rank pages by qualified search visibility, clicks, recurring seasonal demand, and ticket value where that outcome is available. A historically strong page should only make the production list if its city, crawl theme, or event intent is still relevant now.`,
        },
        {
          type: "heading",
          text: "August priorities",
        },
        {
          type: "ul",
          items: [
            "Pull the strongest pages and queries from the previous three years",
            "Filter the list against confirmed 2026 cities, themes, and ticket opportunities",
            "Prioritize Halloween city pages first, followed by the December Ugly Sweater season",
            "Update event dates, locations, ticket links, titles, descriptions, and frequently asked questions",
            "Strengthen internal links from established city pages into the most relevant upcoming events",
            "Request indexing after publication and review search movement every week",
          ],
        },
        {
          type: "p",
          text: `The current ${link(format, "Boos and Booze Halloween event collection", "https://barcrawlusa.com/event-type/boos-booze-halloween-bar-crawl/")} gives us the most immediate seasonal opportunity. The live calendar includes 2026 Halloween events across markets such as Atlanta, Roswell, Cleveland, Lakewood, Greenville, Sarasota, and additional cities. August is the right time to strengthen the city and Halloween pages before ticket interest builds more aggressively in September and October.`,
        },
        {
          type: "p",
          text: "This should be a repeatable approach rather than a one time list of ten pages. Each month, we can compare historical winners with the next sixty to ninety days of events, select the overlap, refresh the pages with current information, and support them with internal links from the strongest city and theme hubs. That keeps the work tied to both existing search authority and actual ticket opportunities.",
        },
        {
          type: "p",
          text: "My recommended August sequence is to complete the historical performance pull first, approve the relevant page shortlist, update the first Halloween city pages, confirm every ticket destination and event detail, then publish and request indexing. The same process can move into the Ugly Sweater pages once the Halloween priority set is in place.",
        },
        {
          type: "p",
          text: "This gives us a clearer standard for deciding what deserves production time. We are not choosing pages because they are old, because they once ranked, or because a city sounds important. We are choosing pages where proven search demand, current event relevance, and a real ticket path all line up.",
        },
      ];
    },
  },
  {
    slug: "va-claims-edge",
    title: "VA Claims Edge unified portal review",
    channelId: "C0AU6GMGY73",
    channel: "va-claims",
    to: "david@vaclaimsedge.com",
    cc: "david.fisher@vaclaimsedge.com,mjfrederick334@gmail.com,jamesrfrederick@gmail.com,Webdesign@needmomentum.com,lukemazur@gmail.com",
    subject: "VA Claims Edge unified portal review",
    greeting: "Hi David and team,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `Here is the complete ${link(format, "VA Claims Edge unified portal", urls.vaClaims)}. This is now one current review project containing both the secure client portal and the internal operations workspace. The landing page makes both sides of the product available from the same link, so there is no longer a separate client experience link and operations review link to compare.`,
        },
        {
          type: "p",
          text: "The client side connects the overview, appointment booking, claim progress, secure messaging, and case file experience. The operations side keeps the latest claim stage overview, client directory, next actions, stale contact risk, document dependencies, Nexus letter status, and running client narrative in the same application.",
        },
        {
          type: "heading",
          text: "What is included in the unified project",
        },
        {
          type: "ul",
          items: [
            "A connected client overview and primary navigation",
            "Appointment booking with the claim advisor",
            "Claim progress, current status, and next step visibility",
            "Secure messaging inside the client experience",
            "Receiving, downloading, and securely uploading case files",
            "An internal operations dashboard with priority and pipeline visibility",
            "Client records with next actions, contact cadence, dependencies, and a running narrative",
            "One consistent VA Claims Edge visual system across both workspaces",
          ],
        },
        {
          type: "p",
          text: "The most important part of this review is the continuity between the two audiences. A client should be able to understand the claim status, see what happens next, schedule time with the advisor, communicate securely, and handle required files. The internal team should be able to see the same work operationally, identify the next action, find blocked dependencies, and resume the record without reconstructing context.",
        },
        {
          type: "p",
          text: "For the next review, I recommend starting at the unified landing page and walking through both paths. On the client side, open claim progress, book a call, review messages, and test the secure file flow. Then return to the landing page, open operations, review the priority dashboard, filter the client directory, and open a client record to inspect the next action and continuity narrative.",
        },
        {
          type: "p",
          text: "That walkthrough will show where the product already feels connected and where the handoffs still need refinement. The review should focus on whether each audience can understand current status, identify the next action, and move into the right workflow without ambiguity. It should also identify any wording, permission, production data, or audit requirements that need to be settled before implementation.",
        },
        {
          type: "p",
          text: "Please use this single Netlify link as the source for the next review. It now contains the complete client journey and the latest operations workspace in one project. The review remains an illustrative prototype and is not connected to production claimant data.",
        },
      ];
    },
  },
  {
    slug: "revive-systems",
    title: "Revive Systems 3 in 30 and VIP journey update",
    channelId: "C0B9V5QDGJH",
    channel: "revive-systems",
    to: "mjover09@gmail.com",
    cc: "sean@needmomentum.com,beth@needmomentum.com,melissarobinn@gmail.com,mjfrederick334@gmail.com",
    subject: "Revive Systems 3 in 30 entry and sixteen week VIP journey",
    greeting: "Hi Revive team,",
    attachments: [],
    body(format) {
      return [
        {
          type: "p",
          text: `I wanted to send a complete strategy update that connects the 3 in 30 entry offer with the full sixteen week VIP journey for ${link(format, "Revive Systems", urls.revive)}. The opportunity is to make the first commitment feel simple while showing a clear path into the deeper coaching relationship.`,
        },
        {
          type: "p",
          text: "The 3 in 30 offer should be the clearest first step into Revive. The page needs to explain the promise, who the offer is for, what happens during the first thirty days, and the immediate action required to begin. Someone should understand the value and next step without reading the entire site.",
        },
        {
          type: "heading",
          text: "What the connected journey should include",
        },
        {
          type: "ul",
          items: [
            "A focused entry page for the 3 in 30 offer",
            "Clear expectations immediately after someone commits",
            "Simple milestones that make progress visible",
            "Regular education and accountability",
            "Timely reminders tied to the next best action",
            "A clear transition into the full VIP relationship",
          ],
        },
        {
          type: "p",
          text: "The entry experience and the VIP experience should feel like one journey, not two unrelated programs. The first thirty days can create momentum and trust. The following weeks should then build on that commitment with a visible progression through coaching, education, accountability, and measurable milestones.",
        },
        {
          type: "p",
          text: "The messaging sequence matters as much as the page. The first message should confirm the decision and remove uncertainty. Later messages should reinforce progress, explain what comes next, and make the next action easy. Each touchpoint should have one job instead of trying to explain the entire program again.",
        },
        {
          type: "p",
          text: "My recommended build order is to map the journey first, then create the highest priority entry page and follow up touchpoints. That prevents the page from becoming a standalone promotion with no clear experience behind it. It also makes the sixteen week relationship easier to communicate because every step has a purpose.",
        },
        {
          type: "p",
          text: "The next review should confirm the entry promise, the first thirty day experience, the milestone sequence, and the point where someone moves into the full VIP relationship. Once those decisions are made, I can use this structure for the page, the message sequence, and the production plan.",
        },
      ];
    },
  },
];

const closingNotes = {
  "kimberly-james-bridal":
    "I will keep the dashboard easy to follow. Search will be judged on relevant local intent and appointments. Meta will be judged on qualified form quality and the boutique conversations that follow.",
  "onsite-concrete-landscape":
    "The next update will keep the platform figures and the business outcome review side by side. That way, everyone can see both how efficiently the account is buying traffic and whether the tracked activity is becoming the kind of estimate conversation that should earn more budget.",
  "omega-landscaping":
    "I will keep the dashboard current as that validation work is completed. The next update will clearly separate verified platform delivery from confirmed inquiry quality so the team can make a budget decision from evidence rather than from a single automated event label.",
  "fagan-painting":
    "This gives Fagan a clean paid social closeout and a practical next phase centered on durable organic visibility. The AEO, GEO, and SEO plan now moves the work toward the search opportunity Jim wants the team to pursue.",
  "fresh-blends":
    "I will keep the dashboard in readiness mode until the account shows real delivery. When the campaigns activate, the first report will use the actual start date and a clean reporting window so there is no confusion between setup activity, partial delivery, and a complete week of performance.",
  "replenish-7-eleven":
    "The next update will keep the same four San Diego locations together so the comparison stays consistent from week to week. That will make it easy to see how Torrey Del Mar, Miramar, Carmel Mountain, and Solana Beach develop across spend, traffic, engagement, and store level response.",
  nkcdc:
    "I will also use the working session to distinguish immediate production work from longer term opportunities. That should give the team a realistic first phase, a clear ownership map, and a review cadence that keeps the proposal moving after approval instead of becoming another static planning document. It will also make the first decision easier.",
  "hope-wellness-center":
    "I will keep the production plan grounded in the approved visual system and the real questions people bring to the practice. The next review can then focus on topic choice, accuracy, tone, and call to action instead of reopening the entire creative direction for every individual piece. That will give the team a dependable system for future content as well.",
  "bar-crawl-usa":
    "The August production list will therefore come from evidence first. Once the historical winners are matched with the active event calendar, I can organize the final priorities by city, theme, expected search timing, and ticket opportunity so the team can see exactly why each page was selected.",
  "va-claims-edge":
    "Once the team has reviewed both paths, the feedback can be organized into client experience decisions, operations workflow decisions, and production requirements. That will give the next build a clear scope without splitting the product back into separate review projects.",
  "revive-systems":
    "I will keep the next build focused on continuity. Every page and message should make the current step clear, reinforce the progress already made, and point to one useful next action. That gives the program a stronger experience than a collection of promotions that happen to share the same offer. It also makes the value easier to explain.",
};

const renderEmail = (client) => {
  const blocks = [
    ...client.body("email"),
    { type: "p", text: closingNotes[client.slug] },
  ]
    .map((block) => {
      if (block.type === "heading") {
        return `<p style="margin:24px 0 10px;"><strong>${block.text}</strong></p>`;
      }
      if (block.type === "ul") {
        return `<ul style="margin:0 0 18px;padding-left:24px;">${block.items
          .map((item) => `<li style="margin:0 0 8px;">${item}</li>`)
          .join("")}</ul>`;
      }
      return `<p style="margin:0 0 18px;">${block.text}</p>`;
    })
    .join("\n");

  return `<div style="margin:0;color:#202124;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;max-width:700px;">
  <p style="margin:0 0 18px;">${client.greeting}</p>
  ${blocks}
  <p style="margin:24px 0 0;">Thanks,<br>Dillon</p>
  ${signature}
</div>`;
};

const renderSlack = (client) => {
  const blocks = [
    ...client.body("slack"),
    { type: "p", text: closingNotes[client.slug] },
  ]
    .map((block) => {
      if (block.type === "heading") return `**${block.text}**`;
      if (block.type === "ul") return block.items.map((item) => `- ${item}`).join("\n");
      return block.text;
    })
    .join("\n\n");
  return `**${client.title}**\n\n${blocks}`;
};

const visibleText = (content) =>
  content
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/\[[^\]]+\]\([^)]+\)/g, (value) => value.slice(1, value.indexOf("]")))
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*-\s+/gm, "")
    .replace(/[*•]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const wordCount = (content) =>
  visibleText(content).split(/\s+/).filter(Boolean).length;

await fs.mkdir(emailRoot, { recursive: true });
await fs.mkdir(slackRoot, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  mode: "publish_ready_not_sent",
  emails: [],
  slacks: [],
};

for (const client of clients) {
  const email = renderEmail(client);
  const slack = renderSlack(client);
  const emailPath = path.join(emailRoot, `${client.slug}.html`);
  const slackPath = path.join(slackRoot, `${client.slug}.md`);
  await fs.writeFile(emailPath, email, "utf8");
  await fs.writeFile(slackPath, slack, "utf8");

  const emailWords = wordCount(email) - wordCount(signature);
  const slackWords = wordCount(slack);
  manifest.emails.push({
    slug: client.slug,
    to: client.to,
    cc: client.cc,
    subject: client.subject,
    bodyFile: emailPath,
    attachments: client.attachments,
    standalone: true,
    wordCount: emailWords,
  });
  manifest.slacks.push({
    slug: client.slug,
    channelId: client.channelId,
    channel: client.channel,
    bodyFile: slackPath,
    attachments:
      client.slug === "replenish-7-eleven" ? client.attachments : [],
    wordCount: slackWords,
  });
}

await fs.writeFile(
  path.join(outputRoot, "publish-ready-manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      emailCount: manifest.emails.length,
      slackCount: manifest.slacks.length,
      emailWordCounts: manifest.emails.map(({ slug, wordCount }) => ({
        slug,
        wordCount,
      })),
      slackWordCounts: manifest.slacks.map(({ slug, wordCount }) => ({
        slug,
        wordCount,
      })),
    },
    null,
    2,
  ),
);
