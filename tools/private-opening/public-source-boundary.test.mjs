import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createServer,preview} from 'vite';
import {repository} from './gate.mjs';

test('public dev and preview deny private source, contract and encoded filesystem routes',async()=>{
 const cache=fs.mkdtempSync(path.join(os.tmpdir(),'public-boundary-vite-'));
 const dev=await createServer({cacheDir:cache,optimizeDeps:{noDiscovery:true,include:[],entries:[]},server:{host:'127.0.0.1',port:5182,strictPort:true}});
 let built;
 try {
  await dev.listen();built=await preview({preview:{host:'127.0.0.1',port:4182,strictPort:true}});
  const privatePaths=['/private.html','/src/privateOpening/main.ts','/tools/private-opening/species/charizard.py','/canonical/opening/contract.json','/private-opening/roster/charizard.glb',`/@fs${repository}tools/private-opening/species/charizard.py`,`/@fs${repository}src/privateOpening/main.ts`,'/tools%2fprivate-opening%2fspecies%2fcharizard.py','/canonical/x/../opening/contract.json'];
  for(const port of [5182,4182]){
   for(const route of privatePaths){const response=await fetch(`http://127.0.0.1:${port}${route}`);assert.equal(response.status,404,`${port}: ${route}`);}
   const publicPage=await fetch(`http://127.0.0.1:${port}/`);assert.equal(publicPage.status,200);
  }
 }finally{await dev.close();if(built)await new Promise(resolve=>built.httpServer.close(resolve));fs.rmSync(cache,{recursive:true,force:true});}
});
