"""Restore missing private reference images and verify every pinned image hash."""
import argparse
import hashlib
import json
import urllib.request
from pathlib import Path

LANE = Path(__file__).resolve().parents[2]
PRIVATE = Path('/mnt/zer0models/pokemon-iac/devices/pokedex/eras/references').resolve()


def fetch(verify_only=False):
    manifest = json.loads((LANE / 'canonical/devices/generations/era-reference-manifest.json').read_text())
    downloaded = 0
    for item in manifest['references']:
        target = Path(item['path']).resolve()
        if not target.is_relative_to(PRIVATE):
            raise ValueError('Reference target is outside its private asset directory')
        if target.exists():
            data = target.read_bytes()
        elif verify_only:
            raise FileNotFoundError(target)
        else:
            request = urllib.request.Request(item['url'], headers={'User-Agent': 'PokemonAssetReferenceStudy/1.0'})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read()
        if hashlib.sha256(data).hexdigest() != item['sha256']:
            raise ValueError('Reference bytes changed; preserve the old receipt and inspect a new revision: ' + item['id'])
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as output:
                output.write(data)
            downloaded += 1
    print(json.dumps({'verified': len(manifest['references']), 'downloaded': downloaded}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify', action='store_true', help='Only check existing bytes; no network or file writes')
    fetch(parser.parse_args().verify)
