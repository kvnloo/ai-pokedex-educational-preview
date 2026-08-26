#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { chmodSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, statSync, writeFileSync, closeSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const MANIFEST = 'build-manifest.json';
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

export function verifyAndFreezeBuild({ source, expectedManifestSha256, expectedGitSha, destinationParent }) {
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
  const directory = join(resolve(destinationParent), `.verified-build-${expectedManifestSha256}-${randomUUID()}`);
  mkdirSync(directory, { mode: 0o700 });
  for (const path of [...committed, MANIFEST]) {
    const target = join(directory, path);
    mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
    const descriptor = openSync(target, 'wx', 0o400);
    writeFileSync(descriptor, readFileSync(join(sourceRoot, path)));
    closeSync(descriptor);
    chmodSync(target, 0o400);
  }
  const receipt = { schemaVersion: 1, manifestSha256: expectedManifestSha256, gitSha: expectedGitSha, files: manifest.files };
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
      const expected = receipt.files[requested];
      if (!expected || sha256(bytes) !== expected.sha256) throw new Error('response drift');
      response.setHeader('x-verified-sha256', expected.sha256);
      response.setHeader('cache-control', 'no-store');
      response.end(bytes);
    } catch { response.statusCode = 404; response.end(); }
  }).listen(port, '127.0.0.1');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = parseArgs(process.argv.slice(2));
  const frozen = verifyAndFreezeBuild({ source: args.dist, expectedManifestSha256: args['manifest-sha256'], expectedGitSha: args['git-sha'], destinationParent: args['freeze-parent'] ?? dirname(resolve(args.dist)) });
  const port = Number(args.port ?? 5292);
  serveVerifiedBuild(frozen.directory, frozen.receipt, port);
  process.stdout.write(`${JSON.stringify({ url: `http://127.0.0.1:${port}`, directory: frozen.directory, receipt: frozen.receipt })}\n`);
}
