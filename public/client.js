var osmDefault = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=VhesJPHeAqyxwLGSnrFq', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});
var gl = L.mapboxGL({
    attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
    style: 'https://api.maptiler.com/maps/streets/style.json?key=Qd14bES0AWln0kUQZN5O'
})//.addTo(map);

// map initialization
var map = L.map('map', {
    center: [8.477703150412395, 124.64379231398955], // target is rizal monument
    zoom: 14,
    minZoom: 10,
    maxBounds: [
        [8.786011072628465, 124.94613647460939],
        [8.142844225655255, 124.34532165527345]
    ],
    layers: [ //route layer can be added directly if needed 124.484024,8.355540,124.792328,8.587132
        gl
    ]
});

const originInput = document.getElementById("originInput");
const destinationInput = document.getElementById("destinationInput");
const spinner = document.getElementById("spinner");

function popupRouteViewing(feature, layer) {
    if (feature.properties) {
        layer.bindPopup('Name: ' + feature.properties.route_name);
    }
}

function popupItineraries(feature, layer) {
    if (feature.properties) {
        layer.bindPopup('Name: ' + feature.properties.route_name + '<br> Length: ' + Math.round((feature.properties.distance + Number.EPSILON) * 100) / 100 + 'km<br> Leg: ' + feature.properties.leg_type);
    }
}

function dehighlight(layer) {
    if (selected === null || selected._leaflet_id !== layer._leaflet_id) {
        layer.setStyle({ //return to default
            weight: 6
        });
    }
}

var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    }
});
var startendIcon = new LeafIcon({
    iconUrl: 'icons/start_end.svg'
})


var decorator = L.layerGroup().addTo(map)
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

    console.log(layer._layers[Object.keys(layer._layers)[0]].feature.properties.start_end);
    var ll = L.latLng(layer._layers[Object.keys(layer._layers)[0]].feature.properties.start_end.split(" ").reverse())

    var startend = L.marker(ll, { draggable: false, icon: startendIcon })

    if(decorator.getLayers().length > 0) {
        decorator.clearLayers()
    }
    var arrows = L.polylineDecorator(layer.latlngsfordecorator, {
        patterns: [
            {offset: 25, repeat: 80, symbol: L.Symbol.arrowHead({pixelSize: 17, pathOptions: {fillOpacity: 1, weight: 0, color:000}})}
        ]
    })
    decorator.addLayer(arrows)
    decorator.addLayer(startend)
}

