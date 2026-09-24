'use strict';

// Synthetic-only proof: dump the existing staging DB, restore to a disposable
// database, compare pipeline counts, then remove only the disposable database.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const assert = require('node:assert/strict');

const root = path.join(require('node:os').homedir(), 'repos/dillon-os');
const app = path.join(root, '_os/radar-engine');
const privateDir = path.join(root, '12_Brain/private/radar-engine/aegis-staging');
const envFile = path.join(privateDir, 'stage-env.json');
const receiptFile = path.join(__dirname, 'stage-restore-receipt.json');
const compose = ['compose', '-p', 'aegis-radar-staging', '-f', path.join(app, 'docker-compose.yml')];
const keyTables = [
  'schema_migrations', 'campaigns', 'prospects', 'intake_submissions', 'jobs',
  'audit_runs', 'reports', 'report_versions', 'events', 'evidence_items',
];

function loadEnvironment() {
  if (!fs.existsSync(envFile)) throw new Error('private staging env is missing');
  const values = JSON.parse(fs.readFileSync(envFile, 'utf8'));
  for (const key of ['RADAR_V2_PG_USER', 'RADAR_V2_PG_PASSWORD', 'RADAR_V2_PG_DATABASE', 'RADAR_V2_PG_VOLUME', 'RADAR_V2_DB_PORT']) {
    assert.equal(typeof values[key], 'string', `missing ${key}`);
  }
  return { ...process.env, ...values };
}

const env = loadEnvironment();
const sourceDatabase = env.RADAR_V2_PG_DATABASE;
const pgUser = env.RADAR_V2_PG_USER;

