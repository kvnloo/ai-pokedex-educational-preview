import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function option(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) throw new Error(`missing ${name}`);
  return process.argv[index + 1];
}

const nativeReportPath = option('--native-report');
const outputPath = option('--out');
const nativeBytes = readFileSync(nativeReportPath);
const native = JSON.parse(nativeBytes);
const temporary = mkdtempSync(join(tmpdir(), 'production-client-parity-'));
let backend;
let browser;
try {
  const backendPath = join(temporary, 'backend.json');
  const browserPath = join(temporary, 'browser.json');
  execFileSync(process.execPath, ['--experimental-strip-types', 'tools/backend-replay-evidence.mjs', '--out', backendPath], { stdio: 'pipe' });
  execFileSync(process.execPath, ['tools/production-browser-parity-evidence.mjs', '--out', browserPath], { stdio: 'pipe' });
  backend = JSON.parse(readFileSync(backendPath, 'utf8'));
  browser = JSON.parse(readFileSync(browserPath, 'utf8'));
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

const nativeEvidence = {
  source: 'native-godot-production-preflight',
  callPath: 'native/godot/scripts/preflight.gd',
  schemaVersion: native.schema_version,
  contentHash: native.content_hash,
  replayHash: native.replay_hash,
  finalHash: native.final_hash,
};
const clients = { backend, browser, native: nativeEvidence };
const comparedHashNames = ['contentHash', 'replayHash', 'finalHash'];
const hashesMatch = comparedHashNames.every((name) => new Set(Object.values(clients).map((client) => client[name])).size === 1);
if (!hashesMatch) throw new Error(`cross-client content/replay/final hash mismatch: ${JSON.stringify(clients)}`);
if (new Set(Object.values(clients).map((client) => client.schemaVersion)).size !== 1) throw new Error('cross-client schema version mismatch');
if (browser.approvedRevision !== '7e01d16bbd7c5c1d58177d4abaa512600026d2e6') throw new Error('production browser evidence is not revision-bound to approved M2');
if (browser.source !== 'production-browser-application') throw new Error('browser evidence did not originate from production application');
if (backend.source !== 'authoritative-backend-replay') throw new Error('backend evidence did not originate from authoritative replay path');

const report = {
  schemaVersion: 'cross-client-evidence/v2',
  approvedInputs: {
    canonical: 'd9a1dad7b76aa0bea89c473f87bf82048a16eaff',
    assetsAsCode: 'f77ec8876ffc212b75f83fde5efdd31c335b705d',
    godotThinClient: 'b663bb0bd4124c285277a923fb21533f0981b5a8',
    browserM2: '7e01d16bbd7c5c1d58177d4abaa512600026d2e6',
  },
  contractSchemaVersion: backend.schemaVersion,
  comparedHashNames,
  clients,
  hashesMatch,
  pixelParityClaimed: false,
  nativeReportSha256: createHash('sha256').update(nativeBytes).digest('hex'),
};
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
