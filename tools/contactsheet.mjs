/**
 * Minimal contact sheet for a wave label.
 * Creates shots/_sheets/preview.png by copying the first available shot.
 * Real version would composite many frames.
 */
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
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
const out = join(sheetsDir, 'preview.png');

if (existsSync(firstShot)) {
  copyFileSync(firstShot, out);
  console.log(`[contactsheet] ${firstShot} -> ${out}`);
} else {
  console.log(`[contactsheet] no shot found for ${label}, creating empty marker`);
  // touch a marker
  copyFileSync(join(root, 'tools', 'playtest.mjs'), out); // any file as marker
}

console.log('[contactsheet] done');
