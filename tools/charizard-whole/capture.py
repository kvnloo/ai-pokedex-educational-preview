"""Capture the owned GUI sculpt against the frozen r18 source. Run in Blender."""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r01')
parent = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/head-r18/charizard-head-r18.blend')
scene = bpy.data.scenes['EDIT-charizard-whole-r01']
mode = globals().get('capture_mode', 'prepare')

def configure(target):
    bpy.context.window.scene = target
    camera = target.camera
    if camera is None:
        camera = bpy.data.objects.new('CAM-' + target.name, bpy.data.cameras.new('CAM-' + target.name))
        target.collection.objects.link(camera)
        target.camera = camera
    camera.data.type = 'ORTHO'
    camera.data.clip_start = .01
    camera.data.clip_end = 100
    target.render.engine = 'BLENDER_WORKBENCH'
    target.render.resolution_x = target.render.resolution_y = 720
    target.render.resolution_percentage = 100
    target.render.image_settings.file_format = 'PNG'
    target.render.film_transparent = False
    shade = target.display.shading
    shade.light = 'STUDIO'
    shade.studio_light = 'paint.sl'
    shade.color_type = 'SINGLE'
    shade.single_color = (.63, .65, .68)
    shade.show_shadows = False
    shade.show_cavity = False
    shade.background_type = 'WORLD'
    if target.world is None:
        target.world = bpy.data.worlds.new('WORLD-' + target.name)
    target.world.color = (.055, .055, .055)
    return camera

def render(target, position, direction, scale, destination, color=False, clip=False):
    bpy.context.window.scene = target
    camera = target.camera
    camera.location = position + Vector(direction).normalized() * 3
    camera.rotation_euler = (position-camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.ortho_scale = scale
    camera.data.clip_start = 2.8 if clip else .01
    camera.data.clip_end = 3.2 if clip else 100
    target.display.shading.color_type = 'VERTEX' if color else 'SINGLE'
    target.render.filepath = str(destination)
    bpy.ops.render.render(write_still=True)

if mode == 'prepare':
    bpy.context.window.scene = scene
    if bpy.context.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    body = bpy.data.objects['GEO-charizard-body-whole-r01']
    for obj in scene.objects:
        obj.select_set(obj == body)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.reveal(select=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    configure(scene)
    records = []
    for obj in scene.objects:
        obj.select_set(obj.type == 'MESH')
        if obj.type != 'MESH':
            continue
        obj.data.calc_loop_triangles()
        records.append({'name': obj.name, 'vertices': len(obj.data.vertices),
                        'polygons': len(obj.data.polygons), 'triangles': len(obj.data.loop_triangles),
                        'uvLayers': len(obj.data.uv_layers), 'materials': len(obj.data.materials)})
    destination = root/'charizard-whole-r01.blend'
    if destination.exists():
        raise RuntimeError('Frozen checkpoint already exists; choose a new revision')
    bpy.ops.export_scene.gltf(filepath=str(root/'charizard-whole-r01.glb'), export_format='GLB',
                              use_selection=True, use_active_scene=True, export_animations=False)
    bpy.data.libraries.write(str(destination), {scene}, fake_user=True, compress=True)
    (root/'capture-receipt.json').write_text(json.dumps({'parent': str(parent), 'source': str(destination),
        'authoring': 'Blender GUI sculpt strokes and native local subdivision; MCP setup and capture',
        'status': 'working sculpt, awaiting visual and geometry review; not game-ready',
        'meshes': records, 'animations': [], 'textures': [],
        'limitations': ['sculpted closed lip groove, no oral cavity or fangs', 'provisional eye colors',
                        'no deformation retopology, UVs, PBR, rig or clips']}, indent=2)+'\n')
    print(json.dumps(records))
else:
    baseline = bpy.data.scenes.get('REVIEW-charizard-r18-whole-r01')
    if baseline is None:
        with bpy.data.libraries.load(str(parent), link=False) as (available, loaded):
            loaded.scenes = ['EDIT-charizard-head-r18']
        baseline = loaded.scenes[0]
        baseline.name = 'REVIEW-charizard-r18-whole-r01'
    bounds = json.loads(Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/assets/blender/charizard-fair-review/charizard-official-61062-o256.json').read_text())['bounds']
    lo, hi = map(Vector, bounds)
    center, extent = (lo+hi)/2, max(hi-lo)
    head = Vector((-.085, -.77, .49))
    side = Vector((-.8660254, .5, 0))
    forward = Vector((-.49446818, -.856444, .14834046))
    for label, target in [('before-r18', baseline), ('after-whole-r01', scene)]:
        if label not in globals().get('capture_labels', ['before-r18', 'after-whole-r01']):
            continue
        configure(target)
        directory = root/label
        directory.mkdir(exist_ok=True)
        if mode == 'stills':
            views = {'front': (0,-1,0), 'right': (1,0,0), 'rear': (0,1,0), 'left': (-1,0,0), 'threequarter': (1,-1,.4)}
            for name, direction in views.items():
                render(target, center, direction, extent*1.25, directory/(name+'.png'))
            for name, direction in [('face-near', -side), ('face-far', side), ('face-front', forward)]:
                render(target, head, direction, .65, directory/(name+'.png'), color=True, clip=name!='face-front')
            # Workbench renders ignore the viewport wire overlay. Capture topology
            # in the actual Edit Mode viewport instead of labeling a clay still wire.
        elif mode == 'turntable':
            frames = directory/'turntable'
            frames.mkdir(exist_ok=True)
            target.render.resolution_x = target.render.resolution_y = 640
            for frame in range(72):
                angle = 2*math.pi*frame/72
                render(target, center, (math.sin(angle), -math.cos(angle), .12), extent*1.25,
                       frames/f'{frame:03d}.png')
        else:
            raise ValueError(mode)
    (root/(mode+'-cameras.json')).write_text(json.dumps({'bounds': bounds, 'wholeOrthoScale': extent*1.25,
        'headTarget': list(head), 'headOrthoScale': .65, 'engine': 'BLENDER_WORKBENCH', 'light': 'paint.sl',
        'shadows': False, 'cavity': False, 'supplementaryFaceClipping': [2.8,3.2],
        'turntableFrames': 72, 'turntableElevation': .12}, indent=2)+'\n')
    bpy.context.window.scene = scene
    print('Captured '+mode)
