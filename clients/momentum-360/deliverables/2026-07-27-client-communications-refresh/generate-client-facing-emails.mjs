import fs from "node:fs";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const outputDir = path.join(root, "client-facing-emails");
fs.mkdirSync(outputDir, { recursive: true });

const signature = fs
  .readFileSync("C:\\Users\\dillo\\.codex\\email-assets\\dm-marketing-specialist\\signature.html", "utf8")
  .trim();

const wrap = (content) => `<div style="margin:0;color:#202124;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;max-width:700px;">
${content}
  <p style="margin:24px 0 0;">Thanks,<br>Dillon</p>
  ${signature}
</div>`;

const emails = {
  "kimberly-james-bridal.html": wrap(`  <p style="margin:0 0 18px;">Hi Kim,</p>
  <p style="margin:0 0 18px;">I wanted to give you a clear update on what we are seeing and how we are improving lead quality for the boutique.</p>
  <p style="margin:0 0 18px;">From July 20 through July 26, Meta spent $57.75, delivered 5,999 impressions, and reached 4,462 people.</p>
  <p style="margin:0 0 18px;">We have been further qualifying the lead form by asking brides for more useful information before they submit, including wedding timing, gown budget, when they expect to visit, and whether they are ready for a stylist to contact them. We also added phone verification.</p>
  <p style="margin:0 0 18px;">That has reduced the overall number of leads, which is expected. The encouraging part is that when a bride does complete the form, she is showing more interest and giving the team more context for the first conversation. We would rather create fewer serious opportunities than send the boutique a larger list of people who are not ready to engage.</p>
  <p style="margin:0 0 18px;">Google Search is also live at a $20 daily budget and is still in its learning period. We are watching the search terms closely so the traffic stays relevant to brides actively looking for a boutique.</p>
  <p style="margin:0 0 18px;">The most helpful feedback from your team will be which brides respond, which conversations feel like a strong fit, and which leads become appointments. That will let us keep improving the questions around what actually helps your stylists.</p>`),

  "onsite-concrete-landscape.html": wrap(`  <p style="margin:0 0 18px;">Hi Nicki,</p>
  <p style="margin:0 0 18px;">I wanted to give you a straightforward update on the visibility and traffic we are building for Onsite.</p>
  <p style="margin:0 0 18px;">From July 20 through July 26, Google Ads spent $60.36, generated 344 clicks from 11,008 impressions, and produced a 3.12% click through rate at an average cost of $0.18 per click. Google recorded 6 tracked actions during the same period. We are treating those as reporting signals until they can be matched to real estimate conversations.</p>
  <p style="margin:0 0 18px;">The organic work is moving in the same direction. Three new blogs, two landscaping service pages, expanded frequently asked questions, structured article information, and internal links across seven pages are giving Google more useful information about the services Onsite provides.</p>
  <p style="margin:0 0 18px;">The numbers show that more people are finding and visiting the business at an efficient cost. The next priority is making sure the traffic is producing the right homeowners and project types for your team.</p>
  <p style="margin:0 0 18px;">When you have a chance, please let us know which recent calls or forms became real estimate conversations. Even a quick note about the service requested and whether the project was a fit will help us improve the campaigns around the work you most want to book.</p>`),

  "omega-landscaping.html": wrap(`  <p style="margin:0 0 18px;">Hi David,</p>
  <p style="margin:0 0 18px;">Here is the latest Google Ads update for Omega Landscaping and Concrete.</p>
  <p style="margin:0 0 18px;">From July 20 through July 26, the campaign spent $271.93, delivered 1,492 impressions, generated 71 interactions and 45 clicks, and produced a 3.02% click through rate. The average cost per click was $6.04.</p>
  <p style="margin:0 0 18px;">Google also recorded 1 tracked action during the week. We are keeping that result pending until it can be connected to a real call, form, or project conversation.</p>
  <p style="margin:0 0 18px;">The immediate focus is not simply increasing traffic. It is identifying which searches are bringing in homeowners with the right landscaping and concrete needs, then putting more of the budget behind those stronger opportunities.</p>
  <p style="margin:0 0 18px;">Please let us know whether any recent calls or forms turned into a legitimate project inquiry. If you can share the service requested and whether it was a fit, we can use that feedback to make the next round of search and budget adjustments more useful to your team.</p>`),

  "fresh-blends.html": wrap(`  <p style="margin:0 0 18px;">Hi Mia,</p>
  <p style="margin:0 0 18px;">I wanted to confirm that we are honoring your direction to pause the Fresh Blends campaign for now.</p>
  <p style="margin:0 0 18px;">Nothing is being pushed forward while the timing is on hold. The campaign structure and existing work will remain organized so we can pick it back up without rebuilding everything when Fresh Blends is ready.</p>
  <p style="margin:0 0 18px;">When the timing becomes clearer, send us the location or promotion you want to prioritize and the date you would like activity to resume. We can then confirm the audience, creative, and launch window around that exact business need.</p>
  <p style="margin:0 0 18px;">There is no action needed from you until you are ready to reopen the conversation.</p>`),

  "nkcdc.html": wrap(`  <p style="margin:0 0 18px;">Hi Anthony and team,</p>
  <p style="margin:0 0 18px;">Attached is the updated Phase Two growth proposal for NKCDC.</p>
  <p style="margin:0 0 18px;">The plan is built around the concern Anthony raised: reaching more people and creating stronger community participation instead of continuing activity that is not producing enough value.</p>
  <p style="margin:0 0 18px;">The proposal connects outreach, content, program pages, follow up, and measurement around the services NKCDC most needs people to understand and use. It also includes a clearer path for promoting the tax program and other priority initiatives without treating every channel as a separate project.</p>
  <p style="margin:0 0 18px;">Our goal is to help the team see which messages and programs are creating real interest, then make it easier for residents and business owners to take the next step.</p>
  <p style="margin:0 0 18px;">The best next step is a short working session where we can review the proposal together, confirm the first priority, and choose a realistic starting sequence. Please send a few times that work for the team, and we will come prepared to walk through the recommendations on screen.</p>`),

  "hope-wellness-center.html": wrap(`  <p style="margin:0 0 18px;">Hi Joseph and team,</p>
  <p style="margin:0 0 18px;">The recent animation and still image work gives Hope Wellness a stronger base for the next content batch. We want the next pieces to answer the questions patients actually have and help them feel more comfortable taking the first step toward care.</p>
  <p style="margin:0 0 18px;">Our recommended direction is calm, human, and credible content that explains what Hope Wellness helps with, what a patient can expect, and how to know when it may be time to reach out. The goal is to reduce uncertainty while keeping the message compassionate and easy to understand.</p>
  <p style="margin:0 0 18px;">Please send us the 5 or 6 services, conditions, or patient questions you most want the next batch to address. Once we have that priority list, we can organize the content around the needs that matter most to your patients and your team.</p>`),

  "bar-crawl-usa.html": wrap(`  <p style="margin:0 0 18px;">Hi Andy and team,</p>
  <p style="margin:0 0 18px;">I want to make sure the next campaign recommendations stay aligned with the events Bar Crawl USA is actually running.</p>
  <p style="margin:0 0 18px;">For Halloween planning, we are using the live Boos and Booze event page as the source of truth. We will not add or recommend cities that are not currently approved there.</p>
  <p style="margin:0 0 18px;">For August, we are narrowing the paid search opportunities by comparing historical performance with the current event calendar. The goal is to prioritize the markets and events most likely to support ticket sales instead of spreading budget across an unverified list.</p>
  <p style="margin:0 0 18px;">We will send the evidence based shortlist for approval before any new city or event is treated as active. When you receive it, please confirm which events should receive priority so the campaign plan reflects the calendar your team is prepared to promote.</p>`),

  "va-claims-edge.html": wrap(`  <p style="margin:0 0 18px;">Hi David,</p>
  <p style="margin:0 0 18px;">Thank you for the detailed portal feedback. We incorporated the workflow changes you asked for so the review is centered on how your team actually manages each veteran.</p>
  <p style="margin:0 0 18px;">The updated version now includes Awaiting Nexus Letter, defines Needs Attention as clients with no contact for 60 days or more, renames the filing stage to Ready to File, and adds a running narrative for each client. We also kept the stage, next action, and updated information you said was helpful.</p>
  <p style="margin:0 0 18px;">You can review the unified portal here: <a href="https://va-claims-edge-phase-two-review.netlify.app" style="color:#0b57d0;text-decoration:underline;">VA Claims Edge portal review</a>.</p>
  <p style="margin:0 0 18px;">The main thing we need from you is confirmation that the labels and the 60 day threshold match the way you want the team to work. If anything still feels unnatural in the daily workflow, tell us where it breaks down and we will adjust that specific step.</p>`),

  "revive-systems.html": wrap(`  <p style="margin:0 0 18px;">Hi Mike,</p>
  <p style="margin:0 0 18px;">I wanted to give you a clear update on the Local Services setup so you know where things stand.</p>
  <p style="margin:0 0 18px;">The background check is processing. Based on the guidance Mac received from the Local Services representative, the account is being set up under Personal Training in Pennsylvania. Weight Loss and Dietitian are not being used as separate service categories in this setup.</p>
  <p style="margin:0 0 18px;">That category choice does not change the story we need to tell about Revive. Your strongest difference is still the individual testing, coaching, and experience you use to understand what is happening with each person instead of giving everyone the same generic answer. We can carry that message through the content and future campaign materials while keeping the Local Services account inside the category Google supports.</p>
  <p style="margin:0 0 18px;">There is nothing new you need to buy or change while the background check is processing. We will wait for that result, review the next available step, and keep the setup focused on a practical path to qualified local inquiries.</p>
  <p style="margin:0 0 18px;">If Google sends a new verification result or request, please forward it to the team so we can confirm it before you take action.</p>`)
};

for (const [filename, html] of Object.entries(emails)) {
  fs.writeFileSync(path.join(outputDir, filename), `${html}\n`, "utf8");
}

const manifest = {
  generatedAt: new Date().toISOString(),
  purpose: "Client centered email bodies for the approved non Fagan update set",
  exclusions: {
    faganPainting: "Do not send and do not modify the existing draft",
    shadowHvac: "Do not create or send an update",
    replenishSevenEleven: "Already sent on 2026-07-27, do not duplicate"
  },
  files: Object.keys(emails)
};
fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
