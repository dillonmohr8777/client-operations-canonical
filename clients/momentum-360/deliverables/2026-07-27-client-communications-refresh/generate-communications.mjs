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
const signature = await fs.readFile(
  "C:\\Users\\dillo\\.codex\\email-assets\\dm-marketing-specialist\\signature.html",
  "utf8",
);

const searchBenchmark =
  "https://www.wordstream.com/blog/2026-google-ads-benchmarks";
const metaBenchmark =
  "https://www.wordstream.com/blog/facebook-ads-benchmarks-2025";

const base = (greeting, intro, sections, closing) => `
<div style="margin:0;padding:0;background:#ffffff;color:#172033;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;">
  <div style="max-width:680px;margin:0 auto;padding:12px 8px 24px;">
    <p style="margin:0 0 18px;">${greeting}</p>
    <p style="margin:0 0 22px;">${intro}</p>
    ${sections
      .map(
        (section) => `
    <div style="margin:0 0 18px;padding:18px 20px;border:1px solid #dfe5ef;border-radius:12px;background:#f8fafc;">
      <h2 style="margin:0 0 10px;font-size:18px;line-height:1.35;color:#10213d;">${section.title}</h2>
      ${(section.paragraphs ?? [])
        .map((paragraph) => `<p style="margin:0 0 10px;">${paragraph}</p>`)
        .join("")}
      ${
        section.bullets
          ? `<ul style="margin:8px 0 0;padding-left:22px;">${section.bullets
              .map((bullet) => `<li style="margin:0 0 7px;">${bullet}</li>`)
              .join("")}</ul>`
          : ""
      }
    </div>`,
      )
      .join("")}
    <p style="margin:22px 0 0;">${closing}</p>
    ${signature}
  </div>
</div>`.trim();

const dashboardLink = (url, label = "Open the client dashboard") =>
  `<a href="${url}" style="color:#0b57d0;font-weight:700;text-decoration:underline;">${label}</a>`;
const sourceLink = (url, label) =>
  `<a href="${url}" style="color:#0b57d0;text-decoration:underline;">${label}</a>`;

