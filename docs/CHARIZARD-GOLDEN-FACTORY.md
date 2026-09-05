> Active private-local route: Kevin authorized original procedural fan art from textual specifications. The Ash/Pikachu opening and subsequent species use `tools/private-opening/`; no source-image matrix is required for that route. The historical image-to-model experiment below remains preserved, with its own unfulfilled input gates; those gates do not block the new Blender route. Private isolation and visual/mesh quality checks still apply.

# Charizard #006 golden creature factory

The current requested dependency order is documented in
`canonical/opening/roster-order.json`: finish Ash/Pikachu first, then Charizard,
Dragonite, Mew, Blaziken and both Giratina forms. This supersedes only the old
future-cohort order below; the historical image-to-model route retains its source and quality
gates. No roster generalization is authorized before Charizard passes.

This is the single-species HERO/STRESS workflow. It does not authorize a roster batch and does not claim an approved AAA asset. The machine-readable source of truth is `experiments/charizard-006/creature-asset-manifest.v1.json`.

## Current gate

`source-plate-hitl` is blocked. One pinned PokeAPI HOME render has been fetched privately and byte-verified, but Kevin has not approved it and the authoritative front/side/rear plate matrix is incomplete. No Hunyuan run is eligible yet. This is intentional: generated geometry must not turn an unreviewed source hypothesis into false canonical evidence.

Private root:

`/mnt/zer0models/pokemon_anime/pipeline/golden/charizard-006/`

Current private ledger:

`source-ledger.v1.json`

The repo contains no official pixels. It contains only the contract, tests, commands, hashes and status.

## Resumable DAG

```text
identity-contract
  -> source-matrix [Kevin exact-byte gate]
  -> segmentation-plate-qa
  -> matched-shape-sweep
  -> component-mesh-qa + 12-view blue clay
  -> blind-identity-jury [Kevin frozen A/B gate]
  -> retopo-material-lod
  -> rig
  -> animation
  -> living-encounter
  -> final-evidence [Kevin release gate]
```

A stage may run only when all `requires` stages are complete. Cache keys are derived from every field named in `cacheKeyInputs`; manual work always creates a new immutable artifact and intervention record instead of overwriting a generated ancestor.

## Verification commands

Validate the factory contract:

```bash
node tools/charizard-factory-golden.mjs
```

After exact-byte source approval, run plate QA before generation. Inspect the exact pixels, not filenames. The plate must contain one complete subject with both wings, tail tip/flame, feet, hands and horns visible and no unrelated pixels.

Before Hunyuan:

```bash
curl -s http://127.0.0.1:8188/queue
curl -s -X POST http://127.0.0.1:8188/free \
  -H 'Content-Type: application/json' \
  -d '{"unload_models":true,"free_memory":true}'
nvidia-smi
curl -sS --max-time 3 http://127.0.0.1:8081/health
```

Run the source sweep only from an approved source-experiment report:

```bash
env -u PYTHONPATH PYTHONNOUSERSITE=1 \
  /workspace/venv/hunyuan3d/venv/bin/python \
  tools/hunyuan-source-bakeoff.py \
  --source-report /mnt/zer0models/pokemon_anime/pipeline/golden/charizard-006/source-variations/report.json \
  --out-dir /mnt/zer0models/pokemon_anime/pipeline/golden/charizard-006/shape/source-sweep \
  --seed 60061 --steps 20 --octree 384 --guidance 7.5
```

Do not vary those settings between source candidates. Only after a source wins may a separate generator sweep vary seed, guidance, steps or octree.

For every raw GLB, run component-level QA before any decimation, then produce twelve blue-clay views:

```bash
env -u PYTHONPATH PYTHONNOUSERSITE=1 \
  /workspace/venv/hunyuan3d/venv/bin/python tools/mesh_qa.py /private/raw.glb

blender -b --python tools/render-glb-turntable.py -- \
  --input /private/raw.glb --out-dir /private/turntable --views 12 --size 768
```

The legacy aggregate `mesh_qa.py` is only a coarse rejection probe. Promotion additionally requires per-connected-component face share, extents, thin ratio, watertightness, area and volume, plus visual agreement. A green aggregate number cannot excuse a fused wing, background slab, wrong limb count or collapsed tail.

## Frozen review protocol

1. Copy immutable candidate GLBs and 12-view renders into a versioned evidence directory.
2. Record SHA-256 for every candidate and render.
3. Generate an anonymous A/B grid and freeze its hash before ballots.
4. Judges receive only anonymous views; provenance remains hidden.
5. Kevin may approve or reject. Rejection returns to plate diagnosis or generation; it is not task completion.
6. Reveal provenance only after ballots are final.

## Browser target and budgets

The Living Encounter has one Canvas and one `requestAnimationFrame` owner. Gameplay/entity motion owns root displacement; animation never applies the same displacement twice. Ground contacts are independently sampled in XYZ. Tail flame is runtime VFX attached to the rig socket, not baked into reconstruction geometry.

Project gates for this hero slice:

- LOD0 <= 90k, LOD1 <= 45k, LOD2 <= 18k triangles;
- projected-height switches at 420 px and 180 px with 15% hysteresis;
- <= 96 deform bones and <= 4 influences per vertex;
- initial compressed asset transfer <= 12 MiB;
- resident texture allocation <= 64 MiB including mip chains;
- bounded mobile and desktop runtime smoke now;
- the existing 0.001% low long-duration performance certification remains a separate mandatory gate and is not weakened.

## Failure and rollback law

Every failed candidate is preserved byte-for-byte and transitions through:

```text
reject -> diagnose source/camera/topology -> correct route -> new candidate
       -> component QA -> turntable -> blind review
```

No failed candidate is repaired by decimation, relabeled as Charizard, or promoted because it is merely watertight. The final manifest must point to the previous accepted artifact for rollback.

## Future cohort (not implemented here)

After Charizard passes: Lucario #448, Wooloo #831, Gyarados #130, and Ditto #132. Batch permission requires Charizard plus at least three cohort species to expose and fix cross-class failures.
