"""Register three source-head reviews without changing meshes or human reviews."""
import fcntl
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
workspace = lane.parents[1]
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
base = 'assets/blender/charizard-head-baselines-r07'
destination = lane/'canonical/characters/charizard/whole-r07'
destination.mkdir(parents=True,exist_ok=True)
blend = 'charizard-head-baseline-comparison-r07-all.blend'
rows = [
    ('home','charizard-home-raw-61061','HOME61061 · imported head baseline',729684),
    ('illustration','charizard-official-raw-61062-o256','Illustration61062 o256 · imported head baseline',291274),
    ('illustration384','charizard-official-raw-61062','Illustration61062 o384 · imported head baseline',656262),
]
runs = []
for label,parent_id,title,triangles in rows:
    parent = json.loads((workspace/'experiments/runs'/(parent_id+'.json')).read_text())
    previews = [{'view':'head-'+view,'path':f'{base}/baseline-{label}/{view}.png'} for view in ['front','near','far','threequarter','top']]
    assert all((root/Path(preview['path']).relative_to(base)).is_file() for preview in previews)
    run = {
        'id':f'charizard-{label}-head-baseline-r07','species':'charizard','stage':'blender','status':'unfinished',
        'title':title,'parents':[parent_id],'question':'Which existing HOME/illustration-input baseline gives the strongest head anatomy before further sculpting?',
        'inputs':parent['inputs'],'controls':['No post-import geometry edits; native importer omits8 HOME/6 illustration256/10 illustration384 triangles; smooth shading','Shared camera directions, .7 orthographic scale, paint.sl lighting','Head center adjusted per source; no new Hunyuan generation'],
        'changedFactors':[{'name':'review framing','from':'whole-body raw source','to':'five dedicated head views'}],
        'recipe':{'model':'Blender source-head inspection','parameters':{'newGeneration':False,'geometryEdited':False,'sourceRun':parent_id,'headPoseNormalized':False,'orthoScale':.7}},
        'outputs':{'rawMesh':parent['outputs']['rawMesh'],'blend':f'{base}/{blend}','previews':previews},
        'evaluation':{'verdict':'needs-work','reviewer':'assistant','notes':'Stronger local upper-head starting point: paired horns, compact muzzle and higher brow/socket. Lower jaw is inflated and must be refined. No whole-asset promotion.' if label=='home' else 'Both illustration resolutions retain extra rear protrusions, long muzzle, weak socket and nearly straight mouth seam. Higher density does not repair these source-shape defects.','unresolved':['All source heads remain soft and unfinished','No finished eyes, mouth interior, textures or rig']},
        'metrics':{'blenderImportedTriangles':triangles,'rawFileEdited':False,'importerDroppedTriangles':{'home':8,'illustration':6,'illustration384':10}[label]},
        'comparability':{'cohort':'charizard-raw-heads-r07','confounds':['Different input images, seeds and source poses','HOME and illustration384 have comparable sampling; illustration256 is lower density','Head centers differ; shared directions are not anatomical alignment','Side cameras clip foreground wings','Shared blend contains all three sources; rawMesh links to the original whole-body source']},
        'createdAt':datetime.fromtimestamp((root/blend).stat().st_mtime,timezone.utc).isoformat(),
    }
    runs.append(run)

def atomic_json(path,value):
    with tempfile.NamedTemporaryFile(mode='w',dir=path.parent,delete=False) as stream:
        stream.write(json.dumps(value,indent=2)+'\n')
        temporary = stream.name
    os.replace(temporary,path)

registry = workspace/'devtools/experiments.json'
with registry.with_suffix('.json.lock').open('a') as lock:
    fcntl.flock(lock,fcntl.LOCK_EX)
    original = registry.read_bytes()
    document = json.loads(original)
    assert document['schemaVersion']==1
    for run in runs:
        existing = [item for item in document['runs'] if item['id']==run['id']]
        saved = destination/(run['id']+'-experiment.json')
        assert not existing or existing==[run] or (saved.exists() and existing==[json.loads(saved.read_text())]), 'Existing metadata changed outside this lane'
        if existing and existing != [run]:
            prior = root/(run['id']+'-before-metadata-correction.json')
            assert not prior.exists()
            prior.write_text(json.dumps(existing[0],indent=2)+'\n')
            document['runs'][document['runs'].index(existing[0])] = run
        if not existing:
            document['runs'].append(run)
    alias = workspace/base
    if not alias.exists():
        alias.symlink_to(root,target_is_directory=True)
    assert alias.resolve()==root and registry.read_bytes()==original
    for run in runs:
        atomic_json(workspace/'experiments/runs'/(run['id']+'.json'),run)
        atomic_json(destination/(run['id']+'-experiment.json'),run)
    assert registry.read_bytes()==original
    atomic_json(registry,document)
print(json.dumps({'registered':[run['id'] for run in runs],'humanReviewsChanged':False,'gameDeploymentChanged':False}))
