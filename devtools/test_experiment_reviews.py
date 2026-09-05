import json
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from experiment_reviews import ReviewStore


class ReviewStoreTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        runs = root / 'runs'
        runs.mkdir()
        (runs / 'fixture.json').write_text('{}')
        self.store = ReviewStore(root / 'reviews', runs)
        self.data = {'runId': 'fixture', 'verdict': 'undecided',
                     'ratings': {'likeness': 3, 'geometry': None, 'materials': None, 'gameReadiness': None}, 'notes': 'test'}

    def tearDown(self):
        self.temp.cleanup()

    def test_preserves_unknown_scores_and_review_history(self):
        first = self.store.save(self.data)
        second = self.store.save({**self.data, 'verdict': 'reject', 'notes': 'Changed judgment'})
        self.assertIsNone(self.store.latest()['fixture']['ratings']['materials'])
        history = json.loads((self.store.directory / 'fixture.json').read_text())
        self.assertEqual(history, [first, second])

    def test_rejects_invalid_scores_and_unknown_or_unsafe_ids(self):
        invalid = [
            {**self.data, 'runId': '../fixture'}, {**self.data, 'runId': 'missing'},
            {**self.data, 'ratings': {'likeness': True}},
            {**self.data, 'ratings': {'likeness': 0}},
            {**self.data, 'ratings': {'likeness': 6}},
            {**self.data, 'ratings': {'likeness': 2.5}},
            {**self.data, 'ratings': {'overallAAA': 5}},
            {**self.data, 'verdict': 'approved-by-user'},
        ]
        for data in invalid:
            with self.subTest(data=data), self.assertRaises(ValueError):
                self.store.save(data)
        self.assertEqual(self.store.latest(), {})

    def test_concurrent_reviews_are_all_retained(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(lambda n: self.store.save({**self.data, 'notes': str(n)}), range(12)))
        history = json.loads((self.store.directory / 'fixture.json').read_text())
        self.assertEqual(len(history), 12)
        self.assertEqual({item['notes'] for item in history}, {str(n) for n in range(12)})


if __name__ == '__main__':
    unittest.main()
