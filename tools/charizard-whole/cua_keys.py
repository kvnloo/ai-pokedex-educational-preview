"""Send and journal a short, guarded sequence of native Blender GUI keys."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--sequence', required=True, help='JSON array of key names or {"text": "value"}')
parser.add_argument('--note', required=True)
parser.add_argument('--journal', type=Path, required=True)
args = parser.parse_args()
sequence = json.loads(args.sequence)
if not isinstance(sequence, list) or not sequence:
    parser.error('Sequence must be a nonempty array')
for action in sequence:
    if not isinstance(action, str) and not (
        isinstance(action, dict) and set(action) == {'text'} and isinstance(action['text'], str)
    ):
        parser.error('Use key names or a single text field')
env = {**os.environ, 'DISPLAY': ':1'}

def guard():
    active = json.loads(subprocess.check_output(['hyprctl', '-j', 'activewindow']))
    if active['pid'] != 2418389:
        raise SystemExit('Owned Blender is not focused; input stopped')

guard()
subprocess.run(['xdotool', 'mousemove', '--window', '10485762', '900', '500'], env=env, check=True)
pointer = subprocess.check_output(['xdotool', 'getmouselocation', '--shell'], env=env, text=True)
if 'WINDOW=10485762\n' not in pointer:
    raise SystemExit('Another window covers the viewport; no keys sent')
with args.journal.open('a') as journal:
    for index, action in enumerate(sequence):
        guard()
        command = ['key', action] if isinstance(action, str) else ['type', '--', action['text']]
        subprocess.run(['xdotool', *command], env=env, check=True)
        journal.write(json.dumps({'time': time.time(), 'input': action, 'index': index, 'note': args.note}) + '\n')
        journal.flush()
        time.sleep(.45)
print(json.dumps({'sent': len(sequence), 'note': args.note}))
