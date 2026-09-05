"""Derive optimized runtime scenes without changing the editable hero source."""
import bpy,bmesh,json,math,hashlib
from pathlib import Path
from mathutils.bvhtree import BVHTree
from mathutils import Vector

OUT=None

def runtime_name(name):return 'RT_'+name.replace('.','_').replace('-','_').replace('/','_')

def clean_scene(name):
    scene=bpy.data.scenes.get(name)
    if scene:
        for obj in list(scene.objects):
            if len(obj.users_scene)==1:bpy.data.objects.remove(obj,do_unlink=True)
        bpy.data.scenes.remove(scene)

def triangles(mesh):mesh.calc_loop_triangles();return len(mesh.loop_triangles)

def prepare_surface(obj):
    """Validate reduced meshes and regenerate UVs after geometric reduction."""
    mesh=obj.data;mesh.validate(clean_customdata=True)
    bpy.context.view_layer.objects.active=obj
    mod=obj.modifiers.new('Explicit runtime triangles','TRIANGULATE')
    if hasattr(mod,'keep_custom_normals'):mod.keep_custom_normals=True
    bpy.ops.object.modifier_apply(modifier=mod.name)
    mesh.validate(clean_customdata=True)
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
    if not obj.get('replaceable_display'):
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.02)
        bpy.ops.object.mode_set(mode='OBJECT')
    for uv in list(mesh.uv_layers)[1:]:mesh.uv_layers.remove(uv)
    mesh.uv_layers.active.name='UV0'
    obj.select_set(False)

def optimize(obj,ratio,tolerance):
    if obj.type!='MESH' or triangles(obj.data)<80:return {'ratio':1,'maxSampledDeviationMm':0}
    original=obj.data.copy();verts=[v.co.copy() for v in original.vertices]
    factors=[];factor=ratio
    while factor<1:
        factors.append(factor);factor*=1.7
    for factor in factors+[1]:
        obj.data=original.copy()
        if factor<1:
            mod=obj.modifiers.new('Runtime geometric reduction','DECIMATE');mod.ratio=factor;mod.use_collapse_triangulate=True
            bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
        bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-8);bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=1e-8)
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
        tree=BVHTree.FromPolygons([v.co for v in obj.data.vertices],[tuple(p.vertices) for p in obj.data.polygons])
        # Sample every original vertex: deterministic geometry preservation bound at the vertices.
        deviation=max((tree.find_nearest(v)[3] for v in verts),default=0)
        if deviation<=tolerance:return {'ratio':factor,'maxSampledDeviationMm':deviation*1000}
    raise RuntimeError('Unable to preserve source geometry: '+obj.name)

