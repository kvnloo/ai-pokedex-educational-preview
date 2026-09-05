"""Render repeatable material/clay turnarounds and mechanical closeups."""
import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import presentation

OUT = Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v001')
scene = bpy.context.scene
root = scene.objects['PDX.Root']
camera = scene.camera
source = Path(bpy.data.filepath)
destination = OUT / 'renders' / source.stem
destination.mkdir(parents=True, exist_ok=True)
identity = {'source': str(source), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()}
(destination / 'source.json').write_text(json.dumps(identity, indent=2))
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'OPTIX'
    prefs.get_devices()
    for device in prefs.devices:
        device.use = device.type != 'CPU'
    scene.cycles.device = 'GPU'
except Exception:
    scene.cycles.device = 'CPU'

clay = bpy.data.materials.new('PDX.EvidenceClay')
clay.use_nodes = True
shader = clay.node_tree.nodes['Principled BSDF']
shader.inputs['Base Color'].default_value = (.32, .36, .4, 1)
shader.inputs['Roughness'].default_value = .58
graphic_objects = [o for o in scene.objects if o.type == 'FONT' or o.name.startswith(('GEO-PDX.ready-', 'GEO-PDX.original-scan', 'GEO-PDX.boot-progress'))]
shots = [
    ('open-three-quarter', 165, (.265,-.38,.29), (0,-.04,.074), 0, False),
    ('closed-front', 1, (0,-.085,.5), (0,-.085,.017), .205, False),
    ('closed-back', 1, (0,-.085,.5), (0,-.085,.017), .205, True),
    ('closed-right', 1, (.5,-.085,.017), (0,-.085,.017), .205, False),
    ('closed-left', 1, (-.5,-.085,.017), (0,-.085,.017), .205, False),
    ('open-front', 165, (0,-.6,.29), (0,-.035,.083), .32, False),
    ('closed-three-quarter', 1, (.245,-.34,.30), (0,-.085,.017), 0, False),
]
details = [
    ('hinge-closeup', 165, (.08,-.135,.095), (0,-.004,.026), .116, False),
    ('controls-released', 271, (.07,-.215,.14), (.010,-.113,.018), .11, False),
    ('button-pressed', 281, (.09,-.172,.045), (.032,-.126,.017), .038, False),
    ('button-released', 271, (.09,-.172,.045), (.032,-.126,.017), .038, False),
    ('port-closeup', 1, (.042,-.28,.039), (0,-.161,.009), .055, False),
    ('sensor-closeup', 165, (-.10,-.16,.245), (-.017,.056,.163), .083, False),
]
records = []
for mode in ['material', 'clay']:
    scene.view_layers[0].material_override = clay if mode == 'clay' else None
    for obj in graphic_objects:
        obj.hide_render = mode == 'clay'
    for name, frame, xyz, target, ortho, underside in shots + (details if mode == 'material' else []):
        scene.frame_set(frame)
        root.rotation_euler = (math.pi,0,0) if underside else (0,0,0)
        root.location = (0,-.17,.034) if underside else (0,0,0)
        camera.location = xyz
        presentation.aim(camera, target)
        camera.data.type = 'ORTHO' if ortho else 'PERSP'
        camera.data.ortho_scale = ortho or .32
        scene.render.resolution_x = 1280
        scene.render.resolution_y = 1280
        path = destination / f'{mode}-{name}.png'
        scene.render.filepath = str(path)
        bpy.context.view_layer.update()
        bpy.ops.render.render(write_still=True)
        records.append({'path':str(path),'frame':frame,'mode':mode,'camera':xyz,'target':target,'orthographicScale':ortho,'undersideFixture':underside,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
        (destination / 'renders.json').write_text(json.dumps({'source':identity,'renders':records}, indent=2))
        print('EVIDENCE_RENDER', path, flush=True)
root.rotation_euler = (0,0,0)
root.location = (0,0,0)
scene.view_layers[0].material_override = None
print('EVIDENCE_COMPLETE', len(records), flush=True)
