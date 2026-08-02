/**
 * Track-P materials: fur / feather / scale / shell reads under soft TW-like light.
 * Procedural only — no binary Nintendo assets.
 */
import * as THREE from 'three';

export type MaterialKind = 'fur' | 'feather' | 'scale' | 'shell' | 'ember' | 'wet';

export interface MaterialOpts {
  color: number;
  kind: MaterialKind;
  emissive?: number;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
}

/** Build a MeshStandardMaterial tuned for a surface family. */
export function makeSurfaceMaterial(opts: MaterialOpts): THREE.MeshStandardMaterial {
  const base = opts.color;
  const kind = opts.kind;
  let roughness = opts.roughness;
  let metalness = opts.metalness;
  let emissive = opts.emissive ?? 0x000000;
  let emissiveIntensity = opts.emissiveIntensity ?? 0;

  switch (kind) {
    case 'fur':
      roughness ??= 0.88;
      metalness ??= 0.02;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.06;
      break;
    case 'feather':
      roughness ??= 0.55;
      metalness ??= 0.08;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.1;
      break;
    case 'scale':
      roughness ??= 0.35;
      metalness ??= 0.22;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.08;
      break;
    case 'shell':
      roughness ??= 0.42;
      metalness ??= 0.35;
      break;
    case 'ember':
      roughness ??= 0.4;
      metalness ??= 0.12;
      emissive = opts.emissive ?? 0xff6622;
      emissiveIntensity = opts.emissiveIntensity ?? 0.35;
      break;
    case 'wet':
      roughness ??= 0.22;
      metalness ??= 0.28;
      emissive = opts.emissive ?? base;
      emissiveIntensity = opts.emissiveIntensity ?? 0.12;
      break;
  }

  return new THREE.MeshStandardMaterial({
    color: base,
    roughness: roughness ?? 0.6,
    metalness: metalness ?? 0.05,
    emissive,
    emissiveIntensity,
  });
}

export function accentMaterial(color: number, kind: MaterialKind = 'shell'): THREE.MeshStandardMaterial {
  return makeSurfaceMaterial({ color, kind });
}
