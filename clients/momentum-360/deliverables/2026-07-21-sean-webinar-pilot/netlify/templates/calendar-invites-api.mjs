const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const DEFAULT_EVENT_ID = "6d6f6d656e74756d3230323630383036";
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const EVENT = {
  summary: "Build a Business That Grows Without You",
  description:
    "Live Momentum 360 workshop hosted by Sean and Mac. Bring one active offer and one growth constraint. Workshop access and updates: https://momentum-workshop-pilot.netlify.app/",
  location: "Google Meet - link delivered in the calendar invitation",
  guestsCanInviteOthers: false,
  guestsCanModify: false,
  guestsCanSeeOtherGuests: false,
  start: {
    dateTime: "2026-08-06T12:00:00-04:00",
    timeZone: "America/New_York",
  },
  end: {
    dateTime: "2026-08-06T13:00:00-04:00",
    timeZone: "America/New_York",
  },
  reminders: {
    useDefault: false,
    overrides: [
      { method: "email", minutes: 1440 },
      { method: "popup", minutes: 60 },
    ],
  },
};

export default {
  async formSubmitted(event) {
    const data = event.data || {};
    if (
      data["form-name"] !== "workshop-registration" ||
      data.registration_status !== "registered" ||
      data.calendar_consent !== "on"
    ) {
      return;
    }

    const attendee = normalizeEmail(data.email);
    if (!attendee) {
      throw new Error("Verified workshop registration is missing a valid email.");
    }

    const accessToken = await getGoogleAccessToken();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
    const eventId =
      process.env.GOOGLE_CALENDAR_EVENT_ID || DEFAULT_EVENT_ID;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const existing = await getEvent(accessToken, calendarId, eventId);
      if (!existing) {
        const created = await createEvent(
          accessToken,
          calendarId,
          eventId,
          attendee,
        );
        if (created || attempt === 2) return;
        continue;
      }

      if (
        (existing.attendees || []).some(
          ({ email }) => email?.toLowerCase() === attendee,
        )
      ) {
        return;
      }

      const response = await fetchWithRetry(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "If-Match": existing.etag,
          },
          body: JSON.stringify({
            attendees: [...(existing.attendees || []), { email: attendee }],
            guestsCanInviteOthers: false,
            guestsCanModify: false,
            guestsCanSeeOtherGuests: false,
          }),
        },
      );
      if (response.ok) return;
      if (response.status !== 412 || attempt === 2) {
        throw new Error(`Calendar attendee update failed with ${response.status}.`);
      }
    }
  },
};

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

async function getGoogleAccessToken() {
  const required = [
    "GOOGLE_CALENDAR_CLIENT_ID",
    "GOOGLE_CALENDAR_CLIENT_SECRET",
    "GOOGLE_CALENDAR_REFRESH_TOKEN",
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Calendar OAuth is not configured: ${missing.join(", ")}.`);
  }

  const response = await fetchWithRetry(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) {
    throw new Error(`Calendar OAuth refresh failed with ${response.status}.`);
  }
  const payload = await response.json();
  if (!payload.access_token) {
    throw new Error("Calendar OAuth refresh returned no access token.");
  }
  return payload.access_token;
}

async function getEvent(accessToken, calendarId, eventId) {
  const response = await fetchWithRetry(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Calendar event lookup failed with ${response.status}.`);
  }
  return response.json();
}

async function createEvent(accessToken, calendarId, eventId, attendee) {
  const response = await fetchWithRetry(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all&conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...EVENT,
        id: eventId,
        attendees: [{ email: attendee }],
        conferenceData: {
          createRequest: {
            requestId: `momentum-workshop-${eventId}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );
  if (response.ok) return true;
  if (response.status === 409) return false;
  throw new Error(`Calendar event creation failed with ${response.status}.`);
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10_000),
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
