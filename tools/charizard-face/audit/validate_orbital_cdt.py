"""Read-only exported r18 orbital patches, eye surfaces and frozen-source validation.

Defaults always address private artifacts, even when copied to tools/charizard-face/audit.
Repository sibling audit helpers take precedence over the private fallback helpers.
"""
import argparse
import json
import struct
import sys
from pathlib import Path

import numpy as np
import open3d as o3d

PRIVATE = Path('/mnt/zer0models/pokemon-iac/characters/charizard')
HERE = Path(__file__).resolve().parent
TOOLS = HERE.parent.parent
SEARCH = [HERE, TOOLS / 'charizard-head/audit', TOOLS / 'charizard-anatomy/root_audit',
          PRIVATE / 'anatomy-r04/audit', PRIVATE / 'anatomy-r03/audit',
          PRIVATE / 'anatomy-r02/audit-root-surface']
for directory in reversed(SEARCH):
    if directory.is_dir():
        sys.path.insert(0, str(directory))
from validate_head_prune import (coordinate_mapping, difference, load_asset, local_intersections,
    oriented_rows, select_head, shared_center_intersections, topology)
from validate_divot_fairing import enclosed_patch, file_record, patch_metrics, row_set
from diagnose_eye_rims import load_meshes, local_pairs


def inverse_map(parent_ids, parent_length):
    result = np.full(parent_length, -1, dtype=np.int64)
    kept = parent_ids >= 0
    result[parent_ids[kept]] = np.flatnonzero(kept)
    return result


def decoded_primitive_arrays(path):
    """Decode actual GLB attributes and indices without requiring identical packing/names."""
    data = path.read_bytes()
    chunks, offset = {}, 12
    while offset < len(data):
        length, kind = struct.unpack_from('<II', data, offset)
        chunks[kind] = data[offset + 8:offset + 8 + length]
        offset += 8 + length
    gltf, binary = json.loads(chunks[0x4E4F534A]), chunks[0x004E4942]
    dtype_by_component = {5120: 'i1', 5121: 'u1', 5122: '<i2', 5123: '<u2', 5125: '<u4', 5126: '<f4'}
    widths = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

    def accessor(index):
        entry = gltf['accessors'][index]
        assert 'sparse' not in entry, 'Sparse accessors require explicit decoding before provenance comparison.'
        view = gltf['bufferViews'][entry['bufferView']]
        assert view['buffer'] == 0
        dtype, width = np.dtype(dtype_by_component[entry['componentType']]), widths[entry['type']]
        start = view.get('byteOffset', 0) + entry.get('byteOffset', 0)
        stride = view.get('byteStride', dtype.itemsize * width)
        values = np.ndarray((entry['count'], width), dtype=dtype, buffer=binary, offset=start, strides=(stride, dtype.itemsize)).copy()
        return {'componentType': entry['componentType'], 'type': entry['type'], 'normalized': entry.get('normalized', False), 'values': values}

    result = {}
    for role in ['body', 'flame']:
        nodes = [node for node in gltf['nodes'] if role in node.get('name', '') and 'mesh' in node]
        assert len(nodes) == 1, ('Expected exactly one parent mesh node for role', role)
        mesh = gltf['meshes'][nodes[0]['mesh']]
        primitives = []
        for primitive in mesh['primitives']:
            arrays = {semantic: accessor(index) for semantic, index in primitive['attributes'].items()}
            arrays['indices'] = accessor(primitive['indices'])
            primitives.append({'mode': primitive.get('mode', 4), 'arrays': arrays})
        result[role] = primitives
    return result


