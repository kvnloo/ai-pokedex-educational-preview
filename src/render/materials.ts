/**
 * Track-P materials: fur / feather / scale / shell reads under soft TW-like light.
 * Procedural only — no binary Nintendo assets.
 */
import * as THREE from 'three';

export type MaterialKind = 'fur' | 'feather' | 'scale' | 'shell' | 'ember' | 'wet' | 'metal';

export interface MaterialOpts {
  color: number;
  kind: MaterialKind;
  emissive?: number;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  /** Skip procedural detail maps (tests / flat debug). */
  flat?: boolean;
}

const detailCache = new Map<string, { normal: THREE.Texture; roughness: THREE.Texture }>();

/** Deterministic hash noise in [0,1). */
function hash2(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x: number, y: number, seed: number, octaves = 3): number {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    v += a * hash2(x * f, y * f, seed + i * 19.1);
    a *= 0.5;
    f *= 2.1;
  }
  return v;
}

/** Kind-specific height in [0,1] + roughness at UV — single source for FD normals. */
function sampleHeightRough(
  kind: MaterialKind,
  u: number,
  v: number,
): { height: number; rough: number } {
  let height = 0.5;
  let rough = 0.5;

  switch (kind) {
    case 'fur': {
      // Dense vertical strands + clump tufts (height drives normals, not hash)
      const strand =
        Math.sin(u * Math.PI * 48 + fbm(u * 5, v * 5, 1) * 3.2) * 0.5 + 0.5;
      const fine =
        Math.sin(u * Math.PI * 96 + v * 18 + fbm(u * 12, v * 4, 8) * 1.8) * 0.5 + 0.5;
      const clump = fbm(u * 5, v * 2.5, 2);
      const flow = fbm(u * 2.5 + v * 0.4, v * 6, 14);
      height = strand * 0.42 + fine * 0.22 + clump * 0.28 + flow * 0.08;
      rough = 0.78 + clump * 0.18 + fine * 0.06;
      break;
    }
    case 'feather': {
      const vane = Math.sin(u * Math.PI * 18) * 0.5 + 0.5;
      const barb = fbm(u * 8, v * 12, 3);
      height = vane * 0.65 + barb * 0.35;
      rough = 0.42 + barb * 0.28;
      break;
    }
    case 'scale': {
      const hx = u * 10;
      const hy = v * 10 + ((Math.floor(hx) % 2) * 0.5);
      const cx = hx - Math.floor(hx) - 0.5;
      const cy = hy - Math.floor(hy) - 0.5;
      const d = Math.sqrt(cx * cx + cy * cy);
      height = 1 - Math.min(1, d * 2.2);
      rough = 0.28 + (1 - height) * 0.25;
      break;
    }
    case 'shell': {
      const grain = fbm(u * 14, v * 14, 4);
      height = grain;
      rough = 0.35 + grain * 0.3;
      break;
    }
    case 'ember': {
      const cell = fbm(u * 7, v * 7, 5);
      height = cell * 0.7 + 0.3;
      rough = 0.35 + cell * 0.2;
      break;
    }
    case 'wet': {
      const streak = Math.sin(v * Math.PI * 22 + fbm(u * 2, v * 2, 6) * 1.5) * 0.5 + 0.5;
      height = 0.45 + streak * 0.2;
      rough = 0.12 + streak * 0.18;
      break;
    }
    case 'metal': {
      const brush = Math.sin(u * Math.PI * 40) * 0.5 + 0.5;
      const grit = fbm(u * 20, v * 20, 7);
      height = brush * 0.4 + grit * 0.6;
      rough = 0.18 + grit * 0.35;
      break;
    }
  }

  return { height, rough };
}

/**
 * Kind-specific normal + roughness maps so surfaces read under soft key light
 * (fur grain, feather vane, scale tiles, metal grit) instead of plastic Standard.
 */
