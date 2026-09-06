"""Author closed lid bands around the B eye apertures; preserve the head mesh."""
import bpy
import bmesh
import json
import math
from mathutils import Vector
from pathlib import Path

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-head-home-r07' and bpy.context.mode == 'OBJECT'
head = bpy.data.objects['GEO-charizard-home-head-r07']
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
assert not (root/'home-eye-fit-b.blend').exists()
bpy.data.libraries.write(str(root/'home-eye-fit-b.blend'), {scene}, fake_user=True, compress=True)
collection = bpy.data.collections.new('FIT-home-lids-r07')
scene.collection.children.link(collection)
rows = []
count = 128

def contour(angle, spread):
    t = (1 - math.cos(angle)) * .5
    amplitude = math.sin(math.pi * t)
    upper = angle < math.pi
    y = .075 - .1 * t + math.cos(angle) * spread
    z = .059 + .023 * t + amplitude * (.01008 if upper else -.02592)
    z += math.sin(angle) * spread
    return y, z

for sign in (-1, 1):
    vertices, faces = [], []
    for spread, offset in [(-.001, .0017), (.001, .004), (.0045, -.001), (.0045, -.004)]:
        for i in range(count):
            y, z = contour(2 * math.pi * i / count, spread)
            hit, co, normal, index = head.ray_cast(Vector((sign * .5, y, z)), Vector((-sign, 0, 0)))
            assert hit
            vertices.append((co.x + sign * offset, y, z))
    for ring in range(4):
        for i in range(count):
            j = (i + 1) % count
            next_ring = (ring + 1) % 4
            faces.append((ring * count + i, ring * count + j, next_ring * count + j, next_ring * count + i))
    mesh = bpy.data.meshes.new(f'GEO-home-lid-{sign}-r07')
    mesh.from_pydata(vertices, [], faces)
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    assert all(edge.is_manifold for edge in bm.edges)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(mesh.name, mesh)
    collection.objects.link(obj)
    obj.matrix_world = head.matrix_world.copy()
    mesh.materials.append(head.data.materials[0])
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    obj['status'] = 'Closed fitted lid band; embedded in head, not yet welded or deformation-tested'
    rows.append({'object': obj.name, 'vertices': len(mesh.vertices), 'polygons': len(mesh.polygons)})
(root/'lid-fit-a.json').write_text(json.dumps({'objects': rows, 'innerOverlap': .001, 'outerSpread': .0045, 'maximumLift': .004, 'backDepth': .004, 'status': 'Provisional eyelid geometry; eye globe and head union still required'}, indent=2)+'\n')
bpy.context.view_layer.update()
print(json.dumps(rows))
