#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packPath = join(root, 'content/game/wave0.json');
const canonicalPath = join(root, 'content/canonical/species.jsonl');
const required = [810, 813, 816, 831];
const starters = ['scorbunny', 'sobble', 'grookey'];

const pack = JSON.parse(await readFile(packPath, 'utf8'));
const canonical = (await readFile(canonicalPath, 'utf8'))
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line));
const byNationalId = new Map(canonical.map((species) => [species.nationalId, species]));

for (const nationalId of required) {
  if (!byNationalId.has(nationalId)) throw new Error(`Missing PokéAPI species ${nationalId}`);
}

const moveDisplay = {
  'nudge': ['Tackle', 'A full-body tackle.'],
  'cinder-spark': ['Ember', 'Small flames strike the target.'],
  'tide-slap': ['Water Gun', 'Water is forcefully shot at the target.'],
  'leaf-dart': ['Branch Poke', 'The target is jabbed with a sharpened branch.'],
  'wool-rush': ['Headbutt', 'A strong head-first charge.'],
  'growl-down': ['Growl', "The user growls to lower the target's Attack."],
  'quick-gleam': ['Quick Attack', 'A high-speed attack that strikes first.'],
  'guard-curl': ['Defense Curl', 'The user curls up to raise its Defense.'],
  'tide-brace': ['Withdraw', 'The user withdraws to raise its Defense.'],
};
pack.moves = pack.moves
  .filter((move) => Object.hasOwn(moveDisplay, move.id))
  .map((move) => ({
    ...move,
    name: moveDisplay[move.id][0],
    description: moveDisplay[move.id][1],
  }));

const learnsets = {
  grookey: ['nudge', 'leaf-dart', 'growl-down', 'quick-gleam'],
  scorbunny: ['nudge', 'cinder-spark', 'growl-down', 'quick-gleam'],
  sobble: ['nudge', 'tide-slap', 'growl-down', 'tide-brace'],
  wooloo: ['nudge', 'wool-rush', 'growl-down', 'guard-curl'],
};

pack.species = required.map((nationalId) => {
  const source = byNationalId.get(nationalId);
  const moves = learnsets[source.slug];
  return {
    speciesId: source.nationalId,
    nationalId: source.nationalId,
    slug: source.slug,
    name: source.name,
    types: source.types,
    baseStats: source.baseStats,
    learnset: moves,
    role: starters.includes(source.slug) ? 'starter' : 'wild',
    color: source.color,
    flavor: source.flavor,
    id: source.slug,
    moves,
    catchRate: source.captureRate,
    baseExp: source.baseExperience,
    source: source.source,
  };
});

pack.identity = {
  region: 'Lumen',
  startLocation: 'twilight-lane',
  source: 'pokeapi',
  canonicalSpeciesCount: required.length,
  notes: 'Exact four-species vertical slice sourced from PokéAPI: Grookey, Scorbunny, Sobble, and Wooloo.',
  attribution: 'Data/image pointers: PokéAPI. Image content © The Pokémon Company.',
};
pack.route = {
  ...pack.route,
  starterChoices: starters,
  wildEncounters: [
    { species: 'wooloo', minLevel: 3, maxLevel: 5, weight: 40, band: 'early' },
    { species: 'wooloo', minLevel: 6, maxLevel: 8, weight: 18, band: 'mid' },
    { species: 'wooloo', minLevel: 8, maxLevel: 10, weight: 8, band: 'late' },
  ],
  gym: {
    ...pack.route.gym,
    name: 'Twilight Grove Trial',
    leaderName: 'Warden Brisa',
    species: 'grookey',
    level: 8,
    description: 'A focused Grass-type trial on Twilight Lane.',
  },
  elite: {
    ...pack.route.elite,
    name: 'Twilight Elite Gate',
    trainerName: 'Elite Mora',
    species: 'sobble',
    level: 11,
    description: 'A Water-type escalation beyond the route trial.',
  },
};

await writeFile(packPath, `${JSON.stringify(pack, null, 2)}\n`);
console.log(`wrote ${packPath}: ${pack.species.map((species) => `${species.name} #${species.nationalId}`).join(', ')}`);
