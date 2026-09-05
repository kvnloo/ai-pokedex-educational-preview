"""CPU-only exported surface validation for r02a, rejected r02c and r02d."""
import hashlib
import json
import struct
from pathlib import Path

import numpy as np
import open3d as o3d
import trimesh
from scipy.spatial import cKDTree

from diagnose_ribs import distribution, loaded
from diagnose_mls_folds import face_metrics


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/audit-root-surface')
ROOT = OUT.parent


def oriented_rows(faces):
    first = faces.argmin(axis=1)
    rows = np.ascontiguousarray(np.take_along_axis(faces, (first[:, None] + np.arange(3)) % 3, axis=1))
    return rows.view(np.dtype((np.void, rows.dtype.itemsize * 3))).ravel()


def topology(mesh):
    faces = mesh.faces
    edges = np.sort(np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]]), axis=1)
    _, count = np.unique(edges, axis=0, return_counts=True)
    return {
        'vertices': len(mesh.vertices), 'triangles': len(faces),
        'components': len(mesh.split(only_watertight=False)), 'boundaryEdges': int((count == 1).sum()),
        'edgesAboveTwoFaceIncidence': int((count > 2).sum()),
        'repeatedIndexTriangles': int(((faces[:, 0] == faces[:, 1]) | (faces[:, 1] == faces[:, 2]) | (faces[:, 0] == faces[:, 2])).sum()),
        'areaAtMost1eMinus14Triangles': int((mesh.area_faces <= 1e-14).sum()),
        'watertight': bool(mesh.is_watertight), 'windingConsistent': bool(mesh.is_winding_consistent),
        'signedVolume': float(mesh.volume), 'surfaceArea': float(mesh.area), 'bounds': mesh.bounds.tolist(),
    }


def flame(path):
    scene = trimesh.load(path, force='scene', process=False)
    node = next(name for name in scene.graph.nodes_geometry if 'flame' in name)
    transform, name = scene.graph[node]
    mesh = scene.geometry[name].copy()
    mesh.apply_transform(transform)
    mesh.vertices = mesh.vertices[:, [0, 2, 1]] * [1, -1, 1]
    return mesh


