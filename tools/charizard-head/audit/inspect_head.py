"""Read-only connectivity and section audit of the frozen r02e head region."""
import hashlib
import heapq
import json
import struct
from pathlib import Path

import numpy as np
import trimesh
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03/audit')
SOURCE = OUT.parents[1] / 'anatomy-r02/r02e/charizard-tail-r02e.glb'


def bounds(points):
    return [points.min(axis=0).tolist(), points.max(axis=0).tolist()] if len(points) else None


def groups(vertices, edges, mask):
    selected_edges = edges[mask[edges].all(axis=1)]
    _, labels = connected_components(coo_matrix((np.ones(len(selected_edges)), (selected_edges[:, 0], selected_edges[:, 1])), shape=(len(vertices), len(vertices))), directed=False)
    return sorted([np.flatnonzero(mask & (labels == label)) for label in np.unique(labels[mask])], key=len, reverse=True)


def path_record(line):
    return {'points': len(line), 'closed': bool(np.linalg.norm(line[0] - line[-1]) < 1e-7), 'bounds': bounds(line), 'perimeterOrLength': float(np.linalg.norm(np.diff(line, axis=0), axis=1).sum())}


def connections_to_neck(vertices, edges, head, index_archive):
    """Existing-edge widest paths: exact superlevel connectivity, no new geometry."""
    neck_anchor = 79121
    tips = [69672, 88456, 73224, 81677, 76660]
    adjacency = [[] for _ in range(len(vertices))]
    for left, right in edges[head[edges].all(axis=1)]:
        adjacency[left].append(right)
        adjacency[right].append(left)
    capacity = np.full(len(vertices), -np.inf)
    predecessor = np.full(len(vertices), -1, dtype=np.int64)
    capacity[neck_anchor] = vertices[neck_anchor, 1]
    queue = [(-capacity[neck_anchor], neck_anchor)]
    while queue:
        negative_capacity, vertex = heapq.heappop(queue)
        current = -negative_capacity
        if current < capacity[vertex]:
            continue
        for neighbor in adjacency[vertex]:
            candidate = min(current, vertices[neighbor, 1])
            if candidate > capacity[neighbor]:
                capacity[neighbor] = candidate
                predecessor[neighbor] = vertex
                heapq.heappush(queue, (-candidate, neighbor))
    records = []
    for tip in tips:
        path = [tip]
        while path[-1] != neck_anchor:
            assert predecessor[path[-1]] >= 0
            path.append(int(predecessor[path[-1]]))
        path = np.array(path, dtype=np.int64)
        saddle = path[vertices[path, 1] == capacity[tip]]
        index_archive[f'tip_{tip}_existing_edge_path_to_neck_vertex_ids'] = path
        records.append({'tipOriginalVertexId': tip, 'neckAnchorOriginalVertexId': neck_anchor,
                        'maximumConnectedSuperlevelThresholdY': float(capacity[tip]),
                        'saddleOriginalVertexIdsOnWitnessPath': saddle.tolist(),
                        'saddleCoordinatesOnWitnessPath': vertices[saddle].tolist(),
                        'existingEdgeWitnessPathLength': len(path) - 1})
    return {'method': 'Maximum bottleneck Y along existing head mesh edges to neck vertex 79121. For vertices with Y>cut, each tip is disconnected from this neck anchor at cut equal to the reported threshold, and connected just below it. This is a discrete graph connection saddle, not an anatomical attachment contour or a surface edit.',
            'neckAnchorCoordinate': vertices[neck_anchor].tolist(), 'branches': records}


def branch_merge_events(vertices, edges, head):
    tracked = {69672, 88456, 73224, 81677, 76660, 79121}
    adjacency = [[] for _ in range(len(vertices))]
    for left, right in edges[head[edges].all(axis=1)]:
        adjacency[left].append(int(right))
        adjacency[right].append(int(left))
    parent = np.arange(len(vertices))
    active = np.zeros(len(vertices), bool)
    labels = {vertex: {vertex} for vertex in tracked}
    events = []

    def root(vertex):
        while parent[vertex] != vertex:
            parent[vertex] = parent[parent[vertex]]
            vertex = int(parent[vertex])
        return vertex

    head_ids = np.flatnonzero(head)
    for vertex in head_ids[np.argsort(-vertices[head_ids, 1], kind='stable')]:
        vertex = int(vertex)
        active[vertex] = True
        for neighbor in adjacency[vertex]:
            if not active[neighbor]:
                continue
            left, right = root(vertex), root(neighbor)
            if left == right:
                continue
            left_labels, right_labels = labels.pop(left, set()), labels.pop(right, set())
            if left_labels and right_labels:
                events.append({'thresholdY': float(vertices[vertex, 1]),
                               'joiningTipGroups': [sorted(left_labels), sorted(right_labels)],
                               'saddleOriginalVertexId': vertex,
                               'saddleCoordinate': vertices[vertex].tolist(),
                               'existingJoiningEdgeOriginalVertexIds': [vertex, neighbor]})
            parent[right] = left
            labels[left] = left_labels | right_labels
    return events


