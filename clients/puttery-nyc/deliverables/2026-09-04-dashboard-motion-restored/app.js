const metricViews = {
  "30d": { spend: "$2,500", visits: "3,842", bookings: "214", completed: "168", revenue: "$24,186", coverage: "61%" },
  "7d": { spend: "$620", visits: "946", bookings: "51", completed: "39", revenue: "$5,810", coverage: "58%" },
};

const platformDetails = [
  {
    key: "Website",
    name: "Puttery web",
    state: "verify",
    stateLabel: "Must verify",
    role: "Captures the first party marketing touch before handing the guest to Tock.",
    confirmed: "A governed redirect can retain UTMs and approved click identifiers without changing the booking destination.",
    unknown: "Domain ownership, consent platform, current analytics container, redirect hosting, and every live Tock destination.",
    fallback: "Use native tagged Tock links and source reporting if the first party redirect cannot be approved.",
  },
  {
    key: "Tock",
    name: "Tock",
    state: "verify",
    stateLabel: "Delivery received",
    role: "Primary Puttery reservation source and the strongest immediate booking measurement path.",
    confirmed: "Reservation webhook receipt and NYC business 37824 filtering were verified on September 4 at 7:03 PM ET. Delivery events include record updates and must not be counted as separate bookings.",
    unknown: "Controlled-event confirmation, delivery reconciliation, Data Exports recovery, the secure credential route, GA4 settings, and campaign-field preservation.",
    fallback: "Use approved daily exports only after Tock validates the Data Exports route; keep modeled reporting separate until then.",
  },
  {
    key: "Toast",
    name: "Toast",
    state: "verify",
    stateLabel: "Access review requested",
    role: "Potential commerce source for orders, checks, payments, refunds, and revenue centers; confirm current NYC use.",
    confirmed: "Standard APIs are read only and location specific. Orders webhooks, bulk backfills, nightly exports, and web reports are documented routes.",
    unknown: "Current NYC use, restaurant GUID, management group, RMS tier, permissions, webhook eligibility, exports, closeout time, and Toast Tables use. Access review has been requested.",
    fallback: "Confirm the available reporting or export route and the NYC revenue definition. The earlier Phase 1 deferment is historical; this expanded access review now includes Toast.",
  },
  {
    key: "Tripleseat",
    name: "Tripleseat",
    state: "verify",
    stateLabel: "Must verify",
    role: "Tracks Puttery group event leads, bookings, documents, event value, deposits, and lifecycle changes.",
    confirmed: "OAuth2 APIs, native UTM and GCLID fields, custom lead fields, payment reports, and signed webhooks are documented.",
    unknown: "Whether Puttery NYC uses it, customer and site hierarchy, location ID, scopes, forms, financial grain, and operational ownership.",
    fallback: "Saved and scheduled Event Details, Booking Details, and payment reports.",
  },
  {
    key: "GA4",
    name: "GA4",
    state: "verify",
    stateLabel: "Must verify",
    role: "Measures the owned site, cross domain Tock journey, purchase events, and campaign traffic consistently.",
    confirmed: "Tock documents a native GA4 integration and cross domain configuration with transaction identifiers.",
    unknown: "Property ownership, web streams, Measurement IDs, domains, current events, data filters, consent mode, and referral exclusions.",
    fallback: "Create a pilot property or stream only after the account owner approves the measurement design.",
  },
  {
    key: "Google Ads",
    name: "Google Ads",
    state: "gated",
    stateLabel: "Access gated",
    role: "Supplies spend, campaign metadata, click IDs, and eventually verified reservation and visit feedback.",
    confirmed: "Auto tagging and governed offline outcome uploads can support booking and completed visit optimization.",
    unknown: "Exact account, manager relationship, conversion actions, attribution settings, auto tagging, enhanced conversion terms, and upload authority.",
    fallback: "Report spend and traffic without changing bidding until conversion reporting is validated.",
  },
  {
    key: "Meta",
    name: "Meta",
    state: "gated",
    stateLabel: "Access gated",
    role: "Supplies paid social delivery and can receive governed server or offline outcomes through a Dataset.",
    confirmed: "Conversions API supports web and physical outcomes with event IDs and permitted match keys.",
    unknown: "Business Manager, ad account, Pixel or Dataset, domain verification, consent rules, deduplication design, and action authority.",
    fallback: "Keep Meta reporting at delivery and owned click grain until the Dataset and consent design are approved.",
  },
  {
    key: "Tock Guest",
    name: "Tock Guest Profile",
    state: "verify",
    stateLabel: "Access review requested",
    role: "The identity lane. Guest records are what make Customer Match and permitted advanced matching possible at all.",
    confirmed: "The vendor documented Guest Profile Ingest API and Guest Profile Webhook routes. Exact NYC enablement and permitted use still require confirmation.",
    unknown: "Whether Puttery will authorise guest-level data at all, plus consent basis, retention, hashing rule, and which permitted identifiers may leave the venue.",
    fallback: "Stay at reservation grain with no guest identity, and report platform-level outcomes only.",
  },
  {
    key: "Tock Walk-in",
    name: "Tock walk-ins",
    state: "verify",
    stateLabel: "Access review requested",
    role: "Covers guests who arrive without a reservation, which the kickoff assumed could only be reached through Toast.",
    confirmed: "Tock documents reservations, walk-ins, and guest profile as separately selectable feeds. Actual NYC enablement and usage remain unverified.",
    unknown: "Whether Puttery NYC records walk-ins in Tock at all, the value carried on a walk-in record, and how it reconciles against the reservation ledger.",
    fallback: "Report booked covers only, and state plainly that walk-in revenue is outside the measured set.",
  },
  {
    key: "GTM",
    name: "Google Tag Manager",
    state: "gated",
    stateLabel: "Access requested",
    role: "The deployment surface for every first-party tag, consent signal, and click-identifier capture on the Puttery pages.",
    confirmed: "A container is live on the Puttery NYC pages; publish access is on the onboarding access list.",
    unknown: "Container ID, existing tags and triggers, who else can publish, and whether a consent platform already governs it.",
    fallback: "Hard-code nothing. Without publish access no first-party capture ships and the redirect route cannot be proven.",
  },
];

