const CACHE = 'bske-2026-guide-v1';
const CORE = [
  './', './index.html', './style.css', './app.js', './manifest.json', './assets/bske-logo.svg',
  './assets/case-scenario-grandfather-grandson.jpg', './assets/icon-180.png', './assets/icon-192.png', './assets/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp => {
    const clone = resp.clone();
    caches.open(CACHE).then(cache => cache.put(req, clone));
    return resp;
  }).catch(() => caches.match('./index.html'))));
});
