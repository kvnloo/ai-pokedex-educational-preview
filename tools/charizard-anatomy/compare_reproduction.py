"""Compare exported coordinates/topology and decoded renders from two runs."""
import hashlib
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image
import trimesh

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02')
parser = argparse.ArgumentParser()
parser.add_argument('--reproduction', default='reproduction-r3')
args = parser.parse_args()
a, b = root / 'r02a', root / args.reproduction
report = {'directories': [str(a), str(b)], 'geometry': {}, 'transforms': {}, 'renders': {}}
scenes = [trimesh.load(p / 'charizard-tail-r02a.glb', force='scene', process=False) for p in [a, b]]
for name in scenes[0].graph.nodes_geometry:
    left, right = [s.geometry[s.graph[name][1]] for s in scenes]
    report['geometry'][name] = {'coordinatesExact': bool(np.array_equal(left.vertices, right.vertices)), 'trianglesExact': bool(np.array_equal(left.faces, right.faces))}
assert set(scenes[0].graph.nodes_geometry) == set(scenes[1].graph.nodes_geometry)
for name in scenes[0].graph.nodes_geometry:
    report['transforms'][name] = bool(np.array_equal(scenes[0].graph[name][0], scenes[1].graph[name][0]))
for view in ['minusY', 'plusX', 'plusY', 'minusX', 'threequarter']:
    name = f'charizard-tail-r02a-{view}.png'
    left, right = [np.array(Image.open(p / name)) for p in [a, b]]
    report['renders'][view] = {'pixelsExact': bool(np.array_equal(left, right)), 'differentChannels': int(np.count_nonzero(left != right)), 'maximumChannelDifference': int(np.max(np.abs(left.astype(int) - right.astype(int))))}
report['glbHashes'] = [hashlib.sha256((p / 'charizard-tail-r02a.glb').read_bytes()).hexdigest() for p in [a, b]]
report['geometryAndPixelsExact'] = all(all(v.values()) for v in report['geometry'].values()) and all(report['transforms'].values()) and all(v['pixelsExact'] for v in report['renders'].values())
(b / 'comparison.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
assert report['geometryAndPixelsExact']
