var map = L.map('map').setView([8.477703150412395, 124.64379231398955], 13);// target is rizal monument

// map tiles (maptiler api)
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=VhesJPHeAqyxwLGSnrFq',
    {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    }).addTo(map);

//show route in the map
L.geoJSON(route_RD_GUSA, {
    style: route_RD_GUSA_style
}).addTo(map);

L.geoJSON(route_PATAG_COGON_MKT_VIA_WB_TERMINAL, {
    style: route_PATAG_COGON_MKT_VIA_WB_TERMINAL_style
}).addTo(map);

L.geoJson(route_BAYABAS_COGON_RA, {
    style: route_BAYABAS_COGON_RA_style
}).addTo(map);

//adds marker (blue teardrop) on the map using [latlng]. useful for points of interest (?)
var userMarker = L.marker([8.477703150412395, 124.64379231398955]).addTo(map)
// L.geoJSON(geojsonFeature).addTo(map);

L.control.locate().addTo(map); //check top left corner for added button/control

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