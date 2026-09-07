# R72 scale-aware QuadriFlow — produced and rejected

MAX source review found Blender rejects componentwise-near endpoints at local-coordinate tolerance1e-4, in addition to manifold/winding checks. Open boundaries are allowed; the temporary cap was unnecessary. Source: https://github.com/blender/blender/blob/main/source/blender/editors/object/object_remesh.cc#L681-L737

Exact predicate on cleaned wing found119 offending edges. Reloaded raw separated wing (not cleaned or capped). Native Edit Mode scale1000 produced zero offending edges. The initial scale used original selection median; recovered its fixed pivot from original/scaled means and set cursor there before inverse scale, preventing remeshed-median drift. Same2000target, boundaryon, symmetryoff, seed0 then succeeded. Native Edit scale.001 around fixed cursor, native Shade Smooth.

Output1635vertices1614faces42boundaryedges,0overconnected. This is not a faithful root loop replacement (original207). Root inspected actual front/side/rear/threequarter renders. REJECT: heavily angular/torn scallop outline, changed outerrim shape, root seam. No resolution series or refinement of distorted cage. R67 reopened and verified. This establishes a reproducible input workaround but no asset-quality improvement.

XHIGH independently opened all4: unequivocal rejection. Ragged stepped cutouts/blunt scallop points, kinked/thinned outer border, broken root transition and rear diagonal opening. Smoother shading does not compensate.
