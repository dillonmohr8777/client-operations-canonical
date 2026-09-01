// Pure relay logic. No Netlify imports here so the whole contract is testable
// with node:test and nothing else. The functions under netlify/functions/ are
// thin adapters over these exports.

import { createHash, timingSafeEqual } from 'node:crypto';

export const DEFAULTS = Object.freeze({
  // The header name is ours to choose (Tock treats the static header as optional
  // and registers whatever name we give them). It must match the canonical
  // receiver contract: account-binding.json `authorizationHeaderName`.
  authHeader: 'PutteryWebhookAuth',
  maxBodyBytes: 256 * 1024,
  drainLimit: 100,
  storeName: 'tock-events',
});

export const PENDING = 'pending/';
export const ACKED = 'acked/';

function constantTimeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Shared-secret check. Accepts `Bearer <secret>` or the bare secret in the
 * configured header. Header lookup is case-insensitive (Headers.get already
 * is; plain objects from node:http arrive lowercased). Never echoes the
 * reason to the caller.
 */
export function verifySharedSecret(headers, { secret, headerName = DEFAULTS.authHeader } = {}) {
  if (!secret) return { ok: false, reason: 'relay secret not configured' };
  const raw = typeof headers?.get === 'function'
    ? headers.get(headerName)
    : headers?.[headerName] ?? headers?.[headerName.toLowerCase()];
  if (!raw) return { ok: false, reason: `missing ${headerName} header` };
  const presented = String(raw).replace(/^Bearer\s+/i, '').trim();
  return constantTimeEqual(presented, secret) ? { ok: true } : { ok: false, reason: 'secret mismatch' };
}

export function parseEvent(bodyText, { maxBodyBytes = DEFAULTS.maxBodyBytes } = {}) {
  if (typeof bodyText !== 'string') return { ok: false, status: 400, reason: 'body is not text' };
  if (Buffer.byteLength(bodyText) > maxBodyBytes) return { ok: false, status: 413, reason: 'body too large' };
  if (!bodyText.trim()) return { ok: false, status: 400, reason: 'empty body' };
  try {
    const event = JSON.parse(bodyText);
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      return { ok: false, status: 400, reason: 'body is not a JSON object' };
    }
    return { ok: true, event };
  } catch {
    return { ok: false, status: 400, reason: 'body is not valid JSON' };
  }
}

/** Tock may deliver the reservation bare or wrapped; accept both without guessing further. */
export function extractReservation(event) {
  if (!event || typeof event !== 'object') return null;
  const candidate = event.reservation ?? event.data?.reservation ?? event;
  return candidate && typeof candidate === 'object' ? candidate : null;
}

/** The documented keyValue shape is [{ attribute, attributeValue }]. Tolerate a plain object too. */
export function normalizeKeyValues(kv) {
  if (!kv) return [];
  if (Array.isArray(kv)) {
    return kv
      .filter((x) => x && typeof x === 'object' && x.attribute != null)
      .map((x) => ({ attribute: String(x.attribute), attributeValue: x.attributeValue == null ? '' : String(x.attributeValue) }));
  }
  if (typeof kv === 'object') {
    return Object.entries(kv).map(([attribute, attributeValue]) => ({ attribute, attributeValue: attributeValue == null ? '' : String(attributeValue) }));
  }
  return [];
}

/**
 * Decide whether an event is for the venue this relay serves. Business and
 * group IDs are compared as strings so a numeric or string payload both match.
 * An event for another venue is acknowledged (202) but never stored: Tock
 * should not retry it, and the local receiver should never see it.
 */
export function classifyEvent(event, { businessId, businessGroupId } = {}) {
  const r = extractReservation(event);
  if (!r) return { accept: false, status: 400, reason: 'no reservation object' };
  const id = r.id ?? r.reservationId;
  if (id == null || !/^\d+$/.test(String(id))) return { accept: false, status: 400, reason: 'reservation id missing or not numeric' };

  const bid = r.business?.id ?? r.businessId;
  if (businessId && String(bid ?? '') !== String(businessId)) {
    return { accept: false, status: 202, ignored: true, reason: `business ${bid ?? 'unknown'} is not the configured venue` };
  }
  const gid = r.business?.businessGroupId ?? r.businessGroupId ?? r.business?.group?.id;
  if (businessGroupId && gid != null && String(gid) !== String(businessGroupId)) {
    return { accept: false, status: 202, ignored: true, reason: `business group ${gid} is not the configured group` };
  }

  return {
    accept: true,
    status: 200,
    reservationId: String(id),
    businessId: bid == null ? null : String(bid),
    businessGroupId: gid == null ? null : String(gid),
    isCancelled: Boolean(r.isCancelled),
    partyState: r.partyState ?? null,
    confirmationCode: r.confirmationCode ?? null,
    dateTime: r.dateTime ?? null,
    partySize: r.partySize ?? null,
    metadata: normalizeKeyValues(r.keyValue ?? r.keyValues ?? r.metadata),
  };
}

