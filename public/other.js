function pathfind(opoint, dpoint) {
    var opoint = document.getElementById("origin").value
    var dpoint = document.getElementById("destination").value
    fetch(`/pathfind?origin=${encodeURIComponent(opoint)}&destination=${encodeURIComponent(dpoint)}`)
        .then(res => { return res.json() })
        .then(data => {
            data = data.features
            for (let index = 0; index < data.length; ++index) {
                L.geoJSON(data[index], {
                    onEachFeature: popup,
                    style: {
                        opacity: 0.65,
                        color: '#F6179E',
                        weight: 15,
                        dashArray: '4 1 2',
                        dashOffset: '3'
                    }
                }).addTo(map)
            }
        })
}

var pathfind2 = (o, d) => {
    var o = origin.getLatLng();
    var d = destination.getLatLng();
    fetch(`/pathfind?origin=${encodeURIComponent(`${o.lng} ${o.lat}`)}&destination=${encodeURIComponent(`${d.lng} ${d.lat}`)}`)
        .then(res => { return res.json() })
        .then(data => {
            data = data.features
            for (let index = 0; index < data.length; ++index) {
                L.geoJSON(data[index], {
                    onEachFeature: popup,
                    style: stylistic(data[index].properties.leg_type, index)
                }).addTo(map)
            }
        })
}

var pathfind3 = () => {
    hideAllRouteItem();
    hideAllRouteLayers();
    fetch(`/withpoints`)
        .then(res => { return res.json() })
        .then(data => {
            data = data.features
            for (let index = 0; index < data.length; ++index) {
                console.log(data[index].properties.route_name);
                L.geoJSON(data[index], {
                    onEachFeature: popup,
                    style: {
                        opacity: 0.65,
                        color: '#F6179E',
                        weight: 15,
                        dashArray: '4 1 2',
                        dashOffset: '3'
                    }
                }).addTo(map)
            }
        })
}

var userMarker = L.marker([8.477703150412395, 124.64379231398955]);