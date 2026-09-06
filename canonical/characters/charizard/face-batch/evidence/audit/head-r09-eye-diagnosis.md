The exported r09 has two separate defects: folded skin between the original socket boundary and the new opening, and eye rear closures that cross the socket floors. This is a local diagnosis of the rejected intermediate, without anatomical approval.

| Eye node | Root vertices | Skin triangles reversed in outward eye projection | Strictly confirmed skin self-crossing pairs | Strictly confirmed body–eye pairs | Rear pole signed body distance |
| --- | ---: | ---: | ---: | ---: | ---: |
| `GEO-charizard-eye-1-r09` | 76 | 27 | 37 | 152 | −0.0049237423 |
| `GEO-charizard-eye--1-r09` | 83 | 48 | 38 | 164 | −0.0049134791 |

Each skin patch has six complete rings: level 0 is the unchanged root and level 5 is the inner opening. Band 0 joins levels 0–1; band 4 joins levels 4–5; band 5 is the socket floor fan. All projection reversals occur in bands 0–3, with most confirmed skin crossings between bands 1–2. “Projection reversed” means the triangle normal faces away from the outward eye viewing direction; it does not assert inconsistent topological winding.

The root boundaries backtrack in eye-plane polar angle 5 times on side +1 and 8 times on side −1. Both opening contours have monotone angular order, and all their sampled vertices lie inside the corresponding projected root polygon. Sampling is very uneven: side +1 opening edge lengths range from 0.00001727 to 0.01225353. Together with the actual crossings, this supports inconsistent correspondence through the annulus as the cause of the fine wrinkles. Angular backtracking alone would not prove a defective surface.

The next rim pass should establish a shared, monotone correspondence through the annulus, with sufficiently even sampling and an intermediate contour that accommodates the irregular fixed root. Preserve the root's actual cyclic edge connectivity: sorting the existing root vertices by polar angle would reconnect the boundary. A constrained annular remesh or a new correspondence that permits different ring sampling is more appropriate than additional smoothing of these folded strips. Check projected triangle orientation and actual intersections before adding the final depth profile.

Representative confirmed skin crossings, using **exported r09 body triangle rows**, are `[120611,152669]` near `(-0.17717,-0.80254,0.55338)` on side +1 and `[117174,118943]` near `(-0.00827,-0.83370,0.52288)` on side −1. The first also crosses the retained exterior face immediately outside the root. The JSON records every pair, bounds, and band; the NPZ records ring membership.

The rear closure defect is independent. All 152 / 166 body–eye detector pairs involve socket floor band 5; 152 / 164 are independently confirmed as proper interior edge–triangle crossings. Only one sampled eye vertex per side is inside the closed body, but its rear fan crosses many floor triangles. The offending eye vertices are:

| Eye node | Exported eye vertex row | Blender-space position | Nearest body triangle row |
| --- | ---: | --- | ---: |
| `GEO-charizard-eye-1-r09` | 2433 | `(-0.1394724846,-0.7554507256,0.5407324433)` | 128959 |
| `GEO-charizard-eye--1-r09` | 2657 | `(-0.0482085235,-0.8081420660,0.5407324433)` | 246105 |

Resolve the rear closure and socket floor together, then check clearance across complete rear triangles. Vertex-only clearance is insufficient: all other sampled eye vertices are outside the body while the rear fans still cross it. The front poles are approximately 0.0155 outside the body, so the rear closure can be investigated separately from the visible front profile.

The actual body export rows exactly equal `eye-audit.npz` after rows. Eye indices belong to their named eye mesh. Triangle rows are exported indices, not native Blender polygon IDs. Open3D found 38 skin pairs per side and 152 / 166 body–eye pairs; one skin pair and two body–eye pairs remain unconfirmed and are excluded from the strict counts above. Tests cover the two recorded eye AABBs plus the eye meshes, skip shared-vertex pairs, and do not certify the whole model. Signed distances are sampled at eye vertices.

Evidence: [numerical receipt](/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/audit/head-r09-eye-diagnosis.json), [rerunnable CPU inspection](/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/audit/diagnose_eye_rims.py), and [ring/clearance arrays](/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/audit/head-r09-eye-diagnosis.npz). Source GLB SHA-256: `50a4c73e8d921b872be62c2df96bbb7b4af01c8434abb28c842d71829dedf215`.
