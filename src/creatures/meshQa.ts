/**
 * Mesh QA gate (category D) before browser presentation.
 * Reject cube-like (volume/bbox > 0.75) and paper-thin (min/max extent < 0.12).
 */
import * as THREE from 'three';

export interface MeshQaResult {
  ok: boolean;
  reasons: string[];
  volumeOverBbox: number;
  thinRatio: number;
  extents: { x: number; y: number; z: number };
}

const CUBE_VOL_THRESHOLD = 0.75;
const THIN_RATIO_THRESHOLD = 0.12;

/** Approximate solid volume of a Group via union of mesh AABBs (axis-aligned). */
function measureGroup(root: THREE.Object3D): {
  volume: number;
  bboxVolume: number;
  extents: { x: number; y: number; z: number };
} {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const extents = { x: size.x, y: size.y, z: size.z };
  const bboxVolume = Math.max(1e-9, size.x * size.y * size.z);

  let volume = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const gb = mesh.geometry.boundingBox;
    if (!gb) return;
    const gs = new THREE.Vector3();
    gb.getSize(gs);
    // Apply world scale of this mesh
    const ws = new THREE.Vector3();
    mesh.getWorldScale(ws);
    const sx = Math.abs(gs.x * ws.x);
    const sy = Math.abs(gs.y * ws.y);
    const sz = Math.abs(gs.z * ws.z);
    volume += sx * sy * sz;
  });

  return { volume, bboxVolume, extents };
}

export function evaluateMeshQa(root: THREE.Object3D): MeshQaResult {
  const { volume, bboxVolume, extents } = measureGroup(root);
  const volumeOverBbox = volume / bboxVolume;
  const maxE = Math.max(extents.x, extents.y, extents.z, 1e-9);
  const minE = Math.min(extents.x, extents.y, extents.z);
  const thinRatio = minE / maxE;
  const reasons: string[] = [];

  if (volumeOverBbox > CUBE_VOL_THRESHOLD) {
    reasons.push(
      `cube-like volume/bbox=${volumeOverBbox.toFixed(3)} > ${CUBE_VOL_THRESHOLD}`,
    );
  }
  if (thinRatio < THIN_RATIO_THRESHOLD) {
    reasons.push(
      `paper-thin min/max=${thinRatio.toFixed(3)} < ${THIN_RATIO_THRESHOLD}`,
    );
  }
  if (bboxVolume < 1e-6) {
    reasons.push('degenerate bbox');
  }

  return {
    ok: reasons.length === 0,
    reasons,
    volumeOverBbox,
    thinRatio,
    extents,
  };
}

/** Throws if mesh fails QA (gate before attach to scene). */
export function assertMeshQa(root: THREE.Object3D, label = 'creature'): MeshQaResult {
  const r = evaluateMeshQa(root);
  if (!r.ok) {
    throw new Error(`Mesh QA failed for ${label}: ${r.reasons.join('; ')}`);
  }
  return r;
}
