"""Build the CC0 synthetic beacon GLB fixture with Blender's Python API."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import bpy


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "generated" / "synthetic_beacon.glb"
PROVENANCE = OUTPUT.with_suffix(".provenance.json")

bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name: str, color: tuple[float, float, float, float], metallic: float = 0.0, emission: float = 0.0):
    value = bpy.data.materials.new(name)
    value.diffuse_color = color
    value.use_nodes = True
    principled = value.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = color
    metallic_input = principled.inputs.get("Metallic IOR Level") or principled.inputs.get("Metallic")
    metallic_input.default_value = metallic
    principled.inputs["Roughness"].default_value = 0.32
    if emission:
        emission_color = principled.inputs.get("Emission Color") or principled.inputs.get("Emission")
        emission_color.default_value = color
        principled.inputs.get("Emission Strength").default_value = emission
    return value

stone = material("SyntheticStone", (0.07, 0.12, 0.2, 1.0), metallic=0.25)
cyan = material("SyntheticCyan", (0.05, 0.75, 1.0, 1.0), metallic=0.1, emission=3.0)

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.7, depth=0.22, location=(0, 0, 0.11))
base = bpy.context.object
base.name = "SyntheticBeaconBase"
base.data.materials.append(stone)

bpy.ops.mesh.primitive_torus_add(major_radius=0.48, minor_radius=0.055, major_segments=16, minor_segments=6, location=(0, 0, 0.38))
ring = bpy.context.object
ring.name = "SyntheticBeaconRing"
ring.data.materials.append(cyan)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.27, location=(0, 0, 0.62))
core = bpy.context.object
core.name = "SyntheticBeaconCore"
core.data.materials.append(cyan)

for obj in bpy.context.scene.objects:
    obj.select_set(obj.type == "MESH")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(OUTPUT),
    export_format="GLB",
    export_apply=True,
    export_cameras=False,
    export_lights=False,
    export_yup=True,
)

PROVENANCE.write_text(
    json.dumps(
        {
            "generator": "Blender 5.2 Python API",
            "license": "CC0-1.0 synthetic fixture",
            "private_assets": False,
            "sha256": hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
            "source": "native/godot/assets/source/build_synthetic_beacon.py",
        },
        indent=2,
        sort_keys=True,
    ) + "\n",
    encoding="utf-8",
)
print(f"WROTE {OUTPUT}")
