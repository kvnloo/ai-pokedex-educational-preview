/**
 * Code-authored idle / attack / faint clips (category D).
 * Idle phase is seeded per instance so consecutive wilds desync.
 * Secondary motion targets userData.part tags on child meshes.
 */
import * as THREE from 'three';

export type ClipName = 'idle' | 'attack' | 'faint';

export type ClipProfile =
  | 'quadruped' // emberpup / dustbun-like
  | 'biped' // dewkin / leafkit
  | 'moth' // sparkmoth / ironwisp
  | 'beast' // gloomhorn
  | 'default';

export interface CreatureClipState {
  idlePhase: number;
  idleSpeed: number;
  attackT: number;
  faintT: number;
  active: ClipName;
  baseY: number;
  baseRotY: number;
  baseScale: THREE.Vector3;
  profile: ClipProfile;
  /** Cached secondary part bases (filled on first tick). */
  _partsReady?: boolean;
}

export interface CreateClipOpts {
  /** Phase seed in radians (or any number — used as idle offset). */
  idlePhaseSeed?: number;
  idleSpeed?: number;
  baseY?: number;
  baseRotY?: number;
  profile?: ClipProfile;
}

export function createClipState(opts: CreateClipOpts = {}): CreatureClipState {
  return {
    idlePhase: opts.idlePhaseSeed ?? Math.random() * Math.PI * 2,
    idleSpeed: opts.idleSpeed ?? 1.6,
    attackT: 0,
    faintT: 0,
    active: 'idle',
    baseY: opts.baseY ?? 0,
    baseRotY: opts.baseRotY ?? 0,
    baseScale: new THREE.Vector3(1, 1, 1),
    profile: opts.profile ?? 'default',
  };
}

/** Hash species+instance into a stable-ish idle phase. */
export function idlePhaseFromSeed(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * Math.PI * 2;
}

