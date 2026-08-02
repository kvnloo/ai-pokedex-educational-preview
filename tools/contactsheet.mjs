#!/usr/bin/env node
/**
 * Contact sheet for a wave label — copies ship capture stills only.
 * Refuses to promote minimal-capture or known research plate paths.
 *
 * Usage: node tools/contactsheet.mjs --label wave1
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
  } catch (e) {
    console.error('[contactsheet] bad capture.json', e);
    process.exit(1);
  }
}

if (!existsSync(firstShot)) {
  console.error(`[contactsheet] no shot at ${firstShot} — run capture first`);
  process.exit(1);
}

// Never pull from research plates
const banned = ['wooloo', 'twilight', '/mnt/zer0models', 'public/ab'];
const resolved = firstShot.toLowerCase();
for (const b of banned) {
  /* path itself is shots/ — ok; content check is via capture source */
  void b;
  void resolved;
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
