const CACHE_NAME = 'loffeeflow-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Identify CDN assets (scripts, styles, fonts)
  const isCdn = url.hostname === 'esm.sh' || 
                url.hostname === 'cdn.tailwindcss.com' ||
                url.hostname === 'fonts.googleapis.com' ||
                url.hostname === 'fonts.gstatic.com' || 
                (url.hostname === 'www.gstatic.com' && url.pathname.includes('firebasejs'));

  // Strategy: Stale-While-Revalidate for App Shell, Cache First for CDNs
  if (isCdn || ASSETS_TO_CACHE.includes(url.pathname)) {
     event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
           // Return cache if available, but always fetch new version in background (except strict CDN versions)
           const fetchPromise = fetch(event.request).then(networkResponse => {
               if(networkResponse.ok) {
                   const resClone = networkResponse.clone();
                   caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
               }
               return networkResponse;
           });
           
           return cachedResponse || fetchPromise;
        })
     );
  }
});