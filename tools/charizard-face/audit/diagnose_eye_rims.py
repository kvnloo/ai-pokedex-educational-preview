"""Read-only, local r09 eye-rim and eye/socket diagnosis; no acceptance verdict."""
import collections
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
import open3d as o3d
import trimesh


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/audit')
ROOT = OUT.parent
R09 = ROOT / 'head-r09'
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'charizard-anatomy/root_audit'))
from inspect_intersection_pairs import edge_hits


def load_meshes(path):
    scene = trimesh.load(path, force='scene', process=False)
    result = {}
    for node in scene.graph.nodes_geometry:
        transform, geometry = scene.graph[node]
        mesh = scene.geometry[geometry].copy()
        mesh.apply_transform(transform)
        mesh.vertices = mesh.vertices[:, [0, 2, 1]] * [1, -1, 1]
        result[node] = mesh
    return result


def polygon_contains(points, polygon):
    result = np.zeros(len(points), bool)
    for a, b in zip(polygon, np.roll(polygon, -1, axis=0)):
        crossing = (a[1] > points[:, 1]) != (b[1] > points[:, 1])
        if a[1] != b[1]:
            x = (b[0] - a[0]) * (points[:, 1] - a[1]) / (b[1] - a[1]) + a[0]
            result ^= crossing & (points[:, 0] < x)
    return result


def angular_record(polygon, center):
    delta = np.roll(np.arctan2(polygon[:, 1] - center[1], polygon[:, 0] - center[0]), -1) - np.arctan2(polygon[:, 1] - center[1], polygon[:, 0] - center[0])
    delta = (delta + np.pi) % (2 * np.pi) - np.pi
    sign = np.sign(delta.sum())
    return {'winding': float(delta.sum() / (2 * np.pi)), 'backtrackingSteps': int((delta * sign < -1e-8).sum()),
            'minimumForwardStepDegrees': float(np.degrees(delta * sign).min()),
            'maximumForwardStepDegrees': float(np.degrees(delta * sign).max())}


def local_pairs(body, eye, lower, upper, band_by_face):
    triangle = body.triangles
    selected = np.flatnonzero((triangle.max(axis=1) >= lower).all(axis=1) & (triangle.min(axis=1) <= upper).all(axis=1))
    used, inverse = np.unique(body.faces[selected], return_inverse=True)
    points = np.vstack([body.vertices[used], eye.vertices])
    triangles = np.vstack([inverse.reshape(-1, 3), eye.faces + len(used)])
    local = o3d.geometry.TriangleMesh(o3d.utility.Vector3dVector(points), o3d.utility.Vector3iVector(triangles))
    pairs = np.asarray(local.get_self_intersecting_triangles(), dtype=np.int64).reshape(-1, 2)
    records = []
    for first, second in pairs:
        types, ids, positions = [], [], []
        for index in [first, second]:
            if index < len(selected):
                types.append('body')
                ids.append(int(selected[index]))
                positions.append(body.triangles[selected[index]])
            else:
                types.append('eye')
                ids.append(int(index - len(selected)))
                positions.append(eye.triangles[index - len(selected)])
        hit1, hit2 = edge_hits(*positions), edge_hits(*positions[::-1])
        strict = any(hit['strictInterior'] for hit in hit1 + hit2)
        all_points = np.array(positions).reshape(-1, 3)
        records.append({'kinds': types, 'exportTriangleIds': ids, 'strictInteriorCrossingConfirmed': strict,
                        'strictInteriorHitCount': sum(hit['strictInterior'] for hit in hit1 + hit2),
                        'bodyBands': [int(band_by_face.get(i, -1)) if kind == 'body' else None for kind, i in zip(types, ids)],
                        'bounds': [all_points.min(axis=0).tolist(), all_points.max(axis=0).tolist()],
                        'meanTriangleVertexPosition': all_points.mean(axis=0).tolist()})
    counts = {}
    for kind in [('body', 'body'), ('body', 'eye'), ('eye', 'eye')]:
        same = [r for r in records if tuple(r['kinds']) == kind]
        counts['-'.join(kind)] = {'detectedPairs': len(same), 'strictConfirmedPairs': sum(r['strictInteriorCrossingConfirmed'] for r in same)}
    return {'bodyTrianglesTested': len(selected), 'eyeTrianglesTested': len(eye.faces), 'counts': counts, 'pairs': records}


