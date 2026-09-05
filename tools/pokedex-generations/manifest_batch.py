"""Collect verified review artifacts; this never grants Kevin's visual approval."""
import hashlib
import json
import struct
from pathlib import Path

LANE = Path(__file__).resolve().parents[2]
PRIVATE = Path('/mnt/zer0models/pokemon-iac/devices/pokedex')
EVIDENCE = LANE / 'canonical/devices/generations'


def read(path):
    return json.loads(path.read_text())


def file_record(path):
    return {'path': str(path), 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def collect():
    artifacts, catalog = [], []
    for version, title in [('v002', 'V2 · Graphite'), ('v003', 'V3 · Scarlet')]:
        candidate = version + '-r08'
        root = PRIVATE / version / 'astra-r08'
        visual = read(root / 'visual-review.json')
        if visual['status'] != 'inspected-for-review':
            raise RuntimeError('Root visual review is incomplete')
        camera = read(root / 'inspection-r01/cameras.json')
        if len(camera['shots']) != 13 or any(not Path(shot['path']).is_file() for shot in camera['shots']):
            raise RuntimeError('Inspection photography is incomplete')
        for shot in camera['shots']:
            if shot['wholeObjectRequired'] and not all(.08 <= low <= high <= .92 for low, high in shot['projectedBounds']):
                raise RuntimeError('Inspection camera clips the device')
        hero = file_record(root / (candidate + '-hero.blend'))
        encoding = read(root / 'video/encoding.json')
        if encoding['source']['sourceSha256'] != hero['sha256'] or camera['sourceSha256'] != hero['sha256']:
            raise RuntimeError('Photography and video do not identify the current hero')
        if file_record(Path(encoding['video']['path'])) != encoding['video']:
            raise RuntimeError('Encoded video bytes have changed')
        exports = []
        for level, folder, label in [(0, root / 'quality-q2', 'Hero surfaces'), (1, root, 'Reduced comparison')]:
            validation = read(folder / 'runtime/lod0-validation.json')
            reopened = read(folder / 'runtime/reopened.json')
            if not validation['passed'] or not reopened['passed']:
                raise RuntimeError('Runtime validation did not pass')
            glb = Path(validation['path'])
            record = file_record(glb)
            if record['sha256'] != validation['sha256'] or record['sha256'] != reopened['sha256']:
                raise RuntimeError('Runtime bytes differ from validation')
            exports.append({'level': level, 'label': label, 'relativePath': str(glb.relative_to(PRIVATE)),
                            'sha256': record['sha256'], 'bytes': record['bytes'],
                            'triangles': validation['triangles'], 'warnings': validation['validator']['issues']['numWarnings']})
        data = (PRIVATE / exports[0]['relativePath']).read_bytes()
        gltf = json.loads(data[20:20 + struct.unpack_from('<I', data, 12)[0]])
        def source_name(suffix):
            found = [node['extras']['source_name'] for node in gltf['nodes'] if node.get('extras', {}).get('source_name', '').endswith(suffix)]
            if len(found) != 1:
                raise RuntimeError('Expected one source binding: ' + suffix)
            return found[0]
        catalog.append({'id': candidate, 'title': title, 'status': 'Unapproved concept review',
                        'evidenceStatus': 'complete-for-review', 'readyContentSource': source_name('/PDX.DisplayReady'),
                        'buttonSource': source_name('/PDX.ButtonPress'), 'exports': exports,
                        'video': f'https://0.taila30dc.ts.net:8445/assets/devices/pokedex-{version}-astra-r08/video/{candidate}-animation.mp4',
                        'comparison': f'https://0.taila30dc.ts.net:8445/devtools/pokedex-generations.html?device={version}'})
        files = [file_record(p) for p in sorted(root.rglob('*')) if p.is_file()
                 and p.suffix in {'.blend', '.glb', '.png', '.jpg', '.json', '.mp4'}
                 and not any(part in {'frames', 'decoded'} for part in p.relative_to(root).parts)]
        artifacts.append({'candidate': candidate, 'status': 'review evidence complete; Kevin approval pending',
                          'files': files, 'frameHashReceipt': str(root / 'video/encoding.json')})
        for source, name in [('visual-review.json', 'visual-review'), ('quality-q2/runtime/lod0-validation.json', 'q2-validation'),
                             ('quality-q2/runtime/reopened.json', 'q2-reopened'), ('inspection-r01/cameras.json', 'inspection-cameras')]:
            (EVIDENCE / (candidate + '-' + name + '.json')).write_text((root / source).read_text())
    (EVIDENCE / 'r08-artifacts.json').write_text(json.dumps(artifacts, indent=2) + '\n')
    (EVIDENCE / 'review-candidates.json').write_text(json.dumps(catalog, indent=2) + '\n')
    sources = [{'path': str(p.relative_to(LANE)), 'sha256': file_record(p)['sha256']}
               for p in sorted(Path(__file__).parent.iterdir()) if p.is_file()]
    (EVIDENCE / 'r08-source-hashes.json').write_text(json.dumps(sources, indent=2) + '\n')
    print(json.dumps({'candidates': len(catalog), 'artifacts': sum(len(c['files']) for c in artifacts)}))


if __name__ == '__main__':
    collect()
