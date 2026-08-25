/**
 * Third-person WASD explore: accel/friction, run ramp, yaw blend, foot-plant, grass telegraph.
 * Collision-aware bounds vs landmarks (heal pad, house, stones).
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

/** Axis-aligned solid for player collision (house, heal pad cylinder as box, gym post). */
export interface Obstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  /** Optional id for interact prompts */
  id?: string;
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
  /** Solid landmarks — player cannot walk through */
  obstacles: Obstacle[];
  /** Keys currently held */
  keys: Set<string>;
  /** Analog movement from touch/controller; merged with keyboard every frame. */
  analog: { x: number; z: number; interact: boolean };
  /** Steps taken inside grass since last encounter check */
  grassSteps: number;
  /** Traversed grass distance since the last encounter/grass exit. */
  grassDroughtMeters: number;
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
  /** Obstacle id under interact radius if any */
  nearInteract?: string;
}

const ACCEL = 28;
const FRICTION = 18;
const RUN_RAMP_UP = 3.2;
const RUN_RAMP_DOWN = 4.5;
const YAW_BLEND = 10;
/** World units between foot plants */
const STRIDE = 0.72;
/** Player collision radius against AABB obstacles */
const PLAYER_RADIUS = 0.28;

const PHYSICAL_KEY_MAP: Record<string, string> = {
  KeyW: 'w',
  KeyA: 'a',
  KeyS: 's',
  KeyD: 'd',
  ArrowUp: 'arrowup',
  ArrowDown: 'arrowdown',
  ArrowLeft: 'arrowleft',
  ArrowRight: 'arrowright',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  KeyE: 'e',
};

const EXPLORE_KEYS = new Set([
  'w',
  'a',
  's',
  'd',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'shift',
  'e',
]);

/**
 * Resolve both physical key codes and layout-aware key values.
 * Physical WASD keeps controls reliable when browsers report an unidentified or
 * non-Latin layout key, while arrows and Shift still use their semantic names.
 */
export function normalizeExploreKey(event: { key?: string; code?: string }): string | null {
  const physical = event.code ? PHYSICAL_KEY_MAP[event.code] : undefined;
  if (physical) return physical;
  const semantic = event.key?.toLowerCase();
  return semantic && EXPLORE_KEYS.has(semantic) ? semantic : null;
}

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

/** Default Lumen Hollow solids. The healing pool is intentionally traversable. */
export function createDefaultObstacles(): Obstacle[] {
  return [
    // Stone house (marker at 5.2, 5.6)
    { id: 'house', minX: 4.7, maxX: 5.75, minZ: 5.2, maxZ: 6.05 },
    // Gym lantern post west of path
    { id: 'gym', minX: -6.35, maxX: -5.15, minZ: 2.55, maxZ: 3.75 },
    // Elite gate post further north-west
    { id: 'elite', minX: -6.85, maxX: -5.65, minZ: -0.35, maxZ: 0.85 },
  ];
}

