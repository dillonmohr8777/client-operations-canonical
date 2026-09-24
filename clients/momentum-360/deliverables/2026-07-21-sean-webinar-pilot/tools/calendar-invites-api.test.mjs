import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { createHash, createHmac } from "node:crypto";

import calendarInvites from "../netlify/templates/calendar-invites-api.mjs";
import calendarInvitesWebhook from "../netlify/functions/calendar-invites-webhook.mjs";

const CONFIG_KEYS = [
  "COMPOSIO_KEY",
  "COMPOSIO_GOOGLECALENDAR_ACCOUNT_ID",
  "GOOGLE_CALENDAR_ID",
  "GOOGLE_CALENDAR_EVENT_ID",
  "GOOGLE_CALENDAR_ORGANIZER_EMAIL",
  "MOMENTUM_FORM_WEBHOOK_SECRET",
];
const originalFetch = globalThis.fetch;
let calls;
let currentEvent;
let missingEvent;

beforeEach(() => {
  calls = [];
  missingEvent = false;
  currentEvent = eventFixture();
  for (const key of CONFIG_KEYS) delete process.env[key];
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of CONFIG_KEYS) delete process.env[key];
});

test("ignores records without explicit calendar consent", async () => {
  globalThis.fetch = async (...args) => {
    calls.push(args);
    throw new Error("Network should not be called.");
  };

  await calendarInvites.formSubmitted({
    data: {
      "form-name": "workshop-registration",
      registration_status: "registered",
      calendar_consent: "",
      email: "registrant@example.com",
    },
  });

  assert.equal(calls.length, 0);
});

test("fails closed when the exact organizer configuration is absent", async () => {
  await assert.rejects(
    calendarInvites.formSubmitted(consentedRegistration()),
    /Calendar delivery is not configured/,
  );
});

test("rejects an event owned by a different organizer", async () => {
  configureCalendar();
  currentEvent.organizer.email = "different-organizer@example.com";
  mockComposio();

  await assert.rejects(
    calendarInvites.formSubmitted(consentedRegistration()),
    /organizer does not match/,
  );
  assert.equal(toolCalls("GOOGLECALENDAR_PATCH_EVENT").length, 0);
});

test("rejects a missing configured event instead of creating one", async () => {
  configureCalendar();
  missingEvent = true;
  mockComposio();

  await assert.rejects(
    calendarInvites.formSubmitted(consentedRegistration()),
    /Google Calendar action failed/,
  );
  assert.equal(toolCalls("GOOGLECALENDAR_PATCH_EVENT").length, 0);
});

test("rejects an event with the wrong workshop schedule", async () => {
  configureCalendar();
  currentEvent.start.dateTime = "2026-08-06T13:00:00-04:00";
  mockComposio();

  await assert.rejects(
    calendarInvites.formSubmitted(consentedRegistration()),
    /does not match the workshop/,
  );
  assert.equal(toolCalls("GOOGLECALENDAR_PATCH_EVENT").length, 0);
});

test("does not send a duplicate invitation", async () => {
  configureCalendar();
  currentEvent.attendees = [{ email: "registrant@example.com" }];
  mockComposio();

  await calendarInvites.formSubmitted(consentedRegistration());

  assert.equal(toolCalls("GOOGLECALENDAR_EVENTS_GET").length, 1);
  assert.equal(toolCalls("GOOGLECALENDAR_PATCH_EVENT").length, 0);
});

test("patches only the configured event and verifies the attendee", async () => {
  configureCalendar();
  mockComposio();

  await calendarInvites.formSubmitted(consentedRegistration());

  const patches = toolCalls("GOOGLECALENDAR_PATCH_EVENT");
  assert.equal(patches.length, 1);
  assert.deepEqual(patches[0].arguments, {
    calendar_id: "dillonmohr8777@gmail.com",
    event_id: "verified-event-id",
    attendees: ["registrant@example.com"],
    send_updates: "all",
    guests_can_invite_others: false,
    guests_can_modify: false,
    guests_can_see_other_guests: false,
  });
  assert.equal(patches[0].account, "googlecalendar-approved-account");
  assert.equal(toolCalls("GOOGLECALENDAR_EVENTS_GET").length, 2);
});

test("webhook rejects a request without Netlify's signature", async () => {
  process.env.MOMENTUM_FORM_WEBHOOK_SECRET = "test-webhook-secret";
  const response = await calendarInvitesWebhook(
    new Request("https://example.test/.netlify/functions/calendar-invites-webhook", {
      method: "POST",
      body: JSON.stringify(webhookSubmission()),
    }),
  );

  assert.equal(response.status, 403);
  assert.equal(calls.length, 0);
});

