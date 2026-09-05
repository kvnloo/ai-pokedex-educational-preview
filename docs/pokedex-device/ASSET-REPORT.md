# Physical Pokédex — v001, hero r06

Both supplied boards were inspected before modeling. The design combines the first board's graphite interior with the second board's segmented red cover and four-button cluster. A single short-edge hinge resolves the boards' inconsistent axes. The original placeholder display is replaceable; no reference-board image is projected onto geometry.

## Source and mechanics

Asset storage: `/mnt/zer0models/pokemon-iac/devices/pokedex/v001`. The Git lane contains reproducible construction scripts, contracts and hashes, following the game's existing manifest-only binary policy. The frozen hero is `source/pokedex-v001-m3-hero-r06.blend`.

- Nominal envelope: 100 × 170 × 34 mm, plus 1.2 mm feet. Main shell walls are 2 mm thick.
- Hinge pivot: (0, 0, 24 mm), local X. Ready angle −112°, opening settle reaches −112.65°. Seven alternating bored barrels, a continuous pin, retained endcaps and housing inserts form the actual mechanism.
- Pin radius 2.40 mm, bore radius 2.55 mm; nominal radial clearance .15 mm and axial barrel gaps .7 mm. Closed shell seam is 1 mm.
- Controls have independent pivots and seated guides/returns. The A-button travels .55 mm; its return diaphragm compresses with it.
- Display, optics, speaker baffle, ports, cover panels, fasteners and service panel have modeled support paths. The hinge pin's intentional bearing clearance remains the only isolated contact component in the sampled support graph.

## Hero measurement and materials

The hero has 125 mesh objects / 260,848 evaluated triangles, plus 15 editable FONT objects / 8,208 triangles: **269,056 total evaluated triangles**. Mechanical meshes have manifold edge incidence, positive volume and zero exactly collapsed triangles. The model retains 114 positive-area microscopic bevel slivers; these are reported rather than counted as zero-area faces.

Repeated button caps/sockets and fasteners share source mesh data. Deliberate component rotations and hinge/control parenting remain intact; physical mesh local scales are unit except the animated return deformation. The repaired right hinge endcap has its bevel applied after a local connectivity correction. All vertex coordinates were preserved exactly, and its construction remains reproducible from `build.py` and `repair_topology.py`.

Sixteen device materials use portable Principled PBR. Ten authored 512 × 512 PNGs provide restrained normal and roughness variation for five finishes: red polymer, graphite, silicone, aluminum and blackened steel. They are packed into the hero. Other surfaces use authored scalar/color PBR values. UV0 is projected per object; the screen has an explicit replaceable rectangular mapping. This is reusable microfinish mapping, not a unique painted atlas.

## Animation contract

30 fps; each clip includes its terminal sample. Source preview range 1–294 omits the duplicate final sample for video, while exporters retain the full strip bounds.

| Clip | Frames | Seconds | Behavior |
| --- | --- | --- | --- |
| Closed | 1–16 | .5 | Closed rest and low status light |
| Opening | 16–76 | 2 | Resistance, acceleration, deceleration and small hinge settle |
| BootUp | 76–151 | 2.5 | Screen wake, scan glyph/progress, status and cyan ring startup |
| Ready | 151–181 | 1 | Original replaceable ready UI |
| Idle | 181–271 | 3 | Subtle ring breathing |
| ButtonPress | 271–295 | .8 | Real A-button travel, return compression and light feedback |

The runtime state sequence is Closed → Opening → BootUp → Ready → Idle; ButtonPress returns to Idle. Reverse Opening supports closing. Core transform tracks animate mechanics, visibility groups and progress. Six meshless `SIG_*` nodes carry normalized values in local translation X. After `AnimationMixer.update(dt)`, the adapter applies each material's `max_emission × signal` to emissive intensity. Material extras record the bindings. This avoids relying on unsupported material-pointer animation in the game's Three.js version.

## Evidence and current gates

