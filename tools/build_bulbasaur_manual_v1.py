#!/usr/bin/env python3
"""Deterministically author and capture component-separated Bulbasaur E1 hypotheses.

Run with Blender 5.2: blender --background --factory-startup --python this.py -- ...
This script consumes only the authored numeric contract. It imports no generated mesh.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
import sys
import time
from pathlib import Path

import bpy
from mathutils import Vector

VARIANTS = {
    "A": {"body": (0.44, 0.55, 0.27), "head": (0.43, 0.34, 0.31), "head_z": 0.39, "bulb_z": 0.66, "bulb_scale": 1.00},
    "B": {"body": (0.46, 0.50, 0.26), "head": (0.47, 0.31, 0.29), "head_z": 0.38, "bulb_z": 0.65, "bulb_scale": 0.97},
    "C": {"body": (0.46, 0.50, 0.26), "head": (0.43, 0.34, 0.31), "head_z": 0.39, "bulb_z": 0.69, "bulb_scale": 1.10},
}
ROLES = [("front",0),("front-right-diagnostic",22.5),("front-right",45),("right",90),("rear-right-diagnostic",112.5),("rear-right",135),("rear",180),("rear-left-diagnostic",202.5),("rear-left",225),("left",270),("front-left-diagnostic",292.5),("front-left",315)]
PALETTE = {
    "skin": (0.20, 0.61, 0.53, 1), "spot": (0.08, 0.34, 0.35, 1), "bulb": (0.18, 0.48, 0.24, 1),
    "bulb_dark": (0.08, 0.27, 0.13, 1), "eye": (0.64, 0.05, 0.08, 1), "pupil": (0.025,0.02,0.02,1),
    "mouth": (0.08,0.018,0.022,1), "tongue": (0.62,0.15,0.20,1), "claw": (0.88,0.83,0.65,1), "socket": (0.56,0.20,0.72,1),
}


def sha(path: Path) -> str:
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024), b""): h.update(chunk)
    return h.hexdigest()


def mat(name, color, rough=.72, metallic=0.0):
    m=bpy.data.materials.new(name); m.diffuse_color=color; m.use_nodes=True
    bs=m.node_tree.nodes.get("Principled BSDF"); bs.inputs["Base Color"].default_value=color; bs.inputs["Roughness"].default_value=rough; bs.inputs["Metallic"].default_value=metallic
    return m


def finish(obj, name, material, component, role="surface"):
    obj.name=name; obj.data.name=f"MESH_{name}"; obj.data.materials.append(material)
    obj["component_id"]=component; obj["mesh_role"]=role; obj["authored_source"]="manual_numeric_v1"; obj["physical_only"]=True
    bpy.ops.object.shade_smooth()
    for p in obj.data.polygons: p.use_smooth=True
    return obj


def uv(name, loc, scale, material, component, seg=32, rings=20, rot=(0,0,0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, location=loc, rotation=rot)
    o=bpy.context.object; o.scale=scale; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bev=o.modifiers.new("authored_subdivision","SUBSURF"); bev.levels=1; bev.render_levels=1
    return finish(o,name,material,component)


def cone(name, loc, radius, depth, material, component, rot=(0,0,0), vertices=24):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=radius*.12, depth=depth, location=loc, rotation=rot)
    o=bpy.context.object; b=o.modifiers.new("edge_softening","BEVEL"); b.width=.018; b.segments=3
    return finish(o,name,material,component)


def torus(name, loc, major, minor, material, component, rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=32, minor_segments=10, location=loc, rotation=rot)
    return finish(bpy.context.object,name,material,component)


def build(variant: str):
    cfg=VARIANTS[variant]
    bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        pass
    materials={k:mat(f"MAT_{k}",v) for k,v in PALETTE.items()}
    clay=mat("MAT_clay",(0.36,0.44,0.54,1)); wire=mat("MAT_wire",(0.025,0.025,0.03,1)); idm={}
    scene=bpy.context.scene; scene["canonical_id"]="pokemon:001:standard"; scene["hypothesis_id"]=variant; scene["units"]="meters"; scene["export_up"]="+Y"; scene["export_forward"]="+Z"; scene["builder_can_promote"]=False
    scene.unit_settings.system="METRIC"; scene.unit_settings.scale_length=1.0
    # torso, chest and head/muzzle are intentionally independent sculpt components.
    uv("torso",(0,0.04,0.31),cfg["body"],materials["skin"],"torso",40,24)
    uv("chest",(0,-0.27,0.34),(0.36,0.30,0.28),materials["skin"],"chest",32,20)
    uv("head",(0,-0.43,cfg["head_z"]),cfg["head"],materials["skin"],"head",40,24)
    uv("muzzle",(0,-0.72,0.34),(0.32,0.15,0.16),materials["skin"],"muzzle",36,20)
    # paired triangular ears with nested dark inner fields.
    for side in (-1,1):
        s="L" if side<0 else "R"; cone(f"ear_{s}",(side*.30,-.48,.69),.135,.34,materials["skin"],f"ear_{s}",rot=(0,side*.30,side*.13))
        cone(f"ear_inner_{s}",(side*.305,-.515,.69),.067,.22,materials["spot"],f"ear_inner_{s}",rot=(0,side*.30,side*.13))
        uv(f"eye_{s}",(side*.195,-.724,.475),(.105,.035,.115),materials["eye"],f"eye_{s}",24,16,rot=(math.radians(8),0,side*math.radians(8)))
        uv(f"pupil_{s}",(side*.195,-.756,.485),(.035,.015,.07),materials["pupil"],f"pupil_{s}",20,12)
        uv(f"eye_glint_{s}",(side*.18,-.770,.525),(.014,.008,.020),materials["claw"],f"eye_glint_{s}",12,8)
    # mouth cavity, lower jaw/tongue and two visible teeth.
    uv("mouth_cavity",(0,-.825,.285),(.19,.025,.075),materials["mouth"],"mouth_cavity",32,16)
    uv("lower_jaw",(0,-.77,.245),(.25,.10,.075),materials["skin"],"lower_jaw",32,16)
    uv("tongue",(0,-.834,.262),(.105,.012,.035),materials["tongue"],"tongue",24,12)
    for side in (-1,1): cone(f"tooth_{side:+d}",(side*.12,-.845,.31),.018,.07,materials["claw"],f"tooth_{side:+d}",rot=(math.pi,0,0),vertices=16)
    # Four independent limbs; stance is intentionally asymmetric in Y and toe splay.
    limb_specs=[("front_L",-.27,-.39,.15),("front_R",.27,-.37,.15),("rear_L",-.31,.31,.16),("rear_R",.31,.28,.16)]
    for idx,(name,x,y,z) in enumerate(limb_specs):
        uv(f"limb_{name}",(x,y,z),(.16,.19,.17),materials["skin"],f"limb_{name}",28,18)
        uv(f"foot_{name}",(x,y-.08,.075),(.17,.20,.075),materials["skin"],f"foot_{name}",28,16)
        for toe in range(3):
            tx=x+(toe-1)*.055; ty=y-.245+(abs(toe-1)*.015)+(idx%2)*.008
            cone(f"toe_{name}_{toe+1}",(tx,ty,.058),.026,.105,materials["claw"],f"toe_{name}_{toe+1}",rot=(math.pi/2,0,0),vertices=16)
    # Six deliberately layered leaf-lobes and broad attachment collar.
    torus("bulb_attachment",(0,.06,.505),.26,.085,materials["bulb_dark"],"bulb_attachment")
    lobe_count=6
    for i in range(lobe_count):
        a=2*math.pi*i/lobe_count; radial=.15 if variant!="C" else .12
        loc=(math.sin(a)*radial, .08+math.cos(a)*radial, cfg["bulb_z"]+.03*math.cos(a))
        sc=(.18*cfg["bulb_scale"],.31*cfg["bulb_scale"],.12*cfg["bulb_scale"])
        uv(f"bulb_lobe_{i+1}",loc,sc,materials["bulb"],f"bulb_lobe_{i+1}",32,18,rot=(math.radians(18)*math.cos(a),0,-a))
    uv("bulb_core",(0,.08,cfg["bulb_z"]+.08),(.18,.19,.24*cfg["bulb_scale"]),materials["bulb_dark"],"bulb_core",32,20)
    # Authored spot masks/material islands, not projected image texture.
    spots=[("forehead",0,-.744,.55,.075,.025,.045),("cheek_L",-.29,-.67,.36,.085,.025,.055),("cheek_R",.29,-.67,.34,.07,.025,.045),("body_L",-.40,.00,.36,.065,.025,.09),("body_R",.40,.10,.30,.06,.025,.08),("rump",-.18,.50,.34,.09,.025,.065)]
    for n,x,y,z,sx,sy,sz in spots: uv(f"spot_{n}",(x,y,z),(sx,sy,sz),materials["spot"],f"spot_{n}",20,12)
    # Vine sockets are explicit physical roots only; vines are out of E1 scope.
    for side in (-1,1): torus(f"vine_root_socket_{'L' if side<0 else 'R'}",(side*.19,.23,.49),.037,.012,materials["socket"],f"vine_root_socket_{'L' if side<0 else 'R'}",rot=(math.pi/2,0,0))
    # Normalize the authored assembly to the exact common ground plane after toe
    # rotation and bevel evaluation; preserve all relative component placement.
    authored_meshes=[o for o in scene.objects if o.type=="MESH"]
    authored_min_z=min((o.matrix_world@Vector(c)).z for o in authored_meshes for c in o.bound_box)
    for o in authored_meshes:
        o.location.z-=authored_min_z
    bpy.context.view_layer.update()
    # Stable collections by semantic role.
    coll=bpy.data.collections.new("MANUAL_COMPONENTS"); scene.collection.children.link(coll)
    for o in list(scene.objects):
        if o.type=="MESH":
            for c in list(o.users_collection): c.objects.unlink(o)
            coll.objects.link(o)
    return materials, clay, wire


def bounds(meshes):
    pts=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
    return [min(p[i] for p in pts) for i in range(3)],[max(p[i] for p in pts) for i in range(3)]


def look_at(obj, target): obj.rotation_euler=(Vector(target)-obj.location).to_track_quat("-Z","Y").to_euler()


def setup_stage(meshes):
    scene=bpy.context.scene
    mn,mx=bounds(meshes); height=mx[2]-mn[2]; center=Vector(((mn[0]+mx[0])/2,(mn[1]+mx[1])/2,mn[2]+height*.52))
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0,0,-.001)); plane=bpy.context.object; plane.name="STAGE_ground"; plane.data.materials.append(mat("MAT_ground",(.055,.065,.078,1)))
    bpy.ops.object.light_add(type="AREA", location=(-3,-4,5)); key=bpy.context.object; key.name="LIGHT_key"; key.data.energy=800; key.data.shape="DISK"; key.data.size=4.0; look_at(key,center)
    bpy.ops.object.light_add(type="AREA", location=(3,1,3)); fill=bpy.context.object; fill.name="LIGHT_fill"; fill.data.energy=450; fill.data.size=3; look_at(fill,center)
    bpy.ops.object.light_add(type="AREA", location=(0,3,4)); rim=bpy.context.object; rim.name="LIGHT_rim"; rim.data.energy=700; rim.data.size=2; look_at(rim,center)
    world=scene.world or bpy.data.worlds.new("World"); scene.world=world; world.color=(.015,.02,.03)
    camera_data=bpy.data.cameras.new("CAM_frozen_data"); camera=bpy.data.objects.new("CAM_frozen",camera_data); scene.collection.objects.link(camera); scene.camera=camera
    camera.data.type="ORTHO"; camera.data.ortho_scale=height/.82
    return camera,center,height


def configure_render(out:Path):
    scene=bpy.context.scene; scene.render.engine="BLENDER_WORKBENCH"; scene.render.resolution_x=512; scene.render.resolution_y=512; scene.render.resolution_percentage=100
    scene.display.shading.light="STUDIO"; scene.display.shading.color_type="MATERIAL"; scene.display.shading.show_shadows=True; scene.display.shading.show_cavity=True
    scene.display.shading.background_type="WORLD"; scene.display.shading.studiolight_rotate_z=0.35
    scene.render.image_settings.file_format="PNG"; scene.render.image_settings.color_mode="RGBA"; scene.render.film_transparent=False; scene.render.dither_intensity=0
    scene.render.image_settings.color_depth="8"; scene.view_settings.look="AgX - Medium High Contrast"; scene.render.filepath=str(out)


def render_packet(out, variant, meshes, materials, clay, wire, camera, center, height):
    scene=bpy.context.scene; records=[]; original={o.name:list(o.data.materials) for o in meshes}; id_materials={}
    modes=("clay","flat-albedo","component-id","wireframe","grazing")
    for mode in modes:
        mode_dir=out/mode; mode_dir.mkdir(parents=True,exist_ok=True)
        for o in meshes:
            o.show_wire=(mode=="wireframe"); o.show_all_edges=(mode=="wireframe")
            if mode in ("clay","wireframe","grazing"):
                o.data.materials.clear(); o.data.materials.append(clay if mode!="wireframe" else wire)
            elif mode=="component-id":
                key=str(o.get("component_id"));
                if key not in id_materials:
                    d=hashlib.sha256(key.encode()).digest(); id_materials[key]=mat("ID_"+key,(.18+.72*d[0]/255,.18+.72*d[1]/255,.18+.72*d[2]/255,1),.8)
                o.data.materials.clear(); o.data.materials.append(id_materials[key])
            else:
                o.data.materials.clear(); [o.data.materials.append(m) for m in original[o.name]]
        bpy.data.objects["LIGHT_key"].data.energy=140 if mode=="grazing" else 800
        bpy.data.objects["LIGHT_fill"].data.energy=40 if mode=="grazing" else 450
        bpy.data.objects["LIGHT_rim"].data.energy=1200 if mode=="grazing" else 700
        for role,deg in ROLES:
            a=math.radians(deg); dist=3.2; camera.location=(math.sin(a)*dist,-math.cos(a)*dist,center.z+.08); look_at(camera,center)
            target=mode_dir/f"{role}.png"; configure_render(target); bpy.ops.render.render(write_still=True)
            # Canonical 6-bit/channel encoding strips volatile PNG metadata and
            # keeps labels-hidden packets byte-stable across clean processes.
            subprocess.run(["magick",str(target),"+dither","-posterize","64","-strip","-define","png:exclude-chunks=all",str(target)],check=True)
            records.append({"mode":mode,"role":role,"azimuthDeg":deg,"path":str(target.relative_to(out)),"sha256":sha(target),"bytes":target.stat().st_size,"cameraLocation":[round(v,6) for v in camera.location],"orthoScale":camera.data.ortho_scale})
    return records


def audit(meshes):
    import bmesh
    comps=[]; total_tri=0; total_nonman=0; total_zero=0
    for o in meshes:
        me=o.data; me.calc_loop_triangles(); bm=bmesh.new(); bm.from_mesh(me); nm=sum(1 for e in bm.edges if not e.is_manifold); bm.free(); zero=sum(1 for p in me.polygons if p.area<=1e-12)
        rec={"name":o.name,"componentId":o.get("component_id"),"vertices":len(me.vertices),"triangles":len(me.loop_triangles),"nonManifoldEdges":nm,"zeroAreaFaces":zero,"dimensionsM":[round(v,6) for v in o.dimensions]}; comps.append(rec); total_tri+=rec["triangles"]; total_nonman+=nm; total_zero+=zero
    mn,mx=bounds(meshes); dims=[mx[i]-mn[i] for i in range(3)]
    names={o.name for o in meshes}; required={"torso","head","muzzle","mouth_cavity","lower_jaw","bulb_attachment","bulb_core","vine_root_socket_L","vine_root_socket_R"}
    limb_count=sum(n.startswith("limb_") for n in names); foot_count=sum(n.startswith("foot_") for n in names); toe_count=sum(n.startswith("toe_") for n in names); lobe_count=sum(n.startswith("bulb_lobe_") for n in names)
    checks=[
      {"id":"required-components","ok":required<=names,"missing":sorted(required-names)}, {"id":"exact-limbs","ok":limb_count==4,"actual":limb_count},
      {"id":"exact-feet","ok":foot_count==4,"actual":foot_count},{"id":"exact-toes","ok":toe_count==12,"actual":toe_count},{"id":"bulb-lobes","ok":lobe_count==6,"actual":lobe_count},
      {"id":"common-ground","ok":abs(mn[2])<=.003,"minZ":mn[2]}, {"id":"no-slab","ok":min(dims)/max(dims)>.40,"boundsDimensionsM":dims,"ratio":min(dims)/max(dims)},
      {"id":"zero-area","ok":total_zero==0,"actual":total_zero},{"id":"closed-components","ok":total_nonman==0,"actualNonManifoldEdges":total_nonman},
      {"id":"sculpt-manageable","ok":total_tri<=180000,"triangles":total_tri,"budget":180000}
    ]
    return {"ok":all(c["ok"] for c in checks),"checks":checks,"components":comps,"topologyBurden":{"triangles":total_tri,"componentCount":len(meshes),"estimate":"moderate; component-separated subdivision source, retopo still required after E2"}}


def parse():
    argv=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
    p=argparse.ArgumentParser(); p.add_argument("--variant",choices=VARIANTS,required=True); p.add_argument("--contract",type=Path,required=True); p.add_argument("--out",type=Path,required=True); return p.parse_args(argv)


def main():
    args=parse(); start=time.monotonic(); contract=json.loads(args.contract.read_text()); args.out.mkdir(parents=True,exist_ok=True)
    if sha(Path(args.contract))=="": raise RuntimeError("unreachable")
    materials,clay,wire=build(args.variant); meshes=sorted([o for o in bpy.data.objects if o.type=="MESH" and o.name!="STAGE_ground"],key=lambda o:o.name)
    report=audit(meshes)
    if not report["ok"]: (args.out/"mesh-audit.json").write_text(json.dumps(report,indent=2)+"\n"); raise RuntimeError("mesh audit failed")
    camera,center,height=setup_stage(meshes)
    blend=args.out/f"bulbasaur_manual_v1_{args.variant}.blend"; bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True,relative_remap=True)
    records=render_packet(args.out/"renders",args.variant,meshes,materials,clay,wire,camera,center,height)
    report.update({"schema":"pokemon.bulbasaur.manual-mesh-audit/v1","variant":args.variant,"blend":{"path":blend.name,"sha256":sha(blend),"bytes":blend.stat().st_size},"contractSha256":sha(args.contract),"sourceImports":[],"generatedMeshReuse":False})
    (args.out/"mesh-audit.json").write_text(json.dumps(report,indent=2)+"\n")
    manifest={"schema":"pokemon.bulbasaur.manual-evidence/v1","variant":args.variant,"canonicalId":contract["canonicalId"],"builderMayPromote":False,"blenderVersion":bpy.app.version_string,"contract":{"path":str(args.contract),"sha256":sha(args.contract)},"blend":report["blend"],"renderCount":len(records),"renders":records,"manualConstructionMinutes":round((time.monotonic()-start)/60,2),"sourceBoundary":{"officialPixelsImported":False,"generatedMeshesImported":False,"construction":"artist-controlled deterministic primitive/curve/subdivision composition"}}
    (args.out/"evidence-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print(json.dumps({"ok":True,"variant":args.variant,"blend":str(blend),"renders":len(records),"triangles":report["topologyBurden"]["triangles"]}))

if __name__=="__main__": main()
