const db = require("./db");

module.exports = async () => {
  const result = await db.query(`
  
  select ST_ShortestLine(origin,nearest_route) as walk1
  from
  (select
          (select st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)::geometry) As origin,
           (SELECT the_geom
          FROM edges
          ORDER BY the_geom <-> st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)
          LIMIT 1) as nearest_route
  ) As foo;
  
  `);
  const line_geom = result.rows;

  return data;
  //res.render("index", { people: data });
};


