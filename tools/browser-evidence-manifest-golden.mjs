#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const manifestPath = join(root, 'shots/canonical-repair-browser/report.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const requirePrivate = process.argv.includes('--require-private');
const shaPattern = /^[0-9a-f]{40}$/;
const failures = [];
const behavioralCommit = 'abfff10779553548119999672a870b3cf7b98ca4';
const behavioralReportHash = '3f655e1f7a31c1d9ef68e81ff14fcc08516d252931056acad855b1d8654058ec';

if (!Array.isArray(manifest.runs) || manifest.runs.length === 0) failures.push('runs must be a non-empty array');
if (manifest.provenance?.sourceCommit !== undefined) failures.push('global provenance.sourceCommit is forbidden; source commits must be attributed per run');

let verifiedFiles = 0;
for (const run of manifest.runs ?? []) {
  const context = `run ${JSON.stringify(run.label)}`;
  if (!shaPattern.test(run.sourceCommit ?? '')) failures.push(`${context}: sourceCommit must be an exact lowercase 40-hex commit`);
  if (!Array.isArray(run.files) || run.files.length === 0) failures.push(`${context}: files must be a non-empty array`);

  const report = run.files?.find((file) => file.name === 'report.json');
  if (run.label === 'behavioral-canonical-repair') {
    if (run.sourceCommit !== behavioralCommit) failures.push(`${context}: must be bound to behavioral commit ${behavioralCommit}`);
    if (run.passed !== 21 || run.failed !== 0) failures.push(`${context}: expected the known 21-pass, 0-fail behavioral run`);
    if (report?.sha256 !== behavioralReportHash) failures.push(`${context}: unexpected behavioral report hash`);
  }

  if (!existsSync(run.externalDirectory)) {
    if (requirePrivate) failures.push(`${context}: private evidence directory is unavailable: ${run.externalDirectory}`);
    continue;
  }
  if ((statSync(run.externalDirectory).mode & 0o777) !== 0o700) failures.push(`${context}: private evidence directory mode must be 0700`);
  for (const file of run.files ?? []) {
    const path = join(run.externalDirectory, file.name);
    if (!existsSync(path)) {
      failures.push(`${context}: missing ${file.name}`);
      continue;
    }
    if ((statSync(path).mode & 0o777) !== 0o600) failures.push(`${context}: ${file.name} mode must be 0600`);
    const actualHash = createHash('sha256').update(readFileSync(path)).digest('hex');
    if (actualHash !== file.sha256) failures.push(`${context}: ${file.name} SHA-256 mismatch`);
    verifiedFiles += 1;
  }
}

if (failures.length) {
  console.error(`browser evidence manifest FAIL (${failures.length})\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`browser evidence manifest: ${manifest.runs.length} per-run source commits valid; behavioral evidence bound to ${behavioralCommit}; ${verifiedFiles} private files hash/mode verified`);
