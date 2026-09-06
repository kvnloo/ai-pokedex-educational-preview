"""Fit provisional closed eye patches to the HOME brow for proportion review."""
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
study = globals().get('eye_study', 'a')
assert study in ('a', 'b')
assert not (root/f'eye-fit-{study}.json').exists()
active_keys = {k.name:k.value for k in head.data.shape_keys.key_blocks if k.name != 'Basis' and k.value}
expected_key = 'Shape_MuzzlePlanes_r07' if study == 'a' else 'Smooth_AlignedJaw_r07'
assert active_keys == {expected_key:1.0}, active_keys
other = bpy.data.collections.get('FIT-home-eyes-r07-b' if study == 'a' else 'FIT-home-eyes-r07')
assert other is None or (other.hide_render and other.hide_viewport), 'Hide the other eye study before fitting'
suffix = '' if study == 'a' else '-b'
parameters = {'a': (.100, -.020, .021, .032, .27, .15, .065),
              'b': (.075, -.025, .023, .036, .32, .10, .047)}[study]
front_y, rear_y, rise, height, iris_t, iris_width, pupil_width = parameters
collection_name = 'FIT-home-eyes-r07' + suffix
assert collection_name not in bpy.data.collections
collection = bpy.data.collections.new(collection_name)
scene.collection.children.link(collection)

def material(name, color, roughness):
    mat = bpy.data.materials.new(name + suffix)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    node = mat.node_tree.nodes['Principled BSDF']
    node.inputs['Base Color'].default_value = (*color, 1)
    node.inputs['Roughness'].default_value = roughness
    node.inputs['Metallic'].default_value = 0
    return mat

white = material('MAT-home-eye_sclera-r07', (.84, .88, .84), .24)
iris = material('MAT-home-eye_iris-r07', (.015, .25, .32), .24)
pupil = material('MAT-home-eye_pupil-r07', (.003, .006, .008), .22)
clay = material('MAT-home-head_clay-r07', (.63, .65, .68), .65)
head.data.materials.clear()
head.data.materials.append(clay)
rows = []

def surface(sign, y, z, offset):
    hit, location, normal, face = head.ray_cast(Vector((sign * .5, y, z)), Vector((-sign, 0, 0)))
    assert hit, (sign, y, z)
    return Vector((location.x + sign * offset, y, z))

for sign in (-1, 1):
    vertices, faces, coordinates = [], [], []
    width_steps, height_steps = 64, 20
    for i in range(width_steps + 1):
        t = i / width_steps
        y = front_y + (rear_y - front_y) * t
        center_z = .059 + rise * t
        amplitude = math.sin(math.pi * t)
        for j in range(height_steps + 1):
            v = j / height_steps
            lower = .023 if study == 'a' else height * .72
            z = center_z + amplitude * (-lower + v * height)
            bulge = .001 + .006 * amplitude * math.sin(math.pi * v)
            vertices.append(surface(sign, y, z, bulge))
            coordinates.append((t, v))
    for i in range(width_steps):
        for j in range(height_steps):
            a = i * (height_steps + 1) + j
            faces.append((a, a + height_steps + 1, a + height_steps + 2, a + 1))
    mesh = bpy.data.meshes.new(f'GEO-home-eye-{sign}-r07{suffix}')
    mesh.from_pydata(vertices, [], faces)
    obj = bpy.data.objects.new(mesh.name, mesh)
    collection.objects.link(obj)
    obj.matrix_world = head.matrix_world.copy()
    for mat in (white, iris, pupil):
        mesh.materials.append(mat)
    for polygon in mesh.polygons:
        t = sum(coordinates[i][0] for i in polygon.vertices) / 4
        v = sum(coordinates[i][1] for i in polygon.vertices) / 4
        iris_distance = ((t - iris_t) / iris_width) ** 2 + ((v - .53) / .72) ** 2
        pupil_distance = ((t - iris_t) / pupil_width) ** 2 + ((v - .53) / .66) ** 2
        polygon.material_index = 2 if pupil_distance < 1 else 1 if iris_distance < 1 else 0
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-7)
    boundary = [edge for edge in bm.edges if edge.is_boundary]
    extrusion = bmesh.ops.extrude_edge_only(bm, edges=boundary)
    back = [element for element in extrusion['geom'] if isinstance(element, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=back, vec=Vector((-sign * .008, 0, 0)))
    bmesh.ops.holes_fill(bm, edges=[edge for edge in bm.edges if edge.is_boundary], sides=0)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    assert all(edge.is_manifold for edge in bm.edges)
    bm.to_mesh(mesh)
    bm.free()
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    obj['status'] = 'Eye fit study; embedded closed patch, not final eyeball, socket topology or rig'
    rows.append({'object': obj.name, 'vertices': len(mesh.vertices), 'polygons': len(mesh.polygons)})

scene.display.shading.color_type = 'MATERIAL'
(root/f'eye-fit-{study}.json').write_text(json.dumps({'objects': rows, 'activeHeadKeys':active_keys, 'eyeFrontYZ': [front_y, .059], 'eyeRearYZ': [rear_y, .059 + rise], 'maxOpeningHeight': height, 'maxBulge': .007, 'status': 'Provisional proportion study; no final topology or eye-motion acceptance'}, indent=2)+'\n')
bpy.context.view_layer.update()
print(json.dumps(rows))
