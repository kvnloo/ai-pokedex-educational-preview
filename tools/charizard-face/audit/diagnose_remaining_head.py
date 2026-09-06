"""Read-only r06 near-contact/sliver and posterior divot measurements."""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/audit')
R03 = OUT.parents[1] / 'anatomy-r03'
SOURCE = R03 / 'head-r06/charizard-head-r06.glb'
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'charizard-anatomy/root_audit'))
from inspect_intersection_pairs import edge_hits, point_segment_distance, surface_gap


def load_body(path):
    scene = trimesh.load(path, force='scene', process=False)
    node = next(name for name in scene.graph.nodes_geometry if 'body' in name)
    transform, geometry = scene.graph[node]
    mesh = scene.geometry[geometry].copy()
    mesh.apply_transform(transform)
    mesh.vertices = mesh.vertices[:, [0, 2, 1]] * [1, -1, 1]
    return mesh


def patch_record(mesh, face_ids):
    faces = mesh.faces[face_ids]
    rows = np.sort(np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]]), axis=1)
    edges, incidence = np.unique(rows, axis=0, return_counts=True)
    boundary = edges[incidence == 1]
    vertices, boundary_vertices = np.unique(faces), np.unique(boundary)
    adjacency = {int(i): [] for i in boundary_vertices}
    for a, b in boundary:
        adjacency[int(a)].append(int(b))
        adjacency[int(b)].append(int(a))
    cycle = [int(boundary_vertices.min())]
    previous = -1
    while True:
        candidates = sorted(i for i in adjacency[cycle[-1]] if i != previous)
        next_id = candidates[0]
        if next_id == cycle[0]:
            break
        previous = cycle[-1]
        cycle.append(next_id)
        assert len(cycle) <= len(boundary_vertices)
    return {'faceCount': len(face_ids), 'r06ExportFaceIds': face_ids.tolist(), 'vertexCount': len(vertices),
            'eulerCharacteristic': len(vertices) - len(edges) + len(faces),
            'boundaryEdges': len(boundary), 'boundaryOneSimpleCycle': len(cycle) == len(boundary_vertices) and all(len(values) == 2 for values in adjacency.values()),
            'fixedBoundaryR06VertexCycle': cycle, 'interiorR06VertexIds': np.setdiff1d(vertices, boundary_vertices).tolist(),
            'bounds': [mesh.vertices[vertices].min(axis=0).tolist(), mesh.vertices[vertices].max(axis=0).tolist()]}


