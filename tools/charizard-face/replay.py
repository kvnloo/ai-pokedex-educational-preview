"""Replay the inspected face checkpoint from frozen r06 in a fresh Blender process."""
import argparse
import bpy
import hashlib
import json
import numpy as np
import shutil
import sys
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--out', required=True, type=Path)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
destination = args.out.resolve()
assert destination.is_relative_to('/mnt/zer0models') and not destination.exists()
scripts = Path(__file__).resolve().parent
lane = scripts.parents[1]
batch = lane / 'canonical/characters/charizard/face-batch'
inputs = json.loads((batch / 'inputs.json').read_text())
verified = set()
for entry in inputs['files']:
    path = lane / entry['path'] if entry['pathRoot'] == 'repository' else Path(entry['path'])
    data = path.read_bytes()
    assert len(data) == entry['bytes'] and hashlib.sha256(data).hexdigest() == entry['sha256'], path
    verified.add(path.resolve())
assert Path(inputs['parentBlend']).resolve() in verified
destination.mkdir()
for source, target in inputs['copies'].items():
    path = lane / source if not source.startswith('/') else Path(source)
    assert path.resolve() in verified
    target = destination / target
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)
with bpy.data.libraries.load(inputs['parentBlend'], link=False) as (available, loaded):
    assert 'EDIT-charizard-head-r06' in available.scenes
    loaded.scenes = ['EDIT-charizard-head-r06']
bpy.context.window.scene = loaded.scenes[0]
bpy.context.view_layer.update()


def run(path, **options):
    path = path.resolve()
    assert path in verified
    exec(compile(path.read_text(), str(path), 'exec'), {
        '__file__': str(path), 'face_root': str(destination), 'head_root': str(destination), **options,
    })


run(scripts / 'clean_sliver.py')
run(scripts.parent / 'charizard-head/render_candidate.py', head_revision='r07')
selection_path = batch / 'manual-divot-selection.json'
assert selection_path.resolve() in verified
selection = json.loads(selection_path.read_text())
assert selection['sourceBlendSHA256'] == hashlib.sha256(Path(inputs['parentBlend']).read_bytes()).hexdigest()
audit = np.load(destination / 'head-r07/sliver-audit.npz')
parent_to_current = {int(parent): index for index, parent in enumerate(audit['parent_vertex_ids'])}
interior = np.asarray([parent_to_current[row] for row in selection['interiorR06Rows']])
boundary = np.asarray([parent_to_current[row] for row in selection['boundaryR06Rows']])
assert len(interior) == 1317 and len(boundary) == 72
assert not audit['protected'][np.r_[interior, boundary]].any()
out = destination / 'divot-selection-r01'
out.mkdir()
np.savez_compressed(out / 'selection.npz', before=audit['after'], interior=interior,
                    boundary=boundary, protected=audit['protected'])
np.save(out / 'r06-patch-triangles.npy', np.asarray(selection['trianglesR06Rows'], dtype=np.int64))
run(scripts / 'replace_divot.py', divot_revision='r14', grid_simple=True)
run(scripts.parent / 'charizard-head/render_candidate.py', head_revision='r14')
run(scripts / 'fair_patch.py', fair_revision='r15')
run(scripts.parent / 'charizard-head/render_candidate.py', head_revision='r15')
run(scripts / 'render_divot.py', divot_revision='r15')
run(scripts / 'build_eyes_cdt.py', eye_revision='r18')
run(scripts.parent / 'charizard-head/render_candidate.py', head_revision='r18')
run(scripts / 'render_face.py', face_revision='r18')
(destination / 'replay-receipt.json').write_text(json.dumps({
    'inputsVerified': len(inputs['files']), 'parentBlend': inputs['parentBlend'],
    'selection': str(selection_path), 'stages': ['r07', 'r14', 'r15', 'r18'],
    'status': 'authored; awaiting artifact comparison',
}, indent=2) + '\n')
