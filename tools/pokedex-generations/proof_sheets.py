"""Contact sheets of actual renders, without reframing the reference comparisons."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


def make(output):
    output = Path(output)
    folder = output / 'inspection-r01'
    font = ImageFont.truetype('/usr/share/fonts/TTF/DejaVuSans.ttf', 16)
    groups = {
        'neutral': [f'{view}-{finish}' for view in ['front', 'back', 'side', 'three-quarter'] for finish in ['material', 'clay']],
        'details': ['closed-material', 'underside-material', 'hinge-closeup-material', 'controls-closeup-material', 'port-closeup-material'],
    }
    for group, names in groups.items():
        cols = 4 if group == 'neutral' else 3
        width, height = 1440 // cols, 432 if cols == 4 else 568
        sheet = Image.new('RGB', (1440, height * 2), '#aeb4bd')
        draw = ImageDraw.Draw(sheet)
        for index, name in enumerate(names):
            image = Image.open(folder / (name + '.png')).convert('RGBA')
            image.thumbnail((width, height - 28), Image.Resampling.LANCZOS)
            x, y = index % cols * width, index // cols * height
            sheet.paste(image, (x + (width - image.width) // 2, y), image)
            draw.text((x + 8, y + height - 24), name, fill='#171d26', font=font)
        sheet.save(folder / (group + '-contact.jpg'), quality=95)
    sheet = Image.new('RGB', (1800, 1040), '#aeb4bd')
    draw = ImageDraw.Draw(sheet)
    for index, (folder, label) in enumerate([('reopened-renders', 'Reduced export'), ('quality-q2/reopened-renders', 'Q2: retained hero geometry')]):
        image = Image.open(output / folder / 'controls-closeup-material.png').convert('RGBA')
        sheet.paste(image, (index * 900, 40), image)
        draw.text((index * 900 + 16, 12), label, fill='#171d26', font=font)
    sheet.save(output / 'runtime-surface-comparison.jpg', quality=95)


if __name__ == '__main__':
    make(sys.argv[1])
