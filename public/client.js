const spinner = document.getElementById("spinner");

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
const fetchroutes = function() {
    spinner.removeAttribute('hidden');
    fetch('/routes')
        .then(res => { return res.json() })
        .then(data => {
            spinner.setAttribute('hidden', '');
            data = data.features
            for (let i = 0; i < data.length; ++i) {

                allRoutesArray.push(L.geoJSON(data[i], {
                    onEachFeature: function(feature, layer) {
                        layer.on({
                            'click': function(e) {
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
                let elementID = 'route_' + cleanString(text);
                // console.log(elementID);
                if (splitted.length == 2) { //check if 'route_name' have: 'Via westbound chuchu'
                    $('#routesOutputList').append('<li><span class="routes_ItemClickZone" id="' + elementID + '"><div class="outputItem"  id="div_' + elementID + '"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong>Via' + splitted[1] + '</p></div></span></li>');
                } else {
                    $('#routesOutputList').append('<li><span class="routes_ItemClickZone" id="' + elementID + '"><div class="outputItem" id="div_' + elementID + '"><img src="icons/jeepney.svg" alt="jeepney icon" class="jeepneyIcon "><p class="routeName" ><strong>' + splitted[0] + '<br></strong></p></div></span></li>');
                }
            }
            allRoutesArray.forEach(route => {
                route.addTo(map);
            });

            //need to add allRoutesLayers to map first before doing this loop
            for (let i = 0; i < data.length; i++) {
                allRoutesArray[i].layer_id = 'route_' + cleanString(data[i].properties.route_name); //adds new attribute 'layer_id'
            }
        })
}();

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
                                    popup(feature, e.target);
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
            $('#'+allItirenariesArray[0].layer_id).click();  // automatic focus 1 route
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

// open street map layer (maptiler api)
var osmDefault = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=VhesJPHeAqyxwLGSnrFq', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});

// map initialization
var map = L.map('map', {
    center: [8.477703150412395, 124.64379231398955], // target is rizal monument
    zoom: 14,
    minZoom: 14,
    maxBounds:[
        [8.786011072628465, 124.94613647460939],
        [8.142844225655255, 124.34532165527345]
    ],
    layers: [ //route layer can be added directly if needed
        osmDefault
    ]
});
// map.on('moveend', function() { 
//     console.log(map.getBounds());
// });
var userMarker = L.marker([8.477703150412395, 124.64379231398955]);

L.control.locate().addTo(map); //check top left corner for added button/control


//this will update panel width if user changes screen size while panel is still open
$( window ).resize(function() {
    if($('#routesPanel').width() > 0 || $('#journeyPanel').width() > 0){
        if($('#routesPanel').width() > 0){
            openPanel('#routesPanel');
        }else if($('#journeyPanel').width() > 0){
            openPanel('#journeyPanel');
        }
    }else{

    }
    // if (window.matchMedia('(max-width: 600px)').matches) {
    //     if($('#routesPanel').width() > 0 || $('#journeyPanel').width() > 0){
    //         if($('#routesPanel').width() > 0){
    //             openPanel('#routesPanel');
    //         }else if($('#journeyPanel').width() > 0){
    //             openPanel('#journeyPanel');
    //         }
    //     }else{
    //         console.log('wlay abri');
    //     }
    // } else { 
    //     if($('#routesPanel').width() > 0 || $('#journeyPanel').width() > 0){
    //         if($('#routesPanel').width() > 0){
    //             openPanel('#routesPanel');
    //         }else if($('#journeyPanel').width() > 0){
    //             openPanel('#journeyPanel');
    //         }
    //     }else{
    //         console.log('wlay abri');
    //     }
    // }
});
function openPanel(id) {
    // $(id).css({
    //     'width': '350px',
    //     'visibility': 'visible'
    // });
    if (window.matchMedia('(max-width: 600px)').matches) {
        $(id).css({
            'width': '85%',
            'visibility': 'visible'
        });
    } else {
        $(id).css({
            'width': '350px',
            'visibility': 'visible'
        });
    }
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

$('#refreshBtn').click(function (){
    sessionStorage.setItem("reloading", "true");
    document.location.reload();
});
window.onload = function() {
    var reloading = sessionStorage.getItem("reloading");
    if (reloading) {
        sessionStorage.removeItem("reloading");
        openPanel('#journeyPanel');
        $('#journeyBtn').css({
            'background-color': '#A8C0FF'
        });
    }
}
function hideAllRouteLayers(){
    allRoutesArray.forEach(route => {
        route.remove();
    });
    console.log(map.getBounds);
}
var selectSpecificRoute = false;
$('#hideAllBtn').click(function () {
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
    for (let i = 0; i < allRoutesArray.length; i++) {
        if (allRoutesArray[i].layer_id == id) {
            if(selectSpecificRoute){
                allRoutesArray[i].addTo(map);
            }
            highlight(allRoutesArray[i]);
            activeButton(allRoutesArray[i].layer_id);
        } else {
            inActiveButton(allRoutesArray[i].layer_id);
            if(selectSpecificRoute){
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
        'border': '3px solid #A8C0FF'
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
    if (e.id == 'originBtnn') return
    if (origin.options) {
        if (map.listens('drag')) {
            var pin1 = origin.getLatLng()
            document.getElementById("originInput").value = Object.values(pin1).reverse().toString()
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
    if (e.id == 'destinationBtnn') return
    if (destination.options) {
        if (map.listens('drag')) {
            var pin1 = destination.getLatLng()
            document.getElementById("destinationInput").value = Object.values(pin1).reverse().toString()
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

//popup message for user report
function myPopup() {
    alert("Your report is submitted successfully!");
  }

