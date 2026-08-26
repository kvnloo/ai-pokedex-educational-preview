import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  bindCanonicalTemplateProvenance,
  stampCanonicalRenderClone,
} from './canonicalObjectProvenance.ts';

export const CANONICAL_PRIVATE_SPECIES = [
  'bulbasaur', 'charmander', 'squirtle', 'pidgey', 'caterpie', 'geodude',
] as const;

export const CANONICAL_PRIVATE_SOURCE_SHA256: Readonly<Record<string, string>> = Object.freeze({
  bulbasaur: 'cad6e93a2e77d21148f932c27688ff07c5028eb87f3ba9f891a2f3f5ad8e1354',
  charmander: '82c90f71d325d3e93803978cb66e8b6eaceeda5d4280706d9eb388a81975acd2',
  squirtle: 'b41a8ef1fc5caef02ea38eca7fa795ba974645f090e8a0574509d58c381e5805',
  pidgey: '1685b6f5b9215645d274d31480cf9de8c26011aa7e424700f38b9d70cae4e261',
  caterpie: '0a2093b6a4053a075c515591ae9a8f9c88b27fa66c27b72493cdac3648e247f2',
  geodude: 'f337566e5eece5d263cd7725d65563d31c0418fd138fa45663be679728d8d809',
});

const templates = new Map<string, THREE.Group>();

function normalizeCanonicalMesh(scene: THREE.Group, speciesId: string): THREE.Group {
  const root = new THREE.Group();
  root.name = `canonical:${speciesId}`;
  root.add(scene);
  scene.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(scene, true);
  if (box.isEmpty()) throw new Error(`Canonical private asset ${speciesId} has empty geometry`);
  const size = box.getSize(new THREE.Vector3());
  const maxExtent = Math.max(size.x, size.y, size.z);
  const minExtent = Math.min(size.x, size.y, size.z);
  if (!Number.isFinite(maxExtent) || maxExtent <= 0 || minExtent / maxExtent <= 0.12) {
    throw new Error(`Canonical private asset ${speciesId} failed geometry extent gate`);
  }
  const scale = 1.25 / maxExtent;
  scene.scale.setScalar(scale);
  scene.updateWorldMatrix(true, true);
  const normalized = new THREE.Box3().setFromObject(scene, true);
  const center = normalized.getCenter(new THREE.Vector3());
  scene.position.x -= center.x;
  scene.position.z -= center.z;
  scene.position.y -= normalized.min.y;
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
  root.userData.speciesId = speciesId;
  root.userData.identityPlane = 'canonical-private-local';
  root.userData.liveMeshPath = `promoted-glb:hunyuan:${speciesId}`;
  return root;
}

export async function preloadCanonicalPrivateMeshes(speciesIds: readonly string[]): Promise<void> {
  const loader = new GLTFLoader();
  for (const speciesId of speciesIds) {
    if (!CANONICAL_PRIVATE_SPECIES.includes(speciesId as typeof CANONICAL_PRIVATE_SPECIES[number])) {
      throw new Error(`Canonical private species ${speciesId} is not allowlisted; stand-in fallback forbidden`);
    }
    let gltf;
    try {
      const response = await fetch(`/private-assets/${speciesId}.glb`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const sourceSha256 = [...new Uint8Array(digest)]
        .map((byte) => byte.toString(16).padStart(2, '0')).join('');
      if (sourceSha256 !== CANONICAL_PRIVATE_SOURCE_SHA256[speciesId]) {
        throw new Error(`source SHA mismatch for ${speciesId}`);
      }
      gltf = await loader.parseAsync(bytes, '/private-assets/');
    } catch (error) {
      throw new Error(`Canonical private asset missing for ${speciesId}; stand-in fallback forbidden`, { cause: error });
    }
    const template = normalizeCanonicalMesh(gltf.scene, speciesId);
    await bindCanonicalTemplateProvenance(template, {
      speciesId,
      sourceSha256: CANONICAL_PRIVATE_SOURCE_SHA256[speciesId]!,
      sourceSceneUuid: gltf.scene.uuid,
      animationVariant: gltf.animations.map((clip) => clip.name || clip.uuid).join('|') || 'none',
    });
    templates.set(speciesId, template);
  }
}

export function canonicalPrivateMesh(speciesId: string, scale = 1): THREE.Group {
  const template = templates.get(speciesId);
  if (!template) throw new Error(`Canonical private asset ${speciesId} was not preloaded; stand-in fallback forbidden`);
  const root = template.clone(true);
  root.scale.multiplyScalar(scale);
  root.userData.speciesId = speciesId;
  stampCanonicalRenderClone(root, template, scale);
  return root;
}
