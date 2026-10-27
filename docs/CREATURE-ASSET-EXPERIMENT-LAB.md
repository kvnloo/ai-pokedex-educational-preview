# Creature Asset Experiment Lab

## Product law

PokéAPI is the canonical identity and gameplay-data oracle. Every experiment is
keyed by National Pokédex ID. A name, sprite, or metadata record is not a 3D
asset, and an unrelated mesh may never be relabeled as a canonical Pokémon.

Official artwork and animation frames are private study inputs. Keep them and
all pixel-derived plates under `/mnt/zer0models/pokemon_anime/pipeline/`; do not
copy them into `public/`, `dist/`, or a release. A generated mesh needs its own
provenance and integration review.

## Studio loop

Each Pokémon gets an experiment bundle rather than a one-shot generation:

```text
canonical record + recognition contract
  ├─ native official artwork
  ├─ native high-resolution animation/promotional frames
  ├─ temporal burst / denoise candidate
  ├─ classic resize controls
  ├─ neural super-resolution candidates
  └─ generated novel-view hypotheses (multiple deterministic seeds)
       ↓
source and identity triage
       ├─ Hunyuan shape candidates (matched parameters/seeds)
       └─ img2threejs staged manual sculpts from a multi-view consensus
             ↓
mesh-health QA + fixed-camera renders + identity review + motion review
             ↓
Pareto shortlist → manual art pass → browser integration → blind review
```

The purpose of generated views is to expose hidden-side hypotheses, not to
manufacture canon. Reject any view that changes face markings, ear/horn count,
limbs, tail, palette blocks, body plan, or signature proportions.

## Required experiment matrix

Run at least ten controlled candidates for a new hero Pokémon:

1. canonical artwork, native;
2. alternate official render, native;
3. best native animation/promotional side or three-quarter frame;
4. best native front frame;
5. temporally denoised animation burst;
6. Lanczos control;
7. Lanczos plus restrained unsharp mask;
8. anime-tuned neural super-resolution;
9. general neural super-resolution;
10. a second source through the best neural upscaler.

Then run at least four novel-view seeds (six hypotheses each) and select a
per-view medoid before manual review. Do not average inconsistent views into a
false consensus.

For 3D, hold generator settings constant across source-image candidates first.
Only after the source winner is known should a second sweep vary seed,
guidance, steps, or octree resolution. This prevents confounding source quality
with generator randomness.

## Current calibration target: Wooloo #831

Private experiment root:

`/mnt/zer0models/pokemon_anime/pipeline/experiments/wooloo-studio-bakeoff-20260802`

Why Wooloo first:

- canonical PokéAPI artwork and HOME render are available;
- the local 1080p *Twilight Wings* episode contains side and front frames;
- a prior Hunyuan and img2threejs baseline exists;
- its face, horns, braids, cloud silhouette, short legs, and dark hooves make
  identity drift easy to detect.

The prior `wooloo_input.png` is a face crop, not a valid whole-character source.
The v2 animation plate exposes the body but hides feet/rear structure and has
segmentation damage. Both remain controls, not presumed winners.

## Reproducible tools

### Mine the private corpus semantically

```bash
env -u PYTHONPATH /workspace/venv/hunyuan3d/venv/bin/python \
  tools/mine-creature-frames.py \
  --query /private/path/pokeapi-official-artwork-831.png \
  --corpus /mnt/zer0models/pokemon_anime/frames \
  --corpus /mnt/zer0models/pokemon_anime/keyframes \
  --out-dir /private/path/mined-dinov2 \
  --model facebook/dinov2-giant --local-files-only
```

The DINO score finds likely frames; it does not prove species identity. Inspect
the resulting contact sheet.

### Execute source variations

```bash
python3 tools/run-creature-source-experiments.py \
  --manifest experiments/wooloo-pilot/source-variations.json \
  --out-dir /private/path/sr \
  --realesrgan-bin /private/tool/path/realesrgan-ncnn-vulkan
```

The report records hashes, parameters, sharpness, edge density, clipping, and
round-trip source preservation. Higher sharpness is not automatically better:
rings, doubled linework, invented wool curls, or changed face markings fail
visual review.

### Generate multi-view hypotheses

```bash
env -u PYTHONPATH /workspace/venv/hunyuan3d/venv/bin/python \
  tools/zero123-multiview.py --image /private/path/official.png \
  --out-dir /private/path/multiview/zero123 \
  --seed 83101 --seed 83102 --seed 83103 --seed 83104 --steps 50
```

If a GPT image-generation provider is configured later, it should implement the
same output contract: fixed source hash, exact prompt, model/version, seed or
request ID, neutral background, fixed orthographic-like angles, and separate
files per view. GPT-generated pixels remain hypotheses and go through the same
identity gate.

### Select, then manually audit, a consensus

```bash
env -u PYTHONPATH /workspace/venv/hunyuan3d/venv/bin/python \
  tools/select-multiview-consensus.py \
  --manifest /private/path/multiview/zero123/manifest.json \
  --query /private/path/official.png \
  --out-dir /private/path/multiview/consensus \
  --model facebook/dinov2-giant --local-files-only
```

The medoid is only machine triage. A studio pass explicitly records keep/reject
for each angle and why.

## Evaluation ladder

### A. Source-input gate

- complete silhouette and minimum two useful angles;
- no important body part clipped or occluded;
- stable canonical face markings, horns/ears, tail, and palette;
- no material background contamination after segmentation;
- native resolution recorded separately from upscaled resolution;
- generated views labeled as inferred rather than observed.

### B. Mesh-health gate

- non-empty mesh and more than 200 faces;
- `volume / bounding-box volume <= 0.75` (reject cube-like collapse);
- `min extent / max extent >= 0.12` (reject paper-thin collapse);
- finite normals, no degenerate bounds, and browser-safe GLB;
- triangle count and transfer bytes recorded.

### C. Rendered identity gate

Use fixed lighting/camera/DPR for front three-quarter, side, rear three-quarter,
starter-stage, exploration, and both battle sides. Score separately:

- cloud-wool silhouette and body/face ratio;
- four short legs and dark hoof placement;
- two horns and two braided side locks;
- eye-ring, nose, ear, and face-mask landmarks;
- tail and rear volume;
- material read at gameplay distance.

A generic sheep, a spherical cloud, or a mesh that resembles the wrong prior
invented creature fails regardless of topology score.

### D. Motion/production gate

- planted feet and grounded contact;
- ear, braid, wool, and tail secondary motion;
- idle, locomotion, attack, hit, and faint clip coverage;
- starter/exploration/battle scale and forward-axis consistency;
- p95 frame time, draw calls, triangles, and transfer size at the shipping
  viewport.

## Promotion rule

Do not collapse the experiment into one opaque score. Keep a Pareto shortlist:

- best canonical identity;
- best hidden-side consistency;
- best healthy geometry;
- best game-distance read;
- best performance.

The art lead/manual pass may combine the strongest structure from one candidate
with landmark corrections learned from another. The promoted version records
that lineage explicitly. Freeze neutral A/B panels before judging and reveal
provenance only after ballots are complete.
