"""Moving/fixed surface-intersection candidates from actual evaluated solid meshes."""
import bpy
import math
import json
from pathlib import Path
from mathutils.bvhtree import BVHTree

def descendant(obj, parent):
    while obj:
        if obj == parent:return True
        obj = obj.parent
    return False

def check(version, revision):
    scene=bpy.data.scenes['ASTRA-'+version+'-'+revision];bpy.context.window.scene=scene
    lid=next(o for o in scene.objects if o.get('source_name')=='PDX.LidHinge')
    angle=json.loads(scene['contract'])['angle'];old=lid.rotation_euler.x
    local={};graph=bpy.context.evaluated_depsgraph_get()
    for obj in scene.objects:
        if obj.type!='MESH' or obj.get('geometry_role')=='display-graphic':continue
        ev=obj.evaluated_get(graph);mesh=ev.to_mesh();mesh.calc_loop_triangles()
        local[obj]=([v.co.copy() for v in mesh.vertices],[tuple(t.vertices) for t in mesh.loop_triangles])
        ev.to_mesh_clear()
    def world(obj):
        verts,faces=local[obj];vv=[obj.matrix_world@v for v in verts]
        bounds=([min(v[i] for v in vv) for i in range(3)],[max(v[i] for v in vv) for i in range(3)])
        return bounds,BVHTree.FromPolygons(vv,faces,all_triangles=True,epsilon=0)
    fixed={o:world(o) for o in local if not descendant(o,lid)}
    moving=[o for o in local if descendant(o,lid)];sweep=[]
    for degrees in [0,1,3,5,10,20,30,45,60,75,90,110,130,angle,angle+.5]:
        lid.rotation_euler.x=math.radians(-degrees);bpy.context.view_layer.update();pairs=[]
        for obj in moving:
            a,ta=world(obj)
            for other,(b,tb) in fixed.items():
                if not all(min(a[1][i],b[1][i])-max(a[0][i],b[0][i])>2e-6 for i in range(3)):continue
                hits=ta.overlap(tb)
                if hits:pairs.append({'moving':obj.get('source_name'),'fixed':other.get('source_name'),'surfacePairs':len(hits)})
        sweep.append({'degrees':degrees,'candidates':pairs})
    lid.rotation_euler.x=old;bpy.context.view_layer.update()
    result={'scene':scene.name,'method':'Evaluated triangle BVH intersections, moving lid vs fixed base; 2um AABB tolerance. Surface intersections require inspection; containment and same-assembly fits are separate checks.','sweep':sweep}
    output=Path('/mnt/zer0models/pokemon-iac/devices/pokedex')/version/('astra-'+revision)
    (output/'mechanics-sweep.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'version':version,'sweep':[{'degrees':s['degrees'],'candidateCount':len(s['candidates'])} for s in sweep],'uniquePairs':sorted(set((p['moving'],p['fixed']) for s in sweep for p in s['candidates']))}))
    return result
