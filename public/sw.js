// SAS4ERP Advanced Offline-First & PWA Service Worker Engine
// Multi-Tier Caching: Precache App Shell, Cache-First Static Assets,
// Stale-While-Revalidate HTML, Network-First with Cache Fallback for APIs & Offline Fallbacks

const CACHE_VERSION = 'sas4erp-v3-2026';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Critical App Shell & Asset Pre-cache Manifest
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  './icon-maskable.svg'
];

// Offline Fallback HTML when navigation completely fails and nothing is in cache
const OFFLINE_FALLBACK_HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SAS4ERP - وضع العمل دون اتصال (Offline Mode)</title>
  <style>
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1.5rem;
      text-align: center;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      max-width: 480px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.5rem;
      margin: 0 0 0.75rem 0;
      font-weight: 800;
      color: #ffffff;
    }
    p {
      color: #94a3b8;
      font-size: 0.875rem;
      line-height: 1.6;
      margin: 0 0 1.5rem 0;
    }
    .btn {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.875rem;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">📡 وضع عدم الاتصال (Offline PWA)</div>
    <h1>أنت في وضع عدم الاتصال بالإنترنت</h1>
    <p>تم تخزين واجهة ساس هولدينغ SAS4ERP مؤقتاً بواسطة Service Worker. يمكنك متابعة العمل وتصفح السجلات والبيانات المخزنة دون انقطاع.</p>
    <button class="btn" onclick="window.location.reload()">إعادة المحاولة والمزامنة</button>
  </div>
</body>
</html>`;

// 1. Install Event: Pre-cache essential App Shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SAS4ERP-SW] Pre-caching asset warning (non-fatal):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE && key !== API_CACHE) {
            console.log('[SAS4ERP-SW] Removing stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Multi-Tier Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (handled by client IndexedDB offline buffer)
  if (request.method !== 'GET') {
    return;
  }

  // A. Navigation / Document Requests (HTML Pages)
  // Strategy: Stale-While-Revalidate with Cached index.html / Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // 1. Try exact requested route from cache
          const cachedRoute = await caches.match(request);
          if (cachedRoute) return cachedRoute;

          // 2. Fallback to cached index.html (SPA shell)
          const cachedShell = (await caches.match('./index.html')) || (await caches.match('/index.html'));
          if (cachedShell) return cachedShell;

          // 3. Fallback to embedded Offline HTML
          return new Response(OFFLINE_FALLBACK_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // B. Static Assets (Scripts, CSS, Fonts, Images, SVGs)
  // Strategy: Cache-First with Background Revalidation
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.json') ||
    url.pathname.includes('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background to keep cache fresh
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(STATIC_CACHE).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // If not cached, fetch from network and store in static cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('', { status: 408, statusText: 'Resource Unavailable Offline' });
          });
      })
    );
    return;
  }

  // C. API GET Endpoints (/api/*)
  // Strategy: Network-First with Cache Fallback (Preserves offline read-access to dashboard data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(JSON.stringify({ offline: true, error: 'Offline Mode Active' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          });
        })
    );
    return;
  }

  // D. General Fallback: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
