/**
 * Code-authored creature clips with delta-driven gait state.
 *
 * Grounded locomotion advances only from observed root XZ displacement. The
 * shell still owns world placement and facing; this module derives cadence,
 * contact/down/passing/up weight, support-foot IK, turn response, and secondary
 * motion without requiring a movement-mode argument or main-loop changes.
 */
import * as THREE from 'three';

export type ClipName = 'idle' | 'attack' | 'faint';

export type ClipProfile =
  | 'quadruped' // emberpup / dustbun-like
  | 'biped' // dewkin / leafkit
  | 'moth' // sparkmoth / ironwisp
  | 'beast' // gloomhorn
  | 'default';

export type GaitPoseName = 'contact' | 'down' | 'passing' | 'up';

export interface GaitPoseWeights {
  contact: number;
  down: number;
  passing: number;
  up: number;
}

/** Public numerical evidence for the currently authored gait. */
export interface CreatureLocomotionState {
  initialized: boolean;
  prevRootX: number;
  prevRootZ: number;
  lastFacingY: number;
  deltaX: number;
  deltaZ: number;
  directionX: number;
  directionZ: number;
  speed: number;
  rawSpeed: number;
  acceleration: number;
  weight: number;
  distance: number;
  phase: number;
  strideLength: number;
  cadenceHz: number;
  pose: GaitPoseName;
  poseWeights: GaitPoseWeights;
  turnRate: number;
  turnResponse: number;
  supportPart: string | null;
  /** Instantaneous world-XZ slip of the selected planted paw. */
  supportFootSlip: number;
  teleported: boolean;
}

interface SupportSample {
  part: string;
  x: number;
  z: number;
}

export interface CreatureClipState {
  idlePhase: number;
  idleSpeed: number;
  attackT: number;
  faintT: number;
  active: ClipName;
  baseY: number;
  baseRotY: number;
  /** Shell-owned rest Z; attack applies as baseZ + delta (never absolute wipe). */
  baseZ: number;
  baseScale: THREE.Vector3;
  profile: ClipProfile;
  locomotion: CreatureLocomotionState;
  /** Cached secondary part bases (filled on first tick). */
  _partsReady?: boolean;
  /** Pivot Z captured at attack start when shell has already placed root. */
  _attackPivotZ?: number;
  _supportSample?: SupportSample;
}

export interface CreateClipOpts {
  /** Phase seed in radians (or any number — used as idle offset). */
  idlePhaseSeed?: number;
  idleSpeed?: number;
  baseY?: number;
  baseRotY?: number;
  baseZ?: number;
  profile?: ClipProfile;
}

const TAU = Math.PI * 2;
const STANCE_RATIO = 0.58;
const MOVE_EPSILON = 0.018;
const TELEPORT_DISTANCE = 0.75;
const MAX_DERIVED_SPEED = 12;

function defaultPoseWeights(): GaitPoseWeights {
  return { contact: 1, down: 0, passing: 0, up: 0 };
}

function createLocomotionState(baseRotY: number): CreatureLocomotionState {
  return {
    initialized: false,
    prevRootX: 0,
    prevRootZ: 0,
    lastFacingY: baseRotY,
    deltaX: 0,
    deltaZ: 0,
    directionX: 0,
    directionZ: 1,
    speed: 0,
    rawSpeed: 0,
    acceleration: 0,
    weight: 0,
    distance: 0,
    phase: 0,
    strideLength: 0.7,
    cadenceHz: 0,
    pose: 'contact',
    poseWeights: defaultPoseWeights(),
    turnRate: 0,
    turnResponse: 0,
    supportPart: null,
    supportFootSlip: 0,
    teleported: false,
  };
}

