# Erie and Pittsburgh official-site list

Built 2026-09-02 from OpenStreetMap website tags. Not Google Maps. Not the Philadelphia radar. Emails were not invented.

## Counts

- 2,066 unique official sites
- Pittsburgh: 1,881
- Erie County widened: 185
- Priority owner-operated cut: 870
- First review batch: 32, half Erie and half Pittsburgh
- Sends: 0

## Files

- `candidates.json` — every unique official site in the two boxes
- `priority-candidates.json` — restaurants, cafes, bars, dentists, clinics, trades, beauty, lawyers, and similar
- `first-review-batch.json` — the next 32 to personalize
- `summary.json` — counts
- `build_pa_west_list.py` — rebuilds the list

## How this becomes hundreds of notes

1. Take the next 15 from `first-review-batch.json`, then keep walking `priority-candidates.json`.
2. Run the Grok 4.5 prompt on that official URL.
3. Confirm the live site.
4. Collect a published email from the official contact page only. If there is no public mailbox, keep the row and skip send.
5. Save an unsent preview.
6. Dillon sends from his Gmail after he approves that preview.

The 870 priority rows are the working hundreds. The remaining 1,196 stay in the full file if a category needs to expand.
