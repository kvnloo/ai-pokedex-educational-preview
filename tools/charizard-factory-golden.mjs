#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifestPath = new URL('../experiments/charizard-006/creature-asset-manifest.v1.json', import.meta.url);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

assert.equal(manifest.schema, 'CreatureAssetManifest');
assert.equal(manifest.schemaVersion, 1);
assert.deepEqual(manifest.identity, {
  nationalDexId: 6,
  slug: 'charizard',
  form: 'standard',
  shiny: false,
});
assert.equal(manifest.artifactPolicy.privateRoot, '/mnt/zer0models/pokemon_anime/pipeline/golden/charizard-006');
assert.equal(manifest.artifactPolicy.protectedPixelsAllowedInPublic, false);
assert.equal(manifest.status.productionApproved, false);
assert.equal(manifest.status.blockedAt, 'source-plate-hitl');

const stageIds = manifest.stages.map((stage) => stage.id);
assert.deepEqual(stageIds, [
  'identity-contract',
  'source-matrix',
  'segmentation-plate-qa',
  'matched-shape-sweep',
  'component-mesh-qa',
  'blind-identity-jury',
  'retopo-material-lod',
  'rig',
  'animation',
  'living-encounter',
  'final-evidence',
]);

for (const stage of manifest.stages) {
  assert.ok(['complete', 'blocked', 'pending', 'rejected'].includes(stage.status), `${stage.id}: invalid status`);
  assert.ok(Array.isArray(stage.requires), `${stage.id}: requires must be an array`);
  assert.ok(Array.isArray(stage.acceptance) && stage.acceptance.length > 0, `${stage.id}: acceptance is required`);
  assert.ok(stage.cacheKeyInputs.length > 0, `${stage.id}: cache key inputs are required`);
}

const sourceStage = manifest.stages.find((stage) => stage.id === 'source-matrix');
assert.equal(sourceStage.status, 'blocked');
assert.ok(sourceStage.acceptance.some((rule) => rule.includes('observed')));
assert.ok(sourceStage.acceptance.some((rule) => rule.includes('inferred')));

const meshStage = manifest.stages.find((stage) => stage.id === 'component-mesh-qa');
for (const rule of ['connected component', 'background slab', 'limb count', 'wing', 'tail']) {
  assert.ok(meshStage.acceptance.some((entry) => entry.toLowerCase().includes(rule)), `mesh QA missing ${rule}`);
}

const animationStage = manifest.stages.find((stage) => stage.id === 'animation');
for (const clip of ['grounded-idle', 'walk', 'run', 'takeoff', 'hover', 'forward-flight', 'landing', 'fire-breath', 'faint']) {
  assert.ok(animationStage.requiredClips.includes(clip), `animation contract missing ${clip}`);
}

assert.equal(manifest.validationCohort.policy, 'future-only');
assert.deepEqual(manifest.validationCohort.species.map(({ nationalDexId }) => nationalDexId), [448, 831, 130, 132]);

console.log(JSON.stringify({
  ok: true,
  manifest: manifestPath.pathname,
  stages: manifest.stages.length,
  blockedAt: manifest.status.blockedAt,
}, null, 2));
