#!/usr/bin/env bash
# Generate GLB via local Hunyuan3D API (shape-only by default for 12GB VRAM).
set -euo pipefail
unset PYTHONPATH
export PYTHONNOUSERSITE=1

IMG="${1:?usage: hy3d_generate.sh <image> <out.glb> [texture=0|1]}"
OUT="${2:?}"
TEXTURE="${3:-0}"
API="${HY3D_API:-http://127.0.0.1:8081}"
PY=/workspace/venv/hunyuan3d/venv/bin/python

"$PY" - <<PY
import base64, json, sys, time, pathlib, urllib.request

api = "${API}"
img_path = pathlib.Path("${IMG}")
out_path = pathlib.Path("${OUT}")
texture = "${TEXTURE}" == "1"

raw = img_path.read_bytes()
b64 = base64.b64encode(raw).decode()
payload = {
    "image": b64,
    "remove_background": True,
    "texture": texture,
    "seed": 42,
    "octree_resolution": 256,
    "num_inference_steps": 20 if not texture else 10,
    "guidance_scale": 5.5,
    "num_chunks": 8000,
    "face_count": 25000,
    "type": "glb",
}

def post(path, data=None, timeout=600):
    req = urllib.request.Request(
        api + path,
        data=None if data is None else json.dumps(data).encode(),
        headers={"Content-Type": "application/json"} if data is not None else {},
        method="POST" if data is not None else "GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read(), r.headers

# health
try:
    st, body, _ = post("/health")
    print("health", st, body[:200])
except Exception as e:
    print("HEALTH FAIL", e)
    sys.exit(2)

# try sync generate first
print("POST /generate texture=", texture)
try:
    req = urllib.request.Request(
        api + "/generate",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=900) as r:
        ctype = r.headers.get("Content-Type", "")
        data = r.read()
        if "json" in ctype:
            print("json response", data[:500])
            sys.exit(3)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(data)
        print("wrote", out_path, "bytes", len(data))
        sys.exit(0)
except Exception as e:
    print("sync generate failed:", e)

# async fallback
print("POST /send")
st, body, _ = post("/send", payload, timeout=120)
info = json.loads(body)
uid = info.get("uid") or info.get("id")
print("uid", uid, info)
if not uid:
    sys.exit(4)
for i in range(180):
    time.sleep(5)
    req = urllib.request.Request(api + f"/status/{uid}")
    with urllib.request.urlopen(req, timeout=60) as r:
        j = json.loads(r.read())
    status = j.get("status")
    print(f"[{i}] status={status}")
    if status == "completed":
        m = j.get("model_base64")
        if not m:
            print("no model_base64", j.keys()); sys.exit(5)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(base64.b64decode(m))
        print("wrote", out_path)
        sys.exit(0)
    if status == "error":
        print("error", j); sys.exit(6)
print("timeout"); sys.exit(7)
PY
