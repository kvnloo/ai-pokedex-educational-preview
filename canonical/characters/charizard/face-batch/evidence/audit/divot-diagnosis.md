# r06 posterior crease: location and bounded support

The visible crown in `divot-baseline/top.png` is higher than the initial approximate seed. Using that image's saved orthographic camera, pixel (527,509) intersects the existing r06 surface at **(.002377777,-.620977802,.458699539)**. Its nearest audit/export vertex is **122385**, at (.002784247,-.620898783,.459500849). The intersected exported triangle is 244762; its normal's Z component is only .170810, consistent with a steep surface there.

The old lower cap pole is **r06 audit/export vertex 81005**, at **(.000004750,-.619211435,.439355433)**. It retains **valence 92**. The upper cap pole, 81006, retains valence 66. The lower pole and visible crown differ by about .020 in height across a small horizontal separation; this is a sharp skull/neck transition. It is separate from the inherited near-contact/sliver near X=-.155, Y=-.696.

The original seed (-.025,-.59,.4) lands lower on a locally convex neck surface. Its nearest vertex is 73884; plane-neighborhood measurements do not support calling that vertex the center of a concave pit. Use the measured crown and lower cap pole for the next visual check.

A conservative connected working region is centered on **81005**, with an **inner geodesic radius .050** and **outer support radius .065**. The inner region contains 1,237 vertices and the outer region 1,389. Outer bounds are X[-.060647115,.043573860], Y[-.666946530,-.587868035], Z[.384399295,.493612736]. Both regions contain no protected vertices, no new horn vertices, and no horn-root vertices. Exact existing IDs and fixed boundary cycles are in `divot-patch-neighborhoods.npz/json`.

The density and the 92-edge pole support trying a **local patch replacement with more even connectivity, followed by constrained surface fairing**, while fixing the outer boundary and matching its adjoining surface directions. This targets the old cap/pole transition. A further broad Laplacian pass is poorly targeted: earlier passes already moved the cap region substantially while preserving this crease.

This is an operator and support-region recommendation, not a replacement surface or target coordinates. The numerical neighborhood does not establish the intended anatomy. Confirm the complete visible crease lies inside the chosen working region in Blender before replacing the patch; the far side cusp can extend beyond the inner radius. Keep the horn roots, eye region and exterior coordinates fixed, and validate the authored result's triangle quality, local intersections and boundary continuity.

Rerunnable measurements are in `diagnose_remaining_head.py`, with detailed camera rays, ancestry and radius sweeps in `head-r06-remaining-diagnosis.json`. The supplementary patch receipt distinguishes existing face and vertex IDs. No mesh is authored by these diagnostics.
