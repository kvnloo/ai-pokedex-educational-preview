# Wave 6 creature reference and production manifest

This is a path-only craft record. Official reference pixels remain private under
`/mnt/zer0models/pokemon_anime`; none are copied to `public/` or `dist/`.

## Extracted-frame study

The parent orchestration scan indexed all **2,181** extracted images (1,745
one-second full frames plus 436 keyframes). These frames were selected for form
and motion principles only:

| Purpose | Private study path | Principle transferred |
|---|---|---|
| continuous animal silhouette | `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0326.jpg` | torso/neck/head read as one mass at route distance |
| compact creature close read | `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0353.jpg` | large features must remain nested in a coherent body envelope |
| soft hero key/fill | `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0144.jpg` | broad value grouping before local detail |
| impact silhouette | `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0434.jpg` | attack pose needs one unmistakable action line |
| locomotion spacing | `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0071.jpg` | preserve body mass while appendages articulate |
| launch / hit reaction | `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0118.jpg` | short anticipation, fast displacement, readable settle |

No official silhouette, character design, topology, texture, or palette was
copied. Emberpup, Dewkin, and Leafkit remain original species.

## Rights-cleared production plate

`original/emberpup-continuous-concept.svg` and its PNG render were authored in
this worktree from primitive vector paths. They contain no corpus pixels. The
plate defines Emberpup's pelvis-to-ribcage-to-neck-to-muzzle line, embedded legs,
rooted ears, chest ruff, and swept ember tail.

## Actual img2threejs run

The original PNG was processed through `/home/kvn/workspace/img2threejs`:

1. technical probe → `img2threejs/probe.txt` (`960×720`, suitability `pass`)
2. pre-spec assessment → `img2threejs/assessment.json`
3. 3×3 detail inventory → `img2threejs/detail-inventory.json` and
   `original/img2threejs-detail-zones/`
4. sculpt-spec scaffold → `img2threejs/sculpt-spec.json`
5. original-plate PBR estimate → `original/img2threejs-pbr/` and
   `img2threejs/pbr.log`

The PBR stage reported its single-image limitations, so the generated maps are
retained as study artifacts rather than blindly shipped. Its accepted production
measurements were transferred into runtime code:

- `roughnessBase: 0.682` informed the fur roughness band in
  `src/creatures/speciesMeshes.ts`;
- extracted original palette values `#E67B44` and `#6A2D32` became Emberpup's
  fur and dark-socket materials;
- detail-zone review established the 15-ring depth loft and socket locations;
- the sculpt spec's continuous-core requirement is enforced by
  `src/creatures/meshQa.ts` (organic core volume share, sphere-share cap,
  axis-plane coverage, triangle count, and socketed-appendage count).

This is production use through authored geometry/material decisions, not a claim
that an estimated 2D map is a finished UV texture.

## Runtime QA at scale 1

| Species | Triangles | organic-core volume share | sphere volume share | socketed appendages | result |
|---|---:|---:|---:|---:|---|
| Emberpup | 5,628 | 0.821 | 0.0027 | 7 | pass |
| Dewkin | 5,440 | 0.684 | 0.0032 | 7 | pass |
| Leafkit | 5,352 | 0.675 | 0.0034 | 10 | pass |

These numbers are necessary anti-placeholder gates, not visual-quality proof.
Browser screenshots and labels-hidden judges remain the visual gate.
