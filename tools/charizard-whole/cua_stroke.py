"""Send one guarded mouse stroke to the owned Blender GUI and record it."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--start', nargs=2, type=int, required=True)
parser.add_argument('--end', nargs=2, type=int, required=True)
parser.add_argument('--via', nargs='*', type=int, default=[])
parser.add_argument('--shift', action='store_true')
parser.add_argument('--note', required=True)
parser.add_argument('--journal', type=Path, required=True)
args = parser.parse_args()
if len(args.via) % 2:
    parser.error('--via requires x y pairs')
active = json.loads(subprocess.check_output(['hyprctl', '-j', 'activewindow']))
if active['pid'] != 2418389:
    raise SystemExit('Owned Blender window is not focused; no input sent')
env = {**os.environ, 'DISPLAY': ':1'}

def mouse(*values):
    subprocess.run(['xdotool', *map(str, values)], env=env, check=True)

mouse('mousemove', '--window', 10485762, *args.start)
pointer = subprocess.check_output(['xdotool', 'getmouselocation', '--shell'], env=env, text=True)
if 'WINDOW=10485762\n' not in pointer:
    raise SystemExit('Another window covers the stroke target; no mouse press sent')
try:
    if args.shift:
        mouse('keydown', 'Shift_L')
    mouse('mousedown', 1)
    points = [args.start, *[args.via[i:i+2] for i in range(0, len(args.via), 2)], args.end]
    for start, end in zip(points, points[1:]):
        steps = max(4, round(sum((b-a)**2 for a, b in zip(start, end))**.5 / 3))
        for step in range(1, steps + 1):
            point = [round(a + (b-a)*step/steps) for a, b in zip(start, end)]
            mouse('mousemove', '--window', 10485762, *point)
            time.sleep(.035)
finally:
    mouse('mouseup', 1)
    if args.shift:
        mouse('keyup', 'Shift_L')
time.sleep(.2)
with args.journal.open('a') as stream:
    stream.write(json.dumps({'time': time.time(), 'start': args.start, 'end': args.end, 'via': args.via,
                             'shift': args.shift, 'note': args.note}) + '\n')
