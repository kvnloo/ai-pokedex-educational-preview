/**
 * Wave-0 catch formula — pure TS, deterministic with seed.
 * Shake count presentation matches outcome seed.
 *
 * Simplified Gen-style:
 *   a = ((3*maxHp - 2*hp) * catchRate * ballMod) / (3*maxHp)
 *   if a >= 255 → catch, 3 shakes
 *   else b = floor(65536 / (255/a)^0.1875)  [approx]
 *   shake succeeds if nextU16 < b
 */

export interface CatchInput {
  maxHp: number;
  hp: number;
  /** Species catch rate 1–255 (higher = easier) */
  catchRate: number;
  /** Ball multiplier (e.g. 1 = standard, 1.5 = great) */
  ballMod?: number;
  /** Optional fixed [0,1) rolls for shakes (up to 4). If shorter, rest use rng. */
  rolls?: number[];
  /** Mulberry32 seed when rolls not provided */
  seed?: number;
}

export interface CatchResult {
  caught: boolean;
  shakes: number;
  /** 0–3 display shakes before success/fail; 3 + caught means full catch */
  aValue: number;
  messages: string[];
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function computeA(input: CatchInput): number {
  const maxHp = Math.max(1, input.maxHp);
  const hp = Math.max(0, Math.min(maxHp, input.hp));
  const rate = Math.max(1, Math.min(255, input.catchRate));
  const ball = input.ballMod ?? 1;
  const a = Math.floor(((3 * maxHp - 2 * hp) * rate * ball) / (3 * maxHp));
  return Math.max(0, Math.min(255, a));
}

/** Threshold for a single shake given a-value (0–255). Returns 0–1 probability mass. */
export function shakeThreshold(a: number): number {
  if (a >= 255) return 1;
  if (a <= 0) return 0;
  // b/65536 ≈ chance one shake holds
  const inv = 255 / a;
  const b = Math.floor(65536 / Math.pow(inv, 0.1875));
  return Math.min(1, Math.max(0, b / 65536));
}

/**
 * Resolve catch attempt. Up to 3 shakes; fail stops early.
 */
export function attemptCatch(input: CatchInput): CatchResult {
  const a = computeA(input);
  const messages: string[] = ["You threw a Catch Sphere!"];
  const rng = mulberry32(input.seed ?? 1);
  let rollIdx = 0;
  const nextRoll = (): number => {
    if (input.rolls && rollIdx < input.rolls.length) {
      return input.rolls[rollIdx++];
    }
    return rng();
  };

  if (a >= 255) {
    messages.push("… … … Gotcha!");
    return { caught: true, shakes: 3, aValue: a, messages };
  }

  const p = shakeThreshold(a);
  let shakes = 0;
  for (let i = 0; i < 3; i++) {
    const r = nextRoll();
    if (r < p) {
      shakes += 1;
      messages.push(i === 0 ? "…shake…" : i === 1 ? "…shake shake…" : "…shake shake shake…");
    } else {
      messages.push("Oh no! It broke free!");
      return { caught: false, shakes, aValue: a, messages };
    }
  }

  messages.push("Gotcha!");
  return { caught: true, shakes: 3, aValue: a, messages };
}

/** Default catch rates by role for wave0 species lacking explicit rate. */
export function defaultCatchRate(role?: string): number {
  if (role === "starter") return 45;
  if (role === "wild") return 190;
  return 120;
}

/**
 * Resolve catch rate from species fields, then role default.
 * Prefer explicit per-species catchRate over role stubs.
 */
export function speciesCatchRate(species: {
  catchRate?: number;
  role?: string;
}): number {
  if (typeof species.catchRate === "number" && Number.isFinite(species.catchRate)) {
    return Math.max(1, Math.min(255, Math.floor(species.catchRate)));
  }
  return defaultCatchRate(species.role);
}
