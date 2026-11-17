import sys, json
from PIL import Image
id_, H, CH = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
d = json.load(open(f'/tmp/bands/{id_}.json'))
full = Image.new('RGB', (3840, H * 2))
for bd in d['bands']:
    im = Image.open(bd['f']).convert('RGB')
    full.paste(im, (0, bd['y'] * 2))  # later bands overwrite overlap (last band is bottom-aligned)
n = -(-H // CH)
for i in range(n):
    y0, y1 = i * CH, min(H, (i + 1) * CH)
    full.crop((0, y0 * 2, 3840, y1 * 2)).save(f'public/strips/{id_}-{i}.png', optimize=False)
json.dump({'id': id_, 'height': H, 'chunk': CH, 'count': n}, open(f'public/strips/{id_}.json', 'w'))
