# CH4

## Coding

### Maptiler Cloud API

The MapTiler Cloud Services provides access to Geocoding and Tiles among others. Tiles are individual squares of images that are stiched seamlessly to form a map. Different zoom levels require different tiles fetched from the servers. Tiles are available in both Vector and Raster formats. Their Geocoding service converts Place names to coordinates on a map. The reverse of this is also possible - Reverse Geocoding provides an approximate place name when given a set of coordinates.

#### Maptiler Tiles

The MapTiler Tiles are invoked directly by the LeafletJS Library - meaning that we don't have to explicitly call their APIs to request for map tiles or related data. 

The code below initializes a map. The leaflet library handles the fetching of the map tiles as well as the appending of leaflet map object to an element in the HTML. 

```
var gl = L.mapboxGL({
    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
    style: 'https://api.maptiler.com/maps/streets/style.json?key=Qd14bES0AWln0kUQZN5O'
})//.addTo(map);

// map initialization
var map = L.map('map', {
    center: [8.477703150412395, 124.64379231398955], // target is rizal monument

    zoom: 14,
    minZoom: 14,
    maxBounds: [
        [8.786011072628465, 124.94613647460939],
        [8.142844225655255, 124.34532165527345]
    ],
    layers: [ //route layer can be added directly if needed
        gl
    ]
});
```


We used Vector tiles, rather than Raster tiles because there's a about 20% size reduction to the initial Tiles load.

[screenshot raster vs vector size]
#### Maptiler Geocoding

The Geocoding API returns an array of Places when given a search term. The array of Places contain coordinates and in the front-end, the array is shown as a dropdown list. When an item on that list is selected, an eventListener fires and provides us access to the item - including the coordinates. 

```
<html>
  <head>
    <script src="https://cdn.maptiler.com/maptiler-geocoder/v1.1.0/maptiler-geocoder.js"></script>
    <link href="https://cdn.maptiler.com/maptiler-geocoder/v1.1.0/maptiler-geocoder.css" rel="stylesheet" />
  </head>
  <body>
    <input autocomplete="off" id="search" type="text" />
    <script>
      var geocoder = new maptiler.Geocoder({
        input: 'search',
        key: 'Qd14bES0AWln0kUQZN5O'
      });
      geocoder.on('select', function(item) {
        console.log('Selected', item);
      });
    </script>
  </body>
</html>
```

#### Maptiler Reverse Geocoding

The reverse is also possible, when a user places a marker on the map, the Reverse Geocoding API is called to fech the approximate place associated with a set of coordinates. The place name resolved from the input coordinates will then be filled into the appropriate textbox. 

```
function reverseGeocode(latlng, inputE) {
    fetch(`https://api.maptiler.com/geocoding/${latlng.lng},${latlng.lat}.json?key=Qd14bES0AWln0kUQZN5O`)
        .then(res => { return res.json() })
        .then(data => {
            inputE.value = data.features[0].place_name
        })
}
```