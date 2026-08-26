#!/usr/bin/env python3
"""Independent deterministic reopen/deformation QA for Bulbasaur C retopo v2."""

from __future__ import annotations

import json
import math
import os
import sys
from pathlib import Path
from statistics import mean

import bmesh
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from bulbasaur_c_contract import (  # noqa: E402
    DEFORMATION_SURFACES,
    EXPECTED_FROZEN_FILE_COUNT,
    EXPECTED_FROZEN_TREE_SHA256,
    EXPECTED_SOURCE_SHA256,
    FOOT_NAMES,
    FORBIDDEN_INTERSECTION_PAIRS,
    FROZEN_EVIDENCE_ROOT,
    LOFT_SPECS,
    QA_THRESHOLDS,
    SOURCE,
    TORUS_SPEC,
    hash_tree,
    sha256_path,
)

ROOT = Path(bpy.data.filepath).resolve().parent
QA_OUT = Path(os.environ.get("BULBASAUR_C_QA_OUT", ROOT / "qa-final.json")).resolve()


def fail(message: str, details: object | None = None) -> None:
    payload = {"message": message}
    if details is not None:
        payload["details"] = details
    print("QA_FAIL " + json.dumps(payload, sort_keys=True))
    raise RuntimeError(message)


def percentile(values: list[float], fraction: float) -> float:
    if not values:
        fail("cannot percentile empty values")
    ordered = sorted(values)
    position = fraction * (len(ordered) - 1)
    lower = int(math.floor(position))
    upper = int(math.ceil(position))
    if lower == upper:
        return ordered[lower]
    amount = position - lower
    return ordered[lower] * (1.0 - amount) + ordered[upper] * amount


source_hash = sha256_path(SOURCE)
if source_hash != EXPECTED_SOURCE_SHA256:
    fail("immutable source hash changed", source_hash)
frozen_after = hash_tree(FROZEN_EVIDENCE_ROOT)
if frozen_after["treeSha256"] != EXPECTED_FROZEN_TREE_SHA256:
    fail("immutable A/B/C evidence tree changed", frozen_after)
if frozen_after["fileCount"] != EXPECTED_FROZEN_FILE_COUNT:
    fail("immutable evidence file count changed", frozen_after)

meshes = sorted(
    (
        obj
        for obj in bpy.data.objects
        if obj.type == "MESH" and not bool(obj.get("evidence_only"))
    ),
    key=lambda obj: obj.name,
)
rigs = [obj for obj in bpy.data.objects if obj.type == "ARMATURE"]
if len(meshes) != 55:
    fail("semantic mesh count", len(meshes))
if len(rigs) != 1:
    fail("armature count", len(rigs))
rig = rigs[0]
if len(rig.data.bones) != 22 or sum(bone.use_deform for bone in rig.data.bones) != 21:
    fail(
        "production bone contract",
        {"bones": len(rig.data.bones), "deformBones": sum(bone.use_deform for bone in rig.data.bones)},
    )
if any(abs(value) > 1e-9 for value in (*rig.location, *rig.rotation_euler)):
    fail("saved rig object transform is not identity", list(rig.location))
if any(abs(value - 1.0) > 1e-9 for value in rig.scale):
    fail("saved rig object scale is not identity", list(rig.scale))

names = {obj.name for obj in meshes}
required = {
    "torso",
    "chest",
    "head",
    "muzzle",
    "lower_jaw",
    "bulb_core",
    "bulb_attachment",
    "vine_root_socket_L",
    "vine_root_socket_R",
}
if not required.issubset(names):
    fail("required semantic features missing", sorted(required - names))
semantic_counts = {
    "limbs": sum(name.startswith("limb_") for name in names),
    "feet": sum(name.startswith("foot_") for name in names),
    "toes": sum(name.startswith("toe_") for name in names),
    "bulbLobes": sum(name.startswith("bulb_lobe_") for name in names),
    "vineSockets": sum(name.startswith("vine_root_socket_") for name in names),
}
if semantic_counts != {"limbs": 4, "feet": 4, "toes": 12, "bulbLobes": 6, "vineSockets": 2}:
    fail("semantic feature counts", semantic_counts)

