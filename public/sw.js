// SAS4ERP Offline Resilience & PWA Service Worker
const CACHE_NAME = 'sas4erp-offline-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Pre-caching non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle HTML document navigation: Stale-While-Revalidate with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          return new Response('SAS4ERP is currently offline. Cached interface is ready.', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, SVGs, Fonts, Images): Cache First with Network Fallback
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.includes('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(request)
            .then((networkRes) => {
              if (networkRes && networkRes.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkRes));
              }
            })
            .catch(() => {});
          return cached;
        }

        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            return new Response('', { status: 408, statusText: 'Offline' });
          });
      })
    );
    return;
  }

  // Default: Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response('Network error (offline)', { status: 503, statusText: 'Offline' });
      })
  );
});
