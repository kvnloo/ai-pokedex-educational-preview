/**
 * Runtime-sized derivatives of the img2threejs specs authored from PokéAPI
 * official-artwork plates. The full intake/spec/factory evidence lives outside
 * the shipping tree under /mnt/zer0models/pokemon_anime/pipeline/pokeapi/img2threejs.
 *
 * Do not fetch artwork at runtime: the plates are provenance/reference evidence,
 * while these small procedural forms are the product assets.
 */
import * as THREE from 'three';
import { makeSurfaceMaterial, type MaterialKind } from '../render/materials.ts';

type Primitive = 'sphere' | 'ellipsoid' | 'capsule' | 'cylinder' | 'cone' | 'torus';
type Vec3 = readonly [number, number, number];

interface PartSpec {
  id: string;
  primitive: Primitive;
  position: Vec3;
  scale: Vec3;
  material: string;
  rotation?: Vec3;
  clipPart?: string;
}

interface PaletteSpec {
  color: number;
  kind: MaterialKind;
  emissive?: number;
  emissiveIntensity?: number;
}

interface PokemonMeshSpec {
  slug: 'grookey' | 'scorbunny' | 'sobble' | 'wooloo';
  pokemonId: 810 | 813 | 816 | 831;
  modelUnit: number;
  motionProfile: 'biped' | 'quadruped';
  sourceSha256: string;
  factorySha256: string;
  palettes: Record<string, PaletteSpec>;
  parts: readonly PartSpec[];
}