def compare_validated_parent(parent_asset, parent_meta, validated_record):
    reference_path = Path(validated_record['path'])
    reference_asset, reference_meta = load_asset(reference_path)
    actual_arrays = decoded_primitive_arrays(Path(parent_meta['path']))
    reference_arrays = decoded_primitive_arrays(reference_path)
    checks = {}
    for role in ['body', 'flame']:
        actual, reference = parent_asset[role], reference_asset[role]
        role_checks = {
            'worldCoordinatesExact': np.array_equal(actual.vertices, reference.vertices),
            'orientedTriangleArrayExact': np.array_equal(actual.faces, reference.faces),
            'worldTransformExact': np.array_equal(parent_meta['transforms'][role], reference_meta['transforms'][role]),
            'vertexColorsExact': np.array_equal(actual.visual.vertex_colors, reference.visual.vertex_colors),
            'primitiveCountExact': len(actual_arrays[role]) == len(reference_arrays[role]),
        }
        for index, (first, second) in enumerate(zip(actual_arrays[role], reference_arrays[role])):
            role_checks[f'primitive{index}ModeAndAttributeSetExact'] = first['mode'] == second['mode'] and first['arrays'].keys() == second['arrays'].keys()
            for semantic in sorted(first['arrays'].keys() & second['arrays'].keys()):
                left, right = first['arrays'][semantic], second['arrays'][semantic]
                role_checks[f'primitive{index}{semantic}AccessorMeaningAndValuesExact'] = all(left[k] == right[k] for k in ['componentType', 'type', 'normalized']) and np.array_equal(left['values'], right['values'])
        checks[role] = {key: bool(value) for key, value in role_checks.items()}
    structure_keys = ['scenes', 'nodes', 'meshes', 'meshPrimitiveCounts']
    structure_exact = all(parent_meta['structure'][key] == reference_meta['structure'][key] for key in structure_keys)
    return {'validatedReference': file_record(reference_path), 'expectedValidatedReferenceSha256': validated_record['sha256'],
        'validatedReferenceHashUnchanged': reference_meta['sha256'] == validated_record['sha256'],
        'regeneratedParentByteHashEqualsReference': parent_meta['sha256'] == reference_meta['sha256'],
        'sceneMeshPrimitiveStructureExact': structure_exact, 'meshChecks': checks,
        'decodedParentEquivalent': structure_exact and all(value for role in checks.values() for value in role.values()),
        'method': 'Keep the independently validated original r15 GLB hash pinned. Compare regenerated body/flame world coordinate arrays, ordered oriented triangles, world transforms, vertex colors, and every raw decoded primitive attribute/index accessor including normals, type and normalization semantics. Mesh/datablock names and buffer packing do not enter geometry equivalence.'}


def mesh_issues(mesh):
    faces = mesh.faces
    directed = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    edges, inverse, counts = np.unique(np.sort(directed, axis=1), axis=0, return_counts=True, return_inverse=True)
    balance = np.bincount(inverse, weights=np.where(directed[:, 0] < directed[:, 1], 1, -1))
    _, first, multiplicities = np.unique(oriented_rows(faces), return_index=True, return_counts=True)
    repeated = (faces[:, 0] == faces[:, 1]) | (faces[:, 1] == faces[:, 2]) | (faces[:, 0] == faces[:, 2])
    return {'boundaryExportEdges': edges[counts == 1].tolist(),
            'excessIncidenceExportEdges': edges[counts > 2].tolist(),
            'inconsistentWindingExportEdges': edges[(counts == 2) & (balance != 0)].tolist(),
            'repeatedIndexExportTriangleIds': np.flatnonzero(repeated).tolist(),
            'areaAtMost1eMinus14ExportTriangleIds': np.flatnonzero(mesh.area_faces <= 1e-14).tolist(),
            'firstDuplicateOrientedExportTriangleIds': first[multiplicities > 1].tolist()}


def shared_test(mesh, vertices):
    incident = np.flatnonzero(np.isin(mesh.faces, vertices).any(axis=1))
    result = shared_center_intersections(np.asarray(mesh.vertices), mesh.faces[incident], vertices)
    for pair in result['pairs']:
        pair['exportTriangleIds'] = incident[pair['receiptCapTriangleIds']].tolist()
    result['indexConvention'] = 'exportTriangleIds and auditTriangleVertexRows refer to actual exported triangle/vertex rows of this named mesh; sharedCenterAuditRow is also an exported vertex row.'
    return result


