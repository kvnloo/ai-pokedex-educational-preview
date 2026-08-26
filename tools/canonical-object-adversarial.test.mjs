#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {
  bindCanonicalTemplateProvenance,
  stampCanonicalRenderClone,
  verifyCanonicalRenderObject,
} from '../src/creatures/canonicalObjectProvenance.ts';

function fixture(textured = false) {
  const root = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x45a060 });
  if (textured) {
    material.map = new THREE.DataTexture(new Uint8Array([255, 0, 0, 255]), 1, 1);
    material.map.needsUpdate = true;
  }
  root.add(new THREE.Mesh(
    new THREE.BufferGeometry()
      .setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3))
      .setIndex([0, 1, 2]),
    material,
  ));
  return root;
}

async function boundClone(textured = false) {
  const template = fixture(textured);
  await bindCanonicalTemplateProvenance(template, {
    speciesId: 'bulbasaur', sourceSha256: 'e'.repeat(64), sourceSceneUuid: 'parsed', animationVariant: 'none',
  });
  const clone = template.clone(true);
  clone.scale.multiplyScalar(0.9);
  stampCanonicalRenderClone(clone, template, 0.9);
  return clone;
}

const expected = { speciesId: 'bulbasaur', sourceSha256: 'e'.repeat(64), scale: 0.9 };

test('actual local and world transforms are sealed after scene attachment', async () => {
  const parent = new THREE.Group();
  const clone = await boundClone();
  parent.add(clone);
  parent.updateMatrixWorld(true);
  await verifyCanonicalRenderObject(clone, expected);
  clone.scale.setScalar(99);
  parent.updateMatrixWorld(true);
  await assert.rejects(() => verifyCanonicalRenderObject(clone, expected), /transform lineage mismatch/);
});

test('rendered child effective scale mutation invalidates the sealed tree', async () => {
  const parent = new THREE.Group();
  const clone = await boundClone();
  parent.add(clone);
  parent.updateMatrixWorld(true);
  await verifyCanonicalRenderObject(clone, expected);
  clone.children[0].scale.setScalar(99);
  parent.updateMatrixWorld(true);
  assert.ok(Math.abs(new THREE.Vector3().setFromMatrixScale(clone.children[0].matrixWorld).x - 89.1) < 1e-9);
  await assert.rejects(() => verifyCanonicalRenderObject(clone, expected), /render tree lineage mismatch/);
});

test('parent transform and reparenting invalidate the sealed world transform', async () => {
  const parent = new THREE.Group();
  const clone = await boundClone();
  parent.add(clone);
  parent.updateMatrixWorld(true);
  await verifyCanonicalRenderObject(clone, expected);
  parent.rotation.y = 0.5;
  parent.updateMatrixWorld(true);
  await assert.rejects(() => verifyCanonicalRenderObject(clone, expected), /transform lineage mismatch/);
});

test('texture pixels and sampler state are sealed and reverified', async () => {
  const clone = await boundClone(true);
  clone.updateMatrixWorld(true);
  await verifyCanonicalRenderObject(clone, expected);
  const texture = clone.children[0].material.map;
  texture.image.data[0] = 0;
  texture.needsUpdate = true;
  await assert.rejects(() => verifyCanonicalRenderObject(clone, expected), /material lineage mismatch/);
  texture.image.data[0] = 255;
  texture.wrapS = THREE.RepeatWrapping;
  await assert.rejects(() => verifyCanonicalRenderObject(clone, expected), /material lineage mismatch/);
});
