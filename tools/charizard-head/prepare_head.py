"""Copy the frozen parent and expose the proposed duplicate-branch selection."""
import bpy
import json
import numpy as np
from pathlib import Path

out=Path(globals().get('head_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03'))/'selection-r01'
assert not out.exists()
assert 'EDIT-charizard-head-r01' not in bpy.data.scenes
out.mkdir()
parent=bpy.data.scenes['EDIT-charizard-tail-r02e']
bpy.context.window.scene=parent
bpy.context.view_layer.update()
scene=bpy.data.scenes.new('EDIT-charizard-head-r01')
for obj in parent.objects:
    if obj.type=='MESH':
        clone=obj.copy()
        clone.data=obj.data.copy()
        clone.parent=None
        clone.matrix_world=obj.matrix_world.copy()
        clone.name='GEO-charizard-body-head-r01' if len(clone.data.vertices)>10000 else 'GEO-charizard-flame-head-r01'
        scene.collection.objects.link(clone)
bpy.context.window.scene=scene
body=bpy.data.objects['GEO-charizard-body-head-r01']
xyz=np.asarray([v.co[:] for v in body.data.vertices],dtype=np.float32)
x,y,z=xyz.T
adjacency=[[] for _ in xyz]
for edge in body.data.edges:
    a,b=edge.vertices
    adjacency[a].append(b)
    adjacency[b].append(a)
seed=int(np.linalg.norm(xyz-np.asarray([-.06,-.72,.45]),axis=1).argmin())
head=np.zeros(len(xyz),dtype=bool)
head[seed]=True
pending=[seed]
while pending:
    index=pending.pop()
    for neighbor in adjacency[index]:
        if z[neighbor]>.30 and not head[neighbor]:
            head[neighbor]=True
            pending.append(neighbor)
assert head.sum()==9274
groups={
    'central-upper-duplicate':head&(y>-.65)&(z>.515)&(x>-.09)&(x<-.02),
    'lower-posterior-duplicates':head&(y>-.63)&(z>.395)&(z<.49)&(x>-.052)&(x<.08),
    'dorsal-spike':head&(z>.574)&(y>-.72)&(y<-.635)&(x>-.105)&(x<-.025),
}
np.savez_compressed(out/'selection.npz',before=xyz,head=head,**groups)
report={'parent':'charizard-tail-r02e','candidate':'charizard-head-r01','headVertices':int(head.sum()),'groups':{name:{'vertices':int(mask.sum()),'bounds':[xyz[mask].min(0).tolist(),xyz[mask].max(0).tolist()]} for name,mask in groups.items()},'status':'selection inspection only; geometry unchanged'}
(out/'selection.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
