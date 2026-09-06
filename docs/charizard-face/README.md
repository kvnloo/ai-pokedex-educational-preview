# Charizard skull and eye checkpoint

`charizard-head-r18` has a smoother posterior skull patch and connected orbital rims around two closed eye surfaces. The rejected r09 rim folds and eye/socket intersections are absent in the tested r18 regions. This is a local geometry checkpoint, not a finished character. The muzzle, jaw, eyelids and expression remain visibly rough; the eye palette is temporary vertex color, with jagged iris edges at close range.

Root authored the meshes through Blender MCP, inspected actual renders and the reopened GLB in Blender, and ran a fresh-process reproduction. Delegates performed read-only CPU diagnosis/validation and evidence review. No other worker authored Blender or edited this lane. Historical scenes, frozen artifacts, unrelated dirty worktrees and the live Field OS were preserved. Nothing was merged or pushed.

## Source and decisions

Private root: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04`.
Frozen parent: `anatomy-r03/head-r06/charizard-head-r06.blend`, SHA256 `c13a6d73a602d760804a5bb311ed6450c6bb069a7031788cfaa9b5465fe79dc8`.
The generation ancestor is still `charizard-official-raw-61062-o256`. Official illustration and HOME images informed facial review; prior official front/rear sprites remain recorded in the parent manifest. No new image generation or unofficial source was used. References establish character direction, not orthographic dimensions.

The earlier r06 report called one Open3D pair an intersection. The new exact-plane diagnosis shows disjoint triangles with positive clearance: it was a near-contact/sliver detector artifact, not a proper crossing. The smallest nearby face area was about `2.95e-12`. Historical reports remain untouched; this correction supersedes that interpretation.

| Attempt | Evidence and decision |
| --- | --- |
| Landmark r01 → r02 | Whole-body raycasts hit a wing for two far-side landmarks. Head-only raycasts and actual unobstructed side renders corrected them before editing. |
| r07 | Welded two interior near-coincident vertices onto an existing vertex; every retained coordinate unchanged. Nine local numerical gates pass. |
| r08 | Initial eye cut left orphan edges. The seam-incidence assertion stopped authoring before a candidate. |
| r09 | First eye sockets exported and inspected. Rejected: 75 strict skin crossing pairs and 316 strict body–eye pairs; rear eye poles penetrate the socket floors. |
| r10–r12 | Aborted skull-patch attempts exposed boundary-only ear triangles, BMesh deletion semantics and the difference between the grid-fill mesh operator and low-level operation. Actual failures and recipes are preserved. |
| r13 | Curved grid interpolation overshoots the fixed boundary. Visible folds; rejected. |
| r14 | Simple grid interpolation reduces overshoot but leaves boundary ripples. Intermediate only. |
| r15 | Fair only 289 new grid vertices, keeping the 72-vertex boundary and exterior fixed. Fourteen local geometry gates pass; the targeted posterior crease is visibly smoother. |
| r16 | Constrained orbital triangulation aborted because Blender's NumPy rejects a 2D cross product. |
| r17 | Scalar determinant fixes NumPy compatibility. Two projected collinear CDT artifacts create invalid edge incidence; assertion stops candidate creation. |
| r18 | Filter projected zero-area triangles; triangulate the annulus between fixed root and opening contours; deepen socket floors and shorten eye backs. Connected seams, no reversed annulus triangles, and no tested local body/eye intersections. Current checkpoint. |

The inspector contains six new selectable checkpoints: r07, r09, r13, r14, r15 and r18. Rejected candidates remain explicitly labeled. `completed` means the experiment finished, not that character quality passed. Separate human reviews remain untouched. Comparing r09 against r18 changes both skull fairing and eye construction; it is not a single-factor comparison of the whole head.

## Measured geometry

| r18 export | Vertices | Triangles |
| --- | ---: | ---: |
| Body | 121,980 | 243,960 |
| Eye +1 | 3,074 | 6,144 |
| Eye −1 | 3,074 | 6,144 |
| Flame | 4,516 | 9,028 |
| Total | 132,644 | 265,276 |

One scene, four meshes, no authored materials, UVs, texture images, skin/rig or animation clips. Vertex colors survive GLB reopening. The eyes add a temporary iris/sclera palette; the copied body and flame also receive a neutral gray inspection vertex-color attribute. This is the detailed geometry source; no optimized runtime derivative is claimed. The body and eyes have identity transforms. The flame retains its existing translation, recorded in `head-r18/reopen-receipt.json`.

All 113,062 protected frozen tail-r02e vertices and 226,039 oriented triangles remain exact. Both horns, their root rings and incident triangles, the 289 fairing vertices, and the flame geometry and transform remain exact. The new neutral flame display color is not claimed identical to the parent attribute state. Every retained r15 coordinate and 242,381 exterior oriented body triangles remain exact.

The r15 skull patch is a 648-triangle disk with one fixed 72-edge boundary. Boundary adjacent-normal angle p90 improves from 44.87° to 6.11°. Minimum triangle angle declines from 9.25° to 4.93°; smoother shading does not imply better deformation topology. A boundary-only triangle recreated exactly by the grid is included by cutting the boundary edges and flood-filling; triangle-set difference alone would miscount the patch.

The r18 audit passes 12 overall gates and 15 per-eye gates. The paired rims preserve their 76/83-edge boundaries. There are zero local detector pairs, strict crossing pairs or shared-vertex overlaps for the tested body patches and eyes. Minimum sampled eye-vertex clearance is about `0.0001056` / `0.0001075` in model units. Vertex samples are not a global surface-clearance certificate. One nondegenerate +1 annulus triangle (exported face 139838) has a minimum angle of 0.376° and remains a deformation-topology compromise. These checks do not establish whole-model intersection freedom or anatomical acceptance.

## Inspected evidence and preview

Root inspected all six standard head views, five whole-body views, both unobstructed eye sides, front/reference facial views, skull close-ups, the reopened GLB render and an actual Blender UI screenshot saved after redraw. Standard head views disable cast shadows; whole-body views retain them and can show flat Workbench shadow patches. Supplementary side views clip foreground wings only, using the documented camera range. Unclipped standard views remain available. Clay views avoid hiding defects beneath the provisional eye palette.

Twenty-one browser checks pass: eleven paired views decode, the exact eye preview fits at 412×892, all six checkpoints switch, and there is no horizontal page overflow or uncaught JavaScript error. Root inspected the captured comparison and phone screenshots. This is simulated phone evidence, with Kevin's visual/device acceptance pending.

[Phone inspection](https://0.taila30dc.ts.net:8445/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=charizard-head-r18&view=face-negative-side) · [Rejected/current eyes](https://0.taila30dc.ts.net:8445/devtools/experiments.html?pokemon=charizard&a=charizard-head-r09&b=charizard-head-r18&view=face-negative-side)

The functional Field OS stays at `https://0.taila30dc.ts.net:8469/pokedex.html`, implementation `fa975753269125aebcf471a04515664b90d7fc7c`, private release `f85e3ae295feec02`. Its six-species, scan/register and persistent navigation repair was committed and delivered previously. This asset inspector does not replace it. Actual S25 acceptance remains pending. No deployment or fullscreen/physical-device polish belongs to this milestone.

