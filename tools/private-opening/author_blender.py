"""Dedicated Ash/Pikachu authoring recipe. Run with Blender 5.2. Original from-scratch procedural fan art.

No reconstruction downloads, generic species adapter, extracted assets or textures.
Original modeling instructions are review candidates, never automatic promotions.
"""
import bpy
import bmesh
import hashlib
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from mathutils import Vector

REPO = Path(__file__).resolve().parents[2]
CONTRACT_FILE = REPO / "canonical/opening/contract.json"
CONTRACT = json.loads(CONTRACT_FILE.read_text())
ROOT = Path(CONTRACT["assetRoot"])


def sha(file):
    return hashlib.sha256(Path(file).read_bytes()).hexdigest()


def sources():
    result = subprocess.run(["node", str(REPO / "tools/private-opening/gate.mjs"), "--record-provenance"], capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stdout + result.stderr)
    return json.loads(result.stdout)


def material(name, rgb):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*rgb, 1)
    shader.inputs["Roughness"].default_value = 0.64
    return mat


def group(name, parent=None, loc=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.location = loc
    return obj


def finish(obj, name, mat, parent):
    obj.name = name
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    # Parent with current transform interpreted in the parent's local frame.
    obj.parent = parent
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj


def ellipsoid(name, xyz, size, mat, parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, location=xyz)
    obj = bpy.context.object
    obj.scale = size
    return finish(obj, name, mat, parent)


def box(name, xyz, size, mat, parent, bevel=0.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz)
    obj = bpy.context.object
    obj.scale = size
    finish(obj, name, mat, parent)
    if bevel:
        mod = obj.modifiers.new("rounded authored edge", "BEVEL")
        mod.width = min(bevel, min(size)*.4)
        mod.segments = 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj


def tube(name, points, radius, mat, parent):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    curve.resolution_u = 16
    curve.use_fill_caps = True
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for p, xyz in zip(spline.points, points):
        p.co = (*xyz, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    obj=bpy.context.object
    # Curve conversion duplicates cap boundary vertices. Weld before structural
    # QA; a closed-looking curve must also be a closed topological mesh.
    bm=bmesh.new(); bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(obj.data); bm.free()
    return finish(obj, name, mat, parent)


def prism(name, outline, depth, mat, parent):
    # A true closed extruded polygon, not a flat tail or card.
    n = len(outline)
    vertices = [(x, y, z) for y in (-depth/2, depth/2) for x, z in outline]
    faces = [tuple(reversed(range(n))), tuple(range(n, n*2))]
    faces += [(i, (i+1)%n, (i+1)%n+n, i+n) for i in range(n)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    bm=bmesh.new(); bm.from_mesh(mesh); bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces)); bm.to_mesh(mesh); bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    return finish(obj, name, mat, parent)


def socket(name, parent, loc):
    obj = group("socket." + name, parent, loc)
    obj["socket"] = name
    return obj


def ash():
    root = group("Ash_Ketchum")
    colors = {"skin": (.86,.60,.39), "hair": (.009,.014,.023), "white": (.95,.95,.91), "red": (.72,.018,.027), "green": (.06,.35,.13), "blue": (.018,.16,.60), "yellow": (.98,.63,.025), "eyes": (.19,.075,.025)}
    m = {k: material(k,v) for k,v in colors.items()}
    ellipsoid("white_shirt", (0,0,.90), (.22,.13,.30), m["white"], root)
    box("blue_vest_back", (0,.064,.93), (.43,.15,.48), m["blue"], root, .04)
    for sign in [-1,1]:
        box("vest_front", (sign*.137,-.103,.92), (.155,.062,.47), m["blue"], root, .018)
        tube("yellow_vest_trim", [(sign*.065,-.143,1.15),(sign*.065,-.151,.72),(sign*.20,-.11,.71)], .012,m["yellow"],root)
        box("vest_pocket", (sign*.145,-.143,.82), (.10,.02,.07),m["blue"],root)
    ellipsoid("neck", (0,0,1.185), (.072,.068,.08),m["skin"],root)
    head = group("head",root,(0,0,1.35))
    ellipsoid("face",(0,-.008,0),(.165,.145,.19),m["skin"],head)
    ellipsoid("black_hair",(0,.035,.045),(.174,.143,.18),m["hair"],head)
    for sign in [-1,1]:
        ellipsoid("ear",(sign*.162,0,-.005),(.032,.032,.052),m["skin"],head)
        for i in range(3):
            prism("hair_spike",[(sign*.11,.07-i*.047),(sign*(.22-i*.01),.005-i*.035),(sign*.13,-.04-i*.035)],.10,m["hair"],head).location.y=.035
        ellipsoid("eye_white",(sign*.067,-.137,.003),(.046,.022,.058),m["white"],head)
        ellipsoid("brown_iris",(sign*.062,-.157,0),(.023,.009,.039),m["eyes"],head)
        ellipsoid("pupil",(sign*.062,-.166,0),(.012,.004,.026),m["hair"],head)
        ellipsoid("eye_highlight",(sign*.057,-.17,.019),(.008,.003,.012),m["white"],head)
        tube("eyebrow",[(sign*.025,-.143,.069),(sign*.10,-.125,.063)],.008,m["hair"],head)
        for i in range(2):
            tube("cheek_mark",[(sign*(.09+i*.022),-.131,-.057),(sign*(.102+i*.022),-.126,-.071)],.003,m["hair"],head)
    ellipsoid("nose",(0,-.155,-.035),(.019,.026,.022),m["skin"],head)
    tube("smile",[(-.04,-.132,-.092),(0,-.148,-.103),(.04,-.132,-.092)],.0035,m["hair"],head)
    ellipsoid("red_cap",(0,.007,.137),(.186,.159,.105),m["red"],head)
    box("white_cap_front",(0,-.137,.153),(.23,.037,.10),m["white"],head,.026)
    ellipsoid("red_cap_brim",(0,-.155,.097),(.195,.139,.020),m["red"],head)
    tube("green_cap_emblem",[(-.046,-.161,.127),(-.016,-.163,.178),(.020,-.163,.178),(.035,-.163,.165)],.009,m["green"],head)
    box("green_backpack",(0,.185,.93),(.31,.19,.38),m["green"],root,.05)
    limbs = {}
    for sign, side in [(-1,"L"),(1,"R")]:
        arm = group("arm."+side,root,(sign*.236,0,1.09)); limbs["arm."+side]=arm
        ellipsoid("shirt_sleeve",(sign*.014,0,-.07),(.086,.082,.12),m["white"],arm)
        ellipsoid("forearm",(sign*.025,-.006,-.225),(.052,.053,.135),m["skin"],arm)
        ellipsoid("glove",(sign*.03,-.01,-.36),(.059,.052,.074),m["green"],arm)
        for digit in range(4):
            ellipsoid("finger",(sign*.03+(digit-1.5)*.021,-.02,-.418),(.011,.022,.026),m["skin"],arm)
        socket("hand."+side,arm,(sign*.03,-.04,-.40))
        leg = group("leg."+side,root,(sign*.102,0,.67)); limbs["leg."+side]=leg
        ellipsoid("jeans",(0,0,-.255),(.092,.097,.29),m["blue"],leg)
        ellipsoid("white_sneaker",(0,-.045,-.56),(.103,.157,.071),m["white"],leg)
        box("red_sneaker_panel",(0,-.09,-.544),(.16,.16,.047),m["red"],leg,.012)
    socket("shoulder.R",root,(.24,0,1.16)); socket("look",head,(0,-.2,0)); socket("ground",root,(0,0,0))
    return root, limbs


def pikachu():
    root = group("Pikachu")
    colors = {"yellow": (1,.67,.018),"black":(.008,.009,.012),"red":(.85,.022,.017),"brown":(.29,.095,.024),"white":(1,1,.96)}
    m={k:material(k,v) for k,v in colors.items()}
    ellipsoid("pear_body",(0,0,.19),(.135,.097,.17),m["yellow"],root)
    head=group("head",root,(0,-.021,.355))
    ellipsoid("wide_cheek_head",(0,0,0),(.165,.109,.126),m["yellow"],head)
    limbs={}
    for sign,side in [(-1,"L"),(1,"R")]:
        ear=group("ear."+side,head,(sign*.103,.004,.080)); limbs["ear."+side]=ear
        ear.rotation_euler.y=sign*.30
        prism("long_pointed_ear",[(-.027,0),(-.024,.126),(0,.211),(.023,.127),(.027,0)],.035,m["yellow"],ear)
        prism("black_ear_tip",[(-.021,.137),(0,.211),(.021,.137)],.037,m["black"],ear)
        ellipsoid("black_eye",(sign*.065,-.099,.023),(.025,.015,.031),m["black"],head)
        ellipsoid("eye_glint",(sign*.065-.007,-.113,.035),(.008,.004,.010),m["white"],head)
        ellipsoid("red_cheek",(sign*.126,-.078,-.026),(.032,.015,.030),m["red"],head)
        socket("cheek."+side,head,(sign*.127,-.097,-.025))
        arm=group("arm."+side,root,(sign*.102,-.041,.24)); limbs["arm."+side]=arm
        ellipsoid("short_arm",(sign*.017,-.018,-.044),(.04,.037,.072),m["yellow"],arm)
        leg=group("leg."+side,root,(sign*.082,0,.061)); limbs["leg."+side]=leg
        ellipsoid("long_hind_foot",(0,-.037,-.030),(.046,.090,.032),m["yellow"],leg)
    ellipsoid("nose",(0,-.111,-.003),(.011,.007,.008),m["black"],head)
    tube("W_mouth",[(-.035,-.108,-.026),(-.018,-.115,-.038),(0,-.117,-.027),(.018,-.115,-.038),(.035,-.108,-.026)],.0028,m["black"],head)
    for z in [.22,.28]:
        ellipsoid("brown_back_stripe",(0,.085,z),(.103,.015,.018),m["brown"],root)
    tail=group("tail",root,(0,.089,.12)); limbs["tail"]=tail
    tail.rotation_euler.z=.35
    prism("brown_tail_root",[(-.014,0),(.019,.073),(.061,.089),(.079,.049),(.045,.035),(.015,-.012)],.034,m["brown"],tail)
    prism("lightning_bolt_tail",[(.025,.062),(.102,.135),(.065,.17),(.19,.30),(.272,.254),(.152,.156),(.196,.105),(.073,.03)],.038,m["yellow"],tail)
    socket("tail.tip",tail,(.25,0,.265)); socket("look",head,(0,-.14,0)); socket("ground",root,(0,0,0))
    return root,limbs


def animate(root, limbs, clips):
    # Per-node NLA tracks share a clip name for glTF merging. Root translation is
    # deliberately absent: the game owns movement and contact displacement once.
    for name in clips:
        frames = 25 if name in ["idle","walk","greet"] else 17
        for key,obj in limbs.items():
            original=tuple(obj.rotation_euler)
            action=bpy.data.actions.new(root.name+"_"+name+"_"+key)
            obj.animation_data_create(); obj.animation_data.action=action
            for frame in range(1,frames+1):
                phase=(frame-1)/(frames-1)*math.tau
                angles=list(original)
                side=-1 if key.endswith("L") else 1
                if name in ["walk","run"] and ("leg" in key or "arm" in key):
                    angles[0]+=math.sin(phase)*side*(.42 if name=="walk" else .68)*(-1 if "arm" in key else 1)
                if name=="idle" and ("ear" in key or key=="tail"):
                    angles[1]+=math.sin(phase)*.045
                if name=="idle" and "arm" in key:
                    angles[0]+=math.sin(phase)*.016
                if name in ["greet","thundershock"] and "arm" in key:
                    angles[1]+=side*math.sin(phase/2)*.8
                    angles[0]-=math.sin(phase/2)*.5
                obj.rotation_euler=angles
                obj.keyframe_insert(data_path="rotation_euler",frame=frame)
            obj.animation_data.action=None
            track=obj.animation_data.nla_tracks.new(); track.name=name
            track.strips.new(name,1,action)
            obj.rotation_euler=original
    bpy.context.scene.frame_set(1)


def mesh_qa(root):
    bpy.context.view_layer.update()
    vertices=triangles=components=degenerate=nonfinite=nonmanifold=0
    for obj in root.children_recursive:
        if obj.type!="MESH": continue
        mesh=obj.data; mesh.calc_loop_triangles()
        vertices+=len(mesh.vertices); triangles+=len(mesh.loop_triangles)
        nonfinite+=sum(not all(math.isfinite(x) for x in v.co) for v in mesh.vertices)
        bad=sum(t.area < 1e-12 for t in mesh.loop_triangles)
        if bad: print("DEGENERATE",obj.name,bad,flush=True)
        degenerate+=bad
        bm=bmesh.new(); bm.from_mesh(mesh)
        nonmanifold+=sum(not edge.is_manifold for edge in bm.edges)
        remaining=set(bm.verts)
        while remaining:
            components+=1; pending=[remaining.pop()]
            while pending:
                v=pending.pop()
                for edge in v.link_edges:
                    other=edge.other_vert(v)
                    if other in remaining: remaining.remove(other); pending.append(other)
        bm.free()
    return dict(ok=triangles>=100 and triangles<=90000 and not(nonfinite or degenerate or nonmanifold),vertices=vertices,triangles=triangles,components=components,nonFiniteVertices=nonfinite,degenerateTriangles=degenerate,nonManifoldEdges=nonmanifold)


def main():
    if bpy.app.version[:2]!=(5,2): raise RuntimeError("BLENDER_5_2_REQUIRED")
    if "--validate-recipe" in sys.argv:
        print(json.dumps({"recipeSyntax":"pass","blender":bpy.app.version_string,"generation":"not-run","reason":"source and recognition gates remain mandatory"})); return
    if "--self-test" in sys.argv:
        # Exercise exporter, solid primitives, extras and NLA on an unbranded
        # mechanical fixture. This does not author either gated character.
        bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete(use_global=False)
        root=group("unbranded_export_fixture"); limb=group("hinge",root)
        m=material("fixture_grey",(.5,.5,.5))
        ellipsoid("sphere",(0,0,0),(.1,.1,.1),m,limb)
        box("block",(1,0,0),(.2,.2,.2),m,root)
        tube("capped_tube",[(0,1,0),(.2,1,.2),(.3,1,.1)],.01,m,root)
        prism("solid_polygon",[(0,0),(.3,0),(.2,.3),(0,.1)],.05,m,root).location.y=-1
        socket("test.R",root,(0,0,0)); animate(root,{"arm.R":limb},["idle","walk","greet"])
        qa=mesh_qa(root)
        if not qa["ok"]: raise RuntimeError(json.dumps(qa))
        ROOT.mkdir(parents=True,exist_ok=True); os.chmod(ROOT,0o700)
        with tempfile.TemporaryDirectory(prefix=".unbranded-export-test-",dir=ROOT) as temp:
            file=Path(temp)/"fixture.glb"
            bpy.ops.export_scene.gltf(filepath=str(file),export_format="GLB",export_animations=True,export_animation_mode="NLA_TRACKS",export_extras=True)
            data=file.read_bytes(); length=int.from_bytes(data[12:16],"little"); gltf=json.loads(data[20:20+length])
            names={a["name"] for a in gltf.get("animations",[])}
            if not {"idle","walk","greet"}<=names: raise RuntimeError("NLA export failed: "+str(names))
            if not any(n.get("extras",{}).get("socket")=="test.R" for n in gltf["nodes"]): raise RuntimeError("Socket extras not preserved")
        print(json.dumps({"helperSelfTest":"pass","blender":bpy.app.version_string,"meshQa":qa,"characterGeneration":"not-run"})); return
    readiness=sources()
    if (ROOT/"candidates").exists():
        cached=subprocess.run(["node",str(REPO/"tools/private-opening/gate.mjs"),"--candidate"],capture_output=True,text=True)
        if cached.returncode==0:
            print("Verified immutable candidate cache; visual promotion remains a separate gate"); return
        raise RuntimeError("Immutable candidates exist but failed verification; preserve them before a versioned replacement. "+cached.stdout)
    out=Path(tempfile.mkdtemp(prefix=".candidate-",dir=ROOT)); os.chmod(out,0o700)
    receipt={"schemaVersion":1,"createdAt":datetime.now(timezone.utc).isoformat(),"scope":"private-local","blenderVersion":bpy.app.version_string,"ledgerSha256":readiness["ledgerSha256"],"contractSha256":sha(CONTRACT_FILE),"recipeSha256":sha(__file__),"authoring":"generated-from-scratch; textual character specifications; original mesh/material/rig code; no external binary inputs","assets":[]}
    for character,builder in zip(CONTRACT["characters"],[ash,pikachu]):
        bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete(use_global=False)
        for mesh in list(bpy.data.meshes):
            if mesh.users==0: bpy.data.meshes.remove(mesh)
        for mat in list(bpy.data.materials):
            if mat.users==0: bpy.data.materials.remove(mat)
        root,limbs=builder()
        root["canonicalId"]=character["canonicalId"]; root["form"]=character["form"]
        root["identityPlane"]="canonical-private-local"; root["authoredHeightMeters"]=character["heightMeters"]
        # One Blender unit = one metre. Uniformly fit the full character to its
        # declared staging height; do not distort width, ears or tail separately.
        bpy.context.view_layer.update()
        points=[o.matrix_world@Vector(c) for o in root.children_recursive if o.type=="MESH" for c in o.bound_box]
        height=max(p.z for p in points)-min(p.z for p in points)
        root.scale=(character["heightMeters"]/height,)*3
        animate(root,limbs,character["clips"])
        qa=mesh_qa(root)
        if not qa["ok"]: raise RuntimeError(json.dumps(qa))
        for obj in bpy.context.scene.objects: obj.select_set(obj==root or obj in root.children_recursive)
        file=out/(character["id"]+".glb")
        bpy.ops.export_scene.gltf(filepath=str(file),export_format="GLB",use_selection=True,export_animations=True,export_animation_mode="NLA_TRACKS",export_extras=True,export_yup=True)
        blend=out/(character["id"]+".blend")
        bpy.ops.wm.save_as_mainfile(filepath=str(blend))
        materials=sorted({mat.name for obj in root.children_recursive if obj.type=="MESH" for mat in obj.data.materials})
        sockets=sorted(obj["socket"] for obj in root.children_recursive if "socket" in obj)
        receipt["assets"].append({"id":character["id"],"path":character["candidate"],"sha256":sha(file),"bytes":file.stat().st_size,"blend":{"path":"candidates/"+blend.name,"sha256":sha(blend)},"meshQa":qa,"materials":materials,"sockets":sockets,"clips":character["clips"]})
    if sources()["ledgerSha256"]!=readiness["ledgerSha256"]: raise RuntimeError("SOURCE_CHANGED_DURING_AUTHORING")
    (out/"receipt.json").write_text(json.dumps(receipt,indent=2)+"\n")
    for file in out.iterdir(): os.chmod(file,0o600)
    out.rename(ROOT/"candidates")
    print("CANDIDATES_ONLY: structural checks passed; DCC, fixed views, gameplay and motion review required")


if __name__=="__main__": main()
