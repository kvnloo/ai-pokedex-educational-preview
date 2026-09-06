"""Encode the two matched Blender frame sequences without altering their framing."""
from pathlib import Path
import argparse
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--revision', choices=['r01', 'r02', 'r03'], default='r01')
args = parser.parse_args()
previous = 'r18' if args.revision == 'r01' else 'whole-r01'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05') / ('whole-' + args.revision)
video = root / ('turntable-' + previous + '-vs-whole-' + args.revision + '.mp4')
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-n',
    '-framerate', '12', '-i', str(root / ('before-' + previous) / 'turntable/%03d.png'),
    '-framerate', '12', '-i', str(root / ('after-whole-' + args.revision) / 'turntable/%03d.png'),
    '-filter_complex',
    f"[0:v]drawtext=text='Before - {previous}':x=20:y=20:fontsize=25:fontcolor=white[top];"
    f"[1:v]drawtext=text='Working sculpt - whole {args.revision}':x=20:y=20:fontsize=25:fontcolor=white[bottom];"
    '[top][bottom]vstack=inputs=2:shortest=1[v]',
    '-map', '[v]', '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-an', str(video),
], check=True)
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-i', str(video),
    '-vf', 'fps=2,scale=320:640,tile=6x2', '-frames:v', '1',
    str(root / 'turntable-video-contact.png'),
], check=True)
