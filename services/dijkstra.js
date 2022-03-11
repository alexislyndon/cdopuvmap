const db = require("./db");

module.exports = async (start_vid, end_vid) => {

  const str = `SELECT * FROM pgr_dijkstra('SELECT id,source,target,distance as cost, rcost as reverse_cost FROM tedges_noded',${start_vid},${end_vid},true);`
    const result = await db.query(`
  
  ${str}

  
  `);
    const data = result.rows;

    return data;
    //res.render("index", { people: data });
};

