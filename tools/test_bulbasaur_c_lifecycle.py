#!/usr/bin/env python3
"""All-frame Blender action teardown and 19x19 transition-matrix gate."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import bpy

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from bulbasaur_animation_blender_adapter import BlenderActionLifecycleAdapter

ROOT = Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve(strict=True)
BLEND = ROOT / "bulbasaur_C_animated.blend"
if Path(bpy.data.filepath).resolve() != BLEND:
    raise RuntimeError(f"wrong blend: {bpy.data.filepath}")

marker_contract = json.loads((ROOT / "animation-markers.v1.json").read_text())
lifecycle_contract = json.loads((ROOT / "effect-lifecycle.v1.json").read_text())
rig = bpy.data.objects["RIG_Bulbasaur_C"]
clips = [entry["clip"] for entry in marker_contract["clips"]]
entries = {entry["clip"]: entry for entry in marker_contract["clips"]}
adapter = BlenderActionLifecycleAdapter(
    bpy_module=bpy,
    rig=rig,
    marker_contract=marker_contract,
    lifecycle_contract=lifecycle_contract,
)

failures: list[dict[str, object]] = []
transition_count = 0
owner_frame_transition_count = 0


def assert_reset(name: str, detail: dict[str, object]) -> None:
    if not detail["canonicalReset"]:
        failures.append({"name": name, "detail": detail})


# Complete 19x19 action matrix at a representative source frame. Every target
# starts at its first frame, where action-local curves and explicit teardown must
# agree on the canonical reset state.
for source in clips:
    source_entry = entries[source]
    source_frame = (source_entry["startFrame"] + source_entry["endFrame"]) // 2
    for target in clips:
        adapter.switch_action(source, source_frame)
        adapter.contaminate_all_effects()
        adapter.switch_action(target, entries[target]["startFrame"])
        transition_count += 1
        assert_reset(f"matrix-{source}-to-{target}", adapter.reset_snapshot())

# The four effect-owning actions are tested at every source frame against every
# possible target, not only at their declared active windows.
for source in ("vine_whip", "razor_leaf", "tackle", "growl"):
    source_entry = entries[source]
    for source_frame in range(source_entry["startFrame"], source_entry["endFrame"] + 1):
        for target in clips:
            adapter.switch_action(source, source_frame)
            adapter.switch_action(target, entries[target]["startFrame"])
            owner_frame_transition_count += 1
            assert_reset(
                f"all-frame-{source}-{source_frame}-to-{target}",
                adapter.reset_snapshot(),
            )

expected_owner_frames = sum(entries[name]["endFrame"] - entries[name]["startFrame"] + 1 for name in ("vine_whip", "razor_leaf", "tackle", "growl"))
if transition_count != 19 * 19:
    failures.append({"name": "transition-count", "detail": transition_count})
if owner_frame_transition_count != expected_owner_frames * 19:
    failures.append({"name": "owner-frame-transition-count", "detail": owner_frame_transition_count})
if set(lifecycle_contract["actions"]) != set(clips):
    failures.append({"name": "lifecycle-action-set", "detail": lifecycle_contract["actions"]})
if set(lifecycle_contract["effects"]) != {"vine_whip", "razor_leaf", "tackle", "growl"}:
    failures.append({"name": "lifecycle-effect-set", "detail": sorted(lifecycle_contract["effects"])})

payload = {
    "schemaVersion": 1,
    "status": "PASS" if not failures else "FAIL",
    "transitionMatrixCount": transition_count,
    "allOwnerFrameTransitionCount": owner_frame_transition_count,
    "expectedOwnerFrameTransitionCount": expected_owner_frames * 19,
    "failures": failures,
}
print("LIFECYCLE_QA_JSON " + json.dumps(payload, sort_keys=True))
if failures:
    raise RuntimeError(f"lifecycle QA failed: {len(failures)} failures")
print("LIFECYCLE_QA_PASS")
