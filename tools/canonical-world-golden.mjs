#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const load = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
};

const sources = load('canonical/sources.json');
const games = load('canonical/games.json');
const regions = load('canonical/regions.json');
const locations = load('canonical/locations.json');
const maps = load('canonical/maps/kanto-opening.json');
const arcs = load('canonical/ash/arcs.json');
const events = load('canonical/ash/events/kanto-opening.json');
const conflicts = load('canonical/conflicts.json');
const runtime = load('canonical/runtime/kanto-opening.json');
const schema = load('canonical/schemas/canonical-world.schema.json');

assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
for (const document of [sources, games, regions, locations, maps, arcs, events, conflicts, runtime]) {
  assert.equal(document.schemaVersion, 1);
  assert.ok(document.provenance?.sourceIds?.length, 'document provenance is required');
  for (const sourceId of document.provenance.sourceIds) {
    assert.ok(sources.sources.some((source) => source.id === sourceId), `unknown source ${sourceId}`);
  }
}
for (const source of sources.sources) {
  assert.ok(source.url && source.accessedAt && source.extractionMethod && source.usagePolicy);
  assert.ok(['reusable-metadata', 'research-only', 'citation-only', 'original'].includes(source.usagePolicy));
}

const forbidden = new Set(['.gb', '.gbc', '.gba', '.nds', '.3ds', '.cia', '.sav']);
const tracked = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);
assert.deepEqual(tracked.filter((path) => forbidden.has(extname(path).toLowerCase())), []);

const versions = new Set(maps.maps.map((map) => map.gameId));
assert.deepEqual([...versions].sort(), ['game:firered-leafgreen', 'game:red-blue', 'game:yellow']);
for (const location of locations.locations) {
  for (const gameId of versions) {
    assert.ok(maps.maps.some((map) => map.locationId === location.id && map.gameId === gameId), `${location.id} missing ${gameId}`);
  }
}
assert.equal(new Set(maps.maps.map((map) => map.id)).size, maps.maps.length, 'versioned map IDs must be unique');

const expectedPath = [
  'location:kanto:pallet-town', 'location:kanto:route-1', 'location:kanto:viridian-city',
  'location:kanto:route-2-south', 'location:kanto:viridian-forest', 'location:kanto:route-2-north',
  'location:kanto:pewter-city',
];
assert.deepEqual(runtime.path, expectedPath);
assert.deepEqual(runtime.coordinates, {
  'location:kanto:pallet-town': [0, 0], 'location:kanto:route-1': [0, 1],
  'location:kanto:viridian-city': [0, 2], 'location:kanto:route-2-south': [0, 3],
  'location:kanto:viridian-forest': [0, 4], 'location:kanto:route-2-north': [0, 5],
  'location:kanto:pewter-city': [0, 6],
});
for (let i = 1; i < events.events.length; i++) {
  assert.ok(events.events[i - 1].order < events.events[i].order, 'Ash events must be strictly ordered');
}
assert.ok(events.events.every((event) => event.plane === 'anime'));
assert.ok(maps.maps.every((map) => map.plane === 'game'));
assert.ok(conflicts.divergences.some((item) => item.kind === 'anime-game'));
assert.ok(runtime.presentationPolicy.originalAssetsOnly);

const { canonicalKantoOpening } = await import('../src/world/canonicalWorld.ts');
assert.deepEqual(canonicalKantoOpening.coordinates, runtime.coordinates);
assert.deepEqual(canonicalKantoOpening.path, runtime.path);
assert.equal(canonicalKantoOpening.events.at(-1)?.locationId, 'location:kanto:pewter-city');

console.log(`canonical-world golden: ${sources.sources.length} sources, ${maps.maps.length} versioned maps, ${events.events.length} ordered events`);
