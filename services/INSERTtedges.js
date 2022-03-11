const db = require("./db");

module.exports = async (route_code, edge, uuid, leg_type) => {
  const {the_geom} = edge
  const result = await db.query(`
  
  INSERT INTO tedges(
	route_code, the_geom, uuid, leg_type)
	VALUES ($1, $2, $3, $4);
  
  `, [route_code, the_geom, uuid, leg_type]);
  const data = result.rows;

  return data;
  //res.render("index", { people: data });
};
