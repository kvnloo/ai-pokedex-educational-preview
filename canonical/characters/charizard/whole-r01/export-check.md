Bounded working-sculpt export check.

Blockers: none found in the tested scope.
Risks: GEO-charizard-body-whole-r01: repeated, duplicate or near-zero-area triangles; exact IDs/counts are recorded.; Eye side +1: 312 confirmed body-eye crossing pairs in the orbital region.; Eye side +1: 28 sampled eye vertices lie inside the closed body.; Eye side -1: 30 confirmed body-eye crossing pairs in the orbital region.; Eye side -1: 6 sampled eye vertices lie inside the closed body..

| Mesh | Vertices | Triangles | Components | Boundary / excess-incidence edges | Winding | Area ≤1e-14 |
| --- | ---: | ---: | ---: | --- | --- | ---: |
| GEO-charizard-flame-whole-r01 | 4516 | 9028 | 1 | 0 / 0 | consistent | 0 |
| GEO-charizard-eye--1-whole-r01 | 3074 | 6144 | 1 | 0 / 0 | consistent | 0 |
| GEO-charizard-eye-1-whole-r01 | 3074 | 6144 | 1 | 0 / 0 | consistent | 0 |
| GEO-charizard-body-whole-r01 | 159251 | 318502 | 1 | 0 / 0 | consistent | 40 |

All mesh finite/index checks and capture-count correspondence are recorded separately in JSON. No frozen-coordinate constraint is imposed on this broad sculpt.

The body has 40 exact zero-area triangles; 40 contain an exact edge midpoint. R18 had no triangles at or below the tested area threshold. Dense location evidence is in NPZ.

| Eye side | Body-eye detector / confirmed pairs | Orbital body-body detector / confirmed pairs | Sampled eye vertices inside body | Minimum sampled signed distance |
| --- | --- | --- | ---: | ---: |
| +1 | 312 / 312 | 0 / 0 | 28 | -0.000420072436 |
| -1 | 30 / 30 | 0 / 0 | 6 | -0.000318214647 |

The eye meshes themselves are unchanged from r18. Their prior zero body-eye crossings become shallow overlaps after rim sculpting. Numerical overlap between independent eye/body meshes is a visual-review risk, not automatically a blocker for this working sculpt.

Actual export triangle indices and representative crossing centers are in JSON; complete pair and clearance arrays are in NPZ. These counts cover the two recorded orbital regions. They do not certify whole-body intersection freedom, visual/anatomical quality or runtime readiness. This remains a working sculpt.
