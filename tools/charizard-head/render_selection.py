"""Inspect colored masks on a disposable copy, leaving the editing mesh untouched."""
import bpy
import json
import numpy as np
from pathlib import Path
from mathutils import Vector

tag=globals().get('selection_tag','selection-r01')
root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03')
out=root/tag
data=np.load(out/'selection.npz')
name='REVIEW-charizard-head-'+tag
assert name not in bpy.data.scenes
scene=bpy.data.scenes.new(name)
source=bpy.data.objects['GEO-charizard-body-head-r01']
assert np.array_equal(data['before'],np.asarray([v.co[:] for v in source.data.vertices],dtype=np.float32))
body=source.copy()
body.data=source.data.copy()
body.name='GEO-head-'+tag
scene.collection.objects.link(body)
colors=np.tile([.3,.32,.34,1.],(len(body.data.vertices),1))
palette={'central-upper-duplicate':[1.,.35,.04,1.],'lower-posterior-duplicates':[.8,.03,.3,1.],'dorsal-spike':[.02,.5,1.,1.]}
for key,color in palette.items():
    colors[data[key]]=color
attribute=body.data.color_attributes.new(name='BranchSelection',type='FLOAT_COLOR',domain='POINT')
attribute.data.foreach_set('color',colors.ravel())
body.data.color_attributes.active_color=attribute
bpy.context.window.scene=scene
camera=bpy.data.objects.new('CAM-'+tag,bpy.data.cameras.new('CAM-'+tag))
scene.collection.objects.link(camera)
scene.camera=camera
camera.data.type='ORTHO'
camera.data.ortho_scale=.85
scene.render.engine='BLENDER_WORKBENCH'
scene.render.resolution_x=scene.render.resolution_y=900
scene.render.resolution_percentage=100
shade=scene.display.shading
shade.light='STUDIO'
shade.studio_light='paint.sl'
shade.color_type='VERTEX'
shade.show_shadows=False
shade.show_cavity=False
shade.background_type='WORLD'
scene.world=bpy.data.worlds.new('WORLD-'+tag)
scene.world.color=(.075,.075,.075)
receipt=json.loads((root/'baseline/cameras.json').read_text())
target=Vector(receipt['target'])
for view in ['head-top','head-rear','head-right']:
    camera.location=target+Vector(receipt['directions'][view]).normalized()*3
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(out/(view+'.png'))
    bpy.ops.render.render(write_still=True)
(out/'palette.json').write_text(json.dumps(palette,indent=2)+'\n')
print(json.dumps({'selection':tag,'rendered':['head-top','head-rear','head-right'],'geometryEdited':False}))
