Failed numerical gates: exactParentChainAndRetainedCoordinates.

The actual r18 body has 121,980 vertices and 243,960 triangles. Every retained r15 coordinate is exact. Direct frozen-source checks preserve all 113,062 protected vertices and 226,039 oriented triangles. Both horns, root rings and their incident triangles, all 289 r15 fairing vertices, and the flame remain exact.

| Gate | Status |
| --- | --- |
| exportAuditBijections | PASS |
| exactParentChainAndRetainedCoordinates | FAIL |
| oneSceneFourMeshes | PASS |
| expectedBodyCounts | PASS |
| protectedFrozenCoordinatesAndOrientedTrianglesExact | PASS |
| allExteriorOrientedTrianglesExact | PASS |
| hornsAndRootsAndIncidentTrianglesExact | PASS |
| divotFairingVerticesExact | PASS |
| flameExact | PASS |
| bodyTopologyAndDegeneracy | PASS |
| allOrbitalAndEyeGates | PASS |
| commonExpandedHeadNoDetectorPairs | PASS |

| Orbital/eye gate | Side +1 | Side −1 |
| --- | --- | --- |
| fixedBoundaryEdgesAndCoordinatesExact | PASS | PASS |
| orbitalPatchIsOneOrientedDisk | PASS | PASS |
| annulusTriangleCountMatchesReceipt | PASS | PASS |
| noAnnulusProjectionReversals | PASS | PASS |
| noAnnulusProjectedAreaAtMost1eMinus12 | PASS | PASS |
| bodyLocalNoDetectorPairs | PASS | PASS |
| bodyLocalNoStrictCrossings | PASS | PASS |
| bodyPatchNoSharedVertexOverlap | PASS | PASS |
| bodyEyeNoDetectorPairs | PASS | PASS |
| bodyEyeNoStrictCrossings | PASS | PASS |
| eyeNoDetectorPairs | PASS | PASS |
| eyeNoStrictCrossings | PASS | PASS |
| eyeNoSharedVertexOverlap | PASS | PASS |
| eyeTopologyAndDegeneracy | PASS | PASS |
| allEyeVertexDistanceSamplesPositive | PASS | PASS |

Side +1 (GEO-charizard-eye-1-r18): 76 fixed boundary edges, 492 annulus triangles, 192 wall triangles and 96 floor triangles. Minimum signed projected annulus area is 1.49486241e-07; the minimum sampled eye-to-body distance is 0.000105598054.
Local detector/strict counts: {'body-body': {'detectedPairs': 0, 'strictConfirmedPairs': 0}, 'body-eye': {'detectedPairs': 0, 'strictConfirmedPairs': 0}, 'eye-eye': {'detectedPairs': 0, 'strictConfirmedPairs': 0}}. Shared-vertex overlaps: body 0, eye 0.
Minimum triangle angles by surface: annulus 0.37644°, wall 1.00206°, floor 0.508432°. Thin-triangle indices are recorded separately from the degeneracy gates.

Side -1 (GEO-charizard-eye--1-r18): 83 fixed boundary edges, 511 annulus triangles, 192 wall triangles and 96 floor triangles. Minimum signed projected annulus area is 4.24214344e-07; the minimum sampled eye-to-body distance is 0.000107520027.
Local detector/strict counts: {'body-body': {'detectedPairs': 0, 'strictConfirmedPairs': 0}, 'body-eye': {'detectedPairs': 0, 'strictConfirmedPairs': 0}, 'eye-eye': {'detectedPairs': 0, 'strictConfirmedPairs': 0}}. Shared-vertex overlaps: body 0, eye 0.
Minimum triangle angles by surface: annulus 3.63158°, wall 0.965283°, floor 0.568543°. Thin-triangle indices are recorded separately from the degeneracy gates.

The rejected r09 had 27 / 48 projection-reversed skin triangles, 37 / 38 confirmed skin self-crossing pairs, and 152 / 164 confirmed body–eye pairs, with rear poles approximately 0.00492 inside the body. The r18 per-gate results above directly test those two mechanisms.

This report covers the actual exported geometry and recorded local regions. It does not grant visual approval or certify whole-body intersection freedom. Eye signed distances are vertex samples, not a global surface-clearance certificate. Failure indices and full overlap records are in the adjacent JSON; rows refer to exported triangles/vertices of the named mesh, never native Blender polygon IDs.

Rerun validate_orbital_cdt.py with the Hunyuan Python environment. Explicit --r04-root/--r03-root/--candidate-dir support regenerated ancestry. Default artifact paths remain private when the script is copied into tools/charizard-face/audit; imports prefer sibling repository head/root audit helpers, with private fallbacks.
