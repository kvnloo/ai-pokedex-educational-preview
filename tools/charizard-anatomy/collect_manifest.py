"""Pin private source/render files and copy small evidence into Git."""
import hashlib
import json
import shutil
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02')
out = root / 'r02a'
tracked = lane / 'canonical/characters/charizard/tail-r02a'
tracked.mkdir(parents=True, exist_ok=True)
reports = {
    'patch-receipt.json': out / 'patch-receipt.json',
    'camera-receipt.json': out / 'camera-receipt.json',
    'closeup-camera.json': out / 'closeup-camera.json',
    'blender-reopen.json': out / 'blender-reopen.json',
    'browser-check.json': out / 'browser-check.json',
    'browser-check-invalid-image-query.json': out / 'browser-check-invalid-image-query.json',
    'r02a-tracked-validation.json': root / 'audit/r02a-tracked-validation.json',
    'reproduction-comparison.json': root / 'reproduction-r3/comparison.json',
    'reproduction-validation.json': root / 'reproduction-r3/validation.json',
}
for name, source in reports.items():
    shutil.copy2(source, tracked / name)
def file_record(path, repository=False):
    return {'path': str(path.relative_to(lane) if repository else path), 'pathRoot': 'repository' if repository else 'filesystem', 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

manifest = {
    'id': 'charizard-tail-r02a', 'status': 'intermediate geometry repair; full tail and S+ gates open',
    'source': {'parent': 'charizard-tail-r01', 'officialAncestor': 'charizard-official-raw-61062-o256', 'input': json.loads((tracked / 'experiment.json').read_text())['inputs'][0]},
    'authoring': 'Root through Blender MCP; read-only CPU audit delegated',
    'files': [file_record(path) for path in sorted(out.iterdir()) if path.suffix in ['.blend', '.glb', '.png', '.npz']],
    'scripts': [file_record(path, repository=True) for path in sorted(Path(__file__).parent.iterdir()) if path.suffix in ['.py', '.mjs']],
    'reports': [file_record(tracked / name, repository=True) for name in reports],
    'runtime': {'meshes': 2, 'vertices': 126893, 'triangles': 253782, 'uvLayers': 0, 'textureMaps': [], 'animationClips': [], 'rigged': False, 'approvedForGame': False},
    'knownCompromises': ['Shallow lengthwise root ridges and moderate oval section', 'Head, limbs and wing connections unrefined', 'No authored UV/PBR, rig, animation or attacks', 'Local self-intersection test only; separate flame-to-body intersections not tested', 'Static flame reference remains inherited'],
    'review': {'assistant': 'seam improved; further anatomy work required', 'human': 'pending', 'browser': json.loads((out / 'browser-check.json').read_text())['status']},
    'rejectedVerificationOutput': {'path': str(root / 'reproduction'), 'reason': 'Loader read unevaluated flame matrix; superseded by reproduction-r3; preserved'},
    'deployment': 'Charizard WIP not promoted to game; live repaired Field OS8469 unchanged',
}
(tracked / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
log = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/discovery/charizard/decisions.tsv').read_text().splitlines()
(tracked / 'decisions-snapshot.tsv').write_text('\n'.join([log[0]] + [line for line in log[1:] if '/characters/charizard/anatomy-r02/' in line]) + '\n')
print(json.dumps({'privateFiles': len(manifest['files']), 'scripts': len(manifest['scripts']), 'manifest': str(tracked / 'manifest.json')}))
