# Reply draft to Nicky (Onsite Concrete & Landscape)

Status: **UNSENT DRAFT**. Prepared September 8, 2026 by Cursor as a bounded worker after the Codex session that produced `AUDIT.md` stopped on a usage limit. Delivery requires Dillon's explicit approval of this exact text. Cursor did not post, send, or schedule anything.

Client route: `onsite-concrete-landscape` (registry status `active`). Recipient: Nicky, the Onsite client contact who wrote in the client chat thread shown in Dillon's screenshot. That thread is not in the Momentum Slack workspace (search returned no match), so the channel is whatever surface the screenshot came from.

Trigger message (transcribed from screenshot, redacted to the substance): the client asked to stop the ads because "no one is calling" and she has not received "even 1" call from them. The same thread carries an open request for a backup card so Google's payment verification does not switch the ads off.

Every number below comes from `AUDIT.md` and `source-data.json` in this folder. Google Ads customer 103-371-5894, April 1 through September 8, 2026, account time zone.

## Draft (text message, two sends)

Channel is SMS per Dillon on 2026-09-08. Plain text, no formatting, no links.

**Text 1**

Hey Nicky, I hear you. I went into the Google Ads account tonight and pulled the actual call records, not the summary reports. Since April 1 Google shows 3 calls straight off the ads (Apr 27 and two on Jun 17), plus 65 people who clicked an ad and then tapped your number on the website, and 32 contact form fills. The website taps ring your phone directly, so Google only sees the tap, not whether it connected or went to voicemail. Your call log would show those.

**Text 2**

The bigger issue is budget. Total spend since April is $1,043, about $6.50 a day. Google Ads is an auction, and the $2 per click cap we have been working inside is well under what concrete and landscaping searches in your area usually go for. Right now we are losing about 74% of the searches we qualify for before the ad even shows. At that level the ads cannot produce steady calls no matter how good they are. If you want real call volume we need to talk about what a workable daily budget looks like. If you would rather pause, say the word and I will pause it the same day. The card request is just Google's payment verification and is separate from all of this.

## Evidence behind the budget paragraph

- $1,042.99 spend across 161 calendar days = $6.48 per day (`source-data.json`).
- Search campaign "Search | High Intent | Solano County" runs at $7 per day with a $2 maximum CPC; 74.07% of Search impression share was lost to rank in the September 1 to 8 review (Dillon's weekly update, #onsite-construction, 2026-09-08 17:28 EDT, and the weekly report folder `2026-09-08-weekly-report-2026-09-01-to-2026-09-08`).
- The August report compared the account's $0.16 CPC to the WordStream 2026 category benchmark as directionally 98% lower; the blended $0.30 CPC across the window comes mostly from Smart and PMax placements, not high-intent Search. "Well under what those searches usually go for" is a directional claim, not a measured local auction price.

## What this draft deliberately does and does not claim

- It states the three received ad calls by date only. Durations were 38, 10, and 7 seconds and the two June rows share the displayed hour, so it does not call them three separate customers.
- It calls the 65 events "tapped your phone number" and the 32 events "filled out the contact form." It does not call them leads, connected calls, or estimates.
- It does not say the client is wrong about business volume. It moves the question to her phone log, which is the only source that can settle connected calls.
- It uses no "zero conversions" or "insufficient conversions" language.
- It attributes low call volume to budget and auction position, which the account evidence supports, without promising a specific result at a higher budget.
- It gives one decision (talk budget or pause) and one commitment (pause the same day if she still wants to).

## Optional strengthening before sending

A day-level export of the `Web Phone Calls` conversion action from Google Ads would let Nicky check specific dates against her phone log instead of a range. That export was not pulled in this session and would need the authenticated Google Ads session. It is read-only and does not change the account.
