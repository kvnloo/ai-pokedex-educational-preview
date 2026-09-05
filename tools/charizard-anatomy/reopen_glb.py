"""Reopen only this export in an owned Blender scene and measure it."""
import bpy
import json
import struct
from pathlib import Path
from mathutils import Vector

out = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02a')
scene = bpy.data.scenes.new('REOPEN-charizard-tail-r02a')
bpy.context.window.scene = scene
bpy.ops.import_scene.gltf(filepath=str(out / 'charizard-tail-r02a.glb'))
bpy.context.view_layer.update()
meshes = [o for o in scene.objects if o.type == 'MESH']
assert sorted(len(o.data.vertices) for o in meshes) == [4516, 122377]
data = (out / 'charizard-tail-r02a.glb').read_bytes()
length = struct.unpack_from('<I', data, 12)[0]
document = json.loads(data[20:20 + length])
report = {'scene': scene.name, 'meshes': [], 'animations': [clip.get('name') for clip in document.get('animations', [])]}
for obj in meshes:
    points = [obj.matrix_world @ v.co for v in obj.data.vertices]
    lo, hi = [Vector([f(p[i] for p in points) for i in range(3)]) for f in [min, max]]
    report['meshes'].append({'name': obj.name, 'vertices': len(points), 'triangles': len(obj.data.polygons), 'bounds': [list(lo), list(hi)], 'uvLayers': len(obj.data.uv_layers), 'armatureModifiers': sum(m.type == 'ARMATURE' for m in obj.modifiers), 'materialSlots': len(obj.material_slots)})
(out / 'blender-reopen.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
