const CACHE_NAME = "journal-cache-v10";

const urlsToCache = [
    "/",                                
    "/static/style.css",
    "/static/form4JS.js",
    "/static/manifest.json",
    "/static/images/icon.png",
    "/static/offline.html"              
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request)
                    .then((cached) => cached || caches.match("/static/offline.html"));
            })
    );
});
