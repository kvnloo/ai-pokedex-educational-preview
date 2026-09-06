"""Add the unfinished r06 study and its matched intake to the existing inspector."""
import fcntl
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

lane=Path(__file__).resolve().parents[2]
workspace=lane.parents[1]
root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
base='assets/blender/charizard-whole-r06'
public=workspace/base
export=json.loads((root/'export.json').read_text())
parent=json.loads((workspace/'experiments/runs/charizard-whole-r03.json').read_text())
r05_input={'role':'Immediate source scene checkpoint · r05 mouth/jaw study','path':'assets/blender/charizard-whole-r05/charizard-whole-r05-mouth-jaw-study.blend','sha256':'746f0988ac4d5095bccdcd7bd281a593aefb5e258cbb743aa9c2df58953d360e','sourceKind':'blender_checkpoint','note':'Prepared from live r05 scene state, not a hash-guarded file replay. Frozen r06-start is the authoritative comparison intake.'}
receipt_dir=lane/'canonical/characters/charizard/whole-r06'
receipt_dir.mkdir(parents=True,exist_ok=True)
views={'head-front':'front','head-near':'near','head-far':'far','head-threequarter':'threequarter'}
runs=[]
for baseline in [True,False]:
    identifier='charizard-whole-r06'+('-intake' if baseline else '')
    folder='matched-intake' if baseline else 'reopened'
    previews=[{'view':key,'path':f'{base}/{folder}/{name}.png'} for key,name in views.items()]
    if not baseline:
        previews += [{'view':name,'path':f'{base}/reopened/{name}.png'} for name in ['whole-front','whole-back','whole-side','whole-threequarter']]
    blend=f'{base}/charizard-whole-r06-'+('start' if baseline else 'study')+'.blend'
    outputs={'blend':blend,'previews':previews}
    if not baseline: outputs['rawMesh']=f'{base}/charizard-whole-r06-study.glb'
    for path in [outputs['blend'],*[p['path'] for p in previews],*([outputs['rawMesh']] if 'rawMesh' in outputs else [])]:
        assert (root/Path(path).relative_to(base)).is_file(), path
    run={'id':identifier,'species':'charizard','stage':'blender','status':'unfinished',
         'title':'r06 intake · matched head baseline' if baseline else 'r06 · connected head study, likeness unfinished',
         'parents':['charizard-whole-r03','charizard-official-raw-61062-o256'] if baseline else ['charizard-whole-r06-intake'],
         'question':'Can controlled native head edits and a clean neck bridge improve the inherited raw head?',
         'inputs':parent['inputs']+[r05_input],
         'controls':['Official illustration/HOME visual references; no new generation','Matched head cameras and vertex-color clay lighting within this pair','Earlier sources, failed Boolean and curved bridge preserved'],
         'changedFactors':[] if baseline else [{'name':'muzzle','from':'r06 intake','to':'15% shorter forward region'},{'name':'lower jaw','from':'r06 intake','to':'3 degree closure and local lip smoothing'},{'name':'eyes','from':'buried inherited lenses','to':'Reversibly fitted to skull; gaze/lids still wrong'},{'name':'neck','from':'separate overlapping head/body','to':'199-vertex boundary loops, three intermediate rows, linear connection'}],
         'recipe':{'model':'Blender native GUI transforms/sculpt/bridge; MCP selection, surface fitting, checks and capture','parameters':{'baselineCaptureOnly':baseline,'authoritativeSource':blend,'newGeneration':False,'headBaseline':'charizard-official-raw-61062-o256'}},
         'outputs':outputs,
         'evaluation':{'verdict':'needs-work','reviewer':'assistant','notes':'Preserved starting geometry under the same head cameras.' if baseline else 'Local gains in muzzle length, mouth closure and neck continuity. Eye gaze, lids, nasal shape, hanging jaw and tube-like horns remain visibly wrong. This is a study, not an AAA or game-ready asset.','unresolved':export['knownLimitations']},
         'metrics':{'baselineCaptureOnly':True} if baseline else {'vertices':export['vertices'],'trianglesAfterGLTFExport':export['triangles'],'meshSHA256':export['artifacts'][1]['sha256'],'wholeModelSelfIntersectionTested':False,'animationCount':0,'textureCount':0},
         'comparability':{'cohort':'charizard-head-r06-matched','confounds':['Several sequential changes in one study','Head cameras are matched only within the r06 intake/r06 pair','Side head views clip foreground wings','Provisional vertex colors; no PBR or rig']},
         'createdAt':datetime.fromtimestamp((root/Path(blend).name).stat().st_mtime,timezone.utc).isoformat()}
    runs.append(run)

def atomic_json(path,value):
    with tempfile.NamedTemporaryFile(mode='w',dir=path.parent,prefix=path.name+'.',suffix='.tmp',delete=False) as stream:
        stream.write(json.dumps(value,indent=2)+'\n')
        temporary=Path(stream.name)
    os.replace(temporary,path)

registry=workspace/'devtools/experiments.json'
with registry.with_suffix('.json.lock').open('a') as lock:
    fcntl.flock(lock,fcntl.LOCK_EX)
    original=registry.read_bytes()
    document=json.loads(original)
    assert document['schemaVersion']==1
    for run in runs:
        existing=[r for r in document['runs'] if r['id']==run['id']]
        assert not existing or existing==[run], 'Existing r06 entry differs; preserve it for review'
        if not existing: document['runs'].append(run)
    if not public.exists(): public.symlink_to(root,target_is_directory=True)
    assert public.resolve()==root
    assert registry.read_bytes()==original
    for run in runs:
        atomic_json(workspace/'experiments/runs'/(run['id']+'.json'),run)
        atomic_json(receipt_dir/(run['id']+'-experiment.json'),run)
    assert registry.read_bytes()==original
    atomic_json(registry,document)
print(json.dumps({'registered':[r['id'] for r in runs],'humanReviewsChanged':False,'gameDeploymentChanged':False}))
