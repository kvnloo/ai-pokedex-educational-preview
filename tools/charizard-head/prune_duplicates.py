"""Remove visually confirmed duplicate branches, retaining their boundary coordinates."""
import bpy
import bmesh
import json
import numpy as np
from pathlib import Path

root=Path(globals().get('head_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03'))
revision=globals().get('prune_revision','r01')
cap_mode=globals().get('prune_cap_mode','fan')
out=root/('head-'+revision)
assert not out.exists()
data=np.load(root/'selection-r02/selection.npz')
scene=bpy.data.scenes['EDIT-charizard-head-'+revision]
bpy.context.window.scene=scene
obj=bpy.data.objects['GEO-charizard-body-head-'+revision]
before=np.asarray([v.co[:] for v in obj.data.vertices],dtype=np.float32)
assert np.array_equal(before,data['before'])
mask=data['central-upper-duplicate']|data['lower-posterior-duplicates']|data['dorsal-spike']
boundary_cleanup=[69825,69826]
if cap_mode=='cdt':
    boundary_cleanup += [79893,79894,80492,80493]
mask[boundary_cleanup]=True
assert np.all(data['head'][mask])
bm=bmesh.new()
bm.from_mesh(obj.data)
bm.verts.ensure_lookup_table()
bm.faces.ensure_lookup_table()
vertex_ids=bm.verts.layers.int.new('tail_r02e_vertex_id')
face_ids=bm.faces.layers.int.new('tail_r02e_face_id')
for vertex in bm.verts:
    vertex[vertex_ids]=vertex.index
for face in bm.faces:
    face[face_ids]=face.index
selected=[v for v in bm.verts if mask[v.index]]
removed_faces=sorted({f.index for v in selected for f in v.link_faces})
bmesh.ops.delete(bm,geom=selected,context='VERTS')
boundary=[e for e in bm.edges if e.is_boundary]
assert all(sum(e.is_boundary for e in v.link_edges)==2 for e in boundary for v in e.verts), 'Selection must leave simple boundary loops'
remaining=set(boundary)
rims=[]
while remaining:
    edge=min(remaining,key=lambda e:sorted(v[vertex_ids] for v in e.verts))
    start,current=sorted(edge.verts,key=lambda v:v[vertex_ids])
    remaining.remove(edge)
    rim=[start,current]
    while current!=start:
        candidates=[e for e in current.link_edges if e in remaining]
        assert len(candidates)==1
        edge=candidates[0]
        remaining.remove(edge)
        current=edge.other_vert(current)
        if current!=start:
            rim.append(current)
    rims.append(rim)
patches=[]
new_faces=[]
if cap_mode=='cdt':
    helper=Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/.worktrees/charizard-anatomy/tools/charizard-head/cap_patch.py')
    exec(compile(helper.read_text(),str(helper),'exec'))
for rim in rims:
    if cap_mode=='cdt':
        faces,patch=cap_patch(bm,rim,vertex_ids)
        new_faces.extend(faces)
        patches.append(patch)
        continue
    center=sum((v.co for v in rim),rim[0].co*0)/len(rim)
    patches.append({'boundaryParentVertexIds':[v[vertex_ids] for v in rim],'center':list(center)})
    point=bm.verts.new(center)
    point[vertex_ids]=-1
    for index,vertex in enumerate(rim):
        new_faces.append(bm.faces.new((vertex,rim[(index+1)%len(rim)],point)))
for face in new_faces:
    face[face_ids]=-1
    face.smooth=True
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
assert all(len(e.link_faces)==2 for e in bm.edges)
bm.verts.index_update()
bm.faces.index_update()
parent_ids=np.asarray([v[vertex_ids] for v in bm.verts],dtype=np.int32)
after=np.asarray([v.co[:] for v in bm.verts],dtype=np.float32)
retained=parent_ids>=0
assert np.array_equal(after[retained],before[parent_ids[retained]])
assert not np.any(mask[~data['head']])
out.mkdir()
np.savez_compressed(out/'topology-audit.npz',before=before,after=after,parent_vertex_ids=parent_ids,parent_face_ids=np.asarray([f[face_ids] for f in bm.faces],dtype=np.int32),removed_parent_vertices=np.flatnonzero(mask),removed_parent_faces=np.asarray(removed_faces),protected=~data['head'])
receipt={'parent':'charizard-tail-r02e','candidate':'charizard-head-'+revision,'selection':'selection-r02','method':'Delete duplicate branches and dorsal spike; cap unchanged boundaries','capMode':cap_mode,'boundaryCleanupParentVertexIds':boundary_cleanup,'removedVertices':int(mask.sum()),'removedPolygons':len(removed_faces),'newVertices':int((~retained).sum()),'newTriangles':len(new_faces),'patches':patches,'newTriangleVertexIds':[[v.index for v in f.verts] for f in new_faces],'remainingCoordinatesExact':True,'protectedVertices':int((~data['head']).sum()),'status':'awaiting exported and visual validation'}
bm.to_mesh(obj.data)
bm.free()
obj.data.update()
(out/'prune-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k not in ['patches','newTriangleVertexIds']}))
