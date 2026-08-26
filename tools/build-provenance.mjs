import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

const MANIFEST_FILE = 'build-manifest.json';
const EXECUTABLE_PATTERN = /(?:\.js|\.js\.map|\.css|\.html)$/;

export function sha256File(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function listFiles(root, current = root) {
  const files = [];
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    const path = resolve(current, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(root, path));
    else if (entry.isFile()) files.push(relative(root, path).split(sep).join('/'));
  }
  return files.sort();
}

export function createBuildManifest({ root, gitSha, gitDirty, invocation, canonicalAssets, builtAt }) {
  const files = {};
  for (const path of listFiles(root)) {
    if (path === MANIFEST_FILE) continue;
    const absolute = resolve(root, path);
    files[path] = { sha256: sha256File(absolute), bytes: statSync(absolute).size };
  }
  return {
    schemaVersion: 1,
    git: { sha: gitSha, dirty: Boolean(gitDirty) },
    invocation: [...invocation],
    builtAt,
    files,
    canonicalAssets: structuredClone(canonicalAssets),
  };
}

export function verifyBuildManifestFiles(root, manifest) {
  const failures = [];
  for (const [path, expected] of Object.entries(manifest.files)) {
    const absolute = resolve(root, path);
    try {
      if (sha256File(absolute) !== expected.sha256) failures.push(`hash mismatch: ${path}`);
    } catch {
      failures.push(`missing file: ${path}`);
    }
  }
  const expected = new Set(Object.keys(manifest.files));
  for (const path of listFiles(root)) {
    if (path !== MANIFEST_FILE && EXECUTABLE_PATTERN.test(path) && !expected.has(path)) {
      failures.push(`unexpected executable: ${path}`);
    }
  }
  return failures.sort();
}
