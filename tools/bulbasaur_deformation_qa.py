#!/usr/bin/env python3
"""Reusable all-frame evaluated deformation QA for Bulbasaur C."""
from __future__ import annotations

import math
from statistics import mean
from typing import Any, Iterable, Mapping

from mathutils import Vector
from mathutils.bvhtree import BVHTree

DEFORMATION_SURFACES = (
    "torso",
    "chest",
    "head",
    "muzzle",
    "bulb_core",
    "bulb_attachment",
    *(f"bulb_lobe_{index}" for index in range(1, 7)),
    *(f"limb_{region}_{side}" for region in ("front", "rear") for side in ("L", "R")),
    *(f"foot_{region}_{side}" for region in ("front", "rear") for side in ("L", "R")),
)
FORBIDDEN_INTERSECTION_PAIRS = (
    ("limb_front_L", "limb_front_R"),
    ("limb_rear_L", "limb_rear_R"),
    ("foot_front_L", "foot_front_R"),
    ("foot_rear_L", "foot_rear_R"),
    ("foot_front_L", "foot_rear_L"),
    ("foot_front_R", "foot_rear_R"),
    ("head", "bulb_core"),
    ("muzzle", "bulb_attachment"),
)
BULB_CONTACT_GROUPS = (
    "TOPO_bulb_torso_contact_outer",
    "TOPO_bulb_torso_contact_center",
    "TOPO_bulb_torso_contact_inner",
)
THRESHOLDS = {
    "selfIntersectionMaxPairs": 0,
    "forbiddenIntersectionMaxPairs": 0,
    "volumeRatioMin": 0.68,
    "volumeRatioMax": 1.32,
    "surfaceAreaRatioMin": 0.72,
    "surfaceAreaRatioMax": 1.36,
    "edgeLengthRatioP05Min": 0.62,
    "edgeLengthRatioP95Max": 1.48,
    "bulbContactMaxPositiveSeparationM": 0.025,
    "bulbContactMaxP95AbsoluteDistanceM": 0.13,
    "bulbContactMaxPenetrationM": 0.14,
    "bulbContactMinInsideFraction": 0.50,
    "maxInfluencesPerVertex": 4,
    "influenceNormalizationTolerance": 1e-4,
    "jawRotationRangeMinRad": math.radians(20.0),
    "eyeScaleRangeMin": 0.50,
    "earRotationRangeMinRad": math.radians(14.0),
    "toeRotationRangeMinRad": math.radians(11.0),
    "vineRotationRangeMinRad": math.radians(26.0),
}


def percentile(values: list[float], fraction: float) -> float:
    ordered = sorted(values)
    if not ordered:
        raise ValueError("cannot percentile empty values")
    position = fraction * (len(ordered) - 1)
    lower = int(math.floor(position))
    upper = int(math.ceil(position))
    if lower == upper:
        return ordered[lower]
    amount = position - lower
    return ordered[lower] * (1.0 - amount) + ordered[upper] * amount


def evaluated_geometry(obj: Any, depsgraph: Any) -> dict[str, Any]:
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    points = [evaluated.matrix_world @ vertex.co for vertex in mesh.vertices]
    triangles = [tuple(triangle.vertices) for triangle in mesh.loop_triangles]
    edges = [tuple(edge.vertices) for edge in mesh.edges]
    evaluated.to_mesh_clear()
    return {"points": points, "triangles": triangles, "edges": edges}


def geometry_metrics(geometry: Mapping[str, Any]) -> dict[str, Any]:
    points = geometry["points"]
    signed_volume = 0.0
    surface_area = 0.0
    for first_index, second_index, third_index in geometry["triangles"]:
        first, second, third = points[first_index], points[second_index], points[third_index]
        signed_volume += first.dot(second.cross(third)) / 6.0
        surface_area += (second - first).cross(third - first).length * 0.5
    edge_lengths = [(points[second] - points[first]).length for first, second in geometry["edges"]]
    return {
        "volume": abs(signed_volume),
        "surfaceArea": surface_area,
        "edgeLengths": edge_lengths,
    }


