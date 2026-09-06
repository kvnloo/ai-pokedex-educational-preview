"""Reopen the saved source and GLB, check visible geometry, and render the import."""
import bpy
import bmesh
import json
from pathlib import Path
from mathutils import Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
output = root/'reopened'
report_path = root/'reopen.json'
assert not output.exists() and not report_path.exists()
output.mkdir()
working = bpy.context.scene
assert working.name == 'EDIT-charizard-whole-r06'
expected = json.loads((root/'export.json').read_text())
ids_before = set(bpy.data.user_map())

def inspect(scene):
    bpy.context.window.scene = scene
    bpy.context.view_layer.update()
    reports = []
    for obj in scene.objects:
        if obj.type != 'MESH' or obj.hide_render:
            continue
        evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        bm = bmesh.new()
        bm.from_mesh(mesh)
        points = [obj.matrix_world@v.co for v in mesh.vertices]
        reports.append({'object':obj.name,'vertices':len(mesh.vertices),'triangles':len(mesh.loop_triangles),'boundaryEdges':sum(e.is_boundary for e in bm.edges),'nonmanifoldEdges':sum(not e.is_manifold for e in bm.edges),'zeroAreaTriangles':sum(t.area<=1e-14 for t in mesh.loop_triangles),'bounds':[[min(v[i] for v in points),max(v[i] for v in points)] for i in range(3)]})
        bm.free()
        evaluated.to_mesh_clear()
    assert len(reports)==4
    assert sorted((r['vertices'],r['triangles']) for r in reports)==sorted((r['vertices'],r['triangles']) for r in expected['meshes'])
    for report in reports:
        assert report['boundaryEdges']==report['nonmanifoldEdges']==report['zeroAreaTriangles']==0
        candidates=[r for r in expected['meshes'] if (r['vertices'],r['triangles'])==(report['vertices'],report['triangles'])]
        error=min(max(abs(a-b) for axis_a,axis_b in zip(report['bounds'],candidate['bounds']) for a,b in zip(axis_a,axis_b)) for candidate in candidates)
        assert error<.000005
        report['maximumBoundsError']=error
    return reports

try:
    with bpy.data.libraries.load(str(root/'charizard-whole-r06-study.blend'),link=False) as (available,loaded):
        loaded.scenes=['EDIT-charizard-whole-r06']
    source = loaded.scenes[0]
    source.name = 'VERIFY-source-charizard-r06'
    source_report = inspect(source)
    imported = bpy.data.scenes.new('VERIFY-glb-charizard-r06')
    bpy.context.window.scene = imported
    bpy.ops.import_scene.gltf(filepath=str(root/'charizard-whole-r06-study.glb'))
    glb_report = inspect(imported)
    camera = working.camera.copy()
    camera.data = working.camera.data.copy()
    imported.collection.objects.link(camera)
    imported.camera = camera
    imported.world = working.world.copy()
    imported.render.engine = 'BLENDER_WORKBENCH'
    imported.render.resolution_x = imported.render.resolution_y = 720
    imported.render.resolution_percentage = 100
    imported.render.image_settings.file_format = 'PNG'
    shade = imported.display.shading
    shade.light = 'STUDIO'
    shade.studio_light = 'paint.sl'
    shade.color_type = 'VERTEX'
    shade.show_shadows = shade.show_cavity = False
    shade.background_type = 'WORLD'
    imported.world.color = (.055,.055,.055)
    origin=Vector((-.085,-.77,.49));side=Vector((-.8660254,.5,0));forward=Vector((-.49446818,-.856444,.14834046));up=Vector((.07417023,.12846661,.98893636))
    views={name:(origin,direction,.65,name in {'near','far'}) for name,direction in {'front':forward,'near':-side,'far':side,'threequarter':forward-side*.8+up*.3}.items()}
    views.update({name:(Vector((0,0,0)),Vector(direction),2.7,False) for name,direction in {'whole-front':(0,-3,.4),'whole-back':(0,3,.4),'whole-side':(3,0,.4),'whole-threequarter':(-2,-3,1.4)}.items()})
    for name,(target,direction,scale,clip) in views.items():
        camera.location=target+direction.normalized()*3
        camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
        camera.data.type='ORTHO';camera.data.ortho_scale=scale
        camera.data.clip_start=2.8 if clip else .01;camera.data.clip_end=3.2 if clip else 100
        imported.render.filepath=str(output/(name+'.png'))
        bpy.ops.render.render(write_still=True)
    report={'source':source_report,'glb':glb_report,'views':list(views),'status':'source-and-GLB-reopened; awaiting visual review','scope':'Counts, bounds, edge manifoldness and zero-area tessellation. No separate finiteness assertion, whole-character self-intersection, rig or quality acceptance.'}
    report_path.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'report':str(report_path),'meshes':len(glb_report),'vertices':sum(r['vertices'] for r in glb_report),'triangles':sum(r['triangles'] for r in glb_report),'views':list(views)}))
finally:
    bpy.context.window.scene=working
    created=set(bpy.data.user_map())-ids_before
    bpy.data.batch_remove(ids=created)
