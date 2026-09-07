"""Inspection only: render existing physical GLBs with normalized framing."""
import bpy,json,contextlib,io
from pathlib import Path
from mathutils import Vector
root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r49')
root.mkdir(exist_ok=True)
s=bpy.context.scene
assert bpy.context.mode=='OBJECT'
original=set(bpy.data.objects);meshes=set(bpy.data.meshes)
visibility={o:o.hide_render for o in s.objects};oldcam=s.camera;oldpath=s.render.filepath
sources={'home-r09':'/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r09/charizard-home-native-r09-horn-isolated.glb','manual-r46':'/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r46/charizard-blockout-r46.glb'}
receipts={}
try:
 for o in s.objects:
  if o.type=='MESH':o.hide_render=True
 for label,path in sources.items():
  with contextlib.redirect_stdout(io.StringIO()):bpy.ops.import_scene.gltf(filepath=path,merge_vertices=True)
  imported=set(bpy.data.objects)-original
  points=[o.matrix_world@v.co for o in imported if o.type=='MESH' for v in o.data.vertices]
  lo=Vector([min(p[i] for p in points) for i in range(3)]);hi=Vector([max(p[i] for p in points) for i in range(3)]);center=(lo+hi)/2;scale=max(hi-lo)*1.16
  d=bpy.data.cameras.new('TEMP-baseline-comparison');c=bpy.data.objects.new('TEMP-baseline-comparison',d);s.collection.objects.link(c);d.type='ORTHO';d.ortho_scale=scale;s.camera=c
  receipts[label]={'source':path,'bounds':[list(lo),list(hi)],'center':list(center),'orthoScale':scale,'cameraRotations':{}}
  for view in ['front','side','rear','threequarter']:
   q=s.objects['CAM-r11-'+view].matrix_world.to_quaternion();c.rotation_mode='QUATERNION';c.rotation_quaternion=q;c.location=center+q@Vector((0,0,scale*3))
   out=root/(label+'-'+view+'.png');assert not out.exists();s.render.filepath=str(out);bpy.ops.render.render(write_still=True);receipts[label]['cameraRotations'][view]=list(q)
  bpy.data.objects.remove(c,do_unlink=True);bpy.data.cameras.remove(d)
  for o in imported:bpy.data.objects.remove(o,do_unlink=True)
finally:
 for o in set(bpy.data.objects)-original:bpy.data.objects.remove(o,do_unlink=True)
 for m in set(bpy.data.meshes)-meshes:
  if m.users==0:bpy.data.meshes.remove(m)
 for o,h in visibility.items():o.hide_render=h
 s.camera=oldcam;s.render.filepath=oldpath
(root/'comparison.json').write_text(json.dumps(receipts,indent=2)+'\n')
print('Eight existing-baseline views rendered; source restored. Framing normalized, not calibrated reference registration.')
