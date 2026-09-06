"""Fit each retained eye lens to the current head without collapsing its thickness."""
import bpy
import json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-r06' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
checkpoint = root/'charizard-whole-r06-before-eye-fit.blend'
report_path = root/'eye-surface-fit.json'
assert not checkpoint.exists() and not report_path.exists()
head = bpy.data.objects['GEO-charizard-raw-head-r06']
graph = bpy.context.evaluated_depsgraph_get()
evaluated = head.evaluated_get(graph)
mesh = evaluated.to_mesh()
mesh.calc_loop_triangles()
head_tree = BVHTree.FromPolygons([v.co.copy() for v in mesh.vertices], [list(t.vertices) for t in mesh.loop_triangles], all_triangles=True, epsilon=0.0000005)
evaluated.to_mesh_clear()
prepared = []
for sign in [-1, 1]:
    eye = bpy.data.objects[f'GEO-charizard-eye-{sign}-whole-r06']
    assert eye.data.users == 1 and eye.data.shape_keys is None
    into_head = head.matrix_world.inverted() @ eye.matrix_world
    into_eye = into_head.inverted()
    vertices = [into_head @ v.co for v in eye.data.vertices]
    eye.data.calc_loop_triangles()
    tree = BVHTree.FromPolygons(vertices, [list(t.vertices) for t in eye.data.loop_triangles], all_triangles=True, epsilon=0.0000005)
    targets = []
    misses = []
    rim_samples = 0
    center_y = sum(v.y for v in vertices)/len(vertices)
    center_z = sum(v.z for v in vertices)/len(vertices)
    for index, point in enumerate(vertices):
        origin = Vector((sign*.5, point.y, point.z))
        direction = Vector((-sign, 0, 0))
        skin, *_ = head_tree.ray_cast(origin, direction)
        front, *_ = tree.ray_cast(origin, direction)
        if front is None:
            inset = Vector((origin.x, center_y+(origin.y-center_y)*.9999, center_z+(origin.z-center_z)*.9999))
            front, *_ = tree.ray_cast(inset, direction)
            rim_samples += 1
        if skin is None or front is None:
            misses.append(index)
            continue
        target = point.copy()
        target.x = skin.x + sign*.0008 + point.x-front.x
        targets.append(into_eye @ target)
    assert not misses, f'Eye {sign} has {len(misses)} unmatched rays; source remains unchanged'
    prepared.append((eye, targets, rim_samples))
bpy.data.libraries.write(str(checkpoint), {scene}, fake_user=True, compress=True)
reports = []
for eye, targets, rim_samples in prepared:
    basis = eye.shape_key_add(name='Basis', from_mix=False)
    fit = eye.shape_key_add(name='Fit_RawHead_r06', from_mix=False)
    distances = []
    for original, target, row in zip(basis.data, targets, fit.data):
        distances.append((original.co-target).length)
        row.co = target
    fit.value = 1
    reports.append({'object':eye.name,'vertices':len(targets),'maximumDisplacement':max(distances),'shapeKey':fit.name,'rimRaysInsetByFraction':.0001,'rimSamples':rim_samples})
bpy.context.view_layer.update()
report = {'authoring':'MCP native BVH ray queries and reversible Blender shape keys after GUI trial placement','outerSurfaceOffset':.0008,'method':'Move each eye column to the head surface while preserving its original front-to-back depth. Tangent rays use a bounded inset sample at the rim.','eyes':reports,'scope':'Static eye fit only. Eyelids, corneal material and gaze/blink deformation remain unfinished.'}
report_path.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
