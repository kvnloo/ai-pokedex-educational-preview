"""Read-only CPU audit of a tail patch; writes diagnosis artifacts only."""
import argparse
import hashlib
import json
import struct
import time
from pathlib import Path

import numpy as np
import open3d as o3d
import trimesh
from scipy.spatial import cKDTree


AUDIT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/audit')
PROJECT = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon')
FROZEN_HASHES = {
    'original': 'f9f0b2c3f2e189dcdd1c72190e8c79b7b958a2dd4f3bacb2d844ec37b330ed8e',
    'r01': 'fe35ce3185345cb44af42d7e2637496d30fd8689431016718b392f48c9dce2f8',
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_glb(path):
    data = path.read_bytes()
    length, chunk_type = struct.unpack_from('<II', data, 12)
    assert data[:4] == b'glTF' and chunk_type == 0x4e4f534a
    doc = json.loads(data[20:20 + length])
    scene = trimesh.load(path, force='scene', process=False)
    meshes = {}
    for node in scene.graph.nodes_geometry:
        transform, name = scene.graph[node]
        mesh = scene.geometry[name].copy()
        mesh.apply_transform(transform)
        mesh.vertices = mesh.vertices[:, [0, 2, 1]] * np.array([1, -1, 1])
        meshes[node] = mesh
    structure = {
        'sceneCount': len(doc.get('scenes', [])), 'scene': doc.get('scene'),
        'scenes': doc.get('scenes', []), 'nodeCount': len(doc.get('nodes', [])),
        'nodes': doc.get('nodes', []), 'meshCount': len(doc.get('meshes', [])),
    }
    return meshes, structure


def body(meshes):
    return next(mesh for name, mesh in meshes.items() if 'body-tail' in name)


def flame(meshes):
    return next(mesh for name, mesh in meshes.items() if 'flame' in name)


def topology(mesh):
    faces = mesh.faces
    edges = np.sort(np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]]), axis=1)
    _, counts = np.unique(edges, axis=0, return_counts=True)
    parts = sorted(mesh.split(only_watertight=False), key=lambda part: len(part.faces), reverse=True)
    return {
        'vertices': len(mesh.vertices), 'triangles': len(faces),
        'components': [{'vertices': len(p.vertices), 'triangles': len(p.faces)} for p in parts],
        'boundaryEdges': int((counts == 1).sum()),
        'edgesIncidentToMoreThanTwoTriangles': int((counts > 2).sum()),
        'repeatedIndexTriangles': int(((faces[:, 0] == faces[:, 1]) | (faces[:, 0] == faces[:, 2]) | (faces[:, 1] == faces[:, 2])).sum()),
        'zeroAreaTriangles': int((mesh.area_faces == 0).sum()),
        'areaAtMost1eMinus14Triangles': int((mesh.area_faces <= 1e-14).sum()),
        'watertight': bool(mesh.is_watertight), 'windingConsistent': bool(mesh.is_winding_consistent),
        'eulerNumber': int(mesh.euler_number), 'bounds': mesh.bounds.tolist(),
        'exactCoordinateUniqueVertices': len(np.unique(mesh.vertices, axis=0)),
    }


def coordinate_comparison(old, new):
    distances, _ = cKDTree(new.vertices).query(old.vertices, k=1)
    return {
        'verticesTested': len(old.vertices), 'maximumNearestDistance': float(distances.max()),
        'exactMatches': int((distances == 0).sum()), 'within1eMinus6': int((distances < 1e-6).sum()),
        'indicesEqual': bool(np.array_equal(old.vertices, new.vertices)),
        'facesSameIndexArrays': bool(np.array_equal(old.faces, new.faces)),
    }


