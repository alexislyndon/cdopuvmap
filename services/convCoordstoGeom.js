const db = require("./db");

module.exports = async (lat, long) => {
  const result = await db.query(`
  
  select ST_SetSRID(ST_MakePoint($1,$2), 4326) as the_geom
  
  `,[lat, long]);
  const data = result.rows[0];

  return data;
  //res.render("index", { people: data });
};


//