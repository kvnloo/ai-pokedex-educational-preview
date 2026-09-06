R03 export integrity and r02 tail-evidence transfer.

Blockers: none within this scope.

The four mesh counts match capture; all four are finite, closed, consistently wound single components with zero zero-area triangles.

The body changes 16,798 vertices. The changed IDs and restored coordinates match face-rollback.npz exactly.

All 22,935 selected tail coordinates and their incident oriented triangles remain exact. The entire 85,611-triangle contact-test region also has exactly the same vertices, coordinates and oriented triangles as r02. Therefore the prior test transfers without rerunning intersection detection.

Transferred result: zero tail-to-rest-of-body detector pairs, zero strictly confirmed tail self-crossings, four positive-gap detector candidates. Full counts and candidate locations remain linked in JSON.

The four inherited detector candidates have positive computed gaps of 1.518e-5 to 3.001e-5, with zero confirmed strict crossings; detector count alone does not justify mesh repair.
Transferred coverage excludes shared-vertex overlaps/adjacent-face foldovers, separate eye/flame contacts and body regions outside the recorded tail test. No minimum-clearance or anatomical/runtime certificate is implied.
