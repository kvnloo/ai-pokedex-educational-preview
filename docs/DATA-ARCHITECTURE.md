# Data architecture — Twilight Route / full Pokédex

## Goal

Ship a **complete national-dex** (PokéAPI count currently **1025** species) as structured,
validated game content that powers:

1. **Battle simulation** (Track S — exact formulas/constants)
2. **Interactive 3D Pokédex** (browse, filter, inspect, spin model)
3. **Overworld encounters** (species pools, levels, forms)
4. **Research / enrichment loops** (Grok workflows, never hand-edited chaos)

## Principles

| # | Principle | Why |
|---|-----------|-----|
| 1 | **Facts are data, not code** | 1025 species × moves × forms cannot live in TS constants |
| 2 | **Two storage tiers** | *Authoritative warehouse* (tools) vs *runtime shards* (browser) |
| 3 | **Stable IDs** | `nationalId` (u16) is forever; slugs are secondary keys |
| 4 | **Normalize hot joins** | Types, moves, abilities are tables; species *reference* them |
| 5 | **Denormalize cold reads** | Dex grid gets a fat index row so scrolling never N+1 fetches |
| 6 | **Provenance on every row** | `source`, `sourceVersion`, `syncedAt` — research can be re-run |
| 7 | **Schema-validated at build** | Bad content fails CI, not a faint animation mid-battle |
| 8 | **Presentation is a pointer** | 3D mesh / factory id is *not* mixed into combat stats |

## Logical model

```
Type ──┐
       ├── TypeChart (attacker × defender → multiplier)
Move ──┤
Ability┤
       │
Species ── nationalId (PK)
  ├── types[1..2] → Type
  ├── baseStats { hp, atk, def, spa, spd, spe }
  ├── abilities[] → Ability (+ hidden flag)
  ├── forms[] → Form
  ├── evolution → EvolutionEdge*
  ├── learnset[] → { moveId, method, level?, game? }
  ├── dex meta { color, shape, habitat, generation, isLegendary, … }
  └── presentation { meshId?, factoryId?, cryUrl?, spriteKey? }
```

### ID strategy

| Entity | Primary key | Notes |
|--------|-------------|-------|
| Species | `nationalId: u16` | 1…N; never reuse |
| Form | `formId: string` | `{nationalId}:{slug}` e.g. `25:alola` |
| Move | `moveId: u16` | PokéAPI move id |
| Ability | `abilityId: u16` | PokéAPI ability id |
| Type | `typeId: u8` | 0–17 classic + stellar later if needed |

Slugs (`bulbasaur`) are **unique indexes**, not PKs — they can theoretically rename; ids do not.

## Physical layout (repo)

```
content/
  schema/                     # JSON Schema (draft 2020-12)
    type.schema.json
    move.schema.json
    ability.schema.json
    species.schema.json
    form.schema.json
    evolution.schema.json
    dex-index.schema.json
  canonical/                  # authoritative, validated, committed (or LFS)
    types.json                # small; full chart embedded
    moves.jsonl               # ~900 lines
    abilities.jsonl
    species.jsonl             # 1025 lines — ONE species per line
    forms.jsonl
    evolutions.json           # chain roots + edges
    PRESENTATION.jsonl        # mesh/factory/cry pointers only
  derived/                    # build outputs (committed or CI artifact)
    dex-index.json            # lightweight list for Pokédex virtual scroll
    type-chart.json           # 18×18 float matrix, battle-ready
    shards/
      species-gen-01.json     # optional gen splits for progressive load
      …
  manifests/
    CONTENT_VERSION           # semver of content pack
    SOURCE_PROVENANCE.json    # pokeapi commit / dump date / tool version

data/raw/pokeapi/             # gitignored API cache (reproducible re-sync)
tools/
  pokeapi-sync.mjs            # pull → normalize → write canonical
  validate-content.mjs        # schema + referential integrity
  build-derived.mjs           # index + chart + shards
```

### Why JSONL for species/moves (not one giant JSON array)?

- **Stream parse** during tools and tests (low RAM)
- **Line-oriented diffs** in git (one species change = one line)
- **Sharding** is trivial (`split`, or filter by gen)
- Browser never loads raw JSONL — only `derived/` shards

