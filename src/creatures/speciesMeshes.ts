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
  leafkit: 0x5cbc6a,
  dustbun: 0xe8e0d4,
  sparkmoth: 0xc9d44a,
  ironwisp: 0x8aa0c8,
  gloomhorn: 0x3d5c38,
  mossprite: 0x6da85a,
  rivlet: 0x55b7c6,
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
  part?: string,
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.rotation.set(rx, ry, rz);
  if (part) m.userData.part = part;
  // Ensure UVs exist for detail maps on primitives that might lack them
  if (m.geometry && !m.geometry.attributes.uv) {
    // Sphere/cone etc. always have uv in three.js; defensive only
  }
  g.add(m);
  return m;
}

function mat(color: number, kind: MaterialKind, extra?: Partial<{ emissive: number; emissiveIntensity: number }>) {
  return makeSurfaceMaterial({ color, kind, ...extra });
}

/** Fire-type pup: long low canine + muzzle + flame tail. Fur + ember. Readable at overworld distance. */
export function buildEmberpup(scale: number): THREE.Group {
  const g = new THREE.Group();
  const fur = mat(0xe87840, 'fur');
  const dark = mat(0xc45a28, 'fur');
  const belly = mat(0xf0a060, 'fur');
  const ember = mat(0xff8844, 'ember', { emissive: 0xff5522, emissiveIntensity: 0.55 });
  const flameHot = mat(0xffcc55, 'ember', { emissive: 0xffaa22, emissiveIntensity: 0.7 });
  const eye = mat(0x1a1208, 'shell');
  const pad = mat(0x3a2010, 'shell');

  // Long horizontal torso along Z (canine volume, not stacked snowman spheres)
  addMesh(
    g,
    new THREE.CapsuleGeometry(0.2, 0.95, 8, 16),
    fur,
    0,
    0.34 * scale,
    0,
    0.9 * scale,
    0.72 * scale,
    1.55 * scale,
    0,
    0,
    Math.PI / 2,
  );
  // Haunches (rear bulk, low)
  addMesh(g, new THREE.SphereGeometry(0.22, 14, 12), dark, 0, 0.32 * scale, -0.48 * scale, 1.2 * scale, 0.82 * scale, 1.05 * scale);
  // Chest forward, low
  addMesh(g, new THREE.SphereGeometry(0.2, 14, 12), dark, 0, 0.36 * scale, 0.48 * scale, 1.05 * scale, 0.85 * scale, 0.95 * scale);
  // Soft belly plate for light catch
  addMesh(g, new THREE.SphereGeometry(0.15, 12, 10), belly, 0, 0.24 * scale, 0.1 * scale, 0.85 * scale, 0.5 * scale, 1.25 * scale);
  // Head low and forward on neck (not stacked high on body)
  addMesh(g, new THREE.SphereGeometry(0.24, 16, 14), fur, 0, 0.48 * scale, 0.72 * scale, 1.0 * scale, 0.88 * scale, 1.05 * scale);
  // Long muzzle / snout past chest
  addMesh(
    g,
    new THREE.CapsuleGeometry(0.085, 0.32, 4, 10),
    dark,
    0,
    0.4 * scale,
    1.02 * scale,
    0.95 * scale,
    0.62 * scale,
    1.2 * scale,
    Math.PI / 2,
    0,
    0,
  );
  // Nose tip
  addMesh(g, new THREE.SphereGeometry(0.04, 8, 6), pad, 0, 0.38 * scale, 1.22 * scale, scale, 0.8 * scale, scale);
  // Tall pointed ears past head crown (silhouette read)
  addMesh(g, new THREE.ConeGeometry(0.08, 0.42, 7), dark, -0.13 * scale, 0.82 * scale, 0.65 * scale, scale, scale, 0.6 * scale, 0.12, 0, -0.35, 'earL');
  addMesh(g, new THREE.ConeGeometry(0.08, 0.42, 7), dark, 0.13 * scale, 0.82 * scale, 0.65 * scale, scale, scale, 0.6 * scale, 0.12, 0, 0.35, 'earR');
  addMesh(g, new THREE.ConeGeometry(0.038, 0.15, 5), ember, -0.13 * scale, 1.0 * scale, 0.62 * scale, scale, scale, 0.5 * scale, 0.1, 0, -0.2);
  addMesh(g, new THREE.ConeGeometry(0.038, 0.15, 5), ember, 0.13 * scale, 1.0 * scale, 0.62 * scale, scale, scale, 0.5 * scale, 0.1, 0, 0.2);
  // Legs: longer, stanced — clear four-leg read
  for (const [lx, lz, part] of [
    [-0.17, 0.42, 'legFL'],
    [0.17, 0.42, 'legFR'],
    [-0.19, -0.42, 'legBL'],
    [0.19, -0.42, 'legBR'],
  ] as const) {
    addMesh(
      g,
      new THREE.CapsuleGeometry(0.048, 0.32, 4, 8),
      dark,
      lx * scale,
      0.18 * scale,
      lz * scale,
      scale,
      1.0 * scale,
      scale,
      0,
      0,
      0,
      part,
    );
    addMesh(g, new THREE.SphereGeometry(0.05, 8, 6), pad, lx * scale, 0.035 * scale, lz * scale + 0.02 * scale, 1.15 * scale, 0.42 * scale, 1.35 * scale);
  }
  // Multi-lobe flame tail past rear haunch (extends Z silhouette)
  addMesh(g, new THREE.ConeGeometry(0.13, 0.62, 8), ember, 0, 0.48 * scale, -0.88 * scale, scale, scale, scale, Math.PI * 0.58, 0, 0, 'flame');
  addMesh(g, new THREE.ConeGeometry(0.085, 0.4, 6), flameHot, 0.06 * scale, 0.72 * scale, -0.82 * scale, scale, scale, 0.75 * scale, Math.PI * 0.48, 0.25, 0.15, 'tail');
  addMesh(g, new THREE.ConeGeometry(0.055, 0.28, 5), ember, -0.07 * scale, 0.62 * scale, -0.95 * scale, 0.8 * scale, scale, 0.6 * scale, Math.PI * 0.5, -0.2, -0.1);
  // Eyes
  addMesh(g, new THREE.SphereGeometry(0.038, 8, 8), eye, -0.085 * scale, 0.52 * scale, 0.9 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.038, 8, 8), eye, 0.085 * scale, 0.52 * scale, 0.9 * scale, scale, scale, scale);

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
  addMesh(g, new THREE.ConeGeometry(0.12, 0.28, 6), scaleMat, -0.22 * scale, 1.4 * scale, 0, scale, scale, 0.4 * scale, 0, 0, 0.6, 'earL');
  addMesh(g, new THREE.ConeGeometry(0.12, 0.28, 6), scaleMat, 0.22 * scale, 1.4 * scale, 0, scale, scale, 0.4 * scale, 0, 0, -0.6, 'earR');
  // Arms
  addMesh(g, new THREE.CapsuleGeometry(0.08, 0.28, 4, 8), body, -0.38 * scale, 0.75 * scale, 0.05 * scale, scale, scale, scale, 0, 0, 0.4, 'armL');
  addMesh(g, new THREE.CapsuleGeometry(0.08, 0.28, 4, 8), body, 0.38 * scale, 0.75 * scale, 0.05 * scale, scale, scale, scale, 0, 0, -0.4, 'armR');
  // Legs short — biped tags for stride secondary
  addMesh(g, new THREE.CapsuleGeometry(0.09, 0.18, 4, 8), scaleMat, -0.14 * scale, 0.22 * scale, 0.02 * scale, scale, scale, scale, 0, 0, 0, 'legL');
  addMesh(g, new THREE.CapsuleGeometry(0.09, 0.18, 4, 8), scaleMat, 0.14 * scale, 0.22 * scale, 0.02 * scale, scale, scale, scale, 0, 0, 0, 'legR');
  // Tail
  addMesh(g, new THREE.SphereGeometry(0.18, 12, 10), body, 0, 0.45 * scale, -0.4 * scale, 0.7 * scale, 0.55 * scale, 1.4 * scale, 0, 0, 0, 'tail');
  addMesh(g, new THREE.ConeGeometry(0.12, 0.35, 6), scaleMat, 0, 0.4 * scale, -0.72 * scale, scale, scale, scale, Math.PI / 2, 0, 0, 'fin');
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
  addMesh(g, new THREE.ConeGeometry(0.18, 0.7, 7), leaf, 0, 1.7 * scale, -0.05 * scale, scale, scale, 0.3 * scale, 0, 0, 0, 'crest');
  addMesh(g, new THREE.ConeGeometry(0.14, 0.55, 6), stem, -0.32 * scale, 1.35 * scale, 0.05 * scale, scale, scale, 0.25 * scale, 0, 0, 0.9, 'earL');
  addMesh(g, new THREE.ConeGeometry(0.14, 0.55, 6), stem, 0.32 * scale, 1.35 * scale, 0.05 * scale, scale, scale, 0.25 * scale, 0, 0, -0.9, 'earR');
  addMesh(g, new THREE.ConeGeometry(0.1, 0.4, 5), leaf, 0, 1.0 * scale, -0.35 * scale, scale, scale, 0.25 * scale, Math.PI / 2.5, 0, 0, 'tail');
  // Arms/legs outstretched
  addMesh(g, new THREE.CapsuleGeometry(0.06, 0.35, 4, 8), body, -0.42 * scale, 0.75 * scale, 0, scale, scale, scale, 0, 0, 0.7, 'armL');
  addMesh(g, new THREE.CapsuleGeometry(0.06, 0.35, 4, 8), body, 0.42 * scale, 0.75 * scale, 0, scale, scale, scale, 0, 0, -0.7, 'armR');
  addMesh(g, new THREE.CapsuleGeometry(0.07, 0.28, 4, 8), body, -0.12 * scale, 0.2 * scale, 0.05 * scale, scale, scale, scale, 0, 0, 0, 'legL');
  addMesh(g, new THREE.CapsuleGeometry(0.07, 0.28, 4, 8), body, 0.12 * scale, 0.2 * scale, 0.05 * scale, scale, scale, scale, 0, 0, 0, 'legR');
  addMesh(g, new THREE.SphereGeometry(0.045, 8, 8), eye, -0.09 * scale, 1.22 * scale, 0.26 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.045, 8, 8), eye, 0.09 * scale, 1.22 * scale, 0.26 * scale, scale, scale, scale);

  g.userData.speciesId = 'leafit';
  g.userData.materialKind = 'feather';
  return g;
}

