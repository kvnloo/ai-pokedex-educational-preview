import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CampaignEngine,
  SAVE_VERSION,
  migrateCampaignSave,
  normalizeInputFrame,
  resolveRuntimeAssetProfile,
} from '../src/campaign/campaign.ts';

const contract = {
  sliceId: 'world-slice:kanto:pallet-pewter',
  path: ['pallet', 'route-1', 'viridian', 'route-2', 'forest', 'pewter'],
  events: [
    { id: 'wake', locationId: 'pallet', order: 1 },
    { id: 'rival', locationId: 'route-1', order: 2 },
    { id: 'brock', locationId: 'pewter', order: 3 },
  ],
};

test('campaign logs starter and ordered spatial traversal with a stable final hash', () => {
  const campaign = new CampaignEngine(contract, { seed: 7 });
  campaign.chooseStarter('emberpup');
  for (const locationId of contract.path.slice(1)) campaign.enterLocation(locationId);
  const first = campaign.snapshot();

  assert.deepEqual(first.visitedLocationIds, contract.path);
  assert.deepEqual(first.storyEventIds, ['wake', 'rival', 'brock']);
  assert.match(first.finalHash, /^fnv1a64:[a-f0-9]{16}$/);

  const replay = CampaignEngine.replay(contract, first.eventLog);
  assert.equal(replay.snapshot().finalHash, first.finalHash);
  assert.deepEqual(replay.snapshot().eventLog, first.eventLog);
});

test('campaign rejects skipped locations and battle before the Route 1 encounter boundary', () => {
  const campaign = new CampaignEngine(contract, { seed: 9 });
  campaign.chooseStarter('dewkin');
  assert.throws(() => campaign.enterLocation('viridian'), /expected route-1/);
  assert.throws(() => campaign.beginEncounter('dustbun'), /Route 1/);
  campaign.enterLocation('route-1');
  campaign.beginEncounter('dustbun');
  campaign.resolveBattle({ turns: 2, caughtSpeciesId: 'dustbun' });
  assert.deepEqual(campaign.snapshot().partySpeciesIds, ['dewkin', 'dustbun']);
});

test('save migration restores legacy progress and rejects incompatible slices', () => {
  const migrated = migrateCampaignSave({
    sliceId: contract.sliceId,
    currentLocationId: 'viridian',
    visitedLocationIds: ['pallet', 'route-1', 'viridian'],
    storyEventIds: ['wake', 'rival'],
    traversedMeters: 10,
    saveRevision: 3,
  }, contract);
  assert.equal(migrated.version, SAVE_VERSION);
  assert.equal(migrated.currentLocationId, 'viridian');
  assert.throws(() => migrateCampaignSave({ ...migrated, sliceId: 'other' }, contract), /slice/);
});

test('restored event journal preserves final hash and resumes deterministically', () => {
  const campaign = new CampaignEngine(contract, { seed: 11 });
  campaign.chooseStarter('leafkit');
  campaign.enterLocation('route-1');
  const restored = CampaignEngine.restore(contract, campaign.snapshot());
  restored.enterLocation('viridian');
  const direct = CampaignEngine.replay(contract, restored.snapshot().eventLog);
  assert.equal(restored.snapshot().finalHash, direct.snapshot().finalHash);
});

test('input normalization combines keyboard touch and controller without diagonal boost', () => {
  const input = normalizeInputFrame({
    keys: new Set(['w']),
    touch: { x: 1, y: -1 },
    gamepad: { x: 0.5, y: 0, interact: true },
  });
  assert.ok(Math.hypot(input.x, input.y) <= 1.000001);
  assert.ok(input.x > 0 && input.y < 0);
  assert.equal(input.interact, true);
});

test('runtime asset resolver fails closed and preserves profile policy', () => {
  assert.deepEqual(resolveRuntimeAssetProfile('distributable', {
    distributable: { markerHref: '/assets/standin.json', policy: 'distributable' },
  }), { profile: 'distributable', markerHref: '/assets/standin.json', policy: 'distributable' });
  assert.throws(() => resolveRuntimeAssetProfile('private-local', {
    distributable: { markerHref: '/assets/standin.json', policy: 'distributable' },
  }), /private-local/);
});
