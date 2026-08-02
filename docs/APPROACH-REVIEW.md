# Approach review — reconciled (Hermes architect + current tree)

**Sources**
- Hermes leaf architect (`deleg_6297f5a6`) — verdict **fix-first** (snapshot ~01:44, *before* content/runtime landed)
- Live tree as of this file
- Codex Sol orchestration may still be writing `SOL-APPROACH-REVIEW.md`; this doc is the **authoritative interim** until Sol lands

**Overall verdict: fix-first (direction hold).** Not rethink. Warehouse + two-track + hybrid mesh are correct. Product identity + Wave-0 playable battle still open.

---

## Stale vs still true

| Critic claim (01:44) | Status now |
|---|---|
| content/canonical empty; no pokeapi-sync | **Fixed** — 1025 species, types, type-chart, gen shards, `tools/pokeapi-sync.mjs` |
| src empty / no boot | **Partial** — `src/main.ts` Three.js boot; no battle/overworld yet |
| package only dev/build/typecheck | **Partial** — + `content:sync`, `content:sync:smoke`, `verify` |
| smoke clobbers full dex | **Fixed** — smoke → `content/smoke/` |
| typecheck/build red | **Fixed** — both green |
| Identity fork P0 | **Still open** — resolved below |
| No move/form/learnset schemas | **Still open** |
| No wave0 slice manifest | **Still open** |
| Mesh pipeline not game-ready | **Still open** (Wooloo Hunyuan 8.3MB shape exists as study only) |
| No ultracode-wave.rhai in-repo | **Still open** |
| Verification modes unimplementable | **Still open** (need playable loop) |

---

## Identity / IP policy (LOCKED)

Adopted to close the P0 fork:

### Two packs, one product

| Pack | Path | Contents | Ship? |
|---|---|---|---|
| **Research warehouse** | `content/canonical/` (PokéAPI) | Official slugs, nationalId, stats, types — Track S facts | **Dev/research only**; not the public brand surface |
| **Game slice** | `content/game/` | Internal `speciesId`, **original display names**, remap `researchNationalId?`, presentation, route pools | **What the player sees** |

- **UI, dialogue, dex labels, cries branding** → game pack only (original names / TW-inspired region).
- **Battle formulas, type chart, base stat math** → may be *sourced* from research warehouse then **copied into game pack** with provenance; no live PokéAPI at runtime.
- **TW frames / Hunyuan inputs** → stay under `/mnt/zer0models/pokemon_anime` study corpus; never product `public/` ship art sourced as Nintendo assets.
- Public narrative: mechanics research + original presentation; not an official Pokémon product.

This matches `prompt.md` Track S/P without abandoning the 1025 warehouse.

---

## Top remaining risks (post-reconcile)

1. **No Wave-0 battle loop** — biggest gap vs “fun demo.”
2. **Battle schemas incomplete** — moves/learnsets/forms/evolutions.
3. **Raw Hunyuan ≠ game mesh** — need retopo/LOD/sockets or procedural factory default.
4. **Scope gravity** — full dex UI before gunfeel.
5. **Grok ultracode-wave not copied/adapted** — no overnight grind yet.
6. **Sol review still in flight** — may add deltas; fold when file appears.

---

## Mesh pipeline (confirmed hybrid)

1. **Hunyuan shape** — blockout volume (current Wooloo GLB).  
2. **Retopo / poly budget** — battle 3–8k, OW LOD 1–2k, impostor.  
3. **Materials** — img2threejs / hand Three materials (TW light response).  
4. **Sockets** — root/head/atk_fx; procedural idle first.  
5. **Fallback** — primitive factory from `shape` so dex never blocks.

Acceptance ≠ prettier GLB; = silhouette @ battle cam + material read + poly gate.

---

## Next 48h packages (ordered)

| # | Package | Owner suggestion | Acceptance |
|---|---|---|---|
| 1 | `content/game/wave0.json` slice (3 starters + 6 wild + 20 moves + chart) | Luna | validate loads; no full 1025 in runtime boot |
| 2 | `move` schema + sync/subset + golden damage vectors | Terra | `npm run content:validate` + unit tests on formula |
| 3 | Playable loop: grass → menu → damage → faint | Terra/Hermes | mode-3 60s human path |
| 4 | Procedural creature factory + optional Wooloo GLB behind flag | Luna | placeholder never blocks; GLB optional |
| 5 | Copy/adapt `ultracode-wave.rhai` for pokemon | Hermes | `/workflow` dry validate_only |

---

## Do-not list (still bind)

1. No TW frames/rips in product tree.  
2. No official names in **shipped UI** (game pack).  
3. No full-dex meshes before Wave-0 fun.  
4. No stats on GLB filenames.  
5. No stills-only “done.”  
6. No raw 25k Hunyuan as production battle mesh.  
7. No scope expand (breeding, online, megas) mid-slice.  
8. Smoke sync must never touch `content/canonical` (enforced).

---

## Ownership

| Role | Owns |
|---|---|
| **Sol** | Policy, contracts, final ship/fix-first/rethink on packages |
| **Luna** | Glue, UI, factories, sync scripts |
| **Terra** | Battle formula, content model, hard systems |
| **Hermes** | Factory orchestration, Hunyuan, Grok kicks, synthesis |
| **Grok workflows** | Overnight measure/fix after Wave-0 exists |
| **Human** | Blind TW A/B, legal public-ship call |

---

*When Codex writes `docs/SOL-APPROACH-REVIEW.md`, diff against this file and keep the stricter gates.*
