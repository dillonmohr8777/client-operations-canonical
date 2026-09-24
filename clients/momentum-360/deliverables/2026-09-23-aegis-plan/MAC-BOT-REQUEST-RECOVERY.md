# Mac bot requests: source recovery (2026-09-23)

## September 15: internal FAQ assistant

- [Mac's request](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1789479841450309): an internal Slack FAQ channel using company information and processes so employees and new hires can ask questions and find resources. Melissa pointed to the existing Master Hub in the AM channel; Dillon said he had a similar idea and would finish it.
- [#momentum-help](https://momentum3d.slack.com/archives/C0C2VSTBQ9W) was created September 15. Its purpose names **Momentum Answers** for process, onboarding, training, and reviewed drafting modes. The bot joined the channel and [answered a Master Hub question](https://momentum3d.slack.com/archives/C0C2VSTBQ9W/p1789492316385399) with canvas citations. A second setup prompt required a retry after background-service startup; [the bot corrected an unsupported availability claim](https://momentum3d.slack.com/archives/C0C2VSTBQ9W/p1789495130051929) and said it operates only while the Windows host is on, signed in, and running Ollama.
- [Momentum Workmate](https://momentum3d.slack.com/archives/C0C2VSTBQ9W/p1789515245381709) separately joined #momentum-help. [A test mention](https://momentum3d.slack.com/archives/C0C2VSTBQ9W/p1789515262497569) received no bot reply in its thread. Channel history read on September 23 showed the last channel activity on September 15. This proves Slack setup and a Momentum Answers test response, not current operation or a complete rollout.

## September 23: separate public audit request

- [Mac's request](https://momentum3d.slack.com/archives/C1CFQBC79/p1790179942568589): replace paid MySiteAuditor with a richer AI website audit, retain the lead and audit, and make it available for Jesse to review with the lead.
- [Mac's detailed follow-up](https://momentum3d.slack.com/archives/C1CFQBC79/p1790181113356099): collect name, phone, email, website, business description, and goals; CTA opens the form; submission reaches a conversion thank-you page; email the completed website/SEO/AEO audit to the lead and CC Mac and Jesse.
- [Obaid's proposed flow](https://momentum3d.slack.com/archives/C1CFQBC79/p1790200788266339): background scan of SEO, AEO, speed/mobile, SSL and broken links, plus CRM and email routing. [Mac's latest answer](https://momentum3d.slack.com/archives/C1CFQBC79/p1790201627631859): the existing Leads Sheet may be the first destination with Zapier routing onward to CRM and email; Claude is acceptable; the report needs Momentum Digital branding and a final CTA page explaining next steps and why to hire the team. This is a scope decision, not a live delivery receipt.

## Name and status limits

- Exact lexical searches of accessible Slack and Gmail for **WorkTree**, **work tree**, and **Fastly** found no matching project request. `Fastly` also yielded no Gmail result without a date filter. Treat these words as unresolved speech/transcription references; do not infer a Fastly vendor deployment.
- Search and channel read covered the September 15 FAQ thread, #momentum-help through September 23, and the September 23 #momentumsites request. Runtime/deployment status requires local service and process evidence. No message was sent to Mac.

## Next verification

Inspect the Momentum Answers and Momentum Workmate service/configuration, current process and host/Ollama state, startup persistence, and one controlled read-only functional test. Keep the public MySiteAuditor replacement in the separate Aegis intake/release track.
