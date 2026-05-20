// Service worker do DealNote AI — habilita instalação (PWA) e uso offline básico.
const CACHE = "dealnote-cache-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Ignora outras origens e as chamadas de API.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  // Network-first: sempre tenta a rede; cai pro cache só quando offline.
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response && response.status === 200) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const fallback = await caches.match("/index.html");
          if (fallback) return fallback;
        }
        throw new Error("Sem conexão e sem conteúdo em cache.");
      }
    })()
  );
});
