"""Reopen frozen sources and GLBs in isolated Blender scenes, then render the imports."""
import hashlib
import json
import re
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

private = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05')
original_scene = bpy.context.scene


def inspect(scene):
    records = {}
    for obj in scene.objects:
        if obj.type != 'MESH':
            continue
        obj.data.calc_loop_triangles()
        points = np.array([obj.matrix_world @ vertex.co for vertex in obj.data.vertices])
        records[re.sub(r'\.\d+$', '', obj.name)] = {
            'vertices': len(points), 'triangles': len(obj.data.loop_triangles),
            'finite': bool(np.isfinite(points).all()),
            'bounds': [points.min(0).tolist(), points.max(0).tolist()],
            'uvLayers': len(obj.data.uv_layers), 'materials': len(obj.data.materials),
            'animation': bool(obj.animation_data),
        }
    return records


def release(scene):
    for obj in list(scene.objects):
        data = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if data and data.users == 0 and isinstance(data, bpy.types.Mesh):
            bpy.data.meshes.remove(data)
    bpy.data.scenes.remove(scene)


try:
    for revision in globals().get('verify_revisions', ['r02', 'r03']):
        assert revision in {'r02', 'r03'}
        root = private / ('whole-' + revision)
        blend = root / ('charizard-whole-' + revision + '.blend')
        glb = blend.with_suffix('.glb')
        expected = json.loads((root / 'capture-receipt.json').read_text())['meshes']
        with bpy.data.libraries.load(str(blend), link=False) as (_, loaded):
            loaded.scenes = ['EDIT-charizard-whole-' + revision]
        source_scene = loaded.scenes[0]
        bpy.context.window.scene = source_scene
        bpy.context.view_layer.update()
        source = inspect(source_scene)
        imported_scene = bpy.data.scenes.new('VERIFY-charizard-whole-' + revision)
        bpy.context.window.scene = imported_scene
        bpy.ops.import_scene.gltf(filepath=str(glb))
        bpy.context.view_layer.update()
        imported = inspect(imported_scene)
        checks = {}
        for record in expected:
            name = record['name']
            checks[name] = {
                'sourceCountsMatch': all(source[name][key] == record[key] for key in ['vertices', 'triangles']),
                'importCountsMatch': all(imported[name][key] == record[key] for key in ['vertices', 'triangles']),
                'boundsMatch': bool(np.allclose(source[name]['bounds'], imported[name]['bounds'], atol=1e-6, rtol=0)),
                'finite': source[name]['finite'] and imported[name]['finite'],
            }
        assert len(source) == len(imported) == 4
        assert all(all(check.values()) for check in checks.values()), checks
        camera = bpy.data.objects.new('CAM-' + imported_scene.name, bpy.data.cameras.new('CAM-' + imported_scene.name))
        imported_scene.collection.objects.link(camera)
        imported_scene.camera = camera
        bounds_file = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/assets/blender/charizard-fair-review/charizard-official-61062-o256.json')
        low, high = map(Vector, json.loads(bounds_file.read_text())['bounds'])
        center = (low + high) / 2
        camera.location = center + Vector((1, -1, .4)).normalized() * 3
        camera.rotation_euler = (center - camera.location).to_track_quat('-Z', 'Y').to_euler()
        camera.data.type = 'ORTHO'
        camera.data.ortho_scale = max(high - low) * 1.25
        imported_scene.render.engine = 'BLENDER_WORKBENCH'
        imported_scene.render.resolution_x = imported_scene.render.resolution_y = 720
        imported_scene.render.resolution_percentage = 100
        imported_scene.render.image_settings.file_format = 'PNG'
        shading = imported_scene.display.shading
        shading.light = 'STUDIO'
        shading.studio_light = 'paint.sl'
        shading.color_type = 'SINGLE'
        shading.single_color = (.63, .65, .68)
        shading.show_shadows = shading.show_cavity = False
        shading.background_type = 'WORLD'
        imported_scene.world = bpy.data.worlds.new('WORLD-' + imported_scene.name)
        imported_scene.world.color = (.055, .055, .055)
        imported_scene.render.filepath = str(root / 'glb-reopened-threequarter.png')
        bpy.ops.render.render(write_still=True)
        report = {'sourceSHA256': hashlib.sha256(blend.read_bytes()).hexdigest(),
                  'glbSHA256': hashlib.sha256(glb.read_bytes()).hexdigest(),
                  'method': 'Blender library source reload and glTF importer in isolated temporary scenes',
                  'source': source, 'imported': imported, 'checks': checks,
                  'animationNames': [], 'limitations': 'Working sculpt has no UVs, authored PBR, armature or animation clips.'}
        (root / 'blender-reopen.json').write_text(json.dumps(report, indent=2) + '\n')
        bpy.context.window.scene = original_scene
        release(imported_scene)
        release(source_scene)
        print(json.dumps({'revision': revision, 'checks': checks}))
finally:
    bpy.context.window.scene = original_scene
