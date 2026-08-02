/**
 * Party of up to 6 + heal helpers + battle HP sync + XP.
 */

import type { Battler } from "./types.ts";

export const PARTY_MAX = 6;

/** Classic-ish XP curve step: points needed from level L → L+1. */
export function xpToNextLevel(level: number): number {
  const L = Math.max(1, level | 0);
  return Math.max(20, L * 20);
}

/**
 * Base XP award for defeating a foe.
 * yield = floor(baseExp * foeLevel / 7) with baseExp default 50.
 */
export function xpYield(foeLevel: number, baseExp = 50): number {
  return Math.max(1, Math.floor((baseExp * Math.max(1, foeLevel)) / 7));
}

function statAtLevelLocal(
  base: number,
  level: number,
  kind: "hp" | "other",
): number {
  if (kind === "hp") {
    return Math.floor((2 * base * level) / 100) + level + 10;
  }
  return Math.floor((2 * base * level) / 100) + 5;
}

export interface PartyMember {
  battler: Battler;
  /** Optional nickname */
  nickname?: string;
}

export function createParty(members: PartyMember[] = []): PartyMember[] {
  return members.slice(0, PARTY_MAX);
}

export function partyCanAdd(party: PartyMember[]): boolean {
  return party.length < PARTY_MAX;
}

export function addToParty(party: PartyMember[], member: PartyMember): boolean {
  if (!partyCanAdd(party)) return false;
  party.push(member);
  return true;
}

/** Full restore HP for every member (heal center). Also clears stages. */
export function healParty(party: PartyMember[]): void {
  for (const m of party) {
    healBattler(m.battler);
  }
}

export function healBattler(b: Battler): void {
  b.hp = b.maxHp;
  b.fainted = false;
  if (b.stages) {
    b.stages.atk = 0;
    b.stages.def = 0;
    b.stages.spa = 0;
    b.stages.spd = 0;
    b.stages.spe = 0;
  }
  if (b.movePp && b.moves) {
    for (let i = 0; i < b.moves.length; i++) {
      b.movePp[i] = b.moves[i]!.pp;
    }
  }
}

export function anyConscious(party: PartyMember[]): boolean {
  return party.some((m) => m.battler.hp > 0 && !m.battler.fainted);
}

/** Indices of conscious (non-fainted, hp>0) members. */
export function consciousIndices(party: PartyMember[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < party.length; i++) {
    const b = party[i]?.battler;
    if (b && b.hp > 0 && !b.fainted) out.push(i);
  }
  return out;
}

export function lead(party: PartyMember[]): PartyMember | null {
  return party.find((m) => m.battler.hp > 0 && !m.battler.fainted) ?? party[0] ?? null;
}

export function leadIndex(party: PartyMember[]): number {
  const idx = party.findIndex((m) => m.battler.hp > 0 && !m.battler.fainted);
  return idx >= 0 ? idx : 0;
}

/**
 * Copy HP / fainted / xp / level from battle battler back onto the party slot.
 * Uses matching id first, else partyIndex, else slot 0.
 */
export function syncBattlerToParty(
  party: PartyMember[],
  battleBattler: Battler,
  partyIndex?: number,
): void {
  let member: PartyMember | undefined;
  if (partyIndex != null && party[partyIndex]) {
    member = party[partyIndex];
  } else {
    member = party.find((m) => m.battler.id === battleBattler.id);
  }
  if (!member) member = party[0];
  if (!member) return;
  member.battler.hp = battleBattler.hp;
  member.battler.fainted = !!battleBattler.fainted || battleBattler.hp <= 0;
  if (battleBattler.movePp) {
    member.battler.movePp = battleBattler.movePp.slice();
  }
  if (battleBattler.xp != null) member.battler.xp = battleBattler.xp;
  if (battleBattler.xpToNext != null) member.battler.xpToNext = battleBattler.xpToNext;
  if (battleBattler.level != null) member.battler.level = battleBattler.level;
  if (battleBattler.maxHp != null) member.battler.maxHp = battleBattler.maxHp;
  if (battleBattler.stats) member.battler.stats = { ...battleBattler.stats };
  if (battleBattler.baseStats) member.battler.baseStats = { ...battleBattler.baseStats };
}

/**
 * Build battle participant from an existing party member (preserves HP/XP).
 * Does not full-heal — clones current state for the fight.
 */
export function battlerFromPartyMember(member: PartyMember): Battler {
  const b = member.battler;
  return {
    ...b,
    stats: { ...b.stats },
    moves: b.moves.slice(),
    types: b.types.slice(),
    movePp: b.movePp ? b.movePp.slice() : b.moves.map((m) => m.pp),
    stages: b.stages
      ? { ...b.stages }
      : { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    hp: b.hp,
    maxHp: b.maxHp,
    fainted: b.fainted,
    xp: b.xp ?? 0,
    xpToNext: b.xpToNext ?? xpToNextLevel(b.level),
    baseStats: b.baseStats ? { ...b.baseStats } : undefined,
  };
}

export interface GrantXpResult {
  xpGained: number;
  levelsGained: number;
  newLevel: number;
  leveledUp: boolean;
  messages: string[];
}

/**
 * Apply XP to a battler; level-up recalculates stats from baseStats when present.
 * HP gains on level-up keep current damage (delta maxHp added to hp).
 */
export function applyXp(b: Battler, amount: number): GrantXpResult {
  const messages: string[] = [];
  const xpGained = Math.max(0, Math.floor(amount));
  let levelsGained = 0;
  b.xp = (b.xp ?? 0) + xpGained;
  b.xpToNext = b.xpToNext ?? xpToNextLevel(b.level);
  messages.push(`${b.name} gained ${xpGained} XP!`);

  while (b.xp >= b.xpToNext && b.level < 100) {
    b.xp -= b.xpToNext;
    b.level += 1;
    levelsGained += 1;
    b.xpToNext = xpToNextLevel(b.level);
    if (b.baseStats) {
      const oldMax = b.maxHp;
      const bs = b.baseStats;
      b.stats = {
        hp: statAtLevelLocal(bs.hp, b.level, "hp"),
        atk: statAtLevelLocal(bs.atk, b.level, "other"),
        def: statAtLevelLocal(bs.def, b.level, "other"),
        spa: statAtLevelLocal(bs.spa, b.level, "other"),
        spd: statAtLevelLocal(bs.spd, b.level, "other"),
        spe: statAtLevelLocal(bs.spe, b.level, "other"),
      };
      b.maxHp = b.stats.hp;
      const delta = b.maxHp - oldMax;
      if (delta > 0 && !b.fainted) {
        b.hp = Math.min(b.maxHp, b.hp + delta);
      }
    }
    messages.push(`${b.name} grew to level ${b.level}!`);
  }

  return {
    xpGained,
    levelsGained,
    newLevel: b.level,
    leveledUp: levelsGained > 0,
    messages,
  };
}
