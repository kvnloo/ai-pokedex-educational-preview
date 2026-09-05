import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const html=readFileSync(resolve(root,'pokedex.html'),'utf8');
const source=readFileSync(resolve(root,'src/pokedex/main.ts'),'utf8');
const css=readFileSync(resolve(root,'src/pokedex/pokedex.css'),'utf8');

test('private Pokédex uses the reviewed mesh for hardware and keeps controls in its display',()=>{
  assert.match(html,/id="pokedex-shell"/);
  assert.match(html,/id="display-aperture"/);
  assert.doesNotMatch(html,/hardware-bar|physical-controls|class="lens"|class="dpad"|scan-trigger|face-buttons/);
  assert.match(html,/id="audio-toggle"/);
  assert.match(html,/aria-label="V3 Scarlet Field Pokédex"/);
});

test('field OS connects the core scan, identify, register and research loop',()=>{
  for(const token of ["current='scan'","title.textContent='Pidgey'","p.status='caught'","p.research=Math.min(10,p.research+1)"]) assert.ok(source.includes(token),token);
});

test('mini-app suite is complete and contextual',()=>{
  for(const token of ['Field Index','Habitat Map','Research','Field Team','Camera','Comms','Journal','Weather','Music','Settings']) assert.ok(source.includes(token),token);
});

test('music is procedural and honors accessibility preferences',()=>{
  assert.match(source,/new AudioContext/);
  assert.doesNotMatch(source,/new Audio\(|\.mp3|\.wav|fetch\(/);
  assert.match(css,/prefers-reduced-motion/);
});