bone_names = {bone.name for bone in rig.data.bones if bone.use_deform}
topology_contract = json.loads(str(bpy.context.scene.get("topology_contract_json", "{}")))
if set(topology_contract.get("objects", {})) != set(DEFORMATION_SURFACES):
    fail("topology contract object set", sorted(topology_contract.get("objects", {})))
if any(
    modifier.type in {"DECIMATE", "REMESH", "SHRINKWRAP"}
    for obj in meshes
    for modifier in obj.modifiers
):
    fail("forbidden automatic retopology modifier remains")


def group_indices(obj: bpy.types.Object, group_name: str) -> set[int]:
    group = obj.vertex_groups.get(group_name)
    if group is None:
        fail(f"missing vertex group {obj.name}:{group_name}")
    result = set()
    for vertex in obj.data.vertices:
        if any(item.group == group.index and item.weight > 0.5 for item in vertex.groups):
            result.add(vertex.index)
    return result


def loop_evidence(obj: bpy.types.Object, group_name: str) -> dict[str, object]:
    indices = group_indices(obj, group_name)
    edges = [
        edge
        for edge in obj.data.edges
        if edge.vertices[0] in indices and edge.vertices[1] in indices
    ]
    adjacency = {index: set() for index in indices}
    for edge in edges:
        first, second = edge.vertices
        adjacency[first].add(second)
        adjacency[second].add(first)
    connected = set()
    if indices:
        stack = [next(iter(indices))]
        while stack:
            current = stack.pop()
            if current in connected:
                continue
            connected.add(current)
            stack.extend(adjacency[current] - connected)
    valence = {
        vertex.index: sum(vertex.index in edge.vertices for edge in obj.data.edges)
        for vertex in obj.data.vertices
        if vertex.index in indices
    }
    closed = (
        bool(indices)
        and len(edges) == len(indices)
        and len(connected) == len(indices)
        and all(len(neighbors) == 2 for neighbors in adjacency.values())
    )
    if not closed:
        fail(
            f"named boundary is not one closed edge loop: {obj.name}:{group_name}",
            {"vertices": len(indices), "edges": len(edges), "connected": len(connected)},
        )
    if min(valence.values()) < 4 or max(valence.values()) > 4:
        fail(f"unexpected boundary-loop valence: {obj.name}:{group_name}", valence)
    return {
        "closed": True,
        "vertices": len(indices),
        "edges": len(edges),
        "connectedComponents": 1,
        "meshValenceMin": min(valence.values()),
        "meshValenceMax": max(valence.values()),
    }


def requires_boundary_blend(group_name: str) -> bool:
    return any(
        token in group_name
        for token in (
            "torso_chest",
            "chest_neck",
            "chest_torso",
            "head_neck",
            "_body_joint",
            "_knee_joint",
            "_foot_joint",
            "_ankle_joint",
            "bulb_torso_contact",
            "bulb_core_root",
            "bulb_lobe_",
        )
    ) and "tip_support" not in group_name


def skin_influences(obj: bpy.types.Object, vertex_index: int) -> list[tuple[str, float]]:
    vertex = obj.data.vertices[vertex_index]
    result = []
    for item in vertex.groups:
        name = obj.vertex_groups[item.group].name
        if name in bone_names and item.weight > 1e-7:
            result.append((name, item.weight))
    return result


