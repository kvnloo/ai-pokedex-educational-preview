#!/usr/bin/env node
/**
 * Fail-closed ship-boundary gate (categories I/J).
 *
 * Scans dist/ (or --dir) for research warehouse leaks and official franchise
 * identity strings. Also fails closed if public/ still hosts warehouse
 * content or research ab/ surfaces (product-tree hygiene).
 *
 * Decodes JSON \\uXXXX escapes so hidden unicode escapes cannot evade gates.
 *
 * Usage:
 *   node tools/check-ship-boundary.mjs
 *   node tools/check-ship-boundary.mjs --dir dist
 *   npm run build && npm run check:ship
 */
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  statSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, extname, join, relative, sep } from 'node:path';
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
const privateAssetManifest = JSON.parse(readFileSync(join(ROOT, 'canonical/assets.json'), 'utf8'));
const PRIVATE_ASSET_HASHES = new Set(privateAssetManifest.assets
  .filter((asset) => asset.scope === 'private-canonical-reference')
  .map((asset) => asset.sourceSha256));
const FORBIDDEN_BINARY_EXTENSIONS = new Set([
  '.gb', '.gbc', '.gba', '.nds', '.3ds', '.cia', '.sav', '.ips', '.ups', '.bps', '.xdelta', '.vcdiff',
]);

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
  { re: /official-artwork/i, label: 'private official-artwork locator' },
  { re: /pokemon_anime/i, label: 'private asset-store locator' },
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
  void FORBIDDEN_PATH_PARTS;
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

/**
 * Expand \\uXXXX (and \\xHH) escapes so bundled JSON/JS cannot hide
 * franchise identity strings from raw-text gates.
 */
function decodeUnicodeEscapes(text) {
  let out = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16)),
  );
  out = out.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16)),
  );
  return out;
}

/** Scan both raw and unicode-decoded forms (and JSON-parsed string if valid). */
function textsToScan(raw, filePath) {
  const decoded = decodeUnicodeEscapes(raw);
  const set = new Set([raw, decoded]);
  if (filePath.toLowerCase().endsWith('.json')) {
    try {
      const parsed = JSON.parse(raw);
      set.add(JSON.stringify(parsed));
      set.add(decodeUnicodeEscapes(JSON.stringify(parsed)));
    } catch {
      /* not strict JSON */
    }
  }
  return [...set];
}

/** Product-tree hygiene: public/ must not host warehouse or research ab. */
function checkPublicSurface() {
  const pub = join(ROOT, 'public');
  if (!existsSync(pub)) return;

  const contentPath = join(pub, 'content');
  if (existsSync(contentPath)) {
    let isLink = false;
    try {
      isLink = lstatSync(contentPath).isSymbolicLink();
    } catch {
      /* */
    }
    if (isLink) {
      let target = '';
      try {
        target = readlinkSync(contentPath);
      } catch {
        /* */
      }
      failures.push(
        `public/content is a symlink${target ? ` → ${target}` : ''} (warehouse leak on product surface)`,
      );
    } else {
      // Directory: only content/game allowed under public/content if present
      try {
        for (const name of readdirSync(contentPath)) {
          if (name === 'game') continue;
          failures.push(
            `public/content/${name}: warehouse/research not allowed under public/`,
          );
        }
      } catch {
        failures.push('public/content present but unreadable');
      }
    }
  }

  const abPath = join(pub, 'ab');
  if (existsSync(abPath)) {
    failures.push('public/ab present: research A/B surface must not live under public/');
  }
}

function scanTree(root, label) {
  if (!existsSync(root)) return;
  const files = walk(root);
  for (const abs of files) {
    const rel = relative(root, abs);
    const pathHit = pathHasForbidden(rel);
    if (pathHit) {
      failures.push(`${label}/${rel}: ${pathHit}`);
      continue;
    }
    if (!isTextFile(abs)) continue;
    let raw;
    try {
      const buf = readFileSync(abs);
      if (buf.length > 8 * 1024 * 1024) continue;
      raw = buf.toString('utf8');
    } catch {
      continue;
    }
    const variants = textsToScan(raw, abs);
    outer: for (const text of variants) {
      for (const { re, label: idLabel } of FORBIDDEN_STRINGS) {
        if (re.test(text)) {
          failures.push(`${label}/${rel}: contains forbidden identity "${idLabel}"`);
          break outer;
        }
      }
    }
  }
}

function main() {
  console.log(`[check-ship-boundary] scanning ${distDir}`);

  // Product-tree hygiene first (public/)
  checkPublicSurface();

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
    const extension = extname(abs).toLowerCase();
    if (FORBIDDEN_BINARY_EXTENSIONS.has(extension)) {
      failures.push(`${rel}: forbidden ROM/save/patch extension ${extension}`);
      continue;
    }
    const bytes = readFileSync(abs);
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (PRIVATE_ASSET_HASHES.has(digest)) {
      failures.push(`${rel}: private canonical asset bytes match manifest hash ${digest}`);
      continue;
    }
    const pathHit = pathHasForbidden(rel);
    if (pathHit) {
      failures.push(`${rel}: ${pathHit}`);
      continue;
    }
    if (!isTextFile(abs)) continue;
    let raw;
    try {
      const buf = bytes;
      // skip huge maps over 8MB
      if (buf.length > 8 * 1024 * 1024) continue;
      raw = buf.toString('utf8');
    } catch {
      continue;
    }
    const variants = textsToScan(raw, abs);
    outer: for (const text of variants) {
      for (const { re, label: idLabel } of FORBIDDEN_STRINGS) {
        if (re.test(text)) {
          failures.push(`${rel}: contains forbidden identity "${idLabel}"`);
          break outer;
        }
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

  // Optional: ab.html at repo root may exist as local research stub — do not
  // require its absence, but if it ships into dist it is already forbidden via
  // rollup input exclusion + ab/ path rules.

  if (failures.length) {
    console.error(`[check-ship-boundary] FAIL (${failures.length}):`);
    for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
    if (failures.length > 40) console.error(`  … +${failures.length - 40} more`);
    process.exit(1);
  }

  console.log(
    '[check-ship-boundary] OK — dist is game-pack clean; public/ free of warehouse/ab.',
  );
  process.exit(0);
}

main();
