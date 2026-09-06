"""Register inspected face checkpoints while preserving separate human reviews."""
import hashlib
import json
import os
import struct
from datetime import datetime, timezone
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
workspace = lane.parents[1]
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04')
batch = lane / 'canonical/characters/charizard/face-batch'
parent = json.loads((workspace / 'experiments/runs/charizard-head-r06.json').read_text())
document = json.loads((workspace / 'devtools/experiments.json').read_text())
views = ['head-front', 'head-right', 'head-left', 'head-rear', 'head-top', 'head-threequarter']
configs = [
    ('r07', 'Remove tiny skull sliver · r07', 'r06', 'clean_sliver.py', 'sliver-receipt.json',
     'needs-work', 'Two near-coincident interior vertices welded; retained coordinates unchanged. The old reported crossing is a near-contact detector artifact. Local cleanup passes; skull divot and face remain unfinished.'),
    ('r09', 'First eye sockets · rejected r09', 'r07', 'build_eyes.py', 'eye-receipt.json',
     'reject', 'Rejected: folded orbital connections and eye/socket-floor intersections confirmed by CPU audit and visible in renders. Preserved to compare the failed method.'),
    ('r13', 'Curved skull grid · rejected r13', 'r07', 'replace_divot.py', 'divot-receipt.json',
     'reject', 'Rejected: curved grid interpolation overshoots the fixed skull boundary, leaving visible folds. The r14 simple grid and r15 constrained fairing replace this method.'),
    ('r14', 'Simple skull grid · intermediate r14', 'r07', 'replace_divot.py', 'divot-receipt.json',
     'needs-work', 'Simple grid interpolation avoids the r13 overshoot, but boundary ripples remain. Intermediate input to r15 fairing.'),
    ('r15', 'Smooth the skull patch · r15', 'r14', 'fair_patch.py', 'fair-receipt.json',
     'needs-work', 'The bounded posterior crease is much smoother; all 14 local geometry gates pass. The muzzle, jaw and brow still need anatomical refinement.'),
    ('r18', 'Connected eye rims · r18', 'r15', 'build_eyes_cdt.py', 'eye-receipt.json',
     'needs-work', 'Current geometry checkpoint: constrained orbital triangulation removes the r09 folds; deeper socket floors clear the closed eye surfaces. Both sides and reopened GLB inspected. Colors are provisional vertex colors; muzzle/jaw, eyelids and gaze remain unfinished.'),
]


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.new')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    os.replace(temporary, path)


for revision, title, parent_revision, script, receipt, verdict, notes in configs:
    identifier = 'charizard-head-' + revision
    out = root / ('head-' + revision)
    public = workspace / 'assets/blender' / identifier
    if not public.exists():
        public.symlink_to(out, target_is_directory=True)
    assert public.resolve() == out
    base = 'assets/blender/' + identifier
    code = out / script
    assert code.exists(), 'Freeze the actual recipe before registration.'
    mesh = out / (identifier + '.glb')
    payload = mesh.read_bytes()
    length, kind = struct.unpack_from('<II', payload, 12)
    assert kind == 0x4E4F534A
    gltf = json.loads(payload[20:20 + length])
    primitives = [primitive for mesh in gltf['meshes'] for primitive in mesh['primitives']]
    vertices = sum(gltf['accessors'][p['attributes']['POSITION']]['count'] for p in primitives)
    triangles = sum(gltf['accessors'][p['indices']]['count'] // 3 for p in primitives)
    previews = [{'view': view, 'path': base + '/' + identifier + '-' + view + '.png'} for view in views]
    previews += [{'view': 'fair-' + view, 'path': base + '/' + identifier + '-' + view + '.png'}
                 for view in ['minusY', 'plusX', 'plusY', 'minusX', 'threequarter']]
    for view in ['face-reference', 'face-front', 'face-negative-side', 'face-positive-side', 'face-top',
                 'divot-top', 'divot-rear', 'divot-oblique']:
        if (out / (view + '.png')).exists():
            previews.append({'view': view, 'path': base + '/' + view + '.png'})
    run = {
        'id': identifier, 'species': 'charizard', 'title': title, 'stage': 'blender', 'status': 'completed',
        'parents': ['charizard-head-' + parent_revision],
        'question': 'Can bounded manual edits produce a smoother skull and faithful connected eye anatomy?',
        'changedFactors': [{'name': 'manual head operation', 'from': parent_revision, 'to': revision}],
        'controls': ['Official illustration ancestor; no new generation inputs',
                     'Frozen protected source geometry; exact flame geometry/transform, with neutral inspection color added to r09/r18', 'Matched unclipped standard head views'],
        'inputs': parent['inputs'],
        'recipe': {'model': 'Root manual Blender through Blender MCP', 'codePath': base + '/' + script,
                   'runnerSHA256': hashlib.sha256(code.read_bytes()).hexdigest(),
                   'parameters': json.loads((out / receipt).read_text())},
        'outputs': {'rawMesh': base + '/' + identifier + '.glb', 'blend': base + '/' + identifier + '.blend',
                    'previews': previews},
        'evaluation': {'verdict': verdict, 'reviewer': 'assistant', 'notes': notes,
                       'unresolved': ['Muzzle, jaw, eyelids and expression', 'Hands, feet and wing roots',
                                      'Deformation retopology, UV/PBR, rigging, clips, attacks and game integration']},
        'metrics': {'vertices': vertices, 'trianglesAfterGLTFExport': triangles,
                    'meshSHA256': hashlib.sha256(payload).hexdigest(), 'wholeModelSelfIntersectionTested': False},
        'comparability': {'cohort': 'charizard-manual-face',
                          'confounds': ['r09 to r18 changes both the eye method and the skull patch',
                                        'Supplementary side views clip foreground wings for inspection',
                                        'Eye colors are provisional; standard views use uniform clay',
                                        'Completed experiment does not mean approved character']},
        'createdAt': datetime.fromtimestamp(mesh.stat().st_mtime, timezone.utc).isoformat(),
    }
    index = next((i for i, item in enumerate(document['runs']) if item['id'] == identifier), None)
    if index is None:
        document['runs'].append(run)
    else:
        document['runs'][index] = run
    write(workspace / 'experiments/runs' / (identifier + '.json'), run)
    write(batch / (identifier + '-experiment.json'), run)
write(workspace / 'devtools/experiments.json', document)
print(json.dumps({'registered': [row[0] for row in configs], 'humanReviewsChanged': False}))