mesh_report: dict[str, object] = {}
topology_report: dict[str, object] = {}
vertices = triangles = nonmanifold = zero_area = 0
material_names = set()
for obj in meshes:
    if len(obj.data.materials) != 1:
        fail(f"material-slot consolidation: {obj.name}", len(obj.data.materials))
    material_names.add(obj.data.materials[0].name)
    if not obj.data.uv_layers or not obj.data.uv_layers.active:
        fail(f"missing UVs: {obj.name}")
    armatures = [modifier for modifier in obj.modifiers if modifier.type == "ARMATURE" and modifier.object == rig]
    if len(armatures) != 1:
        fail(f"armature modifier contract: {obj.name}", len(armatures))
    if not armatures[0].use_deform_preserve_volume:
        fail(f"preserve-volume skinning disabled: {obj.name}")
    object_multi = 0
    for vertex in obj.data.vertices:
        influences = skin_influences(obj, vertex.index)
        total = sum(weight for _, weight in influences)
        if abs(total - 1.0) > 1e-5:
            fail(f"non-normalized skinning: {obj.name}:{vertex.index}", total)
        if len(influences) > int(QA_THRESHOLDS["maxInfluencesPerVertex"]):
            fail(f"too many influences: {obj.name}:{vertex.index}", influences)
        if len(influences) >= 2:
            object_multi += 1
    bmesh_value = bmesh.new()
    bmesh_value.from_mesh(obj.data)
    object_nonmanifold = sum(not edge.is_manifold for edge in bmesh_value.edges)
    object_zero = sum(face.calc_area() <= 1e-12 for face in bmesh_value.faces)
    bmesh_value.free()
    if object_nonmanifold or object_zero:
        fail(
            f"mesh-health failure: {obj.name}",
            {"nonmanifoldEdges": object_nonmanifold, "zeroAreaFaces": object_zero},
        )
    object_triangles = sum(len(poly.vertices) - 2 for poly in obj.data.polygons)
    vertices += len(obj.data.vertices)
    triangles += object_triangles
    nonmanifold += object_nonmanifold
    zero_area += object_zero
    mesh_report[obj.name] = {
        "vertices": len(obj.data.vertices),
        "triangles": object_triangles,
        "multiInfluenceFraction": object_multi / len(obj.data.vertices),
        "uvLayers": len(obj.data.uv_layers),
        "material": obj.data.materials[0].name,
        "topologyMethod": obj.get("topology_method"),
    }
    if obj.name in DEFORMATION_SURFACES:
        method = str(obj.get("topology_method", ""))
        if not method.startswith("authored_explicit_"):
            fail(f"deformation surface is not authored topology: {obj.name}", method)
        quad_fraction = sum(len(poly.vertices) == 4 for poly in obj.data.polygons) / len(obj.data.polygons)
        if quad_fraction < float(QA_THRESHOLDS["minQuadFraction"]):
            fail(f"quad fraction: {obj.name}", quad_fraction)
        if object_multi / len(obj.data.vertices) < float(QA_THRESHOLDS["minSurfaceMultiInfluenceFraction"]):
            fail(f"rigid deformation surface: {obj.name}", object_multi / len(obj.data.vertices))
        expected_loops = topology_contract["objects"][obj.name]["namedLoops"]
        loop_report = {}
        for group_name, expected_count in expected_loops.items():
            evidence = loop_evidence(obj, group_name)
            if evidence["vertices"] != int(expected_count):
                fail(f"edge-loop vertex count drift: {obj.name}:{group_name}", evidence)
            if requires_boundary_blend(group_name):
                indices = group_indices(obj, group_name)
                blended = sum(len(skin_influences(obj, index)) >= 2 for index in indices)
                fraction = blended / len(indices)
                evidence["multiInfluenceFraction"] = fraction
                if fraction < float(QA_THRESHOLDS["minBoundaryMultiInfluenceFraction"]):
                    fail(f"boundary is rigidly skinned: {obj.name}:{group_name}", fraction)
            loop_report[group_name] = evidence
        source_mean = float(obj.get("source_surface_mean_distance_m", 999.0))
        source_max = float(obj.get("source_surface_max_distance_m", 999.0))
        if source_mean > float(QA_THRESHOLDS["sourceSurfaceMeanDistanceM"]):
            fail(f"retopo mean source-surface deviation: {obj.name}", source_mean)
        if source_max > float(QA_THRESHOLDS["sourceSurfaceMaxDistanceM"]):
            fail(f"retopo max source-surface deviation: {obj.name}", source_max)
        topology_report[obj.name] = {
            "method": method,
            "quadFraction": quad_fraction,
            "sourceSurfaceMeanDistanceM": source_mean,
            "sourceSurfaceMaxDistanceM": source_max,
            "edgeLoops": loop_report,
        }

