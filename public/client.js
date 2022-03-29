function popup(feature, layer) {
    if (feature.properties) {
        layer.bindPopup('Name: ' + feature.properties.route_name + '<br> Code: ' + feature.properties.route_code + '<br> leg: ' + feature.properties.leg_type);
    }
}

function dehighlight(layer) {
    if (selected === null || selected._leaflet_id !== layer._leaflet_id) {
        layer.setStyle({ //return to default
            weight: 6
        });
    }
}
function highlight(layer) {
    if (selected !== null) { //check if there is a layer already selected prior to this
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
function cleanString(str){
    let newStr = '';
    newStr = str.replace(/\s/g, '_'); //replace whitespace with '_'
    newStr = newStr.replace(/\//g,'_');
    newStr = newStr.replace(/\(/g,'_');
    newStr = newStr.replace(/\)/g,'_');
    newStr = newStr.replace(/\./g,'_');
    newStr = newStr.toLocaleLowerCase();
    return newStr;
}
var selected = null;
var colors = ['#71ff34', '#ff3471', '#ff7b34', '#34aeff', '#ff4834']
var allRoutesArray = []
const fetchroutes = fetch('/routes')
    .then(res => { return res.json() })
    .then(data => {
        data = data.features
        for (let i = 0; i < data.length; ++i) {

            allRoutesArray.push(L.geoJSON(data[i], {
                onEachFeature: function (feature, layer) {
                    layer.on({
                        'click': function (e) {
                            popup(feature, e.target);
                            highlight(e.target); //e.target is layer
                        }
                    })
                },
                style: {
                    opacity: 0.65,
                    color: colors[i % colors.length],
                    weight: 10
                }
            }));
            let text = data[i].properties.route_name;
            let splitted = text.split('Via');
            let elementID = cleanString(text);
            // console.log(elementID);
            if (splitted.length == 2) { //check if 'route_name' have: 'Via westbound chuchu'
                $('#routesOutputList').append('<li><span class="itemClickZone" id="' + elementID + '"><div class="outputItem"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong>Via' + splitted[1] + '</p></div></span></li>');
            } else {
                $('#routesOutputList').append('<li><span class="itemClickZone" id="' + elementID + '"><div class="outputItem" ><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong></p></div></span></li>');
            }
        }
        allRoutesArray.forEach(route => {
            route.addTo(map);
        });

        //need to add allRoutesLayers to map first before doing this loop
        for (let i = 0; i < data.length; i++) {
            allRoutesArray[i].layer_id = cleanString(data[i].properties.route_name); //adds new attribute 'layer_id'
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
                        color: '#F6179E',
                        weight: 15,
                        dashArray: '4 1 2',
                        dashOffset: '3'
                    }
                }).addTo(map)
            }
        })
}

var stylistic = (leg_type, index) => {
    if (leg_type == 'route') return {
        opacity: 0.65,
        color: colors[index % colors.length],
        weight: 15,
    }
    if (leg_type && leg_type.startsWith('walk')) return {
        opacity: 0.65,
        color: '#FFBE54',
        weight: 10,
        dashArray: "12 3 9"
    }
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

L.control.locate().addTo(map); //check top left corner for added button/control

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
$('#journeyBtn, #routesBtn').click(function (e) { //sidebar button function
    switch (e.target.id) {
        case "journeyBtn":
            // console.log(buttonClicked('#'+e.target.id));
            if ($('#journeyPanel').width() > 0) { //check if open already
                closePanel('#journeyPanel');
                $('#journeyBtn').css({
                    'background-color': '#3F2B96'
                });
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
                $('#routesBtn').css({
                    'background-color': '#3F2B96'
                });
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

$('.closeBtn').click(function (e) {

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
$('#hideAllBtn').click(function () {
    hideAllItem();
    allRoutesArray.forEach(route => {
        route.remove();
    });
});
$('#showAllBtn').click(function () {
    showAllItem();
    allRoutesArray.forEach(route => {
        route.setStyle({ //para ma refresh
            weight: 6
        });
        route.addTo(map);
    });
});

$('#searchBtn').click(function () {
    let inputStr = $('#searchInput').val();
    inputStr = inputStr.toLocaleLowerCase();
    let elementID = '';
    allRoutesArray.forEach(route => {
        if(route.layer_id.search(inputStr) == -1){
            elementID = cleanString(route.layer_id);
            $('#'+elementID).hide();
        }else{
            elementID = cleanString(route.layer_id);
            $('#'+elementID).show();
        }
    });
});
function removeRoute(input) {
    let id = input;
    for (let i = 0; i < allRoutesArray.length; i++) {
        if (allRoutesArray[i].layer_id == id) {
            allRoutesArray[i].remove();
        }
    }
}
$(document).on('click', '.itemClickZone', function (e) {
    let id = e.currentTarget.id;
    console.log(e.currentTarget.id);
    for (let i = 0; i < allRoutesArray.length; i++) {
        if (allRoutesArray[i].layer_id == id) {
            highlight(allRoutesArray[i]);
        }
    }
});
function showAllItem(){
    allRoutesArray.forEach(route => {
        $('#'+route.layer_id).show();
    });
}
function hideAllItem(){
    allRoutesArray.forEach(route => {
        $('#'+route.layer_id).hide();
    });
}
$("#searchInput").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#searchBtn").click();
    }
});
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

/*
map.on('click', addMarker);
});

function addMarker(e){
    // Add marker to map at click location; add popup window
    var newMarker = new L.marker(e.latlng).addTo(map);
}*/