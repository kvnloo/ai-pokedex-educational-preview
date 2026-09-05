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

console.log('canonical-world adversarial: 18 malformed cases rejected; arc-local ordering, shuffled records and anime revisits accepted');
