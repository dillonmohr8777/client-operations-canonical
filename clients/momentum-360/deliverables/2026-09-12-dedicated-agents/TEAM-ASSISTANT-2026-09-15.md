# Momentum team assistant: September 15 implementation

Status: LIVE IN #momentum-help. OWNER ACCEPTANCE VERIFIED; NON-OWNER EMPLOYEE ACCEPTANCE NOT YET RUN.

## User outcome

One internal team entry point for finding processes, onboarding resources and
training, plus useful drafts for Jason, Sean, Mac, Melissa Silber and Melissa
Rigby. This extends the existing work rather than replacing the Workmate owner
operator or declaring historical shadow packets live.

Mac's exact request and Melissa's AM Master Hub follow-up were read live:
https://momentum3d.slack.com/archives/C04HXSVN2CS/p1789479841450309

## Implemented

- 23 reviewed resources: real Master Hub guidance, onboarding and strategy
  templates, client-update cadence, reporting, Agency Analytics tutorials,
  company signature, lead reporting, AI training and Dillon's site reference.
- Local FAQ selects verified source passages and returns their source links.
- All five existing public role contracts drive explicit role drafting commands.
- Draft follow-ups retain provided inputs within the same employee/channel/thread.
- Credential screening, exact Slack team/app/bot/channel checks, internal-member
  checks, source integrity checks, duplicate protection, one bounded worker,
  immediate progress notice, persistent stop and fail-closed uncertain delivery.
- Separate Windows Credential Manager launcher and optional logon task setup.
- Existing Workmate task freshly observed Running. Its full operator code,
  credentials and owner-DM gate were not changed.

## What the checks prove

14 offline acceptance groups pass. They exercise envelope and membership
rejection, empty allowlists, wrong app identity, source/path integrity, no
operator import, credential handling, deduplication, ambiguous-send handling,
restart behavior, stop, source-scoped rendering, role support, context isolation
and streaming inference deadlines. Live-discovered fixes cover the exact ChatGPT
connector footer on commands and unsupported availability phrases in drafts
about Momentum Answers.

The existing five-mode shadow runtime also passes its 36 checks.

Live local inference:
- Monday client-update question returned the actual Master Hub guidance and links.
- Vacation-days question returned unknown and named a human source.
- Revised Melissa Silber draft produced three separate concepts, suggested copy,
  production directions and missing inputs. Elapsed: 98.79 seconds on this host.
- No Slack messages or paid model API calls occurred in those tests.

The original small-model draft was generic and is superseded by the revised
prompt. The larger local model experiment did not produce usable acceptance
evidence. Default FAQ and draft model is the installed local llama3.2:3b.
The quality-model option remains explicit configuration, not an automatic
fallback or an unverified quality claim.

## Important corrections

The old local Facebook SOP files are mostly empty outlines. A previous claim
that they supplied complete audit/launch/reporting guidance was unsupported.
The source catalog now labels this gap.

The prior operator=False implementation used workspace-write and inherited a
broad Codex runtime. The new team answer path imports no operator and exposes
no tool execution to the model.

The AM Master Hub itself has gaps: its AM Best Practices PDF is a local-file
link; the quarterly template is a request to Mel; the visible Friday template
ends after its greeting. Those are identified rather than invented.

## Slack installation and live acceptance

Dillon confirmed the exact installation, public internal #momentum-help channel,
two labeled test exchanges, and direct protected credential entry on September 15.

- Workspace: Momentum Digital Agency, T066HGS7N.
- Created and installed Momentum Answers: A0C23EC7TPB. Slack showed Success and
  Installed App Settings after OAuth approval of the four reviewed scopes.
- Created #momentum-help: C0C2VSTBQ9W. It is public within the workspace.
- Bot user U0C1L5T8F47 (bot B0C256VP1HS) joined at 1789491653.158359;
  independent Slack connector readback verified membership.
- Saved concise channel instructions naming all five drafting roles.
- Socket Mode is enabled with connections:write. After Dillon explicitly
  delegated setup, computer control transferred the new tokens through the
  existing one-use loopback form into dedicated Windows Credential Manager
  targets. No Workmate credential was changed; no secret entered repository files.
- Config is enabled for the exact app, bot user and channel. Startup verified
  Slack auth.test and bots.info plus the local model identity.
- The Monday FAQ reply at 1789492354.189159 passed independent Slack readback:
  actual Master Hub guidance and two source links, about 38 seconds after request.
- The Melissa Silber reply at 1789494916.473049 passed independent readback:
  three distinct concepts with headline, copy, direction, CTA and missing inputs,
  about 91 seconds after the accepted retry.
- The temporary worker stopped during task interruption. The persistent
  Momentum360-TeamAnswers task now runs at user logon, with restart handling.
  It was restarted after both command and availability fixes; fresh task,
  process and established HTTPS-connection checks passed. Workmate remains Running.
- A delayed setup request produced another draft containing an unsupported
  24/7 claim. That reply, 1789495130.051929, was replaced with a clear correction
  and its readback verified. The artifact preserves its original generation hash
  separately from the corrected reply hash; it is not counted as a passing draft.

Evidence: org-modes/faq-live-slack-check.json and
https://momentum3d.slack.com/archives/C0C2VSTBQ9W/p1789492316385399
Employee examples: TEAM-QUICKSTART.md.
A real non-owner employee exchange has not been run; no one was impersonated.

POSTED in the ledger means the API acknowledged the original message. Independent
Slack readback and the later correction are recorded separately in the artifact.

Role drafts are useful local work products. They do not execute the old lead
adapter, reconcile CRM records, create rendered assets, operate client accounts,
or grant employees Dillon's private operator authority. Those integrations need
their existing role/client permissions and outcome acceptance. The original
Workmate operator remains the owner execution path.

## Operational limits

This PC needs to be on, signed in and running Ollama. The prepared logon task
survives closing Codex but is not evidence of 24/7 service. Team production on an
always-on host requires its own credential and availability verification.

Local model latency is material. The revised draft took about 99 seconds; the
progress notice prevents a silent wait. Single-worker capacity is intentionally
bounded and can return busy. There is no throughput benchmark for many employees.

Catalog source review is a dated snapshot, with review due by October 15.
Videos are linked resources; their transcripts have not been ingested. Existing
source-file permissions remain in force.

A separate unused Ollama desktop server was observed listening on IPv6/all
interfaces with zero registered models, alongside the working IPv4 loopback
service. The assistant explicitly uses 127.0.0.1. Neither service nor global
machine settings were changed during this implementation.

## Files

org-modes/faq_bridge.py
org-modes/faq_bridge_test.py
org-modes/faq-config.json
org-modes/faq-knowledge.json
org-modes/faq-app-manifest.json
org-modes/faq-setup.md
org-modes/faq-quality-local-check.json
Start-MomentumAnswers.ps1

Original FAQ backup:
C:/Users/dillo/Documents/Codex/2026-09-14/do-this-2/faq-before-20260915

## Official implementation references

Slack Socket Mode:
https://docs.slack.dev/tools/bolt-python/concepts/socket-mode/
Slack mention event:
https://docs.slack.dev/reference/events/app_mention/
