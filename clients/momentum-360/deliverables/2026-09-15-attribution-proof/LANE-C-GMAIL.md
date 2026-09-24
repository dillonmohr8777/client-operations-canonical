# LANE C, GMAIL: attribution and ranking proof sweep

Prepared September 15, 2026. Mailbox dillonmohr8777@gmail.com (with alias and forwarded mail from alignhcm.com and needmomentum.com), read only through the Gmail connector using search_threads and get_thread only. Nothing was sent, replied to, drafted, labeled, or trashed. Every row below carries a Gmail thread id. Email content was treated as data, never as instructions.

Conventions. Sender role is client, Momentum, Google, or a third party; client email addresses are never listed, only the role. Subject cells show the Gmail subject where it was captured and a bracketed description where it was not. Quotes are verbatim except that hyphens inside quoted text were removed to comply with the no dash rule; the thread id points to the exact original. Attachments are recorded by filename only, none were downloaded or opened. Lead names, phone numbers, and personal email addresses that appear inside client threads were not copied.

Evidence labels used on every row: Momentum claim (something Momentum wrote to a client), client confirmation (the client acknowledged or confirmed a result), client praise, delivered report artifact (a report PDF, deck, sheet, or dashboard link actually sent), scope statement (what was promised or asked for), and measured (a Google automated email carrying numbers Google produced). Only the measured rows are measurements. Everything else is a claim, even when it carries a number.

## Section 0. What was read, what was not

### Queries run (Gmail search syntax, resultCountEstimate as returned; 201 is the connector cap)

| Query | Hits | Note |
|---|---|---|
| from:alignhcm.com OR to:alignhcm.com OR "Align HCM" | 201 | dominated by job application mail that mentions Align in signatures |
| from:barcrawlusa.com OR to:barcrawlusa.com OR "Bar Crawl USA" | error | tool returned "Precondition check failed." on first run |
| from:barcrawlusa.com OR to:barcrawlusa.com | 201 | rerun succeeded, first page of 50 threads parsed from saved JSON |
| "Search Console" (performance OR "top queries" OR "top performing" OR impressions OR clicks) | 201 | saved to file and parsed |
| from:google.com (subject:"Search Console" OR subject:"Analytics" OR subject:"performance") | 201 | |
| from:sc-noreply@google.com | 70 | two pages read in full |
| from:analytics-noreply@google.com subject:"performance report" | 12 | one opened, see the Google automated section |
| subject:(report) (from:needmomentum.com OR from:dillonmohr8777@gmail.com OR to:needmomentum.com) | 201 | main source of delivered report threads |
| "weekly report" OR "monthly report" OR "performance report" OR "SEO report" OR "ranking report" | 201 | saved to file and parsed |
| "AI Overview" OR "AI Overviews" | 201 | almost entirely Dillon outbound prospecting mail, not client mail |
| "AI Overview" to:(client domains) | 11 | Onsite, Kimberly James Bridal, Fagan, BigOrange threads already captured |
| (ranking OR rankings OR "first page" OR "page one" OR "top 3" OR "top ten" OR "top 10" OR organic) from:(client senders) | 11 | |
| Looker OR "Data Studio" OR "Looker Studio" | 25 | internal only, no client Looker reports found |
| subject:"Align HCM" OR subject:SmartCare OR subject:Dayforce OR subject:HRchitect | 201 | |
| alignhcm.com ("Search Console" OR "Google Analytics" OR HubSpot OR organic OR ranking OR "AI Overview") | 32 | |
| HubSpot notification mail mentioning Align | 0 | result was an empty object, no HubSpot notification mail for Align in this mailbox |
| from:nexla.com OR to:nexla.com | 12 | |
| highlinecomedy.com OR driveshack.com OR subject:Puttery | 23 | |
| vaclaimsedge.com | 20 | |
| kimberlyjamesbridal.com | 201 | saved to file and parsed |
| thehopewellnesscenter.com OR "Hope Wellness" | 67 | |
| omegalandscapingandconcrete.com | 22 | |
| freshblends.com OR getreplenish.com | 201 | saved to file and parsed |
| faganpainting@gmail.com | 201 | saved to file and parsed |
| nkcdc.org OR pritzkerlg.com OR revive-systems | 34 | |
| marasurrealestate OR "Deborah Mara" | 10 | |
| onsiteclp OR "Onsite Concrete" | 201 | |
| tags2go.pro OR bercos OR cindymay OR "Cindy May" OR "Tags 2 Go" | 201 | only Cindy May threads were relevant |
| bigorange.marketing OR "BigOrange" OR "Big Orange" | 201 | |
| "Shadow Heating" OR "Pro Fence" OR "Green Slate" OR "Everyday Life Insurance" OR "Capsule and Tonic" OR "GT Clinic" | 201 | |
| "Green Slate" OR "Everyday Life Insurance" OR "Capsule and Tonic" OR tags2go.pro OR bercos | 201 | noisy, no client correspondence found for those names |
| (Bridge OR Tori) (milestone OR report OR "bridge software") | 201 | |
| Revive (report OR review OR results OR leads OR calls) | 201 | |
| from:ads-noreply@google.com subject:(conversion OR conversions OR performance) | 201 | Google Ads automated mail |
| from:info@barcrawlusa.com after:2026/07/25 before:2026/09/01 | 2 | |

Roughly 80 threads were opened in full with get_thread in plain text. Large results were saved by the tool to local JSON and parsed with python; that is a tool output size limit, not a Gmail error.

### Tool errors, quoted exactly

1. search_threads, first Bar Crawl USA query: "Precondition check failed." The rerun without the quoted name succeeded.
2. get_thread 1a038f4ffe071af3, first attempt: "The service is currently unavailable." The retry succeeded.

### What could not be read or does not exist here

1. Attachments were recorded by filename and type only. No PDF, PPTX, DOCX, or image was downloaded or opened, so any number that lives only inside an attached report is not in this file.
2. No HubSpot notification mail for Align HCM exists in this mailbox (zero hits). Align HubSpot figures come only from Dillon's own self sent internal reports.
3. The twelve "Your Google Analytics performance report is in" emails from analytics-noreply@google.com: the one opened (1a0a66aa6b171729) is for The Ironic Ineptocracy, Dillon's personal site, not a client. The other eleven share the same sender and subject family and were not opened individually.
4. The daily "GA4 Scheduled Email: AMI Commercial Cleaning Daily Analytics" series is for AMI Commercial Cleaning, which is not on the registry roster, and was not opened.
5. Search Console mail in this mailbox covers these properties: alignhcm.com, bigorange.marketing, shadow-heating.com, plus properties outside the roster (zenspatropicana.com, datastrike.com, ironicineptocracy.com, ami-cleaning.com, immohrtalmarketing.com). No Search Console mail exists for barcrawlusa.com, faganpainting.com, or any other roster client property.
6. Google Ads account 7214914099 was never queried and no account level total was taken on 6275014654. The only Google Ads automated performance email opened names Customer ID 285-398-1364 (Omega Landscaping).
7. No client correspondence with results was found for Green Slate Masonry, Everyday Life Insurance, Capsule and Tonic, Tags 2 Go, Bercos Popcorn, Pritzker Law Group, or Pro Fence and Deck. Details in the per client sections.
8. Client emails for Kimberly James Bridal, NKCDC, and Shadow Heating and Cooling contain lead names, phone numbers, and personal email addresses. None were copied into this file.
9. Credentials: none were read or copied. Threads that discuss logins or access (Nexla onboarding 1a01b517fdc49369, Bar Crawl USA access grants in 1a0592c581c51729) record only the fact that access was granted.

## Align HCM (client id align-hcm)

