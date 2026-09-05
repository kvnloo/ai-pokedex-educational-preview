"""Compare replay geometry, audit arrays and pixels against a Blender candidate."""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image
import trimesh

parser = argparse.ArgumentParser()
parser.add_argument('--candidate', choices=['r02d', 'r02e'], default='r02d')
parser.add_argument('--reproduction', type=Path, required=True)
args = parser.parse_args()
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02')
a, b = root / args.candidate, args.reproduction / args.candidate
identifier = 'charizard-tail-' + args.candidate
scenes = [trimesh.load(p / (identifier + '.glb'), force='scene', process=False) for p in [a, b]]
report = {'directories': [str(a), str(b)], 'geometry': {}, 'transforms': {}, 'arrays': {}, 'renders': {}}
assert set(scenes[0].graph.nodes_geometry) == set(scenes[1].graph.nodes_geometry)
for node in scenes[0].graph.nodes_geometry:
    meshes = [s.geometry[s.graph[node][1]] for s in scenes]
    report['geometry'][node] = {'verticesExact': bool(np.array_equal(meshes[0].vertices, meshes[1].vertices)), 'trianglesExact': bool(np.array_equal(meshes[0].faces, meshes[1].faces))}
    report['transforms'][node] = bool(np.array_equal(scenes[0].graph[node][0], scenes[1].graph[node][0]))
audit = 'topology-audit.npz' if args.candidate == 'r02e' else 'vertex-audit.npz'
left, right = [np.load(p / audit) for p in [a, b]]
for key in left.files:
    report['arrays'][key] = bool(np.array_equal(left[key], right[key]))
views = ['minusY', 'plusX', 'plusY', 'minusX', 'threequarter', 'root-side', 'root-rear']
if args.candidate == 'r02e':
    views.append('root-inner')
    report['nativePatchExact'] = json.loads((a / 'native-patch.json').read_text()) == json.loads((b / 'native-patch.json').read_text())
for view in views:
    images = [np.asarray(Image.open(p / (identifier + '-' + view + '.png'))) for p in [a, b]]
    report['renders'][view] = {'pixelsExact': bool(np.array_equal(*images)), 'differentChannels': int(np.count_nonzero(images[0] != images[1]))}
report['allExact'] = all(all(v.values()) for v in report['geometry'].values()) and all(report['transforms'].values()) and all(report['arrays'].values()) and all(v['pixelsExact'] for v in report['renders'].values()) and report.get('nativePatchExact', True)
(args.reproduction / ('comparison-' + args.candidate + '.json')).write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
assert report['allExact']
