const db = require("./db");

module.exports = async (uuid) => {
  const str = `SELECT pgr_nodeNetwork('tedges', 0.00005, 'id', 'the_geom', 'noded', 'uuid=''${uuid}''');`
  const result = await db.query(`
  
  ${str}
  
  
  `);
  const data = result.rows;

  await db.query(`
  
  SELECT pgr_createTopology('tedges_noded', 0.00005);

  UPDATE tedges_noded SET distance = ST_Length(ST_Transform(the_geom, 4326)::geography) / 1000;
  UPDATE tedges_noded SET rcost = 99999;
  

  `)
  
  return data;
  //res.render("index", { people: data });
};

// ALTER TABLE tedges_noded ADD distance FLOAT8;
// ALTER TABLE tedges_noded ADD rcost FLOAT8;