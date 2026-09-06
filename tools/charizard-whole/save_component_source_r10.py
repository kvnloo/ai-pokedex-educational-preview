"""Strip historical copies from a saved working copy; frozen r03-r09 files stay untouched."""
import bpy
import json
from pathlib import Path

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r10')
assert Path(bpy.data.filepath) == root / 'charizard-components-r10-recovery-full.blend'
assert Path(bpy.data.filepath).is_file()
scene = bpy.data.scenes['EDIT-charizard-components-r10']
keep = set(scene.objects)
assert len(keep) == 7
removed_scenes = [s.name for s in bpy.data.scenes if s != scene]
for window in bpy.context.window_manager.windows:
    window.scene = scene
for old in list(bpy.data.scenes):
    if old != scene:
        bpy.data.scenes.remove(old)
for obj in list(bpy.data.objects):
    if obj not in keep:
        bpy.data.objects.remove(obj, do_unlink=True)
for img in bpy.data.images:
    if 'ffe2db1065f91feda24f21c' in img.name:
        img.use_fake_user = True
bpy.data.orphans_purge(do_local_ids=True, do_linked_ids=False, do_recursive=True)
head = scene.objects['GEO-charizard-head-neck-r10']
for obj in scene.objects:
    obj.select_set(obj == head)
bpy.context.view_layer.objects.active = head
scene.objects['FlameSocket-r10'].name = 'FlameSocket'
bpy.ops.wm.save_as_mainfile(filepath=str(root / 'charizard-components-r10-intake.blend'))
receipt = {'source': bpy.data.filepath, 'scenes': list(bpy.data.scenes.keys()),
    'objects': list(scene.objects.keys()), 'removedFromWorkingCopyOnly': removed_scenes,
    'historicalFilesModified': False}
(root / 'component-source.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt))
