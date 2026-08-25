import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ECHOING_STONE_FIELD,
  ECHO_TRANSITION_TIMING,
  migrateEchoingStoneSave,
  replayEchoingStoneBattle,
} from '../src/battle/echoingStone.ts';
import { buildBattler, createBattle, executeTurn } from '../src/battle/battle.ts';
import { normalizeMove } from '../src/battle/content.ts';
import { readFileSync } from 'node:fs';

const chart = { normal: { normal: 1 } };
const stats = { hp: 90, atk: 70, def: 70, spa: 70, spd: 70, spe: 70 };
const sound = { id: 'resonant-call', name: 'Resonant Call', type: 'normal', category: 'status', power: null, accuracy: null, pp: 10, priority: 0, tags: ['sound'] };
const contact = { id: 'shoulder-tap', name: 'Shoulder Tap', type: 'normal', category: 'physical', power: 20, accuracy: null, pp: 10, priority: 0, tags: ['contact'] };
const wait = { id: 'wait', name: 'Wait', type: 'normal', category: 'status', power: null, accuracy: null, pp: 10, priority: 0, tags: [] };

function battler(id, moves, speed = 70) {
  return buildBattler({ id, name: id, speciesId: id, types: ['normal'], level: 10, baseStats: { ...stats, spe: speed }, moves });
}

function fieldBattle() {
  return createBattle({
    player: battler('player', [sound, contact, wait], 90),
    foe: battler('foe', [wait, contact], 50),
    typeChart: chart,
    locationId: ECHOING_STONE_FIELD.locationId,
  });
}

const pinned = { random: 1, forceCrit: false, forceAccuracyHit: true };

test('sound-tagged move charges Echo for the next turn and writes the canonical field event', () => {
  const battle = fieldBattle();
  executeTurn(battle, { playerMoveIndex: 0, foeMoveIndex: 0, ...pinned });
  assert.deepEqual(battle.field, {
    id: 'field:route-3:echoing-stone',
    rulesetVersion: 1,
    echo: { chargedBy: 'player', expiresAfterTurn: 2 },
  });
  assert.deepEqual(battle.log.filter((event) => event.type === 'field'), [{
    type: 'field',
    fieldId: 'field:route-3:echoing-stone',
    rulesetVersion: 1,
    fieldAction: 'echo-charged',
    side: 'player',
    turn: 1,
    message: 'Echo charged. The stone ring rises; the next contact move through turn 2 will stagger its target.',
  }]);
});

test('next contact-tagged move consumes Echo and applies the fixed versioned stagger', () => {
  const battle = fieldBattle();
  executeTurn(battle, { playerMoveIndex: 0, foeMoveIndex: 0, ...pinned });
  executeTurn(battle, { playerMoveIndex: 1, foeMoveIndex: 0, ...pinned });
  assert.equal(battle.foe.stages.spe, -1);
  assert.equal(battle.field.echo, null);
  assert.equal(battle.log.some((event) => event.type === 'field' && event.fieldAction === 'echo-consumed' && event.stageDelta === -1 && event.stageStat === 'spe'), true);
});

test('Echo expires after one available turn when no contact move consumes it', () => {
  const battle = fieldBattle();
  executeTurn(battle, { playerMoveIndex: 0, foeMoveIndex: 0, ...pinned });
  executeTurn(battle, { playerMoveIndex: 2, foeMoveIndex: 0, ...pinned });
  assert.equal(battle.log.some((event) => event.type === 'field' && event.fieldAction === 'echo-settled'), true);
});

test('field is inactive away from canonical Route 3', () => {
  const battle = createBattle({ player: battler('player', [sound], 90), foe: battler('foe', [contact], 50), typeChart: chart, locationId: 'location:kanto:route-1' });
  executeTurn(battle, { playerMoveIndex: 0, foeMoveIndex: 0, ...pinned });
  assert.equal(battle.field, undefined);
  assert.equal(battle.log.some((event) => event.type === 'field'), false);
});

test('save migration, reload, and replay preserve byte-identical log and final hash', () => {
  const battle = fieldBattle();
  executeTurn(battle, { playerMoveIndex: 0, foeMoveIndex: 0, ...pinned });
  const legacy = { fieldId: ECHOING_STONE_FIELD.id, echoCharged: true, chargedBy: 'player', expiresAfterTurn: 2 };
  assert.deepEqual(migrateEchoingStoneSave(legacy), battle.field);

  const choices = [
    { playerMoveIndex: 0, foeMoveIndex: 0, ...pinned },
    { playerMoveIndex: 1, foeMoveIndex: 0, ...pinned },
  ];
  const first = replayEchoingStoneBattle({ player: battler('player', [sound, contact], 90), foe: battler('foe', [wait, contact], 50), typeChart: chart, choices });
  const second = replayEchoingStoneBattle({ player: battler('player', [sound, contact], 90), foe: battler('foe', [wait, contact], 50), typeChart: chart, choices });
  assert.equal(JSON.stringify(first.log), JSON.stringify(second.log));
  assert.equal(first.finalHash, second.finalHash);
});

test('accessible summary is plain language and does not rely on color', () => {
  assert.equal(ECHOING_STONE_FIELD.accessibleSummary, 'Echoing Stone: a sound move raises the stone ring and charges Echo. The next contact move before the ring settles consumes Echo and lowers its target’s Speed by one stage.');
});

test('shipping move content exposes one usable sound-to-contact tactic', () => {
  const content = JSON.parse(readFileSync(new URL('../content/game/wave0.json', import.meta.url), 'utf8'));
  const moves = new Map(content.moves.map((raw) => {
    const move = normalizeMove(raw);
    return [move.id, move];
  }));
  assert.deepEqual(moves.get('growl-down').tags, ['sound']);
  assert.deepEqual(moves.get('nudge').tags, ['contact']);
});

test('battle surface includes visible and live-region field status', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="field-status"/);
  assert.match(html, /id="field-summary"[^>]*aria-live="polite"/);
});

test('stone-ring transition reserves readable rise and settle beats', () => {
  assert.deepEqual(ECHO_TRANSITION_TIMING, { riseMs: 420, settleMs: 280 });
});

test('restored canonical location is the visible location label', () => {
  const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
  assert.match(source, /loc\.textContent = campaign\.currentLocationId/);
});
