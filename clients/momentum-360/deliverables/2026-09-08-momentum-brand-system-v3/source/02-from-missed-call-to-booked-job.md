---
title: 'From Missed Call to Booked Job'
subtitle: 'One lead-intake workflow a service business can trust, and the thirty tests to run before it touches a customer'
author: 'Dillon Mohr'
series: 'Momentum AI Field Notes, No. 2'
status: draft
publishable: false
publishable_reason: >-
  Draft. Four gates before this ships. (1) The Lead Operations Pilot scope, its
  acceptance criteria and the free 15-minute snapshot are proposed in PLAN.md
  and not yet approved by Mac; the About section, the FAQ entry on the pilot and
  the CTA depend on that sign-off, and no price is printed for that reason.
  (2) The first-party phone-system figures in chapter 1 name no staff, but the
  evidence bank's anonymisation map requires Mac/Sean sign-off on anything from
  the agency's own stack. (3) Every client story is anonymised with the evidence
  bank's descriptors and no client has permission on file; no descriptor may be
  sharpened. (4) No client pilot has completed the 30-case acceptance, and the
  book says so in chapters 6 and 8; those 'no evidence' statements stay until
  evidence replaces them.
target_query: 'ai receptionist for small business'
primary_keywords:
  - ai receptionist for small business
  - missed call text back
  - lead follow up
  - ai lead follow up
  - automated lead follow up
  - what is an ai agent
  - ai workflows
  - ai automation for small business
word_count: 7842
word_count_excluding_source_tags: 7358
sources:
  EB: 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\research\evidence-bank.md (the only source of client results; A results, B stories, C workflows, D anonymisation map, E gaps)'
  RK: 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\research\aeo-geo-topic-research.md (keyword volumes from the OpenRush SEO connector, United States, 2026-09-07; Ebook Brief B)'
  PLAN: 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\PLAN.md (offer scope, acceptance criteria, qualification, match-back; prices there are proposed and unapproved)'
  SPOT: 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\SPOT-SCRIPT.md (facts in play; section F, what not to say)'
  VOICE: 'C:\Users\dillo\repos\dillon-os\12_Brain\03_Concepts\Dillon Voice Profile.md'
  MATCHBACK: 'C:\Users\dillo\repos\dillon-os\12_Brain\03_Concepts\2026-09-07 - Conversion match-back is the differentiator.md'
  path_prefixes:
    CO: 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients'
    M360: 'C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables'
    VAULT: 'C:\Users\dillo\repos\dillon-os'
    AUTO: 'C:\Users\dillo\.codex\automations'
  note_on_sources: >-
    Body citations for client results point only at evidence-bank sections and
    row titles, so no client is identifiable from the text. The underlying files
    below are listed for the reviewer and carry client names in their paths.
    Strip this sources block before any external publication.
  underlying_files_cited_through_EB:
    - 'M360\2026-07-27-callrail-hubspot-agent-completion.md'
    - 'M360\2026-08-10-hubspot-handoff-notification-incident.md'
    - 'M360\2026-08-11-hubspot-contact-alert-and-daily-health-report.md'
    - 'M360\2026-09-05-ai-division-launch-kit\DIVISION.md'
    - 'M360\2026-07-19-all-client-paid-media-report.md'
    - 'M360\2026-08-31-august-2026-paid-media-monthly-reports\reports-data.mjs'
    - 'CO\fagan-painting\evidence\2026-08-11-new-lead-routing-verification.md'
    - 'C:\Users\dillo\Documents\Codex\2026-07-12\did-you-get-a-chance-to\outputs\reports\Fagan_Attribution_Audit_2026-06-22_to_2026-07-12.md'
    - 'CO\shadow-heating-cooling\deliverables\2026-07-23-website-qa\analytics-and-form-report.md'
    - 'CO\onsite-concrete-landscape\deliverables\2026-08-12-call-volume-recovery\live-audit-and-change-plan.md'
    - 'CO\omega-landscaping\deliverables\2026-09-05-google-ads-optimization-review\call-count-applied.md'
    - 'CO\kimberly-james-bridal\paid-media\correction-packet-2026-07-16-google-conversion-tracking.md'
    - 'CO\replenish-7-eleven\paid-media\billing-audit-2026-07-28.md'
    - 'CO\replenish-7-eleven\paid-media\2026-08-31-location-finder-launch-audit.md'
    - 'VAULT\01_Clients\Nexla\overview.md'
    - 'VAULT\01_Clients\Omega Landscaping\Agent Memory.md'
    - 'VAULT\11_Agents\Master Agent.md'
    - 'AUTO\six-hour-important-email-drafter\automation.toml'
---

# From Missed Call to Booked Job

*Momentum AI Field Notes, No. 2*

## Who this is for, and who it isn't

This is for the owner of a service business - HVAC, landscaping, concrete, painting, a bridal shop, a law office's front desk - who knows two things: calls get missed after hours, and leads sit in an inbox until somebody remembers them. You have a phone number, a website form, maybe Meta lead forms, maybe a CRM or a booking tool like Jobber, maybe a spreadsheet. You have one employee who could own this if the job were written down.

It's also for the office manager who'll actually run it. Chapters 4, 6 and 8 are yours.

