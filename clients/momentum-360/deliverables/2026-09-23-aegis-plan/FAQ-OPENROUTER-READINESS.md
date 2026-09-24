> Superseding launch state: user approved live operation; protected key bound, existing Windows task started and a real cited Slack response verified. See FAQ-LAUNCH-RECEIPT.md. Hosting still depends on this PC. Earlier readiness findings below are historical.

# Momentum Answers: OpenRouter and host readiness

Checked September 23, 2026. This is a read-only access and runtime check; no key was read, copied, tested, or installed.

| Item | Evidence and state |
| --- | --- |
| OpenRouter reference | `OPENROUTER_API_KEY` exists by name in this process environment. Windows Credential Manager lists `Codex/TelegramModelGateway/OpenRouter` and `Hermes/OpenRouter/Hermes Zero Credit`. Neither is a Momentum Answers credential. The existing [canary](../2026-09-09-openrouter-astra-stack/scripts/Invoke-OpenRouterFrontierCanary.ps1) uses the Telegram target, which is historical evidence of a route, not authorization to reuse it here. |
| Key usability | No live model or credit check was made. The [approval queue](C:/Users/dillo/repos/dillon-os/System/approval-queue.md) records a key exposed in chat and only about $0.02 available credit on September 21. Those observations may have changed; safe key status and paid capacity are unverified. |
| Current FAQ host | [Start-MomentumAnswers.ps1](../2026-09-12-dedicated-agents/Start-MomentumAnswers.ps1) retrieves only its two Slack tokens from Windows Credential Manager. `Momentum360-TeamAnswers` is an **Interactive** logon task; current state is **Ready**, last run September 22 returned code 1. It is not currently a verified listener. |
| Docker | Eight DeerFlow-related containers were running on this Windows desktop at inspection. Docker does not keep this desktop powered on, signed in, or connected; those containers are not a 24/7 FAQ deployment. |
| Other existing host | The [machine map](C:/Users/dillo/repos/dillon-os/System/machine-context/WINDOWS-WORLD-MAP.md) notes a separate Grok Linux box, but this check found no verified FAQ deployment, reachable SSH/service target, secret binding, or availability receipt there. NeedMomentum's SiteGround account is a WordPress host; persistent Socket Mode worker capability and access are unverified. |

**Direct route:** Keep the existing Windows scheduled task for a bounded acceptance test after the bot implementation is switched to OpenRouter. For 24/7 operation, the existing Grok Linux box is the first candidate, subject to confirming a reachable owner-approved service target and installing a separate protected FAQ OpenRouter credential and Slack credentials there. A running process plus independent Slack readback and an off-desktop availability check would prove deployment.

**Missing inputs:** a safe, usable OpenRouter key with current credit/model access; a verified always-on host/service account; and explicit approval to send the private Momentum staff knowledge corpus to OpenRouter. The selected model route alone does not grant that data transfer. No secret, permissions, billing, deployment, or listener state changed in this check.

## Current read-only key check

Parent queried the existing environment key at OpenRouter /api/v1/key on September23. Authentication succeeded; is_free_tier=false; configured key limit1000 and limit_remaining975.06630675; expiry2026-12-17T17:42:15Z. These are key limit fields, not wallet balance or proof of rotation. No key value was printed, no inference or Slack message sent. The old $0.02 observation is not current verified balance.
