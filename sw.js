/* Offline copy. A new build has a new version, which replaces the old copy. */
const PREFIX = 'ristudy-v2:' + encodeURIComponent(self.registration.scope) + ':';
const V = PREFIX + 'ef2f7c225410';
const FILES = ['./', 'index.html', 'data.js', 'manifest.webmanifest', 'icon-180.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // network first so a new set shows up at once; the cached copy covers no signal
  e.respondWith(fetch(e.request).then(async r => {
    if (r.ok) {
      try { const c = await caches.open(V); await c.put(e.request, r.clone()); }
      catch (error) { console.warn('Offline cache update failed', error); }
    }
    return r;
  }).catch(() => caches.open(V).then(async c =>
    (await c.match(e.request, { ignoreSearch: true })) || c.match('index.html'))));
});
