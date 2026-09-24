# Puttery GTM inventory - 2026-09-10

Read-only. No tags, triggers, variables, or publishes changed.

## GTM-KMZKBB3 (Web, www.puttery.com/)

- Workspace: Default Workspace (ID 89)
- Pending changes already in workspace: 6 (left untouched)
- Tags: 62

### Key IDs found in tags

| Surface | ID / label | Notes |
|---|---|---|
| GA4 Measurement | G-ST7Z2WP326 | Hard-coded in Google Tag (also saw G-B9406TNEY8 in an IHA Google Tag) |
| Google Ads conversion | 331771492 / TULRCL2-m4scEOTcmZ4B | Conversion tracking + two Conversion Linker tags |
| Meta Pixel | 1474762070796886 | Custom HTML Meta Pixel tags present |
| DCM Google Tags | DC-11139487, DC-16586844 | IHA Floodlight stack |

### Variables

- Built-in click/page/form vars present
- User-defined: dlv - cta_type, js - post_city/pillar/title, Puttery UA Tracking ID
- No UTM, GA4 Measurement ID, Ads conversion, or Meta Pixel **variables** (IDs live inside tags)

### Presence

GA4 page view + reservation click events; Ads conversion + linkers; Meta Pixel (multiple Custom HTML variants); heavy DCM/Digilant/Yelp/LinkedIn/Floodlight/legacy UA.

## GTM-TDT2KKP9 (Server, www.puttery.com)

- Workspace: Default Workspace (ID 2)
- Pending changes: 0
- Tags: none
- Triggers: none
- Variables: built-in Event Name only
- Empty server container; no GA4/Ads/Meta/UTM server config

## Dashboard wiring implication

1. Client-side pixel/tag presence is strong on web container.
2. Server container needs build-out before server-side GA4/CAPI/Ads enhancement.
3. Still need user invites: Google Ads Standard, GA4 Editor on authoritative property, CMS Editor, Meta portfolio map vs Pixel 1474762070796886.
4. Do not publish GTM without Dillon go. Do not touch the 6 pending web workspace changes.
