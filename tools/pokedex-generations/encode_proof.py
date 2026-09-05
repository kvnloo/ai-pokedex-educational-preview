"""Encode the real frame sequence and keep a reproducible, inspectable receipt."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def encode(output):
    output = Path(output)
    job = json.loads((output / 'video/render-job.json').read_text())
    if sha(Path(job['source'])) != job['sourceSha256']:
        raise RuntimeError('Rendered source has changed')
    frames = [output / f'video/frames/frame-{n:04d}.png' for n in range(1, 295)]
    if not all(path.is_file() for path in frames):
        raise RuntimeError('The 294-frame sequence is incomplete')
    candidate = output.parent.name + '-r08'
    video = output / f'video/{candidate}-animation.mp4'
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-framerate', '30',
               '-start_number', '1', '-i', str(output / 'video/frames/frame-%04d.png'),
               '-frames:v', '294', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
               '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-n', str(video)]
    if not video.exists():
        subprocess.run(command, check=True)
    probe = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames',
        '-show_entries', 'stream=width,height,r_frame_rate,duration,nb_read_frames,codec_name',
        '-of', 'json', str(video)]))['streams'][0]
    expected = {'width': 576, 'height': 768, 'r_frame_rate': '30/1',
                'duration': '9.800000', 'nb_read_frames': '294', 'codec_name': 'h264'}
    if probe != expected:
        raise RuntimeError(f'Unexpected encoded stream: {probe}')
    selected = [0, 15, 27, 39, 51, 66, 90, 120, 148, 178, 225, 280]
    decoded = output / 'video/decoded'
    decoded.mkdir(exist_ok=True)
    expression = '+'.join(f'eq(n\\,{frame})' for frame in selected)
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(video),
                    '-vf', 'select=' + expression, '-fps_mode', 'vfr', '-y',
                    str(decoded / 'frame-%02d.png')], check=True)
    sheet = Image.new('RGB', (1152, 1224), '#111820')
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype('/usr/share/fonts/TTF/DejaVuSans.ttf', 15)
    for index, frame in enumerate(selected):
        image = Image.open(decoded / f'frame-{index + 1:02d}.png').convert('RGB')
        image.thumbnail((288, 384), Image.Resampling.LANCZOS)
        x, y = index % 4 * 288, index // 4 * 408
        sheet.paste(image, (x, y))
        draw.text((x + 8, y + 386), f'{candidate}   {frame / 30:.2f}s', fill='#dbe7e9', font=font)
    sheet.save(output / 'video/playback-contact.jpg', quality=94)
    receipt = {
        'candidate': candidate, 'command': command, 'probe': probe,
        'ffmpegVersion': subprocess.check_output(['ffmpeg', '-version'], text=True).splitlines()[0],
        'video': {'path': str(video), 'bytes': video.stat().st_size, 'sha256': sha(video)},
        'source': job, 'frames': [{'frame': i + 1, 'sha256': sha(path)} for i, path in enumerate(frames)],
        'decodedContactFrames': selected,
        'visualReview': 'Numeric encoding receipt only; root must separately inspect playback and decoded contact sheet.'
    }
    (output / 'video/encoding.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({'candidate': candidate, 'video': receipt['video'], 'stream': probe}))


if __name__ == '__main__':
    encode(sys.argv[1])
