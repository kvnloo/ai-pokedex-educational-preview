"""Build final .blend/GLB only from an accepted static overlay revision."""
import sys,json,hashlib,argparse,math
from pathlib import Path
HERE=Path(__file__).resolve().parent;sys.path.insert(0,str(HERE))
import bpy
from model import build
from studio import setup,camera
import animate
OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v002')
p=argparse.ArgumentParser();p.add_argument('--variant',required=True,choices=['board01','board02']);a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
gate=json.loads((OUT/'evidence/overlay-gate.json').read_text())
assert gate['accepted'] and all(x['numeric_gate'] for b in gate['metrics'].values() for x in b.values())
assert gate['model_sha256']==hashlib.sha256((HERE/'model.py').read_bytes()).hexdigest(),'Model changed after the overlay review'
c=json.loads((HERE/'contract.json').read_text())[a.variant];ref=json.loads((HERE/'references.json').read_text())[a.variant]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
objects=build(a.variant,c);scene=setup();scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
# Bake construction modifiers, curves and text before animation. Preserve named pivot hierarchy.
bpy.ops.object.select_all(action='DESELECT')
for obj in list(scene.objects):
    if obj.type in {'MESH','CURVE','FONT'}:obj.select_set(True);bpy.context.view_layer.objects.active=obj
bpy.ops.object.convert(target='MESH')
animate.build(objects,c)
scene['variant']=a.variant;scene['overlay_revision']=gate['iteration'];scene['contract']=json.dumps(c)
scene['animation_contract']=json.dumps(animate.CLIPS)
# Export only device descendants. The studio does not become part of the GLB.
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    parent=obj
    while parent and parent!=objects['root']:parent=parent.parent
    if parent:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/a.variant/f'{a.variant}.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_range=False,export_anim_slide_to_zero=True,export_extras=True)
# Contact shadow floor belongs only to the presentation scene.
from geometry import material,rounded
rounded('STUDIO-floor',2,2,.002,.01,(0,0,-.0066),material('studio-floor',(.028,.026,.024),.6),None,0)
bpy.data.objects['GEO-STUDIO-floor'].name='STUDIO-floor'
scene.render.film_transparent=False
crop=ref['open']['crop'];camera(scene,c['cameras']['open'],crop[2]-crop[0],crop[3]-crop[1],2)
scene.frame_set(156);bpy.ops.wm.save_as_mainfile(filepath=str(OUT/a.variant/f'{a.variant}.blend'))
(OUT/a.variant/'clips.json').write_text(json.dumps({'fps':24,'clips':[{'name':n,'start':s,'end':e,'duration_seconds':(e-s)/24} for n,s,e in animate.CLIPS],'hinge_axis':'local X','hinge_degrees':[0,-c['angle']],'button_travel_m':.0012,'screen':'Vector meshes, exportable scale reveal. Ready content is a simple species list; no reference photograph is embedded.'},indent=2)+'\n')
print('DELIVERED',a.variant)