/** Ship-pack grass starter id — same silhouette as leafit, tagged leafkit. */
export function buildLeafkit(scale: number): THREE.Group {
  const g = buildLeafit(scale);
  g.userData.speciesId = 'leafkit';
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
  addMesh(g, new THREE.CapsuleGeometry(0.07, 0.55, 4, 8), fur, -0.14 * scale, 1.45 * scale, 0.05 * scale, scale, scale, scale, 0.1, 0, -0.15, 'earL');
  addMesh(g, new THREE.CapsuleGeometry(0.07, 0.55, 4, 8), fur, 0.14 * scale, 1.45 * scale, 0.05 * scale, scale, scale, scale, 0.1, 0, 0.15, 'earR');
  addMesh(g, new THREE.CapsuleGeometry(0.04, 0.4, 4, 6), earIn, -0.14 * scale, 1.42 * scale, 0.08 * scale, scale, scale, scale, 0.1, 0, -0.15);
  addMesh(g, new THREE.CapsuleGeometry(0.04, 0.4, 4, 6), earIn, 0.14 * scale, 1.42 * scale, 0.08 * scale, scale, scale, scale, 0.1, 0, 0.15);
  // Cheek fluff
  addMesh(g, new THREE.SphereGeometry(0.12, 10, 8), blush, -0.28 * scale, 0.9 * scale, 0.15 * scale, scale, 0.8 * scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.12, 10, 8), blush, 0.28 * scale, 0.9 * scale, 0.15 * scale, scale, 0.8 * scale, scale);
  // Legs — quadruped tags (front pair for hop gait)
  addMesh(g, new THREE.SphereGeometry(0.12, 10, 8), fur, -0.2 * scale, 0.12 * scale, 0.12 * scale, 1.1 * scale, 0.7 * scale, 1.2 * scale, 0, 0, 0, 'legFL');
  addMesh(g, new THREE.SphereGeometry(0.12, 10, 8), fur, 0.2 * scale, 0.12 * scale, 0.12 * scale, 1.1 * scale, 0.7 * scale, 1.2 * scale, 0, 0, 0, 'legFR');
  addMesh(g, new THREE.SphereGeometry(0.1, 10, 8), fur, -0.18 * scale, 0.1 * scale, -0.12 * scale, 1.0 * scale, 0.65 * scale, 1.1 * scale, 0, 0, 0, 'legBL');
  addMesh(g, new THREE.SphereGeometry(0.1, 10, 8), fur, 0.18 * scale, 0.1 * scale, -0.12 * scale, 1.0 * scale, 0.65 * scale, 1.1 * scale, 0, 0, 0, 'legBR');
  // Cotton tail
  addMesh(g, new THREE.SphereGeometry(0.14, 10, 8), fur, 0, 0.4 * scale, -0.42 * scale, scale, scale, scale, 0, 0, 0, 'tail');
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
  addMesh(g, new THREE.SphereGeometry(0.45, 16, 12), wing, -0.45 * scale, 0.85 * scale, 0, 1.1 * scale, 0.25 * scale, 0.7 * scale, 0.2, 0.3, 0.15, 'wingL');
  addMesh(g, new THREE.SphereGeometry(0.45, 16, 12), wing, 0.45 * scale, 0.85 * scale, 0, 1.1 * scale, 0.25 * scale, 0.7 * scale, 0.2, -0.3, -0.15, 'wingR');
  // Lower wings
  addMesh(g, new THREE.SphereGeometry(0.28, 12, 10), wing, -0.3 * scale, 0.55 * scale, -0.15 * scale, scale, 0.2 * scale, 0.7 * scale);
  addMesh(g, new THREE.SphereGeometry(0.28, 12, 10), wing, 0.3 * scale, 0.55 * scale, -0.15 * scale, scale, 0.2 * scale, 0.7 * scale);
  // Antennae
  addMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), dark, -0.08 * scale, 1.05 * scale, 0.5 * scale, scale, scale, scale, 0.4, 0, 0.3, 'antennaL');
  addMesh(g, new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), dark, 0.08 * scale, 1.05 * scale, 0.5 * scale, scale, scale, scale, 0.4, 0, -0.3, 'antennaR');
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

