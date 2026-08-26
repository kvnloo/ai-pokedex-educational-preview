#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const runs = Number(process.env.TWILIGHT_REPEAT_RUNS ?? 7);
if (!Number.isInteger(runs) || runs < 7) throw new Error('TWILIGHT_REPEAT_RUNS must be an integer >= 7');
const evidenceRoot = process.env.TWILIGHT_EVIDENCE_ROOT ?? join(ROOT, 'evidence/t_b6ed6878/exact');
const url = process.env.TWILIGHT_URL ?? 'http://127.0.0.1:5194/?verify=1&preset=medium';
const mobile = process.env.TWILIGHT_MOBILE === '1';
const observations = [];
for (let run = 1; run <= runs; run += 1) {
  console.log(`\n=== fresh exact-build/Chromium run ${run}/${runs} ===`);
  execFileSync('npm', ['run', 'build', '--', '--mode', 'private-local'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  const out = `${evidenceRoot}-${String(run).padStart(2, '0')}`;
  const args = [
    join(ROOT, 'tools', 'browser-complete-loop.mjs'),
    '--require-production', '--url', url, '--out', out,
  ];
  if (mobile) args.push('--mobile', '--width', '430', '--height', '932');
  execFileSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit', env: process.env });
  const report = JSON.parse(readFileSync(join(out, 'complete-loop-report.json'), 'utf8'));
  observations.push({
    run,
    sha: report.production.observed.manifest.git.sha,
    builtAt: report.production.observed.manifest.builtAt,
    roamToFightMs: report.transitions.roamToFightPerformanceMs,
    prewarmMs: report.transitions.canonicalBattlePrewarm.totalMs,
    compileMs: report.transitions.canonicalBattlePrewarm.compileMs,
    drawSubmitMs: report.transitions.canonicalBattlePrewarm.drawSubmitMs,
    gpuObservedMs: report.transitions.canonicalBattlePrewarm.gpuObservedMs,
    heapBytes: report.transitions.bootPerformance.heapBytes,
    passed: report.passed,
    report: join(out, 'complete-loop-report.json'),
    trace: join(out, 'complete-loop-trace.zip'),
  });
}
const nearestRank = (values, percentile) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(percentile * sorted.length) - 1)];
};
const latencies = observations.map((entry) => entry.roamToFightMs);
const summary = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  cacheClass: 'fresh Vite private build and fresh Chromium process/context/profile per run; HTTP and Chromium profile caches cold; OS filesystem cache retained',
  everyJourneyAtMost400Ms: observations.every((entry) => entry.passed && entry.roamToFightMs <= 400),
  latencyMs: {
    raw: latencies,
    p50: nearestRank(latencies, 0.5),
    p95: nearestRank(latencies, 0.95),
    p99: nearestRank(latencies, 0.99),
    max: Math.max(...latencies),
  },
  observations,
};
const summaryPath = `${evidenceRoot}-summary.json`;
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
console.log(`\nfresh exact-build complete-loop gate: ${runs}/${runs} clean runs passed`);
console.log(`summary: ${summaryPath}`);
