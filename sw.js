const CACHE_NAME = 'ar-scanner-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './targets.mind',
  './images/yosi.png',
  './images/parking.png',
  './images/noturn.png',
  './images/twoway.png',
  './images/narrowroad.png',
  './images/slippery.png',
  './images/predestrian.png',
  './images/windingroad.png',
  './images/slipperyroad.png',
  './images/drowning.png',
  'https://aframe.io/releases/1.4.2/aframe.min.js',
  'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap'
];

// Install Event: Cache all critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event: Serve from cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
