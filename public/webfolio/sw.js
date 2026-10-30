/* WebFolio offline: pages and their files are kept after they are read (or when “Keep all text offline” is used); lectures saved for listening live in their own store. */
const PAGES = "wf-pages-v1", FILES = "wf-files-v1", AUDIO = "wf-audio-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Saved lectures play from the device.
  if (req.destination === "audio" || /\.(mp3|m4a|ogg)(\?|$)/i.test(url.pathname)) { e.respondWith(caches.open(AUDIO).then((c) => c.match(req.url, { ignoreSearch: false }).then((hit) => hit || fetch(req)))); return; }
  if (url.origin !== location.origin) return;
  // Built files never change: device first.
  if (url.pathname.startsWith("/_next/static/") || /\.(woff2?|png|webp|svg|css|js)$/.test(url.pathname)) { e.respondWith(caches.open(FILES).then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; })))); return; }
  // WebFolio pages: the newest from the internet, the kept copy when offline.
  if (url.pathname.startsWith("/webfolio") || url.pathname.startsWith("/api/webfolio")) {
    e.respondWith(fetch(req).then((r) => { if (r.ok && !url.pathname.startsWith("/api/webfolio/search")) caches.open(PAGES).then((c) => c.put(req, r.clone())); return r; })
      .catch(() => caches.open(PAGES).then((c) => c.match(req, { ignoreVary: true }).then((hit) => hit || c.match(url.pathname, { ignoreSearch: true, ignoreVary: true }) || c.match("/webfolio")))));
  }
});
