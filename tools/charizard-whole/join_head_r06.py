"""Create a joined derivative while preserving the editable head and body sources."""
import bpy
import bmesh
import json
from pathlib import Path

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-r06' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
checkpoint = root/'charizard-whole-r06-before-neck-union.blend'
report_path = root/'neck-union.json'
name = 'GEO-charizard-body-joined-r06'
assert not checkpoint.exists() and not report_path.exists() and name not in bpy.data.objects
body = bpy.data.objects['GEO-charizard-body-whole-r06']
head = bpy.data.objects['GEO-charizard-raw-head-r06']
bpy.data.libraries.write(str(checkpoint), {scene}, fake_user=True, compress=True)
joined = body.copy()
joined.data = body.data.copy()
joined.name = name
scene.collection.objects.link(joined)
joined.hide_set(False)
joined.hide_render = False
for obj in scene.objects:
    obj.select_set(obj == joined)
bpy.context.view_layer.objects.active = joined
modifier = joined.modifiers.new('Neck union from editable head', 'BOOLEAN')
modifier.operation = 'UNION'
modifier.solver = 'EXACT'
modifier.object = head
bpy.ops.object.modifier_apply(modifier=modifier.name)
bm = bmesh.new()
bm.from_mesh(joined.data)
visited = set()
components = []
for seed in bm.verts:
    if seed in visited:
        continue
    pending = [seed]
    count = 0
    while pending:
        vertex = pending.pop()
        if vertex in visited:
            continue
        visited.add(vertex)
        count += 1
        pending.extend(edge.other_vert(vertex) for edge in vertex.link_edges)
    components.append(count)
report = {'object':joined.name,'vertices':len(bm.verts),'polygons':len(bm.faces),'boundaryEdges':sum(edge.is_boundary for edge in bm.edges),'nonmanifoldEdges':sum(not edge.is_manifold for edge in bm.edges),'connectedComponentVertexCounts':sorted(components,reverse=True),'authoring':'MCP native Exact Boolean union on an exclusive body copy. Editable source head and body preserved.','scope':'Assembly experiment. No self-intersection, deformation or fidelity acceptance implied.'}
bm.free()
assert report['boundaryEdges'] == report['nonmanifoldEdges'] == 0
assert len(components) == 1 and len(joined.data.vertices) > len(body.data.vertices)
for obj in [body, head]:
    obj.hide_set(True)
    obj.hide_render = True
bpy.context.view_layer.update()
report_path.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