### Why not SQLite in the browser as SoT?

SQLite (via sql.js / wa-sqlite) is excellent for **tools and research**:

```
tools use: content/canonical/pokedex.sqlite   # optional build artifact
```

But the **runtime SoT for the shipped game** is derived JSON shards:

- Zero WASM tax on first paint of the dex grid
- Trivial CDN caching / HTTP range if we later split
- Deterministic, reviewable in PRs without binary blobs

Optional: ship SQLite only to the **editor / debug** surface, not the player path.

## Runtime load plan (3D Pokédex)

```
Boot
  └─ fetch derived/dex-index.json          (~150–300 KB gzipped for 1025)
       virtual-scroll grid (name, types, gen, color, nationalId)

On select(nationalId)
  └─ fetch derived/shards/species-{gen}.json  OR  species/{id}.json
       + presentation pointer
       + spawn mesh (Hunyuan GLB | img2threejs factory | procedural placeholder)
```

Battle boot loads `type-chart.json` + party species blobs only — never the full dex.

## Source of truth policy

| Field class | Source | Override allowed? |
|-------------|--------|-------------------|
| Base stats, types, catch rate, growth | PokéAPI (gen-latest default) | No silent override — research notes only |
| Move power/accuracy/PP/category | PokéAPI | Same |
| Type chart | PokéAPI type endpoint | Same |
| TW story placement, route tables | Our design docs | Yes — authored |
| 3D mesh / materials | Hunyuan / img2threejs pipeline | Yes — presentation track |
| Flavor blurb for UI | PokéAPI flavor + optional LLM polish | Polish must tag `enrichedBy` |

**Research workflow** may add `enrichment` objects; it must never clobber `stats` without a
schema field `statsOverride` + human review flag.

## Enrichment envelope (research output)

```json
{
  "nationalId": 831,
  "enrichment": {
    "twilightWings": {
      "episodes": ["ep03-buddy", "ep07-sky"],
      "role": "companion-icon",
      "keyframeRefs": ["pipeline/ab_test/wooloo/ref/wooloo_input.png"]
    },
    "presentationNotes": "Round silhouette; prioritize subsurface wool, not hard armor.",
    "enrichedBy": "pokedex-research@1",
    "enrichedAt": "2026-08-02T00:00:00Z"
  }
}
```

Stored in `content/canonical/PRESENTATION.jsonl` or `enrichment.jsonl`, joined at derived build.

## Integrity gates (`validate-content`)

1. Schema validate every row  
2. Every `typeId` / `moveId` / `abilityId` referenced by species exists  
3. Evolution edges form forests (no cycles)  
4. `dex-index.length === species.count`  
5. National ids contiguous or explicitly gapped with `reserved`  
6. Presentation mesh ids resolve to a file or registered factory  

## Sync cadence

```bash
npm run content:sync          # pokeapi → canonical (rate-limited)
npm run content:validate
npm run content:derive
```

Full 1025 species sync is ~minutes with caching; re-runs are incremental via ETag/cache files
under `data/raw/pokeapi/`.

## Grok workflow

`.grok/workflows/pokedex-research.rhai` — fan-out **minimal-effort** children to:

1. Verify canonical vs PokéAPI samples  
2. Fill TW episode crosswalk for Galar species  
3. Queue mesh generation jobs for missing `presentation.meshId`  
4. Emit enrichment patches only (never rewrite stats)

Session orchestrator stays **high** effort; children **minimal** (see `docs/GROK-WORKFLOW.md`).

## Anti-patterns

- One `pokemon.ts` with 1025 objects  
- Putting base stats on the mesh GLB filename  
- LLM-invented stats without a failing test  
- Loading full learnsets for every species on dex boot  
- Mixing Japanese/English names without `locale` fields  

## Default gen scope for demo

- **Data**: sync all 1025 (cheap text)  
- **Meshes**: generate on demand (Wooloo A/B first, then Galar TW cast)  
- **Battle demo**: starters + route 1 pool subset  

Text is cheap. Geometry is expensive. Architecture keeps them independent.