def main():
    data = {label: np.load(ROOT / label / 'vertex-audit.npz') for label in ['r02c', 'r02d']}
    before = data['r02d']['before'].astype(float)
    weights = data['r02d']['weights']
    assert np.array_equal(before, data['r02c']['before'])
    assert np.array_equal(weights, data['r02c']['weights'])
    points = {'r02a': before, **{label: archive['after'].astype(float) for label, archive in data.items()}}
    paths = {label: ROOT / label / f'charizard-tail-{label}.glb' for label in points}
    meshes, report = {}, {
        'inputs': {label: {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()} for label, path in paths.items()},
        'coordinateConvention': 'Scene-transformed glTF world converted to Blender (x,-z,y).',
        'versions': {}, 'localIntersectionMethod': 'Open3D 0.19.0 on all body triangles whose AABBs overlap a common selected-region bound expanded .01. Reports stable-ID pair differences. Numerical/shared-vertex limitations apply. Separate flame/body intersections and the rest of the model are not tested.',
    }
    base_flame = flame(paths['r02a'])
    for label, positions in points.items():
        mesh = loaded(paths[label])
        distances, ids = cKDTree(positions).query(mesh.vertices, k=1)
        reverse, reverse_ids = cKDTree(mesh.vertices).query(positions, k=1)
        assert distances.max() == 0 and reverse.max() == 0 and len(np.unique(ids)) == len(positions) == len(mesh.vertices)
        meshes[label] = trimesh.Trimesh(positions, ids[mesh.faces], process=False)
        byte_data = paths[label].read_bytes()
        length, _ = struct.unpack_from('<II', byte_data, 12)
        gltf = json.loads(byte_data[20:20 + length])
        flame_mesh = flame(paths[label])
        report['versions'][label] = {
            'exportStructure': {'scenes': len(gltf['scenes']), 'nodes': len(gltf['nodes']), 'meshes': len(gltf['meshes']), 'sceneNames': [s.get('name') for s in gltf['scenes']]},
            'stableIdBijection': {'rows': len(positions), 'maximumExportToNpzError': float(distances.max()), 'maximumNpzToExportError': float(reverse.max()), 'uniqueMappedRows': len(np.unique(ids))},
            'protectedVertices': int((weights == 0).sum()), 'protectedMovedVertices': int(np.any(positions[weights == 0] != before[weights == 0], axis=1).sum()),
            'changedVertices': int(np.any(positions != before, axis=1).sum()),
            'selectedDisplacementQuantiles': distribution(np.linalg.norm(positions - before, axis=1)[weights > 0]),
            'body': topology(meshes[label]), 'flame': topology(flame_mesh),
            'flameVerticesAndFacesExact': bool(np.array_equal(base_flame.vertices, flame_mesh.vertices) and np.array_equal(base_flame.faces, flame_mesh.faces)),
        }
        if label in data:
            report['versions'][label]['blenderFaceVertexSequenceExact'] = bool(np.array_equal(data[label]['source_face_vertex_indices'], data[label]['target_face_vertex_indices']))
    old_faces = meshes['r02a'].faces
    original_normals, _, _, _ = face_metrics(before, old_faces)
    protected_faces = (weights[old_faces] == 0).all(axis=1)
    for label, mesh in meshes.items():
        normals, _, _, _ = face_metrics(points[label], old_faces)
        dot = np.einsum('ij,ij->i', normals, original_normals)
        flipped = dot < 0
        protected_new = mesh.faces[(weights[mesh.faces] == 0).all(axis=1)]
        report['versions'][label]['orientationAgainstFixedR02aTriangles'] = {'flippedTriangles': int(flipped.sum()), 'flippedR02aFaceIds': np.flatnonzero(flipped).tolist(), 'protectedFlippedTriangles': int(flipped[protected_faces].sum())}
        report['versions'][label]['protectedOrientedTriangleTriples'] = {
            'parentCount': int(protected_faces.sum()), 'candidateCount': len(protected_new),
            'missing': len(np.setdiff1d(oriented_rows(old_faces[protected_faces]), oriented_rows(protected_new))),
            'added': len(np.setdiff1d(oriented_rows(protected_new), oriented_rows(old_faces[protected_faces]))),
        }
        report['versions'][label]['signedVolumeChangePercent'] = 100 * (mesh.volume / meshes['r02a'].volume - 1)
        report['versions'][label]['surfaceAreaChangePercent'] = 100 * (mesh.area / meshes['r02a'].area - 1)
    selected_points = np.concatenate([p[weights > 0] for p in points.values()])
    lower, upper = selected_points.min(axis=0) - .01, selected_points.max(axis=0) + .01
    report['localIntersectionBounds'] = [lower.tolist(), upper.tolist()]
    pair_keys = {}
    for label, mesh in meshes.items():
        triangles = mesh.vertices[mesh.faces]
        selected = (triangles.max(axis=1) >= lower).all(axis=1) & (triangles.min(axis=1) <= upper).all(axis=1)
        ids = np.flatnonzero(selected)
        used, inverse = np.unique(mesh.faces[ids], return_inverse=True)
        local = o3d.geometry.TriangleMesh(o3d.utility.Vector3dVector(mesh.vertices[used]), o3d.utility.Vector3iVector(inverse.reshape(-1, 3)))
        pairs = np.asarray(local.get_self_intersecting_triangles())
        pairs = ids[pairs] if len(pairs) else np.empty((0, 2), int)
        pair_keys[label] = {tuple(sorted(tuple(sorted(mesh.faces[face])) for face in pair)) for pair in pairs}
        report['versions'][label]['localIntersections'] = {
            'trianglesTested': len(ids), 'pairCount': len(pairs), 'exportedFacePairs': pairs.tolist(),
            'stableTrianglePairKeys': [[list(map(int, face)) for face in pair] for pair in sorted(pair_keys[label])],
            'newPairsVersusR02a': len(pair_keys[label] - pair_keys['r02a']),
            'retainedPairsFromR02a': len(pair_keys[label] & pair_keys['r02a']),
        }
        print(label, 'flips', report['versions'][label]['orientationAgainstFixedR02aTriangles']['flippedTriangles'], 'intersections', len(pairs), flush=True)
    report['sectionShapes'] = []
    for y in [0, .05, .1, .15, .2, .25, .3, .34]:
        row = {'y': y}
        for label, mesh in meshes.items():
            section = mesh.section(plane_origin=[0, y, 0], plane_normal=[0, 1, 0])
            line = max((line for line in section.discrete if line[:, 0].max() < 0 and line[:, 2].max() < -.2), key=len)
            xy = line[:, [0, 2]]
            area = abs(np.sum(xy[:-1, 0] * xy[1:, 1] - xy[1:, 0] * xy[:-1, 1])) / 2
            row[label] = {'area': float(area), 'perimeter': float(np.linalg.norm(np.diff(line, axis=0), axis=1).sum()), 'xzBounds': [xy.min(axis=0).tolist(), xy.max(axis=0).tolist()]}
            row[label]['areaChangePercent'] = 100 * (area / row['r02a']['area'] - 1)
        report['sectionShapes'].append(row)
    candidate = report['versions']['r02d']
    report['candidateNumericalChecks'] = {
        'protectedVerticesExact': candidate['protectedVertices'] == 112475 and candidate['protectedMovedVertices'] == 0,
        'protectedOrientedTrianglesExact': candidate['protectedOrientedTriangleTriples']['missing'] == 0 and candidate['protectedOrientedTriangleTriples']['added'] == 0,
        'flameExact': candidate['flameVerticesAndFacesExact'],
        'noReversedOriginalTriangles': candidate['orientationAgainstFixedR02aTriangles']['flippedTriangles'] == 0,
        'noNewDetectedLocalIntersectionPairs': candidate['localIntersections']['newPairsVersusR02a'] == 0,
        'bodyTopologyPredicates': candidate['body']['watertight'] and candidate['body']['windingConsistent'] and candidate['body']['boundaryEdges'] == 0 and candidate['body']['edgesAboveTwoFaceIncidence'] == 0 and candidate['body']['repeatedIndexTriangles'] == 0 and candidate['body']['areaAtMost1eMinus14Triangles'] == 0,
    }
    report['limits'] = ['No whole-model intersection freedom claim.', 'Signed volume and Y-plane section areas describe change; they do not prove anatomical correctness or exact volume preservation.', 'Protected numerical region does not independently establish limb segmentation.']
    (OUT / 'r02d-validation.json').write_text(json.dumps(report, indent=2) + '\n')
    rows = []
    for label, version in report['versions'].items():
        rows.append(f"| {label} | {version['orientationAgainstFixedR02aTriangles']['flippedTriangles']} | {version['localIntersections']['pairCount']} | {version['localIntersections']['newPairsVersusR02a']} | {version['signedVolumeChangePercent']:.6f}% |")
    text = f'''# Exported surface candidate validation

r02d retains the PCA fit's visual improvement and passes the protected-geometry and tested topology checks. Its local intersection check fails. It is not numerically accepted as-is.

| Candidate | Reversed baseline triangles | Local intersection pairs | New pairs against r02a | Signed-volume change |
| --- | --- | --- | --- | --- |
{chr(10).join(rows)}

Every one of the 122377 stable NPZ rows maps bijectively and exactly to its corresponding GLB. All 112475 zero-weight rows remain unchanged in r02d. The protected oriented triangle triples remain exact, as do the flame's world vertices and triangles. Both body and flame pass the closed-surface edge-incidence, winding and tested triangle-degeneracy predicates.

The r02d signed-volume change is {candidate['signedVolumeChangePercent']:.6f} percent and surface-area change is {candidate['surfaceAreaChangePercent']:.6f} percent. The sampled low-left Y-section areas change by between {min(row['r02d']['areaChangePercent'] for row in report['sectionShapes']):.6f} and {max(row['r02d']['areaChangePercent'] for row in report['sectionShapes']):.6f} percent. This provides no evidence of material overall shrinkage. These section areas are not perpendicular anatomical thickness measurements.

The common region is wider than the earlier tail-join-only audit. It finds two pre-existing r02a intersections in the source region. r02d's twelve reported pair keys are all different from those two. Independent edge/triangle solves in r02d-intersection-details.json confirm strict interior intersections for all twelve.

The crossings form one narrow seam/collar strip involving 18 stable vertices and 16 triangles. Their combined triangle bounds are X[-.504774,-.484936], Y[.149250,.250910], Z[-.475182,-.466104]. Their original pair clearances were only .000060388 to .000145799. The largest intersection segment is .022372340 long. This supports local cleanup of the narrow collar strip while preserving the useful fitted surface elsewhere. It does not support treating the intersections as roundoff.

Rerun validate_surface_candidates.py with the Hunyuan Python environment. It reads frozen r02a, r02c and r02d GLBs and stable-ID NPZ files, then writes only diagnosis JSON/Markdown. Run inspect_intersection_pairs.py for the independent crossing confirmation and exact centers, gaps and stable triangle IDs. Scripts produce no edited mesh or coordinate proposal.

Open3D only checks body triangles whose AABBs overlap the common selected-region bounds expanded by .01. Numerical and shared-vertex limitations apply. No whole-model or separate flame/body intersection freedom is claimed. Artistic acceptance remains a visual decision.
'''
    (OUT / 'r02d-validation.md').write_text(text)
    print(json.dumps({'candidateNumericalChecks': report['candidateNumericalChecks'], 'r02dVolumeChangePercent': candidate['signedVolumeChangePercent'], 'r02dSurfaceAreaChangePercent': candidate['surfaceAreaChangePercent'], 'sectionAreaChangesPercent': {row['y']: row['r02d']['areaChangePercent'] for row in report['sectionShapes']}}, indent=2))
    if not all(report['candidateNumericalChecks'].values()):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