export function createClipState(opts: CreateClipOpts = {}): CreatureClipState {
  const baseRotY = opts.baseRotY ?? 0;
  return {
    idlePhase: opts.idlePhaseSeed ?? Math.random() * Math.PI * 2,
    idleSpeed: opts.idleSpeed ?? 1.6,
    attackT: 0,
    faintT: 0,
    active: 'idle',
    baseY: opts.baseY ?? 0,
    baseRotY,
    baseZ: opts.baseZ ?? 0,
    baseScale: new THREE.Vector3(1, 1, 1),
    profile: opts.profile ?? 'default',
    locomotion: createLocomotionState(baseRotY),
  };
}

/** Hash species+instance into a stable-ish idle phase. */
export function idlePhaseFromSeed(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * TAU;
}

export function clipProfileForSpecies(speciesId: string): ClipProfile {
  switch (speciesId) {
    case 'emberpup':
    case 'dustbun':
    case 'rivlet':
      return 'quadruped';
    case 'dewkin':
    case 'leafit':
    case 'leafkit':
    case 'mossprite':
      return 'biped';
    case 'sparkmoth':
    case 'ironwisp':
      return 'moth';
    case 'gloomhorn':
      return 'beast';
    default:
      return 'default';
  }
}

export function playAttack(state: CreatureClipState): void {
  state.active = 'attack';
  state.attackT = 0;
  state._attackPivotZ = undefined;
}

export function playFaint(state: CreatureClipState): void {
  state.active = 'faint';
  state.faintT = 0;
  state._supportSample = undefined;
}

export function playIdle(state: CreatureClipState): void {
  state.active = 'idle';
  state.attackT = 0;
  state.faintT = 0;
  state._attackPivotZ = undefined;
}

interface PartBase {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  scale: THREE.Vector3;
}

interface GaitRig {
  upperLength: number;
  lowerLength: number;
  restZ: number;
  front: boolean;
}

function ensurePartBases(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const part = obj.userData.part as string | undefined;
    if (!part || obj.userData._clipBase) return;
    obj.userData._clipBase = {
      pos: obj.position.clone(),
      rot: obj.rotation.clone(),
      scale: obj.scale.clone(),
    } satisfies PartBase;
  });
}

function wrapAngle(value: number): number {
  let angle = value;
  while (angle > Math.PI) angle -= TAU;
  while (angle < -Math.PI) angle += TAU;
  return angle;
}