It's not for you if you want a chatbot that answers every call at 3 AM and books the job with no human in the loop. I'll explain why in chapter 8, but the short version is that I won't sell that, and I'd be careful of anyone who will. It's also not for the parts of a medical or legal practice that handle case records. Routing a new inquiry is fine there. The records are not, and our own founding pilots leave them out [source: PLAN, "Initial customer and qualification"].

One more thing before we start. This book has numbers in it, and every one carries a source in brackets. Where the number is something a platform counted - impressions, clicks, "conversions" - I call it a platform total. Where it's a real person, a booked job, or a dollar somebody reconciled, I call it a verified outcome. Where I don't have a number, I say so. That habit is most of what this book teaches.

## 1. Where are my leads actually leaking?

**Short answer:** Leads leak in four places: the phone nobody answers, the form that lands in an inbox nobody owns, the notification that carries no lead data, and the counter that's unplugged. Most owners audit ad spend first. Audit the phone log first. It takes twenty minutes and it's usually the worst number in the building.

I'll start with ours.

In July 2026 we pulled our own call tracking into our CRM and looked at it properly for the first time. Through July 27: 352 calls, 263 inbound, 101 answered, 162 missed. A 38.4% answer rate [source: EB §A.17; M360\2026-07-27-callrail-hubspot-agent-completion.md]. Every call was attached to a contact record. Zero percent of those contacts had an owner [same source]. Platform totals, all of it. But a missed call is a missed call. There's no attribution argument that makes 162 of them feel better.

We're a marketing agency. We sell the phone ringing.

That day we set up after-hours routing - 10 PM to 6 AM, round robin between two people - and turned on a missed-call text with opt-out language [source: EB §A.17; same file]. Two weeks later a 24-hour mirror showed 16 completed call events, 13 inbound, 11 answered, 2 unanswered, 3 abandoned, none after hours [source: EB §A.17; M360\2026-08-11-hubspot-contact-alert-and-daily-health-report.md]. A separate day-grain report the same day showed 23 calls, 20 inbound, 11 answered, 9 missed, a 55% answer rate, and still 0% owner coverage [same source].

I'm not going to tell you the routing raised our answer rate from 38% to 55%. Those are different windows at different grains, and I don't have a clean before-and-after for it [source: EB §E.3]. What I'll tell you is that we didn't know the first number until we looked, and looking cost nothing.

That's leak one, the phone. Now the other three.

**Leak two: the form that lands somewhere nobody owns.** A Pittsburgh residential and commercial painting company we work with has a website estimate form. On August 10 one submission came in. We verified it mapped to exactly one notification, delivered to the approved destination. The thread was unread, with no owner assigned [source: EB §A.6, row "Website lead routing verified"]. Routing verified. What happened to the customer, unknown. That's a verified outcome for the plumbing and a blank for the business. A lead nobody owns is a lead nobody called.

**Leak three: the notification that carries no lead data.** This one gets its own story in chapter 4, because we walked into it ourselves and it cost us thirteen broken promises. The preview: open your most recent "new lead" email. Is the lead in it? Or is it a link to a place where the lead might be?

**Leak four: the counter that's unplugged.** When we took over the Google Ads account of an enterprise data-integration software company in August, the lifetime numbers were $115,434.23 in spend, 26,915 clicks, and 133.28 reported conversions at $866.07 each. The conversion tag was reported inactive [source: EB §A.16, row "Lifetime account baseline at takeover"; EB §B S16]. Platform totals. That's not an intake leak, it's a measurement leak. Same disease. Nobody had asked what the number was made of.

There's a fifth I'll save for chapter 6: a form on a new HVAC website that could submit before anyone typed their name. It was caught in QA, not by a customer, which is the whole point of chapter 6.

None of these took AI to find. They took someone opening the log. AI comes in after the plumbing is honest, not before. If you automate a leak, you get a faster leak.

**Next step, owner: you.** Pull last month's call log. Count inbound, answered, missed. Write the three numbers on a sticky note. That's your baseline, and it's the only number in this chapter that matters to you.

## 2. What is an AI receptionist for a small business, and do I need one?

**Short answer:** An AI receptionist is software that answers a call or a chat, asks the intake questions, and records or books. It's one of four things people mean by "AI answering": a receptionist, a missed-call text-back, a router, and an agent. A service business almost always needs the router and the text-back first. The receptionist comes after the intake path is proven. The agent comes last, if at all.

People are searching for this. "ai receptionist" was 3,600 US searches a month in August 2025 and 90,500 in July 2026 [source: RK §1 cluster 6; OpenRush connector, 2026-09-07]. "ai receptionist for small business" runs 1,600 a month with low competition and a $61.34 cost per click [source: RK §1 cluster 6]. Page one for that query is vendors: phone systems, answering services, and a Reddit thread [source: RK §1 cluster 6]. Nobody with a client base has written the buyer's version. So here are four definitions in plain words.

**A receptionist** picks up. Voice or chat. It asks name, phone, what you need, where you are, and records the answers somewhere. A good one books into your calendar if it's connected. What it can't do is know your schedule if it isn't connected, and it can't keep a promise it makes. Which brings me to a rule.

Our own website assistant told a visitor "I have routed this to the Momentum 360 team" before it had collected an email address. The ticket it created had no owner, because the assignment rule was "available users only" and both users were marked Away [source: EB §A.17 and §B S11; M360\2026-08-10-hubspot-handoff-notification-incident.md]. So the customer was told a person had them. No person had them. That's worse than voicemail. Voicemail doesn't lie.

