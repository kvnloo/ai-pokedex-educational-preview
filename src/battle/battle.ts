/**
 * Pure turn-based battle loop for Wave 0 — no DOM/three.
 */

import {
  calcDamage,
  clampDamageRandom,
  rollDamageRandom,
  stabMultiplier,
  typeEffectiveness,
} from "./damage.ts";
import {
  anyConscious,
  applyXp,
  battlerFromPartyMember,
  consciousIndices,
  leadIndex,
  syncBattlerToParty,
  xpYield,
  type PartyMember,
} from "./party.ts";
import type {
  BattleEvent,
  BattleSide,
  BattleState,
  Battler,
  MoveDef,
  StatStageKey,
  StatStages,
  TypeChart,
} from "./types.ts";

export interface CreateBattleOpts {
  player: Battler;
  foe: Battler;
  typeChart: TypeChart;
  playerPartyIndex?: number;
}

export function createBattle(opts: CreateBattleOpts): BattleState {
  const state: BattleState = {
    player: cloneBattler(opts.player),
    foe: cloneBattler(opts.foe),
    turn: 0,
    over: false,
    log: [],
    typeChart: opts.typeChart,
    playerPartyIndex: opts.playerPartyIndex,
    needsForceSwitch: false,
  };
  push(state, {
    type: "battle-start",
    message: `${state.player.name} vs ${state.foe.name}`,
  });
  return state;
}

/**
 * Start a battle from the party lead (preserves current HP — no full rebuild).
 */
export function createBattleFromParty(
  party: PartyMember[],
  foe: Battler,
  typeChart: TypeChart,
): BattleState {
  const idx = leadIndex(party);
  const member = party[idx];
  if (!member) throw new Error("empty party");
  const player = battlerFromPartyMember(member);
  return createBattle({
    player,
    foe: cloneBattler(foe),
    typeChart,
    playerPartyIndex: idx,
  });
}

/** Write active player HP/faint/xp back to party after battle (or mid-fight). */
export function syncBattlePlayerToParty(
  state: BattleState,
  party: PartyMember[],
): void {
  syncBattlerToParty(party, state.player, state.playerPartyIndex);
}

function cloneBattler(b: Battler): Battler {
  return {
    ...b,
    stats: { ...b.stats },
    moves: b.moves.slice(),
    types: b.types.slice(),
    movePp: b.movePp
      ? b.movePp.slice()
      : b.moves.map((m) => m.pp),
    stages: b.stages
      ? { ...b.stages }
      : { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    baseStats: b.baseStats ? { ...b.baseStats } : undefined,
  };
}

function ensureStages(b: Battler): StatStages {
  if (!b.stages) {
    b.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  }
  return b.stages;
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

/** Classic stage multiplier: 2/2 at 0, +n → (2+n)/2, −n → 2/(2+n). */
export function stageMultiplier(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage | 0));
  if (s >= 0) return (2 + s) / 2;
  return 2 / (2 - s);
}

export function effectiveStat(
  b: Battler,
  key: "atk" | "def" | "spa" | "spd" | "spe",
): number {
  const base = b.stats[key];
  const stages = ensureStages(b);
  return Math.max(1, Math.floor(base * stageMultiplier(stages[key])));
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
  /** Optional current HP (defaults to max). */
  hp?: number;
  xp?: number;
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
  const maxHp = stats.hp;
  const hp = opts.hp != null ? Math.max(0, Math.min(maxHp, opts.hp)) : maxHp;
  return {
    id: opts.id,
    name: opts.name,
    speciesId: opts.speciesId,
    types: opts.types.slice(),
    level,
    hp,
    maxHp,
    stats,
    moves: opts.moves,
    fainted: hp <= 0,
    movePp: opts.moves.map((m) => m.pp),
    stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    xp: opts.xp ?? 0,
    xpToNext: level * 20,
    baseStats: { ...b },
  };
}

/**
 * Crit: gen-style base ~1/16 when criticalChance not forced.
 * critical multiplier 1.5 when crit lands (modern-ish simplification).
 */
export function rollCritical(unitRoll: number, force?: boolean | number): {
  isCrit: boolean;
  multiplier: number;
} {
  if (force === true || force === 1.5 || force === 2) {
    const mult = typeof force === "number" && force > 1 ? force : 1.5;
    return { isCrit: true, multiplier: mult };
  }
  if (force === false || force === 1) {
    return { isCrit: false, multiplier: 1 };
  }
  // base crit rate 1/16
  const isCrit = unitRoll < 1 / 16;
  return { isCrit, multiplier: isCrit ? 1.5 : 1 };
}

