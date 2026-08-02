/**
 * Distinct procedural silhouettes for ship-pack species (original ids only).
 * Each must pass mesh QA (non-cube, non-paper-thin) and read at battle distance.
 */
import * as THREE from 'three';
import { makeSurfaceMaterial, type MaterialKind } from '../render/materials.ts';

export const SPECIES_COLOR: Record<string, number> = {
  emberpup: 0xe87840,
  dewkin: 0x4aa8e8,
  leafit: 0x5cbc6a,
  dustbun: 0xe8e0d4,
  sparkmoth: 0xc9d44a,
};

function addMesh(
  g: THREE.Group,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = 1,
  sz = 1,
  rx = 0,
  ry = 0,
  rz = 0,
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.rotation.set(rx, ry, rz);
  g.add(m);
  return m;
}

function mat(color: number, kind: MaterialKind, extra?: Partial<{ emissive: number; emissiveIntensity: number }>) {
  return makeSurfaceMaterial({ color, kind, ...extra });
}

/** Fire-type pup: elongated body, snout, upright ears, flame tail. Fur + ember. */
export function buildEmberpup(scale: number): THREE.Group {
  const g = new THREE.Group();
  const fur = mat(0xe87840, 'fur');
  const dark = mat(0xc45a28, 'fur');
  const ember = mat(0xff8844, 'ember', { emissive: 0xff5522, emissiveIntensity: 0.45 });
  const eye = mat(0x1a1208, 'shell');

  // Torso (horizontal ellipsoid — not a sphere)
  addMesh(g, new THREE.SphereGeometry(0.42, 24, 18), fur, 0, 0.48 * scale, 0.05, 1.15 * scale, 0.85 * scale, 1.35 * scale);
  // Chest
  addMesh(g, new THREE.SphereGeometry(0.28, 16, 12), dark, 0, 0.42 * scale, 0.28 * scale, scale, 0.9 * scale, scale);
  // Head
  addMesh(g, new THREE.SphereGeometry(0.32, 20, 16), fur, 0, 0.92 * scale, 0.38 * scale, 1.05 * scale, 0.95 * scale, 1.1 * scale);
  // Snout
  addMesh(g, new THREE.SphereGeometry(0.14, 12, 10), dark, 0, 0.82 * scale, 0.62 * scale, 0.9 * scale, 0.7 * scale, 1.2 * scale);
  // Ears (tall cones)
  addMesh(g, new THREE.ConeGeometry(0.1, 0.38, 8), ember, -0.18 * scale, 1.22 * scale, 0.35 * scale, scale, scale, scale, 0.15, 0, -0.25);
  addMesh(g, new THREE.ConeGeometry(0.1, 0.38, 8), ember, 0.18 * scale, 1.22 * scale, 0.35 * scale, scale, scale, scale, 0.15, 0, 0.25);
  // Legs
  for (const [lx, lz] of [
    [-0.22, 0.28],
    [0.22, 0.28],
    [-0.22, -0.22],
    [0.22, -0.22],
  ] as const) {
    addMesh(g, new THREE.CylinderGeometry(0.07, 0.09, 0.32, 8), dark, lx * scale, 0.16 * scale, lz * scale, scale, scale, scale);
  }
  // Flame tail
  addMesh(g, new THREE.ConeGeometry(0.14, 0.55, 8), ember, 0, 0.55 * scale, -0.55 * scale, scale, scale, scale, Math.PI * 0.55, 0, 0);
  // Eyes
  addMesh(g, new THREE.SphereGeometry(0.05, 8, 8), eye, -0.12 * scale, 0.98 * scale, 0.58 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.05, 8, 8), eye, 0.12 * scale, 0.98 * scale, 0.58 * scale, scale, scale, scale);

  g.userData.speciesId = 'emberpup';
  g.userData.materialKind = 'fur';
  return g;
}

