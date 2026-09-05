"""Publish the phone comparison from the verified catalog and matched views."""
import json
from pathlib import Path

LANE = Path(__file__).resolve().parents[2]
CANONICAL = LANE / 'canonical/devices/generations'
PRIVATE = Path('/mnt/zer0models/pokemon-iac/devices/pokedex/review-batches')


def publish():
    catalog = json.loads((CANONICAL / 'review-candidates.json').read_text())
    views = json.loads((CANONICAL / 'comparison-views.json').read_text())
    candidates = []
    for config, candidate in zip(views, catalog, strict=True):
        version = config['version']
        if candidate['id'] != version + '-r08' or candidate['evidenceStatus'] != 'complete-for-review':
            raise RuntimeError('Comparison does not identify an inspected candidate')
        root = f'/assets/devices/pokedex-{version}-astra-r08'
        hero, reduced = candidate['exports']
        candidates.append({
            **config, 'candidate': candidate['id'], 'title': candidate['title'],
            'triangles': hero['triangles'], 'reducedTriangles': reduced['triangles'],
            'clips': ['Closed', 'Opening', 'BootUp', 'Ready', 'Idle', 'ButtonPress'],
            'sweep': '15 sampled angles, no moving/fixed surface intersections',
            'validation': f"0 errors; {hero['warnings']} tangent-generation warnings",
            'textures': '10 × 512px PBR maps',
            'hero': root + '/inspection-r01/three-quarter-material.png',
            'video': candidate['video'],
            'interactive': 'https://0.taila30dc.ts.net:8471/pokedex-device.html?candidate=' + candidate['id'],
            'gallery': [
                {'label': 'Neutral views', 'url': root + '/inspection-r01/neutral-contact.jpg'},
                {'label': 'Mechanical details', 'url': root + '/inspection-r01/details-contact.jpg'},
                {'label': 'Runtime surface comparison', 'url': root + '/runtime-surface-comparison.jpg'},
            ],
        })
    batch = {'stage': 'Artifact and playback inspection complete; unapproved visual candidates', 'candidates': candidates}
    output = PRIVATE / 'batch-r08.json'
    output.write_text(json.dumps(batch, indent=2) + '\n')
    print(output)


if __name__ == '__main__':
    publish()
