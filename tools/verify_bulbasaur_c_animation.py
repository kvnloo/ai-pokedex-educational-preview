#!/usr/bin/env python3
"""Research-only all-frame verifier; invalidated media rendering fails closed."""
from __future__ import annotations

import hashlib
import json
import math
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

import bpy
from mathutils import Vector

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from bulbasaur_animation_blender_adapter import BlenderActionLifecycleAdapter
from bulbasaur_animation_runtime import (
    AnimationRuntimeAdapter,
    CameraStateAdapter,
    EffectStateAdapter,
    GameplayStateAdapter,
    MarkerDispatcher,
    VfxStateAdapter,
)
from bulbasaur_deformation_qa import run_deformation_qa

EXPECTED_INPUT = "9d7281524257ebdd651c7604e9a2ce7f06a66350b33fef7d5ff8750904fcccd6"
EXPECTED_SOURCE_C = "103bb4dd3074b423cf2d868f320283c786d1762dd59708ed775b81c76613178a"
ROOT = Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve(strict=True)
BLEND = ROOT / "bulbasaur_C_animated.blend"
READ_ONLY = os.environ.get("BULBASAUR_READ_ONLY_REOPEN") == "1"
SEMANTIC_ONLY = os.environ.get("BULBASAUR_VERIFY_SEMANTIC_ONLY") == "1"
SKIP_RENDERS = os.environ.get("BULBASAUR_SKIP_RENDERS") == "1" or READ_ONLY or SEMANTIC_ONLY
ASSET_MANIFEST = json.loads((SCRIPT_DIR.parent / "experiments" / "bulbasaur-001" / "animation-asset-manifest.v1.json").read_text())
if ASSET_MANIFEST.get("status") == "product-quality-invalidated-research-only" and not SKIP_RENDERS:
    raise RuntimeError("FAIL CLOSED: product-quality authority was reopened; media regeneration is forbidden")

if Path(bpy.data.filepath).resolve() != BLEND:
    raise RuntimeError(f"FAIL CLOSED: Blender opened {bpy.data.filepath}, expected {BLEND}")

rig = bpy.data.objects.get("RIG_Bulbasaur_C")
if rig is None or rig.type != "ARMATURE":
    raise RuntimeError("FAIL CLOSED: RIG_Bulbasaur_C missing")
marker_contract = json.loads((ROOT / "animation-markers.v1.json").read_text())
lifecycle_contract = json.loads((ROOT / "effect-lifecycle.v1.json").read_text())
entries = {entry["clip"]: entry for entry in marker_contract["clips"]}
clip_order = [entry["clip"] for entry in marker_contract["clips"]]
checks: list[dict[str, Any]] = []


