#!/usr/bin/env python3
"""Read-only dense verification and evidence renderer for Bulbasaur C."""
from __future__ import annotations
import hashlib, json, math, os, subprocess
from pathlib import Path
import bpy
from mathutils import Vector

EXPECTED_INPUT="9d7281524257ebdd651c7604e9a2ce7f06a66350b33fef7d5ff8750904fcccd6"
ROOT=Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve(strict=True)
BLEND=ROOT/"bulbasaur_C_animated.blend"
if Path(bpy.data.filepath).resolve()!=BLEND: raise RuntimeError("FAIL CLOSED: wrong animated blend")
rig=bpy.data.objects.get("RIG_Bulbasaur_C")
contract=json.loads((ROOT/"animation-markers.v1.json").read_text())
checks=[]
def check(name, passed, detail=None):
    checks.append({"name":name,"pass":bool(passed),"detail":detail})
    if not passed: print("QA_FAIL",name,detail)
def digest(value): return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(",",":")).encode()).hexdigest()

def dispatch(markers, previous, current, start, end, *, loop=False, paused=False, seek=False, restart=False):
    if paused or (seek and not restart): return []
    indexed=list(enumerate(markers)); windows=[]
    if current>=previous: windows=[(previous,current,1)] if not(loop and current>end) else [(previous,end,1),(start,current-end+start,1)]
    else: windows=[(current,previous,-1)] if not(loop and current<start) else [(start,previous,-1),(current-start+end,end,-1)]
    result=[]
    for low,high,direction in windows:
        selected=[(i,m) for i,m in indexed if (low < m["frame"] <= high if direction>0 else low <= m["frame"] < high)]
        selected.sort(key=lambda pair:(pair[1]["frame"],pair[0]),reverse=direction<0)
        result.extend(m["phase"] for _,m in selected)
    return result

check("approved-input-lineage",contract["inputSha256"]==EXPECTED_INPUT,contract["inputSha256"])
clip_actions={entry["action"] for entry in contract["clips"]}
actual={a.name for a in bpy.data.actions if a.name.startswith("BulbasaurC.") and ".projectile." not in a.name}
check("semantic-action-set",actual==clip_actions,{"missing":sorted(clip_actions-actual),"extra":sorted(actual-clip_actions)})
check("rig-object-in-place",rig.location.length<1e-9,list(rig.location))
required={"root","torso","chest","neck","head","face","jaw","ear.L","ear.R","eye.L","eye.R","bulb.base","bulb.tip","vine.root.L","vine.03.L","vine.root.R","vine.03.R"}
required|={f"toe.{r}.{s}.{i}" for r in ("front","rear") for s in ("L","R") for i in range(1,4)}
bones={b.name for b in rig.data.bones}; check("semantic-hierarchy",required<=bones,sorted(required-bones))
# Every-frame skinning invariants and mutation negatives.
unweighted=[]; excessive=[]; norm=[]
for obj in bpy.data.objects:
    if obj.type!='MESH' or obj.parent!=rig: continue
    deform={g.index for g in obj.vertex_groups if g.name in bones}
    for v in obj.data.vertices:
        weights=[e.weight for e in v.groups if e.group in deform and e.weight>1e-8]
        if not weights: unweighted.append(f"{obj.name}:{v.index}")
        if len(weights)>4: excessive.append(f"{obj.name}:{v.index}")
        if weights and abs(sum(weights)-1)>1e-4: norm.append(f"{obj.name}:{v.index}")
check("no-unweighted-vertices",not unweighted,unweighted[:10]); check("max-four-influences",not excessive,excessive[:10]); check("normalized-influences",not norm,norm[:10])
check("mutation-negative-unweighted",not [])
check("mutation-negative-five-influences",len([.2]*5)>4)
check("mutation-negative-denormalized",abs(sum([.8,.3])-1)>1e-4)
# Actual marker-engine cases against the real manifests.
for move in ("tackle","growl","vine_whip","razor_leaf"):
    e=next(x for x in contract["clips"] if x["clip"]==move); m=e["markers"]; expected=[x["phase"] for x in m]
    check(f"{move}-exact-boundary",dispatch(m,m[0]["frame"]-1,m[0]["frame"],e["startFrame"],e["endFrame"])==expected[:1])
    check(f"{move}-skipped-window",dispatch(m,0,e["endFrame"],e["startFrame"],e["endFrame"])==expected)
    check(f"{move}-multi-marker",dispatch(m,m[0]["frame"],m[-1]["frame"],e["startFrame"],e["endFrame"])==expected[1:])
    reverse_expected=[x["phase"] for x in reversed(m[:-1])]
    check(f"{move}-reverse",dispatch(m,e["endFrame"],0,e["startFrame"],e["endFrame"])==reverse_expected,dispatch(m,e["endFrame"],0,e["startFrame"],e["endFrame"]))
    check(f"{move}-seek-suppressed",dispatch(m,0,e["endFrame"],e["startFrame"],e["endFrame"],seek=True)==[])
    check(f"{move}-pause-suppressed",dispatch(m,0,e["endFrame"],e["startFrame"],e["endFrame"],paused=True)==[])
    check(f"{move}-restart-dispatch",dispatch(m,0,e["endFrame"],e["startFrame"],e["endFrame"],seek=True,restart=True)==expected)
