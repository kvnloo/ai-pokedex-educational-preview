"""Inspect reported triangle crossings with independent edge/triangle solves."""
import json
from pathlib import Path

import numpy as np
import trimesh
from scipy.spatial import cKDTree


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/audit-root-surface')


def edge_hits(first, second):
    hits = []
    edge1, edge2 = second[1] - second[0], second[2] - second[0]
    for i in range(3):
        start, end = first[i], first[(i + 1) % 3]
        matrix = np.column_stack([edge1, edge2, start - end])
        if abs(np.linalg.det(matrix)) < 1e-22:
            continue
        u, v, t = np.linalg.solve(matrix, start - second[0])
        if min(u, v, 1 - u - v, t, 1 - t) >= -1e-8:
            hits.append({'edge': i, 'triangleBarycentric': [float(1 - u - v), float(u), float(v)], 'edgeParameter': float(t), 'strictInterior': bool(min(u, v, 1 - u - v, t, 1 - t) > 1e-7)})
    return hits


def point_segment_distance(point, start, end):
    direction = end - start
    parameter = np.clip((point - start) @ direction / max(direction @ direction, 1e-30), 0, 1)
    return np.linalg.norm(point - start - parameter * direction)


def surface_gap(first, second):
    candidates = []
    for left, right in [(first, second), (second, first)]:
        closest = trimesh.triangles.closest_point(np.tile(right, (3, 1, 1)), left)
        candidates.extend(np.linalg.norm(left - closest, axis=1))
    for i in range(3):
        p, p1 = first[i], first[(i + 1) % 3]
        for j in range(3):
            q, q1 = second[j], second[(j + 1) % 3]
            candidates.extend([point_segment_distance(p, q, q1), point_segment_distance(p1, q, q1), point_segment_distance(q, p, p1), point_segment_distance(q1, p, p1)])
            u, v, w = p1 - p, q1 - q, p - q
            a, b, c, d, e = u @ u, u @ v, v @ v, u @ w, v @ w
            denominator = a * c - b * b
            if denominator > 1e-30:
                s, t = (b * e - c * d) / denominator, (a * e - b * d) / denominator
                if 0 <= s <= 1 and 0 <= t <= 1:
                    candidates.append(np.linalg.norm(w + s * u - t * v))
    return float(min(candidates))


def main():
    report = json.loads((OUT / 'r02d-validation.json').read_text())
    archive = np.load(OUT.parent / 'r02d/vertex-audit.npz')
    before, after = archive['before'].astype(float), archive['after'].astype(float)
    keys = report['versions']['r02d']['localIntersections']['stableTrianglePairKeys']
    parent_keys = {tuple(tuple(face) for face in pair) for pair in report['versions']['r02a']['localIntersections']['stableTrianglePairKeys']}
    tree = cKDTree(before)
    pairs = []
    for key in keys:
        ids = np.array(key)
        old_triangles, new_triangles = before[ids], after[ids]
        first, second = edge_hits(*new_triangles), edge_hits(*new_triangles[::-1])
        hit_points = []
        for triangle, hits in [(new_triangles[0], first), (new_triangles[1], second)]:
            for hit in hits:
                edge, parameter = hit['edge'], hit['edgeParameter']
                hit_points.append(triangle[edge] + parameter * (triangle[(edge + 1) % 3] - triangle[edge]))
        hit_points = np.array(hit_points)
        edge_ids = np.concatenate([ids[:, [0, 1]], ids[:, [1, 2]], ids[:, [2, 0]]])
        lengths = np.linalg.norm(before[edge_ids[:, 1]] - before[edge_ids[:, 0]], axis=1)
        a, b = map(int, edge_ids[lengths.argmin()])
        displacement_a, displacement_b = after[a] - before[a], after[b] - before[b]
        na, nb = set(tree.query_ball_point(before[a], .05)), set(tree.query_ball_point(before[b], .05))
        pairs.append({
            'stableTrianglePair': key, 'newComparedWithParent': tuple(tuple(face) for face in key) not in parent_keys,
            'beforeBounds': [old_triangles.reshape(-1, 3).min(axis=0).tolist(), old_triangles.reshape(-1, 3).max(axis=0).tolist()],
            'afterBounds': [new_triangles.reshape(-1, 3).min(axis=0).tolist(), new_triangles.reshape(-1, 3).max(axis=0).tolist()],
            'firstTriangleEdgesIntoSecond': first, 'secondTriangleEdgesIntoFirst': second,
            'strictInteriorEdgeHits': sum(hit['strictInterior'] for hit in first + second),
            'intersectionSegmentCenter': hit_points.mean(axis=0).tolist() if len(hit_points) else None,
            'intersectionSegmentLength': float(np.linalg.norm(hit_points[:, None] - hit_points[None, :], axis=2).max()) if len(hit_points) else None,
            'minimumSurfaceGapBefore': surface_gap(*old_triangles),
            'minimumSurfaceGapAfter': 0.0 if first or second else surface_gap(*new_triangles),
            'minimumCrossTriangleVertexGapBefore': float(np.linalg.norm(old_triangles[0][:, None] - old_triangles[1][None, :], axis=2).min()),
            'shortestOriginalEdge': {'stableVertexIds': [a, b], 'length': float(lengths.min()), 'relativeDisplacementMagnitude': float(np.linalg.norm(displacement_b - displacement_a)), 'radius005NeighborhoodCounts': [len(na), len(nb)], 'radius005NeighborhoodSymmetricDifference': len(na ^ nb)},
        })
    result = {'method': 'Double-precision edge/triangle linear solves on reported actual r02d triangles. Strict hits have triangle barycentric coordinates and edge parameter farther than 1e-7 from each endpoint/boundary. This is an independent local confirmation, not a full mesh intersection detector.', 'pairCount': len(pairs), 'pairsWithStrictInteriorEdgeHits': sum(pair['strictInteriorEdgeHits'] > 0 for pair in pairs), 'newPairsWithStrictInteriorEdgeHits': sum(pair['strictInteriorEdgeHits'] > 0 and pair['newComparedWithParent'] for pair in pairs), 'pairs': pairs}
    (OUT / 'r02d-intersection-details.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