function mod1(value: number): number {
  return ((value % 1) + 1) % 1;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function circularDistance(a: number, b: number): number {
  const delta = Math.abs(mod1(a) - mod1(b));
  return Math.min(delta, 1 - delta);
}

/** Four normalized cardinal weights make authored gait phase inspectable. */
function poseWeightsAt(phase: number): GaitPoseWeights {
  const t = mod1(phase / TAU);
  const raw: GaitPoseWeights = {
    contact: Math.max(0, 1 - circularDistance(t, 0) * 4),
    down: Math.max(0, 1 - circularDistance(t, 0.25) * 4),
    passing: Math.max(0, 1 - circularDistance(t, 0.5) * 4),
    up: Math.max(0, 1 - circularDistance(t, 0.75) * 4),
  };
  const sum = raw.contact + raw.down + raw.passing + raw.up;
  if (sum <= 1e-9) return defaultPoseWeights();
  return {
    contact: raw.contact / sum,
    down: raw.down / sum,
    passing: raw.passing / sum,
    up: raw.up / sum,
  };
}

function dominantPose(weights: GaitPoseWeights): GaitPoseName {
  let pose: GaitPoseName = 'contact';
  let best = weights.contact;
  for (const candidate of ['down', 'passing', 'up'] as const) {
    if (weights[candidate] > best) {
      best = weights[candidate];
      pose = candidate;
    }
  }
  return pose;
}

function strideBase(profile: ClipProfile): number {
  switch (profile) {
    case 'quadruped':
      return 0.7;
    case 'biped':
      return 0.76;
    case 'beast':
      return 0.92;
    case 'moth':
      return 0.68;
    default:
      return 0.72;
  }
}

/** Read shell-owned root placement before clips write any attack delta. */
function advanceLocomotion(root: THREE.Object3D, state: CreatureClipState, dt: number): void {
  const locomotion = state.locomotion;
  const safeDt = Math.max(1 / 300, Math.min(0.1, Number.isFinite(dt) ? dt : 0));
  const x = root.position.x;
  const z = root.position.z;
  locomotion.teleported = false;

  if (!locomotion.initialized) {
    locomotion.initialized = true;
    locomotion.prevRootX = x;
    locomotion.prevRootZ = z;
    locomotion.lastFacingY = state.baseRotY;
    return;
  }

  let deltaX = x - locomotion.prevRootX;
  let deltaZ = z - locomotion.prevRootZ;
  locomotion.prevRootX = x;
  locomotion.prevRootZ = z;
  let deltaDistance = Math.hypot(deltaX, deltaZ);
  const derivedSpeed = deltaDistance / safeDt;
  const oneShot = state.active !== 'idle';
  if (deltaDistance > TELEPORT_DISTANCE || derivedSpeed > MAX_DERIVED_SPEED || oneShot) {
    locomotion.teleported = deltaDistance > TELEPORT_DISTANCE || derivedSpeed > MAX_DERIVED_SPEED;
    deltaX = 0;
    deltaZ = 0;
    deltaDistance = 0;
    state._supportSample = undefined;
  }

  locomotion.deltaX = deltaX;
  locomotion.deltaZ = deltaZ;
  if (deltaDistance > 1e-8) {
    locomotion.directionX = deltaX / deltaDistance;
    locomotion.directionZ = deltaZ / deltaDistance;
  }
  locomotion.rawSpeed = deltaDistance / safeDt;
  const previousSpeed = locomotion.speed;
  const speedResponse = locomotion.rawSpeed > locomotion.speed ? 16 : 11;
  const speedBlend = 1 - Math.exp(-speedResponse * safeDt);
  locomotion.speed += (locomotion.rawSpeed - locomotion.speed) * speedBlend;
  if (locomotion.speed < 1e-4) locomotion.speed = 0;
  locomotion.acceleration = THREE.MathUtils.clamp(
    (locomotion.speed - previousSpeed) / safeDt,
    -12,
    12,
  );

  const moveTarget = locomotion.rawSpeed > MOVE_EPSILON && !oneShot ? 1 : 0;
  const weightResponse = moveTarget > locomotion.weight ? 14 : 10;
  locomotion.weight += (moveTarget - locomotion.weight) * (1 - Math.exp(-weightResponse * safeDt));
  if (locomotion.weight < 1e-4) locomotion.weight = 0;

  const speedRatio = clamp01(locomotion.speed / 5.4);
  locomotion.strideLength = strideBase(state.profile) * (0.9 + speedRatio * 0.24);
  locomotion.cadenceHz = locomotion.speed / Math.max(0.1, locomotion.strideLength);
  if (deltaDistance > 0 && moveTarget > 0) {
    locomotion.distance += deltaDistance;
    locomotion.phase = (locomotion.phase + (deltaDistance / locomotion.strideLength) * TAU) % TAU;
  }
  locomotion.poseWeights = poseWeightsAt(locomotion.phase);
  locomotion.pose = dominantPose(locomotion.poseWeights);

  const yawDelta = wrapAngle(state.baseRotY - locomotion.lastFacingY);
  locomotion.lastFacingY = state.baseRotY;
  const targetTurnRate = THREE.MathUtils.clamp(yawDelta / safeDt, -8, 8);
  locomotion.turnRate += (targetTurnRate - locomotion.turnRate) * (1 - Math.exp(-12 * safeDt));
  const targetTurnResponse = THREE.MathUtils.clamp(locomotion.turnRate / 4.5, -1, 1);
  locomotion.turnResponse +=
    (targetTurnResponse - locomotion.turnResponse) * (1 - Math.exp(-10 * safeDt));
  if (Math.abs(locomotion.turnResponse) < 1e-5) locomotion.turnResponse = 0;
}

function phaseOffset(part: string, profile: ClipProfile): number {
  if (profile === 'quadruped' || profile === 'beast') {
    // Trot: front-left + back-right, then the opposite diagonal pair.
    if (part === 'legFR' || part === 'legBL') return 0.5;
    return 0;
  }
  if (part === 'legR' || part.endsWith('R')) return 0.5;
  return 0;
}

function limbCycle(part: string, state: CreatureClipState): number {
  return mod1(state.locomotion.phase / TAU + phaseOffset(part, state.profile));
}

function smoothStep01(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

/**
 * Solve a two-link limb in the sagittal YZ plane. Geometry points down local -Y;
 * paw counter-rotation keeps its authored plane level through stance.
 */
function applyTwoLinkLeg(
  obj: THREE.Object3D,
  base: PartBase,
  state: CreatureClipState,
  part: string,
  bodyVertical: number,
  attackAmt: number,
): void {
  const rig = obj.userData.gaitRig as GaitRig;
  const knee = obj.getObjectByName(`${part}-${rig.front ? 'elbow' : 'hock'}-joint`);
  const paw = obj.getObjectByName(`${part}-paw-joint`);
  if (!knee || !paw) return;

  const cycle = limbCycle(part, state);
  const locomotion = state.locomotion;
  const stanceRange = locomotion.strideLength * STANCE_RATIO;
  let gaitZ: number;
  let gaitY = -0.455 - bodyVertical;
  if (cycle < STANCE_RATIO) {
    gaitZ = stanceRange * 0.5 - stanceRange * (cycle / STANCE_RATIO);
  } else {
    const swing = (cycle - STANCE_RATIO) / (1 - STANCE_RATIO);
    gaitZ = THREE.MathUtils.lerp(-stanceRange * 0.5, stanceRange * 0.5, smoothStep01(swing));
    gaitY += Math.sin(swing * Math.PI) * (0.105 + clamp01(locomotion.speed / 5.4) * 0.035);
  }
  gaitZ += attackAmt * (rig.front ? 0.12 : -0.06);

  const weight = locomotion.weight;
  const targetZ = THREE.MathUtils.lerp(rig.restZ, gaitZ, weight);
  const targetY = THREE.MathUtils.lerp(-0.455, gaitY, weight);
  const down = Math.max(0.03, -targetY);
  const reach = Math.hypot(targetZ, down);
  const minReach = Math.abs(rig.upperLength - rig.lowerLength) + 1e-4;
  const maxReach = rig.upperLength + rig.lowerLength - 1e-4;
  const clampedReach = THREE.MathUtils.clamp(reach, minReach, maxReach);
  const scale = clampedReach / Math.max(reach, 1e-8);
  const z = targetZ * scale;
  const d = down * scale;
  const targetAngle = Math.atan2(z, d);
  const beta = Math.acos(
    THREE.MathUtils.clamp(
      (clampedReach * clampedReach + rig.upperLength * rig.upperLength - rig.lowerLength * rig.lowerLength) /
        (2 * clampedReach * rig.upperLength),
      -1,
      1,
    ),
  );
  const bendSign = rig.front ? 1 : -1;
  const upperAngle = targetAngle - beta * bendSign;
  const jointZ = Math.sin(upperAngle) * rig.upperLength;
  const jointDown = Math.cos(upperAngle) * rig.upperLength;
  const lowerAngle = Math.atan2(z - jointZ, d - jointDown);

  obj.rotation.x = base.rot.x - upperAngle;
  knee.rotation.x = -(lowerAngle - upperAngle);
  paw.rotation.x = lowerAngle;
}

function isGroundLegPart(part: string): boolean {
  return (
    part === 'legFL' ||
    part === 'legFR' ||
    part === 'legBL' ||
    part === 'legBR' ||
    part === 'legL' ||
    part === 'legR'
  );
}

function bodyVerticalOffset(state: CreatureClipState): number {
  const weights = state.locomotion.poseWeights;
  return (
    weights.contact * 0.006 +
    weights.down * -0.032 +
    weights.passing * 0.002 +
    weights.up * 0.026
  ) * state.locomotion.weight;
}

function secondaryMotion(
  root: THREE.Object3D,
  state: CreatureClipState,
  idlePhase: number,
  attackAmt: number,
  faintAmt: number,
  bodyVertical: number,
): void {
  if (!state._partsReady) {
    ensurePartBases(root);
    state._partsReady = true;
  }

  const profile = state.profile;
  const locomotion = state.locomotion;
  root.traverse((obj) => {
    const part = obj.userData.part as string | undefined;
    const base = obj.userData._clipBase as PartBase | undefined;
    if (!part || !base) return;

    obj.position.copy(base.pos);
    obj.rotation.copy(base.rot);
    obj.scale.copy(base.scale);

    if (faintAmt > 0) {
      obj.rotation.z += faintAmt * (part.includes('L') ? 0.6 : -0.4);
      obj.scale.multiplyScalar(1 - faintAmt * 0.35);
      return;
    }

    if (isGroundLegPart(part)) {
      if (obj.userData.gaitRig) {
        applyTwoLinkLeg(obj, base, state, part, bodyVertical, attackAmt);
      } else {
        const cycle = limbCycle(part, state);
        const swing = Math.sin(cycle * TAU);
        obj.rotation.x =
          base.rot.x + swing * (profile === 'beast' ? 0.34 : profile === 'biped' ? 0.28 : 0.32) * locomotion.weight;
        obj.position.y =
          base.pos.y + Math.max(0, -Math.cos(cycle * TAU)) * 0.045 * locomotion.weight;
      }
      return;
    }

    if (part.startsWith('mothLeg')) {
      const index = Number(part.at(-1) ?? 1);
      const side = part.includes('L') ? -1 : 1;
      const tremor = Math.sin(idlePhase * 1.7 + index * 1.3) * 0.035;
      obj.rotation.z = base.rot.z + side * (tremor + attackAmt * 0.12);
      obj.rotation.x = base.rot.x + Math.sin(locomotion.phase + index) * 0.08 * locomotion.weight;
      return;
    }

    switch (part) {
      case 'spine': {
        const counter = (locomotion.poseWeights.down - locomotion.poseWeights.up) * 0.035;
        obj.rotation.x = base.rot.x + counter * locomotion.weight - attackAmt * 0.08;
        obj.rotation.y = base.rot.y + locomotion.turnResponse * 0.075 * locomotion.weight;
        obj.rotation.z = base.rot.z - locomotion.turnResponse * 0.025 * locomotion.weight;
        break;
      }
      case 'head': {
        const counter = (locomotion.poseWeights.up - locomotion.poseWeights.down) * 0.055;
        obj.rotation.x = base.rot.x + counter * locomotion.weight + attackAmt * 0.1;
        obj.rotation.y = base.rot.y - locomotion.turnResponse * 0.24 * locomotion.weight;
        obj.rotation.z = base.rot.z + locomotion.turnResponse * 0.035 * locomotion.weight;
        break;
      }
      case 'tail':
      case 'flame': {
        const locomotionSweep = Math.sin(locomotion.phase - 0.7) * 0.18 * locomotion.weight;
        const idleSweep = Math.sin(idlePhase * 0.72) * (profile === 'quadruped' ? 0.12 : 0.08);
        obj.rotation.x =
          base.rot.x + idleSweep + locomotionSweep + attackAmt * 0.5 + locomotion.turnResponse * 0.16;
        obj.rotation.z =
          base.rot.z + Math.sin(idlePhase * 0.51) * 0.08 - locomotion.turnResponse * 0.22;
        break;
      }
      case 'earL':
      case 'earR': {
        const side = part === 'earL' ? 1 : -1;
        const gaitFlick = Math.sin(locomotion.phase + side * 0.8) * 0.06 * locomotion.weight;
        obj.rotation.z =
          base.rot.z + Math.sin(idlePhase * 0.47 + side) * 0.035 * side + gaitFlick * side;
        obj.rotation.x =
          base.rot.x + Math.sin(idlePhase * 0.31) * 0.025 + attackAmt * 0.15 - locomotion.acceleration * 0.004;
        break;
      }
      case 'wingL':
      case 'wingR': {
        const side = part === 'wingL' ? 1 : -1;
        const layer = obj.userData.layer === 'hind' ? 0.82 : 1;
        const flapRate = profile === 'moth' ? 4.8 + clamp01(locomotion.speed / 5.4) * 2.2 : 2;
        const flap = Math.sin(idlePhase * flapRate) * 0.34 * layer;
        obj.rotation.z = base.rot.z + flap * side + attackAmt * 0.5 * side;
        obj.rotation.x =
          base.rot.x + Math.cos(idlePhase * flapRate * 0.5) * 0.055 * layer - locomotion.turnResponse * 0.05 * side;
        break;
      }
      case 'antennaL':
      case 'antennaR': {
        const side = part === 'antennaL' ? 1 : -1;
        obj.rotation.z =
          base.rot.z + Math.sin(idlePhase * 1.55 + side) * 0.105 * side - locomotion.turnResponse * 0.08;
        obj.rotation.x = base.rot.x - locomotion.acceleration * 0.006 + attackAmt * 0.12;
        break;
      }
      case 'crest':
      case 'hornL':
      case 'hornR': {
        obj.rotation.z = base.rot.z + Math.sin(idlePhase * 0.6) * 0.035;
        obj.rotation.x = base.rot.x + attackAmt * 0.2 - locomotion.acceleration * 0.003;
        break;
      }
      case 'armL':
      case 'armR': {
        const side = part === 'armL' ? 1 : -1;
        obj.rotation.z =
          base.rot.z + Math.sin(idlePhase * 0.58) * 0.04 * side + attackAmt * 0.35 * side;
        obj.rotation.x =
          base.rot.x + Math.sin(locomotion.phase + side) * 0.16 * locomotion.weight + attackAmt * 0.25;
        break;
      }
      case 'fin': {
        obj.rotation.y = base.rot.y + Math.sin(idlePhase * 0.82) * 0.13 + attackAmt * 0.3;
        break;
      }
      default:
        break;
    }
  });
}

function selectedSupportPart(state: CreatureClipState): string | null {
  if (state.profile !== 'quadruped' && state.profile !== 'beast') return null;
  const cycle = mod1(state.locomotion.phase / TAU);
  return cycle < STANCE_RATIO ? 'legFL' : 'legFR';
}

function measureSupportSlip(root: THREE.Object3D, state: CreatureClipState): void {
  const locomotion = state.locomotion;
  const part = selectedSupportPart(state);
  locomotion.supportPart = part;
  if (!part || locomotion.weight < 0.9 || locomotion.teleported) {
    locomotion.supportFootSlip = 0;
    state._supportSample = undefined;
    return;
  }
  const paw = root.getObjectByName(`${part}-paw-joint`);
  if (!paw) {
    locomotion.supportFootSlip = 0;
    state._supportSample = undefined;
    return;
  }
  root.updateWorldMatrix(true, true);
  const local = paw.userData.footContact as [number, number, number] | undefined;
  const point = new THREE.Vector3(local?.[0] ?? 0, local?.[1] ?? 0, local?.[2] ?? 0);
  paw.localToWorld(point);
  const previous = state._supportSample;
  if (!previous || previous.part !== part) {
    locomotion.supportFootSlip = 0;
  } else {
    locomotion.supportFootSlip = Math.hypot(point.x - previous.x, point.z - previous.z);
  }
  state._supportSample = { part, x: point.x, z: point.z };
}

function copyBaseScale(root: THREE.Object3D, state: CreatureClipState): void {
  // Runtime template clones serialize userData Vector3s to plain {x,y,z} values.
  const scale = state.baseScale as THREE.Vector3 | { x: number; y: number; z: number };
  root.scale.set(scale.x, scale.y, scale.z);
}

/**
 * Advance clip and write pose onto `root`.
 * @returns true while a one-shot (attack/faint) is still playing.
 */
export function tickCreatureClip(
  root: THREE.Object3D,
  state: CreatureClipState,
  dt: number,
  wallTime = 0,
): boolean {
  advanceLocomotion(root, state, dt);
  let attackAmt = 0;
  let faintAmt = 0;
  const idlePhase = wallTime * state.idleSpeed + state.idlePhase;

  if (state.active === 'attack') {
    // Capture shell placement as pivot once so Z is base+delta, not absolute overwrite.
    if (state.attackT === 0 || state._attackPivotZ === undefined) {
      state._attackPivotZ = root.position.z;
      state.baseZ = state._attackPivotZ;
    }
    state.attackT += dt;
    const duration = state.profile === 'moth' ? 0.28 : state.profile === 'beast' ? 0.34 : 0.3;
    const progress = Math.min(1, state.attackT / duration);
    attackAmt = Math.sin(progress * Math.PI);
    const lunge =
      (state.profile === 'moth' ? 0.4 : state.profile === 'beast' ? 0.7 : 0.55) * attackAmt;
    const pivot = state._attackPivotZ ?? state.baseZ;
    root.position.z = pivot - lunge;
    root.position.y = state.baseY + attackAmt * 0.12;
    root.rotation.y = state.baseRotY;
    root.rotation.x = -attackAmt * (state.profile === 'biped' ? 0.18 : 0.25);
    root.rotation.z = state.locomotion.turnResponse * -0.025;
    const squash = 1 + attackAmt * 0.08;
    root.scale.set(squash, 2 - squash, squash + attackAmt * 0.04);
    secondaryMotion(root, state, idlePhase, attackAmt, 0, 0);
    if (progress >= 1) {
      playIdle(state);
      root.position.z = pivot;
      root.position.y = state.baseY;
      root.rotation.x = 0;
      root.rotation.z = 0;
      copyBaseScale(root, state);
      attackAmt = 0;
    }
    return state.active === 'attack';
  }

  if (state.active === 'faint') {
    state.faintT += dt;
    const progress = Math.min(1, state.faintT / 0.7);
    faintAmt = progress;
    root.position.y = state.baseY + (1 - progress) * 0.05 - progress * 0.35;
    root.rotation.y = state.baseRotY;
    root.rotation.z = progress * 1.2;
    root.scale.set(1, Math.max(0.15, 1 - progress * 0.85), 1);
    root.rotation.x = progress * 0.4;
    secondaryMotion(root, state, idlePhase, 0, faintAmt, 0);
    return progress < 1;
  }

  const bodyVertical = bodyVerticalOffset(state);
  copyBaseScale(root, state);
  root.rotation.y = state.baseRotY;
  if (state.profile === 'moth') {
    // Hover species remain airborne, but their wing rate and turn bank still
    // react to actual movement rather than advancing a fake walking cycle.
    const hover = Math.sin(idlePhase * 1.15) * 0.055;
    root.position.y = state.baseY + hover;
    root.rotation.x = Math.sin(idlePhase * 0.7) * 0.025 - state.locomotion.acceleration * 0.004;
    root.rotation.z = -state.locomotion.turnResponse * 0.07;
  } else {
    root.position.y = state.baseY + bodyVertical;
    root.rotation.x =
      (state.locomotion.poseWeights.contact - state.locomotion.poseWeights.passing) *
        0.018 *
        state.locomotion.weight -
      state.locomotion.acceleration * 0.003;
    root.rotation.z = -state.locomotion.turnResponse * 0.085 * state.locomotion.weight;
  }

  secondaryMotion(root, state, idlePhase, 0, 0, bodyVertical);
  measureSupportSlip(root, state);
  return false;
}