test("webhook ignores a signed submission from a different site", async () => {
  process.env.MOMENTUM_FORM_WEBHOOK_SECRET = "test-webhook-secret";
  const body = JSON.stringify({
    ...webhookSubmission(),
    site_name: "different-site",
  });
  const response = await calendarInvitesWebhook(
    signedWebhookRequest(body, process.env.MOMENTUM_FORM_WEBHOOK_SECRET),
  );

  assert.equal(response.status, 204);
  assert.equal(calls.length, 0);
});

test("webhook processes an exact signed consented submission", async () => {
  configureCalendar();
  process.env.MOMENTUM_FORM_WEBHOOK_SECRET = "test-webhook-secret";
  mockComposio();
  const body = JSON.stringify(webhookSubmission());
  const response = await calendarInvitesWebhook(
    signedWebhookRequest(body, process.env.MOMENTUM_FORM_WEBHOOK_SECRET),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "invited" });
  assert.equal(toolCalls("GOOGLECALENDAR_PATCH_EVENT").length, 1);
});

function consentedRegistration() {
  return {
    data: {
      "form-name": "workshop-registration",
      registration_status: "registered",
      calendar_consent: "on",
      email: "registrant@example.com",
    },
  };
}

function webhookSubmission() {
  return {
    id: "verified-submission-id",
    site_name: "momentum-workshop-pilot",
    form_name: "workshop-registration",
    data: consentedRegistration().data,
  };
}

function signedWebhookRequest(body, secret) {
  const header = encodeBase64Url({ alg: "HS256", typ: "JWT" });
  const payload = encodeBase64Url({
    iss: "netlify",
    sha256: createHash("sha256").update(body).digest("hex"),
  });
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return new Request(
    "https://example.test/.netlify/functions/calendar-invites-webhook",
    {
      method: "POST",
      headers: { "X-Webhook-Signature": `${header}.${payload}.${signature}` },
      body,
    },
  );
}

function encodeBase64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function configureCalendar() {
  process.env.COMPOSIO_KEY = "test-composio-key";
  process.env.COMPOSIO_GOOGLECALENDAR_ACCOUNT_ID =
    "googlecalendar-approved-account";
  process.env.GOOGLE_CALENDAR_ID = "dillonmohr8777@gmail.com";
  process.env.GOOGLE_CALENDAR_EVENT_ID = "verified-event-id";
  process.env.GOOGLE_CALENDAR_ORGANIZER_EMAIL = "dillonmohr8777@gmail.com";
}

function mockComposio() {
  globalThis.fetch = async (url, options = {}) => {
    const payload = JSON.parse(options.body);
    calls.push({ url: String(url), options, payload });
    const headers = { "Mcp-Session-Id": "test-mcp-session" };

    if (payload.method === "initialize") {
      return Response.json(
        { jsonrpc: "2.0", id: 1, result: { protocolVersion: "2024-11-05" } },
        { headers },
      );
    }
    if (payload.method === "notifications/initialized") {
      return new Response("", { status: 202, headers });
    }

    const tool = payload.params.arguments.tools[0];
    if (tool.tool_slug === "GOOGLECALENDAR_EVENTS_GET") {
      return mcpToolResponse(
        tool.tool_slug,
        missingEvent ? null : structuredClone(currentEvent),
        !missingEvent,
        headers,
      );
    }
    if (tool.tool_slug === "GOOGLECALENDAR_PATCH_EVENT") {
      currentEvent.attendees = tool.arguments.attendees.map((email) => ({
        email,
        responseStatus: "needsAction",
      }));
      return mcpToolResponse(
        tool.tool_slug,
        structuredClone(currentEvent),
        true,
        headers,
      );
    }
    throw new Error(`Unexpected tool: ${tool.tool_slug}`);
  };
}

function mcpToolResponse(toolSlug, data, successful, headers) {
  const text = JSON.stringify({
    data: {
      results: [
        {
          response: { successful, data },
          tool_slug: toolSlug,
          index: 0,
        },
      ],
    },
    successful: true,
  });
  return Response.json(
    {
      jsonrpc: "2.0",
      id: 2,
      result: { content: [{ type: "text", text }], isError: false },
    },
    { headers },
  );
}

function eventFixture() {
  return {
    id: "verified-event-id",
    status: "confirmed",
    summary: "Build a Business That Grows Without You",
    organizer: { email: "dillonmohr8777@gmail.com" },
    start: { dateTime: "2026-08-06T12:00:00-04:00" },
    end: { dateTime: "2026-08-06T13:00:00-04:00" },
    attendees: [],
  };
}

function toolCalls(toolSlug) {
  return calls
    .filter(({ payload }) => payload.method === "tools/call")
    .map(({ payload }) => payload.params.arguments.tools[0])
    .filter((tool) => tool.tool_slug === toolSlug);
}
