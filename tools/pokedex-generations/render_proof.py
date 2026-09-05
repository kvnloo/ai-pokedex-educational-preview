"""Actual Blender photography and frame rendering from each frozen hero source."""
import bpy
import sys
import json
import math
import time
import hashlib
from pathlib import Path
from mathutils import Vector

def aim(obj,target):obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

def configure(scene):
    bpy.context.window.scene=scene
    for obj in list(scene.objects):
        if obj.type=='LIGHT':bpy.data.objects.remove(obj,do_unlink=True)
    world=bpy.data.worlds.new(scene.name+'-proof-world');world.use_nodes=True;scene.world=world
    bg=world.node_tree.nodes['Background'];bg.inputs['Color'].default_value=(.18,.21,.25,1);bg.inputs['Strength'].default_value=.12
    for name,loc,power,size,color in [
      ('key',(-.15,-.12,.25),.45,.11,(.94,.97,1)),
      ('edge',(.14,.13,.20),.65,.085,(1,.88,.78)),
      ('fill',(.14,-.15,.16),.09,.13,(.78,.90,1))]:
        light=bpy.data.lights.new(scene.name+'-'+name,'AREA');light.energy=power;light.shape='DISK';light.size=size;light.color=color
        obj=bpy.data.objects.new(light.name,light);scene.collection.objects.link(obj);obj.location=loc;aim(obj,(0,.02,.04))
    scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
    prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
    for device in prefs.devices:device.use=device.type=='OPTIX'
    scene.cycles.device='GPU';scene.render.use_persistent_data=True
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=True
    scene.render.resolution_percentage=100;scene.render.fps=30
    scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
    camera=scene.camera;camera.data.type='PERSP';camera.data.lens=58;camera.data.shift_x=0;camera.data.shift_y=0;camera.data.clip_start=.001
    return camera

def pose(scene,loc,target,frame=165,lens=58):
    scene.frame_set(frame);scene.camera.location=loc;scene.camera.data.lens=lens;aim(scene.camera,target);bpy.context.view_layer.update()

def stills(scene,output,views=None):
    output=Path(output);out=output/'renders';out.mkdir(exist_ok=True)
    configure(scene);scene.render.resolution_x=900;scene.render.resolution_y=1000
    shots={
      'front':((0,-.38,.17),(0,.035,.065),165,58),
      'back':((0,.40,.17),(0,.040,.065),165,58),
      'side':((.37,.030,.09),(0,.030,.060),165,58),
      'three-quarter':((.215,-.31,.275),(0,.030,.053),165,58),
      'closed':((.13,-.23,.31),(0,0,.010),1,68),
      'underside':((.10,-.18,-.27),(0,0,0),1,70),
      'hinge-closeup':((.11,-.10,.13),(0,.065,.013),165,95),
      'controls-closeup':((.10,-.16,.15),(0,-.018,.005),281,92),
      'port-closeup':((.05,-.16,.04),(0,-.067,0),1,110)}
    clay=bpy.data.materials.new(scene.name+'-clay');clay.use_nodes=True
    p=clay.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(.20,.23,.25,1);p.inputs['Roughness'].default_value=.65
    records=[]
    for name,(loc,target,frame,lens) in shots.items():
        if views and name not in views:continue
        pose(scene,loc,target,frame,lens)
        for finish in (['material','clay'] if name in {'front','back','side','three-quarter'} else ['material']):
            scene.view_layers[0].material_override=clay if finish=='clay' else None
            path=out/(name+'-'+finish+'.png');scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
            records.append({'view':name,'finish':finish,'frame':frame,'camera':loc,'target':target,'lens':lens,'path':str(path)})
    scene.view_layers[0].material_override=None
    (out/'cameras.json').write_text(json.dumps(records,indent=2)+'\n')
    print(json.dumps({'candidate':scene['candidateId'],'stills':len(records)}))

def video(scene,output,frames=None):
    output=Path(output);out=output/'video/frames';out.mkdir(parents=True,exist_ok=True)
    configure(scene);scene.cycles.samples=12;scene.render.resolution_x=576;scene.render.resolution_y=768
    pose(scene,(.215,-.31,.275),(0,.030,.053),1,58)
    scene.render.film_transparent=False
    identity={'source':bpy.data.filepath,'sourceSha256':hashlib.sha256(Path(bpy.data.filepath).read_bytes()).hexdigest(),'scriptSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'resolution':[576,768],'fps':30,'frames':[1,294],'samples':12,'engine':'CYCLES/OPTIX','camera':'fixed three-quarter; motion is the actual hinge, controls and power signals'}
    receipt=out.parent/'render-job.json'
    if receipt.exists() and json.loads(receipt.read_text())!=identity:raise RuntimeError('Frame directory belongs to another source or rendering recipe')
    receipt.write_text(json.dumps(identity,indent=2)+'\n');started=time.time()
    for frame in frames or range(1,295):
        path=out/f'frame-{frame:04d}.png'
        if path.exists():continue
        scene.frame_set(frame);scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
        (out.parent/'progress.json').write_text(json.dumps({'lastRenderedFrame':frame,'seconds':round(time.time()-started,2)}))
    print(json.dumps({'candidate':scene['candidateId'],'videoFrames':len(list(out.glob('frame-*.png')))}))

if __name__=='__main__':
    args=sys.argv[sys.argv.index('--')+1:];mode,output=args[:2]
    scene=bpy.context.scene
    if mode=='video':video(scene,output)
    elif mode=='stills':stills(scene,output)
    else:raise ValueError(mode)
