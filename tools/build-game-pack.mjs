#!/usr/bin/env node
/**
 * Build the canonical Wave-0 game slice from the committed PokéAPI warehouse.
 *
 * Usage:
 *   node tools/build-game-pack.mjs                 # regenerate wave0.json
 *   node tools/build-game-pack.mjs --check         # validate + fail on drift
 *   node tools/build-game-pack.mjs --refresh-moves # refresh the small API cache, then build
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANONICAL_SPECIES_PATH = path.join(ROOT, 'content/canonical/species.jsonl');
const CANONICAL_TYPES_PATH = path.join(ROOT, 'content/canonical/types.json');
const TYPE_CHART_PATH = path.join(ROOT, 'content/derived/type-chart.json');
const MOVE_CACHE_PATH = path.join(ROOT, 'tools/data/pokeapi-wave0-moves.json');
const OUTPUT_PATH = path.join(ROOT, 'content/game/wave0.json');
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const EXPECTED_CANONICAL_SPECIES = 1025;

const SPECIES_PLAN = Object.freeze([
  {
    nationalId: 813,
    slug: 'scorbunny',
    role: 'starter',
    moves: ['tackle', 'growl', 'ember', 'quick-attack'],
  },
  {
    nationalId: 816,
    slug: 'sobble',
    role: 'starter',
    moves: ['pound', 'growl', 'water-gun', 'tearful-look'],
  },
  {
    nationalId: 810,
    slug: 'grookey',
    role: 'starter',
    moves: ['scratch', 'growl', 'branch-poke', 'razor-leaf'],
  },
  {
    nationalId: 831,
    slug: 'wooloo',
    role: 'wild',
    moves: ['tackle', 'growl', 'defense-curl', 'headbutt'],
  },
  {
    nationalId: 819,
    slug: 'skwovet',
    role: 'wild',
    moves: ['tackle', 'tail-whip', 'bite', 'bullet-seed'],
  },
  {
    nationalId: 821,
    slug: 'rookidee',
    role: 'wild',
    moves: ['peck', 'leer', 'power-trip', 'hone-claws'],
  },
  {
    nationalId: 824,
    slug: 'blipbug',
    role: 'wild',
    moves: ['struggle-bug', 'infestation'],
  },
  {
    nationalId: 835,
    slug: 'yamper',
    role: 'wild',
    moves: ['nuzzle', 'tackle', 'charge', 'spark'],
  },
  {
    nationalId: 829,
    slug: 'gossifleur',
    role: 'wild',
    moves: ['leafage', 'rapid-spin', 'razor-leaf', 'round'],
  },
  {
    nationalId: 833,
    slug: 'chewtle',
    role: 'wild',
    moves: ['tackle', 'water-gun', 'bite', 'water-pulse'],
  },
  {
    nationalId: 830,
    slug: 'eldegoss',
    role: 'gym',
    moves: ['leafage', 'rapid-spin', 'razor-leaf', 'round'],
  },
  {
    nationalId: 823,
    slug: 'corviknight',
    role: 'elite',
    moves: ['peck', 'power-trip', 'steel-wing', 'iron-defense'],
  },
]);

const ROUTE = Object.freeze({
  id: 'galar-route-1',
  name: 'Galar Route 1',
  description: 'A compact game slice inspired by the opening routes of the Galar Pokédex.',
  starterChoices: ['scorbunny', 'sobble', 'grookey'],
  wildEncounters: [
    { species: 'wooloo', minLevel: 3, maxLevel: 5, weight: 30, band: 'early' },
    { species: 'skwovet', minLevel: 3, maxLevel: 5, weight: 25, band: 'early' },
    { species: 'rookidee', minLevel: 3, maxLevel: 5, weight: 20, band: 'early' },
    { species: 'blipbug', minLevel: 3, maxLevel: 5, weight: 15, band: 'early' },
    { species: 'yamper', minLevel: 4, maxLevel: 6, weight: 10, band: 'early' },
    { species: 'gossifleur', minLevel: 5, maxLevel: 7, weight: 20, band: 'mid' },
    { species: 'chewtle', minLevel: 5, maxLevel: 7, weight: 18, band: 'mid' },
    { species: 'yamper', minLevel: 6, maxLevel: 8, weight: 12, band: 'mid' },
    { species: 'rookidee', minLevel: 7, maxLevel: 9, weight: 10, band: 'late' },
    { species: 'wooloo', minLevel: 8, maxLevel: 10, weight: 8, band: 'late' },
  ],
  playerDefaultLevel: 5,
  gym: {
    id: 'turffield-gym',
    name: 'Turffield Gym',
    leaderName: 'Milo',
    species: 'eldegoss',
    level: 9,
    description: 'A compressed first-gym battle against Milo’s Grass-type ace.',
  },
  elite: {
    id: 'galar-league-gate',
    name: 'Galar League Gate',
    trainerName: 'League Challenger',
    species: 'corviknight',
    level: 12,
    description: 'A late-slice challenge featuring Galar’s fully evolved Flying/Steel sentinel.',
  },
});

const RUNTIME_EFFECTS = Object.freeze({
  growl: 'lower-atk-1',
  'defense-curl': 'raise-def-1',
  'tail-whip': 'lower-def-1',
  leer: 'lower-def-1',
  'hone-claws': 'raise-atk-1',
  'tearful-look': 'lower-spa-1',
  charge: 'raise-spd-1',
  'iron-defense': 'raise-def-2',
});

const TARGET_MAP = Object.freeze({
  'selected-pokemon': 'selected-foe',
  'all-opponents': 'all-foes',
  user: 'self',
});

const LEGACY_INVENTED_SLUGS = new Set([
  'emberpup',
  'dewkin',
  'leafkit',
  'dustbun',
  'sparkmoth',
  'ironwisp',
  'gloomhorn',
  'mossprite',
  'rivlet',
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizedText(value) {
  return String(value ?? '')
    .replace(/\f|\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function englishName(entries, fallback) {
  return entries.find((entry) => entry.language?.name === 'en')?.name ?? fallback;
}

function englishEffect(move) {
  const entry = move.effect_entries.find((item) => item.language?.name === 'en');
  return normalizedText(entry?.short_effect).replace(
    /\$effect_chance/g,
    String(move.effect_chance ?? ''),
  );
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function readCanonicalSpecies() {
  const source = await readFile(CANONICAL_SPECIES_PATH, 'utf8');
  const rows = source
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`invalid JSON on species.jsonl line ${index + 1}: ${error.message}`);
      }
    });

  invariant(
    rows.length === EXPECTED_CANONICAL_SPECIES,
    `expected ${EXPECTED_CANONICAL_SPECIES} canonical species, found ${rows.length}`,
  );
  const byId = new Map();
  const bySlug = new Map();
  for (const row of rows) {
    invariant(!byId.has(row.nationalId), `duplicate nationalId ${row.nationalId}`);
    invariant(!bySlug.has(row.slug), `duplicate canonical slug ${row.slug}`);
    byId.set(row.nationalId, row);
    bySlug.set(row.slug, row);
  }
  return { rows, byId, bySlug };
}

function requiredMoveSlugs() {
  return [...new Set(SPECIES_PLAN.flatMap((entry) => entry.moves))];
}

async function fetchJson(url, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'pokemon-game-pack-builder/1.0' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** (attempt - 1)));
      }
    }
  }
  throw new Error(`failed to fetch ${url}: ${lastError?.message ?? lastError}`);
}

async function refreshMoveCache() {
  const moveSlugs = requiredMoveSlugs();
  const [movePayloads, pokemonPayloads] = await Promise.all([
    Promise.all(moveSlugs.map((slug) => fetchJson(`${POKEAPI_BASE}/move/${slug}/`))),
    Promise.all(
      SPECIES_PLAN.map((entry) => fetchJson(`${POKEAPI_BASE}/pokemon/${entry.nationalId}/`)),
    ),
  ]);

  const learnedMovesBySpecies = new Map(
    pokemonPayloads.map((pokemon) => [
      pokemon.name,
      new Set(pokemon.moves.map((entry) => entry.move.name)),
    ]),
  );

  const moves = movePayloads
    .map((move) => ({
      moveId: move.id,
      slug: move.name,
      name: englishName(move.names, move.name),
      type: move.type.name,
      category: move.damage_class.name,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      priority: move.priority,
      effectChance: move.effect_chance,
      rawTarget: move.target.name,
      description: englishEffect(move),
      learnedBy: SPECIES_PLAN.filter((entry) =>
        learnedMovesBySpecies.get(entry.slug)?.has(move.name),
      ).map((entry) => entry.slug),
      sourceUrl: `${POKEAPI_BASE}/move/${move.id}/`,
    }))
    .sort((a, b) => a.moveId - b.moveId);

  const cache = {
    version: 1,
    source: {
      system: 'pokeapi',
      baseUrl: POKEAPI_BASE,
      fetchedAt: new Date().toISOString(),
      descriptionField: 'effect_entries[language=en].short_effect',
      descriptionNormalization: 'collapse whitespace; expand $effect_chance when present',
      pokemonEndpoints: SPECIES_PLAN.map(
        (entry) => `${POKEAPI_BASE}/pokemon/${entry.nationalId}/`,
      ),
    },
    moves,
  };

  validateMoveCache(cache);
  await mkdir(path.dirname(MOVE_CACHE_PATH), { recursive: true });
  await writeFile(MOVE_CACHE_PATH, json(cache));
  console.log(`[game-pack] refreshed ${moves.length} moves → ${path.relative(ROOT, MOVE_CACHE_PATH)}`);
  return cache;
}

function validateMoveCache(cache) {
  invariant(cache?.version === 1, 'move cache version must be 1');
  invariant(cache?.source?.system === 'pokeapi', 'move cache source must be pokeapi');
  invariant(cache?.source?.baseUrl === POKEAPI_BASE, 'move cache PokéAPI base URL mismatch');
  invariant(
    cache?.source?.descriptionField === 'effect_entries[language=en].short_effect',
    'move cache description source mismatch',
  );
  invariant(
    cache?.source?.descriptionNormalization ===
      'collapse whitespace; expand $effect_chance when present',
    'move cache description normalization mismatch',
  );
  invariant(Array.isArray(cache?.moves), 'move cache moves must be an array');

  const required = requiredMoveSlugs();
  const requiredSet = new Set(required);
  const bySlug = new Map();
  const byId = new Map();
  for (const move of cache.moves) {
    invariant(requiredSet.has(move.slug), `unexpected move in focused cache: ${move.slug}`);
    invariant(!bySlug.has(move.slug), `duplicate cached move slug ${move.slug}`);
    invariant(!byId.has(move.moveId), `duplicate cached move id ${move.moveId}`);
    invariant(Number.isInteger(move.moveId) && move.moveId > 0, `invalid moveId for ${move.slug}`);
    invariant(typeof move.name === 'string' && move.name.length > 0, `missing name for ${move.slug}`);
    invariant(['physical', 'special', 'status'].includes(move.category), `bad category for ${move.slug}`);
    invariant(Number.isInteger(move.pp) && move.pp > 0, `bad PP for ${move.slug}`);
    invariant(Number.isInteger(move.priority), `bad priority for ${move.slug}`);
    invariant(
      move.effectChance === null ||
        (Number.isInteger(move.effectChance) && move.effectChance >= 0 && move.effectChance <= 100),
      `bad effect chance for ${move.slug}`,
    );
    invariant(Object.hasOwn(TARGET_MAP, move.rawTarget), `unsupported target ${move.rawTarget}`);
    invariant(
      typeof move.description === 'string' && move.description.length > 0,
      `missing effect description for ${move.slug}`,
    );
    invariant(Array.isArray(move.learnedBy), `missing learnedBy for ${move.slug}`);
    invariant(
      move.sourceUrl === `${POKEAPI_BASE}/move/${move.moveId}/`,
      `bad source URL for ${move.slug}`,
    );
    bySlug.set(move.slug, move);
    byId.set(move.moveId, move);
  }

  invariant(bySlug.size === required.length, `expected ${required.length} moves, found ${bySlug.size}`);
  for (const slug of required) invariant(bySlug.has(slug), `move cache missing ${slug}`);
  for (const species of SPECIES_PLAN) {
    for (const moveSlug of species.moves) {
      invariant(
        bySlug.get(moveSlug).learnedBy.includes(species.slug),
        `${species.slug} is not listed as learning ${moveSlug} by PokéAPI`,
      );
    }
  }
  return bySlug;
}

function runtimeMove(cached) {
  const move = {
    moveId: cached.moveId,
    slug: cached.slug,
    name: cached.name,
    type: cached.type,
    category: cached.category,
    power: cached.power,
    accuracy: cached.accuracy,
    pp: cached.pp,
    priority: cached.priority,
    target: TARGET_MAP[cached.rawTarget],
    description: cached.description,
    id: cached.slug,
  };
  if (RUNTIME_EFFECTS[cached.slug]) move.effect = RUNTIME_EFFECTS[cached.slug];
  return move;
}

function runtimeSpecies(canonical, plan) {
  return {
    speciesId: canonical.nationalId,
    nationalId: canonical.nationalId,
    slug: canonical.slug,
    name: canonical.name,
    types: canonical.types,
    baseStats: canonical.baseStats,
    learnset: [...plan.moves],
    role: plan.role,
    flavor: canonical.flavor,
    source: canonical.source,
    id: canonical.slug,
    moves: [...plan.moves],
    catchRate: canonical.captureRate,
    captureRate: canonical.captureRate,
    baseExp: canonical.baseExperience,
    baseExperience: canonical.baseExperience,
  };
}

function selectTypeChart(typeRows, fullChart, species, moves) {
  const usedTypes = new Set([
    ...species.flatMap((entry) => entry.types),
    ...moves.map((move) => move.type),
  ]);
  const types = typeRows.map((entry) => entry.slug).filter((slug) => usedTypes.has(slug));
  invariant(types.length === usedTypes.size, 'a used type is absent from canonical types.json');

  const typeChart = {};
  for (const attacking of types) {
    invariant(fullChart[attacking], `type chart missing row ${attacking}`);
    typeChart[attacking] = {};
    for (const defending of types) {
      const multiplier = fullChart[attacking][defending];
      invariant(typeof multiplier === 'number', `type chart missing ${attacking} → ${defending}`);
      typeChart[attacking][defending] = multiplier;
    }
  }
  return { types, typeChart };
}

function validatePack(pack, canonical, moveCache, moveBySlug) {
  invariant(pack.version === '1.0.0', 'wave0 version must be 1.0.0');
  invariant(pack.wave === 0, 'wave must remain 0');
  invariant(pack.identity?.region === 'Galar', 'game pack region must be Galar');
  invariant(pack.species.length === SPECIES_PLAN.length, 'species slice size drifted');
  invariant(pack.moves.length === moveBySlug.size, 'runtime move slice size drifted');

  const speciesBySlug = new Map(pack.species.map((entry) => [entry.slug, entry]));
  invariant(speciesBySlug.size === pack.species.length, 'duplicate runtime species slug');
  for (let index = 0; index < SPECIES_PLAN.length; index += 1) {
    const plan = SPECIES_PLAN[index];
    const output = pack.species[index];
    const source = canonical.byId.get(plan.nationalId);
    invariant(source, `canonical species #${plan.nationalId} is missing`);
    invariant(source.slug === plan.slug, `#${plan.nationalId} expected ${plan.slug}, got ${source.slug}`);
    invariant(output.slug === source.slug && output.name === source.name, `canonical identity drift for ${plan.slug}`);
    invariant(output.speciesId === source.nationalId, `runtime speciesId drift for ${plan.slug}`);
    invariant(output.nationalId === source.nationalId, `nationalId drift for ${plan.slug}`);
    invariant(JSON.stringify(output.types) === JSON.stringify(source.types), `type drift for ${plan.slug}`);
    invariant(JSON.stringify(output.baseStats) === JSON.stringify(source.baseStats), `stat drift for ${plan.slug}`);
    invariant(output.catchRate === source.captureRate, `catch rate drift for ${plan.slug}`);
    invariant(output.captureRate === source.captureRate, `capture rate drift for ${plan.slug}`);
    invariant(output.baseExp === source.baseExperience, `base EXP drift for ${plan.slug}`);
    invariant(output.baseExperience === source.baseExperience, `base experience drift for ${plan.slug}`);
    invariant(output.flavor === source.flavor, `flavor drift for ${plan.slug}`);
    invariant(JSON.stringify(output.source) === JSON.stringify(source.source), `source drift for ${plan.slug}`);
    invariant(JSON.stringify(output.moves) === JSON.stringify(plan.moves), `move plan drift for ${plan.slug}`);
    invariant(JSON.stringify(output.learnset) === JSON.stringify(plan.moves), `learnset alias drift for ${plan.slug}`);
    invariant(output.role === plan.role, `role drift for ${plan.slug}`);
    invariant(!LEGACY_INVENTED_SLUGS.has(output.slug), `legacy invented species survived: ${output.slug}`);
    for (const moveSlug of output.moves) {
      invariant(moveBySlug.has(moveSlug), `${plan.slug} references missing move ${moveSlug}`);
    }
  }

  const runtimeMoveBySlug = new Map(pack.moves.map((entry) => [entry.slug, entry]));
  invariant(runtimeMoveBySlug.size === pack.moves.length, 'duplicate runtime move slug');
  for (const cached of moveCache.moves) {
    const output = runtimeMoveBySlug.get(cached.slug);
    invariant(output, `runtime pack missing cached move ${cached.slug}`);
    invariant(output.moveId === cached.moveId, `moveId drift for ${cached.slug}`);
    invariant(output.name === cached.name, `move name drift for ${cached.slug}`);
    invariant(output.type === cached.type, `move type drift for ${cached.slug}`);
    invariant(output.category === cached.category, `move category drift for ${cached.slug}`);
    invariant(output.power === cached.power, `move power drift for ${cached.slug}`);
    invariant(output.accuracy === cached.accuracy, `move accuracy drift for ${cached.slug}`);
    invariant(output.pp === cached.pp, `move PP drift for ${cached.slug}`);
    invariant(output.priority === cached.priority, `move priority drift for ${cached.slug}`);
  }

  invariant(
    JSON.stringify(pack.route.starterChoices) === JSON.stringify(ROUTE.starterChoices),
    'starter choices drifted',
  );
  for (const starter of pack.route.starterChoices) {
    invariant(speciesBySlug.get(starter)?.role === 'starter', `${starter} is not a starter`);
  }
  const wildRoles = new Set(pack.species.filter((entry) => entry.role === 'wild').map((entry) => entry.slug));
  const encounteredWilds = new Set(pack.route.wildEncounters.map((entry) => entry.species));
  invariant(
    wildRoles.size === encounteredWilds.size && [...wildRoles].every((slug) => encounteredWilds.has(slug)),
    'wild encounter table and wild roles differ',
  );
  invariant(speciesBySlug.get(pack.route.gym.species)?.role === 'gym', 'gym species role mismatch');
  invariant(speciesBySlug.get(pack.route.elite.species)?.role === 'elite', 'elite species role mismatch');
  invariant(pack.route.gym.level <= pack.route.playerDefaultLevel + 4, 'gym level exceeds demo gate');
  invariant(
    pack.route.elite.level > pack.route.gym.level &&
      pack.route.elite.level <= pack.route.playerDefaultLevel + 7,
    'elite level is outside the deterministic demo gate',
  );

  const referencedMoves = new Set(pack.species.flatMap((entry) => entry.moves));
  invariant(
    referencedMoves.size === pack.moves.length && pack.moves.every((move) => referencedMoves.has(move.slug)),
    'runtime move slice contains an unreferenced move',
  );
  for (const attacking of pack.types) {
    invariant(pack.typeChart[attacking], `runtime type chart missing ${attacking}`);
    for (const defending of pack.types) {
      invariant(
        typeof pack.typeChart[attacking][defending] === 'number',
        `runtime type chart missing ${attacking} → ${defending}`,
      );
    }
  }
}

async function buildPack(moveCache) {
  const canonical = await readCanonicalSpecies();
  const canonicalTypes = await readJson(CANONICAL_TYPES_PATH);
  const derivedTypeChart = await readJson(TYPE_CHART_PATH);
  const moveBySlug = validateMoveCache(moveCache);

  const species = SPECIES_PLAN.map((plan) => {
    const source = canonical.byId.get(plan.nationalId);
    invariant(source, `canonical species #${plan.nationalId} is missing`);
    invariant(source.slug === plan.slug, `#${plan.nationalId} expected ${plan.slug}, got ${source.slug}`);
    return runtimeSpecies(source, plan);
  });
  const moves = moveCache.moves.map(runtimeMove);
  const { types, typeChart } = selectTypeChart(
    canonicalTypes.types,
    derivedTypeChart.matrix,
    species,
    moves,
  );
  const syncedAtValues = [...new Set(species.map((entry) => entry.source.syncedAt))];
  invariant(syncedAtValues.length === 1, 'selected canonical species have mixed sync timestamps');

  const pack = {
    version: '1.0.0',
    wave: 0,
    title: 'Galar Route — Wave 0',
    identity: {
      region: 'Galar',
      startLocation: ROUTE.id,
      notes: 'Canonical Pokémon species and battle data sourced from PokéAPI; route placement is authored for this game slice.',
    },
    provenance: {
      generator: 'tools/build-game-pack.mjs',
      species: {
        system: 'pokeapi',
        source: 'content/canonical/species.jsonl',
        canonicalSpeciesCount: canonical.rows.length,
        syncedAt: syncedAtValues[0],
      },
      moves: {
        system: 'pokeapi',
        cache: 'tools/data/pokeapi-wave0-moves.json',
        fetchedAt: moveCache.source.fetchedAt,
        baseUrl: moveCache.source.baseUrl,
      },
      typeChart: {
        system: 'pokeapi',
        source: 'content/derived/type-chart.json',
      },
    },
    types,
    typeChart,
    moves,
    species,
    route: ROUTE,
  };
  validatePack(pack, canonical, moveCache, moveBySlug);
  return pack;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const knownArgs = new Set(['--check', '--refresh-moves']);
  for (const arg of args) invariant(knownArgs.has(arg), `unknown argument: ${arg}`);
  invariant(!(args.has('--check') && args.has('--refresh-moves')), '--check cannot refresh network data');

  const moveCache = args.has('--refresh-moves')
    ? await refreshMoveCache()
    : await readJson(MOVE_CACHE_PATH);
  const pack = await buildPack(moveCache);
  const rendered = json(pack);

  if (args.has('--check')) {
    const current = await readFile(OUTPUT_PATH, 'utf8');
    invariant(current === rendered, 'content/game/wave0.json is stale; run node tools/build-game-pack.mjs');
    console.log(
      `[game-pack] valid and deterministic: ${pack.species.length} species, ${pack.moves.length} moves, ${pack.types.length} types`,
    );
    return;
  }

  await writeFile(OUTPUT_PATH, rendered);
  console.log(
    `[game-pack] wrote ${path.relative(ROOT, OUTPUT_PATH)} (${pack.species.length} species, ${pack.moves.length} moves, ${pack.types.length} types)`,
  );
}

main().catch((error) => {
  console.error(`[game-pack] ${error.message ?? error}`);
  process.exitCode = 1;
});
