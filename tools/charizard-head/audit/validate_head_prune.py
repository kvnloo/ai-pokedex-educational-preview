"""Read-only CPU validation of a head-pruning GLB and its topology receipt."""
import argparse
import hashlib
import json
import struct
from pathlib import Path

import numpy as np
import open3d as o3d
import trimesh
from scipy.spatial import cKDTree

from inspect_head import SOURCE, groups, path_record


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/audit')


def oriented_rows(faces):
    faces = np.asarray(faces, dtype=np.int64)
    first = faces.argmin(axis=1)
    rows = np.ascontiguousarray(np.take_along_axis(faces, (first[:, None] + np.arange(3)) % 3, axis=1))
    return rows.view(np.dtype((np.void, rows.dtype.itemsize * 3))).ravel()


def difference(first, second):
    return {'missing': len(np.setdiff1d(oriented_rows(first), oriented_rows(second))),
            'added': len(np.setdiff1d(oriented_rows(second), oriented_rows(first)))}


def load_asset(path):
    data = path.read_bytes()
    length, _ = struct.unpack_from('<II', data, 12)
    gltf = json.loads(data[20:20 + length])
    scene = trimesh.load(path, force='scene', process=False)
    meshes, transforms = {}, {}
    for label, fragment in [('body', 'body'), ('flame', 'flame')]:
        node = next(name for name in scene.graph.nodes_geometry if fragment in name)
        transform, geometry_name = scene.graph[node]
        mesh = scene.geometry[geometry_name].copy()
        mesh.apply_transform(transform)
        mesh.vertices = mesh.vertices[:, [0, 2, 1]] * [1, -1, 1]
        meshes[label], transforms[label] = mesh, transform.tolist()
    metadata = {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(),
                'structure': {'scenes': len(gltf['scenes']), 'nodes': len(gltf['nodes']), 'meshes': len(gltf['meshes']),
                              'nodeNames': [n.get('name') for n in gltf['nodes']],
                              'meshPrimitiveCounts': [len(m['primitives']) for m in gltf['meshes']]},
                'transforms': transforms}
    return meshes, metadata


def coordinate_mapping(export, coordinates):
    distances, indices = cKDTree(coordinates).query(export.vertices)
    reverse, _ = cKDTree(export.vertices).query(coordinates)
    report = {'exportRows': len(export.vertices), 'auditRows': len(coordinates),
              'uniqueMappedRows': len(np.unique(indices)),
              'maximumExportToAuditDistance': float(distances.max()),
              'maximumAuditToExportDistance': float(reverse.max()),
              'originalRowOrderExact': bool(np.array_equal(export.vertices, coordinates))}
    assert distances.max() == 0 and reverse.max() == 0 and len(np.unique(indices)) == len(coordinates) == len(export.vertices), report
    return indices, report


def topology(mesh):
    f = mesh.faces
    directed = np.concatenate([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]])
    edges, inverse, counts = np.unique(np.sort(directed, axis=1), axis=0, return_inverse=True, return_counts=True)
    balance = np.bincount(inverse, weights=np.where(directed[:, 0] < directed[:, 1], 1, -1))
    return {'vertices': len(mesh.vertices), 'triangles': len(f),
            'components': len(mesh.split(only_watertight=False)),
            'eulerCharacteristic': len(mesh.vertices) - len(edges) + len(f),
            'boundaryEdges': int((counts == 1).sum()), 'edgesAboveTwoFaceIncidence': int((counts > 2).sum()),
            'interiorEdgesWithInconsistentWinding': int(((counts == 2) & (balance != 0)).sum()),
            'repeatedIndexTriangles': int(((f[:, 0] == f[:, 1]) | (f[:, 1] == f[:, 2]) | (f[:, 2] == f[:, 0])).sum()),
            'duplicateOrientedTriangles': len(f) - len(np.unique(oriented_rows(f))),
            'areaAtMost1eMinus14Triangles': int((mesh.area_faces <= 1e-14).sum()),
            'minimumTriangleArea': float(mesh.area_faces.min()),
            'watertight': bool(mesh.is_watertight), 'windingConsistent': bool(mesh.is_winding_consistent),
            'signedVolume': float(mesh.volume), 'surfaceArea': float(mesh.area), 'bounds': mesh.bounds.tolist()}


