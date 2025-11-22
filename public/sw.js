// Service Worker para meskeIA PWA
// Versión: 1.0.0

const CACHE_NAME = 'meskeia-pwa-v1';
const STATIC_CACHE = 'meskeia-static-v1';

// Archivos estáticos para cachear
const STATIC_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon_meskeia.png',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de fetch: Network First, luego Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo cachear requests GET
  if (request.method !== 'GET') {
    return;
  }

  // No cachear requests a APIs externas
  if (request.url.includes('/api/') ||
      request.url.includes('meskeia.com/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde caché
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Si es una navegación (HTML), mostrar página offline
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }

          // Para otros recursos, intentar la página principal
          return caches.match('/');
        });
      })
  );
});

// Sincronización en background (para futuras mejoras)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);

  if (event.tag === 'sync-analytics') {
    event.waitUntil(
      // Aquí se pueden sincronizar analytics pendientes
      Promise.resolve()
    );
  }
});

// Notificaciones push (para futuras mejoras)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [200, 100, 200],
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
