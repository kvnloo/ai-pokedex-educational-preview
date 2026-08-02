/**
 * Numeric mesh QA gate before browser presentation.
 *
 * Base lane rejects cube-like coverage and paper-thin overall bounds. Starters
 * marked `fidelityTier = "authored-starter"` additionally have to prove that a
 * single high-resolution, volumetric organic core carries most of their mass;
 * token cores hidden inside sphere stacks fail closed.
 */
import * as THREE from 'three';

export interface MeshQaResult {
  ok: boolean;
  reasons: string[];
  /** Legacy conservative sum-of-component-AABBs / group-AABB proxy. */
  volumeOverBbox: number;
  /** Triangle-derived component volume / group-AABB (overlap is not unioned). */
  actualVolumeOverBbox: number;
  thinRatio: number;
  extents: { x: number; y: number; z: number };
  meshCount: number;
  triangleCount: number;
  primitiveSphereVolumeShare: number;
  organicCoreCount: number;
  organicCoreTriangles: number;
  organicCoreAxisPlanes: { x: number; y: number; z: number };
  organicCoreThinRatio: number;
  organicCoreVolumeShare: number;
  socketedAppendageCount: number;
}

const CUBE_VOL_THRESHOLD = 0.75;
const THIN_RATIO_THRESHOLD = 0.12;
const STARTER_CORE_TRIANGLE_MIN = 500;
const STARTER_CORE_AXIS_PLANES_MIN = 12;
const STARTER_CORE_THIN_RATIO_MIN = 0.28;
const STARTER_CORE_VOLUME_SHARE_MIN = 0.45;
const STARTER_SPHERE_VOLUME_SHARE_MAX = 0.12;
const STARTER_SOCKETED_APPENDAGE_MIN = 6;

interface MeshMeasure {
  mesh: THREE.Mesh;
  bboxVolume: number;
  triangleVolume: number;
  triangleCount: number;
}

function triangleCount(geometry: THREE.BufferGeometry): number {
  const position = geometry.getAttribute('position');
  if (!position) return 0;
  return Math.floor((geometry.index?.count ?? position.count) / 3);
}

/** Signed-tetrahedra volume, made absolute per mesh so opposite component winding cannot cancel. */
function triangleVolume(mesh: THREE.Mesh): number {
  const geometry = mesh.geometry;
  const position = geometry.getAttribute('position');
  if (!position) return 0;
  const index = geometry.index;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const cross = new THREE.Vector3();
  let signed = 0;
  const count = index?.count ?? position.count;

  for (let offset = 0; offset + 2 < count; offset += 3) {
    const ia = index ? index.getX(offset) : offset;
    const ib = index ? index.getX(offset + 1) : offset + 1;
    const ic = index ? index.getX(offset + 2) : offset + 2;
    a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
    b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
    c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);
    signed += a.dot(cross.copy(b).cross(c)) / 6;
  }
  return Math.abs(signed);
}

function coordinatePlaneCounts(geometry: THREE.BufferGeometry): { x: number; y: number; z: number } {
  const position = geometry.getAttribute('position');
  if (!position) return { x: 0, y: 0, z: 0 };
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  geometry.boundingBox?.getSize(size);
  const quant = {
    x: Math.max(size.x * 0.002, 1e-6),
    y: Math.max(size.y * 0.002, 1e-6),
    z: Math.max(size.z * 0.002, 1e-6),
  };
  const xs = new Set<number>();
  const ys = new Set<number>();
  const zs = new Set<number>();
  for (let i = 0; i < position.count; i++) {
    xs.add(Math.round(position.getX(i) / quant.x));
    ys.add(Math.round(position.getY(i) / quant.y));
    zs.add(Math.round(position.getZ(i) / quant.z));
  }
  return { x: xs.size, y: ys.size, z: zs.size };
}

function geometryThinRatio(geometry: THREE.BufferGeometry): number {
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  geometry.boundingBox?.getSize(size);
  const max = Math.max(size.x, size.y, size.z, 1e-9);
  return Math.min(size.x, size.y, size.z) / max;
}

function measureGroup(root: THREE.Object3D): {
  conservativeVolume: number;
  bboxVolume: number;
  extents: { x: number; y: number; z: number };
  meshes: MeshMeasure[];
  socketedAppendageCount: number;
} {
  root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const extents = { x: size.x, y: size.y, z: size.z };
  const bboxVolume = Math.max(1e-9, size.x * size.y * size.z);

  let conservativeVolume = 0;
  let socketedAppendageCount = 0;
  const meshes: MeshMeasure[] = [];
  root.traverse((obj) => {
    if (obj.userData.attachment === 'embedded-socket') socketedAppendageCount++;
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const geometryBox = mesh.geometry.boundingBox;
    if (!geometryBox) return;
    const geometrySize = new THREE.Vector3();
    geometryBox.getSize(geometrySize);
    const worldScale = new THREE.Vector3();
    mesh.getWorldScale(worldScale);
    const componentBboxVolume =
      Math.abs(geometrySize.x * worldScale.x) *
      Math.abs(geometrySize.y * worldScale.y) *
      Math.abs(geometrySize.z * worldScale.z);
    conservativeVolume += componentBboxVolume;
    meshes.push({
      mesh,
      bboxVolume: componentBboxVolume,
      triangleVolume: triangleVolume(mesh),
      triangleCount: triangleCount(mesh.geometry),
    });
  });

  return { conservativeVolume, bboxVolume, extents, meshes, socketedAppendageCount };
}

