const express = require('express');
const app = express()
const getRoutes = require('./services/getRoutes');
const getNBRoute = require('./services/getNBRoute');
const getPathsAtoB = require('./services/getPathsAtoB');
const coordsToWKT = require('./services/coordsToWKT')
const parse = require('wellknown');
const getallRoutes = require('./services/getallRoutes');

const port = 3232;

app

    .use(express.json())

    .get("/routes/", async (req, res) => {
        const routes = await getallRoutes();

        res.send(Object.values(routes)[0]);
    })

    .get("/routes/nb/:id", async (req, res) => {
        const { id } = req.params;
        const result = await getNBRoute(id)
        res.send(result);
    })

    .get('/test', async (req, res) => {
        const result = await coordsToWKT(124.6450102329254, 8.48160439674907);
        const kini = result[0].the_geom
        const k = parse('POINT(124.6450102329254 8.48160439674907)');
        res.send(k);
    })


    //List your latitude coordinates before longitude coordinates.
    // Check that the first number in your latitude coordinate is between -90 and 90.
    // Check that the first number in your longitude coordinate is between -180 and 180.
    .get("/pathfind/:o/:d", async (req, res) => {
        const { o, d } = req.params;
        const [olat, olon] = o.split(" ")
        const [dlat, dlon] = d.split(" ")
        const result = await getPathsAtoB(olat, olon, dlat, dlon)

        console.log(result);
        // res.send(`${olat} ${olon} ${dlat} ${dlon}`)
        res.send(result)
    })

    .get('/', (req, res) => {
        res.send("Hello World")
    });


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
    //overlays.AllRouteLayer.addTo(map);
    overlays.RD_GUSA.addTo(map);
    overlays.PATAG_COGON.addTo(map);
    overlays.BAYABAS_COGON.addTo(map);
    overlays.BONBON_COGON.addTo(map);
    overlays.BALULANG_COGON.addTo(map);
    overlays.BUENA_ORO_COGON.addTo(map);
    overlays.CAMP_EVG_COGON.addTo(map);
}

function hideAll(){
    //overlays.AllRouteLayer.remove();
    overlays.RD_GUSA.remove();
    overlays.PATAG_COGON.remove();
    overlays.BAYABAS_COGON.remove();
    overlays.BONBON_COGON.remove();
    overlays.BALULANG_COGON.remove();
    overlays.BUENA_ORO_COGON.remove();
    overlays.CAMP_EVG_COGON.remove();
}

function toggleRoute(){
    switch (window.event.target.id) {
        case 'rd_gusa':
            console.log('rd gusa');
            if(overlays.RD_GUSA._mapToAdd == null){
                overlays.RD_GUSA.addTo(map);
            } else{
                overlays.RD_GUSA.remove();
            }
            break;
        case 'patag_cogon':
            console.log('patag cogon');
            if(overlays.PATAG_COGON._mapToAdd == null){
                overlays.PATAG_COGON.addTo(map);
            } else{
                overlays.PATAG_COGON.remove();
            }
            break;
        case 'bayabas_cogon':
            console.log('bayabas cogon');
            if(overlays.BAYABAS_COGON._mapToAdd == null){
                overlays.BAYABAS_COGON.addTo(map);
            } else{
                overlays.BAYABAS_COGON.remove();
            }
            break;
        case 'bonbon_cogon':
            console.log('bonbon cogon');
            if(overlays.BONBON_COGON._mapToAdd == null){
                overlays.BONBON_COGON.addTo(map);
            } else{
                overlays.BONBON_COGON.remove();
            }
            break;
        case 'balulang_cogon':
            console.log('balulang cogon');
            if(overlays.BALULANG_COGON._mapToAdd == null){
                overlays.BALULANG_COGON.addTo(map);
            } else{
                overlays.BALULANG_COGON.remove();
            }
            break;
        case 'buena_oro_cogon':
            console.log('buena oro cogon');
            if(overlays.BUENA_ORO_COGON._mapToAdd == null){
                overlays.BUENA_ORO_COGON.addTo(map);
            } else{
                overlays.BUENA_ORO_COGON.remove();
            }
            break;
        case 'camp_evg_cogon':
            console.log('camp evg cogon');
            if(overlays.CAMP_EVG_COGON._mapToAdd == null){
                overlays.CAMP_EVG_COGON.addTo(map);
            } else{
                overlays.CAMP_EVG_COGON.remove();
            }
            break;
        default:
            break;
    }
}

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
})

