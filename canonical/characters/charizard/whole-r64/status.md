# R64 rejected: axis setup failed and underside artifacts

Attempted native SmoothVertices .5 repeat30 with X/Z disabled via F9. Audit proves actual YZ movement (X0,Y.00380853,Z.00300929); intended depth-only constraint NOT achieved. Render shows lower strip stippling/artifacts. Reject and restore R63 retained. Do not call this a valid Y-only experiment or continue this bottom-reaching selection.

Planner arrived with better interior crescent: (X/.235)^2+((Z+.30)/.235)^2<1,-.53<Z<-.30,Y<-.45 excludingall6770R63IDs. Confirm outline/hip exclusion visually, nativeXYZ .5repeat30 once. Not executed yet.