def bvh_for(geometry: Mapping[str, Any]) -> BVHTree:
    tree = BVHTree.FromPolygons(geometry["points"], geometry["triangles"], all_triangles=True)
    if tree is None:
        raise RuntimeError("could not build evaluated BVH")
    return tree


def self_intersection_pairs(geometry: Mapping[str, Any]) -> int:
    tree = bvh_for(geometry)
    triangles = geometry["triangles"]
    count = 0
    for first, second in tree.overlap(tree):
        if first >= second:
            continue
        if set(triangles[first]).isdisjoint(triangles[second]):
            count += 1
    return count


def group_indices(obj: Any, group_name: str) -> list[int]:
    group = obj.vertex_groups.get(group_name)
    if group is None:
        raise RuntimeError(f"missing vertex group {obj.name}:{group_name}")
    return [
        vertex.index
        for vertex in obj.data.vertices
        if any(item.group == group.index and item.weight > 0.5 for item in vertex.groups)
    ]


def bulb_contact_metrics(bpy_module: Any, geometry: Mapping[str, Mapping[str, Any]]) -> dict[str, Any]:
    attachment = bpy_module.data.objects["bulb_attachment"]
    attachment_points = geometry["bulb_attachment"]["points"]
    torso_tree = bvh_for(geometry["torso"])
    signed_values: list[float] = []
    absolute_values: list[float] = []
    groups: dict[str, Any] = {}
    for group_name in BULB_CONTACT_GROUPS:
        group_signed = []
        for index in group_indices(attachment, group_name):
            point = attachment_points[index]
            nearest = torso_tree.find_nearest(point)
            if nearest is None:
                raise RuntimeError("torso nearest point unavailable")
            location, normal, _triangle, distance = nearest
            signed = (point - location).dot(normal)
            group_signed.append(float(signed))
            signed_values.append(float(signed))
            absolute_values.append(float(distance))
        groups[group_name] = {
            "verticesEvaluated": len(group_signed),
            "maxPositiveSeparationM": max(group_signed),
            "meanSignedDistanceM": mean(group_signed),
        }
    return {
        "groups": groups,
        "verticesEvaluated": len(signed_values),
        "maxPositiveSeparationM": max(signed_values),
        "maxPenetrationM": max(0.0, -min(signed_values)),
        "p95AbsoluteDistanceM": percentile(absolute_values, 0.95),
        "insideFraction": sum(value <= 0.0 for value in signed_values) / len(signed_values),
    }


def influence_scan(objects: Iterable[Any], deform_bones: set[str]) -> dict[str, Any]:
    unweighted = 0
    excessive = 0
    denormalized = 0
    max_influences = 0
    vertices = 0
    for obj in objects:
        deform_groups = {group.index for group in obj.vertex_groups if group.name in deform_bones}
        for vertex in obj.data.vertices:
            vertices += 1
            weights = [item.weight for item in vertex.groups if item.group in deform_groups and item.weight > 1e-8]
            max_influences = max(max_influences, len(weights))
            if not weights:
                unweighted += 1
            if len(weights) > int(THRESHOLDS["maxInfluencesPerVertex"]):
                excessive += 1
            if weights and abs(sum(weights) - 1.0) > float(THRESHOLDS["influenceNormalizationTolerance"]):
                denormalized += 1
    return {
        "vertices": vertices,
        "unweightedVertices": unweighted,
        "excessiveInfluenceVertices": excessive,
        "denormalizedVertices": denormalized,
        "maxInfluences": max_influences,
    }


def action_curves(action: Any) -> list[Any]:
    return [
        curve
        for layer in action.layers
        for strip in layer.strips
        for bag in strip.channelbags
        for curve in bag.fcurves
    ]


def rotation_activity(rig: Any, names: Iterable[str]) -> float:
    return max(
        sum(abs(float(value)) for value in rig.pose.bones[name].rotation_euler)
        for name in names
    )