The fix was small: capture the email before the handoff, turn off the availability restriction, and rewrite the message so it claims a send only after the handoff actually completes. A fresh test chat then produced a ticket auto-assigned to a team member who was still marked Away [same source]. Verified outcome. The rule I took from it: a receptionist may never claim an action it hasn't completed. Put that sentence in front of the vendor before you sign.

**A missed-call text-back** is the dumbest thing on this list and the most reliable. A call goes unanswered; a text goes out. Ours runs with STOP opt-out language on the first message [source: EB §A.17; M360\2026-07-27-callrail-hubspot-agent-completion.md]. Chapter 3 is about what that text should say.

**A router** takes any intake - a call, a text, a form, a DM, a Meta lead form - and puts it in one destination with one owner, deduplicated, with the source and the time stamped on it. Nobody searches for "router". It's the spine of everything else in this book, and it's the thing most businesses don't have.

**An agent** is software that decides its own steps inside a task: read the lead, look up the calendar, pick a slot, write the reply, send it. "what is an ai agent" is 14,800 searches a month, the biggest question in this whole lane [source: RK §1 cluster 7]. Most of the answers are written by people selling agents. Our rule, written into our own plan: begin with a simple workflow and add agents when the task requires them [source: PLAN, "Risks and concrete responses"]. A workflow does the same thing every time. An agent chooses. You want the thing that does the same thing every time until you've proven the thing is right.

Here's how to pick.

| What you're seeing | What to build first |
|---|---|
| Calls go unanswered and you don't know how many | The count. Then the text-back. |
| Leads arrive in three places and nobody owns them | The router. One destination, one owner. |
| Leads get answered, but slowly and inconsistently | Drafted replies a human sends (chapter 5). |
| Intake is proven, tested, and the volume is real | A receptionist on the phone line. |
| The receptionist is proven and one task is repetitive and safe | Maybe an agent. Maybe. |

Do you need an AI receptionist? Ask four questions. Do calls go unanswered? Do you know how many? Is there one destination for every lead? Is there one person who owns it? If your answers to the last two are no, you don't need a receptionist yet. You need a router, and buying the receptionist first is buying a nicer front door for a house with no floor.

**Next step, owner: you.** Answer the four questions in writing. If the last two are no, skip to chapter 4.

## 3. What should the first text say, and how fast should it go out?

**Short answer:** The first text goes out the moment a call goes unanswered. It says who you are, that you missed them, asks one question, gives your hours, and includes a way to opt out. It doesn't promise a callback time you can't keep, and it doesn't pretend to be a person. After that first text, a human sends the next one.

On speed: plenty of vendors will quote you a study that says respond within five minutes or lose the lead. I don't have one I'd stake my name on, so I won't cite one. What I can verify is simpler. Our missed-call text fires on the unanswered-call event itself [source: EB §A.17; M360\2026-07-27-callrail-hubspot-agent-completion.md]. The delay is the phone system's, measured in seconds, not a person's, measured in whenever-they-see-it. That's the whole speed argument. You don't need a study. You need the text to be triggered by the miss.

What I don't have is a before-and-after on time-to-first-response for any client account [source: EB §E.3]. Our pilot measures it as its own number, and when I have it, it goes in the next edition. I'd rather say that than make one up.

Here's the text. It's a template, not a client artifact.

> Hi, this is [Business]. Sorry we missed your call. What can we help with? Reply here, or call back at [number] between [hours]. Reply STOP to opt out.

Six rules, roughly one per clause:

1. **Name the business, not the bot.** The customer called a company. Answer as one.
2. **Apologize once.** Then move.
3. **One question.** Not three. A person answering a text answers one thing.
4. **Give hours, not "24/7".** Our plan says it plainly: define business-hours acknowledgment before you sell it, and don't promise 24/7 uptime or emergency response without paid coverage [source: PLAN, "Three offers with finite delivery contracts"]. If you're an HVAC company in January, you need a human for emergencies, and the text should say how to reach one.
5. **Opt-out language on the first message.** Ours ships with STOP [source: EB §A.17]. Whether your state or your carrier wants more is a lawyer's question, not mine, but the carriers enforce it either way, and a blocked number sends nothing.
6. **Don't promise a callback time** unless the callback is scheduled and owned. "We'll call you right back" from a machine at 11 PM is a lie with a timestamp.

Then the hand-off rule. The machine sends that one text. Everything after it is a draft a human approves and sends, until the thirty tests in chapter 6 pass and you decide, in writing, which follow-ups the machine may send alone. The next three, drafted for a human to send:

- **Day 0, if they reply:** answer their question, name a person, offer two times.
- **Day 1, if silence:** one line. "Still need help with the [thing they said]? Happy to look at it this week."
- **Day 3, if silence:** last one, with an easy out. "Last one from me. If the timing's off, no problem at all. We're here when you need us."

After that, stop. Silence is an answer. A fourth text is a complaint.

And "sent" means confirmed, not "the workflow ran". When we added an alert on every website chat - an email, a task, and an in-app notification - it wasn't live until both recipients confirmed they'd received it, which they did, at 11:38 and 11:41 AM [source: EB §A.17; M360\2026-08-11-hubspot-contact-alert-and-daily-health-report.md]. A send you can't confirm is a send you can't count.

