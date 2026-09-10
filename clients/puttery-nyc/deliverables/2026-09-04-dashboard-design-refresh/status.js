window.PUTTERY_OPERATIONAL_STATUS = Object.freeze({
  "schemaVersion": 1,
  "snapshotDate": "2026-09-04T23:03:21Z",
  "snapshotLabel": "September 4, 2026 \u00b7 7:03 PM ET",
  "productionState": "hold",
  "stateLabel": "Reporting held",
  "currentGate": "Reconciliation pending",
  "headline": "Reservation webhook receiving.",
  "summary": "NYC filtering is verified. Reconcile the received deliveries and confirm source access before turning this engineering progress into attribution reporting.",
  "readinessExplainer": "Webhook receipt is verified. Controlled-event confirmation, delivery reconciliation, export recovery, and the remaining source access still gate reporting.",
  "accountRoute": "NYC 37824",
  "accountRouteDetail": "Business group 28086 \u00b7 venue filter verified",
  "receiverTests": "13 / 13",
  "receiverTestsDetail": "Receiver checks \u00b7 September 4",
  "relayTests": "18 / 18",
  "relayTestsDetail": "Relay checks \u00b7 September 4",
  "liveFeed": "Receiving",
  "liveFeedDetail": "Reservation webhook \u00b7 not performance reporting",
  "nextAction": "Confirm the intended test event with Tock, reconcile relay-to-receiver delivery totals, and establish Data Exports recovery. Confirm web tracking and advertising account access next.",
  "dataBoundary": "Webhook health is engineering evidence. It does not prove completed visits, attributed revenue, or media conversions. Guest records stay outside this page.",
  "tockConfirmed": "Reservation webhook receipt and NYC business 37824 filtering were verified on September 4 at 7:03 PM ET. Delivery events include record updates and must not be counted as separate bookings.",
  "tockPending": "Controlled-event confirmation, delivery reconciliation, Data Exports recovery, the secure credential route, GA4 settings, and campaign-field preservation.",
  "milestones": [
    {
      "state": "complete",
      "statusLabel": "Verified",
      "label": "NYC route bound",
      "detail": "Business group 28086 is filtered to Puttery NYC business 37824. Retained records in the inspected receiver use the NYC business ID."
    },
    {
      "state": "complete",
      "statusLabel": "Documented",
      "label": "Local test baseline",
      "detail": "The source package records 13 receiver checks and 18 relay checks. These are the existing engineering test baseline, separate from the current health readback."
    },
    {
      "state": "complete",
      "statusLabel": "Receiving",
      "label": "Reservation webhook",
      "detail": "The public relay and local receiver were healthy and receiving on September 4. This is an engineering snapshot, not a live dashboard feed."
    },
    {
      "state": "current",
      "statusLabel": "Pending",
      "label": "Reconcile deliveries",
      "detail": "Confirm the intended test event with Tock, resolve the cumulative relay-to-receiver difference, and verify replay and export recovery."
    },
    {
      "state": "waiting",
      "statusLabel": "Access needed",
      "label": "Tracking and source access",
      "detail": "Confirm Data Exports, the website and tag container, GA4, Google Ads, Meta, and applicable event-system access for the NYC pilot."
    },
    {
      "state": "locked",
      "statusLabel": "Held",
      "label": "Production reporting",
      "detail": "Daily source totals, approved measurement definitions, consent, commercial readiness, and exact account mapping must pass before attribution or media feedback."
    }
  ],
  "venueScope": "New York City",
  "venueDetail": "One venue \u00b7 location filter verified",
  "webhookState": "Receiving",
  "webhookDetail": "Dated engineering evidence",
  "exportState": "Pending",
  "exportDetail": "Access and recovery to confirm",
  "attributionState": "Pending",
  "attributionDetail": "Reconciliation before reporting"
});