def articulation_sample(rig: Any) -> dict[str, float]:
    toe_names = [bone.name for bone in rig.pose.bones if bone.name.startswith("toe.")]
    vine_names = [bone.name for bone in rig.pose.bones if bone.name.startswith("vine.")]
    return {
        "jaw": rotation_activity(rig, ("jaw",)),
        "eyes": min(float(rig.pose.bones["eye.L"].scale.z), float(rig.pose.bones["eye.R"].scale.z)),
        "ears": rotation_activity(rig, ("ear.L", "ear.R")),
        "toes": rotation_activity(rig, toe_names),
        "vines": rotation_activity(rig, vine_names),
    }


def empty_extrema() -> dict[str, float]:
    return {"min": float("inf"), "max": float("-inf")}


def update_extrema(extrema: dict[str, float], value: float) -> None:
    extrema["min"] = min(extrema["min"], value)
    extrema["max"] = max(extrema["max"], value)


def shape_ratio(current: Mapping[str, Any], bind: Mapping[str, Any]) -> dict[str, float]:
    edge_ratios = [
        current_length / max(bind_length, 1e-12)
        for current_length, bind_length in zip(current["edgeLengths"], bind["edgeLengths"])
    ]
    return {
        "volumeRatio": current["volume"] / max(bind["volume"], 1e-12),
        "surfaceAreaRatio": current["surfaceArea"] / max(bind["surfaceArea"], 1e-12),
        "edgeLengthRatioP05": percentile(edge_ratios, 0.05),
        "edgeLengthRatioP95": percentile(edge_ratios, 0.95),
    }


