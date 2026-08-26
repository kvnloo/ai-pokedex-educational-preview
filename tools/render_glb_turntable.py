#!/usr/bin/env python3
"""Blender 5.2 renderer for the frozen Kanto-starter camera contract."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


ROLE_ANGLES = (
    ("front", 0.0),
    ("front-front-right", 22.5),
    ("front-right", 45.0),
    ("right", 90.0),
    ("rear-rear-right", 112.5),
    ("rear-right", 135.0),
    ("rear", 180.0),
    ("rear-rear-left", 202.5),
    ("rear-left", 225.0),
    ("left", 270.0),
    ("front-front-left", 292.5),
    ("front-left", 315.0),
)
CANONICAL_ROLES = {"front", "front-right", "right", "rear-right", "rear", "rear-left", "left", "front-left"}
TARGET_OCCUPANCY = 0.82
OCCUPANCY_TOLERANCE = 0.01


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--size", type=int, default=768)
    parser.add_argument("--engine", choices=("BLENDER_EEVEE", "BLENDER_WORKBENCH"), default="BLENDER_EEVEE")
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else [])


def point_at(obj: bpy.types.Object, target: Vector) -> None:
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def alpha_occupancy(path: Path) -> tuple[float, list[int]]:
    image = bpy.data.images.load(str(path), check_existing=False)
    try:
        width, height = image.size
        pixels = image.pixels[:]
        occupied = [index // width for index in range(width * height) if pixels[index * 4 + 3] > 0.01]
        if not occupied:
            raise RuntimeError(f"render has no visible subject pixels: {path}")
        low, high = min(occupied), max(occupied)
        return (high - low + 1) / height, [low, high]
    finally:
        bpy.data.images.remove(image)


def matrix_values(matrix: object) -> list[list[float]]:
    return [[round(float(value), 9) for value in row] for row in matrix]


def main() -> None:
    args = arguments()
    if args.size < 64:
        raise ValueError("size must be >= 64")
    input_path = args.input.resolve()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(input_path))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise ValueError("GLB contains no mesh objects")

    clay = bpy.data.materials.new("qa-neutral-blue-clay")
    clay.diffuse_color = (0.18, 0.36, 0.58, 1.0)
    clay.roughness = 0.72
    for obj in meshes:
        obj.data.materials.clear()
        obj.data.materials.append(clay)

    corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = Vector(tuple(min(v[i] for v in corners) for i in range(3)))
    maximum = Vector(tuple(max(v[i] for v in corners) for i in range(3)))
    extent = maximum - minimum
    # glTF Y-up/+Z-forward imports into Blender as Z-up/-Y-forward-camera position.
    target = Vector(((minimum.x + maximum.x) / 2, (minimum.y + maximum.y) / 2, minimum.z + extent.z * 0.52))
    initial_radius = max(extent) * 1.85

    scene = bpy.context.scene
    supported_engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
    if args.engine not in supported_engines:
        raise RuntimeError(f"engine {args.engine} unsupported by Blender {bpy.app.version_string}; supported={sorted(supported_engines)}")
    scene.render.engine = args.engine
    scene.render.resolution_x = scene.render.resolution_y = args.size
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.world = bpy.data.worlds.new("qa-world")
    scene.world.color = (0.012, 0.016, 0.024)

    camera_data = bpy.data.cameras.new("qa-camera")
    camera_data.lens = 55.0
    camera = bpy.data.objects.new("qa-camera", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera

    for name, energy, location, color, scale in (
        ("key", 950.0, (1.5, -2.4, 2.0), (1.0, 0.91, 0.82), 4.0),
        ("fill", 550.0, (-2.0, -1.3, 0.7), (0.55, 0.72, 1.0), 3.0),
        ("rim", 800.0, (0.2, 2.0, 2.2), (0.58, 0.78, 1.0), 3.0),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy, data.color, data.shape, data.size = energy, color, "DISK", max(extent) * scale
        light = bpy.data.objects.new(name, data)
        scene.collection.objects.link(light)
        light.location = target + Vector(location) * max(extent)
        point_at(light, target)

    views = []
    for index, (role, yaw) in enumerate(ROLE_ANGLES):
        angle = math.radians(yaw)
        radius = initial_radius
        output = (args.out_dir / f"view-{index:02d}-{role}.png").resolve()
        occupancy = 0.0
        pixel_rows = [0, 0]
        for attempt in range(8):
            # yaw=0 is the authored +Z front camera, converted to Blender -Y.
            camera.location = (target.x + math.sin(angle) * radius, target.y - math.cos(angle) * radius, target.z)
            point_at(camera, target)
            scene.render.filepath = str(output)
            bpy.ops.render.render(write_still=True)
            occupancy, pixel_rows = alpha_occupancy(output)
            if abs(occupancy - TARGET_OCCUPANCY) <= OCCUPANCY_TOLERANCE:
                break
            radius *= occupancy / TARGET_OCCUPANCY
        if abs(occupancy - TARGET_OCCUPANCY) > OCCUPANCY_TOLERANCE:
            raise RuntimeError(f"{role} occupancy {occupancy:.6f} outside {TARGET_OCCUPANCY:.2f}+/-{OCCUPANCY_TOLERANCE:.2f}")
        views.append({
            "index": index, "role": role, "canonicalRole": role in CANONICAL_ROLES, "authoredYawDegrees": yaw,
            "output": output.name, "outputSha256": sha256(output), "occupancyHeight": round(occupancy, 9),
            "occupiedPixelRowsBottomOrigin": pixel_rows, "cameraLocationBlender": [round(v, 9) for v in camera.location],
            "cameraMatrixWorld": matrix_values(camera.matrix_world), "worldToCamera": matrix_values(camera.matrix_world.inverted()),
            "cropTransform": {"kind": "camera-distance", "radiusBlenderMeters": round(radius, 9), "scale": 1.0, "offsetPx": [0, 0]},
        })

    manifest = {
        "schema": "kanto-starter-camera-evidence/v1", "input": str(input_path), "inputSha256": sha256(input_path),
        "commandArguments": [str(value) for value in sys.argv],
        "rendererScript": str(Path(__file__).resolve()), "rendererScriptSha256": sha256(Path(__file__).resolve()),
        "blenderVersion": bpy.app.version_string, "blenderBuildHash": bpy.app.build_hash.decode(), "engine": args.engine,
        "coordinateContract": {"authored": "right-handed Y-up +Z-forward", "blenderImported": "right-handed Z-up; authored +Z maps to Blender -Y"},
        "camera": {"projection": "perspective", "lensMm": 55.0, "sensorWidthMm": camera_data.sensor_width,
                   "resolutionPx": [args.size, args.size], "aimHeightFraction": 0.52, "elevationHeightFraction": 0.52,
                   "targetOccupancyHeight": TARGET_OCCUPANCY, "occupancyTolerance": OCCUPANCY_TOLERANCE},
        "boundsBlender": {"minimum": list(minimum), "maximum": list(maximum)}, "views": views,
    }
    manifest_path = args.out_dir / "camera-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()