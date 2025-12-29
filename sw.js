self.options = {
    "domain": "3nbf4.com",
    "zoneId": 10388568
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')

const CACHE_NAME = 'moonflix-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalação: Cache dos arquivos estáticos essenciais (App Shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Ativação: Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Estratégia Stale-While-Revalidate para requests gerais e Cache First para imagens
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Estratégia para Imagens (TMDB/Unsplash): Cache First, fallback Network
  if (requestUrl.hostname.includes('tmdb.org') || requestUrl.hostname.includes('unsplash.com')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          // Opcional: Cachear novas imagens dinamicamente (cuidado com limite de armazenamento)
          // const responseClone = networkResponse.clone();
          // caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        });
      })
    );
    return;
  }

  // Estratégia Padrão: Network First com Fallback para Cache (Melhor para dados dinâmicos de filmes)
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});