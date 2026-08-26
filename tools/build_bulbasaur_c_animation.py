#!/usr/bin/env python3
"""Preserve the stopped Bulbasaur C v3 mechanical research recipe.

The approved production .blend remains immutable. This recipe adds an explicit
animation hierarchy, in-place actions, physical vine/leaf effect geometry, and
external event contracts. Product-quality authority is currently reopened, so
the entrypoint fails closed until the repository manifest records new authority.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import subprocess
from pathlib import Path

import bpy
from mathutils import Vector

EXPECTED_INPUT_SHA256 = "9d7281524257ebdd651c7604e9a2ce7f06a66350b33fef7d5ff8750904fcccd6"
EXPECTED_SOURCE_C_SHA256 = "103bb4dd3074b423cf2d868f320283c786d1762dd59708ed775b81c76613178a"
SOURCE_C = Path("/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/production/manual-v1/hypothesis-C/bulbasaur_manual_v1_C.blend")
REPO_ROOT = Path(__file__).resolve().parents[1]
ASSET_MANIFEST = json.loads((REPO_ROOT / "experiments" / "bulbasaur-001" / "animation-asset-manifest.v1.json").read_text())
if ASSET_MANIFEST.get("status") == "product-quality-invalidated-research-only":
    raise RuntimeError("FAIL CLOSED: product-quality authority was reopened; do not rebuild the research animation")
INPUT = Path(os.environ["BULBASAUR_ANIMATION_INPUT"]).resolve(strict=True)
OUTPUT = Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve()
BLEND = OUTPUT / "bulbasaur_C_animated.blend"
FPS = 30
OUTPUT.mkdir(parents=True, exist_ok=True)
(OUTPUT / "frames").mkdir(exist_ok=True)
(OUTPUT / "videos").mkdir(exist_ok=True)
bpy.context.preferences.filepaths.save_version = 0


def sha(path: Path) -> str:
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def fail(message: str) -> None:
    raise RuntimeError(f"FAIL CLOSED: {message}")


if sha(INPUT) != EXPECTED_INPUT_SHA256:
    fail(f"approved input hash mismatch: {sha(INPUT)}")
if sha(SOURCE_C) != EXPECTED_SOURCE_C_SHA256:
    fail(f"source C hash mismatch: {sha(SOURCE_C)}")
if Path(bpy.data.filepath).resolve() != INPUT:
    fail(f"Blender opened {bpy.data.filepath}, expected {INPUT}")

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 640
scene.render.resolution_y = 480
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.render.fps = FPS
scene.world.color = (0.025, 0.032, 0.04)
rig = bpy.data.objects.get("RIG_Bulbasaur_C")
if not rig or rig.type != "ARMATURE":
    fail("RIG_Bulbasaur_C missing")
if tuple(round(v, 8) for v in rig.location) != (0.0, 0.0, 0.0):
    fail("rig object translation is not zero")

# Fixed side camera exposes support, knee continuity, and heel/toe behavior that
# the approved three-quarter review camera can hide.
side_camera_data = bpy.data.cameras.new("CAM_motion_side_DATA")
side_camera = bpy.data.objects.new("CAM_motion_side", side_camera_data)
bpy.context.collection.objects.link(side_camera)
side_camera.location = (3.0, -0.08, 0.58)
side_camera.rotation_euler = (Vector((0.0, -0.14, 0.43)) - side_camera.location).to_track_quat("-Z", "Y").to_euler()
side_camera_data.lens = 72.0

# Exact semantic hierarchy additions. Existing deformation bones are preserved.
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
additions = {
    "face": ("head", (0, -0.55, 0.52), (0, -0.68, 0.52)),
    "eye.L": ("face", (-0.15, -0.69, 0.55), (-0.15, -0.77, 0.55)),
    "eye.R": ("face", (0.15, -0.69, 0.55), (0.15, -0.77, 0.55)),
    "vine.root.L": ("torso", (-0.16, 0.02, 0.54), (-0.27, -0.01, 0.58)),
    "vine.01.L": ("vine.root.L", (-0.27, -0.01, 0.58), (-0.48, -0.14, 0.58)),
    "vine.02.L": ("vine.01.L", (-0.48, -0.14, 0.58), (-0.68, -0.34, 0.54)),
    "vine.03.L": ("vine.02.L", (-0.68, -0.34, 0.54), (-0.80, -0.58, 0.48)),
    "vine.root.R": ("torso", (0.16, 0.02, 0.54), (0.27, -0.01, 0.58)),
    "vine.01.R": ("vine.root.R", (0.27, -0.01, 0.58), (0.48, -0.14, 0.58)),
    "vine.02.R": ("vine.01.R", (0.48, -0.14, 0.58), (0.68, -0.34, 0.54)),
    "vine.03.R": ("vine.02.R", (0.68, -0.34, 0.54), (0.80, -0.58, 0.48)),
}
for region in ("front", "rear"):
    for side in ("L", "R"):
        foot = f"foot.{region}.{side}"
        for index in range(1, 4):
            x = (-1 if side == "L" else 1) * (0.24 + 0.03 * (index - 2))
            y = -0.57 if region == "front" else 0.05
            additions[f"toe.{region}.{side}.{index}"] = (foot, (x, y, 0.10), (x, y - 0.10, 0.07))
for name, (parent, head, tail) in additions.items():
    if name in rig.data.edit_bones:
        continue
    bone = rig.data.edit_bones.new(name)
    bone.head, bone.tail = head, tail
    bone.parent = rig.data.edit_bones.get(parent)

# Joint-continuous quadruped controls. IK terminates at the lower-leg tail,
# which is also the foot head; the terminal foot is never translated away from
# its parent chain. Pole and heel controls remain non-deforming runtime inputs.
for region in ("front", "rear"):
    for side in ("L", "R"):
        foot_name = f"foot.{region}.{side}"
        upper_name = f"leg.{region}.{side}.upper"
        lower_name = f"leg.{region}.{side}.lower"
        foot = rig.data.edit_bones[foot_name]
        upper = rig.data.edit_bones[upper_name]
        lower = rig.data.edit_bones[lower_name]
        ankle = rig.data.edit_bones.new(f"CTRL.ankle.{region}.{side}")
        ankle.head = foot.head
        ankle.tail = foot.head + Vector((0.0, 0.0, 0.12))
        ankle.parent = rig.data.edit_bones["root"]
        ankle.use_deform = False
        pole = rig.data.edit_bones.new(f"CTRL.pole.{region}.{side}")
        chain_axis = lower.tail - upper.head
        knee_projection = upper.head + chain_axis * (
            (upper.tail - upper.head).dot(chain_axis) / chain_axis.length_squared
        )
        bend_direction = (upper.tail - knee_projection).normalized()
        pole.head = upper.tail + bend_direction * 0.40
        pole.tail = pole.head + Vector((0.0, 0.0, 0.10))
        pole.parent = rig.data.edit_bones["root"]
        pole.use_deform = False
        heel = rig.data.edit_bones.new(f"CTRL.heel.{region}.{side}")
        heel.head = foot.head
        heel.tail = foot.tail
        heel.parent = ankle
        heel.use_deform = False
bpy.ops.object.mode_set(mode="POSE")
for bone in rig.pose.bones:
    bone.rotation_mode = "XYZ"
for region in ("front", "rear"):
    for side in ("L", "R"):
        lower = rig.pose.bones[f"leg.{region}.{side}.lower"]
        ik = lower.constraints.new("IK")
        ik.name = "JointContinuousIK"
        ik.target = rig
        ik.subtarget = f"CTRL.ankle.{region}.{side}"
        ik.pole_target = rig
        ik.pole_subtarget = f"CTRL.pole.{region}.{side}"
        ik.chain_count = 2
        ik.use_stretch = False
        ik.iterations = 64
        foot = rig.pose.bones[f"foot.{region}.{side}"]
        heel = foot.constraints.new("COPY_ROTATION")
        heel.name = "HeelToeOrientation"
        heel.target = rig
        heel.subtarget = f"CTRL.heel.{region}.{side}"
        heel.owner_space = "WORLD"
        heel.target_space = "WORLD"
        foot.bone["contact_point"] = "tail"

# Blender's pole-angle zero depends on authored bone roll. Calibrate each pole
# deterministically against the approved bind knee rather than assuming zero or
# hard-coding one mirrored side. This preserves the original rest deformation.
for region in ("front", "rear"):
    for side in ("L", "R"):
        upper_name = f"leg.{region}.{side}.upper"
        lower = rig.pose.bones[f"leg.{region}.{side}.lower"]
        ik = lower.constraints["JointContinuousIK"]
        approved_knee = rig.data.bones[upper_name].tail_local.copy()
        best_angle = 0.0
        best_error = float("inf")
        for degrees in range(-180, 181, 5):
            angle = math.radians(degrees)
            ik.pole_angle = angle
            bpy.context.view_layer.update()
            error = (rig.pose.bones[upper_name].tail - approved_knee).length
            if error < best_error:
                best_angle, best_error = angle, error
        coarse = best_angle
        for step in range(-50, 51):
            angle = coarse + math.radians(step * 0.1)
            ik.pole_angle = angle
            bpy.context.view_layer.update()
            error = (rig.pose.bones[upper_name].tail - approved_knee).length
            if error < best_error:
                best_angle, best_error = angle, error
        ik.pole_angle = best_angle
        lower.bone["ik_bind_knee_error_m"] = best_error
        if best_error > 1e-4:
            fail(f"IK pole calibration failed for {region}.{side}: {best_error}")
bpy.ops.object.mode_set(mode="OBJECT")

# Toe and eye objects receive explicit one-bone articulation while retaining <=4 influences.
for side in ("L", "R"):
    for eye_name in (f"eye_{side}", f"pupil_{side}", f"eye_glint_{side}"):
        obj = bpy.data.objects.get(eye_name)
        if obj:
            for group in list(obj.vertex_groups):
                obj.vertex_groups.remove(group)
            group = obj.vertex_groups.new(name=f"eye.{side}")
            group.add(range(len(obj.data.vertices)), 1.0, "REPLACE")
for region in ("front", "rear"):
    for side in ("L", "R"):
        for index in range(1, 4):
            obj = bpy.data.objects.get(f"toe_{region}_{side}_{index}")
            if obj:
                for group in list(obj.vertex_groups):
                    obj.vertex_groups.remove(group)
                group = obj.vertex_groups.new(name=f"toe.{region}.{side}.{index}")
                group.add(range(len(obj.data.vertices)), 1.0, "REPLACE")

# Real two-sided extendable vine chains: four rigid skinned segments per side.
def material(name: str, color: tuple[float, float, float, float], emission: float = 0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.metallic = 0.0
    mat.roughness = 0.46
    if emission:
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Emission Color"].default_value = color
        bsdf.inputs["Emission Strength"].default_value = emission
    return mat

vine_mat = material("MAT_vine", (0.075, 0.36, 0.10, 1))
leaf_mat = material("MAT_razor_leaf", (0.18, 0.72, 0.12, 1), 0.25)
impact_mat = material("MAT_contact", (0.9, 0.85, 0.25, 1), 1.5)
for side in ("L", "R"):
    for index in range(4):
        bone_name = f"vine.root.{side}" if index == 0 else f"vine.{index:02d}.{side}"
        bone = rig.data.bones[bone_name]
        midpoint = (bone.head_local + bone.tail_local) * 0.5
        length = (bone.tail_local - bone.head_local).length
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.026, depth=length, location=midpoint)
        obj = bpy.context.object
        obj.name = f"VINE_{side}_{index}"
        obj.data.materials.append(vine_mat)
        direction = bone.tail_local - bone.head_local
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction.normalized())
        obj.rotation_mode = "XYZ"
        obj.parent = rig
        modifier = obj.modifiers.new("Armature", "ARMATURE")
        modifier.object = rig
        group = obj.vertex_groups.new(name=bone_name)
        group.add(range(len(obj.data.vertices)), 1.0, "REPLACE")
        obj.hide_render = True
        obj["effect_role"] = "vine_whip_extendable_chain"

# Twelve authored Razor Leaf projectiles, not particles or HUD sprites.
for index in range(12):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.085, location=(0, 0, 0))
    leaf = bpy.context.object
    leaf.name = f"RAZOR_LEAF_{index:02d}"
    leaf.scale = (0.35, 1.0, 0.09)
    leaf.data.materials.append(leaf_mat)
    leaf.hide_render = True
    leaf["effect_role"] = "razor_leaf_authored_projectile"

bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, radius=0.17, location=(0, -1.45, 0.46))
contact = bpy.context.object
contact.name = "CONTACT_CUE"
contact.data.materials.append(impact_mat)
contact.hide_render = True
contact["effect_role"] = "move_contact_timing"

# Growl uses authored pressure rings so its effect ownership is subject to the
# same teardown contract as the three mesh-heavy moves.
growl_rings = []
for index in range(3):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.16 + index * 0.035,
        minor_radius=0.009,
        major_segments=32,
        minor_segments=8,
        location=(0.0, -0.72, 0.54),
        rotation=(math.pi / 2.0, 0.0, 0.0),
    )
    ring = bpy.context.object
    ring.name = f"GROWL_RING_{index:02d}"
    ring.data.materials.append(impact_mat)
    ring.hide_render = True
    ring["effect_role"] = "growl_authored_pressure_ring"
    growl_rings.append(ring)

# Declarative semantic clips. Every move uses named five-beat phases.
CLIPS = {
    "bind": (1, 1, "static"), "idle": (1, 90, "loop"), "breathe": (1, 75, "loop"),
    "blink": (1, 24, "one_shot"), "look": (1, 54, "one_shot"), "turn": (1, 60, "loop"),
    "walk": (1, 48, "loop"), "trot_run": (1, 32, "loop"), "start": (1, 30, "one_shot"),
    "stop": (1, 36, "one_shot"), "turn_90": (1, 42, "one_shot"), "turn_180": (1, 60, "one_shot"),
    "send_out": (1, 72, "one_shot"), "hit": (1, 36, "one_shot"), "faint": (1, 72, "hold"),
    "tackle": (1, 66, "one_shot"), "growl": (1, 72, "one_shot"),
    "vine_whip": (1, 84, "one_shot"), "razor_leaf": (1, 90, "one_shot"),
}
FX_OWNERS = ("vine_whip", "razor_leaf", "tackle", "growl")
for owner in FX_OWNERS:
    rig[f"fx_visible_{owner}"] = False
MOVE_BEATS = {
    "tackle": [(1,"anticipation"),(16,"travel"),(34,"contact"),(43,"recoil"),(66,"settle")],
    "growl": [(1,"anticipation"),(18,"release"),(34,"contact"),(51,"follow_through"),(72,"settle")],
    "vine_whip": [(1,"anticipation"),(20,"release"),(44,"contact"),(61,"recoil"),(84,"settle")],
    "razor_leaf": [(1,"anticipation"),(22,"release"),(50,"contact"),(68,"follow_through"),(90,"settle")],
}

SUPPORT_WINDOWS = {
    "walk": [(2, 12, ["foot.front.L", "foot.rear.R"]), (13, 24, ["foot.front.R", "foot.rear.L"]), (25, 36, ["foot.front.L", "foot.rear.R"]), (37, 47, ["foot.front.R", "foot.rear.L"])],
    "trot_run": [(2, 8, ["foot.front.L", "foot.rear.R"]), (9, 16, ["foot.front.R", "foot.rear.L"]), (17, 24, ["foot.front.L", "foot.rear.R"]), (25, 31, ["foot.front.R", "foot.rear.L"])],
    "start": [(1, 16, ["foot.rear.L", "foot.rear.R"])],
    "stop": [(1, 18, ["foot.front.L", "foot.front.R"]), (19, 36, ["foot.rear.L", "foot.rear.R"])],
    "turn_90": [(1, 24, ["foot.front.L", "foot.rear.R"])],
    "turn_180": [(1, 32, ["foot.front.R", "foot.rear.L"])],
    "tackle": [(1, 18, ["foot.rear.L", "foot.rear.R"]), (35, 50, ["foot.front.L", "foot.front.R"])],
}
LOCOMOTION_CLIPS = frozenset(SUPPORT_WINDOWS)


def set_pose(values: dict[str, tuple[float, float, float]], frame: int, scales: dict[str, tuple[float,float,float]] | None = None):
    for name, degrees in values.items():
        bone = rig.pose.bones.get(name)
        if not bone:
            fail(f"pose channel missing bone {name}")
        bone.rotation_euler = tuple(math.radians(value) for value in degrees)
        bone.keyframe_insert("rotation_euler", frame=frame, group=name)
    for name, value in (scales or {}).items():
        bone = rig.pose.bones[name]
        bone.scale = value
        bone.keyframe_insert("scale", frame=frame, group=name)


def neutral(frame: int):
    values = {bone.name: (0,0,0) for bone in rig.pose.bones}
    set_pose(values, frame, {bone.name:(1,1,1) for bone in rig.pose.bones})
    for bone in rig.pose.bones:
        bone.location = (0, 0, 0)
        bone.keyframe_insert("location", frame=frame, group=bone.name)


def key_ankle(region: str, side: str, frame: int, offset: tuple[float, float, float]):
    control = rig.pose.bones[f"CTRL.ankle.{region}.{side}"]
    control.location = offset
    control.keyframe_insert("location", frame=frame, group=f"ik.{region}.{side}")


def key_heel(region: str, side: str, frame: int, pitch_degrees: float):
    control = rig.pose.bones[f"CTRL.heel.{region}.{side}"]
    control.rotation_euler = (math.radians(pitch_degrees), 0.0, 0.0)
    control.keyframe_insert("rotation_euler", frame=frame, group=f"heel.{region}.{side}")


def key_pair(pair: tuple[tuple[str, str], ...], frame: int, offset: tuple[float, float, float], heel_pitch: float = 0.0):
    for region, side in pair:
        key_ankle(region, side, frame, offset)
        key_heel(region, side, frame, heel_pitch)


def authored_gait_controls(end: int, stride: float, lift: float):
    pair_a = (("front", "L"), ("rear", "R"))
    pair_b = (("front", "R"), ("rear", "L"))
    q1, q2, q3 = end // 4, end // 2, 3 * end // 4
    planted_0 = (0.0, 0.0, 0.0)
    # The approved bind chain is close to full extension. Both stance phases
    # therefore use the same reachable ground anchor while the swing diagonal
    # travels through an authored lifted arc between handoffs.
    planted_1 = planted_0
    key_pair(pair_a, 1, planted_0)
    key_pair(pair_b, 1, planted_0)
    key_pair(pair_a, q1, planted_0)
    key_pair(pair_b, 1 + q1 // 2, (0.0, -stride * 0.45, lift))
    key_pair(pair_b, q1, planted_1)
    key_pair(pair_b, q2, planted_1)
    key_pair(pair_a, (q1 + q2) // 2, (0.0, -stride * 0.45, lift))
    key_pair(pair_a, q2, planted_1)
    key_pair(pair_a, q3, planted_1)
    key_pair(pair_b, (q2 + q3) // 2, (0.0, -stride * 0.55, lift))
    key_pair(pair_b, q3, planted_0)
    key_pair(pair_b, end, planted_0)
    key_pair(pair_a, (q3 + end) // 2, (0.0, -stride * 0.55, lift))
    key_pair(pair_a, end, planted_0)


def swing_controls(feet: tuple[tuple[str, str], ...], frame: int, lift: float, reach: float = 0.0):
    key_pair(feet, frame, (0.0, reach, lift))


def locomotion(name: str, end: int, amplitude: float):
    neutral(1)
    for frame, sign in ((1,0),(1+end//4,1),(1+end//2,0),(1+3*end//4,-1),(end,0)):
        pose = {
            "leg.front.L.upper": (amplitude*sign,0,0), "leg.rear.R.upper": (amplitude*sign,0,0),
            "leg.front.R.upper": (-amplitude*sign,0,0), "leg.rear.L.upper": (-amplitude*sign,0,0),
            "leg.front.L.lower": (-amplitude*.55*sign,0,0), "leg.rear.R.lower": (-amplitude*.55*sign,0,0),
            "leg.front.R.lower": (amplitude*.55*sign,0,0), "leg.rear.L.lower": (amplitude*.55*sign,0,0),
            "torso": (2.5*abs(sign),0,-2.2*sign), "chest": (-1.5*abs(sign),0,2*sign),
            "head": (-1.2*abs(sign),0,-1.5*sign), "bulb.base": (-2.8*abs(sign),0,2*sign),
            "bulb.tip": (4.2*abs(sign),0,-3*sign),
        }
        set_pose(pose, frame)
    authored_gait_controls(end, 0.025 if name == "walk" else 0.035, 0.030 if name == "walk" else 0.040)
    neutral(end)


def author_action(name: str, start: int, end: int):
    action = bpy.data.actions.new(f"BulbasaurC.{name}")
    action.use_fake_user = True
    rig.animation_data_create(); rig.animation_data.action = action
    neutral(start); neutral(end)
    for owner in FX_OWNERS:
        rig[f"fx_visible_{owner}"] = False
        rig.keyframe_insert(f'["fx_visible_{owner}"]', frame=start, group=f"effects.{owner}")
        rig.keyframe_insert(f'["fx_visible_{owner}"]', frame=end, group=f"effects.{owner}")
    ik_influence = 1.0 if name in LOCOMOTION_CLIPS else 0.0
    for region in ("front", "rear"):
        for side in ("L", "R"):
            lower = rig.pose.bones[f"leg.{region}.{side}.lower"]
            foot = rig.pose.bones[f"foot.{region}.{side}"]
            for constraint in (*lower.constraints, *foot.constraints):
                if constraint.name not in {"JointContinuousIK", "HeelToeOrientation"}:
                    continue
                constraint.influence = ik_influence
                constraint.keyframe_insert("influence", frame=start, group=f"ik.{region}.{side}")
                constraint.keyframe_insert("influence", frame=end, group=f"ik.{region}.{side}")
    if name in {"walk","trot_run"}: locomotion(name,end,18 if name=="walk" else 27)
    elif name in {"idle","breathe"}:
        mid=(start+end)//2; set_pose({"torso":(-2,0,0),"head":(2,0,0),"bulb.base":(3,0,0),"bulb.tip":(-5,0,0)},mid,{"torso":(1.025,1.02,.98)})
    elif name=="blink": set_pose({},12,{"eye.L":(1,1,.06),"eye.R":(1,1,.06)})
    elif name=="look": set_pose({"neck":(0,0,-14),"head":(0,0,-20),"ear.L":(0,10,-8),"ear.R":(0,-6,-5)},27)
    elif name=="turn": set_pose({"torso":(0,0,9),"chest":(0,0,13),"head":(0,0,-18)},30)
    elif name=="start":
        set_pose({"torso":(6,0,0),"chest":(-4,0,0),"leg.rear.L.upper":(-20,0,0),"leg.rear.R.upper":(-20,0,0)},8)
        set_pose({"torso":(-4,0,0),"chest":(4,0,0),"leg.rear.L.upper":(18,0,0),"leg.rear.R.upper":(18,0,0),"bulb.base":(10,0,0)},18)
        swing_controls((("front", "L"), ("front", "R")), 10, 0.022)
        key_pair((("front", "L"), ("front", "R")), 18, (0.0, 0.0, 0.0))
    elif name=="stop":
        set_pose({"head":(8,0,0),"leg.front.L.upper":(-16,0,0),"leg.front.R.upper":(-16,0,0),"bulb.base":(-12,0,0)},10)
        set_pose({"torso":(5,0,0),"bulb.base":(8,0,0),"bulb.tip":(-12,0,0)},24)
        key_pair((("front", "L"), ("front", "R")), 18, (0.0, 0.0, 0.0))
        swing_controls((("rear", "L"), ("rear", "R")), 10, 0.025)
        key_pair((("rear", "L"), ("rear", "R")), 18, (0.0, 0.0, 0.0))
        swing_controls((("front", "L"), ("front", "R")), 26, 0.020)
    elif name in {"turn_90","turn_180"}:
        amount=12 if name=="turn_90" else -12; mid=end//2
        head_counter = -16 if name == "turn_90" else 28
        set_pose({"torso":(0,0,amount*.32),"chest":(0,0,amount*.48),"head":(0,0,head_counter),"leg.front.L.upper":(-14,0,-10),"leg.rear.R.upper":(12,0,10)},mid)
        swing_pair = (("front", "R"), ("rear", "L")) if name == "turn_90" else (("front", "L"), ("rear", "R"))
        swing_controls(swing_pair, mid, 0.025 if name == "turn_90" else 0.030)
        key_pair(swing_pair, min(end, (24 if name == "turn_90" else 32) + 1), (0.0, 0.0, 0.0))
    elif name=="send_out":
        set_pose({"torso":(12,0,0),"head":(-20,0,0),"leg.front.L.upper":(-12,0,0),"leg.front.R.upper":(-12,0,0)},16)
        set_pose({"torso":(-10,0,0),"head":(12,0,0),"ear.L":(0,15,0),"ear.R":(0,-15,0)},38)
    elif name=="hit":
        set_pose({"torso":(-18,0,16),"chest":(12,0,-12),"head":(18,0,-18),"bulb.base":(-16,0,10)},12)
        set_pose({"torso":(6,0,-5),"bulb.base":(10,0,-6),"bulb.tip":(-14,0,8)},25)
    elif name=="faint":
        set_pose({"torso":(-22,0,16),"chest":(-17,0,12),"head":(30,0,-20),"ear.L":(0,18,20),"ear.R":(0,-18,20),"bulb.base":(-18,0,14)},48)
        set_pose({"torso":(-30,0,20),"chest":(-22,0,15),"head":(38,0,-24),"bulb.base":(-22,0,16)},72)
    elif name=="tackle":
        set_pose({"head":(8,0,0),"leg.rear.L.upper":(-24,0,0),"leg.rear.R.upper":(-24,0,0),"toe.rear.L.2":(-16,0,0),"toe.rear.R.2":(-16,0,0)},16)
        set_pose({"head":(-18,0,0),"leg.rear.L.upper":(26,0,0),"leg.rear.R.upper":(26,0,0),"bulb.base":(17,0,0)},34)
        set_pose({"head":(15,0,0),"bulb.base":(-18,0,0),"bulb.tip":(22,0,0)},43)
        swing_controls((("front", "L"), ("front", "R")), 16, 0.025)
        key_pair((("front", "L"), ("front", "R")), 34, (0.0, 0.0, 0.0))
        key_pair((("rear", "L"), ("rear", "R")), 18, (0.0, 0.0, 0.0))
        swing_controls((("rear", "L"), ("rear", "R")), 43, 0.020)
    elif name=="growl":
        set_pose({"torso":(7,0,0),"chest":(-8,0,0),"head":(-12,0,0),"ear.L":(0,0,-16),"ear.R":(0,0,16)},18)
        set_pose({"jaw":(-30,0,0),"head":(12,0,0),"ear.L":(0,16,-12),"ear.R":(0,-16,12)},34,{"torso":(1.06,1.04,.96)})
        set_pose({"jaw":(-12,0,0),"head":(-7,0,0),"bulb.base":(9,0,0)},51)
    elif name=="vine_whip":
        set_pose({"torso":(8,0,0),"bulb.base":(-16,0,0),"vine.root.L":(0,18,-18),"vine.root.R":(0,-18,18)},20)
        set_pose({"torso":(-11,0,0),"vine.root.L":(0,-22,35),"vine.01.L":(0,0,38),"vine.02.L":(0,0,-30),"vine.root.R":(0,18,-20)},44)
        set_pose({"torso":(7,0,0),"vine.root.R":(0,20,-35),"vine.01.R":(0,0,-38),"vine.02.R":(0,0,30),"bulb.base":(14,0,0)},61)
    elif name=="razor_leaf":
        set_pose({"torso":(10,0,0),"bulb.base":(-22,0,0),"bulb.tip":(26,0,0),"ear.L":(0,12,0),"ear.R":(0,-12,0)},22)
        set_pose({"torso":(-9,0,0),"bulb.base":(20,0,18),"bulb.tip":(-28,0,-22),"head":(-10,0,0)},50)
        set_pose({"bulb.base":(-13,0,-12),"bulb.tip":(18,0,16),"head":(8,0,0)},68)
    # Make root invariance explicit in every action.
    root=rig.pose.bones["root"]
    for frame in (start,end):
        root.location=(0,0,0); root.keyframe_insert("location",frame=frame,group="root")
    action["semantic_clip"] = name
    action["translation_owner"] = "gameplay_entity"
    action["root_motion"] = "none"
    action["reduced_motion_final_frame"] = end
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    if 'pose.bones["CTRL.' in curve.data_path:
                        for keyframe in curve.keyframe_points:
                            keyframe.interpolation = "LINEAR"
    return action

for clip_name, (start,end,_) in CLIPS.items():
    author_action(clip_name,start,end)

# External consumers can reconstruct the exact IK ownership without inspecting
# constraint order. Support windows are annotations over authored control curves.
scene["ik_contract_json"] = json.dumps(
    {
        "solver": "two_bone_joint_continuous",
        "chainCount": 2,
        "useStretch": False,
        "contactPoint": "foot_tail",
        "continuityToleranceM": 1e-5,
        "supportSlipToleranceM": 0.006,
        "controls": [
            {
                "foot": f"foot.{region}.{side}",
                "ankle": f"CTRL.ankle.{region}.{side}",
                "pole": f"CTRL.pole.{region}.{side}",
                "heel": f"CTRL.heel.{region}.{side}",
            }
            for region in ("front", "rear")
            for side in ("L", "R")
        ],
    },
    sort_keys=True,
)

# Effect visibility and authored projectile travel are object-owned actions.
# The evidence renderer evaluates these curves and never masks objects itself.
def bind_visibility(obj, owner: str):
    """Drive visibility from a property keyed inside the owning rig action."""
    prop = f"fx_visible_{owner}"
    rig[prop] = False
    for path in ("hide_render", "hide_viewport"):
        driver = obj.driver_add(path).driver
        variable = driver.variables.new()
        variable.name = "visible"
        variable.targets[0].id = rig
        variable.targets[0].data_path = f'["{prop}"]'
        driver.expression = "not visible"
    obj["owner_clip"] = owner
    return prop

def key_owner_visibility(owner: str, frame: int, visible: bool):
    rig[f"fx_visible_{owner}"] = visible
    rig.keyframe_insert(f'["fx_visible_{owner}"]', frame=frame, group=f"effects.{owner}")


def transform_reset(obj):
    return {
        "location": [float(value) for value in obj.location],
        "rotationEuler": [float(value) for value in obj.rotation_euler],
        "scale": [float(value) for value in obj.scale],
    }


effect_objects = {
    "vine_whip": sorted((obj for obj in bpy.data.objects if obj.name.startswith("VINE_")), key=lambda obj: obj.name),
    "razor_leaf": [bpy.data.objects[f"RAZOR_LEAF_{index:02d}"] for index in range(12)],
    "tackle": [contact],
    "growl": growl_rings,
}
effect_resets = {
    obj.name: transform_reset(obj)
    for objects in effect_objects.values()
    for obj in objects
}

for obj in [o for o in bpy.data.objects if o.name.startswith("VINE_")]:
    bind_visibility(obj, "vine_whip")
rig.animation_data.action = bpy.data.actions["BulbasaurC.vine_whip"]
for frame,visible in ((1,False),(19,True),(62,True),(84,False)):
    key_owner_visibility("vine_whip",frame,visible)
for index in range(12):
    leaf=bpy.data.objects[f"RAZOR_LEAF_{index:02d}"]
    bind_visibility(leaf, "razor_leaf")
    phase=index*math.tau/12
    reset = effect_resets[leaf.name]
    for frame in (1, 21):
        leaf.location = reset["location"]
        leaf.rotation_euler = reset["rotationEuler"]
        leaf.scale = reset["scale"]
        leaf.keyframe_insert("location",frame=frame)
        leaf.keyframe_insert("rotation_euler",frame=frame)
        leaf.keyframe_insert("scale",frame=frame)
    for frame,t in ((22,0.0),(38,0.42),(50,0.72),(68,1.0)):
        radius=.28+.18*t
        leaf.location=(math.cos(phase+8*t)*radius,-.02-1.55*t,.75+math.sin(phase+8*t)*.18)
        leaf.rotation_euler=(0.3+phase,0.5+10*t,phase+14*t)
        leaf.keyframe_insert("location",frame=frame); leaf.keyframe_insert("rotation_euler",frame=frame)
    for frame in (69, 90):
        leaf.location = reset["location"]
        leaf.rotation_euler = reset["rotationEuler"]
        leaf.scale = reset["scale"]
        leaf.keyframe_insert("location",frame=frame)
        leaf.keyframe_insert("rotation_euler",frame=frame)
        leaf.keyframe_insert("scale",frame=frame)
    leaf.animation_data.action.name = f"BulbasaurC.razor_leaf.projectile.{leaf.name}"
    leaf.animation_data.action.use_fake_user = True
    leaf.animation_data.action["owner_clip"] = "razor_leaf"
    leaf.animation_data.action["lifecycle"] = "reset>release>travel>contact>reset"
rig.animation_data.action = bpy.data.actions["BulbasaurC.razor_leaf"]
for frame,visible in ((1,False),(22,True),(68,True),(69,False),(90,False)):
    key_owner_visibility("razor_leaf",frame,visible)
bind_visibility(contact, "tackle")
rig.animation_data.action = bpy.data.actions["BulbasaurC.tackle"]
for frame,visible in ((1,False),(33,True),(36,False),(66,False)):
    key_owner_visibility("tackle",frame,visible)

for index, ring in enumerate(growl_rings):
    bind_visibility(ring, "growl")
    reset = effect_resets[ring.name]
    for frame, scale in ((1, 1.0), (17, 1.0), (18, 0.72), (34, 1.55 + index * 0.12), (51, 2.35 + index * 0.18), (52, 1.0), (72, 1.0)):
        ring.location = reset["location"]
        ring.rotation_euler = reset["rotationEuler"]
        ring.scale = tuple(value * scale for value in reset["scale"])
        ring.keyframe_insert("location", frame=frame)
        ring.keyframe_insert("rotation_euler", frame=frame)
        ring.keyframe_insert("scale", frame=frame)
    ring.animation_data.action.name = f"BulbasaurC.growl.pressure.{ring.name}"
    ring.animation_data.action.use_fake_user = True
    ring.animation_data.action["owner_clip"] = "growl"
    ring.animation_data.action["lifecycle"] = "reset>release>pressure>reset"
rig.animation_data.action = bpy.data.actions["BulbasaurC.growl"]
for frame, visible in ((1, False), (17, False), (18, True), (51, True), (52, False), (72, False)):
    key_owner_visibility("growl", frame, visible)

lifecycle = {
    "schemaVersion": 1,
    "asset": "bulbasaur-c-production-animation-v3",
    "actions": list(CLIPS),
    "transitionPolicy": "reset_all_effects_before_target_action",
    "runtimeAdapter": "tools/bulbasaur_animation_runtime.py",
    "blenderAdapter": "tools/bulbasaur_animation_blender_adapter.py",
    "effects": {},
}
for owner, objects in effect_objects.items():
    lifecycle["effects"][owner] = {
        "ownerClip": owner,
        "driverProperty": f"fx_visible_{owner}",
        "objects": [
            {
                "name": obj.name,
                "reset": effect_resets[obj.name],
                "animationAction": obj.animation_data.action.name if obj.animation_data and obj.animation_data.action else None,
            }
            for obj in objects
        ],
    }
(OUTPUT / "effect-lifecycle.v1.json").write_text(json.dumps(lifecycle, indent=2, sort_keys=True) + "\n")

# External marker/action contract executed by the shared runtime adapter.
markers=[]
for clip,(start,end,mode) in CLIPS.items():
    entries=[]
    if clip in MOVE_BEATS:
        for frame,phase in MOVE_BEATS[clip]:
            entries.append({"frame":frame,"timeSeconds":round((frame-start)/FPS,6),"phase":phase})
    else:
        entries=[{"frame":start,"timeSeconds":0.0,"phase":"enter"},{"frame":end,"timeSeconds":round((end-start)/FPS,6),"phase":"exit"}]
    markers.append({
        "clip":clip,"action":f"BulbasaurC.{clip}","startFrame":start,"endFrame":end,"fps":FPS,
        "playback":mode,"rootMotion":"none","translationOwner":"gameplay_entity","markers":entries,
        "supportWindows":[{"startFrame":first,"endFrame":last,"feet":feet} for first,last,feet in SUPPORT_WINDOWS.get(clip,[])],
        "reducedMotion":{"sameFinalGameplayState":True,"policy":"suppress_camera_impulse_and_high_frequency_vfx"},
    })
contracts={
    "schemaVersion":2,"asset":"bulbasaur-c-production-animation-v3","inputSha256":EXPECTED_INPUT_SHA256,
    "crossingRule":"direction-aware half-open crossing; forward previous < marker <= current; reverse current <= marker < previous; loop intervals split at seam; stable declaration order; once per traversal",
    "runtimeAdapter":"tools/bulbasaur_animation_runtime.py",
    "effectLifecycle":"effect-lifecycle.v1.json",
    "clips":markers,
    "moves":{
        "tackle":{"targetReaction":"heavy_forward_body_contact","vfx":"ground_push_then_body_contact_ring","audio":"foot_push/body_hit/recoil","camera":"push_in/contact_impulse/recover"},
        "growl":{"targetReaction":"brace_then_confidence_drop","vfx":"jaw_origin_concentric_pressure_ribbons","audio":"jaw_open_growl/arena_reflection","camera":"low_head_push/pressure_pulse/recover"},
        "vine_whip":{"targetReaction":"alternating_left_right_lash_contacts","vfx":"physical_vine_tip_trails/contact_sparks","audio":"left_snap/right_snap/leaf_rustle","camera":"lateral_follow/two_contact_impulses/recover"},
        "razor_leaf":{"targetReaction":"spiral_volley_multi_contact","vfx":"twelve_authored_leaf_meshes_spiral_travel_contact","audio":"bulb_charge/leaf_release/multi_contact","camera":"bulb_orbit/volley_track/contact_cluster/recover"},
    },
}
(OUTPUT/"animation-markers.v1.json").write_text(json.dumps(contracts,indent=2,sort_keys=True)+"\n")
scene["animation_contract"] = "animation-markers.v1.json"
scene["effect_lifecycle_contract"] = "effect-lifecycle.v1.json"
scene["approved_input_sha256"] = EXPECTED_INPUT_SHA256
scene["source_c_sha256"] = EXPECTED_SOURCE_C_SHA256
scene["builder_can_promote"] = False
scene["product_integration"] = False
scene["publication"] = False

# Save a canonical clean lifecycle state. Runtime/DCC adapters select any
# owner-local object actions only after the global teardown has completed.
for effect in lifecycle["effects"].values():
    rig[effect["driverProperty"]] = False
    for declaration in effect["objects"]:
        obj = bpy.data.objects[declaration["name"]]
        if obj.animation_data:
            obj.animation_data.action = None
        reset = declaration["reset"]
        obj.location = reset["location"]
        obj.rotation_euler = reset["rotationEuler"]
        obj.scale = reset["scale"]
rig.animation_data.action = bpy.data.actions["BulbasaurC.bind"]
scene.frame_set(1)
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND),check_existing=False)
print(f"ANIMATION_BUILD_PASS {BLEND}")
