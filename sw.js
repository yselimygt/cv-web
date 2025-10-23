const CACHE = 'ysy-portfolio-v2';
const ASSETS = [
  '/', '/index.html',
  '/css/main.css','/css/career.css',
  '/js/main.js','/js/career.js',
  '/career.json','/manifest.webmanifest',
  '/assets/profile.webp','/assets/proj-viperadeck.webp','/assets/proj-zephyr.webp',
  '/assets/ysy_logo.png','/assets/og-share.jpg',
  '/assets/icons/icon-32.png','/assets/icons/icon-192.png','/assets/icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.origin === location.origin){
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(res=>{
          const copy = res.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return res;
        }).catch(()=>caches.match('/index.html'))
      )
    );
  }
});
