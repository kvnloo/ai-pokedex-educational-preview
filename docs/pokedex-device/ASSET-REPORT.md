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

Runtime exports and the revised rendered video are undergoing their separate acceptance gate. No game integration or merge approval is claimed by this source milestone. Kevin's explicit HITL approval is required before merging this branch to main.
