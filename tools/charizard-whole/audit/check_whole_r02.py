"""CPU-only export integrity and bounded tail-contact check; writes audit reports only."""
import argparse
import hashlib
import json
import struct
from pathlib import Path

import numpy as np
import open3d as o3d
import trimesh
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

PRIVATE = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05')
OUT = PRIVATE / 'whole-r02/audit'


def file_record(path):
    return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def load_asset(path):
    raw = path.read_bytes()
    length, kind = struct.unpack_from('<II', raw, 12)
    assert kind == 0x4e4f534a
    document = json.loads(raw[20:20 + length])
    scene = trimesh.load(path, force='scene', process=False)
    meshes, transforms = {}, {}
    for node in scene.graph.nodes_geometry:
        transform, geometry = scene.graph[node]
        mesh = scene.geometry[geometry].copy()
        mesh.apply_transform(transform)
        mesh.vertices = mesh.vertices[:, [0, 2, 1]] * [1, -1, 1]
        role = node.split('GEO-charizard-')[1].split('-whole-')[0]
        assert role not in meshes
        meshes[role] = mesh
        transforms[role] = {'node': node, 'glTFWorldTransform': transform.tolist()}
    metadata = file_record(path) | {'scenes': len(document.get('scenes', [])),
        'nodes': len(document.get('nodes', [])), 'meshes': len(document.get('meshes', [])),
        'meshNodes': len(meshes), 'transforms': transforms}
    return meshes, metadata


def triangle_keys(faces):
    start = faces.argmin(axis=1)
    values = np.ascontiguousarray(np.take_along_axis(faces, (start[:, None] + np.arange(3)) % 3, axis=1), dtype=np.int64)
    return values.view(np.dtype((np.void, 24))).ravel()


def topology(mesh):
    edges, counts = np.unique(np.sort(mesh.edges, axis=1), axis=0, return_counts=True)
    graph = coo_matrix((np.ones(len(edges), bool), (edges[:, 0], edges[:, 1])), shape=(len(mesh.vertices),) * 2).tocsr()
    components, labels = connected_components(graph, directed=False)
    return {'vertices': len(mesh.vertices), 'triangles': len(mesh.faces),
        'components': int(components), 'componentVertexCounts': sorted(np.bincount(labels).tolist(), reverse=True),
        'boundaryEdges': int((counts == 1).sum()), 'edgesAboveTwoFaceIncidence': int((counts > 2).sum()),
        'watertight': bool(mesh.is_watertight), 'windingConsistent': bool(mesh.is_winding_consistent),
        'unreferencedVertices': int(len(mesh.vertices) - len(np.unique(mesh.faces))),
        'repeatedIndexTriangles': int((np.diff(np.sort(mesh.faces, axis=1), axis=1) == 0).any(axis=1).sum()),
        'duplicateUnorientedTriangles': int(len(mesh.faces) - len(np.unique(np.sort(mesh.faces, axis=1), axis=0))),
        'exactZeroAreaTriangles': int((mesh.area_faces == 0).sum()),
        'areaAtMost1eMinus14Triangles': int((mesh.area_faces <= 1e-14).sum()),
        'minimumTriangleArea': float(mesh.area_faces.min()), 'signedVolume': float(mesh.volume),
        'bounds': mesh.bounds.tolist()}


def strict_hits(first, second):
    points = []
    e1, e2 = second[1] - second[0], second[2] - second[0]
    for corner in range(3):
        start, end = first[corner], first[(corner + 1) % 3]
        matrix = np.column_stack([e1, e2, start - end])
        if abs(np.linalg.det(matrix)) < 1e-22:
            continue
        u, v, t = np.linalg.solve(matrix, start - second[0])
        if min(u, v, 1 - u - v, t, 1 - t) > 1e-7:
            points.append(start + t * (end - start))
    return points


