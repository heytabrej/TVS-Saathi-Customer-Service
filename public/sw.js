const CACHE = 'saathi-v1';
const ASSETS = ['/', '/manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() =>
      new Response('Offline. Please reconnect.', { status: 200, headers: { 'Content-Type':'text/plain' } })
    ))
  );
});