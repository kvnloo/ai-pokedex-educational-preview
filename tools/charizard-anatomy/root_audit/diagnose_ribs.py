"""Measure surface ribbing without producing edited geometry or vertex targets."""
import hashlib
import json
from pathlib import Path

import numpy as np
import trimesh
from scipy.spatial import cKDTree


OUT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/audit-root-surface')
ROOT = OUT.parent
RAW = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/assets/experiments/charizard-official-raw/charizard-official-raw-61062-o256.glb')


def loaded(path, body_only=True):
    scene = trimesh.load(path, force='scene', process=False)
    if body_only:
        node = next(n for n in scene.graph.nodes_geometry if 'body-tail' in n)
        transform, name = scene.graph[node]
        mesh = scene.geometry[name].copy()
        mesh.apply_transform(transform)
    else:
        mesh = scene.dump(concatenate=True)
    mesh.vertices = mesh.vertices[:, [0, 2, 1]] * np.array([1, -1, 1])
    return mesh


def distribution(values):
    return np.quantile(values, [0, .5, .9, .99, 1]).tolist() if len(values) else []


def radial_spectrum(points, origin=None, basis=None):
    if origin is None:
        origin = points.mean(axis=0)
    if basis is None:
        _, axes = np.linalg.eigh(np.cov(points - origin, rowvar=False))
        basis = axes[:, 1:]
    xy = (points - origin) @ basis
    order = np.argsort(np.arctan2(xy[:, 1], xy[:, 0]))
    xy = xy[order]
    closed = np.vstack([xy, xy[0]])
    lengths = np.linalg.norm(np.diff(closed, axis=0), axis=1)
    cumulative = np.r_[0, np.cumsum(lengths)]
    arc = np.linspace(0, cumulative[-1], 512, endpoint=False)
    uniform = np.column_stack([np.interp(arc, cumulative, closed[:, axis]) for axis in range(2)])
    cx, cy, intercept = np.linalg.lstsq(np.column_stack([2 * uniform, np.ones(len(uniform))]), np.square(uniform).sum(axis=1), rcond=None)[0]
    uniform -= [cx, cy]
    theta = np.arctan2(uniform[:, 1], uniform[:, 0])
    radius = np.linalg.norm(uniform, axis=1)
    order = np.argsort(theta)
    grid = np.linspace(-np.pi, np.pi, 512, endpoint=False)
    samples = np.interp(grid, np.r_[theta[order] - 2 * np.pi, theta[order], theta[order] + 2 * np.pi], np.tile(radius[order], 3))
    spectrum = np.fft.rfft(samples) / len(samples)
    bands = {}
    for lower, upper in [(3, 8), (8, 16), (16, 32), (32, 64), (64, 128), (8, 128)]:
        bands[f'{lower}to{upper}'] = float(np.sqrt(2 * np.square(abs(spectrum[lower:upper])).sum()))
    modes = np.arange(8, 64)
    strongest = modes[np.argsort(abs(spectrum[modes]))[-5:][::-1]]
    return {
        'perimeter': float(cumulative[-1]), 'meanRadius': float(samples.mean()),
        'radialRange': [float(samples.min()), float(samples.max())],
        'highModeRms': bands,
        'strongestModes8to63': [{'mode': int(k), 'sinusoidAmplitude': float(2 * abs(spectrum[k])), 'perimeterDividedByMode': float(cumulative[-1] / k)} for k in strongest],
    }


