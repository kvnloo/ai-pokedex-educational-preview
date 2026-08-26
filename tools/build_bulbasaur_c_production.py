#!/usr/bin/env python3
"""Build the authored joint-loop Bulbasaur C production retopo in Blender 5.2.

The deformation cages are explicit cross-section lofts and an authored torus.
No Decimate, Unsubdivide, Remesh, QuadriFlow, Shrinkwrap, or generated mesh is
used. The immutable A/B/C evidence tree is hash-gated before any work.
"""

from __future__ import annotations

import json
import math
import os
import subprocess
import sys
from pathlib import Path
from statistics import mean

import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from bulbasaur_c_contract import (  # noqa: E402
    BALLOT_SHA256,
    CANONICAL_SOURCE_SHA256,
    DEFORMATION_SURFACES,
    EXPECTED_FROZEN_FILE_COUNT,
    EXPECTED_FROZEN_TREE_SHA256,
    EXPECTED_SOURCE_SHA256,
    FOOT_NAMES,
    FROZEN_EVIDENCE_ROOT,
    LOFT_SPECS,
    PALETTE,
    POSES,
    PROMOTED_PANEL_SHA256,
    QA_THRESHOLDS,
    SOURCE,
    TORUS_SPEC,
    hash_tree,
    material_key,
    sha256_path,
)

ROOT = Path(os.environ.get("BULBASAUR_C_OUTPUT", "artifacts/bulbasaur-C-production")).resolve()
BLEND = ROOT / "bulbasaur_C_production.blend"
RENDERS = ROOT / "review-renders"
FIXED = ROOT / "fixed-camera"
ROOT.mkdir(parents=True, exist_ok=True)
RENDERS.mkdir(parents=True, exist_ok=True)
FIXED.mkdir(parents=True, exist_ok=True)
bpy.context.preferences.filepaths.save_version = 0
stale_backup = Path(str(BLEND) + "1")
if stale_backup.exists():
    stale_backup.unlink()


def fail(message: str) -> None:
    raise RuntimeError(f"FAIL CLOSED: {message}")


source_hash = sha256_path(SOURCE)
if source_hash != EXPECTED_SOURCE_SHA256:
    fail(f"promoted source hash {source_hash} != {EXPECTED_SOURCE_SHA256}")
frozen_before = hash_tree(FROZEN_EVIDENCE_ROOT)
if frozen_before["treeSha256"] != EXPECTED_FROZEN_TREE_SHA256:
    fail(f"frozen evidence tree changed: {frozen_before['treeSha256']}")
if frozen_before["fileCount"] != EXPECTED_FROZEN_FILE_COUNT:
    fail(f"frozen evidence file count changed: {frozen_before['fileCount']}")
(ROOT / "frozen-inputs-before.json").write_text(
    json.dumps(
        {
            **frozen_before,
            "selected": {
                "ballotSha256": BALLOT_SHA256,
                "promotedPanelSha256": PROMOTED_PANEL_SHA256,
                "promotedSourceSha256": source_hash,
            },
        },
        indent=2,
        sort_keys=True,
    )
    + "\n",
    encoding="utf-8",
)

# The source .blend is opened by the Blender command. Remove only evidence-stage
# objects; the immutable source file itself is never written.
for obj in list(bpy.data.objects):
    if obj.name == "STAGE_ground" or obj.type in {"LIGHT", "CAMERA"}:
        bpy.data.objects.remove(obj, do_unlink=True)

meshes = sorted((obj for obj in bpy.data.objects if obj.type == "MESH"), key=lambda obj: obj.name)
if len(meshes) != 55:
    fail(f"expected 55 source semantic meshes, got {len(meshes)}")
source_names = [obj.name for obj in meshes]
if set(DEFORMATION_SURFACES) - set(source_names):
    fail(f"missing deformation sources: {sorted(set(DEFORMATION_SURFACES) - set(source_names))}")
source_topology = {
    obj.name: {
        "vertices": len(obj.data.vertices),
        "triangles": sum(len(poly.vertices) - 2 for poly in obj.data.polygons),
    }
    for obj in meshes
}


def evaluated_world_bvh(obj: bpy.types.Object) -> BVHTree:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    points = [evaluated.matrix_world @ vertex.co for vertex in mesh.vertices]
    polygons = [tuple(poly.vertices) for poly in mesh.polygons]
    tree = BVHTree.FromPolygons(points, polygons, all_triangles=False)
    evaluated.to_mesh_clear()
    if tree is None:
        fail(f"could not build source BVH for {obj.name}")
    return tree


def local_bounds(obj: bpy.types.Object) -> tuple[Vector, Vector]:
    points = [vertex.co for vertex in obj.data.vertices]
    return (
        Vector(tuple(min(point[index] for point in points) for index in range(3))),
        Vector(tuple(max(point[index] for point in points) for index in range(3))),
    )


