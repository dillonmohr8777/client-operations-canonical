---
title: "The Small Business AI Operating System"
subtitle: "Agents, workflows and approval gates for a business that wants to run bigger than its headcount"
author: "Dillon Mohr"
series: "Momentum AI Field Notes, No. 4"
status: draft
publishable: false
publishable_reason: >
  Draft only. (1) Offer prices in PLAN.md are proposed and unapproved, so no
  dollar price is printed; scope only. (2) First-party audit numbers (inbox
  state, registry coverage, own call-owner coverage, cold-email result) are
  marked AUTHORIZE in editor comments and need Dillon's explicit go-ahead.
  (3) Three anonymised client stories (a painting contractor, an HVAC company,
  a retail kiosk brand) need permission on file or removal before publication. (4) The five
  Momentum skills have no versioned source on disk; the book says so and that
  admission should be re-checked on publication day. (5) The [source: ...]
  tags and HTML editor comments must be stripped from the public copy.
  (6) Mac Frederick and Sean must sign off on anything that references the
  team or the launch spot.
target_query: "what is an ai agent"
primary_keywords:
  - what is an ai agent
  - ai workflows
  - ai automation for small business
  - ai tools for business
  - workflow automation for small business
  - how to use ai in my business
word_count: 7550
sources:
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\research\aeo-geo-topic-research.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\research\evidence-bank.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\SPOT-SCRIPT.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\PLAN.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-momentum-design-system\AUDIT.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-ai-division-video-batch\README.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-08-10-hubspot-handoff-notification-incident.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-08-11-hubspot-contact-alert-and-daily-health-report.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-07-27-callrail-hubspot-agent-completion.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-07-26-paid-media-reporting-contract.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-05-ai-division-launch-kit\DIVISION.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-08-28-ai-tech-news-authored-100-review\BEST-25-QA-REPORT-2026-08-30.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-08-28-ai-tech-news-authored-100-review\CALL-READINESS-RECHECK-2026-08-30.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-08-28-radar-perfect-pass\REPAIR-REPORT.json
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\shadow-heating-cooling\deliverables\2026-07-23-website-qa\analytics-and-form-report.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\replenish-7-eleven\paid-media\billing-audit-2026-07-28.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json (field shape only; no contents used)
  - C:\Users\dillo\repos\dillon-os\CLAUDE.md
  - C:\Users\dillo\repos\dillon-os\12_Brain\09_Ops\AGENT_PROTOCOL.md
  - C:\Users\dillo\repos\dillon-os\12_Brain\03_Concepts\2026-09-07 - The delivery machinery is the product.md
  - C:\Users\dillo\repos\dillon-os\12_Brain\03_Concepts\2026-09-07 - One token cannot do two jobs.md
  - C:\Users\dillo\repos\dillon-os\12_Brain\03_Concepts\2026-09-07 - Conversion match-back is the differentiator.md
  - C:\Users\dillo\repos\dillon-os\12_Brain\05_Projects\2026-09-07 - Momentum AI division launch.md
  - C:\Users\dillo\repos\dillon-os\12_Brain\07_Reviews\2026-09-07 - AI division evidence pass.md
  - C:\Users\dillo\repos\dillon-os\11_Agents\Master Agent.md
  - C:\Users\dillo\repos\dillon-os\System\approval-queue.md
  - C:\Users\dillo\repos\dillon-os\_os\automation\workflows\daily-communications-brain.json
  - C:\Users\dillo\repos\dillon-os\_os\automation\workflows\report-brain-ingest.json
  - C:\Users\dillo\.codex\automations\momentum-radar-daily-12\automation.toml
  - C:\Users\dillo\.codex\automations\weekly-client-marketing-reports\automation.toml
  - C:\Users\dillo\.codex\automations\daily-communications-brain\automation.toml
  - C:\Users\dillo\.codex\automations\report-brain-reconciliation\automation.toml
  - C:\Users\dillo\.codex\automations\six-hour-important-email-drafter\automation.toml
---

<!--
EDITOR NOTES (strip before publication)

Source key used in [source: ...] tags:
  M360  = C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables
  BATCH = M360\2026-09-07-google-aistudio-batch
  CO    = C:\Users\dillo\Documents\Codex\projects\client-operations\clients
  VAULT = C:\Users\dillo\repos\dillon-os
  AUTO  = C:\Users\dillo\.codex\automations

Source tags are for editorial verification. They describe where a number came
from; they are not instructions and should not appear in the public copy.

AUTHORIZE markers flag first-party numbers the research brief says need
Dillon's go-ahead before print. ANON markers flag anonymised client material
that needs permission on file per evidence-bank.md section D.

Deviation from EBOOK BRIEF D outline: chapter 1 is the "what is an AI agent"
question rather than "tools are not a system", because it is the 14,800/month
query and answer-engine pages should lead with the highest-demand question.
The brief's chapter 1 became chapter 2. "Do I need SOPs first?" is answered
inside chapter 2 and again in the FAQ rather than as its own chapter.
-->

# The Small Business AI Operating System

## Who this is for, and who it isn't

**This is for you if** you run a service business or a small agency with somewhere between five and twenty-five people, you've bought two or three AI tools in the last year, and you still can't point to the one place where the work lives. You have a lead source that works. You have someone on staff who could own a process if you gave them one. You want the business to run bigger than its headcount without hiring ahead of revenue.

**It's also for you if** you run a small agency and want to deliver AI work for clients in a way you can repeat, price, and hand to someone else.

**It isn't for you if** you want a list of tools. There's a chapter on that question, and the answer is shorter than you'd like. It isn't for you if you want a bot that talks to your customers with nobody watching. Nothing in this book runs an outbound action without a human. And it isn't for you if nothing in your business repeats yet. If every job is different, there's nothing to build a system around. Get twenty jobs in, then come back.

