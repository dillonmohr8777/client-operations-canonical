# Look Alive — tracking install

Prepared 2026-09-15. Read the diagnosis, then paste the Lovable prompt.
Nothing here has been executed.

## What is actually on the site right now

Read live from `lookalivenyc.com` on 2026-09-15, not assumed.

| Thing | State |
|---|---|
| GA4 | **Installed and firing.** Measurement ID `G-N7JBR0LP4E` |
| Meta Pixel | **Installed and firing.** Pixel ID `1619855252850752` |
| Google Tag Manager | **Not present.** gtag is loaded directly, there is no GTM container |
| Custom events | **None.** dataLayer holds only `js`, `config`, `gtm.dom`, `gtm.load` |

So Joe was right that the tracking infrastructure exists. What he did not know is
that it only counts page views.

## The actual problem, in one line

Every reservation link on the site is a bare anchor:

```html
<a href="https://resy.com/cities/new-york-ny/venues/look-alive" target="_blank">RESERVATIONS</a>
```

No click handler. No data attribute. No event. No UTM parameters.

There are at least four of them on the homepage alone: RESERVATIONS in the nav,
MAKE RESERVATION in the hero, plus Reserve and RESERVE further down.

**Every person who clicks through to book a table leaves the site completely
untracked.** GA4 records a page view and nothing else. Google Ads sees nothing.
And because the outbound link carries no parameters, Resy has no way to connect
that booking back to an ad even in principle.

This is why `Look Alive (web) reserve_table_click` exists in the Ads account as
an importable GA4 conversion but is hidden and has never recorded anything. The
event was defined in GA4. It was never wired to the site.

## The Lovable prompt

Paste this into the Look Alive project in Lovable. It is written to be applied
as-is.

---

Add conversion tracking to the site. GA4 (`G-N7JBR0LP4E`) and the Meta Pixel
(`1619855252850752`) are already installed and loading, so do not add or
duplicate those tags. Only add the event calls described below.

Create one small shared helper, used by every case:

```js
function trackEvent(name, params) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params || {});
}
```

Wire these five events:

1. **`reserve_table_click`** — on every link pointing to
   `resy.com/cities/new-york-ny/venues/look-alive`, anywhere on the site. There
   are several. Pass `{ source_page: window.location.pathname }`.

2. **`private_event_click`** — on every link to `/private-events`, including the
   BOOK AN EVENT button in the header. Pass `{ source_page: window.location.pathname }`.

3. **`private_event_submit`** — on successful submission of the Tripleseat form
   on `/private-events`. If the form is an embedded iframe and you cannot hook
   its submit, fire the event on the click that opens or focuses it instead, and
   name it `private_event_start` so it is not mistaken for a completed lead.

4. **`phone_click`** — on any `tel:` link.

5. **`menu_view`** — fire once on page load of `/food`.

Also, on every outbound Resy link, forward the visitor's campaign parameters so
the destination carries them. Read `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content`, `utm_term` and `gclid` from the current URL, persist them in
`sessionStorage` on first landing so they survive internal navigation, and
append whichever are present as query parameters on the Resy href at click time.
Do not invent values when none are present, just append nothing.

Do not change any visible copy, layout, styling or page structure. This is
tracking only.

---

## After Lovable publishes, in this order

1. **Verify in GA4 realtime.** Open the site, click a reservation link, and
   confirm `reserve_table_click` appears. If it does not appear, stop here.
   Everything below depends on it.

2. **Mark `reserve_table_click` as a key event in GA4**, so it becomes
   importable into Ads as a conversion.

3. **In Google Ads, customer 863-714-9345:** unhide
   `Look Alive (web) reserve_table_click`, set it as the primary goal, and
   demote `Page view` and the Local actions set out of primary. This is the
   change that alters what Google buys.

4. **Give it a week before judging anything.** The bidding model has been
   trained on page views for the whole life of the account and will need time to
   re-learn against a real outcome.

## What this does not solve, and should not be sold as solving

Resy will most likely not pass reservation data back. Joe flagged it on the
September 15 call and the same wall already appeared on the Puttery side. So the
honest measurement design is:

- **`reserve_table_click` is the counted conversion.** It measures intent to
  book, not a completed booking.
- **Toast is the settlement truth**, once access exists, because that is where
  money actually lands.
- **Tripleseat is the private events truth**, and is the cleanest revenue story
  available because a private event lead is a named record with a value.

Agree that framing with Joe before the first report, not after. A dashboard that
implies a Resy booking was measured when only the click was measured is the
exact mistake the Puttery board exists to avoid.

## Still needed from Joe or Tom

Meta Business Portfolio user invite, Tripleseat reporting access plus which form
feeds which account, Resy reporting access and a named contact, Toast reporting
access plus the Look Alive location ID. Requested by email 2026-09-15.

## Registry note

`look-alive` has no record in `registry/clients.json`. Google Ads customer
863-714-9345 is live and spending. Same shape as the Nexla gap. Worth
registering before it produces a report.
