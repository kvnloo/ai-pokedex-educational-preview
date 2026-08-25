#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const runs = Number(process.env.TWILIGHT_REPEAT_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 3) throw new Error('TWILIGHT_REPEAT_RUNS must be an integer >= 3');
const evidenceRoot = process.env.TWILIGHT_EVIDENCE_ROOT ?? '/mnt/zer0models/pokemon-iac/evidence/m2-repair-complete-loop';
const url = process.env.TWILIGHT_URL ?? 'http://127.0.0.1:5192/?verify=1&preset=medium';
for (let run = 1; run <= runs; run += 1) {
  console.log(`\n=== headed complete-loop clean run ${run}/${runs} ===`);
  execFileSync(process.execPath, [
    join(ROOT, 'tools', 'browser-complete-loop.mjs'),
    '--headed', '--require-production', '--url', url,
    '--out', `${evidenceRoot}-${run}`,
  ], { cwd: ROOT, stdio: 'inherit', env: process.env });
}
console.log(`\nrepeated headed complete-loop gate: ${runs}/${runs} clean runs passed`);
