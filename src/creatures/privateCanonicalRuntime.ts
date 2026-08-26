import * as THREE from 'three';

export const SPECIES_COLOR: Record<string, number> = {};
type ClipState = { idlePhase: number; active: 'idle' | 'attack' | 'faint'; elapsed: number };
const clips = new WeakMap<THREE.Object3D, ClipState>();

export function makeCreatureMesh(): THREE.Group {
  throw new Error('Procedural creature construction is excluded from the canonical private build');
}

export function getClipState(root: THREE.Object3D): ClipState {
  let state = clips.get(root);
  if (!state) {
    state = { idlePhase: 0, active: 'idle', elapsed: 0 };
    clips.set(root, state);
  }
  return state;
}

export function playAttack(state: ClipState): void { state.active = 'attack'; state.elapsed = 0; }
export function playFaint(state: ClipState): void { state.active = 'faint'; state.elapsed = 0; }
export function tickCreatureClip(root: THREE.Object3D, state: ClipState, dt: number, wallTime: number): void {
  state.elapsed += dt;
  if (state.active === 'idle') root.rotation.y += Math.sin(wallTime * 0.001 + state.idlePhase) * dt * 0.01;
  if (state.active === 'attack' && state.elapsed > 0.5) state.active = 'idle';
  if (state.active === 'faint') root.rotation.z = Math.min(Math.PI / 2, state.elapsed * 2.5);
}