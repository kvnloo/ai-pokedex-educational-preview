#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { verifyAndFreezeBuild } from './verified-launcher.mjs';

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const cleanup = (root) => {
  const unlock = (directory) => {
    try { chmodSync(directory, 0o700); } catch { return; }
    for (const entry of readdirSync(directory, { withFileTypes: true })) if (entry.isDirectory()) unlock(join(directory, entry.name));
  };
  unlock(root);
  rmSync(root, { recursive: true, force: true });
};

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'verified-launcher-'));
  const dist = join(root, 'dist');
  mkdirSync(join(dist, 'assets'), { recursive: true });
  writeFileSync(join(dist, 'index.html'), '<script src="/assets/app.js"></script>');
  writeFileSync(join(dist, 'assets/app.js'), 'console.log("reviewed")');
  writeFileSync(join(dist, 'assets/app.js.map'), '{}');
  const files = Object.fromEntries(['index.html', 'assets/app.js', 'assets/app.js.map'].map((path) => {
    const bytes = readFileSync(join(dist, path));
    return [path, { sha256: sha(bytes), bytes: bytes.length }];
  }));
  const manifest = { schemaVersion: 1, git: { sha: 'a'.repeat(40), dirty: false }, files };
  const manifestBytes = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(join(dist, 'build-manifest.json'), manifestBytes);
  return { root, dist, manifestSha: sha(manifestBytes) };
}

test('external expected manifest root freezes an exact complete build', () => {
  const value = fixture();
  try {
    const frozen = verifyAndFreezeBuild({ source: value.dist, expectedManifestSha256: value.manifestSha, expectedGitSha: 'a'.repeat(40), destinationParent: value.root });
    assert.equal(frozen.receipt.manifestSha256, value.manifestSha);
    assert.equal(frozen.receipt.gitSha, 'a'.repeat(40));
    assert.equal(readFileSync(join(frozen.directory, 'assets/app.js'), 'utf8'), 'console.log("reviewed")');
  } finally { cleanup(value.root); }
});

test('consistently replaced manifest and all served bytes are rejected by external root', () => {
  const value = fixture();
  try {
    const originalRoot = value.manifestSha;
    writeFileSync(join(value.dist, 'assets/app.js'), 'console.log("attacker")');
    const manifest = JSON.parse(readFileSync(join(value.dist, 'build-manifest.json'), 'utf8'));
    const bytes = readFileSync(join(value.dist, 'assets/app.js'));
    manifest.files['assets/app.js'] = { sha256: sha(bytes), bytes: bytes.length };
    writeFileSync(join(value.dist, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    assert.throws(() => verifyAndFreezeBuild({ source: value.dist, expectedManifestSha256: originalRoot, expectedGitSha: 'a'.repeat(40), destinationParent: value.root }), /external manifest root mismatch/);
  } finally { cleanup(value.root); }
});
