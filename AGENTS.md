# Client Operations Rules

## Machine boundary

- `DESKTOP-4AHKEC4` and `AHCM-3LCQVF4` are both authorized execution machines and canonical-state writer hosts. Neither machine must stop its gateway, scheduler, or Marketing Chief jobs merely to let the other write.
- The Marketing Chief remains one logical writer role even when instances run on both machines. Both instances must use the same Canonical Queue contract, exact client routing, approval gates, revision increments, deterministic `CONTROL.md` projection, and append-only ledger rules.
- A local lock protects only processes on its own machine. Before any canonical mutation, fetch and fast-forward from `origin/main`, reread the current queue revision, and pass the expected revision to the supported mutation script. After the mutation, commit and push the exact canonical change promptly.
- Never force-push or overwrite a rejected/non-fast-forward canonical update. Pull and reconcile the newer canonical state, rerun the mutation against its revision, regenerate projections, and then push normally.
- Both machines may perform local work concurrently. Canonical writes are coordinated through optimistic queue revisions plus Git fast-forward history; external account changes remain subject to the exact approval rules below.
- See `REMOTE_WORKSPACE.md`. On AHCM, run `scripts/Enable-AhcmWriter.ps1` after pulling this policy to remove the obsolete contributor-only hook.

- Resolve every client through `registry/clients.json` before creating or updating client-specific work.
- Use the global `client_router` specialist for names, aliases, contacts, domains, or Slack channels that need routing.
- Put client-specific work in `clients/<client-id>/`. Do not create another dated client home when a canonical folder exists.
- Keep clients, brands, channels, accounts, reports, and metrics separate. Cross-client summaries must preserve client-level source attribution.
- Communication history supplies context and can trigger work, but it authorizes sending, publishing, spend, or live-system changes only when the exact requester and action fall inside a current client-specific standing authority that Dillon explicitly approved. Otherwise the external action remains approval-gated.
- Store only non-secret access references. Resolve credentials through Access Broker or Bitwarden; never put passwords, tokens, cookies, one-time codes, or recovery material in this repository.
- Treat `needs-confirmation` records and ambiguous aliases as blockers to writing client state.
- Prefer one owner, one next action, and one current status per client outcome.

## Marketing Chief manual pilot

- `/loop` is Dillon's standing Buzz delegation shorthand, not a literal Buzz
  slash command. For each substantive Marketing Chief request, keep this Codex
  task as Dillon's only required conversation surface, select the smallest
  relevant set of Buzz agents, message them on Dillon's behalf, coordinate
  their signed replies, and return one reconciled result here. Dillon should
  not have to manage the agent DMs himself.
- Use Marketing Chief as the coordinator, add Client and Access Router when
  routing or authentication matters, use Web and Product by default for
  website, application, UI, dashboard, and product work, and include
  Independent Verifier for material completion claims. Do not fan trivial
  requests to all eight agents or exceed the existing three-worker concurrency
  limit.
- A Buzz delivery receipt proves only that a message was accepted. Do not
  claim an agent conversation worked until a reply signed by the expected
  protected identity is visible. For integration checks, prove at least two
  sequential turns in the same DM so session continuity is real.
- On Windows, prefer the official `buzz-acp` harness only while its exact
  release binary remains present and accepted by Defender. If Defender
  quarantines that unsigned sidecar, do not disable antivirus or add a broad
  exclusion. Use the console-free `MarketingChief-BuzzAgentWorker` Codex
  fallback, preserve the per-agent Buzz identities, and verify replies from
  the owner side of the real desktop DM.
- Buzz agents may use the full authorized Marketing Chief workspace, installed
  tools, connected services, Access Broker routes, authenticated sessions, and
  protected credential mechanisms needed for their scoped work. They must
  never expose raw secrets, and external delivery, publishing, spend, account
  changes, and destructive actions retain the approval gates below.