function orderSides(
  state: BattleState,
  playerMove: MoveDef,
  foeMove: MoveDef,
  speedTieRoll?: number,
): BattleSide[] {
  const pp = playerMove.priority;
  const fp = foeMove.priority;
  if (pp > fp) return ["player", "foe"];
  if (fp > pp) return ["foe", "player"];
  const ps = effectiveStat(state.player, "spe");
  const fs = effectiveStat(state.foe, "spe");
  if (ps > fs) return ["player", "foe"];
  if (fs > ps) return ["foe", "player"];
  // Speed tie: coin flip (default player-first for determinism when roll omitted)
  const roll = speedTieRoll ?? 0;
  return roll < 0.5 ? ["player", "foe"] : ["foe", "player"];
}

export interface TurnChoices {
  playerMoveIndex: number;
  foeMoveIndex: number;
  /**
   * Fixed random for damage (0.85–1.0 classic). When omitted in live play,
   * each actor gets an independent rollDamageRandom(Math.random()).
   * Explicit 1.0 keeps goldens deterministic.
   */
  random?: number;
  /**
   * Per-side damage randoms [player, foe] when both act; overrides `random`
   * for that side when present.
   */
  damageRandoms?: number[];
  /** [0,1) roll for crit shared; prefer critRolls for independent sides. */
  critRoll?: number;
  /** Per-side [0,1) crit unit rolls; omit → live Math.random per actor. */
  critRolls?: number[];
  /** Force crit on/off for tests (applies to both sides). */
  forceCrit?: boolean;
  /**
   * [0,1) accuracy rolls per action in order. When omitted and move has
   * accuracy, live play rolls Math.random() per check (can miss).
   * Tests that need always-hit should pass rolls of 0 or forceAccuracyHit.
   */
  accuracyRolls?: number[];
  /** When true, skip accuracy checks (tests). Default false for live. */
  forceAccuracyHit?: boolean;
  /** Speed tie coin [0,1); omit → player first. */
  speedTieRoll?: number;
  /**
   * Linked party for force-switch on player faint. When provided and reserve
   * is conscious, battle does not end on player active faint.
   */
  party?: PartyMember[];
  /**
   * When true (default), omitted damage/crit/acc rolls use Math.random live path.
   * Goldens should pass explicit random / forceCrit / forceAccuracyHit instead.
   */
  liveRolls?: boolean;
  /** Optional RNG for live rolls (tests). Defaults to Math.random. */
  rng?: () => number;
}

function unitRoll(choices: TurnChoices): number {
  const rng = choices.rng ?? Math.random;
  return rng();
}

/**
 * Mid-battle switch: replace active player with party[index].
 * Syncs outgoing HP first. Foe does not act here (caller may executeTurn after).
 * Clears needsForceSwitch when a conscious member is sent out.
 */
export function switchPlayerTo(
  state: BattleState,
  party: PartyMember[],
  index: number,
): BattleState {
  if (state.over) return state;
  if (index < 0 || index >= party.length) {
    throw new Error(`Invalid party index ${index}`);
  }
  const incoming = party[index];
  if (!incoming || incoming.battler.hp <= 0 || incoming.battler.fainted) {
    push(state, {
      type: "message",
      message: "That creature can't battle!",
    });
    return state;
  }
  // Sync current active out
  syncBattlerToParty(party, state.player, state.playerPartyIndex);

  const next = battlerFromPartyMember(incoming);
  state.player = next;
  state.playerPartyIndex = index;
  // Clear stages on switch-in (classic)
  state.player.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  state.needsForceSwitch = false;

  push(state, {
    type: "switch",
    side: "player",
    partyIndex: index,
    message: `Go! ${next.name}!`,
  });
  return state;
}

/**
 * After player faint with needsForceSwitch: switch to a conscious reserve.
 * Returns false if no reserve (battle should end as loss).
 */
export function forceSwitchPlayer(
  state: BattleState,
  party: PartyMember[],
  index?: number,
): boolean {
  if (state.over) return false;
  syncBattlerToParty(party, state.player, state.playerPartyIndex);
  const conscious = consciousIndices(party).filter(
    (i) => i !== state.playerPartyIndex || party[i]!.battler.hp > 0,
  );
  // Active is fainted — exclude current fainted slot
  const reserves = consciousIndices(party);
  if (reserves.length === 0) {
    state.over = true;
    state.winner = "foe";
    state.needsForceSwitch = false;
    push(state, {
      type: "battle-end",
      winner: "foe",
      message: "You lose!",
    });
    return false;
  }
  const pick =
    index != null && reserves.includes(index) ? index : reserves[0]!;
  switchPlayerTo(state, party, pick);
  return true;
}

