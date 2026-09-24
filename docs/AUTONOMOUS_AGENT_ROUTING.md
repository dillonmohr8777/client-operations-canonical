# Autonomous Agent Routing

## Purpose

This is the executable operating contract for choosing AI models and harnesses without creating another command center. GPT-5.6 Sol coordinates through the Marketing Chief. The Canonical Queue remains authoritative.

## Resolve a team

```powershell
# Sensitive repository work
scripts\Resolve-AutonomousAgentRoute.ps1 `
  -TaskLane code `
  -DataClass sensitive-client `
  -ActionClass local_test `
  -Consequential `
  -Format Text

# Public research
scripts\Resolve-AutonomousAgentRoute.ps1 `
  -TaskLane research `
  -DataClass public `
  -ActionClass local_research `
  -Consequential `
  -Format Json

# Video planning; publishing remains approval-gated
scripts\Resolve-AutonomousAgentRoute.ps1 `
  -TaskLane video `
  -DataClass redacted-client `
  -ActionClass publishing `
  -Consequential `
  -Format Text
```

The resolver reads:

- `policies/autonomous-agent-routing-policy.json`
- `state/ai-stack.json`

It selects only live-ready, data-eligible routes. Consequential work requires a checker from a different model family than the maker.

## Task lanes

| Lane | Preferred use | Current working pattern |
|---|---|---|
| `orchestration` | Scope, route, reconcile, present | Sol coordinates; Luna or local DeepSeek checks |
| `research` | Current sources and long-context synthesis | Kimi K3 Free for public/internal research; Luna checks |
| `code` | Architecture, implementation, debugging | Terra makes; local DeepSeek checks sensitive work |
| `documents` | Reports, spreadsheets, presentations | GLM when live; otherwise Terra or Sol; Luna checks |
| `creative` | Campaign and visual direction | Grok makes; Luna checks |
| `multimodal` | Image, video, and UI analysis | MiniMax when live; otherwise Grok or Sol |
| `video` | Reference-first video planning | Grok plans; Seedance remains interactive and human-gated |
| `extraction` | Classification, translation, structured data | Local Qwen makes; Luna checks consequential work |
| `verification` | Factual, technical, visual, and policy QA | Luna, local DeepSeek, or GLM when live |

## Data boundary

- `public`: may use any live route permitted by policy.
- `internal`: may use authorized or explicitly permitted public-free routes when no client-sensitive material is present.
- `redacted-client`: may use authorized routes that explicitly permit redacted client context.
- `sensitive-client`: stays on authorized OpenAI routes or verified local models.

Public-free routes and interactive generators never receive secrets, raw communications, or sensitive client evidence.

## Compounding loop

Every material run follows:

```text
capture -> verify -> compile -> decide -> execute -> observe -> learn
```

Captures and model outputs are evidence, not truth. Workers may build and verify artifacts, but only the Marketing Chief may reconcile canonical state. A daily learning loop retains at most one demonstrated reusable correction, workflow improvement, precedent, or explicit non-finding.

## Validation

```powershell
scripts\Test-AutonomousAgentRoutingPolicy.ps1 -Format Text
```

Expected result:

```text
VALID autonomous-agent routing checks=38
```

The validator checks route uniqueness and state coverage, data isolation, maker/checker independence, Seedance's human gate, approval gates, and representative routing scenarios.