function cleanString(str) {
    let newStr = '';
    newStr = str.replace(/\s/g, '_'); //replace whitespace with '_'
    newStr = newStr.replace(/\//g, '_');
    newStr = newStr.replace(/\(/g, '_');
    newStr = newStr.replace(/\)/g, '_');
    newStr = newStr.replace(/\./g, '_');
    newStr = newStr.toLocaleLowerCase();
    return newStr;
}
var selected = null;
var colors = ['#71ff34', '#ff3471', '#ff7b34', '#34aeff', '#ff4834']
var allRoutesArray = [];
const fetchroutes = function () {
    spinner.removeAttribute('hidden');
    fetch('/routes')
        .then(res => { return res.json() })
        .then(data => {
            spinner.setAttribute('hidden', '');
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
                let text = data[i].properties.shortname;
                // let splitted = text.split('Via');
                let elementID = data[i].properties.route_code // 'route_' + cleanString(text);
                // if (splitted.length == 200) { //check if 'route_name' have: 'Via westbound chuchu'
                //     $('#routesOutputList').append('<li><span class="routes_ItemClickZone" id="' + elementID + '"><div class="outputItem"  id="div_' + elementID + '"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong>Via' + splitted[1] + '</p></div></span></li>');
                // } else {
                $('#routesOutputList').append('<li><div id="div_' + elementID + '"><span class="routes_ItemClickZone" id="' + elementID + '"><div class="outputItem" ><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + text + '<br></strong></p></div></span><div hidden class="route-info"><table class="info-tbl"><tr><td class="bold">Route name: </td><td>' + data[i].properties.route_name + '</td></tr><tr><td class="bold">Length</td><td>' + data[i].properties.length.toFixed(2) + ' km</td></tr><tr><td class="bold">Signage</td><td>' + data[i].properties.signage + '</td></tr></table></div></div></li>');
                // }
            }
            allRoutesArray.forEach(route => {
                route.addTo(map);
            });
            hideAllRouteLayers();
            //need to add allRoutesLayers to map first before doing this loop
            for (let i = 0; i < data.length; i++) {
                allRoutesArray[i].layer_id = data[i].properties.route_code //'route_' + cleanString(data[i].properties.route_name); //adds new attribute 'layer_id'
                allRoutesArray[i].latlngsfordecorator = L.GeoJSON.coordsToLatLngs(data[i].geometry.coordinates);
                // console.log(L.GeoJSON.coordsToLatLngs(data[i].geometry.coordinates));

                if (data[i].properties.path != null) {
                    allRoutesArray[i].path = [];
                    data[i].properties.path.forEach(item => {
                        allRoutesArray[i].path.push(item.toLocaleLowerCase());
                    })
                }

            }
        });
}();



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

function clearItirenary() {
    if (allItirenariesArray.length > 0) {
        removeAllItirenaryItem();
        allItirenariesArray.forEach(itirenary => {
            itirenary.remove();
        });
    }
}
var allItirenariesArray = [];
var itirenaryNames = [];

function getItineraries(x, y) {
    if (!origin.options || !destination.options) { snack('error', 'Please set start and end markers.'); return; }
    
    var o = origin.getLatLng();
    var d = destination.getLatLng();
    map.flyToBounds(L.latLngBounds(o,d))
    if(o == d) {snack('error', 'Origin and Destination may not be the same'); return;}
    spinner.removeAttribute('hidden');
    hideAllRouteLayers();
    clearItirenary();
    if (o.lng < 124.579983 || o.lng > 124.784260 || o.lat < 8.396130 || o.lat > 8.524154 || d.lng < 124.579983 || d.lng > 124.784260 || d.lat < 8.396130 || d.lat > 8.524154) {
        spinner.setAttribute('hidden', '');
        snack('error', 'Origin/destination points must be within CDO');
        return
    }
    fetch(`/itineraries?origin=${encodeURIComponent(`${o.lng} ${o.lat}`)}&destination=${encodeURIComponent(`${d.lng} ${d.lat}`)}`)
        .then(res => { return res.json() })
        .then(data => {
            console.log(`origin: ${o.lng} ${o.lat} | destination: ${d.lng} ${d.lat}`);
            spinner.setAttribute('hidden', '');
            if(data == -1){
                snack('error', 'No routes found. Please try again.'); return;
            }
            for (let i = 0; i < data.length; ++i) { //loop for data[n]
                let routeName = '';
                let distance = []
                let estMinute = [];
                let estHour = [];
                let totalEstMinute = '';
                let fare = 0;
                allItirenariesArray[i] = L.featureGroup()  // 1 layer group = 2 walks, route's vertices/edges
                for (let j = 0; j < data[i].json.features.length; ++j) { //loop for data[n].json.features[n]
                    let currentLayer = L.geoJSON(data[i].json.features[j], {
                        onEachFeature: function (feature, layer) {
                            layer.on({
                                'click': function (e) {
                                    popupItineraries(feature, e.target);
                                    highlight(e.target);
                                }
                            })
                        },
                        style: stylistic(data[i].json.features[j].properties.leg_type, i)
                    });
                    currentLayer.addTo(allItirenariesArray[i]);
                    
                    if (data[i].json.features[j].properties.route_name != null) { // get only the route_name
                        routeName = data[i].json.features[j].properties.route_name;
                        if (data[i].json.features[j].properties.leg_type == 'walk1'){
                            distance[0] = data[i].json.features[j].properties.distance;
                            // time = distance/speed(kph) constant speed 5; given no traffic and stops
                            estHour[0] = data[i].json.features[j].properties.distance / 5;
                            estMinute[0] = estHour[0] * 60;
                            estMinute[0] = Math.round((estMinute[0] + Number.EPSILON) * 100) / 100;
                            distance[0] = Math.round((distance[0] + Number.EPSILON) * 100) / 100;
                        }
                        else if (data[i].json.features[j].properties.leg_type == 'route'){
                            distance[1] = data[i].json.features[j].properties.distance;
                            // time = distance/speed(kph) constant speed 30; given no traffic and stops
                            estHour[1] = data[i].json.features[j].properties.distance / 30;
                            estMinute[1] = estHour[1] * 60;
                            estMinute[1] = Math.round((estMinute[1] + Number.EPSILON) * 100) / 100;
                            distance[1] = Math.round((distance[1] + Number.EPSILON) * 100) / 100;

                            if (distance[1] < 4){
                                fare = 10;
                            }else if (distance[1] > 4){
                                fare = distance[1] - 4; //first 4 km costs minimum fare which is 10php
                            
                                // each succeeding km costs 1.5php
                                fare = fare / 1; 
                                fare = fare * 1.5;
                                fare = fare + 10; //add minimum fare later.
                                fare = Math.round((fare + Number.EPSILON) * 100) / 100;
                            }
                        }
                        else if (data[i].json.features[j].properties.leg_type == 'walk99'){
                            distance[2] = data[i].json.features[j].properties.distance;
                            // time = distance/speed(kph) constant speed 5; given no traffic and stops
                            estHour[2] = data[i].json.features[j].properties.distance / 5;
                            estMinute[2] = estHour[2] * 60;
                            estMinute[2] = Math.round((estMinute[2] + Number.EPSILON) * 100) / 100
                            distance[2] = Math.round((distance[2] + Number.EPSILON) * 100) / 100
                        }
                        console.log(data[i].json.features[j]);
                    }
                }
                itirenaryNames[i] = routeName;
                let splitted = routeName.split('Via');
                let elementID = 'itirenary_' + cleanString(routeName);
                if (splitted.length == 2) { //check if 'route_name' have: 'Via westbound chuchu'
                    $('#journeyOutputList').append('<li><span class="journey_ItemClickZone" id="' + elementID + '"><div class="outputItem" id="div_' + elementID + '"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong>Via' + splitted[1] + '</p></div></span></li>');
                } else {
                    totalEstMinute = estMinute[0] + estMinute[1] + estMinute [2];
                    totalEstMinute = Math.round((totalEstMinute + Number.EPSILON) * 100) / 100
                    $('#journeyOutputList').append('<li><span class="journey_ItemClickZone" id="' + elementID + '"><div class="outputItem" id="div_' + elementID + '"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong></p></div></span><table class="info-tbl"><tr><td class="bold">Walk (origin to jeepney): </td><td>' + distance[0] + ' km</td></tr><tr><td class="bold">Riding distance: </td><td>' + distance[1] + ' km</td></tr><tr><td class="bold">Walk (jeepney to destination): </td><td>' + distance[2] + ' km</td></tr><tr><td class="bold">Total est time (30kph)</td><td>' + totalEstMinute + ' mins</td></tr><tr><td class="bold">Fare: </td><td>' + fare + ' php</td></tr></table></li>');
                }

            }
            allItirenariesArray.forEach(itirenary => {
                itirenary.addTo(map);
            });
            for (let i = 0; i < allItirenariesArray.length; i++) { // assign layer_id with gathered route names
                allItirenariesArray[i].layer_id = 'itirenary_' + cleanString(itirenaryNames[i]);
            }
            $('#' + allItirenariesArray[0].layer_id).click();  // automatic focus 1 route
        })
}
// location tracker
var lc = L.control.locate().addTo(map); 
lc.start();

//this will update panel width if user changes screen size while panel is still open
$(window).resize(function () {
    if ($("#routesPanel").css("visibility") === "visible") {
        openPanel('#routesPanel');
    } else if ($("#journeyPanel").css("visibility") === "visible") {
        openPanel('#journeyPanel');
    } else { // if all are close, only move the button panel and resize the map
        if (window.matchMedia('(min-width: 992px)').matches) {
            // large devices (laptops/desktops)
            $('.buttonPanel').css({
                'left': '0%',
                'bottom': '50%'
            });
        } else if (window.matchMedia('(min-width: 768px)').matches) {
            // mediumDevices (landscape tablets)
            $('.buttonPanel').css({
                'left': '0%',
                'bottom': '50%'
            });
        } else if (window.matchMedia('(max-width: 767px)').matches) {
            // phones
            $('.buttonPanel').css({
                'left': '0%',
                'bottom': '0.1%'
            });
        }
        $('#map').css({
            'margin-bottom': '0%',
            'margin-left': '0%',
            'width': '100%',
            'height': '100%'
        });
    }
});

function openPanel(id) {
    if (id == '#journeyPanel') {
        $('#legend.leaflet-bottom.leaflet-right').css('visibility', 'visible')
    } else {
        $('#legend.leaflet-bottom.leaflet-right').css('visibility', 'hidden')
    }
    if (id == '#routesPanel') {

    } else if (id == '#journeyPanel') {
        hideAllRouteLayers();
    }
    if (window.matchMedia('(min-width: 992px)').matches) {
        // large devices (laptops/desktops)
        $(id).css({
            'width': '18.3%',
            'height': '100%',
            'visibility': 'visible'
        });
        $('#map').css({
            'margin-left': '18.3%',
            'width': '81.7%',
            'height': '100%',
            'margin-bottom': '0%'
        });
        $('.buttonPanel').css({
            'bottom': '50%',
            'left': '18.3%'
        });
        $(id).show();
    } else if (window.matchMedia('(min-width: 768px)').matches) {
        // mediumDevices (landscape tablets)
        $(id).css({
            'width': '50%',
            'height': '100%',
            'visibility': 'visible'
        });
        $('#map').css({
            'margin-left': '50%',
            'width': '50%',
            'height': '100%',
            'margin-bottom': '0%'
        });
        $('.buttonPanel').css({
            'bottom': '50%',
            'left': '50%'
        });
        $(id).show();
    } else if (window.matchMedia('(max-width: 767px)').matches) {
        // phones with width 767px bellow 
        $(id).css({
            'width': '100%',
            'height': '50%',
            'visibility': 'visible'
        });
        $('#map').css({
            'margin-bottom': '50%',
            'margin-left': '0%',
            'width': '100%',
            'height': '50%'
        });
        $('.buttonPanel').css({
            'bottom': '50%',
            'left': '0%'
        });
        $(id).show();
    }
    setTimeout(function () { map.invalidateSize() }, 400);
}
function closePanel(id) {
    if (id == '#journeyPanel') {
        $('#legend.leaflet-bottom.leaflet-right').css('visibility', 'hidden')
    }
    if (window.matchMedia('(min-width: 992px)').matches) {
        // large devices (laptops/desktops)
        $(id).css({
            'width': '0%',
            'visibility': 'hidden',
        });
        $('.buttonPanel').css({
            'left': '0%',
            'bottom': '50%'
        });
        $('#map').css({
            'margin-left': '0%',
            'width': '100%',
            'height': '100%'
        });
        $(id).hide();
    } else if (window.matchMedia('(min-width: 768px)').matches) {
        // mediumDevices (landscape tablets)
        $(id).css({
            'width': '0%',
            'visibility': 'hidden',
        });
        $('.buttonPanel').css({
            'left': '0%',
            'bottom': '50%'
        });
        $('#map').css({
            'margin-left': '0%',
            'width': '100%',
            'height': '100%'
        });
        $(id).hide();
    } else if (window.matchMedia('(max-width: 767px)').matches) {
        // phones with width 767px bellow 
        $(id).css({
            'height': '0%',
            'visibility': 'hidden',
        });
        $('.buttonPanel').css({
            'left': '0%',
            'bottom': '0.1%'
        });
        $('#map').css({
            'margin-bottom': '0%',
            'margin-left': '0%',
            'width': '100%',
            'height': '100%'
        });
        $(id).hide();
    }
    setTimeout(function () { map.invalidateSize() }, 400);
}
$('#journeyBtn, #routesBtn').click(function (e) { //sidebar button function
    switch (e.target.id) {
        case "journeyBtn":
            if ($('#journeyPanel').css("visibility") === "visible") { //check if open already
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
                    'background-color': '#2a1d63'
                });
            }
            decorator.clearLayers()
            break;
        case "routesBtn":
            if ($('#routesPanel').css("visibility") === "visible") { //check if open already
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
                    'background-color': '#2a1d63'
                });
            }
            break;
        default:
            break;
    }
});