Last thing: log every text. Timestamp, number, source (missed call, form, DM, lead form), template used, send confirmation, replied yes or no, owner. That source column is how you avoid the argument in chapter 4. Without it, next month you're staring at a platform report that says twelve conversions and a phone that rang four times, and you can't tell which four.

**Next step, owner: the employee who'll run this.** Write your version of the text. Read it out loud. If it sounds like a company you'd hang up on, rewrite it.

## 4. How do I design the workflow before I buy any tool?

**Short answer:** On one page, before you open a vendor's website. One intake source, one destination, one route, one owner. Write the record the destination will hold, field by field. Write what happens to a duplicate and what happens to an exception. If it doesn't fit on a page, no tool will fix it. Buy the tool after the page.

The page has eight boxes. Source. Normalizer. Dedupe. Destination. Route. Draft. Exception queue. Dashboard. Arrows between them, left to right. Under the destination box, the record:

- name, phone, email
- address or service area
- what they need, in their words
- source (call, text, form, Meta, referral, walk-in)
- timestamp
- campaign or click ID, if there is one
- consent flag (did they agree to texts?)
- owner
- status (new, contacted, quoted, booked, lost, exception, test, solicitation)

Ten fields. If your current system can't show you all ten for last week's leads, you've found your project.

Now the story I promised, because it's about the destination box and we got it wrong ourselves.

We had promised a Colorado Springs landscaping and concrete contractor nine times, a Philadelphia bridal boutique twice, and a Northern California concrete and landscape contractor twice - thirteen promises - that we'd match the platform's reported conversions to named leads, and the same promise was holding up a deck for a fourth account [source: EB §B S1; PLAN, "Match-back"]. Tell the client which actual people their conversions were. It's a fair thing to ask an agency.

We couldn't do it. Not for lack of effort. The Zapier notifications landing in Gmail carried no lead data. They carried a link: "open this Zap run in Zapier" [source: EB §B S1; MATCHBACK]. Nothing in the email to reconcile against. On one account, the Pittsburgh painting company, the loop closed, and the only difference was that its Zap parsed the lead fields into the email body [same source]. Same tool. One configuration. Thirteen costumes.

The fix is a Zap change, and it's a change to a client's account, so it sits behind their approval [source: MATCHBACK]. As I write this, we still can't name those leads on three of the four, and I'm not selling that ability in this book; we haven't earned it yet. I'm telling you the story so you check yours. Open the last lead email you got. If the lead is in it, good. If it's a link, your destination is a link, and a link isn't a record.

That's also why our pilot's acceptance has this line in it: destination readback succeeds for 100% of accepted test records [source: PLAN, "Three offers with finite delivery contracts"]. Plain words: after the workflow writes a lead, something reads it back out of the destination and compares it to what went in. We failed that on our own book of business. It's in the contract because we failed it.

**The dedupe box.** For the painting company we reviewed every Zapier run from June 15 to July 12. Twenty-two runs. Four were qualified website inquiries. Eighteen were solicitations, tests, or duplicate replies [source: EB §A.6, row "Zapier run review"; EB §B S10]. Verified outcome, classified from the raw notification bodies. Four of twenty-two. If a dashboard had counted runs, it would have been wrong by a factor of five, and nobody would have known, because twenty-two looks like a good month.

Three rules, then. Same phone or same email within thirty days is the same lead, appended to the existing record, not a new one. Tests carry a marker and never count; in the first half of July a bridal boutique's lead sheet showed 28 verified contacts with 5 test-and-routing rows excluded, and the exclusion was the honest part [source: EB §A.1; M360\2026-07-19-all-client-paid-media-report.md]. Solicitations get a status, not a delete, because next month you'll want to know how many there were.

The platform side of the same problem: the Northern California contractor's Google Ads account had 14 enabled conversion actions, including duplicate primaries for forms, calls, contacts, and click-to-call. Across three overlapping 28-day windows it reported 87 conversion events. The audit's own line: "87 events cannot be presented as 87 estimate leads" [source: EB §A.3, row "Three 28-day windows reviewed"; EB §B S6]. Platform total. The workflow's job is to make one human equal one record no matter how many actions fire on the way in.

**The exception box.** Things that go in the queue instead of the route: no phone and no email; outside your service area; wrong company; a language you don't serve; abuse; an explicit "don't contact me". Wrong company is real. The Colorado contractor's callers thought they'd reached a different business or a supplier, and a 30-day read found four search-term conversions on a competitor's name that Google had suggested as a bidding signal [source: EB §A.2, row "30-day account read before rebuild"; EB §B S4]. Those four were "conversions". They were also not customers. The queue has an owner and a time limit you set, and "resolved" means a status was chosen, not that the row disappeared.

**The access line.** Put it on the page: who is the admin on every system in the chain? On the Colorado account we held Standard access, not Admin, and the lead export from Google Ads couldn't be authorized because of it [source: EB §A.2; PLAN, "Match-back"]. Get admin before you promise anything downstream of it. Access is part of the spec, not a detail for later.

**Next step, owner: you and the employee.** Draw the page. Eight boxes, ten fields, three dedupe rules, six exception types, one admin per system. One hour. Don't open a vendor's site until it's done.

## 5. Can AI write my follow-up without sounding like a robot?

**Short answer:** Yes, if a human sends it. The machine drafts the reply from the lead's own words and a rules file: what you do, where, when, what you'll quote, and what you never promise. The person who owns the queue reads it, edits or doesn't, and sends. That's the whole trick. It's also why the drafts get better: every edit is a correction the next draft learns from.

