// POST /tock/webhook — the public endpoint Tock delivers to.
// Verifies the shared secret, filters to the configured venue, stores the
// event durably in Netlify Blobs, and answers 200 fast. It never forwards to
// the Windows machine; the local receiver pulls from /tock/drain.
import { getStore } from '@netlify/blobs';
import {
  DEFAULTS,
  verifySharedSecret,
  parseEvent,
  classifyEvent,
  eventKey,
  receivedRecord,
  storeEvent,
} from '../../lib/relay-core.mjs';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const auth = verifySharedSecret(req.headers, {
    secret: process.env.TOCK_WEBHOOK_SECRET,
    headerName: process.env.TOCK_WEBHOOK_HEADER || DEFAULTS.authHeader,
  });
  if (!auth.ok) return json({ error: 'unauthorized' }, 401);

  const text = await req.text();
  const parsed = parseEvent(text);
  if (!parsed.ok) return json({ error: parsed.reason }, parsed.status);

  const classification = classifyEvent(parsed.event, {
    businessId: process.env.TOCK_BUSINESS_ID,
    businessGroupId: process.env.TOCK_BUSINESS_GROUP_ID,
  });
  if (!classification.accept) {
    // 202 for another venue: acknowledged so Tock stops retrying, never stored.
    return json({ received: true, stored: false, reason: classification.reason }, classification.status);
  }

  const key = eventKey(classification.reservationId, text);
  const record = receivedRecord({
    key,
    bodyText: text,
    classification,
    source: { userAgent: req.headers.get('user-agent'), contentType: req.headers.get('content-type') },
  });
  // Queue reads must observe acknowledgements and deletes immediately across
  // function instances. Netlify Blobs is eventually consistent by default.
  const store = getStore({ name: DEFAULTS.storeName, consistency: 'strong' });
  const result = await storeEvent(store, key, record);
  return json({ received: true, stored: result.stored, duplicate: result.duplicate, key }, 200);
};

export const config = { path: '/tock/webhook' };
