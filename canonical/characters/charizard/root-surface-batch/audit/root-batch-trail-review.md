# Root-surface batch trail review

Reviewed by **gpt-6-astra** at xhigh reasoning effort. This is a same-GPT-family review and does not provide different-family model diversity.

## Outcome

No blocker was found to retaining r02e as the next local geometry checkpoint. The six `charizard-root-*` decision rows match the bounded transcript and saved artifacts: r02b is visibly insufficient; r02c has 48 reversed triangles and 50 detected local pairs; r02d removes the reversals but has 12 independently confirmed strict crossings; r02e replaces the measured strip and passes all eight stated CPU gates. The reports keep the whole-model, anatomy, UV/PBR, rig, animation, game-promotion, and real-phone predicates open.

Fresh replay evidence supports the exactness claim. `reproduction-root-final/comparison-r02e.json` reports exact vertex and triangle arrays for both mesh nodes, exact node transforms, all six topology-audit arrays exact, the native patch JSON exact, and all eight decoded render arrays pixel-exact. The original and replayed r02e reports both pass the same eight scoped checks.

The protected-geometry claims are supported. The validator maps exported vertices bijectively to the NPZ rows, confirms all 112,475 protected r02a vertices and 224,371 protected oriented triangle triples remain exact, accounts for the 41 removed vertices, 61 removed native polygons, and 27 replacement triangles, and verifies the 29-vertex patch boundary. The local intersection comparison uses the same saved wider-root AABB for r02a, r02d, and r02e and correctly limits its conclusion to triangles selected by that AABB. It does not prove whole-model or flame/body intersection freedom.

## Attention

1. **Replay input hashes are recorded after the fact but are not enforced by the replay command.** `reproduce_root.py` verifies only the r02a Blender file. `root_region.py` then reads the absolute r02a `vertex-audit.npz`, `repair_root_strip.py` reads the absolute `r02d-intersection-details.json`, and `render_candidate.py` reads the absolute framing JSON without checking their pinned hashes. The completed replay is exact, so this does not invalidate this checkpoint. A later replay can consume drifted dependencies before the comparison catches the mismatch. The replay should resolve these records from the batch manifest and verify each hash before Blender authoring starts.

2. **The root-cause diagnostic has one unpinned input.** `root_audit/diagnose_ribs.py` reads the official raw Hunyuan GLB to classify original-source vertices, but `rib-measurements.json` omits that GLB from its `inputs` hash map and the batch manifest's `dependencies` omit it. Add the raw GLB path, hash, and size if the surface diagnosis is intended to be independently rerunnable.

3. **Manifest verification accounting omits one record.** The manifest contains 176 path/hash/size objects when `source.parentManifest` is included. `collect_root_batch.py` reports and rechecks the 175 objects in `files`, `replayFiles`, `dependencies`, `scripts`, and `reports`; it leaves `source.parentManifest` outside that loop. That parent record resolves and matches its current bytes and SHA-256, but the claimed verified-record total should either include it or explicitly exclude it.

The visual review is directionally supported by the matched close-ups: r02b leaves the ribs, r02c exposes a broken lower crease, r02d smooths the outer surface while retaining the inner crossing, and r02e removes that visible crossing. The r02e viewport capture is very washed out and is weak standalone evidence, but the matched renders, inner comparison, GLB reopen receipt, browser receipt, and exact replay provide the material evidence.

## Resolution check

All three attention items were resolved in the current source and evidence before delivery. `reproduce_root.py` now checks the recorded size and SHA-256 for `source.parentManifest` and every batch dependency before loading Blender data. Those dependencies include the r02a audit array, r02d crossing details, framing JSON, and official raw GLB. `diagnose_ribs.py` now includes that raw GLB in its output input-hash map, and the rerun measurements are unchanged apart from the expanded provenance. `collect_root_batch.py` now includes `source.parentManifest` in both its verification loop and reported count.

A second replay in `reproduction-root-pinned` completed through r02e after the preflight change. Its comparison again reports exact geometry for both meshes, exact transforms, all six topology arrays exact, the native patch exact, and all eight images pixel-exact. The later `blender-viewport-confirmed.png` was independently opened for this review and is legible; the stale weak capture remains identified as such in `visual-review.md`.

At review close, the final manifest refresh was deliberately deferred until after this report so the report itself can be copied and hashed once. The then-current manifest therefore still had stale hashes for the subsequently edited collector and visual review. This is a packaging step, not an evidence defect; delivery should proceed only after the final collection pass verifies the complete record set with no mismatches.
