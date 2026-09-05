"""Apply one bounded native Blender smoothing pass after selection review."""
import bpy
import json
import numpy as np
from pathlib import Path

out = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02b')
assert not (out / 'smoothing-receipt.json').exists()
scene = bpy.data.scenes['EDIT-charizard-tail-r02b']
bpy.context.window.scene = scene
obj = bpy.data.objects['GEO-charizard-body-tail-r02b']
data = np.load(out / 'region.npz')
before, weights = data['before'], data['weights']
assert np.array_equal(before, np.asarray([v.co[:] for v in obj.data.vertices], dtype=np.float32))
modifier = obj.modifiers.new('Tail-root-surface-refinement', 'LAPLACIANSMOOTH')
modifier.vertex_group = 'Tail-root-refinement'
modifier.iterations = 6
modifier.lambda_factor = .35
modifier.lambda_border = .35
modifier.use_normalized = True
modifier.use_volume_preserve = False
modifier.use_x = modifier.use_y = modifier.use_z = True
bpy.context.view_layer.objects.active = obj
for item in scene.objects:
    item.select_set(item == obj)
bpy.context.view_layer.update()
evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
mesh = evaluated.to_mesh()
after = np.asarray([v.co[:] for v in mesh.vertices], dtype=np.float32)
evaluated.to_mesh_clear()
assert np.isfinite(after).all()
assert np.array_equal(after[weights == 0], before[weights == 0]), 'Native modifier changed protected coordinates'
displacement = np.linalg.norm(after - before, axis=1)
assert displacement.max() < .025, float(displacement.max())
bpy.ops.object.modifier_apply(modifier=modifier.name)
faces = np.asarray([i for p in obj.data.polygons for i in p.vertices], dtype=np.int32)
assert np.array_equal(faces, data['source_faces'])
after = np.asarray([v.co[:] for v in obj.data.vertices], dtype=np.float32)
np.savez_compressed(out / 'vertex-audit.npz', before=before, after=after, weights=weights, source_face_vertex_indices=data['source_faces'], target_face_vertex_indices=faces)
report = {'parent': 'charizard-tail-r02a', 'candidate': 'charizard-tail-r02b', 'method': 'Blender Laplacian Smooth', 'iterations': 6, 'lambda': .35, 'normalized': True, 'volumePreservation': False, 'changedVertices': int(np.any(before != after, axis=1).sum()), 'protectedVertices': int((weights == 0).sum()), 'protectedCoordinatesExact': True, 'faceVertexSequenceExact': True, 'maximumDisplacement': float(displacement.max()), 'medianSelectedDisplacement': float(np.median(displacement[weights > 0])), 'status': 'awaiting visual and exported geometry checks'}
(out / 'smoothing-receipt.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
