from pathlib import Path
import json,hashlib,struct,datetime
ROOT=Path(__file__).resolve().parents[1]
dex=json.loads((ROOT/'discovery/pokedex/catalog.json').read_text())['entries']
refs=json.loads((ROOT/'assets/references/manifest.json').read_text())['references']
entries={d['slug']:{'id':d['nationalId'],'slug':d['slug'],'name':d['name'],'types':d['types'],'generation':d['generation'],'images':[],'models':[]} for d in dex}
for r in refs:
 if r.get('status')!='downloaded':continue
 entries[r['slug']]['images'].append({'label':r['kind'].replace('_',' ').title(),'stage':'Reference','path':'assets/references/'+r['object'],'width':r['width'],'height':r['height'],'sha256':r['sha256'],'bytes':r['bytes'],'source':r['sourceUrl'],'note':r['viewDescription']})
def asset(p,label,stage):
 b=p.read_bytes();w,h=(struct.unpack('>II',b[16:24]) if b.startswith(b'\x89PNG') else (None,None))
 note='Working candidate; not an approved final asset.'
 if 'charizard-photoreal' in str(p):note='Rejected procedural attempt — not a Hunyuan3D baseline.'
 if 'charizard-hunyuan-face' in str(p):note='Rejected: poor reconstruction and added eyes/teeth fail the reference and quality target. Retained for comparison; do not use as an approved asset.'
 return {'label':label,'stage':stage,'path':str(p.relative_to(ROOT)),'width':w,'height':h,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'source':'Local '+stage.lower()+' iteration','note':note}
for species in ('bulbasaur','pidgey','wooloo','charizard'):
 e=entries[species]
 for p in sorted((ROOT/'assets/comfyui/output'/species).glob('*.png')):
  if p.stem.startswith('control-vae-'):continue
  if p.stem.startswith('hero-decoder-control-'):continue
  item=asset(p,p.stem,'Concept')
  if p.stem.startswith(('hero-reference-','hero-refined-mask-')):
   item['stage']='Small edits'
   item['source']='ComfyUI SAM2.1 extraction of Telegram reference 1'
   item['note']='Source RGB preserved relative to Comfy decoder. Geometry trial input; inspect fire-lit underside and edge artifacts. Not a finished asset.'
   if p.stem.startswith('hero-refined-mask-'):
    item['note']='Rejected mask experiment: added negative points damaged eye and wing boundaries and included background poles. Do not use for generation.'
  if p.stem.startswith('sam2-'):
   item['stage']='Small edits'
   item['source']='ComfyUI SAM2.1 segmentation of original video frame'
   item['note']='Mask trial; RGB preserved. Inspect edge holes, wing cropping and missing tail. Not accepted as final Hunyuan input.'
  if p.stem.startswith('minimal-lighting-'):
   item['stage']='Small edits'
   item['source']='ComfyUI source-latent edit of Telegram reference 1'
   item['note']='Low-denoise lighting test; preserves composition. Compare against your original. Not a pose or background edit.'
  if species=='charizard' and p.stem.startswith('selected-'):
   ref='origins-ice-cave.png' if 'origins-ice-cave' in p.stem else 'anime-flight.jpg'
   item['source']='ComfyUI FLUX.2 Klein 4B; selected input: '+ref
   item['note']='Generated from your selected anime reference. Candidate for review; not a final model.'
   review_file=p.parent/'reviews.json'
   if review_file.exists():item['note']=json.loads(review_file.read_text()).get(p.name,item['note'])
  if species=='charizard' and p.stem.startswith('telegram-reference-'):
   item['source']='ComfyUI generation from user-supplied Telegram reference'
   item['note']='Generated candidate v4 from your Telegram image; compare against original.'
   review_file=p.parent/'reviews.json'
   if review_file.exists():item['note']=json.loads(review_file.read_text()).get(p.name,item['note'])
  e['images'].append(item)
 for folder in sorted((ROOT/'assets/blender').glob(species+'*')):
  if not folder.is_dir():continue
  for p in sorted(folder.rglob('*.png')):e['images'].append(asset(p,' / '.join(p.relative_to(ROOT/'assets/blender').parts[1:]) if 'photoreal' in folder.name else folder.name+' / '+p.stem,'Blender'))
  for p in sorted(folder.rglob('*')):
   if p.suffix in ('.glb','.blend'):e['models'].append({'label':str(p.relative_to(ROOT/'assets/blender')),'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size})
for rel,stage in [('references','TV show'),('realism-references','Realism reference'),('telegram-references','Your references'),('instagram-references','Instagram')]:
 extra=ROOT/('assets/charizard-hunyuan/'+rel+'/manifest.json')
 if extra.exists():
  data=json.loads(extra.read_text())
  rows=data if isinstance(data,list) else data.get('images',data.get('references',[]))
  if isinstance(data,dict) and data.get('videos'):entries['charizard'].setdefault('videos',[]).extend(data['videos'])
  for r in rows:
   p=ROOT/r['path']
   if not p.is_file():continue
   item=asset(p,r.get('label',p.stem),stage)
   item['source']=r.get('source',r.get('sourceUrl',''))
   item['note']=r.get('note','Reference; inspect source provenance.')
   item['width']=r.get('width',item['width']);item['height']=r.get('height',item['height'])
   entries['charizard']['images'].append(item)
order={'Reference':0,'TV show':1,'Realism reference':2,'Concept':3,'Blender':4,'Your references':-1,'Instagram':0.5,'Small edits':2.5}
for e in entries.values():e['images'].sort(key=lambda r:(order[r['stage']],{'Official Artwork':0,'Home':1}.get(r['label'],2),r['label']))
output={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'species':list(entries.values()),'designs':[{'name':'Playable game UI','url':'http://127.0.0.1:5183/?practice=trio','source':'game/index.html','description':'Recovered creature game interface, with working battle/party/save systems.'},{'name':'3D creature studio','url':'http://127.0.0.1:5183/studio.html','source':'game/studio.html','description':'Current interactive model and image comparison.'},{'name':'Reference library','url':'../assets/references/','source':'assets/references/index.html','description':'Full Pokédex reference gallery.'},{'name':'Historical A/B mockup','url':'../game/ab.html','source':'game/ab.html','description':'Recovered experiment page. Historical external assets may be missing.'}]}
(ROOT/'devtools/catalog.json').write_text(json.dumps(output,separators=(',',':')))
print('Catalog:',len(entries),'species,',sum(len(e['images']) for e in entries.values()),'images')
