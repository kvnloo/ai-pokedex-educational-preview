/**
 * Wave-7 creature + locomotion fail-closed evidence.
 *
 * Run:
 *   node --experimental-strip-types src/creatures/wave7.selftest.ts
 */
import * as THREE from 'three';
import {
  getClipState,
  makeCreatureMesh,
  playAttack,
  playFaint,
  tickCreatureClip,
} from './index.ts';
import { evaluateMeshQa, type MeshQaResult } from './meshQa.ts';

let failed = 0;
let passed = 0;

function check(name: string, condition: unknown, detail = ''): void {
  if (condition) {
    passed++;
    console.log(`ok   ${name}${detail ? `: ${detail}` : ''}`);
  } else {
    failed++;
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
}

function approx(a: number, b: number, epsilon = 1e-6): boolean {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= epsilon;
}

function dispose(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    geometries.add(mesh.geometry);
    const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of meshMaterials) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}

// ---------------------------------------------------------------------------
// Authored Sparkmoth anatomy. This deliberately measures semantics and volume;
// merely renaming a primitive stack cannot make the gate pass.
// ---------------------------------------------------------------------------
const sparkmoth = makeCreatureMesh('sparkmoth', 1, { assertQa: false, idlePhaseSeed: 0 });
const sparkQa = evaluateMeshQa(sparkmoth) as MeshQaResult & {
  primitiveAssemblyVolumeShare?: number;
  semanticJointCount?: number;
  layeredWingPlaneCount?: number;
  facePlaneCount?: number;
};
const sparkCore = sparkmoth.getObjectByName('sparkmoth-continuous-core') as THREE.Mesh | undefined;
const jointNames: string[] = [];
const wingPlanes: string[] = [];
const facePlanes: string[] = [];
sparkmoth.traverse((object) => {
  if (object.userData.joint) jointNames.push(object.name);
  if (object.userData.qaRole === 'wing-plane') wingPlanes.push(object.name);
  if (object.userData.qaRole === 'face-plane') facePlanes.push(object.name);
});

check('Sparkmoth is promoted to fail-closed authored-wild tier', sparkmoth.userData.fidelityTier === 'authored-wild');
check('Sparkmoth authored-wild mesh gate passes', sparkQa.ok, sparkQa.reasons.join('; '));
check(
  'Sparkmoth has one named continuous head-thorax-abdomen core',
  sparkQa.organicCoreCount === 1 && sparkCore?.userData.qaRole === 'organic-core' && /head-thorax-abdomen/.test(String(sparkCore.userData.form)),
  `cores=${sparkQa.organicCoreCount} name=${sparkCore?.name ?? 'missing'} form=${String(sparkCore?.userData.form ?? '')}`,
);
check(
  'Sparkmoth primitive assembly volume share is bounded',
  typeof sparkQa.primitiveAssemblyVolumeShare === 'number' && sparkQa.primitiveAssemblyVolumeShare <= 0.16,
  `share=${String(sparkQa.primitiveAssemblyVolumeShare)}`,
);
check(
  'Sparkmoth has four authored layered wing planes',
  sparkQa.layeredWingPlaneCount === 4 && wingPlanes.length === 4,
  `qa=${String(sparkQa.layeredWingPlaneCount)} names=${wingPlanes.join(',')}`,
);
check(
  'Sparkmoth exposes jointed legs and rooted appendages',
  typeof sparkQa.semanticJointCount === 'number' && sparkQa.semanticJointCount >= 20 && sparkQa.socketedAppendageCount >= 11,
  `joints=${String(sparkQa.semanticJointCount)} sockets=${sparkQa.socketedAppendageCount} names=${jointNames.join(',')}`,
);
check(
  'Sparkmoth face uses multiple readable authored planes',
  typeof sparkQa.facePlaneCount === 'number' && sparkQa.facePlaneCount >= 7 && facePlanes.length >= 7,
  `qa=${String(sparkQa.facePlaneCount)} names=${facePlanes.join(',')}`,
);