expected_materials = {
    "PBR_accent",
    "PBR_bulb",
    "PBR_bulb_dark",
    "PBR_eye",
    "PBR_mouth",
    "PBR_pupil",
    "PBR_skin",
    "PBR_spot",
}
if material_names != expected_materials:
    fail("consolidated PBR material set", sorted(material_names))
if vertices >= 16128 or triangles >= 32048:
    fail("objective topology reduction absent", {"vertices": vertices, "triangles": triangles})

# Explicitly prove the requested topology regions exist: body chain, every limb
# and foot joint, and the complete bulb saddle.
loop_names = {
    group_name
    for object_report in topology_report.values()
    for group_name in object_report["edgeLoops"]
}
for token in ("torso_chest", "chest_neck", "head_neck", "bulb_torso_contact"):
    if not any(token in name for name in loop_names):
        fail("missing required topology region", token)
for region in ("front", "rear"):
    for side in ("L", "R"):
        limb_token = f"limb_{region}_{side}"
        foot_token = f"foot_{region}_{side}"
        for joint in ("body_joint", "knee_joint", "foot_joint"):
            if not any(limb_token in name and joint in name for name in loop_names):
                fail("missing limb joint loop", f"{limb_token}:{joint}")
        if not any(foot_token in name and "ankle_joint" in name for name in loop_names):
            fail("missing foot ankle loop", foot_token)


def reset_pose() -> None:
    for pose_bone in rig.pose.bones:
        pose_bone.matrix_basis = Matrix.Identity(4)
    rig.location = (0.0, 0.0, 0.0)
    rig.rotation_euler = (0.0, 0.0, 0.0)
    rig.scale = (1.0, 1.0, 1.0)
    bpy.context.view_layer.update()


def deserialize_matrix(values: list[float]) -> Matrix:
    return Matrix([values[index : index + 4] for index in range(0, 16, 4)])


pose_contract = json.loads(str(bpy.context.scene.get("pose_contract_json", "{}")))
expected_pose_names = {"bind", "extreme-crouch", "extreme-reach-L", "extreme-reach-R", "extreme-bulb-jaw"}
if set(pose_contract) != expected_pose_names:
    fail("pose contract names", sorted(pose_contract))


def apply_pose(pose_name: str) -> None:
    reset_pose()
    for name, values in pose_contract[pose_name]["matrixBasis"].items():
        rig.pose.bones[name].matrix_basis = deserialize_matrix(values)
    bpy.context.view_layer.update()
    if any(abs(value) > 1e-9 for value in rig.location):
        fail(f"global rig translation used in {pose_name}", list(rig.location))
    root_basis = rig.pose.bones["root"].matrix_basis
    if any(abs(root_basis[row][column] - (1.0 if row == column else 0.0)) > 1e-8 for row in range(4) for column in range(4)):
        fail(f"root pose translated/rotated in {pose_name}")


def evaluated_geometry(obj: bpy.types.Object) -> dict[str, object]:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    points = [evaluated.matrix_world @ vertex.co for vertex in mesh.vertices]
    triangles_value = [tuple(triangle.vertices) for triangle in mesh.loop_triangles]
    edges_value = [tuple(edge.vertices) for edge in mesh.edges]
    evaluated.to_mesh_clear()
    return {"points": points, "triangles": triangles_value, "edges": edges_value}


