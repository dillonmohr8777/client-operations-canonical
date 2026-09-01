// Runs the real scripts/Drain-TockRelay.ps1 against a loopback fake that plays both the
// relay and the receiver. Windows only (Windows PowerShell 5.1); skipped elsewhere.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../scripts/Drain-TockRelay.ps1', import.meta.url));
const DRAIN_TOKEN = 'drain-token-test-value-0123456789abcdef';
const RECEIVER_AUTH = 'receiver-auth-test-value-0123456789abcdef';

const key = (id) => `${id}/${String(id).padStart(16, '0')}`;
const event = (id) => ({
  key: key(id), reservationId: String(id), receivedAt: `2026-09-01T20:0${id}:00Z`,
  body: JSON.stringify({ id, business: { id: 37824 }, versionId: 1 }),
});

function readBody(req) {
  return new Promise((resolve) => { let s = ''; req.on('data', (c) => { s += c; }); req.on('end', () => resolve(s)); });
}

/** Events 1 and 3 succeed, 2 is malformed (422), 4 hits a store failure (500), 5 must never be delivered. */
function fake() {
  const calls = { acks: [], delivered: [] };
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const json = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (url.pathname.startsWith('/tock/')) {
      if (req.headers.authorization !== `Bearer ${DRAIN_TOKEN}`) return json(401, { error: 'unauthorized' });
      if (url.pathname === '/tock/health') return json(200, { ok: true, pending: 5, acked: 0, venue: '37824' });
      if (url.pathname === '/tock/drain') return json(200, { events: [1, 2, 3, 4, 5].map(event), pending: 5 });
      if (url.pathname === '/tock/drain/ack') { const { keys } = JSON.parse(await readBody(req)); calls.acks.push(keys); return json(200, { acked: keys, missing: [] }); }
    }
    if (url.pathname === '/webhooks/tock/reservations') {
      if (req.headers.putterywebhookauth !== RECEIVER_AUTH) { res.writeHead(401); return res.end(); }
      const { id } = JSON.parse(await readBody(req));
      calls.delivered.push(id);
      const outcome = id === 2 ? [422, 'invalid_payload'] : id === 4 ? [500, 'store_failure'] : [204, 'inserted'];
      res.writeHead(outcome[0], { 'x-tock-receiver-outcome': outcome[1] });
      return res.end();
    }
    res.writeHead(404); res.end();
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, calls, base: `http://127.0.0.1:${server.address().port}` })));
}

test('drain delivers to the receiver, dead-letters 4xx, stops on 5xx, acks only what the receiver took', { skip: process.platform !== 'win32' }, async () => {
  const { server, calls, base } = await fake();
  const dead = mkdtempSync(join(tmpdir(), 'tock-dead-letter-'));
  try {
    const run = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-RelayBase', base, '-ReceiverBase', base, '-DeadLetterDir', dead], {
      env: { ...process.env, TOCK_RELAY_DRAIN_TOKEN: DRAIN_TOKEN, TOCK_RELAY_RECEIVER_AUTH: RECEIVER_AUTH },
      encoding: 'utf8', timeout: 120_000,
    });
    const summaryLine = run.stdout.split(/\r?\n/).reverse().find((l) => l.trim().startsWith('{'));
    assert.ok(summaryLine, `no summary in stdout:\n${run.stdout}\n${run.stderr}`);
    const summary = JSON.parse(summaryLine);
    assert.deepEqual(calls.delivered, [1, 2, 3, 4], 'stopped at the 5xx, never sent 5');
    assert.deepEqual(calls.acks, [[key(1), key(2), key(3)]], 'acked the two delivered and the dead-lettered one, not the failed one');
    assert.deepEqual(readdirSync(dead), [`2_${String(2).padStart(16, '0')}.json`]);
    assert.equal(summary.delivered, 2);
    assert.equal(summary.deadLettered, 1);
    assert.equal(summary.acked, 3);
    assert.match(summary.stopped, /HTTP 500/);
    assert.equal(run.status, 1, 'a stopped batch exits non-zero so the scheduler sees it');
    assert.equal(run.stdout.includes(DRAIN_TOKEN) || run.stdout.includes(RECEIVER_AUTH) || run.stderr.includes(RECEIVER_AUTH), false, 'secrets never printed');
  } finally {
    server.closeAllConnections(); server.close();
    rmSync(dead, { recursive: true, force: true });
  }
});

test('dry run touches nothing and acks nothing', { skip: process.platform !== 'win32' }, async () => {
  const { server, calls, base } = await fake();
  try {
    const run = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, '-RelayBase', base, '-ReceiverBase', base, '-DryRun'], {
      env: { ...process.env, TOCK_RELAY_DRAIN_TOKEN: DRAIN_TOKEN }, encoding: 'utf8', timeout: 120_000,
    });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(calls.delivered, []);
    assert.deepEqual(calls.acks, []);
    assert.match(run.stdout, /would deliver reservation 1 /);
  } finally {
    server.closeAllConnections(); server.close();
  }
});
