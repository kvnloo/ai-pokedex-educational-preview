"""Encode the two matched Blender frame sequences without altering their framing."""
from pathlib import Path
import subprocess

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r01')
video = root / 'turntable-r18-vs-whole-r01.mp4'
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-n',
    '-framerate', '12', '-i', str(root / 'before-r18/turntable/%03d.png'),
    '-framerate', '12', '-i', str(root / 'after-whole-r01/turntable/%03d.png'),
    '-filter_complex',
    "[0:v]drawtext=text='Before - r18':x=20:y=20:fontsize=25:fontcolor=white[top];"
    "[1:v]drawtext=text='Working sculpt - whole r01':x=20:y=20:fontsize=25:fontcolor=white[bottom];"
    '[top][bottom]vstack=inputs=2:shortest=1[v]',
    '-map', '[v]', '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-an', str(video),
], check=True)
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-i', str(video),
    '-vf', 'fps=2,scale=320:640,tile=6x2', '-frames:v', '1',
    str(root / 'turntable-video-contact.png'),
], check=True)