function applyStageChange(
  state: BattleState,
  targetSide: BattleSide,
  stat: StatStageKey,
  delta: number,
  moveName: string,
): void {
  const target = battler(state, targetSide);
  const stages = ensureStages(target);
  const before = stages[stat];
  const after = Math.max(-6, Math.min(6, before + delta));
  stages[stat] = after;
  const applied = after - before;
  if (applied === 0) {
    push(state, {
      type: "status",
      side: targetSide,
      stageStat: stat,
      stageDelta: 0,
      message: `${target.name}'s ${stat.toUpperCase()} won't go any ${delta < 0 ? "lower" : "higher"}!`,
    });
    return;
  }
  const dir = applied < 0 ? "fell" : "rose";
  const hard = Math.abs(applied) >= 2 ? " sharply" : "";
  push(state, {
    type: "status",
    side: targetSide,
    stageStat: stat,
    stageDelta: applied,
    message: `${target.name}'s ${stat.toUpperCase()} ${dir}${hard}! (${moveName})`,
  });
}

function parseStatusEffect(
  effect: string | undefined,
): { stat: StatStageKey; delta: number } | null {
  if (!effect) return null;
  // e.g. lower-atk-1, raise-def-1
  const m = /^(lower|raise)-([a-z]+)-(\d+)$/i.exec(effect);
  if (!m) return null;
  const dir = m[1]!.toLowerCase() === "lower" ? -1 : 1;
  const rawStat = m[2]!.toLowerCase();
  const map: Record<string, StatStageKey> = {
    atk: "atk",
    attack: "atk",
    def: "def",
    defense: "def",
    spa: "spa",
    spd: "spd",
    spe: "spe",
    speed: "spe",
  };
  const stat = map[rawStat];
  if (!stat) return null;
  const mag = Math.max(1, Number(m[3]) || 1);
  return { stat, delta: dir * mag };
}

function ensureMovePp(b: Battler): number[] {
  if (!b.movePp || b.movePp.length !== b.moves.length) {
    b.movePp = b.moves.map((m) => m.pp);
  }
  return b.movePp;
}

/**
 * Live mode when no damage/crit/acc pins provided.
 * Explicit `random` (goldens) keeps damage fixed + always-hit + no crit unless forced.
 */
function isLiveRollMode(choices: TurnChoices): boolean {
  if (choices.liveRolls === true) return true;
  if (choices.liveRolls === false) return false;
  // Implicit live: no random pin and no forceAccuracyHit-only golden path
  return choices.random == null && choices.damageRandoms == null;
}

function resolveDamageRandom(
  choices: TurnChoices,
  _side: BattleSide,
  actionIndex: number,
): number {
  let r: number;
  if (choices.damageRandoms && choices.damageRandoms[actionIndex] != null) {
    r = choices.damageRandoms[actionIndex]!;
  } else if (choices.random != null) {
    r = choices.random;
  } else {
    // Live default: independent band roll (already in 0.85–1.0)
    return rollDamageRandom(unitRoll(choices));
  }
  // Contract: damage random always in classic 0.85–1.0 band
  return clampDamageRandom(r);
}

function resolveCritUnit(choices: TurnChoices, actionIndex: number): number {
  if (choices.critRolls && choices.critRolls[actionIndex] != null) {
    return choices.critRolls[actionIndex]!;
  }
  if (choices.critRoll != null) {
    return choices.critRoll;
  }
  if (choices.forceCrit != null) {
    return 1;
  }
  // Live: independent crit; golden (explicit random): no crit
  if (isLiveRollMode(choices)) return unitRoll(choices);
  return 1; // unit >= 1/16 → no crit
}

/**
 * Execute one full turn (both sides act unless faint interrupts).
 *
 * Live defaults (when UI omits pins):
 * - damage: rollDamageRandom(rng()) per damaging actor
 * - crit: rng() per actor (~1/16)
 * - accuracy: rng() when move.accuracy != null (can miss)
 *
 * Goldens: pass random: 1, forceCrit: false|true, forceAccuracyHit: true.
 */
