import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const dist = path.join(root, 'dist');
const forbidden = ['wave0.json', 'emberpup', 'dustbun', 'dewkin', 'leafit', 'leafkit', 'sparkmoth', 'ironwisp', 'gloomhorn', 'mossprite', 'rivlet'];
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file); else files.push(file);
  }
}
walk(dist);
for (const file of files) {
  const payload = `${path.relative(dist, file)}\n${fs.readFileSync(file).toString('latin1')}`.toLowerCase();
  for (const token of forbidden) assert.equal(payload.includes(token), false, `${path.relative(dist, file)} leaked ${token}`);
}
assert.ok(files.some(file => file.endsWith('kanto-private.json')), 'canonical private pack was copied');
console.log(`private bundle golden: PASS (${files.length} files scanned)`);