def normal_residuals(mesh, sample_ids):
    vertices, faces = mesh.vertices, mesh.faces
    normals = mesh.vertex_normals
    area = np.zeros(len(vertices))
    for corner in range(3):
        np.add.at(area, faces[:, corner], mesh.area_faces / 3)
    tree = cKDTree(vertices)
    report = {}
    for radius in [.008, .015, .025, .04]:
        residuals, counts = [], []
        for index in sample_ids:
            normal = normals[index]
            reference = np.eye(3)[np.argmin(abs(normal))]
            first = np.cross(normal, reference)
            first /= np.linalg.norm(first)
            second = np.cross(normal, first)
            ids = np.array(tree.query_ball_point(vertices[index], radius))
            ids = ids[normals[ids] @ normal > .5]
            if len(ids) < 12:
                continue
            delta = vertices[ids] - vertices[index]
            x, y, height = delta @ first / radius, delta @ second / radius, delta @ normal
            design = np.column_stack([np.ones(len(ids)), x, y, x * x, x * y, y * y])
            weight = np.sqrt(area[ids] * np.exp(-4 * np.square(np.linalg.norm(delta, axis=1) / radius)))
            coefficients, _, rank, _ = np.linalg.lstsq(design * weight[:, None], height * weight, rcond=None)
            if rank != 6:
                continue
            residuals.append(float(coefficients[0]))
            counts.append(len(ids))
        residuals = np.array(residuals)
        report[str(radius)] = {
            'fitCount': len(residuals), 'neighborCountQuantiles': distribution(counts),
            'absoluteCentralNormalResidualQuantiles': distribution(abs(residuals)),
            'signedCentralNormalResidualMean': float(residuals.mean()) if len(residuals) else None,
            'centralNormalResidualRms': float(np.sqrt(np.mean(residuals * residuals))) if len(residuals) else None,
        }
    return report