def main():
    source_bytes = SOURCE.read_bytes()
    length, _ = struct.unpack_from('<II', source_bytes, 12)
    gltf = json.loads(source_bytes[20:20 + length])
    scene = trimesh.load(SOURCE, force='scene', process=False)
    node = next(name for name in scene.graph.nodes_geometry if 'body-tail' in name)
    transform, geometry_name = scene.graph[node]
    mesh = scene.geometry[geometry_name].copy()
    mesh.apply_transform(transform)
    mesh.vertices = mesh.vertices[:, [0, 2, 1]] * [1, -1, 1]
    vertices, faces, edges = mesh.vertices, mesh.faces, mesh.edges_unique
    assert len(vertices) == 122336
    body_node = next(n for n in gltf['nodes'] if n.get('name') == node)
    assert len(gltf['meshes'][body_node['mesh']]['primitives']) == 1
    high = vertices[:, 2] > .30
    components = groups(vertices, edges, high)
    seed = np.array([-.06, -.72, .45])
    head_ids = min(components, key=lambda ids: np.linalg.norm(vertices[ids] - seed, axis=1).min())
    head = np.zeros(len(vertices), bool)
    head[head_ids] = True
    face_whole = head[faces].all(axis=1)
    face_touch = head[faces].any(axis=1)
    head_mesh = trimesh.Trimesh(vertices, faces[face_touch], process=False)
    index_archive = {'head_vertex_ids': head_ids, 'head_wholly_inside_face_ids': np.flatnonzero(face_whole), 'head_touching_face_ids': np.flatnonzero(face_touch)}
    component_records = []
    for number, ids in enumerate(components):
        component_records.append({'component': number, 'vertices': len(ids), 'bounds': bounds(vertices[ids]), 'vertexIdMin': int(ids.min()), 'vertexIdMax': int(ids.max()), 'seedDistance': float(np.linalg.norm(vertices[ids] - seed, axis=1).min()), 'selectedAsHead': bool(np.array_equal(ids, head_ids))})
        index_archive[f'high_component_{number}_vertex_ids'] = ids
    crossing_edges = edges[head[edges].any(axis=1) & ~head[edges].all(axis=1)]
    index_archive['head_neck_crossing_edges_original_vertex_ids'] = crossing_edges
    crossing_faces = np.flatnonzero(face_touch & ~face_whole)
    index_archive['head_neck_crossing_face_ids'] = crossing_faces
    neck = head_mesh.section(plane_origin=[0, 0, .30], plane_normal=[0, 0, 1])
    neck_records = []
    for index, line in enumerate(neck.discrete):
        neck_records.append(path_record(line))
        index_archive[f'neck_plane_path_{index}_existing_surface_points'] = line
    high_faces = faces[face_whole]
    directed_high_edges = np.concatenate([high_faces[:, [0, 1]], high_faces[:, [1, 2]], high_faces[:, [2, 0]]])
    high_edges = np.sort(directed_high_edges, axis=1)
    unique_edges, inverse_edges, incidence = np.unique(high_edges, axis=0, return_counts=True, return_inverse=True)
    orientation_balance = np.bincount(inverse_edges, weights=np.where(directed_high_edges[:, 0] < directed_high_edges[:, 1], 1, -1))
    discrete_boundary = unique_edges[incidence == 1]
    boundary_mask = np.zeros(len(vertices), bool)
    boundary_mask[np.unique(discrete_boundary)] = True
    boundary_components = groups(vertices, discrete_boundary, boundary_mask)
    boundary_degrees = np.bincount(discrete_boundary.ravel(), minlength=len(vertices))[boundary_mask]
    index_archive['head_induced_boundary_edges_original_vertex_ids'] = discrete_boundary
    report = {
        'source': str(SOURCE), 'sha256': hashlib.sha256(source_bytes).hexdigest(), 'bodyNode': node,
        'indexConvention': 'Original frozen r02e exported body POSITION rows and triangle index rows; no mesh processing, welding or reindexing before inspection. One body glTF primitive verified.',
        'coordinateConvention': 'Apply glTF scene transform, then convert (x,-z,y) to Blender world.',
        'headSelection': 'Connected component of vertices with Z>.30 nearest (-.06,-.72,.45). Other high-Z components excluded by connectivity. This is a geometric selection, not anatomical segmentation.',
        'highZComponents': component_records,
        'head': {'vertices': len(head_ids), 'verticesInInducedFaces': len(np.unique(high_faces)), 'bounds': bounds(vertices[head_ids]), 'facesWhollyAboveCut': int(face_whole.sum()), 'facesTouchingSelectedVertices': int(face_touch.sum()), 'eulerOfInducedTriangleMesh': int(len(np.unique(high_faces)) - len(unique_edges) + len(high_faces)), 'boundaryEdgesOfInducedTriangleMesh': len(discrete_boundary), 'boundaryConnectedComponents': len(boundary_components), 'boundaryVerticesWithDegreeOtherThanTwo': int((boundary_degrees != 2).sum()), 'edgesAboveTwoFaceIncidence': int((incidence > 2).sum()), 'interiorEdgesWithInconsistentFaceWinding': int(((incidence == 2) & (orientation_balance != 0)).sum())},
        'neckCut': {'planeZ': .30, 'originalCrossingEdges': len(crossing_edges), 'originalCrossingFaces': len(crossing_faces), 'crossingVertexBounds': bounds(vertices[np.unique(crossing_edges)]), 'exactPlanePaths': neck_records, 'discreteBoundaryVertexBounds': bounds(vertices[np.unique(discrete_boundary)])},
        'posteriorSweeps': [], 'posteriorSections': [],
    }
    for cut in np.round(np.arange(-.85, -.349, .01), 3):
        posterior = head & (vertices[:, 1] > cut)
        branches = groups(vertices, edges, posterior) if posterior.any() else []
        branch_records = []
        for index, ids in enumerate(branches):
            branch = np.zeros(len(vertices), bool)
            branch[ids] = True
            attach_edges = edges[branch[edges].any(axis=1) & ~branch[edges].all(axis=1)]
            attach_y_edges = attach_edges[(vertices[attach_edges, 1] > cut).any(axis=1) & (vertices[attach_edges, 1] <= cut).any(axis=1)]
            endpoint = int(ids[np.argmax(vertices[ids, 1])])
            branch_records.append({'branch': index, 'vertices': len(ids), 'bounds': bounds(vertices[ids]), 'tipMaxYVertexId': endpoint, 'tipMaxYCoordinate': vertices[endpoint].tolist(), 'attachmentCrossingEdges': len(attach_y_edges), 'attachmentOriginalVertexBounds': bounds(vertices[np.unique(attach_y_edges)])})
            name = f'y_{cut:.3f}_branch_{index}'.replace('-', 'minus').replace('.', 'p')
            index_archive[name + '_vertex_ids'] = ids
            index_archive[name + '_attachment_edge_vertex_ids'] = attach_y_edges
        report['posteriorSweeps'].append({'cutY': float(cut), 'componentCount': len(branches), 'branches': branch_records})
        if cut >= -.7:
            section = head_mesh.section(plane_origin=[0, cut, 0], plane_normal=[0, 1, 0])
            paths = section.discrete if section is not None else []
            record = {'y': float(cut), 'paths': [path_record(line) for line in paths]}
            report['posteriorSections'].append(record)
            for index, line in enumerate(paths):
                index_archive[f'section_y_{cut:.3f}_path_{index}'.replace('-', 'minus').replace('.', 'p')] = line
    report['connectionsToNeck'] = connections_to_neck(vertices, edges, head, index_archive)
    report['trackedBranchMergeEventsDescendingY'] = branch_merge_events(vertices, edges, head)
    report['limits'] = ['The head is still part of the full connected body; the Z>.30 boundary is an inspection cut, not an exported edit.', 'Posterior branch counts depend on the Y threshold. A separate numerical branch does not establish horn/ear identity or the intended design.', 'Plane path records are the closed paths exposed by trimesh.section.discrete. Open neck-truncated paths are not included: at Y=-.58 there are five closed section loops and six posterior graph components because the lower component continues into the neck cut.', 'No geometry, edited mesh, or vertex target proposal is produced.', 'No full-model self-intersection or artistic evaluation is performed.']
    (OUT / 'head-inspection.json').write_text(json.dumps(report, indent=2) + '\n')
    np.savez_compressed(OUT / 'head-indices-and-sections.npz', **index_archive)
    print(json.dumps({key: report[key] for key in ['head', 'neckCut', 'highZComponents']}, indent=2))
    print('POSTERIOR BRANCH TRANSITIONS')
    previous = None
    for row in report['posteriorSweeps']:
        signature = tuple(branch['tipMaxYVertexId'] for branch in row['branches'])
        if signature != previous:
            print(json.dumps(row))
            previous = signature
    print('REQUESTED POSTERIOR SECTIONS')
    for row in report['posteriorSections']:
        if row['y'] >= -.60:
            print(json.dumps(row))


if __name__ == '__main__':
    main()
