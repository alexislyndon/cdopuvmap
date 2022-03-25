function popup(feature, layer) {
    if (feature.properties) {
        layer.bindPopup('Name: ' + feature.properties.route_name + '<br> Code: ' + feature.properties.route_code);
    }
}

function dehighlight (layer) {
    if (selected === null || selected._leaflet_id !== layer._leaflet_id) {
        layer.setStyle({ //return to default
            weight: 6
        });
    }
  }
function highlight(layer){
    if (selected !== null){ //check if there is a layer already selected prior to this
        var previous = selected;
    }
    map.fitBounds(layer.getBounds()); //layer will center to viewport
    selected = layer;
    layer.setStyle({
        weight: 10,
        opacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    if (previous) { //dehighlight the previous selected layer
        dehighlight(previous);
    }
}
var selected = null;
var colors = ['#71ff34', '#ff3471', '#ff7b34', '#34aeff', '#ff4834']
var allRoutesArray = []
const fetchroutes = fetch('/routes')
    .then(res => { return res.json() })
    .then(data => {
        
        console.log(data);
        data = data.features
        for (let i = 0; i < data.length; ++i) {
            
            allRoutesArray.push(L.geoJSON(data[i], {
                onEachFeature: function(feature, layer){
                    layer.on({
                        'click': function (e){
                            highlight(e.target); //e.target is layer
                            popup(feature, e.target);
                        }
                    })
                },
                style: {
                    opacity: 0.65,
                    color: colors[i % colors.length],
                    weight: 6
                }
            }));
            let text = data[i].properties.route_name;
            let splitted = text.split('Via');
            if (splitted.length == 2) { //check if 'route_name' have: 'Via westbound chuchu'
                $('#routesOutputList').append('<li><div class="outputItem" id="'+text+'"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon"><p class="routeName"><strong>'+splitted[0]+'<br></strong>Via'+splitted[1]+'</p></div></li>');
            } else {
                $('#routesOutputList').append('<li><div class="outputItem" id="'+text+'"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon"><p class="routeName"><strong>'+splitted[0]+'<br></strong></p></div></li>');
            }
        }
        allRoutesArray.forEach(route => {
            route.addTo(map);
        });

        //need to add allRoutesLayers to map first before doing this loop
        for (let i = 0; i < data.length; i++) {
            allRoutesArray[i].layer_id = data[i].properties.route_name; //adds new attribute 'layer_id'
            console.log(allRoutesArray[i].layer_id);
        }
    })

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
                        color: '#3F826D',
                        weight: 15,
                        dashArray: '4 1 2',
                        dashOffset: '3'
                    }
                }).addTo(map)
            }
        })
}

var pathfind2 = (o, d) => fetch(`/pathfind?origin=${encodeURIComponent(o.value)}&destination=${encodeURIComponent(d.value)}`)
    .then(res => { return res.json() })
    .then(data => {
        data = data.features
        for (let index = 0; index < data.length; ++index) {
            L.geoJSON(data[index], {
                onEachFeature: popup,
                style: {
                    opacity: 0.65,
                    color: '#3F826D',
                    weight: 15,
                    dashArray: '4 1 2',
                    dashOffset: '3'
                }
            }).addTo(map)
        }
    })

// open street map layer (maptiler api)
var osmDefault = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=VhesJPHeAqyxwLGSnrFq', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
// map initialization
var map = L.map('map', {
    center: [8.477703150412395, 124.64379231398955], // target is rizal monument
    zoom: 18,
    layers: [ //route layer can be added directly if needed
        osmDefault
    ]
});

var baseMaps = {
    "Default": osmDefault,
    "Satellite": Esri_WorldImagery
}

L.control.layers(baseMaps).addTo(map);

var userMarker = L.marker([8.477703150412395, 124.64379231398955]);

/* you can define custom marker icon
var customMarker = L.icon({
    iconUrl: 'directory.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadwoUrl:'my-icon-shadow.png', //shadows are optional
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]

    //to add
    var customMarker = L.marker([8.477703150412395, 124.64379231398955],
        {
            icon: customMarker,
            draggable: true //useful for shortest walking path (offroad)?
        }).addTo(map)
});
*/

L.control.locate().addTo(map); //check top left corner for added button/control
/*
var routeLayers = L.layerGroup().addTo(map);
allroutes.features.forEach((feature) => {
    L.geoJSON(feature).addTo(routeLayers);
});
*/

function openPanel(id) {
    $(id).css({
        'width': '350px', 
        'visibility': 'visible'
    });
}
function closePanel(id) {
    $(id).css({
        'width': '0px', 
        'visibility': 'hidden',
    });
}
$('#journeyBtn, #routesBtn').click(function(e){ //sidebar button function
    switch (e.target.id) {
        case "journeyBtn":
                // console.log(buttonClicked('#'+e.target.id));
                if ($('#journeyPanel').width() > 0) { //check if open already
                    closePanel('#journeyPanel');
                } else {
                    //close other panels first
                    closePanel('#routesPanel');
                    $('#routesBtn').css({
                        'background-color': '#3F2B96'
                    });
                    //then open target panel
                    openPanel('#journeyPanel');
                    $('#journeyBtn').css({
                        'background-color': '#A8C0FF'
                    });
                }
                
            break;
        case "routesBtn":
                if ($('#routesPanel').width() > 0) { //check if open already
                    closePanel('#routesPanel');
                } else {
                    closePanel('#journeyPanel');
                    $('#journeyBtn').css({
                        'background-color': '#3F2B96'
                    });

                    openPanel('#routesPanel');
                    $('#routesBtn').css({
                        'background-color': '#A8C0FF'
                    });
                }
                    
            break;
        default:
            console.log('here');
            break;
    }
});

