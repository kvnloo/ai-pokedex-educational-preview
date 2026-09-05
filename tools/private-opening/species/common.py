"""Original mesh/rig utilities; no asset import or image inputs."""
import sys, json, hashlib, math, os, importlib.util
from pathlib import Path
import bpy, bmesh
from mathutils import Vector
BASE=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('opening_author',BASE/'author_blender.py')
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
material,group,ellipsoid,box,tube,prism,socket = a.material,a.group,a.ellipsoid,a.box,a.tube,a.prism,a.socket
ROOT=a.ROOT

def loft(name, rings, mat, parent, sides=16):
    # Elliptical rings along an authored spine; closed, welded solid topology.
    verts=[]
    for x,y,z,rx,ry in rings:
        verts.extend((x+math.cos(i*math.tau/sides)*rx,y+math.sin(i*math.tau/sides)*ry,z) for i in range(sides))
    faces=[tuple(reversed(range(sides)))]
    for j in range(len(rings)-1):
        for i in range(sides):
            k=j*sides+i;n=j*sides+(i+1)%sides;faces.append((k,n,n+sides,k+sides))
    faces.append(tuple(range((len(rings)-1)*sides,len(rings)*sides)))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return a.finish(obj,name,mat,parent)

def spike(name,start,end,radius,mat,parent):
    d=Vector(end)-Vector(start);mid=(Vector(start)+Vector(end))/2
    bpy.ops.mesh.primitive_cone_add(vertices=16,radius1=radius,radius2=.0015,depth=d.length,location=mid)
    obj=bpy.context.object;obj.rotation_euler=d.to_track_quat('Z','Y').to_euler()
    return a.finish(obj,name,mat,parent)

def wing(name,outline,mat,parent,depth=.045):
    obj=prism(name,outline,depth,mat,parent)
    for face in obj.data.polygons:face.use_smooth=False
    return obj

def eyes(parent,m,x,y,z,size=.09,iris='teal'):
    for s in [-1,1]:
        ellipsoid('eye sclera',(s*x,y,z),(size,size*.28,size*1.25),m['ivory'],parent)
        ellipsoid('colored iris',(s*x,y-size*.25,z),(size*.48,size*.17,size*.9),m[iris],parent)
        ellipsoid('vertical pupil',(s*x,y-size*.4,z),(size*.19,size*.08,size*.73),m['black'],parent)
        ellipsoid('eye catchlight',(s*x-.015,y-size*.46,z+.027),(size*.17,size*.05,size*.23),m['ivory'],parent)

def animate(root,limbs):
    for name in ['idle','walk','run','greet','special']:
        for key,obj in limbs.items():
            original=tuple(obj.rotation_euler)
            action=bpy.data.actions.new(name+'_'+key);obj.animation_data_create();obj.animation_data.action=action
            for f in range(1,33):
                phase=(f-1)/32*math.tau;ang=list(original);s=-1 if key.endswith('L') else 1
                if 'wing' in key:ang[1]+=s*math.sin(phase)*(.32 if name in ['run','special'] else .10)
                if 'tail' in key or 'tendril' in key:ang[2]+=s*math.sin(phase)*(.24 if name=='special' else .10)
                if 'head' in key:ang[0]+=math.sin(phase)*(.12 if name=='special' else .025)
                if 'leg' in key or 'arm' in key:
                    ang[0]+=s*math.sin(phase)*(.45 if name in ['walk','run'] else .02)
                    if name in ['special','greet'] and 'arm' in key:ang[1]+=s*math.sin(phase/2)*.8
                obj.rotation_euler=ang;obj.keyframe_insert(data_path='rotation_euler',frame=f)
            obj.animation_data.action=None;track=obj.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,action);obj.rotation_euler=original
    bpy.context.scene.frame_set(1)

def export(character,builder,recipe):
    if bpy.app.version[:2]!=(5,2):raise RuntimeError('Blender 5.2 required')
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    root,limbs=builder();root['canonicalId']=character['canonicalId'];root['form']=character['form'];root['identityPlane']='canonical-private-local'
    bpy.context.view_layer.update()
    points=[o.matrix_world@v.co for o in root.children_recursive if o.type=='MESH' for v in o.data.vertices]
    root.scale=(character['heightMeters']/(max(p.z for p in points)-min(p.z for p in points)),)*3
    animate(root,limbs);qa=a.mesh_qa(root)
    if not qa['ok']:raise RuntimeError(json.dumps(qa))
    out=ROOT/'roster'/character['id'];out.mkdir(parents=True,exist_ok=True);os.chmod(out,0o700)
    # Preserve each previous iteration, including its receipt and authored source.
    if (out/'receipt.json').exists():
        import time
        archive=out/('revision-'+str(time.time_ns()));archive.mkdir(mode=0o700)
        for f in list(out.iterdir()):
            if f.is_file():f.rename(archive/f.name)
    glb=out/'model.glb';blend=out/'model.blend'
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_extras=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend))
    inputs={str(Path(f).relative_to(a.REPO)):a.sha(f) for f in [recipe,__file__,BASE/'author_blender.py']}
    receipt={'schemaVersion':2,'method':'generated-from-scratch','scope':'private-local','externalInputs':[],'blenderVersion':bpy.app.version_string,'specification':character,'recipeHashes':inputs,'meshQa':qa,'sha256':a.sha(glb),'bytes':glb.stat().st_size,'blendSha256':a.sha(blend),'materials':sorted({m.name for o in root.children_recursive if o.type=='MESH' for m in o.data.materials}),'sockets':sorted(o['socket'] for o in root.children_recursive if 'socket' in o),'clips':['idle','walk','run','greet','special']}
    (out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
    for f in out.iterdir():
        if f.is_file():os.chmod(f,0o600)
    print('AUTHORED',character['id'],qa,flush=True)

def sweep(name,controls,mat,parent,sides=12):
    # Catmull-Rom centerline with tangent-aligned cross-sections, for curved tails.
    points=[]
    for j in range(len(controls)-1):
        p0=Vector(controls[max(0,j-1)][:3]);p1=Vector(controls[j][:3]);p2=Vector(controls[j+1][:3]);p3=Vector(controls[min(len(controls)-1,j+2)][:3])
        for k in range(6):
            t=k/6;v=.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)
            points.append((v,controls[j][3]*(1-t)+controls[j+1][3]*t))
    points.append((Vector(controls[-1][:3]),controls[-1][3]));verts=[]
    for j,(center,radius) in enumerate(points):
        direction=(points[min(j+1,len(points)-1)][0]-points[max(0,j-1)][0]).normalized()
        side=direction.cross(Vector((0,0,1)))
        if side.length<.01:side=direction.cross(Vector((0,1,0)))
        side.normalize();up=direction.cross(side).normalized()
        verts.extend(center+radius*(math.cos(i*math.tau/sides)*side+math.sin(i*math.tau/sides)*up) for i in range(sides))
    faces=[tuple(reversed(range(sides)))];faces.extend((j*sides+i,j*sides+(i+1)%sides,(j+1)*sides+(i+1)%sides,(j+1)*sides+i) for j in range(len(points)-1) for i in range(sides));faces.append(tuple(range((len(points)-1)*sides,len(points)*sides)))
    data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(data);bm.free()
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);return a.finish(obj,name,mat,parent)
