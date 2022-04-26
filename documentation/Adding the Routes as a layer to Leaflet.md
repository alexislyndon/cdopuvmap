### LeafletJS

#### Adding Routes fetched from the server to the Leaflet Map

```
const fetchroutes = function () {
    fetch('/routes')
        .then(res => { return res.json() })
        .then(data => {
            data = data.features
            for (let i = 0; i < data.length; ++i) {
                allRoutesArray.push(L.geoJSON(data[i], {
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            'click': function (e) {
                                popupRouteViewing(feature, e.target);
                                highlight(e.target); //e.target is layer
                            }
                        })
                    },
                    style: {
                        opacity: 0.65,
                        color: data[i].properties.color || colors[i % colors.length],
                        weight: 10
                    }
                }));
            }
            allRoutesArray.forEach(route => {
                route.addTo(map);
            });
        });
}();
```