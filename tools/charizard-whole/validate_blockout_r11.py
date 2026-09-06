"""Checkpoint coarse construction data and validate the actual reopened GLB."""
import bpy
import bmesh
import json
from pathlib import Path
from mathutils import Vector

root=Path(globals().get('artifact_root','/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r11'))
scene=bpy.context.scene
checkpoint=globals().get('checkpoint','r11d')
assert checkpoint in {'r11d','r11e','r12c','r13f','r13h','r13i'}
assert scene.name=='EDIT-charizard-coarse-r11' and len(bpy.data.scenes)==1
expected_source={'r11d':'charizard-blockout-r11d-review.blend','r11e':'charizard-blockout-r11e-flame-contract.blend','r12c':'charizard-hybrid-r12c.blend','r13f':'charizard-hybrid-r13f-socket-cage.blend','r13h':'charizard-hybrid-r13h-head-turn.blend','r13i':'charizard-hybrid-r13i-head-turn.blend'}[checkpoint]
assert Path(bpy.data.filepath).name==expected_source
geometry=[o for o in scene.objects if o.type=='MESH' and not o.hide_render]
socket=scene.objects['FlameSocket']
assert socket.type=='EMPTY' and socket.data is None and not socket.children
if checkpoint in {'r11e','r12c','r13f','r13h','r13i'}:
    assert socket.empty_display_size<=0.05
assert socket.parent==scene.objects['GEO-r11-tail']
assert socket.get('energyBaked') is False
for obj in geometry:
    assert obj.get('energyBaked') is False
    assert not any(word in obj.name.lower() for word in ('flame','fire','glow','plasma')),obj.name
stats=[]
graph=bpy.context.evaluated_depsgraph_get()
for obj in geometry:
    evaluated=obj.evaluated_get(graph)
    mesh=evaluated.to_mesh(); mesh.calc_loop_triangles()
    bm=bmesh.new(); bm.from_mesh(mesh)
    boundary=sum(e.is_boundary for e in bm.edges)
    nonmanifold=sum(not e.is_manifold for e in bm.edges)
    degenerate=sum(t.area<1e-14 for t in mesh.loop_triangles)
    assert nonmanifold==0 and degenerate==0,(obj.name,nonmanifold,degenerate)
    points=[obj.matrix_world @ v.co for v in mesh.vertices]
    bounds=[[min(p[i] for p in points),max(p[i] for p in points)] for i in range(3)]
    stats.append({'name':obj.name,'component':obj['component'],'controlVertices':len(obj.data.vertices),
        'evaluatedVertices':len(mesh.vertices),'triangles':len(mesh.loop_triangles),
        'bounds':bounds,'nonmanifoldEdges':nonmanifold,'degenerateTriangles':degenerate})
    bm.free(); evaluated.to_mesh_clear()
for obj in scene.objects:obj.select_set(obj in geometry or obj==socket)
glb=root/('charizard-blockout-'+checkpoint+'.glb')
assert not glb.exists()
bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,
    use_active_scene=True,export_extras=True,export_animations=False,export_apply=True)
validation=bpy.data.scenes.new('VALIDATION-r11d')
bpy.context.window.scene=validation
bpy.ops.import_scene.gltf(filepath=str(glb),merge_vertices=True)
imported=[o for o in validation.objects if o.type=='MESH']
assert len(imported)==len(geometry)
for obj in imported:
    original=next(s for s in stats if obj.name.startswith(s['name']+'.') or obj.name==s['name'])
    obj.data.calc_loop_triangles()
    assert len(obj.data.loop_triangles)==original['triangles']
    points=[obj.matrix_world @ v.co for v in obj.data.vertices]
    bounds=[[min(p[i] for p in points),max(p[i] for p in points)] for i in range(3)]
    assert max(abs(bounds[i][j]-original['bounds'][i][j]) for i in range(3) for j in range(2))<1e-5
    assert obj.get('energyBaked') is False
tip=next(o for o in validation.objects if o.get('effect')=='charizard-tail-flame')
assert tip.parent.name.startswith('GEO-r11-tail') and tip.get('energyBaked') is False
assert (tip.matrix_world.translation-socket.matrix_world.translation).length<1e-5
assert tip.matrix_world.to_quaternion().rotation_difference(socket.matrix_world.to_quaternion()).angle<1e-5
head=next(s for s in stats if s['name']=='GEO-r11-head-block')
body=next(s for s in stats if s['name']=='GEO-r11-body-pear')
wings=[s for s in stats if s['component'] in {'wing-membranes','wing-spars'}]
span=max(s['bounds'][0][1] for s in wings)-min(s['bounds'][0][0] for s in wings)
width=lambda s:s['bounds'][0][1]-s['bounds'][0][0]
report={'source':bpy.data.filepath,'sourceReopened':True,'glb':str(glb),'glbReopened':True,
    'meshCount':len(imported),'controlVertices':sum(s['controlVertices'] for s in stats),
    'evaluatedTriangles':sum(s['triangles'] for s in stats),'parts':stats,
    'ratios':{'wingSpan':span,'abdomenWidth':width(body),'headWorldWidth':width(head),
        'wingSpanToAbdomenWidth':span/width(body),'abdomenToHeadWorldWidth':width(body)/width(head)},
    'referenceRatioLimit':'Head is posed; world width is not an anatomical head-width measurement or a calibrated reference score.',
    'socketVerified':True,'textures':0,'uvLayers':0,'animations':[],
    'physicalEnergyBaked':False,'socketContainsGeometry':False,
    'intentionalConstructionOverlaps':True,'intersectionsPassed':False,
    'visualGatePassed':False,'productionAccepted':False,'publication':False}
(root/('validation-'+checkpoint+'.json')).write_text(json.dumps(report,indent=2)+'\n')
bpy.context.window.scene=scene
for obj in list(validation.objects):
    data=obj.data if obj.type=='MESH' else None
    bpy.data.objects.remove(obj,do_unlink=True)
    if data and data.users==0:bpy.data.meshes.remove(data)
bpy.data.scenes.remove(validation)
print(json.dumps({k:v for k,v in report.items() if k!='parts'}))
