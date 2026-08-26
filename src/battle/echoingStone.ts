import { createBattle, executeTurn, type CreateBattleOpts, type TurnChoices } from './battle.ts';
import type { BattleSide, BattleState, EchoingStoneFieldState, MoveDef } from './types.ts';

export const ECHOING_STONE_FIELD = Object.freeze({
  id: 'field:route-3:echoing-stone' as const,
  locationId: 'location:kanto:route-3' as const,
  rulesetVersion: 1 as const,
  stagger: Object.freeze({ stat: 'spe' as const, stageDelta: -1 as const }),
  accessibleSummary: 'Echoing Stone: a sound move raises the stone ring and charges Echo. The next contact move before the ring settles consumes Echo and lowers its target’s Speed by one stage.',
});

export const ECHO_TRANSITION_TIMING = Object.freeze({ riseMs: 420, settleMs: 280 });

export function createEchoingStoneState(locationId: string | undefined): EchoingStoneFieldState | undefined {
  if (locationId !== ECHOING_STONE_FIELD.locationId) return undefined;
  return { id: ECHOING_STONE_FIELD.id, rulesetVersion: ECHOING_STONE_FIELD.rulesetVersion, echo: null };
}

export function applyEchoingStoneBeforeMove(
  state: BattleState,
  side: BattleSide,
  targetSide: BattleSide,
  move: MoveDef,
): void {
  const field = state.field;
  if (!field) return;

  if (move.tags?.includes('contact') && field.echo) {
    const target = targetSide === 'player' ? state.player : state.foe;
    const stages = target.stages ??= { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const before = stages.spe;
    stages.spe = Math.max(-6, before + ECHOING_STONE_FIELD.stagger.stageDelta);
    const applied = stages.spe - before;
    field.echo = null;
    state.log.push({
      type: 'field',
      fieldId: field.id,
      rulesetVersion: field.rulesetVersion,
      fieldAction: 'echo-consumed',
      side: targetSide,
      turn: state.turn,
      stageStat: ECHOING_STONE_FIELD.stagger.stat,
      stageDelta: applied,
      message: `Echo consumed. The stone ring drops and ${target.name}'s Speed falls by one stage.`,
    });
  }

  if (move.tags?.includes('sound')) {
    field.echo = { chargedBy: side, expiresAfterTurn: state.turn + 1 };
    state.log.push({
      type: 'field',
      fieldId: field.id,
      rulesetVersion: field.rulesetVersion,
      fieldAction: 'echo-charged',
      side,
      turn: state.turn,
      message: `Echo charged. The stone ring rises; the next contact move through turn ${state.turn + 1} will stagger its target.`,
    });
  }
}

export function applyEchoingStoneAfterTurn(state: BattleState): void {
  const field = state.field;
  if (!field?.echo || state.turn < field.echo.expiresAfterTurn) return;
  field.echo = null;
  state.log.push({
    type: 'field',
    fieldId: field.id,
    rulesetVersion: field.rulesetVersion,
    fieldAction: 'echo-settled',
    turn: state.turn,
    message: 'Echo faded. The stone ring settles; no stagger is charged.',
  });
}

export function migrateEchoingStoneSave(raw: unknown): EchoingStoneFieldState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return createEchoingStoneState(ECHOING_STONE_FIELD.locationId)!;
  const value = raw as Partial<EchoingStoneFieldState> & {
    fieldId?: string;
    echoCharged?: boolean;
    chargedBy?: BattleSide;
    expiresAfterTurn?: number;
  };
  const id = value.id ?? value.fieldId;
  if (id !== ECHOING_STONE_FIELD.id) throw new Error('Echoing Stone save field mismatch');
  const legacyEcho = value.echoCharged
    ? { chargedBy: value.chargedBy === 'foe' ? 'foe' as const : 'player' as const, expiresAfterTurn: Math.max(1, Math.floor(Number(value.expiresAfterTurn) || 1)) }
    : null;
  const echo = value.rulesetVersion === 1 && (value.echo === null || value.echo)
    ? value.echo
    : legacyEcho;
  return { id: ECHOING_STONE_FIELD.id, rulesetVersion: 1, echo: echo ?? null };
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function fnv1a64(text: string): string {
  let hash = 0xcbf29ce484222325n;
  for (const byte of new TextEncoder().encode(text)) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return `fnv1a64:${hash.toString(16).padStart(16, '0')}`;
}

export function replayEchoingStoneBattle(opts: Omit<CreateBattleOpts, 'locationId'> & { choices: TurnChoices[] }): { log: BattleState['log']; finalHash: string } {
  const state = createBattle({ ...opts, locationId: ECHOING_STONE_FIELD.locationId });
  for (const choice of opts.choices) executeTurn(state, choice);
  return { log: structuredClone(state.log), finalHash: fnv1a64(stable(state.log)) };
}
