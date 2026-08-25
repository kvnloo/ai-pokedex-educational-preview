import { constants } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { chmod, link, lstat, mkdir, open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const identity = (value) => [value.dev, value.ino, value.mode, value.size, value.mtimeNs, value.ctimeNs].join(':');
const digestPattern = /^sha256:[a-f0-9]{64}$/;

async function hashHandle(handle, afterFirstChunk) {
  const hash = createHash('sha256');
  const buffer = Buffer.alloc(64 * 1024);
  let bytes = 0;
  let first = true;
  while (true) {
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
    if (!bytesRead) break;
    hash.update(buffer.subarray(0, bytesRead));
    bytes += bytesRead;
    if (first && afterFirstChunk) {
      first = false;
      await afterFirstChunk();
    }
  }
  return { digest: hash.digest('hex'), bytes };
}

async function verifyCasObject(target, expectedDigest, expectedBytes) {
  let handle;
  try {
    handle = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_CLOEXEC);
    const before = await handle.stat({ bigint: true });
    if (!before.isFile()) throw new Error(`CAS_CORRUPT: non-regular ${target}`);
    const result = await hashHandle(handle);
    const after = await handle.stat({ bigint: true });
    if (identity(before) !== identity(after) || result.digest !== expectedDigest || result.bytes !== expectedBytes) {
      throw new Error(`CAS_CORRUPT: ${target}`);
    }
    return true;
  } finally {
    await handle?.close();
  }
}

export async function verifyStableFile(target, expectedDigest, expectedBytes, label = 'OUTPUT_INTEGRITY_MISMATCH') {
  let handle;
  try {
    const pathBefore = await lstat(target, { bigint: true });
    if (pathBefore.isSymbolicLink() || !pathBefore.isFile()) throw new Error(`${label}: ${target}`);
    handle = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_CLOEXEC);
    const descriptorBefore = await handle.stat({ bigint: true });
    if (identity(pathBefore) !== identity(descriptorBefore)) throw new Error(`${label}: ${target}`);
    const result = await hashHandle(handle);
    const descriptorAfter = await handle.stat({ bigint: true });
    const pathAfter = await lstat(target, { bigint: true });
    if (identity(descriptorBefore) !== identity(descriptorAfter) || identity(descriptorAfter) !== identity(pathAfter)
      || result.digest !== expectedDigest || result.bytes !== expectedBytes) throw new Error(`${label}: ${target}`);
    return result;
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ELOOP') throw new Error(`${label}: ${target}`);
    throw error;
  } finally {
    await handle?.close();
  }
}

export async function ingestSource(sourcePath, casDirectory, options = {}) {
  let pathBefore;
  try {
    pathBefore = await lstat(sourcePath, { bigint: true });
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`SOURCE_MISSING: ${sourcePath}`);
    throw error;
  }
  if (pathBefore.isSymbolicLink()) throw new Error(`SOURCE_SYMLINK: ${sourcePath}`);
  if (!pathBefore.isFile()) throw new Error(`SOURCE_NOT_REGULAR: ${sourcePath}`);
  await mkdir(casDirectory, { recursive: true, mode: 0o700 });
  await chmod(casDirectory, 0o700);
  const temp = path.join(casDirectory, `.tmp-${process.pid}-${randomUUID()}`);
  let source;
  let temporary;
  try {
    source = await open(sourcePath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_CLOEXEC);
    const descriptorBefore = await source.stat({ bigint: true });
    if (!descriptorBefore.isFile() || identity(pathBefore) !== identity(descriptorBefore)) throw new Error(`SOURCE_REPLACED: ${sourcePath}`);
    temporary = await open(temp, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_CLOEXEC, 0o600);
    const hash = createHash('sha256');
    const buffer = Buffer.alloc(64 * 1024);
    let bytes = 0;
    let first = true;
    while (true) {
      const { bytesRead } = await source.read(buffer, 0, buffer.length, null);
      if (!bytesRead) break;
      const chunk = buffer.subarray(0, bytesRead);
      hash.update(chunk);
      await temporary.write(chunk);
      bytes += bytesRead;
      if (first && options.afterFirstChunk) {
        first = false;
        await options.afterFirstChunk();
      }
    }
    const digest = hash.digest('hex');
    await temporary.sync();
    const descriptorAfter = await source.stat({ bigint: true });
    const pathAfter = await lstat(sourcePath, { bigint: true });
    if (identity(descriptorBefore) !== identity(descriptorAfter) || identity(descriptorAfter) !== identity(pathAfter)) {
      throw new Error(`SOURCE_MUTATED: ${sourcePath}`);
    }
    if (options.expectedSha256 && options.expectedSha256 !== digest) throw new Error(`SOURCE_HASH_DRIFT: expected ${options.expectedSha256}, got ${digest}`);
    await temporary.close();
    temporary = undefined;
    const target = path.join(casDirectory, digest);
    let cacheHit = false;
    try {
      await link(temp, target);
      const directory = await open(casDirectory, constants.O_RDONLY | constants.O_DIRECTORY);
      await directory.sync();
      await directory.close();
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      cacheHit = true;
      await verifyCasObject(target, digest, bytes);
    }
    await unlink(temp);
    return { digest, bytes, casPath: target, cacheHit, source: { size: Number(descriptorAfter.size), mtimeNs: descriptorAfter.mtimeNs.toString(), dev: descriptorAfter.dev.toString(), ino: descriptorAfter.ino.toString() } };
  } finally {
    await source?.close();
    await temporary?.close();
    await unlink(temp).catch((error) => { if (error?.code !== 'ENOENT') throw error; });
  }
}

