"""Replay the head repair from the frozen tail checkpoint in fresh Blender."""
import argparse
import bpy
import hashlib
import json
import shutil
import sys
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--out',required=True)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
destination=Path(args.out).resolve()
assert destination.is_relative_to('/mnt/zer0models') and not destination.exists()
scripts=Path(__file__).resolve().parent
lane=scripts.parents[1]
inputs=json.loads((lane/'canonical/characters/charizard/head-batch/inputs.json').read_text())
verified=set()
for record in inputs['files']:
    file=lane/record['path'] if record['pathRoot']=='repository' else Path(record['path'])
    data=file.read_bytes()
    assert len(data)==record['bytes'] and hashlib.sha256(data).hexdigest()==record['sha256'],file
    verified.add(file.resolve())
assert Path(inputs['parentBlend']).resolve() in verified
assert Path(inputs['headCameras']).resolve() in verified
destination.mkdir()
(destination/'baseline').mkdir()
shutil.copy2(inputs['headCameras'],destination/'baseline/cameras.json')
with bpy.data.libraries.load(inputs['parentBlend'],link=False) as (available,loaded):
    assert 'EDIT-charizard-tail-r02e' in available.scenes
    loaded.scenes=['EDIT-charizard-tail-r02e']
def run(name,**options):
    file=scripts/name
    assert file.resolve() in verified,file
    exec(compile(file.read_text(),str(file),'exec'),{'__file__':str(file),'head_root':str(destination),**options})
run('prepare_head.py')
run('refine_selection.py')
run('prune_duplicates.py')
run('render_candidate.py',head_revision='r01')
run('refine_caps.py',cap_revision='r05',cap_band=.075,cap_iterations=220)
run('render_candidate.py',head_revision='r05')
run('select_horns.py')
run('shape_horns.py')
run('render_candidate.py',head_revision='r06')
(destination/'replay-receipt.json').write_text(json.dumps({'inputsVerified':len(inputs['files']),'parentBlend':inputs['parentBlend'],'stages':['prune-r01','refine-r05','horns-r06'],'status':'authored; awaiting comparison to actual artifacts'},indent=2)+'\n')
