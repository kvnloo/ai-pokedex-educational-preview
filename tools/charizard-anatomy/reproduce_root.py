"""Replay the surface pass and optional strip repair from frozen r02a."""
import argparse
import bpy
import hashlib
import json
import sys
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--out', required=True)
parser.add_argument('--through', choices=['r02d', 'r02e'], default='r02d')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
destination = Path(args.out).resolve()
assert destination.is_relative_to('/mnt/zer0models')
assert not destination.exists(), 'Use a new verification directory'
destination.mkdir()
lane = Path(__file__).resolve().parents[2]
batch = json.loads((lane / 'canonical/characters/charizard/root-surface-batch/manifest.json').read_text())
for source_record in [batch['source']['parentManifest'], *batch['dependencies']]:
    source_path = lane / source_record['path'] if source_record['pathRoot'] == 'repository' else Path(source_record['path'])
    assert source_path.stat().st_size == source_record['bytes'], source_path
    assert hashlib.sha256(source_path.read_bytes()).hexdigest() == source_record['sha256'], source_path
manifest = json.loads((lane / 'canonical/characters/charizard/tail-r02a/manifest.json').read_text())
parent_record = next(item for item in manifest['files'] if item['path'].endswith('charizard-tail-r02a.blend'))
parent = Path(parent_record['path'])
assert hashlib.sha256(parent.read_bytes()).hexdigest() == parent_record['sha256']
with bpy.data.libraries.load(str(parent), link=False) as (available, loaded):
    assert 'EDIT-charizard-tail-r02a' in available.scenes
    loaded.scenes = ['EDIT-charizard-tail-r02a']
scripts = Path(__file__).resolve().parent
region_directory = str(destination / 'region')
exec(compile((scripts / 'root_region.py').read_text(), str(scripts / 'root_region.py'), 'exec'))
region_file_path = str(destination / 'region/region.npz')
candidate_suffix = 'r02d'
surface_normal_mode = 'pca'
candidate_directory = str(destination / 'r02d')
exec(compile((scripts / 'mls_root.py').read_text(), str(scripts / 'mls_root.py'), 'exec'))
candidate_id = 'charizard-tail-r02d'
exec(compile((scripts / 'render_candidate.py').read_text(), str(scripts / 'render_candidate.py'), 'exec'))
if args.through == 'r02e':
    strip_directory = str(destination / 'r02e')
    exec(compile((scripts / 'repair_root_strip.py').read_text(), str(scripts / 'repair_root_strip.py'), 'exec'))
    exec(compile((scripts / 'save_native_patch.py').read_text(), str(scripts / 'save_native_patch.py'), 'exec'))
    candidate_id = 'charizard-tail-r02e'
    candidate_directory = strip_directory
    exec(compile((scripts / 'render_candidate.py').read_text(), str(scripts / 'render_candidate.py'), 'exec'))
    detail_root = str(destination)
    exec(compile((scripts / 'render_strip_detail.py').read_text(), str(scripts / 'render_strip_detail.py'), 'exec'))
