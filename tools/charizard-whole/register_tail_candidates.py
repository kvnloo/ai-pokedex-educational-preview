"""Register the reviewed tail trial and restored-face checkpoint without changing human reviews."""
import hashlib
import fcntl
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
workspace = lane.parents[1]
private = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05')
registry = workspace / 'devtools/experiments.json'
registry_lock = registry.with_suffix('.json.lock').open('a')
fcntl.flock(registry_lock, fcntl.LOCK_EX)
original = registry.read_bytes()
document = json.loads(original)
parent = json.loads((workspace / 'experiments/runs/charizard-whole-r01.json').read_text())
views = {'fair-minusY': 'front', 'fair-plusX': 'right', 'fair-plusY': 'rear',
         'fair-minusX': 'left', 'fair-threequarter': 'threequarter',
         'face-negative-side': 'face-near', 'face-positive-side': 'face-far', 'face-front': 'face-front'}
runs = []


def stage_json(destination, value):
    with tempfile.NamedTemporaryFile(mode='w', dir=destination.parent,
                                     prefix=destination.name + '.', suffix='.tmp', delete=False) as stream:
        stream.write(json.dumps(value, indent=2) + '\n')
        return Path(stream.name)


for revision, baseline in [('r02', False), ('r03', False), ('r03', True)]:
    root = private / ('whole-' + revision)
    base = 'assets/blender/charizard-whole-' + revision
    public = workspace / base
    if not public.exists():
        public.symlink_to(root, target_is_directory=True)
    assert public.resolve() == root
    identifier = 'charizard-whole-' + revision + ('-match-r01' if baseline else '')
    source_base = ('assets/blender/charizard-whole-r01/charizard-whole-r01' if baseline
                   else base + '/charizard-whole-' + revision)
    directory = 'before-whole-r01' if baseline else 'after-whole-' + revision
    review = json.loads((root / 'review.json').read_text())
    capture = json.loads((root / 'capture-receipt.json').read_text())
    previews = [{'view': key, 'path': base + '/' + directory + '/' + name + '.png'}
                for key, name in views.items()]
    for path in [source_base + '.blend', source_base + '.glb', *[p['path'] for p in previews]]:
        assert (workspace / path).is_file(), path
    run = {
        'id': identifier, 'species': 'charizard', 'stage': 'blender', 'status': 'completed',
        'title': ('r01 · matched baseline for tail revision' if baseline else
                  'Whole r02 · tail trial, facial regression rejected' if revision == 'r02' else
                  'Whole r03 · tail retained, prior face restored'),
        'parents': ['charizard-whole-r02' if revision == 'r03' and not baseline else 'charizard-whole-r01'],
        'question': 'Can native GUI tail edits improve silhouette without retaining a facial regression?',
        'changedFactors': [{'name': 'geometry', 'from': 'whole-r01',
                            'to': 'matched capture only' if baseline else review['visual']['summary']}],
        'controls': ['Official-source ancestry; no new generation inputs', 'Matched cameras and neutral clay lighting',
                     'All previous checkpoints and rejected trials preserved'],
        'inputs': parent['inputs'],
        'recipe': {'model': 'Blender GUI sculpt/native transforms; MCP setup, selection, rollback and capture',
                   'parameters': {'baselineCaptureOnly': baseline, 'authoritativeSource': source_base + '.blend'}},
        'outputs': {'rawMesh': source_base + '.glb', 'blend': source_base + '.blend', 'previews': previews},
        'evaluation': {'verdict': 'needs-work', 'reviewer': 'assistant',
                       'notes': 'Unchanged r01 source under matched cameras.' if baseline else review['visual']['summary'],
                       'unresolved': review['visual']['remaining']},
        'metrics': parent['metrics'] if baseline else {
            'vertices': sum(m['vertices'] for m in capture['meshes']),
            'trianglesAfterGLTFExport': sum(m['triangles'] for m in capture['meshes']),
            'meshSHA256': hashlib.sha256((workspace / (source_base + '.glb')).read_bytes()).hexdigest(),
            'wholeModelSelfIntersectionTested': False},
        'comparability': {'cohort': 'charizard-whole-gui',
                          'confounds': ['Several tail edits combined', 'Side face views clip foreground wings',
                                        'Clay and provisional eye colors; no authored PBR materials']},
        'createdAt': datetime.fromtimestamp((root / ('charizard-whole-' + revision + '.glb')).stat().st_mtime,
                                            timezone.utc).isoformat(),
    }
    index = next((i for i, value in enumerate(document['runs']) if value['id'] == identifier), None)
    if index is None:
        document['runs'].append(run)
    else:
        document['runs'][index] = run
    runs.append((revision, run))

assert registry.read_bytes() == original, 'Registry changed during preparation; rerun against fresh state'
for revision, run in runs:
    receipt_dir = lane / 'canonical/characters/charizard' / ('whole-' + revision)
    receipt_dir.mkdir(parents=True, exist_ok=True)
    for destination in [workspace / 'experiments/runs' / (run['id'] + '.json'),
                        receipt_dir / (run['id'] + '-experiment.json')]:
        temporary = stage_json(destination, run)
        os.replace(temporary, destination)
temporary = stage_json(registry, document)
try:
    assert registry.read_bytes() == original, 'Registry changed during receipt writes; rerun against fresh state'
    os.replace(temporary, registry)
finally:
    temporary.unlink(missing_ok=True)
    registry_lock.close()
print(json.dumps({'registered': [run['id'] for _, run in runs], 'humanReviewsChanged': False,
                  'gameDeploymentChanged': False}))
