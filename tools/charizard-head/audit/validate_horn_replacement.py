"""Read-only CPU audit of the exported head-r06 distal horn replacement."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np

from inspect_head import SOURCE
from validate_head_prune import coordinate_mapping, difference, load_asset, local_intersections, oriented_rows, select_head, shared_center_intersections, topology


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/audit')
ROOT = OUT.parent


def file_record(path):
    return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def triangle_edges(faces):
    rows = np.sort(np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]]), axis=1)
    return np.unique(rows, axis=0, return_counts=True)


def edge_set(edges):
    return {tuple(sorted(map(int, edge))) for edge in edges}


def inspect_horn(horn, before, after, parent_ids, after_faces, mesh_edges):
    rings = np.asarray(horn['ringVertexIndices'], dtype=np.int64)
    tip = int(horn['tipVertexIndex'])
    boundary = np.asarray(horn['boundaryHeadR05VertexIds'], dtype=np.int64)
    all_ids = np.r_[rings.ravel(), tip]
    new_ids = np.r_[rings[1:].ravel(), tip]
    selected = np.zeros(len(after), bool)
    selected[new_ids] = True
    faces = after_faces[selected[after_faces].any(axis=1)]
    used_edges, incidence = triangle_edges(faces)
    patch_boundary = used_edges[incidence == 1]
    root_cycle = np.column_stack([rings[0], np.roll(rings[0], -1)])
    tip_faces = after_faces[(after_faces == tip).any(axis=1)]
    neighbors = np.setdiff1d(np.unique(tip_faces), [tip])
    rank = np.full(len(after), -1, dtype=np.int64)
    for number, ring in enumerate(rings):
        rank[ring] = number
    rank[tip] = len(rings)
    ranks = rank[faces]
    intervals = [int(((ranks.min(axis=1) == i) & (ranks.max(axis=1) == i + 1)).sum()) for i in range(len(rings))]
    axis = after[tip] - after[rings[0]].mean(axis=0)
    axis /= np.linalg.norm(axis)
    centers = after[rings].mean(axis=1)
    offsets = after[rings] - centers[:, None]
    radial = offsets - np.einsum('rni,i->rn', offsets, axis)[..., None] * axis
    radii = np.linalg.norm(radial, axis=2)
    advances = np.einsum('rni,i->rn', np.diff(after[rings], axis=0), axis)
    tip_advance = (after[tip] - after[rings[-1]]) @ axis
    checks = {
        'receiptRingDimensions': rings.shape == (horn['ringCount'], horn['verticesPerRing']) and len(rings) == 16,
        'allRingAndTipRowsUnique': len(np.unique(all_ids)) == len(all_ids),
        'rootParentIdsExactlyMatchReceiptOrder': bool(np.array_equal(parent_ids[rings[0]], boundary)),
        'rootCoordinatesExactlyMatchR05': bool(np.array_equal(after[rings[0]], before[boundary])),
        'allDistalRowsAreNew': bool((parent_ids[new_ids] == -1).all()),
        'everyRingIsExistingEdgeCycle': all(tuple(sorted(map(int, edge))) in mesh_edges for ring in rings for edge in zip(ring, np.roll(ring, -1))),
        'allHornFacesUseOnlyDeclaredRows': bool(np.isin(faces, all_ids).all()),
        'patchBoundaryExactlyRootRing': edge_set(patch_boundary) == edge_set(root_cycle),
        'patchHasNoExcessIncidenceEdges': bool((incidence <= 2).all()),
        'patchEulerOne': len(np.unique(faces)) - len(used_edges) + len(faces) == 1,
        'eachBandHasExpectedTriangleCount': intervals == [2 * len(boundary)] * (len(rings) - 1) + [len(boundary)],
        'everyHornTriangleJoinsAdjacentRingRanks': bool(((ranks.max(axis=1) - ranks.min(axis=1)) == 1).all() and (ranks >= 0).all()),
        'tipNeighborsExactlyLastRing': bool(np.array_equal(neighbors, np.sort(rings[-1]))),
        'oneTipFanTrianglePerLastRingEdge': len(tip_faces) == len(boundary),
        'tipCoordinateMatchesReceipt': bool(np.array_equal(after[tip], np.asarray(horn['tip']))),
        'allCorrespondingVerticesAdvanceTowardTip': bool((advances > 0).all() and (tip_advance > 0).all()),
        'meanRadialExtentStrictlyDecreases': bool((np.diff(radii.mean(axis=1)) < 0).all()),
    }
    report = {'name': horn['name'], 'checks': checks, 'rootVertices': len(boundary), 'ringsIncludingRoot': len(rings),
              'newVertices': len(new_ids), 'patchTriangles': len(faces), 'patchBoundaryEdges': len(patch_boundary),
              'boundaryR05VertexIds': boundary.tolist(), 'rootCandidateAuditRows': rings[0].tolist(),
              'tipCandidateAuditRow': tip, 'tipCoordinate': after[tip].tolist(), 'tipValence': len(neighbors),
              'minimumMatchedVertexAdvanceTowardTip': float(min(advances.min(), tip_advance.min())),
              'ringMeanRadiiPerpendicularToRootTipAxis': radii.mean(axis=1).tolist(),
              'rootAndTipBounds': [after[all_ids].min(axis=0).tolist(), after[all_ids].max(axis=0).tolist()],
              'interpretation': 'Existing exported vertices and triangles only. Root rings and the final point are verified by edge/face incidence. Radius and axial progress are measured relative to the root-center-to-tip axis, not anatomical circularity requirements.'}
    return report, new_ids, tip_faces


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=ROOT / 'head-r06')
    parser.add_argument('--candidate-file', default='charizard-head-r06.glb')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'head-r06-validation')
    args = parser.parse_args()
    audit_path, receipt_path = args.candidate_dir / 'horn-audit.npz', args.candidate_dir / 'horn-receipt.json'
    audit, receipt = np.load(audit_path), json.loads(receipt_path.read_text())
    r01_audit_path, r05_audit_path = ROOT / 'head-r01/topology-audit.npz', ROOT / 'head-r05/refinement-audit.npz'
    r01, r05 = np.load(r01_audit_path), np.load(r05_audit_path)
    before, after = audit['before'].astype(float), audit['after'].astype(float)
    parent_ids = audit['parent_vertex_ids'].astype(np.int64)
    tail_ids = audit['tail_vertex_ids'].astype(np.int64)
    removed_ids = audit['removed_parent_vertices'].astype(np.int64)
    retained = parent_ids >= 0
    r01_identity = r01['parent_vertex_ids'].astype(np.int64).copy()
    r01_identity[r01_identity < 0] = len(r01['before']) + np.arange(int((r01_identity < 0).sum()))
    r05_parent = r05['parent_vertex_ids'].astype(np.int64)
    r05_identity = np.empty(len(before), dtype=np.int64)
    old_r05 = r05_parent >= 0
    r05_identity[old_r05] = r01_identity[r05_parent[old_r05]]
    r05_identity[~old_r05] = r01_identity.max() + 1 + np.arange(int((~old_r05).sum()))
    identity = np.empty(len(after), dtype=np.int64)
    identity[retained] = r05_identity[parent_ids[retained]]
    identity[~retained] = r05_identity.max() + 1 + np.arange(int((~retained).sum()))
    composed_tail = np.full(len(after), -1, dtype=np.int64)
    composed_tail[retained] = r05['tail_vertex_ids'][parent_ids[retained]]
    coordinates = {'tail-r02e': r01['before'].astype(float), 'head-r05': before, 'candidate': after}
    identities = {'tail-r02e': np.arange(len(r01['before'])), 'head-r05': r05_identity, 'candidate': identity}
    paths = {'tail-r02e': SOURCE, 'head-r05': ROOT / 'head-r05/charizard-head-r05.glb', 'candidate': args.candidate_dir / args.candidate_file}
    report = {'audit': file_record(audit_path), 'receipt': file_record(receipt_path),
              'parentAuditChain': [file_record(r01_audit_path), file_record(r05_audit_path)],
              'coordinateConvention': 'Apply glTF scene transform, then (x,-z,y) to Blender world.',
              'identityConvention': 'Frozen tail-r02e exported POSITION rows retained through r01 and r05 maps. New centers, refinement vertices and horn vertices receive distinct diagnostic IDs above the frozen source range. Receipt ring/tip indices are candidate audit rows, independently mapped to the GLB.',
              'versions': {}}
    meshes, mappings, flames, stable_faces = {}, {}, {}, {}
    for label, path in paths.items():
        asset, metadata = load_asset(path)
        meshes[label], flames[label] = asset['body'], asset['flame']
        mapping, mapping_report = coordinate_mapping(asset['body'], coordinates[label])
        mappings[label] = mapping
        stable_faces[label] = identities[label][mapping[asset['body'].faces]]
        metadata['coordinateBijection'] = mapping_report
        metadata['body'], metadata['flame'] = topology(asset['body']), topology(asset['flame'])
        report['versions'][label] = metadata
        print(label, 'mapped', mapping_report['uniqueMappedRows'], 'rows', flush=True)
    assert np.array_equal(mappings['tail-r02e'], np.arange(len(r01['before'])))
    source_protected = ~select_head(meshes['tail-r02e'])
    source_protected_ids = np.flatnonzero(source_protected)
    has_tail_id = tail_ids >= 0
    expected_protected = np.zeros(len(after), bool)
    expected_protected[has_tail_id] = source_protected[tail_ids[has_tail_id]]
    tail_to_after = np.full(len(source_protected), -1, dtype=np.int64)
    tail_to_after[tail_ids[has_tail_id]] = np.flatnonzero(has_tail_id)
    protected_present = tail_to_after[source_protected_ids] >= 0
    present_source_ids = source_protected_ids[protected_present]
    protected_distances = np.linalg.norm(after[tail_to_after[present_source_ids]] - coordinates['tail-r02e'][present_source_ids], axis=1)
    protected_identity = np.zeros(int(identity.max()) + 1, bool)
    protected_identity[source_protected_ids] = True
    protected_faces = {label: faces[protected_identity[faces].all(axis=1)] for label, faces in stable_faces.items()}
    protected_diffs = {label: difference(protected_faces['tail-r02e'], faces) for label, faces in protected_faces.items()}
    report['protected'] = {'expectedVertices': len(source_protected_ids), 'retainedVertices': int(protected_present.sum()),
                           'removedSourceVertexIds': source_protected_ids[~protected_present].tolist(),
                           'maximumCoordinateDisplacement': float(protected_distances.max()),
                           'orientedTriangleCounts': {label: len(faces) for label, faces in protected_faces.items()},
                           'orientedTriangleDifferencesAgainstTailR02e': protected_diffs}
    map_checks = {
        'beforeExactlyMatchesR05AuditAfter': bool(np.array_equal(before, r05['after'])),
        'retainedCoordinatesExactlyMatchR05': bool(np.array_equal(after[retained], before[parent_ids[retained]])),
        'retainedParentIdsUnique': len(np.unique(parent_ids[retained])) == int(retained.sum()),
        'removedVertexComplementExact': bool(np.array_equal(np.setdiff1d(np.arange(len(before)), parent_ids[retained]), removed_ids)),
        'countsMatchReceipt': len(removed_ids) == receipt['removedVertices'] == 1041 and int((~retained).sum()) == receipt['newVertices'] == 767 and int(retained.sum()) == receipt['retainedVerticesExact'] == 121866,
        'tailIdsEqualComposedR05Map': bool(np.array_equal(tail_ids, composed_tail)),
        'originalTailIdsUnique': len(np.unique(tail_ids[has_tail_id])) == int(has_tail_id.sum()),
        'protectedMaskEqualsFrozenHeadComplement': bool(np.array_equal(audit['protected'], expected_protected)),
    }
    report['audit']['checks'] = map_checks
    after_faces = mappings['candidate'][meshes['candidate'].faces]
    all_mesh_edges = edge_set(mappings['candidate'][meshes['candidate'].edges_unique])
    horn_rows, tip_faces, horn_reports = [], [], []
    for horn in receipt['horns']:
        result, rows, faces = inspect_horn(horn, before, after, parent_ids, after_faces, all_mesh_edges)
        horn_reports.append(result)
        horn_rows.append(rows)
        tip_faces.append(faces)
    report['horns'] = horn_reports
    all_horn_rows = np.concatenate(horn_rows)
    report['newVerticesExactlyTwoDeclaredLofts'] = bool(np.array_equal(np.sort(all_horn_rows), np.flatnonzero(~retained)))
    report['tipFanIntersections'] = shared_center_intersections(after, np.concatenate(tip_faces), [h['tipVertexIndex'] for h in receipt['horns']])
    r05_keys, new_keys = oriented_rows(stable_faces['head-r05']), oriented_rows(stable_faces['candidate'])
    deleted_mask = ~np.isin(r05_keys, new_keys)
    created_mask = ~np.isin(new_keys, r05_keys)
    r05_local_faces = mappings['head-r05'][meshes['head-r05'].faces]
    deleted_edges, deleted_counts = triangle_edges(r05_local_faces[deleted_mask])
    old_hole_boundaries = deleted_edges[deleted_counts == 1]
    declared_root_edges = np.concatenate([np.column_stack([h['boundaryHeadR05VertexIds'], np.roll(h['boundaryHeadR05VertexIds'], -1)]) for h in receipt['horns']])
    new_horn_identity_faces = np.concatenate([stable_faces['candidate'][np.isin(after_faces, rows).any(axis=1)] for rows in horn_rows])
    report['triangleReplacement'] = {
        'removedExportTriangles': int(deleted_mask.sum()), 'newExportTriangles': int(created_mask.sum()),
        'removedNativePolygonsInAudit': len(audit['removed_parent_faces']),
        'oldHoleBoundaryEdges': len(old_hole_boundaries),
        'oldHoleBoundariesExactlyDeclaredRootCycles': edge_set(old_hole_boundaries) == edge_set(declared_root_edges),
        'newTrianglesExactlyDeclaredLofts': difference(stable_faces['candidate'][created_mask], new_horn_identity_faces) == {'missing': 0, 'added': 0},
        'countsMatchTwoLofts': int(created_mask.sum()) == sum(h['patchTriangles'] for h in horn_reports) == 1581 and int(deleted_mask.sum()) == len(audit['removed_parent_faces']) == 2129,
        'note': 'Native removed polygon IDs are not treated as exported triangle row IDs. Export deletion and creation are independently derived from oriented stable triples.'}
    bounds_receipt = OUT / 'head-r01-validation.json'
    lower, upper = np.array(json.loads(bounds_receipt.read_text())['localIntersectionBounds'])
    report['localIntersectionBounds'] = [lower.tolist(), upper.tolist()]
    report['localIntersectionBoundsSource'] = file_record(bounds_receipt)
    affected = np.vstack([before[removed_ids], after[~retained]])
    report['allRemovedAndNewHornVerticesInsideTestBounds'] = bool(((affected >= lower) & (affected <= upper)).all())
    report['localIntersectionMethod'] = 'Open3D on body triangle AABBs overlapping exactly the saved head-r01 expanded-head bounds; compares stable pair keys with frozen tail-r02e and r05. Shared-vertex pairs are omitted. A separate strict-interior/coplanar test covers the 625 pairs of final tip-fan triangles that share their tip. No whole-model or separate flame/body intersection claim.'
    pair_sets = {}
    for label, mesh in meshes.items():
        result, pair_sets[label] = local_intersections(mesh, identities[label][mappings[label]], lower, upper, oriented_rows(new_horn_identity_faces))
        for pair in result['pairs']:
            pair['involvesNewHornTriangle'] = pair.pop('involvesNewCapTriangle')
        result['newPairsAgainstTailR02e'] = len(pair_sets[label] - pair_sets['tail-r02e'])
        result['retainedPairsFromTailR02e'] = len(pair_sets[label] & pair_sets['tail-r02e'])
        if 'head-r05' in pair_sets:
            result['newPairsAgainstR05'] = len(pair_sets[label] - pair_sets['head-r05'])
            result['retainedPairsFromR05'] = len(pair_sets[label] & pair_sets['head-r05'])
        report['versions'][label]['localIntersections'] = result
        print(label, 'local intersections', result['pairCount'], flush=True)
    candidate, body = report['versions']['candidate'], report['versions']['candidate']['body']
    report['flameExact'] = {label: bool(np.array_equal(flames['candidate'].vertices, flames[label].vertices) and np.array_equal(flames['candidate'].faces, flames[label].faces)) for label in ['tail-r02e', 'head-r05']}
    report['shapeChangesPercent'] = {label: {'signedVolume': 100 * (meshes['candidate'].volume / meshes[label].volume - 1), 'surfaceArea': 100 * (meshes['candidate'].area / meshes[label].area - 1)} for label in ['tail-r02e', 'head-r05']}
    report['checks'] = {
        'exportAuditBijections': True,
        'parentMapsAndRetainedCoordinates': all(map_checks.values()),
        'oneSceneTwoMeshNodes': candidate['structure']['scenes'] == 1 and candidate['structure']['nodes'] == 2 and candidate['structure']['meshes'] == 2,
        'expectedBodyCounts': body['vertices'] == 122633 and body['triangles'] == 245266,
        'protectedSourceCoordinatesAndTrianglesExact': len(source_protected_ids) == 113062 and protected_present.all() and protected_distances.max() == 0 and len(protected_faces['candidate']) == 226039 and protected_diffs['candidate'] == {'missing': 0, 'added': 0},
        'flameExactAgainstBothParents': all(report['flameExact'].values()),
        'bodyTopologyAndDegeneracy': body['components'] == 1 and body['watertight'] and body['windingConsistent'] and body['boundaryEdges'] == 0 and body['edgesAboveTwoFaceIncidence'] == 0 and body['repeatedIndexTriangles'] == 0 and body['areaAtMost1eMinus14Triangles'] == 0 and body['duplicateOrientedTriangles'] == 0,
        'twoRootAttachedLoftsWithRealTips': len(horn_reports) == 2 and all(all(h['checks'].values()) for h in horn_reports) and report['newVerticesExactlyTwoDeclaredLofts'],
        'exportedTriangleReplacementExactlyMatchesLofts': report['triangleReplacement']['countsMatchTwoLofts'] and report['triangleReplacement']['oldHoleBoundariesExactlyDeclaredRootCycles'] and report['triangleReplacement']['newTrianglesExactlyDeclaredLofts'],
        'noNewDetectedLocalIntersections': candidate['localIntersections']['newPairsAgainstTailR02e'] == candidate['localIntersections']['newPairsAgainstR05'] == 0,
        'noDetectedTipFanOverlaps': report['tipFanIntersections']['detectedOverlapPairs'] == 0,
        'allAuthoredHornVerticesCoveredByLocalBounds': report['allRemovedAndNewHornVerticesInsideTestBounds'],
    }
    report['checks'] = {key: bool(value) for key, value in report['checks'].items()}
    report['limits'] = ['Numerical validation does not approve anatomy, the remaining skull divot or the unfinished face.', 'Shared-vertex configurations outside the final tip fans and regions outside the head test bounds are not independently checked for intersections.', 'Rejected head-r03 is not used.', 'No geometry or target coordinates are authored; only audit code and results are written.']
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    failures = [key for key, value in report['checks'].items() if not value]
    rows = [f"| {h['name']} | {h['rootVertices']} | {h['ringsIncludingRoot']} | {h['newVertices']} | {h['patchTriangles']} | {h['tipCandidateAuditRow']} | {h['tipValence']} |" for h in horn_reports]
    text = f'''# Head-r06 horn export validation

{'All stated numerical gates pass.' if not failures else 'Numerical gates fail: ' + ', '.join(failures) + '.'} This is not anatomical or visual approval of the remaining skull divot or unfinished face.

All 121,866 retained r05 coordinates remain exact. The export maps bijectively to all 122,633 audit rows. All 113,062 protected frozen-source vertices and 226,039 oriented protected triangles remain exact; flame coordinates and triangles match frozen tail-r02e and r05. The body has 245,266 triangles, one connected component, {body['boundaryEdges']} boundary edges, {body['edgesAboveTwoFaceIncidence']} excess-incidence edges, {body['interiorEdgesWithInconsistentWinding']} inconsistent interior edges, and {body['areaAtMost1eMinus14Triangles']} tested degenerate triangles.

| Horn | Root vertices | Rings including root | New vertices | Patch triangles | Tip audit row | Tip valence |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
{chr(10).join(rows)}

For each horn, the root's parent IDs and coordinates exactly match its r05 receipt. Every ring is an actual closed edge cycle. The patch's only boundary is that root cycle; its Euler characteristic is one. Each consecutive ring band has the expected triangles, and the last ring joins a single real tip vertex with one triangle per ring edge. The 767 new vertices belong exactly to these two lofts. All matched generatrices advance toward the tip, and mean radial extent decreases through the rings; these measurements do not impose circular anatomy.

Canonical exported comparison finds 2,129 removed and 1,581 new triangles. The deleted patches' boundary edges match the two unchanged root rings exactly; all created triangles belong to the declared lofts.

The common head AABB contains all removed and new horn vertices. Open3D finds {candidate['localIntersections']['pairCount']} candidate pair, including {candidate['localIntersections']['newPairsAgainstR05']} new and {candidate['localIntersections']['retainedPairsFromR05']} retained r05 pairs. Exact pair identities and bounds are in JSON. The additional shared-tip test examines {report['tipFanIntersections']['pairsTested']} final fan pairs and detects {report['tipFanIntersections']['detectedOverlapPairs']} overlaps. Other shared-vertex configurations, the rest of the model and separate flame/body intersections are outside these checks.

Against r05, signed volume changes {report['shapeChangesPercent']['head-r05']['signedVolume']:.9f}% and surface area changes {report['shapeChangesPercent']['head-r05']['surfaceArea']:.9f}%.

Rerun `validate_horn_replacement.py` with the Hunyuan Python environment. Optional `--candidate-dir`, `--candidate-file`, and `--output-prefix` support an exact replay. It imports read-only helpers from `validate_head_prune.py` and `inspect_head.py`; no Blender calls or geometry authoring occur.
'''
    args.output_prefix.with_suffix('.md').write_text(text)
    print(json.dumps({'checks': report['checks'], 'protected': report['protected'], 'horns': [{k: v for k, v in h.items() if k in ['name', 'checks', 'tipCandidateAuditRow', 'tipValence', 'minimumMatchedVertexAdvanceTowardTip']} for h in horn_reports], 'shapeChangesPercent': report['shapeChangesPercent']}, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