Why draft-then-send instead of letting it fly? Because incorrect output is a listed risk in our own plan, and the plan's answer is independent checks and source readback, not hope [source: PLAN, "Risks and concrete responses"]. A follow-up that offers a Tuesday slot you don't have costs you more than a reply that's an hour late. And a message that claims something happened when it didn't - see the chatbot in chapter 2 - costs you the customer and the review.

What the draft needs before it can be any good:

1. **The intake record** from chapter 4. All ten fields, especially "what they need, in their words".
2. **A rules file.** One page. Services you do and don't. Service area by town. Hours. Prices you'll quote in a text and prices you won't. Claims you can make (licensed, insured, years in business) and claims you can't (guarantees, "same day", anything about a competitor). The name of the human to mention.
3. **Five to ten real replies** you've sent that you'd send again. Not the polished ones. The ones that got a "sounds good, see you Thursday".

Then the draft. Say a text comes in: "need gutters cleaned before winter, 2-story, Roxborough." A bad draft:

> Thank you for reaching out! We would be delighted to assist you with your gutter cleaning needs. Our expert team is standing by to provide exceptional service!

Nobody in Roxborough talks like that. A draft built from the rules file:

> Hi - got it, two-story gutter cleaning in Roxborough before the cold. We're out that way most weeks. Mike can come by for a look Thursday morning or Friday after 1. Which works?

Seven rules that make the second one possible:

1. Use their words back. "Gutters", "two-story", "before winter". It proves someone read it.
2. One question per message.
3. Name a human. "Mike", not "our team".
4. Two times, not "when are you free?"
5. No exclamation-point stacks. One is a lot.
6. Never say "AI" unless they ask, and if they ask, tell them.
7. Never claim an action that hasn't completed. "Mike will call you" only if Mike's calendar has it.

The send rule is the same as chapter 3: a draft becomes a message only when the owner clicks, and the log records who clicked. Our own internal drafting automations are built that way on purpose. They create one unsent draft per thread in my voice and never send it [source: EB §C, "Six-hour important email drafter / Slack reply watchdog"; AUTO\six-hour-important-email-drafter\automation.toml]. If I don't let a machine send my own email, I'm not going to let it send yours.

Now the honest part. Does this work? I have no count, from any client account, of drafts sent unedited versus rewritten, and no time-saved number [source: EB §E.3]. What I have is the measurement plan. Our operating rules log task success, critical errors, human repair minutes, cost per accepted artifact, and latency for every bounded job [source: PLAN, "The operating system and model roles"]. Human repair minutes is the one that matters to you. It's the difference between a draft that saves the office manager time and one that costs it. When I have that number from a real account, with permission, it'll be here.

**Next step, owner: the employee.** Write the rules file. One page. Then find the five texts you'd send again and paste them under it. That's the whole training set.

## 6. How do I know it works before it touches a real customer?

**Short answer:** You write thirty named test cases before you build, run every one, and don't go live until at least 95% pass, every failure has an owner and a fix date, the destination reads back 100% of accepted records, and the person who'll run it completes five supervised cases [source: PLAN, "Three offers with finite delivery contracts"]. That's the acceptance contract for our pilot. Make it yours, whoever you hire.

Here it is as written in our own plan. Acceptance is met only when 30 named test cases are executed, at least 95% pass, all failures are documented with an owner and a remediation plan, destination readback succeeds for 100% of accepted test records, no unresolved cross-account write failures remain, and the named operator completes 5 supervised cases. The client's decision-maker signs the scorecard before recurring support begins [source: PLAN, "Three offers with finite delivery contracts"].

"It works" is not a test. "Test 14: form submitted with phone missing and email present; expected: record created, status needs-phone, exception queue, owner notified" is a test. Named means you can point at it when it fails.

Why I believe in the boring version: a small-town Illinois HVAC company's new website had a three-step service-request form. It could submit during the transition from step two (Details) to step three (Contact), show a success message, and store a lead with no name, no phone, and no email [source: EB §A.4, row "Form defect found and repaired"; EB §B S8]. A fast form. A useless lead. It was found in QA, not by a customer. The repair restricted submit to the final step, made name, phone and email required, and cancelled the browser's submit on Back and Continue. Both forms were then live-tested end to end, the notification emails confirmed in the inbox, the test records deleted, and a real submission showed up in analytics as a lead event the same day [same source]. Verified outcome, for the repair. Test 3 below exists because of that form.

The thirty. Print this.

**Intake (1-8)**

1. A call missed during business hours produces a text-back inside the system's trigger window and a record with source = call.
2. A call missed after hours produces the after-hours text, not the business-hours one, and a record.
3. The website form cannot submit until the final step, with name, phone and email present.
4. A website form submission produces exactly one record and exactly one notification, with the lead's fields in the notification body, not a link.
5. A Meta or Google lead form produces one record with the click or campaign ID carried through.
6. A text to the business line produces a record with source = text.
7. A submission with a UTM or click ID stores it; a submission without one stores "none", not blank.
8. A submission from your own team, marked as a test, is stored with status = test and excluded from every count.

**Dedupe (9-13)**