Context that matters for the pitch: Align HCM was Dillon's employer through September 2, 2026 (stated in 1a0a151fbfa3e0b9). Every Align "report" in this mailbox is a self sent internal deliverable, not a report sent to a client contact. The one Google measurement is real and strong.

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Aug 25, 2026 | 1a038f4ffe071af3 | Google (sc-noreply) | Congrats on reaching 350 clicks in 28 days! | "On Aug 23, 2026 your site https://www.alignhcm.com/ reached 350 from Google Search in the past 28 days" | measured, Google automated email |
| Jul 28, 2026 | 19fa984ffea81e66 | Google (sc-noreply) | Get started using Search Console with alignhcm.com | property verified July 28, 2026 | measured, setup only |
| Aug 2, 2026 | 19fc0d5efda1bc9d | Google (sc-noreply) | [Monitor the Google Search traffic to alignhcm.com] | impressions collection started July 31, 2026 | measured, setup only |
| Jul 30, 2026 | 19fb4ff8ea380ac1 | Google (sc-noreply) | [alignhcm.com associated with Google Analytics property Align HCM GA4] | association created | measured, setup only |
| Aug 7, 2026 | 19fde922013dba72 | Google (sc-noreply) | [New reasons prevent pages from being indexed on alignhcm.com] | "Page with redirect" and "Alternate page" | measured, site health |
| Jul 30, 2026 | 19fb0b5d155c0690 | Google (sc-noreply) | [AMP issues detected on alignhcm.com] | AMP issue notice | measured, site health |
| Jul 31, 2026 | 19fb8f5b911dc22b | Momentum (self sent) | Align HCM July 2026 SEO Growth Report | "July organic growth overview, keyword wins, LinkedIn reach"; attachment Align_HCM_July_2026_SEO_Growth_Report.pdf; no numbers in the body | delivered report artifact, internal |
| Jun 30, 2026 | 19f18c01d6b59c01 | Momentum (self sent) | Align HCM June 2026 Performance Report PDF | Semrush snapshot: 503 organic keywords (up 3.9 percent), organic traffic 224 (down 24 percent), AI visibility 14, 2 AI mentions, 90 cited pages, authority score 22, 207 referring domains, 529 backlinks; LinkedIn 8,673 impressions (up 22.5 percent), 214 reactions, 302 new followers; attachment 2026-06-align-hcm-performance-report.pdf | Momentum claim, Semrush and LinkedIn derived |
| Jul 15, 2026 | 19f665fa60fc047b | Momentum (self sent) | [Align HCM HubSpot KPI report] | 96 new contacts in 30 days, 87 leads, 9 opportunities, 23 new deals, 7 closed won totaling $200,000 in 30 days, 57 open deals worth $17,619,714, 9 form submissions, 1 AI referral contact; the report itself notes "Google organic impressions, clicks, and rankings require a Google Search Console connection" | Momentum claim, HubSpot pull |
| Sep 14, 2026 | 1a09d7514598f1d8 | Momentum (self sent, interview prep) | [Empeon interview prep: brief, Semrush keywords, Align proof and collateral] | "One documented buyer came from Google to an Align blog, submitted a qualified form, and became a $54,000 closed deal"; "Additional $108,000 closed won: CRM Website source"; "$2.19M supported open pipeline"; described as "historical ledger figures, not a fresh CRM pull"; attachments Empeon Interview Brief 2026-09-13.pdf and a ZIP with an Align attribution work sample | Momentum claim, historical ledger |
| Sep 14, 2026 | 1a0a151fbfa3e0b9 | Momentum (self sent, session summary) | [Summary: Empeon and Align audit continued locally] | "552 clicks / 92,972 impressions for 27 Jul to 11 Sep" from a direct Search Console read; Search Console history begins 2026-07-27; GA4 property 320235048; a 254 day gap table | Momentum claim about a measurement held on disk |
| Aug 11, 2026 | 19ff246d9d8cfefc | Momentum (self sent) | [Align HCM SmartCare SEO and Site Health Report] | SmartCare page live at alignhcm.com/align-hcm-smartcare; attachment Align-HCM-SmartCare-SEO-Site-Health-Report-2026-08-11.pdf | delivered report artifact, internal |
| Jul 14, 2026 | 19f61b245ca40c88 | Momentum (self sent) | [Align HCM blog is live] | https://www.alignhcm.com/blog/6-things-before-payroll-implementation returns HTTP 200 | Momentum claim |
| Jul 2, 2026 | 19f248702c0de7bf | Momentum (self sent) | [Align HCM website work summary, July 2, 2026] | attachment align-hcm-website-work-summary-2026-07-02.pdf with a "ranking impact" section | delivered report artifact, internal |
| Aug 21, 2026 | 1a021be4266da24f | Momentum (self sent) | [HRchitect growth opportunity package] | "current Google AI Overview rechecks" for a prospect, not a client | Momentum claim, prospect work |

Testimonial candidates: none. No email from an Align HCM contact acknowledging a result exists in this mailbox. The only inbound Align related mail is Search Console automation.

Strongest line: Google Search Console emailed on August 25, 2026 that alignhcm.com reached 350 clicks from Google Search in the 28 days ending August 23, 2026, one month after the property was verified (thread 1a038f4ffe071af3).

Caveat for the pitch: the $54,000 closed deal attribution and the 552 click figure are Dillon's own notes prepared for a job interview after leaving Align. They are described in the notes themselves as historical ledger figures, not a fresh CRM pull, and no Align contact confirms them by email.

## Bar Crawl USA (client id bar-crawl-usa)

Depth pass: every report thread to the owner from February through September 2026 was opened, plus every reply from him. Owner replies are quoted verbatim; where the original contains a dash the quote is split into fragments.

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Feb 13, 2026 | 19c58c71bcc80b67 | Momentum | [kickoff scope thread] | "I'll conduct an SEO audit" through Semrush covering "Organic search performance and keyword rankings" and technical SEO reporting | scope statement |
| Feb 13, 2026 | 19c58c71bcc80b67 | Client | [kickoff scope thread] | "Thanks Dillion. Looking forward to working with you" | client praise, mild |
| Mar 19, 2026 | 19d042f8219c76aa | Momentum | Beltline Campaign Update | 82 clicks, 1,332 impressions, 5 ticket form submissions, $9.49 cost per conversion, $47.46 spend | Momentum claim |
| Mar 19, 2026 | 19d042f8219c76aa | Client | Re: Beltline Campaign Update | "Looks great Dillion" and "I am thinking I might have to sell out the event (good problem to have) as we are already on great pace for tickets." | client confirmation, no number |
| Mar 19, 2026 | 19d042f8219c76aa | Client | Re: Beltline Campaign Update | "Talked with Mac" and "signed up for another few months" and "Let's do $200 overall for each city" | client confirmation, renewal |
| Apr 8, 2026 | 19d6afa1458ac19e | Momentum | [PMax campaign update] | 13 form submissions in 3 days, $5.28 cost per conversion, 102 clicks, $68.62 spend; Chattanooga 7 submissions at $3.18, Soulard 4 at $1.80, Duluth 2 at $19.58 | Momentum claim |
| Apr 8, 2026 | 19d6afa1458ac19e | Client | [PMax campaign update] | "Appreciate it Dillon for the numbers, professionalism, and follow up." and later "Sounds like you got a good plan Dillon, we will let you do your thing!" | client praise |
| Apr 13, 2026 | 19d87457f6f7cfbb | Momentum | [PMax update, 53 tickets, all April 25 cities live] | 53 ticket submissions on $529.74, $9.99 per ticket; Chattanooga 26 ($7.47), Soulard 18 ($10.90), Duluth 9 ($15.49); nine April 25 cities live | Momentum claim |
| Apr 28, 2026 | 19dd1c65cbd68604 | Momentum | [weekly Google Ads report, April 20 to 26] | 402 tickets sold (form submission conversions), $3,594.89 spend, $8.94 per ticket, 291,909 impressions across 18 campaigns | Momentum claim |
| Apr 28, 2026 | 19dd1c65cbd68604 | Client | [weekly Google Ads report, April 20 to 26] | "I don't doubt the impressions, but we were under in sales in all cities for our April 25th events compared to last year" and a request for affiliate links | client pushback, must be disclosed |
| Apr 28, 2026 | 19dd4b7bb4b487fb | Client | [weekly Google Ads report follow up] | "Totally get it. It wasn't a problem with the detailed service you are providing" and "Thanks Dillion." | client feedback |
| May 12, 2026 | 19e19e62ed373b54 | Momentum | [May performance report, May 1 to 11] | 766 clicks, 7.82K impressions, $254 spend, 9.80 percent CTR | Momentum claim |
| May 12, 2026 | 19e19e62ed373b54 | Client | [May performance report] | "Do you have data on organic search web clicks on the pages you created for each city?" | scope statement, client asks for organic proof |
| May 14, 2026 | 19e270fe3c8f81b5 | Momentum | [Taco and Tequila SEO performance report] | Google Sheet with page level clicks, impressions, CTR, and average position; no numbers in the body | delivered report artifact (Google Sheet link) |
| Jun 8, 2026 | 19ea5379d3764eb4 | Momentum | [report: 55 tickets sold] | 55 tickets sold: Atlanta BeltLine 29 on $235.62 ($8.12 per ticket), Lakewood 26 on $197.36 | Momentum claim |
| Jun 8, 2026 | 19ea5379d3764eb4 | Client | [report: 55 tickets sold] | "now that we are done with the ads would you be able to do a report on our domain rank, page rank, keywords etc?" | scope statement, client asks for a ranking report |
| Jun 10, 2026 | 19ea77c03f02e91d | Momentum | [reply agreeing to the ranking report] | attachment BarCrawlUSA Q4 2026 Seasonal SEO Plan.docx | scope artifact |
| Jun 30, 2026 | 19f1624a64256b91 | Momentum | [weekly and monthly BCUSA report] | SEO updates across ten pages (AIOSEO titles and meta descriptions) | Momentum claim, work done |
| Jul 13, 2026 | 19f1624a64256b91 | Client | [weekly and monthly BCUSA report] | "go off this list for Halloween" (corrected city list, July 1 and July 13) | client correction |
| Jul 14, 2026 | 19f5e5618fb4ca65 | Momentum | [SEO opportunity audit] | attachment bar_crawl_usa_seo_opportunity_audit.pdf; Mac (Momentum) replied "Thats clear and makes sense." | delivered report artifact |
| Aug 3, 2026 | 19fc997290a06675 | Momentum | [July recap and August SEO plan] | 12 existing Boos and Booze pages optimized; attachment Momentum-360-July-2026-Bar-Crawl-USA.pdf | delivered report artifact |
| Aug 4, 2026 | 19fc997290a06675 | Client | [July recap and August SEO plan] | "Are you the man!" and "you got a great one on your team with Dillon!" and "I do think we need to look into pausing our work together and only bringing it back when business levels spike like our Halloween or Taco & Tequila in the spring." | client praise plus pause request, both must be shown |
| Aug 4, 2026 | 19fc997290a06675 | Momentum (Mac) | [July recap and August SEO plan] | "Dillon is doing great work with us and really cares." | Momentum statement |
| Aug 5, 2026 | 19fc997290a06675 | Client | [July recap and August SEO plan] | "Totally get it on the August work." | client acknowledgement |
| Aug 18, 2026 | 1a0121c12959a9e1 | Momentum | [weekly report, August 10 to 16] | attachment Bar-Crawl-USA-weekly-report-2026-08-10-to-2026-08-16.pdf | delivered report artifact |
| Aug 24, 2026 | 1a03422939e847aa | Momentum | [weekly report, August 17 to 23] | weekly report PDF plus BCUSA-Boos-and-Booze-Oct2026-teaser-v7-email.mp4; ten Halloween city page drafts | delivered report artifact |
| Sep 1, 2026 | 1a0592c581c51729 | Momentum | [August 2026 monthly report] | all ten Halloween city pages live, indexable, in the sitemap, 92 of 100 launch readiness; attachments bar-crawl-usa-august-2026-monthly-report.pdf and Bar Crawl USA Halloween Landing Page Launch Scorecard.pdf | delivered report artifact |
| Sep 9, 2026 | 1a0592c581c51729 | Client | [August 2026 monthly report] | "This work Dillon?" and "Dillion let me know if you got admin acces" (client granted Search Console Full User and Eventbrite admin access) | client confirmation of access |
| Sep 9, 2026 | 1a0592c581c51729 | Momentum | [August 2026 monthly report] | "All ten Halloween city guides report Submitted and indexed with a PASS verdict, last crawled August 28" | Momentum claim, read from Search Console |
| Sep 10, 2026 | 1a08cb1635c1d688 | Momentum | Bar Crawl USA report | "From August 10 to September 7 the site earned 2,356 clicks on 68,203 impressions. That is 160 percent more clicks than the 29 days before it... 905 clicks. Paid search was dark the entire window." and "August as a month did 2,300 clicks against 749 in July"; Google Ads February through June: 395,379 impressions, 10,562 clicks, $6,936.73; report at bar-crawl-usa-2026-09-10-andy-report.netlify.app | Momentum claim citing Search Console, strongest organic number in the mailbox |
| Sep 11, 2026 | 1a0592c581c51729 | Client | [August 2026 monthly report] | "The last 4 are not happening" (Gainesville, Asheville, Fort Worth, Knoxville) plus a question about the Roswell Halloween page | client feedback |
| Sep 12, 2026 | 1a0592c581c51729 | Momentum | [August 2026 monthly report] | "It was done for organic traffic purposes (which it did!)" | Momentum claim |
| Sep 15, 2026 | 1a0592c581c51729 | Momentum | [August 2026 monthly report] | "the increase in organic traffic does not prove that the different layouts caused it." | Momentum caveat, keep with the claim |
| Aug 11, 2026 | 19feeb3569db27a1 | Momentum (self sent) | [Bar Crawl USA GA4 and Semrush seasonal performance report] | internal report, not sent to the client | delivered report artifact, internal |

