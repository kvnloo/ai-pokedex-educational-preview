"""Trim overlapping neck surfaces into two boundary loops for native bridging."""
import bpy
import bmesh
import json
from pathlib import Path
from mathutils import Matrix, Vector

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-r06' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
report_path = root/'neck-bridge-preparation.json'
name = 'GEO-charizard-neck-bridge-r06'
assert not report_path.exists() and name not in bpy.data.objects
body = bpy.data.objects['GEO-charizard-body-whole-r06']
head = bpy.data.objects['GEO-charizard-raw-head-r06']
origin = Vector((-.085,-.77,.49))
forward = Vector((-.49446818,-.856444,.14834046))
up = Vector((.07417023,.12846661,.98893636))
vertices, faces, reports = [], [], []
for obj, cut, upper in [(body,-.19,False),(head,-.145,True)]:
    evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    evaluated.to_mesh_clear()
    bmesh.ops.transform(bm, matrix=obj.matrix_world, verts=list(bm.verts))
    assert all(edge.is_manifold for edge in bm.edges)
    if upper:
        geometry = list(bm.verts)+list(bm.edges)+list(bm.faces)
    else:
        seed = min(bm.verts,key=lambda v:(v.co-(origin-forward*.18-up*.15)).length_squared)
        pending = [seed]
        region = set()
        while pending:
            vertex = pending.pop()
            if vertex in region or (vertex.co-origin).dot(up)<=cut:
                continue
            region.add(vertex)
            pending.extend(edge.other_vert(vertex) for edge in vertex.link_edges)
        assert region
        selected = region | {v for vertex in region for face in vertex.link_faces for v in face.verts}
        geometry = list(selected)+[e for e in bm.edges if all(v in selected for v in e.verts)]+[f for f in bm.faces if all(v in selected for v in f.verts)]
    bmesh.ops.bisect_plane(bm,geom=geometry,dist=.0000001,plane_co=origin+up*cut,plane_no=up,clear_inner=upper,clear_outer=not upper)
    boundary = [edge for edge in bm.edges if edge.is_boundary]
    ring = {v for edge in boundary for v in edge.verts}
    assert ring and all(abs((v.co-origin).dot(up)-cut)<.00001 for v in ring)
    assert all(sum(e.is_boundary for e in v.link_edges)==2 for v in ring)
    visited, pending = set(), [next(iter(ring))]
    while pending:
        vertex = pending.pop()
        if vertex in visited:
            continue
        visited.add(vertex)
        pending.extend(e.other_vert(vertex) for e in vertex.link_edges if e.is_boundary)
    assert visited==ring, 'Expected one boundary per source'
    bm.verts.index_update()
    start = len(vertices)
    vertices.extend([v.co.copy() for v in bm.verts])
    faces.extend([[start+v.index for v in face.verts] for face in bm.faces])
    reports.append({'source':obj.name,'cutHeadUp':cut,'boundaryVertices':len(ring),'retainedVertices':len(bm.verts)})
    bm.free()
mesh = bpy.data.meshes.new(name)
mesh.from_pydata(vertices,[],faces)
mesh.update()
obj = bpy.data.objects.new(name,mesh)
scene.collection.objects.link(obj)
obj.matrix_world = Matrix.Identity(4)
for polygon in mesh.polygons:
    polygon.use_smooth = True
for source in [body,head]:
    source.hide_set(True)
    source.hide_render = True
for other in scene.objects:
    other.select_set(other==obj)
bpy.context.view_layer.objects.active = obj
scene.tool_settings.mesh_select_mode = (False,True,False)
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(mesh)
for v in bm.verts: v.select_set(False)
for edge in bm.edges: edge.select_set(edge.is_boundary)
bm.select_flush_mode()
bmesh.update_edit_mesh(mesh)
report = {'object':obj.name,'loops':reports,'selectedBoundaryEdges':sum(e.select for e in bm.edges),'gapHeadUp':.045,'authoring':'MCP native bmesh cuts on copied evaluated data. Original source objects remain unchanged.','status':'Two open boundary loops prepared for GUI Bridge Edge Loops'}
report_path.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
