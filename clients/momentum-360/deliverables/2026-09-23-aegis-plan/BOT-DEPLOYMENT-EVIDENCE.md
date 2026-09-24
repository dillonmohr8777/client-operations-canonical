# Momentum Slack bot and Fastly status

Read-only deployment audit, 2026-09-23. The words “WorkTree” and “Fastly” did not match a project name in the source search. The Slack recovery packet identifies the likely bot request as Mac’s Sep 15 internal FAQ request. Keep that separate from the Sep 23 MySiteAuditor replacement request.

## Momentum Answers: built and test-installed, not fully rolled out

- Slack history and the Sep 15 release note show Momentum Answers installed in #momentum-help, with a Master Hub FAQ response and a role-draft response read back. This proves that a useful FAQ path was built and tested once; it does not prove current service availability or team acceptance.
- The FAQ app uses a reviewed local source catalog and local Ollama model llama3.2:3b. This was chosen to keep inference on the Windows host and avoid paid model API calls. Its dependency is real: the documented launcher requires the host signed in with Ollama running.
- It is distinct from Momentum Workmate. Workmate is an owner-DM operator; its prompt is explicitly restricted to Dillon’s private DM. A test mention to Workmate in #momentum-help did not get a reply, which is consistent with the surface boundary and is not a failed Momentum Answers test.
- No non-owner employee acceptance exchange was verified, and the FAQ app is not a 24/7 service.

## Current local runtime evidence

| Check | Current observation |
|---|---|
| Momentum360-TeamAnswers scheduled task | Registered for interactive user logon; currently Ready, last run 2026-09-22 01:51 EDT, result code 1. |
| FAQ bridge process | No faq_bridge.py worker process observed. Its lock file is stale: it contains PID 0, which maps to System Idle Process, not the FAQ worker. |
| Read-only startup preflight | Passed on 2026-09-23 using the protected FAQ credentials: Slack auth/app identity and the configured local Ollama model verified. No Socket Mode listener started and no Slack message was sent. |
| Ollama | Loopback API at 127.0.0.1:11434 responded; llama3.2:3b is installed and its model verification passed. |
| Momentum360-WorkmateOperator | Separate task is Running at interactive logon and a Workmate Python process is present. This confirms the owner operator is running on this host, not the team FAQ surface. |

The FAQ task’s original failure detail cannot be recovered: the hidden PowerShell launcher sends process output nowhere persistent and returns only task result 1. The checked Task Scheduler operational window had no matching event. The present read-only preflight passes, so the historic failure remains undiagnosed; it may have occurred after preflight or during a transient startup/socket step, but that is not proven.

## Fastly

Exact Fastly searches in accessible Slack and Gmail returned no project request. The inspected first-party source and deployment artifacts contain no Fastly app/configuration or deployment receipt. Status is unknown; there is no evidence to claim it was built.

## Separate Sep 23 audit request

Prospect Radar V2 / the MySiteAuditor replacement is a different project. Its local intake/audit code and synthetic PostgreSQL restart rehearsal exist, but its README and compose file describe local-only infrastructure and no production app deployment was found. See INTAKE-RELEASE-READINESS.md and MAC-BOT-REQUEST-RECOVERY.md for the distinct scope.

## Next action

A controlled FAQ listener start is still pending. The exact command is Start-ScheduledTask -TaskName Momentum360-TeamAnswers. Because it enables automatic replies in a Slack channel, run it only after explicit approval. For reliable team operation beyond this signed-in desktop, the FAQ needs an approved always-on host and its own availability/readback acceptance.
