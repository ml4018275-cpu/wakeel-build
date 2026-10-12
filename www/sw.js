const CACHE = 'wakeel-v4';
const SHARE = 'wakeel-share';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== SHARE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// App files: network first (so updates arrive), cache fallback (offline).
// Gemini API and other cross-origin calls are never touched.

// Web Share Target: keep what was shared, then open the app (it shows a card to choose what to do)
async function handleShare(req) {
  try {
    const fd = await req.formData();
    const c = await caches.open(SHARE);
    const meta = { title: fd.get('title') || '', text: fd.get('text') || '', url: fd.get('url') || '', at: Date.now() };
    await c.put('/__share/meta', new Response(JSON.stringify(meta)));
    const f = fd.get('media');
    if (f && f.size) await c.put('/__share/file', new Response(f, { headers: { 'Content-Type': f.type || 'image/jpeg' } }));
    else await c.delete('/__share/file');
  } catch (e) {}
  return Response.redirect(new URL('./index.html?shared=1', self.registration.scope).href, 303);
}

const LIB_HOST = 'cdnjs.cloudflare.com';
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method === 'POST' && url.origin === location.origin && url.pathname.endsWith('/share-target')) { e.respondWith(handleShare(req)); return; }
  if (req.method !== 'GET') return;
  // Pinned PDF/Excel libraries: cache-first so they work offline after first use
  if (url.host === LIB_HOST && url.pathname.startsWith('/ajax/libs/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