export function executeTurn(state: BattleState, choices: TurnChoices): BattleState {
  if (state.over) return state;
  if (state.needsForceSwitch) {
    push(state, {
      type: "message",
      message: "Choose a creature to send out!",
    });
    return state;
  }

  state.turn += 1;

  const playerMove = state.player.moves[choices.playerMoveIndex];
  const foeMove = state.foe.moves[choices.foeMoveIndex];
  if (!playerMove || !foeMove) {
    throw new Error("Invalid move index");
  }

  // PP check (status & damage): if 0, treat as struggle-like message / skip
  const pPp = ensureMovePp(state.player);
  const fPp = ensureMovePp(state.foe);
  if (pPp[choices.playerMoveIndex]! <= 0) {
    push(state, {
      type: "message",
      side: "player",
      message: `${state.player.name} has no PP left for ${playerMove.name}!`,
    });
  }
  if (fPp[choices.foeMoveIndex]! <= 0) {
    push(state, {
      type: "message",
      side: "foe",
      message: `${state.foe.name} has no PP left for ${foeMove.name}!`,
    });
  }

  const sequence = orderSides(state, playerMove, foeMove, choices.speedTieRoll);
  let accIdx = 0;
  let actionIdx = 0;

  for (const side of sequence) {
    if (state.over || state.needsForceSwitch) break;
    const actor = battler(state, side);
    if (actor.fainted || actor.hp <= 0) continue;

    const moveIndex = side === "player" ? choices.playerMoveIndex : choices.foeMoveIndex;
    const move = side === "player" ? playerMove : foeMove;
    const ppArr = ensureMovePp(actor);
    if (ppArr[moveIndex]! <= 0) continue;
    ppArr[moveIndex]! -= 1;

    const targetSide = other(side);
    const target = battler(state, targetSide);

    push(state, {
      type: "move",
      side,
      moveId: move.id,
      message: `${actor.name} used ${move.name}!`,
    });

    // Accuracy: check when move.accuracy != null unless forceAccuracyHit.
    // Live (no random pin): roll rng. Explicit accuracyRolls: use them.
    // Golden (random pinned, no accuracyRolls): always hit.
    if (move.accuracy != null && !choices.forceAccuracyHit) {
      const hasPins = choices.accuracyRolls && choices.accuracyRolls.length > 0;
      if (hasPins || isLiveRollMode(choices)) {
        let roll: number;
        if (hasPins) {
          roll = choices.accuracyRolls![accIdx++] ?? unitRoll(choices);
        } else {
          roll = unitRoll(choices);
          accIdx++;
        }
        if (roll * 100 >= move.accuracy) {
          push(state, {
            type: "miss",
            side,
            moveId: move.id,
            message: `${actor.name}'s attack missed!`,
          });
          actionIdx++;
          continue;
        }
      }
    }

    // Status moves: apply stage effects
    if (move.category === "status" || move.power == null || move.power <= 0) {
      const parsed = parseStatusEffect(move.effect);
      if (parsed) {
        // lower-* targets foe; raise-* targets self
        const tSide = parsed.delta < 0 ? targetSide : side;
        applyStageChange(state, tSide, parsed.stat, parsed.delta, move.name);
      } else {
        push(state, {
          type: "message",
          side,
          message: `${move.name} had no effect.`,
        });
      }
      actionIdx++;
      continue;
    }

    const atkKey = move.category === "physical" ? "atk" : "spa";
    const defKey = move.category === "physical" ? "def" : "spd";
    const atk = effectiveStat(actor, atkKey);
    const def = effectiveStat(target, defKey);
    const stab = stabMultiplier(move.type, actor.types);
    const eff = typeEffectiveness(move.type, target.types, state.typeChart);

    const critUnit = resolveCritUnit(choices, actionIdx);
    const crit = rollCritical(critUnit, choices.forceCrit);
    const random = resolveDamageRandom(choices, side, actionIdx);

    const result = calcDamage({
      level: actor.level,
      attack: atk,
      defense: def,
      power: move.power,
      stab,
      typeEffectiveness: eff,
      random,
      critical: crit.multiplier,
    });

    if (crit.isCrit) {
      push(state, {
        type: "crit",
        side: targetSide,
        moveId: move.id,
        critical: true,
        message: "A critical hit!",
      });
    }

    const dealt = Math.min(result.damage, Math.max(0, target.hp));
    target.hp = Math.max(0, target.hp - dealt);

    push(state, {
      type: "damage",
      side: targetSide,
      damage: dealt,
      effectiveness: eff,
      critical: crit.isCrit,
      moveId: move.id,
      message: damageMessage(actor.name, target.name, dealt, eff, crit.isCrit),
    });

    if (target.hp <= 0) {
      target.fainted = true;
      push(state, {
        type: "faint",
        side: targetSide,
        message: `${target.name} fainted!`,
      });

      if (targetSide === "foe") {
        state.over = true;
        state.winner = side;
        push(state, {
          type: "battle-end",
          winner: side,
          message: "You win!",
        });
      } else {
        // Player active fainted
        handlePlayerFaint(state, choices.party);
      }
    }
    actionIdx++;
  }

  return state;
}

