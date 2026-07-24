# VA Claims dashboard review feedback

- Observed: 2026-07-24
- Source: exact active VA Claims Slack channel
- Route: `va-claims-edge`
- Privacy: redacted summary; no raw message body or direct contact details

## Confirmed acceptance criteria

1. Add an `Awaiting Nexus Letter` summary card next to `Awaiting Documents`. Its filter contract covers clients in the nexus-letter stage whose nexus letter is not complete.
2. Define `Needs Attention` as a recorded last-contact date at least 60 days ago. Missing last-contact data must remain unknown rather than being inferred.
3. Rename the pipeline stage label `Ready` to `Ready to File`.

The developer identified notes or narrative per client as Phase 3 work on the development side; it is not part of this local UI change.

Push, deployment, and client-channel handoff remain approval-gated.
