# Canonical World Pipeline

## Product boundary

This is the full Pokémon adventure game. CardTwin remains a separate product.

The campaign should be assembled from a versioned world graph and an Ash-story chronology, not from disconnected handcrafted scenes. The first campaign slice is Ash's Kanto journey beginning in Pallet Town.

## Legal and provenance boundary

- Do not download, redistribute, commit, or ship commercial ROM files or extracted proprietary assets.
- Local ROM verification may run only against cartridge dumps Kevin owns and supplies. Store ROMs outside Git on the 4 TB drive; persist hashes and provenance, not bytes.
- Public reverse-engineering/decompilation repositories are useful structural references, but their missing/unclear license metadata does not authorize asset redistribution.
- PokeAPI is BSD-3-Clause and can supply reusable identifiers and factual game metadata, subject to field-level provenance review.
- Porymap is LGPL-3.0 and is a useful reference/tool for GBA map connections and warps.
- The private-local experience may use lawfully sourced canonical Pokémon artwork from the private data plane. Distributable/public artifacts must use original or separately licensed presentation assets.

No owned `.gb`, `.gbc`, or `.gba` dumps were found under `/mnt/zer0models` during the 2026-08-24 inventory, so ROM compilation is currently an optional private lane rather than a prerequisite for the canonical-data work.

## Two source planes

### Game topology

Normalize each game/version into:

- regions and subregions;
- world-map nodes;
- towns, cities, routes, landmarks, caves and dungeons;
- building/interior maps;
- directional map connections;
- warp/door/ladder/teleport edges;
- encounter tables and traversal gates;
- trainers, gyms, badges and story flags;
- source game, version, remake lineage and extraction provenance.

Candidate structural references:

- `pret/pokered`, `pret/pokeyellow`: Kanto Gen I
- `pret/pokegold`, `pret/pokecrystal`: Johto + Kanto Gen II
- `pret/pokefirered`: Kanto Gen III remake
- `pret/pokeruby`, `pret/pokeemerald`: Hoenn
- `pret/pokediamond`, `pret/pokeplatinum`: Sinnoh
- `pret/pokeheartgold`: Johto + Kanto Gen IV remake
- `huderlem/porymap`: GBA map/warp tooling
- `PokeAPI/pokeapi`: stable public identifiers and factual metadata

These are research inputs, not shippable asset libraries.

### Ash chronology

Normalize the anime into ordered arcs and events:

- series, season, arc and episode IDs;
- region and named location;
- origin/destination and travel order;
- companions present;
- Ash's active/reserve party;
- captures, releases, evolutions and returns;
- gyms, badges, leagues, rivals and major battles;
- anime-only locations and events;
- confidence and citations.

Top-level Ash region order:

1. Kanto / Indigo League
2. Orange Islands
3. Johto
4. Hoenn and Kanto Battle Frontier
5. Sinnoh
6. Unova and Decolore Islands
7. Kalos
8. Alola
9. Journeys across Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola and Galar
10. Aim to Be a Pokémon Master / final Ash arc

Community episode guides may inform factual chronology but must be cited and paraphrased; do not copy article text or images into the product.

## Join model

Use stable IDs, for example:

```text
region:kanto
location:kanto:pallet-town
map:yellow:pallet-town
map:firered:pallet-town
anime-location:kanto:pallet-town
arc:ash:kanto:indigo
story-event:ash:ep001:depart-pallet
```

A story event may reference zero or more game maps. Anime-only locations remain first-class and are never silently forced onto a game map. Remakes and versions stay separate views over shared canonical locations.

## Overall map generation

The authoritative overall map is a generated graph, not a ripped image:

- map nodes carry canonical location IDs and local bounds;
- connections carry north/south/east/west offsets;
- warps connect interiors and non-adjacent maps;
- a layout solver produces region coordinates;
- provenance and conflict reports explain every edge;
- profile-eligible presentation assets render the graph: private canonical assets locally, distributable assets for every public artifact.

## Initial milestone: Ash's Kanto spine

Produce a small but complete data slice:

1. Pallet Town
2. Route 1
3. Viridian City
4. Route 2 / Viridian Forest
5. Pewter City

For each location, include:

- Red/Blue, Yellow and FireRed/LeafGreen topology references;
- entrances, exits and building warps;
- Ash chronology events and companions;
- anime/game divergence notes;
- dual-profile asset assembly requirements;
- source citations and confidence.

The first browser implementation should consume this normalized slice without embedding ROM bytes or official-art bytes in Git; private official art must remain hash-bound outside Git.

## Required artifacts

- `canonical/sources.json`: source registry, license/provenance and hashes
- `canonical/games.json`: game/version registry
- `canonical/regions.json`: canonical regions
- `canonical/locations.json`: stable location entities
- `canonical/maps/*.json`: versioned map topology
- `canonical/ash/arcs.json`: ordered arc registry
- `canonical/ash/events/*.json`: episode/event chronology
- `canonical/conflicts.json`: unresolved source disagreements
- schema validation and deterministic graph tests

## Acceptance gates

- No proprietary ROM or extracted asset is tracked by Git.
- Every fact has source/version/provenance.
- Anime and game divergences are explicit.
- Overall maps regenerate deterministically from connections and warps.
- Kanto milestone validates Pallet → Pewter connectivity and Ash-event ordering.
- Runtime exposes `privateCanonicalAssetsAllowed` and `distributableAssetsOnly` as separate fail-closed policies; private bytes never enter public artifacts.
