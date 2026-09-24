# Erie and Pittsburgh official-site list

Built 2026-09-02 from OpenStreetMap website tags. Not Google Maps. Not the Philadelphia radar. Emails were not invented.

This folder is a historical list-build snapshot, not a send receipt ledger. A 2026-09-03 live Gmail reconciliation verified 241 unique SENT prospect messages across the completed waves. SENT does not prove inbox delivery. See `../sends/gmail-reconciliation-2026-09-03.json`.

## Counts

- 2,066 unique official sites
- Pittsburgh: 1,881
- Erie County widened: 185
- Priority owner-operated cut: 870
- First review batch: 32, half Erie and half Pittsburgh
- Sends at list generation: 0

## Files

- `candidates.json` — every unique official site in the two boxes
- `priority-candidates.json` — restaurants, cafes, bars, dentists, clinics, trades, beauty, lawyers, and similar
- `first-review-batch.json` — the next 32 to personalize
- `summary.json` — counts
- `build_pa_west_list.py` — rebuilds the list

## Historical planned workflow

1. Take the next 15 from `first-review-batch.json`, then keep walking `priority-candidates.json`.
2. Run the Grok 4.5 prompt on that official URL.
3. Confirm the live site.
4. Collect a published email from the official contact page only. If there is no public mailbox, keep the row and skip send.
5. Save an unsent preview.
6. Dillon sends from his Gmail after he approves that preview.

The 870 priority rows were the working hundreds in the original plan. The remaining 1,196 stay in the full file if a future, separately approved campaign needs to expand. This historical workflow does not authorize a send, resend, or follow-up.
