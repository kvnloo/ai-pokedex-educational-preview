#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateCanonicalCorpus } from './canonical-world-validation.mjs';

const root = new URL('..', import.meta.url).pathname;
const load = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const valid = {
  sources: load('canonical/sources.json'), games: load('canonical/games.json'),
  regions: load('canonical/regions.json'), locations: load('canonical/locations.json'),
  maps: load('canonical/maps/kanto-opening.json'), arcs: load('canonical/ash/arcs.json'),
  events: load('canonical/ash/events/kanto-opening.json'),
  conflicts: load('canonical/conflicts.json'), runtime: load('canonical/runtime/kanto-opening.json'),
};
const rejects = (name, mutate) => {
  const corpus = structuredClone(valid);
  mutate(corpus);
  assert.throws(() => validateCanonicalCorpus(corpus), Error, name);
};

validateCanonicalCorpus(valid);
rejects('duplicate Ash order within arc', (c) => { c.events.events[1].order = c.events.events[0].order; });
rejects('duplicate arc order', (c) => { c.arcs.arcs.push({ ...structuredClone(c.arcs.arcs[0]), id: 'arc:ash:test' }); });
rejects('nonadjacent runtime traversal', (c) => { [c.runtime.path[1], c.runtime.path[4]] = [c.runtime.path[4], c.runtime.path[1]]; });
rejects('ambiguous map for version/location', (c) => { c.maps.maps.push({ ...structuredClone(c.maps.maps[0]), id: 'map:test:duplicate', connections: [], warps: [] }); });
rejects('reciprocal warps cross game versions', (c) => {
  const a = c.maps.maps[0];
  const b = c.maps.maps.find((map) => map.gameId !== a.gameId);
  const wa = a.warps[0], wb = b.warps[0];
  for (const warp of [wa, wb]) {
    const formerTarget = c.maps.maps.find((map) => map.id === warp.toMap);
    formerTarget.warps = formerTarget.warps.filter((reverse) => reverse.id !== warp.reciprocalWarpId);
  }
  wa.toMap = b.id; wa.reciprocalWarpId = wb.id;
  wb.toMap = a.id; wb.reciprocalWarpId = wa.id;
});
rejects('one-way warp crosses game versions', (c) => {
  const source = c.maps.maps[0], warp = source.warps[0];
  const formerTarget = c.maps.maps.find((map) => map.id === warp.toMap);
  formerTarget.warps = formerTarget.warps.filter((reverse) => reverse.id !== warp.reciprocalWarpId);
  warp.oneWay = true; warp.reciprocalWarpId = null;
  warp.toMap = c.maps.maps.find((map) => map.gameId !== source.gameId).id;
});
rejects('reciprocal offsets contradict both directions', (c) => {
  const source = c.maps.maps[0], edge = source.connections[0];
  const target = c.maps.maps.find((map) => map.gameId === source.gameId && map.locationId === edge.to);
  edge.offset = [1, 0];
  target.connections.find((reverse) => reverse.to === source.locationId).offset = [-1, 0];
});
rejects('nested provenance -> source', (c) => { c.maps.maps[0].connections[0].provenance.sourceId = 'source:missing'; });
rejects('event -> arc', (c) => { c.events.events[0].arcId = 'arc:missing'; });
rejects('arc -> region', (c) => { c.arcs.arcs[0].regionId = 'region:missing'; });
rejects('runtime region', (c) => { c.runtime.regionId = 'region:missing'; });
rejects('runtime path', (c) => { c.runtime.path[0] = 'location:missing'; });
rejects('runtime coordinate key', (c) => { c.runtime.coordinates['location:missing'] = [0, 0]; });
rejects('runtime active game', (c) => { c.runtime.activeGameId = 'game:missing'; });
rejects('runtime Ash arc', (c) => { c.runtime.ashArcId = 'arc:missing'; });
rejects('per-collection duplicate', (c) => { c.locations.locations[1].id = c.locations.locations[0].id; });
rejects('global duplicate', (c) => { c.arcs.arcs[0].id = c.games.games[0].id; });
rejects('edge direction', (c) => { c.maps.maps[1].connections[0].direction = 'north'; });
rejects('edge offset', (c) => { c.maps.maps[1].connections[0].offset = [0, 1]; });
rejects('one-way edge reciprocal ambiguity', (c) => { c.maps.maps[0].connections[0].oneWay = true; });
rejects('one-way warp retains reciprocal id', (c) => { c.maps.maps[0].warps[0].oneWay = true; });
rejects('two-way warp lacks reciprocal id', (c) => { c.maps.maps[0].warps[0].reciprocalWarpId = null; });
rejects('reciprocal warp points wrong map', (c) => { c.maps.maps[1].warps[0].toMap = c.maps.maps[1].id; });

// Ordering belongs to the anime plane. Array order and revisits are not errors,
// and each arc may start its own event sequence at one.
const reordered = structuredClone(valid);
reordered.events.events.reverse();
reordered.events.events[0].locationId = reordered.events.events.at(-1).locationId;
validateCanonicalCorpus(reordered);
const nextArc = structuredClone(valid);
nextArc.arcs.arcs.push({ ...structuredClone(nextArc.arcs.arcs[0]), id: 'arc:ash:next', order: 2 });
nextArc.events.events.push({ ...structuredClone(nextArc.events.events[0]), id: 'story-event:ash:next', arcId: 'arc:ash:next' });
validateCanonicalCorpus(nextArc);

// Intentional same-version one-way entrances remain valid. Topology is directed:
// deleting a return must not delete the permitted outward campaign transition.
const oneWay = structuredClone(valid);
const source = oneWay.maps.maps.find((map) => map.gameId === oneWay.runtime.activeGameId && map.locationId === oneWay.runtime.path[0]);
const edge = source.connections[0], warp = source.warps[0];
const target = oneWay.maps.maps.find((map) => map.id === warp.toMap);
edge.oneWay = true;
target.connections = target.connections.filter((reverse) => reverse.to !== source.locationId);
target.warps = target.warps.filter((reverse) => reverse.id !== warp.reciprocalWarpId);
warp.oneWay = true; warp.reciprocalWarpId = null;
validateCanonicalCorpus(oneWay);
oneWay.runtime.path = oneWay.runtime.path.slice(0, 2).reverse();
oneWay.runtime.coordinates = Object.fromEntries(oneWay.runtime.path.map((id) => [id, oneWay.runtime.coordinates[id]]));
assert.throws(() => validateCanonicalCorpus(oneWay), /runtime.path transition/, 'one-way entrance cannot be traversed backwards');

console.log('canonical-world adversarial: 24 malformed cases rejected; arc-local ordering, shuffled records, anime revisits and explicit one-way travel accepted');
