"""Save editable r06 source and bake four visible meshes into a static review GLB."""
import bpy
import bmesh
import hashlib
import json
import math
from pathlib import Path

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-whole-r06' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
source_path = root/'charizard-whole-r06-study.blend'
glb_path = root/'charizard-whole-r06-study.glb'
report_path = root/'export.json'
assert not any(p.exists() for p in [source_path,glb_path,report_path])
assert 'EXPORT-charizard-whole-r06' not in bpy.data.scenes
names = ['GEO-charizard-neck-bridge-r06','GEO-charizard-eye--1-whole-r06','GEO-charizard-eye-1-whole-r06','GEO-charizard-flame-whole-r06']
assert all(not bpy.data.objects[name].hide_render for name in names)
bpy.data.libraries.write(str(source_path), {scene}, fake_user=True, compress=True)
graph = bpy.context.evaluated_depsgraph_get()
export_scene = bpy.data.scenes.new('EXPORT-charizard-whole-r06')
reports = []
for name in names:
    original = bpy.data.objects[name]
    evaluated = original.evaluated_get(graph)
    mesh = bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=graph)
    obj = bpy.data.objects.new(name.replace('GEO-','EXPORT-'),mesh)
    obj.matrix_world = original.matrix_world.copy()
    export_scene.collection.objects.link(obj)
    mesh.calc_loop_triangles()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    coordinates = [obj.matrix_world@v.co for v in mesh.vertices]
    report = {'object':obj.name,'vertices':len(mesh.vertices),'polygons':len(mesh.polygons),'triangles':len(mesh.loop_triangles),'boundaryEdges':sum(e.is_boundary for e in bm.edges),'nonmanifoldEdges':sum(not e.is_manifold for e in bm.edges),'zeroAreaTriangles':sum(t.area<=1e-14 for t in mesh.loop_triangles),'finite':all(math.isfinite(x) for v in coordinates for x in v),'bounds':[[min(v[i] for v in coordinates),max(v[i] for v in coordinates)] for i in range(3)],'colorAttributes':[a.name for a in mesh.color_attributes]}
    bm.free()
    assert report['boundaryEdges']==report['nonmanifoldEdges']==report['zeroAreaTriangles']==0
    assert report['finite']
    reports.append(report)
bpy.context.window.scene = export_scene
bpy.ops.export_scene.gltf(filepath=str(glb_path),export_format='GLB',use_active_scene=True,export_cameras=False,export_lights=False,export_animations=False,export_morph=False,export_vertex_color='ACTIVE',export_active_vertex_color_when_no_material=True)
bpy.context.window.scene = scene
artifacts=[]
for path in [source_path,glb_path]:
    artifacts.append({'path':str(path),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
report = {'status':'study-only; not promoted','artifacts':artifacts,'meshes':reports,'vertices':sum(r['vertices'] for r in reports),'triangles':sum(r['triangles'] for r in reports),'exportScene':export_scene.name,'animationClips':[],'textureImages':[],'morphs':'Baked into static runtime geometry. Editable keys remain in source blend.','knownLimitations':['Eye gaze and lids unfinished','Straight mouth seam, inflated nose and hanging jaw remain','Horn proportions and anatomical neck shaping incomplete','No UV/PBR, rig, clips, attacks or game integration','Self-intersections and deformation quality not certified','High triangle count; no LOD pass']}
report_path.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
