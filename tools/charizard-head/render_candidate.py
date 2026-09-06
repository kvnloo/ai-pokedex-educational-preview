"""Export an owned head candidate and render fixed whole-body and head cameras."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

revision=globals().get('head_revision','r01')
identifier='charizard-head-'+revision
root=Path(globals().get('head_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03'))
out=Path(globals().get('head_directory',str(root/('head-'+revision))))
scene=bpy.data.scenes['EDIT-'+identifier]
bpy.context.window.scene=scene
assert not (out/(identifier+'.blend')).exists()
camera=bpy.data.objects.new('CAM-'+identifier,bpy.data.cameras.new('CAM-'+identifier))
scene.collection.objects.link(camera)
scene.camera=camera
camera.data.type='ORTHO'
scene.render.engine='BLENDER_WORKBENCH'
scene.render.resolution_x=scene.render.resolution_y=800
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
shade=scene.display.shading
shade.light='STUDIO'
shade.studio_light='paint.sl'
shade.color_type='SINGLE'
shade.single_color=(.63,.65,.68)
shade.show_shadows=True
shade.show_cavity=False
shade.background_type='WORLD'
scene.world=bpy.data.worlds.new('WORLD-'+identifier)
scene.world.color=(.075,.075,.075)
frames=Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/assets/blender/charizard-fair-review/charizard-official-61062-o256.json')
bounds=json.loads(frames.read_text())['bounds']
lo,hi=[Vector(point) for point in bounds]
center,extent=(lo+hi)/2,max(hi-lo)
directions={'minusY':(0,-1,0),'plusX':(1,0,0),'plusY':(0,1,0),'minusX':(-1,0,0),'threequarter':(1,-1,.4)}
camera.data.ortho_scale=extent*1.25
for view,direction in directions.items():
    camera.location=center+Vector(direction).normalized()*extent*3
    camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(out/(identifier+'-'+view+'.png'))
    bpy.ops.render.render(write_still=True)
for obj in scene.objects:
    obj.select_set(obj.type=='MESH')
bpy.context.view_layer.objects.active=max((obj for obj in scene.objects if obj.type=='MESH'),key=lambda obj:len(obj.data.vertices))
bpy.ops.export_scene.gltf(filepath=str(out/(identifier+'.glb')),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False)
bpy.data.libraries.write(str(out/(identifier+'.blend')),{scene},fake_user=True)
head=json.loads((root/'baseline/cameras.json').read_text())
target=Vector(head['target'])
camera.data.ortho_scale=head['orthoScale']
scene.render.resolution_x,scene.render.resolution_y=head['resolution']
shade.show_shadows=False
for view,direction in head['directions'].items():
    camera.location=target+Vector(direction).normalized()*3
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(out/(identifier+'-'+view+'.png'))
    bpy.ops.render.render(write_still=True)
(out/'cameras.json').write_text(json.dumps({'wholeBody':{'bounds':bounds,'directions':directions,'orthoScale':extent*1.25,'shadows':True,'resolution':[800,800]},'head':head,'engine':'BLENDER_WORKBENCH','light':'paint.sl','cavity':False},indent=2)+'\n')
print(json.dumps({'candidate':identifier,'output':str(out),'views':list(directions)+list(head['directions'])}))