/**
 * Gym dusk lantern-moth: iron lace wings, taller lantern body, metal + ember.
 * Distinct from sparkmoth — upright lantern + filigree wing plates.
 */
export function buildIronwisp(scale: number): THREE.Group {
  const g = new THREE.Group();
  const iron = mat(0x7a8aab, 'metal');
  const dark = mat(0x3a4258, 'metal');
  const lace = mat(0xb0c0e0, 'metal', { emissive: 0x6688cc, emissiveIntensity: 0.18 });
  const glow = mat(0xffcc66, 'ember', { emissive: 0xffaa33, emissiveIntensity: 0.65 });
  const glass = mat(0xffe8a0, 'ember', { emissive: 0xffcc55, emissiveIntensity: 0.4 });
  const eye = mat(0x101820, 'shell');

  // Vertical lantern body (tall silhouette)
  addMesh(g, new THREE.CylinderGeometry(0.22, 0.28, 0.7, 10), iron, 0, 0.65 * scale, 0, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.26, 14, 12), glass, 0, 0.7 * scale, 0, 0.85 * scale, 1.05 * scale, 0.85 * scale);
  // Cap / head
  addMesh(g, new THREE.ConeGeometry(0.26, 0.22, 8), dark, 0, 1.12 * scale, 0, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.18, 12, 10), iron, 0, 1.28 * scale, 0.05 * scale, scale, 0.85 * scale, scale);
  // Iron lace wings — wide thin plates (not sparkmoth ovals)
  addMesh(g, new THREE.BoxGeometry(0.55, 0.08, 0.75), lace, -0.55 * scale, 0.85 * scale, -0.05 * scale, scale, scale, scale, 0.15, 0.35, 0.25, 'wingL');
  addMesh(g, new THREE.BoxGeometry(0.55, 0.08, 0.75), lace, 0.55 * scale, 0.85 * scale, -0.05 * scale, scale, scale, scale, 0.15, -0.35, -0.25, 'wingR');
  addMesh(g, new THREE.BoxGeometry(0.35, 0.06, 0.45), lace, -0.4 * scale, 0.55 * scale, -0.2 * scale, scale, scale, scale, -0.2, 0.2, 0.1);
  addMesh(g, new THREE.BoxGeometry(0.35, 0.06, 0.45), lace, 0.4 * scale, 0.55 * scale, -0.2 * scale, scale, scale, scale, -0.2, -0.2, -0.1);
  // Antenna hooks
  addMesh(g, new THREE.TorusGeometry(0.12, 0.02, 6, 10, Math.PI), dark, -0.1 * scale, 1.45 * scale, 0.12 * scale, scale, scale, scale, 0.5, 0, 0.4, 'antennaL');
  addMesh(g, new THREE.TorusGeometry(0.12, 0.02, 6, 10, Math.PI), dark, 0.1 * scale, 1.45 * scale, 0.12 * scale, scale, scale, scale, 0.5, 0, -0.4, 'antennaR');
  // Spark orbs
  addMesh(g, new THREE.SphereGeometry(0.07, 8, 8), glow, -0.18 * scale, 1.0 * scale, 0.22 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.07, 8, 8), glow, 0.18 * scale, 1.0 * scale, 0.22 * scale, scale, scale, scale);
  // Thin legs / stand
  for (const lx of [-0.12, 0.12] as const) {
    addMesh(g, new THREE.CylinderGeometry(0.03, 0.04, 0.35, 6), dark, lx * scale, 0.2 * scale, 0.08 * scale, scale, scale, scale);
  }
  addMesh(g, new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6), dark, 0, 0.18 * scale, -0.12 * scale, scale, scale, scale);
  // Eyes
  addMesh(g, new THREE.SphereGeometry(0.04, 8, 8), eye, -0.07 * scale, 1.3 * scale, 0.18 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.04, 8, 8), eye, 0.07 * scale, 1.3 * scale, 0.18 * scale, scale, scale, scale);

  g.userData.speciesId = 'ironwisp';
  g.userData.materialKind = 'metal';
  return g;
}

