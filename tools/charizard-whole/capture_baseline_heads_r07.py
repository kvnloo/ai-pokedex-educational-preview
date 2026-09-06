"""Capture unedited head baselines at equal scale and shared camera directions."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
scene = bpy.context.scene
assert scene.name == 'REFERENCE-charizard-head-baselines-r07' and bpy.context.mode == 'OBJECT'
centers = {'home':(-.06,-.62,.53),'illustration':(-.085,-.77,.49)}
side = Vector((-.8660254,.5,0))
forward = Vector((-.49446818,-.856444,.14834046))
up = Vector((.07417023,.12846661,.98893636))
directions = {'front':forward,'near':-side,'far':side,'threequarter':forward-side*.8+up*.3,'top':up+forward*.2}
camera = scene.camera
report = {'scale':.7,'resolution':[800,800],'geometryEdited':False,'colorMode':'SINGLE','lighting':'Workbench paint.sl, no shadow/cavity','confounds':['Head centers differ; orientation and scale are shared','Source poses differ, especially HOME upward pitch','Side depth clipping excludes foreground wings','Blender importer omitted eight degenerate HOME faces'],'baselines':{}}
for label, location in centers.items():
    output = root/('baseline-'+label)
    assert not output.exists()
    output.mkdir()
    for obj in scene.objects:
        if obj.get('baseline'):
            obj.hide_render = obj['baseline'] != label
            obj.hide_set(obj['baseline'] != label)
    center = Vector(location)
    captures = {}
    for view,direction in directions.items():
        camera.location = center+direction.normalized()*3
        camera.rotation_euler = (center-camera.location).to_track_quat('-Z','Y').to_euler()
        camera.data.type = 'ORTHO'
        camera.data.ortho_scale = .7
        camera.data.clip_start = 2.75 if view in {'near','far'} else .01
        camera.data.clip_end = 3.25 if view in {'near','far'} else 100
        scene.render.filepath = str(output/(view+'.png'))
        bpy.ops.render.render(write_still=True)
        captures[view] = {'location':list(camera.location),'rotation':list(camera.rotation_euler),'clip':[camera.data.clip_start,camera.data.clip_end]}
    report['baselines'][label] = {'center':location,'cameras':captures}
(root/'baseline-capture.json').write_text(json.dumps(report,indent=2)+'\n')
checkpoint = root/'charizard-head-baseline-comparison-r07.blend'
assert not checkpoint.exists()
bpy.data.libraries.write(str(checkpoint),{scene},fake_user=True,compress=True)
print(json.dumps({'views':list(directions),'baselines':list(centers),'source':str(checkpoint)}))
