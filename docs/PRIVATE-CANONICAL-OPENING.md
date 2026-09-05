# Private Blender fan-art slices

The private development route starts from textual character specifications. The earlier procedural meshes are disposable blockouts. Pikachu and Charizard have subsequently been edited through the visible Blender 5.2 GUI using local cua-driver computer use. No official images or models were loaded, traced, scraped, or copied.

The inherited dirty worktree was continued. The older image-to-model experiments and their input requirements are preserved as separate historical workflows; they do not gate this route.

## Run

```sh
npm run dev:private
```

Open `http://127.0.0.1:5181/private.html`. Ash meets Pikachu outside Oak's laboratory; WASD/arrows move, E greets, Shift runs, Space triggers Thundershock, and C changes camera. Follow the path north to Route 1. Progress survives reload. The encounter links lead to individual species slices with movement, three exploration rings, greeting, a signature animation/effect, and saved completion. Giratina's two forms are separate authored encounters, both National Dex 487; no battle-ruleset transformation is implied.

The `opening:author` command and species Python scripts regenerate historical procedural blockouts. They do not reproduce the GUI refinements and must not be used to overwrite the reviewed candidates. Preserve current assets before further authoring, and inspect each new result in Blender.

## Provenance and isolation

All GLBs, authored `.blend` files, ledgers, archived iterations, screenshots, videos, and private build outputs live under `/mnt/zer0models/pokemon-iac/canonical-opening/v1`, outside the repository and public `dist`.

The opening's private `sources/ledger.json` is now schema v2: `generated-from-scratch`, `private-local`, exact textual-specification and recipe hashes, creation date, and an empty external-input list. It does not invent image paths or claim observed official references. Candidate receipts bind the resulting GLB and Blender-source bytes. Each roster receipt contains its textual specification, recipe hashes, GLB/Blender hashes, mesh QA, material names, sockets, and clips.

Private development loads structurally verified candidates without requiring a separate promotion certificate. This is a local review policy, not public distribution authorization. The optional `--promoted` check remains separate and requires exact evidence bindings. Recognition is determined by actual image/motion inspection, not inferred from test output or model names.

Private servers bind loopback; asset endpoints reject off-host/cross-site requests, unknown IDs, modified bytes, symlinks, and externally linked GLB resources. Public dev/preview exclude private routes. Public builds retain the original distributable content. The boundary scanner includes untracked files and hashes of authored Blender files, generated models, revisions, and visual evidence.

## Verification and evidence

```sh
npm run typecheck
npm run test:opening
npm run test:canonical-build
npm run build
npm run build:private
npm run opening:boundary
npm run check:ship
npm run test:opening-boundary
npm run test:browser-opening
node tools/private-opening/encounter-browser.mjs charizard
```

Browser harnesses exercise trusted keyboard input and save reloads, then capture six views and WebM motion in private evidence directories. Screenshots are only captured from loaded live character scenes; test logs, receipts, and error pages are not visual deliverables. `render_dcc.py` also renders an exact authored Blender file for inspection.

The visuals are stylized procedural fan art and original environmental staging. Pallet's houses and north exit provide the playable opening; the later clearings provide compact exploration/action encounters, not full canonical episodes or a complete battle system.

## Current private review result

Only Pikachu and Charizard have received this GUI refinement pass. Ash and the remaining species/forms retain their earlier blockout status; previous roster-wide visual acceptance claims are superseded. Structural test success is not an art-quality verdict or Kevin's approval.

Pikachu now has a joined, brush-smoothed head/body surface, smaller asymmetrically posed arms, bevelled thinner ears with aligned black tips, flatter cheeks, and a rounded mouth. Charizard has a joined and remeshed skull/muzzle, adjusted head proportions and eyes, a belly surface fitted to the torso, remeshed wrists, slimmer wing edges, and corrected wing-root placement. These are visibly stronger private development candidates, with simple geometric wings, feet, and flame forms still apparent.

All prior candidates and roster artifacts were preserved with hashes as disposable blockouts under `/mnt/zer0models/pokemon-iac/canonical-opening/v1/evidence/blender-gui-20260905T033517Z/disposable-blockouts`. The same evidence directory contains real Blender-window screenshots, sculpt/edit views, exact saved-file renders, before/after comparisons, and the computer-use action log. The reviewed private candidate receipts bind the new Blender and GLB bytes and record GUI refinement separately from the original blockout recipe hashes. Background Blender was used only to inspect/export/render GUI-edited files and render preserved baselines.

Pikachu's evaluated mesh has 76,548 triangles; Charizard's has 53,076. Both pass the existing finite-geometry, degenerate-triangle, manifold-edge, material, socket, clip, and exact-byte checks. See the private evidence report for the current runtime and boundary check results. No public assets, gate rules, or isolation controls were changed by this refinement pass.
