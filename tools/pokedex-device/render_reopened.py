"""Photograph actual reopened runtime GLBs with the hero studio and camera."""
import bpy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from reopen_runtime import activate
import presentation

OUT = Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v001')
records = []
for level in [0,1,2]:
    source = OUT/'source'/f'pokedex-v001-reopened-lod{level}.blend'
    bpy.ops.wm.open_mainfile(filepath=str(source))
    scene = bpy.context.scene
    scene.render.resolution_x = scene.render.resolution_y = 1280
    scene.cycles.samples = 24
    for clip in (['Ready','Closed'] if level == 0 else ['Ready']):
        activate(scene,clip,.3)
        if clip == 'Closed':
            scene.camera.location = (.245,-.34,.30)
            presentation.aim(scene.camera,(0,-.085,.017))
        path = OUT/'renders'/f'runtime-lod{level}-{clip.lower()}.png'
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        records.append({'source':str(source),'path':str(path),'clip':clip,'time':.3})
        print('RUNTIME_RENDER',str(path),flush=True)
(OUT/'runtime'/'render-reopening.json').write_text(json.dumps(records,indent=2))
