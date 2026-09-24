const COMPOSIO_MCP_ENDPOINT = "https://connect.composio.dev/mcp";
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const EXPECTED_EVENT = {
  summary: "Build a Business That Grows Without You",
  start: "2026-08-06T16:00:00.000Z",
  end: "2026-08-06T17:00:00.000Z",
};

export default {
  async formSubmitted(event) {
    await processRegistration(event.data || {});
  },
};

export async function processRegistration(data) {
  if (
    data["form-name"] !== "workshop-registration" ||
    data.registration_status !== "registered" ||
    data.calendar_consent !== "on"
  ) {
    return { status: "ignored" };
  }

  const attendee = normalizeEmail(data.email);
  if (!attendee) {
    throw new Error("Verified workshop registration is missing a valid email.");
  }

  const config = getCalendarConfig();
  const mcp = await createComposioSession(config.composioKey);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const existing = await executeGoogleCalendarTool(
      mcp,
      config,
      "GOOGLECALENDAR_EVENTS_GET",
      {
        calendar_id: config.calendarId,
        event_id: config.eventId,
        time_zone: "America/New_York",
      },
      "VERIFYING_EVENT",
    );
    assertExpectedEvent(existing, config.organizerEmail);

    const attendeeEmails = uniqueEmails(
      (existing.attendees || []).map(({ email }) => email),
    );
    if (attendeeEmails.includes(attendee)) {
      return { status: "already_invited" };
    }

    await executeGoogleCalendarTool(
      mcp,
      config,
      "GOOGLECALENDAR_PATCH_EVENT",
      {
        calendar_id: config.calendarId,
        event_id: config.eventId,
        attendees: [...attendeeEmails, attendee],
        send_updates: "all",
        guests_can_invite_others: false,
        guests_can_modify: false,
        guests_can_see_other_guests: false,
      },
      "SENDING_INVITATION",
    );

    const verified = await executeGoogleCalendarTool(
      mcp,
      config,
      "GOOGLECALENDAR_EVENTS_GET",
      {
        calendar_id: config.calendarId,
        event_id: config.eventId,
        time_zone: "America/New_York",
      },
      "VERIFYING_INVITATION",
    );
    assertExpectedEvent(verified, config.organizerEmail);
    if (
      uniqueEmails((verified.attendees || []).map(({ email }) => email)).includes(
        attendee,
      )
    ) {
      return { status: "invited" };
    }
    if (attempt === 2) {
      throw new Error("Calendar invitation could not be verified.");
    }
  }
}

function getCalendarConfig() {
  const required = [
    "COMPOSIO_KEY",
    "COMPOSIO_GOOGLECALENDAR_ACCOUNT_ID",
    "GOOGLE_CALENDAR_ID",
    "GOOGLE_CALENDAR_EVENT_ID",
    "GOOGLE_CALENDAR_ORGANIZER_EMAIL",
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(
      `Calendar delivery is not configured: ${missing.join(", ")}.`,
    );
  }
  const organizerEmail = normalizeEmail(
    process.env.GOOGLE_CALENDAR_ORGANIZER_EMAIL,
  );
  if (!organizerEmail) {
    throw new Error("Configured calendar organizer email is invalid.");
  }
  return {
    composioKey: process.env.COMPOSIO_KEY,
    composioAccountId: process.env.COMPOSIO_GOOGLECALENDAR_ACCOUNT_ID,
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId: process.env.GOOGLE_CALENDAR_EVENT_ID,
    organizerEmail,
  };
}

async function createComposioSession(apiKey) {
  const initialized = await mcpRequest(apiKey, null, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "momentum-workshop-calendar",
        version: "1",
      },
    },
  });
  if (!initialized.sessionId) {
    throw new Error("Composio did not establish an MCP session.");
  }
  await mcpRequest(apiKey, initialized.sessionId, {
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {},
  });
  return {
    apiKey,
    sessionId: initialized.sessionId,
  };
}

async function executeGoogleCalendarTool(
  mcp,
  config,
  toolSlug,
  args,
  currentStep,
) {
  const response = await mcpRequest(mcp.apiKey, mcp.sessionId, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "COMPOSIO_MULTI_EXECUTE_TOOL",
      arguments: {
        tools: [
          {
            tool_slug: toolSlug,
            arguments: args,
            account: config.composioAccountId,
          },
        ],
        thought:
          "Process one explicitly consenting Momentum workshop registrant.",
        sync_response_to_workbench: false,
        current_step: currentStep,
        current_step_metric: "1/1 registration",
      },
    },
  });

  const text = (response.payload?.result?.content || []).find(
    ({ type }) => type === "text",
  )?.text;
  if (!text) {
    throw new Error("Composio returned no Google Calendar result.");
  }
  let envelope;
  try {
    envelope = JSON.parse(text);
  } catch {
    throw new Error("Composio returned an invalid Google Calendar result.");
  }
  const result = envelope?.data?.results?.[0];
  if (
    envelope?.successful !== true ||
    result?.response?.successful !== true ||
    result?.tool_slug !== toolSlug
  ) {
    throw new Error("Composio Google Calendar action failed.");
  }
  return result.response.data || {};
}

async function mcpRequest(apiKey, sessionId, payload) {
  const response = await fetchWithRetry(COMPOSIO_MCP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "X-CONSUMER-API-KEY": apiKey,
      ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Composio MCP request failed with ${response.status}.`);
  }

  const body = await response.text();
  let parsed = {};
  for (const line of body.split(/\r?\n/)) {
    if (line.startsWith("data:")) {
      parsed = JSON.parse(line.slice(5).trim());
      break;
    }
  }
  if (!Object.keys(parsed).length && body.trim()) {
    parsed = JSON.parse(body);
  }
  if (parsed.error) {
    throw new Error("Composio MCP returned an error.");
  }
  return {
    payload: parsed,
    sessionId:
      response.headers.get("mcp-session-id") ||
      response.headers.get("Mcp-Session-Id") ||
      sessionId,
  };
}

function assertExpectedEvent(event, organizerEmail) {
  if (!event?.id) {
    throw new Error("Configured workshop event does not exist.");
  }
  if (event.status === "cancelled") {
    throw new Error("Configured workshop event is cancelled.");
  }
  const actualOrganizer = normalizeEmail(
    event.organizer?.email || event.creator?.email,
  );
  if (actualOrganizer !== organizerEmail) {
    throw new Error("Configured workshop organizer does not match the event.");
  }
  const actualStart = normalizeInstant(event.start?.dateTime);
  const actualEnd = normalizeInstant(event.end?.dateTime);
  if (
    event.summary !== EXPECTED_EVENT.summary ||
    actualStart !== EXPECTED_EVENT.start ||
    actualEnd !== EXPECTED_EVENT.end
  ) {
    throw new Error("Configured Google Calendar event does not match the workshop.");
  }
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function uniqueEmails(values) {
  return [
    ...new Set(values.map(normalizeEmail).filter(Boolean)),
  ];
}

function normalizeInstant(value) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15_000),
      });
      if (!TRANSIENT_STATUSES.has(response.status) || attempt === 3) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === 3) {
        throw new Error("Calendar request failed after transient retries.", {
          cause: error,
        });
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }
  throw lastError || new Error("Calendar request failed.");
}
