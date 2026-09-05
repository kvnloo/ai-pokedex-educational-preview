"""Read stopped-worker Blender files into separate scenes; never save over inputs."""
import bpy
import bmesh
import json
import math
import struct
from pathlib import Path
from mathutils import Vector

OUT = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/.worktrees/pokedex-generations/canonical/devices/generations/inherited-audit.json')
ROOT = Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v002')

def inspect_scene(scene):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    meshes = []
    for obj in scene.objects:
        if obj.type not in {'MESH', 'FONT', 'CURVE'} or obj.name.startswith('STUDIO'):
            continue
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        collapsed = sum((mesh.vertices[t.vertices[1]].co - mesh.vertices[t.vertices[0]].co).cross(mesh.vertices[t.vertices[2]].co - mesh.vertices[t.vertices[0]].co).length_squared <= 1e-30 for t in mesh.loop_triangles)
        bm = bmesh.new(); bm.from_mesh(mesh)
        meshes.append({'name': obj.name, 'type': obj.type, 'triangles': len(mesh.loop_triangles), 'collapsedTriangles': collapsed, 'nonManifoldEdges': sum(not e.is_manifold for e in bm.edges), 'volume': bm.calc_volume(signed=True), 'uvLayers': len(mesh.uv_layers), 'scale': list(obj.scale)})
        bm.free(); evaluated.to_mesh_clear()
    pose_rows = []
    for frame in [1, 18, 51, 84, 108, 132, 156, 177, 198, 208, 222]:
        scene.frame_set(frame)
        points = [o.matrix_world @ Vector(c) for o in scene.objects if o.type in {'MESH', 'FONT', 'CURVE'} and not o.name.startswith('STUDIO') for c in o.bound_box]
        lo = [min(p[i] for p in points) for i in range(3)]
        hi = [max(p[i] for p in points) for i in range(3)]
        hinge = next(o for o in scene.objects if o.name.startswith('PDX.LidHinge'))
        pose_rows.append({'frame': frame, 'minimum': lo, 'maximum': hi, 'dimensions': [hi[i]-lo[i] for i in range(3)], 'hingeXDegrees': math.degrees(hinge.rotation_euler.x)})
    materials = {m for o in scene.objects if o.type in {'MESH', 'FONT', 'CURVE'} for m in o.data.materials if m}
    return {'meshes': meshes, 'totalTriangles': sum(m['triangles'] for m in meshes), 'missingUVObjects': [m['name'] for m in meshes if not m['uvLayers']], 'collapsedTriangles': sum(m['collapsedTriangles'] for m in meshes), 'nonManifoldObjects': [m['name'] for m in meshes if m['nonManifoldEdges']], 'materials': len(materials), 'imageTextureNodes': sum(n.type == 'TEX_IMAGE' for m in materials if m.use_nodes for n in m.node_tree.nodes), 'materialAnimation': [m.name for m in materials if m.animation_data or (m.node_tree and m.node_tree.animation_data)], 'poses': pose_rows, 'nlaStrips': [{'object': o.name, 'track': t.name, 'strip': s.name, 'start': s.frame_start, 'end': s.frame_end} for o in scene.objects if o.animation_data for t in o.animation_data.nla_tracks for s in t.strips]}

results = []
original = bpy.context.window.scene
for variant, filename in [('board01', 'static.blend'), ('board01', 'board01.blend'), ('board02', 'static.blend')]:
    path = ROOT / variant / filename
    with bpy.data.libraries.load(str(path), link=False) as (source, target):
        target.scenes = source.scenes
    scene = target.scenes[0]
    scene.name = 'AUDIT-inherited-' + variant + '-' + filename.replace('.blend', '')
    bpy.context.window.scene = scene
    results.append({'source': str(path), 'scene': scene.name, **inspect_scene(scene)})
bpy.context.window.scene = original
glb_path = ROOT / 'board01/board01.glb'
data = glb_path.read_bytes()
size = struct.unpack_from('<I', data, 12)[0]
gltf = json.loads(data[20:20+size])
report = {'sourcesUnmodified': True, 'scenes': results, 'board01GLB': {'path': str(glb_path), 'bytes': len(data), 'animations': [{'name': a['name'], 'channels': len(a['channels'])} for a in gltf.get('animations', [])], 'meshes': len(gltf.get('meshes', [])), 'materials': len(gltf.get('materials', [])), 'textures': len(gltf.get('textures', [])), 'primitivesMissingUV': sum('TEXCOORD_0' not in p['attributes'] for m in gltf['meshes'] for p in m['primitives'])}, 'board02RuntimeExists': (ROOT / 'board02/board02.glb').exists(), 'animationVideos': [str(p) for p in ROOT.rglob('*.mp4')]}
OUT.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'report': str(OUT), 'sources': [{'source': r['source'], 'triangles': r['totalTriangles'], 'collapsedTriangles': r['collapsedTriangles'], 'missingUVs': len(r['missingUVObjects']), 'nonManifoldObjects': len(r['nonManifoldObjects']), 'nlaStrips': len(r['nlaStrips']), 'animatedMaterials': r['materialAnimation']} for r in results], 'glb': report['board01GLB'], 'board02RuntimeExists': report['board02RuntimeExists'], 'videos': report['animationVideos']}))