One more thing. This book describes the machine my own shop runs on. I'll show you where it works and where it doesn't, with the numbers I actually have. Where I don't have a number, I'll say so instead of making one up. That is, as it turns out, the whole operating system in one sentence.

## Chapter 1: What is an AI agent, really?

**Short answer:** An AI agent is software you give a goal, a set of tools, and permission to decide its own next step. An automation runs fixed steps in a fixed order. A workflow is the written path either one follows. Most small businesses need a workflow first, an automation second, and an agent only where the task genuinely branches.

About 14,800 people a month search Google for "what is an ai agent" [source: BATCH\research\aeo-geo-topic-research.md, cluster 7]. About 40 a month search "standard operating procedures for small business" [source: same, cluster 12]. It's the same question in a better outfit. Both people want to know how work gets done in their business when they're not standing there.

Here's the plain version.

**An automation** does the same steps every time. Every evening at 7:00 PM, a job in my shop takes each finished client report, copies it into an archive, stamps it with a fingerprint so I can prove it wasn't altered later, and links it to the client's page [source: VAULT\_os\automation\workflows\report-brain-ingest.json; AUTO\report-brain-reconciliation\automation.toml]. It doesn't think. It doesn't need to. If a report is ambiguous about which client it belongs to, the job stops and says so. That refusal is a feature.

**A workflow** is the path written down: what comes in, where it goes, who touches it, what counts as done. A workflow can be run by a person, an automation, or an agent. It's the SOP, if you like that word. I don't, much. The workflow *is* the procedure. You don't need a second document describing it.

**An agent** gets a goal instead of a script. Every morning at 7:00 AM, a different job in my shop reads the overnight mail and chat, decides which threads are worth opening, opens only those, routes each item to exactly one client, and writes a summary back into the company brain [source: VAULT\_os\automation\workflows\daily-communications-brain.json; AUTO\daily-communications-brain\automation.toml]. Which threads to open is a judgement call. That's what makes it an agent and not an automation.

But look at what's around it. Each step has a token budget and a timeout. It retries at most twice. It won't retry at all if the mailbox or workspace doesn't match the one it expected. And it is not allowed to send anything. It reads, decides, writes, stops [source: VAULT\_os\automation\workflows\daily-communications-brain.json]. An agent in a business is a clerk you've handed a budget and a door that only opens inward.

Here's the decision table I actually use:

| If... | Build... |
|---|---|
| The steps are identical every time | An automation |
| The input varies but the rule is simple ("if the form has no phone number, flag it") | A workflow with a rule in it |
| A person currently reads, judges, and picks between paths | An agent, with a budget, a tool list, and a stop condition |
| The output leaves the building (send, post, spend, publish, delete) | A human gate, whatever you built above it |

The guidance I follow, and it's the guidance the better vendors publish too, is to begin with a simple workflow and add an agent when the task requires one, not before [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Risks and concrete responses"]. Most of what people call "agents" in a small business is a workflow with one branch. That's fine. Call it what it is and it's easier to fix.

A last test for any vendor demo: ask what it can't do. If the answer is "anything," walk. An agent with no limits isn't powerful. It's undefined.

## Chapter 2: Why don't three AI tools add up to a system?

**Short answer:** Because tools don't share facts. Each one starts from zero, knows nothing about your clients, and has no idea what the other tools did yesterday. An operating system is the layer that gives every tool the same facts, the same brand, the same rules about what needs a human, and one place to write down what happened.

I've watched owners buy a writing tool, a chat tool, and a scheduling tool, then spend an hour a day being the messenger between them. That's not automation. That's a new job, and you gave it to yourself.

Here's what no-system looks like, from my own desk. On September 4 my inbox held 104,403 messages, 93,334 of them unread, and 181 drafts. Fifty-seven of those drafts were unsent replies to paying clients, the oldest 38 days old. The three triage labels that were supposed to catch client mail were all empty [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Control-system gaps"; VAULT\12_Brain\07_Reviews\2026-09-07 - AI division evidence pass.md]. <!-- AUTHORIZE: first-party inbox numbers -->  The filters had stopped firing and nobody noticed, because an empty label looks exactly like a clean inbox. Fifty-seven backlog items were one broken filter. I'll come back to that pattern; it shows up more than once.

An operating system for a small business is four things. Not four products. Four decisions.

1. **One source of truth.** A single place that says who each client is, what they're called in every system, and what we currently know about them. Chapter 3.
2. **Reusable skills that carry your assets.** Instructions the tools can follow that already know where your logo, your brand colours, your deck template, and your intake questions live. Chapter 4.
3. **Gates.** A written rule for what a human approves, and a queue where the machine asks. Chapter 5.
4. **A loop with numbers.** Plan, check, fix, accept, and five counts per task so you know whether it's working. Chapter 6.

Everything else is a tool that plugs into one of those four.

