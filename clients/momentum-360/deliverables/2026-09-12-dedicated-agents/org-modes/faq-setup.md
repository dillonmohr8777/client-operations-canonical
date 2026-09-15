# Team FAQ bot, setup

Built 2026-09-15 from Mac's request in `#ai-tech-news`. Read
`12_Brain/04_Decisions/2026-09-15 - Mac's FAQ bot is a second surface, not an opened Workmate.md`
in the vault for why this is a separate bot instead of opening Workmate up.

## What is done and proven

`faq_bridge.py` answers questions from a corpus and nothing else. Verified live
on 2026-09-15 through the Workmate venv:

| Test | Result |
|---|---|
| "What do I check when auditing a Facebook ads account?" | Answered correctly, cited `Facebook Ads Audit SOP.md` |
| "How many vacation days do new hires get?" | "That is not in the SOPs yet." plus who to ask. Did not guess. |
| 6 guard tests (`faq_bridge_test.py`) | All pass |

It runs on the Codex subscription like Workmate, so there is no per-message API
charge.

## Corpus

`faq-config.json` line 2. Currently `04_SOPs` (9 files). **Everything in that
folder is readable by everyone in the Slack channel.** That is the whole security
model, so changing this line is a real decision, not config.

`04_SOPs` was chosen because it is the only folder in the vault that exists to
hold process documentation, and because both files that tripped a secret scan
turned out to be rules *about* handling secrets, not secrets. It deliberately is
NOT the whole vault: `01_Clients`, `12_Brain` and `02_FullTimeJob` carry client
intelligence, spend and the job-search lane.

Swap it by editing one line. Re-run `--list-corpus` and the guard tests after.

## What is NOT done: the Slack transport

The bot needs **its own Slack app**. It must not reuse Workmate `A0C2K8ZU6AU`:
that app's bot identity is bound to Dillon's owner DM inside
`operator_bridge.py::receive()`, and sharing it would put a team-facing bot and
a full-authority operator behind one token.

That is a human step in Slack admin. Three things:

1. Create a Slack app, name it something like "Momentum Answers". Bot scopes:
   `app_mentions:read`, `channels:history`, `chat:write`. Enable Socket Mode and
   generate an app-level token with `connections:write`.
2. Store both tokens in Windows Credential Manager the same way Workmate does.
   Never in a file. `Start-WorkmateOperator.ps1 -ConfigureCredentials` is the
   pattern to copy.
3. Invite the bot to one channel, put that channel ID in
   `allowed_channels` in `faq-config.json`, and wire the Socket Mode listener
   in `faq_bridge.py::main()` under `--serve`. It currently exits 2 with a
   pointer to this file rather than pretending to be wired.

Keep `allowed_channels` empty until step 1 and 2 are done. Empty means the bot
answers nowhere, which is the correct default for a thing that has not been
tested in front of the team.

## Try it now, without Slack

```
$py = "$env:LOCALAPPDATA\Dillon\MomentumWorkmate\venv\Scripts\python.exe"
& $py faq_bridge.py --list-corpus
& $py faq_bridge.py --ask "What do I check when auditing a Facebook ads account?"
& $py faq_bridge_test.py
```
