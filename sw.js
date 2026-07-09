// Wildmask service worker — cache-first so the game runs fully offline once installed.
const CACHE = 'wildmask-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './lib/three.min.js',
  './js/util.js',
  './js/world.js',
  './js/animal_builders.js',
  './js/animals.js',
  './js/combat.js',
  './js/player.js',
  './js/npcs.js',
  './js/ui.js',
  './js/mobile.js',
  './js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (e.request.method === 'GET' && res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