9. A second submission from the same phone within 30 days is appended to the first record; no new lead.
10. Same email, different phone: appended, and flagged for the operator to confirm.
11. The same person through two channels in one hour (calls, then fills the form) produces one record.
12. A solicitation ("we can get you on page one of Google") is stored with status = solicitation and excluded from lead counts.
13. Two platform conversion actions firing for one form (form and click-to-call) produce one record.

**Routing (14-18)**

14. Phone missing, email present: status needs-phone, exception queue, owner notified.
15. Outside the service area: exception queue; the draft declines politely, with a referral line if you have one.
16. Wrong company or a supplier inquiry: exception queue, status wrong-company, never counted as a lead.
17. An explicit "do not contact": status do-not-contact, no draft, no text, ever.
18. Every routed record has an owner within the time limit you wrote in chapter 4, and the dashboard shows the ones that don't.

**Drafts (19-23)**

19. A draft uses at least one phrase from the lead's own message.
20. A draft never contains a price outside the rules file.
21. A draft never contains a claim on the can't-say list.
22. A draft names a human and offers two times, both from the real calendar.
23. A draft cannot be sent by the system; only the owner's click sends it, and the log shows who.

**Exceptions and money (24-27)**

24. Abusive content goes to the queue with no draft generated.
25. A request in a language you don't serve goes to the queue with a one-line note.
26. A record touching medical or legal case details is flagged and not stored beyond contact fields.
27. Nothing in the workflow can change an ad budget, a bid, or a spend cap.

**Readback and operations (28-30)**

28. For every accepted test record, a readback from the destination matches the input field for field.
29. A failed send (bounced text, rejected email) is logged as failed, visible on the dashboard, and never counted as sent.
30. The operator completes five live cases under supervision, including at least one duplicate and one exception, and can explain each status they chose.

Log each one: test ID, input, expected, actual, pass or fail, owner, fix date, retest date. Failures aren't the problem. Unlogged failures are.

Run them synthetic first, marked as tests, excluded from every count. Then five live cases with the operator, supervised. Then sign the scorecard. Then go live. In that order, with no hurry in between.

And the gap: no client pilot has completed this acceptance yet. These criteria are the contract we sell, and we're applying them to our own intake first, because we currently fail the readback criterion on our own accounts [source: PLAN, "Match-back"]. I'd rather publish the test list than a pass rate I don't have.

**Next step, owner: you.** Cross out any of the thirty that don't apply. Add the ones I missed for your trade. Number them. That's your scorecard.

## 7. Which tools fit a trade business, and what do they actually log?

**Short answer:** The right tool keeps the lead's fields, the source, and a timestamp in a record you can export, holds a draft without sending it, and tells you when a send failed. Jobber, HighLevel, ServiceTitan, a phone-system receptionist, or a spreadsheet can all do that. Most are configured so they don't. Judge the log, not the demo.

What you'll find when you search: "missed call text back" returns a HighLevel help page first, then a row of vendors [source: RK §1 cluster 6]. "ai receptionist for small business" returns phone systems, answering services, and one Reddit thread [source: RK §1 cluster 6]. "jobber ai receptionist" is 140 searches a month on its own [source: RK §1 cluster 6]. We're a Jobber partner, which is in our own press release, so weigh that when I mention it [source: RK §2, "Momentum's own public claims"; PRWeb release 2026-08-21].

I haven't run a head-to-head on these tools with a client's real leads, and I'm not going to write one from marketing pages. What I can give you is the seven questions I'd ask any of them, in order, and the story behind each.

1. **Does the notification contain the lead, or a link to it?** Chapter 4. Thirteen promises. Ask for a sample notification email before the demo, not after.
2. **Can I export every record with source and timestamp, myself, today?** If the answer involves "your account manager", it's no.
3. **What happens on a duplicate?** Make them show you. Submit the same phone twice while you watch.
4. **Does it tell me when a send fails?** No bounce is not delivery. We sent 241 cold emails in two waves on September 2 and 3 and got 2 bounces, 2 auto-replies, and 0 verified human replies, and the note in the file says it plainly: "no bounce is not proof of delivery" [source: EB §A.17 and §B S19; M360\2026-09-05-ai-division-launch-kit\DIVISION.md]. A tool that shows you "sent" and nothing else is showing you an assumption.
5. **Can it hold a draft without sending?** If every message is send-only, chapter 5 doesn't work in it.
6. **Who is the admin, and is it me?** Standard access couldn't authorize a lead export [source: EB §A.2]. Own your admin.
7. **What does it do after hours, and what does it promise the caller?** Read the after-hours script. If it says "we'll call you right back", go back to chapter 3.

Then the tag. If the tool feeds your ads, is the ad platform actually hearing from it? A retail smoothie-kiosk brand with locations inside convenience stores had nine store campaigns pointed at a shared location-finder site. The site loaded no Google tag, no Tag Manager, no analytics, no Ads tag; its directions clicks "do not currently reach Google Ads" [source: EB §A.5, row "Location-finder tracking gap"; EB §B S13]. The campaigns were optimizing toward a signal that never arrived. A Philadelphia bridal boutique's Performance Max campaign ran at $20 a day, served 54,814 impressions for $585.42 over roughly thirty days, and reported zero conversions [source: EB §A.1, row "Google PMax, observed live window"; EB §B S3]. Platform totals, both. The correction packet on that account refused to touch bids or budget until the appointment path was proved end to end [same source], which is the right refusal. Your intake tool is upstream of every ad decision you'll make. If the tag's unplugged, every "optimization" is a guess with a budget.

