"""Add this candidate to the existing desk without changing human reviews."""
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

root = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon')
private = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02a')
public = root / 'assets/blender/charizard-tail-r02a'
if not public.exists():
    public.symlink_to(private, target_is_directory=True)
assert public.resolve() == private
base = 'assets/blender/charizard-tail-r02a'
parent_path = root / 'experiments/runs/charizard-tail-r01.json'
parent = json.loads(parent_path.read_text())
run = {
    'id': 'charizard-tail-r02a', 'species': 'charizard',
    'title': 'Manual tail repair 02a · remove folded join', 'stage': 'blender', 'status': 'completed',
    'parents': ['charizard-tail-r01'],
    'question': 'Can the rebuilt tail follow the original surface tangent without a folded attachment ring?',
    'changedFactors': [{'name': 'first five rebuilt rings', 'from': 'Immediate rotated cross-section with 29 folded-back vertices', 'to': 'Cubic Hermite surface ribbons; zero foldback'}],
    'controls': ['106843 original vertices and all 317 seam vertices fixed', 'Unchanged distal tail and static flame', 'Same five whole-body clay cameras; new matched root close-ups without cast shadows'],
    'inputs': parent['inputs'],
    'recipe': {'model': 'Manual Blender repair through Blender MCP', 'codePath': base + '/tail_patch.py', 'runnerSHA256': hashlib.sha256((Path(__file__).parent / 'tail_patch.py').read_bytes()).hexdigest(), 'parameters': {'changedRings': 5, 'verticesPerRing': 317, 'endpointRing': 6}, 'preprocess': 'No new image generation or image edits'},
    'outputs': {'rawMesh': base + '/charizard-tail-r02a.glb', 'blend': base + '/charizard-tail-r02a.blend', 'previews': [{'view': 'fair-' + v, 'path': base + '/charizard-tail-r02a-' + v + '.png'} for v in ['minusY', 'plusX', 'plusY', 'minusX', 'threequarter']] + [{'view': v, 'path': base + '/charizard-tail-r02a-' + v + '.png'} for v in ['root-side', 'root-rear']]},
    'evaluation': {'verdict': 'needs-work', 'reviewer': 'assistant', 'notes': 'Sharp join and local fold removed. Close-ups still show shallow longitudinal ripples; proximal oval root is unchanged. This is a repair checkpoint, not a finished asset.', 'unresolved': ['Root surface ripples and tail proportion review', 'Malformed head/horns, hands/feet and wing attachment', 'No authored UVs/PBR, rig, animation, attacks or runtime promotion']},
    'metrics': {'vertices': 126893, 'trianglesAfterGLTFExport': 253782, 'changedBodyVertices': 1585, 'protectedOriginalVerticesUnchanged': 106843, 'bodyWatertight': True, 'localIntersectionPairs': 0, 'wholeModelSelfIntersectionTested': False, 'meshSHA256': hashlib.sha256((private / 'charizard-tail-r02a.glb').read_bytes()).hexdigest()},
    'evidence': [{'label': label, 'path': base + '/' + name} for label, name in [('Operation receipt', 'patch-receipt.json'), ('Independent export validation', 'r02a-validation.json'), ('Close-up cameras', 'closeup-camera.json'), ('Blender viewport', 'blender-viewport.png')]],
    'comparability': {'cohort': 'charizard-manual-tail', 'confounds': ['Whole-body views retain Workbench cast shadows. Root close-ups disable shadows in both candidates to inspect the surface.']},
    'createdAt': datetime.fromtimestamp((private / 'charizard-tail-r02a.glb').stat().st_mtime, timezone.utc).isoformat(),
}
for view in ['root-side', 'root-rear']:
    preview = {'view': view, 'path': base + '/charizard-tail-r01-' + view + '.png'}
    assert not any(p['view'] == view and p != preview for p in parent['outputs']['previews'])
    if preview not in parent['outputs']['previews']:
        parent['outputs']['previews'].append(preview)

def write(path, value):
    temporary = path.with_suffix(path.suffix + '.new')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    os.replace(temporary, path)

index = root / 'devtools/experiments.json'
document = json.loads(index.read_text())
for item in [parent, run]:
    existing = next((i for i, r in enumerate(document['runs']) if r['id'] == item['id']), None)
    if existing is None:
        document['runs'].append(item)
    else:
        document['runs'][existing] = item
write(parent_path, parent)
write(root / 'experiments/runs/charizard-tail-r02a.json', run)
write(index, document)
tracked = Path(__file__).resolve().parents[2] / 'canonical/characters/charizard/tail-r02a'
tracked.mkdir(parents=True, exist_ok=True)
write(tracked / 'experiment.json', run)
print(json.dumps({'run': run['id'], 'runs': len(document['runs']), 'url': 'https://0.taila30dc.ts.net:8445/devtools/experiments.html?pokemon=charizard&a=charizard-tail-r01&b=charizard-tail-r02a&view=root-side'}))
