# Physical Pokédex — mechanical design v1

This is an authored prop for the canonical Pokémon game, not a separate product. Kevin authorized implementation on 2026-09-05. Root owns Blender implementation. Chief of Staff does not author the Blender asset. Merge to main requires Kevin's explicit human approval.

## Reference reconciliation

Both original boards were loaded and visually inspected before modeling:

- `/workspace/hermes-home/profiles/chiefstaff/cache/images/img_2a6e0bc69179.jpg`
- `/workspace/hermes-home/profiles/chiefstaff/cache/images/img_42f7a30853f3.jpg`

Primary design combines board1's graphite inner chassis, restrained silver/red framing and clean cyan control with board2's faceted red outer cover and four-button cluster. No second shell variant initially. The boards contradict hinge orientation and closed/open proportions. Resolve these as a single crosswise seven-barrel hinge across the short edge; the upper and lower halves have matching footprints and physically meet when closed. The dark transverse outer band and recessed central cyan control provide the closed silhouette. Do not copy apparent extra hinges, floating controls, inconsistent vents, text errors or screenshots as geometry.

## Dimensions and mechanism

Meters in Blender; documented dimensions in millimeters. Nominal closed envelope 100W × 170L × 34H mm. Lower body lies in XY with front toward -Y; hinge axis is X through (0,0,24mm). Base footprint runs approximately Y=-164..-6mm, X=±50mm. Base top deck around18mm; controls no higher than21mm. Lid closed inner surface at25mm, outer cover34mm, leaving at least4mm nominal clearance above deck and3mm above controls. Target wall thickness2mm and seam widths0.35–0.6mm, not zero-thickness surface cards. Use rounded perimeter frames and actual interior recesses.

Lid root rotates around X from0° closed to-112° ready; negative rotation raises a lid that extends toward -Y. Display normal faces downward when closed, toward the viewer when open. All lid parts, its alternating hinge barrels and status controls inherit this pivot. Lower hinge barrels remain with base. Pin radius2.4mm; barrel bore radius2.55mm gives0.15mm radial clearance. Seven alternating barrels, centers X=-39,-26,-13,0,13,26,39mm, nominal length12.3mm giving0.7mm axial gaps. Barrel outer radius5.4mm. Concealed connecting mounts must attach barrels to chassis. Test lid sweep against base/control envelope; no moving assembly may intersect the fixed assembly.

Mechanical shell construction: separate closed solids for red outer skins, dark recessed chassis, inset display frame/glass, covers, port surrounds and underside battery/service panel. Cut actual openings for camera, sensor, speaker slots, buttons and ports. Provide screw heads with recesses, rubber feet, USB-C-shaped port, accessory port and lanyard attachment. Blind holes/recesses must stop short of unseen surfaces unless explicitly through features. Fasteners and port internals are seated components; bearing clearances are real gaps, not intersecting geometry.

Controls: D-pad at lower-left, four matching circular face buttons lower-right, a central recessed cyan ring with physical center dial, status buttons and LED lenses. Use linked mesh data for repeated buttons/screws/barrels where dimensions match. Pivots centered on their actual travel/rotation axes.

## Surface and topology

Hero master retains non-destructive bevel/normal settings and inspectable named parts. Bevel dimensions correspond to manufacturing radii (typically0.3–1.5mm, larger outer-corner radii). Deliberate hard/smooth boundaries; no indiscriminate subdivision of boolean topology. Apply unit scale to meshes, keep deliberate pivots on hierarchy roots. Every visible mesh gets UVs; screen is an independently replaceable UV surface. Closed solids should be manifold; intentionally open display/reference planes must be documented if any.

Authored PBR palette: premium lacquered red polymer shell, graphite polymer inner chassis, brushed aluminum hinge/pin details, silicone button surfaces, dark optical glass, restrained cyan emissive inlays and green/amber/red indicator lenses. Principled BSDF materials only for portable core appearance. Procedural hero microdetail must be baked or deliberately simplified for runtime. Screen placeholders use original abstract glyphs, grid/progress and neutral ready content; no board screenshots, copyrighted card imagery or Pokémon art baked into geometry. Replacing the screen texture must not require a new mesh.

## Clips and runtime contract

30fps. Planned clips: `Closed` frames1–15; `Opening`16–75; `BootUp`76–150; `Ready`151–180; `Idle`181–270; `ButtonPress`271–294. Main sequence: Closed → Opening → BootUp → Ready → Idle. Opening uses acceleration, deceleration and a small damped settling motion around the real hinge; closing is a separately reversible runtime state or later authored clip if needed. ButtonPress demonstrates actual controlled travel and return.

LED/ring/screen power and boot progress must be visibly animated in the Blender render and usable at runtime. Prefer export-supported material animation only after verifying loader support. A portable fallback may animate named signal nodes and apply their sampled values to materials in a documented minimal runtime adapter; never claim shader channels survived a plain GLB export without checking. Mechanical motion remains real node animation. Show original abstract boot glyph, progress and screen wake followed by replaceable ready content. No camera animation substituting for lid movement.

## Delivery and gates

Existing pipeline convention: source/receipts/scripts/manifests in Git; private asset bytes in the external data plane. Versioned asset root: `/mnt/zer0models/pokemon-iac/devices/pokedex/v001`. Commit reproducible source scripts, contracts, hashes and evidence manifests; keep versioned `.blend`, GLB, textures, frames and MP4 there. Expose only the verified prop artifact folder through the existing private preview path when useful.

Milestones:

1. M0: reference hashes, resolved design, clean isolated branch and baseline validation.
2. M1: mechanically coherent high-fidelity static hero; neutral clay/material front/back/sides/three-quarter renders and hinge/control/port closeups; inspect actual geometry.
3. M2: hinge/control rig, Closed→Opening→BootUp→Ready and idle/button clips; render video, inspect frames and actual playback.
4. M3: UV/PBR and export validation, GLB reopen, measured budgets and LOD derivative retaining hero source. Report triangle counts, texture dimensions, clip names, bounds, transforms, gaps and remaining compromises. Target initialLOD0 ≤80k triangles, LOD1 ≤35k, LOD2 ≤15k; adapt only with recorded evidence.
5. M4: only after asset gates pass, add a minimal private game/viewer hook using existing Three/Vite dependencies. Preserve existing game flow. Validate controls/state transitions and relevant tests, commit coherent milestone. Do not merge without Kevin.

Mechanical fidelity and visual review outrank premature optimization. Status is work in progress until all delivered artifacts, renders, video playback, export and Git state have been inspected. Keep Charizard's existing work intact and resume its critical path alongside this integrated Pokédex work after the prop milestone.

Mechanical review correction: base frontY=-164mm plus rear barrel radius5.4mm yields169.4mm overall; document170mm nominal. Keep hinge mounts inside their alternating Xintervals. Exterior cyan cover control and interior dial are separate assemblies with different parents.
