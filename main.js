//this function was used for 'onEachFeature' allroutes option
function popup(feature, layer){
    if (feature.properties && feature.properties.name) {
        layer.bindPopup('Name: ' + feature.properties.name + '<br> Code: ' +  feature.properties.code);
    }
}

//this function can be used for 'style' leaflet option
function redcolor(){
    return{
        color: "#ff0000",
        opacity: 0.65
    }
}

var allRoutes = L.geoJSON(allroutesJson,{
    onEachFeature: popup, //see pop up function defined above
}) //pwede man dili i add dretso

var allRouteLayer = L.layerGroup([allRoutes]);

// open street map layer (maptiler api)
var osmDefault = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=VhesJPHeAqyxwLGSnrFq',
    {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    });

// map initialization
var map = L.map('map', {
    center: [8.477703150412395, 124.64379231398955], // target is rizal monument
    zoom: 13,
    layers: [osmDefault, allRouteLayer]
});

//two objects to contain our base layers and overlays. both are defined above. used for layers control
var baseMaps = { 
    "Default": osmDefault
}

var overlays = { 
    "AllRouteLayer": allRouteLayer
}

L.control.layers(baseMaps, overlays).addTo(map);

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

function openNav() {
    document.getElementById("mySidebar").style.width = "250px";

    document.getElementById("openbtn").style.marginLeft = "250px";
    document.getElementById("openbtn").style.visibility = "hidden";

    document.getElementById("closebtn").style.marginLeft = "250px";
    document.getElementById("closebtn").style.visibility = "visible";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";

    document.getElementById("openbtn").style.marginLeft = "0";
    document.getElementById("openbtn").style.visibility = "visible";

    document.getElementById("closebtn").style.marginLeft = "0";
    document.getElementById("closebtn").style.visibility = "hidden";

}

function showAll(){
    routes.forEach(route => {
        showVisibility(route);
    });
}

function hideAll(){
    console.log(overlays.AllRouteLayer);
}

function hideVisibility(layer){
   return{
       opacity:0
   }
}

function showVisibility(layer){
    layer.setStyle({
        opacity: 0.65,
    });
}