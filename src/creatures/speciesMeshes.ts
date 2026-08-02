/**
 * Distinct procedural silhouettes for ship-pack species (original ids only).
 * Each must pass mesh QA (non-cube, non-paper-thin) and read at battle distance.
 */
import * as THREE from 'three';
import { makeSurfaceMaterial, type MaterialKind } from '../render/materials.ts';
import {
  createDepthLoftGeometry,
  createTaperedCurveGeometry,
  createVerticalLoftGeometry,
} from './organicGeometry.ts';

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

/** Bevelled botanical/ear plate. The outline is curved, not a flattened cone. */
function makeLeafGeometry(width: number, height: number, depth = 0.045): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -height * 0.5);
  shape.bezierCurveTo(-width * 0.58, -height * 0.2, -width * 0.54, height * 0.24, 0, height * 0.5);
  shape.bezierCurveTo(width * 0.54, height * 0.24, width * 0.58, -height * 0.2, 0, -height * 0.5);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: Math.min(width, height) * 0.055,
    bevelThickness: depth * 0.42,
    curveSegments: 10,
  });
  geometry.center();
  return geometry;
}

/** Asymmetric ember pennant used only on the original Emberpup tail. */
function makeEmberPetalGeometry(width: number, height: number, depth = 0.05): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -height * 0.48);
  shape.bezierCurveTo(-width * 0.58, -height * 0.12, -width * 0.42, height * 0.16, -width * 0.08, height * 0.5);
  shape.bezierCurveTo(width * 0.07, height * 0.2, width * 0.48, height * 0.12, width * 0.38, -height * 0.2);
  shape.bezierCurveTo(width * 0.24, -height * 0.43, width * 0.08, -height * 0.48, 0, -height * 0.48);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: Math.min(width, height) * 0.045,
    bevelThickness: depth * 0.4,
    curveSegments: 10,
  });
  geometry.center();
  return geometry;
}

function makeRuffGeometry(outer: number, inner: number, points = 7, depth = 0.055): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const angle = Math.PI / 2 + (i / (points * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? outer : inner;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: depth * 0.55,
    bevelThickness: depth * 0.42,
  });
  geometry.center();
  return geometry;
}

function makeTeardropGeometry(width: number, height: number, depth = 0.035): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, height * 0.5);
  shape.bezierCurveTo(-width * 0.56, height * 0.15, -width * 0.52, -height * 0.34, 0, -height * 0.5);
  shape.bezierCurveTo(width * 0.52, -height * 0.34, width * 0.56, height * 0.15, 0, height * 0.5);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: depth * 0.5,
    bevelThickness: depth * 0.4,
    curveSegments: 10,
  });
  geometry.center();
  return geometry;
}