export function evaluateMeshQa(root: THREE.Object3D): MeshQaResult {
  const { conservativeVolume, bboxVolume, extents, meshes, socketedAppendageCount } = measureGroup(root);
  const volumeOverBbox = conservativeVolume / bboxVolume;
  const measuredVolume = meshes.reduce((sum, item) => sum + item.triangleVolume, 0);
  const actualVolumeOverBbox = measuredVolume / bboxVolume;
  const maxExtent = Math.max(extents.x, extents.y, extents.z, 1e-9);
  const minExtent = Math.min(extents.x, extents.y, extents.z);
  const thinRatio = minExtent / maxExtent;
  const reasons: string[] = [];
  const totalTriangles = meshes.reduce((sum, item) => sum + item.triangleCount, 0);
  const sphereVolume = meshes
    .filter((item) => item.mesh.geometry.type === 'SphereGeometry')
    .reduce((sum, item) => sum + item.triangleVolume, 0);
  const primitiveSphereVolumeShare = sphereVolume / Math.max(measuredVolume, 1e-9);
  const cores = meshes.filter((item) => item.mesh.userData.qaRole === 'organic-core');
  const organicCoreTriangles = cores.reduce((sum, item) => sum + item.triangleCount, 0);
  const organicCoreVolume = cores.reduce((sum, item) => sum + item.triangleVolume, 0);
  const organicCoreVolumeShare = organicCoreVolume / Math.max(measuredVolume, 1e-9);
  const organicCoreAxisPlanes = cores.length === 1
    ? coordinatePlaneCounts(cores[0]!.mesh.geometry)
    : { x: 0, y: 0, z: 0 };
  const organicCoreThinRatio = cores.length === 1
    ? geometryThinRatio(cores[0]!.mesh.geometry)
    : 0;

  if (volumeOverBbox > CUBE_VOL_THRESHOLD) {
    reasons.push(`cube-like volume/bbox=${volumeOverBbox.toFixed(3)} > ${CUBE_VOL_THRESHOLD}`);
  }
  if (thinRatio < THIN_RATIO_THRESHOLD) {
    reasons.push(`paper-thin min/max=${thinRatio.toFixed(3)} < ${THIN_RATIO_THRESHOLD}`);
  }
  if (bboxVolume < 1e-6) reasons.push('degenerate bbox');

  if (root.userData.fidelityTier === 'authored-starter') {
    if (cores.length !== 1) reasons.push(`authored starter needs exactly one organic core; got ${cores.length}`);
    if (organicCoreTriangles < STARTER_CORE_TRIANGLE_MIN) {
      reasons.push(`organic core triangles=${organicCoreTriangles} < ${STARTER_CORE_TRIANGLE_MIN}`);
    }
    const minPlanes = Math.min(
      organicCoreAxisPlanes.x,
      organicCoreAxisPlanes.y,
      organicCoreAxisPlanes.z,
    );
    if (minPlanes < STARTER_CORE_AXIS_PLANES_MIN) {
      reasons.push(
        `organic core coordinate planes=${organicCoreAxisPlanes.x}/${organicCoreAxisPlanes.y}/${organicCoreAxisPlanes.z}; min < ${STARTER_CORE_AXIS_PLANES_MIN}`,
      );
    }
    if (organicCoreThinRatio < STARTER_CORE_THIN_RATIO_MIN) {
      reasons.push(
        `organic core min/max=${organicCoreThinRatio.toFixed(3)} < ${STARTER_CORE_THIN_RATIO_MIN}`,
      );
    }
    if (organicCoreVolumeShare < STARTER_CORE_VOLUME_SHARE_MIN) {
      reasons.push(
        `organic core volume share=${organicCoreVolumeShare.toFixed(3)} < ${STARTER_CORE_VOLUME_SHARE_MIN}`,
      );
    }
    if (primitiveSphereVolumeShare > STARTER_SPHERE_VOLUME_SHARE_MAX) {
      reasons.push(
        `primitive sphere volume share=${primitiveSphereVolumeShare.toFixed(3)} > ${STARTER_SPHERE_VOLUME_SHARE_MAX}`,
      );
    }
    if (socketedAppendageCount < STARTER_SOCKETED_APPENDAGE_MIN) {
      reasons.push(
        `socketed appendages=${socketedAppendageCount} < ${STARTER_SOCKETED_APPENDAGE_MIN}`,
      );
    }
  }

  return {
    ok: reasons.length === 0,
    reasons,
    volumeOverBbox,
    actualVolumeOverBbox,
    thinRatio,
    extents,
    meshCount: meshes.length,
    triangleCount: totalTriangles,
    primitiveSphereVolumeShare,
    organicCoreCount: cores.length,
    organicCoreTriangles,
    organicCoreAxisPlanes,
    organicCoreThinRatio,
    organicCoreVolumeShare,
    socketedAppendageCount,
  };
}

/** Throws if mesh fails QA (gate before attach to scene). */
export function assertMeshQa(root: THREE.Object3D, label = 'creature'): MeshQaResult {
  const result = evaluateMeshQa(root);
  if (!result.ok) {
    throw new Error(`Mesh QA failed for ${label}: ${result.reasons.join('; ')}`);
  }
  return result;
}