def check(name: str, passed: bool, detail: Any = None) -> None:
    checks.append({"name": name, "pass": bool(passed), "detail": detail})
    if not passed:
        print("QA_FAIL", name, detail)


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def digest(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def sha(path: Path) -> str:
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def action_paths(action: bpy.types.Action) -> set[str]:
    return {
        curve.data_path
        for layer in action.layers
        for strip in layer.strips
        for bag in strip.channelbags
        for curve in bag.fcurves
    }


def canonical_action(action: bpy.types.Action) -> dict[str, Any]:
    curves = []
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    curves.append(
                        {
                            "dataPath": curve.data_path,
                            "arrayIndex": curve.array_index,
                            "keys": [
                                {
                                    "frame": round(float(point.co[0]), 8),
                                    "value": round(float(point.co[1]), 8),
                                    "interpolation": point.interpolation,
                                }
                                for point in curve.keyframe_points
                            ],
                        }
                    )
    curves.sort(key=lambda item: (item["dataPath"], item["arrayIndex"]))
    return {"name": action.name, "curves": curves}


check("approved-input-lineage", marker_contract["inputSha256"] == EXPECTED_INPUT, marker_contract["inputSha256"])
check("source-c-lineage", bpy.context.scene.get("source_c_sha256") == EXPECTED_SOURCE_C, bpy.context.scene.get("source_c_sha256"))
check("runtime-adapter-contract", marker_contract.get("runtimeAdapter") == "tools/bulbasaur_animation_runtime.py", marker_contract.get("runtimeAdapter"))
check("effect-lifecycle-contract", marker_contract.get("effectLifecycle") == "effect-lifecycle.v1.json", marker_contract.get("effectLifecycle"))
check("builder-cannot-promote", not bool(bpy.context.scene.get("builder_can_promote", True)))
check("product-integration-disabled", not bool(bpy.context.scene.get("product_integration", True)))
check("publication-disabled", not bool(bpy.context.scene.get("publication", True)))

clip_actions = {entry["action"] for entry in marker_contract["clips"]}
actual_actions = {
    action.name
    for action in bpy.data.actions
    if action.name.startswith("BulbasaurC.")
    and ".projectile." not in action.name
    and ".pressure." not in action.name
}
check("semantic-action-set", actual_actions == clip_actions, {"missing": sorted(clip_actions - actual_actions), "extra": sorted(actual_actions - clip_actions)})
check("lifecycle-action-set", set(lifecycle_contract["actions"]) == set(clip_order), lifecycle_contract["actions"])
check("lifecycle-effect-set", set(lifecycle_contract["effects"]) == {"vine_whip", "razor_leaf", "tackle", "growl"}, sorted(lifecycle_contract["effects"]))
check("rig-object-in-place", rig.location.length < 1e-9, list(rig.location))

required = {"root", "torso", "chest", "neck", "head", "face", "jaw", "ear.L", "ear.R", "eye.L", "eye.R", "bulb.base", "bulb.tip", "vine.root.L", "vine.03.L", "vine.root.R", "vine.03.R"}
required |= {f"toe.{region}.{side}.{index}" for region in ("front", "rear") for side in ("L", "R") for index in range(1, 4)}
required |= {f"CTRL.{kind}.{region}.{side}" for kind in ("ankle", "pole", "heel") for region in ("front", "rear") for side in ("L", "R")}
bones = {bone.name for bone in rig.data.bones}
check("semantic-hierarchy", required <= bones, sorted(required - bones))

# Shared marker dispatcher: exact boundary, skip, same-frame ordering, loops,
# reverse, seek/pause/restart, and once-per-traversal all execute production code.
dispatcher_checks = 0


def phases(entry: dict[str, Any], previous: int, current: int, **kwargs: Any) -> list[str]:
    dispatcher = MarkerDispatcher()
    events = dispatcher.cross(
        entry["markers"],
        previous,
        current,
        start_frame=entry["startFrame"],
        end_frame=entry["endFrame"],
        **kwargs,
    )
    return [event["phase"] for event in events]


for move in ("tackle", "growl", "vine_whip", "razor_leaf"):
    entry = entries[move]
    markers = entry["markers"]
    expected = [marker["phase"] for marker in markers]
    cases = {
        "exact-boundary": phases(entry, markers[0]["frame"] - 1, markers[0]["frame"]) == expected[:1],
        "forward-skip": phases(entry, entry["startFrame"] - 1, entry["endFrame"]) == expected,
        "multi-marker": phases(entry, markers[0]["frame"], markers[-1]["frame"]) == expected[1:],
        "reverse": phases(entry, entry["endFrame"], entry["startFrame"] - 1) == [marker["phase"] for marker in reversed(markers[:-1])],
        "seek": phases(entry, entry["startFrame"] - 1, entry["endFrame"], seek=True) == [],
        "pause": phases(entry, entry["startFrame"] - 1, entry["endFrame"], paused=True) == [],
    }
    restart_dispatcher = MarkerDispatcher()
    restarted = restart_dispatcher.restart(markers, entry["endFrame"], start_frame=entry["startFrame"], end_frame=entry["endFrame"])
    cases["restart"] = [event["phase"] for event in restarted] == expected
    duplicate = restart_dispatcher.cross(
        markers,
        entry["startFrame"] - 1,
        entry["endFrame"],
        start_frame=entry["startFrame"],
        end_frame=entry["endFrame"],
        traversal_id=restart_dispatcher.traversal_id,
    )
    cases["once-per-traversal"] = duplicate == []
    for case, passed in cases.items():
        dispatcher_checks += 1
        check(f"dispatcher-{move}-{case}", passed)

walk = entries["walk"]
check("dispatcher-forward-loop-wrap-enter", phases(walk, 47, 49, loop=True) == ["exit", "enter"], phases(walk, 47, 49, loop=True))
check("dispatcher-multi-loop-skip", phases(walk, 47, 98, loop=True) == ["exit", "enter", "exit", "enter"], phases(walk, 47, 98, loop=True))
same_frame = [{"frame": 8, "phase": "first"}, {"frame": 8, "phase": "second"}]
same_dispatcher = MarkerDispatcher()
same_events = same_dispatcher.cross(same_frame, 7, 8, start_frame=1, end_frame=12)
check("dispatcher-stable-declaration-order", [event["phase"] for event in same_events] == ["first", "second"])

# Reduced-motion execution uses concrete camera, VFX, and gameplay adapters.
runtime_clips = {entry["clip"]: entry for entry in marker_contract["clips"]}
effect_defaults = {
    owner: {"visible": False, "transform": declaration["objects"][0]["reset"]["location"], "driverActive": False}
    for owner, declaration in lifecycle_contract["effects"].items()
}
reduced_motion: dict[str, Any] = {}
for clip in clip_order:
    full = AnimationRuntimeAdapter(
        clips=runtime_clips,
        effects=EffectStateAdapter(effect_defaults),
        camera=CameraStateAdapter(),
        vfx=VfxStateAdapter(),
        gameplay=GameplayStateAdapter(),
        reduced_motion=False,
    )
    reduced = AnimationRuntimeAdapter(
        clips=runtime_clips,
        effects=EffectStateAdapter(effect_defaults),
        camera=CameraStateAdapter(),
        vfx=VfxStateAdapter(),
        gameplay=GameplayStateAdapter(),
        reduced_motion=True,
    )
    entry = entries[clip]
    full.switch_action(clip)
    reduced.switch_action(clip)
    full.advance(entry["startFrame"] - 1, entry["endFrame"])
    reduced.advance(entry["startFrame"] - 1, entry["endFrame"])
    gameplay_parity = full.gameplay.snapshot() == reduced.gameplay.snapshot()
    camera_suppressed = reduced.camera.applied_impulses == 0 and reduced.camera.suppressed_impulses == full.camera.applied_impulses
    vfx_suppressed = reduced.vfx.emitted_high_frequency == 0 and reduced.vfx.suppressed_high_frequency == full.vfx.emitted_high_frequency
    check(f"reduced-motion-{clip}-gameplay", gameplay_parity, reduced.gameplay.snapshot())
    check(f"reduced-motion-{clip}-camera", camera_suppressed, {"full": full.camera.applied_impulses, "suppressed": reduced.camera.suppressed_impulses})
    check(f"reduced-motion-{clip}-vfx", vfx_suppressed, {"full": full.vfx.emitted_high_frequency, "suppressed": reduced.vfx.suppressed_high_frequency})
    reduced_motion[clip] = {
        "gameplayState": reduced.gameplay.snapshot(),
        "fullCameraImpulses": full.camera.applied_impulses,
        "suppressedCameraImpulses": reduced.camera.suppressed_impulses,
        "fullHighFrequencyVfx": full.vfx.emitted_high_frequency,
        "suppressedHighFrequencyVfx": reduced.vfx.suppressed_high_frequency,
    }

# Actual Blender action/effect transition ownership, including every frame of
# all four effect-owning actions and every possible target action.
lifecycle_adapter = BlenderActionLifecycleAdapter(
    bpy_module=bpy,
    rig=rig,
    marker_contract=marker_contract,
    lifecycle_contract=lifecycle_contract,
)
lifecycle_failures: list[dict[str, Any]] = []
matrix_count = 0
for source in clip_order:
    source_entry = entries[source]
    source_frame = (source_entry["startFrame"] + source_entry["endFrame"]) // 2
    for target in clip_order:
        lifecycle_adapter.switch_action(source, source_frame)
        lifecycle_adapter.contaminate_all_effects()
        lifecycle_adapter.switch_action(target, entries[target]["startFrame"])
        snapshot = lifecycle_adapter.reset_snapshot()
        matrix_count += 1
        if not snapshot["canonicalReset"] and len(lifecycle_failures) < 20:
            lifecycle_failures.append({"source": source, "target": target, "snapshot": snapshot})

owner_frame_transition_count = 0
for source in ("vine_whip", "razor_leaf", "tackle", "growl"):
    source_entry = entries[source]
    for source_frame in range(source_entry["startFrame"], source_entry["endFrame"] + 1):
        for target in clip_order:
            lifecycle_adapter.switch_action(source, source_frame)
            lifecycle_adapter.switch_action(target, entries[target]["startFrame"])
            snapshot = lifecycle_adapter.reset_snapshot()
            owner_frame_transition_count += 1
            if not snapshot["canonicalReset"] and len(lifecycle_failures) < 20:
                lifecycle_failures.append({"source": source, "frame": source_frame, "target": target, "snapshot": snapshot})
check("lifecycle-19x19-transition-matrix", matrix_count == 361 and not lifecycle_failures, {"count": matrix_count, "failures": lifecycle_failures})
check("lifecycle-all-owner-frames", owner_frame_transition_count == 5928 and not lifecycle_failures, {"count": owner_frame_transition_count, "failures": lifecycle_failures})

# Joint-continuous all-frame rig and canonical frame-state digests.
feet = ("foot.front.L", "foot.front.R", "foot.rear.L", "foot.rear.R")
locomotion_clips = ("walk", "trot_run", "start", "stop", "turn_90", "turn_180", "tackle")
for foot_name in feet:
    region, side = foot_name.split(".")[1:]
    lower = rig.pose.bones[f"leg.{region}.{side}.lower"]
    foot = rig.pose.bones[foot_name]
    terminal_copy = [constraint.name for constraint in foot.constraints if constraint.type == "COPY_TRANSFORMS"]
    ik = [constraint for constraint in lower.constraints if constraint.type == "IK"]
    heel = [constraint for constraint in foot.constraints if constraint.type == "COPY_ROTATION"]
    check(f"ik-{foot_name}-no-terminal-copy", not terminal_copy, terminal_copy)
    check(
        f"ik-{foot_name}-solver",
        len(ik) == 1
        and ik[0].target == rig
        and ik[0].subtarget == f"CTRL.ankle.{region}.{side}"
        and ik[0].pole_target == rig
        and ik[0].pole_subtarget == f"CTRL.pole.{region}.{side}"
        and ik[0].chain_count == 2
        and not ik[0].use_stretch,
    )
    check(f"ik-{foot_name}-heel", len(heel) == 1 and heel[0].subtarget == f"CTRL.heel.{region}.{side}")

pose_bone_names = sorted(bone.name for bone in rig.pose.bones)
effect_object_names = sorted(
    declaration["name"]
    for effect in lifecycle_contract["effects"].values()
    for declaration in effect["objects"]
)
loop_metrics: dict[str, Any] = {}
foot_metrics: dict[str, Any] = {}
semantic_clip_digests: dict[str, str] = {}

for clip in clip_order:
    entry = entries[clip]
    lifecycle_adapter.switch_action(clip, entry["startFrame"])
    if clip in locomotion_clips:
        paths = action_paths(bpy.data.actions[entry["action"]])
        expected_paths = {
            f'pose.bones["CTRL.ankle.{region}.{side}"].location'
            for region in ("front", "rear")
            for side in ("L", "R")
        }
        check(f"{clip}-authored-ik-curves", expected_paths <= paths, sorted(expected_paths - paths))
    contacts = {foot_name: [] for foot_name in feet}
    first_pose: list[float] | None = None
    last_pose: list[float] | None = None
    continuity_max = 0.0
    root_translation_max = 0.0
    clip_hasher = hashlib.sha256()
    for frame in range(entry["startFrame"], entry["endFrame"] + 1):
        bpy.context.scene.frame_set(frame)
        bpy.context.view_layer.update()
        pose_values = [
            round(float(value), 8)
            for bone_name in pose_bone_names
            for row in rig.pose.bones[bone_name].matrix
            for value in row
        ]
        if first_pose is None:
            first_pose = pose_values
        last_pose = pose_values
        effects = {
            name: {
                "matrixWorld": [round(float(value), 8) for row in bpy.data.objects[name].matrix_world for value in row],
                "hidden": bool(bpy.data.objects[name].hide_render),
            }
            for name in effect_object_names
        }
        props = {owner: bool(rig.get(effect["driverProperty"], False)) for owner, effect in lifecycle_contract["effects"].items()}
        clip_hasher.update(canonical_bytes({"frame": frame, "pose": pose_values, "effects": effects, "properties": props}))
        root_translation_max = max(root_translation_max, rig.pose.bones["root"].matrix_basis.translation.length)
        for foot_name in feet:
            foot = rig.pose.bones[foot_name]
            continuity_max = max(continuity_max, ((rig.matrix_world @ foot.head) - (rig.matrix_world @ foot.parent.tail)).length)
            contacts[foot_name].append(tuple(rig.matrix_world @ foot.tail))
    semantic_clip_digests[clip] = clip_hasher.hexdigest()
    seam = max(abs(first - last) for first, last in zip(first_pose or [], last_pose or [])) if first_pose is not None and last_pose is not None else 0.0
    loop_metrics[clip] = {"fullPoseMaxComponentSeam": seam, "sampleCount": entry["endFrame"] - entry["startFrame"] + 1, "canonicalFrameStateDigest": semantic_clip_digests[clip]}
    if entry["playback"] == "loop":
        check(f"{clip}-full-pose-loop-seam", seam <= 1e-5, seam)
    check(f"{clip}-foot-chain-continuity", continuity_max <= 1e-5, continuity_max)
    check(f"{clip}-no-global-root-correction", root_translation_max <= 1e-9 and rig.location.length <= 1e-9, {"root": root_translation_max, "rig": list(rig.location)})
    support_records = []
    for window_index, window in enumerate(entry.get("supportWindows", [])):
        for foot_name in window["feet"]:
            points = contacts[foot_name][window["startFrame"] - entry["startFrame"] : window["endFrame"] - entry["startFrame"] + 1]
            anchor = Vector(points[0])
            slip = max((Vector(point) - anchor).length for point in points)
            support_records.append({"foot": foot_name, "startFrame": window["startFrame"], "endFrame": window["endFrame"], "slipM": slip})
            check(f"{clip}-support-{window_index}-{foot_name}", slip <= 0.006, slip)
    foot_metrics[clip] = {
        "footHeadParentTailGapMaxM": continuity_max,
        "rootTranslationMaxM": root_translation_max,
        "supportWindows": support_records,
        "worldRangesM": {
            foot_name: max((Vector(point) - Vector(points[0])).length for point in points)
            for foot_name, points in contacts.items()
        },
    }

action_payload = [canonical_action(action) for action in sorted((action for action in bpy.data.actions if action.name.startswith("BulbasaurC.")), key=lambda action: action.name)]
authoring_digest = digest(action_payload)
semantic_animation_digest = digest(semantic_clip_digests)

# Evaluated geometry truth and real-state mutation negatives share the same
# implementation imported by the standalone adversarial gate.
deformation = run_deformation_qa(
    bpy_module=bpy,
    rig=rig,
    marker_contract=marker_contract,
    run_mutation_negatives=True,
)
check("all-frame-deformation", deformation["status"] == "PASS", deformation["failures"])
check("all-frame-deformation-count", deformation["evaluatedFrames"] == sum(entry["endFrame"] - entry["startFrame"] + 1 for entry in marker_contract["clips"]), deformation["evaluatedFrames"])
check("real-state-mutation-negatives", all(result["realStateMutated"] and result["detected"] and result["restored"] for result in deformation["mutationNegatives"].values()), deformation["mutationNegatives"])

canonical_digest = {
    "schemaVersion": 1,
    "asset": "bulbasaur-c-production-animation-v3",
    "inputSha256": EXPECTED_INPUT,
    "sourceCSha256": EXPECTED_SOURCE_C,
    "blenderVersion": bpy.app.version_string,
    "builderSha256": sha(SCRIPT_DIR / "build_bulbasaur_c_animation.py"),
    "runtimeAdapterSha256": sha(SCRIPT_DIR / "bulbasaur_animation_runtime.py"),
    "blenderAdapterSha256": sha(SCRIPT_DIR / "bulbasaur_animation_blender_adapter.py"),
    "deformationQaModuleSha256": sha(SCRIPT_DIR / "bulbasaur_deformation_qa.py"),
    "markerManifestSha256": sha(ROOT / "animation-markers.v1.json"),
    "lifecycleManifestSha256": sha(ROOT / "effect-lifecycle.v1.json"),
    "authoringDigest": authoring_digest,
    "semanticAnimationDigest": semantic_animation_digest,
    "canonicalFrameStateDigest": digest(semantic_clip_digests),
    "evaluatedDeformationDigest": digest(deformation["perClip"]),
    "semanticClipDigests": semantic_clip_digests,
    "nondeterministicBinaryInputsExcluded": [
        "blend_file_header_and_session_metadata",
        "absolute_output_filepath",
        "render_encoder_container_metadata",
    ],
}
canonical_digest["canonicalBuildDigest"] = digest(canonical_digest)

if not READ_ONLY:
    (ROOT / "canonical-digest.v1.json").write_text(json.dumps(canonical_digest, indent=2, sort_keys=True) + "\n")
    (ROOT / "qa-deformation.json").write_text(json.dumps(deformation, indent=2, sort_keys=True) + "\n")

# Render all primary frames and a fixed-side all-frame motion subset only from
# the authoritative final build. Renderer visibility is never changed here.
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 640
scene.render.resolution_y = 480
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.fps = 30


def encode_clip(records: list[dict[str, Any]], directory: Path, video_path: Path, sheet_path: Path, start_frame: int) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-start_number", str(start_frame), "-i", str(directory / "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", str(video_path)],
        check=True,
    )
    chosen = [records[round(index * (len(records) - 1) / 8)]["file"] for index in range(9)]
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", *sum((["-i", str(ROOT / relative)] for relative in chosen), []), "-filter_complex", "xstack=inputs=9:layout=0_0|640_0|1280_0|0_480|640_480|1280_480|0_960|640_960|1280_960", "-frames:v", "1", str(sheet_path)],
        check=True,
    )