def _mutation_negatives(
    bpy_module: Any,
    rig: Any,
    bind_metrics: Mapping[str, Mapping[str, Any]],
    deform_bones: set[str],
    skinned_objects: list[Any],
) -> dict[str, Any]:
    scene = bpy_module.context.scene
    depsgraph = bpy_module.context.evaluated_depsgraph_get()
    results: dict[str, Any] = {}

    # Influence negative: write five real deform groups onto one live vertex,
    # execute the same scanner, then restore every original membership.
    torso = bpy_module.data.objects["torso"]
    vertex_index = 0
    vertex = torso.data.vertices[vertex_index]
    original = {
        torso.vertex_groups[item.group].name: float(item.weight)
        for item in vertex.groups
    }
    original_group_names = {group.name for group in torso.vertex_groups}
    for group in list(torso.vertex_groups):
        group.remove([vertex_index])
    selected = sorted(deform_bones)[:5]
    for bone_name in selected:
        group = torso.vertex_groups.get(bone_name) or torso.vertex_groups.new(name=bone_name)
        group.add([vertex_index], 0.2, "REPLACE")
    mutated_influences = influence_scan([torso], deform_bones)
    influence_detected = mutated_influences["excessiveInfluenceVertices"] > 0
    for group in list(torso.vertex_groups):
        group.remove([vertex_index])
    for name, weight in original.items():
        group = torso.vertex_groups.get(name) or torso.vertex_groups.new(name=name)
        group.add([vertex_index], weight, "REPLACE")
    for group in list(torso.vertex_groups):
        if group.name not in original_group_names:
            torso.vertex_groups.remove(group)
    results["fiveInfluences"] = {
        "realStateMutated": True,
        "detected": influence_detected,
        "restored": influence_scan([torso], deform_bones)["excessiveInfluenceVertices"] == 0,
    }

    # Shape negative: scale actual torso source vertices, evaluate the real
    # armature/modifier result, and require the production volume gate to fail.
    original_coordinates = [vertex.co.copy() for vertex in torso.data.vertices]
    for source_vertex in torso.data.vertices:
        source_vertex.co *= 2.0
    torso.data.update()
    bpy_module.context.view_layer.update()
    mutated_shape = shape_ratio(
        geometry_metrics(evaluated_geometry(torso, depsgraph)),
        bind_metrics["torso"],
    )
    shape_detected = not (
        float(THRESHOLDS["volumeRatioMin"]) <= mutated_shape["volumeRatio"] <= float(THRESHOLDS["volumeRatioMax"])
        and float(THRESHOLDS["surfaceAreaRatioMin"]) <= mutated_shape["surfaceAreaRatio"] <= float(THRESHOLDS["surfaceAreaRatioMax"])
    )
    for source_vertex, coordinate in zip(torso.data.vertices, original_coordinates):
        source_vertex.co = coordinate
    torso.data.update()
    bpy_module.context.view_layer.update()
    results["meshShape"] = {
        "realStateMutated": True,
        "detected": shape_detected,
        "restored": abs(shape_ratio(geometry_metrics(evaluated_geometry(torso, depsgraph)), bind_metrics["torso"])["volumeRatio"] - 1.0) < 1e-5,
    }

    # Forbidden-pair negative: translate the actual left front foot mesh onto
    # its right counterpart and run the same evaluated BVH overlap gate.
    left = bpy_module.data.objects["foot_front_L"]
    right = bpy_module.data.objects["foot_front_R"]
    original_location = left.location.copy()
    left_geometry = evaluated_geometry(left, depsgraph)
    right_geometry = evaluated_geometry(right, depsgraph)
    left_center = sum(left_geometry["points"], Vector()) / len(left_geometry["points"])
    right_center = sum(right_geometry["points"], Vector()) / len(right_geometry["points"])
    left.location += right_center - left_center
    bpy_module.context.view_layer.update()
    overlap = len(bvh_for(evaluated_geometry(left, depsgraph)).overlap(bvh_for(evaluated_geometry(right, depsgraph))))
    left.location = original_location
    bpy_module.context.view_layer.update()
    results["forbiddenIntersection"] = {
        "realStateMutated": True,
        "detected": overlap > 0,
        "restored": len(bvh_for(evaluated_geometry(left, depsgraph)).overlap(bvh_for(evaluated_geometry(right, depsgraph)))) == 0,
    }

    # Bulb negative: separate the actual saddle object from the torso.
    attachment = bpy_module.data.objects["bulb_attachment"]
    attachment_location = attachment.location.copy()
    attachment.location.z += 0.5
    bpy_module.context.view_layer.update()
    separated_geometry = {
        "torso": evaluated_geometry(torso, depsgraph),
        "bulb_attachment": evaluated_geometry(attachment, depsgraph),
    }
    separated = bulb_contact_metrics(bpy_module, separated_geometry)
    bulb_detected = separated["maxPositiveSeparationM"] > float(THRESHOLDS["bulbContactMaxPositiveSeparationM"])
    attachment.location = attachment_location
    bpy_module.context.view_layer.update()
    results["bulbSeparation"] = {
        "realStateMutated": True,
        "detected": bulb_detected,
        "restored": bulb_contact_metrics(
            bpy_module,
            {
                "torso": evaluated_geometry(torso, depsgraph),
                "bulb_attachment": evaluated_geometry(attachment, depsgraph),
            },
        )["maxPositiveSeparationM"] <= float(THRESHOLDS["bulbContactMaxPositiveSeparationM"]),
    }

    # Articulation negative: zero the real Growl jaw FCurve, evaluate every
    # action frame, require the jaw gate to fail, then restore key values.
    growl = bpy_module.data.actions["BulbasaurC.growl"]
    jaw_curves = [
        curve
        for curve in action_curves(growl)
        if curve.data_path == 'pose.bones["jaw"].rotation_euler'
    ]
    original_values = [[float(point.co[1]) for point in curve.keyframe_points] for curve in jaw_curves]
    for curve in jaw_curves:
        for point in curve.keyframe_points:
            point.co[1] = 0.0
        curve.update()
    rig.animation_data.action = growl
    jaw_values = []
    for frame in range(1, 73):
        scene.frame_set(frame)
        bpy_module.context.view_layer.update()
        jaw_values.append(rotation_activity(rig, ("jaw",)))
    articulation_detected = max(jaw_values) - min(jaw_values) < float(THRESHOLDS["jawRotationRangeMinRad"])
    for curve, values in zip(jaw_curves, original_values):
        for point, value in zip(curve.keyframe_points, values):
            point.co[1] = value
        curve.update()
    bpy_module.context.view_layer.update()
    restored_values = []
    for frame in range(1, 73):
        scene.frame_set(frame)
        bpy_module.context.view_layer.update()
        restored_values.append(rotation_activity(rig, ("jaw",)))
    results["articulation"] = {
        "realStateMutated": True,
        "detected": articulation_detected,
        "restored": max(restored_values) - min(restored_values) >= float(THRESHOLDS["jawRotationRangeMinRad"]),
    }
    return results


