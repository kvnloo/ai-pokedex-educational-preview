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

Actual GLBs pass the glTF Validator's error checks. Warnings concern runtime-generated tangent bases: 31 for v2, 37 for v3. Tangents remain omitted because the established exporter path can emit invalid vectors on tiny bevel faces; this portability compromise is retained explicitly, not counted as a warning-free pass. Reopened geometry has finite vertices/transforms, UVs, no zero-area triangles and plausible sampled bounds.

Both actual exports contain Closed, Opening, BootUp, Ready, Idle and ButtonPress with the intended durations. Blender reopening samples all clip starts, midpoints and endpoints, plus the pressed interval. Lid angles, screen wake, idle emission variation and 0.55 mm button travel pass. Light breathing uses normalized TRS signal nodes bound to emission; solid rings do not expand. The runtime must apply those signals after its animation mixer.

Unwarped reference comparisons use the stopped worker's native-crop perspective cameras. V2 silhouette IoU is 0.959 closed / 0.947 open; v3 is 0.930 / 0.911. These are diagnostics against a hand trace, not artistic acceptance scores. The camera/header, seam treatment, control shape, spine widths and lighting still differ. The placeholder scanner and list are intentionally replaceable and differ from the reference UI. Individual matched renders and overlays were visually inspected; the source was also orbited in the actual Blender desktop viewport.

## Pending before the complete batch

Full rendered videos are still running. Inspect actual playback, not merely completion logs. Finish neutral front/back/side/three-quarter clay and material stills, underside and hinge/control/port closeups; inspect reopened-GLB appearance. Then add the minimal runtime viewer hook and verify gestures/playback before marking the batch complete. No production-readiness, perfect asset, canonical-era completion or complete-game claim is made here.

Phone reference comparison: `https://0.taila30dc.ts.net:8445/devtools/pokedex-generations.html`. It currently exposes only rendered comparisons and evidence; the full-video indicator remains pending until playback review. The existing 5185 research server was restored after finding its old endpoint returning 502. Existing selection/review APIs and 5193 game preview were preserved.

Source/scripts/manifests live on `codex/pokedex-generations`; binaries remain under `/mnt/zer0models/pokemon-iac/devices/pokedex/{v002,v003}/astra-r08`. No push or merge.