def geometry_metrics(geometry: dict[str, object]) -> dict[str, object]:
    points: list[Vector] = geometry["points"]
    triangle_indices: list[tuple[int, int, int]] = geometry["triangles"]
    edge_indices: list[tuple[int, int]] = geometry["edges"]
    signed_volume = 0.0
    area = 0.0
    for first_index, second_index, third_index in triangle_indices:
        first, second, third = points[first_index], points[second_index], points[third_index]
        signed_volume += first.dot(second.cross(third)) / 6.0
        area += (second - first).cross(third - first).length * 0.5
    edge_lengths = [(points[second] - points[first]).length for first, second in edge_indices]
    return {"volume": abs(signed_volume), "surfaceArea": area, "edgeLengths": edge_lengths}


def self_intersection_pairs(geometry: dict[str, object]) -> int:
    points: list[Vector] = geometry["points"]
    triangle_indices: list[tuple[int, int, int]] = geometry["triangles"]
    tree = BVHTree.FromPolygons(points, triangle_indices, all_triangles=True)
    if tree is None:
        fail("could not build self-intersection BVH")
    count = 0
    for first, second in tree.overlap(tree):
        if first >= second:
            continue
        if set(triangle_indices[first]).isdisjoint(triangle_indices[second]):
            count += 1
    return count


def bvh_for(geometry: dict[str, object]) -> BVHTree:
    tree = BVHTree.FromPolygons(geometry["points"], geometry["triangles"], all_triangles=True)
    if tree is None:
        fail("could not build BVH")
    return tree


def foot_objects(foot_name: str) -> list[str]:
    prefix = foot_name.removeprefix("foot_")
    return [foot_name, *sorted(name for name in names if name.startswith(f"toe_{prefix}_"))]


def foot_min_z(foot_name: str, geometry: dict[str, dict[str, object]]) -> float:
    return min(point.z for name in foot_objects(foot_name) for point in geometry[name]["points"])


def bulb_contact_metrics(geometry: dict[str, dict[str, object]]) -> dict[str, object]:
    attachment_obj = bpy.data.objects["bulb_attachment"]
    attachment_points: list[Vector] = geometry["bulb_attachment"]["points"]
    torso_tree = bvh_for(geometry["torso"])
    group_records = {}
    signed_values = []
    absolute_values = []
    for label in TORUS_SPEC["contactLoops"]:
        group_name = f"TOPO_{label}"
        indices = sorted(group_indices(attachment_obj, group_name))
        group_signed = []
        for index in indices:
            point = attachment_points[index]
            nearest = torso_tree.find_nearest(point)
            if nearest is None:
                fail("torso nearest point unavailable", {"group": group_name, "index": index})
            location, normal, _, distance = nearest
            signed = (point - location).dot(normal)
            group_signed.append(signed)
            signed_values.append(signed)
            absolute_values.append(float(distance))
        group_records[group_name] = {
            "verticesEvaluated": len(indices),
            "maxPositiveSeparationM": max(group_signed),
            "meanSignedDistanceM": mean(group_signed),
        }
    inside_fraction = sum(value <= 0.0 for value in signed_values) / len(signed_values)
    result = {
        "groups": group_records,
        "verticesEvaluated": len(signed_values),
        "maxPositiveSeparationM": max(signed_values),
        "maxPenetrationM": max(0.0, -min(signed_values)),
        "p95AbsoluteDistanceM": percentile(absolute_values, 0.95),
        "insideFraction": inside_fraction,
    }
    if result["maxPositiveSeparationM"] > float(QA_THRESHOLDS["bulbContactMaxPositiveSeparationM"]):
        fail("full bulb attachment separation", result)
    if result["p95AbsoluteDistanceM"] > float(QA_THRESHOLDS["bulbContactMaxP95AbsoluteDistanceM"]):
        fail("full bulb attachment distance", result)
    if result["maxPenetrationM"] > float(QA_THRESHOLDS["bulbContactMaxPenetrationM"]):
        fail("full bulb attachment penetration", result)
    if inside_fraction < float(QA_THRESHOLDS["bulbContactMinInsideFraction"]):
        fail("full bulb attachment inside coverage", result)
    return result


