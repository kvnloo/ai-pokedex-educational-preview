/* Replaced by the private build with the exact compiled Pokédex shell. */
const release = __POKEDEX_RELEASE__;
const allowed = new Set(release.files);
const shell = new URL('pokedex.html', self.registration.scope).pathname;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(release.cacheName);
      await cache.addAll(release.files.map(file => new Request(file, { cache: 'reload' })));
    } catch (error) {
      await caches.delete(release.cacheName);
      throw error;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(release.cachePrefix) && name !== release.cacheName)
      .map(name => caches.delete(name)));
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const isShell = request.mode === 'navigate' && url.pathname === shell;
  if (!isShell && (url.search || !allowed.has(url.pathname))) return;
  event.respondWith((async () => {
    const cache = await caches.open(release.cacheName);
    return await cache.match(isShell ? shell : url.pathname) ?? fetch(request);
  })());
});

// No skipWaiting/clients.claim: open sessions keep their coherent shell version.
// No runtime cache writes: models, references, APIs and other routes stay uncached.
