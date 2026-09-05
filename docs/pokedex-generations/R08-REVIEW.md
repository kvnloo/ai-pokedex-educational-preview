# Separate concept candidates, root revision 08

Board 01 is v2. Board 02 is v3. These remain review candidates; neither is Kevin-approved or called AAA/final. They are distinct concepts, not aliases for Ash's canonical Kanto/Johto devices.

The stopped worker's cameras, native crops and component placements were retained as measured starting points. Root rebuilt the shells, pockets, optical fittings, bearing bores, hinge supports and control stems in Blender through MCP. The original worker's meshes, animation acceptance claim and incomplete exports were not accepted as production assets. All 1,017 snapshotted original private/source files remain byte-identical (`preservation-r08.json`). Rejected v001 is untouched.

## Decisions and revisions

- R01: shell hollowing exposed the back through the camera cut and damaged the closed hinge outline. Rejected after viewing actual renders.
- R02–R04: restored the closed back, then found bevel/weld degeneracy and an excessive inner-miter spread. Numeric topology alone was insufficient; bounds, renders and moving/fixed checks caught the faults. Rejected.
- R05–R07: raised the hinge axis to 13 mm, shortened the moving side rail at the transverse hinge, bored the actual joined supports, and shaped the fixed support feet to clear the display assembly. R07 cleared the 15-angle moving/fixed surface sweep for both concepts.
- R08: recessed exterior seams, seated wordmarks, red end sleeves, reusable linked spine bands, optical and control details, contact-length button stems, authored PBR maps, swappable scanner/list placeholders, real animation and first runtime exports.

The boards disagree about a long side hinge versus a transverse opening axis. Both candidates deliberately use a transverse X hinge; the long side feature is a protective rail. This deviation is explicit. V2 retains its graphite interior, single main A button and silver exterior wedge. V3 retains the scarlet interior, four-key cluster and split exterior lock; it receives none of v2's graphite interior or silver wedge. V2's A/B lettering disagreement is resolved as A. V3's partially hidden fourth key remains a separate cap/pivot.

## Measured evidence

| Candidate | Hero evaluated triangles | Runtime triangles | GLB bytes | Meshes | PBR maps |
| --- | ---: | ---: | ---: | ---: | --- |
| v002-r08 | 129,986 | 37,511 | 5,333,952 | 42 | 10 × 512² |
| v003-r08 | 147,844 | 41,934 | 5,697,808 | 50 | 10 × 512² |

Hero mechanical meshes have no collapsed triangles or non-manifold evaluated edges. A 15-angle BVH surface sweep found no lid/base intersections, including 0.5° beyond the nominal opening angle. This does not certify every same-assembly fit, volumetric containment, or manufacturing tolerance. UV0 is projected for solids; the replaceable display has an explicit rectangular UV mapping. PBR maps are reusable microfinish textures, not unique painted atlases.

Actual GLBs pass the glTF Validator's error checks. Warnings concern runtime-generated tangent bases: 31 for v2, 38 for v3. Tangents remain omitted because the established exporter path can emit invalid vectors on tiny bevel faces; this portability compromise is retained explicitly, not counted as a warning-free pass. Reopened geometry has finite vertices/transforms, UVs, no zero-area triangles and plausible sampled bounds.

Both actual exports contain Closed, Opening, BootUp, Ready, Idle and ButtonPress with the intended durations. Blender reopening samples all clip starts, midpoints and endpoints, plus the pressed interval. Lid angles, screen wake, idle emission variation and 0.55 mm button travel pass. Light breathing uses normalized TRS signal nodes bound to emission; solid rings do not expand. The runtime must apply those signals after its animation mixer.

Unwarped reference comparisons use the stopped worker's native-crop perspective cameras. V2 silhouette IoU is 0.959 closed / 0.947 open; v3 is 0.930 / 0.911. These are diagnostics against a hand trace, not artistic acceptance scores. The camera/header, seam treatment, control shape, spine widths and lighting still differ. The placeholder scanner and list are intentionally replaceable and differ from the reference UI. Individual matched renders and overlays were visually inspected; the source was also orbited in the actual Blender desktop viewport.