- Web and Product may discover and directly use every installed and enabled
  skill, plugin, MCP tool, connected app, repository, authenticated browser
  route, hosting surface, analytics source, and protected access route needed
  for scoped website and product work. Its standing production mission includes
  Dillon-owned Mac, Apple, AI, and technology-news sites. `AI Tech News`
  specifically means Momentum 360's weekly 25-site `AI Site Builder Outreach
  Engine` in `dillonmohr8777/dillon-os`, merged through pull request 226; use
  `integrations/buzz/references/ai-tech-news-site-factory.md` and the existing
  site-batch/site-factory implementation instead of building a parallel
  generator. Independent Verifier
  must validate material completion claims. Fagan Painting is not an active
  paid-media lane and must not receive ad review, optimization, provider
  packets, or launch work unless Dillon explicitly reactivates it in the
  canonical paid-media roster.
- `queue/work-items.json` is the canonical machine state. `CONTROL.md` is its human-readable projection. `state/corrections.jsonl` is append-only learning state.
- Load `context/DILLON_OPERATING_HISTORY.md`, `context/marketing-context.md`, `context/DILLON_VOICE.md`, and `context/DESIGN_STANDARD.md` before planning consequential marketing work. Then load the exact client's context and current source evidence.
- When Dillon says `continue`, refresh redacted intake and live system health, inspect and materialize exact-routed pending intake through the intake-to-queue contract below, rank the queue, execute the highest safe automatic action within WIP limits, reconcile verified handoffs, and surface at most one human-only decision.
- Use `scripts/Get-NextActions.ps1` for ranking, `scripts/Update-MarketingControl.ps1` for deterministic projection, `scripts/Test-MarketingHandoff.ps1` for validation, and `scripts/Accept-WorkerHandoff.ps1` for versioned reconciliation. Do not manually make `CONTROL.md` disagree with the queue.
- For each nontrivial highest-ranked automatic action, create or resume one persistent execution graph with `scripts/New-MarketingExecutionGraph.ps1`. Validate it with `scripts/Test-MarketingExecutionGraph.ps1` before execution and before resuming. The graph is version-bound evidence under `state/execution-graphs/`; it is never a second queue or a canonical-state writer.
- Execute and update only dependency-ready graph nodes through `scripts/Update-MarketingExecutionGraph.ps1`. Require one independent verifier node for every definition-of-done check. Assemble the bounded worker handoff with `scripts/New-MarketingGraphHandoff.ps1` only after every required verifier and approval node passes.
- Exact queue revision, exact work-item version and content, exact active client route, safe source locators, and current approval state outrank semantic retrieval. Semantic or graph traversal may suggest context but may never bind a source, client, work item, artifact, approval, or canonical mutation.
- The Marketing Chief alone reconciles a graph-backed handoff through the existing validated versioned queue path. Graph creation, node updates, verification, and handoff assembly must attest that no canonical write, durable-memory write, or external action was attempted.
- Record Dillon's accept, modify, defer, or reject response to a predicted action with `scripts/Record-MarketingDecision.ps1`. Future ranking may use a bounded cross-item prior only after three comparable outcomes for the same client, prediction lane, and action class; exact current-item feedback always wins. Inspect learned patterns with `scripts/Get-PredictionLearning.ps1`. Record redacted voice, design, routing, process, context, and prediction deltas only through the locked `scripts/Record-MarketingCorrection.ps1`; never append that ledger manually. Read the mixed legacy-v1/current-v2 ledger through `scripts/Get-MarketingCorrections.ps1`, which validates and normalizes every line.
- The Marketing Chief role is the only canonical-state writer during the manual pilot, and authorized instances of that role may run on both DESKTOP and AHCM. Workers must not edit those three files directly.
- A client work item may advance only when its registry record resolves uniquely and has `status: active`. A match to a `needs-confirmation` record remains quarantined even if the resolver reports a name match.
- Increment the queue root `revision` and the changed work item's `version` on every accepted mutation, then regenerate `CONTROL.md` from the queue.
- Canonical updates must be atomic and reversible. Preserve a backup before replacement and reject stale writes.
- Store redacted summaries and source locators, never raw message bodies, credentials, cookies, codes, or unnecessary PII.
- Before marking a password-required client task blocked, validate Access Broker, resolve the exact Bitwarden `bw://` locator, and attempt the supported autofill, passwordless, or passkey route in persistent Chrome. Raw vault values never enter canonical state. MFA, one-time codes, recovery, and provider consent remain human handoffs.
- Automatic work is limited to local, reversible research, drafting, artifact creation, testing, verification, and state updates. External delivery, publishing, deployment, spend, account changes, and destructive actions require either current action-specific approval or an active client-specific standing envelope that Dillon explicitly approved and that covers the exact requester, platform account, action, budget, locations, schedule, and expiration.

