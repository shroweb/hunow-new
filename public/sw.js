const CACHE = 'hunow-v1';

// Cache app shell on install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.json'])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

// Handle incoming push notifications
self.addEventListener('push', (e) => {
  if (!e.data) return;
  let payload;
  try { payload = e.data.json(); } catch { payload = { title: 'HU NOW', body: e.data.text() }; }
  e.waitUntil(
    self.registration.showNotification(payload.title ?? 'HU NOW', {
      body: payload.body,
      icon: payload.icon ?? '/Frame 4.png',
      badge: '/Frame 4.png',
      data: { url: payload.url ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? '/';
  e.waitUntil(clients.openWindow(url));
});

// Only cache true static assets (JS/CSS bundles, fonts, images).
// Everything else — HTML navigation, server functions, API calls — goes
// straight to the network so data is always fresh.
const STATIC_EXTENSIONS = /\.(js|css|woff2?|ttf|otf|ico|svg|png|jpg|jpeg|webp|gif)(\?.*)?$/i;

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Never intercept cross-origin requests
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';

  if (isNavigation) {
    // Network-first for HTML pages — always get fresh SSR content
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match('/'))),
    );
    return;
  }

  if (STATIC_EXTENSIONS.test(url.pathname)) {
    // Cache-first for immutable static assets (hashed filenames)
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Everything else (server functions, API routes, dynamic data) — network only
  // No interception; browser handles it directly.
});
