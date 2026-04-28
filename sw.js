const CACHE_NAME = "juego-cache-v3";

const archivos = [
    "/",
    "/index.html",
    "/script.js",
    "/manifest.json",
    "/sonidos/ganar.mp3",
    "/sonidos/perder.mp3",
    "/sonidos/error.mp3",
];

self.addEventListener("install", event => {
   event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(archivos))
   );
   self.skipWaiting();
});

self.addEventListener("activate", event => {
    const cacheActual = CACHE_NAME;

    event.waitUntil(
        caches.keys().then(keys => {
          return Promise.all(
           keys.map(keys  => {
            if (key !== cacheActual) {
                return caches.delete(key);
             }
           })  
          );  
        })
    );

    self.clients.claim();

});

self.addEventListener("fetch", event => {
    const url = event.request.url;

   if (url.includes(self.location.origin)) {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
    return;
   } 
   
   if (url.startsWith("https://"))  {
    event.respondWith(
        fetch(event.request)
         .then(response => {
          return caches.open("externos").then(cache => {
            cache.put(event.request, response.clone());
            return response;
        });
      })
       .catch(() => {
       return caches.match(event.request) || new Response("offline");
    })
  ); 
  return;
  } 
});