function handlePlayerFaint(
  state: BattleState,
  party: PartyMember[] | undefined,
): void {
  if (party && party.length > 0) {
    // Sync fainted active into party before checking reserves
    syncBattlerToParty(party, state.player, state.playerPartyIndex);
    const reserves = consciousIndices(party);
    if (reserves.length > 0) {
      state.needsForceSwitch = true;
      state.over = false;
      state.winner = undefined;
      push(state, {
        type: "force-switch",
        side: "player",
        message: "Send out a creature!",
      });
      return;
    }
  }
  // Party wipe or no party linked → loss
  state.over = true;
  state.winner = "foe";
  state.needsForceSwitch = false;
  push(state, {
    type: "battle-end",
    winner: "foe",
    message: "You lose!",
  });
}

export interface GrantBattleRewardsOpts {
  /** Base exp of defeated species (default 50). */
  baseExp?: number;
  /** Party to sync XP into (active + optional shared). */
  party?: PartyMember[];
}

export interface GrantBattleRewardsResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  messages: string[];
}

/**
 * On player win: grant XP to active battler (and sync to party if provided).
 * Emits xp / level-up events onto state.log.
 */
export function grantBattleRewards(
  state: BattleState,
  opts: GrantBattleRewardsOpts = {},
): GrantBattleRewardsResult {
  const messages: string[] = [];
  if (state.winner !== "player") {
    return {
      xpGained: 0,
      leveledUp: false,
      newLevel: state.player.level,
      messages: ["No rewards — battle not won."],
    };
  }
  const amount = xpYield(state.foe.level, opts.baseExp ?? 50);
  const result = applyXp(state.player, amount);
  for (const m of result.messages) {
    messages.push(m);
    if (m.includes("grew to level")) {
      push(state, {
        type: "level-up",
        side: "player",
        level: state.player.level,
        message: m,
      });
    } else {
      push(state, {
        type: "xp",
        side: "player",
        xp: amount,
        message: m,
      });
    }
  }
  if (opts.party) {
    syncBattlerToParty(opts.party, state.player, state.playerPartyIndex);
  }
  return {
    xpGained: result.xpGained,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    messages,
  };
}

function damageMessage(
  actor: string,
  target: string,
  dmg: number,
  eff: number,
  isCrit: boolean,
): string {
  let extra = "";
  if (isCrit) extra += " A critical hit!";
  if (eff === 0) extra += " It had no effect!";
  else if (eff > 1) extra += " It's super effective!";
  else if (eff < 1) extra += " It's not very effective...";
  return `${actor} hit ${target} for ${dmg}.${extra}`;
}

/** AI: pick first damaging move with PP, else first with PP, else 0. */
export function pickFirstDamagingMove(b: Battler): number {
  const pp = b.movePp;
  for (let i = 0; i < b.moves.length; i++) {
    const m = b.moves[i]!;
    if (pp && pp[i]! <= 0) continue;
    if (m.category !== "status" && m.power != null && m.power > 0) return i;
  }
  for (let i = 0; i < b.moves.length; i++) {
    if (!pp || pp[i]! > 0) return i;
  }
  return 0;
}

/**
 * Slightly smarter foe AI: prefer super-effective damaging move when available;
 * otherwise damaging; occasionally status if player has stages to lower.
 */
export function pickFoeMove(
  foe: Battler,
  player: Battler,
  typeChart: TypeChart,
): number {
  const pp = foe.movePp;
  let best = -1;
  let bestScore = -1;
  for (let i = 0; i < foe.moves.length; i++) {
    if (pp && pp[i]! <= 0) continue;
    const m = foe.moves[i]!;
    let score = 0;
    if (m.category === "status") {
      score = 1;
    } else if (m.power != null && m.power > 0) {
      const eff = typeEffectiveness(m.type, player.types, typeChart);
      score = 10 + m.power * eff;
      if (eff > 1) score += 20;
    }
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best >= 0 ? best : pickFirstDamagingMove(foe);
}

export { clampDamageRandom, anyConscious, xpYield };
