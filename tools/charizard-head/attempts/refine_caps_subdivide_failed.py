"""Refine the pruned skull patches in a distinct Blender scene."""
import bpy
import bmesh
import hashlib
import heapq
import json
import numpy as np
from pathlib import Path

root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03')
revision=globals().get('cap_revision','r03')
out=root/('head-'+revision)
parent_path=root/'head-r01/charizard-head-r01.blend'
assert hashlib.sha256(parent_path.read_bytes()).hexdigest()=='cfb1dc4e772f103ca17da6e730c370153f505236a1cceb503665c91194bee56c'
assert not out.exists()
assert 'EDIT-charizard-head-'+revision not in bpy.data.scenes
parent=bpy.data.scenes['EDIT-charizard-head-r01']
bpy.context.window.scene=parent
bpy.context.view_layer.update()
source=bpy.data.objects['GEO-charizard-body-head-r01']
audit=np.load(root/'head-r01/topology-audit.npz')
before=np.asarray([v.co[:] for v in source.data.vertices],dtype=np.float32)
assert np.array_equal(before,audit['after'])
bm=bmesh.new()
bm.from_mesh(source.data)
bm.verts.ensure_lookup_table()
bm.faces.ensure_lookup_table()
old_vertices=set(bm.verts)
old_faces=set(bm.faces)
vertex_ids=bm.verts.layers.int.new('head_r01_vertex_id')
face_ids=bm.faces.layers.int.new('head_r01_face_id')
tail_vertex_ids=bm.verts.layers.int['tail_r02e_vertex_id']
tail_face_ids=bm.faces.layers.int['tail_r02e_face_id']
patch_layer=bm.faces.layers.int.new('head_cap_patch')
for vertex in bm.verts:
    vertex[vertex_ids]=vertex.index
for face in bm.faces:
    face[face_ids]=face.index
    face[patch_layer]=int(face[tail_face_ids]==-1)
caps=[f for f in bm.faces if f[patch_layer]]
assert len(caps)==155
edges={edge for face in caps for edge in face.edges}
bmesh.ops.subdivide_edges(bm,edges=list(edges),cuts=3,use_grid_fill=True)
for iteration in range(2):
    edges=[edge for edge in bm.edges if edge.calc_length()>.012 and any(f[patch_layer] for f in edge.link_faces)]
    if edges:
        bmesh.ops.subdivide_edges(bm,edges=edges,cuts=1,use_grid_fill=True)
for vertex in bm.verts:
    if vertex not in old_vertices:
        vertex[vertex_ids]=-1
        vertex[tail_vertex_ids]=-1
for face in bm.faces:
    if face not in old_faces:
        face[face_ids]=-1
        face[tail_face_ids]=-1
bmesh.ops.triangulate(bm,faces=[f for f in bm.faces if len(f.verts)>3],quad_method='FIXED',ngon_method='EAR_CLIP')
bm.verts.index_update()
bm.verts.ensure_lookup_table()
positions=np.asarray([v.co[:] for v in bm.verts],dtype=np.float64)
parent_ids=np.asarray([v[vertex_ids] for v in bm.verts],dtype=np.int32)
tail_ids=np.asarray([v[tail_vertex_ids] for v in bm.verts],dtype=np.int32)
neighbors=[[] for v in bm.verts]
for edge in bm.edges:
    a,b=[v.index for v in edge.verts]
    neighbors[a].append(b)
    neighbors[b].append(a)
distance=np.full(len(positions),np.inf)
seeds=sorted({v.index for f in bm.faces if f[patch_layer] for v in f.verts})
distance[seeds]=0
queue=[(0.,index) for index in seeds]
heapq.heapify(queue)
band=.035
while queue:
    length,index=heapq.heappop(queue)
    if length!=distance[index]:
        continue
    for neighbor in neighbors[index]:
        value=length+float(np.linalg.norm(positions[neighbor]-positions[index]))
        if value<distance[neighbor] and value<band:
            distance[neighbor]=value
            heapq.heappush(queue,(value,neighbor))
weights=np.maximum(0,1-distance/band)
weights=weights*weights*(3-2*weights)
movable=np.flatnonzero(weights>0)
protected=(tail_ids>=0)&audit['protected'][np.maximum(tail_ids,0)]
assert not np.any(protected[movable])
start=positions.copy()
for iteration in range(60):
    delta=np.asarray([positions[neighbors[index]].mean(0)-positions[index] for index in movable])
    positions[movable]+=.4*weights[movable,None]*delta
for index in movable:
    bm.verts[int(index)].co=positions[index]
for face in bm.faces:
    face.smooth=True
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
assert all(len(edge.link_faces)==2 for edge in bm.edges)
scene=bpy.data.scenes.new('EDIT-charizard-head-'+revision)
for original in parent.objects:
    if original.type=='MESH':
        clone=original.copy()
        clone.data=original.data.copy()
        clone.parent=None
        clone.matrix_world=original.matrix_world.copy()
        clone.name='GEO-charizard-'+('body' if original==source else 'flame')+'-head-'+revision
        scene.collection.objects.link(clone)
body=next(o for o in scene.objects if 'body' in o.name)
bm.to_mesh(body.data)
bm.free()
body.data.update()
bpy.context.window.scene=scene
after=np.asarray([v.co[:] for v in body.data.vertices],dtype=np.float32)
assert np.array_equal(after[protected],audit['before'][tail_ids[protected]])
out.mkdir()
np.savez_compressed(out/'refinement-audit.npz',before=before,after=after,parent_vertex_ids=parent_ids,tail_vertex_ids=tail_ids,protected=protected,movable=movable,distance=distance,subdivided=start)
receipt={'candidate':'charizard-head-'+revision,'parent':'charizard-head-r01','parentBlendSha256':hashlib.sha256(parent_path.read_bytes()).hexdigest(),'method':'Subdivide two skull cap patches; relax a geodesic band into the retained skull','subdivisionCuts':3,'adaptiveSplits':2,'maximumPatchEdge':.012,'band':band,'iterations':60,'factor':.4,'verticesBefore':len(before),'verticesAfter':len(after),'movedVertices':int(np.any(after!=start.astype(np.float32),axis=1).sum()),'newVertices':int((parent_ids<0).sum()),'protectedVertices':int(protected.sum()),'maximumDisplacement':float(np.linalg.norm(after-start,axis=1).max()),'status':'awaiting actual visual/export validation'}
(out/'refinement-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
