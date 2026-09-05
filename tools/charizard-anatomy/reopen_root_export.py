"""Reopen the chosen tail export in its own Blender scene and measure it."""
import bpy
import json
import struct
from pathlib import Path

out = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02e')
assert 'REOPEN-charizard-tail-r02e' not in bpy.data.scenes
scene = bpy.data.scenes.new('REOPEN-charizard-tail-r02e')
bpy.context.window.scene = scene
bpy.ops.import_scene.gltf(filepath=str(out / 'charizard-tail-r02e.glb'))
bpy.context.view_layer.update()
meshes = [obj for obj in scene.objects if obj.type == 'MESH']
assert sorted(len(obj.data.vertices) for obj in meshes) == [4516, 122336]
data = (out / 'charizard-tail-r02e.glb').read_bytes()
length = struct.unpack_from('<I', data, 12)[0]
document = json.loads(data[20:20 + length])
report = {'scene': scene.name, 'meshes': [], 'animations': [clip.get('name') for clip in document.get('animations', [])]}
for obj in meshes:
    points = [obj.matrix_world @ vertex.co for vertex in obj.data.vertices]
    bounds = [[operation(point[axis] for point in points) for axis in range(3)] for operation in [min, max]]
    report['meshes'].append({'name': obj.name, 'vertices': len(points), 'triangles': len(obj.data.polygons), 'bounds': bounds, 'uvLayers': len(obj.data.uv_layers), 'armatureModifiers': sum(mod.type == 'ARMATURE' for mod in obj.modifiers), 'materialSlots': len(obj.material_slots)})
report['triangles'] = sum(mesh['triangles'] for mesh in report['meshes'])
assert report['triangles'] == 253700
(out / 'blender-reopen.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
