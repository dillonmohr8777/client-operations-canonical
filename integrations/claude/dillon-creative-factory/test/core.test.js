import assert from 'node:assert/strict';
import test from 'node:test';
import { assertWithin, getApprovalBoard, getClientBrandKit, resolveClient } from '../src/core.js';

test('exact client routing resolves canonical active client', async () => {
  const { client, clientRoot } = await resolveClient('Align HCM');
  assert.equal(client.id, 'align-hcm');
  assert.match(clientRoot, /clients[\\/]align-hcm$/);
});

test('unknown client routing is rejected', async () => {
  await assert.rejects(() => resolveClient('definitely-not-a-client'), /Unknown client/);
});

test('path containment blocks traversal', () => {
  assert.throws(() => assertWithin('C:\\safe', 'C:\\outside', 'test'), /escapes/);
});

test('brand kit never escapes resolved client folder', async () => {
  const kit = await getClientBrandKit({ clientId: 'align-hcm' });
  assert.equal(kit.client.id, 'align-hcm');
  for (const candidate of [...kit.authorityFiles, ...kit.approvedAssetCandidates]) {
    assert.equal(candidate.startsWith('../'), false);
  }
});

test('approval board is read-only and revisioned', async () => {
  const board = await getApprovalBoard();
  assert.equal(Number.isInteger(board.queueRevision), true);
  assert.equal(Array.isArray(board.needsApproval), true);
});
