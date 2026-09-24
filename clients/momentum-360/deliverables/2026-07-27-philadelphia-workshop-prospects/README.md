# Philadelphia workshop prospects

This package builds a vetted research list of exactly 250 public business
contacts for Sean and Mac's Momentum 360 owner workshop.

## Audience

The workshop's verified product brief names owners and operators of local
service businesses. This list therefore prioritizes Philadelphia-area,
estimate-, appointment-, and project-driven businesses in plumbing, HVAC,
electrical, roofing, construction, painting, glazing, cleaning, landscaping,
and related trades.

## Files

- `prospects.csv`: the ranked, deduplicated 250-contact research list.
- `qa-summary.json`: counts and deterministic QA checks.
- `source-manifest.json`: source provenance and delivery boundaries.
- `calendar-workflow-status.md`: verified event, form, and production blockers.
- `completion-audit.md`: requirement-by-requirement evidence and the exact
  production unblock condition.
- `build_prospects.py`: reproducible public-source scraper and validator.

## Calendar and outreach boundary

No email or calendar invitation is sent by this package. Each row has a
trackable registration URL, but `calendar_eligible` remains
`no_until_registration_and_calendar_consent`. The existing workshop automation
may invite only a verified registrant who explicitly selects the
one-workshop calendar invitation option.

This matches the live landing page, event schema, Sean calendar rollout, and
the Netlify intake's consent and idempotency rules. It also prevents cold
calendar insertion.

## Rebuild

From this directory:

```powershell
python -m pip install -r requirements.txt
python .\build_prospects.py
```

The script validates email syntax, checks whether each email domain resolves
for mail, removes duplicate businesses and addresses, ranks workshop fit, and
writes the exact 250-row output. It does not probe individual mailboxes or
make any delivery call.
