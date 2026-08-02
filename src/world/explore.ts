/**
 * Simple third-person WASD explore on a plane + grass zone trigger.
 * Pure logic + optional THREE mesh wiring from main.
 */

export interface Vec2 {
  x: number;
  z: number;
}

export interface ExploreBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface GrassZone {
  /** Center of grass patch */
  cx: number;
  cz: number;
  /** Half-extent (axis-aligned box) */
  half: number;
  /** Chance per grass-step to trigger encounter (0–1) */
  encounterChance: number;
}

export interface ExploreState {
  pos: Vec2;
  yaw: number;
  speed: number;
  runMultiplier: number;
  bounds: ExploreBounds;
  grass: GrassZone;
  /** Keys currently held */
  keys: Set<string>;
  /** Steps taken inside grass since last encounter check */
  grassSteps: number;
  /** Cooldown seconds before another encounter can fire */
  encounterCooldown: number;
}

export interface ExploreTickResult {
  moved: boolean;
  inGrass: boolean;
  encounter: boolean;
  pos: Vec2;
}

export function createExploreState(opts?: Partial<ExploreState>): ExploreState {
  return {
    pos: opts?.pos ?? { x: 0, z: 2.5 },
    yaw: opts?.yaw ?? 0,
    speed: opts?.speed ?? 3.2,
    runMultiplier: opts?.runMultiplier ?? 1.65,
    bounds: opts?.bounds ?? { minX: -8, maxX: 8, minZ: -8, maxZ: 8 },
    grass: opts?.grass ?? {
      cx: 0,
      cz: -1.2,
      half: 2.6,
      encounterChance: 0.22,
    },
    keys: opts?.keys ?? new Set(),
    grassSteps: 0,
    encounterCooldown: opts?.encounterCooldown ?? 0,
  };
}

export function bindExploreKeys(
  keys: Set<string>,
  target: Window | Document = window,
): () => void {
  const down = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) {
      keys.add(k);
      // prevent page scroll on arrows
      if (k.startsWith("arrow")) e.preventDefault();
    }
  };
  const up = (e: KeyboardEvent) => {
    keys.delete(e.key.toLowerCase());
  };
  const blur = () => keys.clear();
  target.addEventListener("keydown", down as EventListener);
  target.addEventListener("keyup", up as EventListener);
  target.addEventListener("blur", blur);
  return () => {
    target.removeEventListener("keydown", down as EventListener);
    target.removeEventListener("keyup", up as EventListener);
    target.removeEventListener("blur", blur);
  };
}

export function isInGrass(pos: Vec2, grass: GrassZone): boolean {
  return (
    Math.abs(pos.x - grass.cx) <= grass.half &&
    Math.abs(pos.z - grass.cz) <= grass.half
  );
}

function clampPos(pos: Vec2, b: ExploreBounds): void {
  pos.x = Math.max(b.minX, Math.min(b.maxX, pos.x));
  pos.z = Math.max(b.minZ, Math.min(b.maxZ, pos.z));
}

/**
 * Advance explore by dt seconds.
 * `rng` returns [0,1) for encounter rolls when provided; else Math.random.
 */
export function tickExplore(
  state: ExploreState,
  dt: number,
  rng: () => number = Math.random,
): ExploreTickResult {
  if (state.encounterCooldown > 0) {
    state.encounterCooldown = Math.max(0, state.encounterCooldown - dt);
  }

  const k = state.keys;
  let ix = 0;
  let iz = 0;
  if (k.has("w") || k.has("arrowup")) iz -= 1;
  if (k.has("s") || k.has("arrowdown")) iz += 1;
  if (k.has("a") || k.has("arrowleft")) ix -= 1;
  if (k.has("d") || k.has("arrowright")) ix += 1;

  const len = Math.hypot(ix, iz);
  let moved = false;
  if (len > 0) {
    const run = k.has("shift");
    const spd = state.speed * (run ? state.runMultiplier : 1);
    const nx = ix / len;
    const nz = iz / len;
    state.pos.x += nx * spd * dt;
    state.pos.z += nz * spd * dt;
    clampPos(state.pos, state.bounds);
    state.yaw = Math.atan2(nx, nz);
    moved = true;
  }

  const inGrass = isInGrass(state.pos, state.grass);
  let encounter = false;

  if (moved && inGrass && state.encounterCooldown <= 0) {
    state.grassSteps += 1;
    // roll every ~0.35s of movement equivalent: check each tick while moving
    if (rng() < state.grass.encounterChance * Math.min(1, dt * 4)) {
      encounter = true;
      state.grassSteps = 0;
      state.encounterCooldown = 1.2;
    }
  } else if (!inGrass) {
    state.grassSteps = 0;
  }

  return {
    moved,
    inGrass,
    encounter,
    pos: { x: state.pos.x, z: state.pos.z },
  };
}

/** Heal pad: circular region in world XZ. */
export interface HealPad {
  cx: number;
  cz: number;
  radius: number;
}

export function createDefaultHealPad(): HealPad {
  return { cx: 4.5, cz: 4.5, radius: 1.4 };
}

export function isOnHealPad(pos: Vec2, pad: HealPad): boolean {
  const dx = pos.x - pad.cx;
  const dz = pos.z - pad.cz;
  return dx * dx + dz * dz <= pad.radius * pad.radius;
}