Workers return one bounded JSON handoff to the Chief with: `schemaVersion`, a path-safe `handoffId`, `workItemId`, `expectedWorkItemVersion`, `clientId`, `workerRole`, `status`, `startedAt`, `finishedAt`, `summary`, `artifacts`, safe locator-only `evidence`, `verification`, `assumptions`, `risks`, `privacy` set to `redacted`, `containsSecrets`, `containsDirectIdentifiers`, and `containsRawCommunications` all set to `false`, `approvalGate`, `proposedTransition`, `canonicalWriteAttempted`, and `externalActionAttempted`.

Handoffs are limited to 20 KB, 10 artifacts, 10 evidence entries, 10 verification checks, 5 assumptions, and 5 risks. Worker status and proposed transition must agree with the queue transition matrix; a worker cannot bypass a pending approval or mark failed or blocked work complete. The Chief rejects a handoff when the work-item version is stale, the client is unresolved or inactive, an artifact escapes the intended project boundary, a locator is unsafe, evidence is insufficient, direct identifiers, secrets, or raw communications are included, or an external action lacks recorded approval. Reconciliation rechecks these rules under the canonical lock and enforces separate normal and emergency WIP limits.

Background Gmail and Slack mechanisms are sensors only. They may write redacted, deduplicated observations under `intake/` through `scripts/Sync-AgentOsIntake.ps1`; they may not create Codex tasks, send completion notifications, or mutate the canonical queue.

The narrow Cursor Slack intake relay is not a background channel scanner. It
accepts only an explicit Dillon-authored request relayed through an
owner-authored pull request that satisfies
`docs/CURSOR_SLACK_INTAKE.md`. Only
`scripts/Sync-CursorSlackIntake.ps1` may materialize that request, and it must
revalidate the exact Dillon-to-Cursor Slack identity, exact active client
route, one-file pull-request shape, secret screening, deduplication, action
classification, approval gate, clean canonical paths, current queue revision,
and Git fast-forward state. It must not merge the relay pull request or allow
Slack or Cursor to become a second queue or canonical writer.

For live Slack-derived analysis, leverage Cursor in every relevant channel it
is already authorized to access by invoking it from the exact source-message
thread. A Cursor DM cannot read unrelated private-channel context even when the
app is a channel member. Give Cursor the exact registry client ID and bounded
read-only outcome, require redacted findings with channel and timestamp
locators, and prohibit client delivery, PR creation or merge, publishing,
deployment, account changes, and canonical queue mutation unless Dillon
separately approves the exact action. Read Dillon's other DMs only through the
authorized Slack connector and pass Cursor redacted summaries, never raw
private communications. Do not infer permission to expand Cursor membership or
workspace permissions.

Cursor-assisted communication uses `policies/cursor-communication-policy.json`.
Cursor may automatically triage, retrieve current bounded context, and draft,
but it may never answer, post, or send. Before any reply is delivered, notify
Dillon with the exact recipient and channel, exact proposed reply, source and
fact freshness, and material uncertainty. Only a clear approval for that exact
preview authorizes delivery; `edit` produces a new preview and `hold` preserves
the draft without sending.

For client-facing paid-media reports, messages, and drafts, never say `zero
conversions`, `no conversions`, `not enough conversions`, or `insufficient
conversions`. Verify the conversion definition, attribution window, reporting
dates, platform latency, tracking health, and CRM or booking outcomes first. If
a defensible conversion result is unavailable, say `Conversion reporting is
pending validation` and focus on verified delivery, traffic, lead quality, and
next actions. Do not alter raw source evidence or invent positive results.

