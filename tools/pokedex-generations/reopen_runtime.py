"""Reopen actual binary exports and sample every clip, including held states."""
import bpy
import json
import math
import hashlib
from pathlib import Path
import numpy as np

def runtime_name(name):return 'L0_RT_'+name.replace('.','_').replace('-','_').replace('/','_')

def activate(scene,clip,seconds):
    for obj in scene.objects:
        if not obj.animation_data:continue
        obj.animation_data.action=None
        for track in obj.animation_data.nla_tracks:track.mute=track.name!=clip
    scene.frame_set(1+round(seconds*30));bpy.context.view_layer.update()
    signals={o.get('runtime_node_name',runtime_name(o['source_name'])):o for o in scene.objects if o.get('source_name')}
    for mat in {m for o in scene.objects if o.type=='MESH' for m in o.data.materials if m}:
        if 'power_signal' not in mat:continue
        signal=signals[mat['power_signal']]
        shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        shader.inputs['Emission Strength'].default_value=mat['max_emission']*max(0,min(1,signal.location.x))

def inspect(version,revision,output=None):
    candidate=version+'-'+revision;out=Path(output) if output else Path('/mnt/zer0models/pokemon-iac/devices/pokedex')/version/('astra-'+revision)
    path=out/'runtime'/(candidate+'-lod0.glb');contract=json.loads((out/'animation-contract.json').read_text())
    scene=bpy.data.scenes.new('REOPEN-'+candidate+('-q2' if output else ''));bpy.context.window.scene=scene;scene.render.fps=30
    bpy.ops.import_scene.gltf(filepath=str(path))
    scene['candidateId']=candidate;scene['stage']='actual GLB reopen'
    objects={o.get('source_name'):o for o in scene.objects if o.get('source_name')}
    lid=objects[contract['hinge']['node']];button=objects[contract['button']['node']]
    ring=next(o for k,o in objects.items() if k.endswith('/SIG_RingPower'))
    screen=next(o for k,o in objects.items() if k.endswith('/SIG_ScreenPower'))
    samples=[]
    for clip in contract['clips']:
        duration=clip['durationSeconds']
        times=sorted(set([0,duration/2,duration]+([1/3] if clip['name']=='ButtonPress' else [])))
        for seconds in times:
            activate(scene,clip['name'],seconds)
            world=[o.matrix_world@v.co for o in scene.objects if o.type=='MESH' for v in o.data.vertices]
            lo=[min(v[i] for v in world) for i in range(3)];hi=[max(v[i] for v in world) for i in range(3)]
            rotation=lid.rotation_quaternion.to_euler('XYZ') if lid.rotation_mode=='QUATERNION' else lid.rotation_euler
            samples.append({'clip':clip['name'],'seconds':seconds,'hingeDegrees':math.degrees(rotation.x),'buttonZ':button.location.z,'ringPower':ring.location.x,'screenPower':screen.location.x,'boundsMeters':[lo,hi],'extentMeters':[hi[i]-lo[i] for i in range(3)],'finiteTransforms':all(np.isfinite(np.asarray(o.matrix_world)).all() for o in scene.objects)})
    meshes=[]
    for o in scene.objects:
        if o.type!='MESH':continue
        mesh=o.data;mesh.calc_loop_triangles();v=np.array([v.co[:] for v in mesh.vertices],dtype=float)
        tri=v[np.array([tuple(t.vertices) for t in mesh.loop_triangles])]
        area=np.linalg.norm(np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]),axis=1)
        meshes.append({'name':o.name,'triangles':len(tri),'zeroAreaTriangles':int((area==0).sum()),'uvLayers':len(mesh.uv_layers),'finiteVertices':bool(np.isfinite(v).all())})
    lookup=lambda name,t:next(s for s in samples if s['clip']==name and abs(s['seconds']-t)<1e-6)
    rest=lookup('Closed',0)['buttonZ'];pressed=lookup('ButtonPress',1/3)['buttonZ']
    checks={'meshData':all(m['finiteVertices'] and m['uvLayers']>0 and m['zeroAreaTriangles']==0 for m in meshes),
        'finiteTransforms':all(s['finiteTransforms'] for s in samples),
        'physicalBounds':all(s['extentMeters'][0]<.12 and max(s['extentMeters'])<.30 for s in samples),
        'closedThickness':lookup('Closed',0)['extentMeters'][2]<.035,
        'closedHinge':abs(lookup('Closed',0)['hingeDegrees'])<.02,
        'openedHinge':abs(lookup('Opening',2)['hingeDegrees']-contract['hinge']['readyDegrees'])<.02,
        'buttonTravel':abs(rest-pressed-.00055)<1e-6,
        'screenWakes':lookup('Closed',0)['screenPower']==0 and lookup('BootUp',2.5)['screenPower']>.99,
        'idleBreathes':abs(lookup('Idle',0)['ringPower']-lookup('Idle',1.5)['ringPower'])>.1}
    result={'candidate':candidate,'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'samples':samples,'meshes':meshes,'checks':checks,'passed':all(checks.values())}
    (out/'runtime/reopened.json').write_text(json.dumps(result,indent=2)+'\n')
    activate(scene,'Ready',.5)
    bpy.data.libraries.write(str(out/(candidate+'-reopened.blend')),{scene},fake_user=True,compress=True)
    print(json.dumps({'candidate':candidate,'checks':checks,'triangles':sum(m['triangles'] for m in meshes),'pressedTravel':rest-pressed}))
    return result
