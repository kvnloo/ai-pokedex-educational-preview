# Root refinement diagnostic

All 249 bridge faces already use smooth shading. BVH found zero nonadjacent triangle overlaps involving bridge faces; shared-vertex pairs were excluded, so this is not a complete intersection certificate.

A single native Smooth Vertices operation (factor .5, repeat 1, XYZ) changed 249 selected vertices, maximum displacement .01571958, zero changes outside selection. The inspected refine-root.png still shows the sawtooth join. Trial saved privately as charizard-home-r73-refine.blend and reverted to charizard-home-r73-bridge.blend. Do not repeat smoothing. Repair root strip spacing/correspondence; transition has not passed. R67 remains retained.
