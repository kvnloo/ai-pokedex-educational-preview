"""Import verified untouched Hunyuan baselines into an isolated review scene."""
import bpy
import hashlib
import json
from pathlib import Path

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
workspace = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon')
name = 'REFERENCE-charizard-head-baselines-r07'
assert bpy.context.scene.name == 'EDIT-charizard-whole-r06'
assert bpy.context.mode == 'OBJECT' and name not in bpy.data.scenes and not root.exists()
sources = {
    'home': ('assets/experiments/charizard-home-raw/charizard-home-raw-61061.glb', '69287dfd7f7f2e6a5bcf8c2b7281c08fe4a14c1b086f3d6e7eb7e8f0f96d83dd'),
    'illustration': ('assets/experiments/charizard-official-raw/charizard-official-raw-61062-o256.glb', 'f9f0b2c3f2e189dcdd1c72190e8c79b7b958a2dd4f3bacb2d844ec37b330ed8e'),
}
for relative, digest in sources.values():
    assert hashlib.sha256((workspace/relative).read_bytes()).hexdigest() == digest
root.mkdir()
scene = bpy.data.scenes.new(name)
bpy.context.window.scene = scene
reports = []
for label, (relative, digest) in sources.items():
    before = set(scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(workspace/relative))
    bpy.context.view_layer.update()
    for index, obj in enumerate(set(scene.objects)-before):
        obj.name = f'REF-{label}-charizard-r07-{index}'
        obj['baseline'] = label
        obj.hide_render = label != 'home'
        obj.hide_set(label != 'home')
        if obj.type != 'MESH':
            continue
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        obj.data.calc_loop_triangles()
        points = [obj.matrix_world@v.co for v in obj.data.vertices]
        reports.append({'label':label,'object':obj.name,'source':str(workspace/relative),'sha256':digest,'vertices':len(obj.data.vertices),'triangles':len(obj.data.loop_triangles),'matrixWorld':[list(row) for row in obj.matrix_world],'bounds':[[min(p[i] for p in points),max(p[i] for p in points)] for i in range(3)]})
camera = bpy.data.objects.new('CAM-head-baselines-r07',bpy.data.cameras.new('CAM-head-baselines-r07'))
scene.collection.objects.link(camera)
scene.camera = camera
scene.world = bpy.data.worlds.new('WORLD-head-baselines-r07')
scene.world.color = (.055,.055,.055)
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
shade = scene.display.shading
shade.light = 'STUDIO'
shade.studio_light = 'paint.sl'
shade.color_type = 'SINGLE'
shade.single_color = (.63,.65,.68)
shade.show_shadows = shade.show_cavity = False
shade.background_type = 'WORLD'
(root/'baseline-import.json').write_text(json.dumps({'scene':scene.name,'geometryUnedited':True,'smoothShadingSet':True,'sources':reports},indent=2)+'\n')
print(json.dumps(reports))
