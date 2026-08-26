#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyServedBuild } from '../src/core/servedBuildVerification.ts';

const digest = async (bytes) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
  .map((value) => value.toString(16).padStart(2, '0')).join('');

test('served build verification rejects a tampered chunk, map, and asset', async () => {
  for (const path of ['assets/main.js', 'assets/main.js.map', 'content/model.glb']) {
    const good = new TextEncoder().encode(`good:${path}`);
    const manifest = { git: { sha: 'a'.repeat(40), dirty: false }, files: {
      [path]: { sha256: await digest(good), bytes: good.byteLength },
    } };
    await assert.rejects(() => verifyServedBuild(manifest, 'a'.repeat(40), async () => new TextEncoder().encode(`evil:${path}`).buffer), new RegExp(`served byte mismatch: ${path.replaceAll('.', '\\.')}`));
  }
});

test('served build verification binds the compiled Git SHA', async () => {
  await assert.rejects(() => verifyServedBuild({ git: { sha: 'b'.repeat(40), dirty: false }, files: {} }, 'a'.repeat(40), async () => new ArrayBuffer(0)), /compiled Git SHA mismatch/);
});