def run_deformation_qa(
    *,
    bpy_module: Any,
    rig: Any,
    marker_contract: Mapping[str, Any],
    run_mutation_negatives: bool,
) -> dict[str, Any]:
    scene = bpy_module.context.scene
    missing = [name for name in DEFORMATION_SURFACES if name not in bpy_module.data.objects]
    if missing:
        raise RuntimeError(f"missing deformation surfaces: {missing}")
    surfaces = {name: bpy_module.data.objects[name] for name in DEFORMATION_SURFACES}
    deform_bones = {bone.name for bone in rig.data.bones if bone.use_deform}
    skinned_objects = sorted(
        (
            obj
            for obj in bpy_module.data.objects
            if obj.type == "MESH"
            and obj.parent == rig
            and any(modifier.type == "ARMATURE" and modifier.object == rig for modifier in obj.modifiers)
        ),
        key=lambda obj: obj.name,
    )

    bind_entry = next(entry for entry in marker_contract["clips"] if entry["clip"] == "bind")
    rig.animation_data.action = bpy_module.data.actions[bind_entry["action"]]
    scene.frame_set(bind_entry["startFrame"])
    bpy_module.context.view_layer.update()
    depsgraph = bpy_module.context.evaluated_depsgraph_get()
    bind_geometry = {name: evaluated_geometry(obj, depsgraph) for name, obj in surfaces.items()}
    bind_metrics = {name: geometry_metrics(geometry) for name, geometry in bind_geometry.items()}

    self_max = {name: {"pairs": 0, "clip": None, "frame": None} for name in DEFORMATION_SURFACES}
    forbidden_max = {f"{first}|{second}": {"pairs": 0, "clip": None, "frame": None} for first, second in FORBIDDEN_INTERSECTION_PAIRS}
    shape_extrema = {
        name: {metric: empty_extrema() for metric in ("volumeRatio", "surfaceAreaRatio", "edgeLengthRatioP05", "edgeLengthRatioP95")}
        for name in DEFORMATION_SURFACES
    }
    bulb_extrema = {metric: empty_extrema() for metric in ("maxPositiveSeparationM", "maxPenetrationM", "p95AbsoluteDistanceM", "insideFraction")}
    articulation = {channel: empty_extrema() for channel in ("jaw", "eyes", "ears", "toes", "vines")}
    influence_extrema = {
        "maxInfluences": 0,
        "unweightedVerticesMax": 0,
        "excessiveInfluenceVerticesMax": 0,
        "denormalizedVerticesMax": 0,
        "verticesPerFrame": 0,
    }
    per_clip: dict[str, Any] = {}
    evaluated_frames = 0

    for entry in marker_contract["clips"]:
        clip = entry["clip"]
        rig.animation_data.action = bpy_module.data.actions[entry["action"]]
        clip_shape = {
            name: {metric: empty_extrema() for metric in ("volumeRatio", "surfaceAreaRatio", "edgeLengthRatioP05", "edgeLengthRatioP95")}
            for name in DEFORMATION_SURFACES
        }
        clip_self_max = {name: 0 for name in DEFORMATION_SURFACES}
        clip_forbidden_max = {f"{first}|{second}": 0 for first, second in FORBIDDEN_INTERSECTION_PAIRS}
        clip_bulb = {metric: empty_extrema() for metric in bulb_extrema}
        clip_influences = {"maxInfluences": 0, "unweightedVerticesMax": 0, "excessiveInfluenceVerticesMax": 0, "denormalizedVerticesMax": 0}
        for frame in range(entry["startFrame"], entry["endFrame"] + 1):
            scene.frame_set(frame)
            bpy_module.context.view_layer.update()
            depsgraph = bpy_module.context.evaluated_depsgraph_get()
            geometry = {name: evaluated_geometry(obj, depsgraph) for name, obj in surfaces.items()}
            metrics = {name: geometry_metrics(value) for name, value in geometry.items()}
            for name in DEFORMATION_SURFACES:
                intersections = self_intersection_pairs(geometry[name])
                clip_self_max[name] = max(clip_self_max[name], intersections)
                if intersections > self_max[name]["pairs"]:
                    self_max[name] = {"pairs": intersections, "clip": clip, "frame": frame}
                ratio = shape_ratio(metrics[name], bind_metrics[name])
                for metric, value in ratio.items():
                    update_extrema(shape_extrema[name][metric], value)
                    update_extrema(clip_shape[name][metric], value)
            for first, second in FORBIDDEN_INTERSECTION_PAIRS:
                key = f"{first}|{second}"
                overlap = len(bvh_for(geometry[first]).overlap(bvh_for(geometry[second])))
                clip_forbidden_max[key] = max(clip_forbidden_max[key], overlap)
                if overlap > forbidden_max[key]["pairs"]:
                    forbidden_max[key] = {"pairs": overlap, "clip": clip, "frame": frame}
            bulb = bulb_contact_metrics(bpy_module, geometry)
            for metric in bulb_extrema:
                update_extrema(bulb_extrema[metric], float(bulb[metric]))
                update_extrema(clip_bulb[metric], float(bulb[metric]))
            influences = influence_scan(skinned_objects, deform_bones)
            influence_extrema["verticesPerFrame"] = influences["vertices"]
            for metric in ("maxInfluences", "unweightedVertices", "excessiveInfluenceVertices", "denormalizedVertices"):
                target = metric if metric == "maxInfluences" else f"{metric}Max"
                influence_extrema[target] = max(influence_extrema[target], influences[metric])
                clip_influences[target] = max(clip_influences[target], influences[metric])
            sample = articulation_sample(rig)
            for channel, value in sample.items():
                update_extrema(articulation[channel], value)
            evaluated_frames += 1
        per_clip[clip] = {
            "frameCount": entry["endFrame"] - entry["startFrame"] + 1,
            "selfIntersectionMaxPairs": clip_self_max,
            "forbiddenIntersectionMaxPairs": clip_forbidden_max,
            "shapePreservation": clip_shape,
            "bulbAttachment": clip_bulb,
            "influences": clip_influences,
        }

    failures: list[dict[str, Any]] = []
    for name, record in self_max.items():
        if record["pairs"] > int(THRESHOLDS["selfIntersectionMaxPairs"]):
            failures.append({"gate": "selfIntersection", "surface": name, **record})
    for pair, record in forbidden_max.items():
        if record["pairs"] > int(THRESHOLDS["forbiddenIntersectionMaxPairs"]):
            failures.append({"gate": "forbiddenIntersection", "pair": pair, **record})
    for name, extrema in shape_extrema.items():
        if extrema["volumeRatio"]["min"] < float(THRESHOLDS["volumeRatioMin"]) or extrema["volumeRatio"]["max"] > float(THRESHOLDS["volumeRatioMax"]):
            failures.append({"gate": "volumePreservation", "surface": name, "detail": extrema["volumeRatio"]})
        if extrema["surfaceAreaRatio"]["min"] < float(THRESHOLDS["surfaceAreaRatioMin"]) or extrema["surfaceAreaRatio"]["max"] > float(THRESHOLDS["surfaceAreaRatioMax"]):
            failures.append({"gate": "surfaceAreaPreservation", "surface": name, "detail": extrema["surfaceAreaRatio"]})
        if extrema["edgeLengthRatioP05"]["min"] < float(THRESHOLDS["edgeLengthRatioP05Min"]):
            failures.append({"gate": "edgeCompression", "surface": name, "detail": extrema["edgeLengthRatioP05"]})
        if extrema["edgeLengthRatioP95"]["max"] > float(THRESHOLDS["edgeLengthRatioP95Max"]):
            failures.append({"gate": "edgeStretch", "surface": name, "detail": extrema["edgeLengthRatioP95"]})
    if bulb_extrema["maxPositiveSeparationM"]["max"] > float(THRESHOLDS["bulbContactMaxPositiveSeparationM"]):
        failures.append({"gate": "bulbSeparation", "detail": bulb_extrema["maxPositiveSeparationM"]})
    if bulb_extrema["p95AbsoluteDistanceM"]["max"] > float(THRESHOLDS["bulbContactMaxP95AbsoluteDistanceM"]):
        failures.append({"gate": "bulbDistance", "detail": bulb_extrema["p95AbsoluteDistanceM"]})
    if bulb_extrema["maxPenetrationM"]["max"] > float(THRESHOLDS["bulbContactMaxPenetrationM"]):
        failures.append({"gate": "bulbPenetration", "detail": bulb_extrema["maxPenetrationM"]})
    if bulb_extrema["insideFraction"]["min"] < float(THRESHOLDS["bulbContactMinInsideFraction"]):
        failures.append({"gate": "bulbInsideCoverage", "detail": bulb_extrema["insideFraction"]})
    if influence_extrema["maxInfluences"] > int(THRESHOLDS["maxInfluencesPerVertex"]):
        failures.append({"gate": "maxInfluences", "detail": influence_extrema})
    if influence_extrema["unweightedVerticesMax"] or influence_extrema["excessiveInfluenceVerticesMax"] or influence_extrema["denormalizedVerticesMax"]:
        failures.append({"gate": "perFrameInfluences", "detail": influence_extrema})

    articulation_ranges = {channel: values["max"] - values["min"] for channel, values in articulation.items()}
    articulation_gates = {
        "jaw": "jawRotationRangeMinRad",
        "eyes": "eyeScaleRangeMin",
        "ears": "earRotationRangeMinRad",
        "toes": "toeRotationRangeMinRad",
        "vines": "vineRotationRangeMinRad",
    }
    for channel, threshold_name in articulation_gates.items():
        if articulation_ranges[channel] < float(THRESHOLDS[threshold_name]):
            failures.append({"gate": "articulation", "channel": channel, "range": articulation_ranges[channel], "minimum": THRESHOLDS[threshold_name]})

    mutation_negatives: dict[str, Any] = {}
    if run_mutation_negatives:
        rig.animation_data.action = bpy_module.data.actions[bind_entry["action"]]
        scene.frame_set(bind_entry["startFrame"])
        bpy_module.context.view_layer.update()
        mutation_negatives = _mutation_negatives(
            bpy_module,
            rig,
            bind_metrics,
            deform_bones,
            skinned_objects,
        )
        for name, result in mutation_negatives.items():
            if not result["realStateMutated"] or not result["detected"] or not result["restored"]:
                failures.append({"gate": "mutationNegative", "name": name, "detail": result})

    return {
        "schemaVersion": 1,
        "status": "PASS" if not failures else "FAIL",
        "thresholds": THRESHOLDS,
        "evaluatedFrames": evaluated_frames,
        "evaluatedSurfaceFrames": evaluated_frames * len(DEFORMATION_SURFACES),
        "influenceFrameScans": evaluated_frames,
        "skinnedMeshCount": len(skinned_objects),
        "deformationSurfaceCount": len(DEFORMATION_SURFACES),
        "failures": failures,
        "selfIntersectionMax": self_max,
        "forbiddenIntersectionMax": forbidden_max,
        "shapePreservation": shape_extrema,
        "bulbAttachment": bulb_extrema,
        "influences": influence_extrema,
        "articulation": {"extrema": articulation, "ranges": articulation_ranges},
        "mutationNegatives": mutation_negatives,
        "perClip": per_clip,
    }