export function clipProfileForSpecies(speciesId: string): ClipProfile {
  switch (speciesId) {
    case 'emberpup':
    case 'dustbun':
      return 'quadruped';
    case 'dewkin':
    case 'leafit':
    case 'leafkit':
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
}

export function playFaint(state: CreatureClipState): void {
  state.active = 'faint';
  state.faintT = 0;
}

export function playIdle(state: CreatureClipState): void {
  state.active = 'idle';
  state.attackT = 0;
  state.faintT = 0;
}

interface PartBase {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  scale: THREE.Vector3;
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

function secondaryMotion(
  root: THREE.Object3D,
  state: CreatureClipState,
  phase: number,
  attackAmt: number,
  faintAmt: number,
): void {
  if (!state._partsReady) {
    ensurePartBases(root);
    state._partsReady = true;
  }

  const profile = state.profile;
  root.traverse((obj) => {
    const part = obj.userData.part as string | undefined;
    const base = obj.userData._clipBase as PartBase | undefined;
    if (!part || !base) return;

    obj.position.copy(base.pos);
    obj.rotation.copy(base.rot);
    obj.scale.copy(base.scale);

    if (faintAmt > 0) {
      // Collapse secondary parts toward body on faint
      obj.rotation.z += faintAmt * (part.includes('L') ? 0.6 : -0.4);
      obj.scale.multiplyScalar(1 - faintAmt * 0.35);
      return;
    }

    switch (part) {
      case 'tail':
      case 'flame': {
        const w = profile === 'quadruped' ? 0.35 : 0.22;
        obj.rotation.x = base.rot.x + Math.sin(phase * 1.4) * w + attackAmt * 0.5;
        obj.rotation.z = base.rot.z + Math.sin(phase * 0.9) * 0.12;
        break;
      }
      case 'earL':
      case 'earR': {
        const side = part === 'earL' ? 1 : -1;
        obj.rotation.z = base.rot.z + Math.sin(phase * 1.1 + side) * 0.08 * side;
        obj.rotation.x = base.rot.x + Math.sin(phase * 0.7) * 0.05 + attackAmt * 0.15;
        break;
      }
      case 'wingL':
      case 'wingR': {
        const side = part === 'wingL' ? 1 : -1;
        const flap = Math.sin(phase * (profile === 'moth' ? 3.2 : 2.0)) * 0.28;
        obj.rotation.z = base.rot.z + flap * side + attackAmt * 0.45 * side;
        obj.rotation.y = base.rot.y + Math.sin(phase * 1.5) * 0.06 * side;
        break;
      }
      case 'antennaL':
      case 'antennaR': {
        const side = part === 'antennaL' ? 1 : -1;
        obj.rotation.z = base.rot.z + Math.sin(phase * 2.1 + side) * 0.15 * side;
        break;
      }
      case 'crest':
      case 'hornL':
      case 'hornR': {
        obj.rotation.z = base.rot.z + Math.sin(phase * 0.6) * 0.04;
        obj.rotation.x = base.rot.x + attackAmt * 0.2;
        break;
      }
      case 'armL':
      case 'armR': {
        const side = part === 'armL' ? 1 : -1;
        obj.rotation.z = base.rot.z + Math.sin(phase * 0.9) * 0.06 * side + attackAmt * 0.35 * side;
        break;
      }
      case 'legFL':
      case 'legFR':
      case 'legBL':
      case 'legBR': {
        // Diagonal quadruped gait; front/back opposite phase for readable stride
        const front = part.endsWith('FL') || part.endsWith('FR');
        const left = part.endsWith('FL') || part.endsWith('BL');
        const gaitPhase = phase * (profile === 'quadruped' ? 2.4 : 1.8) + (front ? 0 : Math.PI) + (left ? 0 : Math.PI * 0.5);
        const stride = profile === 'quadruped' ? 0.28 : 0.14;
        const lift = profile === 'quadruped' ? 0.045 : 0.02;
        obj.rotation.x = base.rot.x + Math.sin(gaitPhase) * stride + attackAmt * (front ? 0.55 : -0.35);
        obj.position.y = base.pos.y + Math.max(0, Math.sin(gaitPhase)) * lift;
        obj.position.z = base.pos.z + Math.sin(gaitPhase) * (front ? 0.03 : -0.02) * (profile === 'quadruped' ? 1 : 0.5);
        break;
      }
      case 'fin': {
        obj.rotation.y = base.rot.y + Math.sin(phase * 1.3) * 0.18 + attackAmt * 0.3;
        break;
      }
      default:
        break;
    }
  });
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
  let attackAmt = 0;
  let faintAmt = 0;

  if (state.active === 'attack') {
    state.attackT += dt;
    const t = state.attackT;
    // Align peak (~half of dur) with playLunge impact window (~130–150ms)
    const dur =
      state.profile === 'moth' ? 0.28 : state.profile === 'beast' ? 0.34 : 0.3;
    const p = Math.min(1, t / dur);
    attackAmt = Math.sin(p * Math.PI);
    const lunge =
      (state.profile === 'moth' ? 0.4 : state.profile === 'beast' ? 0.7 : 0.55) * attackAmt;
    root.position.z = -lunge;
    root.position.y = state.baseY + attackAmt * 0.12;
    root.rotation.x = -attackAmt * (state.profile === 'biped' ? 0.18 : 0.25);
    const squash = 1 + attackAmt * 0.08;
    root.scale.set(squash, 2 - squash, squash + attackAmt * 0.04);
    if (p >= 1) {
      playIdle(state);
      root.position.z = 0;
      root.rotation.x = 0;
      root.scale.copy(state.baseScale);
      attackAmt = 0;
    }
    secondaryMotion(root, state, wallTime * state.idleSpeed + state.idlePhase, attackAmt, 0);
    return state.active === 'attack';
  }

  if (state.active === 'faint') {
    state.faintT += dt;
    const p = Math.min(1, state.faintT / 0.7);
    faintAmt = p;
    root.position.y = state.baseY + (1 - p) * 0.05 - p * 0.35;
    root.rotation.z = p * 1.2;
    root.scale.set(1, Math.max(0.15, 1 - p * 0.85), 1);
    root.rotation.x = p * 0.4;
    secondaryMotion(root, state, wallTime * state.idleSpeed + state.idlePhase, 0, faintAmt);
    return p < 1;
  }

  // Idle bob + subtle sway — phase seeded per instance
  const phase = wallTime * state.idleSpeed + state.idlePhase;
  const bob =
    state.profile === 'moth' ? 0.09 : state.profile === 'beast' ? 0.04 : 0.06;
  root.position.y = state.baseY + Math.sin(phase) * bob;
  root.rotation.y = state.baseRotY + Math.sin(phase * 0.35) * 0.12;
  root.rotation.z = Math.sin(phase * 0.5) * 0.03;
  root.rotation.x = Math.sin(phase * 0.4) * (state.profile === 'moth' ? 0.04 : 0.015);
  const squash = 1 + Math.sin(phase) * 0.02;
  root.scale.set(squash, 2 - squash, squash);

  secondaryMotion(root, state, phase, 0, 0);
  return false;
}