On cost: I'm not printing tool prices. They change monthly and the vendor's page is the source. Budget for the tool to be the cheapest line in this project. The expensive line is the employee's time in chapter 8, and it should be.

A spreadsheet is a fine destination to start. Our pilot's scope says "one destination CRM or sheet", in those words [source: PLAN, "Three offers with finite delivery contracts"]. A sheet with ten fields and one owner beats a CRM with forty fields and none.

**Next step, owner: you.** Take the seven questions to whatever you already pay for. Most trades already own a tool that could do this. The answer to question one is usually the surprise.

## 8. Who runs it after launch, and what must stay human?

**Short answer:** A named employee runs it - not the owner, not the agency. They own the exception queue, send the drafts, and log what broke. Money, messages to customers beyond the first text, deletes, and anything touching medical or legal records stay human. Once a month you fix one thing and measure it. That's the job, and it's a small one if the tests passed.

**The operator.** Our qualification list for a pilot has five conditions, and the last one is "an employee owns adoption and exceptions" [source: PLAN, "Initial customer and qualification"]. Not the owner. Owners don't check queues at 4 PM on a Thursday; they're on a roof. The operator does the five supervised cases in chapter 6, and that's their onboarding. Weak adoption is a named risk in our plan, and the answer is the same each time: name an operator, train them, track real usage [source: PLAN, "Risks and concrete responses"].

**The exception queue.** Daily, at a fixed time. Every row gets a status from the operator, not from the machine. "Resolved" means a status was chosen and, where it's a real lead, an owner was assigned. Count the queue every week. That count is your best early warning. When it climbs, something upstream changed - a form field, a phone menu, a campaign - and you'll see it here before you see it in revenue.

**What stays human.** Our own operating rules split work into three tiers: reading and drafting run unattended; batched changes go under one approval; send, post, deploy and spend are executed only by a person [source: EB §C, "Marketing Chief brief and morning orchestrator"; VAULT\11_Agents\Master Agent.md]. Copy that. For an intake workflow it means:

- **Sends** beyond the first text are human until the tests pass, then human by policy for anything with a price or a time in it.
- **Spend** is never in the workflow. That's test 27, and here's why it's a test. A retail kiosk brand understood its Google Ads to be capped at $500 per location, in writing. The account actually ran 13 campaigns at $16.67 a day each, which is potential exposure of $216.71 a day, and $6,106.52 in gross campaign cost from April 1 to July 28. Four chargebacks totalling $1,942.67 landed on July 22 and 23 [source: EB §A.5, rows "Billing audit" and "Per-campaign budget exposure"; EB §B S12]. Verified platform billing figures. A written cap is not a platform cap until someone types it into the platform, and nothing automated should be able to do the typing.
- **Deletes** are human. Test records get deleted by a person after the readback, and the deletion is logged.
- **Medical and legal case records** stay out of the founding workflow entirely [source: PLAN, "Initial customer and qualification"]. A law office can route "new inquiry, family law, wants a consult". It shouldn't route the facts of the case.
- **Promises of time.** The machine may offer two slots from the real calendar. It may not say "we'll be there Tuesday".

**The monthly improvement.** One per month, approved [source: PLAN, "Three offers with finite delivery contracts"]. Pick it from the exception log, not from a vendor's feature list. Measure four things and write them down on the same day each month: exceptions per week, time from lead to first human reply, drafts sent unedited versus edited, duplicates caught. If you want a fifth, count sends that failed.

And keep the platform's numbers separate from yours. The rule we use on every ad report: platform activity is reported separately from qualified inquiries, appointments, estimates, bookings, and revenue, and conversion reporting stays "pending validation" wherever the action definition or the downstream outcome isn't reconciled [source: EB header; M360\2026-08-31-august-2026-paid-media-monthly-reports\reports-data.mjs, line 3]. A platform counts what it counts. Your sheet counts people.

Check the counters monthly too, because small settings tell big lies. On the Colorado account the "Calls from ads" action was counting Every call and was changed to One [source: EB §A.2, row "Call conversion count corrected"]. On the enterprise software account, the tag was inactive under more than $115,000 of spend [source: EB §A.16]. Neither took an hour to find. Both had been wrong for a long time.

**What I can't tell you.** How many jobs this books. No account in our files has a reconciled booked job or a dollar of revenue from an automated intake path; every one of our paid-media reports carries "pending validation" for exactly that [source: EB §E.1]. The one dollar figure in the whole tree is a client-reported job with no channel attached, so I'm not using it. When there's a verified one, with the client's permission, it'll be in No. 5 of this series, which is about naming leads and which we've said won't publish until our own fix has landed and produced one true month [source: RK §3, Book E].

**Next step, owner: you.** Name the operator. Out loud, to them, with chapter 6 printed and on their desk. That's the launch.

## FAQ

**What is an AI receptionist for a small business?**
Software that answers calls or chats, asks your intake questions - name, phone, need, location - and records or books them. It's not a person and it shouldn't pretend to be. It's useful once your intake path is proven. Before that, a missed-call text and a router that puts every lead in one place with one owner do more, for less.

**What is missed-call text-back?**
A text that goes out automatically when a call goes unanswered. It names the business, apologizes once, asks one question, gives your hours, and includes opt-out language. Ours fires on the unanswered-call event and carries STOP on the first message [source: EB §A.17]. It's the simplest automation in this book and the one I'd install first.

