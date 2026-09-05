"""Headless final-frame and video rendering from the saved animated artifact."""
import bpy,sys,json,math,argparse
from pathlib import Path
HERE=Path(__file__).resolve().parent;sys.path.insert(0,str(HERE))
from studio import camera
p=argparse.ArgumentParser();p.add_argument('--variant',required=True);p.add_argument('--mode',choices=['stills','preview','video'],default='stills');a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v002')/a.variant
bpy.ops.wm.open_mainfile(filepath=str(OUT/f'{a.variant}.blend'))
s=bpy.context.scene;c=json.loads(s['contract']);ref=json.loads((HERE/'references.json').read_text())[a.variant]
# Re-enable CUDA after opening a file in a new background process.
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='CUDA';prefs.get_devices()
for d in prefs.devices:d.use=d.type=='CUDA'
s.cycles.device='GPU';s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGB'

def matched(view,width=600,height=900):
    crop=ref[view]['crop'];rw,rh=crop[2]-crop[0],crop[3]-crop[1]
    fit=.86*min(width/rw,height/rh);cam=c['cameras'][view].copy()
    cam[3]*=fit;cam[4]=cam[4]*fit+(width-rw*fit)/2;cam[5]=cam[5]*fit+(height-rh*fit)/2
    return cam

def pose_camera(frame,width,height):
    t=max(0,min(1,(frame-18)/66));t=t*t*(3-2*t)
    closed=matched('closed',width,height);op=matched('open',width,height)
    params=[x*(1-t)+y*t for x,y in zip(closed,op)]
    camera(s,params,width,height,1)

if a.mode=='stills':
    s.cycles.samples=48
    for label,frame,view in [('closed',1,'closed'),('opening',51,'open'),('bootup',110,'open'),('ready',156,'open'),('button-pressed',209,'open')]:
        s.frame_set(frame)
        if label=='opening':pose_camera(frame,720,1080)
        else:camera(s,matched(view,720,1080),720,1080,1)
        s.render.filepath=str(OUT/f'{label}-hero.png');bpy.ops.render.render(write_still=True)
else:
    s.cycles.samples=6 if a.mode=='video' else 10
    folder=OUT/('frames' if a.mode=='video' else 'preview');folder.mkdir(exist_ok=True)
    frames=range(1,223) if a.mode=='video' else [1,18,35,51,68,84,110,132,144,170,198,206,209,218,222]
    for frame in frames:
        path=folder/f'{frame:04d}.png'
        if path.exists() and a.mode=='video':continue
        s.frame_set(frame);pose_camera(frame,480,720)
        s.render.filepath=str(path);bpy.ops.render.render(write_still=True)
