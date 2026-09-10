import { createHash } from "node:crypto";

const MAX_UINT64 = 18_446_744_073_709_551_615n;
const SIGNAL_KEYS = ["gclid", "gbraid", "wbraid", "fbclid", "fbc", "fbp"];
const ATTRIBUTION_KEYS = new Set([...SIGNAL_KEYS, "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]);

function asUint64String(value) {
  if (value === null || value === undefined || value === "" || (typeof value === "string" && value.trim() === "")) return null;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) return null;
    return String(value);
  }
  const valueText = String(value).trim();
  if (!/^\d+$/.test(valueText)) return null;
  const parsed = BigInt(valueText);
  if (parsed > MAX_UINT64) return null;
  return parsed.toString();
}

function asInteger(value) {
  if (value === null || value === undefined || value === "" || (typeof value === "string" && value.trim() === "")) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function isoFromMillis(value) {
  const valueText = asUint64String(value);
  if (valueText === null) return null;
  const parsed = BigInt(valueText);
  if (parsed > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  const date = new Date(Number(parsed));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizedKey(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function keyValueEntries(payload) {
  const input = Array.isArray(payload?.keyValue) ? payload.keyValue : [];
  return input.map((entry) => {
    if (!entry || typeof entry !== "object") return null;
    const key = entry.key ?? entry.name ?? entry.label ?? entry.keyName ?? entry.attribute;
    if (key === null || key === undefined || String(key).trim() === "") return null;
    return { normalized: normalizedKey(key) };
  }).filter(Boolean);
}

function sourceArray(payload, singular, plural) {
  if (Array.isArray(payload?.[singular])) return payload[singular];
  if (Array.isArray(payload?.[plural])) return payload[plural];
  return [];
}

function safeSum(values) {
  let total = 0;
  for (const value of values) {
    const cents = asInteger(value);
    if (cents === null) return null;
    total += cents;
    if (!Number.isSafeInteger(total)) return null;
  }
  return total;
}

function hashSourceId(value) {
  const id = asUint64String(value);
  return id === null ? null : createHash("sha256").update(id).digest("hex");
}

function paymentSummary(payload) {
  const payments = sourceArray(payload, "payment", "payments");
  const amounts = payments.map((payment) => payment?.amount ?? payment?.amountCents);
  return {
    count: payments.length,
    amountCents: payments.length === 0 ? null : safeSum(amounts),
    referenceHashes: payments.map((payment) => hashSourceId(payment?.id)).filter(Boolean).sort()
  };
}

function refundSummary(payload) {
  const refunds = sourceArray(payload, "refund", "refunds");
  const byStatus = { COMPLETE: [], DEFERRED: [], ERROR: [], UNKNOWN: [] };
  const references = [];

  for (const refund of refunds) {
    const status = String(refund?.status ?? "UNKNOWN").toUpperCase();
    const bucket = Object.hasOwn(byStatus, status) ? status : "UNKNOWN";
    byStatus[bucket].push(refund?.amount ?? refund?.amountCents ?? refund?.refundAmountCents);
    const referenceHash = hashSourceId(refund?.id);
    if (referenceHash) references.push(referenceHash);
  }

  const completeCents = refunds.length === 0 ? null : safeSum(byStatus.COMPLETE);
  return {
    count: refunds.length,
    completeCount: byStatus.COMPLETE.length,
    deferredCount: byStatus.DEFERRED.length,
    errorCount: byStatus.ERROR.length,
    unknownCount: byStatus.UNKNOWN.length,
    completeCents,
    deferredCents: byStatus.DEFERRED.length === 0 ? 0 : safeSum(byStatus.DEFERRED),
    errorCents: byStatus.ERROR.length === 0 ? 0 : safeSum(byStatus.ERROR),
    unknownCents: byStatus.UNKNOWN.length === 0 ? 0 : safeSum(byStatus.UNKNOWN),
    referenceHashes: references.sort()
  };
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  const entries = Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(",")}}`;
}

export function hashPayload(payloadOrRawBody) {
  const payload = Buffer.isBuffer(payloadOrRawBody) || typeof payloadOrRawBody === "string"
    ? JSON.parse(payloadOrRawBody.toString("utf8"))
    : payloadOrRawBody;
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

export function summarizeReservation(payload, payloadHash) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("Reservation payload must be a JSON object.");
  }

  const reservationId = asUint64String(payload.id);
  const businessId = asUint64String(payload.business?.id);
  const versionId = asUint64String(payload.versionId);

  if (!reservationId) throw new TypeError("Reservation payload is missing a valid uint64 id.");
  if (!businessId) throw new TypeError("Reservation payload is missing a valid uint64 business.id.");
  if (!versionId) throw new TypeError("Reservation payload is missing a valid uint64 versionId.");

  const entries = keyValueEntries(payload);
  const normalizedNames = new Set(entries.map((entry) => entry.normalized));
  const keyNames = [...normalizedNames].filter((key) => ATTRIBUTION_KEYS.has(key)).sort();
  const signalsPresent = Object.fromEntries(SIGNAL_KEYS.map((key) => [key, normalizedNames.has(key)]));
  const payments = paymentSummary(payload);
  const refunds = refundSummary(payload);

  return {
    receiverSchemaVersion: 2,
    reservationId,
    businessId,
    businessGroupId: asUint64String(payload.business?.businessGroupId ?? payload.businessGroupId),
    locationId: null,
    versionId,
    sequenceId: asInteger(payload.sequenceId),
    payloadHash,
    currency: String(payload.business?.currencyCode ?? payload.currencyCode ?? "").toUpperCase() || null,
    serviceDateTime: typeof payload.dateTime === "string" ? payload.dateTime : null,
    serviceStartAt: isoFromMillis(payload.serviceDateTimestamp),
    createdAt: isoFromMillis(payload.createdTimestamp),
    updatedAt: isoFromMillis(payload.lastUpdatedTimestamp),
    confirmationCodePresent: typeof payload.confirmationCode === "string" && payload.confirmationCode.length > 0,
    amounts: {
      subtotalCents: asInteger(payload.subtotalCents),
      totalPriceCents: asInteger(payload.totalPriceCents),
      netAmountPaidCents: asInteger(payload.netAmountPaidCents),
      amountDueCents: asInteger(payload.amountDueCents),
      completedRefundCents: refunds.completeCents,
      paymentAmountCents: payments.amountCents
    },
    lifecycle: {
      isCancelled: payload.isCancelled === true,
      transferredOut: payload.transferredOut === true,
      partyState: typeof payload.partyState === "string" ? payload.partyState : null
    },
    keyValueNames: keyNames,
    unknownKeyCount: entries.filter((entry) => !ATTRIBUTION_KEYS.has(entry.normalized)).length,
    signalsPresent,
    payments,
    refunds
  };
}
