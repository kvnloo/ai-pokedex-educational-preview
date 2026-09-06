"""Replace the inspected high-valence skull patch while keeping its boundary fixed."""
import bpy
import bmesh
import json
import numpy as np
from pathlib import Path

root=Path(globals().get('face_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04'))
revision=globals().get('divot_revision','r10')
out=root/('head-'+revision)
assert not out.exists()
source=bpy.data.objects['GEO-charizard-body-head-r07']
data=np.load(root/'divot-selection-r01/selection.npz')
before=np.asarray([vertex.co[:] for vertex in source.data.vertices],dtype=np.float32)
assert np.array_equal(before,data['before'])
bm=bmesh.new();bm.from_mesh(source.data)
bm.verts.ensure_lookup_table();bm.faces.ensure_lookup_table()
vertex_ids=bm.verts.layers.int.new('head_r07_vertex_id')
face_ids=bm.faces.layers.int.new('head_r07_face_id')
for vertex in bm.verts: vertex[vertex_ids]=vertex.index
for face in bm.faces: face[face_ids]=face.index
removed_faces=sorted({face[face_ids] for index in data['interior'] for face in bm.verts[int(index)].link_faces})
bmesh.ops.delete(bm,geom=[bm.verts[int(index)] for index in data['interior']],context='VERTS')
wire_edges=[edge for edge in bm.edges if not edge.link_faces]
if wire_edges: bmesh.ops.delete(bm,geom=wire_edges,context='EDGES')
edges=[edge for edge in bm.edges if edge.is_boundary]
assert len(edges)==72
assert {vertex[vertex_ids] for edge in edges for vertex in edge.verts}==set(data['boundary'])
result=bmesh.ops.grid_fill(bm,edges=edges,use_smooth=True,use_interp_simple=False)
faces=result['faces']
assert faces
new_vertices={vertex for face in faces for vertex in face.verts if vertex[vertex_ids]==0}
assert all(vertex.co != bm.verts[0].co for vertex in new_vertices)
for vertex in new_vertices:
    for name,layer in bm.verts.layers.int.items():
        if name.endswith('_vertex_id'): vertex[layer]=-1
for face in faces:
    for name,layer in bm.faces.layers.int.items():
        if name.endswith('_face_id'): face[layer]=-1
assert all(len(edge.link_faces)==2 for edge in bm.edges)
scene=bpy.data.scenes.new('EDIT-charizard-head-'+revision)
for original in bpy.data.scenes['EDIT-charizard-head-r07'].objects:
    if original.type=='MESH':
        obj=original.copy();obj.data=original.data.copy();obj.parent=None;obj.matrix_world=original.matrix_world.copy();obj.name=original.name.replace('r07',revision);scene.collection.objects.link(obj)
body=bpy.data.objects['GEO-charizard-body-head-'+revision]
patch_face_count=len(faces);new_vertex_count=len(new_vertices)
bm.to_mesh(body.data);bm.free();body.data.update();bpy.context.window.scene=scene
after=np.asarray([vertex.co[:] for vertex in body.data.vertices],dtype=np.float32)
ids=np.asarray([row.value for row in body.data.attributes['head_r07_vertex_id'].data])
retained=ids>=0
assert np.array_equal(after[retained],before[ids[retained]])
protected=np.zeros(len(after),dtype=bool);protected[retained]=data['protected'][ids[retained]]
assert protected.sum()==113062
out.mkdir(parents=True)
np.savez_compressed(out/'divot-audit.npz',before=before,after=after,parent_vertex_ids=ids,protected=protected,removed_parent_vertices=data['interior'],removed_parent_faces=removed_faces,boundary_parent_vertices=data['boundary'])
(out/'divot-receipt.json').write_text(json.dumps({'parent':'charizard-head-r07','candidate':'charizard-head-'+revision,'method':'Blender grid fill of the visually inspected 72-edge skull patch boundary','removedVertices':len(data['interior']),'newVertices':new_vertex_count,'newNativeFaces':patch_face_count,'boundaryVertices':72,'retainedVerticesExact':int(retained.sum()),'protectedVerticesExact':int(protected.sum()),'status':'awaiting rendered/exported validation'},indent=2)+'\n')
print(json.dumps({'candidate':'charizard-head-'+revision,'newFaces':patch_face_count,'newVertices':new_vertex_count,'bodyVertices':len(after)}))
