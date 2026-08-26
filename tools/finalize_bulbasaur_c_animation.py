#!/usr/bin/env python3
"""Freeze the private Bulbasaur C animation packet and anonymous media map."""
from __future__ import annotations
import hashlib, json, os, shutil
from pathlib import Path
ROOT=Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve(strict=True)
contract=json.loads((ROOT/"animation-markers.v1.json").read_text())
for backup in ROOT.glob("*.blend1"):
    backup.unlink()
blind=ROOT/"labels-hidden"; blind.mkdir(exist_ok=True)
decode={}
for index,entry in enumerate(contract["clips"],1):
    opaque=f"X{index:02d}"; clip=entry["clip"]; decode[opaque]=clip
    shutil.copy2(ROOT/"contact-sheets"/f"{clip}.png",blind/f"{opaque}.png")
    shutil.copy2(ROOT/"videos"/f"{clip}.mp4",blind/f"{opaque}.mp4")
(blind/"ANONYMOUS_MANIFEST.json").write_text(json.dumps({"schemaVersion":1,"candidates":[{"id":key,"image":f"{key}.png","video":f"{key}.mp4"} for key in decode]},indent=2,sort_keys=True)+"\n")
(ROOT/"LABELS_DECODE.json").write_text(json.dumps({"schemaVersion":1,"mapping":decode,"builderBallot":None,"promotionAuthority":False},indent=2,sort_keys=True)+"\n")
# Finalize exact recursive manifest after every other write. HASHES excludes itself.
manifest=ROOT/"HASHES.sha256"
if manifest.exists(): manifest.unlink()
files=sorted(path for path in ROOT.rglob('*') if path.is_file() and path!=manifest)
lines=[]
for path in files:
    with path.open('rb') as handle: digest=hashlib.file_digest(handle,'sha256').hexdigest()
    lines.append(f"{digest}  {path.relative_to(ROOT).as_posix()}")
manifest.write_text("\n".join(lines)+"\n")
with manifest.open('rb') as handle: print("FINAL_PACKET",len(files),hashlib.file_digest(handle,'sha256').hexdigest())