def join_metrics(mesh, raw_tree):
    vertices = mesh.vertices
    seam = (abs(vertices[:, 1] - .15) < 1e-6) & (vertices[:, 0] < 0) & (vertices[:, 2] < -.2)
    distances, _ = raw_tree.query(vertices, k=1)
    generated = ~seam & (distances >= 1e-7)
    adjacent = mesh.edges_unique[seam[mesh.edges_unique].any(axis=1)]
    first = np.unique(adjacent[generated[adjacent]])
    seam_pairs = seam[mesh.face_adjacency_edges].all(axis=1)
    angles = np.degrees(mesh.face_adjacency_angles[seam_pairs])
    section = mesh.section(plane_origin=[0, .149, 0], plane_normal=[0, 1, 0])
    low_paths = [line for line in section.discrete if line[:, 0].max() < 0 and line[:, 2].max() < -.2]
    return {
        'seamVertexCount': int(seam.sum()), 'seamEdges': int(seam_pairs.sum()),
        'firstGeneratedRingVertices': len(first),
        'firstGeneratedRingBounds': [vertices[first].min(axis=0).tolist(), vertices[first].max(axis=0).tolist()],
        'firstGeneratedRingBehindCutCount': int((vertices[first, 1] < .15 - 1e-6).sum()),
        'seamFaceAngleDegrees': {
            'median': float(np.median(angles)), 'p90': float(np.quantile(angles, .9)),
            'max': float(angles.max()), 'above30': int((angles > 30).sum()),
            'above60': int((angles > 60).sum()), 'above90': int((angles > 90).sum()),
        },
        'y0149LowLeftSectionLoopCount': len(low_paths),
        'y0149LowLeftSectionBounds': [[line.min(axis=0).tolist(), line.max(axis=0).tolist()] for line in low_paths],
    }


def canonical(faces):
    rows = np.ascontiguousarray(np.sort(faces, axis=1))
    return rows.view(np.dtype((np.void, rows.dtype.itemsize * 3))).ravel()


def triangle_comparison(old, new, criterion):
    return {
        'criterion': criterion, 'parentCount': len(old), 'candidateCount': len(new),
        'missingFromCandidate': len(np.setdiff1d(canonical(old), canonical(new))),
        'addedInCandidate': len(np.setdiff1d(canonical(new), canonical(old))),
    }


def stable_audit(npz_path, receipt, meshes, raw_tree):
    with np.load(npz_path) as audit:
        before, after = audit['before'].astype(float), audit['after'].astype(float)
        face_indices_equal = bool(np.array_equal(audit['source_face_vertex_indices'], audit['target_face_vertex_indices']))
        face_index_count = len(audit['source_face_vertex_indices'])
    changed = np.any(before != after, axis=1)
    displacement = np.linalg.norm(after - before, axis=1)
    distances, _ = raw_tree.query(before, k=1)
    original = distances < 1e-7
    seam = (abs(before[:, 1] - .15) < 1e-6) & (before[:, 0] < 0) & (before[:, 2] < -.2)
    result = {
        'artifact': str(npz_path), 'sha256': digest(npz_path),
        'criterion': 'NPZ row index is stable Blender vertex identity. Each row is linked bijectively to each GLB by exact coordinates.',
        'vertexCount': len(before), 'changedCount': int(changed.sum()),
        'changedIndicesMatchReceipt': bool(np.array_equal(np.flatnonzero(changed), receipt['changedVertexIndices'])),
        'unchangedVertices': int((~changed).sum()), 'maximumDisplacement': float(displacement.max()),
        'changedBoundsBefore': [before[changed].min(axis=0).tolist(), before[changed].max(axis=0).tolist()],
        'changedBoundsAfter': [after[changed].min(axis=0).tolist(), after[changed].max(axis=0).tolist()],
        'originalSourceRows': int(original.sum()), 'originalSourceRowsMoved': int(changed[original].sum()),
        'originalSourceMaximumDisplacement': float(displacement[original].max()),
        'seamRows': int(seam.sum()), 'seamRowsMoved': int(changed[seam].sum()),
        'flattenedBlenderFaceVertexIndicesEqual': face_indices_equal,
        'flattenedBlenderFaceVertexIndexCount': face_index_count, 'exports': {},
    }
    faces = {}
    for label, coordinates in [('r01', before), ('r02a', after)]:
        mesh = meshes[label]
        distances, ids = cKDTree(mesh.vertices).query(coordinates, k=1)
        back_distances, stable_ids = cKDTree(coordinates).query(mesh.vertices, k=1)
        result['exports'][label] = {
            'npzToExportMaximumNearestDistance': float(distances.max()),
            'npzToExportUniqueMappedVertices': len(np.unique(ids)),
            'exportToNpzMaximumNearestDistance': float(back_distances.max()),
            'exportToNpzUniqueMappedRows': len(np.unique(stable_ids)),
        }
        assert distances.max() == 0 and back_distances.max() == 0
        assert len(np.unique(ids)) == len(coordinates) == len(mesh.vertices)
        faces[label] = stable_ids[mesh.faces]
    old, new = faces['r01'], faces['r02a']
    result['protectedExportTriangles'] = triangle_comparison(
        old[~changed[old].any(axis=1)], new[~changed[new].any(axis=1)],
        'Canonical unordered stable vertex-ID triples for triangles with no changed vertices.')
    result['sourceSideExportTriangles'] = triangle_comparison(
        old[(original | seam)[old].all(axis=1)], new[(original | seam)[new].all(axis=1)],
        'Triangles entirely within original-source rows plus unchanged surgical seam rows.')
    result['exportTriangulationChanges'] = triangle_comparison(old, new, 'All canonical stable vertex-ID triples.')
    result['exportTriangulationChanges']['explanation'] = 'Unchanged Blender face indices coexist with a changed GLB diagonal inside the patch; protected triangle triples are checked separately.'
    return result