apply_pose("bind")
bind_geometry = {obj.name: evaluated_geometry(obj) for obj in meshes}
bind_metrics = {
    name: geometry_metrics(bind_geometry[name]) for name in DEFORMATION_SURFACES
}
pose_report: dict[str, object] = {}
for pose_name, declaration in pose_contract.items():
    apply_pose(pose_name)
    pose_geometry = {obj.name: evaluated_geometry(obj) for obj in meshes}
    foot_mins = {foot_name: foot_min_z(foot_name, pose_geometry) for foot_name in FOOT_NAMES}
    for foot_name in declaration["planted"]:
        if abs(foot_mins[foot_name]) > float(QA_THRESHOLDS["footContactToleranceM"]):
            fail(
                f"declared planted foot misses contact: {pose_name}:{foot_name}",
                {"minZ": foot_mins[foot_name], "declaration": declaration},
            )
    for foot_name in declaration["lifted"]:
        if foot_mins[foot_name] < float(QA_THRESHOLDS["liftedFootClearanceM"]):
            fail(
                f"declared lifted foot lacks clearance: {pose_name}:{foot_name}",
                {"minZ": foot_mins[foot_name], "declaration": declaration},
            )
    if set(declaration["planted"]) | set(declaration["lifted"]) != set(FOOT_NAMES):
        fail(f"foot declaration does not cover all feet: {pose_name}", declaration)
    self_intersections = {}
    shape = {}
    for name in DEFORMATION_SURFACES:
        intersections = self_intersection_pairs(pose_geometry[name])
        self_intersections[name] = intersections
        if intersections > int(QA_THRESHOLDS["selfIntersectionMaxPairs"]):
            fail(f"posed self-intersection: {pose_name}:{name}", intersections)
        current = geometry_metrics(pose_geometry[name])
        bind = bind_metrics[name]
        volume_ratio = current["volume"] / max(bind["volume"], 1e-12)
        area_ratio = current["surfaceArea"] / max(bind["surfaceArea"], 1e-12)
        edge_ratios = [
            current_length / max(bind_length, 1e-12)
            for current_length, bind_length in zip(current["edgeLengths"], bind["edgeLengths"])
        ]
        edge_p05 = percentile(edge_ratios, 0.05)
        edge_p95 = percentile(edge_ratios, 0.95)
        shape[name] = {
            "volumeRatioVsBind": volume_ratio,
            "surfaceAreaRatioVsBind": area_ratio,
            "edgeLengthRatioP05VsBind": edge_p05,
            "edgeLengthRatioP95VsBind": edge_p95,
        }
        if not float(QA_THRESHOLDS["volumeRatioMin"]) <= volume_ratio <= float(QA_THRESHOLDS["volumeRatioMax"]):
            fail(f"posed volume preservation: {pose_name}:{name}", shape[name])
        if not float(QA_THRESHOLDS["surfaceAreaRatioMin"]) <= area_ratio <= float(QA_THRESHOLDS["surfaceAreaRatioMax"]):
            fail(f"posed surface-area preservation: {pose_name}:{name}", shape[name])
        if edge_p05 < float(QA_THRESHOLDS["edgeLengthRatioP05Min"]):
            fail(f"posed edge compression: {pose_name}:{name}", shape[name])
        if edge_p95 > float(QA_THRESHOLDS["edgeLengthRatioP95Max"]):
            fail(f"posed edge stretch: {pose_name}:{name}", shape[name])
    forbidden_intersections = {}
    for first, second in FORBIDDEN_INTERSECTION_PAIRS:
        overlap = len(bvh_for(pose_geometry[first]).overlap(bvh_for(pose_geometry[second])))
        forbidden_intersections[f"{first}|{second}"] = overlap
        if overlap > int(QA_THRESHOLDS["forbiddenIntersectionMaxPairs"]):
            fail(f"forbidden posed inter-object intersection: {pose_name}:{first}|{second}", overlap)
    pose_report[pose_name] = {
        "declaredPlantedFeet": declaration["planted"],
        "declaredLiftedFeet": declaration["lifted"],
        "footAssemblyMinZ": foot_mins,
        "globalRigTranslation": list(rig.location),
        "perFootArmatureSpaceZCorrectionsM": declaration["perFootArmatureSpaceZCorrectionsM"],
        "bulbAttachment": bulb_contact_metrics(pose_geometry),
        "selfIntersectionPairs": self_intersections,
        "forbiddenIntersectionPairs": forbidden_intersections,
        "shapePreservation": shape,
    }

