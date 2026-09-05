"""Render the frozen authored source in a dedicated Blender background process."""
import bpy,json,hashlib,time
from pathlib import Path

scene=bpy.context.scene
OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v001/video/m2-frames')
OUT.mkdir(parents=True,exist_ok=True)
identity={'blend':bpy.data.filepath,'sha256':hashlib.sha256(Path(bpy.data.filepath).read_bytes()).hexdigest(),'engine':'CYCLES','samples':16,'resolution':[768,768],'fps':30,'frames':[1,294]}
receipt=OUT/'render-job.json'
if receipt.exists() and json.loads(receipt.read_text())!=identity:raise RuntimeError('Existing render belongs to a different frozen source. Use a new versioned output directory.')
receipt.write_text(json.dumps(identity,indent=2))
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
for device in prefs.devices:device.use=device.type!='CPU'
scene.render.engine='CYCLES';scene.cycles.device='GPU';scene.cycles.samples=16;scene.cycles.use_denoising=True
scene.render.resolution_x=768;scene.render.resolution_y=768;scene.render.resolution_percentage=100
scene.render.use_persistent_data=True;scene.render.image_settings.file_format='PNG'
scene.render.film_transparent=False;scene.render.fps=30
started=time.time()
for frame in range(1,295):
    path=OUT/f'frame-{frame:04d}.png'
    if path.exists():continue
    scene.frame_set(frame);scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
    (OUT/'progress.json').write_text(json.dumps({'lastRenderedFrame':frame,'elapsedSeconds':round(time.time()-started,2)}))
print('PDX_RENDER_COMPLETE '+json.dumps(identity))
