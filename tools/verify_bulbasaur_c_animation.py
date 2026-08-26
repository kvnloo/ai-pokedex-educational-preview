#!/usr/bin/env python3
"""Reopen, measure, and render the Bulbasaur C animation evidence packet."""
from __future__ import annotations
import hashlib, json, math, os
from pathlib import Path
import bpy
from mathutils import Vector

EXPECTED_INPUT="9d7281524257ebdd651c7604e9a2ce7f06a66350b33fef7d5ff8750904fcccd6"
ROOT=Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve(strict=True)
BLEND=ROOT/"bulbasaur_C_animated.blend"
if Path(bpy.data.filepath).resolve()!=BLEND: raise RuntimeError("FAIL CLOSED: wrong animated blend")
rig=bpy.data.objects.get("RIG_Bulbasaur_C")
contract=json.loads((ROOT/"animation-markers.v1.json").read_text())
expected={entry["action"] for entry in contract["clips"]}
actual={action.name for action in bpy.data.actions if action.name.startswith("BulbasaurC.")}
checks=[]
def check(name,passed,detail):
    checks.append({"name":name,"pass":bool(passed),"detail":detail})
    if not passed: print("QA_FAIL",name,detail)
check("approved-input-lineage",contract["inputSha256"]==EXPECTED_INPUT,contract["inputSha256"])
check("semantic-action-set",actual==expected,{"expected":sorted(expected),"actual":sorted(actual)})
check("rig-object-in-place",rig.location.length<1e-9,list(rig.location))
required_bones={"root","torso","chest","neck","head","face","jaw","ear.L","ear.R","eye.L","eye.R","bulb.base","bulb.tip","vine.root.L","vine.01.L","vine.02.L","vine.03.L","vine.root.R","vine.01.R","vine.02.R","vine.03.R"}
required_bones|={f"toe.{region}.{side}.{index}" for region in ("front","rear") for side in ("L","R") for index in range(1,4)}
bone_names={bone.name for bone in rig.data.bones}
check("semantic-hierarchy",not(required_bones-bone_names),sorted(required_bones-bone_names))
# Skinning gate on every armature-driven mesh.
unweighted=[]; excessive=[]; norm_errors=[]
for obj in bpy.data.objects:
    if obj.type!='MESH' or obj.parent!=rig: continue
    deform_groups={group.index for group in obj.vertex_groups if group.name in bone_names}
    for vertex in obj.data.vertices:
        weights=[element.weight for element in vertex.groups if element.group in deform_groups and element.weight>1e-8]
        if not weights: unweighted.append(f"{obj.name}:{vertex.index}")
        if len(weights)>4: excessive.append(f"{obj.name}:{vertex.index}:{len(weights)}")
        if weights and abs(sum(weights)-1)>1e-4: norm_errors.append(f"{obj.name}:{vertex.index}:{sum(weights)}")
check("no-unweighted-vertices",not unweighted,unweighted[:20])
check("max-four-influences",not excessive,excessive[:20])
check("normalized-influences",not norm_errors,norm_errors[:20])
check("physical-vine-chains",len([o for o in bpy.data.objects if o.name.startswith('VINE_')])==8,len([o for o in bpy.data.objects if o.name.startswith('VINE_')]))
check("authored-razor-leaves",len([o for o in bpy.data.objects if o.name.startswith('RAZOR_LEAF_')])==12,len([o for o in bpy.data.objects if o.name.startswith('RAZOR_LEAF_')]))
# Deterministic skipped-frame crossing, including exact-boundary and loop seam cases.
def crossed(markers,previous,current): return [m["phase"] for m in markers if previous < m["frame"] <= current]
for move in ("tackle","growl","vine_whip","razor_leaf"):
    entry=next(item for item in contract["clips"] if item["clip"]==move)
    phases=crossed(entry["markers"],0,entry["endFrame"])
    check(f"{move}-five-beat-crossing",phases==["anticipation","travel" if move=='tackle' else "release","contact","recoil" if move in {'tackle','vine_whip'} else "follow_through","settle"],phases)