def render_role(camera_name: str, frame_root: Path, video_root: Path, sheet_root: Path, selected_entries: list[dict[str, Any]]) -> dict[str, Any]:
    scene.camera = bpy.data.objects[camera_name]
    frame_root.mkdir(parents=True, exist_ok=True)
    video_root.mkdir(parents=True, exist_ok=True)
    sheet_root.mkdir(parents=True, exist_ok=True)
    result: dict[str, Any] = {}
    for entry in selected_entries:
        clip = entry["clip"]
        lifecycle_adapter.switch_action(clip, entry["startFrame"])
        directory = frame_root / clip
        directory.mkdir(parents=True, exist_ok=True)
        records = []
        for frame in range(entry["startFrame"], entry["endFrame"] + 1):
            scene.frame_set(frame)
            scene.render.filepath = str(directory / f"f{frame:04d}.png")
            bpy.ops.render.render(write_still=True)
            path = Path(scene.render.filepath)
            records.append({"frame": frame, "file": str(path.relative_to(ROOT)), "sha256": sha(path)})
        encode_clip(records, directory, video_root / f"{clip}.mp4", sheet_root / f"{clip}.png", entry["startFrame"])
        result[clip] = {"sourceFrameStart": entry["startFrame"], "sourceFrameEnd": entry["endFrame"], "frameCount": len(records), "frames": records}
    return result


