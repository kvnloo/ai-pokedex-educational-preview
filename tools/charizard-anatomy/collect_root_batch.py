"""Pin the successful and rejected surface candidates with their actual evidence."""
import hashlib
import json
import shutil
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
workspace = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon')
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02')
tracked = lane / 'canonical/characters/charizard/root-surface-batch'
tracked.mkdir(parents=True, exist_ok=True)

for suffix in ['r02b', 'r02c', 'r02d', 'r02e']:
    destination = tracked / suffix
    destination.mkdir(exist_ok=True)
    for source in (root / suffix).glob('*.json'):
        shutil.copy2(source, destination / source.name)
audit = tracked / 'audit'
audit.mkdir(exist_ok=True)
for source in (root / 'audit-root-surface').iterdir():
    if source.suffix in ['.json', '.md']:
        shutil.copy2(source, audit / source.name)
for source in [root / 'reproduction-root-pca/comparison.json', root / 'reproduction-root-final/comparison-r02e.json', root / 'reproduction-root-pinned/comparison-r02e.json']:
    shutil.copy2(source, tracked / (source.parent.name + '-' + source.name))
log = (workspace / 'discovery/charizard/decisions.tsv').read_text().splitlines()
(tracked / 'decisions-snapshot.tsv').write_text('\n'.join([log[0]] + [line for line in log[1:] if '\tcharizard-root-' in line]) + '\n')

def record(path, repository=False):
    return {'path': str(path.relative_to(lane) if repository else path), 'pathRoot': 'repository' if repository else 'filesystem', 'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}

candidate_files = [path for suffix in ['r02b', 'r02c', 'r02d', 'r02e'] for path in (root / suffix).iterdir() if path.suffix in ['.blend', '.glb', '.png', '.npz', '.py', '.json']]
replay_files = [path for folder in ['reproduction-root-pca', 'reproduction-root-final', 'reproduction-root-pinned'] for path in (root / folder).rglob('*') if path.is_file() and path.suffix in ['.blend', '.glb', '.png', '.npz', '.json']]
dependencies = [root / 'r02a/charizard-tail-r02a.blend', root / 'r02a/charizard-tail-r02a.glb', root / 'r02a/vertex-audit.npz', root / 'audit-root-surface/r02d-intersection-details.json', workspace / 'assets/blender/charizard-fair-review/charizard-official-61062-o256.json']
dependencies.append(workspace / 'assets/experiments/charizard-official-raw/charizard-official-raw-61062-o256.glb')
old_scripts = {'tail_patch.py', 'render_tail.py', 'render_tail_closeups.py', 'reproduce_tail.py', 'compare_reproduction.py', 'collect_manifest.py', 'register_experiment.py', 'browser_check.mjs', 'reopen_glb.py', 'validate_tail_patch.py'}
new_scripts = [path for path in Path(__file__).parent.rglob('*') if path.is_file() and path.suffix in ['.py', '.mjs'] and path.name not in old_scripts]
reports = [path for path in tracked.rglob('*') if path.is_file() and path.name not in ['manifest.json', 'delivery.json']]
manifest = {
    'id': 'charizard-root-surface-batch',
    'status': 'r02e retained as a local geometry checkpoint; full Charizard and S+ gates open',
    'source': {'parent': 'charizard-tail-r02a', 'parentManifest': record(lane / 'canonical/characters/charizard/tail-r02a/manifest.json', True), 'officialAncestor': 'charizard-official-raw-61062-o256', 'inputs': json.loads((tracked / 'r02e-experiment.json').read_text())['inputs'], 'newImageInputs': []},
    'authoring': 'Root through Blender MCP; independent CPU diagnosis and validation delegated read-only',
    'candidates': [
        {'id': 'charizard-tail-r02b', 'parent': 'charizard-tail-r02a', 'decision': 'rejected: visible ribs remain after native smoothing'},
        {'id': 'charizard-tail-r02c', 'parent': 'charizard-tail-r02a', 'decision': 'rejected: 48 reversed triangles and 50 local intersections'},
        {'id': 'charizard-tail-r02d', 'parent': 'charizard-tail-r02a', 'decision': 'rejected standalone: useful PCA-normal surface fit, but 12 local intersections'},
        {'id': 'charizard-tail-r02e', 'parent': 'charizard-tail-r02d', 'decision': 'assistant provisional choice: collar patch preserves retained coordinates; zero detected local intersections'},
    ],
    'files': [record(path) for path in sorted(candidate_files)],
    'replayFiles': [record(path) for path in sorted(replay_files)],
    'dependencies': [record(path) for path in dependencies],
    'scripts': [record(path, True) for path in sorted(new_scripts)],
    'reports': [record(path, True) for path in sorted(reports)],
    'validation': {'protectedVerticesExact': 112475, 'protectedOrientedTrianglesExact': 224371, 'localIntersectionPairs': {'r02a': 2, 'r02d': 12, 'r02e': 0}, 'scope': 'same wider root bounds in audit/r02d-validation.json; shared-vertex and numerical limitations apply', 'wholeModelIntersectionFreedom': False, 'reproduction': 'exact exported geometry, transforms, audit arrays, native patch and all eight rendered views', 'blenderReopened': True},
    'runtime': {'meshes': 2, 'vertices': 126852, 'triangles': 253700, 'uvLayers': 0, 'materialSlots': 0, 'textureMaps': [], 'animationClips': [], 'rigged': False, 'approvedForGame': False},
    'review': {'assistant': 'local collar surface is smoother; head/limbs/wings still visibly malformed', 'human': 'pending', 'browser': json.loads((root / 'r02e/browser-check.json').read_text())['status']},
    'knownCompromises': ['Tail proportions and broad proximal ovality remain provisional', 'This local triangulated repair is not final deformation topology', 'Head, horns, hands, feet and wing attachments need manual correction', 'No UVs/PBR, rig, clips, attacks or game promotion', 'No whole-model or separate flame/body intersection claim'],
    'deployment': {'fieldOS': 'https://0.taila30dc.ts.net:8469/pokedex.html', 'unchangedRelease': 'f85e3ae295feec02', 'realS25Acceptance': 'pending', 'meshPromotedToGame': False},
}
(tracked / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
records = [manifest['source']['parentManifest']] + [item for group in ['files', 'replayFiles', 'dependencies', 'scripts', 'reports'] for item in manifest[group]]
for item in records:
    path = lane / item['path'] if item['pathRoot'] == 'repository' else Path(item['path'])
    assert path.stat().st_size == item['bytes'] and hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256'], path
print(json.dumps({'manifest': str(tracked / 'manifest.json'), 'verifiedFiles': len(records)}))
