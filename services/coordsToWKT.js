const db = require("./db");

module.exports = async (lat, long) => {
    const result = await db.query(`
  
    select st_setsrid(st_makepoint($1, $2),4326) as the_geom
  
  `, [lat, long]);
    const point_geom = result.rows;

    return point_geom;
    //res.render("index", { people: data });
};
