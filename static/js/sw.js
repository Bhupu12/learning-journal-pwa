const CACHE_NAME = "journal-cache-v1";

const APP_SHELL = [
  "/",                           // main page
  "/static/style.css",           // your CSS
  "/static/js/form4JS.js",       // your JS
  "/static/manifest.json",       // manifest
  "/static/images/icon-192.png",
  "/static/images/icon-512.png"
];

// Install: pre-cache app shell (safe install even if one file missing)
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Cache files one-by-one so one missing file doesn't break install
    await Promise.all(
      APP_SHELL.map(async (url) => {
        try {
          await cache.add(url);
        } catch (e) {
          // ignore missing files so SW still installs
          // (useful if icons aren't uploaded yet)
        }
      })
    );
  })());

  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Cache API responses (GET reflections) with network-first
  if (url.pathname.startsWith("/api/reflections") && req.method === "GET") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Pages: network-first
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Static assets: cache-first
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}
