"""Read-only CPU validation of the r02e collar topology cleanup."""
import argparse
import hashlib
import json
import struct
from pathlib import Path

import numpy as np
import open3d as o3d
import trimesh
from scipy.spatial import cKDTree

from diagnose_ribs import loaded
from validate_surface_candidates import flame, oriented_rows, topology


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/audit-root-surface')
ROOT = OUT.parent


def triangle_difference(first, second):
    return {'missing': len(np.setdiff1d(oriented_rows(first), oriented_rows(second))), 'added': len(np.setdiff1d(oriented_rows(second), oriented_rows(first)))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=ROOT / 'r02e')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'r02e-validation')
    args = parser.parse_args()
    audit_path = args.candidate_dir / 'topology-audit.npz'
    archive = np.load(audit_path)
    smoothing = np.load(ROOT / 'r02d/vertex-audit.npz')
    before, after = archive['before'].astype(float), archive['after'].astype(float)
    parent_ids = archive['parent_vertex_ids'].astype(np.int64)
    face_parent_ids = archive['parent_face_ids'].astype(np.int64)
    removed_ids = archive['removed_parent_vertices'].astype(np.int64)
    removed_faces = archive['removed_parent_faces'].astype(np.int64)
    weights = smoothing['weights']
    npz_checks = {
        'beforeMatchesFrozenR02d': bool(np.array_equal(before, smoothing['after'])),
        'allRetainedCoordinatesExact': bool(np.array_equal(after, before[parent_ids])),
        'parentVertexIdsUnique': len(np.unique(parent_ids)) == len(parent_ids),
        'removedVertexComplementExact': bool(np.array_equal(np.setdiff1d(np.arange(len(before)), parent_ids), removed_ids)),
        'removedVerticesCount41': len(removed_ids) == 41,
        'newPolygonCount27': int((face_parent_ids < 0).sum()) == 27,
        'removedPolygonsCount61': len(removed_faces) == 61,
    }
    original_polygon_count = len(face_parent_ids) - int((face_parent_ids < 0).sum()) + len(removed_faces)
    npz_checks['retainedParentPolygonIdsExact'] = bool(np.array_equal(np.sort(face_parent_ids[face_parent_ids >= 0]), np.setdiff1d(np.arange(original_polygon_count), removed_faces)))
    paths = {
        'r02a': ROOT / 'r02a/charizard-tail-r02a.glb',
        'r02d': ROOT / 'r02d/charizard-tail-r02d.glb',
        'r02e': args.candidate_dir / 'charizard-tail-r02e.glb',
    }
    positions = {'r02a': smoothing['before'].astype(float), 'r02d': before, 'r02e': after}
    meshes, global_faces = {}, {}
    report = {
        'inputs': {label: {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()} for label, path in paths.items()},
        'topologyAudit': {'path': str(audit_path), 'sha256': hashlib.sha256(audit_path.read_bytes()).hexdigest(), 'checks': npz_checks},
        'coordinateConvention': 'glTF scene transforms applied, then world coordinates converted to Blender (x,-z,y). NPZ parent_vertex_ids map reduced r02e rows to full r02d/r02a stable identity.',
        'versions': {},
    }
    base_flame = flame(paths['r02d'])
    for label, path in paths.items():
        export = loaded(path)
        coordinates = positions[label]
        distances, local_ids = cKDTree(coordinates).query(export.vertices, k=1)
        reverse, reverse_ids = cKDTree(export.vertices).query(coordinates, k=1)
        assert distances.max() == 0 and reverse.max() == 0 and len(np.unique(local_ids)) == len(coordinates) == len(export.vertices)
        local_faces = local_ids[export.faces]
        meshes[label] = trimesh.Trimesh(coordinates, local_faces, process=False)
        global_faces[label] = parent_ids[local_faces] if label == 'r02e' else local_faces
        data = path.read_bytes()
        length, _ = struct.unpack_from('<II', data, 12)
        gltf = json.loads(data[20:20 + length])
        flame_mesh = flame(path)
        report['versions'][label] = {
            'structure': {'scenes': len(gltf['scenes']), 'nodes': len(gltf['nodes']), 'meshes': len(gltf['meshes']), 'sceneNames': [s.get('name') for s in gltf['scenes']], 'nodeNames': [n.get('name') for n in gltf['nodes']]},
            'stableIdBijection': {'rows': len(coordinates), 'uniqueMappedRows': len(np.unique(local_ids)), 'maximumExportToNpzDistance': float(distances.max()), 'maximumNpzToExportDistance': float(reverse.max())},
            'body': topology(meshes[label]), 'flame': topology(flame_mesh),
            'flameExactAgainstR02d': bool(np.array_equal(flame_mesh.vertices, base_flame.vertices) and np.array_equal(flame_mesh.faces, base_flame.faces)),
        }
    original_protected_ids = np.flatnonzero(weights == 0)
    retained_protected = np.isin(original_protected_ids, parent_ids)
    parent_to_reduced = np.full(len(before), -1, int)
    parent_to_reduced[parent_ids] = np.arange(len(after))
    protected_distances = np.linalg.norm(after[parent_to_reduced[original_protected_ids[retained_protected]]] - positions['r02a'][original_protected_ids[retained_protected]], axis=1)
    old_protected = global_faces['r02a'][(weights[global_faces['r02a']] == 0).all(axis=1)]
    new_protected = global_faces['r02e'][(weights[global_faces['r02e']] == 0).all(axis=1)]
    report['protectedAgainstR02a'] = {
        'expectedVertices': len(original_protected_ids), 'retainedVertices': int(retained_protected.sum()),
        'removedProtectedVertices': original_protected_ids[~retained_protected].tolist(),
        'maximumCoordinateDisplacement': float(protected_distances.max()),
        'orientedTrianglesBefore': len(old_protected), 'orientedTrianglesAfter': len(new_protected),
        **triangle_difference(old_protected, new_protected),
    }
    old_faces, new_faces = global_faces['r02d'], global_faces['r02e']
    old_keys, new_keys = oriented_rows(old_faces), oriented_rows(new_faces)
    deleted_triangle_mask = ~np.isin(old_keys, new_keys)
    created_triangle_mask = ~np.isin(new_keys, old_keys)
    deleted_triangles, new_triangles = old_faces[deleted_triangle_mask], new_faces[created_triangle_mask]
    edge_counts = np.sort(np.concatenate([deleted_triangles[:, [0, 1]], deleted_triangles[:, [1, 2]], deleted_triangles[:, [2, 0]]]), axis=1)
    edges, counts = np.unique(edge_counts, axis=0, return_counts=True)
    boundary = edges[counts == 1]
    boundary_ids = np.unique(boundary)
    report['canonicalTrianglePatch'] = {
        'deletedExportTriangles': len(deleted_triangles), 'newExportTriangles': len(new_triangles),
        'deletedTriangleParentStableIds': deleted_triangles.tolist(), 'newTriangleParentStableIds': new_triangles.tolist(),
        'oldPatchBoundaryEdges': len(boundary), 'oldPatchBoundaryVertices': len(boundary_ids),
        'newTrianglesUseExactlyOldBoundary': bool(np.array_equal(np.unique(new_triangles), boundary_ids)),
        'newTrianglesUseOnlyRetainedVertices': bool(np.isin(new_triangles, parent_ids).all()),
    }
    native_path = args.candidate_dir / 'native-patch.json'
    native = json.loads(native_path.read_text())
    native_triangles = np.asarray(native['newTriangleParentVertexIds'], dtype=np.int64)
    native_boundary = np.asarray(native['boundaryParentVertexIds'], dtype=np.int64)
    native_keys = oriented_rows(native_triangles)
    recreated = np.isin(native_keys, old_keys)
    full_deleted = np.vstack([deleted_triangles, native_triangles[recreated]])
    full_edges = np.sort(np.concatenate([full_deleted[:, [0, 1]], full_deleted[:, [1, 2]], full_deleted[:, [2, 0]]]), axis=1)
    full_edges, full_counts = np.unique(full_edges, axis=0, return_counts=True)
    full_boundary = full_edges[full_counts == 1]
    native_edges = np.sort(np.concatenate([native_triangles[:, [0, 1]], native_triangles[:, [1, 2]], native_triangles[:, [2, 0]]]), axis=1)
    native_edges, native_counts = np.unique(native_edges, axis=0, return_counts=True)
    report['nativePatchCorrespondence'] = {
        'receipt': str(native_path), 'sha256': hashlib.sha256(native_path.read_bytes()).hexdigest(),
        'newNativeTriangles': len(native_triangles), 'nativeBoundaryVertices': len(native_boundary),
        'nativeTriangleKeysPresentInExport': int(np.isin(native_keys, new_keys).sum()),
        'recreatedOriginalTriangleCount': int(recreated.sum()),
        'recreatedOriginalTriangleParentIds': native_triangles[recreated].tolist(),
        'fullRemovedExportTriangles': len(full_deleted), 'fullRemovedPatchBoundaryVertices': len(np.unique(full_boundary)),
        'checks': {
            'nativeCountMatchesAudit': len(native_triangles) == int((face_parent_ids < 0).sum()) == 27,
            'nativeTrianglesUnique': len(np.unique(native_keys)) == len(native_triangles),
            'allNativeTrianglesInExportWithOrientation': bool(np.isin(native_keys, new_keys).all()),
            'fourRecreatedTrianglesAccountForDifference': int(recreated.sum()) == 4 and int((~recreated).sum()) == len(new_triangles),
            'canonicalNewTrianglesExactlyNativeDifference': len(np.setdiff1d(oriented_rows(new_triangles), native_keys[~recreated])) == 0 and len(np.setdiff1d(native_keys[~recreated], oriented_rows(new_triangles))) == 0,
            'nativeUsesExactlyDeclaredBoundary': bool(np.array_equal(np.unique(native_triangles), np.sort(native_boundary))) and len(native_boundary) == 29,
            'oldFullBoundaryMatchesDeclaredBoundary': bool(np.array_equal(np.unique(full_boundary), np.sort(native_boundary))),
            'newFullBoundaryMatchesOldFullBoundary': bool(np.array_equal(native_edges[native_counts == 1], full_boundary)),
            'nativePatchEulerOne': len(np.unique(native_triangles)) - len(native_edges) + len(native_triangles) == 1,
        },
    }
    reference = json.loads((OUT / 'r02d-validation.json').read_text())
    lower, upper = np.array(reference['localIntersectionBounds'])
    report['localIntersectionBounds'] = [lower.tolist(), upper.tolist()]
    report['intersectionMethod'] = 'Open3D local body triangle test using exactly the saved r02a/r02c/r02d wider-root AABB. Triangle pairs are compared by full-parent stable IDs. Numerical/shared-vertex limitations apply; no whole-body or separate-flame intersection claim.'
    pair_sets = {}
    for label, mesh in meshes.items():
        triangles = mesh.vertices[mesh.faces]
        selected = (triangles.max(axis=1) >= lower).all(axis=1) & (triangles.min(axis=1) <= upper).all(axis=1)
        ids = np.flatnonzero(selected)
        used, inverse = np.unique(mesh.faces[ids], return_inverse=True)
        local = o3d.geometry.TriangleMesh(o3d.utility.Vector3dVector(mesh.vertices[used]), o3d.utility.Vector3iVector(inverse.reshape(-1, 3)))
        pairs = np.asarray(local.get_self_intersecting_triangles())
        pairs = ids[pairs] if len(pairs) else np.empty((0, 2), int)
        pair_sets[label] = {tuple(sorted(tuple(sorted(map(int, global_faces[label][face]))) for face in pair)) for pair in pairs}
        report['versions'][label]['localIntersections'] = {
            'trianglesTested': len(ids), 'pairCount': len(pairs), 'exportFacePairs': pairs.tolist(),
            'stableTrianglePairKeys': [[list(face) for face in pair] for pair in sorted(pair_sets[label])],
            'newAgainstR02a': len(pair_sets[label] - pair_sets['r02a']), 'retainedFromR02a': len(pair_sets[label] & pair_sets['r02a']),
        }
        report['versions'][label]['signedVolumeChangeVsR02aPercent'] = 100 * (mesh.volume / meshes['r02a'].volume - 1)
        report['versions'][label]['signedVolumeChangeVsR02dPercent'] = 100 * (mesh.volume / meshes['r02d'].volume - 1)
        print(label, 'local pairs', len(pairs), flush=True)
    candidate = report['versions']['r02e']
    report['checks'] = {
        'sourceCanonicalMap': all(npz_checks.values()),
        'oneSceneTwoMeshNodes': candidate['structure']['scenes'] == 1 and candidate['structure']['nodes'] == 2 and candidate['structure']['meshes'] == 2,
        'expectedBodyCounts': candidate['body']['vertices'] == 122336 and candidate['body']['triangles'] == 244672,
        'protectedCoordinatesAndOrientedTriangles': retained_protected.all() and protected_distances.max() == 0 and report['protectedAgainstR02a']['missing'] == 0 and report['protectedAgainstR02a']['added'] == 0,
        'boundaryOnlyPatch': all(report['nativePatchCorrespondence']['checks'].values()),
        'bodyTopology': candidate['body']['components'] == 1 and candidate['body']['watertight'] and candidate['body']['windingConsistent'] and candidate['body']['boundaryEdges'] == 0 and candidate['body']['edgesAboveTwoFaceIncidence'] == 0 and candidate['body']['repeatedIndexTriangles'] == 0 and candidate['body']['areaAtMost1eMinus14Triangles'] == 0,
        'flameExact': candidate['flameExactAgainstR02d'],
        'noDetectedLocalIntersections': candidate['localIntersections']['pairCount'] == 0,
    }
    report['limits'] = ['Local intersections only; no whole-model freedom claim.', 'No independent anatomical or visual acceptance.', 'Signed volume describes oriented mesh change, not physical-volume certification.']
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    rows = [f"| {label} | {version['body']['vertices']} | {version['body']['triangles']} | {version['localIntersections']['pairCount']} | {version['signedVolumeChangeVsR02aPercent']:.7f}% |" for label, version in report['versions'].items()]
    verdict = 'All stated numerical checks pass.' if all(report['checks'].values()) else 'Numerical checks fail; inspect the JSON before acceptance.'
    markdown = f'''# r02e topology cleanup validation

{verdict}

| Candidate | Body vertices | Body triangles | Local intersections | Signed-volume change against r02a |
| --- | --- | --- | --- | --- |
{chr(10).join(rows)}

The exported r02e GLB contains exactly one scene and two mesh nodes. Its reduced vertex rows map bijectively to the topology audit with maximum error zero. The parent_vertex_ids map then confirms that every retained coordinate is exactly its r02d source coordinate. The removed-vertex complement contains exactly 41 IDs. Retained parent polygon IDs and the 61 removed polygon IDs form the original polygon set, with 27 new polygons marked -1.

All {len(original_protected_ids)} zero-weight r02a vertices remain present and exact. Their {len(old_protected)} oriented exported triangle triples are unchanged. Flame world coordinates and triangle arrays are identical to r02d. Body and flame topology metrics are in JSON; the body has one connected component, consistent winding, no boundary or excess-incidence edges, and no tested repeated-index or degenerate triangles.

The actual native-patch.json receipt identifies all 27 new triangles by parent vertex IDs. All 27 occur in the GLB with the same orientation. Four reproduce old triangle triples exactly, explaining why canonical comparison sees only {len(deleted_triangles)} removed and {len(new_triangles)} added triples. Including those four recreated faces restores the complete 109-triangle removed patch and its 29-vertex boundary. The 27 replacement triangles use exactly that unchanged boundary, their boundary edges match, and their Euler characteristic is 1. No retained positions moved. Signed volume changes {candidate['signedVolumeChangeVsR02dPercent']:.9f} percent relative to r02d.

The intersection test uses exactly the saved wider-root bounds from r02d-validation.json, so the pair comparison remains consistent. r02a has two old source-region pairs and r02d has twelve new collar pairs. r02e reports {candidate['localIntersections']['pairCount']} pairs in the same region. Open3D numerical and shared-vertex limitations apply. No whole-model or separate flame/body intersection freedom is claimed.

Rerun validate_strip_cleanup.py with the Hunyuan Python environment. It reads the frozen GLBs, NPZ correspondence and native-patch.json, then writes diagnosis JSON and Markdown only. Use --candidate-dir and --output-prefix to validate a reproduced r02e directory. No Blender calls or geometry authoring occur.
'''
    args.output_prefix.with_suffix('.md').write_text(markdown)
    print(json.dumps({'checks': report['checks'], 'protected': report['protectedAgainstR02a'], 'patch': {k: v for k, v in report['canonicalTrianglePatch'].items() if 'StableIds' not in k}, 'volumeChangeVsR02dPercent': candidate['signedVolumeChangeVsR02dPercent']}, indent=2))
    if not all(report['checks'].values()):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
