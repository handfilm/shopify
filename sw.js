/* NEXUS service worker — app-shell offline launch.
 * This MUST be a separate same-origin file: browsers scope a SW to the
 * path it is served from, so an inline/blob SW would control nothing.
 * Drop it next to index.html. */
const CACHE = "nexus-v1";
const SHELL = ["./", "./index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // Never cache the backend — spine calls must always hit the network.
  if (req.method !== "GET" || /script\.google\.com|\/exec/.test(req.url)) {
    e.respondWith(fetch(req).catch(() =>
      new Response(JSON.stringify({ error: "offline" }), { headers: { "Content-Type": "application/json" } })));
    return;
  }
  // Shell: cache-first, fall back to network, then to the cached index.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
