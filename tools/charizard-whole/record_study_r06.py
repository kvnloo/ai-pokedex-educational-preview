"""Freeze receipts and hashes for the inspected r06 study without editing binaries."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06')
destination = lane/'canonical/characters/charizard/whole-r06'
checkpoint = destination/'checkpoint.json'
assert not checkpoint.exists()
names = [
    'export.json', 'reopen.json', 'neck-audit.json', 'neck-bridge-preparation.json',
    'neck-union.json', 'bridge-selection.json', 'bridge-linear-targets.json',
    'muzzle-transform.json', 'jaw-close-transform.json', 'eye-surface-fit.json',
    'gui-modeling.jsonl',
]
for name in names:
    target = destination/name
    content = (root/name).read_bytes()
    assert not target.exists() or target.read_bytes() == content
    if not target.exists():
        with target.open('xb') as stream:
            stream.write(content)
browser = json.loads((root/'browser-verified/availability.json').read_text())
with (destination/'browser-availability.json').open('x') as stream:
    stream.write(json.dumps(browser, indent=2)+'\n')
export = json.loads((root/'export.json').read_text())
audit = json.loads((root/'neck-audit.json').read_text())
assert export['triangles'] == audit['totalTriangles'] == 296720
assert browser['errors'] == [] and len(browser['checks']) == 12
assert audit['shaMatchesExportReceipt'] and audit['bodyBoundsMatchReceiptExactly']
artifacts = []
for path in sorted(root.rglob('*')):
    if path.is_file():
        artifacts.append({
            'path': str(path.relative_to(root)),
            'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        })
for expected in export['artifacts']:
    actual = next(item for item in artifacts if root/item['path'] == Path(expected['path']))
    assert actual['bytes'] == expected['bytes'] and actual['sha256'] == expected['sha256']
record = {
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'status': 'unfinished geometry study; not promoted; goal remains active',
    'privateRoot': str(root),
    'scene': 'EDIT-charizard-whole-r06',
    'source': export['artifacts'][0],
    'glb': export['artifacts'][1],
    'geometry': {key: export[key] for key in ['vertices', 'triangles', 'meshes', 'animationClips', 'textureImages']},
    'retained': ['shorter muzzle', 'three-degree jaw closure', 'local lower-lip cleanup', 'continuous linear neck bridge'],
    'provisional': ['surface-fitted eyes; gaze and lids still fail'],
    'rejected': ['Exact Boolean neck union', 'default curved bridge interpolation'],
    'visualVerdict': 'Local construction gains; likeness remains below target. See review.md and all whole-body views.',
    'matchedPair': ['charizard-whole-r06-intake', 'charizard-whole-r06'],
    'checks': {
        'sourceAndGLBReopened': True,
        'reopenScope': 'Counts, bounds, edge manifoldness and zero-area tessellation; no separate finite assertion.',
        'finiteCoordinates': 'Export script and independent CPU GLB import.',
        'neckIntersectionScope': audit['scope'],
        'neckTrianglesTested': audit['neckROI']['trianglesTested'],
        'neckDetectorPairs': audit['neckROI']['detectorPairs'],
        'browser': browser,
        'rootViewed': ['eight reopened GLB stills', 'four matched head pairs', 'desktop comparison screenshot', 'phone inspector screenshot'],
        'animationPlayback': False,
        'deviceAcceptance': False,
    },
    'limitations': export['knownLimitations'],
    'fieldOSDeploymentChanged': False,
    'humanReviewsChanged': False,
    'mergeOrPush': False,
    'next': 'Compare untouched official HOME61061 head against illustration61062 before further source commitment; then correct gaze/lids, jaw/nasal shape and horns.',
    'artifacts': artifacts,
}
with checkpoint.open('x') as stream:
    stream.write(json.dumps(record, indent=2)+'\n')
print(json.dumps({'checkpoint': str(checkpoint), 'artifacts': len(artifacts), 'sourceSHA256': record['source']['sha256'], 'glbSHA256': record['glb']['sha256']}))