def local_intersections(meshes):
    changed = {}
    for label, other in [('r01', 'r02a'), ('r02a', 'r01')]:
        distances, _ = cKDTree(meshes[other].vertices).query(meshes[label].vertices, k=1)
        changed[label] = distances != 0
    points = np.concatenate([
        mesh.vertices[mesh.faces[changed[label][mesh.faces].any(axis=1)]].reshape(-1, 3)
        for label, mesh in meshes.items()
    ])
    lower, upper = points.min(axis=0) - .01, points.max(axis=0) + .01
    result = {
        'method': 'Open3D get_self_intersecting_triangles on all body triangles whose AABBs overlap the union of changed-triangle bounds expanded by .01. Every potential pair involving a changed triangle is within this AABB selection, subject to detector numerical and shared-vertex limitations. The rest of the model is not tested.',
        'open3dVersion': o3d.__version__, 'bounds': [lower.tolist(), upper.tolist()], 'versions': {},
    }
    for label, mesh in meshes.items():
        triangles = mesh.vertices[mesh.faces]
        selected = (triangles.max(axis=1) >= lower).all(axis=1) & (triangles.min(axis=1) <= upper).all(axis=1)
        ids = np.flatnonzero(selected)
        used, inverse = np.unique(mesh.faces[ids], return_inverse=True)
        local = o3d.geometry.TriangleMesh(
            o3d.utility.Vector3dVector(mesh.vertices[used]),
            o3d.utility.Vector3iVector(inverse.reshape(-1, 3)),
        )
        start = time.monotonic()
        local_pairs = np.asarray(local.get_self_intersecting_triangles())
        pairs = ids[local_pairs] if local_pairs.size else np.empty((0, 2), dtype=int)
        changed_faces = changed[label][mesh.faces].any(axis=1)
        relevant = pairs[changed_faces[pairs].any(axis=1)] if len(pairs) else pairs
        result['versions'][label] = {
            'trianglesTested': len(ids), 'verticesTested': len(used),
            'changedTriangles': int(changed_faces.sum()), 'intersectionPairsCount': len(pairs),
            'intersectionPairsInvolvingChangedTrianglesCount': len(relevant),
            'intersectionPairs': pairs.tolist(), 'seconds': time.monotonic() - start,
        }
    return result