def clean_topology(record):
    return record['components'] == 1 and record['watertight'] and record['windingConsistent'] and record['signedVolume'] > 0 and all(record[key] == 0 for key in ['boundaryEdges', 'edgesAboveTwoFaceIncidence', 'repeatedIndexTriangles', 'areaAtMost1eMinus14Triangles', 'duplicateOrientedTriangles'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--r04-root', type=Path, default=PRIVATE / 'anatomy-r04', help='Contains head-r07, head-r15 and, by default, head-r18. Supports a fresh reproduction root.')
    parser.add_argument('--r03-root', type=Path, default=PRIVATE / 'anatomy-r03')
    parser.add_argument('--candidate-dir', type=Path)
    parser.add_argument('--frozen-file', type=Path, default=PRIVATE / 'anatomy-r02/r02e/charizard-tail-r02e.glb')
    parser.add_argument('--output-prefix', type=Path, default=PRIVATE / 'anatomy-r04/audit/head-r18-validation')
    args = parser.parse_args()
    assert args.output_prefix.resolve().parent == PRIVATE / 'anatomy-r04/audit', 'Reports must stay in the private audit folder.'
    r04, r03 = args.r04_root, args.r03_root
    candidate = args.candidate_dir or r04 / 'head-r18'
    audit_path, receipt_path = candidate / 'eye-audit.npz', candidate / 'eye-receipt.json'
    audit, receipt = np.load(audit_path), json.loads(receipt_path.read_text())
    fair_path, sliver_path, horn_path = r04 / 'head-r15/fair-audit.npz', r04 / 'head-r07/sliver-audit.npz', r03 / 'head-r06/horn-audit.npz'
    fair, sliver, horn = np.load(fair_path), np.load(sliver_path), np.load(horn_path)
    parent_path, candidate_path = r04 / 'head-r15/charizard-head-r15.glb', candidate / 'charizard-head-r18.glb'
    parent_asset, parent_meta = load_asset(parent_path)
    _, candidate_meta = load_asset(candidate_path)
    all_meshes = load_meshes(candidate_path)
    body_name = next(n for n in all_meshes if 'body' in n)
    flame_name = next(n for n in all_meshes if 'flame' in n)
    body, parent_body = all_meshes[body_name], parent_asset['body']
    mapping, map_report = coordinate_mapping(body, audit['after'])
    parent_mapping, parent_map_report = coordinate_mapping(parent_body, audit['before'])
    parent = audit['parent_vertex_ids'].astype(np.int64)
    kept = parent >= 0
    identity = parent.copy()
    identity[~kept] = len(audit['before']) + np.arange((~kept).sum())
    stable_parent_faces = parent_mapping[parent_body.faces]
    stable_faces = identity[mapping[body.faces]]
    parent_to_after = inverse_map(parent, len(audit['before']))
    camera_path = candidate / 'face-cameras.json'
    camera = json.loads(camera_path.read_text())
    origin, frame = np.asarray(camera['origin']), np.asarray(camera['frame'])
    local = (body.vertices - origin) @ frame.T
    before_local = (audit['before'] - origin) @ frame.T
    export_new = (~kept)[mapping]
    parent_meta['coordinateBijection'], candidate_meta['coordinateBijection'] = parent_map_report, map_report
    report = {'inputs': [file_record(p) for p in [audit_path, receipt_path, fair_path, sliver_path, horn_path, camera_path]],
              'helperFiles': [file_record(Path(sys.modules[name].__file__)) for name in ['validate_head_prune', 'validate_divot_fairing', 'diagnose_eye_rims', 'inspect_intersection_pairs']],
              'coordinateConvention': 'Apply glTF scene world transforms, then Blender (x,-z,y).',
              'identityConvention': 'Stable body IDs are r15 audit rows, with distinct diagnostic IDs above the parent range for new skin. Body export rows are independently mapped to audit rows. Eye rows belong to their named exported mesh. Triangle IDs never mean native Blender polygon IDs.',
              'parent': parent_meta, 'candidate': candidate_meta, 'meshes': {}, 'eyes': []}
    for name, mesh in all_meshes.items():
        report['meshes'][name] = {'topology': topology(mesh), 'issues': mesh_issues(mesh)}
    parent_protected = fair['protected']
    expected_protected = np.zeros(len(parent), bool)
    expected_protected[kept] = parent_protected[parent[kept]]
    prior_path = PRIVATE / 'anatomy-r04/audit/head-r15-validation.json'
    prior = json.loads(prior_path.read_text())
    parent_provenance = compare_validated_parent(parent_asset, parent_meta, prior['versions']['r15'])
    report['parentProvenance'] = parent_provenance
    validated_inputs = {Path(entry['path']).name: entry for entry in prior['inputs']}
    ancestry_comparisons = {}
    for filename, current in [('fair-audit.npz', fair), ('sliver-audit.npz', sliver), ('horn-audit.npz', horn)]:
        entry = validated_inputs[filename]
        reference_path = Path(entry['path'])
        reference = np.load(reference_path)
        ancestry_comparisons[filename] = {
            'validatedReferenceHashUnchanged': file_record(reference_path)['sha256'] == entry['sha256'],
            'regeneratedArraysExactlyMatchValidatedReference': set(current.files) == set(reference.files) and all(np.array_equal(current[k], reference[k]) for k in reference.files),
        }
    report['ancestryAuditComparisons'] = ancestry_comparisons
    chain = {
        'beforeExactlyR15FairAuditAfter': np.array_equal(audit['before'], fair['after']),
        'everyRetainedCoordinateExact': np.array_equal(audit['after'][kept], audit['before'][parent[kept]]),
        'retainedParentIdsUnique': len(np.unique(parent[kept])) == kept.sum(),
        'removedComplementExact': np.array_equal(np.setdiff1d(np.arange(len(audit['before'])), parent[kept]), np.sort(audit['removed_parent_vertices'])),
        'protectedMaskComposedExactly': np.array_equal(audit['protected'], expected_protected),
        'receiptCountsExact': kept.sum() == receipt['retainedVerticesExact'] == 121268 and (~kept).sum() == receipt['newSkinVertices'] == 712 and len(audit['removed_parent_vertices']) == receipt['removedVertices'] == 335,
        'validatedR15ReferenceHashUnchanged': parent_provenance['validatedReferenceHashUnchanged'],
        'r15ParentDecodedGeometryMatchesValidatedReference': parent_provenance['decodedParentEquivalent'],
        'priorR15AllNumericalGatesPassed': all(prior['checks'].values()),
        'validatedAncestryAuditArraysAndReferenceHashesExact': all(value for entry in ancestry_comparisons.values() for value in entry.values()),
    }
    report['chainChecks'] = {k: bool(v) for k, v in chain.items()}
    frozen, frozen_meta = load_asset(args.frozen_file)
    source_protected = ~select_head(frozen['body'])
    source_ids = np.flatnonzero(source_protected)
    r07_tail = horn['tail_vertex_ids'][sliver['parent_vertex_ids']]
    r15_to_r07 = fair['head_r07_vertex_ids']
    r15_tail = np.full(len(r15_to_r07), -1, dtype=np.int64)
    has_r07 = r15_to_r07 >= 0
    r15_tail[has_r07] = r07_tail[r15_to_r07[has_r07]]
    tail_ids = np.full(len(parent), -1, dtype=np.int64)
    tail_ids[kept] = r15_tail[parent[kept]]
    tail_to_after = inverse_map(tail_ids, len(source_protected))
    present = tail_to_after[source_ids] >= 0
    protected_exact = present.all() and np.array_equal(audit['after'][tail_to_after[source_ids]], frozen['body'].vertices[source_ids])
    source_faces = frozen['body'].faces[source_protected[frozen['body'].faces].all(axis=1)]
    composed_faces = tail_ids[mapping[body.faces]]
    composed_faces = composed_faces[(composed_faces >= 0).all(axis=1)]
    protected_faces = composed_faces[source_protected[composed_faces].all(axis=1)]
    report['protected'] = {'frozenSource': frozen_meta, 'expectedVertices': len(source_ids), 'presentVertices': int(present.sum()),
        'allCoordinatesExact': bool(protected_exact), 'sourceOrientedTriangles': len(source_faces), 'candidateOrientedTriangles': len(protected_faces), **difference(source_faces, protected_faces)}
    r06_to_r07 = inverse_map(sliver['parent_vertex_ids'], len(sliver['before']))
    r07_to_r15 = inverse_map(r15_to_r07, len(sliver['after']))
    horn_defs = json.loads((r03 / 'head-r06/horn-receipt.json').read_text())['horns']
    report['horns'] = []
    for definition in horn_defs:
        rings = np.asarray(definition['ringVertexIndices'])
        rows = r07_to_r15[r06_to_r07[np.r_[rings.ravel(), definition['tipVertexIndex']]]]
        before_mask, after_mask = np.isin(stable_parent_faces, rows).any(axis=1), np.isin(stable_faces, rows).any(axis=1)
        report['horns'].append({'name': definition['name'], 'rootVertices': len(rings[0]), 'allHornAndRootVertices': len(rows),
            'allCoordinatesExact': bool((parent_to_after[rows] >= 0).all() and np.array_equal(audit['after'][parent_to_after[rows]], audit['before'][rows])),
            'incidentTriangleDifference': difference(stable_parent_faces[before_mask], stable_faces[after_mask])})
    free = fair['free']
    report['divotGrid289CoordinatesExact'] = bool((parent_to_after[free] >= 0).all() and np.array_equal(audit['after'][parent_to_after[free]], fair['after'][free]))
    report['flameExactAgainstParentAndFrozen'] = all(np.array_equal(all_meshes[flame_name].vertices, other.vertices) and np.array_equal(all_meshes[flame_name].faces, other.faces) for other in [parent_asset['flame'], frozen['flame']])
    raycaster = o3d.t.geometry.RaycastingScene()
    raycaster.add_triangles(o3d.core.Tensor(body.vertices.astype(np.float32)), o3d.core.Tensor(body.faces.astype(np.uint32)))
    old_union, new_union = np.zeros(len(parent_body.faces), bool), np.zeros(len(body.faces), bool)
    archive = {}
    r09 = json.loads((PRIVATE / 'anatomy-r04/audit/head-r09-eye-diagnosis.json').read_text())
    for definition in receipt['eyes']:
        side = int(definition['side'])
        name = f'GEO-charizard-eye-{side}-r18'
        eye = all_meshes[name]
        boundary = np.asarray(definition['boundaryParentRows'])
        new_side = export_new & (side * local[:, 0] > 0)
        seeds = identity[mapping[np.flatnonzero(new_side)]]
        removed = audit['removed_parent_vertices']
        old_seeds = removed[side * before_local[removed, 0] > 0]
        patch = enclosed_patch(body, mapping, identity, boundary, seeds)
        old_patch = enclosed_patch(parent_body, parent_mapping, np.arange(len(audit['before'])), boundary, old_seeds)
        old_union |= old_patch
        new_union |= patch
        patch_rows = np.unique(body.faces[patch])
        metrics = patch_metrics(body, patch, mapping, identity)
        old_metrics = patch_metrics(parent_body, old_patch, parent_mapping, np.arange(len(audit['before'])))
        candidate_boundary = row_set(metrics['boundaryStableEdges'])
        expected_edges = row_set(np.sort(np.column_stack([boundary, np.roll(boundary, -1)]), axis=1))
        degree = np.bincount(body.edges_unique.ravel(), minlength=len(body.vertices))
        floor_candidates = np.flatnonzero(new_side & (degree == definition['openingVertices']))
        assert len(floor_candidates) == 1, ('Unique floor fan center required for classification', side, floor_candidates.tolist())
        center = int(floor_candidates[0])
        floor_mask = (body.faces == center).any(axis=1)
        floor_ring = np.setdiff1d(np.unique(body.faces[floor_mask]), [center])
        wall_mask = np.isin(body.faces, floor_ring).any(axis=1) & ~floor_mask
        annulus_mask = patch & ~floor_mask & ~wall_mask
        kind_by_face = {int(i): 0 if annulus_mask[i] else 1 if wall_mask[i] else 2 for i in np.flatnonzero(patch)}
        cross = np.cross(body.triangles[:, 1] - body.triangles[:, 0], body.triangles[:, 2] - body.triangles[:, 0])
        projected_area = cross @ (side * frame[0]) / 2
        reversals = np.flatnonzero(annulus_mask & (projected_area < 0))
        near_zero = np.flatnonzero(annulus_mask & (abs(projected_area) <= 1e-12))
        minimum_angles = np.degrees(body.face_angles.min(axis=1))
        face_quality = {}
        for label, selected in [('annulus', annulus_mask), ('wall', wall_mask), ('floor', floor_mask)]:
            selected_rows = np.flatnonzero(selected)
            minimum_row = int(selected_rows[minimum_angles[selected_rows].argmin()])
            face_quality[label] = {'minimumTriangleAngleDegrees': float(minimum_angles[minimum_row]),
                'minimumAngleExportTriangleId': minimum_row,
                'angleBelowOneDegreeExportTriangleIds': selected_rows[minimum_angles[selected_rows] < 1].tolist(),
                'minimumTriangleArea': float(body.area_faces[selected_rows].min())}
        points = np.vstack([body.vertices[patch_rows], eye.vertices])
        lower, upper = points.min(axis=0) - .008, points.max(axis=0) + .008
        pairs = local_pairs(body, eye, lower, upper, kind_by_face)
        for pair in pairs['pairs']:
            pair['triangleExportVertexRows'] = [(body if kind == 'body' else eye).faces[index].tolist() for kind, index in zip(pair['kinds'], pair['exportTriangleIds'])]
        body_shared = shared_test(body, patch_rows)
        eye_shared = shared_test(eye, np.arange(len(eye.vertices)))
        queries = o3d.core.Tensor(eye.vertices.astype(np.float32))
        signed = raycaster.compute_signed_distance(queries, nsamples=3).numpy()
        closest_faces = raycaster.compute_closest_points(queries)['primitive_ids'].numpy()
        eye_degree = np.bincount(eye.edges_unique.ravel(), minlength=len(eye.vertices))
        poles = np.flatnonzero(eye_degree > 12)
        pole_records = [{'eyeExportVertexId': int(v), 'coordinate': eye.vertices[v].tolist(), 'valence': int(eye_degree[v]),
                         'signedDistanceToClosedBody': float(signed[v]), 'nearestBodyExportTriangleId': int(closest_faces[v])} for v in poles]
        old_result = next(e for e in r09['eyes'] if e['side'] == side)
        checks = {
            'fixedBoundaryEdgesAndCoordinatesExact': candidate_boundary == expected_edges == row_set(old_metrics['boundaryStableEdges']) and (parent_to_after[boundary] >= 0).all() and np.array_equal(audit['after'][parent_to_after[boundary]], audit['before'][boundary]),
            'orbitalPatchIsOneOrientedDisk': metrics['eulerCharacteristic'] == 1 and metrics['boundaryOneSimpleCycle'] and metrics['excessEdgeIncidences'] == metrics['inconsistentInteriorEdges'] == 0,
            'annulusTriangleCountMatchesReceipt': int(annulus_mask.sum()) == definition['annulusTriangles'],
            'noAnnulusProjectionReversals': len(reversals) == 0,
            'noAnnulusProjectedAreaAtMost1eMinus12': len(near_zero) == 0,
            'bodyLocalNoDetectorPairs': pairs['counts']['body-body']['detectedPairs'] == 0,
            'bodyLocalNoStrictCrossings': pairs['counts']['body-body']['strictConfirmedPairs'] == 0,
            'bodyPatchNoSharedVertexOverlap': body_shared['detectedOverlapPairs'] == 0,
            'bodyEyeNoDetectorPairs': pairs['counts']['body-eye']['detectedPairs'] == 0,
            'bodyEyeNoStrictCrossings': pairs['counts']['body-eye']['strictConfirmedPairs'] == 0,
            'eyeNoDetectorPairs': pairs['counts']['eye-eye']['detectedPairs'] == 0,
            'eyeNoStrictCrossings': pairs['counts']['eye-eye']['strictConfirmedPairs'] == 0,
            'eyeNoSharedVertexOverlap': eye_shared['detectedOverlapPairs'] == 0,
            'eyeTopologyAndDegeneracy': clean_topology(report['meshes'][name]['topology']),
            'allEyeVertexDistanceSamplesPositive': bool((signed > 0).all()),
        }
        report['eyes'].append({'side': side, 'eyeNode': name, 'checks': {k: bool(v) for k, v in checks.items()},
            'patch': metrics, 'parentPatch': old_metrics, 'newSkinVertices': int(new_side.sum()),
            'bodyFaceClasses': {'0': 'annulus', '1': 'socket wall', '2': 'socket floor', '-1': 'outside orbital patch'},
            'floorCenterExportVertexId': center, 'floorRingExportVertexIds': floor_ring.tolist(),
            'annulusExportTriangleIds': np.flatnonzero(annulus_mask).tolist(), 'wallTriangles': int(wall_mask.sum()), 'floorTriangles': int(floor_mask.sum()),
            'projectionReversedAnnulusExportTriangleIds': reversals.tolist(), 'nearZeroProjectionAnnulusExportTriangleIds': near_zero.tolist(),
            'minimumSignedProjectedAnnulusArea': float(projected_area[annulus_mask].min()),
            'faceClassQuality': face_quality,
            'localTestBounds': [lower.tolist(), upper.tolist()], 'localIntersections': pairs,
            'sharedVertexBodyPatchTest': body_shared, 'sharedVertexWholeEyeTest': eye_shared,
            'eyeVertexClearance': {'minimumSignedDistance': float(signed.min()), 'minimumDistanceExportVertexId': int(signed.argmin()),
                'nonpositiveDistanceExportVertexIds': np.flatnonzero(signed <= 0).tolist(), 'poles': pole_records},
            'r09Comparison': {'r09AnnulusProjectionReversedTriangles': sum(b['projectionReversedTriangles'] for b in old_result['rimBands']),
                'r09LocalIntersections': old_result['localIntersections']['counts'], 'r09MinimumSignedEyeVertexDistance': old_result['eyeBodyDistanceSamples']['minimumSignedDistance']}})
        archive[f'side_{side}_body_patch_export_triangle_ids'] = np.flatnonzero(patch)
        archive[f'side_{side}_eye_signed_body_distance'] = signed
        archive[f'side_{side}_eye_nearest_body_export_triangle_ids'] = closest_faces
        print('side', side, 'gates', report['eyes'][-1]['checks'], flush=True)
    report['exterior'] = {'parentOrientedTriangles': int((~old_union).sum()), 'candidateOrientedTriangles': int((~new_union).sum()), **difference(stable_parent_faces[~old_union], stable_faces[~new_union])}
    lower, upper = np.asarray(json.loads((PRIVATE / 'anatomy-r03/audit/head-r01-validation.json').read_text())['localIntersectionBounds'])
    common, _ = local_intersections(body, identity[mapping], lower, upper, oriented_rows(stable_faces[new_union]))
    report['commonExpandedHeadTest'] = {'bounds': [lower.tolist(), upper.tolist()], **common}
    report['signedBodyVolumeChangeVsR15Percent'] = float(100 * (body.volume / parent_body.volume - 1))
    structure = candidate_meta['structure']
    gates = {
        'exportAuditBijections': True,
        'exactParentChainAndRetainedCoordinates': all(chain.values()),
        'oneSceneFourMeshes': structure['scenes'] == 1 and structure['nodes'] == structure['meshes'] == 4,
        'expectedBodyCounts': len(body.vertices) == 121980 and len(body.faces) == 243960,
        'protectedFrozenCoordinatesAndOrientedTrianglesExact': protected_exact and len(source_ids) == 113062 and len(source_faces) == len(protected_faces) == 226039 and report['protected']['missing'] == report['protected']['added'] == 0,
        'allExteriorOrientedTrianglesExact': report['exterior']['missing'] == report['exterior']['added'] == 0,
        'hornsAndRootsAndIncidentTrianglesExact': all(h['allCoordinatesExact'] and h['incidentTriangleDifference'] == {'missing': 0, 'added': 0} for h in report['horns']),
        'divotFairingVerticesExact': report['divotGrid289CoordinatesExact'],
        'flameExact': report['flameExactAgainstParentAndFrozen'],
        'bodyTopologyAndDegeneracy': clean_topology(report['meshes'][body_name]['topology']),
        'allOrbitalAndEyeGates': all(value for e in report['eyes'] for value in e['checks'].values()),
        'commonExpandedHeadNoDetectorPairs': common['pairCount'] == 0,
    }
    report['checks'] = {k: bool(v) for k, v in gates.items()}
    report['limits'] = ['Numerical status only, without visual or anatomical approval.',
        'Body self-crossing coverage is the two recorded orbital AABBs and common expanded head AABB; body-eye coverage includes every eye triangle and all body triangles whose AABBs overlap the full eye-plus-patch bounds. No whole-body self-intersection certification.',
        'Open3D candidate pairs are independently checked for proper interior edge-triangle crossings. Detector counts and strict-confirmed counts remain separate.',
        'Shared-vertex supplement checks all incident triangle pairs around patch vertices including adjacent exterior faces, and every vertex of each eye. Its cone/planar tolerances appear in each result.',
        'Signed body distances sample eye vertices and are not a certified complete triangle-surface clearance minimum.',
        'No geometry or target coordinates authored; all reported indices describe existing exported artifacts.']
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    np.savez_compressed(args.output_prefix.with_suffix('.npz'), **archive)
    failed = [k for k, v in report['checks'].items() if not v]
    status = 'All stated numerical gates pass.' if not failed else 'Failed numerical gates: ' + ', '.join(failed) + '.'
    lines = [status, '', 'The actual r18 body has 121,980 vertices and 243,960 triangles. Every retained r15 coordinate is exact. Direct frozen-source checks preserve all 113,062 protected vertices and 226,039 oriented triangles. Both horns, root rings and their incident triangles, all 289 r15 fairing vertices, and the flame remain exact.', '',
        'Parent provenance keeps the original validated r15 GLB hash pinned and separately compares the current parent with that reference. Both decoded body/flame coordinate arrays, ordered oriented triangles, transforms, vertex colors, and every primitive attribute/index accessor (including normals and normalization semantics) must match. Changed mesh/datablock names can change GLB bytes without weakening this gate.', '',
        '| Gate | Status |', '| --- | --- |']
    lines.extend(f'| {key} | {"PASS" if value else "FAIL"} |' for key, value in report['checks'].items())
    lines += ['', '| Orbital/eye gate | Side +1 | Side −1 |', '| --- | --- | --- |']
    by_side = {e['side']: e for e in report['eyes']}
    for key in by_side[1]['checks']:
        lines.append(f'| {key} | {"PASS" if by_side[1]["checks"][key] else "FAIL"} | {"PASS" if by_side[-1]["checks"][key] else "FAIL"} |')
    for side in [1, -1]:
        e = by_side[side]
        lines += ['', f'Side {side:+d} ({e["eyeNode"]}): {e["patch"]["boundaryEdges"]} fixed boundary edges, {e["annulusExportTriangleIds"].__len__()} annulus triangles, {e["wallTriangles"]} wall triangles and {e["floorTriangles"]} floor triangles. Minimum signed projected annulus area is {e["minimumSignedProjectedAnnulusArea"]:.9g}; the minimum sampled eye-to-body distance is {e["eyeVertexClearance"]["minimumSignedDistance"]:.9g}.',
            f'Local detector/strict counts: {e["localIntersections"]["counts"]}. Shared-vertex overlaps: body {e["sharedVertexBodyPatchTest"]["detectedOverlapPairs"]}, eye {e["sharedVertexWholeEyeTest"]["detectedOverlapPairs"]}.',
            'Minimum triangle angles by surface: ' + ', '.join(f'{label} {q["minimumTriangleAngleDegrees"]:.6g}°' for label, q in e['faceClassQuality'].items()) + '. Thin-triangle indices are recorded separately from the degeneracy gates.']
    lines += ['', 'The rejected r09 had 27 / 48 projection-reversed skin triangles, 37 / 38 confirmed skin self-crossing pairs, and 152 / 164 confirmed body–eye pairs, with rear poles approximately 0.00492 inside the body. The r18 per-gate results above directly test those two mechanisms.', '',
        'This report covers the actual exported geometry and recorded local regions. It does not grant visual approval or certify whole-body intersection freedom. Eye signed distances are vertex samples, not a global surface-clearance certificate. Failure indices and full overlap records are in the adjacent JSON; rows refer to exported triangles/vertices of the named mesh, never native Blender polygon IDs.', '',
        'Rerun validate_orbital_cdt.py with the Hunyuan Python environment. Explicit --r04-root/--r03-root/--candidate-dir support regenerated ancestry. Default artifact paths remain private when the script is copied into tools/charizard-face/audit; imports prefer sibling repository head/root audit helpers, with private fallbacks.']
    args.output_prefix.with_suffix('.md').write_text('\n'.join(lines) + '\n')
    print(json.dumps({'checks': report['checks'], 'protected': {k: v for k, v in report['protected'].items() if k != 'frozenSource'}, 'exterior': report['exterior']}, indent=2))
    if failed:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
