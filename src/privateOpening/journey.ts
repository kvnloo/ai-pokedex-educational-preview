/** Opening-only movement and save model. World geometry is original staging. */
export const OPENING_SAVE_KEY = 'private-opening:ash-pikachu:v1';
export const NORTH_GATE = { z: -8, halfWidth: 1.7 };
export const PIKACHU_MEETING = { x: 2, z: 0 };
export const SOLIDS = [
  { x: -4.6, z: 2, halfX: 1.75, halfZ: 1.6 },
  { x: 4.7, z: 3.5, halfX: 1.75, halfZ: 1.6 },
  { x: 4.4, z: -3.8, halfX: 2.0, halfZ: 1.8 },
] as const;
export interface Journey {
  version: 1;
  player: { x: number; z: number; heading: number };
  companion: { x: number; z: number; heading: number };
  partner: 'pikachu' | null;
  location: 'pallet-town' | 'route-1';
  completed: boolean;
  journal: ('met-pikachu' | 'departed-pallet' | 'reached-route-1')[];
}
export function newJourney(): Journey {
  return { version: 1, player: { x: 0, z: 4, heading: 0 }, companion: { ...PIKACHU_MEETING, heading: Math.PI }, partner: null, location: 'pallet-town', completed: false, journal: [] };
}
function collision(x: number, z: number): boolean {
  return SOLIDS.some(s => Math.abs(x - s.x) < s.halfX + .24 && Math.abs(z - s.z) < s.halfZ + .24);
}
export function meetPartner(state: Journey): boolean {
  if (state.partner || Math.hypot(state.player.x - PIKACHU_MEETING.x, state.player.z - PIKACHU_MEETING.z) > 1.7) return false;
  state.partner = 'pikachu'; state.journal.push('met-pikachu'); return true;
}
function move(state: Journey, x: number, z: number): void {
  const p = state.player;
  const nx = Math.max(-7.5, Math.min(7.5, x));
  const nz = Math.max(-25, Math.min(7.5, z));
  // The fence spans both sides of the north gate and is solid on either side.
  const crossing = (p.z >= NORTH_GATE.z && nz < NORTH_GATE.z) || (p.z < NORTH_GATE.z && nz >= NORTH_GATE.z);
  const atFence = Math.abs(nz - NORTH_GATE.z) < .25 || crossing;
  if (atFence && (Math.abs(nx) > NORTH_GATE.halfWidth - .24 || !state.partner)) return;
  if (!collision(nx, p.z)) p.x = nx;
  if (!collision(p.x, nz)) p.z = nz;
}
export function advanceJourney(state: Journey, dx: number, dz: number, dt: number, run = false): number {
  if (![dx, dz, dt].every(Number.isFinite) || dt <= 0) return 0;
  const seconds = Math.min(dt, .1);
  const magnitude = Math.hypot(dx, dz);
  const speed = run ? 3.4 : 2.0;
  const before = { ...state.player };
  if (magnitude > 0) {
    dx /= Math.max(1, magnitude); dz /= Math.max(1, magnitude);
    // Substeps prevent tunnelling through houses/fences after a dropped frame.
    for (let i = 0; i < 4; i++) move(state, state.player.x + dx * speed * seconds / 4, state.player.z + dz * speed * seconds / 4);
    state.player.heading = Math.atan2(-dx, -dz);
  }
  if (state.partner) {
    const c = state.companion, p = state.player;
    const distance = Math.hypot(p.x - c.x, p.z - c.z);
    if (distance > .65) {
      const step = Math.min(distance - .65, seconds * (run ? 4 : 2.8));
      const cx = c.x + (p.x - c.x) / distance * step;
      const cz = c.z + (p.z - c.z) / distance * step;
      // Follow the same collision boundaries. A turn around a building can
      // temporarily separate the pair; completion waits for the partner.
      if (!collision(cx, c.z)) c.x = cx;
      if (!collision(c.x, cz)) c.z = cz;
      c.heading = Math.atan2(c.x - p.x, c.z - p.z);
    }
  }
  state.location = state.player.z < NORTH_GATE.z ? 'route-1' : 'pallet-town';
  if (state.location === 'route-1' && !state.journal.includes('departed-pallet')) state.journal.push('departed-pallet');
  if (state.partner && state.player.z < -13 && Math.hypot(state.player.x - state.companion.x, state.player.z - state.companion.z) < 2 && !state.completed) {
    state.completed = true; state.journal.push('reached-route-1');
  }
  return Math.hypot(state.player.x - before.x, state.player.z - before.z) / seconds;
}
export function restoreJourney(raw: string | null): Journey {
  if (!raw) return newJourney();
  try {
    const state = JSON.parse(raw) as Journey;
    if (state.version !== 1 || !['pikachu', null].includes(state.partner) || typeof state.completed !== 'boolean') throw new Error('identity');
    for (const p of [state.player, state.companion]) if (!p || ![p.x, p.z, p.heading].every(Number.isFinite) || Math.abs(p.x) > 7.5 || p.z < -25 || p.z > 7.5) throw new Error('position');
    if (collision(state.player.x, state.player.z) || collision(state.companion.x, state.companion.z)) throw new Error('solid');
    if (state.location !== (state.player.z < NORTH_GATE.z ? 'route-1' : 'pallet-town')) throw new Error('map');
    const possible = [[], ['met-pikachu'], ['met-pikachu', 'departed-pallet'], ['met-pikachu', 'departed-pallet', 'reached-route-1']];
    if (!possible.some(j => JSON.stringify(j) === JSON.stringify(state.journal))) throw new Error('journal');
    if (Boolean(state.partner) !== (state.journal.length > 0) || state.completed !== (state.journal.length === 3) || (state.location === 'route-1' && state.journal.length < 2)) throw new Error('progress');
    if (!state.partner && (state.companion.x !== PIKACHU_MEETING.x || state.companion.z !== PIKACHU_MEETING.z)) throw new Error('partner position');
    return state;
  } catch { return newJourney(); }
}