export function createExploreState(opts?: Partial<ExploreState>): ExploreState {
  return {
    pos: opts?.pos ?? { x: 0, z: 2.5 },
    // The authored route begins northward (negative Z); face the destination on
    // the first playable frame instead of showing the settlement behind camera.
    yaw: opts?.yaw ?? Math.PI,
    targetYaw: opts?.targetYaw ?? opts?.yaw ?? Math.PI,
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
    obstacles: opts?.obstacles ?? createDefaultObstacles(),
    keys: opts?.keys ?? new Set(),
    analog: opts?.analog ?? { x: 0, z: 0, interact: false },
    grassSteps: 0,
    grassDroughtMeters: 0,
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
    const k = normalizeExploreKey(e);
    if (k) {
      keys.add(k);
      // Keep the browser from scrolling or stealing focus while the game owns movement.
      if (k.startsWith('arrow') || k === 'w' || k === 'a' || k === 's' || k === 'd') {
        e.preventDefault();
      }
    }
  };
  const up = (e: KeyboardEvent) => {
    const k = normalizeExploreKey(e);
    if (k) keys.delete(k);
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

/** Path corridor half-width — must match visual blade reject in main. */
export const GRASS_PATH_HALF = 0.95;

export function isInGrass(pos: Vec2, grass: GrassZone): boolean {
  // Risk co-locates with tall-grass blades: AABB band minus dirt path corridor
  const inBox =
    Math.abs(pos.x - grass.cx) <= grass.half &&
    Math.abs(pos.z - grass.cz) <= grass.half;
  if (!inBox) return false;
  // Clear path strip through the patch (same |x|<0.95 carve as blade placement)
  if (Math.abs(pos.x - grass.cx) < GRASS_PATH_HALF) return false;
  return true;
}

function clampPos(pos: Vec2, b: ExploreBounds): void {
  pos.x = Math.max(b.minX, Math.min(b.maxX, pos.x));
  pos.z = Math.max(b.minZ, Math.min(b.maxZ, pos.z));
}

function expandObstacle(o: Obstacle, r: number): Obstacle {
  return {
    minX: o.minX - r,
    maxX: o.maxX + r,
    minZ: o.minZ - r,
    maxZ: o.maxZ + r,
    id: o.id,
  };
}

function pointInObstacle(x: number, z: number, o: Obstacle): boolean {
  return x >= o.minX && x <= o.maxX && z >= o.minZ && z <= o.maxZ;
}

/**
 * Resolve player position against obstacles with axis-separated slide.
 * Mutates pos; returns true if a collision was resolved.
 */
export function resolveCollisions(
  pos: Vec2,
  prev: Vec2,
  obstacles: Obstacle[],
  radius = PLAYER_RADIUS,
): boolean {
  let hit = false;
  for (const raw of obstacles) {
    const o = expandObstacle(raw, radius);
    if (!pointInObstacle(pos.x, pos.z, o)) continue;
    hit = true;
    // Prefer sliding on the axis with smallest penetration from previous free pos
    const tryX = { x: prev.x, z: pos.z };
    const tryZ = { x: pos.x, z: prev.z };
    const xFree = !pointInObstacle(tryX.x, tryX.z, o);
    const zFree = !pointInObstacle(tryZ.x, tryZ.z, o);
    if (xFree && !zFree) {
      pos.x = prev.x;
    } else if (zFree && !xFree) {
      pos.z = prev.z;
    } else if (xFree && zFree) {
      // Both axes free alone — pick smaller delta
      if (Math.abs(pos.x - prev.x) < Math.abs(pos.z - prev.z)) pos.x = prev.x;
      else pos.z = prev.z;
    } else {
      // Corner: push out along nearest face
      const dl = pos.x - o.minX;
      const dr = o.maxX - pos.x;
      const db = pos.z - o.minZ;
      const dt = o.maxZ - pos.z;
      const m = Math.min(dl, dr, db, dt);
      if (m === dl) pos.x = o.minX - 1e-4;
      else if (m === dr) pos.x = o.maxX + 1e-4;
      else if (m === db) pos.z = o.minZ - 1e-4;
      else pos.z = o.maxZ + 1e-4;
    }
  }
  return hit;
}

/** Soft camera pull-in: shorten desired distance if ray from look→cam hits an obstacle. */
export function cameraCollisionDist(
  lookX: number,
  lookZ: number,
  yaw: number,
  desiredDist: number,
  obstacles: Obstacle[],
  minDist = 1.6,
): number {
  // Sample along back vector from look toward camera ideal
  const steps = 10;
  let dist = desiredDist;
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * desiredDist;
    const x = lookX - Math.sin(yaw) * t;
    const z = lookZ - Math.cos(yaw) * t;
    for (const o of obstacles) {
      // Inflate slightly so camera sits outside solids
      const exp = expandObstacle(o, 0.35);
      if (pointInObstacle(x, z, exp)) {
        dist = Math.max(minDist, t - desiredDist / steps);
        return dist;
      }
    }
  }
  return dist;
}

/** Nearest obstacle id within interact radius (for gym/elite). */
export function nearestInteract(
  pos: Vec2,
  obstacles: Obstacle[],
  radius = 1.55,
): string | undefined {
  let best: string | undefined;
  let bestD = radius * radius;
  for (const o of obstacles) {
    if (!o.id || (o.id !== 'gym' && o.id !== 'elite')) continue;
    const cx = (o.minX + o.maxX) * 0.5;
    const cz = (o.minZ + o.maxZ) * 0.5;
    const d = (pos.x - cx) ** 2 + (pos.z - cz) ** 2;
    if (d <= bestD) {
      bestD = d;
      best = o.id;
    }
  }
  return best;
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
  let ix = state.analog.x;
  let iz = state.analog.z;
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
  // Landmark collision (heal pad / house / gym)
  const collided = resolveCollisions(
    state.pos,
    { x: prevX, z: prevZ },
    state.obstacles,
  );
  // Kill velocity into bounds / solids
  if (state.pos.x === state.bounds.minX || state.pos.x === state.bounds.maxX) state.vel.x = 0;
  if (state.pos.z === state.bounds.minZ || state.pos.z === state.bounds.maxZ) state.vel.z = 0;
  if (collided) {
    if (Math.abs(state.pos.x - prevX) < 1e-6) state.vel.x = 0;
    if (Math.abs(state.pos.z - prevZ) < 1e-6) state.vel.z = 0;
  }

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
    state.grassDroughtMeters += movedDist;
    // Telegraph: need several steps + rustle pulses before first roll, then ramp chance
    const MIN_STEPS = 4;
    const MAX_DROUGHT_METERS = 24;
    if (state.grassSteps >= MIN_STEPS) {
      const ramp = Math.min(1.35, 0.45 + (state.grassSteps - MIN_STEPS) * 0.12);
      const p = state.grass.encounterChance * ramp * Math.min(1, dt * 4);
      // A bounded pity path prevents unlucky real play (and replay after heal)
      // from wandering indefinitely without mutating or scripting an encounter.
      if (state.grassDroughtMeters >= MAX_DROUGHT_METERS || rng() < p) {
        encounter = true;
        state.grassSteps = 0;
        state.grassDroughtMeters = 0;
        state.encounterCooldown = 1.35;
      }
    }
  } else if (!inGrass) {
    state.grassSteps = 0;
    state.grassDroughtMeters = 0;
  }

  const nearInteract = nearestInteract(state.pos, state.obstacles);

  return {
    moved,
    inGrass,
    encounter,
    pos: { x: state.pos.x, z: state.pos.z },
    footPlant,
    grassRustle,
    speed: state.speedNow,
    nearInteract,
  };
}

/** Heal pad: circular region in world XZ — stand ON pad after path ring (outside solid). */
export interface HealPad {
  cx: number;
  cz: number;
  radius: number;
}

export function createDefaultHealPad(): HealPad {
  // Slightly larger than solid so ring-edge heals without walking through center
  return { cx: 4.5, cz: 4.5, radius: 1.55 };
}

export function isOnHealPad(pos: Vec2, pad: HealPad): boolean {
  const dx = pos.x - pad.cx;
  const dz = pos.z - pad.cz;
  return dx * dx + dz * dz <= pad.radius * pad.radius;
}