def derive(source,output,level=0):
    global OUT
    OUT=Path(output)
    candidate=source['candidateId']
    name=f'{candidate}-runtime-LOD{level}'
    if bpy.data.scenes.get(name):raise RuntimeError('Runtime scene already exists: '+name)
    if (OUT/'runtime'/f'{candidate}-lod{level}.glb').exists():raise FileExistsError('Preserve existing export; increment candidate revision')
    scene=bpy.data.scenes.new(name);scene.render.fps=30;scene.frame_start=1;scene.frame_end=295
    collection=bpy.data.collections.new(name);scene.collection.children.link(collection)
    graph=bpy.context.evaluated_depsgraph_get();mapping={};material_cache={};geometry_cache={}
    for original in source.objects:
        if original.name.startswith('STUDIO.') or original.type not in {'MESH','FONT','CURVE','EMPTY'}:continue
        obj=original.copy();obj.name=f'L{level}_'+runtime_name(original.name);obj['source_name']=original.name
        collection.objects.link(obj);mapping[original]=obj
        if original.type in {'MESH','FONT','CURVE'}:
            data=bpy.data.meshes.new_from_object(original.evaluated_get(graph),preserve_all_data_layers=True,depsgraph=graph)
            if original.type in {'FONT','CURVE'}:
                replacement=bpy.data.objects.new(obj.name+'_mesh',data);replacement.name=obj.name
                replacement.location=obj.location;replacement.rotation_euler=obj.rotation_euler;replacement.scale=obj.scale
                replacement['source_name']=original.name;collection.objects.link(replacement)
                bpy.data.objects.remove(obj,do_unlink=True);obj=replacement;obj.name=f'L{level}_'+runtime_name(original.name);mapping[original]=obj
            else:obj.data=data
            for i,mat in enumerate(list(obj.data.materials)):
                if not mat:continue
                if mat not in material_cache:
                    copy=mat.copy();copy.name=f'L{level}_'+mat.name;copy.node_tree.animation_data_clear()
                    if 'power_signal' in mat:
                        copy['power_signal']=f'L{level}_'+runtime_name(mat['power_signal'])
                        copy.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value=mat['max_emission']
                    material_cache[mat]=copy
                obj.data.materials[i]=material_cache[mat]
            obj.modifiers.clear()
    for original,obj in mapping.items():obj.parent=mapping.get(original.parent)
    bpy.context.window.scene=scene;scene.frame_set(165);bpy.ops.object.select_all(action='DESELECT')
    reductions=[];ratio,tolerance=[(.26,.00015),(.095,.0004),(.026,.0009)][level]
    for original,obj in mapping.items():
        if obj.type!='MESH':continue
        if not obj.data.uv_layers:
            bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.025);bpy.ops.object.mode_set(mode='OBJECT');obj.select_set(False)
            obj.data.uv_layers.active.name='UV0'
        reduction=optimize(obj,ratio,tolerance if original.type!='FONT' else [.000025,.00006,.0001][level])
        reductions.append({'source':original.name,'triangles':triangles(obj.data),**reduction})
    # Join stationary pieces sharing a direct mechanical parent and a material.
    # Physical pivots, display glass/surface and every animated object remain distinct.
    groups={}
    for obj in list(scene.objects):
        if obj.type!='MESH' or obj.animation_data or len(obj.data.materials)!=1 or obj.get('replaceable_display') or obj.get('source_name','').endswith('GEO-display-glass'):continue
        groups.setdefault((obj.parent,obj.data.materials[0]),[]).append(obj)
    for (parent,mat),objects in groups.items():
        if len(objects)<2:continue
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:obj.select_set(True)
        active=objects[0];parts=[o.get('source_name',o.name) for o in objects]
        bpy.context.view_layer.objects.active=active;bpy.ops.object.join()
        active.name=f'L{level}_MERGED_'+(parent.name.removeprefix(f'L{level}_') if parent else 'Root')+'_'+mat.name.split('MAT-PDX-')[-1]
        active['source_parts']=parts
    for obj in scene.objects:
        if obj.type=='MESH':prepare_surface(obj)
    bpy.ops.object.select_all(action='SELECT')
    # Only this isolated runtime scene is eligible for export.
    path=OUT/'runtime'/f'{candidate}-lod{level}.glb';path.parent.mkdir(exist_ok=True)
    # Blender produces zero tangent vectors on some microscopic bevel faces.
    # Leave this optional attribute absent: the runtime derives its basis from
    # normals/UVs. These are reusable microfinish maps, not tangent-space bakes.
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=False,export_extras=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_anim_slide_to_zero=True,export_frame_range=False,export_force_sampling=True,export_frame_step=1,export_pointer_animation=False,export_convert_animation_pointer=False,export_optimize_animation_keep_anim_object=True,export_normals=True,export_tangents=False,export_materials='EXPORT')
    report={'level':level,'path':str(path),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'triangles':sum(triangles(o.data) for o in scene.objects if o.type=='MESH'),'meshObjects':sum(o.type=='MESH' for o in scene.objects),'materials':len(material_cache),'reductions':reductions,'deviationMethod':'Maximum original-vertex distance to reduced surface in local coordinates. Not an exhaustive Hausdorff bound; visual inspection also required.','namingPrefix':f'L{level}_RT_','sourceScene':source.name,'candidate':candidate}
    (OUT/'runtime'/f'lod{level}-report.json').write_text(json.dumps(report,indent=2))
    bpy.data.libraries.write(str(OUT/f'{candidate}-lod{level}.blend'),{scene},fake_user=True)
    bpy.context.window.scene=source
    print(json.dumps({k:v for k,v in report.items() if k!='reductions'}))
    return scene,report


