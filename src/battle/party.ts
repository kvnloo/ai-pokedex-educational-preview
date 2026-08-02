/**
 * Party of up to 6 + heal helpers + battle HP sync.
 */

import type { Battler } from "./types.ts";

export const PARTY_MAX = 6;

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
      b.movePp[i] = b.moves[i].pp;
    }
  }
}

export function anyConscious(party: PartyMember[]): boolean {
  return party.some((m) => m.battler.hp > 0 && !m.battler.fainted);
}

export function lead(party: PartyMember[]): PartyMember | null {
  return party.find((m) => m.battler.hp > 0 && !m.battler.fainted) ?? party[0] ?? null;
}

export function leadIndex(party: PartyMember[]): number {
  const idx = party.findIndex((m) => m.battler.hp > 0 && !m.battler.fainted);
  return idx >= 0 ? idx : 0;
}

/**
 * Copy HP / fainted from battle battler back onto the party slot it came from.
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
}

/**
 * Build battle participant from an existing party member (preserves HP).
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
  };
}
