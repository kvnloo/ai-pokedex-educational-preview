#!/usr/bin/env python3
"""Blender 5.2 background renderer for deterministic neutral GLB turntables."""
from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--views", type=int, default=12)
    parser.add_argument("--size", type=int, default=768)
    parser.add_argument("--engine", choices=("BLENDER_EEVEE", "BLENDER_WORKBENCH"), default="BLENDER_EEVEE")
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else [])


def point_at(obj: bpy.types.Object, target: Vector) -> None:
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def main() -> None:
    args = arguments()
    if args.views < 4 or args.size < 64:
        raise ValueError("views must be >= 4 and size must be >= 64")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(args.input.resolve()))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise ValueError("GLB contains no mesh objects")

    clay = bpy.data.materials.new("qa-neutral-blue-clay")
    clay.diffuse_color = (0.18, 0.36, 0.58, 1.0)
    clay.roughness = 0.72
    clay.metallic = 0.0
    for obj in meshes:
        obj.data.materials.clear()
        obj.data.materials.append(clay)

    corners = []
    for obj in meshes:
        for corner in obj.bound_box:
            corners.append(obj.matrix_world @ Vector(corner))
    minimum = Vector((min(v.x for v in corners), min(v.y for v in corners), min(v.z for v in corners)))
    maximum = Vector((max(v.x for v in corners), max(v.y for v in corners), max(v.z for v in corners)))
    center = (minimum + maximum) * 0.5
    size = maximum - minimum
    radius = max(size) * 1.85

    scene = bpy.context.scene
    scene.render.engine = args.engine
    scene.render.resolution_x = args.size
    scene.render.resolution_y = args.size
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.look = "AgX - Medium High Contrast"
    world = bpy.data.worlds.new("qa-world")
    world.color = (0.012, 0.016, 0.024)
    scene.world = world

    camera_data = bpy.data.cameras.new("qa-camera")
    camera = bpy.data.objects.new("qa-camera", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera.data.lens = 55

    for name, energy, location, color, scale in (
        ("key", 950.0, (1.5, 2.0, 2.4), (1.0, 0.91, 0.82), 4.0),
        ("fill", 550.0, (-2.0, 0.7, 1.3), (0.55, 0.72, 1.0), 3.0),
        ("rim", 800.0, (0.2, -2.2, 2.0), (0.58, 0.78, 1.0), 3.0),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.color = color
        data.shape = "DISK"
        data.size = max(size) * scale
        light = bpy.data.objects.new(name, data)
        scene.collection.objects.link(light)
        light.location = center + Vector(location) * max(size)
        point_at(light, center)

    elevation = center.z + max(size.z * 0.08, max(size) * 0.03)
    for index in range(args.views):
        angle = math.tau * index / args.views
        camera.location = (center.x + math.sin(angle) * radius, center.y - math.cos(angle) * radius, elevation)
        point_at(camera, center)
        scene.render.filepath = str((args.out_dir / f"view-{index:02d}.png").resolve())
        bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
