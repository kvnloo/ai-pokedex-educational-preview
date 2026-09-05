"""Smooth local surface noise with an area-weighted quadratic normal fit."""
import bpy
import json
import numpy as np
from pathlib import Path
from mathutils import Vector, kdtree

suffix = globals().get('candidate_suffix', 'r02c')
normal_mode = globals().get('surface_normal_mode', 'mesh')
assert normal_mode in ['mesh', 'pca']
identifier = 'charizard-tail-' + suffix
out = Path(globals().get('candidate_directory', str(Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02') / suffix)))
assert not out.exists(), 'Preserve every completed candidate'
assert 'EDIT-' + identifier not in bpy.data.scenes
out.mkdir()
region_file = Path(globals().get('region_file_path', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02b/region.npz'))
region = np.load(region_file)
before, weights = region['before'], region['weights']
parent = bpy.data.scenes['EDIT-charizard-tail-r02a']
bpy.context.window.scene = parent
bpy.context.view_layer.update()
scene = bpy.data.scenes.new('EDIT-' + identifier)
for obj in parent.objects:
    if obj.type == 'MESH':
        copy = obj.copy()
        copy.data = obj.data.copy()
        copy.parent = None
        copy.matrix_world = obj.matrix_world.copy()
        copy.name = 'GEO-charizard-body-tail-' + suffix if len(copy.data.vertices) > 10000 else 'GEO-charizard-flame-reference-' + suffix
        scene.collection.objects.link(copy)
bpy.context.window.scene = scene
obj = bpy.data.objects['GEO-charizard-body-tail-' + suffix]
assert np.array_equal(before, np.asarray([v.co[:] for v in obj.data.vertices], dtype=np.float32))
radius, sigma = .05, .03
passes = []
for iteration in range(3):
    obj.data.update()
    points = np.asarray([v.co[:] for v in obj.data.vertices], dtype=np.float64)
    normals = np.asarray([v.normal[:] for v in obj.data.vertices], dtype=np.float64)
    areas = np.zeros(len(points))
    for face in obj.data.polygons:
        areas[list(face.vertices)] += face.area / len(face.vertices)
    tree = kdtree.KDTree(len(points))
    for index, point in enumerate(points):
        tree.insert(Vector(point), index)
    tree.balance()
    after = points.copy()
    skipped = clipped = 0
    for index in np.flatnonzero(weights > 0):
        n = normals[index].copy()
        n /= np.linalg.norm(n)
        neighbors = np.asarray([item[1] for item in tree.find_range(Vector(points[index]), radius)], dtype=np.int32)
        if normal_mode == 'mesh':
            neighbors = neighbors[(normals[neighbors] @ n) > .6]
        if len(neighbors) < 20:
            skipped += 1
            continue
        delta = points[neighbors] - points[index]
        mass = np.exp(-np.sum(delta*delta, axis=1) / (2*sigma*sigma)) * areas[neighbors]
        if normal_mode == 'pca':
            mean = np.average(delta, axis=0, weights=mass)
            centered = delta - mean
            covariance = (centered.T * mass) @ centered / mass.sum()
            _, vectors = np.linalg.eigh(covariance)
            fit_normal = vectors[:, 0]
            n = fit_normal if np.dot(fit_normal, n) >= 0 else -fit_normal
        axis = np.eye(3)[np.abs(n).argmin()]
        u = np.cross(n, axis)
        u /= np.linalg.norm(u)
        v = np.cross(n, u)
        x, y, z = delta @ u / sigma, delta @ v / sigma, delta @ n
        fit = np.column_stack([np.ones(len(x)), x, y, x*x, x*y, y*y])
        kernel = np.sqrt(mass)
        coefficients, _, rank, _ = np.linalg.lstsq(fit * kernel[:, None], z * kernel, rcond=None)
        if rank < 6:
            skipped += 1
            continue
        distance = coefficients[0]
        clipped += abs(distance) > .008
        after[index] += n * np.clip(distance, -.008, .008) * weights[index]
    obj.data.vertices.foreach_set('co', after.ravel())
    obj.data.update()
    displacement = np.linalg.norm(after - points, axis=1)
    passes.append({'pass': iteration + 1, 'skippedFits': skipped, 'clippedFits': int(clipped), 'maximumStep': float(displacement.max())})

after = np.asarray([v.co[:] for v in obj.data.vertices], dtype=np.float32)
faces = np.asarray([i for p in obj.data.polygons for i in p.vertices], dtype=np.int32)
assert np.isfinite(after).all()
assert np.array_equal(before[weights == 0], after[weights == 0])
assert np.array_equal(faces, region['source_faces'])
displacement = np.linalg.norm(after - before, axis=1)
assert displacement.max() < .025
np.savez_compressed(out / 'vertex-audit.npz', before=before, after=after, weights=weights, source_face_vertex_indices=region['source_faces'], target_face_vertex_indices=faces)
report = {'parent': 'charizard-tail-r02a', 'candidate': identifier, 'method': 'Area-weighted quadratic moving least squares; normal-only displacement', 'normalMode': normal_mode, 'radius': radius, 'sigma': sigma, 'passes': passes, 'changedVertices': int(np.any(before != after, axis=1).sum()), 'protectedVertices': int((weights == 0).sum()), 'protectedCoordinatesExact': True, 'faceVertexSequenceExact': True, 'maximumDisplacement': float(displacement.max()), 'medianSelectedDisplacement': float(np.median(displacement[weights > 0])), 'regionSource': str(region_file), 'status': 'awaiting visual and exported geometry checks'}
(out / 'smoothing-receipt.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
