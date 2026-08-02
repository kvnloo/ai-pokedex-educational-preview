#!/usr/bin/env node
/**
 * pokeapi-sync.mjs — Pull PokéAPI → content/canonical (+ derived dex-index).
 *
 * Usage:
 *   node tools/pokeapi-sync.mjs                  # full national dex
 *   node tools/pokeapi-sync.mjs --max 151         # gen 1 only
 *   node tools/pokeapi-sync.mjs --max 20 --force  # small smoke
 *
 * Writes:
 *   content/canonical/types.json
 *   content/canonical/species.jsonl
 *   content/derived/dex-index.json
 *   content/derived/type-chart.json
 *   content/manifests/SOURCE_PROVENANCE.json
 *   data/raw/pokeapi/**  (cache, gitignored)
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'data/raw/pokeapi');
const CANON = path.join(ROOT, 'content/canonical');
const DERIVED = path.join(ROOT, 'content/derived');
const MANIFESTS = path.join(ROOT, 'content/manifests');
const BASE = 'https://pokeapi.co/api/v2';

const args = process.argv.slice(2);
const maxArg = args.includes('--max') ? Number(args[args.indexOf('--max') + 1]) : Infinity;
const force = args.includes('--force');
const smoke = Number.isFinite(maxArg); // partial run — never clobber full pack
const concurrency = 6;
const OUT_CANON = smoke ? path.join(ROOT, 'content/smoke/canonical') : CANON;
const OUT_DERIVED = smoke ? path.join(ROOT, 'content/smoke/derived') : DERIVED;
const OUT_MANIFESTS = smoke ? path.join(ROOT, 'content/smoke/manifests') : MANIFESTS;

const TYPE_COLORS = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC', stellar: '#40B5A8', unknown: '#68A090',
};

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, cacheRel, tries = 6) {
  const cachePath = path.join(RAW, cacheRel);
  await mkdir(path.dirname(cachePath), { recursive: true });
  if (!force && await exists(cachePath)) {
    return JSON.parse(await readFile(cachePath, 'utf8'));
  }
  let lastErr;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'twilight-route-pokeapi-sync/0.1' } });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`${res.status} ${url}`);
        await sleep(Math.min(8000, 250 * 2 ** attempt) + Math.random() * 200);
        continue;
      }
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      const data = await res.json();
      await writeFile(cachePath, JSON.stringify(data));
      return data;
    } catch (err) {
      lastErr = err;
      if (attempt === tries) break;
      await sleep(Math.min(8000, 250 * 2 ** attempt));
    }
  }
  throw lastErr;
}

function enName(names, fallback) {
  const hit = (names || []).find((n) => n.language?.name === 'en');
  return hit?.name ?? fallback;
}

function enFlavor(entries) {
  const en = (entries || []).filter((e) => e.language?.name === 'en');
  if (!en.length) return '';
  return en[en.length - 1].flavor_text.replace(/\f|\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
}

function genNum(urlOrName) {
  const s = String(urlOrName);
  const m = s.match(/generation\/(\d+)/) || s.match(/generation-(\d+)/i) || s.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

async function main() {
  await mkdir(OUT_CANON, { recursive: true });
  await mkdir(OUT_DERIVED, { recursive: true });
  await mkdir(OUT_MANIFESTS, { recursive: true });
  await mkdir(RAW, { recursive: true });

  if (smoke) console.log(`[sync] SMOKE mode --max ${maxArg} → content/smoke/ (canonical untouched)`);

  const syncedAt = new Date().toISOString();
  console.log('[sync] types…');
  const typeList = await fetchJson(`${BASE}/type?limit=100`, 'type/_list.json');
  const types = [];
  const chart = {};

  for (const t of typeList.results) {
    if (t.name === 'unknown' || t.name === 'shadow') continue;
    const detail = await fetchJson(t.url, `type/${t.name}.json`);
    const damageTo = {};
    for (const x of detail.damage_relations.double_damage_to) damageTo[x.name] = 2;
    for (const x of detail.damage_relations.half_damage_to) damageTo[x.name] = 0.5;
    for (const x of detail.damage_relations.no_damage_to) damageTo[x.name] = 0;
    // fill 1.0 for others later
    const row = {
      typeId: detail.id,
      slug: detail.name,
      name: enName(detail.names, detail.name),
      color: TYPE_COLORS[detail.name] ?? '#888888',
      damageTo,
    };
    types.push(row);
    chart[detail.name] = damageTo;
  }

  // complete chart with 1.0 defaults
  const slugs = types.map((t) => t.slug);
  for (const atk of slugs) {
    for (const def of slugs) {
      if (chart[atk][def] === undefined) chart[atk][def] = 1;
    }
    // also write onto types[].damageTo fully
    const t = types.find((x) => x.slug === atk);
    for (const def of slugs) {
      if (t.damageTo[def] === undefined) t.damageTo[def] = 1;
    }
  }

  await writeFile(path.join(OUT_CANON, 'types.json'), JSON.stringify({ version: 1, types }, null, 2));
  await writeFile(path.join(OUT_DERIVED, 'type-chart.json'), JSON.stringify({ version: 1, matrix: chart }, null, 2));

  console.log('[sync] species list…');
  const speciesList = await fetchJson(`${BASE}/pokemon-species?limit=2000`, 'species/_list.json');
  const targets = speciesList.results.slice(0, Number.isFinite(maxArg) ? maxArg : undefined);
  console.log(`[sync] fetching ${targets.length} / ${speciesList.count} species (concurrency=${concurrency})…`);

  const speciesRows = await mapPool(targets, concurrency, async (entry) => {
    const sp = await fetchJson(entry.url, `species/${entry.name}.json`);
    // default variety pokemon
    const defaultVar = sp.varieties.find((v) => v.is_default) ?? sp.varieties[0];
    const pokeUrl = defaultVar.pokemon.url;
    const pokeId = pokeUrl.split('/').filter(Boolean).pop();
    const pk = await fetchJson(pokeUrl, `pokemon/${pokeId}.json`);

    const stats = Object.fromEntries(pk.stats.map((s) => [s.stat.name, s.base_stat]));
    const baseStats = {
      hp: stats.hp,
      atk: stats.attack,
      def: stats.defense,
      spa: stats['special-attack'],
      spd: stats['special-defense'],
      spe: stats.speed,
    };

    return {
      nationalId: sp.id,
      slug: sp.name,
      name: enName(sp.names, sp.name),
      types: pk.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
      baseStats,
      captureRate: sp.capture_rate,
      baseHappiness: sp.base_happiness,
      growthRate: sp.growth_rate?.name ?? 'medium',
      genderRate: sp.gender_rate,
      generation: genNum(sp.generation?.url ?? sp.generation?.name),
      eggGroups: (sp.egg_groups || []).map((g) => g.name),
      abilities: pk.abilities.map((a) => ({
        slug: a.ability.name,
        slot: a.slot,
        isHidden: a.is_hidden,
      })),
      color: sp.color?.name ?? 'unknown',
      shape: sp.shape?.name ?? 'unknown',
      habitat: sp.habitat?.name ?? null,
      heightM: pk.height / 10,
      weightKg: pk.weight / 10,
      baseExperience: pk.base_experience,
      isBaby: sp.is_baby,
      isLegendary: sp.is_legendary,
      isMythical: sp.is_mythical,
      evolvesFromId: sp.evolves_from_species
        ? Number(sp.evolves_from_species.url.split('/').filter(Boolean).pop())
        : null,
      flavor: enFlavor(sp.flavor_text_entries),
      genus: enName(sp.genera, ''),
      source: {
        system: 'pokeapi',
        syncedAt,
        pokemonUrl: pokeUrl,
        speciesUrl: entry.url,
      },
    };
  });

  speciesRows.sort((a, b) => a.nationalId - b.nationalId);
  const jsonl = speciesRows.map((r) => JSON.stringify(r)).join('\n') + '\n';
  await writeFile(path.join(OUT_CANON, 'species.jsonl'), jsonl);

  const index = {
    version: '0.1.0',
    count: speciesRows.length,
    generatedAt: syncedAt,
    entries: speciesRows.map((s) => ({
      nationalId: s.nationalId,
      slug: s.slug,
      name: s.name,
      types: s.types,
      generation: s.generation,
      color: s.color,
      isLegendary: s.isLegendary,
      isMythical: s.isMythical,
      shape: s.shape,
      hasMesh: false,
    })),
  };
  await writeFile(path.join(OUT_DERIVED, 'dex-index.json'), JSON.stringify(index));

  // gen shards for progressive load
  const byGen = new Map();
  for (const s of speciesRows) {
    const g = s.generation || 0;
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g).push(s);
  }
  const shardDir = path.join(OUT_DERIVED, 'shards');
  await mkdir(shardDir, { recursive: true });
  for (const [g, rows] of byGen) {
    const name = `species-gen-${String(g).padStart(2, '0')}.json`;
    await writeFile(path.join(shardDir, name), JSON.stringify({ generation: g, species: rows }));
  }

  await writeFile(
    path.join(OUT_MANIFESTS, 'SOURCE_PROVENANCE.json'),
    JSON.stringify(
      {
        tool: 'tools/pokeapi-sync.mjs',
        base: BASE,
        syncedAt,
        speciesCount: speciesRows.length,
        speciesTotalAvailable: speciesList.count,
        typesCount: types.length,
        maxArg: Number.isFinite(maxArg) ? maxArg : null,
        smoke,
      },
      null,
      2,
    ),
  );
  await writeFile(path.join(OUT_MANIFESTS, 'CONTENT_VERSION'), '0.1.0\n');

  console.log(`[sync] done: ${speciesRows.length} species, ${types.length} types`);
  console.log(`  ${path.join(OUT_CANON, 'species.jsonl')}`);
  console.log(`  ${path.join(OUT_DERIVED, 'dex-index.json')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
