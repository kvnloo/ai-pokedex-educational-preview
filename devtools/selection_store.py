"""Thread-safe selection persistence for the devtools Pokédex gallery."""
from __future__ import annotations

import fcntl
import json
import os
import tempfile
from pathlib import Path
from typing import Any


class SelectionError(ValueError):
    """Raised when a selection payload or stored file is invalid."""


class SelectionStore:
    def __init__(self, selections_path: Path, catalog_path: Path):
        self.selections_path = Path(selections_path)
        self.catalog_path = Path(catalog_path)
        self.lock_path = self.selections_path.with_suffix(self.selections_path.suffix + '.lock')

    def load(self) -> dict[str, list[str]]:
        with self._locked():
            return self._read_locked(self._allowed_locked())

    def replace(self, payload: Any) -> dict[str, list[str]]:
        self._validate_full_map(payload, self._allowed_locked())
        with self._locked():
            # Re-read catalog while holding the write lock so validation and commit use
            # one boundary snapshot if a catalog rebuild happens mid-request.
            allowed = self._allowed_locked()
            selections = self._validate_full_map(payload, allowed)
            self._write_locked(selections)
            return selections

    def set_image(self, payload: Any) -> tuple[dict[str, list[str]], str, str, bool]:
        species, image_path, selected = self._validate_operation_shape(payload)
        with self._locked():
            allowed = self._allowed_locked()
            self._validate_known_image(species, image_path, allowed)
            selections = self._read_locked(allowed)
            current = list(selections.get(species, []))
            if selected:
                if image_path not in current:
                    current.append(image_path)
            else:
                current = [path for path in current if path != image_path]
            current_set = set(current)
            current = [path for path in allowed[species] if path in current_set]
            if current:
                selections[species] = current
            else:
                selections.pop(species, None)
            self._write_locked(selections)
            return selections, species, image_path, selected

    def _locked(self):
        self.lock_path.parent.mkdir(parents=True, exist_ok=True)
        handle = self.lock_path.open('a+')

        class Guard:
            def __enter__(guard_self):
                fcntl.flock(handle, fcntl.LOCK_EX)
                return handle

            def __exit__(guard_self, exc_type, exc, tb):
                try:
                    fcntl.flock(handle, fcntl.LOCK_UN)
                finally:
                    handle.close()

        return Guard()

    def _allowed_locked(self) -> dict[str, list[str]]:
        try:
            catalog = json.loads(self.catalog_path.read_text())
            species_rows = catalog['species']
        except Exception as error:  # pragma: no cover - operational corruption path
            raise SelectionError(f'Invalid catalog: {error}') from error
        allowed: dict[str, list[str]] = {}
        for row in species_rows:
            slug = row.get('slug')
            images = row.get('images')
            if not isinstance(slug, str) or not isinstance(images, list):
                raise SelectionError('Invalid catalog species row')
            paths = [image.get('path') for image in images if isinstance(image, dict) and isinstance(image.get('path'), str)]
            allowed[slug] = paths
        return allowed

    def _read_locked(self, allowed: dict[str, list[str]]) -> dict[str, list[str]]:
        if not self.selections_path.exists():
            return {}
        try:
            payload = json.loads(self.selections_path.read_text())
        except json.JSONDecodeError as error:
            raise SelectionError(f'Invalid selections JSON: {error}') from error
        return self._validate_full_map(payload, allowed)

    def _write_locked(self, selections: dict[str, list[str]]) -> None:
        self.selections_path.parent.mkdir(parents=True, exist_ok=True)
        fd, temp_name = tempfile.mkstemp(
            prefix=f'.{self.selections_path.name}.',
            suffix='.tmp',
            dir=self.selections_path.parent,
            text=True,
        )
        try:
            with os.fdopen(fd, 'w') as handle:
                json.dump(selections, handle, indent=2)
                handle.write('\n')
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_name, self.selections_path)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)

    def _validate_full_map(self, payload: Any, allowed: dict[str, list[str]]) -> dict[str, list[str]]:
        if not isinstance(payload, dict):
            raise SelectionError('Selections payload must be an object')
        selections: dict[str, list[str]] = {}
        for species, paths in payload.items():
            if species not in allowed or not isinstance(paths, list):
                raise SelectionError('Unknown species or invalid selection list')
            seen: set[str] = set()
            for image_path in paths:
                if not isinstance(image_path, str) or image_path not in allowed[species]:
                    raise SelectionError('Unknown image path')
                seen.add(image_path)
            clean = [image_path for image_path in allowed[species] if image_path in seen]
            if clean:
                selections[species] = clean
        return selections

    def _validate_operation_shape(self, payload: Any) -> tuple[str, str, bool]:
        if not isinstance(payload, dict):
            raise SelectionError('Selection operation payload must be an object')
        species = payload.get('species')
        image_path = payload.get('path')
        selected = payload.get('selected')
        if not isinstance(species, str) or not isinstance(image_path, str) or not isinstance(selected, bool):
            raise SelectionError('Selection operation requires species, path and selected:boolean')
        return species, image_path, selected

    def _validate_known_image(self, species: str, image_path: str, allowed: dict[str, list[str]]) -> None:
        if species not in allowed or image_path not in allowed[species]:
            raise SelectionError('Unknown species or image path')
