const express = require('express');
const app = express()
const getRoutes = require('./services/getRoutes');
const getNBRoute = require('./services/getNBRoute');
const getPathsAtoB = require('./services/getPathsAtoB');
const coordsToWKT = require('./services/coordsToWKT')
const getallRoutes = require('./services/getallRoutes');

const path = require('path');
const router = express.Router();

const port = process.env.PORT || 3232;

var http = require('http');
var fs = require('fs');

function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}

app.use(express.json());

app

    .use(express.json())

    .get("/routes", async (req, res) => {
        var startTime = process.hrtime();
        const routes = await getallRoutes();

        res.json(Object.values(routes)[0]);
        var elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));
        console.log('/routes ' + elapsedSeconds + 'seconds');
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
    .get("/pathfind", async (req, res) => {
        var startTime = process.hrtime();
        const { origin, destination } = req.query;
        // console.log(`origin: ${origin}`);
        // console.log(`dest: ${destination}`);
        const [olon, olat] = origin.split(" ")
        const [dlon, dlat] = destination.split(" ")
        const result = await getPathsAtoB(olon, olat, dlon, dlat)

        // console.log(JSON.stringify(result, null, 2))
        // res.send(`${olat} ${olon} ${dlat} ${dlon}`)
        res.json(Object.values(result)[0]);
        // res.status(200)
        var elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));
        console.log('/pathfind ' + elapsedSeconds + 'seconds');
    })

    .get('/', (req, res) => {
        res.sendFile(path.join(__dirname + '/public/index.html'));
    });

app.use(express.static(path.join(__dirname, 'public')));

app.use("/", router);
app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});