const SPECS: Record<PokemonMeshSpec['slug'], PokemonMeshSpec> = {
  grookey: {
    slug: 'grookey', pokemonId: 810, modelUnit: 0.5, motionProfile: 'biped',
    sourceSha256: '2a1fb51dd9d25deb0eeffac45c6c8c9ac457adc638ac8b6ae82c953b634eaec5',
    factorySha256: 'e2ff5a2e2978ed6468e7d16f9e5eeddcd1d47936fa6569fce75f1132ba06daa0',
    palettes: {
      green: { color: 0x8fcb58, kind: 'fur' }, light: { color: 0xe8e18a, kind: 'fur' },
      orange: { color: 0xd9783f, kind: 'fur' }, brown: { color: 0x7a4a25, kind: 'shell' },
      dark: { color: 0x415e2c, kind: 'fur' }, white: { color: 0xf7f6e9, kind: 'wet' },
      black: { color: 0x161a18, kind: 'wet' },
    },
    parts: [
      { id: 'torso', primitive: 'ellipsoid', position: [0, 0.55, 0], scale: [0.86, 1.05, 0.72], material: 'green' },
      { id: 'head', primitive: 'ellipsoid', position: [0, 1.38, 0.02], scale: [1.05, 0.98, 0.86], material: 'green' },
      { id: 'face-mask', primitive: 'ellipsoid', position: [0, 1.35, 0.37], scale: [0.83, 0.72, 0.2], material: 'light' },
      { id: 'muzzle', primitive: 'ellipsoid', position: [0.09, 1.22, 0.53], scale: [0.45, 0.28, 0.18], material: 'orange' },
      { id: 'ear-l', primitive: 'ellipsoid', position: [-0.57, 1.38, 0], scale: [0.5, 0.43, 0.18], material: 'brown', clipPart: 'earL' },
      { id: 'ear-r', primitive: 'ellipsoid', position: [0.57, 1.38, 0], scale: [0.5, 0.43, 0.18], material: 'brown', clipPart: 'earR' },
      { id: 'eye-l', primitive: 'ellipsoid', position: [-0.25, 1.5, 0.49], scale: [0.34, 0.44, 0.17], material: 'white' },
      { id: 'eye-r', primitive: 'ellipsoid', position: [0.27, 1.5, 0.49], scale: [0.34, 0.44, 0.17], material: 'white' },
      { id: 'pupil-l', primitive: 'ellipsoid', position: [-0.22, 1.49, 0.59], scale: [0.18, 0.28, 0.1], material: 'black' },
      { id: 'pupil-r', primitive: 'ellipsoid', position: [0.3, 1.49, 0.59], scale: [0.18, 0.28, 0.1], material: 'black' },
      { id: 'collar', primitive: 'torus', position: [0, 0.95, 0], scale: [0.72, 0.4, 0.58], material: 'dark' },
      { id: 'arm-l', primitive: 'capsule', position: [-0.48, 0.74, 0.03], scale: [0.33, 0.63, 0.33], material: 'green', clipPart: 'armL' },
      { id: 'arm-r', primitive: 'capsule', position: [0.47, 0.89, 0.12], scale: [0.33, 0.68, 0.33], material: 'green', clipPart: 'armR' },
      { id: 'hand-l', primitive: 'ellipsoid', position: [-0.49, 0.42, 0.1], scale: [0.3, 0.28, 0.28], material: 'orange' },
      { id: 'hand-r', primitive: 'ellipsoid', position: [0.51, 0.62, 0.24], scale: [0.32, 0.28, 0.28], material: 'orange' },
      { id: 'leg-l', primitive: 'capsule', position: [-0.25, 0.08, 0], scale: [0.4, 0.47, 0.4], material: 'green', clipPart: 'legL' },
      { id: 'leg-r', primitive: 'capsule', position: [0.25, 0.08, 0], scale: [0.4, 0.47, 0.4], material: 'green', clipPart: 'legR' },
      { id: 'crest-l', primitive: 'ellipsoid', position: [-0.17, 2.02, 0.02], scale: [0.34, 0.85, 0.11], rotation: [0, 0, -0.48], material: 'green', clipPart: 'crest' },
      { id: 'crest-r', primitive: 'ellipsoid', position: [0.18, 2.06, 0.02], scale: [0.34, 0.85, 0.11], rotation: [0, 0, 0.48], material: 'green', clipPart: 'crest' },
      { id: 'stick', primitive: 'cylinder', position: [0, 1.91, -0.12], scale: [0.15, 1.18, 0.15], rotation: [0, 0, Math.PI / 2], material: 'brown' },
      { id: 'tail', primitive: 'torus', position: [-0.52, 0.5, -0.12], scale: [0.7, 0.7, 0.16], material: 'brown', clipPart: 'tail' },
    ],
  },
  scorbunny: {
    slug: 'scorbunny', pokemonId: 813, modelUnit: 0.42, motionProfile: 'biped',
    sourceSha256: '9c21e6e5777f0bb4e0d0ac16340210bfb3a53a0751cf880653d0286568f9824d',
    factorySha256: 'a2cd3ff98cc45198e6908639e6c7f6dfec9d316f8c34bde2d8437996e058c16d',
    palettes: {
      white: { color: 0xf5f4ed, kind: 'fur' }, orange: { color: 0xe65f2b, kind: 'fur' },
      cream: { color: 0xf2c57a, kind: 'fur' }, mauve: { color: 0x75485e, kind: 'wet' },
      black: { color: 0x171717, kind: 'wet' },
    },
    parts: [
      { id: 'torso', primitive: 'ellipsoid', position: [0, 0.7, 0], scale: [0.58, 0.92, 0.48], material: 'white' },
      { id: 'head', primitive: 'ellipsoid', position: [0, 1.46, 0.03], scale: [0.95, 0.88, 0.76], material: 'white' },
      { id: 'ear-l', primitive: 'capsule', position: [-0.22, 2.3, 0], scale: [0.42, 1.4, 0.3], rotation: [0, 0, -0.1], material: 'white', clipPart: 'earL' },
      { id: 'ear-r', primitive: 'capsule', position: [0.25, 2.3, 0], scale: [0.42, 1.4, 0.3], rotation: [0, 0, 0.1], material: 'white', clipPart: 'earR' },
      { id: 'ear-tip-l', primitive: 'ellipsoid', position: [-0.27, 2.73, 0.02], scale: [0.38, 0.55, 0.28], rotation: [0, 0, -0.1], material: 'orange' },
      { id: 'ear-tip-r', primitive: 'ellipsoid', position: [0.3, 2.73, 0.02], scale: [0.38, 0.55, 0.28], rotation: [0, 0, 0.1], material: 'orange' },
      { id: 'face-band', primitive: 'ellipsoid', position: [0, 1.58, 0.42], scale: [0.67, 0.25, 0.18], material: 'cream' },
      { id: 'eye-l', primitive: 'ellipsoid', position: [-0.24, 1.5, 0.48], scale: [0.18, 0.25, 0.12], material: 'black' },
      { id: 'eye-r', primitive: 'ellipsoid', position: [0.24, 1.5, 0.48], scale: [0.18, 0.25, 0.12], material: 'black' },
      { id: 'mouth', primitive: 'ellipsoid', position: [0, 1.23, 0.55], scale: [0.28, 0.12, 0.08], material: 'mauve' },
      { id: 'cheek-l', primitive: 'ellipsoid', position: [-0.49, 1.36, 0.06], scale: [0.35, 0.22, 0.17], rotation: [0, 0, -0.5], material: 'white' },
      { id: 'cheek-r', primitive: 'ellipsoid', position: [0.49, 1.36, 0.06], scale: [0.35, 0.22, 0.17], rotation: [0, 0, 0.5], material: 'white' },
      { id: 'arm-l', primitive: 'capsule', position: [-0.44, 0.82, 0.04], scale: [0.28, 0.68, 0.28], rotation: [0, 0, -0.55], material: 'white', clipPart: 'armL' },
      { id: 'arm-r', primitive: 'capsule', position: [0.44, 0.82, 0.04], scale: [0.28, 0.68, 0.28], rotation: [0, 0, 0.55], material: 'white', clipPart: 'armR' },
      { id: 'leg-l', primitive: 'capsule', position: [-0.22, -0.03, 0], scale: [0.34, 0.9, 0.34], rotation: [0, 0, -0.05], material: 'white', clipPart: 'legL' },
      { id: 'leg-r', primitive: 'capsule', position: [0.22, -0.03, 0], scale: [0.34, 0.9, 0.34], rotation: [0, 0, 0.05], material: 'white', clipPart: 'legR' },
      { id: 'foot-l', primitive: 'ellipsoid', position: [-0.25, -0.58, 0.24], scale: [0.42, 0.58, 0.46], material: 'white' },
      { id: 'foot-r', primitive: 'ellipsoid', position: [0.25, -0.58, 0.24], scale: [0.42, 0.58, 0.46], material: 'white' },
      { id: 'sole-l', primitive: 'ellipsoid', position: [-0.25, -0.63, 0.46], scale: [0.25, 0.36, 0.1], material: 'orange' },
      { id: 'sole-r', primitive: 'ellipsoid', position: [0.25, -0.63, 0.46], scale: [0.25, 0.36, 0.1], material: 'orange' },
      { id: 'neck-mark', primitive: 'ellipsoid', position: [0, 0.98, 0.32], scale: [0.28, 0.2, 0.14], material: 'orange' },
      { id: 'tail', primitive: 'sphere', position: [0, 0.64, -0.35], scale: [0.34, 0.34, 0.34], material: 'white', clipPart: 'tail' },
    ],
  },
  sobble: {
    slug: 'sobble', pokemonId: 816, modelUnit: 0.48, motionProfile: 'quadruped',
    sourceSha256: 'd8674b5d561b75274ced9961dae51f2f4900f4ffa0cc1bb1caef000d66fde0cf',
    factorySha256: '48b288b2031cf1f79da49d41bf706b9b36cada22a78750663117065a5aff4498',
    palettes: {
      cyan: { color: 0x62b7d7, kind: 'scale' }, light: { color: 0xb6dfe6, kind: 'scale' },
      blue: { color: 0x1267a2, kind: 'wet' }, yellow: { color: 0xf0d64d, kind: 'scale' },
      mauve: { color: 0xa56f7d, kind: 'wet' }, white: { color: 0xf7f8f3, kind: 'wet' },
      black: { color: 0x102a42, kind: 'wet' },
    },
    parts: [
      { id: 'torso', primitive: 'ellipsoid', position: [0, 0.52, -0.05], scale: [0.72, 0.72, 0.65], material: 'cyan' },
      { id: 'head', primitive: 'ellipsoid', position: [0, 1.18, 0.18], scale: [1.1, 0.9, 0.82], material: 'cyan' },
      { id: 'belly', primitive: 'ellipsoid', position: [0, 0.45, 0.35], scale: [0.42, 0.52, 0.14], material: 'light' },
      { id: 'eye-l', primitive: 'ellipsoid', position: [-0.34, 1.34, 0.54], scale: [0.38, 0.58, 0.18], material: 'white' },
      { id: 'eye-r', primitive: 'ellipsoid', position: [0.34, 1.34, 0.54], scale: [0.38, 0.58, 0.18], material: 'white' },
      { id: 'pupil-l', primitive: 'ellipsoid', position: [-0.32, 1.34, 0.65], scale: [0.15, 0.36, 0.09], material: 'blue' },
      { id: 'pupil-r', primitive: 'ellipsoid', position: [0.36, 1.34, 0.65], scale: [0.15, 0.36, 0.09], material: 'blue' },
      { id: 'mouth', primitive: 'ellipsoid', position: [0, 0.98, 0.64], scale: [0.32, 0.13, 0.08], material: 'mauve' },
      { id: 'cheek-l', primitive: 'sphere', position: [-0.5, 1.02, 0.56], scale: [0.22, 0.22, 0.12], material: 'blue' },
      { id: 'cheek-r', primitive: 'sphere', position: [0.5, 1.02, 0.56], scale: [0.22, 0.22, 0.12], material: 'blue' },
      { id: 'crest', primitive: 'ellipsoid', position: [0, 1.82, 0.08], scale: [0.3, 0.62, 0.12], rotation: [0, 0, -0.12], material: 'yellow', clipPart: 'crest' },
      { id: 'arm-l', primitive: 'capsule', position: [-0.4, 0.45, 0.18], scale: [0.25, 0.55, 0.25], rotation: [0, 0, -0.68], material: 'cyan', clipPart: 'armL' },
      { id: 'arm-r', primitive: 'capsule', position: [0.4, 0.45, 0.18], scale: [0.25, 0.55, 0.25], rotation: [0, 0, 0.68], material: 'cyan', clipPart: 'armR' },
      { id: 'leg-l', primitive: 'capsule', position: [-0.31, 0.05, -0.05], scale: [0.3, 0.5, 0.3], rotation: [0, 0, -0.25], material: 'cyan', clipPart: 'legL' },
      { id: 'leg-r', primitive: 'capsule', position: [0.31, 0.05, -0.05], scale: [0.3, 0.5, 0.3], rotation: [0, 0, 0.25], material: 'cyan', clipPart: 'legR' },
      { id: 'tail-base', primitive: 'ellipsoid', position: [0, 0.58, -0.48], scale: [0.82, 0.62, 0.56], material: 'cyan' },
      { id: 'tail-coil', primitive: 'torus', position: [0, 0.78, -0.88], scale: [0.9, 0.9, 0.24], material: 'blue', clipPart: 'tail' },
    ],
  },
  wooloo: {
    slug: 'wooloo', pokemonId: 831, modelUnit: 0.5, motionProfile: 'quadruped',
    sourceSha256: '651d8be698a4e21ca13af0f7faa5d5b20afbf01a8473db8c344248715228c4c8',
    factorySha256: 'cfd95711af33ef5845fda47187b0ea3e63364e1f65ce91b83cd68659c8cdc3fb',
    palettes: {
      wool: { color: 0xf2f0e8, kind: 'fur' }, woolShadow: { color: 0xd5d4d0, kind: 'fur' },
      face: { color: 0x3a3031, kind: 'fur' }, braid: { color: 0x777a78, kind: 'fur' },
      pink: { color: 0xd88a98, kind: 'wet' }, hoof: { color: 0x665052, kind: 'shell' },
      yellow: { color: 0xd9d56b, kind: 'wet' }, black: { color: 0x121212, kind: 'wet' },
    },
    parts: [
      { id: 'fleece-core', primitive: 'sphere', position: [0, 1, 0], scale: [1.2, 1.05, 1], material: 'wool' },
      { id: 'fleece-top', primitive: 'sphere', position: [0, 1.62, 0], scale: [0.9, 0.55, 0.85], material: 'wool' },
      { id: 'fleece-left', primitive: 'sphere', position: [-0.72, 1.05, 0], scale: [0.55, 0.75, 0.72], material: 'wool' },
      { id: 'fleece-right', primitive: 'sphere', position: [0.72, 1.05, 0], scale: [0.55, 0.75, 0.72], material: 'wool' },
      { id: 'fleece-front', primitive: 'sphere', position: [0, 1, 0.6], scale: [0.85, 0.78, 0.55], material: 'wool' },
      { id: 'fleece-back', primitive: 'sphere', position: [0, 1, -0.6], scale: [0.85, 0.78, 0.55], material: 'woolShadow' },
      { id: 'fleece-bottom', primitive: 'sphere', position: [0, 0.46, 0], scale: [0.95, 0.45, 0.85], material: 'woolShadow' },
      { id: 'face', primitive: 'ellipsoid', position: [0, 1.04, 0.96], scale: [0.72, 0.65, 0.45], material: 'face' },
      { id: 'eye-l', primitive: 'sphere', position: [-0.23, 1.18, 1.24], scale: [0.17, 0.19, 0.08], material: 'yellow' },
      { id: 'eye-r', primitive: 'sphere', position: [0.23, 1.18, 1.24], scale: [0.17, 0.19, 0.08], material: 'yellow' },
      { id: 'pupil-l', primitive: 'sphere', position: [-0.23, 1.18, 1.3], scale: [0.08, 0.1, 0.04], material: 'black' },
      { id: 'pupil-r', primitive: 'sphere', position: [0.23, 1.18, 1.3], scale: [0.08, 0.1, 0.04], material: 'black' },
      { id: 'ear-l', primitive: 'ellipsoid', position: [-0.48, 1.36, 0.98], scale: [0.35, 0.18, 0.15], rotation: [0, 0, 0.35], material: 'pink', clipPart: 'earL' },
      { id: 'ear-r', primitive: 'ellipsoid', position: [0.48, 1.36, 0.98], scale: [0.35, 0.18, 0.15], rotation: [0, 0, -0.35], material: 'pink', clipPart: 'earR' },
      { id: 'horn-l', primitive: 'cone', position: [-0.4, 1.5, 0.86], scale: [0.16, 0.28, 0.16], rotation: [0, 0, 0.3], material: 'face' },
      { id: 'horn-r', primitive: 'cone', position: [0.4, 1.5, 0.86], scale: [0.16, 0.28, 0.16], rotation: [0, 0, -0.3], material: 'face' },
      { id: 'braid-l', primitive: 'ellipsoid', position: [-0.43, 0.78, 1.02], scale: [0.35, 0.28, 0.24], rotation: [0, 0, 0.45], material: 'braid' },
      { id: 'braid-r', primitive: 'ellipsoid', position: [0.43, 0.78, 1.02], scale: [0.35, 0.28, 0.24], rotation: [0, 0, -0.45], material: 'braid' },
      { id: 'leg-fl', primitive: 'capsule', position: [-0.45, 0.02, 0.34], scale: [0.3, 0.5, 0.3], material: 'face', clipPart: 'legFL' },
      { id: 'leg-fr', primitive: 'capsule', position: [0.45, 0.02, 0.34], scale: [0.3, 0.5, 0.3], material: 'face', clipPart: 'legFR' },
      { id: 'leg-bl', primitive: 'capsule', position: [-0.45, 0.02, -0.34], scale: [0.3, 0.5, 0.3], material: 'face', clipPart: 'legBL' },
      { id: 'leg-br', primitive: 'capsule', position: [0.45, 0.02, -0.34], scale: [0.3, 0.5, 0.3], material: 'face', clipPart: 'legBR' },
    ],
  },
};

