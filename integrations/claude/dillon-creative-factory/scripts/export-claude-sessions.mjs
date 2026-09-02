#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, '..', 'session-index');
const claudeProjectsRoot = process.env.CLAUDE_PROJECTS_ROOT || 'C:\\Users\\dillo\\.claude\\projects';
const checkOnly = process.argv.includes('--check');
const strict = process.argv.includes('--strict');

async function findJsonl(root, results = []) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) await findJsonl(full, results);
    else if (entry.isFile() && entry.name.endsWith('.jsonl')) results.push(full);
  }
  return results;
}

function safeProjectKey(file) {
  return path.relative(claudeProjectsRoot, path.dirname(file)).replaceAll('\\', '/');
}

async function summarize(file) {
  const digest = createHash('sha256');
  const counts = {};
  const tools = new Set();
  const branches = new Set();
  let sessionId = path.basename(file, '.jsonl');
  let firstTimestamp = null;
  let lastTimestamp = null;
  let cwdDigest = null;
  let malformedLines = 0;
  const input = createReadStream(file);
  input.on('data', (chunk) => digest.update(chunk));
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of lines) {
    try {
      const record = JSON.parse(line);
      const type = String(record.type || 'unknown');
      counts[type] = (counts[type] || 0) + 1;
      if (record.sessionId) sessionId = String(record.sessionId);
      if (record.timestamp) {
        const time = new Date(record.timestamp).toISOString();
        if (!firstTimestamp || time < firstTimestamp) firstTimestamp = time;
        if (!lastTimestamp || time > lastTimestamp) lastTimestamp = time;
      }
      if (record.cwd && !cwdDigest) cwdDigest = createHash('sha256').update(String(record.cwd).toLowerCase()).digest('hex').slice(0, 16);
      if (record.gitBranch) branches.add(String(record.gitBranch).slice(0, 160));
      const blocks = Array.isArray(record.message?.content) ? record.message.content : [];
      for (const block of blocks) if (block?.type === 'tool_use' && block.name) tools.add(String(block.name));
    } catch { malformedLines += 1; }
  }
  const info = await stat(file);
  const projectKey = safeProjectKey(file);
  const sourceRelative = path.relative(claudeProjectsRoot, file).replaceAll('\\', '/');
  return {
    entryId: createHash('sha256').update(sourceRelative).digest('hex').slice(0, 24),
    sessionId,
    projectKey,
    sourceLocatorDigest: createHash('sha256').update(sourceRelative).digest('hex'),
    sourceCreatedAt: info.birthtime.toISOString(),
    firstTimestamp,
    lastTimestamp,
    sizeBytes: info.size,
    recordCounts: counts,
    toolNames: [...tools].sort(),
    gitBranches: [...branches].sort(),
    cwdDigest,
    sourceSha256: digest.digest('hex'),
    malformedLines,
    sourceContentStored: false
  };
}

const files = (await findJsonl(claudeProjectsRoot)).sort();
const sessions = [];
for (let index = 0; index < files.length; index += 1) {
  sessions.push(await summarize(files[index]));
  if ((index + 1) % 100 === 0) console.error(`Indexed ${index + 1}/${files.length} Claude sessions`);
}
const index = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  privacy: 'metadata-only-redacted',
  sourceRootStored: false,
  sourceContentStored: false,
  sessionCount: sessions.length,
  sessions
};
const output = path.join(outputDir, 'claude-sessions.json');
if (checkOnly) {
  const existing = JSON.parse(await readFile(output, 'utf8'));
  if (existing.privacy !== 'metadata-only-redacted' || existing.sourceContentStored !== false) throw new Error('Session index privacy contract is invalid');
  if (existing.sessionCount !== existing.sessions?.length) throw new Error('Session index count does not match its entries');
  if (new Set(existing.sessions.map((session) => session.entryId)).size !== existing.sessionCount) throw new Error('Session index contains duplicate project/session entries');
  const snapshotCutoff = new Date(existing.generatedAt).toISOString();
  const expectedAtSnapshot = index.sessions.filter((session) => session.sourceCreatedAt <= snapshotCutoff).length;
  if (strict && existing.sessionCount !== expectedAtSnapshot) throw new Error(`Session index is stale at its snapshot cutoff: expected ${expectedAtSnapshot}, found ${existing.sessionCount}`);
  const drift = index.sessionCount - existing.sessionCount;
  console.error(strict ? `Session snapshot complete at ${snapshotCutoff}: ${existing.sessionCount} sessions` : `Session index valid: ${existing.sessionCount} sessions${drift > 0 ? `; ${drift} newer session(s) available for the next refresh` : ''}`);
} else {
  await mkdir(outputDir, { recursive: true });
  await writeFile(output, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.error(`Wrote metadata-only index for ${sessions.length} Claude sessions`);
}
