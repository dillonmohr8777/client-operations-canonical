import assert from "node:assert/strict";
import test from "node:test";
import { hashPayload, summarizeReservation } from "../src/tock.mjs";

test("normalizes safe reservation facts without persisting guest or click values", () => {
  const payload = {
    id: 413,
    business: { id: 707, businessGroupId: 12, currencyCode: "USD" },
    versionId: 1556639480793,
    createdTimestamp: 1556639480000,
    lastUpdatedTimestamp: 1556639480000,
    totalPriceCents: 12260,
    netAmountPaidCents: 12260,
    amountDueCents: 0,
    serviceDateTimestamp: 1556639480000,
    sequenceId: 3,
    confirmationCode: "ABCDEFGH",
    isCancelled: false,
    payment: [{ id: 11, amount: 12260, processorId: "do-not-store" }],
    refund: [
      { id: 21, amount: 500, status: "COMPLETE" },
      { id: 22, amount: 300, status: "DEFERRED" },
      { id: 23, amount: 200, status: "ERROR" }
    ],
    ownerPatron: { email: "private@example.com", phone: "5551234567" },
    keyValue: [
      { attribute: "gclid", attributeValue: "secret-google-click" },
      { name: "utm_source", stringValue: "meta" },
      { label: "fbp", value: "secret-meta-browser" },
      { label: "Private custom field private@example.com", value: "sensitive-answer" }
    ]
  };
  const raw = Buffer.from(JSON.stringify(payload));
  const summary = summarizeReservation(payload, hashPayload(raw));
  const serialized = JSON.stringify(summary);

  assert.equal(summary.reservationId, "413");
  assert.equal(summary.businessId, "707");
  assert.equal(summary.versionId, "1556639480793");
  assert.equal(summary.sequenceId, 3);
  assert.equal(summary.serviceStartAt, "2019-04-30T15:51:20.000Z");
  assert.equal(summary.confirmationCodePresent, true);
  assert.equal(summary.signalsPresent.gclid, true);
  assert.equal(summary.signalsPresent.fbp, true);
  assert.deepEqual(summary.keyValueNames, ["fbp", "gclid", "utm_source"]);
  assert.equal(summary.unknownKeyCount, 1);
  assert.equal(summary.amounts.netAmountPaidCents, 12260);
  assert.equal(summary.amounts.paymentAmountCents, 12260);
  assert.equal(summary.amounts.completedRefundCents, 500);
  assert.equal(summary.refunds.completeCount, 1);
  assert.equal(summary.refunds.deferredCount, 1);
  assert.equal(summary.refunds.errorCount, 1);
  assert.equal(serialized.includes("private@example.com"), false);
  assert.equal(serialized.includes("secret-google-click"), false);
  assert.equal(serialized.includes("secret-meta-browser"), false);
  assert.equal(serialized.includes("Private custom field"), false);
  assert.equal(serialized.includes("sensitive-answer"), false);
  assert.equal(serialized.includes("do-not-store"), false);
  assert.equal(serialized.includes("ABCDEFGH"), false);
});

test("requires reservation id, business id, and version id", () => {
  assert.throws(() => summarizeReservation({}, "a".repeat(64)), /missing a valid uint64 id/);
  assert.throws(() => summarizeReservation({ id: 1 }, "a".repeat(64)), /business\.id/);
  assert.throws(() => summarizeReservation({ id: 1, business: { id: 2 } }, "a".repeat(64)), /versionId/);
  assert.throws(() => summarizeReservation({ id: 1, business: { id: 2 }, versionId: "" }, "a".repeat(64)), /versionId/);
});

test("supports string uint64 identities and canonical payload hashing", () => {
  const max = "18446744073709551615";
  const summary = summarizeReservation({ id: max, business: { id: max }, versionId: max }, "a".repeat(64));
  assert.equal(summary.reservationId, max);
  assert.equal(summary.businessId, max);
  assert.equal(summary.versionId, max);
  assert.throws(() => summarizeReservation({ id: Number.MAX_SAFE_INTEGER + 1, business: { id: 2 }, versionId: 3 }, "a".repeat(64)), /valid uint64 id/);

  const first = Buffer.from('{"id":413,"business":{"id":707},"versionId":10}');
  const reordered = Buffer.from('{ "versionId": 10, "business": { "id": 707 }, "id": 413 }');
  assert.equal(hashPayload(first), hashPayload(reordered));
});
