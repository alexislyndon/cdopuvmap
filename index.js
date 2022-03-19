const express = require('express');
const app = express()
const getRoutes = require('./services/getRoutes');
const getNBRoute = require('./services/getNBRoute');
const getPathsAtoB = require('./services/getPathsAtoB');
const coordsToWKT = require('./services/coordsToWKT')
const parse = require('wellknown');
const getallRoutes = require('./services/getallRoutes');

const path = require('path');
const router = express.Router();

const port = 3232;

var http = require('http');
var fs = require('fs');

app.use(express.json());

app

    .use(express.json())

    .get("/routes/", async (req, res) => {
        const routes = await getallRoutes();

        res.json(Object.values(routes)[0]);
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
        const [olon, olat] = o.split(" ")
        const [dlon, dlat] = d.split(" ")
        const result = await getPathsAtoB(olon, olat, dlon, dlat)

        console.log(result);
        // res.send(`${olat} ${olon} ${dlat} ${dlon}`)
        res.json(Object.values(result)[0]);
        // res.status(200)
    })
    
    .get('/', (req, res) => {
        res.sendFile(path.join(__dirname+'/public/index.html'));
    });
    
    app.use(express.static(path.join(__dirname,'public')));

    app.use("/", router);
    app.listen(port, () => {
        console.log(`App listening on http://localhost:${port}`);
    });