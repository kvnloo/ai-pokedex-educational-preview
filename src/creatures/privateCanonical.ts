import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const CANONICAL_PRIVATE_SPECIES = [
  'bulbasaur', 'charmander', 'squirtle', 'pidgey', 'caterpie', 'geodude',
] as const;

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
      gltf = await loader.loadAsync(`/private-assets/${speciesId}.glb`);
    } catch (error) {
      throw new Error(`Canonical private asset missing for ${speciesId}; stand-in fallback forbidden`, { cause: error });
    }
    templates.set(speciesId, normalizeCanonicalMesh(gltf.scene, speciesId));
  }
}

export function canonicalPrivateMesh(speciesId: string, scale = 1): THREE.Group {
  const template = templates.get(speciesId);
  if (!template) throw new Error(`Canonical private asset ${speciesId} was not preloaded; stand-in fallback forbidden`);
  const root = template.clone(true);
  root.scale.multiplyScalar(scale);
  root.userData.speciesId = speciesId;
  return root;
}