// ---------------------------------------------------------------------------
// Idle is movement-derived: changing wall time without root XZ deltas must not
// walk the legs or advance the gait clock.
// ---------------------------------------------------------------------------
const idleRoot = makeCreatureMesh('emberpup', 1, { idlePhaseSeed: 0, assertQa: false });
const idleState = getClipState(idleRoot)!;
let wall = 0;
for (let frame = 0; frame < 90; frame++) {
  wall += 1 / 60;
  tickCreatureClip(idleRoot, idleState, 1 / 60, wall);
}
const idleLeg = idleRoot.getObjectByName('legFL-shoulder-joint');
const idleLegRotation = idleLeg?.rotation.x ?? Number.NaN;
const idleLegPosition = idleLeg?.position.clone();
for (let frame = 0; frame < 180; frame++) {
  wall += 1 / 60;
  tickCreatureClip(idleRoot, idleState, 1 / 60, wall);
}
const idleLocomotion = (idleState as unknown as { locomotion?: {
  weight: number;
  distance: number;
  phase: number;
  speed: number;
} }).locomotion;
check(
  'Idle gait weight remains zero without root XZ deltas',
  !!idleLocomotion && idleLocomotion.weight <= 1e-4 && idleLocomotion.speed <= 1e-4,
  JSON.stringify(idleLocomotion),
);
check(
  'Idle gait distance remains zero',
  !!idleLocomotion && approx(idleLocomotion.distance, 0, 1e-7),
  JSON.stringify(idleLocomotion),
);
check(
  'Idle planted leg pose is independent of wall time',
  !!idleLeg && !!idleLegPosition && approx(idleLeg.rotation.x, idleLegRotation, 1e-6) && idleLeg.position.distanceTo(idleLegPosition) <= 1e-6,
  `rotation=${idleLeg?.rotation.x} baseline=${idleLegRotation} positionDelta=${idleLeg && idleLegPosition ? idleLeg.position.distanceTo(idleLegPosition) : 'missing'}`,
);

// ---------------------------------------------------------------------------
// Actual root deltas drive cadence and traverse all four authored gait poses.
// ---------------------------------------------------------------------------
const movingRoot = makeCreatureMesh('emberpup', 1, { idlePhaseSeed: 0, assertQa: false });
const movingState = getClipState(movingRoot)!;
tickCreatureClip(movingRoot, movingState, 1 / 60, 0);
const seenPoses = new Set<string>();
let maxWeightSumError = 0;
let maxSupportSlip = 0;
let maxCadence = 0;
for (let frame = 1; frame <= 180; frame++) {
  movingRoot.position.z += 3.2 / 60;
  tickCreatureClip(movingRoot, movingState, 1 / 60, frame / 60);
  const locomotion = (movingState as unknown as { locomotion: {
    pose: string;
    poseWeights: Record<string, number>;
    supportFootSlip: number;
    cadenceHz: number;
  } }).locomotion;
  seenPoses.add(locomotion.pose);
  const sum = Object.values(locomotion.poseWeights).reduce((total, value) => total + value, 0);
  maxWeightSumError = Math.max(maxWeightSumError, Math.abs(1 - sum));
  maxSupportSlip = Math.max(maxSupportSlip, locomotion.supportFootSlip);
  maxCadence = Math.max(maxCadence, locomotion.cadenceHz);
}
const movingLocomotion = (movingState as unknown as { locomotion: {
  distance: number;
  speed: number;
  weight: number;
  phase: number;
  strideLength: number;
  cadenceHz: number;
  supportFootSlip: number;
} }).locomotion;
check(
  'Root XZ deltas accumulate real gait distance',
  movingLocomotion.distance > 9.4 && movingLocomotion.distance < 9.7,
  `distance=${movingLocomotion.distance.toFixed(4)}`,
);
check(
  'Stride cadence is coupled to measured speed',
  movingLocomotion.speed > 3.0 && movingLocomotion.cadenceHz > 3 && movingLocomotion.strideLength > 0.6,
  JSON.stringify(movingLocomotion),
);
check(
  'Contact/down/passing/up poses are all reached',
  ['contact', 'down', 'passing', 'up'].every((pose) => seenPoses.has(pose)),
  [...seenPoses].join(','),
);
check('Gait pose weights are normalized', maxWeightSumError <= 1e-6, `maxError=${maxWeightSumError}`);
check('Support-foot slip stays numerically bounded', maxSupportSlip <= 0.055, `maxSlip=${maxSupportSlip.toFixed(6)}`);

