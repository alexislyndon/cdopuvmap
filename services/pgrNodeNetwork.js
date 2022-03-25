const db = require("./db");

module.exports = async (uuid) => {
  const str = `SELECT pgr_nodeNetwork('tedges', 0.00005, 'id', 'the_geom', 'noded', 'uuid=''${uuid}''');`
  const result = await db.query(`
  
  ${str}
  
  
  `);
  const data = result.rows;

  console.log(`noded`);
  await db.query(`
  
  SELECT pgr_createTopology('tedges_noded', 0.00005);
  
  ALTER TABLE tedges_noded ADD COLUMN IF NOT EXISTS distance FLOAT8;
  ALTER TABLE tedges_noded ADD COLUMN IF NOT EXISTS rcost FLOAT8;
  ALTER TABLE tedges_noded ADD COLUMN IF NOT EXISTS leg_type character varying;
  ALTER TABLE tedges_noded ADD COLUMN IF NOT EXISTS route_name character varying;
  ALTER TABLE tedges_noded ADD COLUMN IF NOT EXISTS itinerary integer;

  
  UPDATE tedges_noded AS n
  SET 
  route_code=o.route_code,
  leg_type=o.leg_type,
  route_name=o.route_name,
  itinerary=o.itinerary
  FROM tedges as o
  WHERE n.old_id=o.id;
  
  UPDATE tedges_noded SET distance = ST_Length(ST_Transform(the_geom, 4326)::geography) / 1000 where leg_type='route';
  UPDATE tedges_noded SET rcost = 99999;
  UPDATE tedges_noded SET distance = ST_Length(ST_Transform(the_geom, 4326)::geography) / 500 where leg_type LIKE 'walk%';

  `)
  
  return data;
  //res.render("index", { people: data });
};

// ALTER TABLE tedges_noded ADD distance FLOAT8;
// ALTER TABLE tedges_noded ADD rcost FLOAT8;