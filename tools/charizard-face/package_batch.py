"""Snapshot textual evidence and hash the private skull/eye checkpoint artifacts."""
import hashlib
import json
import shutil
import struct
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
workspace = lane.parents[1]
private = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04')
batch = lane / 'canonical/characters/charizard/face-batch'


def eligible(path):
    return path.is_file() and '__pycache__' not in path.parts and path.suffix != '.pyc'


def record(path):
    data = path.read_bytes()
    return {
        'path': str(path.relative_to(lane)) if path.is_relative_to(lane) else str(path),
        'pathRoot': 'repository' if path.is_relative_to(lane) else 'private',
        'bytes': len(data),
        'sha256': hashlib.sha256(data).hexdigest(),
    }


for source in sorted(private.rglob('*')):
    if eligible(source) and source.suffix in {'.json', '.md', '.txt'}:
        target = batch / 'evidence' / source.relative_to(private)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)

log = (workspace / 'discovery/charizard/decisions.tsv').read_text().splitlines()
(batch / 'decisions-snapshot.tsv').write_text('\n'.join(
    [log[0]] + [row for row in log[1:] if '\tcharizard-face-' in row]
) + '\n')

inputs = json.loads((batch / 'inputs.json').read_text())
for entry in inputs['files']:
    path = lane / entry['path'] if entry['pathRoot'] == 'repository' else Path(entry['path'])
    assert record(path) == entry, path

glb = private / 'head-r18/charizard-head-r18.glb'
data = glb.read_bytes()
length, kind = struct.unpack_from('<II', data, 12)
assert kind == 0x4E4F534A
document = json.loads(data[20:20 + length])
assert len(document['scenes']) == 1 and len(document['meshes']) == 4
assert not any(document.get(name) for name in ['materials', 'textures', 'images', 'skins', 'animations'])
assert all('TEXCOORD_0' not in primitive['attributes']
           for mesh in document['meshes'] for primitive in mesh['primitives'])
primitives = [primitive for mesh in document['meshes'] for primitive in mesh['primitives']]
assert sum(document['accessors'][p['attributes']['POSITION']]['count'] for p in primitives) == 132644
assert sum(document['accessors'][p['indices']]['count'] // 3 for p in primitives) == 265276
assert all('COLOR_0' in primitive['attributes'] for primitive in primitives)

reference_definitions = [
    ('official illustration', 'b6d5b8ee9fb05dc6f53294b2cae660dec770b92762cdb19d16bcbd679e1ba43a', 'other/official-artwork/6.png'),
    ('HOME', 'ffe2db1065f91feda24f21c81c461e4ca6b863cf31afb4e4918aba79fb31ee70', 'other/home/6.png'),
    ('rear sprite', '4379d6d2702e49ef34c39c2ee9f962d60cebdd8c1d30c16dadf927a97d2523d9', 'back/6.png'),
    ('front sprite', '53358b7e8be91014bd18285862bd56c0549b5d23af175deb59f0e6f6339c878f', '6.png'),
]
references = []
for role, digest, suffix in reference_definitions:
    path = workspace / 'assets/references/objects' / digest[:2] / (digest + '.png')
    entry = record(path)
    assert entry['sha256'] == digest
    references.append({'role': role, **entry, 'sourceUrl': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + suffix})

paths = {p for p in private.rglob('*') if eligible(p)}
for directory in ['tools/charizard-face', 'docs/charizard-face', 'canonical/characters/charizard/face-batch']:
    paths.update(p for p in (lane / directory).rglob('*') if eligible(p))
paths.discard(batch / 'manifest.json')
paths.discard(batch / 'delivery.json')
paths.discard(batch / 'manifest-check.json')
paths.update(lane / e['path'] if e['pathRoot'] == 'repository' else Path(e['path']) for e in inputs['files'])
paths.update(Path(r['path']) for r in references)
paths.add(lane / 'canonical/characters/charizard/head-batch/manifest.json')

manifest = {
    'id': 'charizard-face-batch',
    'status': 'r18 local skull/eye geometry checkpoint; full character and S+ gates remain open',
    'authoring': 'Root through Blender MCP; delegated read-only CPU validation and trail review',
    'source': {
        'parent': 'charizard-head-r06',
        'parentManifest': record(lane / 'canonical/characters/charizard/head-batch/manifest.json'),
        'officialAncestor': 'charizard-official-raw-61062-o256',
        'references': references,
        'newGenerationInputs': [],
    },
    'current': {
        'id': 'charizard-head-r18', 'blend': record(private / 'head-r18/charizard-head-r18.blend'),
        'glb': record(glb), 'vertices': 132644, 'triangles': 265276,
        'protectedSourceVerticesExact': 113062, 'protectedOrientedTrianglesExact': 226039,
        'meshCount': 4, 'sceneCount': 1, 'textureSizes': [], 'animationNames': [],
        'hasUVs': False, 'hasAuthoredMaterials': False, 'hasRig': False,
        'flameGeometryAndTransformExact': True,
        'flameDisplayColor': 'Added neutral inspection vertex color; parent attribute state is not unchanged',
    },
    'limits': [
        'Old r06 pair reclassified as disjoint near-contact; r07 removes the sliver.',
        'No whole-model or all shared-vertex intersection clearance claim.',
        'Targeted skull crease improved; muzzle, jaw, eyelids and expression remain unfinished.',
        'One +1 orbital triangle has minimum angle 0.376 degrees; geometry is not deformation-ready.',
        'Eye vertex colors are provisional; no animated gaze or PBR treatment.',
        'Sampled eye clearance is not a global surface-clearance certificate.',
        'Hands, feet, wing roots, tail proportions and deformation topology remain provisional.',
        'No UV/PBR, rigging, clips, attack/game promotion or S+ acceptance.',
        'Browser evidence is simulated; human/device acceptance pending.',
        'Review uses the same GPT model family; no cross-family or human approval claim.',
    ],
    'fieldOSReleaseUnchanged': 'f85e3ae295feec02',
    'files': [record(path) for path in sorted(paths)],
}
(batch / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
for entry in manifest['files']:
    path = lane / entry['path'] if entry['pathRoot'] == 'repository' else Path(entry['path'])
    assert record(path) == entry, path
print(json.dumps({'verifiedRecords': len(manifest['files']), 'current': manifest['current']}))