// Faster actual movement must yield faster measured cadence; wall time is equal.
const slowRoot = makeCreatureMesh('emberpup', 1, { idlePhaseSeed: 0, assertQa: false });
const fastRoot = makeCreatureMesh('emberpup', 1, { idlePhaseSeed: 0, assertQa: false });
const slowState = getClipState(slowRoot)!;
const fastState = getClipState(fastRoot)!;
tickCreatureClip(slowRoot, slowState, 1 / 60, 0);
tickCreatureClip(fastRoot, fastState, 1 / 60, 0);
for (let frame = 1; frame <= 120; frame++) {
  slowRoot.position.x += 1.2 / 60;
  fastRoot.position.x += 4.8 / 60;
  tickCreatureClip(slowRoot, slowState, 1 / 60, frame / 60);
  tickCreatureClip(fastRoot, fastState, 1 / 60, frame / 60);
}
const slowLoco = (slowState as unknown as { locomotion: { cadenceHz: number; distance: number } }).locomotion;
const fastLoco = (fastState as unknown as { locomotion: { cadenceHz: number; distance: number } }).locomotion;
check(
  'Faster root deltas produce materially faster cadence',
  fastLoco.cadenceHz > slowLoco.cadenceHz * 2.8 && fastLoco.distance > slowLoco.distance * 3.8,
  `slow=${JSON.stringify(slowLoco)} fast=${JSON.stringify(fastLoco)}`,
);

// Facing deltas drive a bounded turn response and semantic head/spine counter-motion.
const turnRoot = makeCreatureMesh('emberpup', 1, { idlePhaseSeed: 0, assertQa: false });
const turnState = getClipState(turnRoot)!;
tickCreatureClip(turnRoot, turnState, 1 / 60, 0);
for (let frame = 1; frame <= 30; frame++) {
  turnRoot.position.z += 2.4 / 60;
  turnState.baseRotY += 0.018;
  turnRoot.rotation.y = turnState.baseRotY;
  tickCreatureClip(turnRoot, turnState, 1 / 60, frame / 60);
}
const turnLoco = (turnState as unknown as { locomotion: { turnResponse: number; turnRate: number } }).locomotion;
const headRig = turnRoot.getObjectByName('emberpup-head-counter-pivot');
const spineRig = turnRoot.getObjectByName('emberpup-continuous-core');
check(
  'Root yaw deltas produce bounded turn response',
  Math.abs(turnLoco.turnResponse) > 0.02 && Math.abs(turnLoco.turnResponse) <= 1,
  JSON.stringify(turnLoco),
);
check(
  'Head and spine carry opposing turn motion',
  !!headRig && !!spineRig && Math.sign(headRig.rotation.y) !== Math.sign(spineRig.rotation.y) && Math.abs(headRig.rotation.y - spineRig.rotation.y) > 0.015,
  `head=${headRig?.rotation.y} spine=${spineRig?.rotation.y}`,
);

// One-shots remain usable after the locomotion upgrade.
const oneShotRoot = makeCreatureMesh('emberpup', 1, { idlePhaseSeed: 0, assertQa: false });
const oneShotState = getClipState(oneShotRoot)!;
tickCreatureClip(oneShotRoot, oneShotState, 1 / 60, 0);
const attackPivot = oneShotRoot.position.z;
playAttack(oneShotState);
let attackPlaying = false;
for (let frame = 1; frame <= 30; frame++) {
  attackPlaying = tickCreatureClip(oneShotRoot, oneShotState, 1 / 60, frame / 60) || attackPlaying;
}
check('Attack clip still plays and settles to idle', attackPlaying && oneShotState.active === 'idle');
check('Attack clip restores its pivot', approx(oneShotRoot.position.z, attackPivot, 1e-6), `z=${oneShotRoot.position.z}`);
playFaint(oneShotState);
let faintWasPlaying = false;
for (let frame = 1; frame <= 50; frame++) {
  faintWasPlaying = tickCreatureClip(oneShotRoot, oneShotState, 1 / 60, 1 + frame / 60) || faintWasPlaying;
}
check(
  'Faint clip still plays through collapse',
  faintWasPlaying && oneShotState.active === 'faint' && oneShotRoot.scale.y <= 0.16,
  `active=${oneShotState.active} scaleY=${oneShotRoot.scale.y}`,
);

for (const root of [sparkmoth, idleRoot, movingRoot, slowRoot, fastRoot, turnRoot, oneShotRoot]) dispose(root);

console.log(`\nwave7 creature selftest: ${passed} passed, ${failed} failed`);
if (failed > 0) throw new Error(`wave7 creature selftest: ${failed} failure(s)`);
console.log('wave7 creature selftest: all passed');
