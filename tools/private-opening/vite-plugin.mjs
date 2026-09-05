import fs from 'node:fs';
import path from 'node:path';
import { contract, digest, openingReadiness, privateBytes } from './gate.mjs';

import {rosterAsset,rosterIds} from './roster.mjs';

export function privateOpeningPlugin(reviewOnly) {
  let isBuild=false;
  function middleware(req, res, next) {
    if (!req.url?.startsWith('/private-opening/')) return next();
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // A localhost service is not a public asset host or an asset proxy for
    // arbitrary sites. Bind at Vite as well as checking Host and Origin here.
    const allowed = value => {
      try { return ['localhost','127.0.0.1','[::1]'].includes(new URL(value).hostname); } catch { return false; }
    };
    if (!allowed(`http://${req.headers.host}`) || (req.headers.origin && !allowed(req.headers.origin)) || req.headers['sec-fetch-site'] === 'cross-site') {
      res.statusCode=403; res.end('Private local requests only'); return;
    }
    if (!['GET','HEAD'].includes(req.method)) {res.statusCode=405;res.end();return;}
    const requestPath=req.url.split('?')[0];
    const rosterMatch=/^\/private-opening\/roster\/([a-z0-9-]+)\.(json|glb)$/.exec(requestPath);
    if(rosterMatch) {
      if(!rosterIds.includes(rosterMatch[1])) {res.statusCode=404;res.end('Not allowlisted');return;}
      try {
        const asset=rosterAsset(rosterMatch[1]);
        res.setHeader('Content-Type',rosterMatch[2]==='glb'?'model/gltf-binary':'application/json');
        const bytes=rosterMatch[2]==='glb'?privateBytes(contract.assetRoot,`roster/${asset.id}/model.glb`):JSON.stringify(asset);
        if(rosterMatch[2]==='glb'&&digest(bytes)!==asset.sha256)throw new Error('changed');
        res.end(req.method==='HEAD'?undefined:bytes);
      }catch(error){res.statusCode=409;res.end(JSON.stringify({error:error.message}));}
      return;
    }
    const readiness=openingReadiness({promoted:false});
    if(requestPath==='/private-opening/catalog') {
      res.statusCode=readiness.ok?200:503;res.setHeader('Content-Type','application/json');
      res.end(req.method==='HEAD'?undefined:JSON.stringify(readiness));return;
    }
    const match=/^\/private-opening\/assets\/([a-z0-9-]+)\.glb$/.exec(requestPath);
    const character=match?contract.characters.find(c=>c.id===match[1]):undefined;
    if(!character) {res.statusCode=404;res.end('Not allowlisted');return;}
    if(!readiness.ok) {res.statusCode=503;res.end('Private character acceptance required');return;}
    try {
      const asset=readiness.assets.find(a=>a.id===character.id);
      const bytes=privateBytes(contract.assetRoot,character.candidate);
      if(digest(bytes)!==asset.sha256) throw new Error('changed');
      res.setHeader('Content-Type','model/gltf-binary');res.setHeader('Content-Length',bytes.length);res.end(req.method==='HEAD'?undefined:bytes);
    } catch {res.statusCode=409;res.end('Private asset changed');}
  }
  return {
    name:'private-opening-boundary',
    configResolved(config) {
      isBuild=config.command==='build';
      // Refuse a redirected data plane before Vite writes any private output.
      let current=path.parse(contract.assetRoot).root;
      for(const part of contract.assetRoot.slice(current.length).split(path.sep)) {
        current=path.join(current,part);
        if(fs.existsSync(current)) {
          const stat=fs.lstatSync(current);
          if(stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('PRIVATE_OUTPUT_PATH_REJECTED');
        } else fs.mkdirSync(current,{mode:0o700});
      }
      fs.chmodSync(contract.assetRoot,0o700);
      if(!['127.0.0.1','localhost','::1'].includes(String(config.server.host)) || !['127.0.0.1','localhost','::1'].includes(String(config.preview.host))) throw new Error('PRIVATE_SERVER_MUST_BIND_LOOPBACK');
      if(config.build.outDir && !path.resolve(config.build.outDir).startsWith(contract.assetRoot+path.sep)) throw new Error('PRIVATE_BUILD_OUTPUT_REJECTED');
      const checkTree=dir=>{
        if(!fs.existsSync(dir)) return;
        const stat=fs.lstatSync(dir);
        if(stat.isSymbolicLink()) throw new Error('PRIVATE_OUTPUT_SYMLINK_REJECTED');
        if(stat.isDirectory()) for(const entry of fs.readdirSync(dir)) checkTree(path.join(dir,entry));
      };
      checkTree(path.resolve(config.build.outDir));
    },
    buildStart() {
      if(!isBuild || reviewOnly) return;
      const readiness=openingReadiness({promoted:false});
      if(!readiness.ok) throw new Error(`${readiness.code}: ${readiness.errors.join('; ')}`);
      for(const id of rosterIds)rosterAsset(id);
    },
    configureServer(server) {server.middlewares.use(middleware);},
    configurePreviewServer(server) {server.middlewares.use(middleware);},
    transformIndexHtml(html, context) {
      if(context.filename.endsWith('index.html')) return fs.readFileSync(path.join(path.dirname(context.filename),'private.html'),'utf8');
      return html;
    },
  };
}
