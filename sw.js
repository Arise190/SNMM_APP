const CACHE_NAME = 'snack-pos-v3';
const urlsToCache = [
  './',
  './index.html',
  './dashboard.html',
  './products.html',
  './categories.html',
  './stock.html',
  './history.html',
  './css/style.css',
  './css/pos.css',
  './css/admin.css',
  './js/db.js',
  './js/pos.js',
  './js/products.js',
  './js/stock.js',
  './js/history.js',
  './js/dashboard.js',
  './js/i18n.js',
  './img/logo2.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const freshFirstTypes = ['document', 'script', 'style'];

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (freshFirstTypes.includes(event.request.destination)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => response || caches.match('./index.html'));
      })
  );
});