/**
 * Elite moss-horn beast: heavy quadruped, dual horns, leafy mane.
 * Distinct gym/elite silhouette vs starters.
 */
export function buildGloomhorn(scale: number): THREE.Group {
  const g = new THREE.Group();
  const moss = mat(0x3d5c38, 'fur');
  const dark = mat(0x2a3a24, 'fur');
  const horn = mat(0x8a9a70, 'shell');
  const leaf = mat(0x5a8a48, 'feather');
  const eye = mat(0x1a1008, 'shell');

  // Heavy barrel body (horizontal)
  addMesh(g, new THREE.CapsuleGeometry(0.38, 0.65, 6, 14), moss, 0, 0.55 * scale, 0, 1.05 * scale, 0.95 * scale, 1.15 * scale, 0, 0, Math.PI / 2);
  // Shoulder / hip bulk
  addMesh(g, new THREE.SphereGeometry(0.32, 14, 12), dark, 0, 0.6 * scale, 0.35 * scale, 1.15 * scale, 1.0 * scale, 1.0 * scale);
  addMesh(g, new THREE.SphereGeometry(0.3, 12, 10), dark, 0, 0.55 * scale, -0.35 * scale, 1.1 * scale, 0.95 * scale, 1.0 * scale);
  // Head block
  addMesh(g, new THREE.SphereGeometry(0.28, 14, 12), moss, 0, 0.85 * scale, 0.58 * scale, 1.1 * scale, 0.9 * scale, 1.15 * scale);
  addMesh(g, new THREE.BoxGeometry(0.28, 0.16, 0.32), dark, 0, 0.72 * scale, 0.82 * scale, scale, scale, scale);
  // Dual moss horns (signature)
  addMesh(g, new THREE.ConeGeometry(0.1, 0.55, 7), horn, -0.16 * scale, 1.25 * scale, 0.55 * scale, scale, scale, 0.8 * scale, -0.35, 0, -0.2, 'hornL');
  addMesh(g, new THREE.ConeGeometry(0.1, 0.55, 7), horn, 0.16 * scale, 1.25 * scale, 0.55 * scale, scale, scale, 0.8 * scale, -0.35, 0, 0.2, 'hornR');
  // Leaf mane fringe
  addMesh(g, new THREE.ConeGeometry(0.12, 0.35, 5), leaf, -0.3 * scale, 0.9 * scale, 0.2 * scale, scale, scale, 0.4 * scale, 0, 0, 0.8, 'crest');
  addMesh(g, new THREE.ConeGeometry(0.12, 0.35, 5), leaf, 0.3 * scale, 0.9 * scale, 0.2 * scale, scale, scale, 0.4 * scale, 0, 0, -0.8);
  // Thick legs — tagged for beast gait
  for (const [lx, lz, part] of [
    [-0.28, 0.35, 'legFL'],
    [0.28, 0.35, 'legFR'],
    [-0.3, -0.35, 'legBL'],
    [0.3, -0.35, 'legBR'],
  ] as const) {
    addMesh(g, new THREE.CylinderGeometry(0.1, 0.12, 0.45, 8), dark, lx * scale, 0.22 * scale, lz * scale, scale, scale, scale, 0, 0, 0, part);
  }
  // Club tail
  addMesh(g, new THREE.CapsuleGeometry(0.1, 0.4, 4, 8), moss, 0, 0.5 * scale, -0.7 * scale, scale, scale, scale, Math.PI / 2.2, 0, 0, 'tail');
  addMesh(g, new THREE.SphereGeometry(0.14, 10, 8), leaf, 0, 0.48 * scale, -0.95 * scale, scale, scale, scale);
  // Eyes
  addMesh(g, new THREE.SphereGeometry(0.045, 8, 8), eye, -0.1 * scale, 0.9 * scale, 0.78 * scale, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.045, 8, 8), eye, 0.1 * scale, 0.9 * scale, 0.78 * scale, scale, scale, scale);

  g.userData.speciesId = 'gloomhorn';
  g.userData.materialKind = 'fur';
  return g;
}

