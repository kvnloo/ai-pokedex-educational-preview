import * as THREE from 'three';

export async function preloadCanonicalPrivateMeshes(_speciesIds: readonly string[]): Promise<void> {
  throw new Error('Private-local creature assets are unavailable in the distributable build');
}

export function canonicalPrivateMesh(_speciesId: string, _scale = 1): THREE.Group {
  throw new Error('Private-local creature assets are unavailable in the distributable build');
}
