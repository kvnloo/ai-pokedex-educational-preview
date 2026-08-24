import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rename, stat, symlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { executeGraph, ingestSource, validatePinBindings, validatePins } from './assets-iac-lib.mjs';

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

test('recipe pins must resolve to declared lock entries', () => {
  const pins = { tool: 'sha256:' + '1'.repeat(64), model: 'sha256:' + '2'.repeat(64), container: 'sha256:' + '3'.repeat(64) };
  const locks = {
    tool: { kind: 'tools', entries: [] },
    model: { kind: 'models', entries: [{ id: 'model', version: '1', digest: pins.model, locator: 'repository:model' }] },
    container: { kind: 'containers', entries: [{ id: 'host', version: '1', digest: pins.container, locator: 'host:node-v26.4.0' }] },
  };
  assert.throws(() => validatePinBindings(pins, locks, 'v26.4.0'), /PIN_LOCK_MISSING: tool/);
  locks.tool.entries.push({ id: 'node', version: '26.4.0', digest: 'sha256:' + '4'.repeat(64), locator: 'https://nodejs.org/' });
  assert.throws(() => validatePinBindings(pins, locks, 'v26.4.0'), /PIN_LOCK_MISSING: tool/);
});

test('locked executable and host runtime must match the actual Node identity', () => {
  const pins = { tool: 'sha256:' + '1'.repeat(64), model: 'sha256:' + '2'.repeat(64), container: 'sha256:' + '3'.repeat(64) };
  const locks = {
    tool: { kind: 'tools', entries: [{ id: 'node', version: '99.0.0', digest: pins.tool, locator: 'https://nodejs.org/' }] },
    model: { kind: 'models', entries: [{ id: 'model', version: '1', digest: pins.model, locator: 'repository:model' }] },
    container: { kind: 'containers', entries: [{ id: 'host', version: '1', digest: pins.container, locator: 'host:node-v99.0.0' }] },
  };
  assert.throws(() => validatePinBindings(pins, locks, 'v26.4.0'), /RUNTIME_IDENTITY_MISMATCH/);
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

test('two-node DAG orders dependencies and invalidates downstream on change while resuming safely', async () => {
  const { root } = await fixture();
  const state = path.join(root, 'work', 'dag-state.json');
  const upstream = { id: 'upstream', input: { revision: 1 }, output: path.join(root, 'outputs', 'upstream.json'), dependsOn: [] };
  const downstream = { id: 'downstream', input: { transform: 'receipt' }, output: path.join(root, 'outputs', 'downstream.json'), dependsOn: ['upstream'] };
  const reversedGraph = { nodes: [downstream, upstream] };

  const first = await executeGraph(reversedGraph, state);
  assert.deepEqual(first.nodes.map(({ id, cacheHit }) => [id, cacheHit]), [['upstream', false], ['downstream', false]]);
  const second = await executeGraph(reversedGraph, state);
  assert.deepEqual(second.nodes.map(({ cacheHit }) => cacheHit), [true, true]);

  upstream.input.revision = 2;
  const changed = await executeGraph(reversedGraph, state);
  assert.deepEqual(changed.nodes.map(({ cacheHit }) => cacheHit), [false, false]);

  upstream.input.revision = 3;
  await assert.rejects(executeGraph(reversedGraph, state, { afterNode: ({ id }) => {
    if (id === 'upstream') throw new Error('INTERRUPTED');
  } }), /INTERRUPTED/);
  const resumed = await executeGraph(reversedGraph, state);
  assert.deepEqual(resumed.nodes.map(({ cacheHit }) => cacheHit), [true, false]);
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

test('verify rejects a same-size valid-JSON output mutation', async () => {
  const { root } = await fixture();
  const options = { cwd: path.resolve(import.meta.dirname, '..'), env: { ...process.env, POKEMON_IAC_ROOT: root } };
  await execFile(process.execPath, ['tools/assets-iac.mjs', 'build', '--profile', 'distributable'], options);
  const output = path.join(root, 'outputs', 'distributable', 'kanto.pallet-pewter.marker.v1.json');
  const original = await readFile(output, 'utf8');
  const mutated = original.replace('marker', 'markez');
  assert.equal(Buffer.byteLength(mutated), Buffer.byteLength(original));
  JSON.parse(mutated);
  await writeFile(output, mutated);
  await assert.rejects(
    execFile(process.execPath, ['tools/assets-iac.mjs', 'verify', '--profile', 'distributable'], options),
    /OUTPUT_INTEGRITY_MISMATCH/,
  );
});

async function builtVerificationFixture() {
  const { root } = await fixture();
  const options = { cwd: path.resolve(import.meta.dirname, '..'), env: { ...process.env, POKEMON_IAC_ROOT: root } };
  await execFile(process.execPath, ['tools/assets-iac.mjs', 'build', '--profile', 'distributable'], options);
  const reportFile = path.join(root, 'reports', 'build-distributable.json');
  const checkpointFile = path.join(root, 'work', 'distributable', 'checkpoints.json');
  const verify = () => execFile(process.execPath, ['tools/assets-iac.mjs', 'verify', '--profile', 'distributable'], options);
  return { reportFile, checkpointFile, verify };
}

test('verify rejects an omitted build-report node', async () => {
  const { reportFile, verify } = await builtVerificationFixture();
  const report = JSON.parse(await readFile(reportFile, 'utf8'));
  report.nodes = [];
  await writeFile(reportFile, JSON.stringify(report));
  await assert.rejects(verify(), /BUILD_REPORT_NODE_INVENTORY_MISMATCH/);
});

test('verify rejects an omitted checkpoint node', async () => {
  const { checkpointFile, verify } = await builtVerificationFixture();
  const checkpoint = JSON.parse(await readFile(checkpointFile, 'utf8'));
  checkpoint.nodes = {};
  await writeFile(checkpointFile, JSON.stringify(checkpoint));
  await assert.rejects(verify(), /CHECKPOINT_NODE_INVENTORY_MISMATCH/);
});

test('verify rejects duplicate and extra build-report nodes', async () => {
  const { reportFile, verify } = await builtVerificationFixture();
  const report = JSON.parse(await readFile(reportFile, 'utf8'));
  report.nodes.push(report.nodes[0], { ...report.nodes[0], id: 'unexpected' });
  await writeFile(reportFile, JSON.stringify(report));
  await assert.rejects(verify(), /BUILD_REPORT_NODE_INVENTORY_MISMATCH/);
});

test('verify rejects an extra checkpoint node', async () => {
  const { checkpointFile, verify } = await builtVerificationFixture();
  const checkpoint = JSON.parse(await readFile(checkpointFile, 'utf8'));
  checkpoint.nodes.unexpected = checkpoint.nodes[Object.keys(checkpoint.nodes)[0]];
  await writeFile(checkpointFile, JSON.stringify(checkpoint));
  await assert.rejects(verify(), /CHECKPOINT_NODE_INVENTORY_MISMATCH/);
});
