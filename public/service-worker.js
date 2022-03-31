importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

// workbox.routing.registerRoute(
//     ({ request }) => request.destination === 'image',
//     new workbox.strategies.CacheFirst()
// );

// workbox.routing.registerRoute(
//     // Cache image files.
//     /\.(?:png\?key=.+)$/,
//     // Use the cache if it's available.
//     new workbox.strategies.CacheFirst({
//         // Use a custom cache name.
//         cacheName: 'image-cache',
//         plugins: [
//             new workbox.expiration.ExpirationPlugin({
//                 // Cache only 20 images.
//                 maxEntries: 1500,
//                 // Cache for a maximum of a week.
//                 maxAgeSeconds: 7 * 24 * 60 * 60,
//             })
//         ],
//     })
// );

workbox.routing.registerRoute(
    /^https:\/\/api.maptiler.com\/.*/,
    workbox.strategies.cacheFirst({
        cacheName: 'tile-cache',
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ]
    }),
);