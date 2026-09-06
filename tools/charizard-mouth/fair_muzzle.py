"""Reduce inherited muzzle relief within an inspected, tapered deformation mask."""
import bpy
import json
import numpy as np
from pathlib import Path

root = Path(globals().get('mouth_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05'))
revision = globals().get('muzzle_revision','r20')
out = root / ('head-'+revision)
assert not out.exists()
source = bpy.data.objects['GEO-charizard-body-head-r18']
data = np.load(root/'muzzle-selection-r01/source.npz')
before = np.asarray([vertex.co[:] for vertex in source.data.vertices],dtype=np.float32)
assert np.array_equal(before,data['before'])
local = data['local']


def smoothstep(value):
    value=np.clip(value,0,1)
    return value*value*(3-2*value)


weight=np.minimum(smoothstep((local[:,1]+.035)/.055),smoothstep((.025-local[:,2])/.035))
weight[~data['region']]=0
eye_new=np.asarray([row.value for row in source.data.attributes['head_r15_vertex_id'].data])<0
weight[eye_new]=0
edges=data['edges']
adjacent_to_eye=np.unique(edges[eye_new[edges].any(axis=1)])
weight[adjacent_to_eye]=0
free=np.flatnonzero(weight>0)
row_index=np.full(len(before),-1,dtype=np.int64);row_index[free]=np.arange(len(free))
directed=np.concatenate([edges,edges[:,::-1]])
directed=directed[row_index[directed[:,0]]>=0]
rows=row_index[directed[:,0]]
degree=np.bincount(rows,minlength=len(free))
after=before.astype(np.float64)
cycles=int(globals().get('muzzle_cycles',60))
factors=globals().get('muzzle_factors',[.30])
for cycle in range(cycles):
    for factor in factors:
        total=np.zeros((len(free),3))
        np.add.at(total,rows,after[directed[:,1]])
        average=total/degree[:,None]
        after[free]+=factor*weight[free,None]*(average-after[free])
after=after.astype(np.float32)
assert np.array_equal(after[data['protected']],before[data['protected']])
assert np.array_equal(after[eye_new],before[eye_new])
assert np.array_equal(after[weight==0],before[weight==0])
scene=bpy.data.scenes.new('EDIT-charizard-head-'+revision)
for original in bpy.data.scenes['EDIT-charizard-head-r18'].objects:
    if original.type!='MESH': continue
    obj=original.copy();obj.data=original.data.copy();obj.parent=None
    obj.matrix_world=original.matrix_world.copy();obj.name=original.name.replace('r18',revision)
    scene.collection.objects.link(obj)
body=bpy.data.objects['GEO-charizard-body-head-'+revision]
body.data.vertices.foreach_set('co',after.ravel());body.data.update()
bpy.context.window.scene=scene
out.mkdir(parents=True)
np.savez_compressed(out/'muzzle-audit.npz',before=before,after=after,weight=weight,free=free,
                    protected=data['protected'],eye_new=eye_new,eye_buffer=adjacent_to_eye)
(out/'muzzle-receipt.json').write_text(json.dumps({'parent':'charizard-head-r18','candidate':'charizard-head-'+revision,
    'method':'Positive uniform Laplacian diffusion in a tapered inspected muzzle mask',
    'cycles':cycles,'factors':factors,
    'freeVertices':len(free),'maxDisplacement':float(np.linalg.norm(after-before,axis=1).max()),
    'eyeAnnulusAndImmediateNeighborCoordinatesExact':True,'topologyUnchanged':True,
    'status':'Intermediate surface cleanup; awaiting visual/export checks; no mouth/teeth anatomy acceptance'},indent=2)+'\n')
print(json.dumps({'candidate':'charizard-head-'+revision,'freeVertices':len(free),'maxDisplacement':float(np.linalg.norm(after-before,axis=1).max())}))
