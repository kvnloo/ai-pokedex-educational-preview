"""Apply the visually positioned mouth cutter to an exclusive copy of the raw head."""
import bpy
import bmesh
import json
from pathlib import Path

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-r05' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r05')
checkpoint = root/'charizard-whole-r05-before-mouth-cut.blend'
report_path = root/'mouth-cut-result.json'
assert not checkpoint.exists() and not report_path.exists()
head = bpy.data.objects['GEO-charizard-raw-head-r05']
cutter = bpy.data.objects['CUT-charizard-mouth-r05']
assert head.data.users == 1 and len(head.data.vertices) == 9596
assert len(cutter.data.vertices) == 8
relative_transform = head.matrix_world.inverted() @ cutter.matrix_world
cutter_vertices = [list(relative_transform @ v.co) for v in cutter.data.vertices]
bpy.data.libraries.write(str(checkpoint), {scene}, fake_user=True, compress=True)
for obj in scene.objects:
    obj.select_set(obj == head)
bpy.context.view_layer.objects.active = head
modifier = head.modifiers.new('Mouth cavity from placed wedge', 'BOOLEAN')
modifier.operation = 'DIFFERENCE'
modifier.solver = 'EXACT'
modifier.object = cutter
bpy.ops.object.modifier_apply(modifier=modifier.name)
cutter.hide_set(True)
cutter.hide_render = True
for face in head.data.polygons:
    face.use_smooth = True
bm = bmesh.new()
bm.from_mesh(head.data)
topology = {'boundaryEdges': sum(e.is_boundary for e in bm.edges),
            'nonmanifoldEdges': sum(not e.is_manifold for e in bm.edges)}
bm.free()
report = {'checkpoint': str(checkpoint), 'authoring': 'GUI-positioned wedge, MCP native exact Boolean difference',
          'cutterHeadLocalVertices': cutter_vertices, 'vertices': len(head.data.vertices),
          'polygons': len(head.data.polygons), 'topology': topology,
          'scope': 'Real mouth incision in raw anatomical mesh. No final jaw, interior material, deformation or fidelity acceptance.'}
report_path.write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
