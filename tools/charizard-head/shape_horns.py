"""Replace the two inspected distal horn shafts with connected tapered lofts."""
import bpy
import bmesh
import hashlib
import json
import numpy as np
from pathlib import Path
from mathutils import Vector

frozen=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03')
root=Path(globals().get('head_root',str(frozen)))
revision=globals().get('horn_revision','r06')
out=root/('head-'+revision)
assert not out.exists()
assert 'EDIT-charizard-head-'+revision not in bpy.data.scenes
parent_path=root/'head-r05/charizard-head-r05.blend'
if root==frozen:
    assert hashlib.sha256(parent_path.read_bytes()).hexdigest()=='55abff640f2a2937b43c6e8ddbb70f66397a4cf079df1afcb7c15c89db26c66e'
selection=np.load(root/'horn-selection-r01/selection.npz')
definitions=json.loads((root/'horn-selection-r01/selection.json').read_text())['selections']
audit=np.load(root/'head-r05/refinement-audit.npz')
source=bpy.data.objects['GEO-charizard-body-head-r05']
before=np.asarray([v.co[:] for v in source.data.vertices],dtype=np.float32)
assert np.array_equal(before,selection['before']) and np.array_equal(before,audit['after'])
mask=selection['negative-x']|selection['positive-x']
assert not np.any(mask&audit['protected'])
bm=bmesh.new();bm.from_mesh(source.data)
bm.verts.ensure_lookup_table();bm.faces.ensure_lookup_table()
vertex_ids=bm.verts.layers.int.new('head_r05_vertex_id')
face_ids=bm.faces.layers.int.new('head_r05_face_id')
horn_ids=bm.faces.layers.int.new('head_horn_index')
for vertex in bm.verts: vertex[vertex_ids]=vertex.index
for face in bm.faces: face[face_ids]=face.index
vertex_ancestry=[layer for name,layer in bm.verts.layers.int.items() if name.endswith('_vertex_id')]
face_ancestry=[layer for name,layer in bm.faces.layers.int.items() if name.endswith('_face_id')]
def vertex_at(position):
    vertex=bm.verts.new(position)
    for layer in vertex_ancestry: vertex[layer]=-1
    return vertex
def face_at(vertices,horn):
    face=bm.faces.new(vertices)
    for layer in face_ancestry: face[layer]=-1
    face[horn_ids]=horn
    face.smooth=True
    return face
removed_faces=sorted({face[face_ids] for vertex in bm.verts if mask[vertex[vertex_ids]] for face in vertex.link_faces})
bmesh.ops.delete(bm,geom=[vertex for vertex in bm.verts if mask[vertex[vertex_ids]]],context='VERTS')
assert all(len(edge.link_faces) in (1,2) for edge in bm.edges)
boundary={edge for edge in bm.edges if edge.is_boundary}
assert all(sum(e.is_boundary for e in v.link_edges)==2 for edge in boundary for v in edge.verts)
rims=[]
while boundary:
    edge=min(boundary,key=lambda e:tuple(sorted(v[vertex_ids] for v in e.verts)))
    start,current=sorted(edge.verts,key=lambda v:v[vertex_ids])
    boundary.remove(edge);rim=[start,current]
    while current!=start:
        edge=next(e for e in current.link_edges if e in boundary)
        boundary.remove(edge);current=edge.other_vert(current)
        if current!=start: rim.append(current)
    rims.append(rim)
assert len(rims)==2
records=[]
for horn,definition in enumerate(definitions,1):
    tip=Vector(definition['tip'])
    rim=min(rims,key=lambda ring:(sum((v.co for v in ring),Vector())/len(ring)-tip).length)
    rims.remove(rim)
    coordinates=np.asarray([v.co[:] for v in rim])
    center=coordinates.mean(0)
    offsets=coordinates-center
    softened=offsets.copy()
    for iteration in range(5): softened=.5*softened+.25*(np.roll(softened,1,axis=0)+np.roll(softened,-1,axis=0))
    previous=rim
    all_rings=[rim]
    for step in range(1,16):
        t=step/16
        blend=min(t/.25,1.);blend=blend*blend*(3-2*blend)
        radial=(1-blend)*offsets+blend*softened
        positions=center+(np.asarray(tip)-center)*t+(1-t**1.5)*radial
        current=[vertex_at(position) for position in positions]
        for index in range(len(rim)):
            following=(index+1)%len(rim)
            face_at((previous[index],previous[following],current[following],current[index]),horn)
        previous=current;all_rings.append(current)
    point=vertex_at(tip)
    for index in range(len(rim)): face_at((previous[index],previous[(index+1)%len(rim)],point),horn)
    records.append({'name':definition['name'],'boundaryHeadR05VertexIds':[v[vertex_ids] for v in rim],'rootCenter':center.tolist(),'tip':list(tip),'ringCount':16,'verticesPerRing':len(rim),'taperExponent':1.5,'point':point,'rings':all_rings})
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
assert all(len(edge.link_faces)==2 for edge in bm.edges)
bm.verts.index_update();bm.faces.index_update()
parent_ids=np.asarray([v[vertex_ids] for v in bm.verts],dtype=np.int32)
tail_ids=np.asarray([v[bm.verts.layers.int['tail_r02e_vertex_id']] for v in bm.verts],dtype=np.int32)
after=np.asarray([v.co[:] for v in bm.verts],dtype=np.float32)
retained=parent_ids>=0
assert retained.sum()==len(before)-mask.sum()
assert np.array_equal(after[retained],before[parent_ids[retained]])
protected=retained&audit['protected'][np.maximum(parent_ids,0)]
assert protected.sum()==113062
for record in records:
    record['tipVertexIndex']=record.pop('point').index
    record['ringVertexIndices']=[[v.index for v in ring] for ring in record.pop('rings')]
parent=bpy.data.scenes['EDIT-charizard-head-r05']
bpy.context.window.scene=parent;bpy.context.view_layer.update()
scene=bpy.data.scenes.new('EDIT-charizard-head-'+revision)
for original in parent.objects:
    if original.type=='MESH':
        clone=original.copy();clone.data=original.data.copy();clone.parent=None;clone.matrix_world=original.matrix_world.copy()
        clone.name='GEO-charizard-'+('body' if original==source else 'flame')+'-head-'+revision
        scene.collection.objects.link(clone)
body=next(o for o in scene.objects if 'body' in o.name)
bm.to_mesh(body.data);bm.free();body.data.update()
bpy.context.window.scene=scene
out.mkdir()
np.savez_compressed(out/'horn-audit.npz',before=before,after=after,parent_vertex_ids=parent_ids,tail_vertex_ids=tail_ids,protected=protected,removed_parent_vertices=np.flatnonzero(mask),removed_parent_faces=np.asarray(removed_faces))
receipt={'candidate':'charizard-head-'+revision,'parent':'charizard-head-r05','parentBlendSha256':hashlib.sha256(parent_path.read_bytes()).hexdigest(),'method':'Two connected distal horn lofts; fixed root boundary vertices; sixteen rings and one true point each','removedVertices':int(mask.sum()),'newVertices':int((~retained).sum()),'retainedVerticesExact':int(retained.sum()),'protectedVertices':int(protected.sum()),'horns':records,'status':'awaiting rendered and exported validation'}
(out/'horn-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({key:value for key,value in receipt.items() if key!='horns'}))
