#!/usr/bin/env python3
"""Fail-closed reopen audit for a manual Bulbasaur E1 Blender master."""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path
import bpy, bmesh


def argv(): return sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []

def main():
    p=argparse.ArgumentParser(); p.add_argument("--expected-variant",choices=("A","B","C"),required=True); p.add_argument("--out",type=Path,required=True); a=p.parse_args(argv())
    meshes=sorted([o for o in bpy.data.objects if o.type=="MESH" and o.name!="STAGE_ground"],key=lambda o:o.name)
    names={o.name for o in meshes}; nm=0; zero=0; triangles=0
    for o in meshes:
        o.data.calc_loop_triangles(); triangles+=len(o.data.loop_triangles); zero+=sum(p.area<=1e-12 for p in o.data.polygons)
        bm=bmesh.new(); bm.from_mesh(o.data); nm+=sum(not e.is_manifold for e in bm.edges); bm.free()
    checks=[
      {"id":"variant","ok":bpy.context.scene.get("hypothesis_id")==a.expected_variant,"actual":bpy.context.scene.get("hypothesis_id")},
      {"id":"canonical-id","ok":bpy.context.scene.get("canonical_id")=="pokemon:001:standard"},
      {"id":"component-count","ok":len(meshes)==55,"actual":len(meshes)},
      {"id":"limbs","ok":sum(n.startswith("limb_") for n in names)==4},
      {"id":"feet","ok":sum(n.startswith("foot_") for n in names)==4},
      {"id":"toes","ok":sum(n.startswith("toe_") for n in names)==12},
      {"id":"bulb-lobes","ok":sum(n.startswith("bulb_lobe_") for n in names)==6},
      {"id":"vine-sockets","ok":{"vine_root_socket_L","vine_root_socket_R"}<=names},
      {"id":"topology","ok":nm==0 and zero==0,"nonManifoldEdges":nm,"zeroAreaFaces":zero},
      {"id":"triangle-burden","ok":triangles<=180000,"actual":triangles}
    ]
    result={"schema":"pokemon.bulbasaur.manual-reopen/v1","blend":bpy.data.filepath,"variant":a.expected_variant,"ok":all(c["ok"] for c in checks),"checks":checks}
    a.out.parent.mkdir(parents=True,exist_ok=True); a.out.write_text(json.dumps(result,indent=2)+"\n"); print(json.dumps(result))
    return 0 if result["ok"] else 1
if __name__=="__main__": raise SystemExit(main())
