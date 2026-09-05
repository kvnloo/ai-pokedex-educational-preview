# Exported surface candidate validation

r02d retains the PCA fit's visual improvement and passes the protected-geometry and tested topology checks. Its local intersection check fails. It is not numerically accepted as-is.

| Candidate | Reversed baseline triangles | Local intersection pairs | New pairs against r02a | Signed-volume change |
| --- | --- | --- | --- | --- |
| r02a | 0 | 2 | 0 | 0.000000% |
| r02c | 48 | 50 | 50 | 0.001111% |
| r02d | 0 | 12 | 12 | 0.005466% |

Every one of the 122377 stable NPZ rows maps bijectively and exactly to its corresponding GLB. All 112475 zero-weight rows remain unchanged in r02d. The protected oriented triangle triples remain exact, as do the flame's world vertices and triangles. Both body and flame pass the closed-surface edge-incidence, winding and tested triangle-degeneracy predicates.

The r02d signed-volume change is 0.005466 percent and surface-area change is -0.028937 percent. The sampled low-left Y-section areas change by between -0.199467 and 0.122834 percent. This provides no evidence of material overall shrinkage. These section areas are not perpendicular anatomical thickness measurements.

The common region is wider than the earlier tail-join-only audit. It finds two pre-existing r02a intersections in the source region. r02d's twelve reported pair keys are all different from those two. Independent edge/triangle solves in r02d-intersection-details.json confirm strict interior intersections for all twelve.

The crossings form one narrow seam/collar strip involving 18 stable vertices and 16 triangles. Their combined triangle bounds are X[-.504774,-.484936], Y[.149250,.250910], Z[-.475182,-.466104]. Their original pair clearances were only .000060388 to .000145799. The largest intersection segment is .022372340 long. This supports local cleanup of the narrow collar strip while preserving the useful fitted surface elsewhere. It does not support treating the intersections as roundoff.

Rerun validate_surface_candidates.py with the Hunyuan Python environment. It reads frozen r02a, r02c and r02d GLBs and stable-ID NPZ files, then writes only diagnosis JSON/Markdown. Run inspect_intersection_pairs.py for the independent crossing confirmation and exact centers, gaps and stable triangle IDs. Scripts produce no edited mesh or coordinate proposal.

Open3D only checks body triangles whose AABBs overlap the common selected-region bounds expanded by .01. Numerical and shared-vertex limitations apply. No whole-model or separate flame/body intersection freedom is claimed. Artistic acceptance remains a visual decision.