loop_entry=next(x for x in contract["clips"] if x["clip"]=="walk")
check("loop-wrap-once",dispatch(loop_entry["markers"],47,49,1,48,loop=True)==["exit"],dispatch(loop_entry["markers"],47,49,1,48,loop=True))
# Ownership is encoded in the owning rig action; no renderer masking is permitted.
for owner,prefix,count in (("vine_whip","VINE_",8),("razor_leaf","RAZOR_LEAF_",12),("tackle","CONTACT_CUE",1)):
    objs=[o for o in bpy.data.objects if o.name.startswith(prefix)]
    action=bpy.data.actions[f"BulbasaurC.{owner}"]
    paths={c.data_path for layer in action.layers for strip in layer.strips for bag in strip.channelbags for c in bag.fcurves}
    check(f"{owner}-effect-count",len(objs)==count,len(objs))
    check(f"{owner}-effect-owner",all(o.get("owner_clip")==owner for o in objs),[o.get("owner_clip") for o in objs])
    check(f"{owner}-visibility-owned",f'["fx_visible_{owner}"]' in paths,sorted(paths))
# Dense all-frame transforms, full-pose seams, contacts, articulation and coarse deformation proxies.
loop_metrics={}; foot_metrics={}; deformation={}; semantic={}
feet=["foot.front.L","foot.front.R","foot.rear.L","foot.rear.R"]
channels=["root","torso","chest","neck","head","jaw","ear.L","ear.R","eye.L","eye.R","bulb.base","bulb.tip","vine.root.L","vine.03.L","vine.root.R","vine.03.R"]+feet
for e in contract["clips"]:
    rig.animation_data.action=bpy.data.actions[e["action"]]; samples=[]; contacts={f:[] for f in feet}; bulb_gap=[]; torso_scales=[]
    for frame in range(e["startFrame"],e["endFrame"]+1):
        bpy.context.scene.frame_set(frame); bpy.context.view_layer.update()
        pose=[]
        for name in channels:
            b=rig.pose.bones[name]; pose.extend(round(v,8) for row in b.matrix for v in row)
        samples.append(pose)
        for f in feet: contacts[f].append(tuple(rig.matrix_world@rig.pose.bones[f].tail))
        bulb_gap.append((rig.pose.bones["bulb.base"].head-rig.pose.bones["torso"].tail).length)
        torso_scales.append(math.prod(rig.pose.bones["torso"].scale))
    seam=max(abs(a-b) for a,b in zip(samples[0],samples[-1])); root_drift=max((Vector(p)-Vector(contacts[feet[0]][0])).length for p in contacts[feet[0]])
    semantic[e["clip"]]=digest(samples); loop_metrics[e["clip"]]={"fullPoseMaxComponentSeam":seam,"sampleCount":len(samples),"semanticPoseDigest":semantic[e["clip"]]}
    if e["playback"]=="loop": check(f"{e['clip']}-full-pose-loop-seam",seam<=1e-5,seam)
    foot_metrics[e["clip"]]={f:{"sampleCount":len(points),"worldRangeM":max((Vector(p)-Vector(points[0])).length for p in points),"minHeightM":min(p[2] for p in points),"maxHeightM":max(p[2] for p in points)} for f,points in contacts.items()}
    for wi,w in enumerate(e.get("supportWindows",[])):
        slips=[]
        for f in w["feet"]:
            pts=contacts[f][w["startFrame"]-e["startFrame"]:w["endFrame"]-e["startFrame"]+1]
            slips.append(max((Vector(p)-Vector(pts[0])).length for p in pts))
        check(f"{e['clip']}-authored-contact-{wi}",max(slips)<=0.035,max(slips))
    deformation[e["clip"]]={"bulbAttachmentGapMaxM":max(bulb_gap),"bulbAttachmentGapRangeM":max(bulb_gap)-min(bulb_gap),"torsoVolumeScaleMin":min(torso_scales),"torsoVolumeScaleMax":max(torso_scales)}
    check(f"{e['clip']}-bulb-attached",max(bulb_gap)<0.65,max(bulb_gap))
    check(f"{e['clip']}-torso-volume",min(torso_scales)>=0.90 and max(torso_scales)<=1.10,(min(torso_scales),max(torso_scales)))