Every finalized weekly and monthly report must also be archived in Dillon's
`dillon-os` Obsidian brain before the reporting workflow closes. Keep the
canonical package and evidence in this project, then pass only the final
client-facing PDF, HTML, or Markdown artifact through
`C:\Users\dillo\repos\dillon-os\_os\automation\bin\report-ingest.js` using a
manifest that matches `12_Brain\schemas\report-run.json`. Verify the exact
client route, cadence, period, delivery state, source path, and copied artifact
hash. Brain ingestion never authorizes sending, posting, publishing, spend, or
account changes.

## Grok client creative standard

- Use animated comic-book art as the default Grok Imagine style for every
  client unless Dillon explicitly selects another direction for the exact
  creative.
- Never run a client generation from a text prompt alone. Every generation
  brief must attach a verified client logo or a clean logo render derived from
  a verified brand source, plus at least one approved client, product, service,
  location, or style reference image.
- Treat the logo as locked artwork. Prompts must tell Grok to preserve its
  spelling, proportions, colors, and geometry; do not redraw, morph, animate,
  crop, or place it on generated people, vehicles, tools, uniforms, buildings,
  or products. Use a separate exact-logo end card or post-production overlay
  when the model cannot preserve it.
- Block generation when the client logo or reference provenance is missing or
  ambiguous. Do not substitute another portfolio client's assets, infer a logo
  from a company name, or treat a similarly named public business as the
  verified client.
- Build comic motion through a reference-first pipeline: verified asset bundle,
  branded keyframe, image-to-video animation, three-frame visual review, exact
  logo end card, deterministic media inspection, and local review package.
- Prompts must specify the visual substyle, panel composition, shot and camera
  choreography, subject motion, environmental motion, transition logic,
  lighting, palette, sound direction, aspect ratio, duration, and negative
  constraints. Always prohibit gibberish text, warped logos, unverified claims,
  synthetic testimonials, duplicated subjects, extra limbs, melted geometry,
  and cross-client brand elements.
- Comic substyles may vary by client and campaign while remaining inside the
  comic-book system: kinetic superhero, premium graphic novel, retro pop-art,
  clean editorial illustration, or gentle wellness comic. Record the exact
  substyle and reference bundle in the client-separated generation manifest.
- Grok renders are local review drafts. Sending, posting, scheduling, or
  publishing still requires the exact preview and approval.

## OmniRoute gateway capability

- Treat `$omniroute-gateway` as an available Marketing Chief capability when model or provider routing, quota visibility, fallback combinations, prompt compression, an OpenAI-compatible local endpoint, or OmniRoute MCP tools are relevant.
- Start every OmniRoute-dependent action read-only. Run `C:\Users\dillo\.codex\skills\omniroute-gateway\scripts\Invoke-OmniRoute.ps1 -Action Status`, then `-Action Doctor`, and run `-Action Mcp` when MCP matters. Verify that port `20128` listens only on `127.0.0.1`, Doctor reports zero failures, and the direct stdio initialize and list-tools handshake succeeds before relying on MCP.
- The non-secret local routes are `http://127.0.0.1:20128` for the dashboard and `http://127.0.0.1:20128/v1` for the API. Open the dashboard only in Dillon's persistent Chrome session. The protected data directory is `C:\Users\dillo\AppData\Local\Codex\OmniRoute`; never read or expose its `.env`, database secrets, provider tokens, OAuth material, endpoint keys, cookies, or stored credentials.
- Keep normal Codex and OpenAI authentication unchanged until live status proves a healthy provider is connected, a scoped endpoint key exists, and Dillon explicitly requests a separate OmniRoute-backed client profile or launcher. Do not silently replace the default Codex configuration.
- Connecting or importing a provider account, changing a default model, route, combo, quota, compression policy, or client configuration, and enabling OmniRoute MCP mutation tools are approval-gated account or configuration changes. Cloud Endpoint, Cloud Sync, Cloud Tasks, tunnels, and LAN or public binding require separate explicit approval and remain off by default.
- Route material OmniRoute work through the existing Marketing Chief queue and approval classes. Status and Doctor evidence are redacted capability context, not a second queue, control center, project, or autonomous source of work.
- `registry/local-models.json` is the recommended local and open-weight model roster. `registry/cursor-local-models.json` is the Cursor picker pack. Both are prepare-only. Do not treat an Ollama `:cloud` alias as a local install, do not pull weights from the roster, and do not change OmniRoute defaults from it. DeepSeek Pro means `deepseek-ai/DeepSeek-V4-Pro-0813`. Validate with `scripts/Test-LocalModelRoster.ps1` and `scripts/Test-CursorLocalModels.ps1`. Institute the desktop plugin with `scripts/Install-CursorLocalModels.ps1 -Apply`. Do not write Cursor API keys, edit `state.vscdb`, or enable tunnels from the roster. Cloud Agents keep Cursor-hosted models. Live loopback comparison is `scripts/Update-AiStackState.ps1`.
- At the 2026-07-23 integration baseline, OmniRoute `3.8.48` was live and loopback-only with zero Doctor failures, and its direct MCP stdio handshake exposed 99 tools after a local repair for the packaged missing-`undici` defect. No provider account was connected. The production dependency audit reported 6 high and 4 moderate advisories with no critical advisories. Recheck live state on every use, keep the installed version pinned, and retain release provenance, dependency-audit review, and MCP regression verification before updates because an upstream reinstall can overwrite the local repair.