/** Create a semantic socket pivot so clip motion rotates appendages at their root. */
function addPivotedPart(
  parent: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  part: string,
  position: THREE.Vector3,
  scale: number,
  localPosition = new THREE.Vector3(),
  rotation = new THREE.Euler(),
): THREE.Group {
  const pivot = new THREE.Group();
  pivot.name = `${part}-socket`;
  pivot.userData.part = part;
  pivot.userData.attachment = 'embedded-socket';
  pivot.position.copy(position);
  pivot.rotation.copy(rotation);
  pivot.scale.setScalar(scale);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${part}-form`;
  mesh.position.copy(localPosition);
  mesh.userData.explodeWithParent = true;
  pivot.add(mesh);
  parent.add(pivot);
  return pivot;
}

/**
 * Fire pup rebuilt from a rights-cleared concept and form-only frame study.
 * One 15-ring macro loft carries pelvis → ribcage → neck → skull → muzzle;
 * limbs start inside sockets and the tail is a tapered sweep, eliminating the
 * detached ball/capsule read of the earlier model.
 */
export function buildEmberpup(scale: number): THREE.Group {
  const g = new THREE.Group();
  const fur = mat(0xe67b44, 'fur');
  const dark = mat(0x6a2d32, 'fur');
  const cream = mat(0xf4b866, 'fur');
  const ember = mat(0xff7938, 'ember', { emissive: 0xff4f22, emissiveIntensity: 0.58 });
  const flameHot = mat(0xffdf72, 'ember', { emissive: 0xffad32, emissiveIntensity: 0.78 });
  const eye = mat(0x241927, 'shell');
  const iris = mat(0xd8f0c5, 'wet');
  const catchlight = mat(0xffffff, 'ember', { emissive: 0xffffff, emissiveIntensity: 0.28 });
  const pad = mat(0x321c29, 'shell');

  const core = addMesh(
    g,
    createDepthLoftGeometry([
      { z: -0.72, y: 0.42, radiusX: 0.14, radiusY: 0.19 },
      { z: -0.64, y: 0.43, radiusX: 0.25, radiusY: 0.27, shapePower: 2.15 },
      { z: -0.51, y: 0.45, radiusX: 0.33, radiusY: 0.31, shapePower: 2.25, dorsalRidge: 0.025 },
      { z: -0.34, y: 0.46, radiusX: 0.36, radiusY: 0.32, shapePower: 2.3, dorsalRidge: 0.035 },
      { z: -0.16, y: 0.45, radiusX: 0.35, radiusY: 0.3, shapePower: 2.25, dorsalRidge: 0.035 },
      { z: 0.02, y: 0.45, radiusX: 0.34, radiusY: 0.3, shapePower: 2.2, dorsalRidge: 0.03 },
      { z: 0.21, y: 0.47, radiusX: 0.36, radiusY: 0.34, shapePower: 2.35, dorsalRidge: 0.03 },
      { z: 0.39, y: 0.51, radiusX: 0.34, radiusY: 0.36, shapePower: 2.25, dorsalRidge: 0.025 },
      { z: 0.53, y: 0.57, radiusX: 0.29, radiusY: 0.34, shapePower: 2.1 },
      { z: 0.64, y: 0.64, radiusX: 0.25, radiusY: 0.31 },
      { z: 0.75, y: 0.69, radiusX: 0.3, radiusY: 0.3, shapePower: 2.15, dorsalRidge: 0.02 },
      { z: 0.87, y: 0.69, radiusX: 0.33, radiusY: 0.29, shapePower: 2.3, dorsalRidge: 0.018 },
      { z: 0.99, y: 0.65, radiusX: 0.29, radiusY: 0.24, shapePower: 2.25 },
      { z: 1.1, y: 0.59, radiusX: 0.22, radiusY: 0.16, shapePower: 2.15 },
      { z: 1.2, y: 0.57, radiusX: 0.12, radiusY: 0.1 },
    ], 28, 'emberpup-continuous-core'),
    fur,
    0,
    0,
    0,
    scale,
    scale,
    scale,
  );
  core.name = 'emberpup-continuous-core';
  core.userData.qaRole = 'organic-core';
  core.userData.form = 'pelvis-ribcage-neck-skull-muzzle-loft';

  // Integrated leg-and-paw lofts: upper rings embed 0.10–0.14 into the torso.
  const frontLeg = createVerticalLoftGeometry([
    { y: -0.4, z: 0.075, radiusX: 0.095, radiusZ: 0.145, shapePower: 2.4 },
    { y: -0.31, z: 0.04, radiusX: 0.072, radiusZ: 0.09 },
    { y: -0.16, z: 0.015, radiusX: 0.078, radiusZ: 0.085 },
    { y: 0, radiusX: 0.115, radiusZ: 0.125, shapePower: 2.2 },
  ], 16, 'emberpup-foreleg-loft');
  const backLeg = createVerticalLoftGeometry([
    { y: -0.39, z: 0.06, radiusX: 0.105, radiusZ: 0.15, shapePower: 2.45 },
    { y: -0.29, z: 0.025, radiusX: 0.08, radiusZ: 0.095 },
    { y: -0.14, z: -0.005, radiusX: 0.095, radiusZ: 0.1 },
    { y: 0, radiusX: 0.13, radiusZ: 0.135, shapePower: 2.25 },
  ], 16, 'emberpup-hindleg-loft');
  for (const [x, z, part, geometry, material] of [
    [-0.22, 0.34, 'legFL', frontLeg, dark],
    [0.22, 0.34, 'legFR', frontLeg, fur],
    [-0.23, -0.43, 'legBL', backLeg, dark],
    [0.23, -0.43, 'legBR', backLeg, fur],
  ] as const) {
    const leg = addMesh(g, geometry, material, x * scale, 0.4 * scale, z * scale, scale, scale, scale, 0, 0, 0, part);
    leg.name = `${part}-continuous-leg-paw`;
    leg.userData.attachment = 'embedded-socket';
  }

  // Bevelled collar catches the key light and hides no neck seam.
  const ruff = addMesh(g, makeRuffGeometry(0.27, 0.205, 7, 0.06), cream, 0, 0.59 * scale, 0.555 * scale, scale, scale, scale, 0, 0, 0.06);
  ruff.name = 'emberpup-directional-chest-ruff';
  ruff.userData.explodeWithParent = true;

  // Ear plates pivot at their roots rather than rocking around their centres.
  const earGeometry = makeLeafGeometry(0.19, 0.5, 0.065);
  for (const [x, part, rz] of [[-0.17, 'earL', 0.2], [0.17, 'earR', -0.2]] as const) {
    const ear = addPivotedPart(
      g,
      earGeometry,
      dark,
      part,
      new THREE.Vector3(x * scale, 0.83 * scale, 0.73 * scale),
      scale,
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Euler(-0.08, x < 0 ? 0.08 : -0.08, rz),
    );
    const inner = new THREE.Mesh(makeLeafGeometry(0.095, 0.32, 0.025), ember);
    inner.position.set(0, 0.205, 0.046);
    inner.userData.explodeWithParent = true;
    ear.add(inner);
  }

  // Tail stem and all ember petals share one semantic pivot at the rear socket.
  const tail = addPivotedPart(
    g,
    createTaperedCurveGeometry([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.03, 0.13, -0.19),
      new THREE.Vector3(0.09, 0.3, -0.33),
      new THREE.Vector3(-0.04, 0.48, -0.43),
    ], [0.105, 0.085, 0.06, 0.038], 22, 11, 'emberpup-tail-stem'),
    dark,
    'tail',
    new THREE.Vector3(0, 0.5 * scale, -0.65 * scale),
    scale,
  );
  const petalGeometry = makeEmberPetalGeometry(0.23, 0.4, 0.065);
  for (const [x, y, z, rz, material] of [
    [-0.06, 0.56, -0.45, -0.34, ember],
    [0.08, 0.54, -0.43, 0.42, flameHot],
    [0.0, 0.64, -0.46, 0.02, ember],
  ] as const) {
    const petal = new THREE.Mesh(petalGeometry, material);
    petal.position.set(x, y, z);
    petal.rotation.set(0.12, 0, rz);
    petal.userData.explodeWithParent = true;
    tail.add(petal);
  }

  // Layered eyes and catchlights are deliberately oversized for gameplay-distance life.
  for (const side of [-1, 1] as const) {
    addMesh(g, new THREE.SphereGeometry(0.071, 14, 12), eye, side * 0.18 * scale, 0.71 * scale, 1.09 * scale, 0.9 * scale, 1.22 * scale, 0.42 * scale);
    addMesh(g, new THREE.SphereGeometry(0.043, 12, 10), iris, side * 0.18 * scale, 0.714 * scale, 1.13 * scale, 0.82 * scale, 1.08 * scale, 0.3 * scale);
    addMesh(g, new THREE.SphereGeometry(0.014, 8, 6), catchlight, (side * 0.18 - 0.012) * scale, 0.744 * scale, 1.15 * scale, scale, scale, 0.25 * scale);
  }
  addMesh(g, new THREE.SphereGeometry(0.055, 12, 9), pad, 0, 0.57 * scale, 1.205 * scale, 1.15 * scale, 0.76 * scale, 0.8 * scale);
  addMesh(g, new THREE.TorusGeometry(0.072, 0.012, 6, 18, Math.PI), pad, 0, 0.515 * scale, 1.14 * scale, scale, 0.7 * scale, 0.45 * scale, 0, 0, Math.PI);

  g.userData.speciesId = 'emberpup';
  g.userData.materialKind = 'fur';
  g.userData.fidelityTier = 'authored-starter';
  g.userData.formContract = 'single continuous macro loft + socketed appendages';
  return g;
}

/** Water otter-kin: a continuous upright torso/head with webbed socketed limbs and ribbon tail. */
export function buildDewkin(scale: number): THREE.Group {
  const g = new THREE.Group();
  const body = mat(0x4aa8e8, 'wet');
  const deep = mat(0x216a9e, 'scale');
  const belly = mat(0xc8eef4, 'wet');
  const fin = mat(0x78d9d5, 'feather', { emissive: 0x2b8a9a, emissiveIntensity: 0.15 });
  const eye = mat(0x102638, 'shell');
  const iris = mat(0xffd36a, 'wet');
  const catchlight = mat(0xffffff, 'ember', { emissive: 0xe8ffff, emissiveIntensity: 0.22 });

  const core = addMesh(
    g,
    createVerticalLoftGeometry([
      { y: 0.24, z: -0.025, radiusX: 0.16, radiusZ: 0.15 },
      { y: 0.31, z: -0.02, radiusX: 0.24, radiusZ: 0.22, shapePower: 2.15 },
      { y: 0.43, z: -0.005, radiusX: 0.31, radiusZ: 0.27, shapePower: 2.3 },
      { y: 0.58, z: 0.01, radiusX: 0.35, radiusZ: 0.3, shapePower: 2.4 },
      { y: 0.73, z: 0.02, radiusX: 0.36, radiusZ: 0.31, shapePower: 2.35 },
      { y: 0.88, z: 0.035, radiusX: 0.31, radiusZ: 0.28, shapePower: 2.2 },
      { y: 1.0, z: 0.05, radiusX: 0.23, radiusZ: 0.21 },
      { y: 1.08, z: 0.07, radiusX: 0.225, radiusZ: 0.215 },
      { y: 1.16, z: 0.09, radiusX: 0.29, radiusZ: 0.27, shapePower: 2.15 },
      { y: 1.27, z: 0.105, radiusX: 0.35, radiusZ: 0.3, shapePower: 2.35 },
      { y: 1.38, z: 0.1, radiusX: 0.36, radiusZ: 0.3, shapePower: 2.35 },
      { y: 1.48, z: 0.08, radiusX: 0.31, radiusZ: 0.27, shapePower: 2.2 },
      { y: 1.56, z: 0.055, radiusX: 0.23, radiusZ: 0.21 },
      { y: 1.61, z: 0.03, radiusX: 0.13, radiusZ: 0.13 },
    ], 26, 'dewkin-continuous-core'),
    body,
    0,
    0,
    0,
    scale,
    scale,
    scale,
  );
  core.name = 'dewkin-continuous-core';
  core.userData.qaRole = 'organic-core';
  core.userData.form = 'pelvis-torso-neck-skull-loft';

  // A short, non-spherical muzzle loft gives the face a readable forward plane.
  const muzzle = addMesh(
    g,
    createDepthLoftGeometry([
      { z: 0.24, y: 1.31, radiusX: 0.23, radiusY: 0.16, shapePower: 2.25 },
      { z: 0.31, y: 1.305, radiusX: 0.25, radiusY: 0.15, shapePower: 2.35 },
      { z: 0.4, y: 1.295, radiusX: 0.19, radiusY: 0.12, shapePower: 2.2 },
      { z: 0.48, y: 1.29, radiusX: 0.1, radiusY: 0.075 },
    ], 20, 'dewkin-muzzle-loft'),
    belly,
    0,
    0,
    0,
    scale,
    scale,
    scale,
  );
  muzzle.name = 'dewkin-muzzle-plane';
  muzzle.userData.explodeWithParent = true;

  const bellyPlate = addMesh(g, makeTeardropGeometry(0.48, 0.69, 0.042), belly, 0, 0.7 * scale, 0.315 * scale, scale, scale, scale);
  bellyPlate.name = 'dewkin-keel-belly';
  bellyPlate.userData.explodeWithParent = true;

  const legGeometry = createVerticalLoftGeometry([
    { y: -0.42, z: 0.09, radiusX: 0.13, radiusZ: 0.18, shapePower: 2.6 },
    { y: -0.32, z: 0.045, radiusX: 0.1, radiusZ: 0.105 },
    { y: -0.15, z: 0.015, radiusX: 0.095, radiusZ: 0.1 },
    { y: 0, radiusX: 0.14, radiusZ: 0.14, shapePower: 2.25 },
  ], 16, 'dewkin-webbed-leg-loft');
  for (const [side, part] of [[-1, 'legL'], [1, 'legR']] as const) {
    const leg = addMesh(g, legGeometry, deep, side * 0.17 * scale, 0.43 * scale, 0.015 * scale, scale, scale, scale, 0, 0, 0, part);
    leg.name = `${part}-continuous-webbed-foot`;
    leg.userData.attachment = 'embedded-socket';
  }

  for (const [side, part] of [[-1, 'armL'], [1, 'armR']] as const) {
    const arm = addMesh(
      g,
      createVerticalLoftGeometry([
        { y: -0.52, x: side * 0.12, z: 0.1, radiusX: 0.09, radiusZ: 0.105, shapePower: 2.2 },
        { y: -0.4, x: side * 0.1, z: 0.07, radiusX: 0.078, radiusZ: 0.085 },
        { y: -0.21, x: side * 0.055, z: 0.025, radiusX: 0.085, radiusZ: 0.09 },
        { y: 0, radiusX: 0.125, radiusZ: 0.13, shapePower: 2.25 },
      ], 15, `dewkin-${part}-loft`),
      body,
      side * 0.29 * scale,
      1.0 * scale,
      0.03 * scale,
      scale,
      scale,
      scale,
      0,
      0,
      0,
      part,
    );
    arm.name = `${part}-tapered-flipper-arm`;
    arm.userData.attachment = 'embedded-socket';
  }

  // Side fins and dorsal droplets break the silhouette with bevelled, light-catching edges.
  const sideFin = makeLeafGeometry(0.18, 0.42, 0.052);
  for (const [side, part] of [[-1, 'earL'], [1, 'earR']] as const) {
    addPivotedPart(
      g,
      sideFin,
      fin,
      part,
      new THREE.Vector3(side * 0.29 * scale, 1.4 * scale, 0.07 * scale),
      scale,
      new THREE.Vector3(side * 0.13, 0.04, 0),
      new THREE.Euler(0.08, side * -0.12, side * -1.0),
    );
  }
  for (const [x, h, rz] of [[-0.08, 0.27, 0.18], [0, 0.34, 0], [0.08, 0.25, -0.18]] as const) {
    const crest = addMesh(g, makeLeafGeometry(0.085, h, 0.032), fin, x * scale, 1.61 * scale, 0.02 * scale, scale, scale, scale, 0, 0, rz, 'crest');
    crest.userData.explodeWithParent = true;
  }

  const tail = addPivotedPart(
    g,
    createTaperedCurveGeometry([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.08, 0.02, -0.2),
      new THREE.Vector3(-0.19, 0.1, -0.43),
      new THREE.Vector3(0.02, 0.2, -0.64),
    ], [0.16, 0.145, 0.1, 0.055], 22, 12, 'dewkin-ribbon-tail'),
    body,
    'tail',
    new THREE.Vector3(0, 0.63 * scale, -0.22 * scale),
    scale,
  );
  const tailFin = new THREE.Mesh(makeLeafGeometry(0.32, 0.48, 0.055), fin);
  tailFin.position.set(0.03, 0.22, -0.68);
  tailFin.rotation.set(Math.PI / 2, 0.18, -0.22);
  tailFin.userData.explodeWithParent = true;
  tail.add(tailFin);

  for (const side of [-1, 1] as const) {
    addMesh(g, new THREE.SphereGeometry(0.075, 14, 12), eye, side * 0.12 * scale, 1.39 * scale, 0.31 * scale, 0.9 * scale, 1.2 * scale, 0.38 * scale);
    addMesh(g, new THREE.SphereGeometry(0.043, 12, 10), iris, side * 0.12 * scale, 1.39 * scale, 0.34 * scale, 0.82 * scale, 1.05 * scale, 0.26 * scale);
    addMesh(g, new THREE.SphereGeometry(0.014, 8, 6), catchlight, (side * 0.12 - 0.012) * scale, 1.42 * scale, 0.353 * scale, scale, scale, 0.22 * scale);
    addMesh(g, new THREE.TorusGeometry(0.055, 0.01, 6, 14, Math.PI * 0.72), deep, side * 0.2 * scale, 1.25 * scale, 0.405 * scale, scale, scale, 0.4 * scale, 0, 0, side < 0 ? -0.42 : Math.PI + 0.42);
  }
  addMesh(g, new THREE.SphereGeometry(0.042, 10, 8), deep, 0, 1.3 * scale, 0.49 * scale, 1.2 * scale, 0.65 * scale, 0.7 * scale);
  addMesh(g, new THREE.TorusGeometry(0.06, 0.011, 6, 16, Math.PI), deep, 0, 1.22 * scale, 0.455 * scale, scale, 0.7 * scale, 0.4 * scale, 0, 0, Math.PI);

  g.userData.speciesId = 'dewkin';
  g.userData.materialKind = 'scale';
  g.userData.fidelityTier = 'authored-starter';
  g.userData.formContract = 'single continuous torso/head loft + socketed appendages';
  return g;
}

/** Leaf starter: sprig-lynx biped with one body/head loft and a socketed branch tail. */
export function buildLeafit(scale: number): THREE.Group {
  const g = new THREE.Group();
  const body = mat(0x58b96a, 'fur');
  const deep = mat(0x2e7145, 'fur');
  const leaf = mat(0x318d49, 'feather');
  const leafLight = mat(0x94d568, 'feather', { emissive: 0x4f8f3f, emissiveIntensity: 0.12 });
  const chest = mat(0xd5e99b, 'feather');
  const eye = mat(0x182619, 'shell');
  const iris = mat(0xf0c75b, 'wet');
  const catchlight = mat(0xffffff, 'ember', { emissive: 0xf2ffd2, emissiveIntensity: 0.2 });

  const core = addMesh(
    g,
    createVerticalLoftGeometry([
      { y: 0.22, z: -0.015, radiusX: 0.15, radiusZ: 0.14 },
      { y: 0.29, z: -0.01, radiusX: 0.23, radiusZ: 0.2, shapePower: 2.15 },
      { y: 0.41, z: 0, radiusX: 0.3, radiusZ: 0.25, shapePower: 2.3 },
      { y: 0.56, z: 0.015, radiusX: 0.34, radiusZ: 0.28, shapePower: 2.4 },
      { y: 0.71, z: 0.03, radiusX: 0.33, radiusZ: 0.28, shapePower: 2.35 },
      { y: 0.85, z: 0.05, radiusX: 0.28, radiusZ: 0.25, shapePower: 2.2 },
      { y: 0.97, z: 0.075, radiusX: 0.215, radiusZ: 0.195 },
      { y: 1.06, z: 0.095, radiusX: 0.22, radiusZ: 0.205 },
      { y: 1.14, z: 0.115, radiusX: 0.28, radiusZ: 0.25, shapePower: 2.2 },
      { y: 1.25, z: 0.125, radiusX: 0.34, radiusZ: 0.28, shapePower: 2.4 },
      { y: 1.36, z: 0.115, radiusX: 0.35, radiusZ: 0.28, shapePower: 2.45 },
      { y: 1.46, z: 0.09, radiusX: 0.3, radiusZ: 0.25, shapePower: 2.25 },
      { y: 1.54, z: 0.06, radiusX: 0.22, radiusZ: 0.19 },
      { y: 1.59, z: 0.035, radiusX: 0.12, radiusZ: 0.115 },
    ], 26, 'leafkit-continuous-core'),
    body,
    0,
    0,
    0,
    scale,
    scale,
    scale,
  );
  core.name = 'leafkit-continuous-core';
  core.userData.qaRole = 'organic-core';
  core.userData.form = 'pelvis-torso-neck-skull-loft';

  const muzzle = addMesh(
    g,
    createDepthLoftGeometry([
      { z: 0.25, y: 1.28, radiusX: 0.22, radiusY: 0.145, shapePower: 2.2 },
      { z: 0.32, y: 1.275, radiusX: 0.24, radiusY: 0.14, shapePower: 2.35 },
      { z: 0.4, y: 1.265, radiusX: 0.17, radiusY: 0.105, shapePower: 2.2 },
      { z: 0.46, y: 1.26, radiusX: 0.085, radiusY: 0.065 },
    ], 20, 'leafkit-muzzle-loft'),
    chest,
    0,
    0,
    0,
    scale,
    scale,
    scale,
  );
  muzzle.name = 'leafkit-muzzle-plane';
  muzzle.userData.explodeWithParent = true;

  const petalRuff = addMesh(g, makeRuffGeometry(0.265, 0.19, 6, 0.052), chest, 0, 0.98 * scale, 0.255 * scale, scale, 0.88 * scale, scale, 0, 0, Math.PI / 6);
  petalRuff.name = 'leafkit-six-petal-ruff';
  petalRuff.userData.explodeWithParent = true;

  const legGeometry = createVerticalLoftGeometry([
    { y: -0.41, z: 0.085, radiusX: 0.125, radiusZ: 0.17, shapePower: 2.55 },
    { y: -0.31, z: 0.04, radiusX: 0.092, radiusZ: 0.105 },
    { y: -0.14, z: 0.01, radiusX: 0.087, radiusZ: 0.095 },
    { y: 0, radiusX: 0.135, radiusZ: 0.13, shapePower: 2.25 },
  ], 16, 'leafkit-digitigrade-leg-loft');
  for (const [side, part] of [[-1, 'legL'], [1, 'legR']] as const) {
    const leg = addMesh(g, legGeometry, deep, side * 0.16 * scale, 0.42 * scale, 0.01 * scale, scale, scale, scale, 0, 0, 0, part);
    leg.name = `${part}-continuous-root-paw`;
    leg.userData.attachment = 'embedded-socket';
  }

  for (const [side, part] of [[-1, 'armL'], [1, 'armR']] as const) {
    const arm = addMesh(
      g,
      createVerticalLoftGeometry([
        { y: -0.5, x: side * 0.14, z: 0.1, radiusX: 0.085, radiusZ: 0.095, shapePower: 2.25 },
        { y: -0.39, x: side * 0.11, z: 0.065, radiusX: 0.07, radiusZ: 0.078 },
        { y: -0.2, x: side * 0.06, z: 0.025, radiusX: 0.078, radiusZ: 0.082 },
        { y: 0, radiusX: 0.12, radiusZ: 0.12, shapePower: 2.2 },
      ], 15, `leafkit-${part}-loft`),
      body,
      side * 0.28 * scale,
      0.98 * scale,
      0.035 * scale,
      scale,
      scale,
      scale,
      0,
      0,
      0,
      part,
    );
    arm.name = `${part}-tapered-vine-arm`;
    arm.userData.attachment = 'embedded-socket';
  }

  // Side leaves function as cat-ear silhouette anchors and pivot at the skull.
  const earGeometry = makeLeafGeometry(0.2, 0.48, 0.052);
  for (const [side, part] of [[-1, 'earL'], [1, 'earR']] as const) {
    const ear = addPivotedPart(
      g,
      earGeometry,
      leaf,
      part,
      new THREE.Vector3(side * 0.25 * scale, 1.4 * scale, 0.095 * scale),
      scale,
      new THREE.Vector3(side * 0.09, 0.16, 0),
      new THREE.Euler(0.06, side * -0.12, side * -0.62),
    );
    const vein = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.014, 0.31, 6), leafLight);
    vein.position.set(0, 0.16, 0.04);
    vein.userData.explodeWithParent = true;
    ear.add(vein);
  }

  // Three asymmetrical crown leaves avoid the single-cone placeholder silhouette.
  for (const [x, y, h, rz, material] of [
    [-0.11, 1.57, 0.49, 0.35, leaf],
    [0, 1.6, 0.62, 0.02, leafLight],
    [0.12, 1.56, 0.46, -0.38, leaf],
  ] as const) {
    const crest = addPivotedPart(
      g,
      makeLeafGeometry(0.2, h, 0.055),
      material,
      'crest',
      new THREE.Vector3(x * scale, y * scale, 0.02 * scale),
      scale,
      new THREE.Vector3(0, h * 0.38, 0),
      new THREE.Euler(-0.05, 0, rz),
    );
    crest.userData.cluster = 'three-leaf-crown';
  }

  const tail = addPivotedPart(
    g,
    createTaperedCurveGeometry([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.09, 0.09, -0.22),
      new THREE.Vector3(-0.28, 0.24, -0.42),
      new THREE.Vector3(-0.14, 0.4, -0.6),
    ], [0.105, 0.085, 0.058, 0.032], 22, 10, 'leafkit-branch-tail'),
    deep,
    'tail',
    new THREE.Vector3(0, 0.65 * scale, -0.23 * scale),
    scale,
  );
  const tailLeaf = new THREE.Mesh(makeLeafGeometry(0.31, 0.55, 0.055), leafLight);
  tailLeaf.position.set(-0.15, 0.43, -0.62);
  tailLeaf.rotation.set(Math.PI / 2.15, 0.15, -0.5);
  tailLeaf.userData.explodeWithParent = true;
  tail.add(tailLeaf);

  for (const side of [-1, 1] as const) {
    addMesh(g, new THREE.SphereGeometry(0.074, 14, 12), eye, side * 0.115 * scale, 1.37 * scale, 0.3 * scale, 0.9 * scale, 1.22 * scale, 0.38 * scale);
    addMesh(g, new THREE.SphereGeometry(0.042, 12, 10), iris, side * 0.115 * scale, 1.37 * scale, 0.331 * scale, 0.8 * scale, 1.04 * scale, 0.25 * scale);
    addMesh(g, new THREE.SphereGeometry(0.013, 8, 6), catchlight, (side * 0.115 - 0.012) * scale, 1.4 * scale, 0.344 * scale, scale, scale, 0.2 * scale);
    addMesh(g, new THREE.TorusGeometry(0.075, 0.012, 6, 16, Math.PI * 0.72), deep, side * 0.11 * scale, 1.455 * scale, 0.302 * scale, scale, 0.65 * scale, 0.35 * scale, 0, 0, side < 0 ? 0.25 : Math.PI - 0.25);
  }
  addMesh(g, new THREE.SphereGeometry(0.037, 10, 8), deep, 0, 1.27 * scale, 0.465 * scale, 1.25 * scale, 0.7 * scale, 0.72 * scale);
  addMesh(g, new THREE.TorusGeometry(0.058, 0.01, 6, 16, Math.PI), deep, 0, 1.2 * scale, 0.435 * scale, scale, 0.72 * scale, 0.38 * scale, 0, 0, Math.PI);

  g.userData.speciesId = 'leafit';
  g.userData.materialKind = 'feather';
  g.userData.fidelityTier = 'authored-starter';
  g.userData.formContract = 'single continuous torso/head loft + socketed appendages';
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
