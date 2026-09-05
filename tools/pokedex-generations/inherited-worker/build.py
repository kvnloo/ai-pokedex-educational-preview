"""Run with blender --background --python build.py -- --variant board01 --iteration 01."""
import sys,json,math,argparse
from pathlib import Path
HERE=Path(__file__).resolve().parent;sys.path.insert(0,str(HERE))
import bpy
from model import build
from studio import setup,camera
p=argparse.ArgumentParser();p.add_argument('--variant',choices=['board01','board02'],required=True);p.add_argument('--iteration',default='01');a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v002')/a.variant
OUT.mkdir(parents=True,exist_ok=True)
c=json.loads((HERE/'contract.json').read_text())[a.variant];ref=json.loads((HERE/'references.json').read_text())[a.variant]
(OUT/f'contract-{a.iteration}.json').write_text(json.dumps(c,indent=2))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
objects=build(a.variant,c);scene=setup()
for view in ['closed','open']:
    objects['lid'].rotation_euler.x=0 if view=='closed' else math.radians(-c['angle'])
    crop=ref[view]['crop'];camera(scene,c['cameras'][view],crop[2]-crop[0],crop[3]-crop[1])
    scene.render.filepath=str(OUT/f'{view}-iteration-{a.iteration}.png');bpy.ops.render.render(write_still=True)
    # Export projected object centers for independent landmark residual checks.
    from bpy_extras.object_utils import world_to_camera_view
    names={'lock':'GEO-lock-surround','camera':'GEO-camera-surround','ring':'GEO-control-ring-seat','button':'PDX.ButtonPress'}
    projected={}
    for name,objname in names.items():
        o=bpy.data.objects[objname];co=world_to_camera_view(scene,scene.camera,o.matrix_world.translation)
        projected[name]=[co.x*(crop[2]-crop[0]),(1-co.y)*(crop[3]-crop[1])]
    if view=='open':
        from mathutils import Vector
        for prefix,objname in [('screen','GEO-display-glass'),('dpad','GEO-dpad')]:
            o=bpy.data.objects[objname];bounds=[Vector(x) for x in o.bound_box]
            lo=Vector([min(x[i] for x in bounds) for i in range(3)]);hi=Vector([max(x[i] for x in bounds) for i in range(3)])
            positions={'dpad':(lo+hi)/2} if prefix=='dpad' else {'screen_tl':Vector((lo.x,lo.y,lo.z)),'screen_tr':Vector((hi.x,lo.y,lo.z)),'screen_br':Vector((hi.x,hi.y,lo.z)),'screen_bl':Vector((lo.x,hi.y,lo.z))}
            for name,point in positions.items():
                co=world_to_camera_view(scene,scene.camera,o.matrix_world@point);projected[name]=[co.x*(crop[2]-crop[0]),(1-co.y)*(crop[3]-crop[1])]
    (OUT/f'{view}-landmarks-{a.iteration}.json').write_text(json.dumps(projected,indent=2))
scene['stage']='static-overlay-review';scene['variant']=a.variant;scene['contract']=json.dumps(c)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'static.blend'))
