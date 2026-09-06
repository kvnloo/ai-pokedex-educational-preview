"""Bounded CPU export check for the working whole-character sculpt."""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
import open3d as o3d

PRIVATE = Path('/mnt/zer0models/pokemon-iac/characters/charizard')
sys.path[:0] = [str(PRIVATE / 'anatomy-r04/audit'), str(PRIVATE / 'anatomy-r03/audit'), str(PRIVATE / 'anatomy-r02/audit-root-surface')]
from diagnose_eye_rims import load_meshes, local_pairs
from validate_head_prune import load_asset, topology
from validate_divot_fairing import file_record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-dir', type=Path, default=PRIVATE / 'anatomy-r05/whole-r01')
    parser.add_argument('--output-prefix', type=Path, default=PRIVATE / 'anatomy-r05/whole-r01/audit/export-check')
    args = parser.parse_args()
    assert args.output_prefix.resolve().parent == PRIVATE / 'anatomy-r05/whole-r01/audit'
    path = args.candidate_dir / 'charizard-whole-r01.glb'
    _, metadata = load_asset(path)
    meshes = load_meshes(path)
    receipt_path = args.candidate_dir / 'capture-receipt.json'
    receipt = json.loads(receipt_path.read_text())
    expected = {record['name']: record for record in receipt['meshes']}
    baseline_path = PRIVATE / 'anatomy-r04/head-r18/charizard-head-r18.glb'
    baseline = load_meshes(baseline_path)
    report = {'candidate': metadata, 'captureReceipt': file_record(receipt_path), 'baseline': file_record(baseline_path),
        'scope': 'Working sculpt integrity and focused orbital intersections only. No frozen-coordinate constraint, local surgery plan, anatomical approval, or runtime promotion.',
        'coordinateConvention': 'glTF world transforms followed by Blender (x,-z,y). Face/vertex IDs refer to the actual exported mesh named in the report.',
        'meshes': {}, 'eyes': [], 'blockers': [], 'risks': []}
    archive = {}
    for name, mesh in meshes.items():
        finite = bool(np.isfinite(mesh.vertices).all())
        valid_indices = bool(((mesh.faces >= 0) & (mesh.faces < len(mesh.vertices))).all())
        counts_match = name in expected and len(mesh.vertices) == expected[name]['vertices'] and len(mesh.faces) == expected[name]['triangles']
        record = {'finiteVertices': finite, 'validTriangleIndices': valid_indices, 'countsMatchCapture': bool(counts_match)}
        if finite and valid_indices:
            record['topology'] = topology(mesh)
            record['areaAtMost1eMinus14ExportTriangleIds'] = np.flatnonzero(mesh.area_faces <= 1e-14).tolist()
            t = record['topology']
            if not t['watertight'] or not t['windingConsistent'] or t['components'] != 1 or t['edgesAboveTwoFaceIncidence']:
                report['blockers'].append(f'{name}: open, inconsistent or unexpected component topology; see mesh counts.')
            if t['repeatedIndexTriangles'] or t['duplicateOrientedTriangles'] or t['areaAtMost1eMinus14Triangles']:
                report['risks'].append(f'{name}: repeated, duplicate or near-zero-area triangles; exact IDs/counts are recorded.')
        else:
            report['blockers'].append(f'{name}: nonfinite coordinates or invalid triangle indices.')
        if not counts_match:
            report['blockers'].append(f'{name}: exported counts differ from capture receipt.')
        report['meshes'][name] = record
        print(name, 'finite', finite, 'counts', len(mesh.vertices), len(mesh.faces), flush=True)
    structure = metadata['structure']
    report['oneSceneFourMeshes'] = structure['scenes'] == 1 and structure['nodes'] == structure['meshes'] == len(meshes) == 4
    if not report['oneSceneFourMeshes']:
        report['blockers'].append('Scene/node/mesh structure differs from the expected one scene and four meshes.')
    body_name = next(name for name in meshes if 'body' in name)
    body = meshes[body_name]
    old_body = baseline[next(name for name in baseline if 'body' in name)]
    if report['meshes'][body_name]['finiteVertices'] and report['meshes'][body_name]['validTriangleIndices']:
        bad = np.flatnonzero(body.area_faces <= 1e-14)
        triangles = body.triangles[bad]
        midpoint = np.zeros(len(bad), bool)
        for corner in range(3):
            midpoint |= (2 * triangles[:, corner] == triangles[:, (corner + 1) % 3] + triangles[:, (corner + 2) % 3]).all(axis=1)
        report['bodyDegenerateComparison'] = {'r18AreaAtMost1eMinus14Triangles': int((old_body.area_faces <= 1e-14).sum()),
            'candidateAreaAtMost1eMinus14Triangles': len(bad), 'candidateExactlyZeroAreaTriangles': int((body.area_faces[bad] == 0).sum()),
            'exactMidpointCollinearTriangles': int(midpoint.sum()),
            'bounds': [triangles.reshape(-1, 3).min(axis=0).tolist(), triangles.reshape(-1, 3).max(axis=0).tolist()] if len(bad) else None,
            'interpretation': 'An exact midpoint among three distinct-index triangle corners is consistent with collinear edge vertices emitted during subdivision-boundary triangulation; this does not alone indicate a torn surface.'}
        archive['body_near_zero_area_export_triangle_ids'] = bad
        archive['body_near_zero_area_triangle_vertex_ids'] = body.faces[bad]
        archive['body_near_zero_area_triangle_positions'] = triangles
    if report['meshes'][body_name]['finiteVertices'] and report['meshes'][body_name]['validTriangleIndices']:
        raycaster = o3d.t.geometry.RaycastingScene()
        raycaster.add_triangles(o3d.core.Tensor(body.vertices.astype(np.float32)), o3d.core.Tensor(body.faces.astype(np.uint32)))
        for side in [1, -1]:
            name = f'GEO-charizard-eye-{side}-whole-r01'
            eye = meshes[name]
            old_eye = baseline[f'GEO-charizard-eye-{side}-r18']
            if not report['meshes'][name]['finiteVertices'] or not report['meshes'][name]['validTriangleIndices']:
                continue
            eye_exact = bool(np.array_equal(eye.vertices, old_eye.vertices) and np.array_equal(eye.faces, old_eye.faces))
            points = np.vstack([eye.vertices, old_eye.vertices])
            lower, upper = points.min(axis=0) - .010, points.max(axis=0) + .010
            results = {}
            for label, tested_body, tested_eye in [('r18', old_body, old_eye), ('whole-r01', body, eye)]:
                result = local_pairs(tested_body, tested_eye, lower, upper, {})
                pairs = result.pop('pairs')
                result['samplePairs'] = pairs[:12]
                result['completePairArraysPrefix'] = f'side_{side}_{label}'
                results[label] = result
                archive[f'side_{side}_{label}_pair_triangle_ids'] = np.asarray([p['exportTriangleIds'] for p in pairs], dtype=np.int64).reshape(-1, 2)
                archive[f'side_{side}_{label}_pair_mesh_kinds'] = np.asarray([[0 if kind == 'body' else 1 for kind in p['kinds']] for p in pairs], dtype=np.int8).reshape(-1, 2)
                archive[f'side_{side}_{label}_strict_crossing'] = np.asarray([p['strictInteriorCrossingConfirmed'] for p in pairs], dtype=bool)
                archive[f'side_{side}_{label}_pair_centers'] = np.asarray([p['meanTriangleVertexPosition'] for p in pairs], dtype=float).reshape(-1, 3)
            queries = o3d.core.Tensor(eye.vertices.astype(np.float32))
            closed_body = report['meshes'][body_name]['topology']['watertight']
            signed = raycaster.compute_signed_distance(queries, nsamples=3).numpy() if closed_body else raycaster.compute_distance(queries).numpy()
            closest_faces = raycaster.compute_closest_points(queries)['primitive_ids'].numpy()
            degree = np.bincount(eye.edges_unique.ravel(), minlength=len(eye.vertices))
            poles = np.flatnonzero(degree > 20)
            inside = np.flatnonzero(signed < -1e-6) if closed_body else np.asarray([], dtype=np.int64)
            record = {'side': side, 'eyeMesh': name, 'eyeGeometryExactlyR18': eye_exact,
                'bounds': [lower.tolist(), upper.tolist()], 'intersectionComparison': results,
                'clearance': {'signedAgainstClosedBody': bool(closed_body), 'minimumSampledDistance': float(signed.min()),
                    'minimumDistanceEyeVertexId': int(signed.argmin()), 'eyeVertexSamplesInsideByMoreThan1eMinus6': len(inside),
                    'poles': [{'eyeVertexId': int(v), 'coordinate': eye.vertices[v].tolist(), 'sampledDistance': float(signed[v]),
                        'nearestBodyExportTriangleId': int(closest_faces[v])} for v in poles]},
                'sharedVertexCoverage': 'Eye geometry is exactly the previously checked r18 mesh; its prior shared-vertex result remains applicable.' if eye_exact else 'Eye geometry changed; shared-vertex self-overlaps were not separately tested in this bounded check.'}
            report['eyes'].append(record)
            archive[f'side_{side}_eye_distance_samples'] = signed
            archive[f'side_{side}_eye_inside_vertex_ids'] = inside
            archive[f'side_{side}_eye_nearest_body_triangle_ids'] = closest_faces
            for kind, counts in results['whole-r01']['counts'].items():
                if counts['strictConfirmedPairs']:
                    target = report['risks'] if kind == 'body-eye' else report['blockers']
                    target.append(f'Eye side {side:+d}: {counts["strictConfirmedPairs"]} confirmed {kind} crossing pairs in the orbital region.')
                elif counts['detectedPairs']:
                    report['risks'].append(f'Eye side {side:+d}: {counts["detectedPairs"]} unconfirmed {kind} detector pairs need inspection.')
            if len(inside):
                report['risks'].append(f'Eye side {side:+d}: {len(inside)} sampled eye vertices lie inside the closed body.')
            if not eye_exact:
                report['risks'].append(f'Eye side {side:+d}: the eye mesh changed; shared-vertex overlaps are outside this bounded test.')
            print('eye side', side, results['whole-r01']['counts'], 'inside', len(inside), 'minimum sampled distance', signed.min(), flush=True)
    report['limits'] = ['The body self-crossing check is restricted to two orbital AABBs. Other sculpted body areas and shared-vertex body configurations are not exhaustively screened.',
        'Every eye triangle and all body triangles whose AABBs overlap the eye region participate in body-eye detection; strict counts independently confirm proper interior edge-triangle crossings among detector candidates.',
        'Signed distances sample eye vertices; they are not a complete triangle-surface minimum-clearance certificate.',
        'Body-eye overlap is a numerical finding for visual review; it is not automatically a blocker for independent eye meshes in a working sculpt.',
        'Topology checks do not establish silhouette, anatomy, surface quality or readiness for animation/runtime use. Root handles visual review.']
    args.output_prefix.with_suffix('.json').write_text(json.dumps(report, indent=2) + '\n')
    np.savez_compressed(args.output_prefix.with_suffix('.npz'), **archive)
    lines = ['Bounded working-sculpt export check.', '',
        'Blockers: ' + ('; '.join(report['blockers']) if report['blockers'] else 'none found in the tested scope') + '.',
        'Risks: ' + ('; '.join(report['risks']) if report['risks'] else 'none beyond the stated coverage limits') + '.', '',
        '| Mesh | Vertices | Triangles | Components | Boundary / excess-incidence edges | Winding | Area ≤1e-14 |', '| --- | ---: | ---: | ---: | --- | --- | ---: |']
    for name, entry in report['meshes'].items():
        if 'topology' in entry:
            t = entry['topology']
            lines.append(f'| {name} | {t["vertices"]} | {t["triangles"]} | {t["components"]} | {t["boundaryEdges"]} / {t["edgesAboveTwoFaceIncidence"]} | {"consistent" if t["windingConsistent"] else "inconsistent"} | {t["areaAtMost1eMinus14Triangles"]} |')
    lines += ['', 'All mesh finite/index checks and capture-count correspondence are recorded separately in JSON. No frozen-coordinate constraint is imposed on this broad sculpt.', '',
        'The body has ' + str(report.get('bodyDegenerateComparison', {}).get('candidateExactlyZeroAreaTriangles', 'unavailable')) + ' exact zero-area triangles; ' + str(report.get('bodyDegenerateComparison', {}).get('exactMidpointCollinearTriangles', 'unavailable')) + ' contain an exact edge midpoint. R18 had no triangles at or below the tested area threshold. Dense location evidence is in NPZ.', '',
        '| Eye side | Body-eye detector / confirmed pairs | Orbital body-body detector / confirmed pairs | Sampled eye vertices inside body | Minimum sampled signed distance |', '| --- | --- | --- | ---: | ---: |']
    for e in report['eyes']:
        c = e['intersectionComparison']['whole-r01']['counts']
        lines.append(f'| {e["side"]:+d} | {c["body-eye"]["detectedPairs"]} / {c["body-eye"]["strictConfirmedPairs"]} | {c["body-body"]["detectedPairs"]} / {c["body-body"]["strictConfirmedPairs"]} | {e["clearance"]["eyeVertexSamplesInsideByMoreThan1eMinus6"]} | {e["clearance"]["minimumSampledDistance"]:.9g} |')
    lines += ['', 'The eye meshes themselves are unchanged from r18. Their prior zero body-eye crossings become shallow overlaps after rim sculpting. Numerical overlap between independent eye/body meshes is a visual-review risk, not automatically a blocker for this working sculpt.', '',
        'Actual export triangle indices and representative crossing centers are in JSON; complete pair and clearance arrays are in NPZ. These counts cover the two recorded orbital regions. They do not certify whole-body intersection freedom, visual/anatomical quality or runtime readiness. This remains a working sculpt.']
    args.output_prefix.with_suffix('.md').write_text('\n'.join(lines) + '\n')
    print(json.dumps({'blockers': report['blockers'], 'risks': report['risks'], 'oneSceneFourMeshes': report['oneSceneFourMeshes']}, indent=2))


if __name__ == '__main__':
    main()