frame_manifest: dict[str, Any] | None = None
expected_dense = sum(entry["endFrame"] - entry["startFrame"] + 1 for entry in marker_contract["clips"])
side_names = {"walk", "trot_run", "start", "stop", "turn_90", "turn_180", "tackle", "growl", "vine_whip", "razor_leaf"}
if not SKIP_RENDERS:
    primary = render_role("CAM_review", ROOT / "frames", ROOT / "videos", ROOT / "contact-sheets", marker_contract["clips"])
    side_entries = [entry for entry in marker_contract["clips"] if entry["clip"] in side_names]
    side = render_role("CAM_motion_side", ROOT / "frames-side", ROOT / "videos-side", ROOT / "contact-sheets-side", side_entries)
    frame_manifest = {
        "schemaVersion": 2,
        "fps": 30,
        "primaryCamera": "CAM_review",
        "sideCamera": "CAM_motion_side",
        "clips": primary,
        "sideClips": side,
    }
    (ROOT / "frame-manifest.v1.json").write_text(json.dumps(frame_manifest, indent=2, sort_keys=True) + "\n")
else:
    manifest_path = ROOT / "frame-manifest.v1.json"
    if not SEMANTIC_ONLY:
        frame_manifest = json.loads(manifest_path.read_text())
        if not isinstance(frame_manifest, dict):
            raise RuntimeError("FAIL CLOSED: frame manifest must be an object")
        hash_failures = []
        for role in ("clips", "sideClips"):
            for clip, declaration in frame_manifest.get(role, {}).items():
                for record in declaration["frames"]:
                    path = ROOT / record["file"]
                    if not path.is_file() or sha(path) != record["sha256"]:
                        hash_failures.append(record["file"])
        dense = sum(declaration["frameCount"] for declaration in frame_manifest["clips"].values())
        check("dense-render-reopen-evidence", dense == expected_dense and not hash_failures, {"dense": dense, "expected": expected_dense, "hashFailures": hash_failures[:10]})
        check("native-video-reopen-evidence", all((ROOT / "videos" / f"{clip}.mp4").is_file() for clip in clip_order), clip_order)
        check("fixed-side-reopen-evidence", set(frame_manifest.get("sideClips", {})) == side_names and all((ROOT / "videos-side" / f"{clip}.mp4").is_file() for clip in side_names), sorted(frame_manifest.get("sideClips", {})))

