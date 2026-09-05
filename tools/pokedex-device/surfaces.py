"""Deterministic authored PBR microfinish maps and UVs, shared by hero and runtime."""
import bpy,math,json,hashlib
import numpy as np
from pathlib import Path
from materials import material

OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v001')

def image(name,pixels):
    height,width,_=pixels.shape
    im=bpy.data.images.new(name,width=width,height=height,alpha=True)
    im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(pixels.astype(np.float32).ravel())
    im.filepath_raw=str(OUT/'textures'/(name+'.png'));im.file_format='PNG';im.save();im.pack()
    return im

def finish_maps(name,roughness,amplitude,seed,brushed=False):
    rng=np.random.default_rng(seed);size=512
    noise=rng.normal(0,1,(size,size))
    fy=np.fft.fftfreq(size)[:,None];fx=np.fft.fftfreq(size)[None,:]
    kernel=np.exp(-2*math.pi**2*(fx**2*(.7 if brushed else .9)**2+fy**2*(7 if brushed else .9)**2))
    field=np.fft.ifft2(np.fft.fft2(noise)*kernel).real;field/=max(field.std(),1e-9)
    field=np.clip(field,-2.5,2.5)/2.5
    rgba=np.ones((size,size,4));rgba[:,:,:3]=(roughness+field*amplitude)[:,:,None]
    rough=image('pdx-'+name+'-roughness',rgba)
    dx=(np.roll(field,-1,1)-np.roll(field,1,1))*.018
    dy=(np.roll(field,-1,0)-np.roll(field,1,0))*.018
    normal=np.stack([-dx,-dy,np.ones_like(dx)],axis=-1);normal/=np.linalg.norm(normal,axis=-1)[:,:,None]
    rgba[:,:,:3]=normal*.5+.5
    return rough,image('pdx-'+name+'-normal',rgba)

def apply(scene):
    (OUT/'textures').mkdir(exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT');seen=set()
    for obj in scene.objects:
        if obj.type!='MESH' or obj.name.startswith('STUDIO.') or obj.data.as_pointer() in seen:continue
        seen.add(obj.data.as_pointer());bpy.context.view_layer.objects.active=obj;obj.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.025,area_weight=.15,correct_aspect=True,scale_to_bounds=True)
        bpy.ops.object.mode_set(mode='OBJECT');obj.select_set(False)
        obj.data.uv_layers.active.name='UV0'
    # Explicit display UV rectangle makes the replaceable screen easy to bind.
    screen=scene.objects['GEO-PDX.display-surface'];uv=screen.data.uv_layers.active.data
    for poly in screen.data.polygons:
        for loop in poly.loop_indices:
            vertex=screen.data.vertices[screen.data.loops[loop].vertex_index].co
            uv[loop].uv=((vertex.x+.04235)/.0847,(-vertex.y-.02355)/.1149)
    specs={'red':(.27,.016,910,False),'graphite':(.38,.014,911,False),'silicone':(.49,.025,912,False),'aluminum':(.27,.025,913,True),'steel':(.30,.016,914,True)}
    maps={name:finish_maps(name,*params) for name,params in specs.items()}
    used={mat for obj in scene.objects if obj.type in {'MESH','FONT'} for mat in obj.data.materials if mat and mat.name.startswith('MAT-PDX')}
    for mat in used:
        key=('red' if any(n in mat.name for n in ['ceramic-red','crimson-trim']) else 'graphite' if 'graphite-chassis' in mat.name else 'silicone' if 'silicone-controls' in mat.name else 'aluminum' if 'brushed-aluminum' in mat.name else 'steel' if 'blackened-steel' in mat.name else None)
        if key is None:continue
        nodes=mat.node_tree.nodes;links=mat.node_tree.links;p=nodes['Principled BSDF']
        for node in list(nodes):
            if node.name.startswith('PDX.Micro'):nodes.remove(node)
        rough=nodes.new('ShaderNodeTexImage');rough.name='PDX.MicroRoughness';rough.image=maps[key][0];rough.location=(-600,0)
        norm=nodes.new('ShaderNodeTexImage');norm.name='PDX.MicroNormalTexture';norm.image=maps[key][1];norm.location=(-600,-250)
        normal=nodes.new('ShaderNodeNormalMap');normal.name='PDX.MicroNormal';normal.uv_map='UV0';normal.inputs['Strength'].default_value=.4;normal.location=(-300,-250)
        links.new(rough.outputs['Color'],p.inputs['Roughness']);links.new(norm.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],p.inputs['Normal'])
        mat['surface_recipe']=key;mat['map_resolution']=512;mat['finish_intent']='New premium hardware; restrained microfinish, no random wear or dirt.'
    lens=scene.objects['GEO-PDX.camera-optics']
    optical=material('coated-camera-lens',(.006,.012,.019),.18,metallic=.3,coat=.25,transmission=0)
    optical.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=.25
    lens.data.materials.clear();lens.data.materials.append(optical)
    receipt={'stage':'UV-PBR-authored','uniqueMeshUVLayouts':len(seen),'textures':[{'path':str(p.relative_to(OUT)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':[512,512],'colorspace':'Non-Color'} for p in sorted((OUT/'textures').glob('*.png'))],'mapping':'Smart-projected per-object UV0 with shared linked geometry; display has explicit full-rectangle replaceable UVs. Tiled microfinish maps intentionally reusable rather than unique paint atlases.','displayContent':'Editable original vector placeholder groups; runtime can replace screen material and hide placeholders.'}
    (OUT/'source/surface-contract.json').write_text(json.dumps(receipt,indent=2))
    scene.frame_set(165)
    bpy.data.libraries.write(str(OUT/'source/pokedex-v001-m3-hero-r06.blend'),{scene},fake_user=True)
    print(json.dumps(receipt))

if __name__=='__main__':apply(bpy.context.scene)
