"""Inspect the distal horn selections before replacement."""
import bpy
import json
import hashlib
import numpy as np
from pathlib import Path
from mathutils import Vector

root=Path(globals().get('head_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03'))
out=root/'horn-selection-r01'
assert not out.exists()
source=bpy.data.objects['GEO-charizard-body-head-r05']
coordinates=np.asarray([v.co[:] for v in source.data.vertices],dtype=np.float32)
audit=np.load(root/'head-r05/refinement-audit.npz')
assert np.array_equal(coordinates,audit['after'])
neighbors=[[] for v in source.data.vertices]
for edge in source.data.edges:
    a,b=edge.vertices
    neighbors[a].append(b)
    neighbors[b].append(a)
definitions=[('negative-x',-.61,[-.0746692643,-.4637778699,.4598054588]),('positive-x',-.655,[.1454085559,-.5468640327,.4912451506])]
masks={}
records=[]
for name,cut,tip in definitions:
    seed=int(np.linalg.norm(coordinates-np.asarray(tip),axis=1).argmin())
    mask=np.zeros(len(coordinates),bool)
    mask[seed]=True
    pending=[seed]
    while pending:
        index=pending.pop()
        for neighbor in neighbors[index]:
            if coordinates[neighbor,1]>cut and not mask[neighbor] and not audit['protected'][neighbor]:
                mask[neighbor]=True
                pending.append(neighbor)
    assert not np.any(mask & audit['protected'])
    masks[name]=mask
    records.append({'name':name,'cutY':cut,'tip':tip,'vertices':int(mask.sum()),'bounds':[coordinates[mask].min(0).tolist(),coordinates[mask].max(0).tolist()]})
assert not np.any(masks['negative-x']&masks['positive-x'])
out.mkdir()
np.savez_compressed(out/'selection.npz',before=coordinates,**masks)
scene=bpy.data.scenes.new('REVIEW-charizard-horn-selection-r01')
body=source.copy();body.data=source.data.copy();body.name='GEO-charizard-horn-selection-r01'
scene.collection.objects.link(body)
colors=np.full((len(coordinates),4),[.63,.65,.68,1.],dtype=np.float32)
colors[masks['negative-x']]=[1.,.22,.03,1.]
colors[masks['positive-x']]=[.08,.48,1.,1.]
attribute=body.data.color_attributes.new(name='horn_selection',type='FLOAT_COLOR',domain='POINT')
attribute.data.foreach_set('color',colors.ravel())
body.data.color_attributes.active_color=attribute
scene.world=bpy.data.worlds.new('WORLD-charizard-horn-selection-r01');scene.world.color=(.075,.075,.075)
camera=bpy.data.objects.new('CAM-charizard-horn-selection-r01',bpy.data.cameras.new('CAM-charizard-horn-selection-r01'))
scene.collection.objects.link(camera);scene.camera=camera
scene.render.engine='BLENDER_WORKBENCH'
shade=scene.display.shading
shade.light='STUDIO';shade.studio_light='paint.sl';shade.color_type='VERTEX';shade.show_shadows=False;shade.show_cavity=False;shade.background_type='WORLD'
scene.render.resolution_x=scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
head=json.loads((root/'baseline/cameras.json').read_text())
camera.data.type='ORTHO';camera.data.ortho_scale=head['orthoScale'];target=Vector(head['target'])
bpy.context.window.scene=scene
for view in ['head-top','head-rear','head-right']:
    camera.location=target+Vector(head['directions'][view]).normalized()*3
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(out/(view+'.png'))
    bpy.ops.render.render(write_still=True)
report={'parent':'charizard-head-r05','parentBlendSha256':hashlib.sha256((root/'head-r05/charizard-head-r05.blend').read_bytes()).hexdigest(),'selections':records,'status':'selection only; source geometry unchanged'}
(out/'selection.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