## Completed motion and inspection evidence

Both 294-frame Cycles sequences were rendered from the frozen hero sources, encoded to H.264 at 576×768 and 30 fps, and played to completion through the Tailscale browser. The videos run 9.8 seconds. Decoded contact sheets and browser frames were inspected. Browser playback dropped 10 frames on v2 and 2 on v3 during the recorded foreground runs; those are playback observations, not missing encoded frames. Encoding receipts include every input-frame hash.

The initial side photograph clipped the lid, and the underside was underlit. Those original photos are retained. The complete `inspection-r01` set uses evaluated mesh extents, measured 8% framing margins and a camera fill. Each candidate has front/back/side/three-quarter clay and material photographs plus closed, underside, hinge, control and port views. All were visually inspected. A framing-helper failure first exposed invalid text-object bounds; fitting now measures the actual evaluated mesh. Background Blender invocations now use `--python-exit-code 1` so script exceptions fail the launcher.

Reopened closeups exposed faceting in the reduced rings and button rims. Q2 retains the evaluated hero surfaces, UVs and normals rather than running geometric collapse. The original reduced exports remain available. The closeup budget was deliberately set to 150,000 triangles before this export, prioritizing the requested fidelity over reduction.

| Candidate | Q2 triangles | Q2 GLB bytes | Reduced comparison triangles |
| --- | ---: | ---: | ---: |
| v002-r08 | 129,986 | 9,613,388 | 37,511 |
| v003-r08 | 147,844 | 10,727,392 | 41,934 |

Q2 renders from reopened GLBs show smoother rings and control caps. All six clips, expected bounds, 0.55 mm button travel, screen wake and idle signals pass again. Validator errors remain zero; the 31/38 tangent-generation warnings remain. This is a technical and visual inspection pass for a review candidate, not Kevin's artistic approval or manufacturing certification. Other controls do not yet have individual feedback clips, and the listed reference differences remain.

Phone reference comparison: `https://0.taila30dc.ts.net:8445/devtools/pokedex-generations.html`. Telegram motion preview 16641 was delivered. Sources/scripts/manifests remain on `codex/pokedex-generations`; binaries remain private. No push or merge.

## Interactive review milestone

Both candidates now run in the existing physical Pokédex viewer at `https://0.taila30dc.ts.net:8471/pokedex-device.html?candidate=v002-r08` and `?candidate=v003-r08`. The Design selector switches concepts; Detail compares the retained hero surfaces with the reduced export. The original device route and existing Pokédex navigation still work. The reference page links to these viewers, studio photographs, mechanical closeups and both actual rendered videos.

Each candidate binds its own ready-display mesh and main physical button by the exported source name. A live canvas display replaces the placeholder without changing the GLB; tapping A updates its confirmation counter. Detail changes retain state. Orbit and pinch do not register as presses. Resizing preserves orbit direction and relative zoom, while a landscape side panel keeps the device inside the visible screen. The first browser pass exposed an inspector overlapping Retry; an actual screenshot then exposed landscape cropping despite the initial layout check. Both are fixed, and the earlier reports are retained.

Verification: 43 candidate browser checks, 17 existing-viewer checks and 19 HTTP/hash/link checks pass. Root inspected the native phone page and all 18 candidate screenshots through full-size examples and contact sheets. Q2 uses 43/51 Three.js render meshes for V2/V3, because material primitives split some Blender meshes. TypeScript passes. Direct private Vite compilation passes its canonical gate and excludes candidate catalogs, review routes and candidate GLBs from the executable bundle. The broader `build:private` bootstrap remains blocked by the pre-existing missing owner-supplied `pokemon-kanto-art.bin`; this scoped compile does not claim that bootstrap passes.

`canonical/devices/generations/viewer-r08.json` records source hashes, screenshot hashes, measured checks and limitations. The viewer uses different lighting and a thin glass approximation; its appearance differs from Cycles and small text aliases at default phone scale. No physical-phone GPU benchmark, complete game integration, era unlock or Kevin approval is claimed. These remain selectable review candidates.
