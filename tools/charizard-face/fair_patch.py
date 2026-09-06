"""Fair only the new quad patch while constraining its existing boundary."""
import bpy
import json
import numpy as np
from pathlib import Path

root=Path(globals().get('face_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04'))
revision=globals().get('fair_revision','r15')
out=root/('head-'+revision)
assert not out.exists()
source=bpy.data.objects['GEO-charizard-body-head-r14']
data=np.load(root/'head-r14/divot-audit.npz')
before=np.asarray([vertex.co[:] for vertex in source.data.vertices],dtype=np.float32)
assert np.array_equal(before,data['after'])
free=np.flatnonzero(data['parent_vertex_ids']<0)
assert len(free)==289
neighbors=[[] for _ in before]
for edge in source.data.edges:
    a,b=edge.vertices
    neighbors[a].append(b);neighbors[b].append(a)
free_set=set(free)
boundary=sorted({neighbor for index in free for neighbor in neighbors[index] if neighbor not in free_set})
rows=list(free)+boundary
columns={int(index):column for column,index in enumerate(free)}
A=np.zeros((len(rows),len(free)))
B=np.zeros((len(rows),3))
for row,index in enumerate(rows):
    adjacent=np.asarray(neighbors[index])
    weights=1/np.maximum(np.linalg.norm(before[adjacent]-before[index],axis=1),1e-7)**2
    weights/=weights.sum()
    for vertex,coefficient in [(index,1)]+list(zip(adjacent,-weights)):
        if int(vertex) in columns: A[row,columns[int(vertex)]]+=coefficient
        else: B[row]-=coefficient*before[vertex]
solution,residuals,rank,singular=np.linalg.lstsq(A,B,rcond=None)
assert rank==len(free)
after=before.copy();after[free]=solution.astype(np.float32)
assert np.array_equal(after[data['protected']],before[data['protected']])
scene=bpy.data.scenes.new('EDIT-charizard-head-'+revision)
for original in bpy.data.scenes['EDIT-charizard-head-r14'].objects:
    if original.type=='MESH':
        obj=original.copy();obj.data=original.data.copy();obj.parent=None;obj.matrix_world=original.matrix_world.copy();obj.name=original.name.replace('r14',revision);scene.collection.objects.link(obj)
body=bpy.data.objects['GEO-charizard-body-head-'+revision]
body.data.vertices.foreach_set('co',after.ravel());body.data.update();bpy.context.window.scene=scene
out.mkdir(parents=True)
np.savez_compressed(out/'fair-audit.npz',before=before,after=after,free=free,protected=data['protected'],head_r07_vertex_ids=data['parent_vertex_ids'])
(out/'fair-receipt.json').write_text(json.dumps({'parent':'charizard-head-r14','candidate':'charizard-head-'+revision,'method':'Least-squares inverse-edge-length Laplacian on free grid vertices plus fixed boundary equations','freeVertices':len(free),'boundaryEquationVertices':len(boundary),'rank':int(rank),'maxDisplacement':float(np.linalg.norm(after-before,axis=1).max()),'retainedExteriorCoordinatesExact':True,'protectedVerticesExact':113062,'status':'awaiting rendered/exported validation'},indent=2)+'\n')
print(json.dumps({'candidate':'charizard-head-'+revision,'freeVertices':len(free),'maxDisplacement':float(np.linalg.norm(after-before,axis=1).max())}))
