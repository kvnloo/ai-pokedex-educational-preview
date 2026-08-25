import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { consumeSharedClientContract } from './shared-client-contract.mjs';

function option(name) {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) throw new Error(`missing ${name}`);
  return process.argv[index + 1];
}

const nativeReportPath = option('--native-report');
const outputPath = option('--out');
const nativeBytes = readFileSync(nativeReportPath);
const native = JSON.parse(nativeBytes);
const browser = consumeSharedClientContract();
const hashesMatch = native.final_hash === browser.finalHash;
if (!hashesMatch) throw new Error(`cross-client final hash mismatch: native=${native.final_hash} browser=${browser.finalHash}`);
if (native.schema_version !== browser.schemaVersion) throw new Error('cross-client schema version mismatch');
if (native.movement_location !== browser.movementLocation) throw new Error('cross-client movement acknowledgement mismatch');

const report = {
  schemaVersion: 'cross-client-evidence/v1',
  approvedInputs: {
    canonical: 'd9a1dad7b76aa0bea89c473f87bf82048a16eaff',
    assetsAsCode: 'f77ec8876ffc212b75f83fde5efdd31c335b705d',
    godotThinClient: 'b663bb0bd4124c285277a923fb21533f0981b5a8',
  },
  contractSchemaVersion: browser.schemaVersion,
  canonicalCell: browser.canonicalCell,
  movementLocation: browser.movementLocation,
  orderedEvents: browser.orderedEvents,
  nativeFinalHash: native.final_hash,
  browserFinalHash: browser.finalHash,
  hashesMatch,
  pixelParityClaimed: false,
  nativeReportSha256: createHash('sha256').update(nativeBytes).digest('hex'),
};
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
