#!/usr/bin/env python3
"""Run the private-local, hash-bound Bulbasaur Klein source tournament."""
from __future__ import annotations

import hashlib
import json
import pathlib
import shutil
import socket
import sys
import time
import urllib.request

API = "http://127.0.0.1:8188"
COMFY_OUTPUT = pathlib.Path("/mnt/zer0models/comfyui/output")
PRIVATE_ROOT = pathlib.Path(
    "/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/tournament/klein"
)
SEEDS = (6101, 6102, 6103, 6104)
SOURCE_SHA256 = "7233d8d8b03b5fa91d835a3069d25769155db93c9ef91b6066e215ed3895e9d8"

PROMPT = """Create one production-quality neutral studio character plate of standard non-shiny Bulbasaur #001. The input image is the canonical identity authority. Preserve the exact recognizable broad low quadruped proportions, large rounded head, short blunt muzzle, triangular ears with pink interiors, red eyes, two small upper fangs, turquoise-blue green body, irregular darker blue-green spots, three white claws on each paw, and the large layered closed green seed bulb rooted across the back. Show a centered full-body near-frontal three-quarter view with all four paws visibly grounded and separated, the entire bulb visible and uncropped, a straight neutral spine, relaxed animation-ready stance, and clean readable silhouette. Even soft studio lighting, orthographic-like camera, pale neutral seamless background, no cast shadow touching the silhouette. Exactly one Bulbasaur, four legs, one head, two ears, one bulb. No trainer, prop, text, border, panel, floor line, vines, leaves, flowers, tail, extra limb, missing paw, fused paw, generic frog, generic dinosaur, plastic toy, low-poly render, redesign, costume, or identity drift."""
NEGATIVE = """wrong species, generic creature, generic frog, generic dinosaur, Ivysaur, Venusaur, flower, open bulb, tail, vines, extra limbs, missing limbs, fused paws, missing claws, wrong eye color, missing fangs, wrong spots, tiny bulb, giant head, upright biped, cropped body, trainer, prop, text, logo, border, contact sheet, background slab, floor line, hard cast shadow, halo, low quality, low poly, plastic toy"""


def workflow(seed: int) -> dict[str, object]:
    return {
        "1": {"class_type": "LoadImage", "inputs": {"image": "bulbasaur-001/official-artwork.png"}},
        "2": {"class_type": "ImageScaleToTotalPixels", "inputs": {"image": ["1", 0], "upscale_method": "lanczos", "megapixels": 1.0, "resolution_steps": 1}},
        "5": {"class_type": "VAELoader", "inputs": {"vae_name": "flux2-vae.safetensors"}},
        "6": {"class_type": "VAEEncode", "inputs": {"pixels": ["2", 0], "vae": ["5", 0]}},
        "8": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen_3_4b.safetensors", "type": "flux2", "device": "default"}},
        "9": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["8", 0], "text": PROMPT}},
        "10": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["8", 0], "text": NEGATIVE}},
        "11": {"class_type": "ReferenceLatent", "inputs": {"conditioning": ["9", 0], "latent": ["6", 0]}},
        "13": {"class_type": "ReferenceLatent", "inputs": {"conditioning": ["10", 0], "latent": ["6", 0]}},
        "15": {"class_type": "UNETLoader", "inputs": {"unet_name": "flux-2-klein-base-4b-fp8.safetensors", "weight_dtype": "default"}},
        "16": {"class_type": "CFGGuider", "inputs": {"model": ["15", 0], "positive": ["11", 0], "negative": ["13", 0], "cfg": 5.0}},
        "17": {"class_type": "EmptyFlux2LatentImage", "inputs": {"width": 1024, "height": 1024, "batch_size": 1}},
        "18": {"class_type": "Flux2Scheduler", "inputs": {"steps": 20, "width": 1024, "height": 1024}},
        "19": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "euler"}},
        "20": {"class_type": "RandomNoise", "inputs": {"noise_seed": seed}},
        "21": {"class_type": "SamplerCustomAdvanced", "inputs": {"noise": ["20", 0], "guider": ["16", 0], "sampler": ["19", 0], "sigmas": ["18", 0], "latent_image": ["17", 0]}},
        "22": {"class_type": "VAEDecode", "inputs": {"samples": ["21", 0], "vae": ["5", 0]}},
        "23": {"class_type": "SaveImage", "inputs": {"images": ["22", 0], "filename_prefix": f"bulbasaur-001/klein/candidate-seed{seed}"}},
    }


def request_json(path: str, payload: dict[str, object] | None = None) -> dict[str, object]:
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(API + path, data=data, headers={"Content-Type": "application/json"} if data else {})
    with urllib.request.urlopen(req, timeout=60) as response:
        return json.loads(response.read())


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    PRIVATE_ROOT.mkdir(parents=True, exist_ok=True)
    records = []
    for seed in SEEDS:
        graph = workflow(seed)
        graph_path = PRIVATE_ROOT / f"workflow-seed{seed}.json"
        graph_path.write_text(json.dumps(graph, indent=2) + "\n")
        destination = PRIVATE_ROOT / f"candidate-seed{seed}.png"
        existing = sorted((COMFY_OUTPUT / "bulbasaur-001/klein").glob(f"candidate-seed{seed}_*.png"))
        if destination.exists() or existing:
            if not destination.exists():
                shutil.copyfile(existing[-1], destination)
            records.append({
                "seed": seed,
                "prompt_id": "recovered-from-comfy-output",
                "workflow_sha256": sha256(graph_path),
                "output": destination.name,
                "output_sha256": sha256(destination),
                "bytes": destination.stat().st_size,
            })
            print(f"recovered seed={seed} sha256={records[-1]['output_sha256']}", flush=True)
            continue
        queued = request_json("/prompt", {"prompt": graph})
        prompt_id = str(queued["prompt_id"])
        print(f"queued seed={seed} prompt_id={prompt_id}", flush=True)
        deadline = time.monotonic() + 900
        output_info = None
        while time.monotonic() < deadline:
            try:
                history = request_json(f"/history/{prompt_id}")
            except (TimeoutError, socket.timeout):
                print(f"history request timed out seed={seed}; inference may still be active", flush=True)
                time.sleep(2)
                continue
            entry = history.get(prompt_id)
            if entry:
                outputs = entry.get("outputs", {})
                images = outputs.get("23", {}).get("images", [])
                if images:
                    output_info = images[0]
                    break
                status = entry.get("status", {})
                if status.get("status_str") == "error":
                    raise RuntimeError(f"ComfyUI failed seed {seed}: {status}")
            time.sleep(2)
        if output_info is None:
            raise TimeoutError(f"ComfyUI timed out seed {seed}")
        source = COMFY_OUTPUT / str(output_info.get("subfolder", "")) / str(output_info["filename"])
        shutil.copyfile(source, destination)
        records.append({
            "seed": seed,
            "prompt_id": prompt_id,
            "workflow_sha256": sha256(graph_path),
            "output": destination.name,
            "output_sha256": sha256(destination),
            "bytes": destination.stat().st_size,
        })
        print(f"completed seed={seed} sha256={records[-1]['output_sha256']}", flush=True)
    manifest = {
        "schema": "pokemon.bulbasaur.klein-tournament.v1",
        "identity_authority_sha256": SOURCE_SHA256,
        "model": "flux-2-klein-base-4b-fp8.safetensors",
        "text_encoder": "qwen_3_4b.safetensors",
        "vae": "flux2-vae.safetensors",
        "records": records,
    }
    (PRIVATE_ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