def main():
    archive = np.load(ROOT / 'r02b/vertex-audit.npz')
    before, after, weights = archive['before'].astype(float), archive['after'].astype(float), archive['weights']
    region = np.load(ROOT / 'r02b/region.npz')
    assert np.array_equal(region['before'], before) and np.array_equal(region['weights'], weights)
    displacement = np.linalg.norm(after - before, axis=1)
    changed = np.any(before != after, axis=1)
    raw = loaded(RAW, body_only=False)
    raw_distances, _ = cKDTree(raw.vertices).query(before, k=1)
    original = raw_distances < 1e-7
    seam = (abs(before[:, 1] - .15) < 1e-6) & (before[:, 0] < 0) & (before[:, 2] < -.2)
    meshes = {}
    input_matches = {}
    for label, coordinates in [('r02a', before), ('r02b', after)]:
        export = loaded(ROOT / label / f'charizard-tail-{label}.glb')
        distances, ids = cKDTree(coordinates).query(export.vertices, k=1)
        assert distances.max() == 0 and len(np.unique(ids)) == len(coordinates)
        meshes[label] = trimesh.Trimesh(coordinates, ids[export.faces], process=False)
        input_matches[label] = {'maximumCoordinateDistance': float(distances.max()), 'uniqueStableIds': len(np.unique(ids))}
    groups = {}
    for label, selected in [
        ('allSelected', weights > 0), ('weightAbove099', weights > .99),
        ('originalRoot', (weights > 0) & original), ('seam', (weights > 0) & seam),
        ('generated', (weights > 0) & ~original & ~seam),
    ]:
        groups[label] = {'vertices': int(selected.sum()), 'changed': int(changed[selected].sum()), 'weightQuantiles': distribution(weights[selected]), 'displacementQuantiles': distribution(displacement[selected])}
    y_bands = []
    for lower, upper in zip([-.05, 0, .05, .10, .15, .2, .25, .3], [0, .05, .1, .15, .2, .25, .3, .36]):
        selected = (weights > 0) & (before[:, 1] >= lower) & (before[:, 1] < upper)
        y_bands.append({'yRange': [lower, upper], 'vertices': int(selected.sum()), 'changed': int(changed[selected].sum()), 'weightMedian': float(np.median(weights[selected])), 'displacementQuantiles': distribution(displacement[selected])})
    sections = []
    for y in [0, .05, .10, .125, .14, .15, .18, .2, .25, .3, .34]:
        row = {'y': y}
        for label, mesh in meshes.items():
            section = mesh.section(plane_origin=[0, y, 0], plane_normal=[0, 1, 0])
            line = max((line for line in section.discrete if line[:, 0].max() < 0 and line[:, 2].max() < -.2), key=len)
            row[label] = radial_spectrum(line, basis=np.array([[1., 0], [0, 0], [0, 1.]]))
        sections.append(row)
    edges = meshes['r02a'].edges_unique
    previous, visited = np.flatnonzero(seam), original | seam
    rings = [previous]
    for _ in range(8):
        active = np.zeros(len(before), bool)
        active[previous] = True
        touching = edges[active[edges].any(axis=1)]
        following = np.unique(touching[~visited[touching]])
        assert len(following) == 317
        rings.append(following)
        visited[following] = True
        previous = following
    ring_reports = []
    for index, ids in enumerate(rings):
        center = before[ids].mean(axis=0)
        _, axes = np.linalg.eigh(np.cov(before[ids] - center, rowvar=False))
        basis = axes[:, 1:]
        ring_reports.append({'ring': index, 'yBoundsBefore': [float(before[ids, 1].min()), float(before[ids, 1].max())], 'changedVertices': int(changed[ids].sum()), 'r02a': radial_spectrum(before[ids], center, basis), 'r02b': radial_spectrum(after[ids], center, basis)})
    candidates = np.flatnonzero(original & (weights > .8) & (before[:, 1] < .14))
    cells = np.floor(before[candidates] / .01).astype(int)
    _, unique = np.unique(cells, axis=0, return_index=True)
    sample_ids = candidates[unique][::max(1, len(unique) // 500)]
    fits = {label: normal_residuals(mesh, sample_ids) for label, mesh in meshes.items()}
    normals = meshes['r02a'].vertex_normals
    selected = weights > 0
    signed = np.einsum('ij,ij->i', after - before, normals)
    tangential = np.sqrt(np.maximum(0, displacement * displacement - signed * signed))
    report = {
        'inputs': {str(path): hashlib.sha256(path.read_bytes()).hexdigest() for path in [RAW, ROOT / 'r02b/region.npz', ROOT / 'r02b/vertex-audit.npz', ROOT / 'r02a/charizard-tail-r02a.glb', ROOT / 'r02b/charizard-tail-r02b.glb']},
        'exportStableIdAgreement': input_matches, 'quantileOrder': [0, .5, .9, .99, 1],
        'groups': groups, 'yBands': y_bands,
        'protectedGeometry': {'vertices': int((weights == 0).sum()), 'movedVertices': int(changed[weights == 0].sum()), 'faceVertexIndexSequenceEqual': bool(np.array_equal(archive['source_face_vertex_indices'], archive['target_face_vertex_indices']))},
        'selectedDisplacementDirection': {'signedNormalMean': float(signed[selected].mean()), 'signedNormalQuantiles': distribution(signed[selected]), 'tangentialMagnitudeQuantiles': distribution(tangential[selected])},
        'sectionMethod': 'Closed low-left Y-plane sections. Circle center fitted after arc-uniform sampling; 512 angular radius samples, Fourier bands omit broad ovality modes. Y-plane elongation is not perpendicular thickness. High-mode amplitudes are geometric roughness descriptors, not anatomical labels.',
        'sections': sections, 'rings': ring_reports,
        'normalFitMethod': 'Diagnostic quadratic height fit in each sample tangent plane. Area-weighted Gaussian samples inside the stated physical radius; normal compatibility >.5. Same stable sample IDs before/after. Reports aggregate central normal residuals only; no edited positions or coordinate proposal is written. Euclidean neighborhoods are not geodesic and require branch protection in any authoring use.',
        'normalFitSampleCount': len(sample_ids), 'normalFitResiduals': fits,
    }
    (OUT / 'rib-measurements.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'groups': groups, 'protected': report['protectedGeometry'], 'normalFits': fits}, indent=2))
    print('SECTION HIGH MODE RMS')
    for row in sections:
        print(row['y'], row['r02a']['highModeRms'], row['r02b']['highModeRms'])
    print('RING HIGH MODE RMS')
    for row in ring_reports:
        print(row['ring'], row['changedVertices'], row['r02a']['highModeRms'], row['r02b']['highModeRms'])


if __name__ == '__main__':
    main()