def select_head(mesh):
    high = mesh.vertices[:, 2] > .30
    components = groups(mesh.vertices, mesh.edges_unique, high)
    seed = np.array([-.06, -.72, .45])
    ids = min(components, key=lambda values: np.linalg.norm(mesh.vertices[values] - seed, axis=1).min())
    selected = np.zeros(len(mesh.vertices), bool)
    selected[ids] = True
    return selected


def local_intersections(mesh, identity, lower, upper, cap_keys):
    triangles = mesh.vertices[mesh.faces]
    selected = (triangles.max(axis=1) >= lower).all(axis=1) & (triangles.min(axis=1) <= upper).all(axis=1)
    ids = np.flatnonzero(selected)
    used, inverse = np.unique(mesh.faces[ids], return_inverse=True)
    local = o3d.geometry.TriangleMesh(o3d.utility.Vector3dVector(mesh.vertices[used]), o3d.utility.Vector3iVector(inverse.reshape(-1, 3)))
    pairs = np.asarray(local.get_self_intersecting_triangles(), dtype=np.int64).reshape(-1, 2)
    pairs = ids[pairs]
    stable_faces = identity[mesh.faces]
    pair_set = {tuple(sorted(tuple(sorted(map(int, stable_faces[face]))) for face in pair)) for pair in pairs}
    details = []
    for pair in pairs:
        positions = triangles[pair].reshape(-1, 3)
        details.append({'exportFaceIds': pair.tolist(), 'stableTriangleIds': stable_faces[pair].tolist(),
                        'triangleBounds': [positions.min(axis=0).tolist(), positions.max(axis=0).tolist()],
                        'meanOfSixTriangleVertices': positions.mean(axis=0).tolist(),
                        'involvesNewCapTriangle': bool(np.isin(oriented_rows(stable_faces[pair]), cap_keys).any())})
    return {'trianglesTested': len(ids), 'pairCount': len(pairs), 'pairs': details}, pair_set


def sections(mesh, head):
    subset = trimesh.Trimesh(mesh.vertices, mesh.faces[head[mesh.faces].any(axis=1)], process=False)
    rows = []
    for cut in np.round(np.arange(-.60, -.349, .01), 3):
        section = subset.section(plane_origin=[0, cut, 0], plane_normal=[0, 1, 0])
        paths = section.discrete if section is not None else []
        records = [path_record(line) for line in paths]
        posterior = head & (mesh.vertices[:, 1] > cut)
        components = groups(mesh.vertices, mesh.edges_unique, posterior) if posterior.any() else []
        rows.append({'y': float(cut), 'closedLoopCount': sum(r['closed'] for r in records),
                     'posteriorGraphComponents': len(components), 'closedPaths': records})
    return rows


def planar_overlap_area(first, second):
    """Convex triangle clipping, used only for coplanar shared-center pairs."""
    def cross(a, b):
        return a[0] * b[1] - a[1] * b[0]

    clip = second.copy()
    if cross(clip[1] - clip[0], clip[2] - clip[0]) < 0:
        clip = clip[::-1]
    polygon = list(first)
    for edge_index in range(3):
        start, end = clip[edge_index], clip[(edge_index + 1) % 3]
        result = []
        if not polygon:
            return 0.
        previous = polygon[-1]
        previous_side = cross(end - start, previous - start)
        for current in polygon:
            current_side = cross(end - start, current - start)
            if (current_side >= 0) != (previous_side >= 0):
                result.append(previous + (current - previous) * previous_side / (previous_side - current_side))
            if current_side >= 0:
                result.append(current)
            previous, previous_side = current, current_side
        polygon = result
    if len(polygon) < 3:
        return 0.
    points = np.array(polygon)
    return abs(sum(cross(points[i], points[(i + 1) % len(points)]) for i in range(len(points)))) / 2