/** Leaf-sprite wild: pear body inside a layered leaf hood, with root feet and a luminous face. */
export function buildMossprite(scale: number): THREE.Group {
  const g = new THREE.Group();
  const moss = mat(0x6da85a, 'fur');
  const leaf = mat(0x2f7d46, 'feather');
  const leafLight = mat(0x8bcf68, 'feather');
  const bark = mat(0x8b6848, 'shell');
  const glow = mat(0xdff7a4, 'ember', { emissive: 0xb8ee72, emissiveIntensity: 0.42 });
  const eye = mat(0x172116, 'shell');

  const bodyProfile = [
    new THREE.Vector2(0.03, 0),
    new THREE.Vector2(0.24, 0.08),
    new THREE.Vector2(0.36, 0.38),
    new THREE.Vector2(0.31, 0.72),
    new THREE.Vector2(0.19, 0.98),
    new THREE.Vector2(0.04, 1.08),
  ];
  addMesh(g, new THREE.LatheGeometry(bodyProfile, 20), moss, 0, 0.05 * scale, 0, scale, scale, scale);

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0.5);
  leafShape.bezierCurveTo(-0.38, 0.32, -0.42, -0.18, 0, -0.52);
  leafShape.bezierCurveTo(0.42, -0.18, 0.38, 0.32, 0, 0.5);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.055,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 10,
  });
  leafGeo.center();
  addMesh(g, leafGeo, leaf, 0, 0.93 * scale, -0.08 * scale, 1.2 * scale, 1.15 * scale, scale, -0.1, 0, 0, 'crest');
  addMesh(g, leafGeo.clone(), leafLight, -0.29 * scale, 0.65 * scale, -0.02 * scale, 0.62 * scale, 0.78 * scale, 0.72 * scale, 0, 0.2, 0.62, 'earL');
  addMesh(g, leafGeo.clone(), leafLight, 0.29 * scale, 0.65 * scale, -0.02 * scale, 0.62 * scale, 0.78 * scale, 0.72 * scale, 0, -0.2, -0.62, 'earR');

  // Root-like feet are curved rather than cylinder stubs.
  for (const [x, part] of [[-0.17, 'legL'], [0.17, 'legR']] as const) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x * scale, 0.24 * scale, 0),
      new THREE.Vector3(x * 1.08 * scale, 0.1 * scale, 0.05 * scale),
      new THREE.Vector3(x * 1.25 * scale, 0.035 * scale, 0.18 * scale),
    ]);
    const foot = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.055 * scale, 7, false), bark);
    foot.userData.part = part;
    g.add(foot);
  }

  // Soft face lantern and expressive crescent mouth.
  addMesh(g, new THREE.SphereGeometry(0.22, 16, 12), glow, 0, 0.62 * scale, 0.29 * scale, 1.1 * scale, 0.88 * scale, 0.32 * scale);
  addMesh(g, new THREE.SphereGeometry(0.045, 10, 8), eye, -0.085 * scale, 0.67 * scale, 0.37 * scale, scale, 1.18 * scale, 0.72 * scale);
  addMesh(g, new THREE.SphereGeometry(0.045, 10, 8), eye, 0.085 * scale, 0.67 * scale, 0.37 * scale, scale, 1.18 * scale, 0.72 * scale);
  addMesh(g, new THREE.TorusGeometry(0.055, 0.014, 6, 12, Math.PI), eye, 0, 0.56 * scale, 0.385 * scale, scale, scale, 0.5 * scale, 0, 0, Math.PI);

  g.userData.speciesId = 'mossprite';
  g.userData.materialKind = 'feather';
  return g;
}