function docker(args, options = {}) {
  return cp.execFileSync('docker', args, {
    env,
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

function composeCommand(args, options = {}) {
  return docker([...compose, ...args], { encoding: 'utf8', ...options });
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function postgresql(container, database, sql) {
  return docker([
    'exec', '-e', `PGPASSWORD=${env.RADAR_V2_PG_PASSWORD}`, container,
    'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', pgUser, '-d', database,
    '-At', '-c', sql,
  ], { encoding: 'utf8' }).trim();
}

function postgresBinary(container, args, input) {
  return docker([
    'exec', '-i', '-e', `PGPASSWORD=${env.RADAR_V2_PG_PASSWORD}`, container,
    ...args,
  ], { input });
}

function countTables(container, database) {
  return Object.fromEntries(keyTables.map(table => {
    const raw = postgresql(container, database, `SELECT count(*) FROM public.${quoteIdentifier(table)};`);
    assert.match(raw, /^\d+$/, `count for ${table} was not numeric`);
    const count = Number(raw);
    assert.ok(Number.isSafeInteger(count), `count for ${table} exceeded safe integer range`);
    return [table, count];
  }));
}

function writeReceipt(receipt) {
  fs.writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8' });
}

function timestampPart() {
  return new Date().toISOString().replace(/[-:.]/g, '').replace('Z', 'Z');
}

function main() {
  let stage = 'initialization';
  let container;
  let restoreDatabase;
  let backupPath;
  let cleanupAttempted = false;
  let cleanupDropped = false;
  let backupMeta;
  try {
    assert.ok(fs.existsSync(privateDir), 'private staging directory is missing');
    const ignoredPath = path.relative(root, privateDir).replaceAll(path.sep, '/');
    cp.execFileSync('git', ['check-ignore', '-q', `${ignoredPath}/stage-restore-proof-*`], { cwd: root, env, stdio: 'ignore' });

    stage = 'resolve-running-postgres';
    container = composeCommand(['ps', '-q', 'postgres']).trim();
    assert.match(container, /^[0-9a-f]+$/i, 'staging postgres container was not found');
    assert.equal(docker(['inspect', '-f', '{{.State.Running}}', container], { encoding: 'utf8' }).trim(), 'true', 'staging postgres is not running');

    stage = 'capture-source-counts';
    const sourceCounts = countTables(container, sourceDatabase);

    stage = 'dump-source';
    const dump = postgresBinary(container, ['pg_dump', '--format=custom', '--no-owner', '--username', pgUser, '--dbname', sourceDatabase]);
    assert.ok(Buffer.isBuffer(dump) && dump.length > 5, 'pg_dump returned no data');
    assert.equal(dump.subarray(0, 5).toString('ascii'), 'PGDMP', 'pg_dump did not return a custom-format archive');
    backupPath = path.join(privateDir, `stage-restore-proof-${timestampPart()}.dump`);
    fs.writeFileSync(backupPath, dump, { flag: 'wx', mode: 0o600 });
    backupMeta = {
      fileName: path.basename(backupPath),
      format: 'custom',
      bytes: dump.length,
      sha256: crypto.createHash('sha256').update(dump).digest('hex'),
      storedPrivately: true,
    };

    stage = 'create-disposable-database';
    restoreDatabase = `aegis_stage_restore_disposable_${timestampPart()}_${crypto.randomBytes(3).toString('hex')}`.toLowerCase();
    assert.notEqual(restoreDatabase, sourceDatabase, 'restore database must differ from source');
    assert.equal(postgresql(container, 'postgres', `SELECT 1 FROM pg_database WHERE datname = '${restoreDatabase}';`), '', 'disposable database name already exists');
    postgresql(container, 'postgres', `CREATE DATABASE ${quoteIdentifier(restoreDatabase)} OWNER ${quoteIdentifier(pgUser)} TEMPLATE template0;`);

    stage = 'restore-disposable-database';
    postgresBinary(container, ['pg_restore', '--exit-on-error', '--no-owner', '--no-privileges', '--username', pgUser, '--dbname', restoreDatabase], dump);

    stage = 'compare-key-table-counts';
    const restoredCounts = countTables(container, restoreDatabase);
    const countsMatch = keyTables.every(table => sourceCounts[table] === restoredCounts[table]);
    assert.equal(countsMatch, true, 'key table counts differ after restore');

    stage = 'drop-disposable-database';
    cleanupAttempted = true;
    postgresql(container, 'postgres', `DROP DATABASE ${quoteIdentifier(restoreDatabase)};`);
    cleanupDropped = true;

    const receipt = {
      schemaVersion: 1,
      observedAt: new Date().toISOString(),
      pass: true,
      syntheticOnly: true,
      source: {
        composeProject: 'aegis-radar-staging',
        service: 'postgres',
        imageMajor: 16,
        database: sourceDatabase,
        volume: env.RADAR_V2_PG_VOLUME,
        loopback: `127.0.0.1:${env.RADAR_V2_DB_PORT}`,
      },
      backup: backupMeta,
      restore: { database: restoreDatabase, disposable: true, dropped: cleanupDropped },
      keyTableCounts: { tables: keyTables, source: sourceCounts, restored: restoredCounts, equal: countsMatch },
      boundaries: {
        existingDatabaseUntouched: true,
        appRestarted: false,
        providersUsed: false,
        externalDelivery: false,
        secretsIncluded: false,
      },
    };
    writeReceipt(receipt);
    console.log(JSON.stringify(receipt));
  } catch (error) {
    if (restoreDatabase && !cleanupDropped) {
      cleanupAttempted = true;
      try {
        postgresql(container, 'postgres', `DROP DATABASE IF EXISTS ${quoteIdentifier(restoreDatabase)};`);
        cleanupDropped = true;
      } catch { /* Preserve the original sanitized failure; cleanup state is recorded. */ }
    }
    const failure = {
      schemaVersion: 1,
      observedAt: new Date().toISOString(),
      pass: false,
      syntheticOnly: true,
      source: { composeProject: 'aegis-radar-staging', service: 'postgres', database: sourceDatabase, volume: env.RADAR_V2_PG_VOLUME, loopback: `127.0.0.1:${env.RADAR_V2_DB_PORT}` },
      backup: backupMeta || null,
      restore: restoreDatabase ? { database: restoreDatabase, disposable: true, dropped: cleanupDropped } : null,
      cleanupAttempted,
      boundaries: { existingDatabaseUntouched: true, appRestarted: false, providersUsed: false, externalDelivery: false, secretsIncluded: false },
      failure: { stage, errorType: error?.name || 'Error', code: typeof error?.code === 'string' ? error.code : null },
    };
    writeReceipt(failure);
    console.error(JSON.stringify({ pass: false, stage, errorType: failure.failure.errorType, code: failure.failure.code, cleanupDropped }));
    process.exitCode = 1;
  }
}

main();
