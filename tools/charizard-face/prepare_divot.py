"""Inspect the mapped skull patch and fixed boundary before replacing it."""
import bpy
import json
import numpy as np
from pathlib import Path
from mathutils import Vector

root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04')
out=root/'divot-selection-r01'
assert not out.exists()
out.mkdir()
source=bpy.data.objects['GEO-charizard-body-head-r07']
audit=np.load(root/'head-r07/sliver-audit.npz')
data=np.load(root/'audit/divot-patch-neighborhoods.npz')
before=np.asarray([v.co[:] for v in source.data.vertices],dtype=np.float32)
assert np.array_equal(before,audit['after'])
r06_to_r07={int(parent):index for index,parent in enumerate(audit['parent_vertex_ids'])}
interior=np.asarray([r06_to_r07[int(index)] for index in data['radius_0.065_r06_interior_vertex_ids']])
boundary=np.asarray([r06_to_r07[int(index)] for index in data['radius_0.065_r06_boundary_vertex_ids']])
assert not audit['protected'][np.r_[interior,boundary]].any()
scene=bpy.data.scenes.new('REVIEW-charizard-divot-selection-r01')
obj=source.copy();obj.data=source.data.copy();obj.name='GEO-charizard-divot-selection-r01';scene.collection.objects.link(obj)
colors=np.tile(np.asarray([.63,.65,.68,1],dtype=np.float32),(len(before),1))
colors[interior]=[.04,.8,.16,1];colors[boundary]=[1,.72,.02,1]
attribute=obj.data.color_attributes.new(name='divot-selection',type='FLOAT_COLOR',domain='POINT')
attribute.data.foreach_set('color',colors.ravel());obj.data.color_attributes.active_color=attribute
bpy.context.window.scene=scene
camera=bpy.data.objects.new('CAM-charizard-divot-selection-r01',bpy.data.cameras.new('CAM-charizard-divot-selection-r01'));scene.collection.objects.link(camera);scene.camera=camera;camera.data.type='ORTHO'
settings=json.loads((root/'divot-baseline/cameras.json').read_text());target=Vector(settings['target']);camera.data.ortho_scale=settings['orthoScale']
scene.render.engine='BLENDER_WORKBENCH';scene.render.resolution_x,scene.render.resolution_y=settings['resolution'];scene.render.resolution_percentage=100
shade=scene.display.shading;shade.light='STUDIO';shade.studio_light='paint.sl';shade.color_type='VERTEX';shade.show_shadows=False;shade.show_cavity=False
for name,direction in settings['directions'].items():
    camera.location=target+Vector(direction).normalized()*3;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
np.savez_compressed(out/'selection.npz',before=before,interior=interior,boundary=boundary,protected=audit['protected'])
(out/'selection.json').write_text(json.dumps({'source':'charizard-head-r07','interiorVertices':len(interior),'fixedBoundaryVertices':len(boundary),'geometryEdited':False},indent=2)+'\n')
print('Skull patch selection rendered; source unchanged')
