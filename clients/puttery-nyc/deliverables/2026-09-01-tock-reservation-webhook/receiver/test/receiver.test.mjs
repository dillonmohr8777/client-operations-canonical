import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { createReceiver, validateReceiverConfig } from "../src/receiver.mjs";
import { ReservationStore } from "../src/store.mjs";

const silentLogger = { info() {}, error() {} };
const TEST_SECRET = "test-only-secret-value-0123456789abcdef";

async function withServer(run, { maxBodyBytes = 1_048_576, logger = silentLogger } = {}) {
  const store = new ReservationStore(":memory:");
  const handler = createReceiver({
    allowedBusinessId: "707",
    authHeaderName: "x-tock-webhook-token",
    authHeaderValue: TEST_SECRET,
    maxBodyBytes,
    store,
    logger
  });
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    await run({ baseUrl: `http://127.0.0.1:${address.port}`, store });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  }
}

function reservation({ businessId = 707, versionId = 10 } = {}) {
  return { id: 413, business: { id: businessId, currencyCode: "USD" }, versionId, totalPriceCents: 1000, netAmountPaidCents: 1000, keyValue: [] };
}

async function post(baseUrl, payload, token = TEST_SECRET) {
  return fetch(`${baseUrl}/webhooks/tock/reservations`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-tock-webhook-token": token },
    body: JSON.stringify(payload)
  });
}

test("rejects an invalid authorization header", async () => {
  await withServer(async ({ baseUrl }) => {
    const response = await post(baseUrl, reservation(), "wrong");
    assert.equal(response.status, 401);
  });
});

test("rejects placeholder and weak production configuration", () => {
  assert.throws(() => validateReceiverConfig({
    allowedBusinessId: "replace_after_tom_access",
    authHeaderName: "x-tock-webhook-token",
    authHeaderValue: "load_from_secret_manager",
    maxBodyBytes: 1024
  }), /business ID/);
  assert.throws(() => validateReceiverConfig({
    allowedBusinessId: "707",
    authHeaderName: "x-tock-webhook-token",
    authHeaderValue: "too-short",
    maxBodyBytes: 1024
  }), /at least 32/);
});

test("reports health without exposing receiver state", async () => {
  await withServer(async ({ baseUrl }) => {
    const response = await fetch(`${baseUrl}/healthz`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { outcome: "healthy" });
  });
});

test("rejects unsupported media types and malformed JSON", async () => {
  await withServer(async ({ baseUrl }) => {
    const wrongType = await fetch(`${baseUrl}/webhooks/tock/reservations`, {
      method: "POST",
      headers: { "content-type": "text/plain", "x-tock-webhook-token": TEST_SECRET },
      body: "{}"
    });
    assert.equal(wrongType.status, 415);

    const malformed = await fetch(`${baseUrl}/webhooks/tock/reservations`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-tock-webhook-token": TEST_SECRET },
      body: "{"
    });
    assert.equal(malformed.status, 400);
  });
});

test("enforces the configured request-body limit", async () => {
  await withServer(async ({ baseUrl }) => {
    const response = await post(baseUrl, { ...reservation(), padding: "x".repeat(256) });
    assert.equal(response.status, 413);
  }, { maxBodyBytes: 64 });
});

test("filters non-target business-group events without retrying", async () => {
  await withServer(async ({ baseUrl, store }) => {
    const response = await post(baseUrl, reservation({ businessId: 999 }));
    assert.equal(response.status, 204);
    assert.equal(store.stats().stateCount, 0);
    assert.equal(store.stats().outcomes.filtered_non_target, 1);
    const filteredColumns = store.db.prepare("PRAGMA table_info(filtered_deliveries)").all().map((column) => column.name);
    assert.deepEqual(filteredColumns, ["id", "received_at", "outcome"]);
  });
});

test("persists one state across duplicate and newer deliveries", async () => {
  await withServer(async ({ baseUrl, store }) => {
    assert.equal((await post(baseUrl, reservation({ versionId: 10 }))).status, 204);
    assert.equal((await post(baseUrl, reservation({ versionId: 10 }))).status, 204);
    assert.equal((await post(baseUrl, reservation({ versionId: 11 }))).status, 204);
    assert.equal(store.stats().stateCount, 1);
    assert.deepEqual(store.stats().outcomes, { duplicate: 1, inserted: 1, updated: 1 });
  });
});

test("stores only a safe summary for a target reservation", async () => {
  const messages = [];
  const logger = { info(message) { messages.push(JSON.parse(message)); }, error() {} };
  await withServer(async ({ baseUrl, store }) => {
    const payload = {
      ...reservation(),
      ownerPatron: { email: "private@example.com", phone: "5551234567" },
      keyValue: [{ key: "gclid", value: "raw-click-secret" }]
    };
    assert.equal((await post(baseUrl, payload)).status, 204);
    const stored = store.getState("707", "413").safe_summary_json;
    assert.equal(stored.includes("private@example.com"), false);
    assert.equal(stored.includes("5551234567"), false);
    assert.equal(stored.includes("raw-click-secret"), false);
    assert.equal(JSON.parse(stored).signalsPresent.gclid, true);
    assert.equal(messages.length, 1);
    assert.equal(messages[0].reservationHash.length, 16);
    assert.equal(Object.hasOwn(messages[0], "reservationId"), false);
  }, { logger });
});