const questions = [
  { id: "gov-01", platform: "Governance", blocker: true, owner: "Puttery", prompt: "Who is the Puttery executive owner who can approve account access and source definitions?", why: "One accountable owner prevents partial permissions and conflicting metric definitions.", evidence: "Name, role, email, and written pilot approval." },
  { id: "gov-02", platform: "Governance", blocker: true, owner: "Puttery", prompt: "What legal entity and operating entity own Puttery NYC revenue and guest data?", why: "Controller and merchant identity determine access, privacy scope, and financial reconciliation.", evidence: "Approved entity names and applicable account ownership." },
  { id: "gov-03", platform: "Governance", blocker: true, owner: "Joint", prompt: "Is Puttery NYC the only pilot reporting unit, or must Rory’s Rooftop and other on premise concepts remain separate?", why: "The venue key must match how operations and finance actually manage the location.", evidence: "Approved venue and revenue center crosswalk." },
  { id: "gov-04", platform: "Governance", blocker: true, owner: "Joint", prompt: "Which timezone, business day close, and week start govern the pilot?", why: "Reservations and POS transactions cannot reconcile when service date and closeout rules disagree.", evidence: "Timezone, closeout time, and reporting calendar." },
  { id: "gov-05", platform: "Governance", blocker: true, owner: "Joint", prompt: "What are the approved definitions for booking, completed visit, cover, net sales, refund, and attributed revenue?", why: "Definitions must be fixed before numbers are compared or used for optimization.", evidence: "Signed KPI dictionary with inclusions and exclusions." },

  { id: "web-01", platform: "Website", blocker: true, owner: "Puttery", prompt: "Who controls puttery.com, DNS, redirects, tag management, and production releases?", why: "The pilot needs an approved owner for first party tracking and cross domain configuration.", evidence: "Named administrators and approved deployment workflow." },
  { id: "web-02", platform: "Website", blocker: true, owner: "Momentum", prompt: "Can paid reservation traffic use a governed Puttery redirect before reaching the exact Tock URL?", why: "This is the cleanest way to retain campaign context without altering Tock.", evidence: "Approved redirect hostname and destination allowlist." },
  { id: "web-03", platform: "Website", blocker: false, owner: "Puttery", prompt: "Which pages and buttons currently send guests to Tock, group events, gift cards, or other commerce destinations?", why: "Every conversion path needs an explicit destination and event definition.", evidence: "Current URL inventory and button map." },
  { id: "web-04", platform: "Website", blocker: true, owner: "Puttery", prompt: "Which consent management platform and regional rules govern analytics and advertising tags?", why: "Consent must be resolved before click identifiers or user provided data are retained.", evidence: "Consent configuration, policy owner, and jurisdiction matrix." },
  { id: "web-05", platform: "Website", blocker: false, owner: "Momentum", prompt: "Are UTMs standardized across Google, Meta, email, partners, QR codes, and organic campaigns?", why: "Inconsistent campaign naming destroys source reporting before integrations begin.", evidence: "Current taxonomy or approval for the proposed taxonomy." },

  { id: "tock-01", platform: "Tock", blocker: true, owner: "Puttery", prompt: "What is the exact Puttery NYC Tock business ID and business group?", why: "Tock webhooks can span a group, but every record must still map to the correct business.", evidence: "Business ID, group name, and account screenshot or export.", vendorAnswer: { text: "Webhooks are only available at the business group level and require filtering at the business level downstream. The group and NYC business identifiers are separately bound in the receiver.", source: "Laura Benedetto, Technical Account Analyst, Resy / Tock / American Express Global Dining, 2026-08-28" } },
  { id: "tock-02", platform: "Tock", blocker: true, owner: "Puttery", prompt: "Is the Puttery account on a plan eligible for API exports and webhooks?", why: "Public capability does not prove this account is entitled.", evidence: "Plan confirmation from the Account Owner or Tock.", vendorAnswer: { text: "Yes. Puttery NYC is on a subscription plan eligible for API data exports and webhooks.", source: "Laura Benedetto, Technical Account Analyst, Resy / Tock / American Express Global Dining, 2026-08-28" } },
  { id: "tock-03", platform: "Tock", blocker: true, owner: "Puttery", prompt: "Who is the Tock Account Owner authorized to request API and webhook access?", why: "Tock requires entitlement requests from an Account Owner identity.", evidence: "Named owner and approved vendor request path.", vendorAnswer: { text: "Tom Luciano's email suffices to request and gain access; a separate Account Owner identity is not required.", source: "Laura Benedetto, Technical Account Analyst, Resy / Tock / American Express Global Dining, 2026-08-28" } },
  { id: "tock-04", platform: "Tock", blocker: true, owner: "Momentum", prompt: "Do reservation webhooks include stable reservation ID, business ID, status, sequence ID, value, and refund details for this account?", why: "The live payload, not the public model, determines the usable schema.", evidence: "Redacted create, edit, cancel, no show, and refund payload samples.", vendorAnswer: { text: "Reservation ID, business and location identifiers, created and updated timestamps, party state, cancellation and no show status, total price, net amount paid, amount due, payments, refunds, and checkout metadata are all in the Reservation data model. The live payload for this account is still unproven.", source: "Laura Benedetto, Technical Account Analyst, Resy / Tock / American Express Global Dining, 2026-08-28" } },
  { id: "tock-05", platform: "Tock", blocker: true, owner: "Momentum", prompt: "Which campaign fields survive from a tagged Tock URL into webhook, export, or key value data?", why: "Exact campaign attribution depends on proving preservation, not assuming it.", evidence: "Controlled tagged test booking and resulting payloads.", vendorAnswer: { text: "Click identifiers and UTMs are carried in the reservation KeyValue field. Presence of the field is confirmed; survival from a tagged URL is not, and depends on the Puttery booking flow writing them.", source: "Laura Benedetto, Technical Account Analyst, Resy / Tock / American Express Global Dining, 2026-08-28" } },
  { id: "tock-06", platform: "Tock", blocker: false, owner: "Puttery", prompt: "Which booking experiences, deposits, prepaid products, add ons, discounts, and taxes are active?", why: "Booking value and collected value require experience specific financial rules.", evidence: "Experience catalog and financial export sample." },
  { id: "tock-07", platform: "Tock", blocker: true, owner: "Momentum", prompt: "Is native GA4 configured with the correct Measurement ID and cross domain settings?", why: "Tock purchase events are the strongest immediate no custom API conversion path.", evidence: "Tock integration screen plus GA4 DebugView transaction test.", vendorAnswer: { text: "The GA4 integration can be enabled at any time from the Tock dashboard integration directory. Whether it is enabled and correctly configured for this account is unverified.", source: "Laura Benedetto, Technical Account Analyst, Resy / Tock / American Express Global Dining, 2026-08-28" } },
  { id: "tock-08", platform: "Tock", blocker: false, owner: "Puttery", prompt: "How are transferred reservations, walk ins, modifications, cancellations, no shows, and refunds handled operationally?", why: "Every state changes conversion quality and prevents inflated ROAS.", evidence: "Operations policy and representative records for each state." },

  { id: "toast-01", platform: "Toast", blocker: true, owner: "Puttery", prompt: "What is the Puttery NYC restaurant GUID, management group, and export restaurant number?", why: "Toast standard requests are location specific and names are not safe join keys.", evidence: "Restaurant GUID and location folder mapping." },
  { id: "toast-02", platform: "Toast", blocker: true, owner: "Puttery", prompt: "Which Toast RMS tier is active and are Standard API, Analytics API, and nightly exports enabled?", why: "Availability and permission requirements differ by product tier.", evidence: "Subscription and integration settings confirmation." },
  { id: "toast-03", platform: "Toast", blocker: true, owner: "Puttery", prompt: "Who has Manage Integrations, Sales Reports, Data Export Config, and required multi location permissions?", why: "Incomplete roles can expose only part of the location or disable required routes.", evidence: "Named users and permission checklist." },
  { id: "toast-04", platform: "Toast", blocker: true, owner: "Momentum", prompt: "Can the pilot credential retrieve orders through the Orders API for the Puttery restaurant GUID?", why: "A live read only probe confirms scope before webhook engineering.", evidence: "Sanitized successful restaurant and orders readback." },
  { id: "toast-05", platform: "Toast", blocker: true, owner: "Momentum", prompt: "Can Puttery enable the signed orders webhook and approve a bulk orders overlap backfill?", why: "Toast stops after two retries, so the webhook alone cannot guarantee completeness.", evidence: "Subscription confirmation, signature test, and backfill schedule." },
  { id: "toast-06", platform: "Toast", blocker: true, owner: "Puttery", prompt: "Are nightly exports available, what is the closeout time, and who retrieves them before seven day expiration?", why: "Exports are the durable reconciliation lane but expire and do not reflect later corrections.", evidence: "SFTP folder sample, file list, closeout rule, and retention owner." },
  { id: "toast-07", platform: "Toast", blocker: true, owner: "Joint", prompt: "Which Toast amount is the approved commerce authority: net sales, payments, gross sales, or another finance measure?", why: "Tax, tip, gratuity, discounts, voids, and refunds must not be mixed silently.", evidence: "Finance approved measure and example daily report." },
  { id: "toast-08", platform: "Toast", blocker: false, owner: "Puttery", prompt: "Which revenue centers, dining options, service areas, and order sources belong to the Puttery pilot?", why: "Internal location segments may represent different operating concepts or excluded channels.", evidence: "Configuration export and inclusion map." },
  { id: "toast-09", platform: "Toast", blocker: false, owner: "Puttery", prompt: "Is Toast Tables or Guestbook used, and does any supported reservation to order identifier exist?", why: "Public documentation does not confirm an automated Toast Tables reservation API or exact reservation to check key.", evidence: "Vendor confirmation and representative booking and order records." },

  { id: "ts-01", platform: "Tripleseat", blocker: true, owner: "Puttery", prompt: "Does Puttery NYC use Tripleseat for group events, and which team owns the process?", why: "The portfolio source names Tripleseat, but its exact Puttery role must be confirmed.", evidence: "Operational owner and live workflow description." },
  { id: "ts-02", platform: "Tripleseat", blocker: true, owner: "Puttery", prompt: "What are the Tripleseat customer, site, and location IDs for Puttery NYC?", why: "Sites can contain several locations and must be mapped using stable IDs.", evidence: "Sites and Locations API or report export." },
  { id: "ts-03", platform: "Tripleseat", blocker: true, owner: "Puttery", prompt: "Is OAuth2 API access enabled with leads, events, bookings, payments, reports, and webhooks in scope?", why: "A role with UI access may still lack API and financial visibility.", evidence: "API and Webhooks settings plus approved scope list." },
  { id: "ts-04", platform: "Tripleseat", blocker: true, owner: "Momentum", prompt: "Do active lead forms capture native UTMs, GCLID, lead form ID, location ID, and a custom marketing touch ID?", why: "This can create a deterministic marketing touch to lead to event chain.", evidence: "Controlled form submission and returned lead payload." },
  { id: "ts-05", platform: "Tripleseat", blocker: true, owner: "Joint", prompt: "Which Tripleseat financial values are pipeline, contracted value, deposits, payments, refunds, and amount due?", why: "Event totals and Toast commerce can overlap and must never be summed blindly.", evidence: "Finance approved event and payment definitions." },
  { id: "ts-06", platform: "Tripleseat", blocker: false, owner: "Puttery", prompt: "Can event staff place an opaque Tripleseat event ID on the primary Toast event check?", why: "An approved TS event ID convention creates an exact event to Toast check bridge without guest PII.", evidence: "Operational approval and one test event check." },

  { id: "ga4-01", platform: "GA4", blocker: true, owner: "Puttery", prompt: "Which GA4 property and web stream own puttery.com and the NYC booking journey?", why: "The pilot needs one authoritative property and Measurement ID.", evidence: "Property ID, stream ID, Measurement ID, and administrator." },
  { id: "ga4-02", platform: "GA4", blocker: true, owner: "Momentum", prompt: "Are puttery.com and exploretock.com configured for cross domain measurement and unwanted referral exclusion?", why: "Broken cross domain setup creates new sessions and misattributes Tock purchases.", evidence: "Tag configuration and controlled booking DebugView trace." },
  { id: "ga4-03", platform: "GA4", blocker: true, owner: "Momentum", prompt: "Does the Tock purchase event contain unique transaction ID, value, currency, and business or experience context?", why: "Transaction IDs are required for deduplication and reliable booking value.", evidence: "DebugView and BigQuery or event export sample." },
  { id: "ga4-04", platform: "GA4", blocker: false, owner: "Puttery", prompt: "Are internal traffic, developer traffic, consent mode, data retention, and enhanced measurement configured intentionally?", why: "Uncontrolled filters and automatic events can distort the small pilot dataset.", evidence: "Admin configuration export or screenshots." },
  { id: "ga4-05", platform: "GA4", blocker: true, owner: "Joint", prompt: "Which GA4 events are observation only and which are approved key events?", why: "Clicks and checkout starts must not compete with bookings or completed visits as primary outcomes.", evidence: "Approved event and key event register." },

  { id: "gads-01", platform: "Google Ads", blocker: true, owner: "Puttery", prompt: "What is the exact Google Ads customer ID and manager account relationship for Puttery NYC?", why: "Spend and conversions must be read from the correct client account.", evidence: "Customer ID and approved account selection." },
  { id: "gads-02", platform: "Google Ads", blocker: true, owner: "Momentum", prompt: "Is auto tagging active and are GCLIDs retained through the first party landing and booking path?", why: "Click identifier retention improves deterministic campaign matching.", evidence: "Controlled ad URL test and stored touch record." },
  { id: "gads-03", platform: "Google Ads", blocker: true, owner: "Joint", prompt: "Which current conversion actions are primary, secondary, duplicated, imported from GA4, or manually uploaded?", why: "Duplicate booking goals can overstate performance and distort bidding.", evidence: "Conversion action export with source and optimization setting." },
  { id: "gads-04", platform: "Google Ads", blocker: true, owner: "Joint", prompt: "Which outcomes may enter shadow mode first: reservation made, completed visit, or matched Toast revenue?", why: "Higher quality outcomes should be validated before they influence bidding.", evidence: "Approved conversion ladder and rollout dates." },
  { id: "gads-05", platform: "Google Ads", blocker: false, owner: "Puttery", prompt: "What report supports the stated monthly spend and roughly three times ROAS, including date and attribution window?", why: "The Slack claim is not yet reconciled to bookings, refunds, or collected revenue.", evidence: "Campaign report, conversion definitions, date range, and attribution settings." },

  { id: "meta-01", platform: "Meta", blocker: true, owner: "Puttery", prompt: "What Business Manager, ad account, Pixel, Dataset, and verified domain belong to Puttery NYC?", why: "A clean asset map is required before any server outcome design.", evidence: "Business, account, Pixel or Dataset, and domain IDs." },
  { id: "meta-02", platform: "Meta", blocker: true, owner: "Momentum", prompt: "Are browser Pixel events and server events deduplicated with the same event ID?", why: "Without deduplication, one booking can appear twice.", evidence: "Test Events trace showing browser and server pairing." },
  { id: "meta-03", platform: "Meta", blocker: true, owner: "Joint", prompt: "Which match keys are permitted under Puttery consent and regional policy?", why: "Email, phone, fbp, and fbc may be used only under an approved purpose and consent state.", evidence: "Approved field allowlist and consent conditions." },
  { id: "meta-04", platform: "Meta", blocker: true, owner: "Joint", prompt: "Which reservation and completed visit events may be sent to the Dataset in shadow mode?", why: "Modeled or unmatched outcomes must never be treated as production conversions.", evidence: "Approved event schema, match method, and quality gate." },
  { id: "meta-05", platform: "Meta", blocker: false, owner: "Puttery", prompt: "Which campaigns, objectives, attribution settings, and current conversion events support the stated performance?", why: "Delivery metrics cannot be compared fairly without the current optimization context.", evidence: "Campaign and event export for the pilot period." },

  { id: "resy-01", platform: "Resy", blocker: false, owner: "Puttery", prompt: "Which portfolio concepts use Resy, and are they separate venues or reporting units from Puttery?", why: "Resy is not the Puttery core booking source but affects portfolio expansion.", evidence: "Venue to platform crosswalk." },
  { id: "resy-02", platform: "Resy", blocker: false, owner: "Puttery", prompt: "Does the group have Platform 360, enterprise API, webhook, advanced analytics, or approved data partner access?", why: "Public enterprise language does not prove account entitlement.", evidence: "Contract entitlement and vendor contact." },
  { id: "resy-03", platform: "Resy", blocker: false, owner: "Momentum", prompt: "What exact reservation, status, source, guest, and timing fields are available in reports or payloads?", why: "The fallback may be scheduled reporting rather than real time API data.", evidence: "Redacted payload or custom report sample." },
  { id: "resy-04", platform: "Resy", blocker: false, owner: "Momentum", prompt: "Do UTMs, click IDs, or any first party token survive into Resy data?", why: "No public documentation confirms deterministic campaign token preservation.", evidence: "Controlled tagged booking and payload test." },
  { id: "resy-05", platform: "Resy", blocker: false, owner: "Joint", prompt: "What aggregate source reporting is acceptable if person level attribution is not supported?", why: "The dashboard needs an honest fallback before the portfolio rollout is priced.", evidence: "Approved source and coverage reporting rule." },

  { id: "eb-01", platform: "Eventbrite", blocker: false, owner: "Puttery", prompt: "Which Eventbrite organization, recurring events, and team members own High Line Comedy Club ticketing?", why: "Eventbrite belongs to the portfolio expansion and must map to the correct organization and venue.", evidence: "Organization and event IDs plus owner roles." },
  { id: "eb-02", platform: "Eventbrite", blocker: false, owner: "Momentum", prompt: "Can the app read orders and attendees and receive order placed, updated, and refunded webhooks?", why: "Webhooks point to records that must be fetched and reconciled through authorized API access.", evidence: "App scopes, webhook test, and API readback." },
  { id: "eb-03", platform: "Eventbrite", blocker: false, owner: "Momentum", prompt: "Is GA4 purchase tracking enabled for every applicable event and deduplicated by order ID?", why: "GA4 purchases do not automatically account for refunds, transfers, or manual orders.", evidence: "Controlled order and refund event trace." },
  { id: "eb-04", platform: "Eventbrite", blocker: false, owner: "Puttery", prompt: "How are transfers, refunds, manual transactions, complimentary tickets, and check ins treated?", why: "Ticket purchase and actual attendance are different outcomes.", evidence: "Operations policy and representative order states." },
  { id: "eb-05", platform: "Eventbrite", blocker: false, owner: "Joint", prompt: "Should Eventbrite orders reconcile to Toast, or remain a separate ticketing commerce source?", why: "The same guest spend can be duplicated if ticket and POS commerce are combined incorrectly.", evidence: "Approved financial and venue reconciliation rule." },

  { id: "privacy-01", platform: "Privacy", blocker: true, owner: "Puttery", prompt: "Which guest and payment fields are prohibited from the attribution warehouse?", why: "Notes, allergies, card data, addresses, and free text create unnecessary risk.", evidence: "Approved field allowlist and prohibited field list." },
  { id: "privacy-02", platform: "Privacy", blocker: true, owner: "Joint", prompt: "What consent evidence is required for analytics, advertising, cross brand identity, and offline conversion use?", why: "A shared guest profile does not automatically authorize marketing across concepts.", evidence: "Consent purpose matrix and source of truth." },
  { id: "privacy-03", platform: "Privacy", blocker: true, owner: "Puttery", prompt: "What retention, deletion, suppression, and data subject request rules apply?", why: "Derived identity and attribution records must follow the same lifecycle as the source data.", evidence: "Retention schedule and request handling owner." },
  { id: "privacy-04", platform: "Privacy", blocker: true, owner: "Momentum", prompt: "Where will credentials, raw exports, webhook payloads, and normalized data be stored?", why: "Secrets and raw guest data require separate protected systems and least privilege.", evidence: "Approved hosting, secret manager, access roles, and environments." },
  { id: "privacy-05", platform: "Privacy", blocker: false, owner: "Joint", prompt: "Which users may see portfolio totals, venue rows, guest identity, and campaign details?", why: "Dashboard access should separate executive reporting from operational and identity access.", evidence: "Role and row level access matrix." },
  { id: "privacy-06", platform: "Privacy", blocker: true, owner: "Joint", prompt: "Who approves vendor terms, data processing, legal review, and production conversion uploads?", why: "The technical pilot cannot silently authorize contractual or advertising use.", evidence: "Named approvers and approval gates." },
  { id: "guest-01", platform: "Tock Guest", blocker: true, owner: "Puttery", prompt: "Will Puttery authorise guest-level identity leaving the venue for advertising match at all?", why: "Every Customer Match and advanced-matching route depends on this one decision, and no amount of engineering substitutes for it.", evidence: "Written decision from the accountable owner, with the permitted identifier list.", vendorAnswer: { text: "The vendor documented Guest Profile Ingest API and real-time Guest Profile Webhook routes. Exact NYC enablement and authorisation to use guest identity still require confirmation.", source: "Laura Benedetto, Technical Account Analyst, Resy / Tock / American Express Global Dining, 2026-08-28" } },
  { id: "guest-02", platform: "Tock Guest", blocker: true, owner: "Joint", prompt: "What consent basis, retention period, and hashing rule govern guest identifiers?", why: "Identity cannot be sent to an ad platform before consent, retention, and hashing are settled in writing.", evidence: "Approved consent text, retention schedule, and the hashing specification." },
  { id: "walkin-01", platform: "Tock Walk-in", blocker: false, owner: "Puttery", prompt: "Does Puttery NYC record walk-in guests in Tock, and with what value?", why: "The kickoff assumed walk-ins were only reachable through Toast; if Tock records them, a deferred source becomes unnecessary.", evidence: "A representative walk-in record with its value fields.", vendorAnswer: { text: "Tock offers walk-ins as a separately selectable webhook alongside reservations and guest profile.", source: "Laura Benedetto, Technical Account Analyst, Resy / Tock / American Express Global Dining, 2026-08-28" } },
  { id: "gtm-01", platform: "GTM", blocker: true, owner: "Puttery", prompt: "What is the Puttery NYC container ID and who else can publish to it?", why: "Two publishers without a change protocol is how tracking silently breaks mid-pilot.", evidence: "Container ID, user list, and the agreed publish protocol." },
  { id: "gtm-02", platform: "GTM", blocker: true, owner: "Momentum", prompt: "What tags, triggers, and consent settings already exist in the container?", why: "Existing tags can double-count or contradict the pilot measurement before a single new tag ships.", evidence: "A container export reviewed against the measurement design." },
];

