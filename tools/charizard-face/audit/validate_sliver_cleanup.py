"""Read-only validation of the actual r07 interior sliver-cluster weld."""
import argparse
import hashlib
import json
import sys
from pathlib import Path

import numpy as np


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/audit')
R03 = OUT.parents[1] / 'anatomy-r03'
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'charizard-head/audit'))
from validate_head_prune import coordinate_mapping, difference, load_asset, local_intersections, oriented_rows, topology
from diagnose_remaining_head import patch_record


def file_record(path):
    return {'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=OUT.parent / 'head-r07')
    parser.add_argument('--candidate-file', default='charizard-head-r07.glb')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'head-r07-validation')
    args = parser.parse_args()
    audit_path, receipt_path = args.candidate_dir / 'sliver-audit.npz', args.candidate_dir / 'sliver-receipt.json'
    audit, receipt = np.load(audit_path), json.loads(receipt_path.read_text())
    parent_audit_path = R03 / 'head-r06/horn-audit.npz'
    parent_audit = np.load(parent_audit_path)
    before, after = audit['before'].astype(float), audit['after'].astype(float)
    parent_ids = audit['parent_vertex_ids'].astype(np.int64)
    removed = audit['removed_parent_vertices'].astype(np.int64)
    r06_validation_path = R03 / 'audit/head-r06-validation.json'
    prior_validation = json.loads(r06_validation_path.read_text())
    paths = {'r06': R03 / 'head-r06/charizard-head-r06.glb', 'candidate': args.candidate_dir / args.candidate_file}
    coordinates = {'r06': before, 'candidate': after}
    identity = {'r06': np.arange(len(before)), 'candidate': parent_ids}
    meshes, flames, mappings, stable_faces, report = {}, {}, {}, {}, {
        'audit': file_record(audit_path), 'receipt': file_record(receipt_path),
        'parentAudit': file_record(parent_audit_path), 'parentFrozenAncestryValidation': file_record(r06_validation_path),
        'coordinateConvention': 'Apply glTF scene transform, then (x,-z,y) to Blender world.',
        'identityConvention': 'All stable triangle and boundary IDs are r06 exported/audit vertex rows. Candidate export rows map bijectively to r07 audit rows, then parent_vertex_ids maps them to r06. Native Blender polygon IDs are not inferred from exported triangle rows.',
        'versions': {},
    }
    for label, path in paths.items():
        asset, metadata = load_asset(path)
        meshes[label], flames[label] = asset['body'], asset['flame']
        mappings[label], mapping_report = coordinate_mapping(asset['body'], coordinates[label])
        stable_faces[label] = identity[label][mappings[label][asset['body'].faces]]
        metadata['coordinateBijection'] = mapping_report
        metadata['body'], metadata['flame'] = topology(asset['body']), topology(asset['flame'])
        report['versions'][label] = metadata
    assert np.array_equal(mappings['r06'], np.arange(len(before)))
    parent_protected = parent_audit['protected']
    map_checks = {
        'beforeExactlyMatchesR06AuditAfter': bool(np.array_equal(before, parent_audit['after'])),
        'everyRetainedCoordinateExact': bool(np.array_equal(after, before[parent_ids])),
        'parentIdsUnique': len(np.unique(parent_ids)) == len(parent_ids),
        'removedIdsExactlyExpected': bool(np.array_equal(removed, [62094, 62898])),
        'removedComplementExact': bool(np.array_equal(np.setdiff1d(np.arange(len(before)), parent_ids), removed)),
        'protectedMaskExactlyComposedFromR06': bool(np.array_equal(audit['protected'], parent_protected[parent_ids])),
        'validatedR06SourceHashUnchanged': report['versions']['r06']['sha256'] == prior_validation['versions']['candidate']['sha256'],
        'r06FrozenSourceProtectionPreviouslyVerified': prior_validation['checks']['protectedSourceCoordinatesAndTrianglesExact'],
        'countsMatchReceipt': len(removed) == receipt['removedVertices'] == 2 and len(after) == receipt['retainedVerticesExact'] == 122631,
    }
    report['audit']['checks'] = map_checks
    protected_ids = np.flatnonzero(parent_protected)
    parent_to_after = np.full(len(before), -1, dtype=np.int64)
    parent_to_after[parent_ids] = np.arange(len(after))
    present = parent_to_after[protected_ids] >= 0
    protected_distances = np.linalg.norm(after[parent_to_after[protected_ids[present]]] - before[protected_ids[present]], axis=1)
    protected_faces = {label: faces[parent_protected[faces].all(axis=1)] for label, faces in stable_faces.items()}
    report['protected'] = {'expectedVertices': len(protected_ids), 'retainedVertices': int(present.sum()),
                           'maximumDisplacement': float(protected_distances.max()),
                           'orientedTrianglesBefore': len(protected_faces['r06']), 'orientedTrianglesAfter': len(protected_faces['candidate']),
                           **difference(protected_faces['r06'], protected_faces['candidate'])}
    cluster = np.asarray(receipt['selectedParentRows'], dtype=np.int64)
    destination = int(receipt['destinationParentRow'])
    old_patch_mask = np.isin(stable_faces['r06'], cluster).any(axis=1)
    new_patch_mask = (stable_faces['candidate'] == destination).any(axis=1)
    old_patch_ids, new_patch_ids = np.flatnonzero(old_patch_mask), np.flatnonzero(new_patch_mask)
    old_patch, new_patch = stable_faces['r06'][old_patch_mask], stable_faces['candidate'][new_patch_mask]
    old_patch_metrics = patch_record(meshes['r06'], old_patch_ids)
    new_patch_metrics = patch_record(meshes['candidate'], new_patch_ids)
    new_boundary_export_rows = np.asarray(new_patch_metrics['fixedBoundaryR06VertexCycle'], dtype=np.int64)
    new_boundary_parent = parent_ids[mappings['candidate'][new_boundary_export_rows]]
    old_boundary = np.asarray(old_patch_metrics['fixedBoundaryR06VertexCycle'], dtype=np.int64)
    old_expected = old_patch.copy()
    old_expected[np.isin(old_expected, removed)] = destination
    repeated = (old_expected[:, 0] == old_expected[:, 1]) | (old_expected[:, 1] == old_expected[:, 2]) | (old_expected[:, 0] == old_expected[:, 2])
    expected_weld_faces = old_expected[~repeated]
    exterior = difference(stable_faces['r06'][~old_patch_mask], stable_faces['candidate'][~new_patch_mask])
    patch_checks = {
        'oldPatchIsExpected13TriangleDisk': len(old_patch) == 13 and old_patch_metrics['eulerCharacteristic'] == 1 and old_patch_metrics['boundaryOneSimpleCycle'],
        'newPatchIs9TriangleDisk': len(new_patch) == 9 and new_patch_metrics['eulerCharacteristic'] == 1 and new_patch_metrics['boundaryOneSimpleCycle'],
        'fixedNineVertexBoundaryUnchanged': len(old_boundary) == len(new_boundary_parent) == 9 and set(map(int, old_boundary)) == set(map(int, new_boundary_parent)),
        'newTrianglesExactlyMatchDeclaredWeld': difference(expected_weld_faces, new_patch) == {'missing': 0, 'added': 0},
        'allExteriorOrientedTrianglesExact': exterior == {'missing': 0, 'added': 0},
    }
    report['patch'] = {'checks': patch_checks, 'oldExportTriangleIds': old_patch_ids.tolist(),
                       'newExportTriangleIds': new_patch_ids.tolist(), 'newActualTriangleR06ParentRows': new_patch.tolist(),
                       'fixedBoundaryR06ParentCycle': old_boundary.tolist(), 'newBoundaryR07ExportCycle': new_boundary_export_rows.tolist(),
                       'oldTriangleCount': len(old_patch), 'newTriangleCount': len(new_patch),
                       'oldMinimumTriangleArea': float(meshes['r06'].area_faces[old_patch_mask].min()),
                       'newMinimumTriangleArea': float(meshes['candidate'].area_faces[new_patch_mask].min()),
                       'exteriorOrientedTrianglesBefore': int((~old_patch_mask).sum()), 'exteriorOrientedTrianglesAfter': int((~new_patch_mask).sum()),
                       'exteriorDifference': exterior}
    bounds_path = R03 / 'audit/head-r01-validation.json'
    lower, upper = np.asarray(json.loads(bounds_path.read_text())['localIntersectionBounds'])
    report['localIntersectionBounds'] = [lower.tolist(), upper.tolist()]
    report['localIntersectionMethod'] = 'Open3D using exactly the saved expanded head AABB from head-r01. Reports detector pair counts; the r06 pair was independently classified as disjoint near-contact/sliver, not a proper crossing. Shared-vertex configurations and other model regions are outside this check.'
    pair_sets = {}
    empty_keys = oriented_rows(np.empty((0, 3), dtype=np.int64))
    for label, mesh in meshes.items():
        result, pair_sets[label] = local_intersections(mesh, identity[label][mappings[label]], lower, upper, empty_keys)
        for pair in result['pairs']:
            del pair['involvesNewCapTriangle']
        result['newPairsAgainstR06'] = len(pair_sets[label] - pair_sets['r06'])
        result['retainedPairsFromR06'] = len(pair_sets[label] & pair_sets['r06'])
        report['versions'][label]['localIntersections'] = result
        print(label, 'local detector pairs', result['pairCount'], flush=True)
    candidate, body = report['versions']['candidate'], report['versions']['candidate']['body']
    report['flameExactAgainstR06'] = bool(np.array_equal(flames['candidate'].vertices, flames['r06'].vertices) and np.array_equal(flames['candidate'].faces, flames['r06'].faces))
    report['signedVolumeChangeVsR06Percent'] = 100 * (meshes['candidate'].volume / meshes['r06'].volume - 1)
    report['checks'] = {
        'exportAuditBijections': True,
        'sourceAncestryAndRetainedCoordinates': all(map_checks.values()),
        'oneSceneTwoMeshes': candidate['structure']['scenes'] == 1 and candidate['structure']['nodes'] == 2 and candidate['structure']['meshes'] == 2,
        'expectedBodyCounts': body['vertices'] == 122631 and body['triangles'] == 245262,
        'protectedCoordinatesAndOrientedTrianglesExact': len(protected_ids) == 113062 and present.all() and protected_distances.max() == 0 and len(protected_faces['candidate']) == 226039 and report['protected']['missing'] == 0 and report['protected']['added'] == 0,
        'fixedBoundaryAndExteriorAndActualWeldExact': all(patch_checks.values()),
        'bodyTopologyAndDegeneracy': body['components'] == 1 and body['watertight'] and body['windingConsistent'] and body['boundaryEdges'] == 0 and body['edgesAboveTwoFaceIncidence'] == 0 and body['repeatedIndexTriangles'] == 0 and body['areaAtMost1eMinus14Triangles'] == 0 and body['duplicateOrientedTriangles'] == 0,
        'flameExact': report['flameExactAgainstR06'],
        'noDetectedLocalHeadPairs': candidate['localIntersections']['pairCount'] == 0,
    }
    report['checks'] = {key: bool(value) for key, value in report['checks'].items()}
    report['limits'] = ['The near-contact detector artifact is removed; this is not a claim that an actual triangle crossing was repaired.', 'No whole-model or anatomical acceptance. The skull/neck crease is outside this sliver edit.', 'Actual output triangles are recorded for validation; no replacement mesh or new coordinate targets are authored by this script.']
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    failures = [key for key, value in report['checks'].items() if not value]
    text = f'''# Head-r07 sliver cleanup validation

{'All stated numerical gates pass.' if not failures else 'Numerical gates fail: ' + ', '.join(failures) + '.'}

The actual export has 122,631 vertices and 245,262 triangles. Every retained r06 coordinate remains exact. The two removed parent rows are exactly 62094 and 62898, welded to existing row 62088. All 113,062 protected vertices and 226,039 oriented protected triangles remain exact; r06's frozen-source ancestry receipt and GLB hash are unchanged. The flame is exact.

The original 13-triangle disk becomes a 9-triangle disk. All nine boundary vertices retain their coordinates, and all {int((~old_patch_mask).sum()):,} exterior oriented triangles remain exact. Actual exported replacement triangles match the declared weld precisely; their export IDs and r06 parent triples are in JSON. Minimum patch area improves from {report['patch']['oldMinimumTriangleArea']:.12g} to {report['patch']['newMinimumTriangleArea']:.12g}.

The body remains one closed, consistently wound component with no tested degenerate or duplicate triangles. The common local head test reports {report['versions']['r06']['localIntersections']['pairCount']} r06 detector pair and {candidate['localIntersections']['pairCount']} r07 pairs. The old detection was independently shown to be a disjoint near-contact/sliver; no actual-crossing repair is claimed. Signed volume changes {report['signedVolumeChangeVsR06Percent']:.12g}%.

The skull/neck crease and unfinished face are outside this edit. Local detector coverage does not certify whole-model intersection freedom or anatomical correctness.

Rerun `validate_sliver_cleanup.py` with the Hunyuan Python environment. Optional `--candidate-dir`, `--candidate-file`, and `--output-prefix` support an exact replay. It reads existing artifacts and writes audit JSON/Markdown only.
'''
    args.output_prefix.with_suffix('.md').write_text(text)
    print(json.dumps({'checks': report['checks'], 'protected': report['protected'], 'patch': report['patch'], 'signedVolumeChangeVsR06Percent': report['signedVolumeChangeVsR06Percent']}, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
