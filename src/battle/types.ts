/** Wave-0 battle types — pure TS, no DOM/three. */

export type MoveCategory = "physical" | "special" | "status";

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

/** Mutable battle stages −6…+6 (classic). */
export type StatStageKey = "atk" | "def" | "spa" | "spd" | "spe";

export interface StatStages {
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

/** Move definition as used at runtime (normalized from content). */
export interface MoveDef {
  /** Stable string key (slug or id from content) */
  id: string;
  name: string;
  type: string;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  target?: string;
  effect?: string;
  description?: string;
  moveId?: number;
  slug?: string;
}

export interface SpeciesDef {
  /** Stable string key */
  id: string;
  name: string;
  types: string[];
  baseStats: BaseStats;
  /** Move ids/slugs */
  moves: string[];
  role?: string;
  color?: string;
  flavor?: string;
  speciesId?: number;
  /** Canonical National Pokédex number from PokéAPI. */
  nationalId?: number;
  slug?: string;
  source?: {
    system?: string;
    pokemonUrl?: string;
    speciesUrl?: string;
  };
  /** Catch rate 1–255 (higher = easier). */
  catchRate?: number;
  /** Base yield for XP calc (optional). */
  baseExp?: number;
}

export interface Battler {
  id: string;
  name: string;
  speciesId: string;
  types: string[];
  level: number;
  hp: number;
  maxHp: number;
  stats: BaseStats;
  moves: MoveDef[];
  fainted?: boolean;
  /** Current PP remaining per move index (optional; defaults to move.pp). */
  movePp?: number[];
  /** In-battle stages; absent → all 0. */
  stages?: StatStages;
  /** Accumulated experience toward next level. */
  xp?: number;
  /** XP needed for next level (default formula if absent). */
  xpToNext?: number;
  /** Species base stats retained for re-leveling. */
  baseStats?: BaseStats;
}

export type TypeChart = Record<string, Record<string, number>>;

export interface DamageInput {
  level: number;
  attack: number;
  defense: number;
  power: number;
  stab: number;
  typeEffectiveness: number;
  /** Classic random band 0.85–1.0 */
  random: number;
  critical?: number;
}

export interface DamageResult {
  damage: number;
  base: number;
  stab: number;
  typeEffectiveness: number;
  random: number;
  critical: number;
}

export type BattleSide = "player" | "foe";

export interface BattleEvent {
  type:
    | "battle-start"
    | "move"
    | "damage"
    | "faint"
    | "message"
    | "battle-end"
    | "switch"
    | "status"
    | "miss"
    | "crit"
    | "force-switch"
    | "xp"
    | "level-up";
  side?: BattleSide;
  moveId?: string;
  damage?: number;
  effectiveness?: number;
  critical?: boolean;
  message?: string;
  winner?: BattleSide | "draw";
  /** For switch events */
  partyIndex?: number;
  /** Stat stage change magnitude (status) */
  stageDelta?: number;
  stageStat?: StatStageKey;
  /** XP granted */
  xp?: number;
  /** Level after level-up */
  level?: number;
}

export interface BattleState {
  player: Battler;
  foe: Battler;
  turn: number;
  over: boolean;
  winner?: BattleSide | "draw";
  log: BattleEvent[];
  typeChart: TypeChart;
  /** Index into player party for active battler (when party-linked). */
  playerPartyIndex?: number;
  /**
   * Player active fainted but conscious reserve exists — must switch before
   * continuing. Battle is not over until party wipe.
   */
  needsForceSwitch?: boolean;
}

export interface Wave0Content {
  version: string;
  wave?: number;
  title: string;
  types: string[];
  typeChart: TypeChart;
  moves: Array<Record<string, unknown>>;
  species: Array<Record<string, unknown>>;
  route?: {
    id: string;
    name: string;
    description?: string;
    starterChoices?: string[];
    wildEncounters?: Array<{
      species: string;
      minLevel: number;
      maxLevel: number;
      weight: number;
      /** Optional stake band: early | mid | late */
      band?: string;
    }>;
    playerDefaultLevel?: number;
    /** Authored route encounter gates populated with canonical Pokémon. */
    gym?: {
      id: string;
      name: string;
      leaderName: string;
      species: string;
      level: number;
      description?: string;
    };
    elite?: {
      id: string;
      name: string;
      trainerName: string;
      species: string;
      level: number;
      description?: string;
    };
  };
}