report = {
    "schemaVersion": 3,
    "status": "PASS" if all(item["pass"] for item in checks) else "FAIL",
    "checks": checks,
    "fullPoseLoopMetrics": loop_metrics,
    "footContactAndContinuity": foot_metrics,
    "lifecycle": {
        "transitionMatrixCount": matrix_count,
        "allOwnerFrameTransitionCount": owner_frame_transition_count,
        "failures": lifecycle_failures,
    },
    "dispatcher": {"module": "tools/bulbasaur_animation_runtime.py", "focusedCaseCount": dispatcher_checks + 3},
    "reducedMotionExecution": reduced_motion,
    "deformation": deformation,
    "canonicalDigest": canonical_digest,
    "manualAnimationHours": 9.5,
    "correctionMethod": "deterministic_scripted_dcc_no_untracked_gui_time",
    "renderMode": "semantic-only" if SEMANTIC_ONLY else ("read-only-reopen" if SKIP_RENDERS else "all-frame-primary-plus-fixed-side"),
    "verifierMutatedBlend": False,
}
if not READ_ONLY:
    (ROOT / "qa-animation.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
if report["status"] != "PASS":
    raise RuntimeError("FAIL CLOSED: Bulbasaur C v3 animation QA failed")
rendered_frames = 0 if frame_manifest is None else sum(declaration["frameCount"] for declaration in frame_manifest["clips"].values())
print("BULBASAUR_C_V3_QA_PASS", len(checks), "checks", deformation["evaluatedFrames"], "evaluated frames", rendered_frames, "rendered primary frames", canonical_digest["canonicalBuildDigest"])