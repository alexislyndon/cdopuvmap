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

        // console.log(result);
        // res.send(`${olat} ${olon} ${dlat} ${dlon}`)
        res.status(200)
    })

    .get('/', (req, res) => {
        res.send("Hello World")
    });


app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
})
