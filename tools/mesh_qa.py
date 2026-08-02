#!/usr/bin/env python3
"""Fail closed mesh QA: reject cubes and paper-thin shells."""
import sys
from pathlib import Path

def main(path: str) -> int:
    import trimesh
    p = Path(path)
    m = trimesh.load(str(p), force="mesh")
    if isinstance(m, trimesh.Scene):
        geoms = list(m.geometry.values())
        if not geoms:
            print("FAIL empty scene"); return 2
        m = trimesh.util.concatenate(geoms)
    faces = len(m.faces)
    e = m.extents
    vr = float(m.volume / m.bounding_box.volume) if getattr(m, "is_volume", False) else 0.0
    thin = float(e.min() / max(e.max(), 1e-9))
    print(f"faces={faces} extents={e} vol_ratio={vr:.3f} min/max_extent={thin:.3f}")
    bad = False
    if vr > 0.75:
        print("FAIL cube-like volume_ratio>0.75"); bad = True
    if thin < 0.12:
        print("FAIL paper-thin min/max_extent<0.12"); bad = True
    if faces < 200:
        print("FAIL too few faces"); bad = True
    if faces > 100_000:
        print("WARN high face count for realtime", faces)
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
