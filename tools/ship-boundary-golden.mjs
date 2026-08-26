#!/usr/bin/env node
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = new URL('..', import.meta.url).pathname;
const fixture = mkdtempSync(join(tmpdir(), 'pokemon-ship-boundary-'));
try {
  writeFileSync(join(fixture, 'index.html'), '<!doctype html><title>clean</title>');
  execFileSync(process.execPath, ['tools/check-ship-boundary.mjs', '--dir', fixture], { cwd: root });

  writeFileSync(join(fixture, 'game.gba'), 'not a rom');
  let result = spawnSync(process.execPath, ['tools/check-ship-boundary.mjs', '--dir', fixture], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /forbidden ROM\/save\/patch extension/);
  rmSync(join(fixture, 'game.gba'));

  const privateSource = '/mnt/zer0models/pokemon_anime/pipeline/experiments/wooloo-studio-bakeoff-20260802/sources/official/pokeapi-official-artwork-831.png';
  cpSync(privateSource, join(fixture, 'innocuous.png'));
  result = spawnSync(process.execPath, ['tools/check-ship-boundary.mjs', '--dir', fixture], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /private canonical asset bytes match manifest hash/);
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
console.log('ship-boundary golden: clean distributable passes; ROM/patch and hash-bound private bytes fail closed');
