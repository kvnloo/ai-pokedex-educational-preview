import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./service-worker.js', import.meta.url), 'utf8');
function worker({ failInstall = false } = {}) {
  const release = { cacheName: 'pokedex-private-shell-root-new', cachePrefix: 'pokedex-private-shell-root-', files: ['/pokedex.html', '/assets/pokedex-hash.js'] };
  const events = new Map();
  const deleted = [], added = [], matched = [], fetched = [];
  const cache = {
    async addAll(requests) { added.push(...requests); if (failInstall) throw new Error('offline icon'); },
    async match(key) { matched.push(key); return 'cached:' + key; },
  };
  vm.runInNewContext(source.replace('__POKEDEX_RELEASE__', JSON.stringify(release)), {
    self: { registration: { scope: 'https://pokedex.test/' }, location: { origin: 'https://pokedex.test' }, addEventListener: (name, callback) => events.set(name, callback) },
    caches: { open: async () => cache, keys: async () => [release.cacheName, release.cachePrefix + 'old', 'another-app', 'pokedex-private-shell-otherbase-old'], delete: async key => deleted.push(key) },
    Request: class { constructor(url, options) { this.url = url; this.cache = options.cache; } }, URL,
    fetch: async request => { fetched.push(request); return 'network'; },
  });
  return { events, deleted, added, matched, fetched };
}

test('failed precache discards only the partial new cache and rejects installation', async () => {
  const w = worker({ failInstall: true });
  let task;
  w.events.get('install')({ waitUntil: promise => { task = promise; } });
  await assert.rejects(task, /offline icon/);
  assert.deepEqual(w.deleted, ['pokedex-private-shell-root-new']);
  assert.deepEqual(w.added.map(r => [r.url, r.cache]), [['/pokedex.html', 'reload'], ['/assets/pokedex-hash.js', 'reload']]);
});

test('activation deletes only stale caches belonging to this app and base path', async () => {
  const w = worker(); let task;
  w.events.get('activate')({ waitUntil: promise => { task = promise; } });
  await task;
  assert.deepEqual(w.deleted, ['pokedex-private-shell-root-old']);
});

test('fetch routes only exact shell files and Pokédex navigation to the cache', async () => {
  const w = worker();
  for (const [path, method, mode, expected] of [
    ['/pokedex.html?launch=homescreen', 'GET', 'navigate', '/pokedex.html'],
    ['/assets/pokedex-hash.js', 'GET', 'cors', '/assets/pokedex-hash.js'],
    ['/pokedex.html?account=other', 'GET', 'cors', null],
    ['/assets/pokedex-hash.js?dev', 'GET', 'cors', null],
    ['/index.html', 'GET', 'navigate', null],
    ['/pokedex-device.html', 'GET', 'navigate', null],
    ['/private-assets/charizard.glb', 'GET', 'cors', null],
    ['/api/profile', 'GET', 'cors', null],
    ['/pokedex.html', 'POST', 'navigate', null],
    ['https://other.test/pokedex.html', 'GET', 'navigate', null],
  ]) {
    let response;
    w.events.get('fetch')({ request: { url: new URL(path, 'https://pokedex.test/').href, method, mode }, respondWith: promise => { response = promise; } });
    assert.equal(response ? await response : null, expected ? 'cached:' + expected : null, path);
  }
  assert.equal(w.fetched.length, 0);
});
