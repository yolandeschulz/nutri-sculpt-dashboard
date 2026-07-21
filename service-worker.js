const CACHE_NAME = "nutri-sculpt-dashboard-v32";
const APP_SHELL = [
  "./",
  "./index.html",
  "./index.html?v=20260721-32",
  "./style.css?v=20260721-32",
  "./app.js?v=20260721-32",
  "./sync-config.js?v=20260721-32",
  "./sync.js?v=20260721-32",
  "./data.js?v=20260721-32",
  "./manifest.json?v=20260721-32",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-192-maskable.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-512-maskable.png",
  "./assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() =>
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return caches.match("./index.html");
      })
    )
  );
});
