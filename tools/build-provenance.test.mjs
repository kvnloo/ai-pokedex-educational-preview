#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  createBuildManifest,
  sha256File,
  verifyBuildManifestFiles,
} from './build-provenance.mjs';

test('manifest binds revision, invocation, every emitted executable, map, and canonical asset', () => {
  const root = mkdtempSync(join(tmpdir(), 'twilight-manifest-'));
  mkdirSync(join(root, 'assets'));
  writeFileSync(join(root, 'index.html'), '<script src="/assets/main-a.js"></script>');
  writeFileSync(join(root, 'assets/main-a.js'), 'console.log("exact")\n');
  writeFileSync(join(root, 'assets/main-a.js.map'), '{"version":3}\n');
  const manifest = createBuildManifest({
    root,
    gitSha: 'a'.repeat(40),
    gitDirty: false,
    invocation: ['vite', 'build', '--mode', 'private-local'],
    canonicalAssets: { bulbasaur: { sha256: 'b'.repeat(64), relativePath: 'bulbasaur.glb' } },
    builtAt: '2026-08-26T00:00:00.000Z',
  });

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.git.sha, 'a'.repeat(40));
  assert.equal(manifest.git.dirty, false);
  assert.deepEqual(manifest.invocation, ['vite', 'build', '--mode', 'private-local']);
  assert.deepEqual(Object.keys(manifest.files), ['assets/main-a.js', 'assets/main-a.js.map', 'index.html']);
  assert.equal(manifest.files['assets/main-a.js'].sha256, sha256File(join(root, 'assets/main-a.js')));
  assert.equal(manifest.canonicalAssets.bulbasaur.sha256, 'b'.repeat(64));
  assert.deepEqual(verifyBuildManifestFiles(root, manifest), []);
});

test('verification refuses stale or altered dist bytes and an unexpected executable', () => {
  const root = mkdtempSync(join(tmpdir(), 'twilight-manifest-stale-'));
  mkdirSync(join(root, 'assets'));
  writeFileSync(join(root, 'index.html'), 'exact');
  writeFileSync(join(root, 'assets/main-a.js'), 'exact');
  const manifest = createBuildManifest({
    root,
    gitSha: 'c'.repeat(40),
    gitDirty: true,
    invocation: ['vite', 'build'],
    canonicalAssets: {},
    builtAt: '2026-08-26T00:00:00.000Z',
  });
  writeFileSync(join(root, 'assets/main-a.js'), 'stale');
  writeFileSync(join(root, 'assets/injected.js'), 'fault hook');

  assert.deepEqual(verifyBuildManifestFiles(root, manifest), [
    'hash mismatch: assets/main-a.js',
    'unexpected executable: assets/injected.js',
  ]);
});