reset_pose()

render_names = [
    "bind",
    "extreme-crouch",
    "extreme-reach-L",
    "extreme-reach-R",
    "extreme-bulb-jaw",
    "wireframe-bind-front34",
    "wireframe-bind-side",
]
renders = {}
for name in render_names:
    path = ROOT / "review-renders" / f"{name}.png"
    if not path.is_file() or path.stat().st_size < 1000:
        fail("render missing or empty", str(path))
    renders[name] = {"bytes": path.stat().st_size, "sha256": sha256_path(path)}
comparison = ROOT / "fixed-camera" / "source-vs-retopo-clay.png"
if not comparison.is_file() or comparison.stat().st_size < 1000:
    fail("fixed-camera comparison missing", str(comparison))

result = {
    "schema": "pokemon.bulbasaur.production-qa-final/v2",
    "verdict": "PASS_NON_CANONICAL_AUTHORED_RETOPO_SKIN_DEFORMATION_QA",
    "certification": False,
    "reopenedFrom": str(Path(bpy.data.filepath).resolve()),
    "blenderVersion": bpy.app.version_string,
    "source": {"sha256": source_hash, "unchanged": True},
    "frozenEvidenceAfter": frozen_after,
    "production": {
        "sha256": sha256_path(Path(bpy.data.filepath)),
        "bytes": Path(bpy.data.filepath).stat().st_size,
        "objects": len(meshes),
        "vertices": vertices,
        "triangles": triangles,
        "nonmanifoldEdges": nonmanifold,
        "zeroAreaFaces": zero_area,
        "materials": sorted(material_names),
        "uvComplete": True,
    },
    "topology": topology_report,
    "rig": {
        "armatures": 1,
        "bones": len(rig.data.bones),
        "deformBones": sum(bone.use_deform for bone in rig.data.bones),
        "skinnedMeshes": len(meshes),
        "normalizedWeights": True,
        "maxInfluencesPerVertex": int(QA_THRESHOLDS["maxInfluencesPerVertex"]),
        "savedBindPose": True,
    },
    "deformation": {
        "thresholds": QA_THRESHOLDS,
        "poses": pose_report,
    },
    "semantic": {
        **semantic_counts,
        "semanticFeatureCount": len(meshes),
        "lowConfidenceRearHypothesisExplicit": bool(rig.get("rear_hypothesis")),
    },
    "renders": renders,
    "fixedCameraComparison": {
        "path": "fixed-camera/source-vs-retopo-clay.png",
        "sha256": sha256_path(comparison),
        "layout": "top immutable source C; bottom authored retopo; 12 fixed roles each",
    },
    "scopeGuards": {
        "gameplayAnimation": False,
        "productIntegration": False,
        "publication": False,
        "merge": False,
        "canonicalCertification": False,
        "builderMayCertify": False,
    },
}
QA_OUT.parent.mkdir(parents=True, exist_ok=True)
QA_OUT.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
print(json.dumps({"qa": "PASS", "output": str(QA_OUT), "productionSha256": result["production"]["sha256"]}, sort_keys=True))
