/// <reference lib="webworker" />

const CACHE_NAME = 'yuri-spa-v3';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  (event as ExtendableEvent).waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  (event as ExtendableEvent).waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  (self as unknown as ServiceWorkerGlobalScope).clients.claim();
});

// Fetch: Network-first for API/pages, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  const url = new URL(fetchEvent.request.url);

  // Skip non-GET requests
  if (fetchEvent.request.method !== 'GET') return;

  // Skip API routes and auth
  if (url.pathname.startsWith('/api/') || url.pathname.includes('next-auth')) return;

  // Cache-first for static assets (images, icons, fonts, css, js bundles)
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/uploads/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?|ttf|css|js)$/)
  ) {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then((cached) => {
        if (cached) return cached;
        return fetch(fetchEvent.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(fetchEvent.request, clone));
          }
          return response;
        }).catch(() => cached || new Response('Offline', { status: 503 }));
      })
    );
    return;
  }

  // Stale-while-revalidate for HTML pages
  if (fetchEvent.request.headers.get('accept')?.includes('text/html')) {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then((cached) => {
        const fetchPromise = fetch(fetchEvent.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(fetchEvent.request, clone));
          }
          return response;
        }).catch(() => {
          if (cached) return cached;
          return new Response('<html><body><h1>Offline</h1></body></html>', {
            headers: { 'Content-Type': 'text/html' },
            status: 503,
          });
        });
        // Return cached version immediately, update in background
        return cached || fetchPromise;
      })
    );
    return;
  }
});
