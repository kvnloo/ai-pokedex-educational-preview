from __future__ import annotations

import json
import threading
from pathlib import Path

from selection_store import SelectionError, SelectionStore


def write_catalog(path: Path) -> dict[str, list[str]]:
    catalog = {
        'species': [
            {'slug': 'bulbasaur', 'images': [{'path': 'assets/bulbasaur/home.png'}, {'path': 'assets/bulbasaur/art.png'}]},
            {'slug': 'charizard', 'images': [{'path': 'assets/charizard/home.png'}, {'path': 'assets/charizard/art.png'}]},
        ]
    }
    path.write_text(json.dumps(catalog))
    return {row['slug']: [image['path'] for image in row['images']] for row in catalog['species']}


def test_atomic_image_operation_is_idempotent(tmp_path: Path):
    catalog = tmp_path / 'catalog.json'
    allowed = write_catalog(catalog)
    store = SelectionStore(tmp_path / 'selections.json', catalog)

    payload = {'species': 'charizard', 'path': allowed['charizard'][0], 'selected': True}
    first, species, image_path, selected = store.set_image(payload)
    second, *_ = store.set_image(payload)

    assert species == 'charizard'
    assert image_path == allowed['charizard'][0]
    assert selected is True
    assert first == {'charizard': [allowed['charizard'][0]]}
    assert second == first

    removed, *_ = store.set_image({'species': 'charizard', 'path': allowed['charizard'][0], 'selected': False})
    removed_again, *_ = store.set_image({'species': 'charizard', 'path': allowed['charizard'][0], 'selected': False})
    assert removed == {}
    assert removed_again == {}


def test_rejects_unknown_species_and_paths(tmp_path: Path):
    catalog = tmp_path / 'catalog.json'
    allowed = write_catalog(catalog)
    store = SelectionStore(tmp_path / 'selections.json', catalog)

    for payload in [
        {'species': 'mewtwo', 'path': allowed['charizard'][0], 'selected': True},
        {'species': 'charizard', 'path': 'assets/nope.png', 'selected': True},
        {'species': 'charizard', 'path': allowed['charizard'][0], 'selected': 'yes'},
    ]:
        try:
            store.set_image(payload)
        except SelectionError:
            pass
        else:
            raise AssertionError('invalid payload was accepted')


def test_full_map_replace_preserves_compatibility_and_dedupes(tmp_path: Path):
    catalog = tmp_path / 'catalog.json'
    allowed = write_catalog(catalog)
    store = SelectionStore(tmp_path / 'selections.json', catalog)

    selections = store.replace({
        'bulbasaur': [allowed['bulbasaur'][0], allowed['bulbasaur'][0], allowed['bulbasaur'][1]],
        'charizard': [],
    })

    assert selections == {'bulbasaur': [allowed['bulbasaur'][0], allowed['bulbasaur'][1]]}
    assert store.load() == selections


def test_concurrent_operations_on_different_species_converge(tmp_path: Path):
    catalog = tmp_path / 'catalog.json'
    allowed = write_catalog(catalog)
    store = SelectionStore(tmp_path / 'selections.json', catalog)
    barrier = threading.Barrier(12)
    errors: list[BaseException] = []

    def worker(species: str, image_path: str, selected: bool):
        try:
            barrier.wait(timeout=2)
            store.set_image({'species': species, 'path': image_path, 'selected': selected})
        except BaseException as error:
            errors.append(error)

    threads = []
    for _ in range(3):
        threads.extend([
            threading.Thread(target=worker, args=('bulbasaur', allowed['bulbasaur'][0], True)),
            threading.Thread(target=worker, args=('bulbasaur', allowed['bulbasaur'][1], True)),
            threading.Thread(target=worker, args=('charizard', allowed['charizard'][0], True)),
            threading.Thread(target=worker, args=('charizard', allowed['charizard'][1], True)),
        ])
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert errors == []
    assert store.load() == {
        'bulbasaur': allowed['bulbasaur'],
        'charizard': allowed['charizard'],
    }


def test_interleaved_add_remove_keeps_other_species(tmp_path: Path):
    catalog = tmp_path / 'catalog.json'
    allowed = write_catalog(catalog)
    store = SelectionStore(tmp_path / 'selections.json', catalog)
    store.replace({'bulbasaur': [allowed['bulbasaur'][0]], 'charizard': [allowed['charizard'][0]]})

    store.set_image({'species': 'bulbasaur', 'path': allowed['bulbasaur'][0], 'selected': False})
    store.set_image({'species': 'charizard', 'path': allowed['charizard'][1], 'selected': True})

    assert store.load() == {'charizard': [allowed['charizard'][0], allowed['charizard'][1]]}


def test_server_handler_selection_routes_use_store(monkeypatch, tmp_path: Path):
    import importlib
    import server

    catalog = tmp_path / 'catalog.json'
    allowed = write_catalog(catalog)
    store = SelectionStore(tmp_path / 'selections.json', catalog)
    monkeypatch.setattr(server, 'SELECTIONS', store)

    class FakeHandler:
        path = '/api/selections/image'
        headers = {'Origin': 'http://127.0.0.1:5185', 'Content-Length': '0'}
        status = None
        sent_headers: list[tuple[str, str]] = []

        def __init__(self, payload):
            encoded = json.dumps(payload).encode()
            self.headers = {'Origin': 'http://127.0.0.1:5185', 'Content-Length': str(len(encoded))}
            import io
            self.rfile = io.BytesIO(encoded)
            self.wfile = io.BytesIO()

        def send_response(self, status):
            self.status = status

        def send_header(self, key, value):
            self.sent_headers.append((key, value))

        def end_headers(self):
            pass

        def send_error(self, status):
            self.status = status

        def _json(self, status, payload):
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode())

    handler = FakeHandler({'species': 'charizard', 'path': allowed['charizard'][0], 'selected': True})
    server.Handler.do_POST(handler)
    body = json.loads(handler.wfile.getvalue())

    assert handler.status == 200
    assert body['saved'] is True
    assert body['speciesSelections'] == [allowed['charizard'][0]]
    assert body['selections'] == {'charizard': [allowed['charizard'][0]]}

    full = FakeHandler({'bulbasaur': [allowed['bulbasaur'][0]]})
    full.path = '/api/selections'
    server.Handler.do_POST(full)
    assert json.loads(full.wfile.getvalue()) == {'saved': True, 'selections': {'bulbasaur': [allowed['bulbasaur'][0]]}}


def test_desktop_gallery_callers_use_atomic_selection_route():
    pokedex = Path('devtools/pokedex.js').read_text()
    legacy = Path('devtools/index.html').read_text()

    assert "fetch('/api/selections/image'" in pokedex
    assert "fetch('/api/selections/image'" in legacy
    assert "fetch('/api/selections',{method:'POST'" not in pokedex
    assert "fetch('/api/selections',{method:'POST'" not in legacy
    assert 'choices=result.selections' in pokedex
    assert 'choices=result.selections' in legacy
