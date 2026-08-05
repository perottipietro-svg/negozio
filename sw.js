const CACHE_NAME = 'conto-vendita-v5';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './esempio-prodotti.xlsx'
];

// Contenuti che devono essere sempre aggiornati quando c'è rete: la pagina e il
// listino di esempio. La cache resta come rete di sicurezza per l'uso offline.
const FRESH = /(\.html|\/|esempio-prodotti\.xlsx)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Le chiamate a GitHub non vanno mai in cache
  if (url.hostname === 'api.github.com' || url.hostname === 'gist.githubusercontent.com') return;

  if (e.request.destination === 'document' || FRESH.test(url.pathname)) {
    // `cache: reload` scavalca anche la cache HTTP del browser, altrimenti il
    // max-age di GitHub Pages ritarda gli aggiornamenti di parecchi minuti
    e.respondWith(
      fetch(new Request(url.href, { cache: 'reload', credentials: 'omit' }))
        .then(r => {
          const copy = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
          return r;
        })
        .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
    );
  } else {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
  }
});
