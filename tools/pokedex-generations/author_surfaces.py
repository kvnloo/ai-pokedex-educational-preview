"""Author UVs and restrained PBR finishes without changing either board's color blocking."""
import bpy
import json
import math
import hashlib
from pathlib import Path
import surface_maps

def apply(scene,output):
    bpy.context.window.scene=scene
    output=Path(output);surface_maps.OUT=output;(output/'textures').mkdir(exist_ok=True)
    prefix=scene['candidateId']
    specs={'red':(.27 if scene['variant']=='board01' else .23,.016,910,False),
           'graphite':(.38,.014,911,False),'rubber':(.51,.025,912,False),
           'silver':(.26,.025,913,True),'steel':(.29,.016,914,True)}
    maps={key:surface_maps.finish_maps(prefix+'-'+key,*params) for key,params in specs.items()}
    bpy.ops.object.select_all(action='DESELECT')
    count=0
    for obj in scene.objects:
        if obj.type!='MESH':continue
        bpy.context.view_layer.objects.active=obj;obj.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.02)
        bpy.ops.object.mode_set(mode='OBJECT');obj.select_set(False);count+=1
        obj.data.uv_layers.active.name='UV0'
        if obj.get('replaceable_display'):
            vs=obj.data.vertices;lo=[min(v.co[i] for v in vs) for i in [0,1]];hi=[max(v.co[i] for v in vs) for i in [0,1]]
            for loop in obj.data.loops:
                co=vs[loop.vertex_index].co
                obj.data.uv_layers.active.data[loop.index].uv=((co.x-lo[0])/(hi[0]-lo[0]),(hi[1]-co.y)/(hi[1]-lo[1]))
    used={m for o in scene.objects if o.type in {'MESH','FONT','CURVE'} for m in o.data.materials if m}
    for mat in used:
        name=mat.name
        key=('red' if 'scarlet' in name else 'graphite' if any(s in name for s in ['graphite','obsidian','inner-support']) else 'rubber' if any(s in name for s in ['elastomer','button-return']) else 'silver' if 'satin-aluminum' in name else 'steel' if 'hinge-steel' in name else None)
        if not key:continue
        nodes=mat.node_tree.nodes;links=mat.node_tree.links;p=nodes['Principled BSDF']
        rough=nodes.new('ShaderNodeTexImage');rough.name='Finish.roughness';rough.image=maps[key][0];rough.location=(-600,0)
        norm=nodes.new('ShaderNodeTexImage');norm.name='Finish.normalTexture';norm.image=maps[key][1];norm.location=(-600,-240)
        normal=nodes.new('ShaderNodeNormalMap');normal.name='Finish.normal';normal.uv_map='UV0';normal.inputs['Strength'].default_value=.35;normal.location=(-300,-240)
        links.new(rough.outputs['Color'],p.inputs['Roughness']);links.new(norm.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],p.inputs['Normal'])
        mat['surface_recipe']=key;mat['texture_resolution']=512
    receipt={'uvMeshCount':count,'textures':[{'path':str(p.relative_to(output)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':[512,512]} for p in sorted((output/'textures').glob('*.png'))],
        'mapping':'UV0 projected islands for mechanical solids; explicit full-screen UV rectangle. Reusable microfinish maps, not unique baked paint atlases.',
        'display':'Editable, replaceable vector scanner placeholder. No reference-board image or copyrighted card image baked onto the mesh.'}
    (output/'surfaces.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({'candidate':prefix,'uvMeshes':count,'textures':len(receipt['textures'])}))
