import {createPokedexMotion} from './pokedex-motion.js';

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assetUrl=path=>new URL(String(path).replace(/^\/+/, ''),document.baseURI).href;
const title=value=>String(value||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const safeSource=value=>/^https?:\/\//i.test(value||'')?value:null;
const tabs=['entry','images','iterations'];
const typeColors={fire:'#f6a76c',flying:'#b4bcf6',grass:'#a6d686',poison:'#d6a0e2',water:'#83c9f0',bug:'#c6d77d',normal:'#d0c7b8',electric:'#f5d673',ground:'#dac095',fairy:'#edb7d9',fighting:'#edaa8a',psychic:'#f3a5c5',rock:'#d2c38a',steel:'#bbd2da',ice:'#a0e4e3',ghost:'#c1b0e3',dragon:'#a2b5ff',dark:'#bbb5b0'};
let index=[],current=null,entry=null,tab='entry',image=null,runId='',view='',generationRequest=0;
let catalogPromise,experimentsPromise,reviewsPromise,choices={};
let galleryStage='',galleryLimit=24,savingChoice=false,speaking=false,speechToken=0,modalNavigation=false;
const shards=new Map();

async function getJson(path){const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw Error(`HTTP ${response.status}`);return response.json();}
function catalog(){return catalogPromise ||= getJson('./data/catalog.json').catch(error=>{catalogPromise=null;throw error;});}
function experiments(){return experimentsPromise ||= getJson('./data/experiments.json').catch(error=>{experimentsPromise=null;throw error;});}
function reviews(){return Promise.resolve({});}
function shard(generation){if(!shards.has(generation))shards.set(generation,getJson(`./data/shards/species-gen-${String(generation).padStart(2,'0')}.json`).catch(error=>{shards.delete(generation);throw error;}));return shards.get(generation);}
function query(){return new URLSearchParams(location.search);}
function route(push=false){const url=new URL(location.href);for(const [key,value] of Object.entries({pokemon:current?.slug,tab:tab==='entry'?'':tab,image:image?.path,run:runId,view})){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}history[push?'pushState':'replaceState'](null,'',url.pathname+url.search);}
function status(message){$('utility-status').textContent=message;}
function sourceLink(url,label){return safeSource(url)?`<a class="source-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`:'';}
function typeMarkup(types){return types.map(type=>`<span class="type" style="--type-color:${typeColors[type]||'#c6d2d0'}">${esc(type)}</span>`).join('');}
function stopSpeech(){speechToken++;if('speechSynthesis'in window)window.speechSynthesis.cancel();speaking=false;$('read-entry').querySelector('span').textContent='Read entry';}
const motion=createPokedexMotion($('art-stage'),(message,enabled)=>{status(message);$('tilt-toggle').disabled=motion.reducedMotion();$('tilt-toggle').setAttribute('aria-pressed',String(enabled));$('tilt-toggle').querySelector('span').textContent=motion.reducedMotion()?'Motion off':enabled?'Tilt on':'Enable tilt';});
$('tilt-toggle').onclick=()=>motion.toggle();
if(motion.reducedMotion()){$('tilt-toggle').disabled=true;$('tilt-toggle').querySelector('span').textContent='Motion off';}

function updateNavigation(){const position=index.findIndex(species=>species.slug===current.slug);$('previous').disabled=position===0;$('next').disabled=position===index.length-1;$('previous-name').textContent=index[position-1]?.name||'Previous';$('next-name').textContent=index[position+1]?.name||'Next';$('nav-position').textContent=`${String(current.nationalId).padStart(3,'0')} / ${index.length.toLocaleString()} ENTRIES`;}
function changeSpecies(direction){if(!current||document.querySelector('dialog[open]'))return;const position=index.findIndex(species=>species.slug===current.slug);const next=index[position+direction];if(next)void selectSpecies(next,{push:true});}
$('previous').onclick=()=>changeSpecies(-1);$('next').onclick=()=>changeSpecies(1);motion.setSwipeHandler(changeSpecies);

async function selectSpecies(species,{push=false,fromHistory=false}={}){
  const ticket=++generationRequest;
  current=species;entry=null;image=null;galleryLimit=24;stopSpeech();motion.reset();
  if(!fromHistory){runId='';view='';}
  $('pokemon-name').textContent=species.name;$('pokemon-name').classList.toggle('long-name',species.name.length>11);$('screen-number').textContent='NO. '+String(species.nationalId).padStart(4,'0');$('background-number').textContent=String(species.nationalId).padStart(3,'0');$('types').innerHTML=typeMarkup(species.types);
  $('region-label').textContent='NATIONAL · GENERATION '+species.generation;
  $('entry-category').textContent='POKÉMON RECORD';$('screen-state').textContent='LOCAL ARCHIVE';$('hero').hidden=true;$('hero').removeAttribute('src');$('art-caption').textContent='';$('art-message').hidden=false;$('art-message').textContent='Loading official artwork…';$('read-entry').disabled=true;status('');
  $('image-count').textContent='';$('iteration-count').textContent='';$('panel-entry').innerHTML='<div class="panel-loading">Opening the entry…</div>';
  updateNavigation();if(!fromHistory)route(push);showTab(tab,false);
  const detailPromise=shard(species.generation).then(data=>{
    if(ticket!==generationRequest)return;
    entry=data.species.find(item=>item.slug===species.slug);
    if(!entry)throw Error('Entry missing');
    renderEntry();$('read-entry').disabled=!entry.flavor||!('speechSynthesis'in window);
    $('entry-category').textContent=entry.genus||'POKÉMON RECORD';
  }).catch(()=>{if(ticket===generationRequest)$('panel-entry').innerHTML='<div class="panel-error">The entry could not load. <button class="small-button" id="retry-entry">Retry</button></div>';const retry=$('retry-entry');if(retry)retry.onclick=()=>selectSpecies(current);});
  const artPromise=catalog().then(data=>{
    if(ticket!==generationRequest)return;
    const assets=data.species.find(item=>item.slug===species.slug);
    $('image-count').textContent=assets?.images?.length||'';
    const official=assets?.images?.find(item=>item.stage==='Reference'&&item.label==='Home')||assets?.images?.find(item=>item.stage==='Reference'&&item.label==='Official Artwork');
    if(!official){$('art-message').textContent='No official artwork is available.';return;}
    const hero=$('hero');hero.onload=()=>{if(ticket===generationRequest){hero.hidden=false;$('art-message').hidden=true;}};hero.onerror=()=>{if(ticket===generationRequest){hero.hidden=true;$('art-message').hidden=false;$('art-message').textContent='Artwork could not load.';}};hero.src=assetUrl(official.path);hero.alt=`${species.name}, official ${official.label==='Home'?'HOME render':'artwork'}`;$('art-caption').textContent=official.label==='Home'?'OFFICIAL HOME RENDER':'OFFICIAL ARTWORK';
  }).catch(()=>{if(ticket===generationRequest)$('art-message').textContent='Artwork is unavailable. Entry data is still accessible.';});
  await Promise.allSettled([detailPromise,artPromise]);
}

function renderEntry(){
  if(!entry)return;
  const labels={hp:'HP',atk:'ATK',def:'DEF',spa:'SP.ATK',spd:'SP.DEF',spe:'SPEED'};
  const parent=index.find(species=>species.nationalId===entry.evolvesFromId);
  $('panel-entry').innerHTML=`<div class="physical-facts"><div><small>Height</small><strong>${esc(entry.heightM??'—')} <span>m</span></strong></div><div><small>Weight</small><strong>${esc(entry.weightKg??'—')} <span>kg</span></strong></div><div><small>Habitat</small><strong style="font-size:12px">${esc(title(entry.habitat)||'Unrecorded')}</strong></div></div>
    <p class="entry-flavor">${esc(entry.flavor||'No Pokédex entry text is stored for this Pokémon yet.')}</p>
    <div class="section-label">Base stats<span>SPECIES VALUES</span></div><div class="stats-grid">${Object.entries(labels).map(([key,label])=>{const value=entry.baseStats?.[key];return `<div class="stat-row" aria-label="${esc(label)} ${value??'unrecorded'}"><span>${label}</span><div class="stat-track" aria-hidden="true"><div class="stat-fill" style="width:${typeof value==='number'?Math.max(0,Math.min(100,value/255*100)):0}%"></div></div><strong>${value??'—'}</strong></div>`;}).join('')}</div>
    <details class="entry-more"><summary>Abilities & evolution</summary><div>${(entry.abilities||[]).map(ability=>`<span class="ability-pill">${esc(title(ability.slug))}${ability.isHidden?'<small>Hidden</small>':''}</span>`).join('')}</div><p>${parent?`Evolves from <a href="?pokemon=${esc(parent.slug)}" data-species="${esc(parent.slug)}">${esc(parent.name)}</a>.`:'No earlier evolution is recorded.'}</p>${sourceLink(entry.source?.pokemonUrl,'View source data')}<p class="source-link">Local PokéAPI record · ${esc(entry.source?.syncedAt?.slice(0,10)||'date unrecorded')}</p><p><a class="source-link" href="../../discovery/pokedex-research/report.html">Pokédex design research</a></p></details>`;
  $('panel-entry').querySelectorAll('[data-species]').forEach(link=>link.onclick=event=>{event.preventDefault();const species=index.find(item=>item.slug===link.dataset.species);if(species)selectSpecies(species,{push:true});});
}

async function showTab(next,push=false){
  tab=tabs.includes(next)?next:'entry';
  document.querySelectorAll('[data-tab]').forEach(button=>{if(button.dataset.tab===tab)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  tabs.forEach(name=>$('panel-'+name).hidden=name!==tab);
  if(push)route(true);
  if(tab==='images')await renderGallery();
  if(tab==='iterations')await renderIterations();
}
document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>showTab(button.dataset.tab,true));

async function renderGallery(){
  if(!current)return;const slug=current.slug;
  $('panel-images').innerHTML='<div class="panel-loading">Opening reference images…</div>';
  try{
    const [data,saved]=await Promise.allSettled([catalog(),getJson('/api/selections')]);
    if(current.slug!==slug)return;
    if(data.status!=='fulfilled')throw Error('Gallery unavailable');
    if(saved.status==='fulfilled')choices=saved.value;
    const assets=data.value.species.find(species=>species.slug===slug)?.images||[];
    const categories=[...new Set(assets.map(item=>item.stage))];
    if(!categories.includes(galleryStage))galleryStage='';
    const filtered=assets.filter(item=>!galleryStage||item.stage===galleryStage);
    $('panel-images').innerHTML=`<div class="gallery-toolbar"><select id="gallery-category" aria-label="Image category"><option value="">All images</option>${categories.map(category=>`<option value="${esc(category)}" ${category===galleryStage?'selected':''}>${esc(category)}</option>`).join('')}</select><span class="gallery-count">${filtered.length} images</span></div><div class="gallery-grid">${filtered.slice(0,galleryLimit).map(item=>`<button class="gallery-card ${(choices[slug]||[]).includes(item.path)?'selected':''}" data-image="${esc(item.path)}" aria-label="Inspect ${esc(item.label)}"><img loading="lazy" src="${esc(assetUrl(item.path))}" alt="${esc(item.label)}"><span>${esc(item.label)}</span>${(choices[slug]||[]).includes(item.path)?'<span class="choice-mark" aria-label="Selected">✓</span>':''}</button>`).join('')}</div>${!filtered.length?'<p class="panel-loading">No images in this category yet.</p>':''}${filtered.length>galleryLimit?'<button class="load-more" id="gallery-more">Show more images</button>':''}${saved.status==='rejected'?'<p class="sheet-note">Saved choices could not load. Open an image to retry before choosing.</p>':''}`;
    $('gallery-category').onchange=()=>{galleryStage=$('gallery-category').value;galleryLimit=24;renderGallery();};
    $('gallery-more')?.addEventListener('click',()=>{galleryLimit+=24;renderGallery();});
    $('panel-images').querySelectorAll('[data-image]').forEach(button=>button.onclick=()=>openImage(assets.find(item=>item.path===button.dataset.image),true));
  }catch{$('panel-images').innerHTML='<div class="panel-error">Reference images could not load. <button class="small-button" id="retry-gallery">Retry</button></div>';$('retry-gallery').onclick=renderGallery;}
}

function openImage(item,push=false){
  if(!item)return;
  image=item;$('image-title').textContent=item.label;$('image-stage').textContent=item.stage;$('inspected-image').src=assetUrl(item.path);$('inspected-image').alt=item.label;
  $('image-details').innerHTML=`<p>${esc(item.note||'')}</p><p>${item.width&&item.height?`${item.width} × ${item.height} · `:''}${Math.round((item.bytes||0)/1024)} KB</p>${sourceLink(item.source,'Original source')}<details><summary>Image provenance</summary><p>${esc(item.source||'Source not recorded')}</p><code>${esc(item.path)}</code><p>SHA-256</p><code>${esc(item.sha256||'Not recorded')}</code></details><p><a href="${esc(assetUrl(item.path))}" target="_blank" rel="noopener">Open full image</a></p>`;
  $('choice-status').textContent='';updateChoiceButton();if(!$('image-dialog').open)$('image-dialog').showModal();
  if(push){modalNavigation=true;route(true);}
}
function updateChoiceButton(){const chosen=(choices[current?.slug]||[]).includes(image?.path);$('image-choose').setAttribute('aria-pressed',String(chosen));$('image-choose').textContent=chosen?'Selected · remove choice':'Choose reference';$('image-choose').disabled=savingChoice;}
$('image-choose').onclick=async()=>{
  if(!image||!current||savingChoice)return;
  const slug=current.slug,path=image.path;const wantSelected=!(choices[slug]||[]).includes(path);
  savingChoice=true;updateChoiceButton();$('choice-status').textContent='Saving your choice…';
  try{
    const response=await fetch('/api/selections/image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({species:slug,path,selected:wantSelected})});
    if(!response.ok)throw Error(`HTTP ${response.status}`);
    const result=await response.json();if(!result.saved||!result.selections)throw Error('Save was not confirmed');choices=result.selections;if(current?.slug===slug&&image?.path===path)$('choice-status').textContent='Choice saved to this project.';
    if(tab==='images')void renderGallery();
  }catch{if(current?.slug===slug&&image?.path===path)$('choice-status').textContent='The save could not be confirmed. Try again.';}
  finally{savingChoice=false;updateChoiceButton();}
};

async function renderIterations(){
  if(!current)return;const slug=current.slug;
  $('panel-iterations').innerHTML='<div class="panel-loading">Opening the experiment record…</div>';
  try{
    const [records,saved]=await Promise.allSettled([experiments(),reviews()]);
    if(slug!==current.slug)return;
    if(records.status!=='fulfilled')throw Error('Experiments unavailable');
    const runs=records.value.runs.filter(run=>run.species===slug);
    $('iteration-count').textContent=runs.length||'';
    if(!runs.length){$('panel-iterations').innerHTML='<div class="panel-loading">No experiments are recorded for this Pokémon yet.</div>';return;}
    const run=runs.find(item=>item.id===runId)||runs.find(item=>item.outputs?.previews?.length)||runs[0];runId=run.id;
    const previews=run.outputs?.previews||[];if(!previews.some(item=>item.view===view))view=previews[0]?.view||'';
    const preview=previews.find(item=>item.view===view),human=saved.status==='fulfilled'?saved.value[run.id]:null;
    const stageLabel=run.stage||'Stage not recorded';const other=runs.find(item=>item.id!==run.id&&item.stage===run.stage)||runs.find(item=>item.id!==run.id);
    const compare=new URLSearchParams({pokemon:slug,a:run.id});if(other)compare.set('b',other.id);if(view)compare.set('view',view);
    $('panel-iterations').innerHTML=`<select class="iteration-selector" id="iteration-selector" aria-label="Choose an experiment">${runs.map(item=>`<option value="${esc(item.id)}" ${item.id===run.id?'selected':''}>${esc(item.title||item.id)}</option>`).join('')}</select><div class="iteration-preview">${preview?`<img src="${esc(assetUrl(preview.path))}" alt="${esc(run.title)} · ${esc(view)}">`:'<p class="iteration-empty">No rendered view is recorded for this attempt.</p>'}${previews.length?`<div class="view-buttons">${previews.map(item=>`<button data-view="${esc(item.view)}" aria-pressed="${view===item.view}">${esc(item.view)}</button>`).join('')}</div>`:''}</div><h2 class="run-title">${esc(run.title||run.id)}</h2><div class="run-labels"><span>${esc(stageLabel)}</span><span>${esc(run.status||'Status unrecorded')}</span></div><p class="run-note">Assistant: ${esc(run.evaluation?.verdict||'Not reviewed')}<br>Your verdict: ${esc(human?.verdict||(saved.status==='fulfilled'?'Not reviewed':'Unavailable'))}</p><details class="entry-more"><summary>Assessment & artifact files</summary><p>${esc(typeof run.evaluation?.notes==='string'?run.evaluation.notes:JSON.stringify(run.evaluation?.notes||'No assessment recorded.'))}</p><div class="artifact-links">${run.outputs?.rawMesh?`<a href="${esc(assetUrl(run.outputs.rawMesh))}">Raw mesh</a>`:''}${run.outputs?.blend?`<a href="${esc(assetUrl(run.outputs.blend))}">Blender scene</a>`:''}${preview?`<a href="${esc(assetUrl(preview.path))}" target="_blank" rel="noopener">Full-size view</a>`:''}</div><p>${esc(run.id)}</p></details><a class="comparison-link" href="experiments.html?${esc(compare.toString())}">Compare attempts & review</a><button class="load-more" id="refresh-iterations">Refresh experiments</button>`;
    $('iteration-selector').onchange=()=>{runId=$('iteration-selector').value;view='';route(false);renderIterations();};
    $('panel-iterations').querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{view=button.dataset.view;route(false);renderIterations();});
    $('refresh-iterations').onclick=()=>{experimentsPromise=null;reviewsPromise=null;renderIterations();};
    route(false);
  }catch{$('panel-iterations').innerHTML='<div class="panel-error">Experiment records could not load. <button class="small-button" id="retry-iterations">Retry</button></div>';$('retry-iterations').onclick=renderIterations;}
}

function renderSearch(){const term=$('search-input').value.trim().toLowerCase();const matches=index.filter(species=>species.slug.includes(term)||species.name.toLowerCase().includes(term)||String(species.nationalId).padStart(4,'0').includes(term));$('search-summary').textContent=term?`${matches.length} matching Pokémon`:'Search the complete National Pokédex.';$('search-results').innerHTML=matches.slice(0,40).map(species=>`<button class="search-result" data-species="${esc(species.slug)}" aria-current="${species.slug===current?.slug}"><span class="result-number">${String(species.nationalId).padStart(3,'0')}</span><strong>${esc(species.name)}</strong><small>${esc(species.types.join(' / '))}</small></button>`).join('')+(matches.length>40?'<p class="sheet-note">Showing the first 40. Keep typing to narrow the list.</p>':'');$('search-results').querySelectorAll('[data-species]').forEach(button=>button.onclick=()=>{const species=index.find(item=>item.slug===button.dataset.species);$('search-dialog').close();selectSpecies(species,{push:true});});}
$('search-open').onclick=()=>{$('search-input').value='';renderSearch();$('search-dialog').showModal();$('search-input').focus();};$('search-input').oninput=renderSearch;
document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>$(button.dataset.close).close());
$('image-dialog').addEventListener('close',()=>{image=null;if(modalNavigation){modalNavigation=false;history.back();}else route(false);});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))return;if(event.key==='ArrowLeft'){event.preventDefault();changeSpecies(-1);}if(event.key==='ArrowRight'){event.preventDefault();changeSpecies(1);}});
$('read-entry').onclick=()=>{if(!entry?.flavor||!('speechSynthesis'in window))return;if(speaking){stopSpeech();status('Reading stopped.');return;}stopSpeech();const token=++speechToken;const utterance=new SpeechSynthesisUtterance(`${current.name}. ${entry.flavor}`);utterance.lang='en-US';utterance.rate=.94;utterance.onstart=()=>{if(token===speechToken){speaking=true;$('read-entry').querySelector('span').textContent='Stop reading';status('Reading the Pokédex entry.');}};utterance.onend=()=>{if(token===speechToken){speaking=false;$('read-entry').querySelector('span').textContent='Read entry';status('');}};utterance.onerror=()=>{if(token===speechToken){speaking=false;$('read-entry').querySelector('span').textContent='Read entry';status('Speech is unavailable. The entry text is shown below.');}};window.speechSynthesis.speak(utterance);};

async function applyRoute(){const params=query();const species=index.find(item=>item.slug===params.get('pokemon'))||index.find(item=>item.slug==='charizard')||index[0];tab=tabs.includes(params.get('tab'))?params.get('tab'):'entry';runId=params.get('run')||'';view=params.get('view')||'';const requestedImage=params.get('image');modalNavigation=false;if($('image-dialog').open&&!requestedImage)$('image-dialog').close();if(!current||current.slug!==species.slug)await selectSpecies(species,{fromHistory:true});else await showTab(tab,false);if(requestedImage){try{const data=await catalog();const item=data.species.find(item=>item.slug===species.slug)?.images.find(item=>item.path===requestedImage);if(item)openImage(item,false);}catch{status('That image could not load.');}}}
window.addEventListener('popstate',()=>void applyRoute());
try{const data=await getJson('./data/dex-index.json');index=data.entries.sort((a,b)=>a.nationalId-b.nationalId);await applyRoute();}catch{$('art-message').textContent='The archive could not load.';$('panel-entry').innerHTML='<div class="panel-error">The local Pokédex is unavailable. <button class="small-button" id="retry-page">Reload</button></div>';$('retry-page').onclick=()=>location.reload();}
