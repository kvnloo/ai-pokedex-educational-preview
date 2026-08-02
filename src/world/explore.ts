/**
 * Third-person WASD explore: accel/friction, run ramp, yaw blend, foot-plant, grass telegraph.
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
  /** Desired facing while input held (blended into yaw) */
  targetYaw: number;
  /** Horizontal velocity XZ */
  vel: Vec2;
  /** Instantaneous speed magnitude (units/s) */
  speedNow: number;
  /** Walk base speed */
  speed: number;
  runMultiplier: number;
  /** 0..1 run blend, ramps on Shift */
  runBlend: number;
  bounds: ExploreBounds;
  grass: GrassZone;
  /** Keys currently held */
  keys: Set<string>;
  /** Steps taken inside grass since last encounter check */
  grassSteps: number;
  /** Cooldown seconds before another encounter can fire */
  encounterCooldown: number;
  /** Distance accumulator for foot plants */
  gaitDist: number;
  /** Which foot last planted (0/1) */
  footPhase: number;
  /** Seconds since last grass rustle pulse */
  grassRustleT: number;
}

export interface ExploreTickResult {
  moved: boolean;
  inGrass: boolean;
  encounter: boolean;
  pos: Vec2;
  /** True once per foot plant this tick */
  footPlant: boolean;
  /** Grass rustle telegraph pulse this tick */
  grassRustle: boolean;
  speed: number;
}

const ACCEL = 28;
const FRICTION = 18;
const RUN_RAMP_UP = 3.2;
const RUN_RAMP_DOWN = 4.5;
const YAW_BLEND = 10;
/** World units between foot plants */
const STRIDE = 0.72;

function wrapPi(a: number): number {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

function lerpAngle(from: number, to: number, t: number): number {
  const d = wrapPi(to - from);
  return from + d * Math.min(1, Math.max(0, t));
}

export function createExploreState(opts?: Partial<ExploreState>): ExploreState {
  return {
    pos: opts?.pos ?? { x: 0, z: 2.5 },
    yaw: opts?.yaw ?? 0,
    targetYaw: opts?.targetYaw ?? opts?.yaw ?? 0,
    vel: opts?.vel ?? { x: 0, z: 0 },
    speedNow: opts?.speedNow ?? 0,
    speed: opts?.speed ?? 3.2,
    runMultiplier: opts?.runMultiplier ?? 1.65,
    runBlend: opts?.runBlend ?? 0,
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
    gaitDist: opts?.gaitDist ?? 0,
    footPhase: opts?.footPhase ?? 0,
    grassRustleT: opts?.grassRustleT ?? 0,
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

  const inputLen = Math.hypot(ix, iz);
  const wantRun = k.has("shift") && inputLen > 0;
  const runTarget = wantRun ? 1 : 0;
  const runRate = wantRun ? RUN_RAMP_UP : RUN_RAMP_DOWN;
  state.runBlend = Math.max(0, Math.min(1, state.runBlend + (runTarget - state.runBlend) * Math.min(1, runRate * dt)));

  const maxSpd = state.speed * (1 + (state.runMultiplier - 1) * state.runBlend);

  if (inputLen > 0) {
    const nx = ix / inputLen;
    const nz = iz / inputLen;
    state.targetYaw = Math.atan2(nx, nz);
    // Accel toward desired velocity
    const desiredVx = nx * maxSpd;
    const desiredVz = nz * maxSpd;
    state.vel.x += (desiredVx - state.vel.x) * Math.min(1, ACCEL * dt);
    state.vel.z += (desiredVz - state.vel.z) * Math.min(1, ACCEL * dt);
  } else {
    // Friction when no input
    const damp = Math.exp(-FRICTION * dt);
    state.vel.x *= damp;
    state.vel.z *= damp;
    if (Math.hypot(state.vel.x, state.vel.z) < 0.05) {
      state.vel.x = 0;
      state.vel.z = 0;
    }
  }

  // Cap speed
  const spd = Math.hypot(state.vel.x, state.vel.z);
  if (spd > maxSpd && spd > 1e-6) {
    const s = maxSpd / spd;
    state.vel.x *= s;
    state.vel.z *= s;
  }
  state.speedNow = Math.hypot(state.vel.x, state.vel.z);

  const prevX = state.pos.x;
  const prevZ = state.pos.z;
  state.pos.x += state.vel.x * dt;
  state.pos.z += state.vel.z * dt;
  clampPos(state.pos, state.bounds);
  // Kill velocity into bounds
  if (state.pos.x === state.bounds.minX || state.pos.x === state.bounds.maxX) state.vel.x = 0;
  if (state.pos.z === state.bounds.minZ || state.pos.z === state.bounds.maxZ) state.vel.z = 0;

  const movedDist = Math.hypot(state.pos.x - prevX, state.pos.z - prevZ);
  const moved = movedDist > 1e-4;

  // Soft yaw toward move heading when moving
  if (state.speedNow > 0.15) {
    state.yaw = lerpAngle(state.yaw, state.targetYaw, 1 - Math.exp(-YAW_BLEND * dt));
  }

  // Foot plant gait
  let footPlant = false;
  if (moved) {
    state.gaitDist += movedDist;
    if (state.gaitDist >= STRIDE) {
      state.gaitDist -= STRIDE;
      state.footPhase = 1 - state.footPhase;
      footPlant = true;
    }
  } else {
    state.gaitDist = 0;
  }

  const inGrass = isInGrass(state.pos, state.grass);
  let encounter = false;
  let grassRustle = false;

  if (inGrass && moved) {
    state.grassRustleT += dt;
    // Rustle telegraph every ~0.28s while moving in grass
    if (state.grassRustleT >= 0.28) {
      state.grassRustleT = 0;
      grassRustle = true;
    }
  } else if (!inGrass) {
    state.grassRustleT = 0;
  }

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
    footPlant,
    grassRustle,
    speed: state.speedNow,
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
