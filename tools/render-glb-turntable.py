#!/usr/bin/env python3
# pyright: reportMissingImports=false
"""Render a deterministic studio turntable for a GLB with Blender.

Invoke through Blender, for example:
  blender -b --python tools/render-glb-turntable.py -- --input model.glb --out-dir renders/model
"""
from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def parse_args() -> argparse.Namespace:
    arguments = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--views", type=int, default=8)
    parser.add_argument("--size", type=int, default=512)
    parser.add_argument("--preserve-materials", action="store_true")
    return parser.parse_args(arguments)


def look_at(camera: bpy.types.Object, target: Vector) -> None:
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()


def add_area(name: str, location: tuple[float, float, float], energy: float, size: float, color: tuple[float, float, float]) -> None:
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    data.color = color
    light = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(light)
    light.location = location
    look_at(light, Vector((0.0, 0.0, 1.0)))


def mesh_bounds(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    points = [obj.matrix_world @ Vector(corner) for obj in objects for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return minimum, maximum


def main() -> int:
    args = parse_args()
    if not args.input.is_file():
        raise SystemExit(f"input not found: {args.input}")
    args.out_dir.mkdir(parents=True, exist_ok=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(args.input.resolve()))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise SystemExit("GLB contains no mesh objects")

    minimum, maximum = mesh_bounds(meshes)
    extent = maximum - minimum
    longest = max(extent.x, extent.y, extent.z, 1e-9)
    scale = 2.6 / longest
    roots = [obj for obj in bpy.context.scene.objects if obj.parent is None]
    center = (minimum + maximum) * 0.5
    for root in roots:
        root.location = (root.location - center) * scale
        root.scale *= scale
    minimum, maximum = mesh_bounds(meshes)
    for root in roots:
        root.location.z -= minimum.z
    minimum, maximum = mesh_bounds(meshes)

    fallback = bpy.data.materials.new("StudioClay")
    fallback.diffuse_color = (0.22, 0.39, 0.67, 1.0)
    fallback.metallic = 0.0
    fallback.roughness = 0.66
    fallback.use_nodes = True
    principled = fallback.node_tree.nodes.get("Principled BSDF")
    if principled is not None:
        principled.inputs["Base Color"].default_value = (0.08, 0.25, 0.58, 1.0)
        principled.inputs["Roughness"].default_value = 0.62
    for mesh in meshes:
        if not args.preserve_materials:
            mesh.data.materials.clear()
            mesh.data.materials.append(fallback)
        elif not mesh.data.materials:
            mesh.data.materials.append(fallback)

    bpy.ops.mesh.primitive_plane_add(size=200, location=(0.0, 0.0, -0.015))
    floor = bpy.context.object
    floor_material = bpy.data.materials.new("StudioFloor")
    floor_material.diffuse_color = (0.09, 0.105, 0.13, 1.0)
    floor_material.roughness = 0.83
    floor.data.materials.append(floor_material)

    camera_data = bpy.data.cameras.new("StudioCamera")
    camera = bpy.data.objects.new("StudioCamera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    camera_data.lens = 58

    add_area("Key", (4.5, -4.0, 6.0), 420, 4.0, (1.0, 0.86, 0.72))
    add_area("Fill", (-4.0, -2.0, 3.5), 190, 5.0, (0.66, 0.79, 1.0))
    add_area("Rim", (1.0, 4.5, 5.0), 260, 3.0, (0.76, 0.84, 1.0))

    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        # Blender 5.2 folded Eevee Next back into the BLENDER_EEVEE enum.
        scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = args.size
    scene.render.resolution_y = args.size
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    if scene.world is None:
        scene.world = bpy.data.worlds.new("StudioWorld")
    scene.world.color = (0.025, 0.032, 0.05)
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -1.0
    scene.render.image_settings.color_mode = "RGBA"

    target = Vector((0.0, 0.0, (maximum.z - minimum.z) * 0.48))
    radius = 5.25
    height = max(2.25, float(maximum.z) * 0.82)
    for index in range(args.views):
        angle = math.tau * index / args.views - math.pi / 2
        camera.location = (radius * math.cos(angle), radius * math.sin(angle), height)
        look_at(camera, target)
        scene.render.filepath = str((args.out_dir / f"view-{index + 1:02d}.png").resolve())
        bpy.ops.render.render(write_still=True)
        print(f"rendered {scene.render.filepath}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
