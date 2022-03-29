const db = require("./db");

module.exports = async (olat, olon, table) => {
    const result = await db.query(`
  
  (SELECT
    id
  FROM ${table}_noded_vertices_pgr
  ORDER BY the_geom <-> ST_SetSRID(ST_MakePoint($1,$2), 4326) LIMIT 1)
  
  `, [olat, olon]);
    const data = result.rows[0];

    return data;
    //res.render("index", { people: data });
};