Twenty 1280 × 1280 stills cover material/clay front, back, sides, open/closed three-quarter views and mechanical closeups. The actual Blender desktop and rendered output were inspected. `canonical/devices/pokedex-m3.json` identifies the exact source and still evidence.

The 13-angle moving/fixed sweep is clear from 0° through 112.7°. Independent same-assembly sampling at closed, ready and fully pressed poses found no confirmed penetrations; support paths are connected except the intentionally clearanced pin. Eleven sampled pose matrices and all 84 NLA records survived the final geometry repair unchanged. These sampled mesh checks do not prove every possible contact or manufacturing tolerance.

Runtime and video gates passed in M4 (canonical/devices/pokedex-m4.json). LOD0/1/2 contain 72,307 / 28,426 / 12,126 triangles and 48 mesh objects each; sizes are 8,079,808 / 4,731,616 / 3,600,788 bytes. Each has 16 materials and ten embedded 512 × 512 images. Khronos glTF Validator reports zero errors or warnings; informational notices describe unused UVs and generated tangent bases. All three actual GLBs reopened in Blender with no zero-area triangles and passed 28 browser checks each using the game's Three.js loader and runtime adapter. Optional explicit tangents are omitted because Blender produced zero vectors on microscopic bevels; the reusable microfinish maps use a runtime-generated basis.

Four reopened-runtime renders were inspected. LOD0 is the close-up asset, LOD1 is intended below roughly300px object height, and visibly faceted LOD2 is intended below120px. The actual r06 video is H.264, 768 × 768, 30fps, 294frames /9.8seconds. Its ten-frame storyboard and native-browser opening frame were inspected; full playback ended without error or dropped frames in the observed runs.

## Minimal game/Pokédex integration

The existing private Pokédex's lens opens `pokedex-device.html`, with a return link to the same app. The viewer loads the accepted GLBs, plays the authored opening/boot sequence, supports closing and physical A-button confirmation, and offers drag/pinch inspection, view presets and detail switching. A replaceable 640 × 864 live canvas demonstrates session state without baking UI into the asset. It is a minimal asset hook; the physical device does not yet operate every game subsystem.

LOD changes preserve clip state, time and reverse direction. Movement during a gesture permanently cancels tap eligibility; multiple fingers and cancelled touches do not open the lid or confirm. Failed loads retain the previous model and provide a retry. The application has keyboard-accessible controls, safe-area spacing and a reduced-motion camera fallback.

Only private builds include the device page and allowlisted assets. Development reads the accepted external files; production preview reads and verifies its own built copies. Public preview returns 404 even when the source assets exist. Portable-preview checks confirm all three hashes, a 409 response for a corrupt copy, and a 404 for a missing copy without falling back to the external source.

The viewer uses a thin reflective transparent cover instead of Three's blurred screen-space refraction. This instance-local approximation does not change the frozen GLBs or Cycles hero. Observed LOD0 cost is 51 render meshes and 103 draw calls including shadows and the floor, with pixel ratio capped at 1.75. No on-device mobile GPU benchmark is claimed. The desktop browser's touch emulation verifies interaction and layout, not physical phone sensor behavior.

Runtime restoration adds eight checks per LOD, bringing the actual GLB suite to 108 checks. Seventeen end-to-end checks passed in headed Chromium with real drag, two-finger touch, cancellation, asset-failure/retry, LOD switches and Pokédex navigation. Four additional checks exercised the compiled private preview’s loading, opening/boot, physical button and closing. Final screenshots were inspected. TypeScript and the existing Pokédex tests pass. The scoped private Vite build passes canonical acceptance and copies all three exact GLBs. The complete `npm run build:private` command remains blocked earlier in the existing asset-IaC chain: its demonstrative owner-supplied `pokemon-kanto-art.bin` fixture is absent. The required Node 26.4.0 was installed and verified; no identity checks or owner-source gates were weakened, and no fixture bytes were fabricated. `canonical/devices/pokedex-m5.json` records the final viewer evidence.

Kevin's explicit HITL approval is required before merging this branch to main.