**How fast should I follow up on a new lead?**
Faster than the next company they call. I don't have a study I'd cite for a specific minute count, so I won't. What I can say is that a text triggered by the missed call itself arrives in seconds, and a human reply drafted from that text can go out in minutes when someone owns the queue. The number to track is your own: lead to first human reply, weekly.

**What's the difference between an AI agent and an automation?**
An automation does the same steps every time: call missed, text sent, record created. An agent decides its own steps inside a task. Our rule is to begin with a simple workflow and add agents only when the task requires them [source: PLAN, "Risks and concrete responses"]. Most service businesses never get to "requires". That's fine. Reliable beats clever when it's your phone.

**Do I need a CRM before I do any of this?**
No. You need one destination with ten fields and one owner. A spreadsheet qualifies; our own pilot scope says "one destination CRM or sheet" [source: PLAN, "Three offers with finite delivery contracts"]. Buy a CRM when the sheet has a problem the sheet can't solve, and bring the ten fields with you.

**Will an AI receptionist answer 24/7?**
It can pick up 24/7. It can't promise 24/7 service unless a human is on call. Define business-hours acknowledgment before you promise anything, and don't promise 24/7 uptime or emergency response without paid coverage [source: PLAN, "Three offers with finite delivery contracts"]. Your after-hours text should say how to reach a person for an emergency, and mean it.

**Can AI text my customers directly?**
The first missed-call text, yes, with opt-out language. After that, the machine drafts and a human sends until your thirty tests pass, and then only the follow-ups you've approved in writing. Anything with a price or a time in it stays human. A machine that can't claim an action it hasn't finished is the rule under all of this.

**What should never be automated?**
Spend changes, bids, and budget caps. Deletes. Medical or legal case details. Messages that promise a time. Anything that moves money or signs anything. Our own operating tiers put send, post, deploy and spend behind a person every time [source: EB §C]. The kiosk brand's thirteen budgets against one written cap in chapter 8 is what happens when a cap lives on paper instead of in the platform.

**How do I know the leads are real?**
Count people, not events. Deduplicate on phone and email, mark tests and solicitations so they never count, and keep the platform's conversion count in a separate column from your named-lead count. On one account, 22 automation runs held 4 real inquiries [source: EB §A.6]. On another, 87 platform events couldn't be presented as 87 estimates [source: EB §A.3]. The gap is normal. Hiding it isn't.

**What's in the Lead Operations Pilot?**
One intake source, one destination CRM or sheet, one routing workflow, duplicate protection, an internal response draft, an exception queue, one dashboard, and an operator handoff, with one approved improvement a month afterwards. Acceptance is the thirty named tests at 95% or better, 100% destination readback, every failure owned, and five supervised operator cases, signed off before support begins [source: PLAN, "Three offers with finite delivery contracts"]. Terms are set in writing per engagement, and I'm not printing numbers here that aren't final.

## What to do Monday

1. Pull last month's call log. Write down inbound, answered, missed. Twenty minutes.
2. Open your most recent "new lead" email. Is the lead in it, or a link? Write down which.
3. List every place a lead can arrive: phone, text, website form, Meta or Google lead form, DMs, referrals, walk-ins.
4. Pick one destination. A sheet is fine. Add the ten fields from chapter 4.
5. Name the operator. Tell them. Give them chapters 4, 6 and 8.
6. Write your missed-call text using the six rules in chapter 3. Read it out loud.
7. Write the one-page rules file from chapter 5: services, area, hours, what you'll quote, what you'll never say.
8. Confirm who holds admin on your phone system, your form, your ad accounts, and your CRM. If it isn't you, fix that this week.
9. Print the thirty tests. Cross out what doesn't apply. Add what I missed for your trade.
10. Check one counter: are your ad platform's conversion actions counting one lead per person, and is the tag active? If you can't tell in ten minutes, that's the answer.

If you'd like a second set of eyes on steps 1, 2 and 10, we do a free 15-minute snapshot: three observations with the evidence attached and one suggested next step [source: PLAN, "Three offers with finite delivery contracts"]. No deck, no pitch. needmomentum.com.

## About Momentum AI

Momentum AI is the AI division of Momentum Digital, a marketing agency in Philadelphia founded in 2015 [source: SPOT, "Facts in play"; EB §A.18, company facts]. Its four lanes are AEO/GEO, AI Design, AI Marketing, and AI Automation [source: SPOT, "Facts in play"]. This book is the AI Automation lane.

The division sells three scoped offers, each with a written acceptance contract: the Lead Operations Pilot described in the FAQ above; an AI Visibility Program that baselines 20 buyer questions across two AI engines and reports every observation with its engine, prompt, date and source; and a Campaign Production System that produces four original concepts and up to eight size variants from one brief [source: PLAN, "Three offers with finite delivery contracts"]. None of them guarantees rankings, citations, leads, or revenue, and this book doesn't either [source: PLAN, "Three offers with finite delivery contracts"].

Momentum Digital is a Google Partner, a Meta Business Partner, and a Jobber partner [source: RK §2, "Momentum's own public claims"; PRWeb release 2026-08-21]. Every figure in this book is sourced in brackets. Every client is described, not named, until they've said yes. Built, not prompted.

needmomentum.com · Philadelphia
