# Review resolutions

The independent reader found no blocker to the local r02e checkpoint and identified three reproducibility gaps. Root resolved them before the milestone commit.

1. `reproduce_root.py` now verifies the parent manifest and every dependency record before loading or authoring Blender data. The inputs include the frozen r02a audit, the measured crossing details and camera framing file.
2. The original official-input Hunyuan GLB is now a manifest dependency and a hashed input in the rib diagnostic. Rerunning the tracked diagnostic gives exactly the same measurements apart from the added input record.
3. Manifest collection verifies the parent-manifest record along with every grouped file record. The final reported count includes it.

`reproduction-root-pinned` completed with the new input checks and matches both exported meshes, transforms, all six topology arrays, native patch receipt and all eight rendered views exactly. An initial comparison command ran before the Blender process finished and failed because the GLB did not exist yet; it was rerun after process completion. No candidate artifact was changed in response to that command-order error.

The first saved full-UI screenshot retained the preceding camera frame. The native viewport image displayed after redraw was correct. Root saved a separate `blender-viewport-confirmed.png` in a later MCP call and inspected the actual file. The weak earlier capture remains pinned as failed evidence; the confirmed capture and matched renders support the visual review.

The reviewer reports GPT-6 Astra; this is a separate reader within the same available model family. It is not claimed as a different-family review or Kevin's artistic acceptance. Full anatomy, deformation topology, UV/PBR, rig, clips, attacks and real-device acceptance remain open.
