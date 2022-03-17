const db = require("./db");

module.exports = async (id) => {
  const result = await db.query(`
  
  SELECT r_id, nb, route_name FROM routes where r_id = $1
  
  `, [id]);
  const data = result.rows[0];

  return data;
  //res.render("index", { people: data });
};