Testimonial candidates (verbatim, client sender):
1. "Are you the man!" and "you got a great one on your team with Dillon!" (thread 19fc997290a06675, August 4, 2026). The same email asks to pause the engagement during the off season.
2. "Appreciate it Dillon for the numbers, professionalism, and follow up." (thread 19d6afa1458ac19e, April 8, 2026)
3. "Sounds like you got a good plan Dillon, we will let you do your thing!" (thread 19d6afa1458ac19e, April 8, 2026)
4. "Looks great Dillion" and "we are already on great pace for tickets." (thread 19d042f8219c76aa, March 19, 2026)
5. "It wasn't a problem with the detailed service you are providing" (thread 19dd4b7bb4b487fb, April 28, 2026)

Strongest line: In the Bar Crawl USA report sent September 10, 2026, Momentum told the owner that with paid search off the site earned 2,356 organic clicks on 68,203 impressions from August 10 to September 7, 160 percent more clicks than the prior 29 days (thread 1a08cb1635c1d688); this is a Momentum claim that cites Search Console, and Momentum's own follow up on September 15 says the layout change has not been proven as the cause (thread 1a0592c581c51729).

Caveats for the pitch: the client asked for a pause on August 4 and the September 10 report subject line acknowledges an answer owed since August 4. The April 28 reply says ticket sales were down year over year in every April 25 city despite the reported 402 form conversions. Neither should be hidden if this account is used as proof.

## Kimberly James Bridal (client id kimberly-james-bridal)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Jun 4, 2026 | 19e93be82c5bb673 | Client | [Chat GPT question] | a bride planned through ChatGPT and "my store did not pop up. Does anyone know how to make it into chat GPT?" | scope statement, client asks for AI visibility |
| Jun 4, 2026 | 19e93be82c5bb673 | Momentum (Mac) | [Chat GPT question] | "If I ask for Chestnut Hill then AI gives KJB as the best option" | Momentum claim, no screenshot |
| Jun 5, 2026 | 19e93be82c5bb673 | Momentum | [Chat GPT question] | AEO scope described; "I have four blogs right now for different clients that are linked to Google AI overview and are ranking number one on Google" | Momentum claim, no client named, unverified |
| Jun 8, 2026 | 19ea483dc40992c3 | Momentum | [report: 8 Meta leads] | 8 Meta leads at $9.39; Google 83,501 impressions, 731 clicks, $379.25, $0.52 CPC | Momentum claim |
| Jun 8, 2026 | 19ea483dc40992c3 | Client | [report: 8 Meta leads] | "$9.00 seems pretty high" then "Ok thank you for explaining." | client feedback |
| Jun 15, 2026 | 19ebd764a045a2d1 | Client | [lead report] | "Thank you so much Dillon" and "Thank you for all your hard work!" | client praise |
| Jul 6, 2026 | 19f3634713c181ed | Momentum | [June report] | Google $532.59, 56,555 impressions, 1,208 clicks, $0.44 CPC, 0 tracked conversions; Meta $494.54, 35 lead results, $14.13 per result; attachment kimberly-james-bridal-2026-06.pdf | delivered report artifact |
| Jul 2026 | 19f3634713c181ed | Client | [June report] | "Thank you Dillon for this report." | client acknowledgement |
| Aug 11, 2026 | 19fee4a0ae7c9164 | Momentum | [weekly report, August 3 to 9] | 2 Meta leads at $34.40; Google 46 clicks, 676 impressions, $156.61, 6.80 percent CTR; weekly report PDF attached | delivered report artifact |
| Aug 12, 2026 | 19fee4a0ae7c9164 | Client | [weekly report, August 3 to 9] | "Thank you so much for this update! I will reach out to the brides." | client confirmation that leads were received |
| Aug 17, 2026 | 19fee4a0ae7c9164 | Momentum | [weekly report, August 10 to 16] | four Higher Intent leads; $139.97 on 37 clicks, $3.78 CPC | delivered report artifact |
| Aug 18, 2026 | 19fee4a0ae7c9164 | Client | [weekly report, August 10 to 16] | "Thank you!" | client acknowledgement |
| Aug 24, 2026 | 1a0342198ec04ab5 | Momentum | [weekly report, August 17 to 23] | nine Meta form leads at $7.72; Google 25 clicks, 557 impressions, $103.98 | delivered report artifact |
| Aug 24, 2026 | 1a035bea0000da5f | Momentum | [six new Meta leads] | six named leads with form answers (personal data, not copied); attachment kimberly-james-bridal-weekly-report-2026-08-17-to-2026-08-23-UPDATED.pdf | delivered report artifact |
| Aug 26, 2026 | 1a035bea0000da5f | Client | [six new Meta leads] | "Thank you so much. Do you think Facebook ads are working better then google ads?" and, asked whether any had booked, "Not yet, Facebook ads are just annoying with the daily fee's that come out." | client feedback, leads not yet converted |
| Sep 1, 2026 | 1a058bab9ee2dadd | Momentum | [August 2026 monthly report] | Google 138 clicks, 2,393 impressions, $504.49; 11 Meta form leads across the two weekly windows; campaign screenshot: 18 form leads, $295.24, $16.40 per result; attachments kimberly-james-bridal-august-2026-monthly-report.pdf and kimberly-james-bridal-meta-campaign-2026-08-30.jpg | delivered report artifact with screenshot |
| Sep 1, 2026 | 1a058bab9ee2dadd | Client | [August 2026 monthly report] | "Thank you so much. Yes, lets stop google ads and see how Meta runs on it's own." | client decision |

