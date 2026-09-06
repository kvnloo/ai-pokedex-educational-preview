"""Read-only exported r07 -> r14 grid -> r15 fairing geometry validation."""
import argparse
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/audit')
R04 = OUT.parent
R03 = R04.parent / 'anatomy-r03'
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'charizard-head/audit'))
from validate_head_prune import (coordinate_mapping, difference, load_asset,
    local_intersections, oriented_rows, select_head, shared_center_intersections, topology)


def file_record(path):
    return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def edges(faces):
    directed = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    unique, inverse, counts = np.unique(np.sort(directed, axis=1), axis=0, return_inverse=True, return_counts=True)
    balance = np.bincount(inverse, weights=np.where(directed[:, 0] < directed[:, 1], 1, -1))
    return unique, counts, balance


def row_set(rows):
    return {tuple(map(int, row)) for row in rows}


def percentiles(values):
    return dict(zip(['min', 'p10', 'median', 'p90', 'p99', 'max'], map(float, np.percentile(values, [0, 10, 50, 90, 99, 100]))))


def enclosed_patch(mesh, mapping, identities, boundary_cycle, seed_rows):
    """Select the side of a fixed edge cycle containing the declared interior rows.

    Set-difference alone misses an old triangle recreated by grid triangulation.
    Cutting dual-graph adjacency at the actual boundary includes that triangle.
    """
    boundary_edges = np.sort(np.column_stack([boundary_cycle, np.roll(boundary_cycle, -1)]), axis=1).astype(np.int64)
    actual_edges = np.sort(identities[mapping[mesh.face_adjacency_edges]], axis=1).astype(np.int64)
    edge_keys = np.ascontiguousarray(actual_edges).view('V16').ravel()
    boundary_keys = np.ascontiguousarray(boundary_edges).view('V16').ravel()
    assert np.isin(boundary_keys, edge_keys).all(), 'Every declared boundary edge must exist in the export.'
    adjacency = mesh.face_adjacency[~np.isin(edge_keys, boundary_keys)]
    row = np.r_[adjacency[:, 0], adjacency[:, 1]]
    col = np.r_[adjacency[:, 1], adjacency[:, 0]]
    graph = coo_matrix((np.ones(len(row)), (row, col)), shape=(len(mesh.faces), len(mesh.faces))).tocsr()
    _, labels = connected_components(graph, directed=False)
    stable_faces = identities[mapping[mesh.faces]]
    seed_faces = np.isin(stable_faces, seed_rows).any(axis=1)
    selected_labels = np.unique(labels[seed_faces])
    assert len(selected_labels) == 1, 'Declared patch interior must occupy one component inside the boundary.'
    return labels == selected_labels[0]