/** Water otter-kin: upright torso, tail, fin ears, wet scales. */
export function buildDewkin(scale: number): THREE.Group {
  const g = new THREE.Group();
  const body = mat(0x4aa8e8, 'wet');
  const belly = mat(0xc8e8f8, 'wet');
  const scaleMat = mat(0x2e7eb8, 'scale');
  const eye = mat(0x0a1a28, 'shell');

  // Upright body
  addMesh(g, new THREE.CapsuleGeometry(0.32, 0.55, 6, 12), body, 0, 0.7 * scale, 0, scale, scale, scale);
  // Belly plate
  addMesh(g, new THREE.SphereGeometry(0.22, 16, 12), belly, 0, 0.55 * scale, 0.18 * scale, 1.1 * scale, 1.2 * scale, 0.7 * scale);
  // Head
  addMesh(g, new THREE.SphereGeometry(0.28, 18, 14), body, 0, 1.22 * scale, 0.08 * scale, 1.05 * scale, 0.95 * scale, 1.1 * scale);
  // Fin ears
  addMesh(g, new THREE.ConeGeometry(0.12, 0.28, 6), scaleMat, -0.22 * scale, 1.4 * scale, 0, scale, scale, 0.4 * scale, 0, 0, 0.6);
  addMesh(g, new THREE.ConeGeometry(0.12, 0.28, 6), scaleMat, 0.22 * scale, 1.4 * scale, 0, scale, scale, 0.4 * scale, 0, 0, -0.6);
  // Arms
  addMesh(g, new THREE.CapsuleGeometry(0.08, 0.28, 4, 8), body, -0.38 * scale, 0.75 * scale, 0.05 * scale, scale, scale, scale, 0, 0, 0.4);
  addMesh(g, new THREE.CapsuleGeometry(0.08, 0.28, 4, 8), body, 0.38 * scale, 0.75 * scale, 0.05 * scale, scale, scale, scale, 0, 0, -0.4);
  // Legs short
  addMesh(g, new THREE.CapsuleGeometry(0.09, 0.18, 4, 8), scaleMat, -0.14 * scale, 0.22 * scale, 0.02 * scale, scale, scale, scale);
  addMesh(g, new THREE.CapsuleGeometry(0.09, 0.18, 4, 8), scaleMat, 0.14 * scale, 0.22 * scale, 0.02 * scale, scale, scale, scale);
  // Tail
  addMesh(g, new THREE.SphereGeometry(0.18, 12, 10), body, 0, 0.45 * scale, -0.4 * scale, 0.7 * scale, 0.55 * scale, 1.4 * scale);
  addMesh(g, new THREE.ConeGeometry(0.12, 0.35, 6), scaleMat, 0, 0.4 * scale, -0.72 * scale, scale, scale, scale, Math.PI / 2, 0, 0);
  // Eyes
  addMesh(g, new THREE.SphereGeometry(0.055, 8, 8), eye, -0.1 * scale, 1.28 * scale, 0.28 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.055, 8, 8), eye, 0.1 * scale, 1.28 * scale, 0.28 * scale, scale, scale, scale);

  g.userData.speciesId = 'dewkin';
  g.userData.materialKind = 'scale';
  return g;
}

/** Leaf starter (optional id): bipedal plant with leaf crest. Feather-like foliage. */
export function buildLeafit(scale: number): THREE.Group {
  const g = new THREE.Group();
  const body = mat(0x5cbc6a, 'fur');
  const leaf = mat(0x3a9a48, 'feather');
  const stem = mat(0x8bc34a, 'feather');
  const eye = mat(0x1a2a10, 'shell');

  // Tall biped plant — sparse parts so volume/bbox stays under cube threshold
  addMesh(g, new THREE.CapsuleGeometry(0.28, 0.5, 6, 12), body, 0, 0.65 * scale, 0, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.26, 16, 14), body, 0, 1.2 * scale, 0.06 * scale, scale, 0.9 * scale, scale);
  // Tall leaf crest + side fronds (extends bbox without filling it)
  addMesh(g, new THREE.ConeGeometry(0.18, 0.7, 7), leaf, 0, 1.7 * scale, -0.05 * scale, scale, scale, 0.3 * scale);
  addMesh(g, new THREE.ConeGeometry(0.14, 0.55, 6), stem, -0.32 * scale, 1.35 * scale, 0.05 * scale, scale, scale, 0.25 * scale, 0, 0, 0.9);
  addMesh(g, new THREE.ConeGeometry(0.14, 0.55, 6), stem, 0.32 * scale, 1.35 * scale, 0.05 * scale, scale, scale, 0.25 * scale, 0, 0, -0.9);
  addMesh(g, new THREE.ConeGeometry(0.1, 0.4, 5), leaf, 0, 1.0 * scale, -0.35 * scale, scale, scale, 0.25 * scale, Math.PI / 2.5, 0, 0);
  // Arms/legs outstretched
  addMesh(g, new THREE.CapsuleGeometry(0.06, 0.35, 4, 8), body, -0.42 * scale, 0.75 * scale, 0, scale, scale, scale, 0, 0, 0.7);
  addMesh(g, new THREE.CapsuleGeometry(0.06, 0.35, 4, 8), body, 0.42 * scale, 0.75 * scale, 0, scale, scale, scale, 0, 0, -0.7);
  addMesh(g, new THREE.CapsuleGeometry(0.07, 0.28, 4, 8), body, -0.12 * scale, 0.2 * scale, 0.05 * scale, scale, scale, scale);
  addMesh(g, new THREE.CapsuleGeometry(0.07, 0.28, 4, 8), body, 0.12 * scale, 0.2 * scale, 0.05 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.045, 8, 8), eye, -0.09 * scale, 1.22 * scale, 0.26 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.045, 8, 8), eye, 0.09 * scale, 1.22 * scale, 0.26 * scale, scale, scale, scale);

  g.userData.speciesId = 'leafit';
  g.userData.materialKind = 'feather';
  return g;
}

