window.PUTTERY_OPERATIONAL_STATUS = Object.freeze({
  "schemaVersion": 1,
  "snapshotDate": "2026-09-20T00:42:06.222Z",
  "snapshotLabel": "September 19, 2026 at 8:42 PM ET",
  "productionState": "hold",
  "stateLabel": "Attribution pending",
  "currentGate": "Attribution validation",
  "headline": "Reservation data connected.",
  "summary": "553 webhook reservation records and 27,928 export records feed 27,947 distinct reservation states. No export rows are held outside the reservation count.",
  "readinessExplainer": "The reservation pipeline combines webhook updates with the latest export snapshot. Booking value, campaign matching, consent and platform access still need validation.",
  "accountRoute": "NYC 37824",
  "accountRouteDetail": "Business group 28086 · venue filter verified",
  "receiverTests": "14 / 14",
  "receiverTestsDetail": "Receiver checks · September 8",
  "relayTests": "18 / 18",
  "relayTestsDetail": "Existing relay checks · September 8",
  "liveFeed": "Dated snapshot",
  "liveFeedDetail": "3,618 relay acknowledgements · 0 pending",
  "nextAction": "Prove a controlled tagged booking. Verify exact analytics and advertising accounts, consent, attendance and booking-value definitions. Reconcile the one delivery-counter difference.",
  "dataBoundary": "Saved source snapshot; the page checks the live feed on load. Automatic processing requires the Windows host online. Reservation states are not completed visits, revenue or ad conversions.",
  "tockConfirmed": "NYC business 37824 and group 28086 are verified. 27,928 states from 6 export files combine with webhook updates.",
  "tockPending": "Walk-in identifier handling is confirmed. The latest export has 0 excluded rows. Delivery-counter reconciliation, controlled-booking proof, consent and booking-value definitions remain pending.",
  "milestones": [
    {
      "state": "complete",
      "statusLabel": "Verified",
      "label": "NYC source route",
      "detail": "Business 37824 is bound to group 28086."
    },
    {
      "state": "current",
      "statusLabel": "Dated snapshot",
      "label": "Reservation sources",
      "detail": "27,947 combined reservation states at the stated check time; live refresh begins on page load."
    },
    {
      "state": "current",
      "statusLabel": "Counts checked",
      "label": "Source quality and attribution",
      "detail": "0 open conflicts; 0 equal-version mismatches; 0 excluded export rows. Counter reconciliation, controlled-booking tracking, consent and approved value definitions remain."
    }
  ],
  "venueScope": "New York City",
  "venueDetail": "One venue · location filter verified",
  "webhookState": "Dated snapshot",
  "webhookDetail": "3,617 processed deliveries",
  "exportState": "Snapshot · synced",
  "exportDetail": "6 files · 27,928 records",
  "attributionState": "Pending",
  "attributionDetail": "Tracking and value validation"
});
