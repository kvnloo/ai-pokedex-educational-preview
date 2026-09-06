"""Build a constrained patch with interior samples instead of one high-valence pole."""
import numpy as np
from mathutils import Vector, geometry


def cap_patch(bm,rim,vertex_ids):
    points=np.asarray([v.co[:] for v in rim],dtype=float)
    center=points.mean(0)
    _,vectors=np.linalg.eigh(np.cov(points-center,rowvar=False))
    candidates=[vectors[:,0],np.asarray([0.,1.,1.]),np.asarray([0.,1.,0.]),np.asarray([0.,0.,1.]),np.asarray([v.normal[:] for v in rim]).mean(0)]
    projections=[]
    for normal in candidates:
        if np.linalg.norm(normal)<1e-10:
            continue
        normal=normal/np.linalg.norm(normal)
        axis=np.eye(3)[np.abs(normal).argmin()]
        u=np.cross(normal,axis)
        u/=np.linalg.norm(u)
        v=np.cross(normal,u)
        uv=np.column_stack([(points-center)@u,(points-center)@v])
        crossings=0
        for i in range(len(uv)):
            for j in range(i+2,len(uv)):
                if i==0 and j==len(uv)-1:
                    continue
                hit=geometry.intersect_line_line_2d(Vector(uv[i]),Vector(uv[(i+1)%len(uv)]),Vector(uv[j]),Vector(uv[(j+1)%len(uv)]))
                crossings+=hit is not None
        area=abs(np.sum(uv[:,0]*np.roll(uv[:,1],-1)-uv[:,1]*np.roll(uv[:,0],-1)))/2
        projections.append((crossings,-area,uv,normal,u,v))
    crossings,_,uv,normal,u,v=min(projections,key=lambda item:(item[0],item[1]))
    assert crossings==0, f'Patch boundary projection crosses {crossings} times'
    if np.sum(uv[:,0]*np.roll(uv[:,1],-1)-uv[:,1]*np.roll(uv[:,0],-1))<0:
        rim=list(reversed(rim))
        points=points[::-1]
        uv=uv[::-1]
    count=len(rim)

    def inside(point):
        x,y=point
        odd=False
        for a,b in zip(uv,np.roll(uv,-1,axis=0)):
            if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:
                odd=not odd
        return odd

    coordinates=list(uv)
    spacing=.0075
    lo,hi=uv.min(0),uv.max(0)
    for x in np.arange(lo[0]+spacing/2,hi[0],spacing):
        for y in np.arange(lo[1]+spacing/2,hi[1],spacing):
            point=np.asarray([x,y])
            if inside(point) and np.linalg.norm(uv-point,axis=1).min()>spacing*.35:
                coordinates.append(point)
    result=geometry.delaunay_2d_cdt([Vector(p) for p in coordinates],[],[list(range(count))],1,1e-10,True)
    uv_out,_,triangles,origins,_,_=result
    mapped=[]
    new_vertices=[]
    for coordinate,origin in zip(uv_out,origins):
        boundary=[i for i in origin if i<count]
        if boundary:
            assert len(boundary)==1
            mapped.append(rim[boundary[0]])
            continue
        delta=uv-np.asarray(coordinate)
        distance=np.linalg.norm(delta,axis=1)
        cross=delta[:,0]*np.roll(delta[:,1],-1)-delta[:,1]*np.roll(delta[:,0],-1)
        denominator=distance*np.roll(distance,-1)+(delta*np.roll(delta,-1,axis=0)).sum(1)
        assert np.all(abs(denominator)>1e-15)
        tangent=cross/denominator
        weight=(tangent+np.roll(tangent,1))/distance
        point=(points*weight[:,None]).sum(0)/weight.sum()
        vertex=bm.verts.new(point)
        vertex[vertex_ids]=-1
        mapped.append(vertex)
        new_vertices.append(vertex)
    used={i for tri in triangles for i in tri}
    assert all(i in used for i in range(len(mapped))), 'No loose patch vertices'
    faces=[]
    for tri in triangles:
        vertices=tuple(mapped[i] for i in tri)
        existing=bm.faces.get(vertices)
        if existing:
            raise RuntimeError(f'Cap overlaps an existing face at parent vertices {[vertex[vertex_ids] for vertex in vertices]}; projection normal {normal.tolist()}')
        faces.append(bm.faces.new(vertices))
    return faces,{'boundaryParentVertexIds':[v[vertex_ids] for v in rim],'projectionNormal':normal.tolist(),'spacing':spacing,'interiorVertices':len(new_vertices),'triangles':len(faces)}