## Reproduction and audit

Run from this worktree using a new private output directory. Blender 5.2 LTS and the existing Hunyuan Python environment were used.

```sh
/usr/bin/blender --background --factory-startup --threads 4 --python tools/charizard-face/replay.py -- --out /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/reproduction-r18-final
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-face/compare_replay.py --reproduction /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/reproduction-r18-final
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python tools/charizard-face/audit/validate_orbital_cdt.py --r04-root /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/reproduction-r18-final --output-prefix /mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/audit/reproduction-r18-final-validation
/tmp/pokedex-m5-node/node-v26.4.0-linux-x64/bin/node tools/charizard-face/browser_check.mjs
```

The replay verifies 15 pinned source, camera, selection and recipe inputs before loading frozen r06. A visually inspected r06 selection supplies fixed vertex/triangle identities; the r07 selection arrays are derived from the newly generated r07 ancestry, not loaded from frozen intermediate geometry. Each later stage reads its freshly generated parent. Geometry authoring scripts are membership-checked against the verified input set.

The first replay matched geometry arrays but missed the flame translation because the loaded source scene had not been evaluated before copying transforms. That failed replay and its original script/input hashes remain preserved. The corrected replay activates and evaluates the loaded scene before authoring r07 → r14 → r15 → r18. Decoded geometry, transforms, vertex colors and every NPZ array match the actual artifacts, as do all 52 rendered images: 44 standard views, five eye-color views and three skull close-ups. The supplemental skull close-ups also test alpha/background equality. The first expanded render comparison exposed an implicit transparent background in the original skull views; the final renderer makes that setting explicit. The earlier comparison result and recipe remain preserved. `.blend` bytes and receipt wording are not claimed identical. Original per-candidate recipes are frozen separately from the replay driver. The CPU audit also passes on the original and regenerated r18. A first replay audit incorrectly demanded byte-identical r15 GLBs; that failed report remains preserved. The corrected gate independently pins the frozen r15 hash and requires the regenerated parent to match its decoded geometry, transforms, colors, normals and accessor semantics exactly.

The full character goal remains active. Next: refine muzzle, jaw and eyelids against the official references, then address remaining body anatomy and deformation topology before UV/PBR, rigging, motion/attacks and game promotion. No S+/AAA, human acceptance or cross-model-family review is claimed.
