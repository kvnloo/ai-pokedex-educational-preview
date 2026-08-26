#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalBattlePrewarmPlan } from '../src/creatures/canonicalBattlePrewarm.ts';

const route = {
  starterChoices: ['bulbasaur', 'charmander', 'squirtle'],
  wildEncounters: [
    { species: 'pidgey', level: 3 },
    { species: 'caterpie', level: 3 },
  ],
  gym: { species: 'geodude', level: 12 },
};

test('canonical battle prewarm uses the exact production species and send-out scales', () => {
  assert.deepEqual(canonicalBattlePrewarmPlan(route), [
    { speciesId: 'bulbasaur', scale: 0.9, key: 'bulbasaur@0.900' },
    { speciesId: 'charmander', scale: 0.9, key: 'charmander@0.900' },
    { speciesId: 'squirtle', scale: 0.9, key: 'squirtle@0.900' },
    { speciesId: 'pidgey', scale: 1.02, key: 'pidgey@1.020' },
    { speciesId: 'caterpie', scale: 1.02, key: 'caterpie@1.020' },
    { speciesId: 'geodude', scale: 1.02, key: 'geodude@1.020' },
  ]);
});

test('a near-miss scale cannot satisfy an exact production prewarm key', () => {
  const keys = new Set(canonicalBattlePrewarmPlan(route).map((entry) => entry.key));
  assert.equal(keys.has('pidgey@1.000'), false);
  assert.equal(keys.has('pidgey@1.020'), true);
});
