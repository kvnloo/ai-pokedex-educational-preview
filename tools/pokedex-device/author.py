"""Reproduce the authored hero in Blender, including presentation, rig and surfaces."""
import bpy,runpy,sys,importlib
from pathlib import Path

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
runpy.run_path(str(HERE/'build.py'),run_name='__main__')
runpy.run_path(str(HERE/'repair_topology.py'),run_name='__main__')
import presentation
importlib.reload(presentation)
scene=bpy.context.scene;presentation.setup(scene)
scene.camera.location=(.265,-.38,.29);presentation.aim(scene.camera,(0,-.04,.074))
for name in ['animate.py','surfaces.py','validate.py']:
    runpy.run_path(str(HERE/name),run_name='__main__')
