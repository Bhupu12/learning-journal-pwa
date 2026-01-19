const CACHE_NAME = "journal-cache-v2"; // ✅ bump version so changes apply

const APP_SHELL = [
  "/",                           // main page
  "/todo",                       // ✅ NEW page
  "/static/style.css",
  "/static/js/form4JS.js",
  "/static/js/todo.js",          // ✅ NEW script
  "/static/manifest.json",
  "/static/images/icon-192.png",
  "/static/images/icon-512.png"
];

// Install: pre-cache app shell (safe install even if one file missing)
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    await Promise.all(
      APP_SHELL.map(async (url) => {
        try {
          await cache.add(url);
        } catch (e) {
          // ignore missing files so SW still installs
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

  // ✅ Cache API responses (GET reflections + tasks) with network-first
  if (
    (url.pathname.startsWith("https://bhupendrathapa.pythonanywhere.com/api/reflections") || url.pathname.startsWith("/api/tasks")) &&
    req.method === "GET"
  ) {
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
