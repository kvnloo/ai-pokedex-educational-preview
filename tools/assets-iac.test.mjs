import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rename, stat, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { executeGraph, ingestSource, validatePins } from './assets-iac-lib.mjs';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const execFile = promisify(execFileCallback);

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'pokemon-iac-test-'));
  const source = path.join(root, 'source.bin');
  const cas = path.join(root, 'cas');
  await mkdir(cas, { recursive: true });
  await writeFile(source, 'lawful original stand-in\n');
  return { root, source, cas };
}

test('missing source fails closed without publishing', async () => {
  const { root, cas } = await fixture();
  await assert.rejects(ingestSource(path.join(root, 'missing.bin'), cas, { expectedSha256: '0'.repeat(64) }), /SOURCE_MISSING/);
  assert.deepEqual(await readdir(cas), []);
});

test('top-level symlink is rejected before it is followed', async () => {
  const { root, source, cas } = await fixture();
  const link = path.join(root, 'source-link.bin');
  await symlink(source, link);
  await assert.rejects(ingestSource(link, cas), /SOURCE_SYMLINK/);
});

test('hash drift fails without publishing', async () => {
  const { source, cas } = await fixture();
  await assert.rejects(ingestSource(source, cas, { expectedSha256: 'f'.repeat(64) }), /SOURCE_HASH_DRIFT/);
  assert.deepEqual((await readdir(cas)).filter((name) => !name.startsWith('.tmp-')), []);
});

test('source mutation during streaming is rejected and temp object is cleaned', async () => {
  const { source, cas } = await fixture();
  const expected = sha256(await readFile(source));
  await assert.rejects(ingestSource(source, cas, {
    expectedSha256: expected,
    afterFirstChunk: async () => writeFile(source, 'mutated source bytes that differ\n'),
  }), /SOURCE_MUTATED/);
  assert.deepEqual(await readdir(cas), []);
});

test('pathname replacement while descriptor remains open is rejected', async () => {
  const { root, source, cas } = await fixture();
  const expected = sha256(await readFile(source));
  await assert.rejects(ingestSource(source, cas, {
    expectedSha256: expected,
    afterFirstChunk: async () => {
      await rename(source, path.join(root, 'original-open-inode.bin'));
      await writeFile(source, 'lawful original stand-in\n');
    },
  }), /SOURCE_MUTATED/);
});

test('same-size corrupted existing CAS object is preserved and rejected', async () => {
  const { source, cas } = await fixture();
  const bytes = await readFile(source);
  const expected = sha256(bytes);
  const target = path.join(cas, expected);
  await writeFile(target, Buffer.alloc(bytes.length, 120));
  await assert.rejects(ingestSource(source, cas, { expectedSha256: expected }), /CAS_CORRUPT/);
  assert.deepEqual(await readFile(target), Buffer.alloc(bytes.length, 120));
});

test('ingest is private, content addressed and idempotent', async () => {
  const { source, cas } = await fixture();
  const expected = sha256(await readFile(source));
  const first = await ingestSource(source, cas, { expectedSha256: expected });
  const second = await ingestSource(source, cas, { expectedSha256: expected });
  assert.equal(first.digest, expected);
  assert.equal(second.cacheHit, true);
  assert.equal((await stat(first.casPath)).mode & 0o777, 0o600);
});

test('unpinned tool, model, and container revisions fail closed', () => {
  for (const key of ['tool', 'model', 'container']) {
    const pins = { tool: 'sha256:' + '1'.repeat(64), model: 'sha256:' + '2'.repeat(64), container: 'sha256:' + '3'.repeat(64) };
    pins[key] = 'latest';
    assert.throws(() => validatePins(pins), new RegExp(`UNPINNED_${key.toUpperCase()}`));
  }
});

test('graph resumes after partial output and only valid checkpoints hit cache', async () => {
  const { root } = await fixture();
  const output = path.join(root, 'outputs', 'stand-in.json');
  const state = path.join(root, 'work', 'state.json');
  const graph = { nodes: [{ id: 'stand-in', input: { role: 'kanto-marker' }, output }] };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, '{"partial":');
  const first = await executeGraph(graph, state);
  assert.equal(first.nodes[0].cacheHit, false);
  JSON.parse(await readFile(output, 'utf8'));
  const second = await executeGraph(graph, state);
  assert.equal(second.nodes[0].cacheHit, true);
  await writeFile(output, '{}');
  const third = await executeGraph(graph, state);
  assert.equal(third.nodes[0].cacheHit, false);
});

test('private bootstrap stops for owner input with exact expected hash', async () => {
  const { root } = await fixture();
  await assert.rejects(execFile(process.execPath, ['tools/assets-iac.mjs', 'bootstrap', '--profile', 'private-local'], {
    cwd: path.resolve(import.meta.dirname, '..'), env: { ...process.env, POKEMON_IAC_ROOT: root },
  }), /OWNER_SOURCE_REQUIRED: pokemon\.owner-art\.example\.v1 expected sha256:2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881 bytes:1/);
});

test('distributable leak scan rejects a known private digest', async () => {
  const { root } = await fixture();
  const output = path.join(root, 'outputs', 'distributable');
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'leak.txt'), '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881');
  await assert.rejects(execFile(process.execPath, ['tools/assets-iac.mjs', 'leak-scan', output], {
    cwd: path.resolve(import.meta.dirname, '..'), env: { ...process.env, POKEMON_IAC_ROOT: root },
  }), /PRIVATE_ASSET_LEAK/);
});
