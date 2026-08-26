#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const briefs = [
  ['bulbasaur', 1, ['tackle', 'growl', 'vine-whip', 'razor-leaf']],
  ['charmander', 4, ['scratch', 'growl', 'ember', 'smokescreen']],
  ['squirtle', 7, ['tackle', 'tail-whip', 'water-gun', 'withdraw']],
];

const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const hashPattern = /^[a-f0-9]{64}$/;

const standard = await readFile('docs/KANTO-STARTER-AAA-STANDARD.md', 'utf8');
for (const phrase of [
  'canonical observed plate -> local ComfyUI + FLUX.2 Klein',
  'ChatGPT is not an initial sheet generator',
  'playhead-crossing',
  'Godot target contract 4.7.2',
  'Builders do not certify their own work',
]) assert(standard.includes(phrase), `standard missing frozen phrase: ${phrase}`);

for (const [slug, dexId, expectedMoves] of briefs) {
  const path = `experiments/kanto-starters/${slug}.production-brief.v1.json`;
  const data = JSON.parse(await readFile(path, 'utf8'));
  assert(data.schema === 'KantoStarterProductionBrief' && data.schemaVersion === 1, `${slug}: schema`);
  assert(data.identity.speciesId === slug && data.identity.nationalDexId === dexId, `${slug}: identity`);
  assert(data.privateRoot.startsWith('/mnt/zer0models/') && !data.privateRoot.includes('/public/'), `${slug}: private boundary`);
  for (const artifact of [data.authority, data.baseline.raw, data.baseline.lod8k]) {
    assert(hashPattern.test(artifact.sha256), `${slug}: invalid artifact hash`);
  }
  assert(data.baseline.classification === 'blockout-only-visual-review-required', `${slug}: baseline overclaim`);
  assert(data.rig.deformBoneMax <= 96, `${slug}: bone cap`);
  assert(data.budgets.triangles.lod0 > data.budgets.triangles.lod1 && data.budgets.triangles.lod1 > data.budgets.triangles.lod2, `${slug}: non-monotonic LODs`);
  const moves = new Map(data.movePackage.moves.map((move) => [move.moveId, move]));
  assert(JSON.stringify([...moves.keys()]) === JSON.stringify(expectedMoves), `${slug}: exact move order/package`);
  for (const moveId of expectedMoves) {
    const move = moves.get(moveId);
    assert(move?.beats?.length === 5, `${slug}/${moveId}: five beats`);
    assert(Boolean(move?.contactSocket), `${slug}/${moveId}: contact socket`);
  }
  const sourcePath = resolve(data.privateRoot, data.authority.path);
  const sourceBytes = await readFile(sourcePath);
  assert(createHash('sha256').update(sourceBytes).digest('hex') === data.authority.sha256, `${slug}: authority byte hash mismatch`);
  for (const key of ['raw', 'lod8k']) {
    const artifact = data.baseline[key];
    const bytes = await readFile(resolve(data.privateRoot, artifact.path));
    assert(bytes.length === artifact.bytes, `${slug}/${key}: byte count mismatch`);
    assert(createHash('sha256').update(bytes).digest('hex') === artifact.sha256, `${slug}/${key}: byte hash mismatch`);
  }
}

if (failures.length) {
  console.error(`Kanto starter contract FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Kanto starter contract PASS: 3 species, 12 unique five-beat move briefs, source and baseline hashes verified.');
