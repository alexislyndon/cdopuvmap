const { Router } = require('express');
const getallRoutes = require('../services/getallRoutes');
const getNBRoute = require('../services/getNBRoute');
const pathfind3 = require('../services/pathfind3');
const getPathsAtoB = require('../services/getPathsAtoB');
const router = Router();

const { v4: uuidv4 } = require('uuid');
const insertReport = require('../services/insertReport');

function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(4);
    return seconds;
}

router.get("/routes", async (req, res) => {
    var startTime = process.hrtime();
    const routes = await getallRoutes();

    res.json(Object.values(routes)[0]);
    var elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));
    console.log('/routes ' + elapsedSeconds + 'seconds');
})

router.get("/routes/nb/:id", async (req, res) => {
    const { id } = req.params;
    const result = await getNBRoute(id)
    res.send(result);
})

router.get('/itineraries', async (req, res) => {
    var startTime = process.hrtime();

    // const result = await coordsToWKT(124.6450102329254, 8.48160439674907);
    // const kini = result[0].the_geom
    // const k = parse('POINT(124.6450102329254 8.48160439674907)');
    const { origin, destination } = req.query;
    const [olon, olat] = origin.split(" ")
    const [dlon, dlat] = destination.split(" ")
    const result = await pathfind3(olon, olat, dlon, dlat)
    res.json(result);
    // console.log(result);
    var elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));
    console.log('/test ---' + elapsedSeconds + 'seconds');
})

router.get('/asdf', async (req, res) => {
    const uuid = await uuidv4().replace(/-/g, '');
    const result = await db.query(`
    CREATE TABLE "${uuid}" (
        id serial PRIMARY KEY,
        route_id integer,
        route_code varchar,
        the_geom geometry(Geometry,4326),
        route_name varchar,
        leg_type varchar,
        distance float,
        uuid uuid );
    `);
    res.json(Object.values(result));
})


//List your latitude coordinates before longitude coordinates.
// Check that the first number in your latitude coordinate is between -90 and 90.
// Check that the first number in your longitude coordinate is between -180 and 180.
router.get("/pathfind", async (req, res) => {
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

router.post("/reports", async (req, res) => {
    var { summary, desc, type, name, email } = req.body
    res.json({ summary, desc, type, name, email })
    // const result = await insertReport(req.body);

});

module.exports = router