$('.closeBtn').click(function(e){
    
    switch (e.target.id) {
        case 'journeyCloseBtn':
            closePanel('#journeyPanel');
            break;
        case 'routesCloseBtn':
            closePanel('#routesPanel');
            break;
    
        default:
            break;
    }
});
$('#hideAllBtn').click(function(){
    allRoutesArray.forEach(route => {
        route.remove();
    });

});
$('#showAllBtn').click(function(){
    allRoutesArray.forEach(route => {
        route.addTo(map);
    });
});


// function toggleRoute() {
//     switch (window.event.target.id) {
//         case 'rd_gusa':
//             console.log('rd gusa');
//             if (overlays.RD_GUSA._mapToAdd == null) {
//                 overlays.RD_GUSA.addTo(map);
//             } else {
//                 overlays.RD_GUSA.remove();
//             }
//             break;
//         case 'patag_cogon':
//             console.log('patag cogon');
//             if (overlays.PATAG_COGON._mapToAdd == null) {
//                 overlays.PATAG_COGON.addTo(map);
//             } else {
//                 overlays.PATAG_COGON.remove();
//             }
//             break;
//         case 'bayabas_cogon':
//             console.log('bayabas cogon');
//             if (overlays.BAYABAS_COGON._mapToAdd == null) {
//                 overlays.BAYABAS_COGON.addTo(map);
//             } else {
//                 overlays.BAYABAS_COGON.remove();
//             }
//             break;
//         case 'bonbon_cogon':
//             console.log('bonbon cogon');
//             if (overlays.BONBON_COGON._mapToAdd == null) {
//                 overlays.BONBON_COGON.addTo(map);
//             } else {
//                 overlays.BONBON_COGON.remove();
//             }
//             break;
//         case 'balulang_cogon':
//             console.log('balulang cogon');
//             if (overlays.BALULANG_COGON._mapToAdd == null) {
//                 overlays.BALULANG_COGON.addTo(map);
//             } else {
//                 overlays.BALULANG_COGON.remove();
//             }
//             break;
//         case 'buena_oro_cogon':
//             console.log('buena oro cogon');
//             if (overlays.BUENA_ORO_COGON._mapToAdd == null) {
//                 overlays.BUENA_ORO_COGON.addTo(map);
//             } else {
//                 overlays.BUENA_ORO_COGON.remove();
//             }
//             break;
//         case 'camp_evg_cogon':
//             console.log('camp evg cogon');
//             if (overlays.CAMP_EVG_COGON._mapToAdd == null) {
//                 overlays.CAMP_EVG_COGON.addTo(map);
//             } else {
//                 overlays.CAMP_EVG_COGON.remove();
//             }
//             break;
//         default:
//             break;
//     }
// }

// map.on('click', function (e) {
//     function addMarker(e) {
//         // Add marker to map at click location; add popup window
//         var newMarker = new L.marker(e.latlng).addTo(map);
//         console.log(newMarker);
//     }
// });

// map.on('click', function(e) {
//     alert(e.latlng);
// } );

var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    }
});
var greenIcon = new LeafIcon({
    iconUrl: 'http://leafletjs.com/SlavaUkraini/examples/custom-icons/leaf-green.png',
    shadowUrl: 'http://leafletjs.com/SlavaUkraini/examples/custom-icons/leaf-shadow.png'
})

var origin = {}
var destination = {}

var pinOrigin = function (e) {
    if (e.id == 'd-pin') return
    if (origin.options) {
        if (map.listens('drag')) {
            var pin1 = origin.getLatLng()
            document.getElementById("origin").value = Object.values(pin1).reverse().toString()
            map.off('drag')
        } else { map.on('drag', oDrag) }
        return
    }
    if (!origin.options) {
        origin = L.marker(map.getCenter(), { draggable: true }).addTo(map);
        map.on('drag', oDrag);
    }
};

var pinDestination = function (e) {
    if (e.id == 'o-pin') return
    if (destination.options) {
        if (map.listens('drag')) {
            var pin1 = destination.getLatLng()
            document.getElementById("destination").value = Object.values(pin1).reverse().toString()
            map.off('drag')
        } else { map.on('drag', dDrag) }
        return
    }
    if (!destination.options) {
        destination = L.marker(map.getCenter(), { draggable: true, icon: greenIcon }).addTo(map);
        map.on('drag', dDrag);
    }
};
var oDrag = function (e) {
    if (!e) return
    var center = map.getCenter()
    origin.setLatLng(center)
}
var dDrag = function (e) {
    if (!e) return
    var center = map.getCenter()
    destination.setLatLng(center)
}

// test