const geometryCache = new Map<Primitive, THREE.BufferGeometry>();

function geometryFor(primitive: Primitive): THREE.BufferGeometry {
  const cached = geometryCache.get(primitive);
  if (cached) return cached;
  const geometry = primitive === 'capsule'
    ? new THREE.CapsuleGeometry(0.35, 0.7, 10, 18)
    : primitive === 'cylinder'
      ? new THREE.CylinderGeometry(0.5, 0.5, 1, 18, 3)
      : primitive === 'cone'
        ? new THREE.ConeGeometry(0.5, 1, 18, 3)
        : primitive === 'torus'
          ? new THREE.TorusGeometry(0.45, 0.09, 10, 36)
          : new THREE.SphereGeometry(0.5, 24, 16);
  geometryCache.set(primitive, geometry);
  return geometry;
}

function buildPokemon(spec: PokemonMeshSpec, scale: number): THREE.Group {
  const root = new THREE.Group();
  root.name = spec.slug;
  const model = new THREE.Group();
  model.name = `${spec.slug}-img2threejs-model`;
  root.add(model);

  const materials = new Map(
    Object.entries(spec.palettes).map(([id, palette]) => [
      id,
      makeSurfaceMaterial({
        color: palette.color,
        kind: palette.kind,
        emissive: palette.emissive,
        emissiveIntensity: palette.emissiveIntensity,
      }),
    ]),
  );

  for (const part of spec.parts) {
    const pivot = new THREE.Group();
    pivot.name = `${spec.slug}-${part.id}-pivot`;
    pivot.position.fromArray(part.position);
    const [rotationX, rotationY, rotationZ] = part.rotation ?? [0, 0, 0];
    pivot.rotation.set(rotationX, rotationY, rotationZ);
    pivot.userData.part = part.clipPart ?? part.id;
    pivot.userData.sourcePart = part.id;

    const mesh = new THREE.Mesh(geometryFor(part.primitive), materials.get(part.material));
    mesh.name = `${spec.slug}-${part.id}`;
    mesh.scale.fromArray(part.scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.explodeWithParent = true;
    pivot.add(mesh);
    model.add(pivot);
  }

  model.scale.setScalar(spec.modelUnit * scale);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= bounds.min.y;
  model.position.z -= center.z;

  root.userData.speciesId = spec.slug;
  root.userData.materialKind = spec.slug === 'sobble' ? 'scale' : 'fur';
  root.userData.motionProfile = spec.motionProfile;
  root.userData.provenance = {
    system: 'pokeapi+img2threejs',
    pokemonId: spec.pokemonId,
    pokemonUrl: `https://pokeapi.co/api/v2/pokemon/${spec.pokemonId}`,
    officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/8dfa3d97e953caaafaafd4963eff7621811af08e/sprites/pokemon/other/home/${spec.pokemonId}.png`,
    sourceSha256: spec.sourceSha256,
    generatedFactorySha256: spec.factorySha256,
  };
  return root;
}

export function buildGrookey(scale: number): THREE.Group {
  return buildPokemon(SPECS.grookey, scale);
}

export function buildScorbunny(scale: number): THREE.Group {
  return buildPokemon(SPECS.scorbunny, scale);
}

export function buildSobble(scale: number): THREE.Group {
  return buildPokemon(SPECS.sobble, scale);
}

export function buildWooloo(scale: number): THREE.Group {
  return buildPokemon(SPECS.wooloo, scale);
}
