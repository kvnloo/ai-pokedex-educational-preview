"""Reopen the r07 study and raw-source comparison without retaining verification scenes."""
import bpy
import bmesh
import hashlib
import json
import math
import re
import traceback
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
working = bpy.context.scene
assert working.name == 'EDIT-charizard-head-home-r07' and bpy.context.mode == 'OBJECT'
variant = globals().get('reopen_variant', 'repaired')
assert variant == 'repaired'
expected = json.loads((root/'export-repaired.json').read_text())
assert not (root/'reopen-repaired.json').exists()
before = set(bpy.data.user_map())
report = {'status': 'running', 'checks': [], 'scope': 'Saved artifact structure and rendered appearance; no self-intersection, deformation or S+ acceptance'}

def inspect(obj):
    evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    try:
        mesh.calc_loop_triangles()
        points = [obj.matrix_world @ vertex.co for vertex in mesh.vertices]
        bm = bmesh.new()
        bm.from_mesh(mesh)
        result = {'vertices': len(mesh.vertices), 'triangles': len(mesh.loop_triangles),
                  'nonManifoldEdges': sum(not edge.is_manifold for edge in bm.edges),
                  'zeroAreaTriangles': sum(tri.area <= 1e-14 for tri in mesh.loop_triangles),
                  'volume': bm.calc_volume(signed=True),
                  'bounds': [[min(p[i] for p in points), max(p[i] for p in points)] for i in range(3)],
                  'finite': all(math.isfinite(value) for point in points for value in point),
                  'uvLayers': len(mesh.uv_layers), 'materials': len(mesh.materials),
                  'animation': bool(obj.animation_data)}
        bm.free()
        return result
    finally:
        evaluated.to_mesh_clear()

def load_scene(path, name):
    with bpy.data.libraries.load(str(path), link=False) as (_, loaded):
        loaded.scenes = [name]
    scene = loaded.scenes[0]
    bpy.context.window.scene = scene
    bpy.context.view_layer.update()
    return scene

try:
    source = load_scene(root/'charizard-home-head-r07-study-repaired.blend', working.name)
    records = {}
    for entry in expected['meshes']:
        name = re.sub(r'\.\d+$', '', entry['object']).replace('EXPORT-', 'GEO-')
        obj = next(obj for obj in source.objects if re.sub(r'\.\d+$', '', obj.name) == name)
        record = inspect(obj)
        assert record['vertices'] == entry['vertices'] and record['triangles'] == entry['triangles']
        assert record['finite'] and record['nonManifoldEdges'] == record['zeroAreaTriangles'] == 0
        records[name] = record
    report['source'] = records
    imported = bpy.data.scenes.new('VERIFY-home-head-r07')
    bpy.context.window.scene = imported
    bpy.ops.import_scene.gltf(filepath=str(root/'charizard-home-head-r07-study-repaired.glb'), merge_vertices=True)
    bpy.context.view_layer.update()
    meshes = [obj for obj in imported.objects if obj.type == 'MESH']
    assert len(meshes) == 3
    report['imported'] = {}
    for obj in meshes:
        name = re.sub(r'\.\d+$', '', obj.name).replace('EXPORT-', 'GEO-')
        result = inspect(obj)
        reference = records[name]
        bounds_delta = max(abs(a-b) for ra, rb in zip(reference['bounds'], result['bounds']) for a, b in zip(ra, rb))
        report['imported'][name] = result
        assert result['vertices'] == reference['vertices'] and result['triangles'] == reference['triangles']
        assert result['finite'] and result['nonManifoldEdges'] == result['zeroAreaTriangles'] == 0
        assert bounds_delta < 1e-6 and not result['animation']
        report['imported'][name] = result
        report['checks'].append({'object': name, 'countsMatch': True, 'boundsMaxDelta': bounds_delta})
    camera = working.camera.copy()
    camera.data = working.camera.data.copy()
    imported.collection.objects.link(camera)
    imported.camera = camera
    imported.world = working.world.copy()
    imported.render.engine = 'BLENDER_WORKBENCH'
    imported.render.resolution_x = imported.render.resolution_y = 800
    imported.render.resolution_percentage = 100
    imported.render.image_settings.file_format = 'PNG'
    shade = imported.display.shading
    shade.light = 'STUDIO'
    shade.studio_light = 'paint.sl'
    shade.color_type = 'MATERIAL'
    shade.show_shadows = shade.show_cavity = False
    shade.background_type = 'WORLD'
    output = root/'reopened-repaired'
    output.mkdir()
    cameras = json.loads((root/'home-eye-gaze-c/capture.json').read_text())['cameras']
    for name, view in cameras.items():
        camera.location = view['location']
        camera.rotation_euler = view['rotation']
        camera.data.type = 'ORTHO'
        camera.data.ortho_scale = view['orthoScale']
        imported.render.filepath = str(output/(name+'.png'))
        bpy.ops.render.render(write_still=True)
    baseline = load_scene(root/'charizard-head-baseline-comparison-r07-all.blend', 'REFERENCE-charizard-head-baselines-r07')
    baseline_counts = {}
    for obj in baseline.objects:
        if obj.type != 'MESH':
            continue
        obj.data.calc_loop_triangles()
        baseline_counts[obj['baseline']] = {'vertices': len(obj.data.vertices), 'triangles': len(obj.data.loop_triangles)}
    assert baseline_counts == {'home': {'vertices': 364846, 'triangles': 729684},
                               'illustration': {'vertices': 145639, 'triangles': 291274},
                               'illustration384': {'vertices': 328133, 'triangles': 656262}}
    report['baselineSource'] = baseline_counts
    report['hashes'] = {name: hashlib.sha256((root/name).read_bytes()).hexdigest() for name in
                        ['charizard-home-head-r07-study-repaired.blend', 'charizard-home-head-r07-study-repaired.glb', 'charizard-head-baseline-comparison-r07-all.blend']}
    report['status'] = 'passed; visual inspection still required'
except BaseException:
    report['status'] = 'failed'
    report['error'] = traceback.format_exc()
    raise
finally:
    bpy.context.window.scene = working
    bpy.data.batch_remove(ids=set(bpy.data.user_map()) - before)
    report['workingSceneRestored'] = bpy.context.scene == working
    (root/'reopen-repaired.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps({'status': report['status'], 'checks': report['checks'], 'workingSceneRestored': report['workingSceneRestored']}))
