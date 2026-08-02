#!/usr/bin/env node
/**
 * Contact sheet for a wave label — copies ship capture stills only.
 * Refuses to promote minimal-capture, black_frame, or failed hard gates.
 *
 * Usage: node tools/contactsheet.mjs --label wave2
 */
import { mkdirSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const args = process.argv.slice(2);
let label = 'wave';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--label') label = args[i + 1] || label;
}

const shotDir = join(root, 'shots', label);
const sheetsDir = join(root, 'shots', '_sheets');
mkdirSync(sheetsDir, { recursive: true });

const firstShot = join(shotDir, 'shot-000.png');
const captureJson = join(shotDir, 'capture.json');
const out = join(sheetsDir, 'preview.png');

if (existsSync(captureJson)) {
  try {
    const cap = JSON.parse(readFileSync(captureJson, 'utf8'));
    const src = String(cap.source || '');
    if (src.includes('minimal-capture') || src.includes('minimal')) {
      console.error(
        '[contactsheet] REFUSE: capture source is minimal-capture — re-run tools/capture.mjs (browser-threejs)',
      );
      process.exit(1);
    }
    if (!src.includes('browser-threejs') && !src.includes('browser')) {
      console.error(`[contactsheet] REFUSE: unexpected capture source "${src}"`);
      process.exit(1);
    }
    if (cap.black_frame === true) {
      console.error(
        '[contactsheet] REFUSE: capture.json black_frame=true (near-void / empty) — fail closed',
      );
      process.exit(1);
    }
    if (cap.pass_hard_gates === false) {
      console.error(
        `[contactsheet] REFUSE: pass_hard_gates=false hard_failed=${JSON.stringify(cap.hard_failed || [])}`,
      );
      process.exit(1);
    }
    if (Array.isArray(cap.hard_failed) && cap.hard_failed.length > 0) {
      console.error(
        `[contactsheet] REFUSE: hard_failed non-empty ${JSON.stringify(cap.hard_failed)}`,
      );
      process.exit(1);
    }
    // Align with capture hard floor if luma present (mean floor 38 / unique 48)
    const mean = cap.luma?.mean;
    const uniq = cap.luma?.unique_samples;
    if (typeof mean === 'number' && mean < 38) {
      console.error(`[contactsheet] REFUSE: luma mean ${mean} < 38 (near-void)`);
      process.exit(1);
    }
    if (typeof uniq === 'number' && uniq < 48) {
      console.error(`[contactsheet] REFUSE: unique samples ${uniq} < 48 (flat)`);
      process.exit(1);
    }
  } catch (e) {
    console.error('[contactsheet] bad capture.json', e);
    process.exit(1);
  }
} else {
  console.error('[contactsheet] REFUSE: missing capture.json — run tools/capture.mjs first');
  process.exit(1);
}

if (!existsSync(firstShot)) {
  console.error(`[contactsheet] no shot at ${firstShot} — run capture first`);
  process.exit(1);
}

copyFileSync(firstShot, out);
console.log(`[contactsheet] ${firstShot} -> ${out}`);
writeFileSync(
  join(sheetsDir, 'sheet.json'),
  JSON.stringify(
    {
      label,
      preview: out,
      source_shot: firstShot,
      timestamp: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log('[contactsheet] done');
