'use strict';
/** Shared HTTP helpers for the TTS providers. Kept out of the provider
 *  registry so providers can require it without a circular dependency. */

/** Retry with exponential backoff on 429 and 5xx. */
async function withRetry(fn, opts) {
  const { tries = 4, baseMs = 1500, label = 'request' } = opts || {};
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      const retryable = e.status === 429 || (e.status >= 500 && e.status < 600) ||
        e.code === 'ECONNRESET' || e.name === 'TypeError';
      if (!retryable || i === tries - 1) throw e;
      const wait = baseMs * Math.pow(2, i);
      console.warn(`  ! ${label} failed (${e.status || e.code || e.message}); retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

/** POST returning parsed JSON (or a Buffer when raw). Non-2xx throws with .status. */
async function httpPost(url, opts) {
  const { headers, body, raw = false } = opts || {};
  const res = await fetch(url, { method: 'POST', headers, body });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.text()).slice(0, 400); } catch { /* body already consumed */ }
    const err = new Error(`HTTP ${res.status} ${res.statusText}: ${detail}`);
    err.status = res.status;
    throw err;
  }
  return raw ? Buffer.from(await res.arrayBuffer()) : res.json();
}

module.exports = { withRetry, httpPost };
