"""Recover the connected tail selection from the frozen exported r01 mesh."""
import hashlib
import json
from pathlib import Path
import sys

import numpy as np

lane = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(lane / 'tools/charizard-face/audit'))
from diagnose_eye_rims import load_meshes

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05')
source = root / 'whole-r01/charizard-whole-r01.glb'
out = root / 'whole-r02'
mesh = load_meshes(source)['GEO-charizard-body-whole-r01']
adjacency = [[] for _ in mesh.vertices]
for a, b in mesh.edges_unique:
    adjacency[a].append(b)
    adjacency[b].append(a)
tail = np.zeros(len(mesh.vertices), dtype=bool)
tail[120523:120833] = True
pending = [38382]
while pending:
    index = pending.pop()
    if tail[index]:
        continue
    tail[index] = True
    pending.extend(adjacency[index])
assert tail.sum() == 15497
v = mesh.vertices
selected = tail | ((v[:, 1] >= -.05) & (v[:, 0] < 0) & (v[:, 2] < -.20))
assert selected.sum() == 22935
np.savez_compressed(out / 'tail-selection.npz', coordinates=v[selected],
                    exportedRows=np.flatnonzero(selected), tip=v[38382])
(out / 'tail-selection.json').write_text(json.dumps({
    'source': str(source), 'sourceSHA256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'count': int(selected.sum()), 'collarExportRowsInclusive': [120523, 120832],
    'tipExportRow': 38382, 'tipBlenderWorld': v[38382].tolist(),
    'selectionOnly': True, 'method': 'Distal flood stopped by repaired collar plus proximal low-left envelope',
}, indent=2) + '\n')
print(json.dumps({'tailVertices': int(selected.sum()), 'bounds': [v[selected].min(0).tolist(), v[selected].max(0).tolist()]}))
