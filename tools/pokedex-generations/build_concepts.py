"""MCP entry point for reference-specific, isolated concept revisions."""
import bpy
import bmesh
import json
import math
import sys
import importlib
import importlib.util
from pathlib import Path
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

HERE=Path(__file__).resolve().parent
if str(HERE) not in sys.path:sys.path.insert(0,str(HERE))
import generation_geometry as g
import concept_layout
import refine_concepts
import detail_concepts
importlib.reload(g);importlib.reload(concept_layout);importlib.reload(refine_concepts)
importlib.reload(detail_concepts)
spec=importlib.util.spec_from_file_location('generation_reference_studio',HERE/'inherited-worker/studio.py')
studio=importlib.util.module_from_spec(spec);spec.loader.exec_module(studio)
CONTRACTS=json.loads((HERE/'inherited-worker/contract.json').read_text())
REFERENCES=json.loads((HERE/'inherited-worker/references.json').read_text())

def project_uvs(obj):
    mesh=obj.data
    layer=mesh.uv_layers.active or mesh.uv_layers.new(name='UV0')
    lo=[min(v.co[i] for v in mesh.vertices) for i in range(3)]
    size=[max(v.co[i] for v in mesh.vertices)-lo[i] for i in range(3)]
    for poly in mesh.polygons:
        dominant=max(range(3),key=lambda i:abs(poly.normal[i]))
        u,v=[i for i in range(3) if i!=dominant]
        for loop in poly.loop_indices:
            co=mesh.vertices[mesh.loops[loop].vertex_index].co
            layer.data[loop].uv=((co[u]-lo[u])/max(size[u],1e-8),(co[v]-lo[v])/max(size[v],1e-8))

def measure(scene):
    rows=[];depsgraph=bpy.context.evaluated_depsgraph_get()
    for obj in scene.objects:
        if obj.type not in {'MESH','CURVE','FONT'}:continue
        evaluated=obj.evaluated_get(depsgraph);mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
        collapsed=sum((mesh.vertices[t.vertices[1]].co-mesh.vertices[t.vertices[0]].co).cross(mesh.vertices[t.vertices[2]].co-mesh.vertices[t.vertices[0]].co).length_squared<1e-30 for t in mesh.loop_triangles)
        bm=bmesh.new();bm.from_mesh(mesh)
        rows.append({'name':obj.get('source_name',obj.name),'type':obj.type,'triangles':len(mesh.loop_triangles),'collapsed':collapsed,'nonManifoldEdges':sum(not e.is_manifold for e in bm.edges),'uvLayers':len(mesh.uv_layers)})
        bm.free();evaluated.to_mesh_clear()
    return {'objects':rows,'triangles':sum(r['triangles'] for r in rows),'collapsedTriangles':sum(r['collapsed'] for r in rows),'mechanicalNonManifold':[r for r in rows if r['type']=='MESH' and r['nonManifoldEdges']]}

def build(variant,revision='r01',render=False):
    version='v002' if variant=='board01' else 'v003'
    output=Path('/mnt/zer0models/pokemon-iac/devices/pokedex')/version/('astra-'+revision)
    if (output/(version+'-'+revision+'-static.blend')).exists():
        raise FileExistsError('Preserve existing candidates; increment the revision: '+str(output))
    output.mkdir(parents=True,exist_ok=True)
    scene=bpy.data.scenes.new('ASTRA-'+version+'-'+revision)
    bpy.context.window.scene=scene
    scene.world=bpy.data.worlds.new(scene.name+'-world')
    scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
    g.prefix=version+'/'+revision+'/';g.objects_by_name.clear()
    c=CONTRACTS[variant];objects=concept_layout.build(variant,c)
    refine_concepts.refine(variant,c,objects)
    detail_concepts.detail(variant,c,objects)
    for obj in scene.objects:
        if obj.type=='MESH':project_uvs(obj)
    studio.setup();scene.cycles.samples=24
    scene['candidateId']=version+'-'+revision;scene['referenceBoard']=REFERENCES[variant]['source']
    scene['variant']=variant;scene['contract']=json.dumps(c);scene['stage']='root-static-review'
    for view in ['closed','open']:
        objects['lid'].rotation_euler.x=0 if view=='closed' else math.radians(-c['angle'])
        ref=REFERENCES[variant][view];crop=ref['crop'];width,height=crop[2]-crop[0],crop[3]-crop[1]
        studio.camera(scene,c['cameras'][view],width,height,2)
        bpy.context.view_layer.update()
        if render:
            scene.render.filepath=str(output/(view+'-matched.png'));bpy.ops.render.render(write_still=True)
        points={}
        for key,logical in {'lock':'GEO-lock-surround','camera':'GEO-camera-bezel','ring':'GEO-control-ring-seat','button':'PDX.ButtonPress'}.items():
            obj=g.objects_by_name[logical];co=world_to_camera_view(scene,scene.camera,obj.matrix_world.translation)
            points[key]=[co.x*width,(1-co.y)*height]
        (output/(view+'-landmarks.json')).write_text(json.dumps(points,indent=2)+'\n')
    report=measure(scene);report['reference']=REFERENCES[variant];report['scene']=scene.name
    (output/'geometry.json').write_text(json.dumps(report,indent=2)+'\n')
    source=output/(version+'-'+revision+'-static.blend')
    bpy.data.libraries.write(str(source),{scene},fake_user=True,compress=True)
    print(json.dumps({'candidate':version+'-'+revision,'source':str(source),'scene':scene.name,'triangles':report['triangles'],'collapsed':report['collapsedTriangles'],'nonManifoldMechanical':report['mechanicalNonManifold']}))
    return scene,objects,output