/** Dust rabbit wild: long ears, compact round body, short limbs. Fur. */
export function buildDustbun(scale: number): THREE.Group {
  const g = new THREE.Group();
  const fur = mat(0xe8e0d4, 'fur');
  const blush = mat(0xd4a090, 'fur');
  const earIn = mat(0xf0c8c0, 'fur');
  const eye = mat(0x2a2018, 'shell');

  // Body round but wider than tall-sphere alone
  addMesh(g, new THREE.SphereGeometry(0.45, 22, 18), fur, 0, 0.48 * scale, 0, 1.15 * scale, 1.0 * scale, 1.05 * scale);
  // Head
  addMesh(g, new THREE.SphereGeometry(0.34, 18, 14), fur, 0, 0.95 * scale, 0.12 * scale, scale, 0.95 * scale, scale);
  // Long ears (signature silhouette)
  addMesh(g, new THREE.CapsuleGeometry(0.07, 0.55, 4, 8), fur, -0.14 * scale, 1.45 * scale, 0.05 * scale, scale, scale, scale, 0.1, 0, -0.15);
  addMesh(g, new THREE.CapsuleGeometry(0.07, 0.55, 4, 8), fur, 0.14 * scale, 1.45 * scale, 0.05 * scale, scale, scale, scale, 0.1, 0, 0.15);
  addMesh(g, new THREE.CapsuleGeometry(0.04, 0.4, 4, 6), earIn, -0.14 * scale, 1.42 * scale, 0.08 * scale, scale, scale, scale, 0.1, 0, -0.15);
  addMesh(g, new THREE.CapsuleGeometry(0.04, 0.4, 4, 6), earIn, 0.14 * scale, 1.42 * scale, 0.08 * scale, scale, scale, scale, 0.1, 0, 0.15);
  // Cheek fluff
  addMesh(g, new THREE.SphereGeometry(0.12, 10, 8), blush, -0.28 * scale, 0.9 * scale, 0.15 * scale, scale, 0.8 * scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.12, 10, 8), blush, 0.28 * scale, 0.9 * scale, 0.15 * scale, scale, 0.8 * scale, scale);
  // Legs
  addMesh(g, new THREE.SphereGeometry(0.12, 10, 8), fur, -0.2 * scale, 0.12 * scale, 0.1 * scale, 1.1 * scale, 0.7 * scale, 1.2 * scale);
  addMesh(g, new THREE.SphereGeometry(0.12, 10, 8), fur, 0.2 * scale, 0.12 * scale, 0.1 * scale, 1.1 * scale, 0.7 * scale, 1.2 * scale);
  // Cotton tail
  addMesh(g, new THREE.SphereGeometry(0.14, 10, 8), fur, 0, 0.4 * scale, -0.42 * scale, scale, scale, scale);
  // Eyes
  addMesh(g, new THREE.SphereGeometry(0.05, 8, 8), eye, -0.1 * scale, 1.0 * scale, 0.38 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.05, 8, 8), eye, 0.1 * scale, 1.0 * scale, 0.38 * scale, scale, scale, scale);

  g.userData.speciesId = 'dustbun';
  g.userData.materialKind = 'fur';
  return g;
}

