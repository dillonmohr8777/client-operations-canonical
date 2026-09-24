---
title: "What is an AI agent? (And what is just an automation)"
slug: what-is-an-ai-agent-and-what-is-just-an-automation
target_query: "what is an ai agent"
intent: informational
feeds_ebook: "D - The Small Business AI Operating System"
meta_description: "An agent decides its own steps. An automation runs fixed ones. Most small businesses need the automation first. A decision table, gates, and five numbers."
publish_week: 5
sources:
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\research\aeo-geo-topic-research.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-07-google-aistudio-batch\research\evidence-bank.md
  - C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\deliverables\2026-09-04-ai-division-plan\PLAN.md
---

# What is an AI agent? (And what is just an automation)

By Dillon Mohr, Momentum Digital, Philadelphia

An AI agent is software that takes a goal, decides its own steps, uses tools, checks its own work, and keeps going until the goal is met or it gives up. An automation runs the same fixed steps every time. Most small businesses need the automation first. Add an agent only when the task needs judgment.

I run both every day. Here's the operator's version of the definition, and how to decide which one you need.

## What's the difference between an agent, a workflow and an automation?

Three words, three different amounts of freedom.

| | Automation | Workflow | Agent |
|---|---|---|---|
| What it is | One trigger, fixed steps | Several automations chained, with branches | A goal, tools, and the freedom to choose steps |
| Example | Missed call, send a text | Lead arrives, check for duplicate, route to owner, draft reply, log it | "Read what this lead asked and draft a reply that answers it in our voice" |
| What can go wrong | It fires when it shouldn't | A branch nobody tested | It does something reasonable that you didn't want |
| How you check it | Did it fire? | Did every branch land? | Did a person approve the result? |

The automation is dumb and reliable. The workflow is dumb, reliable and longer. The agent is smart and needs a gate.

## Why is everyone searching for this now?

"What is an AI agent" gets about 14,800 searches per month in the US. It went from 8,100 a month in December 2025 to 22,200 a month by spring 2026. "AI workflows" is another 2,900. This is the biggest informational question in the whole small-business AI space right now.

The answers on page one are mostly from companies that sell agents, so the definition tends to end with their product. Mine ends with a rule instead.

## Which do I need first?

The rule we use in our own work: begin with a simple workflow, and add an agent when the task requires one. Not before.

The test is one question. Can you write the steps on one page?

If yes, it's an automation or a workflow. Build that. It'll be cheaper, faster and it won't surprise you.

If the steps depend on reading something and deciding what it means, that one step is an agent. Only that step. Everything around it stays fixed.

Take intake, since it's the first thing most service businesses automate. A lead comes in from a form, a call or a text. Checking whether it's a duplicate is an automation. Routing it to the right person by service type is an automation. Drafting a reply in your voice from what the lead actually wrote is the one agent step. Sending the reply is a human. One agent, wrapped in fixed steps, with a person at the end.

## What should stay human?

Gates. This is the part nobody puts in the definition and it's the part that keeps you out of trouble.

Here's how we tier our own operations:

- **Tier 0: read and draft.** Runs unattended. It reads inboxes, reads reports, writes drafts. It can't send anything.
- **Tier 1: low-risk changes.** Batched and shown to a person under one approval. Approve the batch or don't.
- **Tier 2: send, post, deploy, spend, delete.** A person does it. Every time. No exceptions for "just this once".

The pattern that makes this work is how the machine asks. Our correction packets, the documents our automations write before any live change, are structured in a fixed order: verified facts first, then hypotheses labeled as hypotheses and not findings, then the live actions that need approval. The agent's job isn't to act. It's to ask well enough that a person can say yes in thirty seconds.

If a vendor's agent doesn't have a place where a human says yes before money moves or a message goes out, it isn't an agent for a small business. It's a liability with a chat window.

## How do I know the machine is working?

Five numbers. Track them from day one, per task type.

1. **Task success rate.** Did it finish what it was asked?
2. **Critical errors.** Wrong customer, wrong amount, wrong send. Should be zero. Count them anyway.
3. **Human repair minutes.** How long a person spent fixing what it did. If this climbs, the agent is making work, not saving it.
4. **Cost per accepted piece of work.** Not per attempt. Per thing you actually used.
5. **Latency.** How long from trigger to a result a person could act on.

One rule behind all five: when the machine can't see a source, it says so instead of printing a zero. Our own daily health report is built to label itself degraded when a data source is unavailable. A zero that means "nothing happened" and a zero that means "I couldn't look" are different numbers, and an agent that can't tell you which one it's reporting will eventually lie to you by accident.

## What does a small business AI operating system look like?

This is the preview of the longer book, so I'll keep it to the parts.

- **One registry.** Every customer in one list, with one record that says who they are, what you do for them and who owns the relationship.
- **One page per customer that the machine reads first.** Before any agent touches a customer's work, it reads that page. That's how it knows the brand, the boundaries and the history.
- **Skills that carry your assets.** The brand file, the report template, the intake checklist. Reusable, so every job starts from the same place.
- **Gates.** The three tiers above.
- **A loop.** Plan, critique, repair, accept. Every piece of work goes through it, and the five numbers come out of it.

Thirty days to get there: one workflow, one person who owns it, one dashboard with the five numbers. Then add the next workflow. Agents come later, one step at a time, where the task earns them.

## FAQ

**Is ChatGPT an AI agent?**
Out of the box, no. It's a model you talk to. It becomes an agent when it's given tools, a goal and permission to act, which is exactly the moment you need gates.

**Do I need SOPs before I automate?**
No. The workflow is the SOP. Writing the steps down clearly enough to automate them is the documentation you were putting off.

**What's the first agent a service business should build?**
Usually none. Start with intake routing as a workflow. The first agent step is drafting replies from what the lead wrote, with a person sending them.

## The next step

If you want to know which of your tasks is a workflow and which one actually needs an agent, I'll do a 15-minute snapshot: three observations about how work moves through your business today, with the evidence for each, and one suggested next step. Free. No deck, no pitch. Reach me through needmomentum.com.

Momentum built the machine. Now we build yours.