const storageKey = "putteryPilotDiscoveryV2";
let answers = loadAnswers();

function renderOperationalStatus() {
  const status = window.PUTTERY_OPERATIONAL_STATUS;
  if (!status) return;

  document.querySelectorAll("[data-status-field]").forEach((element) => {
    const value = status[element.dataset.statusField];
    if (typeof value === "string") element.textContent = value;
  });

  const updated = document.querySelector("#status-updated");
  if (updated) updated.dateTime = status.snapshotDate;

  const state = document.querySelector("#status-state");
  if (state) {
    state.classList.toggle("ready", status.productionState === "ready");
    state.classList.toggle("gated", status.productionState !== "ready");
  }

  const milestones = document.querySelector("#status-milestones");
  if (!milestones || !Array.isArray(status.milestones)) return;
  milestones.replaceChildren(...status.milestones.map((milestone, index) => {
    const item = document.createElement("li");
    item.className = milestone.state;

    const marker = document.createElement("span");
    marker.className = "milestone-marker";
    marker.textContent = String(index + 1);

    const copy = document.createElement("div");
    const label = document.createElement("strong");
    label.textContent = milestone.label;
    const detail = document.createElement("p");
    detail.textContent = milestone.detail;
    copy.append(label, detail);

    const milestoneStatus = document.createElement("span");
    milestoneStatus.className = "milestone-status";
    milestoneStatus.textContent = milestone.statusLabel;
    item.append(marker, copy, milestoneStatus);
    return item;
  }));
}

