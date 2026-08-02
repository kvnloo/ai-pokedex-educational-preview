/**
 * Code-authored idle / attack / faint clips (category D).
 * Idle phase is seeded per instance so consecutive wilds desync.
 */
import * as THREE from 'three';

export type ClipName = 'idle' | 'attack' | 'faint';

export interface CreatureClipState {
  idlePhase: number;
  idleSpeed: number;
  attackT: number;
  faintT: number;
  active: ClipName;
  baseY: number;
  baseRotY: number;
  baseScale: THREE.Vector3;
}

export interface CreateClipOpts {
  /** Phase seed in radians (or any number — used as idle offset). */
  idlePhaseSeed?: number;
  idleSpeed?: number;
  baseY?: number;
  baseRotY?: number;
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
  };
}

/** Hash species+instance into a stable-ish idle phase. */
export function idlePhaseFromSeed(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * Math.PI * 2;
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
  if (state.active === 'attack') {
    state.attackT += dt;
    const t = state.attackT;
    // Lunge forward then settle (~0.45s)
    const p = Math.min(1, t / 0.45);
    const lunge = Math.sin(p * Math.PI) * 0.55;
    root.position.z = -lunge; // relative offset applied by caller if needed
    root.position.y = state.baseY + Math.sin(p * Math.PI) * 0.12;
    root.rotation.x = -Math.sin(p * Math.PI) * 0.25;
    root.scale.setScalar(1 + Math.sin(p * Math.PI) * 0.08);
    if (p >= 1) {
      playIdle(state);
      root.position.z = 0;
      root.rotation.x = 0;
      root.scale.copy(state.baseScale);
    }
    return state.active === 'attack';
  }

  if (state.active === 'faint') {
    state.faintT += dt;
    const p = Math.min(1, state.faintT / 0.7);
    root.position.y = state.baseY + (1 - p) * 0.05 - p * 0.35;
    root.rotation.z = p * 1.2;
    root.scale.set(1, Math.max(0.15, 1 - p * 0.85), 1);
    root.rotation.x = p * 0.4;
    return p < 1;
  }

  // Idle bob + subtle sway — phase seeded per instance
  const phase = wallTime * state.idleSpeed + state.idlePhase;
  root.position.y = state.baseY + Math.sin(phase) * 0.06;
  root.rotation.y = state.baseRotY + Math.sin(phase * 0.35) * 0.12;
  root.rotation.z = Math.sin(phase * 0.5) * 0.03;
  const squash = 1 + Math.sin(phase) * 0.02;
  root.scale.set(squash, 2 - squash, squash);
  return false;
}