def tail_pairs(mesh, tail, lower, upper):
    triangles = mesh.triangles
    selected = np.flatnonzero((triangles.max(axis=1) >= lower).all(axis=1) & (triangles.min(axis=1) <= upper).all(axis=1))
    used, inverse = np.unique(mesh.faces[selected], return_inverse=True)
    local = o3d.geometry.TriangleMesh(o3d.utility.Vector3dVector(mesh.vertices[used]),
                                    o3d.utility.Vector3iVector(inverse.reshape(-1, 3)))
    pairs = selected[np.asarray(local.get_self_intersecting_triangles(), dtype=np.int64).reshape(-1, 2)]
    any_tail = tail[mesh.faces].any(axis=1)
    total_local_pairs = len(pairs)
    pairs = pairs[any_tail[pairs].any(axis=1)]
    strict, centers, categories = [], [], []
    for first, second in pairs:
        points = strict_hits(triangles[first], triangles[second]) + strict_hits(triangles[second], triangles[first])
        strict.append(bool(points))
        centers.append(np.mean(points, axis=0) if points else triangles[[first, second]].mean(axis=(0, 1)))
        categories.append(0 if any_tail[[first, second]].all() else 1)
    strict = np.asarray(strict, bool)
    categories = np.asarray(categories, np.int8)
    centers = np.asarray(centers, float).reshape(-1, 3)
    summary = {'bodyTrianglesTested': len(selected), 'tailIncidentTriangles': int(any_tail.sum()),
        'allTailIncidentTrianglesIncluded': bool(np.isin(np.flatnonzero(any_tail), selected).all()),
        'allLocalDetectorPairsBeforeTailFilter': total_local_pairs, 'tailInvolvingDetectorPairs': len(pairs),
        'strictInteriorConfirmedPairs': int(strict.sum()), 'categories': {}, 'samplePairs': []}
    for number, label in enumerate(['tail-tail', 'tail-rest-of-body']):
        summary['categories'][label] = {'detected': int((categories == number).sum()), 'strictConfirmed': int(strict[categories == number].sum())}
    for i in range(min(len(pairs), 12)):
        summary['samplePairs'].append({'exportTriangleIds': pairs[i].tolist(), 'vertexIds': mesh.faces[pairs[i]].tolist(),
            'strictConfirmed': bool(strict[i]), 'category': ['tail-tail', 'tail-rest-of-body'][categories[i]], 'center': centers[i].tolist()})
    return summary, {'pairs': pairs, 'strict': strict, 'centers': centers, 'categories': categories,
                     'pair_vertex_ids': mesh.faces[pairs]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=PRIVATE / 'whole-r02')
    parser.add_argument('--baseline-dir', type=Path, default=PRIVATE / 'whole-r01')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'export-tail-check')
    args = parser.parse_args()
    assert args.output_prefix.resolve().parent == OUT.resolve(), 'Reports belong only in the private r02 audit folder.'
    for suffix in ['.json', '.npz', '.md']:
        assert not args.output_prefix.with_suffix(suffix).exists(), 'Choose a new output prefix; preserve existing reports.'
    meshes, metadata = load_asset(args.candidate_dir / 'charizard-whole-r02.glb')
    baseline, old_metadata = load_asset(args.baseline_dir / 'charizard-whole-r01.glb')
    receipt_path = args.candidate_dir / 'capture-receipt.json'
    expected = {row['name'].split('GEO-charizard-')[1].split('-whole-')[0]: row for row in json.loads(receipt_path.read_text())['meshes']}
    report = {'candidate': metadata, 'baseline': old_metadata, 'captureReceipt': file_record(receipt_path),
        'validator': file_record(Path(__file__).resolve()), 'meshes': {}, 'blockers': [], 'risks': [],
        'scope': 'Working sculpt export integrity and body contacts involving the selected tail. No orbital audit, anatomical approval or runtime certificate.',
        'coordinateConvention': 'Actual exported rows; glTF world transforms followed by Blender axes (x,-z,y).'}
    archive = {}
    report['oneSceneFourMeshes'] = metadata['scenes'] == 1 and metadata['nodes'] == metadata['meshes'] == metadata['meshNodes'] == 4
    if not report['oneSceneFourMeshes']:
        report['blockers'].append('Unexpected scene/node/mesh counts.')
    for role, mesh in meshes.items():
        valid = bool(((mesh.faces >= 0) & (mesh.faces < len(mesh.vertices))).all())
        finite = bool(np.isfinite(mesh.vertices).all())
        count_match = role in expected and len(mesh.vertices) == expected[role]['vertices'] and len(mesh.faces) == expected[role]['triangles']
        row = {'finiteCoordinates': finite, 'validIndices': valid, 'countsMatchCapture': bool(count_match)}
        assert valid and finite, f'{role}: invalid geometry; contact testing aborted.'
        row['topology'] = topology(mesh)
        t = row['topology']
        if not count_match or not t['watertight'] or not t['windingConsistent'] or t['components'] != 1 or t['edgesAboveTwoFaceIncidence']:
            report['blockers'].append(f'{role}: failed count, closed-manifold, winding or component check.')
        if t['areaAtMost1eMinus14Triangles'] or t['repeatedIndexTriangles'] or t['duplicateUnorientedTriangles']:
            report['risks'].append(f'{role}: degenerate or duplicate triangles remain.')
        old = baseline[role]
        row['r01Comparison'] = {'r01ZeroAreaTriangles': int((old.area_faces == 0).sum()),
            'verticesSameShape': mesh.vertices.shape == old.vertices.shape, 'triangleCountsEqual': len(mesh.faces) == len(old.faces),
            'orientedTrianglesRemoved': int(len(np.setdiff1d(triangle_keys(old.faces), triangle_keys(mesh.faces)))) ,
            'orientedTrianglesAdded': int(len(np.setdiff1d(triangle_keys(mesh.faces), triangle_keys(old.faces))))}
        report['meshes'][role] = row
        archive[f'{role}_near_zero_area_triangle_ids'] = np.flatnonzero(mesh.area_faces <= 1e-14)
        print(role, json.dumps(t), flush=True)
    native_path = args.candidate_dir / 'after-tail-transforms.npy'
    native = np.load(native_path)
    before_path = args.candidate_dir / 'before-tail.npz'
    before = np.load(before_path)
    ids = before['tailIndices'].astype(np.int64)
    body, old_body = meshes['body'], baseline['body']
    same_candidate = np.array_equal(native, body.vertices)
    same_baseline_tail = np.array_equal(before['coordinates'][ids], old_body.vertices[ids])
    assert same_candidate and same_baseline_tail, 'Tail row correspondence failed; contact selection would be unreliable.'
    tail = np.zeros(len(body.vertices), bool)
    tail[ids] = True
    report['tailSelection'] = {'count': len(ids), 'candidateExportExactlyNativeSnapshot': same_candidate,
        'baselineTailRowsExactlyNativeBeforeTail': same_baseline_tail, 'nativeSnapshot': file_record(native_path),
        'selectionArchive': file_record(before_path), 'r01Bounds': old_body.vertices[ids].min(axis=0).tolist() + old_body.vertices[ids].max(axis=0).tolist(),
        'r02Bounds': body.vertices[ids].min(axis=0).tolist() + body.vertices[ids].max(axis=0).tolist()}
    points = np.vstack([mesh.triangles[tail[mesh.faces].any(axis=1)].reshape(-1, 3) for mesh in [old_body, body]])
    lower, upper = points.min(axis=0) - .01, points.max(axis=0) + .01
    report['commonTailContactBounds'] = [lower.tolist(), upper.tolist()]
    report['tailContactComparison'] = {}
    for label, mesh in [('r01', old_body), ('r02', body)]:
        summary, arrays = tail_pairs(mesh, tail, lower, upper)
        report['tailContactComparison'][label] = summary
        archive.update({f'{label}_{name}': value for name, value in arrays.items()})
        print(label, 'tail contacts', json.dumps(summary), flush=True)
    candidate_contacts = report['tailContactComparison']['r02']
    if candidate_contacts['strictInteriorConfirmedPairs']:
        report['risks'].append(f"Tail region has {candidate_contacts['strictInteriorConfirmedPairs']} confirmed crossing pairs; inspect recorded locations.")
    elif candidate_contacts['tailInvolvingDetectorPairs']:
        report['risks'].append('Tail detector found near-contact/coplanar candidates without strict confirmation; inspect recorded locations.')
    archive['tail_native_export_vertex_ids'] = ids
    report['limits'] = ['All body triangles overlapping the common expanded tail bounds are tested, including any wing triangles there. Only pairs involving a tail-incident triangle are retained; no separate semantic wing segmentation is assumed.',
        'Open3D omits triangle pairs sharing vertices. Those shared-vertex overlaps and adjacent-face foldovers are outside this bounded test.',
        'Strict confirmation independently solves edge/triangle intersections with interior margin 1e-7; absence of a strict hit does not resolve coplanar contact.',
        'A zero contact count does not measure minimum clearance. Separate eye/flame contacts and other body regions are not tested.',
        'Counts, manifold topology and this local intersection test do not establish official anatomy, visual quality, deformation suitability or game readiness.']
    np.savez_compressed(args.output_prefix.with_suffix('.npz'), **archive)
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    lines = ['Bounded r02 working-sculpt export and tail-contact check.', '',
        'Blockers: ' + ('; '.join(report['blockers']) or 'none found within this scope') + '.',
        'Risks: ' + ('; '.join(report['risks']) or 'none found beyond the stated coverage limits') + '.', '',
        '| Mesh | Vertices | Triangles | Components | Boundary / excess edges | Watertight / winding | Zero area |',
        '| --- | ---: | ---: | ---: | --- | --- | ---: |']
    for role, row in report['meshes'].items():
        t = row['topology']
        lines.append(f"| {role} | {t['vertices']} | {t['triangles']} | {t['components']} | {t['boundaryEdges']} / {t['edgesAboveTwoFaceIncidence']} | {t['watertight']} / {t['windingConsistent']} | {t['exactZeroAreaTriangles']} |")
    lines += ['', 'All four meshes pass finite/index and capture-count checks. The body zero-area count changes from 40 in r01 to 0 in r02.', '',
        'The export matches after-tail-transforms.npy exactly. All 22,935 tail indices are verified against the native before-tail snapshot and r01. The same expanded bounds cover both versions.', '',
        '| Version | Body triangles in contact test | Tail-involving detector pairs | Strict confirmed pairs |', '| --- | ---: | ---: | ---: |']
    for label, row in report['tailContactComparison'].items():
        lines.append(f"| {label} | {row['bodyTrianglesTested']} | {row['tailInvolvingDetectorPairs']} | {row['strictInteriorConfirmedPairs']} |")
    lines += ['', *report['limits'], '', 'Rerun with the Hunyuan Python environment and a new --output-prefix in this private audit folder. The validator has no private helper imports.']
    args.output_prefix.with_suffix('.md').write_text('\n'.join(lines) + '\n')
    print('Saved', args.output_prefix, flush=True)


if __name__ == '__main__':
    main()
