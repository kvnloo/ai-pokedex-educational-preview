#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { validateCanonicalCorpus } from './canonical-world-validation.mjs';

const root = new URL('..', import.meta.url).pathname;
const load = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const paths = [
  'canonical/sources.json', 'canonical/games.json', 'canonical/regions.json',
  'canonical/locations.json', 'canonical/maps/kanto-opening.json',
  'canonical/ash/arcs.json', 'canonical/ash/events/kanto-opening.json',
  'canonical/conflicts.json', 'canonical/runtime/kanto-opening.json',
];
const documents = paths.map((path) => [path, load(path)]);
const schema = load('canonical/schemas/canonical-world.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validate = ajv.compile(schema);
for (const [path, document] of documents) {
  assert.equal(validate(document), true, `${path}: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);
}

const assetSchema = load('canonical/schemas/canonical-assets.schema.json');
const validateAssets = new Ajv2020({
  allErrors: true,
  strict: true,
  formats: { date: /^\d{4}-\d{2}-\d{2}$/ },
}).compile(assetSchema);
const assets = load('canonical/assets.json');
assert.equal(validateAssets(assets), true, `canonical/assets.json: ${JSON.stringify(validateAssets.errors)}`);
assert.ok(assets.assets.every((asset) => asset.sourceSha256.length === 64));
assert.ok(assets.assets
  .filter((asset) => asset.scope === 'private-canonical-reference')
  .every((asset) => asset.gitPolicy === 'manifest-only' && !asset.profiles.includes('distributable')));

const byType = Object.fromEntries(documents.map(([, document]) => [document.documentType, document]));
validateCanonicalCorpus(byType);
const sourceIds = new Set(byType.sources.sources.map((source) => source.id));
const provenanceFacts = [];
for (const [type, document] of Object.entries(byType)) {
  const collection = { sources: 'sources', games: 'games', regions: 'regions', locations: 'locations', maps: 'maps', arcs: 'arcs', events: 'events', conflicts: 'divergences' }[type];
  if (collection) provenanceFacts.push(...document[collection]);
}
for (const map of byType.maps.maps) provenanceFacts.push(...map.connections, ...map.warps);
for (const fact of provenanceFacts) assert.ok(sourceIds.has(fact.provenance.sourceId), `unknown fact source ${fact.provenance.sourceId}`);

const malformed = structuredClone(byType.games);
delete malformed.games[0].provenance.sourceId;
assert.equal(validate(malformed), false, 'schema must reject missing field-level provenance');
const extra = structuredClone(byType.regions);
extra.regions[0].unexpected = true;
assert.equal(validate(extra), false, 'strict schema must reject unknown fields');

const games = new Set(byType.games.games.map((game) => game.id));
const regions = new Set(byType.regions.regions.map((region) => region.id));
const locations = new Set(byType.locations.locations.map((location) => location.id));
const maps = new Map(byType.maps.maps.map((map) => [map.id, map]));
for (const map of maps.values()) {
  assert.ok(games.has(map.gameId), `dangling game ${map.gameId}`);
  assert.ok(locations.has(map.locationId), `dangling location ${map.locationId}`);
  for (const edge of map.connections) {
    assert.ok(locations.has(edge.to), `dangling edge ${edge.to}`);
    if (!edge.oneWay) {
      const target = [...maps.values()].find((candidate) => candidate.gameId === map.gameId && candidate.locationId === edge.to);
      assert.ok(target?.connections.some((reverse) => reverse.to === map.locationId && !reverse.oneWay), `missing reciprocal edge ${map.id} -> ${edge.to}`);
    }
  }
  for (const warp of map.warps) {
    const target = maps.get(warp.toMap);
    assert.ok(target, `dangling warp ${warp.id}`);
    if (!warp.oneWay) assert.equal(target.warps.find((candidate) => candidate.id === warp.reciprocalWarpId)?.toMap, map.id, `missing reciprocal warp ${warp.id}`);
  }
}
for (const region of byType.regions.regions) assert.ok(region.gameIds.every((id) => games.has(id)));
for (const location of byType.locations.locations) assert.ok(regions.has(location.regionId));
for (const event of byType.events.events) assert.ok(locations.has(event.locationId));

const { deriveCoordinates } = await import('../src/world/canonicalWorld.ts');
for (const gameId of games) {
  const coordinates = deriveCoordinates(byType.maps.maps, gameId, 'location:kanto:pallet-town');
  assert.equal(Object.keys(coordinates).length, byType.locations.locations.length);
}
const runtime = byType.runtime;
assert.deepEqual(runtime.coordinates, deriveCoordinates(byType.maps.maps, runtime.activeGameId, runtime.path[0]));
assert.equal(runtime.presentationPolicy.privateCanonicalAssetsAllowed, true);
assert.equal(runtime.presentationPolicy.distributableAssetsOnly, true);
assert.equal(runtime.presentationPolicy.privateAssetsInPublicArtifactsAllowed, false);
assert.deepEqual([...new Set(byType.maps.maps.map((map) => map.gameId))].sort(), [...games].sort());
assert.ok(byType.conflicts.divergences.some((item) => item.kind === 'anime-game'));

console.log(`canonical-world golden: ${provenanceFacts.length} strict facts/edges, ${maps.size} versioned maps`);
