import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assertCanonicalPrivateSave } from '../src/campaign/campaign.ts';

const pack = JSON.parse(fs.readFileSync(new URL('../content/game/kanto-private.json', import.meta.url), 'utf8'));
const forbidden = ['emberpup','dustbun','dewkin','leafit','leafkit','sparkmoth','ironwisp','gloomhorn','mossprite','rivlet'];
const encoded = JSON.stringify(pack).toLowerCase();
for (const id of forbidden) assert.equal(encoded.includes(id), false, `private pack leaked stand-in ${id}`);
assert.deepEqual(pack.route.starterChoices, ['bulbasaur', 'charmander', 'squirtle']);
assert.deepEqual(pack.species.slice(0, 3).map((species) => species.speciesId), [1, 4, 7]);
assert.deepEqual(pack.species.slice(0, 3).map((species) => species.name), ['Bulbasaur', 'Charmander', 'Squirtle']);
assert.equal(pack.route.wildEncounters[0].species, 'pidgey');
assert.equal(pack.route.gym.species, 'geodude');
const speciesIds = new Set(pack.species.map((species) => species.id));
const moveIds = new Set(pack.moves.map((move) => move.id));
for (const species of pack.species) {
  assert.ok(Number.isInteger(species.speciesId) && species.speciesId > 0, `${species.id} stable national ID`);
  for (const move of species.moves) assert.ok(moveIds.has(move), `${species.id} references missing move ${move}`);
}
for (const id of [...pack.route.starterChoices, ...pack.route.wildEncounters.map((row) => row.species), pack.route.gym.species]) {
  assert.ok(speciesIds.has(id), `route references missing canonical species ${id}`);
}
const allowed = new Set(pack.species.map((species) => species.id));
assert.throws(
  () => assertCanonicalPrivateSave({ starterSpeciesId: 'emberpup', partySpeciesIds: ['dustbun'] }, allowed),
  /invalidated/,
);
assert.doesNotThrow(() => assertCanonicalPrivateSave({ starterSpeciesId: 'bulbasaur', partySpeciesIds: ['bulbasaur', 'pidgey'] }, allowed));

const loader = fs.readFileSync(new URL('../src/creatures/privateCanonical.ts', import.meta.url), 'utf8');
assert.match(loader, /stand-in fallback forbidden/g);
assert.doesNotMatch(loader, /buildGeneric|SPECIES_BUILDERS|MESH_ALIAS/);
console.log('private canonical identity golden: PASS');
