# Align HCM Customer Agent guardrail test kit

This kit turns the canonical acceptance table in
`../2026-07-23-hubspot-customer-agent-configuration.md` into a repeatable
test run.

## Files

- `Test-ConfigurationContract.ps1` validates the local source of truth before
  anyone changes the live agent.
- `New-LiveResponseTemplate.ps1` creates a JSON response-capture file from all
  26 canonical prompts.
- `Test-LiveResponses.ps1` evaluates captured HubSpot replies against
  deterministic guardrails and writes a Markdown report.
- `deployment-package.json` maps the canonical configuration into HubSpot's
  current Identity, Knowledge, Guidelines, Human handoff, Test, and Channels
  surfaces. Its deployment flags are deliberately disabled.
- `Test-DeploymentReadiness.ps1` distinguishes a locally valid staged package
  from an authenticated, fully tested live deployment.
- `DEPLOYMENT-READINESS.md` records the repository research, current evidence,
  hold conditions, and remaining go-live gates.

## Run

```powershell
.\Test-ConfigurationContract.ps1
.\New-LiveResponseTemplate.ps1
.\Test-DeploymentReadiness.ps1 -Mode Package
```

In HubSpot, open **Service > Customer Agent**, click **Test Align HCM Customer
Agent**, select **Live Chat**, and submit every prompt in the generated
`live-responses.json`. Paste only the agent reply into the matching `response`
field. Do not include private testing insights, contact data, or the full
conversation transcript.

Then run:

```powershell
.\Test-LiveResponses.ps1
.\Test-DeploymentReadiness.ps1 -Mode Live
```

The live suite fails closed. A missing response is a failure. Deterministic
checks cover forbidden provider names, pricing claims, guarantees, excessive
clarifying questions, excluded-environment handling, handoff language, and
required SmartCare terms. Source fidelity and qualitative answer quality are
reported as manual-review items because regex checks cannot establish that a
claim is genuinely supported by a synced HubSpot source.

`-Mode Live` must remain failing until all replies are captured, every manual
review is marked `pass`, the authenticated portal gates are recorded in
`deployment-package.json`, and the exact channel configuration has been
approved. A passing package check is not authorization to publish guidelines,
connect a channel, enable credits, or activate the agent.
