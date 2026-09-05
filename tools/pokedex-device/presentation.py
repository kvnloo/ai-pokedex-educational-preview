"""Repeatable neutral asset photography; execute in the authored Blender scene."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector

OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v001/renders')

def aim(obj,target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

def setup(scene):
    collection=next(c for c in scene.collection.children if c.name.startswith('PDX.Presentation'))
    for obj in list(collection.objects):
        bpy.data.objects.remove(obj,do_unlink=True)
    world=bpy.data.worlds.new('PDX.NeutralStudio');world.use_nodes=True
    world.node_tree.nodes['Background'].inputs['Color'].default_value=(.16,.19,.22,1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value=.08
    scene.world=world
    mesh=bpy.data.meshes.new('PDX.studio-floor.mesh')
    mesh.from_pydata([(-20,-20,-.00125),(20,-20,-.00125),(20,20,-.00125),(-20,20,-.00125)],[],[(0,1,2,3)])
    floor=bpy.data.objects.new('STUDIO.floor',mesh);collection.objects.link(floor)
    mat=bpy.data.materials.new('STUDIO.neutral-grey');mat.diffuse_color=(.075,.085,.095,1);mat.use_nodes=True
    mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.075,.085,.095,1)
    mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.52
    floor.data.materials.append(mat)
    for name,xyz,power,size,color in [
        ('key',(-.25,-.22,.42),1.8,.28,(.84,.92,1)),
        ('rim',(.20,.15,.34),2.5,.22,(1,.87,.72)),
        ('fill',(.32,-.30,.18),.7,.25,(.72,.85,1)),
    ]:
        light=bpy.data.lights.new('STUDIO.'+name,'AREA');light.energy=power;light.shape='DISK';light.size=size;light.color=color
        obj=bpy.data.objects.new(light.name,light);collection.objects.link(obj);obj.location=xyz;aim(obj,(0,-.05,.065))
    cam=bpy.data.cameras.new('STUDIO.asset-camera');cam.lens=58;cam.clip_start=.001;cam.clip_end=100
    obj=bpy.data.objects.new(cam.name,cam);collection.objects.link(obj);scene.camera=obj
    scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
    try:
        prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
        for device in prefs.devices:device.use=device.type!='CPU'
        scene.cycles.device='GPU'
    except Exception:scene.cycles.device='CPU'
    scene.render.resolution_x=1024;scene.render.resolution_y=1024;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
    scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
    return obj

def render(scene,name,xyz,target,closed=False):
    lid=next(o for o in scene.objects if o.name.startswith('PDX.LidHinge'))
    lid.rotation_euler.x=0 if closed else math.radians(-112)
    scene.camera.location=xyz;aim(scene.camera,target)
    scene.render.filepath=str(OUT/(name+'.png'));bpy.context.view_layer.update()
    bpy.ops.render.render(write_still=True)
    print(json.dumps({'render':scene.render.filepath,'lid_degrees':math.degrees(lid.rotation_euler.x)}))

if __name__=='__main__':
    scene=bpy.context.scene;setup(scene)
    render(scene,'r01-open-three-quarter',(.265,-.38,.29),(0,-.04,.074))
