"""Recover the official-input Hunyuan head for focused jaw work; retain r03 body edits."""
import bpy
import bmesh
import hashlib
import json
from pathlib import Path
from mathutils import Matrix, Vector

assert bpy.context.scene.name == 'EDIT-charizard-whole-r04'
assert bpy.context.mode == 'OBJECT'
assert 'EDIT-charizard-whole-r05' not in bpy.data.scenes
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r05')
root.mkdir(exist_ok=True)
checkpoint = root / 'charizard-whole-r05-raw-head-start.blend'
report_path = root / 'raw-head-intake.json'
assert not checkpoint.exists() and not report_path.exists()
source = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/assets/experiments/charizard-official-raw/charizard-official-raw-61062-o256.glb')
assert hashlib.sha256(source.read_bytes()).hexdigest() == 'f9f0b2c3f2e189dcdd1c72190e8c79b7b958a2dd4f3bacb2d844ec37b330ed8e'
previous = bpy.context.scene
scene = bpy.data.scenes.new('EDIT-charizard-whole-r05')
bpy.context.window.scene = scene
for part in ['body', 'flame', 'eye-1', 'eye--1']:
    original = bpy.data.objects[f'GEO-charizard-{part}-whole-r04']
    obj = original.copy()
    obj.data = original.data.copy()
    obj.name = f'GEO-charizard-{part}-whole-r05'
    scene.collection.objects.link(obj)
    obj.hide_set(False)
    obj.hide_render = False
before = set(scene.objects)
bpy.ops.import_scene.gltf(filepath=str(source))
imported = set(scene.objects) - before
meshes = [obj for obj in imported if obj.type == 'MESH']
assert len(meshes) == 1
head = meshes[0]
head.name = 'GEO-charizard-raw-head-r05'
origin = Vector((-.085, -.77, .49))
side = Vector((-.8660254, .5, 0))
forward = Vector((-.49446818, -.856444, .14834046))
up = Vector((.07417023, .12846661, .98893636))
frame = Matrix((side, forward, up)).transposed().to_4x4()
frame.translation = origin
bm = bmesh.new()
bm.from_mesh(head.data)
bmesh.ops.transform(bm, matrix=head.matrix_world, verts=list(bm.verts))
cut_up = -.17
seed = min(bm.verts, key=lambda v: (v.co-(origin+forward*.12+up*.02)).length_squared)
connected = set()
pending = [seed]
while pending:
    vertex = pending.pop()
    if vertex in connected or (vertex.co-origin).dot(up) <= cut_up:
        continue
    connected.add(vertex)
    pending.extend(e.other_vert(vertex) for e in vertex.link_edges)
keep = connected | {v for vertex in connected for face in vertex.link_faces for v in face.verts}
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v not in keep], context='VERTS')
bmesh.ops.bisect_plane(bm, geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
                      dist=.0000001, plane_co=origin+up*cut_up, plane_no=up,
                      clear_inner=True, clear_outer=False)
boundary = [e for e in bm.edges if e.is_boundary]
assert boundary
assert all(abs((v.co-origin).dot(up)-cut_up) < .00001 for edge in boundary for v in edge.verts)
caps = bmesh.ops.holes_fill(bm, edges=boundary, sides=0)['faces']
assert len(caps) == 1
bmesh.ops.triangulate(bm, faces=caps)
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
assert all(e.is_manifold for e in bm.edges)
bmesh.ops.transform(bm, matrix=frame.inverted(), verts=list(bm.verts))
bm.to_mesh(head.data)
bm.free()
head.matrix_world = frame
for face in head.data.polygons:
    face.use_smooth = True
for obj in scene.objects:
    obj.select_set(obj == head)
bpy.context.view_layer.objects.active = head
camera = previous.camera.copy()
camera.data = previous.camera.data.copy()
camera.name = 'CAM-EDIT-charizard-whole-r05'
scene.collection.objects.link(camera)
scene.camera = camera
scene.world = previous.world.copy() if previous.world else bpy.data.worlds.new('WORLD-charizard-r05')
bpy.data.libraries.write(str(checkpoint), {scene}, fake_user=True, compress=True)
report = {'scene': scene.name, 'source': str(source), 'headVertices': len(head.data.vertices),
          'headPolygons': len(head.data.polygons), 'headCutUp': cut_up,
          'bodyCutUp': -.14, 'checkpoint': str(checkpoint),
          'authoring': 'MCP native import and topological head extraction; exact official-input baseline',
          'status': 'Focused raw-head starting point, no fidelity improvement or attachment claim',
          'limitations': ['Raw jaw remains heavy', 'Separate overlapping head and body', 'No oral cavity, rig, UV or PBR pass']}
report_path.write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