def main():
    mesh = load_body(SOURCE)
    vertices, faces, edges = mesh.vertices, mesh.faces, mesh.edges_unique
    r06 = np.load(R03 / 'head-r06/horn-audit.npz')
    r05 = np.load(R03 / 'head-r05/refinement-audit.npz')
    frozen = load_body(OUT.parents[1] / 'anatomy-r02/r02e/charizard-tail-r02e.glb')
    assert np.array_equal(vertices, r06['after']), 'r06 exported rows must match audit row order'
    pair_ids = np.array([123767, 125397])
    pair_faces, pair_triangles = faces[pair_ids], vertices[faces[pair_ids]]
    pair_vertices = np.unique(pair_faces)
    triangles = vertices[faces]
    cross = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
    area = np.linalg.norm(cross, axis=1) / 2
    face_reports = []
    for face_id in [123767, 125397, 125398]:
        tri = vertices[faces[face_id]]
        lengths = np.linalg.norm(np.roll(tri, -1, axis=0) - tri, axis=1)
        altitude = 2 * area[face_id] / lengths.max()
        face_reports.append({'r06ExportFaceId': face_id, 'r06VertexIds': faces[face_id].tolist(),
                             'coordinates': tri.tolist(), 'area': float(area[face_id]),
                             'edgeLengths': lengths.tolist(), 'minimumAltitude': float(altitude),
                             'longestEdgeDividedByMinimumAltitude': float(lengths.max() / altitude)})
    first, second = pair_triangles
    cluster = np.array([62088, 62094, 62898])
    patch_ids = np.flatnonzero(np.isin(faces, cluster).any(axis=1))
    patch = patch_record(mesh, patch_ids)
    collapses = []
    for a, b in [(62088, 62898), (62088, 62094), (62898, 62094)]:
        neighbors = [set(edges[np.any(edges == i, axis=1)].ravel()) - {i} for i in [a, b]]
        incident = np.flatnonzero(np.isin(faces, [a, b]).sum(axis=1) == 2)
        opposite = np.setdiff1d(faces[incident].ravel(), [a, b])
        common = sorted(map(int, neighbors[0] & neighbors[1]))
        collapses.append({'r06EdgeVertexIds': [a, b], 'length': float(np.linalg.norm(vertices[a] - vertices[b])),
                          'incidentFaceIds': incident.tolist(), 'commonNeighborIds': common,
                          'oppositeTriangleVertexIds': opposite.tolist(),
                          'singleEdgeTriangleLinkConditionPasses': len(incident) == 2 and common == opposite.tolist()})
    report = {'source': str(SOURCE), 'sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              'coordinateConvention': 'Apply glTF scene transform, then (x,-z,y) to Blender world. All IDs below are actual r06 exported rows, checked against horn-audit.npz.',
              'reportedPair': {'r06ExportFaceIds': pair_ids.tolist(), 'r06TriangleVertexIds': pair_faces.tolist(),
                               'firstEdgesIntoSecond': edge_hits(first, second), 'secondEdgesIntoFirst': edge_hits(second, first),
                               'minimumSurfaceClearance': surface_gap(first, second),
                               'separatingPlaneX': float(first[:, 0].max()),
                               'firstMaximumXEqualsSecondMinimumX': bool(first[:, 0].max() == second[:, 0].min()),
                               'firstTouchesPlaneOnlyAtVertex': 62088,
                               'secondTouchesPlaneOnlyAtEdge': [62094, 62093],
                               'vertexToEdgeGapWithinSharedPlane': float(point_segment_distance(vertices[62088], vertices[62094], vertices[62093])),
                               'classification': 'Disjoint near-contact involving a severe sliver; Open3D reports a numerical false positive. No proper crossing is present in the stored float coordinates.'},
              'faceMetrics': face_reports, 'cleanupPatch': patch, 'clusterEdgeCollapseChecks': collapses,
              'ancestry': {'r06VertexIds': pair_vertices.tolist(), 'r05ParentIds': r06['parent_vertex_ids'][pair_vertices].tolist(),
                           'tailR02eVertexIds': r06['tail_vertex_ids'][pair_vertices].tolist(),
                           'coordinatesExactlyMatchFrozenTailR02e': bool(np.array_equal(vertices[pair_vertices], frozen.vertices[r06['tail_vertex_ids'][pair_vertices]])),
                           'coordinatesExactlyMatchR05': bool(np.array_equal(vertices[pair_vertices], r05['after'][r06['parent_vertex_ids'][pair_vertices]]))}}
    sums, degrees, normals = np.zeros_like(vertices), np.zeros(len(vertices)), np.zeros_like(vertices)
    np.add.at(sums, edges[:, 0], vertices[edges[:, 1]])
    np.add.at(sums, edges[:, 1], vertices[edges[:, 0]])
    np.add.at(degrees, edges.ravel(), 1)
    for corner in range(3):
        np.add.at(normals, faces[:, corner], cross)
    normals /= np.linalg.norm(normals, axis=1)[:, None]
    local_offset = np.einsum('ij,ij->i', vertices - sums / degrees[:, None], normals)
    seed = np.array([-.025, -.59, .4])
    candidates = np.flatnonzero(np.linalg.norm(vertices - seed, axis=1) < .04)
    ranked = candidates[np.argsort(local_offset[candidates])[:12]]
    edge_lengths = np.linalg.norm(vertices[edges[:, 0]] - vertices[edges[:, 1]], axis=1)
    graph = coo_matrix((np.r_[edge_lengths, edge_lengths], (np.r_[edges[:, 0], edges[:, 1]], np.r_[edges[:, 1], edges[:, 0]])), shape=(len(vertices), len(vertices))).tocsr()
    nearest = int(np.linalg.norm(vertices - seed, axis=1).argmin())
    divot = {'rootProvidedApproximateSeed': seed.tolist(), 'nearestR06Vertex': nearest,
             'nearestCoordinate': vertices[nearest].tolist(),
             'mostConcaveOneRingSamplesWithinRadius004': [
                 {'r06VertexId': int(i), 'coordinate': vertices[i].tolist(), 'signedOneRingOffset': float(local_offset[i]),
                  'valence': int(degrees[i]), 'r05ParentId': int(r06['parent_vertex_ids'][i]), 'tailR02eVertexId': int(r06['tail_vertex_ids'][i])} for i in ranked],
             'geodesicNeighborhoods': []}
    archive = {'sliver_patch_r06_face_ids': patch_ids, 'sliver_fixed_boundary_r06_vertex_cycle': np.array(patch['fixedBoundaryR06VertexCycle']), 'sliver_interior_r06_vertex_ids': cluster}
    for center_id in dict.fromkeys([nearest, int(ranked[0])]):
        distance = dijkstra(graph, directed=False, indices=center_id, limit=.055)
        row = {'centerR06VertexId': center_id, 'centerCoordinate': vertices[center_id].tolist(), 'outwardAreaWeightedNormal': normals[center_id].tolist(), 'radii': []}
        for radius in [.015, .025, .035, .045, .055]:
            ids = np.flatnonzero(distance <= radius)
            annulus = np.flatnonzero((distance > .6 * radius) & (distance <= radius))
            points = vertices[annulus]
            center = points.mean(axis=0)
            _, axes = np.linalg.eigh(np.cov(points - center, rowvar=False))
            normal = axes[:, 0]
            normal *= 1 if normal @ normals[center_id] >= 0 else -1
            row['radii'].append({'geodesicRadius': radius, 'vertices': len(ids), 'annulusVertices': len(annulus),
                                 'centerSignedDistanceFromAnnulusPcaPlane': float((vertices[center_id] - center) @ normal),
                                 'bounds': [vertices[ids].min(axis=0).tolist(), vertices[ids].max(axis=0).tolist()],
                                 'sourceTailVertices': int((r06['tail_vertex_ids'][ids] >= 0).sum()),
                                 'newR06HornVertices': int((r06['parent_vertex_ids'][ids] < 0).sum()),
                                 'protectedVertices': int(r06['protected'][ids].sum())})
            archive[f'divot_center_{center_id}_radius_{radius:.3f}_r06_vertex_ids'] = ids
        divot['geodesicNeighborhoods'].append(row)
    divot['measurementLimits'] = 'The supplied seed locates a visual feature approximately. Negative one-ring offset and annulus-plane offset measure local concavity; they are not anatomical ground truth or new target coordinates. Geodesic regions remain on the connected surface and preserve separation from horn tips.'
    camera_path = OUT.parent / 'divot-baseline/cameras.json'
    camera = json.loads(camera_path.read_text())
    top_samples = []
    for label, xy in [('crease_crown_pixel_527_509', np.array(camera['target'][:2]) + [77 * .32 / 900, -59 * .32 / 900]),
                      ('lower_cap_pole', vertices[81005, :2]), ('upper_cap_pole', vertices[81006, :2])]:
        p0, e1, e2 = triangles[:, 0], triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0]
        determinant = e1[:, 0] * e2[:, 1] - e1[:, 1] * e2[:, 0]
        valid = abs(determinant) > 1e-15
        q = xy - p0[:, :2]
        u, v = np.full(len(faces), -1.), np.full(len(faces), -1.)
        u[valid] = (q[valid, 0] * e2[valid, 1] - q[valid, 1] * e2[valid, 0]) / determinant[valid]
        v[valid] = (e1[valid, 0] * q[valid, 1] - e1[valid, 1] * q[valid, 0]) / determinant[valid]
        hit_ids = np.flatnonzero(valid & (u >= -1e-9) & (v >= -1e-9) & (u + v <= 1 + 1e-9))
        z = p0[hit_ids, 2] + u[hit_ids] * e1[hit_ids, 2] + v[hit_ids] * e2[hit_ids, 2]
        hit_ids, z = hit_ids[z > .30], z[z > .30]
        order = np.argsort(-z)
        hits = []
        for index in order:
            if hits and abs(z[index] - hits[-1]['z']) < 1e-7:
                continue
            face_id = int(hit_ids[index])
            hits.append({'z': float(z[index]), 'r06ExportFaceId': face_id,
                         'faceNormalZ': float(cross[face_id, 2] / np.linalg.norm(cross[face_id]))})
        top_samples.append({'label': label, 'existingSurfaceXY': xy.tolist(), 'headIntersectionsTopToBottom': hits})
    divot['actualTopCameraRaySamples'] = top_samples
    divot['capPoles'] = [{'r06AuditVertexId': i, 'coordinate': vertices[i].tolist(), 'valence': int(degrees[i]),
                          'outwardNormal': normals[i].tolist()} for i in [81005, 81006]]
    divot['crownNeighborhoods'] = []
    for center_id in [81005, 122385]:
        distance = dijkstra(graph, directed=False, indices=center_id, limit=.09)
        row = {'centerR06VertexId': center_id, 'coordinate': vertices[center_id].tolist(), 'radii': []}
        for radius in [.025, .035, .05, .065, .08]:
            ids = np.flatnonzero(distance <= radius)
            row['radii'].append({'radius': radius, 'vertices': len(ids),
                                 'bounds': [vertices[ids].min(axis=0).tolist(), vertices[ids].max(axis=0).tolist()],
                                 'protectedVertices': int(r06['protected'][ids].sum()),
                                 'newHornVertices': int((r06['parent_vertex_ids'][ids] < 0).sum())})
            archive[f'divot_crown_center_{center_id}_radius_{radius:.3f}_r06_vertex_ids'] = ids
        divot['crownNeighborhoods'].append(row)
    report['posteriorDivot'] = divot
    patch_receipts, patch_archive = {}, {}
    horn_receipt = json.loads((R03 / 'head-r06/horn-receipt.json').read_text())
    horn_roots = np.concatenate([h['ringVertexIndices'][0] for h in horn_receipt['horns']])
    for radius in [.05, .065]:
        label = f'{radius:.3f}'
        ids = archive[f'divot_crown_center_81005_radius_{label}_r06_vertex_ids']
        selected = np.zeros(len(vertices), bool)
        selected[ids] = True
        selected_faces = np.flatnonzero(selected[faces].all(axis=1))
        patch_data = patch_record(mesh, selected_faces)
        patch_data['rootRingVertexOverlap'] = np.intersect1d(ids, horn_roots).tolist()
        patch_receipts[label] = patch_data
        patch_archive[f'radius_{label}_r06_face_ids'] = selected_faces
        patch_archive[f'radius_{label}_r06_boundary_vertex_ids'] = np.array(patch_data['fixedBoundaryR06VertexCycle'])
        patch_archive[f'radius_{label}_r06_interior_vertex_ids'] = np.array(patch_data['interiorR06VertexIds'])
    (OUT / 'divot-patch-neighborhoods.json').write_text(json.dumps(patch_receipts, indent=2) + '\n')
    np.savez_compressed(OUT / 'divot-patch-neighborhoods.npz', **patch_archive)
    report['recommendation'] = 'For the inherited sliver, use a strictly local edge collapse/weld of the three interior cluster vertices while fixing all nine patch-boundary coordinates. Each single-edge link condition passes; validate the resulting topology and exact exterior coordinates after the complete operation. Do not smooth a broad head region to remove this near-contact. Divot operator/radius should follow the measured connected surface region and visual review, separately from this sliver.'
    report['limits'] = ['No mesh or coordinate targets are generated.', 'The previous whole-model numerical passes remain limited to their stated tests; this diagnoses only the reported pair and supplied divot vicinity.', 'The one-ring statistic depends on triangulation; the annulus-plane statistic also includes local anatomical curvature.']
    (OUT / 'head-r06-remaining-diagnosis.json').write_text(json.dumps(report, indent=2) + '\n')
    np.savez_compressed(OUT / 'head-r06-remaining-indices.npz', **archive)
    print(json.dumps({'reportedPair': report['reportedPair'], 'cleanupPatch': patch, 'faceMetrics': face_reports, 'posteriorDivot': divot}, indent=2))


if __name__ == '__main__':
    main()
