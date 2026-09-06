"""Measure native CUA jaw strokes and render matched review cameras; no form edits."""
import bpy
import bmesh
import json
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r10')
label = globals().get('review_label', 'jaw')
assert label in {'jaw', 'jaw-smooth'}
scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-components-r10'
assert not (root / ('charizard-components-r10-' + label + '-trial.blend')).exists()
if bpy.context.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
head = scene.objects['GEO-charizard-head-neck-r10']
before = json.loads((root / 'head-before-native.json').read_text())['positions']
assert len(before) == len(head.data.vertices)
delta = [(v.co - Vector(p)).length for v, p in zip(head.data.vertices, before)]
ring_delta = max(d for d, p in zip(delta, before) if abs(p[2] - .1) < 1e-6)
assert ring_delta == 0
bm = bmesh.new()
bm.from_mesh(head.data)
assert sum(e.is_boundary for e in bm.edges) == 342
assert all(e.is_manifold or e.is_boundary for e in bm.edges)
assert all(f.calc_area() > 1e-14 for f in bm.faces)
bm.free()
report = {
    'method': 'Two native GUI Grab strokes in right orthographic view; X symmetry enabled',
    'strokes': [
        {'brushSizePx': 300, 'strength': .4, 'start': [489, 374], 'end': [500, 341]},
        {'brushSizePx': 300, 'strength': 1, 'start': [490, 374], 'end': [502, 333]},
    ],
    'changedVertices': sum(d > 1e-7 for d in delta),
    'maxDisplacement': max(delta),
    'neckJoinMaxDisplacement': ring_delta,
    'upperHeadZOver055MaxDisplacement': max(d for d, p in zip(delta, before) if p[2] > .55),
    'intentionalBoundaryEdges': 342,
    'otherNonManifoldEdges': 0,
    'zeroAreaFaces': 0,
    'visualReview': 'pending',
    'productionAccepted': False,
    'followup': globals().get('native_followup', None),
}
(root / ('native-' + label + '-measurement.json')).write_text(json.dumps(report, indent=2) + '\n')
bpy.ops.wm.save_as_mainfile(filepath=str(root / ('charizard-components-r10-' + label + '-trial.blend')))

# Bring in the frozen head data for a camera-identical comparison, without editing it.
with bpy.data.libraries.load(str(root / 'charizard-components-r10-intake.blend'), link=False) as (available, loaded):
    loaded.meshes = [head.data.name]
baseline = bpy.data.objects.new('REVIEW-head-intake-r10', loaded.meshes[0])
scene.collection.objects.link(baseline)
baseline.matrix_world = head.matrix_world.copy()
baseline.hide_render = True
body = scene.objects['GEO-charizard-body-remainder-r10']
center = Vector((-.03, -.585, .43))
review_cameras = []
for view in ('front', 'side', 'threequarter'):
    source = scene.objects['CAM-r10-' + view]
    camera = source.copy()
    camera.data = source.data.copy()
    camera.name = 'CAM-r10-head-' + view
    scene.collection.objects.link(camera)
    offset = source.location - Vector((0, 0, -.015))
    camera.location = center + offset
    camera.rotation_euler = (center - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.ortho_scale = .8
    review_cameras.append(camera)
    scene.camera = camera
    body.hide_render = True
    for variant in ('intake', label):
        head.hide_render = variant == 'intake'
        baseline.hide_render = variant != 'intake'
        scene.render.filepath = str(root / ('head-' + variant + '-' + view + '.png'))
        bpy.ops.render.render(write_still=True)
head.hide_render = False
baseline.hide_render = True
body.hide_render = False
for view in ('front', 'side', 'rear', 'threequarter'):
    scene.camera = scene.objects['CAM-r10-' + view]
    scene.render.filepath = str(root / (label + '-whole-' + view + '.png'))
    bpy.ops.render.render(write_still=True)
baseline_mesh = baseline.data
bpy.data.objects.remove(baseline, do_unlink=True)
bpy.data.meshes.remove(baseline_mesh)
for camera in review_cameras:
    data = camera.data
    bpy.data.objects.remove(camera, do_unlink=True)
    bpy.data.cameras.remove(data)
print(json.dumps(report))
