# Leftover 51–75 factory status

The existing AI Tech News factory was run from this environment for a local noindex preview of the five leftover demo gaps. A parallel generator was not started. Nothing was deployed.

## Required engine

- Repo: `dillonmohr8777/dillon-os`, merged PR 226
- Binding: `integrations/buzz/stack.bindings.json` source-deploy route
- Verified local path on Dillon’s machine: `C:\Users\dillo\Documents\Codex\2026-07-29\monitor-this-session-on-cursor-i\work\pr226-site-factory`
- Cursor `gh` still cannot see the private repo. Composio GitHub account `github_jamnia-altica` (login `dillonmohr8777`) can.
- Factory files used here were fetched from `dillon-os` `main` and executed under `/tmp/dillon-os-factory/`. Built sites stayed in `/tmp/leftover-factory-preview/`.

## What ran at 2026-08-31 22:18 UTC

| Step | Result |
| --- | --- |
| `GITHUB_GET_REPOSITORY_CONTENT` for `build-site.js`, `qa.js`, `lib/*`, `harvest.js` | Success |
| Official first-party scrapes for ranks 58, 60, 66, 68, 69 | Success |
| `node build-site.js <brief> /tmp/leftover-factory-preview` | Five noindex sites |
| `node qa.js <site>` with Playwright | All five `PASS` |
| Deploy | Not run. Tier 2. |
| Ready 50 / Jesse | Not written / not pinged |

See `factory-preview-results.json` and `factory-preview-briefs/`.

## Still required before call-ready

1. Official harvest imagery through `harvest.js` + `apply-harvest-images.js`. Current assets are labeled preview placeholders.
2. Maker/checker walkthrough on Dillon’s machine.
3. Dillon runs deploy from the authorized factory path. This environment must not deploy.
4. Deploy-preview and production QA after deploy.
5. Then, and only then, Ready 50 rows and a Jesse ping.

Verruni (67) and BPM Fitness (75) remain official-pending and were not built.