def assign_uvs(mesh: bpy.types.Mesh, axis: str, center: Vector, radii: Vector) -> None:
    axis_index = {"X": 0, "Y": 1, "Z": 2}[axis]
    if axis == "Z":
        cross = (0, 1)
        signs = (1.0, 1.0)
    elif axis == "Y":
        cross = (0, 2)
        signs = (1.0, -1.0)
    else:
        cross = (1, 2)
        signs = (1.0, 1.0)
    uv_layer = mesh.uv_layers.new(name="UVMap")
    raw: dict[int, tuple[float, float]] = {}
    for vertex in mesh.vertices:
        axial = (vertex.co[axis_index] - center[axis_index]) / max(radii[axis_index], 1e-12)
        first = (vertex.co[cross[0]] - center[cross[0]]) / max(radii[cross[0]], 1e-12)
        second = (vertex.co[cross[1]] - center[cross[1]]) / max(radii[cross[1]], 1e-12)
        angle = math.atan2(second * signs[1], first * signs[0])
        raw[vertex.index] = ((angle / (2.0 * math.pi)) % 1.0, (axial + 1.0) * 0.5)
    for polygon in mesh.polygons:
        values = [raw[mesh.loops[index].vertex_index] for index in polygon.loop_indices]
        non_pole = [value[0] for value in values if 1e-5 < value[1] < 1.0 - 1e-5]
        pole_u = sum(non_pole) / len(non_pole) if non_pole else 0.5
        if non_pole and max(non_pole) - min(non_pole) > 0.5:
            pole_u = sum(value + (1.0 if value < 0.5 else 0.0) for value in non_pole) / len(non_pole)
        for loop_index, (u, v) in zip(polygon.loop_indices, values):
            if v <= 1e-5 or v >= 1.0 - 1e-5:
                u = pole_u
            elif non_pole and max(non_pole) - min(non_pole) > 0.5 and u < 0.5:
                u += 1.0
            uv_layer.data[loop_index].uv = (u, v)


def replace_with_loft(obj: bpy.types.Object, spec: dict[str, object]) -> dict[str, object]:
    source_bvh = evaluated_world_bvh(obj)
    minimum, maximum = local_bounds(obj)
    center = (minimum + maximum) * 0.5
    radii = (maximum - minimum) * 0.5
    axis = str(spec["axis"])
    axis_index = {"X": 0, "Y": 1, "Z": 2}[axis]
    if axis == "Z":
        cross = (0, 1)
        signs = (1.0, 1.0)
    elif axis == "Y":
        cross = (0, 2)
        signs = (1.0, -1.0)
    else:
        cross = (1, 2)
        signs = (1.0, 1.0)
    segments = int(spec["segments"])
    stations = [float(value) for value in spec["stations"]]
    vertices: list[tuple[float, float, float]] = []
    bottom = center.copy()
    bottom[axis_index] -= radii[axis_index]
    vertices.append(tuple(bottom))
    ring_indices: list[list[int]] = []
    for station in stations:
        ring: list[int] = []
        radial = math.sqrt(max(0.0, 1.0 - station * station))
        for segment in range(segments):
            angle = 2.0 * math.pi * segment / segments
            point = center.copy()
            point[axis_index] += radii[axis_index] * station
            point[cross[0]] += radii[cross[0]] * radial * math.cos(angle) * signs[0]
            point[cross[1]] += radii[cross[1]] * radial * math.sin(angle) * signs[1]
            ring.append(len(vertices))
            vertices.append(tuple(point))
        ring_indices.append(ring)
    top_index = len(vertices)
    top = center.copy()
    top[axis_index] += radii[axis_index]
    vertices.append(tuple(top))
    faces: list[tuple[int, ...]] = []
    first = ring_indices[0]
    for segment in range(segments):
        faces.append((0, first[(segment + 1) % segments], first[segment]))
    for lower, upper in zip(ring_indices, ring_indices[1:]):
        for segment in range(segments):
            next_segment = (segment + 1) % segments
            faces.append((lower[segment], lower[next_segment], upper[next_segment], upper[segment]))
    last = ring_indices[-1]
    for segment in range(segments):
        faces.append((top_index, last[segment], last[(segment + 1) % segments]))
    old_mesh = obj.data
    mesh = bpy.data.meshes.new(f"RETOPO_{obj.name}")
    mesh.from_pydata(vertices, [], faces)
    mesh.update(calc_edges=True)
    assign_uvs(mesh, axis, center, radii)
    obj.data = mesh
    for modifier in list(obj.modifiers):
        obj.modifiers.remove(modifier)
    if old_mesh.users == 0:
        bpy.data.meshes.remove(old_mesh)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    groups: dict[str, list[int]] = {}
    for label, station in dict(spec["loops"]).items():
        station_index = min(range(len(stations)), key=lambda index: abs(stations[index] - float(station)))
        group_name = f"TOPO_{label}"
        vertex_group = obj.vertex_groups.new(name=group_name)
        indices = ring_indices[station_index]
        vertex_group.add(indices, 1.0, "REPLACE")
        groups[group_name] = indices
    distances = []
    for vertex in mesh.vertices:
        nearest = source_bvh.find_nearest(obj.matrix_world @ vertex.co)
        if nearest is None:
            fail(f"source projection unavailable for {obj.name}:{vertex.index}")
        distances.append(float(nearest[3]))
    obj["semantic_feature"] = obj.name
    obj["topology_method"] = "authored_explicit_cross_section_loft_v2"
    obj["retopo_axis"] = axis
    obj["retopo_ring_segments"] = segments
    obj["retopo_station_count"] = len(stations)
    obj["source_surface_mean_distance_m"] = mean(distances)
    obj["source_surface_max_distance_m"] = max(distances)
    return {
        "method": obj["topology_method"],
        "axis": axis,
        "segments": segments,
        "stations": stations,
        "namedLoops": {name: len(indices) for name, indices in groups.items()},
        "sourceSurfaceMeanDistanceM": mean(distances),
        "sourceSurfaceMaxDistanceM": max(distances),
        "vertices": len(mesh.vertices),
        "triangles": sum(len(poly.vertices) - 2 for poly in mesh.polygons),
    }


