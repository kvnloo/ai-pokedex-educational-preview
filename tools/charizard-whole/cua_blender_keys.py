"""Send native keyboard input only to the verified owned Blender X11 window.

Usage: python cua_blender_keys.py key g z z 0 period 0 3 3 Return
       python cua_blender_keys.py type 'Shade Smooth'

This sends native UI events. It does not execute bpy or modify mesh data.
"""
import argparse
import json
import os
import subprocess
import time

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--pid', type=int, default=4106097)
parser.add_argument('--window', type=int, default=4194306)
parser.add_argument('--keep-pointer', action='store_true', help='Preserve pointer position for popup text and property editing')
parser.add_argument('--key-delay-ms', type=int, default=12, help='Delay between native keystrokes; increase for recomputing property panels')
parser.add_argument('--settle-ms', type=int, default=400, help='Wait after native input; does not prove Blender completed the operation')
parser.add_argument('operation', choices=('key', 'type', 'box', 'click', 'stroke'))
parser.add_argument('values', nargs='+')
args = parser.parse_args()
if not 1 <= args.key_delay_ms <= 1000 or not 0 <= args.settle_ms <= 10000:
    parser.error('key delay must be 1–1000 ms and settle delay 0–10000 ms')
env = dict(os.environ, DISPLAY=':1')


def run(*command):
    return subprocess.run(command, env=env, check=True, text=True, capture_output=True).stdout.strip()


window = str(args.window)
actual_pid = int(run('xdotool', 'getwindowpid', window))
if actual_pid != args.pid:
    raise SystemExit(f'Refusing input: window PID {actual_pid} differs from owned PID {args.pid}')
title = run('xdotool', 'getwindowname', window)
if 'Blender' not in title:
    raise SystemExit(f'Refusing input: unexpected window title {title!r}')
focused = json.loads(run('hyprctl', 'activewindow', '-j'))
if focused.get('pid') != args.pid:
    raise SystemExit('Refusing input: owned Blender is not focused; never steal focus from the user')
if not args.keep_pointer:
    run('xdotool', 'mousemove', '--window', window, '620', '450')
# Explicit window targeting prevents a focus change from redirecting text into chat.
if args.operation == 'click':
    if len(args.values) != 2:
        raise SystemExit('click expects window-relative x y')
    x, y = (str(int(value)) for value in args.values)
    run('xdotool', 'mousemove', '--window', window, x, y)
    run('xdotool', 'click', '1')
elif args.operation == 'stroke':
    if len(args.values) != 4:
        raise SystemExit('stroke expects window-relative x1 y1 x2 y2')
    x1, y1, x2, y2 = (int(value) for value in args.values)
    run('xdotool', 'mousemove', '--window', window, str(x1), str(y1))
    run('xdotool', 'mousedown', '1')
    try:
        for step in range(1, 13):
            if json.loads(run('hyprctl', 'activewindow', '-j')).get('pid') != args.pid:
                raise SystemExit('Focus changed during stroke; releasing mouse')
            fraction = step / 12
            run('xdotool', 'mousemove', '--window', window,
                str(round(x1 + (x2 - x1) * fraction)),
                str(round(y1 + (y2 - y1) * fraction)))
            time.sleep(0.025)
    finally:
        run('xdotool', 'mouseup', '1')
elif args.operation == 'box':
    if len(args.values) != 4:
        raise SystemExit('box expects x1 y1 x2 y2 in window coordinates')
    x1, y1, x2, y2 = (str(int(value)) for value in args.values)
    run('xdotool', 'key', '--window', window, '--clearmodifiers', 'b')
    time.sleep(0.2)
    run('xdotool', 'mousemove', '--window', window, x1, y1)
    run('xdotool', 'mousedown', '1')
    try:
        run('xdotool', 'mousemove', '--window', window, x2, y2)
        time.sleep(0.2)
    finally:
        run('xdotool', 'mouseup', '1')
elif args.operation == 'key':
    run('xdotool', 'key', '--window', window, '--clearmodifiers', '--delay', str(args.key_delay_ms), *args.values)
else:
    if len(args.values) != 1:
        raise SystemExit('type expects one text argument')
    run('xdotool', 'type', '--window', window, '--clearmodifiers', '--', args.values[0])
time.sleep(args.settle_ms / 1000)
print(json.dumps({'targetWindow': args.window, 'verifiedPid': actual_pid, 'operation': args.operation}))