/** Stream-slick wild: low amphibious kit with ribbon tail, fin ears, and water-glass markings. */
export function buildRivlet(scale: number): THREE.Group {
  const g = new THREE.Group();
  const wet = mat(0x55b7c6, 'wet');
  const deep = mat(0x247c96, 'scale');
  const belly = mat(0xc7f0e8, 'wet');
  const fin = mat(0x89dfd1, 'feather', { emissive: 0x3d9b9a, emissiveIntensity: 0.2 });
  const eye = mat(0x102b36, 'shell');

  const bodyGeo = new THREE.IcosahedronGeometry(0.52, 3);
  const bp = bodyGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < bp.count; i++) {
    const x = bp.getX(i);
    const y = bp.getY(i);
    const z = bp.getZ(i);
    const taper = 0.88 + (z + 0.52) * 0.16;
    bp.setXYZ(i, x * 0.78 * taper, y * 0.62, z * 1.42);
  }
  bodyGeo.computeVertexNormals();
  addMesh(g, bodyGeo, wet, 0, 0.43 * scale, 0, scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.3, 20, 15), wet, 0, 0.65 * scale, 0.62 * scale, 1.08 * scale, 0.88 * scale, 1.12 * scale);
  addMesh(g, new THREE.SphereGeometry(0.2, 16, 12), belly, 0, 0.48 * scale, 0.7 * scale, 1.05 * scale, 0.7 * scale, 0.5 * scale);

  const finShape = new THREE.Shape();
  finShape.moveTo(0, -0.22);
  finShape.quadraticCurveTo(0.36, 0.02, 0, 0.34);
  finShape.quadraticCurveTo(-0.1, 0.03, 0, -0.22);
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.045, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.02, bevelThickness: 0.02, curveSegments: 8 });
  finGeo.center();
  addMesh(g, finGeo, fin, -0.27 * scale, 0.86 * scale, 0.6 * scale, 0.75 * scale, 0.8 * scale, scale, 0.05, 0.1, 0.55, 'earL');
  addMesh(g, finGeo.clone(), fin, 0.27 * scale, 0.86 * scale, 0.6 * scale, 0.75 * scale, 0.8 * scale, scale, 0.05, -0.1, -0.55, 'earR');

  for (const [x, z, part] of [
    [-0.22, 0.38, 'legFL'], [0.22, 0.38, 'legFR'],
    [-0.23, -0.35, 'legBL'], [0.23, -0.35, 'legBR'],
  ] as const) {
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x * scale, 0.36 * scale, z * scale),
      new THREE.Vector3(x * 1.05 * scale, 0.17 * scale, (z + 0.04) * scale),
      new THREE.Vector3(x * 1.12 * scale, 0.055 * scale, (z + 0.14) * scale),
    ]);
    const leg = new THREE.Mesh(new THREE.TubeGeometry(legCurve, 7, 0.052 * scale, 7, false), deep);
    leg.userData.part = part;
    g.add(leg);
  }

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.45 * scale, -0.6 * scale),
    new THREE.Vector3(-0.18 * scale, 0.62 * scale, -0.94 * scale),
    new THREE.Vector3(0.1 * scale, 0.73 * scale, -1.22 * scale),
    new THREE.Vector3(0.36 * scale, 0.58 * scale, -1.08 * scale),
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 18, 0.09 * scale, 9, false), wet);
  tail.userData.part = 'tail';
  g.add(tail);
  addMesh(g, finGeo.clone(), fin, 0.38 * scale, 0.56 * scale, -1.08 * scale, 0.78 * scale, 0.95 * scale, scale, Math.PI / 2, 0.2, 0.2, 'fin');

  addMesh(g, new THREE.SphereGeometry(0.052, 10, 8), eye, -0.105 * scale, 0.7 * scale, 0.88 * scale, scale, 1.12 * scale, 0.72 * scale);
  addMesh(g, new THREE.SphereGeometry(0.052, 10, 8), eye, 0.105 * scale, 0.7 * scale, 0.88 * scale, scale, 1.12 * scale, 0.72 * scale);
  addMesh(g, new THREE.SphereGeometry(0.042, 8, 6), deep, 0, 0.59 * scale, 0.96 * scale, scale, 0.7 * scale, scale);

  g.userData.speciesId = 'rivlet';
  g.userData.materialKind = 'wet';
  return g;
}