def main():
    path = R09 / 'charizard-head-r09.glb'
    meshes = load_meshes(path)
    body = meshes[next(name for name in meshes if 'body' in name)]
    audit = np.load(R09 / 'eye-audit.npz')
    receipt = json.loads((R09 / 'eye-receipt.json').read_text())
    camera = json.loads((R09 / 'face-cameras.json').read_text())
    origin, frame = np.asarray(camera['origin']), np.asarray(camera['frame'])
    assert np.array_equal(body.vertices, audit['after']), 'Body export rows must exactly match audit.after'
    parent = audit['parent_vertex_ids']
    parent_to_new = np.full(len(audit['before']), -1, dtype=np.int64)
    parent_to_new[parent[parent >= 0]] = np.flatnonzero(parent >= 0)
    edges = body.edges_unique
    adjacency = [[] for _ in range(len(body.vertices))]
    for a, b in edges:
        adjacency[a].append(int(b))
        adjacency[b].append(int(a))
    body_local = (body.vertices - origin) @ frame.T
    body_cross = np.cross(body.triangles[:, 1] - body.triangles[:, 0], body.triangles[:, 2] - body.triangles[:, 0])
    body_normals = body_cross / np.linalg.norm(body_cross, axis=1)[:, None]
    raycaster = o3d.t.geometry.RaycastingScene()
    raycaster.add_triangles(o3d.core.Tensor(body.vertices.astype(np.float32)), o3d.core.Tensor(body.faces.astype(np.uint32)))
    report = {'source': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
              'identityConvention': 'Actual exported r09 body vertex rows equal eye-audit.npz after rows. Face IDs are exported triangle rows, never native Blender polygon IDs. Eye vertex/triangle IDs belong to the named eye mesh.',
              'frame': {'origin': origin.tolist(), 'rows_lateral_forward_up': frame.tolist()}, 'eyes': []}
    archive = {}
    for definition in receipt['eyes']:
        side = int(definition['side'])
        name = f'GEO-charizard-eye-{side}-r09'
        eye = meshes[name]
        root = parent_to_new[np.array(definition['boundaryParentRows'])]
        assert (root >= 0).all()
        permitted = parent < 0
        permitted[root] = True
        levels = np.full(len(body.vertices), -1, dtype=np.int64)
        levels[root] = 0
        queue = collections.deque(map(int, root))
        while queue:
            vertex = queue.popleft()
            for neighbor in adjacency[vertex]:
                if permitted[neighbor] and levels[neighbor] < 0:
                    levels[neighbor] = levels[vertex] + 1
                    queue.append(neighbor)
        new_side = (levels > 0)
        generated_faces = np.flatnonzero(new_side[body.faces].any(axis=1))
        bands = levels[body.faces[generated_faces]].min(axis=1)
        band_by_face = dict(zip(map(int, generated_faces), map(int, bands)))
        facing = body_normals[generated_faces] @ (side * frame[0])
        band_records = []
        for band in sorted(set(map(int, bands))):
            ids = generated_faces[bands == band]
            dot = facing[bands == band]
            bad = ids[dot < 0]
            points = body.triangles[bad].reshape(-1, 3)
            band_records.append({'band': band, 'triangles': len(ids), 'projectionReversedTriangles': len(bad),
                                 'reversedExportTriangleIds': bad.tolist(), 'minimumOutwardViewNormalDot': float(dot.min()),
                                 'reversedBounds': [points.min(axis=0).tolist(), points.max(axis=0).tolist()] if len(points) else None})
        contour = np.asarray(definition['openingContour'])
        root_th = body_local[root, 1:]
        center_th = contour.mean(axis=0)
        root_step = np.linalg.norm(np.roll(root_th, -1, axis=0) - root_th, axis=1)
        contour_step = np.linalg.norm(np.roll(contour, -1, axis=0) - contour, axis=1)
        points = np.vstack([body.vertices[new_side], eye.vertices])
        lower, upper = points.min(axis=0) - .008, points.max(axis=0) + .008
        pairs = local_pairs(body, eye, lower, upper, band_by_face)
        queries = o3d.core.Tensor(eye.vertices.astype(np.float32))
        signed_distance = raycaster.compute_signed_distance(queries, nsamples=3).numpy()
        closest = raycaster.compute_closest_points(queries)
        closest_faces = closest['primitive_ids'].numpy()
        closest_bands = np.array([band_by_face.get(int(i), -1) for i in closest_faces])
        degree = np.bincount(eye.edges_unique.ravel(), minlength=len(eye.vertices))
        pole_ids = np.flatnonzero(degree > 12)
        eye_local = (eye.vertices - origin) @ frame.T
        pole_records = [{'eyeVertexId': int(i), 'valence': int(degree[i]), 'coordinate': eye.vertices[i].tolist(),
                         'sideSignedLateralDepth': float(side * eye_local[i, 0]), 'forwardUp': eye_local[i, 1:].tolist(),
                         'signedDistanceFromClosedBody': float(signed_distance[i]),
                         'nearestBodyExportFaceId': int(closest_faces[i]), 'nearestBodyBand': int(closest_bands[i])} for i in pole_ids]
        inside_ids = np.flatnonzero(signed_distance < -1e-6)
        result = {'side': side, 'eyeNode': name, 'rootVertices': len(root),
                  'ringLevelCounts': {str(i): int((levels == i).sum()) for i in range(int(levels.max()) + 1)},
                  'rimBands': band_records,
                  'projectedContour': {'outerRootAngularOrder': angular_record(root_th, center_th), 'openingAngularOrder': angular_record(contour, center_th),
                                       'openingSamplesOutsideProjectedRootPolygon': np.flatnonzero(~polygon_contains(contour, root_th)).tolist(),
                                       'rootEdgeLengthMinMedianMax': np.quantile(root_step, [0, .5, 1]).tolist(),
                                       'openingEdgeLengthMinMedianMax': np.quantile(contour_step, [0, .5, 1]).tolist()},
                  'localTestBounds': [lower.tolist(), upper.tolist()], 'localIntersections': pairs,
                  'eyeBodyDistanceSamples': {'eyeVertices': len(eye.vertices), 'insideBodyByMoreThan1eMinus6': len(inside_ids),
                                             'minimumSignedDistance': float(signed_distance.min()),
                                             'minimumAbsoluteVertexDistance': float(abs(signed_distance).min()),
                                             'maximumSignedDistance': float(signed_distance.max()),
                                             'insideNearestBodyBandCounts': {str(i): int((closest_bands[inside_ids] == i).sum()) for i in sorted(set(closest_bands[inside_ids]))},
                                             'highValenceEyePoles': pole_records}}
        report['eyes'].append(result)
        archive[f'side_{side}_body_ring_levels'] = levels
        archive[f'side_{side}_generated_body_export_face_ids'] = generated_faces
        archive[f'side_{side}_eye_signed_distance_to_body'] = signed_distance
        archive[f'side_{side}_eye_nearest_body_export_face_ids'] = closest_faces
        print(side, 'reversed', [(r['band'], r['projectionReversedTriangles']) for r in band_records], 'pairs', pairs['counts'], 'eye inside', len(inside_ids), flush=True)
    report['limits'] = ['Diagnosis only; r09 remains an intermediate with visually unacceptable rim wrinkles.', 'Projection reversals are relative to the outward eye-view direction; they locate folds/overhangs, not changes in topological winding.', 'Open3D pair detections are counted separately from independently confirmed strict edge/triangle crossings. Shared-vertex pairs can be omitted.', 'Signed distances sample eye vertices against the closed body. Near-zero values and signs close to folded surfaces have numerical limits; this is not a complete minimum-clearance certificate.', 'No geometry, target coordinates or Blender changes are authored.']
    (OUT / 'head-r09-eye-diagnosis.json').write_text(json.dumps(report, indent=2) + '\n')
    np.savez_compressed(OUT / 'head-r09-eye-diagnosis.npz', **archive)


if __name__ == '__main__':
    main()
