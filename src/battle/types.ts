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
  slug?: string;
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
}

export type TypeChart = Record<string, Record<string, number>>;

export interface DamageInput {
  level: number;
  attack: number;
  defense: number;
  power: number;
  stab: number;
  typeEffectiveness: number;
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
    | "battle-end";
  side?: BattleSide;
  moveId?: string;
  damage?: number;
  effectiveness?: number;
  message?: string;
  winner?: BattleSide | "draw";
}

export interface BattleState {
  player: Battler;
  foe: Battler;
  turn: number;
  over: boolean;
  winner?: BattleSide | "draw";
  log: BattleEvent[];
  typeChart: TypeChart;
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
    }>;
    playerDefaultLevel?: number;
  };
}
