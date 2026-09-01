// node --test test/*.test.mjs
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DEFAULTS,
  verifySharedSecret,
  parseEvent,
  classifyEvent,
  normalizeKeyValues,
  eventKey,
  receivedRecord,
  storeEvent,
  listPending,
  ackEvents,
  counts,
  memoryStore,
} from '../lib/relay-core.mjs';

const VENUE = { businessId: '37824', businessGroupId: '28086' };

// Synthetic reservation in the documented Tock model shape. No real guest data.
function reservation(overrides = {}) {
  return {
    id: 9001,
    business: { id: 37824, businessGroupId: 28086, name: 'Puttery NYC' },
    dateTime: '19:30',
    partySize: 4,
    isCancelled: false,
    partyState: 'BOOKED',
    confirmationCode: 'TESTCODE',
    keyValue: [
      { attribute: 'utm_source', attributeValue: 'google' },
      { attribute: 'utm_campaign', attributeValue: 'puttery_nyc_test' },
    ],
    ...overrides,
  };
}

const headers = (obj) => new Headers(obj);

describe('shared-secret verification', () => {
  it('uses the header name the canonical receiver contract binds', () => {
    const binding = JSON.parse(readFileSync(new URL('../../account-binding.json', import.meta.url), 'utf8'));
    assert.equal(DEFAULTS.authHeader, binding.tock.deliveryContract.authorizationHeaderName);
  });
  it('accepts Bearer and bare secrets in the venue header, case-insensitively', () => {
    assert.equal(verifySharedSecret(headers({ PutteryWebhookAuth: 's3cret' }), { secret: 's3cret' }).ok, true);
    assert.equal(verifySharedSecret(headers({ putterywebhookauth: 'Bearer s3cret' }), { secret: 's3cret' }).ok, true);
    assert.equal(verifySharedSecret({ putterywebhookauth: 's3cret' }, { secret: 's3cret' }).ok, true, 'node:http style lowercased object');
    assert.equal(verifySharedSecret(headers({ authorization: 'Bearer s3cret' }), { secret: 's3cret', headerName: 'authorization' }).ok, true);
  });
  it('rejects a missing header, the wrong header, a wrong secret, and an unconfigured relay', () => {
    assert.equal(verifySharedSecret(headers({}), { secret: 's3cret' }).ok, false);
    assert.equal(verifySharedSecret(headers({ authorization: 'Bearer s3cret' }), { secret: 's3cret' }).ok, false, 'Authorization is the drain header, not the venue header');
    assert.equal(verifySharedSecret(headers({ PutteryWebhookAuth: 'nope' }), { secret: 's3cret' }).ok, false);
    assert.equal(verifySharedSecret(headers({ PutteryWebhookAuth: 's3cret' }), { secret: '' }).ok, false);
    assert.equal(verifySharedSecret(headers({ PutteryWebhookAuth: 's3cre' }), { secret: 's3cret' }).ok, false, 'length mismatch is a mismatch');
  });
});

describe('body parsing', () => {
  it('parses a JSON object and rejects everything else', () => {
    assert.equal(parseEvent(JSON.stringify(reservation())).ok, true);
    assert.equal(parseEvent('').status, 400);
    assert.equal(parseEvent('[1,2]').status, 400);
    assert.equal(parseEvent('{not json').status, 400);
    assert.equal(parseEvent('x'.repeat(10), { maxBodyBytes: 4 }).status, 413);
  });
});

describe('venue classification', () => {
  it('accepts a bare or wrapped reservation for the configured venue', () => {
    const bare = classifyEvent(reservation(), VENUE);
    assert.equal(bare.accept, true);
    assert.equal(bare.reservationId, '9001');
    assert.equal(bare.businessId, '37824');
    assert.deepEqual(bare.metadata, [
      { attribute: 'utm_source', attributeValue: 'google' },
      { attribute: 'utm_campaign', attributeValue: 'puttery_nyc_test' },
    ]);
    assert.equal(classifyEvent({ reservation: reservation() }, VENUE).accept, true);
    assert.equal(classifyEvent({ data: { reservation: reservation() } }, VENUE).accept, true);
  });
  it('acknowledges but never stores another venue or another group', () => {
    const other = classifyEvent(reservation({ business: { id: 11111, businessGroupId: 28086 } }), VENUE);
    assert.equal(other.accept, false);
    assert.equal(other.status, 202);
    assert.equal(other.ignored, true);
    const otherGroup = classifyEvent(reservation({ business: { id: 37824, businessGroupId: 99999 } }), VENUE);
    assert.equal(otherGroup.status, 202);
  });
  it('compares ids as strings and tolerates a missing group id', () => {
    assert.equal(classifyEvent(reservation({ business: { id: '37824' } }), VENUE).accept, true);
  });
  it('fails closed when the venue configuration is missing or invalid', () => {
    assert.equal(classifyEvent(reservation()).status, 503);
    assert.equal(classifyEvent(reservation(), { businessId: '0' }).status, 503);
    assert.equal(classifyEvent(reservation(), { businessId: '37824', businessGroupId: 'invalid' }).status, 503);
  });
  it('rejects a payload with no numeric reservation id', () => {
    assert.equal(classifyEvent({ business: { id: 37824 } }, VENUE).status, 400);
    assert.equal(classifyEvent(reservation({ id: 'abc' }), VENUE).status, 400);
    assert.equal(classifyEvent(null, VENUE).status, 400);
  });
  it('normalizes keyValue arrays and plain objects, dropping malformed rows', () => {
    assert.deepEqual(normalizeKeyValues({ a: 1, b: null }), [{ attribute: 'a', attributeValue: '1' }, { attribute: 'b', attributeValue: '' }]);
    assert.deepEqual(normalizeKeyValues([{ attribute: 'k', attributeValue: 'v' }, { nope: true }, null]), [{ attribute: 'k', attributeValue: 'v' }]);
    assert.deepEqual(normalizeKeyValues('junk'), []);
  });
});