def assign_torus_uvs(mesh: bpy.types.Mesh, major_segments: int, minor_segments: int) -> None:
    uv_layer = mesh.uv_layers.new(name="UVMap")
    for polygon in mesh.polygons:
        major_values = []
        minor_values = []
        for loop_index in polygon.loop_indices:
            vertex_index = mesh.loops[loop_index].vertex_index
            major_values.append((vertex_index // minor_segments) / major_segments)
            minor_values.append((vertex_index % minor_segments) / minor_segments)
        if max(major_values) - min(major_values) > 0.5:
            major_values = [value + (1.0 if value < 0.5 else 0.0) for value in major_values]
        if max(minor_values) - min(minor_values) > 0.5:
            minor_values = [value + (1.0 if value < 0.5 else 0.0) for value in minor_values]
        for loop_index, u, v in zip(polygon.loop_indices, major_values, minor_values):
            uv_layer.data[loop_index].uv = (u, v)


def replace_with_torus(obj: bpy.types.Object) -> dict[str, object]:
    source_bvh = evaluated_world_bvh(obj)
    radial = [math.hypot(vertex.co.x, vertex.co.y) for vertex in obj.data.vertices]
    major_radius = (max(radial) + min(radial)) * 0.5
    minor_radius = (max(radial) - min(radial)) * 0.5
    major_segments = int(TORUS_SPEC["majorSegments"])
    minor_segments = int(TORUS_SPEC["minorSegments"])
    vertices = []
    for major in range(major_segments):
        theta = 2.0 * math.pi * major / major_segments
        for minor in range(minor_segments):
            phi = 2.0 * math.pi * minor / minor_segments
            radius = major_radius + minor_radius * math.cos(phi)
            vertices.append((radius * math.cos(theta), radius * math.sin(theta), minor_radius * math.sin(phi)))
    faces = []
    for major in range(major_segments):
        next_major = (major + 1) % major_segments
        for minor in range(minor_segments):
            next_minor = (minor + 1) % minor_segments
            faces.append(
                (
                    major * minor_segments + minor,
                    next_major * minor_segments + minor,
                    next_major * minor_segments + next_minor,
                    major * minor_segments + next_minor,
                )
            )
    old_mesh = obj.data
    mesh = bpy.data.meshes.new(f"RETOPO_{obj.name}")
    mesh.from_pydata(vertices, [], faces)
    mesh.update(calc_edges=True)
    assign_torus_uvs(mesh, major_segments, minor_segments)
    obj.data = mesh
    for modifier in list(obj.modifiers):
        obj.modifiers.remove(modifier)
    if old_mesh.users == 0:
        bpy.data.meshes.remove(old_mesh)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    named_loops = {}
    for label, minor_index in zip(TORUS_SPEC["contactLoops"], TORUS_SPEC["contactMinorIndices"]):
        indices = [major * minor_segments + int(minor_index) for major in range(major_segments)]
        group_name = f"TOPO_{label}"
        vertex_group = obj.vertex_groups.new(name=group_name)
        vertex_group.add(indices, 1.0, "REPLACE")
        named_loops[group_name] = len(indices)
    distances = []
    for vertex in mesh.vertices:
        nearest = source_bvh.find_nearest(obj.matrix_world @ vertex.co)
        if nearest is None:
            fail(f"source projection unavailable for {obj.name}:{vertex.index}")
        distances.append(float(nearest[3]))
    obj["semantic_feature"] = obj.name
    obj["topology_method"] = "authored_explicit_joint_saddle_torus_v2"
    obj["retopo_ring_segments"] = major_segments
    obj["retopo_station_count"] = minor_segments
    obj["source_surface_mean_distance_m"] = mean(distances)
    obj["source_surface_max_distance_m"] = max(distances)
    return {
        "method": obj["topology_method"],
        "axis": "toroidal-saddle",
        "segments": major_segments,
        "stations": minor_segments,
        "namedLoops": named_loops,
        "sourceSurfaceMeanDistanceM": mean(distances),
        "sourceSurfaceMaxDistanceM": max(distances),
        "vertices": len(mesh.vertices),
        "triangles": sum(len(poly.vertices) - 2 for poly in mesh.polygons),
    }


topology_evidence: dict[str, dict[str, object]] = {}
for obj in meshes:
    if obj.name in LOFT_SPECS:
        topology_evidence[obj.name] = replace_with_loft(obj, LOFT_SPECS[obj.name])
    elif obj.name == TORUS_SPEC["name"]:
        topology_evidence[obj.name] = replace_with_torus(obj)
    else:
        obj["semantic_feature"] = obj.name
        obj["topology_method"] = "preserved_semantic_overlay_from_promoted_C"

# Consolidated authored glTF-compatible metallic/roughness palette.
materials: dict[str, bpy.types.Material] = {}
for key, color in PALETTE.items():
    material = bpy.data.materials.get(f"PBR_{key}") or bpy.data.materials.new(f"PBR_{key}")
    material.diffuse_color = color
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.64 if key not in {"eye", "pupil"} else 0.27
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.28 if key not in {"eye", "pupil"} else 0.42
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.0 if key not in {"eye", "pupil"} else 0.18
    material.node_tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    material["color_space_contract"] = "baseColor=sRGB; roughness/metallic=linear; glTF metallic-roughness"
    materials[key] = material

for obj in meshes:
    if not obj.data.uv_layers:
        fail(f"source semantic overlay unexpectedly lacks UVs: {obj.name}")
    obj.data.materials.clear()
    obj.data.materials.append(materials[material_key(obj.name)])
    obj["material_semantic"] = material_key(obj.name)

# Production deformation hierarchy: body/neck/head, two bulb bones, and an
# upper/lower/foot chain for every limb. The root is non-deforming.
bpy.ops.object.armature_add(enter_editmode=True, location=(0.0, 0.0, 0.0))
rig = bpy.context.object
rig.name = "RIG_Bulbasaur_C"
rig.data.name = "RIG_Bulbasaur_C_Data"
root_bone = rig.data.edit_bones[0]
root_bone.name = "root"
root_bone.head = (0.0, 0.0, 0.0)
root_bone.tail = (0.0, 0.0, 0.16)
root_bone.use_deform = False


def add_bone(name: str, head: tuple[float, float, float], tail: tuple[float, float, float], parent: str) -> None:
    bone = rig.data.edit_bones.new(name)
    bone.head = head
    bone.tail = tail
    bone.parent = rig.data.edit_bones[parent]
    bone.use_connect = False
    bone.use_deform = True


add_bone("torso", (0.0, 0.19, 0.24), (0.0, -0.04, 0.43), "root")
add_bone("chest", (0.0, -0.04, 0.40), (0.0, -0.29, 0.49), "torso")
add_bone("neck", (0.0, -0.29, 0.48), (0.0, -0.43, 0.51), "chest")
add_bone("head", (0.0, -0.43, 0.51), (0.0, -0.67, 0.45), "neck")
add_bone("jaw", (0.0, -0.63, 0.34), (0.0, -0.82, 0.27), "head")
add_bone("ear.L", (-0.18, -0.43, 0.58), (-0.31, -0.48, 0.84), "head")
add_bone("ear.R", (0.18, -0.43, 0.58), (0.31, -0.48, 0.84), "head")
add_bone("bulb.base", (0.0, 0.07, 0.43), (0.0, 0.08, 0.70), "torso")
add_bone("bulb.tip", (0.0, 0.08, 0.68), (0.0, 0.08, 1.02), "bulb.base")
for region in ("front", "rear"):
    parent = "chest" if region == "front" else "torso"
    for side, sign in (("L", -1.0), ("R", 1.0)):
        if region == "front":
            hip = (0.20 * sign, -0.29, 0.35)
            knee = (0.27 * sign, -0.39, 0.23)
            ankle = (0.27 * sign, -0.46, 0.13)
            toe = (0.27 * sign, -0.63, 0.08)
        else:
            hip = (0.20 * sign, 0.20, 0.35)
            knee = (0.31 * sign, 0.29, 0.23)
            ankle = (0.31 * sign, 0.24, 0.13)
            toe = (0.31 * sign, 0.06, 0.08)
        add_bone(f"leg.{region}.{side}.upper", hip, knee, parent)
        add_bone(f"leg.{region}.{side}.lower", knee, ankle, f"leg.{region}.{side}.upper")
        add_bone(f"foot.{region}.{side}", ankle, toe, f"leg.{region}.{side}.lower")
bpy.ops.object.mode_set(mode="OBJECT")
rig.show_in_front = True
rig.data.display_type = "OCTAHEDRAL"
rig["rear_hypothesis"] = "low-confidence rump contour and twin vine-root sockets retained from promoted C"
rig["source_sha256"] = EXPECTED_SOURCE_SHA256
rig["rig_contract"] = "22 total bones; 21 deform bones; upper/lower/foot chain per limb; <=4 influences"
for bone in rig.data.bones:
    bone["semantic_joint"] = bone.name


def smoothstep(edge0: float, edge1: float, value: float) -> float:
    if edge0 == edge1:
        return 0.0
    amount = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return amount * amount * (3.0 - 2.0 * amount)


def normalized(weights: dict[str, float]) -> dict[str, float]:
    positive = {name: max(0.0, value) for name, value in weights.items() if value > 1e-8}
    if not positive:
        fail("empty skin weight set")
    ordered = sorted(positive.items(), key=lambda item: item[1], reverse=True)[: int(QA_THRESHOLDS["maxInfluencesPerVertex"])]
    total = sum(value for _, value in ordered)
    return {name: value / total for name, value in ordered}


def component_weights(obj: bpy.types.Object, point: Vector, local_point: Vector) -> dict[str, float]:
    name = obj.name
    minimum, maximum = local_bounds(obj)
    if name == "torso":
        chest = smoothstep(-0.05, -0.34, point.y)
        bulb = smoothstep(0.43, 0.58, point.z) * (1.0 - smoothstep(0.24, 0.46, abs(point.x)))
        return normalized({"torso": max(0.08, 1.0 - 0.72 * chest - 0.42 * bulb), "chest": 0.72 * chest, "bulb.base": 0.42 * bulb})
    if name == "chest":
        torso = smoothstep(-0.12, 0.03, point.y)
        neck = smoothstep(-0.38, -0.53, point.y)
        return normalized({"torso": 0.60 * torso, "chest": max(0.10, 1.0 - 0.60 * torso - 0.66 * neck), "neck": 0.66 * neck})
    if name == "head":
        neck = smoothstep(-0.31, -0.12, point.y)
        return normalized({"neck": 0.70 * neck, "head": max(0.18, 1.0 - 0.70 * neck)})
    if name == "muzzle":
        jaw = smoothstep(0.34, 0.25, point.z) * smoothstep(-0.72, -0.84, point.y)
        return normalized({"head": max(0.35, 1.0 - 0.48 * jaw), "jaw": 0.48 * jaw})
    if name == "bulb_attachment":
        return {"torso": 0.44, "bulb.base": 0.56}
    if name == "bulb_core" or name.startswith("bulb_lobe_"):
        axis = 2 if name == "bulb_core" else 1
        amount = (local_point[axis] - minimum[axis]) / max(maximum[axis] - minimum[axis], 1e-9)
        torso = 0.24 * (1.0 - smoothstep(0.10, 0.42, amount))
        tip = 0.68 * smoothstep(0.38, 0.90, amount)
        return normalized({"torso": torso, "bulb.base": max(0.20, 1.0 - torso - tip), "bulb.tip": tip})
    if name.startswith("limb_"):
        _, region, side = name.split("_")
        amount = (local_point.z - minimum.z) / max(maximum.z - minimum.z, 1e-9)
        centers = {
            ("foot", f"foot.{region}.{side}"): 0.02,
            ("lower", f"leg.{region}.{side}.lower"): 0.34,
            ("upper", f"leg.{region}.{side}.upper"): 0.70,
            ("body", "chest" if region == "front" else "torso"): 1.02,
        }
        raw = {bone: max(0.0, 1.0 - abs(amount - center) / 0.42) for (_, bone), center in centers.items()}
        return normalized(raw)
    if name.startswith("foot_"):
        _, region, side = name.split("_")
        amount = (local_point.y - minimum.y) / max(maximum.y - minimum.y, 1e-9)
        lower = 0.42 * smoothstep(0.42, 0.90, amount)
        return normalized({f"foot.{region}.{side}": 1.0 - lower, f"leg.{region}.{side}.lower": lower})
    if name.startswith("toe_"):
        _, region, side, _ = name.split("_")
        return {f"foot.{region}.{side}": 1.0}
    if name in {"lower_jaw", "mouth_cavity", "tongue"} or name.startswith("tooth_"):
        return {"jaw": 1.0}
    if name.startswith("ear_"):
        return {"ear.L" if name.endswith("_L") else "ear.R": 1.0}
    if name.startswith(("eye_", "pupil_", "spot_cheek", "spot_forehead")):
        return {"head": 1.0}
    if name.startswith("vine_root_socket_"):
        return {"torso": 0.34, "bulb.base": 0.66}
    return {"torso": 1.0}


for obj in meshes:
    obj.vertex_groups.clear()
    # Recreate named topology groups after clear by reading the authored spec.
    if obj.name in LOFT_SPECS:
        spec = LOFT_SPECS[obj.name]
        segments = int(spec["segments"])
        stations = [float(value) for value in spec["stations"]]
        for label, station in dict(spec["loops"]).items():
            station_index = min(range(len(stations)), key=lambda index: abs(stations[index] - float(station)))
            indices = list(range(1 + station_index * segments, 1 + (station_index + 1) * segments))
            group = obj.vertex_groups.new(name=f"TOPO_{label}")
            group.add(indices, 1.0, "REPLACE")
    elif obj.name == TORUS_SPEC["name"]:
        minor_segments = int(TORUS_SPEC["minorSegments"])
        for label, minor_index in zip(TORUS_SPEC["contactLoops"], TORUS_SPEC["contactMinorIndices"]):
            indices = [major * minor_segments + int(minor_index) for major in range(int(TORUS_SPEC["majorSegments"]))]
            group = obj.vertex_groups.new(name=f"TOPO_{label}")
            group.add(indices, 1.0, "REPLACE")
    skin_groups: dict[str, bpy.types.VertexGroup] = {}
    for vertex in obj.data.vertices:
        weights = component_weights(obj, obj.matrix_world @ vertex.co, vertex.co)
        for bone_name, weight in weights.items():
            group = skin_groups.get(bone_name)
            if group is None:
                group = obj.vertex_groups.new(name=bone_name)
                skin_groups[bone_name] = group
            group.add([vertex.index], weight, "REPLACE")
    armature = obj.modifiers.new("ARMATURE_deform", "ARMATURE")
    armature.object = rig
    armature.use_deform_preserve_volume = True
    obj.parent = rig
    obj["deform_bones"] = ",".join(sorted(skin_groups))

# Scene evidence contract and fixed rendering setup.
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0
scene["review_evidence"] = "builder-excluded; topology/skin QA is non-canonical and non-certifying"
scene["canonical_source_sha256"] = CANONICAL_SOURCE_SHA256
scene["promoted_source_sha256"] = EXPECTED_SOURCE_SHA256
scene["promoted_panel_sha256"] = PROMOTED_PANEL_SHA256
scene["frozen_evidence_tree_sha256"] = EXPECTED_FROZEN_TREE_SHA256
scene["topology_contract_json"] = json.dumps(
    {
        "method": "explicit authored cross-section lofts and saddle torus",
        "forbiddenOperators": ["DECIMATE", "UNSUBDIV", "REMESH", "QUADRIFLOW", "SHRINKWRAP"],
        "objects": topology_evidence,
    },
    sort_keys=True,
)

bpy.ops.object.camera_add(location=(2.2, -3.2, 1.45))
camera = bpy.context.object
camera.name = "CAM_review"
camera.data.name = "CAM_review_Data"
scene.camera = camera
camera.data.lens = 58


def look_at(obj: bpy.types.Object, target: Vector) -> None:
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


look_at(camera, Vector((0.0, -0.03, 0.46)))
for name, location, energy, size in (
    ("Key", (-3.0, -4.0, 5.0), 900.0, 4.0),
    ("Fill", (4.0, -2.0, 3.0), 450.0, 3.0),
    ("Rim", (2.0, 4.0, 4.0), 800.0, 3.0),
):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.name = f"LIGHT_{name}"
    light.data.energy = energy
    light.data.shape = "DISK"
    light.data.size = size
    look_at(light, Vector((0.0, 0.0, 0.46)))
world = scene.world or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.012, 0.016, 0.022, 1.0)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.28

bpy.ops.mesh.primitive_plane_add(size=200.0, location=(0.0, 0.0, -0.001))
ground = bpy.context.object
ground.name = "STAGE_contact_ground"
ground["evidence_only"] = True
ground_material = bpy.data.materials.new("PBR_review_ground")
ground_material.diffuse_color = (0.035, 0.045, 0.055, 1.0)
ground_material.use_nodes = True
ground_bsdf = ground_material.node_tree.nodes.get("Principled BSDF")
ground_bsdf.inputs["Base Color"].default_value = ground_material.diffuse_color
ground_bsdf.inputs["Roughness"].default_value = 0.82
ground.data.materials.append(ground_material)


def reset_pose() -> None:
    for pose_bone in rig.pose.bones:
        pose_bone.matrix_basis = Matrix.Identity(4)
        pose_bone.rotation_mode = "XYZ"
    rig.location = (0.0, 0.0, 0.0)
    rig.rotation_euler = (0.0, 0.0, 0.0)
    rig.scale = (1.0, 1.0, 1.0)
    bpy.context.view_layer.update()


def foot_object_names(foot_name: str) -> list[str]:
    prefix = foot_name.removeprefix("foot_")
    return [foot_name, *sorted(name for name in source_names if name.startswith(f"toe_{prefix}_"))]


def evaluated_min_z(names: list[str]) -> float:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    values = []
    for name in names:
        evaluated = bpy.data.objects[name].evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        values.extend((evaluated.matrix_world @ vertex.co).z for vertex in mesh.vertices)
        evaluated.to_mesh_clear()
    return min(values)


def foot_bone_name(foot_name: str) -> str:
    _, region, side = foot_name.split("_")
    return f"foot.{region}.{side}"


def serialize_matrix(matrix: Matrix) -> list[float]:
    return [round(float(value), 10) for row in matrix for value in row]


def apply_base_rotations(rotations: dict[str, tuple[float, float, float]]) -> None:
    for name, degrees in rotations.items():
        pose_bone = rig.pose.bones[name]
        pose_bone.rotation_mode = "XYZ"
        pose_bone.rotation_euler = tuple(math.radians(value) for value in degrees)
    bpy.context.view_layer.update()


def solve_foot_target(foot_name: str, target_z: float) -> float:
    pose_bone = rig.pose.bones[foot_bone_name(foot_name)]
    cumulative = 0.0
    for _ in range(8):
        current = evaluated_min_z(foot_object_names(foot_name))
        delta = target_z - current
        if abs(delta) <= 1e-7:
            break
        matrix = pose_bone.matrix.copy()
        matrix.translation.z += delta
        pose_bone.matrix = matrix
        cumulative += delta
        bpy.context.view_layer.update()
    return cumulative


pose_contract: dict[str, dict[str, object]] = {}
for pose_name, pose in POSES.items():
    reset_pose()
    apply_base_rotations(dict(pose["rotationsDeg"]))
    corrections = {}
    for foot_name in FOOT_NAMES:
        target = 0.0 if foot_name in pose["planted"] else float(QA_THRESHOLDS["liftedFootClearanceM"]) + 0.025
        corrections[foot_name] = solve_foot_target(foot_name, target)
    pose_contract[pose_name] = {
        "rotationsDeg": pose["rotationsDeg"],
        "planted": pose["planted"],
        "lifted": pose["lifted"],
        "perFootArmatureSpaceZCorrectionsM": {name: round(value, 9) for name, value in corrections.items()},
        "matrixBasis": {bone.name: serialize_matrix(bone.matrix_basis) for bone in rig.pose.bones},
        "globalRigTranslation": [0.0, 0.0, 0.0],
    }
scene["pose_contract_json"] = json.dumps(pose_contract, sort_keys=True)


def apply_recorded_pose(pose_name: str) -> None:
    reset_pose()
    record = pose_contract[pose_name]
    for name, values in record["matrixBasis"].items():
        rig.pose.bones[name].matrix_basis = Matrix([values[index : index + 4] for index in range(0, 16, 4)])
    bpy.context.view_layer.update()


def configure_pbr_render(path: Path, resolution: int = 768) -> None:
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = resolution
    scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.film_transparent = False
    scene.render.dither_intensity = 0.0
    scene.render.filepath = str(path)
    scene.view_settings.look = "AgX - Medium High Contrast"


for pose_name in POSES:
    apply_recorded_pose(pose_name)
    configure_pbr_render(RENDERS / f"{pose_name}.png")
    bpy.ops.render.render(write_still=True)

# Joint-loop wireframe views. Temporary non-replacing Wireframe modifiers make
# the authored cage edges visible in final render pixels; they are removed
# before the production master is saved.
apply_recorded_pose("bind")
wire_material = bpy.data.materials.new("MAT_evidence_wire")
wire_material.diffuse_color = (0.008, 0.012, 0.018, 1.0)
wire_material.use_nodes = True
wire_bsdf = wire_material.node_tree.nodes.get("Principled BSDF")
wire_bsdf.inputs["Base Color"].default_value = wire_material.diffuse_color
wire_bsdf.inputs["Roughness"].default_value = 0.34
wire_modifiers = {}
for obj in meshes:
    obj.data.materials.append(wire_material)
    modifier = obj.modifiers.new("EVIDENCE_joint_loop_wire", "WIREFRAME")
    modifier.thickness = 0.0014
    modifier.use_replace = False
    modifier.use_even_offset = True
    modifier.material_offset = len(obj.data.materials) - 1
    wire_modifiers[obj.name] = modifier.name
for label, location in (("front34", (2.2, -3.2, 1.45)), ("side", (3.3, 0.0, 1.10))):
    camera.data.type = "PERSP"
    camera.location = location
    look_at(camera, Vector((0.0, 0.0, 0.46)))
    configure_pbr_render(RENDERS / f"wireframe-bind-{label}.png")
    bpy.ops.render.render(write_still=True)
for obj in meshes:
    obj.modifiers.remove(obj.modifiers[wire_modifiers[obj.name]])
    obj.data.materials.pop(index=len(obj.data.materials) - 1)

# Frozen-camera clay turntable and a source-vs-retopo comparison. The source
# inputs are read only and are never copied over or rewritten.
clay = bpy.data.materials.new("MAT_fixed_clay")
clay.diffuse_color = (0.32, 0.40, 0.50, 1.0)
original_materials = {obj.name: list(obj.data.materials) for obj in meshes}
for obj in meshes:
    obj.data.materials.clear()
    obj.data.materials.append(clay)
retopo_clay_dir = FIXED / "retopo-clay"
retopo_clay_dir.mkdir(parents=True, exist_ok=True)
roles = (
    ("front", 0.0),
    ("front-right-diagnostic", 22.5),
    ("front-right", 45.0),
    ("right", 90.0),
    ("rear-right-diagnostic", 112.5),
    ("rear-right", 135.0),
    ("rear", 180.0),
    ("rear-left-diagnostic", 202.5),
    ("rear-left", 225.0),
    ("left", 270.0),
    ("front-left-diagnostic", 292.5),
    ("front-left", 315.0),
)
camera.data.type = "ORTHO"
camera.data.ortho_scale = 1.2853657007217407
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.color_type = "MATERIAL"
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = True
scene.render.resolution_x = 512
scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
for role, degrees in roles:
    angle = math.radians(degrees)
    camera.location = (math.sin(angle) * 3.2, -math.cos(angle) * 3.2, 0.62808)
    look_at(camera, Vector((0.0, 0.0, 0.44)))
    scene.render.filepath = str(retopo_clay_dir / f"{role}.png")
    bpy.ops.render.render(write_still=True)
for obj in meshes:
    obj.data.materials.clear()
    for material in original_materials[obj.name]:
        obj.data.materials.append(material)

source_clay_dir = FROZEN_EVIDENCE_ROOT / "hypothesis-C" / "renders" / "clay"
source_grid = FIXED / "source-clay-grid.png"
retopo_grid = FIXED / "retopo-clay-grid.png"
comparison = FIXED / "source-vs-retopo-clay.png"
source_inputs = [str(source_clay_dir / f"{role}.png") for role, _ in roles]
retopo_inputs = [str(retopo_clay_dir / f"{role}.png") for role, _ in roles]
subprocess.run(["magick", "montage", *source_inputs, "-tile", "4x3", "-geometry", "512x512+8+8", str(source_grid)], check=True)
subprocess.run(["magick", "montage", *retopo_inputs, "-tile", "4x3", "-geometry", "512x512+8+8", str(retopo_grid)], check=True)
subprocess.run(["magick", str(source_grid), str(retopo_grid), "-append", str(comparison)], check=True)

# Save a bind-pose production master without the evidence-only ground mesh.
apply_recorded_pose("bind")
bpy.data.objects.remove(ground, do_unlink=True)
camera.data.type = "PERSP"
camera.location = (2.2, -3.2, 1.45)
look_at(camera, Vector((0.0, -0.03, 0.46)))
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True, relative_remap=True)