export function validatePins(pins) {
  for (const kind of ['tool', 'model', 'container']) {
    if (!digestPattern.test(pins?.[kind] ?? '')) throw new Error(`UNPINNED_${kind.toUpperCase()}: ${pins?.[kind] ?? 'missing'}`);
  }
}

export function validatePinBindings(pins, locks, runtimeVersion) {
  validatePins(pins);
  const resolved = {};
  for (const kind of ['tool', 'model', 'container']) {
    const expectedKind = `${kind}s`;
    const lock = locks?.[kind];
    if (lock?.kind !== expectedKind) throw new Error(`PIN_LOCK_KIND_MISMATCH: ${kind}`);
    const matches = lock.entries.filter(({ digest }) => digest === pins[kind]);
    if (matches.length !== 1) throw new Error(`PIN_LOCK_MISSING: ${kind} ${pins[kind]}`);
    resolved[kind] = matches[0];
  }
  const version = runtimeVersion.replace(/^v/, '');
  if (resolved.tool.id !== 'node' || resolved.tool.version !== version
    || resolved.container.locator !== `host:node-v${version}`) {
    throw new Error(`RUNTIME_IDENTITY_MISMATCH: actual node-v${version}`);
  }
  return resolved;
}

function topologicalNodes(nodes) {
  const byId = new Map();
  for (const node of nodes) {
    if (byId.has(node.id)) throw new Error(`DUPLICATE_GRAPH_NODE: ${node.id}`);
    byId.set(node.id, node);
  }
  const ordered = [];
  const visiting = new Set();
  const visited = new Set();
  const visit = (node) => {
    if (visiting.has(node.id)) throw new Error(`GRAPH_CYCLE: ${node.id}`);
    if (visited.has(node.id)) return;
    visiting.add(node.id);
    for (const dependency of node.dependsOn ?? []) {
      const upstream = byId.get(dependency);
      if (!upstream) throw new Error(`DANGLING_GRAPH_NODE: ${dependency}`);
      visit(upstream);
    }
    visiting.delete(node.id);
    visited.add(node.id);
    ordered.push(node);
  };
  for (const node of nodes) visit(node);
  return ordered;
}

export async function executeGraph(graph, statePath, options = {}) {
  await mkdir(path.dirname(statePath), { recursive: true, mode: 0o700 });
  let prior = { nodes: {} };
  try { prior = JSON.parse(await readFile(statePath, 'utf8')); } catch (error) { if (error?.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
  const result = { nodes: [] };
  const completed = new Map();
  for (const node of topologicalNodes(graph.nodes)) {
    const dependencyOutputHashes = (node.dependsOn ?? []).map((id) => ({ id, outputHash: completed.get(id).outputHash }));
    const inputHash = createHash('sha256').update(JSON.stringify({ input: node.input, dependencyOutputHashes })).digest('hex');
    const checkpoint = prior.nodes[node.id];
    let outputHash;
    let cacheHit = false;
    if (checkpoint?.complete === true && checkpoint.inputHash === inputHash) {
      try {
        await verifyStableFile(node.output, checkpoint.outputHash, checkpoint.outputBytes, 'CHECKPOINT_OUTPUT_MISMATCH');
        outputHash = checkpoint.outputHash;
        cacheHit = true;
      } catch (error) {
        if (!/CHECKPOINT_OUTPUT_MISMATCH/.test(error.message)) throw error;
      }
    }
    if (!cacheHit) {
      await mkdir(path.dirname(node.output), { recursive: true, mode: 0o700 });
      const temp = `${node.output}.partial-${process.pid}`;
      const bytes = JSON.stringify({ assetId: node.id, generatedFrom: inputHash, payload: node.input }, null, 2) + '\n';
      await writeFile(temp, bytes, { mode: 0o600 });
      const handle = await open(temp, 'r'); await handle.sync(); await handle.close();
      await rename(temp, node.output);
      outputHash = createHash('sha256').update(bytes).digest('hex');
      const outputBytes = Buffer.byteLength(bytes);
      prior.nodes[node.id] = { inputHash, dependencyOutputHashes, outputHash, outputBytes, complete: true };
      const stateTemp = `${statePath}.partial-${process.pid}`;
      await writeFile(stateTemp, JSON.stringify(prior, null, 2) + '\n', { mode: 0o600 });
      await rename(stateTemp, statePath);
    }
    const outputBytes = Number((await stat(node.output)).size);
    const completedNode = { id: node.id, cacheHit, inputHash, dependencyOutputHashes, outputHash, outputBytes };
    completed.set(node.id, completedNode);
    result.nodes.push(completedNode);
    await options.afterNode?.(completedNode);
  }
  return result;
}
