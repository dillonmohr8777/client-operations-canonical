// Runs the real scripts/Drain-TockRelay.ps1 against a loopback fake that plays both the
// relay and the receiver. Windows only (Windows PowerShell 5.1); skipped elsewhere.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../scripts/Drain-TockRelay.ps1', import.meta.url));
const DRAIN_TOKEN = 'drain-token-test-value-0123456789abcdef';
const RECEIVER_AUTH = 'receiver-auth-test-value-0123456789abcdef';

const key = (id) => String(id).padStart(32, '0');
const event = (id) => ({
  key: key(id), receivedAt: `2026-09-01T20:0${id}:00Z`,
  body: JSON.stringify({ id, business: { id: 37824 }, versionId: 1, ownerPatron: { email: `guest${id}@example.test` } }),
});

// spawnSync would block the event loop that serves the fake, so the child runs async.
function run(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', SCRIPT, ...args],
      {
        env: { ...process.env, ...env },
        timeout: 120_000,
        windowsHide: true,
      },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += c; });
    child.stderr.on('data', (c) => { stderr += c; });
    child.on('error', reject);
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

function readBody(req) {
  return new Promise((resolve) => { let s = ''; req.on('data', (c) => { s += c; }); req.on('end', () => resolve(s)); });
}

/** Events 1 and 3 succeed, 2 is malformed (422), 4 hits a store failure (500), 5 must never be delivered. */
function fake({ receiverStatus = null } = {}) {
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
      if (receiverStatus !== null) {
        res.writeHead(receiverStatus, { 'x-tock-receiver-outcome': 'forced_test_status' });
        return res.end();
      }
      const outcome = id === 2 ? [422, 'invalid_payload'] : id === 4 ? [500, 'store_failure'] : [204, 'inserted'];
      res.writeHead(outcome[0], { 'x-tock-receiver-outcome': outcome[1] });
      return res.end();
    }
    res.writeHead(404); res.end();
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, calls, base: `http://127.0.0.1:${server.address().port}` })));
}

test('drain delivers to the receiver, dead-letters permanent payload 4xx, stops on 5xx, and acks only accepted events', { skip: process.platform !== 'win32' }, async () => {
  const { server, calls, base } = await fake();
  const dead = mkdtempSync(join(tmpdir(), 'tock-dead-letter-'));
  try {
    const result = await run(['-RelayBase', base, '-ReceiverBase', base, '-DeadLetterDir', dead], { TOCK_RELAY_DRAIN_TOKEN: DRAIN_TOKEN, TOCK_RELAY_RECEIVER_AUTH: RECEIVER_AUTH });
    const summaryLine = result.stdout.split(/\r?\n/).reverse().find((l) => l.trim().startsWith('{'));
    assert.ok(summaryLine, `no summary in stdout:\n${result.stdout}\n${result.stderr}`);
    const summary = JSON.parse(summaryLine);
    assert.deepEqual(calls.delivered, [1, 2, 3, 4], 'stopped at the 5xx, never sent 5');
    assert.deepEqual(calls.acks, [[key(1), key(2), key(3)]], 'acked the two delivered and the dead-lettered one, not the failed one');
    assert.deepEqual(readdirSync(dead), [`${key(2)}.json`]);
    const deadLetter = JSON.parse(readFileSync(join(dead, `${key(2)}.json`), 'utf8'));
    assert.deepEqual({ ...deadLetter, deadLetteredAt: '<timestamp>' }, {
      schemaVersion: 1,
      key: key(2),
      receivedAt: '2026-09-01T20:02:00Z',
      receiverStatus: 422,
      receiverOutcome: 'invalid_payload',
      deadLetteredAt: '<timestamp>',
    });
    assert.match(deadLetter.deadLetteredAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(JSON.stringify(deadLetter).includes('guest2@example.test'), false, 'dead letter excludes raw guest data');
    assert.equal(Object.hasOwn(deadLetter, 'body'), false, 'dead letter excludes the raw body');
    assert.equal(summary.delivered, 2);
    assert.equal(summary.deadLettered, 1);
    assert.equal(summary.acked, 3);
    assert.match(summary.stopped, /HTTP 500/);
    assert.equal(result.status, 1, 'a stopped batch exits non-zero so the scheduler sees it');
    assert.equal(result.stdout.includes(DRAIN_TOKEN) || result.stdout.includes(RECEIVER_AUTH) || result.stderr.includes(RECEIVER_AUTH), false, 'secrets never printed');
  } finally {
    server.closeAllConnections(); server.close();
    rmSync(dead, { recursive: true, force: true });
  }
});

test('dry run touches nothing and acks nothing', { skip: process.platform !== 'win32' }, async () => {
  const { server, calls, base } = await fake();
  try {
    const result = await run(['-RelayBase', base, '-ReceiverBase', base, '-DryRun'], { TOCK_RELAY_DRAIN_TOKEN: DRAIN_TOKEN });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(calls.delivered, []);
    assert.deepEqual(calls.acks, []);
    assert.match(result.stdout, /would deliver event received /);
  } finally {
    server.closeAllConnections(); server.close();
  }
});

test('receiver auth errors stop unacked and are never dead-lettered', { skip: process.platform !== 'win32' }, async () => {
  const { server, calls, base } = await fake({ receiverStatus: 401 });
  const dead = mkdtempSync(join(tmpdir(), 'tock-dead-letter-'));
  try {
    const result = await run(['-RelayBase', base, '-ReceiverBase', base, '-DeadLetterDir', dead], { TOCK_RELAY_DRAIN_TOKEN: DRAIN_TOKEN, TOCK_RELAY_RECEIVER_AUTH: RECEIVER_AUTH });
    const summaryLine = result.stdout.split(/\r?\n/).reverse().find((l) => l.trim().startsWith('{'));
    assert.ok(summaryLine, `no summary in stdout:\n${result.stdout}\n${result.stderr}`);
    const summary = JSON.parse(summaryLine);
    assert.deepEqual(calls.delivered, [1]);
    assert.deepEqual(calls.acks, []);
    assert.deepEqual(readdirSync(dead), []);
    assert.equal(summary.delivered, 0);
    assert.equal(summary.deadLettered, 0);
    assert.equal(summary.acked, 0);
    assert.match(summary.stopped, /HTTP 401/);
    assert.equal(result.status, 1);
  } finally {
    server.closeAllConnections(); server.close();
    rmSync(dead, { recursive: true, force: true });
  }
});
