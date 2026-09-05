"""Diagnose r02c fold creation; never writes geometry or vertex targets."""
import json
from pathlib import Path

import numpy as np
import open3d as o3d
import trimesh
from scipy.spatial import cKDTree

from diagnose_ribs import distribution, loaded


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/audit-root-surface')
ROOT = OUT.parent


def face_metrics(vertices, faces):
    triangles = vertices[faces]
    cross = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
    twice_area = np.linalg.norm(cross, axis=1)
    normal = cross / np.maximum(twice_area[:, None], 1e-30)
    lengths = np.linalg.norm(triangles[:, [1, 2, 0]] - triangles, axis=2)
    altitude = twice_area / lengths.max(axis=1)
    return normal, twice_area / 2, altitude, lengths


def main():
    data = np.load(ROOT / 'r02c/vertex-audit.npz')
    before, after, weights = data['before'].astype(float), data['after'].astype(float), data['weights']
    meshes, stable_matches = {}, {}
    for label, points in [('r02a', before), ('r02c', after)]:
        exported = loaded(ROOT / label / f'charizard-tail-{label}.glb')
        distances, ids = cKDTree(points).query(exported.vertices, k=1)
        assert distances.max() == 0 and len(np.unique(ids)) == len(points)
        meshes[label] = trimesh.Trimesh(points, ids[exported.faces], process=False)
        stable_matches[label] = {'maximumCoordinateError': float(distances.max()), 'uniqueStableRows': len(np.unique(ids))}
    faces = meshes['r02a'].faces
    normals0, area0, height0, lengths0 = face_metrics(before, faces)
    normals1, area1, height1, lengths1 = face_metrics(after, faces)
    dot = np.einsum('ij,ij->i', normals0, normals1)
    flipped = dot < 0
    affected = (weights[faces] > 0).any(axis=1)
    displacement = after - before
    vertices_normals = meshes['r02a'].vertex_normals
    normal_spread = np.degrees(np.arccos(np.clip(np.minimum.reduce([
        np.einsum('ij,ij->i', vertices_normals[faces[:, 0]], vertices_normals[faces[:, 1]]),
        np.einsum('ij,ij->i', vertices_normals[faces[:, 1]], vertices_normals[faces[:, 2]]),
        np.einsum('ij,ij->i', vertices_normals[faces[:, 2]], vertices_normals[faces[:, 0]]),
    ]), -1, 1)))
    records = []
    for index in np.flatnonzero(flipped):
        ids = faces[index]
        records.append({
            'r02aExportFace': int(index), 'stableVertexIds': ids.tolist(),
            'beforeCentroid': before[ids].mean(axis=0).tolist(),
            'normalRotationDegrees': float(np.degrees(np.arccos(np.clip(dot[index], -1, 1)))),
            'beforeArea': float(area0[index]), 'afterArea': float(area1[index]),
            'beforeMinimumAltitude': float(height0[index]),
            'beforeEdgeLengths': lengths0[index].tolist(), 'afterEdgeLengths': lengths1[index].tolist(),
            'vertexDisplacementMagnitudes': np.linalg.norm(displacement[ids], axis=1).tolist(),
            'beforeVertexNormalSpreadDegrees': float(normal_spread[index]),
        })
    report = {
        'method': 'Compare signed face orientation using fixed r02a exported triangle stable vertex IDs evaluated before and after r02c deformation. This isolates deformation from any exporter diagonal changes.',
        'stableExportAgreement': stable_matches,
        'protectedVertices': int((weights == 0).sum()),
        'protectedMovedVertices': int(np.any(before[weights == 0] != after[weights == 0], axis=1).sum()),
        'affectedTriangles': int(affected.sum()), 'flippedTriangles': int(flipped.sum()),
        'flippedStableVertexCount': len(np.unique(faces[flipped])),
        'flipCentroidBounds': [before[faces[flipped]].mean(axis=1).min(axis=0).tolist(), before[faces[flipped]].mean(axis=1).max(axis=0).tolist()] if flipped.any() else None,
        'minimumAltitudeBefore': {'affectedQuantiles': distribution(height0[affected]), 'flippedQuantiles': distribution(height0[flipped])},
        'normalSpreadBeforeDegrees': {'affectedQuantiles': distribution(normal_spread[affected]), 'flippedQuantiles': distribution(normal_spread[flipped])},
        'flippedFaces': records, 'localIntersections': {},
    }
    lower = np.minimum(before[weights > 0].min(axis=0), after[weights > 0].min(axis=0)) - .01
    upper = np.maximum(before[weights > 0].max(axis=0), after[weights > 0].max(axis=0)) + .01
    report['intersectionBounds'] = [lower.tolist(), upper.tolist()]
    report['intersectionMethod'] = 'Open3D local self-intersection test on actual exported triangles whose AABBs overlap the selected-region union expanded .01. Shared-vertex/numerical detector limitations apply; no whole-model or separate-flame intersection claim.'
    for label, mesh in meshes.items():
        triangles = mesh.vertices[mesh.faces]
        selected = (triangles.max(axis=1) >= lower).all(axis=1) & (triangles.min(axis=1) <= upper).all(axis=1)
        ids = np.flatnonzero(selected)
        used, inverse = np.unique(mesh.faces[ids], return_inverse=True)
        local = o3d.geometry.TriangleMesh(o3d.utility.Vector3dVector(mesh.vertices[used]), o3d.utility.Vector3iVector(inverse.reshape(-1, 3)))
        pairs = np.asarray(local.get_self_intersecting_triangles())
        original_pairs = ids[pairs] if len(pairs) else np.empty((0, 2), int)
        report['localIntersections'][label] = {'trianglesTested': len(ids), 'intersectionPairs': original_pairs.tolist(), 'intersectionPairCount': len(pairs)}
        print(label, 'local triangle pairs', len(pairs), flush=True)
    (OUT / 'r02c-fold-measurements.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({key: value for key, value in report.items() if key not in ['flippedFaces', 'localIntersections']}, indent=2))
    print('FLIP EXAMPLES', json.dumps(sorted(records, key=lambda item: item['beforeMinimumAltitude'])[:12], indent=2))


if __name__ == '__main__':
    main()