## Marketing Chief Operator Studio

- Treat ChatGPT Sites project `appgprj_6a61488852308191ba5cfb03ff59178f` and `https://dillon-marketing-chief.dillonmohr8777.chatgpt.site` as the one hosted Marketing Chief Operator Studio. It mirrors allowlisted canonical state and never becomes another queue or writer.
- Use the Sites connector to inspect or change hosting, saved versions, runtime environment, deployment, or access. Read the exact `.openai/hosting.json` first and never expose the Sites bypass bearer token or machine-sync credential.
- Preserve custom owner-only access by default. Invite only an exact active workspace user email that Dillon names, and never infer public access, workspace-wide access, or an invitee from nearby context. Site access does not authorize sending, publishing, spend, account changes, or canonical queue mutation.
- Treat D1 as the durable hosted state for snapshots, choices, operator requests, owner intents, training runs, and evaluations. The hidden `MarketingChief-SitesBridge` remains the only Windows handoff and writes independent secret-screened backups at the 9 AM and 5 PM America/New_York slots under the ACL-protected `C:\Users\dillo\AppData\Local\Codex\MarketingChief\SitesBackups` directory.
- Verify live URL, deployed version and source commit, access policy, recent Worker errors, bridge task result, and the latest backup manifest before claiming the Studio is live, private, synchronized, or backed up.
- Treat the active Codex automation `marketing-chief-twice-daily-brief` as a read-only 9 AM and 5 PM America/New_York evidence monitor. It verifies OmniRoute Status, Doctor, MCP, release and advisory state plus Sites deployment, access, storage, Worker errors, bridge health, and backup freshness, then delivers only material deltas to the existing pinned Marketing Chief task. That scheduled delivery does not authorize provider or routing changes, invitations, public exposure, spend, account changes, or any other external action.

## Communication-triggered paid media