def shared_center_intersections(coordinates, caps, new_rows):
    tested, coplanar, hits = 0, 0, []
    for center in new_rows:
        selected = np.flatnonzero((caps == center).any(axis=1))
        for left_index, first in enumerate(selected):
            for second in selected[left_index + 1:]:
                tested += 1
                aa = coordinates[caps[first][caps[first] != center]] - coordinates[center]
                bb = coordinates[caps[second][caps[second] != center]] - coordinates[center]
                n1, n2 = np.cross(*aa), np.cross(*bb)
                n1, n2 = n1 / np.linalg.norm(n1), n2 / np.linalg.norm(n2)
                direction = np.cross(n1, n2)
                length = np.linalg.norm(direction)
                hit = None
                if length <= 1e-9:
                    coplanar += 1
                    axes = [axis for axis in range(3) if axis != np.argmax(abs(n1))]
                    area = planar_overlap_area(np.vstack([np.zeros(3), aa])[:, axes], np.vstack([np.zeros(3), bb])[:, axes])
                    if area > 1e-14:
                        hit = {'type': 'coplanarAreaOverlap', 'projectedOverlapArea': float(area)}
                else:
                    direction /= length
                    for sign in [1, -1]:
                        ray = direction * sign
                        ca = np.linalg.lstsq(aa.T, ray, rcond=None)[0]
                        cb = np.linalg.lstsq(bb.T, ray, rcond=None)[0]
                        if min(ca.min(), cb.min()) <= 0:
                            continue
                        extent = min(1 / ca.sum(), 1 / cb.sum())
                        if extent > 1e-7 and min(ca.min(), cb.min()) * extent / 2 > 1e-8:
                            hit = {'type': 'properInteriorRayBeyondSharedCenter', 'intersectionSegmentLength': float(extent),
                                   'segmentEndpoints': [coordinates[center].tolist(), (coordinates[center] + ray * extent).tolist()]}
                            break
                if hit:
                    hits.append({'receiptCapTriangleIds': [int(first), int(second)],
                                 'auditTriangleVertexRows': caps[[first, second]].tolist(),
                                 'sharedCenterAuditRow': int(center), **hit})
    return {'method': 'All pairs within each receipt fan, including pairs Open3D omits due to a shared center. Noncoplanar pairs are tested for a ray lying strictly inside both triangle cones beyond the shared center; nearly coplanar pairs use 2D convex clipping. Thresholds: normal cross <=1e-9 for coplanarity, overlap area >1e-14, interior ray length >1e-7 and midpoint barycentric weights >1e-8.',
            'pairsTested': tested, 'nearlyCoplanarPairs': coplanar, 'detectedOverlapPairs': len(hits), 'pairs': hits}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=OUT.parent / 'head-r01')
    parser.add_argument('--candidate-file', default='charizard-head-r01.glb')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'head-r01-validation')
    args = parser.parse_args()
    audit_path = args.candidate_dir / 'topology-audit.npz'
    receipt_path = args.candidate_dir / 'prune-receipt.json'
    archive = np.load(audit_path)
    receipt = json.loads(receipt_path.read_text())
    before, after = archive['before'].astype(float), archive['after'].astype(float)
    parent_ids = archive['parent_vertex_ids'].astype(np.int64)
    parent_face_ids = archive['parent_face_ids'].astype(np.int64)
    removed_vertices = archive['removed_parent_vertices'].astype(np.int64)
    removed_faces = archive['removed_parent_faces'].astype(np.int64)
    protected = archive['protected']
    retained = parent_ids >= 0
    new_vertex_rows = np.flatnonzero(~retained)
    identity = parent_ids.copy()
    identity[~retained] = len(before) + np.arange(len(new_vertex_rows))
    meshes, report = {}, {'coordinateConvention': 'Apply glTF scene transform, then (x,-z,y) to Blender world.',
                          'stableIdConvention': 'Source IDs are frozen r02e exported body POSITION rows, validated against audit.before. New centers receive distinct diagnostic IDs starting at 122336; candidate export row IDs are also reported.',
                          'audit': {'path': str(audit_path), 'sha256': hashlib.sha256(audit_path.read_bytes()).hexdigest()},
                          'receipt': {'path': str(receipt_path), 'sha256': hashlib.sha256(receipt_path.read_bytes()).hexdigest()},
                          'versions': {}}
    for label, path, coordinates in [('source', SOURCE, before), ('candidate', args.candidate_dir / args.candidate_file, after)]:
        asset, metadata = load_asset(path)
        mapping, map_report = coordinate_mapping(asset['body'], coordinates)
        meshes[label] = asset['body']
        metadata['coordinateBijection'] = map_report
        metadata['exportToAuditRows'] = mapping
        metadata['body'] = topology(asset['body'])
        metadata['flame'] = topology(asset['flame'])
        metadata['flameMesh'] = asset['flame']
        report['versions'][label] = metadata
    source, candidate = meshes['source'], meshes['candidate']
    source_map = report['versions']['source']['exportToAuditRows']
    candidate_map = report['versions']['candidate']['exportToAuditRows']
    assert np.array_equal(source_map, np.arange(len(before))), 'before must use original frozen export IDs'
    source_faces = source_map[source.faces]
    candidate_after_faces = candidate_map[candidate.faces]
    candidate_faces = identity[candidate_after_faces]
    source_head = select_head(source)
    expected_protected = ~source_head
    candidate_head = select_head(candidate)
    original_polygon_count = len(parent_face_ids) - int((parent_face_ids < 0).sum()) + len(removed_faces)
    npz_checks = {
        'protectedMaskMatchesIndependentHeadComplement': bool(np.array_equal(protected, expected_protected)),
        'protectedVertexCount113062': int(protected.sum()) == 113062,
        'allRetainedCoordinatesExact': bool(np.array_equal(after[retained], before[parent_ids[retained]])),
        'retainedParentVertexIdsUnique': len(np.unique(parent_ids[retained])) == int(retained.sum()),
        'removedVertexComplementExact': bool(np.array_equal(np.setdiff1d(np.arange(len(before)), parent_ids[retained]), removed_vertices)),
        'removedVertexCountMatchesReceipt': len(removed_vertices) == receipt['removedVertices'] == 1033,
        'newCenterCountMatchesReceipt': len(new_vertex_rows) == receipt['newVertices'] == 2,
        'removedPolygonCountMatchesReceipt': len(removed_faces) == receipt['removedPolygons'] == 2217,
        'newPolygonCountMatchesReceipt': int((parent_face_ids < 0).sum()) == receipt['newTriangles'] == 155,
        'retainedParentPolygonIdsExact': bool(np.array_equal(np.sort(parent_face_ids[parent_face_ids >= 0]), np.setdiff1d(np.arange(original_polygon_count), removed_faces))),
    }
    report['audit']['checks'] = npz_checks
    old_protected_ids = np.flatnonzero(protected)
    parent_to_after = np.full(len(before), -1, dtype=np.int64)
    parent_to_after[parent_ids[retained]] = np.flatnonzero(retained)
    retained_protected = parent_to_after[old_protected_ids] >= 0
    protected_displacement = np.linalg.norm(after[parent_to_after[old_protected_ids[retained_protected]]] - before[old_protected_ids[retained_protected]], axis=1)
    protected_identity = np.r_[protected, np.zeros(len(new_vertex_rows), bool)]
    old_protected_faces = source_faces[protected[source_faces].all(axis=1)]
    new_protected_faces = candidate_faces[protected_identity[candidate_faces].all(axis=1)]
    report['protected'] = {'expectedVertices': len(old_protected_ids), 'retainedVertices': int(retained_protected.sum()),
                           'removedProtectedVertexIds': old_protected_ids[~retained_protected].tolist(),
                           'maximumCoordinateDisplacement': float(protected_displacement.max()),
                           'orientedTrianglesBefore': len(old_protected_faces), 'orientedTrianglesAfter': len(new_protected_faces),
                           **difference(old_protected_faces, new_protected_faces)}
    cap_after_faces = np.asarray(receipt['newTriangleVertexIds'], dtype=np.int64)
    cap_faces = identity[cap_after_faces]
    cap_keys = oriented_rows(cap_faces)
    old_keys, new_keys = oriented_rows(source_faces), oriented_rows(candidate_faces)
    deleted_faces = source_faces[~np.isin(old_keys, new_keys)]
    created_faces = candidate_faces[~np.isin(new_keys, old_keys)]
    patches = []
    for patch in receipt['patches']:
        center_rows = np.flatnonzero(np.all(after == patch['center'], axis=1))
        assert len(center_rows) == 1 and parent_ids[center_rows[0]] == -1
        center = int(center_rows[0])
        fan = cap_after_faces[(cap_after_faces == center).any(axis=1)]
        edge_rows = np.sort(np.concatenate([fan[:, [0, 1]], fan[:, [1, 2]], fan[:, [2, 0]]]), axis=1)
        unique_edges, counts = np.unique(edge_rows, axis=0, return_counts=True)
        boundary_edges = unique_edges[counts == 1]
        boundary_parent = parent_ids[np.unique(boundary_edges)]
        patches.append({'centerAuditRow': center, 'centerDiagnosticStableId': int(identity[center]),
                        'centerCoordinate': after[center].tolist(), 'triangles': len(fan),
                        'boundaryVertices': len(boundary_parent),
                        'declaredBoundaryMatches': bool(np.array_equal(np.sort(patch['boundaryParentVertexIds']), np.sort(boundary_parent))),
                        'eulerCharacteristic': len(np.unique(fan)) - len(unique_edges) + len(fan),
                        'allFanTrianglesHaveExactlyOneNewCenter': bool(((parent_ids[fan] < 0).sum(axis=1) == 1).all())})
    patch_checks = {'allReceiptCapsPresentWithOrientation': bool(np.isin(cap_keys, new_keys).all()),
                    'receiptCapsUnique': len(np.unique(cap_keys)) == len(cap_keys),
                    'canonicalNewTrianglesExactlyReceiptCaps': difference(created_faces, cap_faces) == {'missing': 0, 'added': 0},
                    'canonicalDeletedTriangleCountMatchesReceipt': len(deleted_faces) == 2217,
                    'twoDeclaredDiskFans': len(patches) == 2 and all(p['declaredBoundaryMatches'] and p['eulerCharacteristic'] == 1 and p['allFanTrianglesHaveExactlyOneNewCenter'] for p in patches)}
    report['capCorrespondence'] = {'deletedExportTriangles': len(deleted_faces), 'newExportTriangles': len(created_faces),
                                    'newAuditVertexRows': new_vertex_rows.tolist(), 'checks': patch_checks, 'patches': patches}
    report['sharedCenterCapIntersections'] = shared_center_intersections(after, cap_after_faces, new_vertex_rows)
    print('shared-center cap overlaps', report['sharedCenterCapIntersections']['detectedOverlapPairs'], flush=True)
    lower, upper = source.vertices[source_head].min(axis=0) - .03, source.vertices[source_head].max(axis=0) + .03
    report['localIntersectionBounds'] = [lower.tolist(), upper.tolist()]
    report['localIntersectionMethod'] = 'Open3D ' + o3d.__version__ + ': all body triangles with AABBs overlapping the frozen head bounds expanded by .03, identical for source and candidate. Pair correspondence uses parent IDs plus distinct new-center IDs. Shared-vertex pairs are omitted by this test; fan triangles sharing their center require separate attention if visual evidence suggests folds. This is not a whole-model test or a flame/body test.'
    pair_sets = {}
    for label, ids in [('source', source_map), ('candidate', identity[candidate_map])]:
        result, pair_sets[label] = local_intersections(meshes[label], ids, lower, upper, cap_keys)
        result['newPairsAgainstSource'] = len(pair_sets[label] - pair_sets['source'])
        result['retainedPairsFromSource'] = len(pair_sets[label] & pair_sets['source'])
        result['removedSourcePairs'] = len(pair_sets['source'] - pair_sets[label])
        report['versions'][label]['localIntersections'] = result
        print(label, 'local intersections', result['pairCount'], flush=True)
    report['posteriorSections'] = {label: sections(meshes[label], head) for label, head in [('source', source_head), ('candidate', candidate_head)]}
    report['headVertexCounts'] = {'source': int(source_head.sum()), 'candidate': int(candidate_head.sum())}
    candidate_report, source_report = report['versions']['candidate'], report['versions']['source']
    flame_exact = bool(np.array_equal(candidate_report['flameMesh'].vertices, source_report['flameMesh'].vertices) and np.array_equal(candidate_report['flameMesh'].faces, source_report['flameMesh'].faces))
    report['flameCoordinatesAndTrianglesExact'] = flame_exact
    report['signedVolumeChangePercent'] = 100 * (candidate.volume / source.volume - 1)
    report['surfaceAreaChangePercent'] = 100 * (candidate.area / source.area - 1)
    body = candidate_report['body']
    source_rows = {row['y']: row for row in report['posteriorSections']['source']}
    candidate_rows = {row['y']: row for row in report['posteriorSections']['candidate']}
    report['checks'] = {
        'sourceAndCandidateCoordinateBijections': True,
        'sourceCanonicalMapAndReceipt': all(npz_checks.values()),
        'oneSceneTwoMeshNodes': candidate_report['structure']['scenes'] == 1 and candidate_report['structure']['nodes'] == 2 and candidate_report['structure']['meshes'] == 2,
        'expectedBodyCounts': body['vertices'] == 121305 and body['triangles'] == 242610,
        'protectedCoordinatesAndOrientedTriangles': retained_protected.all() and protected_displacement.max() == 0 and report['protected']['missing'] == 0 and report['protected']['added'] == 0,
        'capReceiptCorrespondence': all(patch_checks.values()),
        'bodyTopology': body['components'] == 1 and body['watertight'] and body['windingConsistent'] and body['boundaryEdges'] == 0 and body['edgesAboveTwoFaceIncidence'] == 0 and body['repeatedIndexTriangles'] == 0 and body['areaAtMost1eMinus14Triangles'] == 0 and body['duplicateOrientedTriangles'] == 0,
        'flameExact': flame_exact,
        'noNewDetectedLocalIntersectionPairs': candidate_report['localIntersections']['newPairsAgainstSource'] == 0,
        'noDetectedSharedCenterCapOverlaps': report['sharedCenterCapIntersections']['detectedOverlapPairs'] == 0,
        'fiveToTwoClosedBranchesAtThreePlanes': all(source_rows[y]['closedLoopCount'] == 5 and candidate_rows[y]['closedLoopCount'] == 2 for y in [-.58, -.57, -.56]),
    }
    report['checks'] = {key: bool(value) for key, value in report['checks'].items()}
    report['limits'] = ['Closed paths omit the open neck-truncated section; posterior graph components include the neck remainder.', 'Numerical branch counts do not establish horn identity or artistic acceptance.', 'No mesh or target coordinates are authored.', 'Local intersection coverage and shared-vertex limitations are stated above.']
    for version in report['versions'].values():
        del version['exportToAuditRows']
        del version['flameMesh']
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    failures = [key for key, value in report['checks'].items() if not value]
    rows = [f"| {y:.2f} | {source_rows[y]['closedLoopCount']} | {candidate_rows[y]['closedLoopCount']} | {source_rows[y]['posteriorGraphComponents']} | {candidate_rows[y]['posteriorGraphComponents']} |" for y in [-.60, -.59, -.58, -.57, -.56, -.55, -.54, -.47, -.46, -.35]]
    markdown = f'''# Head pruning export validation

{'All stated numerical gates pass.' if not failures else 'Numerical gates fail: ' + ', '.join(failures) + '.'}

The candidate has {body['vertices']:,} body vertices and {body['triangles']:,} triangles. Export coordinates map bijectively and exactly to the audit arrays. All {int(retained.sum()):,} retained source coordinates remain exact. The {len(old_protected_ids):,} protected vertices have {report['protected']['maximumCoordinateDisplacement']} maximum displacement; protected oriented triangles total {len(old_protected_faces):,} before and {len(new_protected_faces):,} after, with {report['protected']['missing']} missing and {report['protected']['added']} added. The flame's world coordinates and triangle arrays are exact.

Canonical comparison finds {len(deleted_faces):,} removed and {len(created_faces):,} added triangles. The receipt's 155 new cap triangles are checked with orientation against the actual export. Its two fan patches have {patches[0]['boundaryVertices']} and {patches[1]['boundaryVertices']} boundary vertices. Their exact boundary membership and Euler characteristics are recorded in JSON. Body component count is {body['components']}, boundary-edge count {body['boundaryEdges']}, excess-incidence edge count {body['edgesAboveTwoFaceIncidence']}, inconsistent interior-edge winding count {body['interiorEdgesWithInconsistentWinding']}, and tested degenerate triangle count {body['areaAtMost1eMinus14Triangles']}.

The common expanded head AABB is {report['localIntersectionBounds']}. Open3D finds {source_report['localIntersections']['pairCount']} source pairs and {candidate_report['localIntersections']['pairCount']} candidate pairs, including {candidate_report['localIntersections']['newPairsAgainstSource']} new and {candidate_report['localIntersections']['retainedPairsFromSource']} retained source pairs. Exact export face IDs, stable triangle triples and triangle bounds are in JSON. An additional shared-center test covers {report['sharedCenterCapIntersections']['pairsTested']} fan-triangle pairs skipped by Open3D and reports {report['sharedCenterCapIntersections']['detectedOverlapPairs']} overlaps. Other shared-vertex configurations, the remainder of the body and separate flame/body intersections are outside these gates. This does not certify whole-model intersection freedom.

Signed volume changes {report['signedVolumeChangePercent']:.9f} percent; surface area changes {report['surfaceAreaChangePercent']:.9f} percent. These describe the removed geometry and caps, not anatomical correctness.

| Y plane | Source closed loops | Candidate closed loops | Source graph components | Candidate graph components |
| --- | ---: | ---: | ---: | ---: |
{chr(10).join(rows)}

The extra graph component is the neck remainder. Five-to-two closed loops at -.58, -.57 and -.56 test geometric branch reduction only.

Rerun `validate_head_prune.py` with the Hunyuan Python environment. It accepts `--candidate-dir`, `--candidate-file` and `--output-prefix`, reads existing GLB/NPZ/JSON files, and writes only audit JSON/Markdown. It imports existing measurement helpers from `inspect_head.py`. No Blender calls or geometry authoring occur.
'''
    args.output_prefix.with_suffix('.md').write_text(markdown)
    print(json.dumps({'checks': report['checks'], 'protected': report['protected'], 'caps': report['capCorrespondence'], 'volumeChangePercent': report['signedVolumeChangePercent']}, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