**Which AI tools does a small business actually need?** Fewer than you own. You need something that holds facts (plain text files work; I'll defend that in a minute), something that runs on a schedule, something that drafts, and something independent that checks. The model you pick for drafting matters less than whether it can read your facts file. Any of the big models can. Pick one, pin the version, and change it only when the same acceptance test gets better on the new one [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Risks and concrete responses"]. Tool churn is how a system dies with everything still installed.

The most important tool in my operating system is a folder of text files. The company brain is a set of markdown pages that both a human and an agent can read and write. Captures go in one place and never get rewritten. Compiled knowledge goes in another and can be corrected. Every durable claim points at the capture it came from, or it gets labelled unverified [source: VAULT\CLAUDE.md, "Writing rules"]. A script checks the whole thing and fails if any page is orphaned or the graph breaks into two pieces [source: BATCH\research\evidence-bank.md, section C, "Second brain"]. That's it. No database. No platform. Files.

I wrote a rule for myself the week a new tool showed up with its own memory: do not build a second client database because a new harness has memory [source: M360\2026-09-04-ai-division-plan\PLAN.md, "The operating system and model roles"]. Every tool wants to be your source of truth. Let exactly one thing be, and make it something you can open in Notepad.

**Do I need SOPs first?** No. Write the workflow. Run it. The workflow is the SOP. If you write the procedure document first, you'll write what you wish happened. If you build the workflow first, you'll find out what actually happens, which is the only version worth writing down.

## Chapter 3: Where does the AI get its facts about my business?

**Short answer:** From one file you control, not from its memory. I keep a client registry - one record per client with its names, aliases, email domains, chat channel, and the date of the last evidence about it - and a one-page context file per client that every agent reads before it does anything. When the registry and anything else disagree, the registry wins.

"Tell the code who the client is." That's the whole trick, and it's harder than it sounds.

**The registry.** One file. One record per client. Each record carries the display name, every alias people actually use in chat, the email domains that belong to the client, the chat channel, the access references (which portal, which account, by name, never a credential), and the date of the last piece of evidence we have about them [source: C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json, field shape only]. When a job needs to route a message or a report, it resolves the client against this file. If it can't resolve the client unambiguously, it stops and reports the ambiguity rather than guessing [source: AUTO\weekly-client-marketing-reports\automation.toml].

That last sentence is the entire value. A model that writes a beautiful report for the wrong client isn't an assistant. It's a liability with good grammar.

**What I found when I audited my own registry.** I'll give you the honest before-state, because it's the same before-state you'll find.

- The chat-channel field was filled in for 5 of 24 records [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Control-system gaps"]. <!-- AUTHORIZE: registry coverage figure --> The field the routing depends on was mostly empty.
- Five clients had live chat channels and no record in the company brain at all. One of them was the only client with live ad spend the control system couldn't see [source: VAULT\12_Brain\07_Reviews\2026-09-07 - AI division evidence pass.md, §1].
- One client's folder was named one thing and its chat channel another. A third client had a complete website build sitting in a folder with no chat channel attached to it anywhere [source: same].
- A client that had ended was still listed as active with six open items against it [source: same, §3].

None of those is dramatic on its own. Together they're how a routing layer fails silently: two records that should join don't, and nobody notices because nothing crashed. If you do one thing this month, make the names match across every system. Boring. Load-bearing.

**The one page per client.** Under the registry sits a context page for each client. It's what an agent reads first. Ours carries roles rather than names, a fingerprint of the research it was compiled from, a confidence score, and the date window the evidence covers. And it says, right in the header, what it is not: it is not the work queue, it is not permission to deliver anything, and it does not attribute any message to any person [source: BATCH\research\evidence-bank.md, section C, "Client-history promotion"]. The page tells the machine what we believe. It never tells the machine what it's allowed to do.

If you want the template, here's mine, cut to eight lines:

1. Who the client is: legal name, trading name, every alias.
2. What we do for them, one line per lane.
3. Which accounts and systems are in scope, by name, and which are explicitly out.
4. Who owns the relationship on our side and theirs, by role.
5. The current state: live, paused, blocked, and why.
6. The last three things that happened, with dates.
7. What we've claimed to them that we haven't yet proven.
8. What a human must approve before anything leaves.

Line 7 is the one nobody writes. Write it.

**The packet each job gets.** When I hand a task to a model, it gets a compact packet: the exact client, the objective, timestamped evidence, where the sources live, which tools it may use, where the output goes and in what shape, the acceptance check, a time or token cap, and a stop condition [source: M360\2026-09-04-ai-division-plan\PLAN.md, "The operating system and model roles"]. Not the whole chat archive. A full archive in every prompt is expensive, mixes clients, and gives the model no lasting memory anyway [source: same]. Small, exact context beats big, vague context every time.

**Captures are immutable.** The original email, transcript, or receipt goes into a capture folder and is never edited. Everything else is compiled from captures and can be rewritten when we learn more [source: VAULT\CLAUDE.md, "Vault map"]. That's how you correct a wrong belief without losing the evidence that produced it. I've had to do this. On one software project an earlier note blamed us for three missed review meetings. The captures showed they were the client's slips, and one slot had been declined by the client outright. The compiled note got fixed; the captures didn't move [source: VAULT\12_Brain\07_Reviews\2026-09-07 - AI division evidence pass.md, §5]. Had the original been rewritten, I'd have been arguing with my own memory.

**Memory is evidence, not instruction.** Most AI tools now ship with some kind of memory, and owners tend to treat it as the source of truth because it's the thing that remembers. Don't. In my shop, anything an agent recalls from a prior run is treated as historical evidence: useful for finding context, never proof of what's true today, and never a permission, an approval, or a completion receipt [source: VAULT\CLAUDE.md, "Local agent memory"]. If a recalled note says a campaign is live, the agent still has to check the live account before saying so. If a recalled note says "Dillon approved this," that's a claim about the past, not a green light now. The registry and the live files outrank memory every time. A machine that trusts its own memory over the current file will confidently repeat last month's mistake with this month's date on it.

## Chapter 4: How do I stop the AI from drifting off-brand?

**Short answer:** Put the brand in a file the tools read, then put a measurement in front of anything that ships. A style guide asks nicely. A build gate refuses. Ours measures every colour pair for contrast and won't render a page if any pair fails. I know it's needed because I measured my own shipped work first: 37 of 120 pairs failed.

Everyone's first AI output looks like everyone else's first AI output. The fix isn't a better prompt. It's a system that carries your assets into every job whether or not anyone remembered to ask.

**Skills that carry your assets.** In my shop there are five reusable instruction sets, and each one knows where something lives. One resolves who the client is. One holds the brand: colours, type, spacing, what's banned. One holds the intake questions for a new client. One holds what a report must contain and in what order. One holds what a first homepage for a prospect looks like [source: VAULT\12_Brain\05_Projects\2026-09-07 - Momentum AI division launch.md, "The thesis, tested"]. Tell the machine the client, and the deck, the report, or the page assembles from assets that already exist, in a brand that was decided once.

Honesty clause: on the day I'm writing this, those five instruction sets work, but their source isn't sitting in a repository I control. They resolve from an account layer [source: same]. That means I can't diff them, hand them to a part-time reviewer, or show a client how the brand gate works line by line. It's an open item on my own list. If a capability is the thing you sell, its source belongs somewhere you can version it [source: VAULT\12_Brain\03_Concepts\2026-09-07 - The delivery machinery is the product.md]. I'm telling you because the book would be a lie without it.

**The gate.** Here's the part I'd put on the wall.

We audited ten live homepages we'd built, twelve colour pairs each. 120 pairs. 37 failed the accessibility contrast standard [source: M360\2026-09-05-momentum-design-system\AUDIT.md, §1]. Not random failures. Three structural ones:

- The accent colour printed on the brand colour: six of ten sites, at ratios from 1.01:1 to 2.72:1 against a 4.5:1 requirement. At 1.01:1 the text is invisible [source: same, §2.2(a)].
- The muted text colour on a card background: nine of ten sites, all between 4.28:1 and 4.49:1. Nine near-misses in a row is a formula, not nine accidents. The colour had been derived against the page background and then used on a card it had never been checked against [source: same, §2.2(b)].
- Headings on the deep field: seven of ten sites, at 1.78:1 to 2.86:1, because both colours came from the same hue [source: same, §2.2(c)].

The root cause was one idea: **one token cannot do two jobs.** Our brand orange scores 7.19:1 as a button fill with dark text on it, and 2.58:1 as text on white [source: same, §2.2]. No orange passes both. So the accent got split by job: a fill colour, a colour for labels on that fill, a colour for accent text on paper. The new system carries 31 measured pairs with zero failures, and the one pair that can't pass at body size is declared large-text-only rather than shipped quietly [source: VAULT\12_Brain\03_Concepts\2026-09-07 - One token cannot do two jobs.md].

Then the two mechanisms that matter more than the palette:

1. The build script refuses to render the page if any pair fails [source: M360\2026-09-05-momentum-design-system\AUDIT.md, §1].
2. The contrast checker reads the actual token file, not a copy of it, and proves itself against two known values before it runs [source: same]. A contrast tool that hasn't been checked against a known answer isn't evidence. The first version of ours read a colour format wrong and reported about a dozen false failures. That's why it now checks itself first.

A claim backed by a gate is a different kind of claim than a claim backed by a process document. The gate survives turnover, deadline pressure, and delegation. The document doesn't [source: VAULT\12_Brain\03_Concepts\2026-09-07 - The delivery machinery is the product.md].

And since we were measuring: our own marketing homepage was worse than the prospect sites. Five font families, twenty distinct corner radii, body text at 3.25:1 [source: M360\2026-09-05-momentum-design-system\AUDIT.md, §2.4]. The prospect kit was built once, recently, from tokens. The homepage was built over years by hand. Guess which one was coherent.

**The same idea on video.** The division's launch films were rendered locally, eleven of twelve planned pieces, with no generator credits spent. The logo in every frame is the canonical PNG, byte-verified against the source file. A QA script scans every frame for forbidden hues, and the one permitted accent measured at 0.0% of frame area across the batch [source: M360\2026-09-07-ai-division-video-batch\README.md]. The thirty-second spot itself was cut in a day for about $12 of generation spend against a $25 cap, and the cap is enforced by the scripts that run the jobs, not by anyone's good intentions [source: VAULT\12_Brain\05_Projects\2026-09-07 - Momentum AI division launch.md, "The launch spot exists"].

Write the brand down. Put it where the tools read it. Then put a measurement in front of the door.

## Chapter 5: What should never run without a human?

**Short answer:** Anything that sends, publishes, deploys, spends, changes an account, merges, or deletes. My rule is one line: if the action leaves the building, the machine drafts it, writes it to an approval queue, and stops. Reading, analysing, drafting, and building files run unattended. Reversible tweaks batch under one approval. Outbound is mine.

The rule, exactly as the orchestrator carries it [source: VAULT\11_Agents\Master Agent.md, "Decision logic"]:

- If the action sends email, publishes, deploys, spends, or deletes production data: draft it locally, append it to the approval queue, stop.
- If it edits a file in a folder we control: proceed with a reversible change and log the evidence.
- If a login is missing: write a blocker to the queue and keep doing unrelated safe work. Never attempt the login.

Three tiers fall out of that. **Tier 0** is read, analyse, draft, build files. It runs unattended, day and night. **Tier 1** is reversible tweaks; they batch and get one approval. **Tier 2** is anything outbound. The machine prepares it decision-ready. I execute it [source: same].

**The queue** is a checklist file. Each line has a date, the client, the action being requested, the condition that must be true first, where the evidence lives, and a risk grade [source: VAULT\System\approval-queue.md]. Mine has items on it from July. That isn't the system failing. That's the system refusing to guess while I'm the bottleneck, which is the design.

Here's what "draft, don't send" looks like across a day:

| When | What runs | What it's forbidden to do |
|---|---|---|
| 5:00 AM daily | Builds twelve prospect homepages from a queue, runs the gates, deploys to a private preview, stops for approval | Contact anyone [source: AUTO\momentum-radar-daily-12\automation.toml] |
| 7:00 AM daily | Reads overnight mail and chat, routes each item to one client, writes to the brain | Send anything; communication evidence never authorises a send [source: AUTO\daily-communications-brain\automation.toml] |
| 9:00 AM daily | Posts a health report, and counts as successful only after it reads back its own confirmation | Substitute zeros when a source is down; it labels itself degraded instead [source: M360\2026-08-11-hubspot-contact-alert-and-daily-health-report.md] |
| Every six hours | Drafts replies to human-actionable mail and chat, in my voice | Send; write "zero conversions" in any client copy [source: AUTO\six-hour-important-email-drafter\automation.toml] |
| Monday 10:00 AM | Assembles the weekly client reports as PDFs, with one email draft and one chat draft per client | Send, post, touch a bid, a budget, or a permission; put lead details in chat [source: AUTO\weekly-client-marketing-reports\automation.toml] |
| 7:00 PM daily | Archives finished reports with a fingerprint | Imply anything was delivered [source: VAULT\_os\automation\workflows\report-brain-ingest.json] |

Two more scheduled jobs exist and are paused: a read-only CRM pulse and a morning orchestrator that fans out workers and returns a top-eight approval board [source: BATCH\research\evidence-bank.md, section C]. I mention them because a table that only shows what works is an ad.

**What it looks like when the gate is missing.** Our own website chat assistant once told a visitor "I have routed this to the team" before it had collected an email address. The ticket landed with no owner, because the assignment rule required an available human and both humans were marked away [source: M360\2026-08-10-hubspot-handoff-notification-incident.md]. Nothing was lost that we know of. But the machine claimed a send it hadn't made, and that's the one thing a machine must never do. The fix was three settings and a rewrite of the message so it only claims a handoff after the handoff completes. The next day a workflow was added that emails, creates a task, and pushes an alert on every chat, and both teammates confirmed within nine minutes [source: M360\2026-08-11-hubspot-contact-alert-and-daily-health-report.md]. Do I have a before-and-after on response time from that? No. Nobody measured the before. I'd rather tell you that than invent one.

**Spend is the gate people forget.** Sending and publishing get gated because they're visible. Spend leaks quietly. One client of ours, a retail kiosk brand with locations inside convenience stores, believed a roughly $2,700 ad-platform balance was a single charge. The account actually held thirteen campaigns, each with its own $16.67 daily budget, which the client had understood as one combined $500-per-location ceiling. Thirteen simultaneous budgets meant potential exposure of $216.71 a day against a cap the client had set in writing [source: CO\replenish-7-eleven\paid-media\billing-audit-2026-07-28.md]. <!-- ANON: kiosk brand = Replenish / 7-Eleven; permission needed or cut; keep separate from Fresh Blends --> Nobody did anything wrong on purpose. The platform did exactly what thirteen budgets told it to. The lesson for your machine: a spend cap has to live in the thing that spends, not in an email someone sent in May. When my own launch spot was generated, the $25 cap was enforced by the scripts running the jobs, and the batch stopped at about $12 [source: VAULT\12_Brain\05_Projects\2026-09-07 - Momentum AI division launch.md]. Put the number where the money moves.

**Three more lines I don't bend:**

- Unavailable metrics are "pending validation." They are never estimated, and client copy never says "zero conversions" when the truth is "the counter wasn't connected" [source: M360\2026-07-26-paid-media-reporting-contract.md].
- Public or free model routes never receive secrets, raw private communications, client evidence, or context from more than one client [source: VAULT\12_Brain\09_Ops\AGENT_PROTOCOL.md, "Route models"].
- No healthcare or legal case records in a first workflow, and business-hours acknowledgement only; no 24/7 promise without paid coverage behind it [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Initial customer and qualification"; "Three offers"].

**How do I use AI in my business without breaking what already works?** This chapter is the answer. Every new job starts at Tier 0. It earns Tier 1 by producing reversible changes you'd have made yourself. It never earns Tier 2. What already works keeps working because nothing new can touch the outside world without you.

## Chapter 6: How do I know the machine is working?

**Short answer:** Five numbers, per task: did it succeed, how many critical errors, how many minutes a human spent repairing it, what it cost per accepted piece of work, and how long it took. If you can't fill those in, you have a demo, not a system. How fast the model generates text is not one of the five.

The loop is plan, critique, repair, accept, run as bounded stages [source: M360\2026-09-04-ai-division-plan\PLAN.md, "The operating system and model roles"]. One model plans and makes. A different one criticises. For anything that matters, the checker must be a different model family from the maker, and it must inspect the actual output or live result, not the maker's description of it [source: VAULT\12_Brain\09_Ops\AGENT_PROTOCOL.md, "Route models"]. Then the repair. Then a human accepts or doesn't.

Log five things per task [source: M360\2026-09-04-ai-division-plan\PLAN.md, same section]:

1. **Task success.** Did an accepted output come out the other end?
2. **Critical errors.** Wrong client, wrong number, a claim without a source, an action that should have been gated.
3. **Human repair minutes.** How long you spent fixing it. This is the number vendors hope you won't keep.
4. **Cost per accepted piece.** Not cost per attempt.
5. **Latency.** Start to accepted.

The plan I wrote for my own division includes a sentence I'll repeat here because someone will need it: a GPU's tokens per second measures generation throughput; it does not establish sales capacity or dependable autonomy [source: same]. Speed is how fast the machine can be wrong.

Here's the dashboard as a blank. One row per task, filled in the day the task runs, never reconstructed from memory later:

| Column | What counts | What doesn't count |
|---|---|---|
| Task success | An output the named person accepted | "Looked fine," or an output nobody reviewed |
| Critical errors | Wrong client, wrong number, unsourced claim, un-gated action | Typos, tone, formatting |
| Human repair minutes | Time you or the operator spent fixing it before acceptance | Time spent reviewing a correct output |
| Cost per accepted piece | All model and tool spend on that task divided by accepted outputs | Cost per attempt, or the vendor's list price |
| Latency | Time from the job starting to the output being accepted | Time from the job starting to the model finishing |
| Exceptions this week | Items the workflow couldn't handle and handed to a person | Items a person chose to handle anyway |

The right-hand column is there because every one of those is a number somebody will try to substitute when the real one looks bad. I've done it. The blank is how you stop.

**Acceptance is a contract, not a feeling.** For the flagship workflow we sell, acceptance means: 30 named test cases executed with at least 95% passing, every failure documented with an owner and a fix, the destination system reads back 100% of accepted records, no unresolved cross-account write failures, and the named operator completes five supervised cases. Then the decision-maker signs a scorecard. Support starts after the signature, not before [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Three offers with finite delivery contracts"]. Copy that. Change the numbers if you like. Don't drop a line.

**Two true numbers that disagree.** A batch of 100 prospect sites passed structural QA at 100 of 100. The best 25 passed a release gate at 25 of 25: identity, phone, address, no-index, accessibility, contrast at every width. A separate readiness check on the same batch reported "ready to call tomorrow: 0 of 100," because none had current suppression and relationship clearance [source: M360\2026-08-28-ai-tech-news-authored-100-review\BEST-25-QA-REPORT-2026-08-30.md; CALL-READINESS-RECHECK-2026-08-30.md]. Both numbers are true. They measure different things. A dashboard that shows only the first one is how you end up calling someone you promised not to.

**Sends are not replies.** Two waves of cold email, 241 messages, produced two bounces, two auto-replies, and zero verified human replies. The note next to that number says "no bounce is not proof of delivery." In the same fortnight, two hand-built audits both reached the quote stage [source: M360\2026-09-05-ai-division-launch-kit\DIVISION.md, "The finding Mac asked about"]. <!-- AUTHORIZE: first-party outreach result --> The lesson for your dashboard: sends, replies, quotes, signed, and collected are five separate counts. Never let the first one stand in for the last.

**A repeated broken promise is one defect wearing thirteen costumes.** We'd promised four clients a report matching their ad-platform "conversions" to the actual named people who inquired. Nine times to one client, twice each to two others, and it was holding up a fourth's deck. Thirteen promises. It couldn't be produced, because the automated notifications landing in the inbox carried no lead data, just a link to open the run somewhere else. On the one account where it worked, a painting contractor, the only difference was that the automation had been configured to parse the lead fields into the email body [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Match-back"; VAULT\12_Brain\03_Concepts\2026-09-07 - Conversion match-back is the differentiator.md]. <!-- ANON: painting contractor = Fagan Painting; permission needed or cut the descriptor --> Thirteen backlog items were one configuration change. The fix is queued behind approval as I write this, and we don't sell that report until it's true on all four accounts. When the same thing slips on several accounts, look for the shared upstream cause before you schedule more of the work.

**What I can't show you.** I don't have an hours-saved number. I don't have a response-time before-and-after. Every "reporting log" template in my own vault is an empty template [source: BATCH\research\evidence-bank.md, section E, gap 3]. No site we launched this summer has a measured traffic or lead change after launch [source: same, gap 2]. And on our own phone line, every call was associated with a contact and 0% had an owner assigned [source: M360\2026-07-27-callrail-hubspot-agent-completion.md]. <!-- AUTHORIZE: own-stack owner coverage figure --> The machine's job is to make those gaps visible so I can close them. It's doing that part.

## Chapter 7: What do the first 30 days look like?

**Short answer:** One workflow, one operator, one dashboard. Pick the repeated, costly, low-sensitivity task. Write the one page. Draw the workflow on paper. Build it in isolation, dry-run it, and run 30 named test cases. Hand it to a named person with an exception queue. Log the five numbers. Don't start the second workflow until the first is accepted.

**Week 1: choose and write.** The task qualifies if five things are true: the person who owns the relationship approves; the problem is repeated and costs something each time; baseline records exist; you can actually get access to the systems involved; and an employee will own adoption and exceptions [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Initial customer and qualification"]. Any missing condition becomes the first job. Prefer something low-sensitivity: form triage, drafting internal responses, reconciling lead sources. Not medical records. Not legal case files [source: same].

Then write the one page from Chapter 3 and fix the registry record. If the names don't match across systems, this is the week you make them match.

**Week 2: design on paper.** One intake source. One destination (a CRM or a sheet; a sheet is fine). One route. Duplicate protection. A drafted reply that a human sends. An exception queue for everything that doesn't fit [source: same, "Three offers with finite delivery contracts"]. Draw it. If you can't draw it, you can't build it, and the model can't either. Decide which tier each step sits in.

**Week 3: build in isolation.** A separate workspace. Dry-run before any live change. A written rollback [source: same, "Sales motion", step 6]. Then the 30 named test cases: real-looking inputs with known correct outcomes, including the ugly ones. An empty form. A duplicate. A message that mentions two clients. A test case is how you find the thing that only fails on Tuesdays.

One from our files. A new site for a small-town HVAC company had a three-step service request form that could submit during the transition between steps, storing a lead with no name, no phone, and no email. It was found by submitting the actual form, fixed the same day so it only submits on the final step with required fields, and both forms were then tested end to end with the notification emails confirmed in the inbox [source: CO\shadow-heating-cooling\deliverables\2026-07-23-website-qa\analytics-and-form-report.md]. <!-- ANON: HVAC company = Shadow Heating & Cooling; permission needed or cut --> That's a test case. No prompt would have caught it.

**Week 4: hand it over.** The named operator runs five cases with you watching. Build the dashboard: the five numbers, plus the exception count per week. Sign the acceptance. Now, and only now, the workflow is live, and your job changes from building to reviewing one improvement a month.

**The capacity math nobody wants.** For my own division I reserved 15 hours a week, ten of them for delivery. Three setups need roughly four weeks of that ten-hour allocation before any recurring service starts. So: at most one new setup per week, never more than two active builds, and every accepted client reserves about six hours a month, which is roughly 1.4 hours a week [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Economics and capacity"]. With three accepted clients, about 5.8 of the ten weekly hours remain for the next setup [source: same]. Run the same arithmetic on your own hours before you promise anyone a second workflow. The machine doesn't add hours. It moves where you spend them.

**After day 30.** The plan for my own division sets two more gates, and they're worth stealing because they're cheap. At day 60, add capacity only after two consecutive delivery cycles have hit their promised dates, their scope, and their review budget, and only after you've written down the reason for every late task and every rework cycle. Bring in part-time help when the next four weeks of demand exceed 70% of the capacity you actually have, not the capacity you'd like. And the test for whether you've built a system: a trained reviewer must be able to reproduce the acceptance check without you narrating every step [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Thirty, sixty and ninety days"]. At day 90, look at retention, collections, and whether anything is referenceable, then either standardise the most profitable repeated workflow or narrow to the one that works. Consider turning a workflow into a product only after several clients have bought essentially the same process. A custom feature for one client is not a product; it's a favour with an invoice [source: same].

**Two things I'd tell you on day one.** First, the workflow is the SOP; you will not need a separate manual. Second, the dashboard is not a report on the machine. It's a report on you. Human repair minutes is the number that tells you whether you built a system or a hobby.

## Chapter 8: When should I add an agent, and when shouldn't I?

**Short answer:** Add an agent when the task genuinely branches, when a person currently reads, judges, and picks between paths, and when you can write down its budget, its tools, its stop condition, and who checks it. Don't add one to look modern, to avoid drawing the workflow, or to anything that leaves the building.

**Add one when:**

- The input varies and the rule can't be written as a lookup. "Which of these forty threads are worth opening" is an agent question. "Archive every finished report" isn't.
- The volume is high enough that a person doing the judging is the bottleneck.
- A wrong answer is cheap and reversible. A mis-routed summary gets fixed in a minute. A mis-sent email doesn't.
- You can fill in the packet from Chapter 3: exact client, objective, evidence, tools, output shape, acceptance check, cap, stop condition [source: M360\2026-09-04-ai-division-plan\PLAN.md, "The operating system and model roles"].

**Don't add one when:**

- The steps are fixed. That's an automation, and an automation is cheaper, faster, and never surprises you.
- The output is outbound. Gate it, whatever sits above it.
- There's no baseline. If you can't say what a person's result looks like today, you can't say whether the agent's is better.
- There's no operator. An agent with no named human owning its exceptions is a slow leak.

**What ours are allowed.** Every agent job in my shop carries a per-step token budget and a timeout, retries at most twice, and has a list of failures it must never retry, starting with "the account doesn't match." It fails closed [source: VAULT\_os\automation\workflows\daily-communications-brain.json]. The prospect builder selects from a queue that held 1,311 records, 215 of them buildable on September 3, draining at about twelve a day, and when the queue runs low it says so in the first line of its report rather than inventing prospects [source: AUTO\momentum-radar-daily-12\automation.toml]. A repair pass over that estate re-rendered 296 sites in 24.3 seconds, skipped 27, wrote 268, harvested 30 usable logos, and fell back to a typographic wordmark on 70 where the logo wasn't good enough to show [source: M360\2026-08-28-radar-perfect-pass\REPAIR-REPORT.json]. Absent beats bad. The agent was told that in writing.

**Two cautions from the machine that runs this.** The delivery machinery is the defensible part of my business, but it doesn't sell itself; a machine with no relationship in front of it is a demo [source: VAULT\12_Brain\03_Concepts\2026-09-07 - The delivery machinery is the product.md, "Limits"]. And a gate that exists today does not fix what shipped before it existed. My contrast gate is real. So are the 37 failures it was built in response to [source: M360\2026-09-05-momentum-design-system\AUDIT.md, §1]. Don't let a new agent take credit for work it didn't check.

Start with the workflow. Add the agent when the task asks for it. Keep the door opening inward.

## FAQ

**What's the difference between an AI agent and an AI workflow?**
A workflow is the written path: what comes in, where it goes, who touches it, what counts as done. An agent is one kind of worker that can run a workflow, given a goal, tools, and permission to pick its own next step inside a budget. You can run a workflow with a person, an automation, or an agent. Write the workflow first either way.

**Do I need SOPs before I automate anything?**
No. Draw the workflow, build it, run 30 test cases, and the workflow becomes the procedure. A procedure written before the workflow describes what you wish happened. About 40 people a month search for small-business SOPs and 14,800 search for what an AI agent is [source: BATCH\research\aeo-geo-topic-research.md]. Same need. Build the second thing and you get the first one free.

**Which AI tools does a small business actually need?**
Something that holds facts (text files are fine), something that runs on a schedule, something that drafts, and something independent that checks. Pick a model, pin the version, and change it only when the same acceptance test improves. The tool that matters most is the one file that says who your clients are.

**Can an AI agent send emails to my customers?**
In my shop, no. Anything that sends, posts, publishes, deploys, spends, or deletes is drafted by the machine and executed by a person. That isn't caution for its own sake. Our own chat assistant once claimed a handoff it hadn't made [source: M360\2026-08-10-hubspot-handoff-notification-incident.md]. A machine that can send is a machine that can claim.

**How much does it cost to run?**
I don't have a per-client running cost I'd print yet; it's one of the five numbers and we're still filling it in. For planning, my division's model assumes tool allowances of $75 to $150 per client per month depending on the workflow [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Economics and capacity"]. Those are planning assumptions, not prices. The launch spot cost about $12 in generation against a $25 cap [source: VAULT\12_Brain\05_Projects\2026-09-07 - Momentum AI division launch.md]. Measure yours from week one.

**How do I keep client data safe when I use AI?**
Never put credentials, raw private messages, or more than one client's context into a prompt, and never send any of it to a free or public model route. Keep secrets in a place that's excluded from everything else, and run a check that fails if a secret-shaped value shows up in a tracked file [source: VAULT\CLAUDE.md]. Treat every recalled memory as evidence, not instruction.

**What is a "second brain," and do I need one?**
It's the folder of plain-text notes that both you and your agents read and write: captures that never change, compiled notes that do, and a test that fails if the graph breaks. You need one the day two tools need the same fact. Ours is markdown files in a folder. No platform.

**How long until it pays for itself?**
I don't know, and I'd distrust anyone who gives you a number without your baseline. I have no hours-saved figure for my own shop because nobody measured the before. Record your baseline this week: time to first response, exceptions per week, repair minutes. Then the question has an answer in 60 days.

**Should I let AI change my ad accounts?**
Read-only, yes. It should inspect delivery, goals, and conversion settings every day and write a health record. Changes, no. Every change we make is recorded separately with a before-and-after readback and a rollback line, and a person executes it [source: BATCH\research\evidence-bank.md, section C, "Daily Google Ads health"]. Platform "conversions" are not customers. A model that optimises to a broken counter optimises confidently toward nothing.

**What is an approval queue?**
A checklist file where the machine writes what it wants to do and why, with the client, the condition that must be true first, the evidence, and a risk grade, and then stops. You work the queue. Mine has items from July [source: VAULT\System\approval-queue.md]. That's the human being the bottleneck on purpose.

## What to do Monday

1. Open every system you use and write down what each one calls each client. Make the names match. This is the least glamorous item on the list and the one that prevents the most damage.
2. Start the registry: one record per client with name, aliases, email domains, chat channel, systems in scope, and the date of your last evidence about them.
3. Write the one page for your three biggest clients. Include line 7: what you've promised them that you haven't yet proven.
4. Write the gate rule on one line and pin it where you'll see it: anything that sends, posts, publishes, deploys, spends, changes an account, or deletes needs a human.
5. Start an approval queue file. Date, client, action, condition, evidence, risk. Nothing outbound happens without a line in it.
6. Pick one workflow using the five conditions from Chapter 7. Reject anything that fails even one.
7. Draw it on paper: one source, one destination, one route, a duplicate check, draft-then-human-sends, an exception queue.
8. Record the baseline before you build anything: how long leads wait today, how many exceptions a week, how many minutes you spend fixing things.
9. Write 30 test cases, including the ugly ones: the empty form, the duplicate, the message that names two clients.
10. Put the brand in a file: colours, type, the logo's location, the words you never use. Measure the colour pairs before you trust them.
11. Set up the dashboard with the five numbers plus exceptions per week. Fill it from day one, even when the entries are zero.
12. Do not start the second workflow. Not this month.

If you want a second pair of eyes on which workflow to pick first, the free 15-minute qualification snapshot is three evidenced observations about your business and a suggested next step. No deck, no pitch. Details below.

## About Momentum AI

Momentum AI is the AI division of Momentum Digital, a Philadelphia marketing agency founded in 2015 (needmomentum.com). The division runs four lanes: AEO/GEO, AI Design, AI Marketing, and AI Automation [source: BATCH\SPOT-SCRIPT.md, "Facts in play"].

Three offers, each with a written 30-day scope and an acceptance test [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Three offers with finite delivery contracts"]:

- **Lead Operations Pilot.** One intake source, one destination CRM or sheet, one routing workflow, duplicate protection, an internal response draft, an exception queue, one dashboard, and an operator handoff. Accepted only after 30 named test cases run at 95% or better, the destination reads back 100% of accepted records, and the named operator completes five supervised cases. One approved improvement a month after that.
- **AI Visibility Program.** One domain or location, a baseline of 20 buyer questions across two chosen AI engines, two page improvements a month, and repeated measurement where every reported observation carries the engine, the question, the date, and the source. It reports observed presence. It does not guarantee rankings, citations, leads, or revenue.
- **Campaign Production System.** One brand, one brief, four original concepts, up to eight size variants, and one readiness summary a month, using approved brand assets. No shoot, no custom animation, no paid placement.

<!-- EDITOR: PLAN.md proposes prices (Lead Ops $3,500 setup / $1,500 monthly; Visibility $1,500 / $1,500; Campaign $750 / $1,250) and states "No offer has been approved or sent through this work." Do not print prices until Mac Frederick signs off. -->

Every offer is built the way this book describes: one source of truth per client, the brand carried in a file, a human gate on anything outbound, and five numbers on a dashboard. Built, not prompted.

**The free 15-minute qualification snapshot.** Three evidenced observations about your business and a suggested next step, produced in under 30 minutes on our side and delivered in 15 on yours [source: M360\2026-09-04-ai-division-plan\PLAN.md, "Three offers"]. It's the only thing in this book I'm asking you to do with us. Request it at needmomentum.com.
