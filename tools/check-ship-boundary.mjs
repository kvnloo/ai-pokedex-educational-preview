#!/usr/bin/env node
/**
 * Fail-closed ship-boundary gate (categories I/J).
 *
 * Scans dist/ (or --dir) for research warehouse leaks and official franchise
 * identity strings. Exit 0 only when the production surface is game-pack clean.
 *
 * Usage:
 *   node tools/check-ship-boundary.mjs
 *   node tools/check-ship-boundary.mjs --dir dist
 *   npm run build && npm run check:ship
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  if (i < 0) return d;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
};

const distDir = String(flag('dir', join(ROOT, 'dist')));

/** Path fragments that must never appear under the ship root. */
const FORBIDDEN_PATH_PARTS = [
  `${sep}canonical${sep}`,
  `${sep}canonical`,
  `${sep}derived${sep}`,
  `${sep}derived`,
  `${sep}smoke${sep}`,
  `${sep}smoke`,
  `${sep}ab${sep}`,
  `${sep}ab${sep}`.replace(/\\/g, '/'),
  '/canonical/',
  '/derived/',
  '/smoke/',
  '/ab/',
  'dex-index.json',
  'wooloo_ref',
  'wooloo_shape',
  'wooloo_preview',
];

/** Case-sensitive / insensitive official identity markers (sample + franchise). */
const FORBIDDEN_STRINGS = [
  { re: /\bBulbasaur\b/i, label: 'Bulbasaur' },
  { re: /\bPikachu\b/i, label: 'Pikachu' },
  { re: /\bCharizard\b/i, label: 'Charizard' },
  { re: /\bWooloo\b/i, label: 'Wooloo' },
  { re: /\bPokémon\b/, label: 'Pokémon' },
  { re: /\bPokemon\b/, label: 'Pokemon' },
  { re: /\bPokeAPI\b/i, label: 'PokeAPI' },
  { re: /\bTwilight Wings\b/i, label: 'Twilight Wings' },
  { re: /content\/canonical/i, label: 'content/canonical path' },
  { re: /content\/derived/i, label: 'content/derived path' },
  { re: /\/mnt\/zer0models/i, label: '/mnt/zer0models' },
  { re: /nationalId/i, label: 'nationalId warehouse field' },
];

const TEXT_EXTS = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
  '.htm',
  '.json',
  '.map',
  '.txt',
  '.svg',
  '.xml',
  '.csv',
  '.md',
]);

const failures = [];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function pathHasForbidden(relPosix) {
  const n = relPosix.replace(/\\/g, '/');
  const withSlashes = `/${n}/`;
  for (const frag of FORBIDDEN_PATH_PARTS) {
    const f = frag.replace(/\\/g, '/');
    if (!f) continue;
    if (n.includes(f.replace(/^\/|\/$/g, '')) && (
      n.includes('canonical') ||
      n.includes('derived') ||
      n.includes('/smoke') ||
      n.endsWith('/smoke') ||
      n.includes('/ab/') ||
      n.startsWith('ab/') ||
      n.includes('dex-index') ||
      n.includes('wooloo_')
    )) {
      // refined below
    }
  }
  if (/(^|\/)canonical(\/|$)/.test(n)) return 'path contains canonical/';
  if (/(^|\/)derived(\/|$)/.test(n)) return 'path contains derived/';
  if (/(^|\/)smoke(\/|$)/.test(n)) return 'path contains smoke/';
  if (/(^|\/)ab(\/|$)/.test(n)) return 'path contains research ab/';
  if (/(^|\/)dex-index\.json$/i.test(n) || n.includes('dex-index.json')) {
    return 'path contains dex-index.json';
  }
  if (/wooloo_(ref|shape|preview)/i.test(n)) return 'path contains wooloo research asset';
  return null;
}

function isTextFile(p) {
  const lower = p.toLowerCase();
  for (const ext of TEXT_EXTS) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

function main() {
  console.log(`[check-ship-boundary] scanning ${distDir}`);

  if (!existsSync(distDir)) {
    console.error(
      `[check-ship-boundary] FAIL: dist missing at ${distDir}. Run npm run build first.`,
    );
    process.exit(1);
  }

  // Directory presence fail-closed
  for (const sub of ['content/canonical', 'content/derived', 'content/smoke', 'ab']) {
    const p = join(distDir, sub);
    if (existsSync(p)) {
      failures.push(`forbidden directory present: ${sub}`);
    }
  }

  const files = walk(distDir);
  if (files.length === 0) {
    failures.push('dist is empty');
  }

  for (const abs of files) {
    const rel = relative(distDir, abs);
    const pathHit = pathHasForbidden(rel);
    if (pathHit) {
      failures.push(`${rel}: ${pathHit}`);
      continue;
    }
    if (!isTextFile(abs)) continue;
    let text;
    try {
      const buf = readFileSync(abs);
      // skip huge maps over 8MB
      if (buf.length > 8 * 1024 * 1024) continue;
      text = buf.toString('utf8');
    } catch {
      continue;
    }
    for (const { re, label } of FORBIDDEN_STRINGS) {
      if (re.test(text)) {
        failures.push(`${rel}: contains forbidden identity "${label}"`);
        break;
      }
    }
  }

  // content under dist must be game-only if present
  const contentRoot = join(distDir, 'content');
  if (existsSync(contentRoot)) {
    for (const name of readdirSync(contentRoot)) {
      if (name === 'game') continue;
      failures.push(`content/${name}: only content/game is ship-allowed`);
    }
  }

  if (failures.length) {
    console.error(`[check-ship-boundary] FAIL (${failures.length}):`);
    for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
    if (failures.length > 40) console.error(`  … +${failures.length - 40} more`);
    process.exit(1);
  }

  console.log('[check-ship-boundary] OK — dist is game-pack clean (no warehouse / official names).');
  process.exit(0);
}

main();
