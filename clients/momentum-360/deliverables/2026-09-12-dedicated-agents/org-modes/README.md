# Momentum five-mode shadow runtime

State: STAGED. This turns the existing `agent-contracts.json`, `evidence-cards.json`, and `replay.py` output into per-owner work packets for the five named Momentum modes. It does not create a second queue, call a model, inspect Slack, mutate CRM, publish, send, or schedule anything.

Run the check:

```powershell
python org-modes\shadow_runtime.py --self-test
```

Generate current packets:

```powershell
python org-modes\shadow_runtime.py
```

Outputs:

- `run/current-packets.json`: the complete staged mode packet set.
- `run/owner-packets/*.md`: per-owner review packets for Jason, Sean, Mac, Melissa Silber, and Melissa Rigby.
- `run/modes.sqlite`: local dedupe and cancellation ledger keyed by mode plus source card.

The runtime preserves source card identity and Slack source fingerprints. If future evidence cards include structured `provided_answers` or `requested_asset_count`, those fields pass through unchanged. Current source cards do not contain the raw answers or exact asset count, so the packets mark that evidence as missing rather than inventing it.

The separate Momentum Answers Slack FAQ bot is in an OpenRouter migration draft.
Its FAQ/provider and external-data gate remain disabled. The previous September 15
Slack acceptance is historical. The offline FAQ suite passes 15 checks with zero
Slack or model calls; synthetic OpenRouter connectivity/schema probe details and
the remaining credential gate are recorded in `faq-setup.md`.
