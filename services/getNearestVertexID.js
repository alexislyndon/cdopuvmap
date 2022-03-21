const db = require("./db");

module.exports = async (olat, olon) => {
    const result = await db.query(`
  
  (SELECT
    id
  FROM tedges_noded_vertices_pgr
  ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint($1,$2), 4326) LIMIT 1)
  
  `, [olat, olon]);
    const data = result.rows[0];

    return data;
    //res.render("index", { people: data });
};
