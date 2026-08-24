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

export async function executeGraph(graph, statePath) {
  await mkdir(path.dirname(statePath), { recursive: true, mode: 0o700 });
  let prior = { nodes: {} };
  try { prior = JSON.parse(await readFile(statePath, 'utf8')); } catch (error) { if (error?.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
  const result = { nodes: [] };
  for (const node of graph.nodes) {
    const inputHash = createHash('sha256').update(JSON.stringify(node.input)).digest('hex');
    let outputHash;
    try { outputHash = createHash('sha256').update(await readFile(node.output)).digest('hex'); } catch (error) { if (error?.code !== 'ENOENT') outputHash = undefined; }
    const checkpoint = prior.nodes[node.id];
    const cacheHit = checkpoint?.inputHash === inputHash && checkpoint?.outputHash === outputHash;
    if (!cacheHit) {
      await mkdir(path.dirname(node.output), { recursive: true, mode: 0o700 });
      const temp = `${node.output}.partial-${process.pid}`;
      const bytes = JSON.stringify({ assetId: node.id, generatedFrom: inputHash, payload: node.input }, null, 2) + '\n';
      await writeFile(temp, bytes, { mode: 0o600 });
      const handle = await open(temp, 'r'); await handle.sync(); await handle.close();
      await rename(temp, node.output);
      outputHash = createHash('sha256').update(bytes).digest('hex');
      prior.nodes[node.id] = { inputHash, outputHash, complete: true };
      const stateTemp = `${statePath}.partial-${process.pid}`;
      await writeFile(stateTemp, JSON.stringify(prior, null, 2) + '\n', { mode: 0o600 });
      await rename(stateTemp, statePath);
    }
    result.nodes.push({ id: node.id, cacheHit, outputHash });
  }
  return result;
}
