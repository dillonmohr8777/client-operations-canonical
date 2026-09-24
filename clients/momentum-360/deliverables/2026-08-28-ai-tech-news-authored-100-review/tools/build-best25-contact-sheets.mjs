import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const report = JSON.parse(await fs.readFile(path.join(root, 'qa-best25-local.json'), 'utf8'));
const screenshotRoot = path.join(root, 'qa', 'best25-local', 'screenshots');
const outputRoot = path.join(root, 'qa', 'best25-local');

if (report.rows.length !== 25 || report.rows.some((row) => !row.pass)) {
  throw new Error('Refusing to build final contact sheets unless the exact 25-site report is fully clean.');
}

async function build(kind, cellWidth, cellHeight) {
  const inputs = report.rows.map((row) => path.join(screenshotRoot, kind, `${row.slug}.jpg`));
  await Promise.all(inputs.map((input) => fs.access(input)));

  const filters = inputs.map((_, index) =>
    `[${index}:v]scale=${cellWidth}:${cellHeight}:force_original_aspect_ratio=increase,crop=${cellWidth}:${cellHeight},setsar=1[v${index}]`
  );
  const layout = inputs.map((_, index) => `${(index % 5) * cellWidth}_${Math.floor(index / 5) * cellHeight}`).join('|');
  filters.push(`${inputs.map((_, index) => `[v${index}]`).join('')}xstack=inputs=${inputs.length}:layout=${layout}:fill=black[out]`);

  const output = path.join(outputRoot, `${kind}-contact-sheet.jpg`);
  const args = [
    '-hide_banner', '-loglevel', 'error', '-y',
    ...inputs.flatMap((input) => ['-i', input]),
    '-filter_complex', filters.join(';'),
    '-map', '[out]', '-frames:v', '1', '-q:v', '3', output
  ];
  const run = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (run.status !== 0) throw new Error(run.stderr || `ffmpeg exited ${run.status}`);
  console.log(output);
}

await fs.mkdir(outputRoot, { recursive: true });
await build('desktop', 320, 200);
await build('mobile', 180, 320);
