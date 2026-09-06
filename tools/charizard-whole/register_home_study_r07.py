"""Publish the unfinished HOME study and its matched intake to the private inspector."""
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
export = json.loads((root/'export-repaired.json').read_text())
reopen = json.loads((root/'reopen-repaired.json').read_text())
assert reopen['status'].startswith('passed') and reopen['workingSceneRestored']
parent = json.loads((workspace/'experiments/runs/charizard-home-raw-61061.json').read_text())
destination = lane/'canonical/characters/charizard/whole-r07'
destination.mkdir(parents=True, exist_ok=True)
runs = []
for intake in (True, False):
    identifier = 'charizard-home-head-r07-' + ('intake' if intake else 'study')
    folder = 'matched-intake' if intake else 'reopened-repaired'
    blend = 'home-head-r07-matched-intake.blend' if intake else 'charizard-home-head-r07-study-repaired.blend'
    outputs = {'blend': f'{base}/{blend}', 'previews': [
        {'view':'head-'+view, 'path':f'{base}/{folder}/{view}.png'}
        for view in ['front','near','far','threequarter']]}
    if not intake:
        outputs['rawMesh'] = f'{base}/charizard-home-head-r07-study-repaired.glb'
    for value in [outputs['blend'], *[p['path'] for p in outputs['previews']], *([outputs['rawMesh']] if 'rawMesh' in outputs else [])]:
        assert (root/Path(value).relative_to(base)).is_file()
    runs.append({
        'id':identifier, 'species':'charizard', 'stage':'blender', 'status':'unfinished',
        'title':'r07 HOME · matched starting head' if intake else 'r07 HOME · jaw and eye study, unfinished',
        'parents':['charizard-home-raw-61061'] if intake else ['charizard-home-head-r07-intake'],
        'question':'Does refining the HOME-derived head improve its jaw and eye read?',
        'inputs':parent['inputs'],
        'controls':['Existing PokeAPI-hosted HOME sprite baseline chosen by Kevin; no new generation',
                    'Same isolated head frame, four cameras, gray material and Workbench lighting',
                    'Frozen raw source and failed intermediate trials preserved'],
        'changedFactors':[] if intake else [
            {'name':'jaw','from':'Inflated inherited lower jaw','to':'Aligned35% depth reduction plus native Smooth'},
            {'name':'eyes','from':'Buried inherited socket','to':'Two closed fitted patches with provisional white/teal/black material bands'},
            {'name':'lids','from':'Inherited socket surface','to':'Fitted bands, MANIFOLD union, native Smooth, paired tessellation-flap removal'}],
        'recipe':{'model':'Blender MCP geometry fitting/Boolean; native GUI sculpt; reopened static GLB',
                  'parameters':{'newGeneration':False,'headBaseline':'charizard-home-raw-61061','baselineCaptureOnly':intake,'authoritativeSource':outputs['blend']}},
        'outputs':outputs,
        'evaluation':{'verdict':'needs-work','reviewer':'assistant',
            'notes':'Original isolated Basis after import, cut/cap and rigid reframe; all anatomy keys disabled.' if intake else
                    'Shallower jaw and visible eyes improve local readability. Muzzle remains bulbous, horns tubular/asymmetric, iris bands too crude, and eyelid edges uneven. Technical round-trip passes; likeness and complete-asset quality do not.',
            'unresolved':[
                'Isolated cut/capped HOME-derived head; no body attachment',
                'Inflated jaw, bulbous muzzle, buried eye sockets and asymmetric tubular horns',
                'Anatomy keys disabled; fitted eye and lid meshes hidden',
                'No UVs, texture images, final PBR, eye rig, animation clips or game integration',
                'No self-intersection, deformation, LOD or complete-Pokemon acceptance'
            ] if intake else export['knownLimitations']},
        'metrics':{'baselineCaptureOnly':True} if intake else {
            'vertices':export['vertices'],'trianglesAfterGLTFExport':export['triangles'],
            'meshSHA256':export['artifacts'][1]['sha256'],'glbReopenPassed':True,
            'animationCount':0,'textureCount':0,'wholeModelSelfIntersectionTested':False},
        'comparability':{'cohort':'charizard-home-r07-matched','confounds':[
            'Several sequential changes; not a one-factor experiment',
            'Head cut/cap retained; no body attachment',
            'Approximate bilateral frame, not exact symmetry',
            'EyeA and eyeB used different intermediate head keys; do not treat that side trial as a controlled A/B',
            'Gray material and placeholder eye colors; no final PBR or optical gaze rig']},
        'createdAt':datetime.fromtimestamp((root/blend).stat().st_mtime,timezone.utc).isoformat(),
    })

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
    assert document['schemaVersion'] == 1
    for run in runs:
        existing = [item for item in document['runs'] if item['id'] == run['id']]
        saved = destination/(run['id']+'-experiment.json')
        assert not existing or existing == [run] or (saved.exists() and existing == [json.loads(saved.read_text())]), 'Existing study metadata changed outside this lane'
        if existing and existing != [run]:
            prior = root/(run['id']+'-before-metadata-correction.json')
            assert not prior.exists()
            prior.write_text(json.dumps(existing[0],indent=2)+'\n')
            document['runs'][document['runs'].index(existing[0])] = run
        if not existing:
            document['runs'].append(run)
    assert (workspace/base).resolve() == root and registry.read_bytes() == original
    for run in runs:
        atomic_json(workspace/'experiments/runs'/(run['id']+'.json'),run)
        atomic_json(destination/(run['id']+'-experiment.json'),run)
    assert registry.read_bytes() == original
    atomic_json(registry,document)
print(json.dumps({'registered':[run['id'] for run in runs], 'humanReviewsChanged':False, 'gameDeploymentChanged':False}))