function makeDetailMaps(kind: MaterialKind): { normal: THREE.Texture; roughness: THREE.Texture } {
  const hit = detailCache.get(kind);
  if (hit) return hit;

  const size = 128;
  const nData = new Uint8Array(size * size * 4);
  const rData = new Uint8Array(size * size * 4);
  const heights = new Float32Array(size * size);
  const roughs = new Float32Array(size * size);

  // Pass 1: full height field from kind pattern (not hash deltas)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const s = sampleHeightRough(kind, u, v);
      heights[y * size + x] = s.height;
      roughs[y * size + x] = s.rough;
    }
  }

  // Pass 2: finite-difference normals from kind height neighbors
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const height = heights[y * size + x];
      const rough = roughs[y * size + x];

      const xL = (x + size - 1) % size;
      const xR = (x + 1) % size;
      const yD = (y + size - 1) % size;
      const yU = (y + 1) % size;
      const hL = heights[y * size + xL];
      const hR = heights[y * size + xR];
      const hD = heights[yD * size + x];
      const hU = heights[yU * size + x];

      const strength =
        kind === 'fur' ? 4.2 : kind === 'scale' ? 2.4 : kind === 'metal' ? 1.6 : kind === 'feather' ? 2.0 : 1.4;
      let nx = (hL - hR) * strength;
      let ny = (hD - hU) * strength;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;

      nData[i] = Math.floor((nx * 0.5 + 0.5) * 255);
      nData[i + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      nData[i + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      nData[i + 3] = 255;

      // silence unused local
      void height;

      const rByte = Math.floor(Math.min(1, Math.max(0, rough)) * 255);
      rData[i] = rByte;
      rData[i + 1] = rByte;
      rData[i + 2] = rByte;
      rData[i + 3] = 255;
    }
  }

  const normal = new THREE.DataTexture(nData, size, size, THREE.RGBAFormat);
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  normal.magFilter = THREE.LinearFilter;
  normal.minFilter = THREE.LinearMipmapLinearFilter;
  normal.generateMipmaps = true;
  normal.needsUpdate = true;
  normal.colorSpace = THREE.NoColorSpace;
  // Anisotropic filtering when renderer attaches; mark intent for shell
  normal.userData.anisotropyHint = kind === 'fur' ? 8 : 4;

  const roughness = new THREE.DataTexture(rData, size, size, THREE.RGBAFormat);
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;
  roughness.magFilter = THREE.LinearFilter;
  roughness.minFilter = THREE.LinearMipmapLinearFilter;
  roughness.generateMipmaps = true;
  roughness.needsUpdate = true;
  roughness.colorSpace = THREE.NoColorSpace;

  const pack = { normal, roughness };
  detailCache.set(kind, pack);
  return pack;
}

function detailRepeat(kind: MaterialKind): number {
  switch (kind) {
    case 'fur':
      return 6.5;
    case 'feather':
      return 2.8;
    case 'scale':
      return 4.2;
    case 'shell':
      return 2.2;
    case 'ember':
      return 2.0;
    case 'wet':
      return 2.5;
    case 'metal':
      return 3.0;
  }
}

/** Build a MeshStandardMaterial tuned for a surface family. */
export function makeSurfaceMaterial(opts: MaterialOpts): THREE.MeshStandardMaterial {
  const base = opts.color;
  const kind = opts.kind;
  let roughness = opts.roughness;
  let metalness = opts.metalness;
  let emissive = opts.emissive ?? 0x000000;
  let emissiveIntensity = opts.emissiveIntensity ?? 0;
  let normalScale = 0.45;

  switch (kind) {
    case 'fur':
      roughness ??= 0.92;
      metalness ??= 0.0;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.045;
      normalScale = 1.85;
      break;
    case 'feather':
      roughness ??= 0.55;
      metalness ??= 0.08;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.1;
      normalScale = 0.75;
      break;
    case 'scale':
      roughness ??= 0.35;
      metalness ??= 0.22;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.08;
      normalScale = 1.1;
      break;
    case 'shell':
      roughness ??= 0.42;
      metalness ??= 0.35;
      normalScale = 0.4;
      break;
    case 'ember':
      roughness ??= 0.4;
      metalness ??= 0.12;
      emissive = opts.emissive ?? 0xff6622;
      emissiveIntensity = opts.emissiveIntensity ?? 0.35;
      normalScale = 0.5;
      break;
    case 'wet':
      roughness ??= 0.22;
      metalness ??= 0.28;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.12;
      normalScale = 0.35;
      break;
    case 'metal':
      roughness ??= 0.32;
      metalness ??= 0.78;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.08;
      normalScale = 0.8;
      break;
  }

  const mat = new THREE.MeshStandardMaterial({
    color: base,
    roughness: roughness ?? 0.6,
    metalness: metalness ?? 0.05,
    emissive,
    emissiveIntensity,
  });

  if (!opts.flat) {
    const maps = makeDetailMaps(kind);
    const rep = detailRepeat(kind);
    mat.normalMap = maps.normal;
    mat.normalScale = new THREE.Vector2(normalScale, normalScale);
    mat.roughnessMap = maps.roughness;
    mat.map = null;
    // UV-less primitives still sample at (0,0); set repeat so mip reads vary by kind
    maps.normal.repeat.set(rep, rep);
    maps.roughness.repeat.set(rep, rep);
    mat.userData.materialKind = kind;
    mat.userData.hasDetail = true;
    mat.userData.anisotropyHint = kind === 'fur' ? 8 : 4;
  }

  return mat;
}

export function accentMaterial(color: number, kind: MaterialKind = 'shell'): THREE.MeshStandardMaterial {
  return makeSurfaceMaterial({ color, kind });
}
