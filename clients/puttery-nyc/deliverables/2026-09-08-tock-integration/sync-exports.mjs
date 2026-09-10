import { mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { parseSourceJson, buildSnapshot, combinedStatus } from './export-core.mjs';

const root = join(process.env.LOCALAPPDATA, 'Codex/ClientAccess/PutteryNYC');
const receipt = { checkedAt: new Date().toISOString(), businessId: '37824', businessGroupId: '28086',
  status: 'running', guestExportsDownloaded: 0, rawPayloadsPersisted: false, secretsExposed: false };
async function readJson(url, headers = {}) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(90000), redirect: 'error' });
  if (!response.ok) throw Object.assign(new Error('http_failure'), { status: response.status });
  const text = await response.text();
  if (text.length > 150_000_000) throw new Error('export_too_large');
  return parseSourceJson(text);
}
try {
  mkdirSync(root, { recursive: true });
  if (!process.env.TOCK_EXPORT_API_KEY) throw new Error('protected_credential_missing');
  const listing = await readJson('https://api.exploretock.com/api/data/export/urls', {
    'X-Tock-Authorization': process.env.TOCK_EXPORT_API_KEY,
    'X-Tock-Scope': JSON.stringify({ businessId: '37824', businessGroupId: '28086' }),
    'User-Agent': 'Momentum360-PutteryNYC-Attribution/1.0'
  });
  delete process.env.TOCK_EXPORT_API_KEY;
  const urls = listing.result?.reservationDataUrls;
  if (!Array.isArray(urls) || !urls.length || urls.length > 100) throw new Error('invalid_export_listing');
  receipt.apiHttpStatus = 200;
  async function* pages() {
    for (const url of urls) {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !(parsed.hostname === 'storage.googleapis.com'
        || parsed.hostname.endsWith('.storage.googleapis.com'))) throw new Error('unexpected_export_host');
      yield await readJson(url);
    }
  }
  Object.assign(receipt, await buildSnapshot(pages(), join(root, 'tock-export-snapshot.sqlite')));
  receipt.reconciliation = combinedStatus(join(root, 'tock-export-snapshot.sqlite'), join(root, 'tock-events.sqlite'));
  receipt.status = receipt.invalid ? 'synced_with_exclusions' : 'synced';
  receipt.completedAt = new Date().toISOString();
} catch (error) {
  receipt.status = 'failed'; receipt.errorType = error.name;
  receipt.errorCode = ['http_failure','export_too_large','protected_credential_missing','invalid_export_listing',
    'unexpected_export_host','invalid_export_shape','empty_snapshot','snapshot_validation_failed'].includes(error.message) ? error.message : 'operation_failed';
  if (error.status) receipt.httpStatus = error.status;
  process.exitCode = 1;
} finally {
  delete process.env.TOCK_EXPORT_API_KEY;
  if (['synced','synced_with_exclusions'].includes(receipt.status)) {
    const goodPath = join(root, 'tock-export-last-good.json');
    writeFileSync(goodPath + '.tmp', JSON.stringify(receipt, null, 2));
    renameSync(goodPath + '.tmp', goodPath);
  }
  const path = join(root, 'tock-export-latest.json');
  writeFileSync(path + '.tmp', JSON.stringify(receipt, null, 2));
  renameSync(path + '.tmp', path);
  console.log(JSON.stringify(receipt));
}