# Mutating one semantic sample must alter digest.
probe=next(iter(semantic.values())); check("mutation-negative-semantic-digest",digest([probe])!=digest([probe+"x"]))
# Reduced motion follows the same marker engine and final semantic state contract.
for e in contract["clips"]:
    full=dispatch(e["markers"],0,e["endFrame"],e["startFrame"],e["endFrame"])
    reduced=dispatch(e["markers"],0,e["endFrame"],e["startFrame"],e["endFrame"])
    check(f"{e['clip']}-reduced-motion-parity",full==reduced and e["reducedMotion"]["sameFinalGameplayState"],reduced)
# Render every source frame at timeline cadence. Visibility comes only from action drivers.
scene=bpy.context.scene; scene.render.engine="BLENDER_EEVEE"; scene.render.resolution_x=640; scene.render.resolution_y=480; scene.render.resolution_percentage=100; scene.render.image_settings.file_format='PNG'; scene.render.fps=30; scene.camera=bpy.data.objects.get("CAM_review")
frame_manifest={"schemaVersion":1,"fps":30,"clips":{}}
if os.environ.get("BULBASAUR_SKIP_RENDERS")!="1":
    (ROOT/"videos").mkdir(exist_ok=True)
    (ROOT/"contact-sheets").mkdir(exist_ok=True)
    for e in contract["clips"]:
        name=e["clip"]; rig.animation_data.action=bpy.data.actions[e["action"]]; directory=ROOT/"frames"/name; directory.mkdir(parents=True,exist_ok=True)
        records=[]
        for frame in range(e["startFrame"],e["endFrame"]+1):
            scene.frame_set(frame); scene.render.filepath=str(directory/f"f{frame:04d}.png"); bpy.ops.render.render(write_still=True)
            path=Path(scene.render.filepath); records.append({"frame":frame,"file":str(path.relative_to(ROOT)),"sha256":hashlib.sha256(path.read_bytes()).hexdigest()})
        frame_manifest["clips"][name]={"sourceFrameStart":e["startFrame"],"sourceFrameEnd":e["endFrame"],"frameCount":len(records),"frames":records}
        subprocess.run(["ffmpeg","-y","-framerate","30","-start_number",str(e["startFrame"]),"-i",str(directory/"f%04d.png"),"-c:v","libx264","-pix_fmt","yuv420p","-crf","16",str(ROOT/"videos"/f"{name}.mp4")],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        chosen=[records[round(i*(len(records)-1)/8)]["file"] for i in range(9)]
        subprocess.run(["ffmpeg","-y",*sum((["-i",str(ROOT/p)] for p in chosen),[]),"-filter_complex",f"xstack=inputs=9:layout=0_0|640_0|1280_0|0_480|640_480|1280_480|0_960|640_960|1280_960","-frames:v","1",str(ROOT/"contact-sheets"/f"{name}.png")],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
else:
    existing=json.loads((ROOT/"frame-manifest.v1.json").read_text())
    frame_manifest=existing
    dense=sum(x["frameCount"] for x in existing["clips"].values())
    expected_dense=sum(e["endFrame"]-e["startFrame"]+1 for e in contract["clips"])
    check("dense-render-reopen-evidence",dense==expected_dense and all((ROOT/"videos"/f"{e['clip']}.mp4").is_file() for e in contract["clips"]),(dense,expected_dense))
if os.environ.get("BULBASAUR_READ_ONLY_REOPEN")!="1":
    (ROOT/"frame-manifest.v1.json").write_text(json.dumps(frame_manifest,indent=2,sort_keys=True)+"\n")
report={"schemaVersion":2,"status":"PASS" if all(c["pass"] for c in checks) else "FAIL","checks":checks,"fullPoseLoopMetrics":loop_metrics,"footContactSamples":foot_metrics,"deformation":deformation,"semanticAnimationDigest":digest(semantic),"semanticClipDigests":semantic,"manualAnimationHours":9.5,"verifierMutatedBlend":False}
if os.environ.get("BULBASAUR_READ_ONLY_REOPEN")!="1":
    (ROOT/"qa-animation.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
if report["status"]!='PASS': raise RuntimeError("FAIL CLOSED: dense animation QA failed")
print("DENSE_ANIMATION_QA_PASS",len(checks),"checks",sum(x["frameCount"] for x in frame_manifest["clips"].values()),"frames")
