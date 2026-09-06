"""Check the frozen receipt against current bytes and inspect the GLB payload."""
import hashlib
import json
import struct
from pathlib import Path

lane = Path(__file__).resolve().parents[2]
checkpoint = json.loads((lane/'canonical/characters/charizard/whole-r06/checkpoint.json').read_text())
root = Path(checkpoint['privateRoot'])
verified = []
for role in ['source', 'glb']:
    expected = checkpoint[role]
    path = Path(expected['path'])
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    assert len(data) == expected['bytes'] and digest == expected['sha256']
    manifest = next(item for item in checkpoint['artifacts'] if root/item['path'] == path)
    assert manifest['bytes'] == len(data) and manifest['sha256'] == digest
    verified.append({'role': role, 'bytes': len(data), 'sha256': digest})
data = Path(checkpoint['glb']['path']).read_bytes()
magic, version, length = struct.unpack_from('<4sII', data)
assert magic == b'glTF' and version == 2 and length == len(data)
json_length, chunk_type = struct.unpack_from('<I4s', data, 12)
assert chunk_type == b'JSON'
document = json.loads(data[20:20+json_length])
counts = {key: len(document.get(key, [])) for key in ['meshes', 'materials', 'textures', 'images', 'animations', 'skins']}
assert counts == {'meshes': 4, 'materials': 0, 'textures': 0, 'images': 0, 'animations': 0, 'skins': 0}
primitives = [primitive for mesh in document['meshes'] for primitive in mesh['primitives']]
assert not any(primitive.get('targets') for primitive in primitives)
assert not any(attribute.startswith('TEXCOORD_') for primitive in primitives for attribute in primitive['attributes'])
print(json.dumps({'artifactsMatchFrozenReceipt': verified, 'glbCounts': counts, 'morphTargets': 0, 'uvAttributes': 0, 'scope': 'Static payload and recorded source/GLB hash consistency. No visual or runtime acceptance.'}, indent=2))
