"""Check the actual Tailscale assets, allowlist, methods and comparison links."""
import hashlib
import json
import urllib.error
import urllib.request
from pathlib import Path

LANE = Path(__file__).resolve().parents[2]
PRIVATE = Path('/mnt/zer0models/pokemon-iac/devices/pokedex/review-batches')
BASE = 'https://0.taila30dc.ts.net:8471'


def verify():
    report = []
    for candidate in json.loads((LANE / 'canonical/devices/generations/review-candidates.json').read_text()):
        for asset in candidate['exports']:
            url = f"{BASE}/device-review-assets/{candidate['id']}/{asset['level']}.glb"
            with urllib.request.urlopen(url, timeout=30) as response:
                data = response.read()
                digest = hashlib.sha256(data).hexdigest()
                report.append({'url': url, 'status': response.status, 'bytes': len(data),
                               'sha256': digest, 'matches': digest == asset['sha256']})
    requests = [(BASE + '/device-review-assets/nope/0.glb', 'GET', 404),
                (BASE + '/device-review-assets/v002-r08/0.glb', 'POST', 405),
                (BASE + '/device-review-assets/v002-r08/0.glb', 'HEAD', 200)]
    for candidate in json.loads((PRIVATE / 'batch-r08.json').read_text())['candidates']:
        for item in [candidate['hero'], candidate['video'], candidate['interactive'],
                     *[item['url'] for item in candidate['gallery']]]:
            url = item if item.startswith('https:') else 'https://0.taila30dc.ts.net:8445' + item
            requests.append((url, 'HEAD', 200))
    for url, method, expected in requests:
        try:
            with urllib.request.urlopen(urllib.request.Request(url, method=method), timeout=30) as response:
                status = response.status
        except urllib.error.HTTPError as error:
            status = error.code
        report.append({'url': url, 'method': method, 'status': status, 'matches': status == expected})
    (PRIVATE / 'runtime-evidence/routes.json').write_text(json.dumps(report, indent=2) + '\n')
    if not all(item['matches'] for item in report):
        raise RuntimeError('HTTP review verification failed; see routes.json')
    print(json.dumps({'checks': len(report), 'passed': True}))


if __name__ == '__main__':
    verify()
