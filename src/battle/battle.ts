/**
 * Pure turn-based battle loop for Wave 0 — no DOM/three.
 */

import {
  calcDamage,
  stabMultiplier,
  typeEffectiveness,
} from "./damage.ts";
import type {
  BattleEvent,
  BattleSide,
  BattleState,
  Battler,
  MoveDef,
  TypeChart,
} from "./types.ts";

export interface CreateBattleOpts {
  player: Battler;
  foe: Battler;
  typeChart: TypeChart;
}

export function createBattle(opts: CreateBattleOpts): BattleState {
  const state: BattleState = {
    player: cloneBattler(opts.player),
    foe: cloneBattler(opts.foe),
    turn: 0,
    over: false,
    log: [],
    typeChart: opts.typeChart,
  };
  push(state, {
    type: "battle-start",
    message: `${state.player.name} vs ${state.foe.name}`,
  });
  return state;
}

function cloneBattler(b: Battler): Battler {
  return {
    ...b,
    stats: { ...b.stats },
    moves: b.moves.slice(),
    types: b.types.slice(),
  };
}

function push(state: BattleState, e: BattleEvent): void {
  state.log.push(e);
}

function other(side: BattleSide): BattleSide {
  return side === "player" ? "foe" : "player";
}

function battler(state: BattleState, side: BattleSide): Battler {
  return side === "player" ? state.player : state.foe;
}

/**
 * Simple in-battle stat from species base + level (gen-ish).
 * HP: floor((2*base*L)/100) + L + 10
 * Other: floor((2*base*L)/100) + 5
 */
export function statAtLevel(
  base: number,
  level: number,
  kind: "hp" | "other",
): number {
  if (kind === "hp") {
    return Math.floor((2 * base * level) / 100) + level + 10;
  }
  return Math.floor((2 * base * level) / 100) + 5;
}

export function buildBattler(opts: {
  id: string;
  name: string;
  speciesId: string;
  types: string[];
  level: number;
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  moves: MoveDef[];
}): Battler {
  const { baseStats: b, level } = opts;
  const stats = {
    hp: statAtLevel(b.hp, level, "hp"),
    atk: statAtLevel(b.atk, level, "other"),
    def: statAtLevel(b.def, level, "other"),
    spa: statAtLevel(b.spa, level, "other"),
    spd: statAtLevel(b.spd, level, "other"),
    spe: statAtLevel(b.spe, level, "other"),
  };
  return {
    id: opts.id,
    name: opts.name,
    speciesId: opts.speciesId,
    types: opts.types.slice(),
    level,
    hp: stats.hp,
    maxHp: stats.hp,
    stats,
    moves: opts.moves,
    fainted: false,
  };
}

function orderSides(
  state: BattleState,
  playerMove: MoveDef,
  foeMove: MoveDef,
): BattleSide[] {
  const pp = playerMove.priority;
  const fp = foeMove.priority;
  if (pp > fp) return ["player", "foe"];
  if (fp > pp) return ["foe", "player"];
  const ps = state.player.stats.spe;
  const fs = state.foe.stats.spe;
  if (ps > fs) return ["player", "foe"];
  if (fs > ps) return ["foe", "player"];
  return ["player", "foe"];
}

export interface TurnChoices {
  playerMoveIndex: number;
  foeMoveIndex: number;
  /** Fixed random for damage; default 1.0 for determinism */
  random?: number;
}

/**
 * Execute one full turn (both sides act unless faint interrupts).
 */
export function executeTurn(state: BattleState, choices: TurnChoices): BattleState {
  if (state.over) return state;

  state.turn += 1;
  const random = choices.random ?? 1;

  const playerMove = state.player.moves[choices.playerMoveIndex];
  const foeMove = state.foe.moves[choices.foeMoveIndex];
  if (!playerMove || !foeMove) {
    throw new Error("Invalid move index");
  }

  const sequence = orderSides(state, playerMove, foeMove);

  for (const side of sequence) {
    if (state.over) break;
    const actor = battler(state, side);
    if (actor.fainted || actor.hp <= 0) continue;

    const move = side === "player" ? playerMove : foeMove;
    const targetSide = other(side);
    const target = battler(state, targetSide);

    push(state, {
      type: "move",
      side,
      moveId: move.id,
      message: `${actor.name} used ${move.name}!`,
    });

    if (move.category === "status" || move.power == null || move.power <= 0) {
      push(state, {
        type: "message",
        side,
        message: `${move.name} had no damaging effect (wave0).`,
      });
      continue;
    }

    const atk =
      move.category === "physical" ? actor.stats.atk : actor.stats.spa;
    const def =
      move.category === "physical" ? target.stats.def : target.stats.spd;
    const stab = stabMultiplier(move.type, actor.types);
    const eff = typeEffectiveness(move.type, target.types, state.typeChart);

    const result = calcDamage({
      level: actor.level,
      attack: atk,
      defense: def,
      power: move.power,
      stab,
      typeEffectiveness: eff,
      random,
      critical: 1,
    });

    const dealt = Math.min(result.damage, Math.max(0, target.hp));
    target.hp = Math.max(0, target.hp - dealt);

    push(state, {
      type: "damage",
      side: targetSide,
      damage: dealt,
      effectiveness: eff,
      moveId: move.id,
      message: damageMessage(actor.name, target.name, dealt, eff),
    });

    if (target.hp <= 0) {
      target.fainted = true;
      push(state, {
        type: "faint",
        side: targetSide,
        message: `${target.name} fainted!`,
      });
      state.over = true;
      state.winner = side;
      push(state, {
        type: "battle-end",
        winner: side,
        message: side === "player" ? "You win!" : "You lose!",
      });
    }
  }

  return state;
}

function damageMessage(
  actor: string,
  target: string,
  dmg: number,
  eff: number,
): string {
  let extra = "";
  if (eff === 0) extra = " It had no effect!";
  else if (eff > 1) extra = " It's super effective!";
  else if (eff < 1) extra = " It's not very effective...";
  return `${actor} hit ${target} for ${dmg}.${extra}`;
}

/** AI: pick first damaging move, else move 0. */
export function pickFirstDamagingMove(b: Battler): number {
  for (let i = 0; i < b.moves.length; i++) {
    const m = b.moves[i];
    if (m.category !== "status" && m.power != null && m.power > 0) return i;
  }
  return 0;
}
