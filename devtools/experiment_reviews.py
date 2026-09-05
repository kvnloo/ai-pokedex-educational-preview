import json
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from experiments.store import atomic_json

DIMENSIONS = ('likeness', 'geometry', 'materials', 'gameReadiness')


class ReviewStore:
    def __init__(self, directory, runs):
        self.directory = Path(directory)
        self.runs = Path(runs)
        self.lock = threading.Lock()

    def latest(self):
        result = {}
        for path in self.directory.glob('*.json'):
            events = json.loads(path.read_text())
            if events:
                result[path.stem] = events[-1]
        return result

    def save(self, data):
        if not isinstance(data, dict):
            raise ValueError('Review must be an object')
        run_id = data.get('runId')
        if not isinstance(run_id, str) or not re.fullmatch(r'[a-z0-9][a-z0-9_-]{0,100}', run_id):
            raise ValueError('Invalid run ID')
        if not (self.runs / f'{run_id}.json').is_file():
            raise ValueError('Unknown experiment')
        verdict = data.get('verdict')
        if verdict not in ('keep', 'reject', 'undecided'):
            raise ValueError('Invalid verdict')
        ratings = data.get('ratings')
        if not isinstance(ratings, dict) or set(ratings) - set(DIMENSIONS):
            raise ValueError('Invalid rating dimensions')
        scores = {key: ratings.get(key) for key in DIMENSIONS}
        if any(value is not None and (type(value) is not int or not 1 <= value <= 5) for value in scores.values()):
            raise ValueError('Ratings must be null or integers from 1 to 5')
        notes = data.get('notes', '')
        if not isinstance(notes, str) or len(notes) > 5000:
            raise ValueError('Notes must be text with at most 5000 characters')
        review = {'verdict': verdict, 'ratings': scores, 'notes': notes,
                  'updatedAt': datetime.now(timezone.utc).isoformat()}
        with self.lock:
            path = self.directory / f'{run_id}.json'
            history = json.loads(path.read_text()) if path.exists() else []
            history.append(review)
            atomic_json(path, history)
        return review
