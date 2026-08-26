import test from 'node:test';
import assert from 'node:assert/strict';
import { createExploreState, tickExplore } from '../src/world/explore.ts';

test('grass drought bound is based on traversed distance rather than render-frame count', () => {
  const state = createExploreState({
    pos: { x: 1.3, z: -1.2 },
    bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
    grass: { cx: 0, cz: -1.2, half: 100, encounterChance: 0 },
    obstacles: [],
  });
  state.keys.add('d');

  let encounter = false;
  for (let frame = 0; frame < 120; frame += 1) {
    if (tickExplore(state, 0.1, () => 1).encounter) {
      encounter = true;
      break;
    }
  }

  assert.equal(encounter, true, '12 seconds of uninterrupted grass traversal must hit the drought bound even at 10 fps');
});

test('leaving grass resets accumulated drought distance', () => {
  const state = createExploreState({
    pos: { x: 1.3, z: -1.2 },
    bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
    grass: { cx: 0, cz: -1.2, half: 3, encounterChance: 0 },
    obstacles: [],
  });
  state.keys.add('d');
  for (let frame = 0; frame < 5; frame += 1) tickExplore(state, 0.1, () => 1);
  assert.ok(state.grassDroughtMeters > 0);
  state.pos.x = 0;
  tickExplore(state, 0.1, () => 1);
  assert.equal(state.grassDroughtMeters, 0);
});