retopo_vertices = sum(len(obj.data.vertices) for obj in meshes)
retopo_triangles = sum(sum(len(poly.vertices) - 2 for poly in obj.data.polygons) for obj in meshes)
source_vertices = sum(record["vertices"] for record in source_topology.values())
source_triangles = sum(record["triangles"] for record in source_topology.values())
qa_build = {
    "schema": "pokemon.bulbasaur.production-build/v2",
    "scope": "builder-excluded non-canonical retopo/material/rig evidence; not certification",
    "source": {
        "path": str(SOURCE),
        "sha256": source_hash,
        "canonicalSha256": CANONICAL_SOURCE_SHA256,
        "components": len(meshes),
        "vertices": source_vertices,
        "triangles": source_triangles,
        "semanticFeatures": source_names,
    },
    "frozenEvidenceBefore": frozen_before,
    "production": {
        "blend": BLEND.name,
        "sha256": sha256_path(BLEND),
        "bytes": BLEND.stat().st_size,
        "meshObjects": len(meshes),
        "vertices": retopo_vertices,
        "triangles": retopo_triangles,
        "retopologizedObjects": list(DEFORMATION_SURFACES),
        "topologyEvidence": topology_evidence,
        "materials": sorted(material.name for material in materials.values()),
        "uvComplete": all(bool(obj.data.uv_layers) for obj in meshes),
        "armature": rig.name,
        "bones": len(rig.data.bones),
        "deformBones": sum(bone.use_deform for bone in rig.data.bones),
        "skinnedMeshes": sum(any(modifier.type == "ARMATURE" for modifier in obj.modifiers) for obj in meshes),
        "poses": {name: {"planted": record["planted"], "lifted": record["lifted"], "perFootArmatureSpaceZCorrectionsM": record["perFootArmatureSpaceZCorrectionsM"]} for name, record in pose_contract.items()},
    },
    "evidence": {
        "bindAndExtremeRenders": [f"review-renders/{name}.png" for name in POSES],
        "wireframes": ["review-renders/wireframe-bind-front34.png", "review-renders/wireframe-bind-side.png"],
        "fixedCameraComparison": "fixed-camera/source-vs-retopo-clay.png",
        "comparisonLayout": "top=immutable source C clay 12-role; bottom=authored retopo clay same role order/camera",
    },
    "guards": {
        "sourceUnmodified": sha256_path(SOURCE) == EXPECTED_SOURCE_SHA256,
        "frozenEvidenceUnmodifiedAtBuildEnd": hash_tree(FROZEN_EVIDENCE_ROOT)["treeSha256"] == EXPECTED_FROZEN_TREE_SHA256,
        "automaticRetopoOperatorsUsed": [],
        "gameplayAnimation": False,
        "productIntegration": False,
        "publication": False,
        "merge": False,
        "canonicalCertification": False,
    },
}
(ROOT / "qa-build.json").write_text(json.dumps(qa_build, indent=2, sort_keys=True) + "\n", encoding="utf-8")
print(json.dumps({"built": str(BLEND), "sha256": qa_build["production"]["sha256"], "vertices": retopo_vertices, "triangles": retopo_triangles}, sort_keys=True))