/** Bug/electric moth: elongated thorax, large wings, antennae. Feather + shell. */
export function buildSparkmoth(scale: number): THREE.Group {
  const g = new THREE.Group();
  const body = mat(0xc9d44a, 'shell');
  const dark = mat(0x6a7030, 'shell');
  const wing = mat(0xe8f06a, 'feather', { emissive: 0xa0d020, emissiveIntensity: 0.25 });
  const spark = mat(0xfff59a, 'ember', { emissive: 0xffee66, emissiveIntensity: 0.55 });
  const eye = mat(0x1a1a08, 'shell');

  // Thorax / abdomen (horizontal capsule — moth profile)
  addMesh(g, new THREE.CapsuleGeometry(0.18, 0.55, 6, 10), body, 0, 0.7 * scale, 0, scale, scale, scale, 0, 0, Math.PI / 2);
  // Head
  addMesh(g, new THREE.SphereGeometry(0.2, 14, 12), dark, 0, 0.75 * scale, 0.42 * scale, scale, scale, scale);
  // Wings (wide — silhouette at battle distance)
  addMesh(g, new THREE.SphereGeometry(0.45, 16, 12), wing, -0.45 * scale, 0.85 * scale, 0, 1.1 * scale, 0.25 * scale, 0.7 * scale, 0.2, 0.3, 0.15);
  addMesh(g, new THREE.SphereGeometry(0.45, 16, 12), wing, 0.45 * scale, 0.85 * scale, 0, 1.1 * scale, 0.25 * scale, 0.7 * scale, 0.2, -0.3, -0.15);
  // Lower wings
  addMesh(g, new THREE.SphereGeometry(0.28, 12, 10), wing, -0.3 * scale, 0.55 * scale, -0.15 * scale, scale, 0.2 * scale, 0.7 * scale);
  addMesh(g, new THREE.SphereGeometry(0.28, 12, 10), wing, 0.3 * scale, 0.55 * scale, -0.15 * scale, scale, 0.2 * scale, 0.7 * scale);
  // Antennae
  addMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), dark, -0.08 * scale, 1.05 * scale, 0.5 * scale, scale, scale, scale, 0.4, 0, 0.3);
  addMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), dark, 0.08 * scale, 1.05 * scale, 0.5 * scale, scale, scale, scale, 0.4, 0, -0.3);
  addMesh(g, new THREE.SphereGeometry(0.06, 8, 8), spark, -0.12 * scale, 1.22 * scale, 0.58 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.06, 8, 8), spark, 0.12 * scale, 1.22 * scale, 0.58 * scale, scale, scale, scale);
  // Legs thin but multiple for volume
  for (let i = 0; i < 3; i++) {
    const z = 0.15 - i * 0.15;
    addMesh(g, new THREE.CylinderGeometry(0.025, 0.02, 0.35, 5), dark, -0.12 * scale, 0.4 * scale, z * scale, scale, scale, scale, 0, 0, 0.5);
    addMesh(g, new THREE.CylinderGeometry(0.025, 0.02, 0.35, 5), dark, 0.12 * scale, 0.4 * scale, z * scale, scale, scale, scale, 0, 0, -0.5);
  }
  // Eyes
  addMesh(g, new THREE.SphereGeometry(0.06, 8, 8), eye, -0.08 * scale, 0.78 * scale, 0.55 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.06, 8, 8), eye, 0.08 * scale, 0.78 * scale, 0.55 * scale, scale, scale, scale);

  g.userData.speciesId = 'sparkmoth';
  g.userData.materialKind = 'feather';
  return g;
}

/** Fallback blob — still multi-part so QA can pass; not used for ship species. */
export function buildGeneric(color: number, scale: number): THREE.Group {
  const g = new THREE.Group();
  const m = mat(color, 'fur');
  addMesh(g, new THREE.SphereGeometry(0.4, 16, 12), m, 0, 0.5 * scale, 0, 1.2 * scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.28, 12, 10), m, 0, 0.95 * scale, 0.1 * scale, scale, scale, scale);
  addMesh(g, new THREE.ConeGeometry(0.12, 0.3, 6), m, -0.2 * scale, 1.2 * scale, 0, scale, scale, scale);
  addMesh(g, new THREE.ConeGeometry(0.12, 0.3, 6), m, 0.2 * scale, 1.2 * scale, 0, scale, scale, scale);
  addMesh(g, new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8), m, -0.2 * scale, 0.15 * scale, 0.1 * scale, scale, scale, scale);
  addMesh(g, new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8), m, 0.2 * scale, 0.15 * scale, 0.1 * scale, scale, scale, scale);
  g.userData.speciesId = 'generic';
  g.userData.materialKind = 'fur';
  return g;
}

export type SpeciesBuilder = (scale: number) => THREE.Group;

export const SPECIES_BUILDERS: Record<string, SpeciesBuilder> = {
  emberpup: buildEmberpup,
  dewkin: buildDewkin,
  leafit: buildLeafit,
  dustbun: buildDustbun,
  sparkmoth: buildSparkmoth,
};
