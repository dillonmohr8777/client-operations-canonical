// GET  /tock/drain?limit=N  — oldest pending events, for the local receiver.
// POST /tock/drain/ack      — { keys: [...] } marks them drained.
// GET  /tock/health          — counts only.
// All three require `Authorization: Bearer <DRAIN_TOKEN>`; the drain token is
// a different secret from the webhook secret so Tock's credential can never
// read events back.
import { getStore } from '@netlify/blobs';
import { DEFAULTS, verifySharedSecret, listPending, ackEvents, counts } from '../../lib/relay-core.mjs';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

export default async (req) => {
  const auth = verifySharedSecret(req.headers, { secret: process.env.DRAIN_TOKEN, headerName: 'authorization' });
  if (!auth.ok) return json({ error: 'unauthorized' }, 401);

  const url = new URL(req.url);
  // A drain must not re-read an acknowledged payload from an edge cache.
  const store = getStore({ name: DEFAULTS.storeName, consistency: 'strong' });

  if (url.pathname.endsWith('/health')) {
    if (req.method !== 'GET') return json({ error: 'GET only' }, 405);
    return json({ ok: true, ...(await counts(store)), venue: process.env.TOCK_BUSINESS_ID || null });
  }

  if (url.pathname.endsWith('/ack')) {
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
    let keys;
    try { ({ keys } = await req.json()); } catch { return json({ error: 'body must be JSON' }, 400); }
    if (!Array.isArray(keys) || keys.length === 0 || keys.length > 500) return json({ error: 'keys must be a non-empty array' }, 400);
    return json(await ackEvents(store, keys));
  }

  if (req.method !== 'GET') return json({ error: 'GET only' }, 405);
  const limit = Number.parseInt(url.searchParams.get('limit') || '', 10);
  const batch = await listPending(store, { limit: Number.isFinite(limit) ? limit : DEFAULTS.drainLimit });
  return json(batch);
};

export const config = { path: ['/tock/drain', '/tock/drain/ack', '/tock/health'] };
