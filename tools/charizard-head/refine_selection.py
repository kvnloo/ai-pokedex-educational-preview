"""Remove disconnected mask fragments before any vertex deletion."""
import bpy
import json
import numpy as np
from pathlib import Path

root=Path(globals().get('head_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03'))
out=root/'selection-r02'
assert not out.exists()
out.mkdir()
data=np.load(root/'selection-r01/selection.npz')
xyz=data['before']
body=bpy.data.objects['GEO-charizard-body-head-r01']
adjacency=[[] for _ in xyz]
for edge in body.data.edges:
    a,b=edge.vertices
    adjacency[a].append(b)
    adjacency[b].append(a)

def retain_components(mask,seeds):
    result=np.zeros(len(mask),dtype=bool)
    for point in seeds:
        seed=int(np.linalg.norm(xyz-np.asarray(point),axis=1).argmin())
        assert mask[seed]
        pending=[seed]
        result[seed]=True
        while pending:
            for neighbor in adjacency[pending.pop()]:
                if mask[neighbor] and not result[neighbor]:
                    result[neighbor]=True
                    pending.append(neighbor)
    return result

groups={
    'central-upper-duplicate':retain_components(data['central-upper-duplicate'],[[-.0432295725,-.5596907139,.5541245341]]),
    'lower-posterior-duplicates':retain_components(data['lower-posterior-duplicates'],[[-.003929961,-.55624795,.412645906],[.058949415,-.559287727,.420505822]]),
    'dorsal-spike':data['dorsal-spike'],
}
report={'parentSelection':'selection-r01','status':'geometry unchanged; disconnected fragments excluded','groups':{name:{'vertices':int(mask.sum()),'discardedDisconnectedVertices':int(data[name].sum()-mask.sum()),'bounds':[xyz[mask].min(0).tolist(),xyz[mask].max(0).tolist()]} for name,mask in groups.items()}}
np.savez_compressed(out/'selection.npz',before=xyz,head=data['head'],**groups)
(out/'selection.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