describe('idempotency and the drain cycle', () => {
  it('dedupes an identical redelivery but stores a changed reservation', async () => {
    const store = memoryStore();
    const body1 = JSON.stringify(reservation());
    const body2 = JSON.stringify(reservation({ isCancelled: true, partyState: 'CANCELLED' }));
    const c1 = classifyEvent(JSON.parse(body1), VENUE);
    const c2 = classifyEvent(JSON.parse(body2), VENUE);
    const k1 = eventKey(c1.reservationId, body1);
    const k2 = eventKey(c2.reservationId, body2);
    assert.notEqual(k1, k2);
    assert.match(k1, /^[0-9a-f]{32}$/);

    const first = await storeEvent(store, k1, receivedRecord({ key: k1, bodyText: body1, classification: c1, receivedAt: '2026-09-01T20:00:00Z' }));
    const again = await storeEvent(store, k1, receivedRecord({ key: k1, bodyText: body1, classification: c1, receivedAt: '2026-09-01T20:00:05Z' }));
    const update = await storeEvent(store, k2, receivedRecord({ key: k2, bodyText: body2, classification: c2, receivedAt: '2026-09-01T20:01:00Z' }));
    assert.deepEqual([first.stored, again.duplicate, update.stored], [true, true, true]);
    assert.deepEqual(await counts(store), { pending: 2, acked: 0 });
  });

  it('drains oldest first, acks move records out of pending, and a duplicate after ack is still a duplicate', async () => {
    const store = memoryStore();
    const bodies = ['2026-09-01T20:03:00Z', '2026-09-01T20:01:00Z', '2026-09-01T20:02:00Z'].map((t, i) => ({
      t, body: JSON.stringify(reservation({ id: 100 + i })),
    }));
    for (const { t, body } of bodies) {
      const c = classifyEvent(JSON.parse(body), VENUE);
      const k = eventKey(c.reservationId, body);
      await storeEvent(store, k, receivedRecord({ key: k, bodyText: body, classification: c, receivedAt: t }));
    }
    const batch = await listPending(store, { limit: 2 });
    assert.equal(batch.pending, 3);
    assert.deepEqual(batch.events.map((e) => e.receivedAt), ['2026-09-01T20:01:00Z', '2026-09-01T20:02:00Z']);

    const missingKey = '0'.repeat(32);
    const ack = await ackEvents(store, [batch.events[0].key, 'not-a-key', missingKey], { ackedAt: '2026-09-01T20:10:00Z' });
    assert.deepEqual(ack.acked, [batch.events[0].key]);
    assert.deepEqual(ack.missing, ['not-a-key', missingKey]);
    assert.deepEqual(await counts(store), { pending: 2, acked: 1 });

    const redelivery = await storeEvent(store, batch.events[0].key, { key: batch.events[0].key });
    assert.deepEqual([redelivery.duplicate, redelivery.state], [true, 'acked']);
    const remaining = await listPending(store);
    assert.equal(remaining.events.some((e) => e.key === batch.events[0].key), false);
  });

  it('an acked marker keeps the dedupe key and nothing about the guest', async () => {
    const store = memoryStore();
    const body = JSON.stringify(reservation({ ownerPatron: { email: 'private@example.com' } }));
    const c = classifyEvent(JSON.parse(body), VENUE);
    const k = eventKey(c.reservationId, body);
    await storeEvent(store, k, receivedRecord({ key: k, bodyText: body, classification: c, receivedAt: '2026-09-01T20:00:00Z' }));
    await ackEvents(store, [k], { ackedAt: '2026-09-01T20:10:00Z' });
    const marker = await store.get('acked/' + k, { type: 'json' });
    assert.deepEqual(marker, { schemaVersion: 2, key: k, receivedAt: '2026-09-01T20:00:00Z', ackedAt: '2026-09-01T20:10:00Z' });
    assert.equal(JSON.stringify(marker).includes('private@example.com'), false);
    assert.equal(JSON.stringify(marker).includes('TESTCODE'), false);
  });

  it('records keep the exact body and transport metadata without duplicating identifiers', () => {
    const body = JSON.stringify(reservation());
    const c = classifyEvent(JSON.parse(body), VENUE);
    const rec = receivedRecord({ key: eventKey(c.reservationId, body), bodyText: body, classification: c, receivedAt: '2026-09-01T20:00:00Z', source: { userAgent: 'test', contentType: 'application/json' } });
    assert.equal(rec.schemaVersion, 2);
    assert.equal(rec.body, body);
    assert.equal(rec.source.userAgent, 'test');
    assert.equal(Object.hasOwn(rec, 'reservationId'), false);
    assert.equal(Object.hasOwn(rec, 'confirmationCode'), false);
    assert.equal(Object.hasOwn(rec, 'metadata'), false);
  });
});
