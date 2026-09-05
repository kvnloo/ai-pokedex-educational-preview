"""Unwarped 50% photographic overlays and silhouette metrics at native crop resolution."""
import argparse,json
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
HERE=Path(__file__).resolve().parent
OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v002')
REFS=OUT.parent/'v001/references'
FONT='/usr/share/fonts/TTF/DejaVuSans.ttf'

def text(draw,xy,value,fill='white',size=18):
    try:f=ImageFont.truetype(FONT,size)
    except OSError:f=ImageFont.load_default(size=size)
    draw.text(xy,value,fill=fill,font=f)

def reference_crops():
    refs=json.loads((HERE/'references.json').read_text());(OUT/'evidence').mkdir(exist_ok=True,parents=True)
    for variant,ref in refs.items():
        source=Image.open(REFS/ref['source'])
        for view in ['closed','open']:source.crop(ref[view]['crop']).save(OUT/f'evidence/{variant}-{view}-reference.png')

def compose(iteration):
    refs=json.loads((HERE/'references.json').read_text());metrics={}
    for variant,ref in refs.items():
        metrics[variant]={}
        for view in ['closed','open']:
            reference=Image.open(OUT/f'evidence/{variant}-{view}-reference.png').convert('RGB');w,h=reference.size
            raw=Image.open(OUT/variant/f'{view}-iteration-{iteration}.png').convert('RGBA')
            render=raw.resize((w,h),Image.Resampling.LANCZOS)
            mask=np.asarray(render)[:,:,3]>127
            traced=Image.new('L',(w,h));ImageDraw.Draw(traced).polygon([tuple(p) for p in ref[view]['outline']],fill=255);target=np.asarray(traced)>0
            intersection=np.count_nonzero(mask & target);union=np.count_nonzero(mask|target)
            landmarks=json.loads((OUT/variant/f'{view}-landmarks-{iteration}.json').read_text())
            errors={k:float(np.linalg.norm(np.array(v)-ref[view]['landmarks'][k])) for k,v in landmarks.items() if k in ref[view]['landmarks'] and ((view=='closed' and k=='lock') or (view=='open' and k!='lock'))}
            row={'silhouette_iou':intersection/union,'render_area_px':int(mask.sum()),'trace_area_px':int(target.sum()),'landmark_errors_px':errors,'median_landmark_error_px':float(np.median(list(errors.values()))),'method':'Native crop raster; alpha > 127; manual silhouette polygon; no image warp or silhouette morph.'}
            row['numeric_gate']=bool(row['silhouette_iou']>=.90 and row['median_landmark_error_px']<=8);metrics[variant][view]=row
            bg=Image.new('RGBA',raw.size,(27,31,35,255));bg.alpha_composite(raw)
            ref2=reference.resize(raw.size);over=Image.blend(ref2,bg.convert('RGB'),.5)
            over.save(OUT/'evidence'/f'{variant}-{view}-overlay50-{iteration}.png')
            # A contour view makes silhouette disagreement visible despite dark materials.
            contour=ref2.copy();d=ImageDraw.Draw(contour)
            outline=np.array(ref[view]['outline'])*2;d.line([tuple(p) for p in outline]+[tuple(outline[0])],fill='#00ffb4',width=2)
            edge=mask.copy();edge[1:-1,1:-1]=mask[1:-1,1:-1]&~(mask[:-2,1:-1]&mask[2:,1:-1]&mask[1:-1,:-2]&mask[1:-1,2:])
            for yy,xx in np.argwhere(edge):d.rectangle((xx*2,yy*2,xx*2+1,yy*2+1),fill='#ff60d5')
            cells=[ref2,bg.convert('RGB'),over,contour];sheet=Image.new('RGB',(raw.width*4,raw.height+70),(16,20,25));sd=ImageDraw.Draw(sheet)
            for i,(im,label) in enumerate(zip(cells,['REFERENCE','RENDER','50% OVERLAY','TRACE GREEN / RENDER PINK'])):
                sheet.paste(im,(i*raw.width,50));text(sd,(i*raw.width+10,12),label,size=17)
            text(sd,(10,raw.height+51),f'{variant} {view} | iteration {iteration} | silhouette IoU {row["silhouette_iou"]:.3f} | landmark median {row["median_landmark_error_px"]:.2f}px',size=14)
            sheet.save(OUT/'evidence'/f'{variant}-{view}-sheet-{iteration}.png')
            over.thumbnail((380,700));over.save(OUT/'evidence'/f'{variant}-{view}-overlay-preview-{iteration}.png')
    path=OUT/'evidence'/f'metrics-{iteration}.json';path.write_text(json.dumps(metrics,indent=2)+'\n');print(json.dumps(metrics,indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--iteration');p.add_argument('--prepare',action='store_true');a=p.parse_args()
    if a.prepare:reference_crops()
    if a.iteration:compose(a.iteration)
