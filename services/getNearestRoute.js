const db = require("./db");
// 124.64343309402464, 8.47716876512738
module.exports = async (lat, long) => {
  const result = await db.query(`
  
SELECT *
  FROM routes
  ORDER BY the_geom <-> st_setsrid(st_makepoint($1, $2),4326)
  LIMIT 1
  `, [lat, long]);
  const data = result.rows[0];

  return data;
  //res.render("index", { people: data });
};