function loadAnswers() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function saveAnswers() {
  try { localStorage.setItem(storageKey, JSON.stringify(answers)); return true; }
  catch (_) { showFeedback("Browser storage is unavailable. Export your answers before leaving to keep a copy."); return false; }
}

function escapeText(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function renderPlatforms() {
  const container = document.querySelector("#platform-grid");
  container.innerHTML = platformDetails.map((platform) => {
    const related = questions.filter((question) => question.platform === platform.key);
    const resolved = related.filter((question) => answers[question.id]?.status && answers[question.id].status !== "unanswered").length;
    return `
      <article class="platform-card">
        <div class="platform-name">
          <h3>${platform.name}</h3>
          <span class="platform-state ${platform.state}">${platform.stateLabel}</span>
          <span class="platform-progress">${resolved} of ${related.length} questions resolved</span>
        </div>
        <div class="platform-copy">
          <p>${platform.role}</p>
          <dl>
            <div><dt>Documented</dt><dd>${platform.confirmed}</dd></div>
            <div><dt>Still unknown</dt><dd>${platform.unknown}</dd></div>
            <div><dt>Fallback</dt><dd>${platform.fallback}</dd></div>
          </dl>
          <button class="platform-jump" type="button" data-platform-jump="${platform.key}">Review ${platform.name} questions</button>
        </div>
      </article>`;
  }).join("");

  container.querySelectorAll("[data-platform-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#platform-filter").value = button.dataset.platformJump;
      renderQuestions();
      document.querySelector("#discovery").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function populatePlatformFilter() {
  const select = document.querySelector("#platform-filter");
  const platforms = [...new Set(questions.map((question) => question.platform))];
  select.insertAdjacentHTML("beforeend", platforms.map((platform) => `<option value="${platform}">${platform}</option>`).join(""));
}

function getFilteredQuestions() {
  const platform = document.querySelector("#platform-filter").value;
  const status = document.querySelector("#status-filter").value;
  const search = document.querySelector("#question-search").value.trim().toLowerCase();
  return questions.filter((question) => {
    const answer = answers[question.id]?.status || "unanswered";
    const platformMatch = platform === "all" || question.platform === platform;
    const statusMatch = status === "all" ||
      (status === "unanswered" && answer === "unanswered") ||
      (status === "resolved" && answer !== "unanswered") ||
      (status === "blocked" && answer === "no");
    const haystack = `${question.platform} ${question.owner} ${question.prompt} ${question.why} ${question.evidence}`.toLowerCase();
    return platformMatch && statusMatch && (!search || haystack.includes(search));
  });
}

function renderQuestions() {
  const filtered = getFilteredQuestions();
  const container = document.querySelector("#question-list");
  const empty = document.querySelector("#empty-questions");
  empty.hidden = filtered.length !== 0;
  const grouped = filtered.reduce((groups, question) => {
    if (!groups.has(question.platform)) groups.set(question.platform, []);
    groups.get(question.platform).push(question);
    return groups;
  }, new Map());

  container.innerHTML = [...grouped.entries()].map(([platform, platformQuestions], groupIndex) => {
    const resolved = platformQuestions.filter((question) => answers[question.id]?.status && answers[question.id].status !== "unanswered").length;
    const openBlockers = platformQuestions.filter((question) => question.blocker && (!answers[question.id]?.status || answers[question.id].status === "unanswered" || answers[question.id].status === "no")).length;
    const vendorAnswered = platformQuestions.filter((question) => question.vendorAnswer).length;
    const questionMarkup = platformQuestions.map((question) => {
      const answer = answers[question.id] || { status: "unanswered", note: "" };
      const index = questions.findIndex((item) => item.id === question.id) + 1;
      return `
        <article class="question-item" data-question="${question.id}">
          <div class="question-number">Q${String(index).padStart(2, "0")}</div>
          <div class="question-content">
            <div class="question-meta">
              <span>${question.platform}</span><span>${question.owner}</span>${question.blocker ? '<span class="blocking">Pilot blocker</span>' : '<span>Expansion detail</span>'}
            </div>
            <h3>${question.prompt}</h3>
            <p>${question.why}</p>
            <dl class="question-evidence"><dt>Evidence</dt><dd>${question.evidence}</dd></dl>
            ${question.vendorAnswer ? `<div class="vendor-answer"><strong>Already answered by the vendor</strong><p>${question.vendorAnswer.text}</p><cite>${question.vendorAnswer.source}</cite></div>` : ""}
          </div>
          <div class="answer-panel">
            <label for="status-${question.id}">Answer</label>
            <select id="status-${question.id}" data-answer-select="${question.id}" data-answer="${answer.status}">
              <option value="unanswered" ${answer.status === "unanswered" ? "selected" : ""}>Unanswered</option>
              <option value="yes" ${answer.status === "yes" ? "selected" : ""}>Yes or verified</option>
              <option value="no" ${answer.status === "no" ? "selected" : ""}>No or blocked</option>
              <option value="na" ${answer.status === "na" ? "selected" : ""}>Not applicable</option>
            </select>
            <label for="note-${question.id}">Evidence note</label>
            <input id="note-${question.id}" data-answer-note="${question.id}" value="${escapeText(answer.note || "")}" placeholder="Owner, ID, link, or decision" />
          </div>
        </article>`;
    }).join("");

    return `
      <details class="question-group" ${groupIndex === 0 ? "open" : ""}>
        <summary>
          <span class="question-group-name">${platform}</span>
          <span class="question-group-progress">${resolved} of ${platformQuestions.length} resolved</span>
          <span class="question-group-blockers">${openBlockers} blocker${openBlockers === 1 ? "" : "s"} open</span>
          ${vendorAnswered ? `<span class="question-group-vendor">${vendorAnswered} vendor answered</span>` : ""}
        </summary>
        <div class="question-group-body">${questionMarkup}</div>
      </details>`;
  }).join("");

  container.querySelectorAll("[data-answer-select]").forEach((select) => {
    select.addEventListener("change", () => {
      const id = select.dataset.answerSelect;
      answers[id] = { ...(answers[id] || {}), status: select.value, note: answers[id]?.note || "" };
      select.dataset.answer = select.value;
      saveAnswers();
      updateProgress();
      renderPlatforms();
    });
  });

  container.querySelectorAll("[data-answer-note]").forEach((input) => {
    input.addEventListener("change", () => {
      const id = input.dataset.answerNote;
      answers[id] = { ...(answers[id] || { status: "unanswered" }), note: input.value.trim() };
      if (saveAnswers()) showFeedback("Evidence note saved in this browser.");
    });
  });
}

function updateProgress() {
  const resolved = questions.filter((question) => answers[question.id]?.status && answers[question.id].status !== "unanswered").length;
  const blockers = questions.filter((question) => question.blocker);
  const unresolvedBlockers = blockers.filter((question) => !answers[question.id]?.status || answers[question.id].status === "unanswered");
  const blocked = blockers.filter((question) => answers[question.id]?.status === "no");
  const percent = Math.round((resolved / questions.length) * 100);
  let gate = window.PUTTERY_OPERATIONAL_STATUS?.currentGate || "Collect access";
  let explainer = window.PUTTERY_OPERATIONAL_STATUS?.readinessExplainer || "Answer the blocking questions before committing to exact cross platform attribution.";
  if (blocked.length) {
    gate = "Blocked";
    explainer = `${blocked.length} blocking answer${blocked.length === 1 ? "" : "s"} must be resolved or moved to an approved fallback.`;
  } else if (!unresolvedBlockers.length) {
    gate = resolved === questions.length ? "Ready for schema proof" : "Validate expansion details";
    explainer = "Every core blocker has an answer. Validate the supplied evidence before implementation.";
  }

  document.querySelector("#readiness-percent").textContent = `${percent}%`;
  document.querySelector("#score-fill").style.width = `${percent}%`;
  document.querySelector(".putt-track").style.setProperty("--putt", percent);
  document.querySelector(".putt-track").classList.toggle("holed", percent === 100);
  document.querySelector("#mobile-readiness-percent").textContent = `${percent}%`;
  document.querySelector("#mobile-score-fill").style.width = `${percent}%`;
  document.querySelector("#questions-resolved").textContent = `${resolved} / ${questions.length}`;
  document.querySelector("#blocking-open").textContent = `${unresolvedBlockers.length + blocked.length} open`;
  document.querySelector("#current-gate").textContent = gate;
  document.querySelector("#mobile-current-gate").textContent = gate;
  document.querySelector("#readiness-explainer").textContent = explainer;
  document.querySelector("#discovery-percent").textContent = `${percent}%`;
  document.querySelector("#discovery-summary-text").textContent = `${resolved} of ${questions.length} questions resolved`;
  document.querySelector("#rail-progress").textContent = `${resolved} of ${questions.length} resolved`;
  document.querySelector("#rail-gate").textContent = gate;
  document.querySelector(".status-dot").classList.toggle("ready", !unresolvedBlockers.length && !blocked.length);
}

function exportAnswers() {
  const exportRows = questions.map((question) => ({
    id: question.id,
    platform: question.platform,
    pilotBlocker: question.blocker,
    owner: question.owner,
    question: question.prompt,
    requiredEvidence: question.evidence,
    answer: answers[question.id]?.status || "unanswered",
    note: answers[question.id]?.note || "",
  }));
  const payload = {
    venue: "Puttery NYC",
    generatedAt: new Date().toISOString(),
    evidenceBoundary: "Discovery answers entered in this browser. Operational readiness is a dated, non-guest-data snapshot. Dashboard performance values remain modeled demonstration data.",
    liveAccountsConnected: false,
    operationalSnapshot: window.PUTTERY_OPERATIONAL_STATUS ? {
      snapshotDate: window.PUTTERY_OPERATIONAL_STATUS.snapshotDate,
      productionState: window.PUTTERY_OPERATIONAL_STATUS.productionState,
      currentGate: window.PUTTERY_OPERATIONAL_STATUS.currentGate,
    } : null,
    questions: exportRows,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "puttery-pilot-discovery-answers.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showFeedback("Discovery answers exported as JSON.");
}

function setMetricView(period) {
  const view = metricViews[period];
  document.querySelectorAll("[data-metric]").forEach((element) => {
    element.textContent = view[element.dataset.metric];
  });
}

function showFeedback(message) {
  const element = document.querySelector("#feedback");
  element.textContent = message;
  element.classList.add("visible");
  clearTimeout(showFeedback.timer);
  showFeedback.timer = setTimeout(() => element.classList.remove("visible"), 2600);
}

function resetView() {
  document.querySelector("#period-select").value = "30d";
  document.querySelector("#platform-filter").value = "all";
  document.querySelector("#status-filter").value = "all";
  document.querySelector("#question-search").value = "";
  setMetricView("30d");
  renderQuestions();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showFeedback("View filters reset. Saved discovery answers were preserved.");
}

function activateSectionNav() {
  const links = [...document.querySelectorAll(".rail-link")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-20% 0px -65%", threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}


/* Section headings resolve letter by letter as they enter view, ported from the
   template-10 build. The wordmark hop and the topbar slide are pure CSS. Must
   run after renderOperationalStatus() - that writes textContent into
   #status-title and would discard the character spans. */
function animateHeadings() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function splitAndAnimateHeading(heading) {
    const text = heading.textContent;
    heading.textContent = "";
    heading.setAttribute("aria-label", text);
    let step = 0;

    // Grouped per word, with the spaces between words left as plain text. A
    // line can break between any two adjacent inline-blocks, so a flat run of
    // character spans wraps mid-word ("Vend / or registration is next").
    text.split(" ").forEach((word, index) => {
      if (index > 0) heading.append(" ");

      const wrapper = document.createElement("span");
      wrapper.className = "word";
      wrapper.setAttribute("aria-hidden", "true");

      for (const character of word) {
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = character;
        span.style.transitionDelay = `${step++ * 28}ms`;
        wrapper.append(span);
      }

      heading.append(wrapper);
    });

    requestAnimationFrame(() => heading.classList.add("animated"));
  }

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      splitAndAnimateHeading(entry.target);
      reveal.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12%" });

  document.querySelectorAll("[data-split]").forEach((heading) => reveal.observe(heading));
}

/* --------------------------------------------------------------- the course
   One drawn mark per section, in the build's own accent roles: teal is route
   and verification, pink is action and the unresolved gate, green is ready.
   Each carries its own motion rather than one shared entrance - a putt reads
   differently from a flag in wind. Decorative, so every mark is aria-hidden
   and the section heading remains the only accessible label. */
const courseMarks = {
  overview: `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path class="cm-arc" d="M26 82C44 34 82 32 100 58" stroke="var(--teal)" stroke-width="6" stroke-dasharray="5 12"/>
    <path d="M100 58v34" stroke-width="6"/>
    <path class="cm-flag" d="M100 58h22l-7 9 7 9h-22z" fill="var(--pink)" stroke="var(--pink)"/>
    <path d="M16 96h88" stroke-width="6"/>
    <g class="cm-tee"><circle cx="26" cy="80" r="11" fill="var(--white)" stroke="currentColor"/></g>
  </svg>`,

  "live-status": `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 92h76"/><ellipse cx="60" cy="92" rx="13" ry="5" fill="var(--black)" stroke="none"/>
    <path d="M60 88V26"/>
    <path class="cm-flag" d="M60 30h30l-9 11 9 11H60z" fill="var(--pink)" stroke="var(--pink)"/>
  </svg>`,

  outcomes: `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <circle class="cm-ring cm-r1" cx="60" cy="60" r="42" stroke="var(--teal)"/>
    <circle class="cm-ring cm-r2" cx="60" cy="60" r="26" stroke="var(--teal)"/>
    <circle class="cm-ring cm-r3" cx="60" cy="60" r="10" fill="var(--pink)" stroke="var(--pink)"/>
  </svg>`,

  integrations: `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 30h88M16 90h88"/>
    <path d="M104 30 78 60l26 30" stroke="var(--teal)" stroke-width="5"/>
    <circle class="cm-feed cm-f1" cx="34" cy="30" r="8" fill="var(--white)"/>
    <circle class="cm-feed cm-f2" cx="62" cy="30" r="8" fill="var(--white)"/>
    <circle class="cm-feed cm-f3" cx="46" cy="90" r="8" fill="var(--white)"/>
  </svg>`,

  discovery: `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M26 18h68v84H26z" fill="var(--white)"/>
    <path d="M42 44h36M42 62h36" stroke="var(--black)" stroke-width="5"/>
    <path class="cm-tick" d="M42 80l10 10 22-24" stroke="var(--green)" stroke-width="7"/>
  </svg>`,

  reconciliation: `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path class="cm-lane" d="M18 26c34 0 34 34 44 34" stroke="var(--teal)"/>
    <path class="cm-lane cm-lane2" d="M18 94c34 0 34-34 44-34" stroke="var(--pink)"/>
    <ellipse cx="86" cy="60" rx="16" ry="7" fill="var(--black)" stroke="currentColor"/>
  </svg>`,

  rollout: `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path class="cm-route" d="M22 100c0-30 30-22 30-44S78 22 98 30" stroke="var(--teal)"/>
    <circle cx="22" cy="100" r="7" fill="var(--white)"/>
    <path class="cm-pin" d="M98 30V8" stroke="currentColor"/>
    <path class="cm-pin" d="M98 8h18l-6 8 6 8H98z" fill="var(--pink)" stroke="var(--pink)"/>
  </svg>`,

  "next-action": `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <g class="cm-putter"><path d="M40 12v66"/><path d="M40 78h26" stroke-width="11"/></g>
    <circle class="cm-ball" cx="86" cy="76" r="9" fill="var(--white)"/>
    <path d="M18 98h84" stroke-width="5" stroke-dasharray="2 10"/>
  </svg>`,
};

/* Drops each mark into its section heading and starts its motion the first
   time that section is reached, so nothing loops off screen. */
function renderCourseMarks() {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("running");
      reveal.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10%" });

  Object.entries(courseMarks).forEach(([sectionId, svg]) => {
    const heading = document.querySelector(
      `#${sectionId} .section-heading, #${sectionId} .hero-copy`
    ) || document.querySelector(`#${sectionId} h2`)?.parentElement;
    if (!heading) return;
    const mark = document.createElement("span");
    mark.className = "hole-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = svg;
    heading.prepend(mark);
    reveal.observe(mark);
  });
}


function setupMotionControl() {
  const control = document.querySelector("#motion-toggle");
  const replay = document.querySelector("#replay-intro");
  replay.addEventListener("click", () => window.playPutteryIntro(true));
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    replay.disabled = true;
    replay.title = "Intro motion follows your reduced-motion preference.";
  }
  let paused = false;
  function apply() {
    document.documentElement.classList.toggle("motion-paused", paused || document.hidden);
    control.textContent = paused ? "Resume motion" : "Pause motion";
    control.setAttribute("aria-pressed", String(paused));
  }
  control.addEventListener("click", () => { paused = !paused; apply(); });
  document.addEventListener("visibilitychange", apply);
  const view = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle("motion-offscreen", !entry.isIntersecting)));
  document.querySelectorAll(".hole-mark,.rail-golf-loop").forEach(mark => view.observe(mark));
  apply();
}

document.addEventListener("DOMContentLoaded", () => {
  renderOperationalStatus();
  populatePlatformFilter();
  renderPlatforms();
  renderQuestions();
  updateProgress();
  setMetricView("30d");
  activateSectionNav();
  animateHeadings();
  renderCourseMarks();
  setupMotionControl();

  document.querySelector("#period-select").addEventListener("change", (event) => setMetricView(event.target.value));
  document.querySelector("#platform-filter").addEventListener("change", renderQuestions);
  document.querySelector("#status-filter").addEventListener("change", renderQuestions);
  document.querySelector("#question-search").addEventListener("input", renderQuestions);
  document.querySelector("#export-answers").addEventListener("click", exportAnswers);
  document.querySelector("#reset-view").addEventListener("click", resetView);
});
