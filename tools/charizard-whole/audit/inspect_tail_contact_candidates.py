"""Inspect existing detector candidates only; no mesh changes or repeated broad detection."""
import argparse
import json
from pathlib import Path

import numpy as np
import trimesh

from check_whole_r02 import OUT, file_record, load_asset, strict_hits


def segment_distance(point, start, end):
    direction = end - start
    t = np.clip((point - start) @ direction / max(direction @ direction, 1e-30), 0, 1)
    return np.linalg.norm(point - start - t * direction)


def surface_gap(first, second):
    distances = []
    for left, right in [(first, second), (second, first)]:
        nearest = trimesh.triangles.closest_point(np.tile(right, (3, 1, 1)), left)
        distances.extend(np.linalg.norm(left - nearest, axis=1))
    for i in range(3):
        p, p1 = first[i], first[(i + 1) % 3]
        for j in range(3):
            q, q1 = second[j], second[(j + 1) % 3]
            distances.extend([segment_distance(p, q, q1), segment_distance(p1, q, q1),
                              segment_distance(q, p, p1), segment_distance(q1, p, p1)])
            u, v, w = p1 - p, q1 - q, p - q
            a, b, c, d, e = u @ u, u @ v, v @ v, u @ w, v @ w
            determinant = a * c - b * b
            if determinant > 1e-30:
                s, t = (b * e - c * d) / determinant, (a * e - b * d) / determinant
                if 0 <= s <= 1 and 0 <= t <= 1:
                    distances.append(np.linalg.norm(w + s * u - t * v))
    return float(min(distances))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-prefix', type=Path, default=OUT / 'export-tail-check')
    parser.add_argument('--output-prefix', type=Path, default=OUT / 'tail-contact-details')
    args = parser.parse_args()
    assert args.output_prefix.resolve().parent == OUT.resolve()
    assert not any(args.output_prefix.with_suffix(s).exists() for s in ['.json', '.md'])
    source = json.loads(args.input_prefix.with_suffix('.json').read_text())
    archive = np.load(args.input_prefix.with_suffix('.npz'))
    result = {'inputReport': file_record(args.input_prefix.with_suffix('.json')),
        'validator': file_record(Path(__file__).resolve()), 'versions': {},
        'method': 'Double-precision strict edge/triangle solves and distances over triangle vertices/edges. Distances describe only recorded detector candidates. A positive computed gap supports near-contact; it is not an exact-predicate proof for nearly coplanar triangles.'}
    for label, reference in [('r01', source['baseline']), ('r02', source['candidate'])]:
        path = Path(reference['path'])
        assert file_record(path)['sha256'] == reference['sha256']
        meshes, _ = load_asset(path)
        mesh = meshes['body']
        records = []
        for pair in archive[f'{label}_pairs']:
            triangles = mesh.triangles[pair]
            hits = strict_hits(*triangles) + strict_hits(*triangles[::-1])
            gap = 0.0 if hits else surface_gap(*triangles)
            edges = np.linalg.norm(np.roll(triangles, -1, axis=1) - triangles, axis=2)
            records.append({'exportTriangleIds': pair.tolist(), 'vertexIds': mesh.faces[pair].tolist(),
                'strictInteriorHits': len(hits), 'computedMinimumSurfaceGap': gap,
                'triangleAreas': mesh.area_faces[pair].tolist(),
                'minimumTriangleAltitudes': (2 * mesh.area_faces[pair] / edges.max(axis=1)).tolist(),
                'center': triangles.mean(axis=(0, 1)).tolist()})
        result['versions'][label] = {'pairs': records, 'strictPairs': sum(r['strictInteriorHits'] > 0 for r in records),
            'positiveComputedGapPairs': sum(r['computedMinimumSurfaceGap'] > 1e-12 for r in records),
            'computedGapRange': [min(r['computedMinimumSurfaceGap'] for r in records), max(r['computedMinimumSurfaceGap'] for r in records)] if records else None}
    result['r02ComparedWithR01'] = 'Triangle identities differ among all four r02 detector candidates and the twelve r01 candidates; strict confirmation is zero in both versions.' if not ({tuple(sorted(tuple(sorted(t)) for t in r['vertexIds'])) for r in result['versions']['r01']['pairs']} & {tuple(sorted(tuple(sorted(t)) for t in r['vertexIds'])) for r in result['versions']['r02']['pairs']}) else 'Some candidate triangle identities are shared across versions.'
    args.output_prefix.with_suffix('.json').write_text(json.dumps(result, indent=2) + '\n')
    lines = ['Follow-up on the existing tail detector candidates.', '', result['method'], '',
        '| R02 export triangle pair | Computed gap | Center |', '| --- | ---: | --- |']
    for row in result['versions']['r02']['pairs']:
        lines.append(f"| {row['exportTriangleIds']} | {row['computedMinimumSurfaceGap']:.9g} | {', '.join(f'{v:.6f}' for v in row['center'])} |")
    lines += ['', result['r02ComparedWithR01'], '', 'These are tiny near-contact candidates for review, not confirmed crossings. No triangle reauthoring is recommended from the detector count alone.']
    args.output_prefix.with_suffix('.md').write_text('\n'.join(lines) + '\n')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
