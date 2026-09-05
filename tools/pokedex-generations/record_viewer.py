"""Record real browser, compiled-bundle, route and root visual-review evidence."""
import hashlib
import json
from pathlib import Path

LANE = Path(__file__).resolve().parents[2]
PRIVATE = Path('/mnt/zer0models/pokemon-iac/devices/pokedex/review-batches')
EVIDENCE = PRIVATE / 'runtime-evidence'


def read(path):
    return json.loads(path.read_text())


def record(path):
    return {'path': str(path), 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def collect():
    candidates = read(EVIDENCE / 'candidates/browser-check.json')
    legacy = read(EVIDENCE / 'legacy/browser-check.json')
    routes = read(EVIDENCE / 'routes.json')
    visual = read(EVIDENCE / 'visual-review.json')
    if not candidates['passed'] or not legacy['passed'] or not all(item['matches'] for item in routes):
        raise RuntimeError('Actual runtime checks have not passed')
    if visual['status'] != 'inspected-for-review':
        raise RuntimeError('Root visual inspection is incomplete')
    build = PRIVATE / 'build-private-r02'
    if not (build / 'pokedex-device.html').is_file():
        raise RuntimeError('Compiled device page is missing')
    leaks = []
    for path in build.rglob('*'):
        if path.is_file() and path.suffix in {'.html', '.js', '.json'}:
            text = path.read_text()
            for needle in ['v002-r08', 'v003-r08', 'device-review-assets/', 'astra-r08/quality-q2']:
                if needle in text:
                    leaks.append({'path': str(path), 'needle': needle})
    compile_result = {'scope': 'Direct private Vite compilation; not the full private asset bootstrap',
                      'passed': not leaks, 'candidateCatalogOrRouteInExecutableBundle': leaks,
                      'glbs': [str(path.relative_to(build)) for path in sorted(build.rglob('*.glb'))],
                      'compiledDevicePage': str(build / 'pokedex-device.html'),
                      'logSha256': record(EVIDENCE / 'compile-private.log')['sha256']}
    (EVIDENCE / 'compile-private.json').write_text(json.dumps(compile_result, indent=2) + '\n')
    if leaks:
        raise RuntimeError('Review candidate data remains in the compiled executable bundle')
    sources = ['src/pokedex/device.ts', 'src/pokedex/deviceRuntime.ts', 'src/pokedex/device.css',
               'pokedex-device.html', 'vite.config.ts', 'tools/pokedex-generations/browser-check.mjs',
               'tools/pokedex-generations/review-asset-plugin.ts', 'tools/pokedex-generations/review.html',
               'tools/pokedex-generations/publish_review.py', 'tools/pokedex-generations/verify_review_http.py']
    report = {'status': 'review integration inspected; Kevin approval pending',
              'candidateChecks': len(candidates['checks']), 'legacyChecks': len(legacy['checks']),
              'httpChecks': len(routes), 'visual': visual, 'compilation': compile_result,
              'sources': [record(LANE / path) for path in sources],
              'evidence': [record(path) for path in sorted(EVIDENCE.rglob('*'))
                           if path.is_file() and path.suffix in {'.json', '.png', '.jpg', '.log'}]}
    output = LANE / 'canonical/devices/generations/viewer-r08.json'
    output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'output': str(output), 'checks': len(candidates['checks']) + len(legacy['checks']) + len(routes)}))


if __name__ == '__main__':
    collect()