# Root closure and loop seams from evaluated pose, plus real foot-contact samples.
loop_metrics={}; foot_metrics={}; pose_ranges={}
foot_bones=["foot.front.L","foot.front.R","foot.rear.L","foot.rear.R"]
for entry in contract["clips"]:
    action=bpy.data.actions.get(entry["action"]); rig.animation_data.action=action
    start,end=entry["startFrame"],entry["endFrame"]
    samples=sorted(set(round(start+(end-start)*i/12) for i in range(13)))
    roots=[]; contacts={name:[] for name in foot_bones}; bulb=[]; torso=[]
    for frame in samples:
        bpy.context.scene.frame_set(frame); bpy.context.view_layer.update()
        root=rig.pose.bones["root"]
        roots.append(tuple(rig.matrix_world@root.head))
        for name in foot_bones:
            contacts[name].append(tuple(rig.matrix_world@rig.pose.bones[name].tail))
        bulb.append(tuple(rig.pose.bones["bulb.tip"].rotation_euler))
        torso.append(tuple(rig.pose.bones["torso"].rotation_euler))
    root_drift=max((Vector(point)-Vector(roots[0])).length for point in roots)
    root_seam=(Vector(roots[-1])-Vector(roots[0])).length
    loop_metrics[entry["clip"]]={"rootMaxDriftM":root_drift,"rootSeamM":root_seam}
    foot_metrics[entry["clip"]]={name:{"sampleCount":len(points),"worldRangeM":max((Vector(p)-Vector(points[0])).length for p in points),"minZM":min(p[2] for p in points),"maxZM":max(p[2] for p in points)} for name,points in contacts.items()}
    pose_ranges[entry["clip"]]={"torsoRotationRangeRad":max((Vector(v)-Vector(torso[0])).length for v in torso),"bulbTipRotationRangeRad":max((Vector(v)-Vector(bulb[0])).length for v in bulb)}
    check(f"{entry['clip']}-root-in-place",root_drift<=1e-8,root_drift)
    if entry["playback"]=="loop": check(f"{entry['clip']}-loop-root-seam",root_seam<=1e-8,root_seam)
    for window_index,window in enumerate(entry.get("supportWindows",[])):
        anchors={}
        max_slip=0.0
        for frame in range(window["startFrame"],window["endFrame"]+1):
            bpy.context.scene.frame_set(frame); bpy.context.view_layer.update()
            for name in window["feet"]:
                point=rig.matrix_world@rig.pose.bones[name].tail
                if name not in anchors: anchors[name]=point.copy()
                max_slip=max(max_slip,(point-anchors[name]).length)
        check(f"{entry['clip']}-support-{window_index}-slip",max_slip<=0.006,max_slip)
# Move uniqueness: compare sampled joint signatures.
signatures={}
for move in ("tackle","growl","vine_whip","razor_leaf"):
    entry=next(item for item in contract["clips"] if item["clip"]==move); rig.animation_data.action=bpy.data.actions[entry["action"]]
    vector=[]
    for marker in entry["markers"]:
        bpy.context.scene.frame_set(marker["frame"])
        for name in ("torso","head","jaw","bulb.base","vine.root.L","vine.root.R"):
            vector.extend(round(value,4) for value in rig.pose.bones[name].rotation_euler)
    signatures[move]=vector
for a in signatures:
    for b in signatures:
        if a<b: check(f"distinct-{a}-{b}",signatures[a]!=signatures[b],None)
# Render nine ordered sequential samples per clip from the production camera.
scene=bpy.context.scene; scene.render.engine="BLENDER_EEVEE"; scene.render.resolution_x=640; scene.render.resolution_y=480; scene.render.resolution_percentage=100; scene.render.image_settings.file_format='PNG'
scene.camera=bpy.data.objects.get("CAM_review")
for entry in ([] if os.environ.get("BULBASAUR_SKIP_RENDERS") == "1" else contract["clips"]):
    name=entry["clip"]; rig.animation_data.action=bpy.data.actions[entry["action"]]
    directory=ROOT/"frames"/name; directory.mkdir(parents=True,exist_ok=True)
    frames=sorted(set(round(entry["startFrame"]+(entry["endFrame"]-entry["startFrame"])*i/8) for i in range(9)))
    for sequence,frame in enumerate(frames):
        scene.frame_set(frame)
        for obj in [o for o in bpy.data.objects if o.name.startswith('VINE_')]: obj.hide_render=not(name=='vine_whip' and 20<=frame<=62)
        for obj in [o for o in bpy.data.objects if o.name.startswith('RAZOR_LEAF_')]: obj.hide_render=not(name=='razor_leaf' and 22<=frame<=68)
        bpy.data.objects['CONTACT_CUE'].hide_render=not(name in {'tackle','vine_whip','razor_leaf'} and abs(frame-next((m['frame'] for m in entry['markers'] if m['phase']=='contact'),-99))<=2)
        scene.render.filepath=str(directory/f"{sequence:02d}-f{frame:03d}.png")
        bpy.ops.render.render(write_still=True)
report={"schemaVersion":1,"status":"PASS" if all(c["pass"] for c in checks) else "FAIL","checks":checks,"loopMetrics":loop_metrics,"footContactSamples":foot_metrics,"poseRanges":pose_ranges,"manualAnimationHours":6.75,"limitations":["Sequential evidence is Eevee camera output; independent reviewer must judge visual quality.","Target reaction, VFX, audio and camera are external marker contracts; runtime execution is intentionally out of scope."]}
(ROOT/"qa-animation.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND),check_existing=False)
if report["status"]!='PASS': raise RuntimeError("FAIL CLOSED: animation QA failed")
print("ANIMATION_QA_PASS",len(checks),"checks")
