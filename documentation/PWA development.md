# CH 4
## Development
### PWA <this should be the last topic under development>

A PWA enabled web application only needs four files to work. An HTML file, a logo, a manifest.json, and a service-worker javascript file.

The HTML file must reference the manifest.json file and register service worker via a script tag.  

Link tag in the <head> portion of the HTML file
```
<link rel="manifest" href="/manifest.json">
```

Script tag in the HTML to register the service worker
```
<script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
    }
</script>
```

Logos were created using a free npm package called `pwa-asset-generator`. Executing the packages will create the logos required to create qualify the app as an installable PWA. 

In order for the application to pass PWA requirements and become installable on a mobile device, the following needs to be satisfied.
| Requirement | Remarks |
| --- | --- |
| Served over HTTPS | Implemented |
| Registered a service worker | Implemented |
| manifest.json | Implemented |
| icons/logos must exist | Implemented |
| icons/logos must exist | Implemented |

execute pwa-asset-generator
```
npx pwa-asset-generator logo.png icons
```

manifest.json that describes the app 
```
{
    "name": "CDO PUV Route Map",
    "short_name": "CDO PUVMAP",
    "start_url": "/",
    "icons": [
        {
            "src": "icons/manifest-icon-192.maskable.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/manifest-icon-192.maskable.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
        },
        {
            "src": "icons/manifest-icon-512.maskable.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/manifest-icon-512.maskable.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
        }
    ],
    "theme_color": "#692F44",
    "background_color": "#000000",
    "display": "standalone",
    "orientation": "portrait"
}
```
The caching strategy used was a Workbox NetworkFirst approach which tries to load resources from the network first before falling-back to the locally saved cache. All 

service-worker.js caching
```
importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

workbox.routing.registerRoute(
    /\/.*/,
    new workbox.strategies.NetworkFirst({
        cacheName: 'all-cache'
    })
);

```