$('.closeBtn').click(function (e) {
    switch (e.target.id) {
        case 'journeyCloseBtn':
            closePanel('#journeyPanel');
            $('#journeyBtn').css({
                'background-color': '#3F2B96'
            });
            break;
        case 'routesCloseBtn':
            closePanel('#routesPanel');
            $('#routesBtn').css({
                'background-color': '#3F2B96'
            });
            break;

        default:
            break;
    }
});

$('#refreshBtn').click(function () {
    sessionStorage.setItem("reloading", "true");
    document.location.reload();
});
window.onload = function () {
    var reloading = sessionStorage.getItem("reloading");
    if (reloading) {
        sessionStorage.removeItem("reloading");
        openPanel('#journeyPanel');
        $('#journeyBtn').css({
            'background-color': '#2a1d63'
        });
    } else {
        openPanel('#routesPanel');
        $('#routesBtn').css({
            'background-color': '#2a1d63'
        });
    }
}
function hideAllRouteLayers() {
    allRoutesArray.forEach(route => {
        route.remove();
    });
}
var selectSpecificRoute = false;
$('#hideAllBtn').click(function () {
    $('div.route-info').each(function () { $(this).hide() })
    hideAllRouteLayers();
    selectSpecificRoute = true;
});

function showAllRouteLayers() {
    allRoutesArray.forEach(route => {
        route.addTo(map);
    });
}
$('#showAllBtn').click(function () {
    showAllRouteItem();
    showAllRouteLayers();
    selectSpecificRoute = false;
});