const emails = [
  {
    slug: "kimberly-james-bridal",
    to: "kimberly@kimberlyjamesbridal.com",
    cc: "sean@needmomentum.com,mac@needmomentum.com,melissarobinn@gmail.com",
    subject:
      "Kimberly James Bridal Advertising Update: Search Launch and Qualified Meta Leads",
    attachments: [],
    html: base(
      "Hi Kim,",
      "I wanted to send a fresh launch update that brings the new Google Search campaign and the new qualified Meta lead campaign into one clear view.",
      [
        {
          title: "Google Search launch",
          paragraphs: [
            "The Philadelphia Search campaign is live and moving through bid strategy learning at a $20 daily budget. Through the current July 27 observation, which includes a partial day of reporting, it has produced 33 impressions and one click on $1.86 in spend. That equals a 3.03% click through rate and a $1.86 average cost per click.",
            `The early $1.86 cost per click is 58% lower than the $4.44 2026 Apparel, Fashion, and Jewelry search benchmark in the ${sourceLink(searchBenchmark, "current WordStream search benchmark report")}. This is a very small launch sample, so I am treating the cost advantage as an encouraging early signal rather than a final performance conclusion.`,
          ],
        },
        {
          title: "Qualified Meta lead campaign",
          paragraphs: [
            "The only Meta campaign included in this update is the new qualified lead campaign. It is published and processing at a $10 daily budget.",
          ],
          bullets: [
            "Higher Intent instant form",
            "SMS phone verification",
            "Four approved creative images",
            "Questions covering wedding timing, gown budget, boutique visit timing, and stylist contact readiness",
          ],
        },
        {
          title: "Next review",
          paragraphs: [
            `Once Meta begins delivering and the first qualified submissions arrive, I will compare cost per lead with the $30.57 Personal Services benchmark in the ${sourceLink(metaBenchmark, "latest available Meta lead benchmark report")}. Lead and appointment reporting is pending validation, so the next decision will be based on the actual quality of the submitted forms and booked appointments.`,
            dashboardLink(
              "https://kimberly-james-bridal-2026-06-06.netlify.app",
              "Open the updated Kimberly James Bridal dashboard",
            ),
          ],
        },
      ],
      "I will keep a close eye on Search terms, click quality, Meta delivery, and the first qualified lead submissions as both campaigns move out of launch mode.",
    ),
  },
  {
    slug: "onsite-concrete-landscape",
    to: "onsiteclp@gmail.com",
    cc: "gracieslags@gmail.com,sean@needmomentum.com",
    subject:
      "Onsite Concrete and Landscape Google Ads Performance: July 20 through July 26",
    attachments: [],
    html: base(
      "Hi Onsite team,",
      "Here is the detailed Google Ads performance update for July 20 through July 26, along with the measurement work that matters most for the next budget decision.",
      [
        {
          title: "Verified account performance",
          bullets: [
            "$60.36 in total Google Ads spend",
            "11,008 impressions",
            "344 clicks",
            "3.12% account click through rate",
            "$0.18 blended average cost per click",
            "Six Google tracked events pending named contact validation",
          ],
        },
        {
          title: "Industry comparison",
          paragraphs: [
            `The account blended cost per click of $0.18 is approximately 98% lower than the $8.33 2026 Home and Home Improvement search benchmark in the ${sourceLink(searchBenchmark, "current WordStream search benchmark report")}. Because Onsite is using a mix of Smart and Performance Max formats, this is a directional cost comparison rather than an exact format match.`,
          ],
        },
        {
          title: "What happens next",
          paragraphs: [
            "Performance Max produced all six visible tracked events on $23.13 in spend, while the Smart campaign supplied most of the reach and click volume. We are reconciling those events against calls, forms, inbox records, and CRM records before describing them as qualified estimates.",
            dashboardLink(
              "https://onsite-concrete-construction-2026-06-06.netlify.app",
              "Open the Onsite performance dashboard",
            ),
          ],
        },
      ],
      "The traffic efficiency is excellent. The next priority is proving which tracked actions became real estimate opportunities so future budget follows the strongest source.",
    ),
  },
  {
    slug: "omega-landscaping",
    to: "contact@omegalandscapingco.com",
    cc: "christian@omegalandscapingco.com,john.belaska@needmomentum.com,sam@gadsnomads.com,rachel@needmomentum.com,sean@needmomentum.com,beth@needmomentum.com,info@tipmarketing.com",
    subject:
      "Omega Landscaping Google Ads Performance: July 20 through July 26",
    attachments: [],
    html: base(
      "Hi Omega team,",
      "Here is the detailed Google Ads update for July 20 through July 26, with the account benchmarked against the current home services search category.",
      [
        {
          title: "Verified campaign performance",
          bullets: [
            "$271.93 in Google Ads spend",
            "1,492 impressions",
            "71 interactions",
            "45 clicks",
            "3.02% click through rate",
            "$6.04 average cost per click",
            "One Google tracked event pending named lead validation",
          ],
        },
        {
          title: "Industry comparison",
          paragraphs: [
            `The $6.04 cost per click is approximately 27% lower than the $8.33 2026 Home and Home Improvement search benchmark in the ${sourceLink(searchBenchmark, "current WordStream search benchmark report")}. Since Omega is running Performance Max, the comparison is directional, but it gives us a useful outside cost reference.`,
          ],
        },
        {
          title: "Next decision",
          paragraphs: [
            "The account is concentrated in the intended Colorado Springs campaign, which keeps optimization focused. Before changing budget, we are matching the tracked event against calls, forms, inbox records, and CRM records so the next move reflects actual project quality.",
            dashboardLink(
              "https://omega-landscaping-2026-06-06.netlify.app",
              "Open the Omega performance dashboard",
            ),
          ],
        },
      ],
      "The click cost is outperforming the category benchmark. The next meaningful proof point is the identity and quality of the tracked inquiry.",
    ),
  },
  {
    slug: "fagan-painting",
    to: "faganpainting@gmail.com",
    cc: "philasyr@gmail.com,mjfrederick334@gmail.com,mrigby@needmomentum.com",
    subject:
      "Fagan Painting Meta Lead Performance: July 20 through July 26",
    attachments: [],
    html: base(
      "Hi Fagan team,",
      "Here is the detailed Meta lead campaign update for July 20 through July 26, including the current industry benchmark and the action plan for improving efficiency.",
      [
        {
          title: "Verified lead performance",
          bullets: [
            "$478.14 in total Meta spend across the two campaigns with delivery",
            "10,563 impressions",
            "Six Meta lead form results",
            "$56.75 cost per lead on the campaign that produced the six forms",
          ],
        },
        {
          title: "Industry comparison",
          paragraphs: [
            `The latest available Home and Home Improvement Meta lead benchmark is $41.26 per lead in the ${sourceLink(metaBenchmark, "WordStream Meta lead benchmark report")}. Fagan is currently $15.49 above that benchmark, so the campaign is not yet outperforming the category on lead cost.`,
            "That gap gives us a precise optimization target. The goal is to improve cost efficiency while protecting service area fit, project value, and contact quality.",
          ],
        },
        {
          title: "Immediate priorities",
          bullets: [
            "Confirm the disposition, service area, and project intent of all six forms",
            "Resolve the account payment state",
            "Resume only the campaign and routing path tied to verified lead delivery",
            dashboardLink(
              "https://fagan-painting-2026-07-06.netlify.app",
              "Open the Fagan Painting performance dashboard",
            ),
          ],
        },
      ],
      "I will use the lead quality review to decide whether the fastest improvement should come from creative, form qualification, audience refinement, or campaign structure.",
    ),
  },
  {
    slug: "fresh-blends",
    to: "mia@freshblends.com",
    cc: "sean@needmomentum.com",
    subject: "Fresh Blends and Kwik Trip Campaign Readiness Update",
    attachments: [],
    html: base(
      "Hi Mia,",
      "I wanted to send a clear status update for the Fresh Blends Kwik Trip advertising lane and keep it separate from the Replenish store campaign reporting.",
      [
        {
          title: "Current campaign state",
          paragraphs: [
            "The four Kwik Trip Ice Box campaigns were reviewed in the shared Google Ads child account. They are held for the next approved activation window, so there is no current delivery benchmark claim for Fresh Blends.",
          ],
        },
        {
          title: "What is ready",
          bullets: [
            "Fresh Blends remains a separate reporting lane from Replenish",
            "Campaign structure and store group organization are preserved",
            "The next report will begin when active delivery is verified",
            dashboardLink(
              "https://fresh-blends-2026-05-31-report.netlify.app",
              "Open the Fresh Blends campaign dashboard",
            ),
          ],
        },
      ],
      "Once an activation window is approved, I will verify delivery first and then report spend, traffic, cost efficiency, and downstream outcomes without blending in Replenish results.",
    ),
  },
  {
    slug: "replenish-7-eleven",
    to: "mia@getreplenish.com",
    cc: "sean@needmomentum.com",
    subject:
      "Replenish and 7 Eleven Campaign Performance: July 20 through July 26",
    attachments: [
      path.join(
        repo,
        "clients",
        "replenish-7-eleven",
        "deliverables",
        "2026-07-26-weekly-performance-presentation",
        "Replenish-All-Campaign-CPC-Performance-2026-07-20-to-2026-07-26.pptx",
      ),
    ],
    html: base(
      "Hi Mia,",
      "Attached is the complete Replenish and 7 Eleven PowerPoint for July 20 through July 26. It includes cost per click for every campaign row, not only the highest spend markets.",
      [
        {
          title: "Account performance",
          bullets: [
            "$153.72 total spend",
            "5,049 impressions",
            "288 clicks",
            "5.70% click through rate",
            "$0.53 blended average cost per click",
          ],
        },
        {
          title: "Cost per click by campaign",
          bullets: [
            "Torrey Del Mar at $0.32",
            "Miramar at $0.38",
            "Solana Beach at $0.47",
            "Carmel Mountain at $0.50",
            "Miami at $1.18",
            "Coral Springs at $1.53",
            "Pampano had limited delivery and no calculated cost per click",
          ],
        },
        {
          title: "Industry comparison",
          paragraphs: [
            `The $0.53 blended account cost per click is approximately 87% lower than the $4.14 2026 Shopping, Collectibles, and Gifts search benchmark in the ${sourceLink(searchBenchmark, "current WordStream search benchmark report")}. Because these campaigns use Performance Max inventory, this is a directional cross format comparison.`,
            "Torrey Del Mar, Miramar, Solana Beach, and Carmel Mountain all ran at or below the account average cost per click.",
          ],
        },
      ],
      "The attached PowerPoint is the complete review file for this update. I did not include a dashboard link in this email.",
    ),
  },
  {
    slug: "nkcdc",
    to: "amiller@nkcdc.org",
    cc: "twatts@nkcdc.org,mboyd@nkcdc.org,mjfrederick334@gmail.com,mac@needmomentum.com,sean@needmomentum.com",
    subject: "NKCDC Phase Two Growth Proposal and Working Session",
    attachments: [
      path.join(
        repo,
        "clients",
        "nkcdc",
        "deliverables",
        "2026-07-21-NKCDC-Phase-Two-Growth-Proposal-Momentum-Digital.pdf",
      ),
    ],
    html: base(
      "Hi everyone,",
      "Attached is the fresh Phase Two growth proposal for NKCDC. I wanted to send it as a standalone message so the scope, recommendation, and next decision are easy to review.",
      [
        {
          title: "What the proposal covers",
          bullets: [
            "Connected campaign planning across Google, Meta, landing pages, and reporting",
            "A clearer path from community awareness to service inquiry",
            "Content and conversion improvements that support the existing website",
            "Measurement that keeps program activity and business outcomes clearly separated",
          ],
        },
        {
          title: "Recommendation",
          paragraphs: [
            "My recommendation is to treat the next phase as one connected growth program rather than a series of isolated channel tasks. That gives NKCDC one operating rhythm for campaign planning, creative, landing pages, lead follow up, and performance review.",
          ],
        },
        {
          title: "Proposed next step",
          paragraphs: [
            "I suggest a working session where we walk through the proposal on screen, confirm the priority programs, assign owners, and identify any scope changes before final approval.",
          ],
        },
      ],
      "Please review the attached proposal when you have a chance. I am happy to schedule the working session around the team’s availability.",
    ),
  },
  {
    slug: "hope-wellness-center",
    to: "psychiatry@hopewellnesscenter.com",
    cc: "john.belaska@needmomentum.com,beth@needmomentum.com,sean@needmomentum.com,jennymcclainmiller@gmail.com",
    subject: "Hope Wellness Center Content Direction and Visual Library",
    attachments: [],
    html: base(
      "Hi Hope Wellness Center team,",
      "I wanted to send a fresh content direction update that turns the visual library and service themes into a practical next production batch.",
      [
        {
          title: "Recommended content pillars",
          bullets: [
            "Warm and reassuring introductions to care",
            "Clear explanations of psychiatry and wellness services",
            "Provider trust and what a first visit feels like",
            "Practical education for common questions and concerns",
            "Community focused reminders that make seeking support feel approachable",
          ],
        },
        {
          title: "Visual direction",
          paragraphs: [
            "The strongest direction is calm, human, and credible. The imagery should feel real and supportive, with clean environments, natural expressions, and enough context to make each service easier to understand.",
          ],
        },
        {
          title: "Next batch",
          paragraphs: [
            "I recommend building five or six finished pieces from these themes, with a balanced mix of service education, provider trust, frequently asked questions, and a direct invitation to connect.",
          ],
        },
      ],
      "Once the team confirms the preferred topics, I can turn the approved direction into the next production batch.",
    ),
  },
  {
    slug: "bar-crawl-usa",
    to: "info@barcrawlusa.com",
    cc: "mjfrederick334@gmail.com,sean@needmomentum.com,melissarobinn@gmail.com,beth@needmomentum.com",
    subject: "Bar Crawl USA Landing Page and Search Growth Plan",
    attachments: [],
    html: base(
      "Hi Bar Crawl USA team,",
      "I wanted to send a fresh project update with the priority landing page plan and the search improvements organized in one place.",
      [
        {
          title: "Priority page plan",
          paragraphs: [
            "The first production set should focus on ten high value pages that combine the strongest cities with the most important seasonal crawl themes. That gives us reusable event architecture while still making each page specific to its city and audience.",
          ],
          bullets: [
            "City specific event pages",
            "Seasonal crawl pages",
            "Clear ticket and event detail sections",
            "Internal links between related cities and themes",
            "Reusable frequently asked questions for event intent",
          ],
        },
        {
          title: "Search and answer engine improvements",
          paragraphs: [
            "The next layer should add structured page content that clearly answers who the event is for, what is included, where it happens, and how tickets work. Search Console should then be used to verify indexing, query growth, and the pages earning visibility.",
          ],
        },
        {
          title: "Next production step",
          paragraphs: [
            "I recommend approving the first ten page titles and city priorities, then moving directly into page production, internal linking, structured data, and Search Console validation.",
          ],
        },
      ],
      "Once the first page set is confirmed, I can turn this plan into the production schedule and review sequence.",
    ),
  },
  {
    slug: "va-claims-edge",
    to: "david@vaclaimsedge.com",
    cc: "david.fisher@vaclaimsedge.com,mjfrederick334@gmail.com,jamesrfrederick@gmail.com,Webdesign@needmomentum.com,lukemazur@gmail.com",
    subject: "VA Claims Edge Dashboard Direction and Next Review",
    attachments: [],
    html: base(
      "Hi David and team,",
      "I wanted to send a fresh dashboard direction update that captures the current visual work and the priorities for the next review.",
      [
        {
          title: "Current direction",
          paragraphs: [
            "The dashboard is being shaped around faster scanning, clearer claim status, and stronger separation between the information a veteran needs immediately and the supporting detail available deeper in the experience.",
          ],
        },
        {
          title: "Priority improvements",
          bullets: [
            "Clearer hierarchy for claim status and next action",
            "Simpler labels and supporting language",
            "Improved readability across desktop and mobile views",
            "More consistent visual treatment for progress, documents, and contact support",
            "A cleaner review path for the most important veteran questions",
          ],
        },
        {
          title: "Next review",
          paragraphs: [
            "The next review should focus on the dashboard flow from first login through the most common action. That will let us confirm hierarchy, wording, and support visibility before the remaining screens are finalized.",
          ],
        },
      ],
      "I will bring the refined dashboard direction into the next review so we can make decisions from the actual experience rather than isolated design fragments.",
    ),
  },
  {
    slug: "revive-systems",
    to: "mjover09@gmail.com",
    cc: "sean@needmomentum.com,beth@needmomentum.com,melissarobinn@gmail.com,mjfrederick334@gmail.com",
    subject: "Revive Systems 3 in 30 Entry and VIP Journey",
    attachments: [],
    html: base(
      "Hi Revive team,",
      "I wanted to send a fresh strategy update that connects the 3 in 30 entry offer with the full sixteen week VIP customer journey.",
      [
        {
          title: "Entry experience",
          paragraphs: [
            "The 3 in 30 offer should be the clearest first step into Revive. The page needs to explain the promise, who it is for, what happens during the first thirty days, and the immediate action required to begin.",
          ],
        },
        {
          title: "Sixteen week VIP journey",
          bullets: [
            "Clear onboarding after the initial commitment",
            "Simple milestones that show progress",
            "Regular education and accountability",
            "Timely reminders tied to the next best action",
            "A visible transition from the entry experience into the full VIP relationship",
          ],
        },
        {
          title: "Next build",
          paragraphs: [
            "The next step is to map the page and message sequence from the first 3 in 30 visit through the full VIP experience, then build the highest priority entry page and follow up touchpoints first.",
          ],
        },
      ],
      "This gives Revive one connected customer journey rather than separate campaign pieces. I will use this structure for the next build and review.",
    ),
  },
];

