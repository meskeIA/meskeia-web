// Service Worker para meskeIA PWA
// Versión: 2.0.0 (13/10/2026)
//
// Qué guarda, y por qué tan poco (cabo C0237). Hasta la 1.2.0 guardaba en caché CADA GET que no
// fuera /api/ (chunks, imágenes, páginas, y también lo de otros orígenes) sin límite ni
// caducidad. Se notaba poco porque el registro fallaba en buena parte de las cargas; al
// repararlo, el almacenamiento de cada visitante habría crecido con cada app visitada.
// Ahora solo intercepta, del propio origen:
//   · navegaciones (el HTML de cada página): red primero, copia para recargar sin conexión;
//   · /_next/static/ (los chunks, con hash y por tanto inmutables): los que esa página necesita
//     para funcionar sin conexión.
// Todo lo demás (imágenes, /api/, otros orígenes, peticiones RSC, rangos de audio y vídeo) va
// directo a la red, sin pasar por aquí. Cada caché tiene tope de entradas y se recorta por la
// más antigua: un despliegue nuevo cambia los hashes y los chunks viejos salen solos.
// Testigo: tests/service-worker.spec.ts.

const VERSION = 'v4';
const CACHE_ESTATICOS = `meskeia-static-${VERSION}`;
const CACHE_PAGINAS = `meskeia-paginas-${VERSION}`;
const CACHE_CHUNKS = `meskeia-chunks-${VERSION}`;
const CACHES_VIGENTES = [CACHE_ESTATICOS, CACHE_PAGINAS, CACHE_CHUNKS];

const MAX_PAGINAS = 40;
const MAX_CHUNKS = 300;

// Archivos que se guardan al instalar
const STATIC_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon_meskeia.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_ESTATICOS)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

// Al activarse borra toda caché que no sea de esta versión (incluida la meskeia-pwa-v3 sin límite)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(
        nombres
          .filter((nombre) => !CACHES_VIGENTES.includes(nombre))
          .map((nombre) => caches.delete(nombre))
      ))
      .then(() => self.clients.claim())
  );
});

/** Deja la caché en `maximo` entradas, retirando las más antiguas (keys() va en orden de alta) */
async function recortar(nombreCache, maximo) {
  const cache = await caches.open(nombreCache);
  const claves = await cache.keys();
  const sobran = claves.length - maximo;
  for (let i = 0; i < sobran; i++) {
    await cache.delete(claves[i]);
  }
}

/** Red primero; si responde 200, se guarda la copia (y se recorta). Sin red, la copia guardada. */
async function redPrimero(request, nombreCache, maximo, clave) {
  try {
    const respuesta = await fetch(request);
    if (respuesta && respuesta.status === 200 && respuesta.type === 'basic') {
      const copia = respuesta.clone();
      const cache = await caches.open(nombreCache);
      // Se borra antes de guardar para que la entrada pase al final y el recorte quite las viejas
      await cache.delete(clave);
      await cache.put(clave, copia);
      await recortar(nombreCache, maximo);
    }
    return respuesta;
  } catch (error) {
    const guardada = await caches.match(clave);
    if (guardada) return guardada;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (request.headers.has('range')) return;

  // Navegaciones: la página entera. La clave va sin query para no guardar una copia por cada
  // ?from=… o ?utm=… de la misma página.
  if (request.mode === 'navigate') {
    const clave = url.origin + url.pathname;
    event.respondWith(
      redPrimero(request, CACHE_PAGINAS, MAX_PAGINAS, clave)
        .catch(() => caches.match('/offline.html'))
        .then((r) => r || Response.error())
    );
    return;
  }

  // Chunks y estáticos de Next: con hash, así que la URL completa es la clave
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      redPrimero(request, CACHE_CHUNKS, MAX_CHUNKS, request.url)
        .catch(() => Response.error())
    );
  }
  // Todo lo demás: sin respondWith, el navegador lo pide a la red como si no hubiera SW
});
