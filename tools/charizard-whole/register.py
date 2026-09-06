"""Add the inspected GUI experiment and its matched r18 capture to the private inspector."""
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
workspace = lane.parents[1]
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r01')
receipt_dir = lane / 'canonical/characters/charizard/whole-r01'
parent = json.loads((workspace / 'experiments/runs/charizard-head-r18.json').read_text())
registry = workspace / 'devtools/experiments.json'
original = registry.read_bytes()
document = json.loads(original)
public = workspace / 'assets/blender/charizard-whole-r01'
if not public.exists():
    public.symlink_to(root, target_is_directory=True)
assert public.resolve() == root
base = 'assets/blender/charizard-whole-r01'
views = {'fair-minusY': 'front', 'fair-plusX': 'right', 'fair-plusY': 'rear',
         'fair-minusX': 'left', 'fair-threequarter': 'threequarter',
         'face-negative-side': 'face-near', 'face-positive-side': 'face-far', 'face-front': 'face-front'}
review = json.loads((root / 'review.json').read_text())
runs = []
for baseline in [True, False]:
    identifier = 'charizard-whole-r01-match-r18' if baseline else 'charizard-whole-r01'
    directory = 'before-r18' if baseline else 'after-whole-r01'
    source_base = 'assets/blender/charizard-head-r18/charizard-head-r18' if baseline else base + '/charizard-whole-r01'
    previews = [{'view': view, 'path': base + '/' + directory + '/' + name + '.png'} for view, name in views.items()]
    for preview in previews:
        assert (workspace / preview['path']).is_file(), preview
    run = {
        'id': identifier, 'species': 'charizard',
        'title': 'r18 · matched camera baseline' if baseline else 'Whole-character GUI sculpt · r01 needs correction',
        'stage': 'blender', 'status': 'completed', 'parents': ['charizard-head-r18'],
        'question': 'Do broad GUI sculpt edits improve Charizard across front, side and whole-body views?',
        'changedFactors': [{'name': 'authoring', 'from': 'r18', 'to': 'matched capture only' if baseline else 'GUI sculpt and local head subdivision'}],
        'controls': ['Official-source ancestry; no new generation inputs', 'Matched cameras and neutral clay lighting', 'R18 rollback source preserved'],
        'inputs': parent['inputs'],
        'recipe': {'model': 'Blender GUI sculpting; MCP setup/capture',
                   'parameters': {'baselineCaptureOnly': baseline, 'authoritativeSource': source_base + '.blend'}},
        'outputs': {'rawMesh': source_base + '.glb', 'blend': source_base + '.blend', 'previews': previews},
        'evaluation': {'verdict': 'needs-work', 'reviewer': 'assistant',
                       'notes': 'Unchanged r18 mesh under cameras matched to whole-r01.' if baseline else 'Smoother head and clearer side lip, but front muzzle/lip is swollen, rear jaw too thin, tail still too heavy. Forty zero-area triangles and shallow body-eye intersections need correction. Working experiment, not approved.',
                       'unresolved': review['visual']['remaining'] + ['UV/PBR, rig, animation, attacks and game integration']},
        'metrics': parent['metrics'] if baseline else {'vertices': 169915, 'trianglesAfterGLTFExport': 339818,
                    'meshSHA256': hashlib.sha256((root / 'charizard-whole-r01.glb').read_bytes()).hexdigest(),
                    'wholeModelSelfIntersectionTested': False},
        'comparability': {'cohort': 'charizard-whole-gui', 'confounds': ['Several forms changed together', 'Supplementary side views clip foreground wings', 'Provisional eye colors; no final materials']},
        'createdAt': datetime.fromtimestamp((root / 'charizard-whole-r01.glb').stat().st_mtime, timezone.utc).isoformat(),
    }
    index = next((i for i, item in enumerate(document['runs']) if item['id'] == identifier), None)
    if index is None:
        document['runs'].append(run)
    else:
        document['runs'][index] = run
    runs.append(run)

assert registry.read_bytes() == original, 'Inspector registry changed during preparation; rerun against fresh state'
for run in runs:
    for destination in [workspace / 'experiments/runs' / (run['id'] + '.json'), receipt_dir / (run['id'] + '-experiment.json')]:
        temporary = destination.with_suffix('.json.new')
        temporary.write_text(json.dumps(run, indent=2) + '\n')
        os.replace(temporary, destination)
temporary = registry.with_suffix('.json.new')
temporary.write_text(json.dumps(document, indent=2) + '\n')
os.replace(temporary, registry)
print(json.dumps({'registered': [run['id'] for run in runs], 'humanReviewsChanged': False, 'gameDeploymentChanged': False}))
