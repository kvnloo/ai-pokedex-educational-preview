/**
 * Party of up to 6 + heal helpers.
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

/** Full restore HP for every member (heal center). */
export function healParty(party: PartyMember[]): void {
  for (const m of party) {
    m.battler.hp = m.battler.maxHp;
    m.battler.fainted = false;
  }
}

export function healBattler(b: Battler): void {
  b.hp = b.maxHp;
  b.fainted = false;
}

export function anyConscious(party: PartyMember[]): boolean {
  return party.some((m) => m.battler.hp > 0 && !m.battler.fainted);
}

export function lead(party: PartyMember[]): PartyMember | null {
  return party.find((m) => m.battler.hp > 0 && !m.battler.fainted) ?? party[0] ?? null;
}
