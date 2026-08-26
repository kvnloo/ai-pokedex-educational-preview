#!/usr/bin/env python3
"""Freeze helper retained behind the product-quality invalidation gate."""
from __future__ import annotations
import hashlib, json, os, shutil
from pathlib import Path
ROOT=Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve(strict=True)
REPO_ROOT=Path(__file__).resolve().parents[1]
asset_manifest=json.loads((REPO_ROOT/"experiments"/"bulbasaur-001"/"animation-asset-manifest.v1.json").read_text())
if asset_manifest.get("status") == "product-quality-invalidated-research-only":
    raise RuntimeError("FAIL CLOSED: product-quality authority was reopened; research artifact cannot be finalized")
contract=json.loads((ROOT/"animation-markers.v1.json").read_text())
revision=os.environ["BULBASAUR_REPO_REVISION"]
if len(revision) != 40 or any(character not in "0123456789abcdef" for character in revision):
    raise RuntimeError("FAIL CLOSED: BULBASAUR_REPO_REVISION must be a lowercase 40-character commit")
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
# Revision-bound packet summary is written before the recursive hash manifest.
qa=json.loads((ROOT/"qa-animation.json").read_text())
canonical=json.loads((ROOT/"canonical-digest.v1.json").read_text())
frames=json.loads((ROOT/"frame-manifest.v1.json").read_text())
deformation=json.loads((ROOT/"qa-deformation.json").read_text())
if qa["status"] != "PASS" or deformation["status"] != "PASS":
    raise RuntimeError("FAIL CLOSED: cannot finalize a failing packet")
packet={
    "schemaVersion":1,
    "asset":"bulbasaur-c-production-animation-v3",
    "builderRevision":revision,
    "canonicalBuildDigest":canonical["canonicalBuildDigest"],
    "semanticAnimationDigest":canonical["semanticAnimationDigest"],
    "canonicalFrameStateDigest":canonical["canonicalFrameStateDigest"],
    "evaluatedFrames":deformation["evaluatedFrames"],
    "primaryRenderedFrames":sum(item["frameCount"] for item in frames["clips"].values()),
    "fixedSideRenderedFrames":sum(item["frameCount"] for item in frames["sideClips"].values()),
    "clipCount":len(contract["clips"]),
    "anonymousCandidateCount":len(decode),
    "manualAnimationHours":qa["manualAnimationHours"],
    "scopeGuards":{"builderCanPromote":False,"productIntegration":False,"publication":False,"merge":False},
}
(ROOT/"PACKET_MANIFEST.json").write_text(json.dumps(packet,indent=2,sort_keys=True)+"\n")
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
