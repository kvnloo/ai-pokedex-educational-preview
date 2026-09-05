"""Small file-backed experiment register; artifacts remain in their existing folders."""
import fcntl
import json
import os
import re
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNS = ROOT / 'experiments/runs'
INDEX = ROOT / 'devtools/experiments.json'
ID_PATTERN = re.compile(r'[a-z0-9][a-z0-9_-]{0,100}')


def atomic_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, delete=False) as handle:
        json.dump(data, handle, indent=2)
        handle.write('\n')
        temporary = handle.name
    os.replace(temporary, path)


def build_index():
    RUNS.mkdir(parents=True, exist_ok=True)
    with (ROOT / 'experiments/.index.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        records = []
        for path in sorted(RUNS.glob('*.json')):
            record = json.loads(path.read_text())
            if record['id'] != path.stem:
                raise ValueError(f'Experiment ID does not match filename: {path}')
            records.append(record)
        atomic_json(INDEX, {'schemaVersion': 1, 'runs': records})
    return len(records)


def write_run(record):
    run_id = record['id']
    if not isinstance(run_id, str) or not ID_PATTERN.fullmatch(run_id):
        raise ValueError('Experiment ID must contain lowercase letters, numbers, hyphens or underscores')
    atomic_json(RUNS / f'{run_id}.json', record)
    build_index()


if __name__ == '__main__':
    print(f'Indexed {build_index()} experiments')
