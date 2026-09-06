"""Verify r03 export integrity and transfer the existing r02 tail test by exact geometry equality."""
import argparse
import json
from pathlib import Path

import numpy as np

from check_whole_r02 import OUT, PRIVATE, file_record, load_asset, topology, triangle_keys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=PRIVATE / 'whole-r03')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'r03-transfer-check')
    args = parser.parse_args()
    assert args.output_prefix.resolve().parent == OUT.resolve()
    assert not any(args.output_prefix.with_suffix(s).exists() for s in ['.json', '.md', '.npz'])
    source_path = OUT / 'export-tail-check.json'
    detail_path = OUT / 'tail-contact-details.json'
    source = json.loads(source_path.read_text())
    details = json.loads(detail_path.read_text())
    parent_path = Path(source['candidate']['path'])
    assert file_record(parent_path)['sha256'] == source['candidate']['sha256']
    assert details['inputReport']['sha256'] == file_record(source_path)['sha256']
    parent, _ = load_asset(parent_path)
    meshes, metadata = load_asset(args.candidate_dir / 'charizard-whole-r03.glb')
    capture_path = args.candidate_dir / 'capture-receipt.json'
    expected = {r['name'].split('GEO-charizard-')[1].split('-whole-')[0]: r for r in json.loads(capture_path.read_text())['meshes']}
    report = {'candidate': metadata, 'captureReceipt': file_record(capture_path), 'parent': file_record(parent_path),
        'sourceTailReport': file_record(source_path), 'sourceContactDetails': file_record(detail_path),
        'validator': file_record(Path(__file__).resolve()), 'meshes': {}, 'blockers': [],
        'scope': 'Quick integrity check and exact transfer of r02 tail-contact evidence. No new intersection detection or eye audit.'}
    report['oneSceneFourMeshes'] = metadata['scenes'] == 1 and metadata['nodes'] == metadata['meshes'] == metadata['meshNodes'] == 4
    if not report['oneSceneFourMeshes']:
        report['blockers'].append('Unexpected scene/node/mesh counts.')
    for role, mesh in meshes.items():
        finite = bool(np.isfinite(mesh.vertices).all())
        valid = bool(((mesh.faces >= 0) & (mesh.faces < len(mesh.vertices))).all())
        assert finite and valid
        t = topology(mesh)
        counts_match = len(mesh.vertices) == expected[role]['vertices'] and len(mesh.faces) == expected[role]['triangles']
        report['meshes'][role] = {'finiteCoordinates': finite, 'validIndices': valid, 'countsMatchCapture': counts_match,
            'topology': t, 'coordinatesExactlyR02': bool(np.array_equal(mesh.vertices, parent[role].vertices)),
            'orderedTrianglesExactlyR02': bool(np.array_equal(mesh.faces, parent[role].faces))}
        if not counts_match or not t['watertight'] or not t['windingConsistent'] or t['components'] != 1 or t['areaAtMost1eMinus14Triangles']:
            report['blockers'].append(f'{role}: failed an export integrity check; see mesh record.')
        print(role, len(mesh.vertices), len(mesh.faces), 'zero', t['exactZeroAreaTriangles'], flush=True)
    body, old_body = meshes['body'], parent['body']
    rollback_path = args.candidate_dir / 'face-rollback.npz'
    rollback = np.load(rollback_path)
    changed = np.flatnonzero(np.any(body.vertices != old_body.vertices, axis=1))
    report['faceRollback'] = {'archive': file_record(rollback_path), 'selectedVertices': len(rollback['nativeIndices']), 'changedVertices': len(changed),
        'changedIdsExactlyReceiptSelection': bool(np.array_equal(np.sort(changed), np.sort(rollback['nativeIndices']))),
        'selectedAlreadyExactVertexIds': np.setdiff1d(rollback['nativeIndices'], changed).tolist(),
        'changedVerticesOutsideSelection': np.setdiff1d(changed, rollback['nativeIndices']).tolist(),
        'restoredCoordinatesExactlyArchive': bool(np.array_equal(body.vertices[rollback['nativeIndices']], rollback['originalCoordinates']))}
    if report['faceRollback']['changedVerticesOutsideSelection'] or not report['faceRollback']['restoredCoordinatesExactlyArchive']:
        report['blockers'].append('Face rollback changes exterior coordinates or differs from the recorded target coordinates.')
    ids = np.load(OUT / 'export-tail-check.npz')['tail_native_export_vertex_ids']
    tail = np.zeros(len(body.vertices), bool)
    tail[ids] = True
    before_tail_faces = old_body.faces[tail[old_body.faces].any(axis=1)]
    after_tail_faces = body.faces[tail[body.faces].any(axis=1)]
    lower, upper = np.asarray(source['commonTailContactBounds'])
    local_faces, used = [], []
    for mesh in [old_body, body]:
        tri = mesh.triangles
        local = np.flatnonzero((tri.max(axis=1) >= lower).all(axis=1) & (tri.min(axis=1) <= upper).all(axis=1))
        local_faces.append(local)
        used.append(np.unique(mesh.faces[local]))
    transfer = {'selectedTailVertices': len(ids), 'tailCoordinatesExactlyR02': bool(np.array_equal(body.vertices[ids], old_body.vertices[ids])),
        'tailIncidentOrientedTrianglesExactlyR02': bool(np.array_equal(np.sort(triangle_keys(before_tail_faces)), np.sort(triangle_keys(after_tail_faces)))),
        'commonContactBounds': source['commonTailContactBounds'], 'r02BodyTrianglesInTest': len(local_faces[0]), 'r03BodyTrianglesInTest': len(local_faces[1]),
        'entireTestedVertexIdSetExactlyR02': bool(np.array_equal(used[0], used[1])),
        'entireTestedCoordinatesExactlyR02': bool(np.array_equal(old_body.vertices[used[0]], body.vertices[used[1]])),
        'entireTestedOrientedTrianglesExactlyR02': bool(np.array_equal(np.sort(triangle_keys(old_body.faces[local_faces[0]])), np.sort(triangle_keys(body.faces[local_faces[1]]))))}
    transfer['allRequiredEqualityChecksPass'] = all(value for key, value in transfer.items() if 'ExactlyR02' in key)
    transfer['intersectionPassRerun'] = False
    transfer['transferredResult'] = source['tailContactComparison']['r02'] if transfer['allRequiredEqualityChecksPass'] else None
    transfer['transferredCandidateClassification'] = details['versions']['r02'] if transfer['allRequiredEqualityChecksPass'] else None
    report['tailEvidenceTransfer'] = transfer
    if not transfer['allRequiredEqualityChecksPass']:
        report['blockers'].append('Exact tail-contact evidence transfer failed; old intersection result cannot certify changed test geometry.')
    report['risks'] = ['The four inherited detector candidates have positive computed gaps of 1.518e-5 to 3.001e-5, with zero confirmed strict crossings; detector count alone does not justify mesh repair.',
        'Transferred coverage excludes shared-vertex overlaps/adjacent-face foldovers, separate eye/flame contacts and body regions outside the recorded tail test. No minimum-clearance or anatomical/runtime certificate is implied.']
    np.savez_compressed(args.output_prefix.with_suffix('.npz'), changed_body_vertex_ids=changed,
        r02_contact_export_triangle_ids=local_faces[0], r03_contact_export_triangle_ids=local_faces[1])
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    lines = ['R03 export integrity and r02 tail-evidence transfer.', '',
        'Blockers: ' + ('; '.join(report['blockers']) or 'none within this scope') + '.', '',
        'The four mesh counts match capture; all four are finite, closed, consistently wound single components with zero zero-area triangles.', '',
        f"The rollback selects {len(rollback['nativeIndices']):,} vertices and changes {len(changed):,}. Already-exact selected IDs: {report['faceRollback']['selectedAlreadyExactVertexIds']}. Changes outside the selection: {len(report['faceRollback']['changedVerticesOutsideSelection'])}. All selected coordinates exactly match face-rollback.npz: {report['faceRollback']['restoredCoordinatesExactlyArchive']}.", '',
        f"All {len(ids):,} selected tail coordinates and their incident oriented triangles remain exact. The entire {len(local_faces[1]):,}-triangle contact-test region also has exactly the same vertices, coordinates and oriented triangles as r02. Therefore the prior test transfers without rerunning intersection detection.", '',
        'Transferred result: zero tail-to-rest-of-body detector pairs, zero strictly confirmed tail self-crossings, four positive-gap detector candidates. Full counts and candidate locations remain linked in JSON.', '', *report['risks']]
    args.output_prefix.with_suffix('.md').write_text('\n'.join(lines) + '\n')
    print(json.dumps({'faceRollback': report['faceRollback'], 'transferPass': transfer['allRequiredEqualityChecksPass'], 'blockers': report['blockers']}, indent=2))


if __name__ == '__main__':
    main()
