import bpy
import json
import math
import sys
from pathlib import Path

HERE=Path(__file__).resolve().parent
if str(HERE) not in sys.path:sys.path.insert(0,str(HERE))
import build_concepts as build

def render(revision, versions=('v002','v003'), views=('closed','open')):
    for version in versions:
        variant='board01' if version=='v002' else 'board02'
        scene=bpy.data.scenes['ASTRA-'+version+'-'+revision];bpy.context.window.scene=scene
        root=Path('/mnt/zer0models/pokemon-iac/devices/pokedex')/version/('astra-'+revision)
        c=build.CONTRACTS[variant]
        hinge=next(o for o in scene.objects if o.get('source_name')=='PDX.LidHinge')
        for view in views:
            if scene.frame_end>=294:scene.frame_set(1 if view=='closed' else 112)
            hinge.rotation_euler.x=0 if view=='closed' else math.radians(-c['angle'])
            crop=build.REFERENCES[variant][view]['crop']
            build.studio.camera(scene,c['cameras'][view],crop[2]-crop[0],crop[3]-crop[1],2)
            scene.render.filepath=str(root/(view+'-matched.png'))
            bpy.ops.render.render(write_still=True)
            print(json.dumps({'render':scene.render.filepath,'candidate':version+'-'+revision,'view':view}))
