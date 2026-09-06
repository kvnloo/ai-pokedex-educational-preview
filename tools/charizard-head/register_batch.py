"""Register the inspected head checkpoints without changing human reviews."""
import hashlib
import json
import os
import shutil
from pathlib import Path
from datetime import datetime,timezone

workspace=Path('/mnt/zer0models/workspace/zer0/experiments/pokemon')
root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03')
lane=Path(__file__).resolve().parents[2]
tracked=lane/'canonical/characters/charizard/head-batch'
parent=json.loads((workspace/'experiments/runs/charizard-tail-r02e.json').read_text())
document=json.loads((workspace/'devtools/experiments.json').read_text())
views=['head-front','head-right','head-left','head-rear','head-top','head-threequarter']
configs=[
 ('baseline','charizard-head-baseline-r02e','Before head repair · tail-r02e','charizard-tail-r02e','inspect_head.py','Five posterior branches and a dorsal spike; rounded intended horn tips. Frozen parent for this comparison.',126852,253700),
 ('head-r01','charizard-head-r01','Remove false head branches · r01','charizard-head-baseline-r02e','prune_duplicates.py','Branch count improves, but coarse replacement fans leave unacceptable skull creases. Retained only as an intermediate stage.',125821,251638),
 ('head-r04','charizard-head-r04','Refine skull caps · r04','charizard-head-r01','refine_caps.py','Explicit triangle splits and a narrow blend reduce cap creases; the posterior fold remains visible.',127423,254842),
 ('head-r05','charizard-head-r05','Broader skull blend · r05','charizard-head-r01','refine_caps.py','The broader blend reduces the fold further. A small posterior divot remains; horn shafts are still rounded.',127423,254842),
 ('head-r06','charizard-head-r06','Two tapered horn tips · r06','charizard-head-r05','shape_horns.py','Current local checkpoint. Exactly two connected tapered horn tips and a cleaner posterior skull. A divot, soft unfinished face, source intersection pair, hands/feet and wing roots still need work. No S+ or game-ready claim.',127149,254294),
]
def write(path,value):
    temporary=path.with_suffix(path.suffix+'.new')
    temporary.write_text(json.dumps(value,indent=2)+'\n')
    os.replace(temporary,path)
for folder,identifier,title,parent_id,script,notes,vertices,triangles in configs:
    out=root/folder
    public=workspace/'assets/blender'/identifier
    if not public.exists(): public.symlink_to(out,target_is_directory=True)
    assert public.resolve()==out
    base='assets/blender/'+identifier
    if not (out/script).exists():
        shutil.copy2(Path(__file__).parent/script,out/script)
    if folder=='baseline':
        outputs={'rawMesh':parent['outputs']['rawMesh'],'blend':parent['outputs']['blend'],'previews':[{'view':view,'path':base+'/'+view+'.png'} for view in views]}
        recipe={'method':'Read-only matched head views of frozen tail-r02e'}
    else:
        receipt='prune-receipt.json' if folder=='head-r01' else 'horn-receipt.json' if folder=='head-r06' else 'refinement-receipt.json'
        recipe=json.loads((out/receipt).read_text())
        outputs={'rawMesh':base+'/'+identifier+'.glb','blend':base+'/'+identifier+'.blend','previews':[{'view':view,'path':base+'/'+identifier+'-'+view+'.png'} for view in views]+[{'view':'fair-'+view,'path':base+'/'+identifier+'-'+view+'.png'} for view in ['minusY','plusX','plusY','minusX','threequarter']]}
    mesh=workspace/outputs['rawMesh']
    run={'id':identifier,'species':'charizard','title':title,'stage':'blender','status':'completed','parents':[parent_id],
      'question':'Can manual head repair recover two tapered horns and a coherent skull without changing the rest of the character?',
      'changedFactors':[{'name':'head operation','from':parent_id,'to':recipe['method']}],
      'controls':['Official illustration generation ancestor; no new image or mesh generation','Frozen tail-r02e outside-head geometry and flame','Matched shadow-free head cameras'],
      'inputs':parent['inputs'],'recipe':{'model':'Manual Blender through Blender MCP','codePath':base+'/'+script,'runnerSHA256':hashlib.sha256((out/script).read_bytes()).hexdigest(),'parameters':recipe},
      'outputs':outputs,'evaluation':{'verdict':'needs-work','reviewer':'assistant','notes':notes,'unresolved':['Facial anatomy and posterior divot','One inherited head intersection pair','Hands/feet and wing roots','Deformation retopology, UVs, colors/PBR, rig, clips, attacks and game integration']},
      'metrics':{'vertices':vertices,'trianglesAfterGLTFExport':triangles,'meshSHA256':hashlib.sha256(mesh.read_bytes()).hexdigest(),'protectedVerticesUnchanged':113062,'wholeModelSelfIntersectionTested':False},
      'comparability':{'cohort':'charizard-manual-head','confounds':['Head views disable cast shadows; whole-body views retain them','Numerical gates do not establish anatomical fidelity or whole-model intersection freedom']},
      'createdAt':datetime.fromtimestamp(mesh.stat().st_mtime,timezone.utc).isoformat()}
    existing=next((index for index,item in enumerate(document['runs']) if item['id']==identifier),None)
    if existing is None: document['runs'].append(run)
    else: document['runs'][existing]=run
    write(workspace/'experiments/runs'/(identifier+'.json'),run)
    write(tracked/(identifier+'-experiment.json'),run)
write(workspace/'devtools/experiments.json',document)
print(json.dumps({'registered':[config[1] for config in configs],'humanReviewsChanged':False}))
