"""Read-only CPU validation of a head refinement against r01 and frozen tail-r02e."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np

from inspect_head import SOURCE
from validate_head_prune import coordinate_mapping, difference, load_asset, local_intersections, oriented_rows, select_head, topology


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/audit')
R01 = OUT.parent / 'head-r01'


def file_record(path):
    return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def direct_face_normals(mesh, face_ids):
    triangles = mesh.vertices[mesh.faces[face_ids]]
    cross = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
    lengths = np.linalg.norm(cross, axis=1)
    assert (lengths > 0).all(), 'Zero-area common triangle'
    return cross / lengths[:, None]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=OUT.parent / 'head-r04')
    parser.add_argument('--candidate-file', default='charizard-head-r04.glb')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'head-r04-validation')
    args = parser.parse_args()
    audit_path = args.candidate_dir / 'refinement-audit.npz'
    receipt_path = args.candidate_dir / 'refinement-receipt.json'
    audit = np.load(audit_path)
    receipt = json.loads(receipt_path.read_text())
    base_audit = np.load(R01 / 'topology-audit.npz')
    before, after = audit['before'].astype(float), audit['after'].astype(float)
    parent_ids = audit['parent_vertex_ids'].astype(np.int64)
    tail_ids = audit['tail_vertex_ids'].astype(np.int64)
    base_tail_ids = base_audit['parent_vertex_ids'].astype(np.int64)
    retained = parent_ids >= 0
    new_rows = np.flatnonzero(~retained)
    base_identity = base_tail_ids.copy()
    base_identity[base_tail_ids < 0] = len(base_audit['before']) + np.arange(int((base_tail_ids < 0).sum()))
    identity = np.empty(len(after), dtype=np.int64)
    identity[retained] = base_identity[parent_ids[retained]]
    identity[~retained] = base_identity.max() + 1 + np.arange(len(new_rows))
    composed_tail_ids = np.full(len(after), -1, dtype=np.int64)
    composed_tail_ids[retained] = base_tail_ids[parent_ids[retained]]
    movement = np.linalg.norm(after - audit['subdivided'], axis=1)
    changed = np.any(after != audit['subdivided'], axis=1)
    movable = np.zeros(len(after), bool)
    movable[audit['movable']] = True
    meshes, stable_faces, report = {}, {}, {
        'audit': file_record(audit_path), 'receipt': file_record(receipt_path),
        'r01Audit': file_record(R01 / 'topology-audit.npz'),
        'coordinateConvention': 'Apply glTF scene transforms, then (x,-z,y) to Blender world.',
        'identityConvention': 'Frozen tail-r02e exported POSITION row IDs; two r01 cap centers use diagnostic IDs 122336 and 122337. Each new refinement vertex receives a distinct diagnostic ID starting at 122338. Export-to-audit and composed parent maps are independently checked.',
        'versions': {},
    }
    coordinates = {'tail-r02e': base_audit['before'].astype(float), 'head-r01': before, 'candidate': after}
    identities = {'tail-r02e': np.arange(len(base_audit['before'])), 'head-r01': base_identity, 'candidate': identity}
    paths = {'tail-r02e': SOURCE, 'head-r01': R01 / 'charizard-head-r01.glb', 'candidate': args.candidate_dir / args.candidate_file}
    mappings, flames = {}, {}
    for label, path in paths.items():
        asset, metadata = load_asset(path)
        meshes[label], flames[label] = asset['body'], asset['flame']
        mapping, mapping_report = coordinate_mapping(asset['body'], coordinates[label])
        mappings[label] = mapping
        stable_faces[label] = identities[label][mapping[asset['body'].faces]]
        metadata['coordinateBijection'] = mapping_report
        metadata['body'] = topology(asset['body'])
        metadata['flame'] = topology(asset['flame'])
        report['versions'][label] = metadata
        print(label, 'mapped', mapping_report['uniqueMappedRows'], 'rows', flush=True)
    assert np.array_equal(mappings['tail-r02e'], np.arange(len(base_audit['before']))), 'Tail source ID convention must be its original exported row order.'
    expected_source_protected = ~select_head(meshes['tail-r02e'])
    source_protected_ids = np.flatnonzero(expected_source_protected)
    expected_candidate_protected = np.zeros(len(after), bool)
    original_rows = tail_ids >= 0
    expected_candidate_protected[original_rows] = expected_source_protected[tail_ids[original_rows]]
    source_to_candidate = np.full(len(expected_source_protected), -1, dtype=np.int64)
    source_to_candidate[tail_ids[original_rows]] = np.flatnonzero(original_rows)
    protected_present = source_to_candidate[source_protected_ids] >= 0
    present_ids = source_protected_ids[protected_present]
    protected_distances = np.linalg.norm(after[source_to_candidate[present_ids]] - coordinates['tail-r02e'][present_ids], axis=1)
    protected_identity_mask = np.zeros(int(identity.max()) + 1, bool)
    protected_identity_mask[source_protected_ids] = True
    protected_faces = {label: faces[protected_identity_mask[faces].all(axis=1)] for label, faces in stable_faces.items()}
    protected_differences = {label: difference(protected_faces['tail-r02e'], faces) for label, faces in protected_faces.items()}
    report['protected'] = {
        'expectedSourceVertices': len(source_protected_ids), 'retainedSourceVertices': int(protected_present.sum()),
        'removedSourceVertexIds': source_protected_ids[~protected_present].tolist(),
        'maximumCoordinateDisplacement': float(protected_distances.max()),
        'orientedTriangleCounts': {label: len(faces) for label, faces in protected_faces.items()},
        'orientedTriangleDifferencesAgainstTailR02e': protected_differences,
    }
    map_checks = {
        'beforeExactlyMatchesR01AuditAfter': bool(np.array_equal(before, base_audit['after'])),
        'parentIdsRetainEveryR01VertexExactlyOnce': bool(np.array_equal(np.sort(parent_ids[retained]), np.arange(len(before)))),
        'tailIdsEqualComposedR01ParentMap': bool(np.array_equal(tail_ids, composed_tail_ids)),
        'originalTailIdsUniqueAmongRetainedRows': len(np.unique(tail_ids[original_rows])) == int(original_rows.sum()),
        'protectedMaskMatchesFrozenHeadComplement': bool(np.array_equal(audit['protected'], expected_candidate_protected)),
        'preRelaxationRetainedCoordinatesExactlyMatchR01': bool(np.array_equal(audit['subdivided'][retained], before[parent_ids[retained]])),
        'movedRowsStayWithinMovableSelection': bool(not (changed & ~movable).any()),
        'movableSelectionExcludesProtectedRows': bool(not (movable & expected_candidate_protected).any()),
        'movementCountMatchesReceipt': int(changed.sum()) == receipt['movedVertices'],
        'newVertexCountMatchesReceipt': len(new_rows) == receipt['newVertices'] == receipt['edgeSplits'] == 1602,
        'maximumMovementMatchesReceipt': float(movement.max()) == receipt['maximumDisplacement'],
        'protectedRowsNotMovedOrSubdivided': bool(not (changed & expected_candidate_protected).any() and not expected_candidate_protected[new_rows].any()),
    }
    report['audit']['checks'] = map_checks
    report['movement'] = {'selectedRows': int(movable.sum()), 'movedRows': int(changed.sum()),
                          'selectedButUnmovedAuditRowIds': np.flatnonzero(movable & ~changed).tolist(),
                          'movedOutsideSelectionAuditRowIds': np.flatnonzero(changed & ~movable).tolist(),
                          'retainedR01RowsMoved': int(changed[retained].sum()),
                          'newRowsMoved': int(changed[~retained].sum()),
                          'maximumDisplacement': float(movement.max()),
                          'movedDisplacementQuantiles': np.quantile(movement[changed], [0, .5, .9, .99, 1]).tolist()}
    report['topologyChangeAgainstR01'] = difference(stable_faces['head-r01'], stable_faces['candidate'])
    _, old_common, new_common = np.intersect1d(oriented_rows(stable_faces['head-r01']), oriented_rows(stable_faces['candidate']), return_indices=True)
    normal_dot = np.einsum('ij,ij->i', direct_face_normals(meshes['head-r01'], old_common), direct_face_normals(meshes['candidate'], new_common))
    normal_degrees = np.degrees(np.arccos(np.clip(normal_dot, -1, 1)))
    largest_changes = np.argsort(normal_degrees)[-10:][::-1]
    report['retainedTriangleOrientationAgainstR01'] = {
        'commonOrientedTriangles': len(old_common), 'normalReversals': int((normal_dot < 0).sum()),
        'maximumNormalChangeDegrees': float(normal_degrees.max()),
        'reversedCandidateExportFaceIds': new_common[normal_dot < 0].tolist(),
        'largestNormalChanges': [{'degrees': float(normal_degrees[i]), 'r01ExportFaceId': int(old_common[i]), 'candidateExportFaceId': int(new_common[i]), 'stableTriangleIds': stable_faces['candidate'][new_common[i]].tolist()} for i in largest_changes],
        'interpretation': 'Float64 cross products normalized directly, avoiding trimesh zero-normal thresholds on tiny pre-existing triangles. Measures triangles retaining oriented vertex identity. A geometric bend can change a normal without changing topological winding; this is diagnostic, not anatomical acceptance.',
    }
    bounds_receipt = OUT / 'head-r01-validation.json'
    lower, upper = np.array(json.loads(bounds_receipt.read_text())['localIntersectionBounds'])
    report['localIntersectionBounds'] = [lower.tolist(), upper.tolist()]
    report['localIntersectionBoundsSource'] = file_record(bounds_receipt)
    report['localIntersectionMethod'] = 'Open3D on all body triangles whose AABBs overlap exactly the saved head-r01 expanded-head bounds. Stable triangle pair keys identify retained versus new detections. Shared-vertex pairs are excluded by this method. This does not cover the entire model or separate flame/body intersections and cannot rule out a visible fold.'
    empty_keys = oriented_rows(np.empty((0, 3), dtype=np.int64))
    pair_sets = {}
    for label, mesh in meshes.items():
        result, pair_sets[label] = local_intersections(mesh, identities[label][mappings[label]], lower, upper, empty_keys)
        for pair in result['pairs']:
            del pair['involvesNewCapTriangle']
        result['newPairsAgainstTailR02e'] = len(pair_sets[label] - pair_sets['tail-r02e'])
        result['retainedPairsFromTailR02e'] = len(pair_sets[label] & pair_sets['tail-r02e'])
        if 'head-r01' in pair_sets:
            result['newPairsAgainstHeadR01'] = len(pair_sets[label] - pair_sets['head-r01'])
            result['retainedPairsFromHeadR01'] = len(pair_sets[label] & pair_sets['head-r01'])
        report['versions'][label]['localIntersections'] = result
        print(label, 'local intersections', result['pairCount'], flush=True)
    candidate = report['versions']['candidate']
    candidate['flameExactAgainstTailR02e'] = bool(np.array_equal(flames['candidate'].vertices, flames['tail-r02e'].vertices) and np.array_equal(flames['candidate'].faces, flames['tail-r02e'].faces))
    candidate['flameExactAgainstHeadR01'] = bool(np.array_equal(flames['candidate'].vertices, flames['head-r01'].vertices) and np.array_equal(flames['candidate'].faces, flames['head-r01'].faces))
    report['shapeChangesPercent'] = {label: {'signedVolume': 100 * (meshes['candidate'].volume / meshes[label].volume - 1), 'surfaceArea': 100 * (meshes['candidate'].area / meshes[label].area - 1)} for label in ['tail-r02e', 'head-r01']}
    body = candidate['body']
    report['checks'] = {
        'exportAuditBijections': True,
        'auditParentAndProtectedMaps': all(map_checks.values()),
        'oneSceneTwoMeshNodes': candidate['structure']['scenes'] == 1 and candidate['structure']['nodes'] == 2 and candidate['structure']['meshes'] == 2,
        'expectedBodyCounts': body['vertices'] == receipt['verticesAfter'] == len(before) + receipt['edgeSplits'] and body['triangles'] == report['versions']['head-r01']['body']['triangles'] + 2 * receipt['edgeSplits'],
        'all113062ProtectedSourceCoordinatesExact': len(source_protected_ids) == 113062 and protected_present.all() and protected_distances.max() == 0,
        'all226039ProtectedOrientedTrianglesExact': len(protected_faces['candidate']) == len(protected_faces['tail-r02e']) == 226039 and protected_differences['candidate'] == {'missing': 0, 'added': 0},
        'flameExactAgainstBothParents': candidate['flameExactAgainstTailR02e'] and candidate['flameExactAgainstHeadR01'],
        'bodyTopologyAndDegeneracy': body['components'] == 1 and body['watertight'] and body['windingConsistent'] and body['boundaryEdges'] == 0 and body['edgesAboveTwoFaceIncidence'] == 0 and body['repeatedIndexTriangles'] == 0 and body['areaAtMost1eMinus14Triangles'] == 0 and body['duplicateOrientedTriangles'] == 0,
        'noNewDetectedLocalPairsAgainstEitherParent': candidate['localIntersections']['newPairsAgainstTailR02e'] == candidate['localIntersections']['newPairsAgainstHeadR01'] == 0,
    }
    report['checks'] = {key: bool(value) for key, value in report['checks'].items()}
    report['limits'] = ['Numerical validation only. The root reviewer reports a remaining posterior surface issue; numerical passes do not approve it anatomically or visually.', 'Rejected head-r03 is neither an input nor an accepted baseline.', 'No authored geometry, target coordinates, Blender calls, or files outside the audit directory.']
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    failures = [key for key, value in report['checks'].items() if not value]
    rows = [f"| {label} | {v['body']['vertices']:,} | {v['body']['triangles']:,} | {v['localIntersections']['pairCount']} | {v['localIntersections']['newPairsAgainstTailR02e']} |" for label, v in report['versions'].items()]
    text = f'''# {receipt['candidate']} numerical validation

{'All stated numerical gates pass.' if not failures else 'Numerical gates fail: ' + ', '.join(failures) + '.'} This does not approve the remaining posterior surface issue or the anatomy. Rejected head-r03 is not used.

| Version | Body vertices | Body triangles | Local intersection pairs | New against frozen tail-r02e |
| --- | ---: | ---: | ---: | ---: |
{chr(10).join(rows)}

Every export maps bijectively and exactly to its audit coordinates. Candidate parent IDs preserve all {len(before):,} r01 vertices exactly once, with {len(new_rows):,} new rows; the tail IDs match the composed r01 map. The pre-relaxation retained coordinates exactly match r01. There are {int(changed.sum()):,} moved rows ({int(changed[retained].sum())} retained and {int(changed[~retained].sum())} new), maximum displacement {movement.max():.12f}. All moved rows are within the {int(movable.sum()):,}-row movable selection; {int((movable & ~changed).sum())} selected rows remain unchanged. No protected row is selected.

All {len(source_protected_ids):,} protected source vertices remain exact. All {len(protected_faces['candidate']):,} oriented protected triangles match frozen tail-r02e and r01, with no missing or added triples. The flame coordinates and triangle arrays match both parents exactly.

The body has {body['components']} component, {body['boundaryEdges']} boundary edges, {body['edgesAboveTwoFaceIncidence']} edges with more than two incident faces, {body['interiorEdgesWithInconsistentWinding']} inconsistent interior edges, and {body['areaAtMost1eMinus14Triangles']} triangles with area at most 1e-14. Common r01 triangles show {report['retainedTriangleOrientationAgainstR01']['normalReversals']} normal reversals, with maximum normal change {report['retainedTriangleOrientationAgainstR01']['maximumNormalChangeDegrees']:.6f} degrees.

Intersections use exactly the common head bounds from head-r01-validation.json. The candidate has {candidate['localIntersections']['newPairsAgainstHeadR01']} new and {candidate['localIntersections']['retainedPairsFromHeadR01']} retained r01 pairs. Exact pair IDs and bounds are in JSON. Open3D skips shared-vertex pairs; the visible fold can remain despite a passing result. The rest of the model and separate flame/body intersections are not checked.

Against r01, signed volume changes {report['shapeChangesPercent']['head-r01']['signedVolume']:.9f}% and surface area changes {report['shapeChangesPercent']['head-r01']['surfaceArea']:.9f}%. These are geometric measurements, not design acceptance.

Rerun `validate_head_refinement.py` with the Hunyuan Python environment. Optional `--candidate-dir`, `--candidate-file`, and `--output-prefix` support an exact reproduced candidate. The script imports read-only helpers from `validate_head_prune.py` and `inspect_head.py`, and writes audit JSON/Markdown only.
'''
    args.output_prefix.with_suffix('.md').write_text(text)
    print(json.dumps({'checks': report['checks'], 'protected': report['protected'], 'normalChanges': report['retainedTriangleOrientationAgainstR01'], 'shapeChangesPercent': report['shapeChangesPercent']}, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
