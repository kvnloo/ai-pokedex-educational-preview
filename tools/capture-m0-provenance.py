#!/usr/bin/env python3
"""Freeze dirty-main provenance and this isolated repair's attributable patch."""
import hashlib
import json
import subprocess
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAIN = Path('/workspace/zer0/products/pokemon')
REPORT_DIR = ROOT / 'canonical/reports'
REPORT_DIR.mkdir(parents=True, exist_ok=True)

def git(cwd, *args):
    return subprocess.run(['git', *args], cwd=cwd, check=True, text=True, capture_output=True).stdout

def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()

raw = git(MAIN, 'status', '--porcelain=v1', '--untracked-files=all', '-z').split('\0')
entries = []
for row in filter(None, raw):
    status, path = row[:2], row[3:]
    if path.startswith(('canonical/', 'src/world/canonicalWorld.ts', 'tools/canonical-world-golden.mjs', 'docs/CANONICAL-WORLD-PIPELINE.md')):
        classification = 'inherited-canonical-candidate'
    elif path in ('prompt.md', 'docs/FULL-POKEMON-AUTONOMOUS-GOAL.md', 'docs/ASSETS-AS-CODE.md'):
        classification = 'operator-superseded-binding-document-synced-by-hash'
    elif path in ('package.json', 'prompt.md', 'src/main.ts', 'tools/battle-golden.mjs'):
        classification = 'shared-hotspot-preserved-not-copied'
    else:
        classification = 'unrelated-user-work-preserved'
    entries.append({'path': path, 'status': status, 'classification': classification})

source_hashes = {}
for relative in ['canonical/assets.json', 'canonical/sources.json', 'canonical/games.json', 'canonical/regions.json', 'canonical/locations.json', 'canonical/maps/kanto-opening.json', 'canonical/ash/arcs.json', 'canonical/ash/events/kanto-opening.json', 'canonical/conflicts.json', 'canonical/runtime/kanto-opening.json']:
    source_hashes[relative] = sha256(ROOT / relative)

patch = subprocess.run(['git', 'diff', 'HEAD', '--binary', '--', '.', ':(exclude)canonical/reports/*'], cwd=ROOT, check=True, text=True, capture_output=True).stdout
untracked = git(ROOT, 'ls-files', '--others', '--exclude-standard').splitlines()
for relative in sorted(path for path in untracked if not path.startswith('canonical/reports/')):
    patch += subprocess.run(['git', 'diff', '--binary', '--no-index', '/dev/null', relative], cwd=ROOT, text=True, capture_output=True).stdout
patch_path = REPORT_DIR / 'm0-attributable.patch.b64'
patch_path.write_text(base64.b64encode(patch.encode()).decode() + '\n')

manifest = {
    'schemaVersion': 1,
    'taskId': 't_48d15348',
    'capturedAt': '2026-08-24',
    'base': {'head': git(MAIN, 'rev-parse', 'HEAD').strip(), 'branch': git(MAIN, 'branch', '--show-current').strip()},
    'repair': {'branch': git(ROOT, 'branch', '--show-current').strip(), 'worktree': str(ROOT)},
    'worktrees': git(MAIN, 'worktree', 'list', '--porcelain').strip().splitlines(),
    'mainDiskBytes': int(subprocess.run(['du', '-sb', MAIN], check=True, text=True, capture_output=True).stdout.split()[0]),
    'prunableWorktreeAssessment': {'path': '/tmp/pokemon-sol-integration', 'directoryWasAbsent': True, 'dryRunFinding': 'gitdir file points to non-existent location', 'action': 'registration pruned; no directory or work bytes removed'},
    'dirtyMainStatusSha256': hashlib.sha256(git(MAIN, 'status', '--porcelain=v1', '--untracked-files=all', '-z').encode()).hexdigest(),
    'dirtyMainPaths': entries,
    'canonicalSourceHashes': source_hashes,
    'bindingDocumentHashes': {relative: sha256(ROOT / relative) for relative in [
        'prompt.md', 'docs/FULL-POKEMON-AUTONOMOUS-GOAL.md', 'docs/ASSETS-AS-CODE.md'
    ]},
    'attributablePatch': {'path': str(patch_path.relative_to(ROOT)), 'sha256': sha256(patch_path), 'excludes': ['canonical/reports/*']},
    'preservation': 'No reset, stash, clean, source deletion, or unrelated dirty-main edit was performed.'
}
(REPORT_DIR / 'm0-provenance-manifest.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