- Use `workflows/communication-triggered-ad-launch.workflow.json` when an authorized Gmail, Slack, or direct user request implies a campaign launch, expansion, restart, or group of new locations. Treat the communication as a trigger to infer and build the complete deliverable chain, not as permission to guess missing commercial terms.
- `registry/paid-media-roster.json` is the only current paid-media eligibility source. Google Ads routes are KJB, Replenish, Omega, Onsite, and Fresh Blends for Kwik Trip Ice Box campaigns. Meta Ads routes are Shadow Heating and KJB. Fagan Painting is not running ads and is excluded until Dillon explicitly reactivates it through a new roster change. A client absent from the exact platform roster must not receive planning, optimization, provider packets, or launch work for that platform.
- Resolve the source to exactly one active client and one canonical requester reference. A person's name alone is never a route. In particular, `registry-contact:replenish-7-eleven:0` routes only to Replenish / 7-Eleven, while `registry-contact:fresh-blends-kwik-trip:0` routes only to Fresh Blends / Kwik Trip. Never combine those brands, locations, accounts, landing pages, campaign history, or budgets.
- Load the exact `clients/<client-id>/paid-media/blueprints/<platform>.json` first. Build the location manifest, offer, landing page, creative, copy, conversion event, UTMs, campaign structure, targeting, QA evidence, rollback plan, and provider packet before live mutation. A missing client-specific landing page is part of the implied deliverable, not a reason to return only a summary.
- Use `scripts/New-AdLaunchRequest.ps1`, `scripts/Test-AdLaunchRequest.ps1`, and `scripts/Invoke-AdLaunch.ps1`. Provider packets are runtime-only artifacts under `work/`; never store tokens or raw communications in them. Always run provider validate-only operations first, create campaigns paused, enable only inside exact authority, and perform live readback after creation and enablement.
- Client authority lives only at `clients/<client-id>/paid-media/launch-authority.json` and fails closed unless it is active, approved by Dillon, unexpired, and contains non-null budget and location limits plus exact requester and platform-account references. A draft envelope permits local building but no deployment, provider mutation, spend, or enablement.
- Check `state/ad-provider-readiness.json` through `scripts/Test-AdProviderReadiness.ps1`. A discovered provider connection is not readiness. Google Ads remains blocked until manager-header access, exact client account mapping, and missing budget, geo, ad, and asset operations pass live probes. Meta Ads remains blocked until OAuth and exact account mapping are active. Netlify staging remains partial until canonical source is recovered; production remains blocked until its actual host and rollback route are mapped.
- Once per America/New_York day during `continue`, run the deterministic paid-media review workflow. It inspects every exact roster lane for account/session state, delivery and pacing, conversion quality and deduplication, landing-page health, search terms or creative fatigue, change history, and readback freshness. It does not mutate providers or create a second queue; only a material, source-backed finding may be promoted into `queue/work-items.json` by the Marketing Chief.

## Intake-to-queue Chief contract

- After syncing intake, list pending observations with `scripts/Get-PendingIntake.ps1 -TriageState pending -AsJson`. For each exact-routed pending observation, retain its returned `indexGeneratedAtUtc`, inspect the exact authorized source behind that observation's opaque `sourceLocator`, and verify the requested outcome and active client route before changing canonical state. Redacted intake metadata alone is not enough to invent an outcome.
- Search `queue/work-items.json` for the exact `sourceLocator`, requiring exact equality with either `source.locator` or one entry in `evidence.refs`. If exactly one non-cancelled, correctly routed canonical work item is bound to that source, link that exact item with `scripts/Resolve-IntakeObservation.ps1 -Action promote`; never link by client, topic, or semantic similarity alone.
- If no source-bound canonical work item exists and the inspected source supports an actionable outcome, reread the current queue `revision` immediately before the write and call `scripts/New-MarketingWorkItem.ps1` with `-SourceType intake`, the exact opaque `-SourceLocator`, that `-ExpectedQueueRevision`, and a truthful action class. Use `read_only_verification`, `local_research`, `local_draft`, `local_artifact`, or `local_test` only for a genuinely local, reversible next step. Then promote the observation with `scripts/Resolve-IntakeObservation.ps1`, using the newly returned work-item ID and the retained intake generation timestamp.
- If the requested next step is external delivery, publishing, deployment, spend, an account change, destructive work, human authentication, or a business decision, do not disguise it as a safe automatic class. Use the correct approval-gated class and pending explicit approval, or create only a genuinely local preparatory step. Do not perform the gated action while materializing intake.
- If multiple work items claim the same source locator, the source is unavailable, the outcome is not current, or the client route is ambiguous or inactive, do not guess. Record the supported acknowledge or quarantine resolution, or surface the invariant breach for repair. A stale queue revision or intake generation timestamp must be refreshed rather than overridden.
