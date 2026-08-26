#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {
  bindCanonicalTemplateProvenance,
  stampCanonicalRenderClone,
  verifyCanonicalRenderObject,
} from '../src/creatures/canonicalObjectProvenance.ts';

function canonicalFixture() {
  const root = new THREE.Group();
  root.name = 'canonical:bulbasaur';
  root.add(new THREE.Mesh(
    new THREE.BufferGeometry()
      .setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3))
      .setIndex([0, 1, 2]),
    new THREE.MeshStandardMaterial({ color: 0x45a060, roughness: 0.7 }),
  ));
  return root;
}

test('receipt input binds source, parsed lineage, geometry, material, scale, and render UUID lineage', async () => {
  const template = canonicalFixture();
  await bindCanonicalTemplateProvenance(template, {
    speciesId: 'bulbasaur',
    sourceSha256: 'a'.repeat(64),
    sourceSceneUuid: 'parsed-scene-uuid',
    animationVariant: 'none',
  });
  const clone = template.clone(true);
  stampCanonicalRenderClone(clone, template, 0.9);

  const binding = await verifyCanonicalRenderObject(clone, {
    speciesId: 'bulbasaur', sourceSha256: 'a'.repeat(64), scale: 0.9,
  });
  assert.equal(binding.sourceSceneUuid, 'parsed-scene-uuid');
  assert.equal(binding.renderRootUuid, clone.uuid);
  assert.equal(binding.templateRootUuid, template.uuid);
  assert.match(binding.geometrySha256, /^[a-f0-9]{64}$/);
  assert.match(binding.materialSha256, /^[a-f0-9]{64}$/);
});

test('BoxGeometry and copied metadata cannot impersonate the canonical render object', async () => {
  const template = canonicalFixture();
  await bindCanonicalTemplateProvenance(template, {
    speciesId: 'bulbasaur', sourceSha256: 'b'.repeat(64), sourceSceneUuid: 'parsed', animationVariant: 'none',
  });
  const impostor = new THREE.Group();
  impostor.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()));
  impostor.userData = structuredClone(template.userData);
  impostor.userData.scale = 0.9;
  impostor.userData.renderRootUuid = impostor.uuid;

  await assert.rejects(
    () => verifyCanonicalRenderObject(impostor, {
      speciesId: 'bulbasaur', sourceSha256: 'b'.repeat(64), scale: 0.9,
    }),
    /geometry lineage mismatch|template UUID lineage mismatch/,
  );
});

test('altered material, source hash, or scale is rejected', async () => {
  const template = canonicalFixture();
  await bindCanonicalTemplateProvenance(template, {
    speciesId: 'bulbasaur', sourceSha256: 'c'.repeat(64), sourceSceneUuid: 'parsed', animationVariant: 'none',
  });
  const clone = template.clone(true);
  stampCanonicalRenderClone(clone, template, 1.02);
  clone.traverse((object) => {
    if (object instanceof THREE.Mesh) object.material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  });
  await assert.rejects(() => verifyCanonicalRenderObject(clone, {
    speciesId: 'bulbasaur', sourceSha256: 'c'.repeat(64), scale: 1.02,
  }), /material lineage mismatch/);
  await assert.rejects(() => verifyCanonicalRenderObject(template, {
    speciesId: 'bulbasaur', sourceSha256: 'd'.repeat(64), scale: 1,
  }), /source SHA mismatch/);
});
