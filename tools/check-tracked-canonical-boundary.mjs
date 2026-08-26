#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const policy = JSON.parse(readFileSync(join(root, 'canonical/content-policy.json'), 'utf8'));
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const failures = [];
for (const path of tracked) {
  const forbiddenBinary = policy.forbiddenTrackedExtensions.includes(extname(path).toLowerCase());
  const canonicalPlane = path.startsWith('content/canonical/') || path.startsWith('canonical/');
  const canonicalCapture = path.startsWith('shots/canonical-');
  if (forbiddenBinary && (canonicalPlane || canonicalCapture)) failures.push(`${path}: canonical/private presentation capture bytes forbidden in Git; retain only a hash manifest`);
  if (path.startsWith('shots/objective-') && forbiddenBinary) failures.push(`${path}: browser objective evidence must remain outside Git`);
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
const trackedCaptures = tracked.filter((path) => path.startsWith('shots/') && policy.forbiddenTrackedExtensions.includes(extname(path).toLowerCase()));
console.log(`tracked canonical boundary: ${trackedCaptures.length} tracked captures audited; canonical/private presentation bytes absent; species metadata classified`);
