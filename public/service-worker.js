importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

workbox.routing.registerRoute(
    /^https:\/\/api.maptiler.com\/maps.*/,
    new workbox.strategies.CacheFirst({
        cacheName: 'tile-cache',
        plugins: [
            new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [0, 200]
            })
        ]
    }),
);