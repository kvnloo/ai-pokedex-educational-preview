#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { chmodSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, statSync, writeFileSync, closeSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const MANIFEST = 'build-manifest.json';
const DEFAULT_PRIVATE_ASSET_ROOT = '/mnt/zer0models/pokemon_anime/pipeline/pokeapi';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function files(root, current = root) {
  const result = [];
  for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = join(current, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`symlink rejected: ${relative(root, absolute)}`);
    if (entry.isDirectory()) result.push(...files(root, absolute));
    else if (entry.isFile()) result.push(relative(root, absolute).split(sep).join('/'));
    else throw new Error(`non-regular build input rejected: ${relative(root, absolute)}`);
  }
  return result;
}

export function verifyAndFreezeBuild({ source, expectedManifestSha256, expectedGitSha, destinationParent, privateAssetRoot = process.env.POKEMON_PRIVATE_ASSET_ROOT ?? DEFAULT_PRIVATE_ASSET_ROOT }) {
  if (!/^[a-f0-9]{64}$/.test(expectedManifestSha256)) throw new Error('expected external manifest SHA-256 is required');
  if (!/^[a-f0-9]{40}$/.test(expectedGitSha)) throw new Error('expected reviewed Git SHA is required');
  const sourceRoot = resolve(source);
  if (lstatSync(sourceRoot).isSymbolicLink() || !statSync(sourceRoot).isDirectory()) throw new Error('build root must be a real directory');
  const manifestBytes = readFileSync(join(sourceRoot, MANIFEST));
  if (sha256(manifestBytes) !== expectedManifestSha256) throw new Error('external manifest root mismatch');
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  if (manifest.git?.dirty || manifest.git?.sha !== expectedGitSha) throw new Error('reviewed clean Git SHA mismatch');
  const discovered = files(sourceRoot).filter((path) => path !== MANIFEST);
  const committed = Object.keys(manifest.files ?? {}).sort();
  if (JSON.stringify(discovered) !== JSON.stringify(committed)) throw new Error('build manifest file-set mismatch');
  for (const path of committed) {
    if (path.startsWith('/') || path.split('/').includes('..')) throw new Error(`unsafe manifest path: ${path}`);
    const bytes = readFileSync(join(sourceRoot, path));
    const expected = manifest.files[path];
    if (bytes.length !== expected.bytes || sha256(bytes) !== expected.sha256) throw new Error(`build byte mismatch: ${path}`);
  }
  const resolvedDestinationParent = resolve(destinationParent);
  mkdirSync(resolvedDestinationParent, { recursive: true, mode: 0o700 });
  const directory = join(resolvedDestinationParent, `.verified-build-${expectedManifestSha256}-${randomUUID()}`);
  mkdirSync(directory, { mode: 0o700 });
  for (const path of [...committed, MANIFEST]) {
    const target = join(directory, path);
    mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
    const descriptor = openSync(target, 'wx', 0o400);
    writeFileSync(descriptor, readFileSync(join(sourceRoot, path)));
    closeSync(descriptor);
    chmodSync(target, 0o400);
  }
  const privateAssets = {};
  for (const [speciesId, asset] of Object.entries(manifest.canonicalAssets ?? {})) {
    if (!privateAssetRoot) throw new Error('private asset root required by reviewed manifest');
    const sourceAsset = resolve(privateAssetRoot, asset.relativePath);
    if (!sourceAsset.startsWith(`${resolve(privateAssetRoot)}${sep}`) || lstatSync(sourceAsset).isSymbolicLink() || !statSync(sourceAsset).isFile()) throw new Error(`private asset rejected: ${speciesId}`);
    const bytes = readFileSync(sourceAsset);
    if (sha256(bytes) !== asset.sha256) throw new Error(`private asset byte mismatch: ${speciesId}`);
    const target = join(directory, 'private-assets', `${speciesId}.glb`);
    mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
    writeFileSync(target, bytes, { flag: 'wx', mode: 0o400 });
    privateAssets[`private-assets/${speciesId}.glb`] = { sha256: asset.sha256, bytes: bytes.length };
  }
  const receipt = { schemaVersion: 1, manifestSha256: expectedManifestSha256, gitSha: expectedGitSha, files: manifest.files, privateAssets };
  writeFileSync(join(directory, 'launcher-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx', mode: 0o400 });
  for (const path of files(directory).map((path) => dirname(join(directory, path))).sort((a, b) => b.length - a.length)) chmodSync(path, 0o500);
  chmodSync(directory, 0o500);
  return { directory, receipt };
}

function parseArgs(argv) {
  const value = {};
  for (let index = 0; index < argv.length; index += 2) value[argv[index].replace(/^--/, '')] = argv[index + 1];
  return value;
}

export function serveVerifiedBuild(directory, receipt, port) {
  return createServer((request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://verified.invalid').pathname;
    if (pathname === '/.well-known/launcher-receipt.json') {
      response.setHeader('content-type', 'application/json');
      response.end(`${JSON.stringify(receipt)}\n`); return;
    }
    const requested = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
    if (requested.split('/').includes('..') || requested === 'launcher-receipt.json') { response.statusCode = 404; response.end(); return; }
    const file = join(directory, requested);
    try {
      const bytes = readFileSync(file);
      const expectedSha256 = requested === MANIFEST ? receipt.manifestSha256 : (receipt.files[requested]?.sha256 ?? receipt.privateAssets?.[requested]?.sha256);
      if (!expectedSha256 || sha256(bytes) !== expectedSha256) throw new Error('response drift');
      response.setHeader('x-verified-sha256', expectedSha256);
      response.setHeader('cache-control', 'no-store');
      if (requested.endsWith('.js')) response.setHeader('content-type', 'text/javascript; charset=utf-8');
      else if (requested.endsWith('.html')) response.setHeader('content-type', 'text/html; charset=utf-8');
      else if (requested.endsWith('.json') || requested.endsWith('.map')) response.setHeader('content-type', 'application/json');
      else if (requested.endsWith('.glb')) response.setHeader('content-type', 'model/gltf-binary');
      response.end(bytes);
    } catch { response.statusCode = 404; response.end(); }
  }).listen(port, '127.0.0.1');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = parseArgs(process.argv.slice(2));
  const frozen = verifyAndFreezeBuild({ source: args.dist, expectedManifestSha256: args['manifest-sha256'], expectedGitSha: args['git-sha'], destinationParent: args['freeze-parent'] ?? dirname(resolve(args.dist)), privateAssetRoot: args['private-asset-root'] });
  const port = Number(args.port ?? 5292);
  serveVerifiedBuild(frozen.directory, frozen.receipt, port);
  process.stdout.write(`${JSON.stringify({ url: `http://127.0.0.1:${port}`, directory: frozen.directory, receipt: frozen.receipt })}\n`);
}
