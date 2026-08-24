#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const policy = JSON.parse(readFileSync(join(root, 'canonical/content-policy.json'), 'utf8'));
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const failures = [];
for (const path of tracked) {
  if (!path.startsWith('content/canonical/')) continue;
  if (policy.forbiddenTrackedExtensions.includes(extname(path).toLowerCase())) failures.push(`${path}: official/presentation bytes forbidden in Git`);
}
const speciesPath = 'content/canonical/species.jsonl';
if (tracked.includes(speciesPath)) {
  const rows = readFileSync(join(root, speciesPath), 'utf8').trim().split('\n').map(JSON.parse);
  for (let index = 0; index < rows.length; index += 1) {
    for (const key of Object.keys(rows[index])) {
      if (!policy.speciesFactualMetadata.allowedFields.includes(key)) failures.push(`${speciesPath}:${index + 1}: unclassified or presentation field ${key}`);
    }
  }
}
if (failures.length) {
  console.error(`tracked canonical boundary FAIL (${failures.length})\n${failures.slice(0, 20).join('\n')}`);
  process.exit(1);
}
console.log('tracked canonical boundary: factual metadata classified; presentation text/art absent from tracked canonical tree');