def markdown(report, script_path):
    stable = report['stableVertexAudit']
    old, new = report['r01Join'], report['r02aJoin']
    old_angles, new_angles = old['seamFaceAngleDegrees'], new['seamFaceAngleDegrees']
    intersections = report['localSelfIntersection']['versions']
    rows = []
    for node, item in report['exportGeometry'].items():
        rows.append(f"| {node} | {item['vertices']} | {item['triangles']} | {len(item['components'])} | {item['boundaryEdges']} | {item['edgesIncidentToMoreThanTwoTriangles']} | {item['zeroAreaTriangles']} |")
    checks = report['acceptanceChecks']
    status = 'All stated numerical acceptance checks passed.' if all(checks.values()) else 'Some numerical acceptance checks failed; inspect JSON before acceptance.'
    return f'''# Export audit of Charizard tail r02a

{status} This is a geometry audit, not anatomical or artistic acceptance.

The GLB has one scene and exactly two mesh nodes. Both meshes have consistent winding, no repeated-index triangles and no triangles with area at most 1e-14. Their exact coordinates are unique within each mesh. The original official source and frozen r01 SHA256 values match the earlier audit.

| Mesh | Vertices | Triangles | Components | Boundary edges | Edges with more than two faces | Zero-area triangles |
| --- | --- | --- | --- | --- | --- | --- |
{chr(10).join(rows)}

The saved vertex-audit.npz rows map bijectively to each corresponding GLB with maximum coordinate error 0. Exactly {stable['changedCount']} stable vertex IDs moved, and those IDs match patch-receipt.json. The remaining {stable['unchangedVertices']} rows stayed exact. This includes all {stable['originalSourceRows']} original-source rows and all {stable['seamRows']} attachment rows. Maximum displacement among changed rows is {stable['maximumDisplacement']:.9f} Blender world units.

All {stable['protectedExportTriangles']['parentCount']} triangles with no changed vertices preserve their stable vertex-ID triples. All {stable['sourceSideExportTriangles']['parentCount']} source-side triangles are preserved. The flattened Blender polygon vertex-index arrays are identical. Only {stable['exportTriangulationChanges']['missingFromCandidate']} old and {stable['exportTriangulationChanges']['addedInCandidate']} new triangle triples differ inside the changed region, consistent with one changed quad diagonal during GLB triangulation. The flame's world coordinates and face arrays are identical to r01.

| Exported triangle measurement | r01 | r02a |
| --- | --- | --- |
| First generated ring minimum Y | {old['firstGeneratedRingBounds'][0][1]:.9f} | {new['firstGeneratedRingBounds'][0][1]:.9f} |
| First-ring vertices behind Y=.15 | {old['firstGeneratedRingBehindCutCount']} | {new['firstGeneratedRingBehindCutCount']} |
| Seam face angle median | {old_angles['median']:.3f} degrees | {new_angles['median']:.3f} degrees |
| Seam face angle p90 | {old_angles['p90']:.3f} degrees | {new_angles['p90']:.3f} degrees |
| Seam face angle maximum | {old_angles['max']:.3f} degrees | {new_angles['max']:.3f} degrees |
| Seam face pairs above 90 degrees | {old_angles['above90']} | {new_angles['above90']} |
| Low-left section loops at Y=.149 | {old['y0149LowLeftSectionLoopCount']} | {new['y0149LowLeftSectionLoopCount']} |

These seam angles use exported triangle face normals. The patch receipt measures BMesh polygon normals and uses an integer-index percentile. Those are different measurements; the GLB values describe the delivered triangulated geometry.

Open3D {report['localSelfIntersection']['open3dVersion']} tested {intersections['r02a']['trianglesTested']} triangles per version inside the common changed-region AABB. It found {intersections['r01']['intersectionPairsCount']} intersecting pair in r01 and {intersections['r02a']['intersectionPairsCount']} in r02a. The r01 pair uses exported face IDs {intersections['r01']['intersectionPairs']}. AABB selection includes any triangle that could intersect a changed triangle, but the detector has numerical and shared-vertex limitations. This does not establish whole-model self-intersection freedom, including intersections with the separate flame mesh.

Rerun with the Hunyuan Python environment, which provides numpy, trimesh, scipy and Open3D.

```sh
/mnt/zer0models/venvs/workspace-venv/hunyuan3d/venv/bin/python {script_path}
```

The script only reads the GLBs, receipt and vertex audit, then writes diagnosis JSON and Markdown. Use --candidate-dir and --output-prefix for a separately reproduced candidate. No Blender calls or asset changes occur.
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=AUDIT.parent / 'r02a')
    parser.add_argument('--output-prefix', type=Path, default=AUDIT / 'r02a-validation')
    args = parser.parse_args()
    paths = {
        'original': PROJECT / 'assets/experiments/charizard-official-raw/charizard-official-raw-61062-o256.glb',
        'r01': PROJECT / 'assets/blender/charizard-tail-r01/charizard-tail-r01.glb',
        'r02a': args.candidate_dir / 'charizard-tail-r02a.glb',
    }
    hashes = {label: digest(path) for label, path in paths.items()}
    for label, expected in FROZEN_HASHES.items():
        assert hashes[label] == expected, f'Frozen {label} input changed'
    loaded = {label: load_glb(path) for label, path in paths.items()}
    bodies = {label: body(loaded[label][0]) for label in ['r01', 'r02a']}
    raw = trimesh.util.concatenate(list(loaded['original'][0].values()))
    raw_main = max(raw.split(only_watertight=False), key=lambda mesh: len(mesh.faces))
    raw_tree = cKDTree(raw.vertices)
    protected = ~((raw_main.vertices[:, 1] > .15) & (raw_main.vertices[:, 2] < -.2))
    distances, _ = cKDTree(bodies['r02a'].vertices).query(raw_main.vertices[protected], k=1)
    receipt_path = args.candidate_dir / 'patch-receipt.json'
    receipt = json.loads(receipt_path.read_text())
    report = {
        'coordinateConvention': 'glTF scene transforms applied before glTF-to-Blender world conversion (x,-z,y).',
        'inputs': {label: {'path': str(path), 'sha256': hashes[label]} for label, path in paths.items()},
        'validator': {'path': str(Path(__file__).resolve()), 'sha256': digest(Path(__file__))},
        'patchReceipt': {'path': str(receipt_path), 'sha256': digest(receipt_path)},
        'frozenInputHashesMatch': True, 'exportStructure': loaded['r02a'][1],
        'exportGeometry': {name: topology(mesh) for name, mesh in loaded['r02a'][0].items()},
        'parentBodyComparison': coordinate_comparison(bodies['r01'], bodies['r02a']),
        'parentFlameComparison': coordinate_comparison(flame(loaded['r01'][0]), flame(loaded['r02a'][0])),
        'originalProtectedCoordinatePresence': {
            'criterion': 'Original main-component vertices outside (Y>.15 AND Z<-.20); position presence only.',
            'testedVertices': int(protected.sum()), 'maximumNearestDistance': float(distances.max()),
            'exactMatches': int((distances == 0).sum()), 'violationsAt1eMinus6': int((distances >= 1e-6).sum()),
        },
        'r01Join': join_metrics(bodies['r01'], raw_tree),
        'r02aJoin': join_metrics(bodies['r02a'], raw_tree),
        'stableVertexAudit': stable_audit(args.candidate_dir / 'vertex-audit.npz', receipt, bodies, raw_tree),
        'localSelfIntersection': local_intersections(bodies),
        'limits': [
            'Numerical geometry verification does not establish anatomy or artistic quality.',
            'No whole-model self-intersection claim. Local Open3D test has numerical and shared-vertex limitations; separate flame-to-body intersections are not tested.',
            'No UV, rig, animation or production readiness evaluation.',
        ],
    }
    stable = report['stableVertexAudit']
    report['acceptanceChecks'] = {
        'exportHasOneSceneTwoMeshes': report['exportStructure']['sceneCount'] == 1 and report['exportStructure']['nodeCount'] == 2 and report['exportStructure']['meshCount'] == 2,
        'topologyPredicatesPass': all(item['watertight'] and item['windingConsistent'] and len(item['components']) == 1 and item['boundaryEdges'] == 0 and item['edgesIncidentToMoreThanTwoTriangles'] == 0 and item['repeatedIndexTriangles'] == 0 and item['areaAtMost1eMinus14Triangles'] == 0 for item in report['exportGeometry'].values()),
        'changedStableIdsMatchReceipt': stable['changedIndicesMatchReceipt'] and stable['changedCount'] == 1585,
        'protectedRowsUnchanged': stable['originalSourceRows'] == 106843 and stable['originalSourceRowsMoved'] == 0 and stable['seamRows'] == 317 and stable['seamRowsMoved'] == 0,
        'protectedTriangleTriplesUnchanged': stable['protectedExportTriangles']['missingFromCandidate'] == 0 and stable['protectedExportTriangles']['addedInCandidate'] == 0,
        'blenderFaceVertexIndexSequenceUnchanged': stable['flattenedBlenderFaceVertexIndicesEqual'],
        'flameWorldGeometryUnchanged': report['parentFlameComparison']['indicesEqual'] and report['parentFlameComparison']['facesSameIndexArrays'],
        'firstRingNoFoldback': report['r02aJoin']['firstGeneratedRingVertices'] == 317 and report['r02aJoin']['firstGeneratedRingBehindCutCount'] == 0,
        'seamAngleMaximumImproved': report['r02aJoin']['seamFaceAngleDegrees']['max'] < report['r01Join']['seamFaceAngleDegrees']['max'],
        'localDetectorReportsNoIntersections': report['localSelfIntersection']['versions']['r02a']['intersectionPairsCount'] == 0,
    }
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    args.output_prefix.with_suffix('.md').write_text(markdown(report, Path(__file__).resolve()))
    print(json.dumps({'acceptanceChecks': report['acceptanceChecks'], 'report': str(args.output_prefix.with_suffix('.json'))}, indent=2))
    if not all(report['acceptanceChecks'].values()):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