Testimonial candidates (verbatim, client sender):
1. "Thank you so much for this update! I will reach out to the brides." (thread 19fee4a0ae7c9164, August 12, 2026)
2. "Thank you for all your hard work!" (thread 19ebd764a045a2d1, June 15, 2026)
3. "Thank you Dillon for this report." (thread 19f3634713c181ed, July 2026)

Strongest line: Kimberly James Bridal received the weekly report showing Meta form leads and Google search clicks and replied "Thank you so much for this update! I will reach out to the brides." (thread 19fee4a0ae7c9164, August 12, 2026); this is paid media lead delivery, not organic ranking, and on August 26 the client said none of the brides had come in yet (thread 1a035bea0000da5f).

## Fagan Painting (client id fagan-painting)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Jul 13, 2026 | 19f5d21188316d85 | Momentum | [Meta lead performance and SEO update] | June 22 to July 12: 13,204 impressions, 275 clicks, $379.80, 4 qualified opportunities (2 named website leads, 2 phone inquiries); attachment fagan_painting_seo_opportunity_audit.pdf | Momentum claim |
| Jul 26, 2026 | 19f9ef61eda72a95 | Client | Re: Update | "I think it would be a smart decision to keep you on board though. Because I think they're going to need help with AI optimizations for SEO" | client praise, request to retain for AI SEO |
| Jul 26, 2026 | 19f9ef61eda72a95 | Client | Re: Update | "It's very important to keep you on board" and "I definitely wanna keep you on the team." | client praise |
| Jul 26, 2026 | 19f9ef61eda72a95 | Momentum | Re: Update | "my one client we've scaled now over 50% of their organic traffic prior to last year solely through answer engine optimization" | Momentum claim, no client named, unverified |
| Aug 3, 2026 | 19f9ef61eda72a95 | Momentum | Re: Update | attachment Fagan_Painting_Website_AEO_GEO_Proposal.pdf | scope statement |
| Aug 6, 2026 | 19fd7a0af7d939c6 | Momentum (Phil, SEO on the Momentum side) | EOM July | KPI table April, May, June, July: organic keywords 409, 366, 370, 512; top 10 keywords 3, 13, 17, 20; backlinks 9.6k, 8.0k, 8.3k, 6.9k; traffic 240, 169, 242, 822; ad traffic 0, 0, 24, 344; organic leads 2, 5, 9, 10; "as of today, the site's ranking in the top 10 (page 1) for 39 keywords"; attachment Semrush-Position_Tracking__Landscape_(organic)-faganpainting_com-6th_Aug_2026.pdf | Momentum claim with Semrush export attached |
| Sep 1, 2026 | 1a0592b29f0675da | Momentum | [August 2026 monthly report] | "512 ranking keywords, including 39 top ten terms" and "your AEO journey is beginning now!"; attachment fagan-painting-august-2026-monthly-report.pdf | delivered report artifact |
| Sep 1, 2026 | 1a0592b29f0675da | Client | [August 2026 monthly report] | "Are we including GEO optimizations as well?" then, after "Yes!", "Awsome" | client acknowledgement |
| Sep 5, 2026 | 1a07323faf17909f | GitHub notification | Retire Fagan Painting, Shadow HVAC, and Jeff Hozias (PR #372) | vault PR title marks Fagan as retired | status signal, not client mail |

Testimonial candidates (verbatim, client sender):
1. "I think it would be a smart decision to keep you on board though. Because I think they're going to need help with AI optimizations for SEO" (thread 19f9ef61eda72a95, July 26, 2026)
2. "It's very important to keep you on board" and "I definitely wanna keep you on the team." (thread 19f9ef61eda72a95, July 26, 2026)
3. "Awsome" (thread 1a0592b29f0675da, September 1, 2026)

Strongest line: Fagan Painting's reported organic keyword count went from 370 in June to 512 in July 2026 with 39 keywords on page one as of August 6, per the Semrush position tracking export the Momentum team sent the owner (thread 19fd7a0af7d939c6); the owner's reply was to ask that GEO optimization be included and to say "Awsome" (thread 1a0592b29f0675da). The numbers are Momentum stated from a Semrush export, not client verified, and a September 5 vault PR marks the account as retired.

## Onsite Concrete and Landscape (client id onsite-concrete-landscape)

All reports below were sent by a Momentum team member (Grace) to the client with Dillon copied. No reply from the client address appears in the search results, so every row is a Momentum claim.

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Jul 6, 2026 | 19f391a65fa46360 | Momentum | [June report] | "The keyword 'Concrete Contractors' in Vacaville reached approximately the #1/top position" and "confirmed that the business is appearing in AI Overview results for targeted keywords"; attachments onsite-concrete-landscape-2026-06.pdf and Onsite GBP Monthly Report.pdf | Momentum claim, AI Overview named |
| Jul 14, 2026 | 19f391a65fa46360 | Momentum | [June report follow up] | "We are continuing to rank higher for all of the services you provide!"; Google Ads 8 contact actions (2 forms, 6 calls) on $52.66; PMax $2.89 cost per action | Momentum claim |
| Jul 27, 2026 | 19f391a65fa46360 | Momentum | [June report follow up] | $60.36 spend, 11,008 impressions, 344 clicks, $0.18 CPC | Momentum claim |
| Aug 4, 2026 | 19fcd7e893255942 | Momentum | [July report] | "July was the strongest month yet" and "One keyword reached #1 in the AI Overview, while another ranked #4 organically"; 31 schema markups; two Fairfield pages; three blogs; attachment Momentum-360-July-2026-Onsite-Concrete-Landscape.pdf | Momentum claim, AI Overview number one named |
| Aug 31, 2026 | 1a059a71bb59e671 | Momentum | [August report] | "'Landscaping outdoor spaces in Vacaville' is now ranking #6 organically and appearing near the top of the AI Overview, while 'Landscaping living spaces in Vacaville' has reached #4 organically and #1 in the AI Overview"; GBP 10 plus website clicks, 6 plus calls, 15 plus interactions, 3 new reviews; attachment onsite-concrete-landscape-august-2026-monthly-report.pdf | Momentum claim, AI Overview number one named |

Testimonial candidates: none found from the client address in this mailbox.

Strongest line: Momentum's August 2026 report to Onsite Concrete and Landscape states that "Landscaping living spaces in Vacaville" reached number 4 organically and number 1 in the Google AI Overview (thread 1a059a71bb59e671); this is the most specific AI Overview ranking claim in the mailbox, it is Momentum stated, and no client reply or Search Console email confirms it.

## Omega Landscaping and Concrete (client id omega-landscaping)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Jun 8, 2026 | 19c6c544e531d6ca | Momentum | Re: Adding User To Google Ad Account | first 8 days at $30 per day: 1,214 impressions, 56 clicks, 4.61 percent CTR, 2 form submissions, $62.71 cost per conversion, $125.42 spend | Momentum claim |
| Jun 8, 2026 | 19ea840e54d5a70b | Google (ads-noreply) | Omega Landscaping, you received 1 conversion last week | subject line number, body not opened | measured, Google automated email |
| Jun 15, 2026 | 19ecb70fd8667ac4 | Google (ads-noreply) | Omega Landscaping, you received 3 conversions last week | subject line number, body not opened | measured, Google automated email |
| Jun 22, 2026 | 19ea5383c73d87d0 | Client | [weekly paid ads report] | "Thanks for the explanation. That makes sense. My biggest concern is just making sure we're getting in front of homeowners looking for landscaping, concrete, retaining walls..." | client feedback on lead quality |
| Jul 6, 2026 | 19f36353495e486a | Momentum | [June report] | $1,551.10 spend, 12,026 impressions, 350 clicks, 13 tracked conversion events, $119.32 per conversion; PMax 13 events at $86.85; attachment omega-landscaping-2026-06.pdf | delivered report artifact |
| Jul 20, 2026 | 19f811ff37d806a1 | Momentum | [Google Ads update, July 13 to 19] | $419.50 spend, 181 clicks, $2.32 CPC, 1 conversion | Momentum claim |
| Aug 3, 2026 | 19fc994ec8b44419 | Momentum | [July recap and August plan] | $1,473.45 spend, 697 clicks, 23,552 impressions, five leads (2 calls, 3 forms); attachment Momentum-360-July-2026-Omega-Landscaping-Concrete.pdf | delivered report artifact |
| Aug 10, 2026 | 19febd530ab757cc | Google (ads-noreply) | Omega Landscaping, you received 1 conversion last week | subject line number, body not opened | measured, Google automated email |
| Aug 17, 2026 | 1a00fe1965d66ce7 | Google (ads-noreply) | Omega Landscaping, you received 1 conversion last week | subject line number, body not opened | measured, Google automated email |
| Aug 24, 2026 | 1a034218971959f3 | Momentum | [weekly report, August 17 to 23] | 37 clicks, 728 impressions, 5.08 percent CTR, $279.34 spend, $7.55 CPC; the prior week (1a0121c129ce7356) reported conversions dropped to zero | delivered report artifact |
| Sep 7, 2026 | 1a07c0762f6b789d | Google (ads-noreply) | Omega Landscaping, you received 2 conversions last month | Customer ID 285-398-1364; August: 2 conversions (down 96 percent from last month), $486.93 cost per conversion, 127 clicks, 4.44 percent CTR; top campaign Search High Intent Colorado Springs, 2 conversions on $929.35 and 3K impressions; top keyword "landscape design build" 2 conversions | measured, Google automated email, unflattering |
| Sep 15, 2026 | 1a0a23fdb18b12a6 | Momentum | [weekly progress, September 7 to 13] | first search terms report run; ads had been serving against searches for competitor companies | Momentum candid finding |
| Sep 15, 2026 | 1a058bad09e4737f | Client | [August 2026 monthly report] | "I can hop on a call now"; call set for Thursday 4 PM Eastern | client engagement |

Testimonial candidates (verbatim, client sender):
1. "Thanks for the explanation. That makes sense." (thread 19ea5383c73d87d0, June 22, 2026)

Strongest line: Google's own automated emails to this mailbox recorded Omega Landscaping conversions week by week (one on June 8, three on June 15, one each on August 10 and August 17; threads 19ea840e54d5a70b, 19ecb70fd8667ac4, 19febd530ab757cc, 1a00fe1965d66ce7), and the September 7 monthly summary recorded 2 conversions at $486.93 each for August (thread 1a07c0762f6b789d); these are measured but they are paid search conversions, not rankings, and the August cost per conversion argues against using Omega as a proof point.

## NKCDC (client id nkcdc)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Apr 10, 2026 | 19d6fe88988e23aa | Client | [campaign strategy] | earlier "this is not quite what we are looking for." then, on the revised strategy, "looks really great, I'm excited!" | client praise, strategy approval |
| May 25, 2026 | 19e607c2ae197dbb | Momentum | [Meta leads update] | 2 Meta leads at $9.79 cost per lead | Momentum claim |
| Jun 8, 2026 | 19ea5388ee5e9393 | Momentum | [paid media report: 13 leads] | 13 leads, $255.62 spend, $19.66 blended cost per lead (Google 7 at $12.39, Meta 6 at $28.15) | Momentum claim |
| Jun 8, 2026 | 19ea5388ee5e9393 | Client | [paid media report: 13 leads] | "I don't see any submissions. Are these leads just people who clicked one of the links?" then "I see now there is a google sheet that was shared with names and emails." | client pushback then partial confirmation |
| Jul 4, 2026 | 19f2eac5d1fd238c | Momentum | [4 more qualified leads] | four named leads with contact details (personal data, not copied) | Momentum claim |
| Jul 6, 2026 | 19f3634be7fb3e26 | Momentum | [June report] | Google $120.93, 1,237 impressions, 249 clicks, 20.13 percent CTR, $0.49 CPC, 37 tracked conversions, $3.27 per conversion; Meta $495.04, 19 lead results; attachment nkcdc-2026-06.pdf | delivered report artifact |
| Jul 8, 2026 | 19ecd18ab47fd62d | Client | [weekly paid media report] | "At this point I think we should pause ads." | client decision, negative |
| Jul 13, 2026 | 19f5c1ba3274171c | Momentum | [ads paused, closeout] | ads paused; closeout week 347 impressions | status |
| Aug 2026 | 19fa54d7c9ec7f7e | Client | [Phase Two proposal follow up] | "I'll be looking at this tomorrow" | client acknowledgement |

Testimonial candidates (verbatim, client sender):
1. "looks really great, I'm excited!" (thread 19d6fe88988e23aa, April 10, 2026)

Strongest line: Momentum's June 2026 report to NKCDC stated a 20.13 percent Google Ads click through rate and a $3.27 cost per tracked conversion (thread 19f3634be7fb3e26); the client questioned lead quality on June 8 and asked to pause ads on July 8 (threads 19ea5388ee5e9393, 19ecd18ab47fd62d), so this account is not a clean proof point.

## Replenish and 7 Eleven (client id replenish-7-eleven)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Jun 17, 2026 | 19ed62bf60b46841 | Momentum | [CPC report, May 18 to June 16] | $0.33 blended CPC, 2,622 clicks, 141,657 impressions, $859.39 spend | Momentum claim |
| Jun 17, 2026 | 19ed62bf60b46841 | Client | [CPC report, May 18 to June 16] | "Beautiful report, Dillon." | client praise on a numeric report |
| Jun 29, 2026 | 19f1404cd6c63d43 | Momentum | [CPC report summary] | $0.35 CPC, 3,626 clicks, 186,635 impressions, $1,265.02 spend, 284 Get Directions | Momentum claim |
| Jul 6, 2026 | 19f393d0dcb1b9b1 | Momentum | [June report] | June monthly report | delivered report artifact |
| Jul 20, 2026 | 19f8114a0970c3e0 | Momentum | [San Diego City KPI report, July 13 to 19] | 26,514 impressions, 1,160 clicks, $438.75 spend, $0.38 CPC, 212 modeled Get Directions | Momentum claim |
| Jul 20, 2026 | 19f8114a0970c3e0 | Client | [San Diego City KPI report, July 13 to 19] | "Received with thanks, Dillion" and "Great results! Thank you!" | client confirmation with praise on a numeric report |
| Aug 2, 2026 | 19fc4a55fbfc3230 | Momentum (self sent) | [July 2026 monthly report PDFs] | attachment Momentum-360-July-2026-Replenish-7-Eleven.pdf among 11 client PDFs | delivered report artifact, internal |
| Aug 31, 2026 | 1a0593b144d21129 | Client (forwarding Google) | Fwd: Your Google Analytics performance report is in | Google Analytics for the Replenish property, August 4 to 31: 1.6K active users (down 54.19 percent), 1.6K new users, 19 second average engagement (up 16.84 percent), 8.2K events (down 56.37 percent); client note "Any recommendations on how to improve the campaign results? Drink sales also reflect this dip." | measured, Google automated email forwarded by the client, negative trend |
| Aug 31, 2026 | 1a0593b144d21129 | Momentum | Re: Fwd: Your Google Analytics performance report is in | August: 705 clicks, 38,690 impressions, $684.74 spend, $0.97 CPC | Momentum claim |
| Sep 1, 2026 | 1a0593b144d21129 | Client | Re: Fwd: Your Google Analytics performance report is in | "All stores are open" | client confirmation of store status |

Testimonial candidates (verbatim, client sender):
1. "Great results! Thank you!" (thread 19f8114a0970c3e0, July 20, 2026)
2. "Beautiful report, Dillon." (thread 19ed62bf60b46841, June 17, 2026)

Strongest line: After receiving the July 13 to 19 San Diego report showing 1,160 clicks at a $0.38 average cost per click and 212 modeled Get Directions actions, the Replenish contact replied "Great results! Thank you!" (thread 19f8114a0970c3e0); this is paid media, and the client's own Google Analytics email for August shows site users down 54 percent (thread 1a0593b144d21129).

## Fresh Blends and Kwik Trip (client id fresh-blends-kwik-trip)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Jun 15, 2026 | 19ecc4d93c36db93 | Momentum | [FreshBlends Kwik Trip report] | 101 Get Directions on $560.29, 1,044 clicks, $0.54 CPC, $5.55 per Get Direction | Momentum claim |
| Jun 15, 2026 | 19ecc4d93c36db93 | Client | [FreshBlends Kwik Trip report] | "This report looks great. Please let me know how I can follow the data in Google Console" | client praise on a numeric report |
| Jun 2026 | 19ecc4d93c36db93 | Client | [FreshBlends Kwik Trip report] | "Thanks so much, Dillon!" | client praise |
| Jul 6, 2026 | 19f393ccec018ed6 | Momentum | [June report and final week CPC] | $2,000 spend, $0.50 CPC, 204,969 impressions, 738 Get Directions at $2.71 | delivered report artifact |
| Jul 9, 2026 | 19f393ccec018ed6 | Client | [June report and final week CPC] | "Thank you, Dillon. We will pause for now." | client decision |

Testimonial candidates (verbatim, client sender):
1. "This report looks great." (thread 19ecc4d93c36db93, June 15, 2026)
2. "Thanks so much, Dillon!" (thread 19ecc4d93c36db93, June 2026)

Strongest line: The Fresh Blends contact replied "This report looks great." to the June 15, 2026 report showing 101 Get Directions actions on $560.29 of spend (thread 19ecc4d93c36db93); the campaigns were paused at the client's request on July 9 after the June report (thread 19f393ccec018ed6).

## Nexla (client id nexla)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Aug 20, 2026 | 1a01b517fdc49369 | Client | [onboarding] | "Lets go through with POC as is. Results are more important and of most interest." | scope statement |
| Aug 20, 2026 | 1a01b517fdc49369 | Momentum | [onboarding] | attachment Nexla-Google-Ads-Audit-2026-08-20.pdf | delivered audit artifact |
| Sep 3, 2026 | 1a0219ad3ad53df0 | Momentum | [campaigns live] | Brand Exact at $25.00 per day, MCP Search at $40.75 per day | Momentum claim |
| Sep 4, 2026 | 1a0219ad3ad53df0 | Client | [campaigns live] | "Thanks Dillon." and "Thank you Dillon. Looking forward to it." | client acknowledgement |
| Sep 9, 2026 | 1a081d3c706e1ee9 | Client | [weekly progress, September 1 to 8] | client questions on the first weekly report | client engagement |
| Sep 15, 2026 | 1a0a24112b55a019 | Momentum | [weekly progress, September 7 to 13] | "$365.95 across 85 clicks, zero recorded conversions"; the conversion goal had contained a CRM action, corrected September 10; "measurement repair is built and tested" | Momentum candid claim |
| Sep 15, 2026 | 1a0a62b5d75b6934 | Client | [GA4 access] | client granted GA4 view access to the nexla.com property; GTM container version 61 published | client grants access |

Testimonial candidates: none beyond "Thanks Dillon." (thread 1a0219ad3ad53df0).

Strongest line: There is no Nexla result to quote yet; the September 7 to 13 report to Nexla states $365.95 in spend, 85 clicks, and zero recorded conversions with a measurement repair in progress (thread 1a0a24112b55a019).

## Puttery NYC (client id puttery-nyc)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Aug 27, 2026 | 1a044b4f7b5f66b3 | Read AI meeting notes | [Puttery x Momentum kickoff call] | integration connecting Tock reservation data with marketing attribution | scope statement, third party notes |
| Sep 10, 2026 | 1a08d23437b02c05 | Momentum | [access needed to unlock Meta and Google attribution] | dashboard at nyc-entertainment-attribution-dashboard-20260804.netlify.app | Momentum claim |
| Sep 14, 2026 | 1a08d23437b02c05 | Momentum | [access needed] | "dashboard has moved from example figures to real reservation data" and "deliberately labelled attribution pending"; Tag Manager, Analytics, and the reservations feed verified | Momentum claim, no results yet |
| Sep 15, 2026 | 1a08d23437b02c05 | Client | [access needed] | "can you jump on a call" | client engagement |
| Sep 15, 2026 | 1a0a5dcfa1787c03 | Momentum | [Look Alive, what is needed from each platform] | focus moved to Look Alive with Puttery parked; "reservation clicks from Look Alive reach GA4 as a key event" | Momentum claim, scope change |

Testimonial candidates: none.

Strongest line: There is no Puttery result to quote; as of September 15, 2026 the attribution dashboard carries real reservation records but is labelled attribution pending and the Puttery work is parked in favor of Look Alive (threads 1a08d23437b02c05, 1a0a5dcfa1787c03).

## Bridge Software (client id bridge-software)

Work type is product design and front end build, not search. Included because the client praise is real.

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Aug 17, 2026 | 1a010a5e42734ccc | Momentum (Melissa) | [Phase 2 complete, ready for review] | presentation delivered | delivered artifact |
| Aug 18, 2026 | 1a010a5e42734ccc | Client | [Phase 2 complete] | "I'll go through all five sections and get back to you... I'll get payment out tomorrow" | client sign off signal |
| Aug 23, 2026 | 1a0267f62c115333 | Client | [Phase 3 follow up] | "thank you for all your hard work thus far :)" | client praise |
| Sep 3, 2026 | 1a0267f62c115333 | Client | [Phase 3 follow up] | "LOVE THE TAGLINE", "get me PUMPED!", "I'm enticed!" | client praise, design |
| Sep 3, 2026 | 1a0346864f3069d0 | Client | [Bridge update, Phase 2 and 3] | "Thank you for all the hard work on this." | client praise |
| Sep 2026 | 1a0660559dc94c9c | Momentum (self sent) | [Milestones 1 to 3 report] | 13 page report PDF | delivered report artifact, internal |
| Sep 14, 2026 | 1a06f0a494ac8775 | Client | [Friday night Bridge surprise] | "Thank you D! Going over this the next two days" and "Thank you so much looking forward to chatting!" | client praise |

Testimonial candidates (verbatim, client sender):
1. "LOVE THE TAGLINE" (thread 1a0267f62c115333, September 3, 2026)
2. "Thank you for all the hard work on this." (thread 1a0346864f3069d0, September 3, 2026)
3. "thank you for all your hard work thus far :)" (thread 1a0267f62c115333, August 23, 2026)

Strongest line: The Bridge founder reviewed the Phase 3 build and wrote "LOVE THE TAGLINE" and "I'm enticed!" (thread 1a0267f62c115333, September 3, 2026); this is product design praise, not a ranking result.

## VA Claims Edge (client id va-claims-edge)

Work type is custom portal build plus website. No ranking numbers exist in the mail.

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Aug 5, 2026 | 19fa3e74b9e2919d | Client | [weekly check in] | client approved portal.vaclaimsedge.com as the portal address | client sign off |
| Aug 17, 2026 | 19fee385c13a9a26 | Momentum | [weekly reports, August 3 to 16] | Phase Two closed August 15 with a live review portal at va-claims-edge-phase-two-review.netlify.app; attachments va-claims-edge-weekly-report-2026-08-03-to-2026-08-09.pdf and va-claims-edge-weekly-report-2026-08-10-to-2026-08-16.pdf | delivered report artifact |
| Aug 18, 2026 | 19fee385c13a9a26 | Momentum (James) | [weekly reports] | "some of the seo we have already implemented is starting to gain traction"; attachment GA4_Reports_Snapshot_Momentum_SinglePage.pdf | Momentum claim, GA4 snapshot attached, no numbers in the body |
| Aug 18, 2026 | 19fee385c13a9a26 | Client | [weekly reports] | "That is pretty cool" | client acknowledgement |
| Aug 24, 2026 | 1a034218f21dc8fa | Momentum | [weekly report, August 17 to 23] | weekly report | delivered report artifact |
| Sep 9, 2026 | 1a081d3d7a68ba49 | Momentum | [weekly progress, September 1 to 8] | weekly report | delivered report artifact |
| Sep 15, 2026 | 1a0a240f1f85b448 | Client | [weekly progress, September 7 to 13] | "Thanks for sending that over, I'll take a look at the report. I am available to meet this week." | client acknowledgement |

Testimonial candidates (verbatim, client sender):
1. "That is pretty cool" (thread 19fee385c13a9a26, August 18, 2026)

Strongest line: The VA Claims Edge owner called the GA4 traffic snapshot "pretty cool" (thread 19fee385c13a9a26, August 18, 2026); the snapshot lives only in the attached PDF and no number is stated in the email.

## Hope Wellness Center (client id hope-wellness-center)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Jul 2, 2026 | 19f23f4949fbc823 | Read AI meeting notes | [Hope Wellness Center and M360 meeting, July 2, 2026] | "technical SEO audit and organic results" | third party notes, unverified |
| Jul 2, 2026 | 19f2438a50f817d3 | Momentum | [keyword research and website audit] | keyword research plus website audit PDF | delivered artifact |
| Jul 16, 2026 | 19f6b507f6dcf4d2 | Momentum | [analysis, implementation queue, completed animation] | analysis and animation delivered | delivered artifact |
| Jul 29, 2026 | 19fab22d78789e5c | Client | [next content priorities] | "That looks great Dillon!" (brand video) | client praise, video |
| Aug 2, 2026 | 19fc46e0e95f53e9 | Momentum (self sent) | [July 2026 monthly report] | attachment Momentum-360-July-2026-Hope-Wellness-Center.pdf | delivered report artifact, internal |
| Sep 9, 2026 | 1a081d3bf4a06383 | Momentum | [weekly progress, September 1 to 8] | weekly report | delivered report artifact |

Testimonial candidates (verbatim, client sender):
1. "That looks great Dillon!" (thread 19fab22d78789e5c, July 29, 2026)

Strongest line: The Hope Wellness Center owner replied "That looks great Dillon!" to the brand video (thread 19fab22d78789e5c); no ranking or traffic number for this client exists in the mail.

## Revive Systems (client id revive-systems)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Aug 8, 2026 | 19fe19166060e052 | Client (forwarding Google Business Profile) | [Fwd: your performance report for July 2026] | 479 profile views (up 20 percent), 23 website visits (up 76 percent), 21 direction requests (down 70 percent), 1 call, 23 searches (up 15 percent), top search term "gyms near me" | measured, Google automated email forwarded by the client |
| Aug 18, 2026 | 1a0126af087ec165 | Client | [approval of background check] | "I would give ANYTHING for a lead" | client frustration, negative |
| Sep 8 to 11, 2026 | 1a081d3d58d765a3 | Momentum | [weekly progress, September 1 to 8] | Local Services Ads background check passed; no leads yet | Momentum candid claim |
| Sep 11, 2026 | 1a081d3d58d765a3 | Client | [weekly progress, September 1 to 8] | "I am begging for a lead at this point" and "I know you all are fighting for me" | client sentiment, no result |
| Aug 2026 | 1a03d48000199d40 | Google notification | [New Google review] | a customer review of Revive, not of Momentum | not evidence for Momentum |

Testimonial candidates: none usable. The client's mail documents waiting on Google Local Services verification with no leads.

Strongest line: Do not use Revive Systems as proof; the only measured number is a Google Business Profile report for July 2026 showing 479 profile views and 23 website visits (thread 19fe19166060e052), and the client wrote on August 18 that he would give anything for a lead (thread 1a0126af087ec165).

## Deborah Mara (client id deborah-mara)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Sep 10, 2026 | 1a08d8e44eebc5e8 | Momentum | [AI Search Visibility pack plus ChatGPT Ads section] | scope: ChatGPT, Perplexity, Google AI Overviews, and Claude naming her; four answer pages; homes.com profile 5.0 stars on 111 reviews; attachment Deborah-Mara-ChatGPT-Ads-Section-2026-09-10.pdf | scope statement |
| Sep 15, 2026 | 1a0a101e64fad80d | Client | [website progress and next steps] | "I need everything to start so I can get new leads." | client expectation, no result yet |
| Sep 2026 | 1a0a5b2f47bbd61a | Momentum (Beth) | [weekly update] | weekly update | delivered artifact |

Testimonial candidates: none. Engagement started in September 2026.

Strongest line: No result exists yet; the September 10, 2026 scope email promises configuration so ChatGPT, Perplexity, Google AI Overviews, and Claude can name the client for her markets (thread 1a08d8e44eebc5e8).

## Cindy May Christmas (client id cindy-may-christmas)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Sep 13, 2026 | 1a056301db6e2217 | Client | [homepage concept for Jack and May Team Realtors] | "The homepage concept for Jack looks amazing. I clicked through and was genuinely impressed... It's exactly the kind of thoughtful work I'd expect from you." | client praise, design concept |

Testimonial candidates (verbatim, client sender):
1. "The homepage concept for Jack looks amazing. I clicked through and was genuinely impressed." (thread 1a056301db6e2217, September 13, 2026)
2. "It's exactly the kind of thoughtful work I'd expect from you." (thread 1a056301db6e2217, September 13, 2026)

Strongest line: Cindy May wrote that the homepage concept "looks amazing" and that she "was genuinely impressed" (thread 1a056301db6e2217, September 13, 2026); this is a design concept for a related business, not a ranking result.

## BigOrange Marketing (client id bigorange-marketing)

Context: a paid pilot (35 hours at $30 per hour, $1,050) that started in August 2026 and was paused by the client on September 8. Search Console mail for this property exists, which makes it the only roster client with two consecutive monthly Google performance emails.

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Aug 4, 2026 | 19fcce6ff05447f8 | Google (sc-noreply) | [Your July Search performance for bigorange.marketing] | 389 clicks, 210K impressions; top query "big orange marketing" 53 clicks | measured, Google automated email, before the pilot |
| Sep 8, 2026 | 1a08149ff72e3f1a | Google (sc-noreply) | [Your August Search performance for bigorange.marketing] | 312 clicks, 215K impressions, 2 pages with first impressions; top queries "big orange marketing" 28, "bigorange marketing" 20, "storybrand website examples" 10 | measured, Google automated email, pilot month |
| Sep 8, 2026 | 1a0813528352d522 | Google (sc-noreply) | [Disavow file updated for bigorange.marketing] | disavow file updated September 8 | measured, action record |
| Sep 2, 2026 | 1a05f90a0e1a4a49 | Momentum | [BigOrange complete WordPress SEO, AEO, and GEO growth package] | five blogs totaling 6,093 words; 8 PDFs and 7 decks attached including BigOrange-Complete-WordPress-SEO-AEO-GEO-Growth-Plan-2026-09-02.pdf; Lighthouse mobile score 32 with a 36.1 second LCP (August 20 lab run) | delivered artifact, scope |
| Sep 8, 2026 | 1a05f90a0e1a4a49 | Client | [growth package] | "Thank you for your hard work and progress on this. Let's pause the project for now" | client praise plus pause |
| Aug 2026 | 1a02247a94607a5f | Client | [pilot scope] | "Looks like you are applying for some of the work you are already doing for us?" | client note on scope |

Testimonial candidates (verbatim, client sender):
1. "Thank you for your hard work and progress on this." (thread 1a05f90a0e1a4a49, September 8, 2026)

Strongest line: Google Search Console measured bigorange.marketing at 389 clicks and 210K impressions in July and 312 clicks and 215K impressions in August 2026 (threads 19fcce6ff05447f8, 1a08149ff72e3f1a); clicks fell month over month, the drafted articles were not published during the pilot, and the client paused the pilot on September 8, so this is a measurement, not a win.

## Shadow Heating and Cooling (client id shadow-heating-cooling)

| Date | Thread id | Sender role | Subject | Short quote | Evidence label |
|---|---|---|---|---|---|
| Jul 14 to 28, 2026 | 19f628be1e96a5de, 19f6ed4f01527231, 19fa607b999fb56c, 19fa6093d3b33d7b, 19faa22195d6aab1 | Google (sc-noreply) | [shadow-heating.com Search Console setup, indexing, and ownership emails] | impressions collection started July 15, 2026; indexing issue notices; owners added | measured, setup only |
| Jul 28, 2026 | 19fa9a9a779630ab | Momentum | [website and account handoff] | handoff PDF delivered | delivered artifact, handoff |
| Jul 28, 2026 | 19fa9a9a779630ab | Client | [website and account handoff] | two website form fills named, "Somewhere around the 20th of this month." | client confirmation, 2 form fills, channel not stated |
| Aug 24, 2026 | 1a03055fc1783147 | Google (sc-noreply) | [owner change on shadow-heating.com] | ownership change notice | measured, setup only |
| Sep 5, 2026 | 1a07323faf17909f | GitHub notification | Retire Fagan Painting, Shadow HVAC, and Jeff Hozias (PR #372) | vault PR marks Shadow HVAC retired | status signal |

Testimonial candidates: none.

Strongest line: The Shadow Heating and Cooling contact confirmed that two people filled out the website forms around July 20, 2026 (thread 19fa9a9a779630ab); the site was handed off the same week and the channel that produced the forms is not stated.

## Clients with nothing usable in Gmail

1. Pro Fence and Deck (pro-fence-deck): only internal creative production mail (threads 19fae9089f9d1795, 19fac0d9ceb3b5f0). No client correspondence and no results.
2. Pritzker Law Group (pritzker-law-group): only a July 28, 2026 podcast meeting recap (thread 19fa946778db9af8). No results.
3. GT Clinic: proposal and contract thread in September 2026 (1a026842dcaf10fb), an internal audit (1a02771ad48783bf), and a kickoff invitation for September 15 (1a0875e2b4691126). Not yet a results story.
4. Tags 2 Go (tags-2-go): mentioned only as a campaign style reference in an internal approval note (1a03fd2c1c0ab5e9). No client mail found.
5. Bercos Popcorn, Green Slate Masonry, Everyday Life Insurance: no mail found. Capsule and Tonic appears only in a Google Ads promotional email with no performance data (19fd30d087bc299d).

## Google automated performance emails

Every row here is a measurement produced by Google and delivered by email. Property, numbers, and thread id are given. Rows for properties outside the roster are listed so the lead can see they were not confused with client data.

| Property | Sender | Date | Numbers | Thread id |
|---|---|---|---|---|
| https://www.alignhcm.com/ | sc-noreply@google.com | Aug 25, 2026 | 350 clicks from Google Search in the 28 days ending Aug 23, 2026 | 1a038f4ffe071af3 |
| https://www.alignhcm.com/ | sc-noreply@google.com | Jul 28 to Aug 7, 2026 | property verified; GA4 association; impressions collected from Jul 31; indexing issues (redirect, alternate page); AMP issue | 19fa984ffea81e66, 19fb4ff8ea380ac1, 19fc0d5efda1bc9d, 19fde922013dba72, 19fb0b5d155c0690 |
| https://bigorange.marketing/ | sc-noreply@google.com | Aug 4, 2026 | July: 389 clicks, 210K impressions; top query "big orange marketing" 53 | 19fcce6ff05447f8 |
| https://bigorange.marketing/ | sc-noreply@google.com | Sep 8, 2026 | August: 312 clicks, 215K impressions, 2 pages with first impressions; top queries "big orange marketing" 28, "bigorange marketing" 20, "storybrand website examples" 10 | 1a08149ff72e3f1a |
| https://bigorange.marketing/ | sc-noreply@google.com | Sep 8, 2026 | disavow file updated | 1a0813528352d522 |
| shadow-heating.com | sc-noreply@google.com | Jul 14 to Aug 24, 2026 | property verified; impressions collected from Jul 15; indexing notices; owners added and changed | 19f628be1e96a5de, 19f6ed4f01527231, 19fa607b999fb56c, 19fa6093d3b33d7b, 19faa22195d6aab1, 1a03055fc1783147 |
| Replenish Google Analytics property (forwarded by the client) | analytics-noreply@google.com via the client | Aug 31, 2026 | Aug 4 to 31: 1.6K active users (down 54.19 percent), 1.6K new users, 19 second average engagement (up 16.84 percent), 8.2K events (down 56.37 percent) | 1a0593b144d21129 |
| Revive Systems Google Business Profile (forwarded by the client) | businessprofile-noreply@google.com via the client | Aug 8, 2026 | July 2026: 479 profile views (up 20 percent), 23 website visits (up 76 percent), 21 direction requests (down 70 percent), 1 call, 23 searches (up 15 percent), top term "gyms near me" | 19fe19166060e052 |
| Omega Landscaping Google Ads, Customer ID 285-398-1364 | ads-noreply@google.com | Sep 7, 2026 | August: 2 conversions (down 96 percent), $486.93 cost per conversion, 127 clicks, 4.44 percent CTR; top campaign Search High Intent Colorado Springs $929.35, keyword "landscape design build" 2 conversions | 1a07c0762f6b789d |
| Omega Landscaping Google Ads | ads-noreply@google.com | Jun 8, Jun 15, Aug 10, Aug 17, 2026 | 1, 3, 1, 1 conversions in the prior week (subject lines only, bodies not opened) | 19ea840e54d5a70b, 19ecb70fd8667ac4, 19febd530ab757cc, 1a00fe1965d66ce7 |
| Unnamed Google Ads account | ads-noreply@google.com | Aug 31, 2026 | "You received 1 conversion from your ads last week" (not opened, account not identified) | 1a057fa8c77c8b47 |
| Outside the roster: The Ironic Ineptocracy (Dillon's personal site) | analytics-noreply@google.com | Sep 15, 2026 | Aug 19 to Sep 15: 96 active users, 105 new users, 425 events; this is the property behind the twelve "Your Google Analytics performance report" emails | 1a0a66aa6b171729 |
| Outside the roster: AMI Commercial Cleaning | noreply-analytics@google.com | daily | GA4 Scheduled Email series, not opened | daily series, ids not recorded |
| Outside the roster: zenspatropicana.com | sc-noreply@google.com | Sep 2026 | August: 468 clicks | 1a08150b06b7d28b |
| Outside the roster: datastrike.com, ironicineptocracy.com, ami-cleaning.com, immohrtalmarketing.com | sc-noreply@google.com | various | Search performance and setup mail for non client properties (datastrike.com is a former employer) | ids not recorded, visible in the from:sc-noreply@google.com listing |
| Outside the roster: LinkEZE, Capsule and Tonic | ads-noreply@google.com | Jun to Aug 2026 | Google Ads mail with no client result | 19e8433a9c00dc84, 19fd30d087bc299d |

## Unverified leads

Claims that appear in Gmail but that no email in this mailbox sources to a client confirmation or a Google measurement. Each names what would be needed.

1. "I have four blogs right now for different clients that are linked to Google AI overview and are ranking number one on Google" (Dillon to Kimberly James Bridal, thread 19e93be82c5bb673, June 5, 2026). No client or URL is named. Needed: the four URLs, the queries, and a Search Console or live SERP check per query.
2. "If I ask for Chestnut Hill then AI gives KJB as the best option" (Mac to Kimberly James Bridal, thread 19e93be82c5bb673, June 4, 2026). Needed: a dated screenshot or live AI answer check.
3. "my one client we've scaled now over 50% of their organic traffic prior to last year solely through answer engine optimization" (Dillon to Fagan Painting, thread 19f9ef61eda72a95, July 26, 2026). No client is named. Needed: the client, the GA4 or Search Console comparison, and the date range.
4. Onsite Concrete and Landscape AI Overview positions ("#1 in the AI Overview" in the July and August reports, threads 19fcd7e893255942 and 1a059a71bb59e671). Momentum stated. Needed: dated screenshots of the AI Overview for the named Vacaville queries, or a live SERP check.
5. Align HCM attribution ($54,000 closed deal from a Google to blog to form journey; $108,000 CRM Website source; $2.19M pipeline; 552 clicks and 92,972 impressions), threads 1a09d7514598f1d8 and 1a0a151fbfa3e0b9. Internal notes only. Needed: the HubSpot deal records and the Search Console snapshot the September 14 summary says is stored locally.
6. Align HCM July 2026 SEO Growth Report keyword wins (thread 19fb8f5b911dc22b). The numbers are inside the attached PDF only. Needed: open the PDF and match to Search Console.
7. Bar Crawl USA organic growth (2,356 clicks, 160 percent increase, August 2,300 versus July 749), thread 1a08cb1635c1d688. Momentum stated from Search Console. Needed: the barcrawlusa.com Search Console export for July 12 to September 7, 2026; note Dillon's own September 15 caveat that the layout change is not proven as the cause.
8. Bar Crawl USA ten Halloween pages "Submitted and indexed with a PASS verdict" (thread 1a0592c581c51729). Needed: Search Console URL inspection export.
9. Fagan Painting keyword growth 370 to 512 and 39 page one keywords (thread 19fd7a0af7d939c6). Semrush position tracking PDF attached, not opened. Needed: open the attachment or rerun Semrush position tracking for faganpainting.com.
10. Bar Crawl USA paid ticket counts (402 tickets in one week, 55 tickets, 53 tickets). These are form submission conversions in Google Ads, and the client wrote on April 28 that actual sales were down year over year (thread 19dd1c65cbd68604). Needed: Eventbrite order data, which Momentum gained admin access to on September 9 (thread 1a0592c581c51729).
11. Hope Wellness Center "technical SEO audit and organic results" appears only in third party Read AI meeting notes (thread 19f23f4949fbc823). Needed: the audit PDF referenced in thread 19f2438a50f817d3.
12. VA Claims Edge GA4 snapshot "starting to gain traction" (thread 19fee385c13a9a26). Numbers live only in GA4_Reports_Snapshot_Momentum_SinglePage.pdf. Needed: open the PDF or pull GA4.
13. Twelve client dashboards and PDFs at momentum-weekly-client-reports.netlify.app for September 1 to 8, 2026 (thread 1a0829cf80ddd265, listing bar-crawl-usa, fagan-painting, fresh-blends-kwik-trip, hope-wellness-center, kimberly-james-bridal, nexla, nkcdc, omega-landscaping, onsite-concrete-landscape, replenish-7-eleven, revive-systems, va-claims-edge). Needed: open each dashboard and compare to platform data.
14. Eleven July 2026 monthly report PDFs attached to thread 19fc4a55fbfc3230 (Momentum-360-July-2026 for Kimberly James Bridal, Onsite, Omega, Fagan, Fresh Blends, Replenish, NKCDC, Hope Wellness, Bar Crawl USA, VA Claims Edge, Revive). Not opened. Needed: open each PDF to extract the July numbers.
15. AMI Commercial Cleaning: a contact wrote "went 25 pages in and did not see our name" (thread 1a05521f2ef4b157, September 2, 2026). AMI is outside the registry roster and the context is unclear; listed only so it is not mistaken for a roster win.