/**
 * Idempotency key: reservation id plus a digest of the exact body. The same
 * delivery retried by Tock dedupes; a later update to the same reservation
 * (different body) is a new event the receiver must see.
 */
export function eventKey(reservationId, bodyText) {
  const digest = createHash('sha256').update(bodyText).digest('hex').slice(0, 16);
  return `${reservationId}/${digest}`;
}

export function receivedRecord({ key, bodyText, classification, receivedAt = new Date().toISOString(), source = {} }) {
  return {
    schemaVersion: 1,
    key,
    receivedAt,
    reservationId: classification.reservationId,
    businessId: classification.businessId,
    isCancelled: classification.isCancelled,
    partyState: classification.partyState,
    confirmationCode: classification.confirmationCode,
    metadata: classification.metadata,
    source: { userAgent: source.userAgent ?? null, contentType: source.contentType ?? null },
    body: bodyText,
  };
}

// ---------------------------------------------------------------------------
// Store operations. `store` is anything with get(key, {type:'json'}),
// setJSON(key, value), list({prefix}) -> {blobs:[{key}]}, delete(key).
// Netlify Blobs satisfies this; the tests use an in-memory double.
// ---------------------------------------------------------------------------

export async function storeEvent(store, key, record) {
  const pendingKey = PENDING + key;
  const ackedKey = ACKED + key;
  if (await store.get(pendingKey, { type: 'json' })) return { stored: false, duplicate: true, state: 'pending' };
  if (await store.get(ackedKey, { type: 'json' })) return { stored: false, duplicate: true, state: 'acked' };
  await store.setJSON(pendingKey, record);
  return { stored: true, duplicate: false, state: 'pending' };
}

export async function listPending(store, { limit = DEFAULTS.drainLimit } = {}) {
  // ponytail: reads every pending blob to sort by receivedAt (keys are id-ordered, not
  // time-ordered). Fine at a few events per drain; time-prefix the keys if pending grows.
  const { blobs = [] } = await store.list({ prefix: PENDING });
  const records = [];
  for (const blob of blobs) {
    const rec = await store.get(blob.key, { type: 'json' });
    if (rec) records.push(rec);
  }
  records.sort((a, b) => String(a.receivedAt).localeCompare(String(b.receivedAt)) || a.key.localeCompare(b.key));
  return { events: records.slice(0, Math.max(1, Math.min(limit, 500))), pending: records.length };
}

/**
 * Ack keeps only a dedupe marker. The raw Tock body (guest identity, click
 * values) leaves the relay the moment the receiver has it; the marker is
 * enough for a late Tock redelivery to still read as a duplicate.
 */
export function ackMarker(rec, ackedAt) {
  return { schemaVersion: 1, key: rec.key, reservationId: rec.reservationId, receivedAt: rec.receivedAt, ackedAt };
}

export async function ackEvents(store, keys, { ackedAt = new Date().toISOString() } = {}) {
  const acked = [];
  const missing = [];
  for (const key of keys) {
    if (typeof key !== 'string' || !/^\d+\/[0-9a-f]{16}$/.test(key)) { missing.push(key); continue; }
    const rec = await store.get(PENDING + key, { type: 'json' });
    if (!rec) { missing.push(key); continue; }
    await store.setJSON(ACKED + key, ackMarker(rec, ackedAt));
    await store.delete(PENDING + key);
    acked.push(key);
  }
  return { acked, missing };
}

export async function counts(store) {
  const pending = (await store.list({ prefix: PENDING })).blobs?.length ?? 0;
  const acked = (await store.list({ prefix: ACKED })).blobs?.length ?? 0;
  return { pending, acked };
}

/** Test double with the subset of the Netlify Blobs API the relay uses. */
export function memoryStore() {
  const map = new Map();
  return {
    async get(key, opts) {
      if (!map.has(key)) return null;
      const v = map.get(key);
      return opts?.type === 'json' ? JSON.parse(v) : v;
    },
    async setJSON(key, value) { map.set(key, JSON.stringify(value)); },
    async list({ prefix = '' } = {}) { return { blobs: [...map.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async delete(key) { map.delete(key); },
    _size() { return map.size; },
  };
}
