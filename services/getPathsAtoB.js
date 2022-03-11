const { v4: uuidv4 } = require('uuid');
const db = require("./db");
const drawClosestLine = require('./drawClosestLine');
const getNearestRoute = require('./getNearestRoute')
const INSERTtedges = require('./INSERTtedges')
const createtedgestbl = require('./createtedgestbl')
const convCoordstoGeom = require('./convCoordstoGeom');
const pgrNodeNetwork = require('./pgrNodeNetwork');
const dijkstra = require('./dijkstra');
const getNearestVertexID = require('./getNearestVertexID');

module.exports = async (olat, olon, dlat, dlon) => { //origin lat/long, destination lat/long
  const uuid = await uuidv4();
  // const nearest_route = fromA.rows[0];
  const nearest_route_A = await getNearestRoute(olat, olon)
  const a = await convCoordstoGeom(olat, olon)
  const b = await convCoordstoGeom(dlat, dlon)
  const first_leg = await drawClosestLine(a, nearest_route_A) //should be a js object with proper properties

  await createtedgestbl()
  await INSERTtedges("leg1", first_leg, uuid, "walk");
  await INSERTtedges(nearest_route_A.route_c, nearest_route_A, uuid, "route")

  const last_leg = await drawClosestLine(nearest_route_A, b) //should be a js object with proper properties
  await INSERTtedges("leg99", last_leg, uuid, "walk");


  await pgrNodeNetwork(uuid);

  const o = await getNearestVertexID(olat,olon);
  const d = await getNearestVertexID(dlat,dlon);
  const oid = o.id
  const did = d.id



  const path = await dijkstra(parseInt(o.id),parseInt(d.id));




  // return fromA.rows

  // const fromB = await db.query(`
  // SELECT *
  // FROM edges_noded
  // ORDER BY the_geom <-> st_setsrid(st_makepoint($1, $2),4326)
  // LIMIT 10;

  // `, [dlat, dlon]);


  // const edgesNearDestination = fromB.rows;

  return path;
  // return data;
  //res.render("index", { people: data });
};
