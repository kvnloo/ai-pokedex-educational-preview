/**
 * Classic gen-ish damage (no items/weather/abilities/screens).
 *
 * damage = floor( floor( floor(2L/5+2) * A/D * Power/50 ) + 2 )
 *          * STAB * type * critical * random(0.85–1.0)
 *
 * Golden tests fix random = 1.0 and critical = 1.
 */

import type { DamageInput, DamageResult, TypeChart } from "./types.ts";

/** Classic damage random band lower bound (inclusive via floor path). */
export const DAMAGE_RANDOM_MIN = 0.85;
/** Classic damage random band upper bound. */
export const DAMAGE_RANDOM_MAX = 1.0;

/**
 * Map a unit roll [0,1) into classic 0.85–1.0 damage band.
 * Gen uses discrete 85–100 / 100; we use continuous equivalent.
 */
export function rollDamageRandom(unitRoll: number): number {
  const u = Math.min(1, Math.max(0, unitRoll));
  return DAMAGE_RANDOM_MIN + u * (DAMAGE_RANDOM_MAX - DAMAGE_RANDOM_MIN);
}

/** Clamp an explicit random into the legal band. */
export function clampDamageRandom(r: number): number {
  return Math.min(DAMAGE_RANDOM_MAX, Math.max(DAMAGE_RANDOM_MIN, r));
}

/**
 * Missing attacker-type row or defender-type cell is a content defect (not silent 1×).
 */
export function typeEffectiveness(
  moveType: string,
  defenderTypes: readonly string[],
  chart: TypeChart,
): number {
  const row = chart[moveType];
  if (!row) {
    throw new Error(`typeChart missing attacker row: ${moveType}`);
  }
  let mult = 1;
  for (const t of defenderTypes) {
    const m = row[t];
    if (m === undefined) {
      throw new Error(`typeChart missing cell: ${moveType} → ${t}`);
    }
    mult *= m;
  }
  return mult;
}

/** Validate every attack type has a full row against every listed type. */
export function assertTypeChartComplete(
  chart: TypeChart,
  types: readonly string[],
): void {
  for (const atk of types) {
    const row = chart[atk];
    if (!row) throw new Error(`typeChart missing attacker row: ${atk}`);
    for (const def of types) {
      if (row[def] === undefined) {
        throw new Error(`typeChart missing cell: ${atk} → ${def}`);
      }
    }
  }
}

export function stabMultiplier(
  moveType: string,
  attackerTypes: readonly string[],
): number {
  for (let i = 0; i < attackerTypes.length; i++) {
    if (attackerTypes[i] === moveType) return 1.5;
  }
  return 1;
}

/**
 * Core damage calculation. All stage floors match classic integer truncation.
 * If power <= 0 or typeEffectiveness === 0, returns 0 damage.
 */
export function calcDamage(input: DamageInput): DamageResult {
  const critical = input.critical ?? 1;
  const {
    level,
    attack,
    defense,
    power,
    stab,
    typeEffectiveness: typeEff,
    random,
  } = input;

  if (power <= 0 || typeEff === 0 || attack <= 0 || defense <= 0 || level <= 0) {
    return {
      damage: 0,
      base: 0,
      stab,
      typeEffectiveness: typeEff,
      random,
      critical,
    };
  }

  // floor(2*L/5 + 2)
  const step1 = Math.floor((2 * level) / 5 + 2);
  // floor(step1 * A/D * Power/50)
  const step2 = Math.floor(((step1 * attack) / defense) * power / 50);
  // floor(step2) + 2  (step2 already floored)
  const base = step2 + 2;

  // Multipliers applied after base; final floor once at the end (common simplification)
  const raw = base * stab * typeEff * critical * random;
  const damage = Math.max(0, Math.floor(raw));

  return {
    damage,
    base,
    stab,
    typeEffectiveness: typeEff,
    random,
    critical,
  };
}

/** Convenience: pick A/D from category and compute full damage. */
export function calcMoveDamage(opts: {
  level: number;
  attackStat: number;
  defenseStat: number;
  power: number;
  moveType: string;
  attackerTypes: readonly string[];
  defenderTypes: readonly string[];
  typeChart: TypeChart;
  random?: number;
  critical?: number;
}): DamageResult {
  const stab = stabMultiplier(opts.moveType, opts.attackerTypes);
  const eff = typeEffectiveness(
    opts.moveType,
    opts.defenderTypes,
    opts.typeChart,
  );
  return calcDamage({
    level: opts.level,
    attack: opts.attackStat,
    defense: opts.defenseStat,
    power: opts.power,
    stab,
    typeEffectiveness: eff,
    random: opts.random ?? 1,
    critical: opts.critical ?? 1,
  });
}
