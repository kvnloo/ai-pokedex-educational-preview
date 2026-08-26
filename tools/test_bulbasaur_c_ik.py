#!/usr/bin/env python3
"""Focused all-frame quadruped IK continuity gate for Bulbasaur C."""
from __future__ import annotations

import json
import os
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve(strict=True)
BLEND = ROOT / "bulbasaur_C_animated.blend"
if Path(bpy.data.filepath).resolve() != BLEND:
    raise RuntimeError(f"wrong blend: {bpy.data.filepath}")

rig = bpy.data.objects.get("RIG_Bulbasaur_C")
if rig is None:
    raise RuntimeError("RIG_Bulbasaur_C missing")
contract = json.loads((ROOT / "animation-markers.v1.json").read_text())
entries = {entry["clip"]: entry for entry in contract["clips"]}
feet = ("foot.front.L", "foot.front.R", "foot.rear.L", "foot.rear.R")
locomotion_clips = ("walk", "trot_run", "start", "stop", "turn_90", "turn_180", "tackle")
failures: list[dict[str, object]] = []
metrics: dict[str, object] = {}


def fail(name: str, detail: object) -> None:
    failures.append({"name": name, "detail": detail})


def action_paths(action: bpy.types.Action) -> set[str]:
    return {
        curve.data_path
        for layer in action.layers
        for strip in layer.strips
        for bag in strip.channelbags
        for curve in bag.fcurves
    }


for foot_name in feet:
    region, side = foot_name.split(".")[1:]
    lower_name = f"leg.{region}.{side}.lower"
    ik_target = f"CTRL.ankle.{region}.{side}"
    pole_target = f"CTRL.pole.{region}.{side}"
    heel_target = f"CTRL.heel.{region}.{side}"
    for required in (ik_target, pole_target, heel_target):
        if required not in rig.pose.bones:
            fail(f"{foot_name}-missing-control", required)
    terminal_copy = [constraint.name for constraint in rig.pose.bones[foot_name].constraints if constraint.type == "COPY_TRANSFORMS"]
    if terminal_copy:
        fail(f"{foot_name}-terminal-copy-transforms-forbidden", terminal_copy)
    ik_constraints = [constraint for constraint in rig.pose.bones[lower_name].constraints if constraint.type == "IK"]
    if len(ik_constraints) != 1:
        fail(f"{foot_name}-ik-count", len(ik_constraints))
    else:
        ik = ik_constraints[0]
        actual = {
            "target": ik.target.name if ik.target else None,
            "subtarget": ik.subtarget,
            "poleTarget": ik.pole_target.name if ik.pole_target else None,
            "poleSubtarget": ik.pole_subtarget,
            "chainCount": ik.chain_count,
            "useStretch": ik.use_stretch,
        }
        expected = {
            "target": rig.name,
            "subtarget": ik_target,
            "poleTarget": rig.name,
            "poleSubtarget": pole_target,
            "chainCount": 2,
            "useStretch": False,
        }
        if actual != expected:
            fail(f"{foot_name}-ik-contract", {"actual": actual, "expected": expected})
    heel_constraints = [constraint for constraint in rig.pose.bones[foot_name].constraints if constraint.type == "COPY_ROTATION"]
    if len(heel_constraints) != 1 or heel_constraints[0].subtarget != heel_target:
        fail(f"{foot_name}-heel-control", [constraint.subtarget for constraint in heel_constraints])

for clip_name in locomotion_clips:
    entry = entries[clip_name]
    action = bpy.data.actions[entry["action"]]
    paths = action_paths(action)
    expected_paths = {
        f'pose.bones["CTRL.ankle.{region}.{side}"].location'
        for region in ("front", "rear")
        for side in ("L", "R")
    }
    missing_paths = sorted(expected_paths - paths)
    if missing_paths:
        fail(f"{clip_name}-authored-contact-curves", missing_paths)
    rig.animation_data.action = action
    continuity_max = 0.0
    root_translation_max = 0.0
    contacts = {foot_name: [] for foot_name in feet}
    for frame in range(entry["startFrame"], entry["endFrame"] + 1):
        bpy.context.scene.frame_set(frame)
        bpy.context.view_layer.update()
        root_translation_max = max(root_translation_max, rig.pose.bones["root"].matrix_basis.translation.length)
        for foot_name in feet:
            bone = rig.pose.bones[foot_name]
            parent = bone.parent
            if parent is None:
                fail(f"{clip_name}-{foot_name}-parent", None)
                continue
            foot_head = rig.matrix_world @ bone.head
            parent_tail = rig.matrix_world @ parent.tail
            continuity_max = max(continuity_max, (foot_head - parent_tail).length)
            contacts[foot_name].append(tuple(rig.matrix_world @ bone.tail))
    support_metrics = []
    for window in entry["supportWindows"]:
        for foot_name in window["feet"]:
            points = contacts[foot_name][
                window["startFrame"] - entry["startFrame"] :
                window["endFrame"] - entry["startFrame"] + 1
            ]
            anchor = Vector(points[0])
            slip = max((Vector(point) - anchor).length for point in points)
            support_metrics.append(
                {
                    "foot": foot_name,
                    "startFrame": window["startFrame"],
                    "endFrame": window["endFrame"],
                    "slipM": slip,
                }
            )
            if slip > 0.006:
                fail(f"{clip_name}-{foot_name}-support-slip", slip)
    if continuity_max > 1e-5:
        fail(f"{clip_name}-foot-chain-continuity", continuity_max)
    if root_translation_max > 1e-9 or rig.location.length > 1e-9:
        fail(f"{clip_name}-global-root-correction", {"root": root_translation_max, "rig": list(rig.location)})
    metrics[clip_name] = {
        "footHeadParentTailGapMaxM": continuity_max,
        "rootTranslationMaxM": root_translation_max,
        "supportWindows": support_metrics,
    }

payload = {
    "schemaVersion": 1,
    "status": "PASS" if not failures else "FAIL",
    "continuityToleranceM": 1e-5,
    "supportSlipToleranceM": 0.006,
    "metrics": metrics,
    "failures": failures,
}
print("IK_QA_JSON " + json.dumps(payload, sort_keys=True))
if failures:
    raise RuntimeError(f"IK QA failed: {len(failures)} failures")
print("IK_QA_PASS")
