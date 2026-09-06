"""Mechanical separation only: preserve the sculpt, remove baked fire, add a socket."""
import bpy
import bmesh
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r09')
scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-home-r09'
body = scene.objects['GEO-charizard-home-whole-r09']
assert tuple(body.users_scene) == (scene,)
assert body.data.users == 1 and body.mode == 'OBJECT'
assert len(body.data.materials) == 0, 'Cap material inheritance needs review for textured inputs'
assert 'FlameSocket' not in scene.objects
assert len(body.data.vertices) == 364846

bm = bmesh.new()
bm.from_mesh(body.data)
before = {'vertices': len(bm.verts), 'faces': len(bm.faces),
          'nonmanifold_edges': sum(not e.is_manifold for e in bm.edges)}

def in_flame_region(v):
    return v.co.x > .65 and v.co.y > .15

# The inspected crossing bounds enclose only the narrow tail/flame junction.
roi = {v for v in bm.verts if in_flame_region(v)}
geom = list(roi)
geom += [e for e in bm.edges if all(v in roi for v in e.verts)]
geom += [f for f in bm.faces if all(v in roi for v in f.verts)]
bmesh.ops.bisect_plane(bm, geom=geom, dist=1e-7,
                      plane_co=(0, 0, -.405), plane_no=(0, 0, 1))

archive = bm.copy()
bmesh.ops.delete(archive,
    geom=[v for v in archive.verts if not (in_flame_region(v) and v.co.z >= -.405 - 1e-6)],
    context='VERTS')
archive_mesh = bpy.data.meshes.new('MESH-excluded-baked-flame-r09')
archive.to_mesh(archive_mesh)
archive.free()
archive_obj = bpy.data.objects.new('REFERENCE-baked-flame-excluded-r09', archive_mesh)
archive_collection = bpy.data.collections.new('EXCLUDED-baked-fire-reference-r09')
scene.collection.children.link(archive_collection)
archive_collection.objects.link(archive_obj)
archive_collection.hide_render = True
archive_collection.hide_viewport = True
archive_obj['runtimeExport'] = False
archive_obj['reason'] = 'Historical Hunyuan fire volume; runtime flame must be VFX.'

bmesh.ops.delete(bm,
    geom=[v for v in bm.verts if in_flame_region(v) and v.co.z > -.405 + 1e-6],
    context='VERTS')
rim = [e for e in bm.edges if e.is_boundary and
       all(in_flame_region(v) and abs(v.co.z + .405) < 1e-5 for v in e.verts)]
assert len(rim) > 30, len(rim)
rim_verts = {v for e in rim for v in e.verts}
assert all(sum(e in rim for e in v.link_edges) == 2 for v in rim_verts)
center = sum((v.co for v in rim_verts), Vector()) / len(rim_verts)
cap = bmesh.ops.holes_fill(bm, edges=rim, sides=0)['faces']
assert len(cap) == 1
bmesh.ops.triangulate(bm, faces=cap)
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
after = {'vertices': len(bm.verts), 'faces': len(bm.faces),
         'nonmanifold_edges': sum(not e.is_manifold for e in bm.edges)}
assert after['nonmanifold_edges'] <= before['nonmanifold_edges']
bm.to_mesh(body.data)
bm.free()
body.data.update()
body.data.calc_loop_triangles()
after['triangles'] = len(body.data.loop_triangles)

socket = bpy.data.objects.new('FlameSocket', None)
scene.collection.objects.link(socket)
socket.parent = body
socket.location = center
socket.empty_display_type = 'ARROWS'
socket.empty_display_size = .045
socket['effect'] = 'charizard-tail-flame'
socket['energyBaked'] = False
body['energyBaked'] = False
body['assetStage'] = 'native-form-study-unapproved'
receipt = {'before': before, 'after': after, 'cut_z': -.405,
           'socket': list(center), 'cap_boundary_edges': len(rim),
           'socket_rotation_euler': list(socket.rotation_euler),
           'materialCount': len(body.data.materials), 'uvLayerCount': len(body.data.uv_layers),
           'excluded_reference': archive_obj.name,
           'runtime_flame': 'pending VFX; no baked fire in physical export'}
(ROOT / 'flame-separation.json').write_text(json.dumps(receipt, indent=2) + '\n')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'charizard-home-native-r09.blend'))
print(json.dumps(receipt))