const slacks = [
  {
    slug: "kimberly-james-bridal",
    channelId: "C0530MVK371",
    channel: "kimberly-james-bridal",
    message: `*Kimberly James Bridal | Search and qualified Meta lead launch*

Dashboard: https://kimberly-james-bridal-2026-06-06.netlify.app

The new Philadelphia Search campaign is live and moving through bid strategy learning at a $20 daily budget. Through the current July 27 observation, which includes a partial day, it has produced 33 impressions and one click on $1.86 in spend. That equals a 3.03% CTR and a $1.86 CPC.

The early $1.86 CPC is *58% lower* than the $4.44 2026 Apparel, Fashion, and Jewelry search benchmark: ${searchBenchmark}

The only Meta campaign included here is the new qualified lead campaign. It is published and processing at $10 per day with a Higher Intent form, SMS verification, four approved creatives, and four questions covering wedding timing, gown budget, boutique visit timing, and stylist contact readiness.

Once delivery begins, we will compare qualified lead cost with the latest available $30.57 Personal Services benchmark, then evaluate actual form quality and booked appointments. Conversion reporting is pending validation.

*Next:* monitor Search terms and learning, confirm Meta delivery, review the first qualified submissions, and reconcile appointments by source.`,
  },
  {
    slug: "onsite-concrete-landscape",
    channelId: "C087GM7SEJF",
    channel: "onsite-construction",
    message: `*Onsite Concrete & Landscape | July 20 through July 26 Google Ads update*

Dashboard: https://onsite-concrete-construction-2026-06-06.netlify.app

Verified performance:
• $60.36 spend
• 11,008 impressions
• 344 clicks
• 3.12% CTR
• $0.18 blended CPC
• Six Google tracked events pending named contact validation

The $0.18 CPC is approximately *98% lower* than the $8.33 2026 Home and Home Improvement search benchmark: ${searchBenchmark}

This is a directional comparison because the account uses Smart and Performance Max formats. Performance Max produced all six visible tracked events on $23.13 in spend, while the Smart campaign supplied most of the reach and clicks.

*Next:* reconcile the six events against calls, forms, inbox records, and CRM records, then use the confirmed estimate quality to guide budget.`,
  },
  {
    slug: "omega-landscaping",
    channelId: "C09DP3AMNQ7",
    channel: "omega-landscape",
    message: `*Omega Landscaping | July 20 through July 26 Google Ads update*

Dashboard: https://omega-landscaping-2026-06-06.netlify.app

Verified performance:
• $271.93 spend
• 1,492 impressions
• 71 interactions
• 45 clicks
• 3.02% CTR
• $6.04 average CPC
• One Google tracked event pending named lead validation

The $6.04 CPC is approximately *27% lower* than the $8.33 2026 Home and Home Improvement search benchmark: ${searchBenchmark}

Because Omega is running Performance Max, the benchmark is directional. The account is concentrated in the intended Colorado Springs campaign, which keeps the optimization story focused.

*Next:* match the tracked event against calls, forms, inbox records, and CRM records before changing budget.`,
  },
  {
    slug: "fagan-painting",
    channelId: "C0AMD2E444E",
    channel: "fagan-painting",
    message: `*Fagan Painting | July 20 through July 26 Meta lead update*

Dashboard: https://fagan-painting-2026-07-06.netlify.app

Verified performance:
• $478.14 total Meta spend across two campaigns with delivery
• 10,563 impressions
• Six Meta lead form results
• $56.75 CPL on the campaign that produced the six forms

The latest available Home and Home Improvement Meta lead benchmark is $41.26 CPL: ${metaBenchmark}

Fagan is currently $15.49 above that benchmark, so it is not yet outperforming the category on lead cost. That gives us a precise optimization target while we protect service area fit, project value, and contact quality.

*Next:* confirm disposition of all six forms, resolve the account payment state, and resume only the campaign and routing path tied to verified lead delivery.`,
  },
  {
    slug: "fresh-blends-and-replenish",
    channelId: "C0A8XE76XGR",
    channel: "fresh-blends",
    message: `*Fresh Blends | Kwik Trip campaign readiness*

Dashboard: https://fresh-blends-2026-05-31-report.netlify.app

The four Kwik Trip Ice Box campaigns were reviewed in the shared Google Ads child account. They are held for the next approved activation window, so there is no current delivery benchmark claim. Fresh Blends remains a separate reporting lane from Replenish.

*Next:* verify active delivery first, then report spend, traffic, cost efficiency, and downstream outcomes without blending Replenish results.

*Replenish and 7 Eleven | July 20 through July 26*

The complete PowerPoint with CPC for every campaign is attached in this channel.

• $153.72 spend
• 5,049 impressions
• 288 clicks
• 5.70% CTR
• $0.53 blended CPC

Campaign CPCs: Torrey Del Mar $0.32, Miramar $0.38, Solana Beach $0.47, Carmel Mountain $0.50, Miami $1.18, Coral Springs $1.53, and Pampano with limited delivery and no calculated CPC.

The $0.53 blended CPC is approximately *87% lower* than the $4.14 2026 Shopping, Collectibles, and Gifts search benchmark: ${searchBenchmark}

Because these are Performance Max campaigns, the benchmark is directional. Torrey Del Mar, Miramar, Solana Beach, and Carmel Mountain all ran at or below the account average.`,
  },
  {
    slug: "nkcdc",
    channelId: "C0AQB2TF1AB",
    channel: "nkcdc",
    message: `*NKCDC | Phase Two growth proposal*

The fresh Phase Two proposal is organized as one connected growth program across campaign planning, Google, Meta, landing pages, content, lead follow up, and reporting.

The recommendation is to avoid treating each channel as an isolated task. One operating rhythm will make the program easier to manage, measure, and improve while keeping community activity and business outcomes clearly separated.

*Next:* schedule a working session to review the attached proposal on screen, confirm the priority programs, assign owners, and capture scope changes before approval.`,
  },
  {
    slug: "hope-wellness-center",
    channelId: "C092MVBN8SV",
    channel: "hope-wellness-center",
    message: `*Hope Wellness Center | Content direction and visual library*

The recommended direction is calm, human, and credible. The strongest content pillars are warm introductions to care, clear service education, provider trust, first visit expectations, and practical answers to common questions.

The visual library should favor real and supportive environments, natural expressions, and enough context to make each service easier to understand.

*Next:* confirm five or six priority topics for the next production batch, with a balanced mix of service education, provider trust, frequently asked questions, and a clear invitation to connect.`,
  },
  {
    slug: "bar-crawl-usa",
    channelId: "C0AEGE1V5KR",
    channel: "bar-crawl-usa",
    message: `*Bar Crawl USA | Landing page and search growth plan*

The first production set should focus on ten high value pages that combine the strongest cities with the most important seasonal crawl themes. Each page should include clear event details, ticket intent, city specific copy, internal links, and useful frequently asked questions.

The search layer should clearly answer who the event is for, what is included, where it happens, and how tickets work. Search Console should then verify indexing, query growth, and which pages are earning visibility.

*Next:* approve the first ten page titles and city priorities, then move directly into page production, internal linking, structured data, and Search Console validation.`,
  },
  {
    slug: "va-claims-edge",
    channelId: "C0AU6GMGY73",
    channel: "va-claims",
    message: `*VA Claims Edge | Dashboard direction*

The dashboard is being shaped around faster scanning, clearer claim status, and stronger separation between the information a veteran needs immediately and the supporting detail available deeper in the experience.

Priority improvements include clearer next actions, simpler labels, stronger desktop and mobile readability, consistent treatment for progress and documents, and more visible support options.

*Next:* review the complete flow from first login through the most common action so hierarchy, wording, and support visibility can be confirmed before the remaining screens are finalized.`,
  },
  {
    slug: "revive-systems",
    channelId: "C0B9V5QDGJH",
    channel: "revive-systems",
    message: `*Revive Systems | 3 in 30 entry and VIP journey*

The 3 in 30 offer should be the clearest first step into Revive. The page needs to explain the promise, who it is for, what happens during the first thirty days, and the immediate action required to begin.

The full sixteen week VIP journey should then create a visible progression through onboarding, milestones, education, accountability, reminders, and the next best action.

*Next:* map the page and message sequence from the first 3 in 30 visit through the full VIP experience, then build the highest priority entry page and follow up touchpoints first.`,
  },
];

await fs.mkdir(path.join(outputRoot, "emails"), { recursive: true });
await fs.mkdir(path.join(outputRoot, "slack"), { recursive: true });

for (const email of emails) {
  await fs.writeFile(
    path.join(outputRoot, "emails", `${email.slug}.html`),
    email.html,
    "utf8",
  );
}

for (const slack of slacks) {
  await fs.writeFile(
    path.join(outputRoot, "slack", `${slack.slug}.md`),
    slack.message,
    "utf8",
  );
}

const manifest = {
  generatedAt: new Date().toISOString(),
  emails: emails.map(({ html, ...email }) => ({
    ...email,
    bodyFile: path.join(outputRoot, "emails", `${email.slug}.html`),
  })),
  slacks: slacks.map((slack) => ({
    ...slack,
    bodyFile: path.join(outputRoot, "slack", `${slack.slug}.md`),
  })),
};

await fs.writeFile(
  path.join(outputRoot, "manifest.json"),
  JSON.stringify(manifest, null, 2),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      outputRoot,
      emailCount: emails.length,
      slackDraftCount: slacks.length,
    },
    null,
    2,
  ),
);
