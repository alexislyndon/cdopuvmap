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
    minZoom: 14,
    maxBounds: [
        [8.786011072628465, 124.94613647460939],
        [8.142844225655255, 124.34532165527345]
    ],
    layers: [ //route layer can be added directly if needed
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
                // console.log(elementID);
                // if (splitted.length == 200) { //check if 'route_name' have: 'Via westbound chuchu'
                //     $('#routesOutputList').append('<li><span class="routes_ItemClickZone" id="' + elementID + '"><div class="outputItem"  id="div_' + elementID + '"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong>Via' + splitted[1] + '</p></div></span></li>');
                // } else {
                $('#routesOutputList').append('<li><div id="div_' + elementID + '"><span class="routes_ItemClickZone" id="' + elementID + '"><div class="outputItem" ><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + text + '<br></strong></p></div></span><div hidden class="route-info"><table class="info-tbl"><tr><td class="bold">Route name: </td><td>' + data[i].properties.route_name + '</td></tr><tr><td class="bold">Length</td><td>' + data[i].properties.length.toFixed(2) + ' km</td></tr><tr><td class="bold">Signage</td><td>' + data[i].properties.signage + '</td></tr></table></div></div></li>');
                // }
            }
            allRoutesArray.forEach(route => {
                route.addTo(map);
            });

            //need to add allRoutesLayers to map first before doing this loop
            for (let i = 0; i < data.length; i++) {
                allRoutesArray[i].layer_id = data[i].properties.route_code //'route_' + cleanString(data[i].properties.route_name); //adds new attribute 'layer_id'
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

function getItineraries(o, d) {
    spinner.removeAttribute('hidden');
    hideAllRouteItem();
    hideAllRouteLayers();
    console.log('check length' + allItirenariesArray.length);
    clearItirenary();
    var o = origin.getLatLng();
    var d = destination.getLatLng();
    if (o.lng < 124.579983 || o.lng > 124.784260 || o.lat < 8.396130 || o.lat > 8.524154 || d.lng < 124.579983 || d.lng > 124.784260 || d.lat < 8.396130 || d.lat > 8.524154) {
        spinner.setAttribute('hidden', '');
        snack('error','Origin/destination points must be within CDO');
        return
    }
    fetch(`/itineraries?origin=${encodeURIComponent(`${o.lng} ${o.lat}`)}&destination=${encodeURIComponent(`${d.lng} ${d.lat}`)}`)
        .then(res => { return res.json() })
        .then(data => {
            spinner.setAttribute('hidden', '');
            for (let i = 0; i < data.length; ++i) { //loop for data[n]
                let text = '';
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
                        text = data[i].json.features[j].properties.route_name;
                    }
                }
                itirenaryNames[i] = text;
                let splitted = text.split('Via');
                let elementID = 'itirenary_' + cleanString(text);
                console.log('added' + elementID);
                if (splitted.length == 2) { //check if 'route_name' have: 'Via westbound chuchu'
                    $('#journeyOutputList').append('<li><span class="journey_ItemClickZone" id="' + elementID + '"><div class="outputItem" id="div_' + elementID + '"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong>Via' + splitted[1] + '</p></div></span></li>');
                } else {
                    $('#journeyOutputList').append('<li><span class="journey_ItemClickZone" id="' + elementID + '"><div class="outputItem" id="div_' + elementID + '"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong></p></div></span></li>');
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
L.control.locate().addTo(map); //check top left corner for added button/control


//this will update panel width if user changes screen size while panel is still open
$( window ).resize(function() {
    if($("#routesPanel").css("visibility") === "visible"){
        openPanel('#routesPanel');
    }else if ($("#journeyPanel").css("visibility") === "visible"){
        openPanel('#journeyPanel');
    } else{ // if all are close, only move the button panel and resize the map
        if (window.matchMedia('(min-width: 992px)').matches) {
            // large devices (laptops/desktops)
            $('.buttonPanel').css({
                'left': '0%',
                'bottom': '50%'
            });
        } else if (window.matchMedia('(min-width: 768px)').matches){
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
    if(id == '#routesPanel'){
        showAllRouteLayers();
    } else if(id == '#journeyPanel'){
        hideAllRouteLayers();
    }
    if (window.matchMedia('(min-width: 992px)').matches){
        // large devices (laptops/desktops)
        $(id).css({
            'width': '18.3%',
            'height': '100%',
            'visibility': 'visible'
        });
        $('#map').css({
            'margin-left': '18.3%',
            'width': 'calc(100% - 18.3%)',
            'height': '100%',
            'margin-bottom': '0%'
        });
        $('.buttonPanel').css({
            'bottom': '50%',
            'left': '18.3%'
        });
        $(id).show();
    }  else if (window.matchMedia('(min-width: 768px)').matches){
        // mediumDevices (landscape tablets)
        $(id).css({
            'width': '50%',
            'height': '100%',
            'visibility': 'visible'
        });
        $('#map').css({
            'margin-left': '50%',
            'width': 'calc(50%)',
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
}
function closePanel(id) {
    if (window.matchMedia('(min-width: 992px)').matches){
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
    } else if (window.matchMedia('(min-width: 768px)').matches){
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
}
$('#journeyBtn, #routesBtn').click(function (e) { //sidebar button function
    switch (e.target.id) {
        case "journeyBtn":
            // console.log('#'+e.target.id);
            if (window.matchMedia('(max-width: 600px)').matches) {
                // narrow
                if ($('#journeyPanel').height() > 0) { //check if open already
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
            } else {
                // wide
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
                        'background-color': '#2a1d63'
                    });
                }
            }
            break;
        case "routesBtn":
            if (window.matchMedia('(max-width: 600px)').matches) {
                // narrow
                if ($('#routesPanel').height() > 0) { //check if open already
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
            } else {
                // wide
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
                        'background-color': '#2a1d63'
                    });
                }
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
    }
}
function hideAllRouteLayers() {
    allRoutesArray.forEach(route => {
        route.remove();
    });
    console.log(map.getBounds);
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
        if (route.layer_id.search(inputStr) == -1) {
            elementID = cleanString(route.layer_id);
            $('#' + elementID).hide();
        } else {
            elementID = cleanString(route.layer_id);
            $('#' + elementID).show();
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
        console.log('removed: ' + itirenary.layer_id);
        $('#' + itirenary.layer_id).remove();

    });
}
function showAllRouteItem() {
    allRoutesArray.forEach(route => {
        $('#' + route.layer_id).show();
    });
}
function hideAllRouteItem() {
    allRoutesArray.forEach(route => {
        $('#' + route.layer_id).hide();
    });
}
$("#searchInput").keyup(function (event) {
    if (event.keyCode === 13) {
        $("#searchBtn").click();
    }
});
var LeafIcon = L.Icon.extend({
    options: {
        iconSize: [48, 105],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
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
    if (e.id == 'originBtn') console.log(e.id);
    if (origin.options) {
        if (map.listens('drag')) {
            var pin1 = origin.getLatLng()
            // document.getElementById("originInput").value = Object.values(pin1).reverse().toString()
            map.off('drag')
            reverseGeocode(pin1, originInput)
        } else { map.on('drag', oDrag) }
        return
    }
    if (!origin.options) {
        origin = L.marker(map.getCenter(), { draggable: true, icon: startIcon }).addTo(map);
        map.on('drag', oDrag);
    }
};

var pinDestination = function (e) {
    if (e.id == 'destinationBtnn') return
    if (destination.options) {
        if (map.listens('drag')) {
            var pin1 = destination.getLatLng()
            // document.getElementById("destinationInput").value = Object.values(pin1).reverse().toString()
            map.off('drag')
            reverseGeocode(pin1, destinationInput)
        } else { map.on('drag', dDrag) }
        return
    }
    if (!destination.options) {
        destination = L.marker(map.getCenter(), { draggable: true, icon: endIcon }).addTo(map);
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
    origin = L.marker(L.latLng([lat, lng])).addTo(map);
    originInput.value = item.place_name
    console.log('oSelected', item);
});
dgeocoder.on('select', function (item) {
    var [lng, lat] = item.center
    destination = L.marker([lat, lng]).addTo(map);
    destinationInput.value = item.place_name
    console.log('dSelected', item);
});

function reverseGeocode(latlng, inputE) {
    fetch(`https://api.maptiler.com/geocoding/${latlng.lng},${latlng.lat}.json?key=Qd14bES0AWln0kUQZN5O`)
        .then(res => { return res.json() })
        .then(data => {
            inputE.value = data.features[0].place_name
            // console.log('rGeodata', data);
        })
}

// Called when Map zoom changes
// map.on('zoomend', function () {
//     if (map.getZoom() == map.getMaxZoom()) {
//         console.log('already at max zoom out');
//     }
//     console.log('zoom ', map.getZoom());
// }
// );

// window.onscroll = function () { console.log('scrolled'); }
//script for the modal user report

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
    console.log('form');
    e.preventDefault();
    spinner.removeAttribute('hidden');
    $.ajax({
        url: '/reports',
        type: 'post',
        data: $(this).serialize(),
        success: function () {
            toggleModal();
            spinner.setAttribute('hidden', '');
            console.log('successed');
            snack('success','Successfully submitted form.');
        }
    });
});

function snack(type, text) {

    // Get the snackbar DIV
    // x.style.color = 'white'; x.style.backgroundColor = 'green';
    var x = document.getElementById("snackbar");
    if(type === 'success') {x.style.color = '#010201'; x.style.backgroundColor = '#C4F8B6'; x.innerHTML = text}
    if(type === 'error'){ x.style.color = '#010201'; x.style.backgroundColor = '#FFB7B7'; x.innerHTML = text}

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}