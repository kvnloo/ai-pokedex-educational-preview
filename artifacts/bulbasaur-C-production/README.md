# Bulbasaur C authored retopo candidate

Status: production-retopo/rig candidate; independent review pending; not canonical certification.

This packet is the manual/DCC correction lane for Kanban task `t_9b50409d`. It preserves the promoted hypothesis-C source and the complete frozen A/B/C evidence tree byte-for-byte. It does not integrate the asset into gameplay, publish it, merge it, or animate gameplay.

## Authoritative boundaries

- Promoted source: `/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/production/manual-v1/hypothesis-C/bulbasaur_manual_v1_C.blend`
- Required source SHA-256: `103bb4dd3074b423cf2d868f320283c786d1762dd59708ed775b81c76613178a`
- Frozen promoted panel SHA-256: `3073e5d6c7790befa2d4400c4da3a1cbeab9a9ed9c995bade6acd9791b6117ca`
- Frozen evidence-tree SHA-256: `ea4c0534306b8c821c5975f34c850955faf4f5919a938c03cdb49a30cf1d1dc2` over 281 path-bound files.

## Deliverables

- `bulbasaur_C_production.blend` — bind-pose production candidate.
- `qa-build.json` — authored topology/rig build lineage.
- `qa-final.json` — fresh reopen structural and deformation QA.
- `qa-relocated.json` — relocated-copy reopen QA.
- `REVIEW_PACKET.json` — builder-excluded, non-certifying reviewer handoff.
- `HASHES.sha256` — exact hashes for every packet file except itself.
- `review-renders/` — bind, four declared extreme poses, and visible wireframe views.
- `fixed-camera/source-vs-retopo-clay.png` — top: immutable source C; bottom: authored retopo; twelve matched camera roles.

## Retopology and deformation contract

The 20 deformation surfaces are rebuilt from explicit authored cross-section stations or an explicit saddle torus. Named closed loops are stored as `TOPO_*` vertex groups. No Decimate, UNSUBDIV, Remesh, QuadriFlow, Shrinkwrap, or generated mesh is used.

The armature has body/neck/head and bulb chains plus upper/lower/foot deform bones for all four limbs. Every pose declares each foot planted or lifted. Contact correction is stored per foot in armature space; the rig object and root bone remain untranslated. QA evaluates all 96 vertices in the three full bulb-saddle contact loops, non-adjacent triangle self-intersection, forbidden inter-object intersections, and per-object volume/area/edge preservation against bind.

## Reproduction

Run from the repository root with Blender 5.2:

1. Build from factory startup using `tools/build_bulbasaur_c_production.py` and `BULBASAUR_C_OUTPUT=artifacts/bulbasaur-C-production`.
2. Reopen `bulbasaur_C_production.blend` with `tools/verify_bulbasaur_c_production.py` and `--python-exit-code 1` placed before `--python`.
3. Copy the packet to a new temporary directory and repeat the reopen verifier there.
4. Run `npm run typecheck` and `npm run build`.
5. Rehash the frozen evidence with `tools/hash_frozen_bulbasaur_evidence.py` and finalize with `tools/finalize_bulbasaur_c_packet.py`.

Passing numeric QA is necessary but does not certify canonical identity or art quality. The builder must not make the promotion decision.
