# Canonical Wave-0 game pack

`content/game/wave0.json` is a generated, runtime-sized Galar slice. Do not hand-edit it.

## Sources

- **Species:** `content/canonical/species.jsonl` (the committed 1,025-row PokéAPI warehouse)
- **Types:** `content/canonical/types.json`
- **Type chart:** `content/derived/type-chart.json`
- **Moves and selected-species learnset membership:** `tools/data/pokeapi-wave0-moves.json`
- **Authored slice configuration:** `tools/build-game-pack.mjs`

The committed move cache is deliberately small. It records PokéAPI move IDs, canonical English
names, types, damage classes, power, accuracy, PP, priority, effect chances, targets, effect
descriptions, source URLs, and which selected Pokémon expose each move from their PokéAPI
`/pokemon/{id}/` response. Descriptions come directly from the English
`effect_entries.short_effect`; the only normalization is whitespace collapsing and expansion of an
`$effect_chance` placeholder when an API response contains one.
This makes ordinary pack generation deterministic and offline while keeping a reproducible network
refresh path.

## Selected roster

| Role | National Pokédex IDs |
|---|---|
| Starters | Grookey #810, Scorbunny #813, Sobble #816 |
| Early/mid route | Skwovet #819, Rookidee #821, Blipbug #824, Gossifleur #829, Wooloo #831, Chewtle #833, Yamper #835 |
| Gym | Eldegoss #830 (Turffield Gym) |
| Late-slice gate | Corviknight #823 |

The output copies canonical names, IDs, types, base stats, capture rates, base experience, flavor,
and per-species PokéAPI provenance. Runtime aliases (`id`, `speciesId`, `moves`, `catchRate`, and
`baseExp`) remain present so the existing battle loader can consume the pack without a schema
migration.

## Generate and check

```bash
# Regenerate from committed canonical data and the committed move cache.
node tools/build-game-pack.mjs

# Validate source joins, route references, move learnset membership, chart completeness,
# legacy-species removal, and byte-for-byte deterministic output.
node tools/build-game-pack.mjs --check
```

`--check` does not access the network. A clean run reports the selected species, move, and type
counts and fails if `wave0.json` differs by even one byte from a fresh build.

## Refresh move data

Only refresh when intentionally accepting current PokéAPI move data:

```bash
node tools/build-game-pack.mjs --refresh-moves
node tools/build-game-pack.mjs --check
```

The refresh reads each configured `/move/{slug}/` endpoint and each selected
`/pokemon/{nationalId}/` endpoint, rewrites the focused cache with a new `fetchedAt`, validates that
every assigned Pokémon/move join exists, and regenerates the pack. Review both the cache and
`wave0.json` before committing.

## Battle-effect compatibility

PokéAPI move facts stay canonical. The current battle runtime represents stat changes with one
compact string such as `lower-atk-1`; the generator adds that existing runtime field only for moves
whose canonical behavior supports it. Where a real move has multiple effects, the current schema
can encode one supported component—for example, `Tearful Look` retains `lower-spa-1`, while its
PokéAPI description still records that it lowers both Attack and Special Attack. Unsupported
secondary mechanics (burn, flinch, multi-hit, trapping, accuracy stages, and similar effects) remain
in canonical descriptions and are not falsely simulated by the current battle engine.
