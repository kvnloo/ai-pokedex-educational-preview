"""Publish four measured root experiments without changing human verdicts."""
import hashlib
import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path

workspace = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon')
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02')
lane = Path(__file__).resolve().parents[2]
tracked = lane / 'canonical/characters/charizard/root-surface-batch'
tracked.mkdir(parents=True, exist_ok=True)
parent = json.loads((workspace / 'experiments/runs/charizard-tail-r02a.json').read_text())
configs = [
    ('r02b', 'r02a', 'Native smooth', 'smooth_root.py', 'rejected', 'Native smoothing leaves the visible root ridges. Do not choose this as the improved baseline.'),
    ('r02c', 'r02a', 'Local surface fit with mesh normals', 'mls_root.py', 'rejected', 'Ridges reduce, but 48 reversed triangles and 50 local crossing pairs reject this pass. Noisy normals move old narrow triangles inconsistently.'),
    ('r02d', 'r02a', 'Local surface fit with PCA normals', 'mls_root.py', 'rejected', 'Surface improvement retained as the parent for r02e. Zero reversed triangles, but 12 local crossing pairs require a small collar repair.'),
    ('r02e', 'r02d', 'Repair inner collar strip', 'repair_root_strip.py', 'needs-work', 'Current assistant choice for this local repair. Smooth root retained; zero detected crossings in the measured root region. Full Charizard quality remains unfinished.'),
]

def write(path, value):
    temporary = path.with_suffix(path.suffix + '.new')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    os.replace(temporary, path)

index = workspace / 'devtools/experiments.json'
document = json.loads(index.read_text())
for suffix, parent_suffix, title, script, verdict, notes in configs:
    identifier = 'charizard-tail-' + suffix
    out = root / suffix
    public = workspace / 'assets/blender' / identifier
    if not public.exists():
        public.symlink_to(out, target_is_directory=True)
    assert public.resolve() == out
    base = 'assets/blender/' + identifier
    shutil.copy2(Path(__file__).parent / script, out / script)
    receipt_name = 'topology-receipt.json' if suffix == 'r02e' else 'smoothing-receipt.json'
    receipt = json.loads((out / receipt_name).read_text())
    views = ['root-side', 'root-rear'] + (['root-inner'] if suffix in ['r02d', 'r02e'] else [])
    intersections = {'r02b': None, 'r02c': 50, 'r02d': 12, 'r02e': 0}[suffix]
    run = {
        'id': identifier, 'species': 'charizard', 'title': title + ' · ' + suffix,
        'stage': 'blender', 'status': 'completed', 'parents': ['charizard-tail-' + parent_suffix],
        'question': 'Can a bounded root surface edit remove the lengthwise ridges without damaging the protected body or folding the collar?',
        'changedFactors': [{'name': 'root operation', 'from': 'frozen ' + parent_suffix, 'to': receipt['method']}],
        'controls': ['Same protected region: 112475 source coordinates unchanged', 'Unchanged flame', 'Matched whole-body and shadow-free root cameras', 'Official illustration ancestor; no new generation or image input'],
        'inputs': parent['inputs'],
        'recipe': {'model': 'Manual Blender through Blender MCP', 'codePath': base + '/' + script, 'runnerSHA256': hashlib.sha256((out / script).read_bytes()).hexdigest(), 'parameters': receipt, 'preprocess': 'No image edits or new Hunyuan run'},
        'outputs': {'rawMesh': base + '/' + identifier + '.glb', 'blend': base + '/' + identifier + '.blend', 'previews': [{'view': 'fair-' + view, 'path': base + '/' + identifier + '-' + view + '.png'} for view in ['minusY', 'plusX', 'plusY', 'minusX', 'threequarter']] + [{'view': view, 'path': base + '/' + identifier + '-' + view + '.png'} for view in views]},
        'evaluation': {'verdict': verdict, 'reviewer': 'assistant', 'notes': notes, 'unresolved': ['Tail proportion and deformation topology remain provisional', 'Malformed head/horns, hands/feet and wing connections', 'No UVs, colors/PBR, rig, clips, attacks or game promotion']},
        'metrics': {'vertices': 126852 if suffix == 'r02e' else 126893, 'trianglesAfterGLTFExport': 253700 if suffix == 'r02e' else 253782, 'protectedVerticesUnchanged': 112475, 'localIntersectionPairs': intersections, 'intersectionScope': 'wider root region from audit-root-surface/r02d-validation.json; r02b not measured', 'wholeModelSelfIntersectionTested': False, 'meshSHA256': hashlib.sha256((out / (identifier + '.glb')).read_bytes()).hexdigest()},
        'evidence': [{'label': 'Operation receipt', 'path': base + '/' + receipt_name}, {'label': 'Matched cameras', 'path': base + '/camera-receipt.json'}],
        'comparability': {'cohort': 'charizard-manual-tail', 'confounds': ['Whole-body Workbench views have cast shadows; root close-ups disable them. Local checks do not prove whole-model quality.']},
        'createdAt': datetime.fromtimestamp((out / (identifier + '.glb')).stat().st_mtime, timezone.utc).isoformat(),
    }
    existing = next((i for i, item in enumerate(document['runs']) if item['id'] == identifier), None)
    if existing is None:
        document['runs'].append(run)
    else:
        document['runs'][existing] = run
    write(workspace / 'experiments/runs' / (identifier + '.json'), run)
    write(tracked / (suffix + '-experiment.json'), run)
write(index, document)
print(json.dumps({'registered': [config[0] for config in configs], 'runs': len(document['runs']), 'humanReviewsChanged': False}))
