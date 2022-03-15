const db = require("./db");

module.exports = async () => {
  const result = await db.query(`
  
  CREATE TABLE IF NOT EXISTS tedges
  (
    id BIGSERIAL PRIMARY KEY,
      route_code character varying COLLATE pg_catalog."default",
      the_geom geometry(Geometry,4326),
      source integer,
      target integer,
    uuid uuid,
    leg_type character varying
  )
  
  `);
  const data = result.rows;

  return data;
  //res.render("index", { people: data });
};