$('#searchBtn').click(function () {
    let inputStr = $('#searchInput').val();
    inputStr = inputStr.toLocaleLowerCase();
    let elementID = '';
    allRoutesArray.forEach(route => {
        if (route.path != null) {
            if (route.path.includes(inputStr)) {
                console.log('hit');
                elementID = route.layer_id;
                $('#' + elementID).show();
                $('#div_' + elementID).show();

            } else {
                elementID = route.layer_id;
                $('#' + elementID).hide();
                $('#div_' + elementID).hide();
            }
        } else {
            elementID = route.layer_id;
            console.log(elementID);
            $('#' + elementID).hide();
            $('#div_' + elementID).hide();
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

$(document).on('click', '.routes_ItemClickZone', function (e) {
    let id = e.currentTarget.id;
    activeButton(e.currentTarget.id);
    $('div.route-info').each(function () { $(this).hide() })
    selectSpecificRoute = true;
    for (let i = 0; i < allRoutesArray.length; i++) {
        if (allRoutesArray[i].layer_id == id) {
            if (selectSpecificRoute) {
                allRoutesArray[i].addTo(map);
            }
            highlight(allRoutesArray[i]);
            activeButton(allRoutesArray[i].layer_id);
            $(this).siblings('.route-info').slideDown(200)
        } else {

            inActiveButton(allRoutesArray[i].layer_id);

            if (selectSpecificRoute) {
                allRoutesArray[i].remove();
            }
        }
    }
});
$(document).on('click', '.journey_ItemClickZone', function (e) {
    let id = e.currentTarget.id;
    for (let i = 0; i < allItirenariesArray.length; i++) {
        if (allItirenariesArray[i].layer_id == id) {
            highlight(allItirenariesArray[i]);
            activeButton(allItirenariesArray[i].layer_id);
            allItirenariesArray[i].addTo(map);
        } else {
            inActiveButton(allItirenariesArray[i].layer_id);
            allItirenariesArray[i].remove();
        }
    }
});
function activeButton(str) {
    let id = 'div_' + str;
    $('#' + id).css({
        'border': '3px solid #2a1d63',
    });
}
function inActiveButton(str) {
    let id = 'div_' + str;
    $('#' + id).css({
        'border': '2px solid rgba(0, 0, 0, .3)'
    });
}
function showAllItirenaryItem() {
    allItirenariesArray.forEach(itirenary => {
        $('#' + itirenary.layer_id).show();
    });
}
function hideAllItirenaryItem() {
    allItirenariesArray.forEach(itirenary => {
        $('#' + itirenary.layer_id).hide();
    });
}
function removeAllItirenaryItem() {
    allItirenariesArray.forEach(itirenary => {
        $('#' + itirenary.layer_id).remove();

    });
}
function showAllRouteItem() {
    allRoutesArray.forEach(route => {
        $('#' + route.layer_id).show();
        $('#div_' + route.layer_id).show();
    });
}
function hideAllRouteItem() {
    allRoutesArray.forEach(route => {
        $('#' + route.layer_id).hide();
        $('#div_' + route.layer_id).hide();
    });
}
$("#searchInput").keyup(function (event) {
    if (event.keyCode === 13) {
        $("#searchBtn").click();
    }
});
var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    }
});
var startIcon = new LeafIcon({
    iconUrl: 'icons/startIcon.svg'
})
var endIcon = new LeafIcon({
    iconUrl: 'icons/endIcon.svg'
})

var origin = {}
var destination = {}

var pinOrigin = function (e) {
    if (origin.options) {

        if (map.listens('drag')) {
            console.log('heree');
            let pin1 = origin.getLatLng()
            map.off('drag')
            reverseGeocode(pin1, originInput)
            $('#startPinner').css({
                'visibility': 'hidden'
            });
        } else {
            $('#startPinner').css({
                'visibility': 'visible'
            });
            map.on('drag', oDrag)
        }
        return
    }
    if (!origin.options) { //if marker was not added to map yet
        origin = L.marker(map.getCenter(), { draggable: true, icon: startIcon }).addTo(map);
        map.on('drag', oDrag);
        $('#startPinner').css({
            'visibility': 'visible'
        });

    }

    origin.on('dragstart', function(event) {
        $('#startPinner').css({
            'visibility': 'visible'
        });
        map.on('drag', oDrag)
    });
};

var pinDestination = function (e) {
    if (destination.options) {
        if (map.listens('drag')) {
            let pin2 = destination.getLatLng()
            map.off('drag')
            reverseGeocode(pin2, destinationInput)
            $('#endPinner').css({
                'visibility': 'hidden'
            });
        } else {
            $('#endPinner').css({
                'visibility': 'visible'
            });
            map.on('drag', dDrag)
        }
        return
    }
    if (!destination.options) {
        destination = L.marker(map.getCenter(), { draggable: true, icon: endIcon }).addTo(map);
        map.on('drag', dDrag);
        $('#endPinner').css({
            'visibility': 'visible'
        });
    }

    destination.on('dragstart', function(event) {
        $('#endPinner').css({
            'visibility': 'visible'
        });
        map.on('drag', dDrag)
    });
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

var ogeocoder = new maptiler.Geocoder({
    input: 'originInput',
    key: 'Qd14bES0AWln0kUQZN5O',
    bounds: [124.578094, 8.389507, 124.784431, 8.517873],
    proximity: [124.643264, 8.477837]
});
var dgeocoder = new maptiler.Geocoder({
    input: 'destinationInput',
    key: 'Qd14bES0AWln0kUQZN5O',
    bounds: [124.578094, 8.389507, 124.784431, 8.517873],
    proximity: [124.643264, 8.477837]
});

ogeocoder.on('select', function (item) {
    var center = map.getCenter()
    var [lng, lat] = item.center
    // origin = {}
    if(map.hasLayer(origin)){
        origin.remove();
    }
    origin = L.marker([lat, lng], { draggable: true, icon: startIcon }).addTo(map);
    // if(!map.hasLayer(origin)) {origin.addTo(map)}
    originInput.value = item.place_name
    map.panTo([lat, lng])
    origin.on('dragstart', function(event) {
        $('#startPinner').css({
            'visibility': 'visible'
        });
        map.on('drag', oDrag)
    });

});
dgeocoder.on('select', function (item) {
    var [lng, lat] = item.center
    // destination = {}
    if(map.hasLayer(destination)){
        destination.remove();
    }
    destination = L.marker([lat, lng], { draggable: true, icon: endIcon }).addTo(map);
    // if(!map.hasLayer(destination)) {destination.addTo(map)}
    destinationInput.value = item.place_name
    map.panTo([lat, lng])
    destination.on('dragstart', function(event) {
        $('#endPinner').css({
            'visibility': 'visible'
        });
        map.on('drag', dDrag)
    });

});

function reverseGeocode(latlng, inputE) {
    fetch(`https://api.maptiler.com/geocoding/${latlng.lng},${latlng.lat}.json?key=Qd14bES0AWln0kUQZN5O`)
        .then(res => { return res.json() })
        .then(data => {
            inputE.value = data.features[0].place_name
        })
}

const modal = document.querySelector(".modal");
const trigger = document.querySelector(".trigger");
const closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);

$('form.report-form').on('submit', function (e) {
    e.preventDefault();
    spinner.removeAttribute('hidden');
    $.ajax({
        url: '/reports',
        type: 'post',
        data: $(this).serialize(),
        success: function () {
            toggleModal();
            spinner.setAttribute('hidden', '');
            snack('success', 'Successfully submitted form.');
        }
    });
});

function snack(type, text) {

    // Get the snackbar DIV
    // x.style.color = 'white'; x.style.backgroundColor = 'green';
    var x = document.getElementById("snackbar");
    if (type === 'success') { x.style.color = '#010201'; x.style.backgroundColor = '#C4F8B6'; x.innerHTML = text }
    if (type === 'error') { x.style.color = '#010201'; x.style.backgroundColor = '#FFB7B7'; x.innerHTML = text }

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}