def patch_metrics(mesh, mask, mapping, identities):
    faces = mesh.faces[mask]
    unique_edges, counts, balance = edges(faces)
    boundary = unique_edges[counts == 1]
    used, boundary_rows = np.unique(faces), np.unique(boundary)
    degrees = np.bincount(boundary.ravel(), minlength=len(mesh.vertices))
    # Connected boundary traversal is read-only and handles invalid patches by reporting failure.
    seen, pending = set(), [int(boundary_rows[0])]
    adjacency = {int(v): [] for v in boundary_rows}
    for a, b in boundary:
        adjacency[int(a)].append(int(b))
        adjacency[int(b)].append(int(a))
    while pending:
        vertex = pending.pop()
        if vertex in seen:
            continue
        seen.add(vertex)
        pending.extend(adjacency[vertex])
    triangles = mesh.vertices[faces]
    lengths = np.linalg.norm(np.roll(triangles, -1, axis=1) - triangles, axis=2)
    areas = mesh.area_faces[mask]
    angles = []
    for corner in range(3):
        first = triangles[:, (corner + 1) % 3] - triangles[:, corner]
        second = triangles[:, (corner + 2) % 3] - triangles[:, corner]
        cosine = np.einsum('ij,ij->i', first, second) / (np.linalg.norm(first, axis=1) * np.linalg.norm(second, axis=1))
        angles.append(np.degrees(np.arccos(np.clip(cosine, -1, 1))))
    all_adjacency = mesh.face_adjacency
    selected_adjacency = mask[all_adjacency]
    interior = selected_adjacency.all(axis=1)
    seam = selected_adjacency.sum(axis=1) == 1
    result = {
        'vertices': len(used), 'triangles': len(faces), 'edges': len(unique_edges),
        'eulerCharacteristic': len(used) - len(unique_edges) + len(faces),
        'boundaryEdges': len(boundary), 'interiorVertices': len(used) - len(boundary_rows),
        'boundaryOneSimpleCycle': len(seen) == len(boundary_rows) and bool((degrees[boundary_rows] == 2).all()),
        'excessEdgeIncidences': int((counts > 2).sum()),
        'inconsistentInteriorEdges': int(((counts == 2) & (balance != 0)).sum()),
        'area': percentiles(areas), 'minimumAngleDegrees': percentiles(np.min(angles, axis=0)),
        'longestEdgeOverMinimumAltitude': percentiles(lengths.max(axis=1) ** 2 / (2 * areas)),
        'interiorAdjacentNormalAngleDegrees': percentiles(np.degrees(mesh.face_adjacency_angles[interior])),
        'boundaryAdjacentNormalAngleDegrees': percentiles(np.degrees(mesh.face_adjacency_angles[seam])),
        'boundaryStableEdges': np.sort(identities[mapping[boundary]], axis=1).tolist(),
        'exportTriangleIds': np.flatnonzero(mask).tolist(),
        'triangleStableVertexTriples': identities[mapping[faces]].tolist(),
        'bounds': [mesh.vertices[used].min(axis=0).tolist(), mesh.vertices[used].max(axis=0).tolist()],
    }
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--grid-dir', type=Path, default=R04 / 'head-r14')
    parser.add_argument('--candidate-dir', type=Path, default=R04 / 'head-r15')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'head-r15-validation')
    args = parser.parse_args()
    assert args.output_prefix.resolve().parent == OUT, 'Write receipts only in this private audit folder.'
    grid_path, fair_path = args.grid_dir / 'divot-audit.npz', args.candidate_dir / 'fair-audit.npz'
    grid, fair = np.load(grid_path), np.load(fair_path)
    grid_receipt_path, fair_receipt_path = args.grid_dir / 'divot-receipt.json', args.candidate_dir / 'fair-receipt.json'
    grid_receipt, fair_receipt = json.loads(grid_receipt_path.read_text()), json.loads(fair_receipt_path.read_text())
    sliver_path, horn_path = R04 / 'head-r07/sliver-audit.npz', R03 / 'head-r06/horn-audit.npz'
    sliver, horn = np.load(sliver_path), np.load(horn_path)
    frozen_path = R04.parent / 'anatomy-r02/r02e/charizard-tail-r02e.glb'
    paths = {'r07': R04 / 'head-r07/charizard-head-r07.glb',
             'r14': args.grid_dir / 'charizard-head-r14.glb',
             'r15': args.candidate_dir / 'charizard-head-r15.glb'}
    coords = {'r07': grid['before'], 'r14': grid['after'], 'r15': fair['after']}
    parent = grid['parent_vertex_ids'].astype(np.int64)
    retained, new = parent >= 0, parent < 0
    identity = parent.copy()
    identity[new] = len(coords['r07']) + np.arange(new.sum())
    identities = {'r07': np.arange(len(coords['r07'])), 'r14': identity, 'r15': identity}
    report = {'inputs': [file_record(p) for p in [grid_path, fair_path, grid_receipt_path, fair_receipt_path, sliver_path, horn_path]],
              'coordinateConvention': 'Apply glTF world transform, then (x,-z,y) to Blender axes.',
              'identityConvention': 'Stable IDs below are r07 audit rows; new grid IDs start at the r07 vertex count. Each export is independently mapped to its audit. Exported triangle rows are not native Blender polygon IDs.',
              'versions': {}}
    meshes, flames, mappings, stable = {}, {}, {}, {}
    for label, path in paths.items():
        asset, metadata = load_asset(path)
        mesh, flame = asset['body'], asset['flame']
        mapping, map_report = coordinate_mapping(mesh, coords[label])
        meshes[label], flames[label], mappings[label] = mesh, flame, mapping
        stable[label] = identities[label][mapping[mesh.faces]]
        metadata['coordinateBijection'] = map_report
        metadata['body'] = topology(mesh)
        report['versions'][label] = metadata
        print(label, 'export mapped', len(mesh.vertices), 'vertices', flush=True)
    free = fair['free'].astype(np.int64)
    displacement = np.linalg.norm(fair['after'].astype(float) - fair['before'].astype(float), axis=1)
    changed = np.flatnonzero(displacement != 0)
    retained_ids = parent[retained]
    r07_to_after = np.full(len(coords['r07']), -1, dtype=np.int64)
    r07_to_after[retained_ids] = np.flatnonzero(retained)
    expected_protected = np.zeros(len(parent), bool)
    expected_protected[retained] = sliver['protected'][retained_ids]
    map_checks = {
        'r14BeforeExactlyR07AuditAfter': np.array_equal(grid['before'], sliver['after']),
        'r15BeforeExactlyR14AuditAfter': np.array_equal(fair['before'], grid['after']),
        'r15R07IdentityMapExactlyR14': np.array_equal(fair['head_r07_vertex_ids'], parent),
        'retainedParentIdsUnique': len(np.unique(retained_ids)) == retained.sum(),
        'removedComplementExact': np.array_equal(np.setdiff1d(np.arange(len(coords['r07'])), retained_ids), np.sort(grid['removed_parent_vertices'])),
        'r14RetainedCoordinatesExact': np.array_equal(grid['after'][retained], grid['before'][retained_ids]),
        'r15RetainedCoordinatesExact': np.array_equal(fair['after'][retained], grid['before'][retained_ids]),
        'onlyDeclaredFreeVerticesMoved': np.isin(changed, free).all(),
        'freeVerticesExactlyNewGridRows': np.array_equal(np.sort(free), np.flatnonzero(new)),
        'r14ProtectedMaskExact': np.array_equal(grid['protected'], expected_protected),
        'r15ProtectedMaskExact': np.array_equal(fair['protected'], expected_protected),
        'receiptCountsExact': len(grid['removed_parent_vertices']) == grid_receipt['removedVertices'] == 1317 and new.sum() == grid_receipt['newVertices'] == fair_receipt['freeVertices'] == 289 and retained.sum() == grid_receipt['retainedVerticesExact'] == 121314,
    }
    report['chain'] = {'checks': {k: bool(v) for k, v in map_checks.items()}, 'changedVertices': len(changed),
                       'displacementOnFreeVertices': percentiles(displacement[free]),
                       'maximumDisplacementDifferenceFromReceipt': float(abs(displacement.max() - fair_receipt['maxDisplacement']))}
    old_keys = oriented_rows(stable['r07'])
    expected_boundary = grid['boundary_parent_vertices']
    seeds = {'r07': grid['removed_parent_vertices'], 'r14': identity[new], 'r15': identity[new]}
    masks = {label: enclosed_patch(mesh, mappings[label], identities[label], expected_boundary, seeds[label]) for label, mesh in meshes.items()}
    recreated = np.flatnonzero(masks['r14'] & np.isin(oriented_rows(stable['r14']), old_keys))
    report['patchCorrespondence'] = {'method': 'Flood-fill dual face graph after cutting the actual declared 72 boundary edges; seed with removed r07 rows or new grid rows. This includes old triangles recreated exactly by grid triangulation.',
        'recreatedR14ExportTriangleIds': recreated.tolist(),
        'recreatedR07StableVertexTriples': stable['r14'][recreated].tolist(),
        'triangleSetDifferenceOnlyRemoved': int((~np.isin(old_keys, oriented_rows(stable['r14']))).sum()),
        'triangleSetDifferenceOnlyAdded': int((~np.isin(oriented_rows(stable['r14']), old_keys)).sum())}
    report['patches'] = {label: patch_metrics(mesh, masks[label], mappings[label], identities[label]) for label, mesh in meshes.items()}
    expected_edges = row_set(np.sort(np.column_stack([expected_boundary, np.roll(expected_boundary, -1)]), axis=1))
    old_boundary = row_set(report['patches']['r07']['boundaryStableEdges'])
    boundary_ids = np.unique(report['patches']['r07']['boundaryStableEdges'])
    # Receipt boundary may be a vertex set; independently compare its edges only when it is ordered.
    boundary = {'vertices': len(boundary_ids), 'r07StableVertexIds': boundary_ids.tolist(),
                'receiptContainsExactlyBoundaryVertices': np.array_equal(np.sort(expected_boundary), boundary_ids),
                'receiptOrderIsBoundaryCycle': expected_edges == old_boundary,
                'r14AndR15BoundaryEdgesExactlyR07': all(row_set(report['patches'][v]['boundaryStableEdges']) == old_boundary for v in ['r14', 'r15']),
                'boundaryCoordinatesExact': bool((r07_to_after[boundary_ids] >= 0).all() and np.array_equal(fair['after'][r07_to_after[boundary_ids]], grid['before'][boundary_ids]))}
    report['boundary'] = boundary
    exterior = {label: difference(stable['r07'][~masks['r07']], stable[label][~masks[label]]) for label in ['r14', 'r15']}
    report['exterior'] = {'r07OrientedTriangles': int((~masks['r07']).sum()), 'differences': exterior,
                          'r14ToR15AllOrientedTopologyDifference': difference(stable['r14'], stable['r15'])}
    frozen, frozen_meta = load_asset(frozen_path)
    source_protected = ~select_head(frozen['body'])
    source_ids = np.flatnonzero(source_protected)
    r07_tail = horn['tail_vertex_ids'][sliver['parent_vertex_ids']]
    r15_tail = np.full(len(parent), -1, dtype=np.int64)
    r15_tail[retained] = r07_tail[parent[retained]]
    tail_to_after = np.full(len(source_protected), -1, dtype=np.int64)
    has_source = r15_tail >= 0
    tail_to_after[r15_tail[has_source]] = np.flatnonzero(has_source)
    present = tail_to_after[source_ids] >= 0
    candidate_source_faces = r15_tail[mappings['r15'][meshes['r15'].faces]]
    has_source_face = (candidate_source_faces >= 0).all(axis=1)
    protected_faces = candidate_source_faces[has_source_face]
    protected_faces = protected_faces[source_protected[protected_faces].all(axis=1)]
    source_faces = frozen['body'].faces[source_protected[frozen['body'].faces].all(axis=1)]
    protected_coordinates_exact = present.all() and np.array_equal(fair['after'][tail_to_after[source_ids]], frozen['body'].vertices[source_ids])
    report['protected'] = {'frozenSource': frozen_meta, 'expectedVertices': len(source_ids), 'retainedVertices': int(present.sum()),
                           'allCoordinatesExact': bool(protected_coordinates_exact), 'sourceOrientedTriangles': len(source_faces),
                           'candidateOrientedTriangles': len(protected_faces), **difference(source_faces, protected_faces)}
    horns = json.loads((R03 / 'head-r06/horn-receipt.json').read_text())['horns']
    r06_to_r07 = np.full(len(sliver['before']), -1, dtype=np.int64)
    r06_to_r07[sliver['parent_vertex_ids']] = np.arange(len(sliver['after']))
    horn_reports = []
    for horn_receipt in horns:
        rings = np.asarray(horn_receipt['ringVertexIndices'])
        rows = r06_to_r07[np.r_[rings.ravel(), horn_receipt['tipVertexIndex']]]
        root_rows = r06_to_r07[rings[0]]
        horn_mask_before = np.isin(stable['r07'], rows).any(axis=1)
        horn_mask_after = np.isin(stable['r15'], rows).any(axis=1)
        horn_reports.append({'name': horn_receipt['name'], 'rootVertices': len(root_rows), 'allHornAndRootVertices': len(rows),
            'allRetainedAndExact': bool((r07_to_after[rows] >= 0).all() and np.array_equal(fair['after'][r07_to_after[rows]], grid['before'][rows])),
            'allIncidentOrientedTriangles': difference(stable['r07'][horn_mask_before], stable['r15'][horn_mask_after])})
    report['horns'] = horn_reports
    report['flameExactAgainstR07AndFrozen'] = all(np.array_equal(flames['r15'].vertices, flame.vertices) and np.array_equal(flames['r15'].faces, flame.faces) for flame in [flames['r07'], flames['r14'], frozen['flame']])
    lower, upper = np.asarray(json.loads((R03 / 'audit/head-r01-validation.json').read_text())['localIntersectionBounds'])
    report['localIntersectionBounds'] = [lower.tolist(), upper.tolist()]
    report['localIntersectionMethod'] = 'Open3D non-shared-vertex triangle pairs in the common expanded head AABB, supplemented by all shared-vertex triangle-cone tests incident to each patch vertex including boundary exterior triangles. No whole-model certification.'
    pair_sets = {}
    for label, mesh in meshes.items():
        result, pair_sets[label] = local_intersections(mesh, identities[label][mappings[label]], lower, upper, oriented_rows(stable[label][masks[label]]))
        result['newPairsAgainstR07'] = len(pair_sets[label] - pair_sets['r07'])
        report['versions'][label]['localIntersections'] = result
        patch_vertices = np.unique(mesh.faces[masks[label]])
        incident_ids = np.flatnonzero(np.isin(mesh.faces, patch_vertices).any(axis=1))
        shared = shared_center_intersections(np.asarray(mesh.vertices), mesh.faces[incident_ids], patch_vertices)
        shared['indexConvention'] = 'receiptCapTriangleIds indexes incidentExportTriangleIds; auditTriangleVertexRows are exported vertex rows for this test.'
        shared['incidentExportTriangleIds'] = incident_ids.tolist()
        report['versions'][label]['sharedVertexPatchIntersections'] = shared
        print(label, 'local pairs', result['pairCount'], 'shared-vertex hits', shared['detectedOverlapPairs'], flush=True)
    candidate_body = report['versions']['r15']['body']
    report['signedVolumeChangeVsR07Percent'] = float(100 * (meshes['r15'].volume / meshes['r07'].volume - 1))
    report['checks'] = {
        'allExportAuditBijections': True,
        'r07R14R15ChainAndRetainedCoordinates': all(map_checks.values()),
        'oneSceneTwoMeshes': all(report['versions'][v]['structure'][k] == value for v in ['r14', 'r15'] for k, value in [('scenes', 1), ('nodes', 2), ('meshes', 2)]),
        'expectedBodyCounts': candidate_body['vertices'] == 121603 and candidate_body['triangles'] == 243206,
        'allProtectedSourceCoordinatesAndTrianglesExact': protected_coordinates_exact and len(source_ids) == 113062 and len(protected_faces) == len(source_faces) == 226039 and report['protected']['missing'] == report['protected']['added'] == 0,
        'fixed72VertexBoundaryExact': len(boundary_ids) == 72 and boundary['receiptContainsExactlyBoundaryVertices'] and boundary['r14AndR15BoundaryEdgesExactlyR07'] and boundary['boundaryCoordinatesExact'],
        'allExteriorOrientedTrianglesExact': all(result == {'missing': 0, 'added': 0} for result in exterior.values()),
        'fairingTopologyExactlyR14': report['exterior']['r14ToR15AllOrientedTopologyDifference'] == {'missing': 0, 'added': 0},
        'newPatchIs648TriangleDisk': all(report['patches'][v]['triangles'] == 648 and report['patches'][v]['interiorVertices'] == 289 and report['patches'][v]['eulerCharacteristic'] == 1 and report['patches'][v]['boundaryOneSimpleCycle'] and report['patches'][v]['excessEdgeIncidences'] == report['patches'][v]['inconsistentInteriorEdges'] == 0 for v in ['r14', 'r15']),
        'hornsRootsAndIncidentTrianglesExact': all(h['allRetainedAndExact'] and h['allIncidentOrientedTriangles'] == {'missing': 0, 'added': 0} for h in horn_reports),
        'bodyTopologyAndDegeneracy': candidate_body['components'] == 1 and candidate_body['watertight'] and candidate_body['windingConsistent'] and all(candidate_body[k] == 0 for k in ['boundaryEdges', 'edgesAboveTwoFaceIncidence', 'repeatedIndexTriangles', 'areaAtMost1eMinus14Triangles', 'duplicateOrientedTriangles']),
        'flameExact': report['flameExactAgainstR07AndFrozen'],
        'noDetectedLocalHeadPairs': report['versions']['r15']['localIntersections']['pairCount'] == 0,
        'noDetectedSharedVertexPatchOverlaps': report['versions']['r15']['sharedVertexPatchIntersections']['detectedOverlapPairs'] == 0,
    }
    report['checks'] = {k: bool(v) for k, v in report['checks'].items()}
    report['limits'] = ['No geometry or replacement coordinates authored.', 'Numerical checks do not grant anatomical or visual approval.', 'Triangle quality and boundary normal angles are measurements, not imposed circularity or smoothness requirements.', 'Shared-vertex testing uses the inherited diagnostic triangle-cone tolerances stated in each result; local tests do not cover the whole body.']
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    failures = [k for k, v in report['checks'].items() if not v]
    p14, p15 = report['patches']['r14'], report['patches']['r15']
    status = 'All stated numerical gates pass.' if not failures else 'Failed numerical gates: ' + ', '.join(failures) + '.'
    text = f'''{status}

The actual r15 export has {candidate_body['vertices']:,} body vertices and {candidate_body['triangles']:,} triangles. All three export/NPZ mappings are bijective. Fairing moves {len(changed)} declared new grid vertices; maximum displacement is {displacement.max():.9g}. Every retained r07 coordinate, the 72 fixed boundary vertices, and all {report['exterior']['r07OrientedTriangles']:,} exterior oriented triangles remain exact. The r07→r14→r15 receipt chain is checked independently.

All 113,062 frozen tail-r02e protected vertices and 226,039 oriented protected triangles are compared directly with the frozen GLB. Both horns, root rings, all their incident triangles, and the flame remain exact.

The replacement is a 361-vertex, 648-triangle disk with 289 interior vertices and one 72-edge boundary. One boundary-only triangle is recreated exactly from r07; patch selection cuts the actual 72 boundary edges and flood-fills the interior, so this triangle remains included. Triangle-set difference alone would incorrectly describe 647 new triangles and a 71-edge boundary. R15 preserves r14's oriented topology. The body remains one closed, consistently wound component with no repeated-index or duplicate oriented triangles, no triangle area at or below 1e-14, and no edges with more than two incident faces.

| Patch quality | r14 | r15 |
| --- | ---: | ---: |
| Minimum triangle area | {p14['area']['min']:.9g} | {p15['area']['min']:.9g} |
| Minimum triangle angle | {p14['minimumAngleDegrees']['min']:.6g}° | {p15['minimumAngleDegrees']['min']:.6g}° |
| Interior adjacent-normal angle p90 | {p14['interiorAdjacentNormalAngleDegrees']['p90']:.6g}° | {p15['interiorAdjacentNormalAngleDegrees']['p90']:.6g}° |
| Boundary adjacent-normal angle p90 | {p14['boundaryAdjacentNormalAngleDegrees']['p90']:.6g}° | {p15['boundaryAdjacentNormalAngleDegrees']['p90']:.6g}° |

The common expanded head test finds {report['versions']['r07']['localIntersections']['pairCount']} / {report['versions']['r14']['localIntersections']['pairCount']} / {report['versions']['r15']['localIntersections']['pairCount']} Open3D pairs in r07/r14/r15. The supplement testing triangle pairs sharing patch vertices finds {report['versions']['r15']['sharedVertexPatchIntersections']['detectedOverlapPairs']} r15 overlaps. Signed body volume changes {report['signedVolumeChangeVsR07Percent']:.9g}% against r07.

These are local numerical checks, without whole-model intersection or anatomical certification. Stable vertex IDs in JSON are r07 audit rows, with distinct diagnostic IDs for new grid vertices; face indices identify actual export triangles, never native Blender polygon IDs. Rerun `validate_divot_fairing.py` with the Hunyuan Python environment. Optional `--grid-dir` and `--candidate-dir` allow fresh replay inputs; reports stay in this private audit folder.
'''
    args.output_prefix.with_suffix('.md').write_text(text)
    print(json.dumps({'checks': report['checks'], 'patchQualityR15': {k: v for k, v in p15.items() if k not in ['exportTriangleIds', 'triangleStableVertexTriples', 'boundaryStableEdges']}, 'boundary': boundary, 'volumePercent': report['signedVolumeChangeVsR07Percent']}, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
