# R29 sculpt-density preflight

Intake is retained r28A. No sculpt strokes were made.

Native duplicate → Convert Mesh froze Subsurf1 to 224 vertices. Three native linear subdivisions produced 14210 vertices/14208 faces. Initial Shift-R attempts repeated selection rather than subdivide; count inspection caught this, and explicit Subdivide plus repeat completed density. All faces smooth, no sharp edges or custom normals. Nevertheless renders expose the coarse source facets: linear geometry subdivisions do not preserve the original smooth normal interpolation at inserted interior vertices. Density preflight rejected.

A fresh duplicate of intake used native Ctrl4 → Convert Mesh to produce the same density directly from a higher Catmull-Clark level. It is smooth, but rounds the aperture and muzzle relative to A. Root inspected front/threequarter closeups and rejected this as an unchanged starting surface. No sculpt performed on either variant; intake restored. Both sources and renders preserved.

Max planner has the evidence and is reconsidering the construction method. Do not claim dense preflight passed or proceed with sculpt on an unreviewed shape change. No production transition.
