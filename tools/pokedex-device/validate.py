"""Measured authoring evidence; does not substitute visual review or runtime tests."""
import bpy,bmesh,json,math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v001/source')

def descendant(obj,parent):
    while obj:
        if obj==parent:return True
        obj=obj.parent
    return False

def run(scene):
    graph=bpy.context.evaluated_depsgraph_get();rows=[];local={}
    for obj in scene.objects:
        if obj.type!='MESH' or obj.name.startswith('STUDIO.'):continue
        evaluated=obj.evaluated_get(graph);mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
        bm=bmesh.new();bm.from_mesh(mesh)
        rows.append(dict(name=obj.name,vertices=len(mesh.vertices),triangles=len(mesh.loop_triangles),nonManifoldEdges=sum(not e.is_manifold for e in bm.edges),degenerateFaces=sum(f.calc_area()<1e-14 for f in bm.faces),volumeM3=bm.calc_volume(signed=True),uvLayers=len(mesh.uv_layers),scale=list(obj.scale),materials=[m.name for m in mesh.materials]))
        local[obj]=([v.co.copy() for v in mesh.vertices],[tuple(t.vertices) for t in mesh.loop_triangles])
        bm.free();evaluated.to_mesh_clear()
    lid=scene.objects['PDX.LidHinge'];old=lid.rotation_euler.x
    def world_mesh(obj):
        vv,ff=local[obj];verts=[obj.matrix_world@v for v in vv]
        bounds=([min(v[i] for v in verts) for i in range(3)],[max(v[i] for v in verts) for i in range(3)])
        return verts,ff,bounds,BVHTree.FromPolygons(verts,ff,all_triangles=True,epsilon=0)
    def overlapping_bounds(a,b):
        return all(min(a[1][i],b[1][i])-max(a[0][i],b[0][i])>2e-6 for i in range(3))
    fixed={o:world_mesh(o) for o in local if not descendant(o,lid)}
    moving=[o for o in local if descendant(o,lid)]
    sweep=[]
    for degrees in [0,2,5,10,20,30,45,60,75,90,105,112,112.7]:
        lid.rotation_euler.x=math.radians(-degrees);bpy.context.view_layer.update();pairs=[]
        for obj in moving:
            a=world_mesh(obj)
            for other,b in fixed.items():
                if not overlapping_bounds(a[2],b[2]):continue
                hits=a[3].overlap(b[3])
                if hits:pairs.append({'moving':obj.name,'fixed':other.name,'trianglePairs':len(hits)})
        sweep.append({'degrees':degrees,'surfaceIntersectionCandidates':pairs})
    lid.rotation_euler.x=old;bpy.context.view_layer.update()
    result={'scene':scene.name,'stage':'static-validation','meshObjects':len(rows),'triangles':sum(r['triangles'] for r in rows),'topologyPassed':all(r['nonManifoldEdges']==0 and r['degenerateFaces']==0 and r['volumeM3']>0 for r in rows),'meshes':rows,'hingeSweep':sweep,'method':'Evaluated geometry, bmesh manifold/area/volume; BVH moving-vs-fixed surface overlap with 2 micrometer AABB penetration tolerance. Contact candidates require review. This is not exhaustive volumetric CAD clearance certification.'}
    (OUT/'static-validation.json').write_text(json.dumps(result,indent=2))
    print(json.dumps({k:v for k,v in result.items() if k!='meshes'}))
    return result

if __name__=='__main__':run(bpy.context.scene)
