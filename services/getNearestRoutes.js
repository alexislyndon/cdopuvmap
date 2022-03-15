const db = require("./db");
// 124.64343309402464, 8.47716876512738
module.exports = async (lat, long) => {
  const result = await db.query(`
  
  select
  (select st_setsrid(st_makepoint($1, $2),4326)::geometry) As origin,
   (SELECT the_geom
  FROM edges
  ORDER BY the_geom <-> st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)
  LIMIT 1) as nearest_route
  
  `, []);
  const data = result.rows;

  return data;
  //res.render("index", { people: data });
};



