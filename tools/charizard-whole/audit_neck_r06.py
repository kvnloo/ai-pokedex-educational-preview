from pathlib import Path
import hashlib, json
import numpy as np
import open3d as o3d
import trimesh

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
path = root / 'charizard-whole-r06-study.glb'
receipt = json.loads((root / 'export.json').read_text())
expected = {r['object']: r for r in receipt['meshes']}
sha = hashlib.sha256(path.read_bytes()).hexdigest()
recorded_sha = next(r['sha256'] for r in receipt['artifacts'] if r['path'] == str(path))
scene = trimesh.load(path, force='scene', process=False)
meshes, records = {}, {}
for node in scene.graph.nodes_geometry:
    transform, geometry = scene.graph[node]
    mesh = scene.geometry[geometry].copy()
    mesh.apply_transform(transform)
    mesh.vertices = mesh.vertices[:, [0, 2, 1]] * [1, -1, 1]
    meshes[node] = mesh
    records[node] = {'vertices': len(mesh.vertices), 'triangles': len(mesh.faces),
        'finite': bool(np.isfinite(mesh.vertices).all()),
        'validIndices': bool(((mesh.faces >= 0) & (mesh.faces < len(mesh.vertices))).all()),
        'countsMatchReceipt': len(mesh.vertices) == expected[node]['vertices'] and len(mesh.faces) == expected[node]['triangles']}
body_name = next(n for n in meshes if 'neck-bridge' in n)
body = meshes[body_name]
bounds = body.bounds.T
bounds_error = float(np.max(np.abs(bounds - np.asarray(expected[body_name]['bounds']))))
origin = np.array([-.085, -.77, .49])
frame = np.array([[-.8660254, .5, 0], [-.49446818, -.856444, .14834046], [.07417023, .12846661, .98893636]])
local_vertices = (body.vertices - origin) @ frame.T
triangles = local_vertices[body.faces]
low, high = np.array([-.2, -.40, -.21]), np.array([.2, -.02, -.125])
selected = np.flatnonzero((triangles.max(axis=1) >= low).all(axis=1) & (triangles.min(axis=1) <= high).all(axis=1))
used, inverse = np.unique(body.faces[selected], return_inverse=True)
local = o3d.geometry.TriangleMesh(o3d.utility.Vector3dVector(local_vertices[used]), o3d.utility.Vector3iVector(inverse.reshape(-1, 3)))
pairs = selected[np.asarray(local.get_self_intersecting_triangles(), dtype=np.int64).reshape(-1, 2)]
def strict_hits(a, b):
    hits = []
    for i in range(3):
        start, end = a[i], a[(i + 1) % 3]
        matrix = np.column_stack([b[1] - b[0], b[2] - b[0], start - end])
        if abs(np.linalg.det(matrix)) < 1e-22:
            continue
        u, v, t = np.linalg.solve(matrix, start - b[0])
        if min(u, v, 1-u-v, t, 1-t) > 1e-7:
            hits.append(start + t * (end-start))
    return hits
pair_records = []
for pair in pairs:
    a, b = triangles[pair]
    points = strict_hits(a, b) + strict_hits(b, a)
    inside = [p for p in points if (p >= low).all() and (p <= high).all()]
    pair_records.append({'exportTriangleIds': pair.tolist(), 'exportVertexIds': body.faces[pair].tolist(),
        'strictInteriorHits': len(points), 'strictInteriorHitsInsideROI': len(inside),
        'localStrictHitPoints': [p.tolist() for p in points]})
result = {'source': str(path), 'sha256': sha, 'shaMatchesExportReceipt': sha == recorded_sha,
    'meshCount': len(meshes), 'meshes': records, 'totalTriangles': sum(len(m.faces) for m in meshes.values()),
    'bodyBoundsBlenderPerAxis': bounds.tolist(), 'bodyBoundsMaximumError': bounds_error,
    'bodyBoundsMatchReceiptExactly': bounds_error == 0,
    'neckROI': {'axes': ['side', 'forward', 'up'], 'low': low.tolist(), 'high': high.tolist(),
        'trianglesTested': len(selected), 'verticesTested': len(used), 'detectorPairs': len(pairs),
        'strictConfirmedPairs': sum(r['strictInteriorHits'] > 0 for r in pair_records),
        'strictConfirmedPairsWithHitsInsideROI': sum(r['strictInteriorHitsInsideROI'] > 0 for r in pair_records),
        'pairs': pair_records},
    'method': 'Conservative triangle-AABB overlap selects the neck ROI. Open3D detects nonadjacent triangle candidates; independent float64 edge-triangle solves confirm proper interior crossings with barycentric/edge margin 1e-7.',
    'scope': 'Neck ROI only. Shared-vertex triangle overlaps, adjacent folds, coplanar contact and whole-body self-intersection freedom are not certified. No separate eye/flame contact test.'}
print(json.dumps(result, indent=2))
assert sha == recorded_sha and len(meshes) == 4
assert result['totalTriangles'] == 296720 and len(body.vertices) == 137700
assert all(r['finite'] and r['validIndices'] and r['countsMatchReceipt'] for r in records.values())
assert bounds_error < 1e-6
