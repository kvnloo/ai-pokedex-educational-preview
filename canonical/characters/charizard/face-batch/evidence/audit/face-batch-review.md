# Face/skull batch trail review

Reviewed 2026-09-06 UTC. Reviewer runtime: `gpt-6-astra` with xhigh reasoning. This is a same-family GPT review; it does not add cross-family or human approval.

## Outcome

No blocking finding remains for the limited `charizard-head-r18` skull/eye checkpoint. The evidence supports the claimed local changes, rejected branches, replay, and numerical gates. It does not support promotion of the full character: muzzle, jaw, eyelids, expression, deformation topology, UV/PBR, rigging, animation, game integration, S+ quality, physical-device acceptance, and whole-body intersection clearance remain open.

## Evidence checked

- Read the current `docs/charizard-face/{PLAN,README}.md`, all `tools/charizard-face` authoring/replay/registration/packaging sources and CPU validators, the 15-record `canonical/characters/charizard/face-batch/inputs.json`, six experiment records, and the `charizard-face-*` decision rows in canonical discovery history.
- Verified the registered recipe hashes against the preserved per-candidate source copies and the registered GLB hashes against r07, r09, r13, r14, r15, and r18.
- Read the r07, r09, r15, and r18 numerical reports and receipts. The r09 strict counts sum to 75 body/body and 316 body/eye pairs. The r15 report has 14 passing local gates. The r18 report has 12 passing global gates and 15 passing gates for each eye, with the documented 76/83-edge boundaries, zero tested detector/strict/shared-vertex overlaps, and positive sampled eye-vertex distances.
- Read the r08, r10-r12, r16, and r17 failure traces, diagnostics, and preserved failed recipes. Their assertion/error points match the decision trail. r09 and r13 remain preserved exported rejects; r14 remains an intermediate.
- Checked `reproduction-r18-final/comparison.json`: `allExact` is true for r07, r14, r15, and r18. It compares ordered decoded positions, triangles, transforms, vertex colors, every recorded NPZ array, 44 standard images, five r18 face-color images, and three r15 skull images (52 images total).
- Checked the original, final-reproduction, and tracked-validator reports. All current global/eye gates pass. The regenerated r15 GLB has a different byte hash, while its decoded body/flame coordinates, oriented faces, transforms, colors, normals, attribute/index values and accessor semantics match the independently pinned original r15 reference exactly.
- Visually inspected representative actual evidence: r09 and r18 face close-ups, r13 and r15 skull close-ups, the reopened-r18 Blender UI, phone preview, and r09/r18 browser comparison. They support the recorded improvement and the stated rough muzzle/jaw, provisional palette, jagged iris edge, and unfinished expression limits.

## Findings and resolutions

1. **Resolved — replay validator initially rejected an equivalent regenerated parent.** The earlier validator required the regenerated r15 GLB byte hash to equal the original export hash. `audit/reproduction-r18-validation.json` preserves that false failure. The current validator independently checks that the frozen reference still has its expected SHA256, then requires decoded structural and array equivalence. `audit/reproduction-r18-final-validation.json` and `audit/tracked-reproduction-r18-final-validation.json` pass while honestly recording `regeneratedParentByteHashEqualsReference: false` and `decodedParentEquivalent: true`.

2. **Resolved — unqualified flame exactness overstated attribute preservation.** r18 preserves flame geometry and its evaluated world transform, but `build_eyes_cdt.py` adds a neutral inspection vertex-color attribute to copied meshes. The README, registration control, and manifest builder now state exact flame geometry/transform and disclose that the display-color attribute differs from the parent.

3. **No additional replay or registration regression found.** `replay.py` verifies all 15 source/camera/selection/recipe records before loading or executing them, derives the r07 selection from freshly generated ancestry, evaluates the loaded parent scene before copying transforms, and feeds each generated stage to the next. Registration uses the frozen source copy stored with each candidate, retains rejected/intermediate verdicts, records actual GLB counts/hashes, and leaves human reviews separate. The first replay's script/input snapshot and comparison preserve the unevaluated-flame failure; the expanded replay preserves the alpha mismatch and its old `render_divot.py`; the final recipe explicitly sets transparent film for those three views.

## Residual limits

The CPU tests are bounded to recorded head/orbital regions. Signed distances sample eye vertices and do not certify continuous surface clearance. Shared-vertex checks use stated tolerances and do not cover the whole character. One r18 annulus triangle has a 0.376-degree minimum angle, so the result is not deformation-ready. The current renders show a materially cleaner eye rim and skull patch, while also showing enough rough anatomy to justify the `needs-work` verdict. Field OS release `f85e3ae295feec02` is outside this batch and remains unchanged.