/** Fallback blob — still multi-part so QA can pass; not used for ship species. */
export function buildGeneric(color: number, scale: number): THREE.Group {
  const g = new THREE.Group();
  const m = mat(color, 'fur');
  addMesh(g, new THREE.SphereGeometry(0.4, 16, 12), m, 0, 0.5 * scale, 0, 1.2 * scale, scale, scale);
  addMesh(g, new THREE.SphereGeometry(0.28, 12, 10), m, 0, 0.95 * scale, 0.1 * scale, scale, scale, scale);
  addMesh(g, new THREE.ConeGeometry(0.12, 0.3, 6), m, -0.2 * scale, 1.2 * scale, 0, scale, scale, scale, 0, 0, 0, 'earL');
  addMesh(g, new THREE.ConeGeometry(0.12, 0.3, 6), m, 0.2 * scale, 1.2 * scale, 0, scale, scale, scale, 0, 0, 0, 'earR');
  addMesh(g, new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8), m, -0.2 * scale, 0.15 * scale, 0.1 * scale, scale, scale, scale, 0, 0, 0, 'legL');
  addMesh(g, new THREE.CylinderGeometry(0.08, 0.1, 0.3, 8), m, 0.2 * scale, 0.15 * scale, 0.1 * scale, scale, scale, scale, 0, 0, 0, 'legR');
  g.userData.speciesId = 'generic';
  g.userData.materialKind = 'fur';
  return g;
}

export type SpeciesBuilder = (scale: number) => THREE.Group;

export const SPECIES_BUILDERS: Record<string, SpeciesBuilder> = {
  emberpup: buildEmberpup,
  dewkin: buildDewkin,
  leafit: buildLeafit,
  leafkit: buildLeafkit,
  dustbun: buildDustbun,
  sparkmoth: buildSparkmoth,
  ironwisp: buildIronwisp,
  gloomhorn: buildGloomhorn,
  mossprite: buildMossprite,
  rivlet: buildRivlet,
};
