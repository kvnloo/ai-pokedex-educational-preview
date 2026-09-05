"""Copy the frozen r02a source and mark only the connected tail-root region."""
import bpy
import json
import numpy as np
from pathlib import Path

out = Path(globals().get('region_directory', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02b'))
assert not out.exists(), 'Each candidate owns a new output directory'
assert 'EDIT-charizard-tail-r02b' not in bpy.data.scenes
out.mkdir()
source = bpy.data.objects['GEO-charizard-body-tail-r02a']
before = np.asarray([v.co[:] for v in source.data.vertices], dtype=np.float32)
frozen = np.load('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02a/vertex-audit.npz')
assert np.array_equal(before, frozen['after'])
scene = bpy.data.scenes.new('EDIT-charizard-tail-r02b')
parent = bpy.data.scenes['EDIT-charizard-tail-r02a']
bpy.context.window.scene = parent
bpy.context.view_layer.update()
for obj in parent.objects:
    if obj.type == 'MESH':
        copy = obj.copy()
        copy.data = obj.data.copy()
        copy.parent = None
        copy.matrix_world = obj.matrix_world.copy()
        copy.name = 'GEO-charizard-body-tail-r02b' if len(copy.data.vertices) > 10000 else 'GEO-charizard-flame-reference-r02b'
        scene.collection.objects.link(copy)
bpy.context.window.scene = scene
target = bpy.data.objects['GEO-charizard-body-tail-r02b']
x, y, z = before.T
envelope = (x < 0) & (z < -.20) & (y > -.05) & (y < .36)
neighbors = [[] for _ in before]
for edge in target.data.edges:
    a, b = edge.vertices
    neighbors[a].append(b)
    neighbors[b].append(a)
seed = int(np.linalg.norm(before - np.asarray([-.81, .15, -.46]), axis=1).argmin())
assert envelope[seed]
selected = set([seed])
pending = [seed]
while pending:
    index = pending.pop()
    for neighbor in neighbors[index]:
        if envelope[neighbor] and neighbor not in selected:
            selected.add(neighbor)
            pending.append(neighbor)

def ease(value):
    value = np.clip(value, 0, 1)
    return value * value * (3 - 2 * value)

weights = ease((y + .05) / .09) * ease((.36 - y) / .08) * ease(-x / .10) * ease((-.20 - z) / .06)
weights *= np.isin(np.arange(len(before)), list(selected))
group = target.vertex_groups.new(name='Tail-root-refinement')
for index in np.flatnonzero(weights):
    group.add([int(index)], float(weights[index]), 'REPLACE')
np.savez_compressed(out / 'region.npz', before=before, weights=weights, source_faces=np.asarray([i for p in source.data.polygons for i in p.vertices], dtype=np.int32))
report = {'parent': 'charizard-tail-r02a', 'candidate': 'charizard-tail-r02b', 'envelope': {'xMaximum': 0, 'zMaximum': -.20, 'yRange': [-.05, .36]}, 'seedVertex': seed, 'connectedVertices': len(selected), 'weightedVertices': int(np.count_nonzero(weights)), 'protectedVertices': int(np.count_nonzero(weights == 0)), 'bounds': [before[weights > 0].min(axis=0).tolist(), before[weights > 0].max(axis=0).tolist()], 'falloff': 'Smoothstep fade at all envelope boundaries; connected component only'}
(out / 'region.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
