const db = require("./db");

module.exports = async (start_vid, end_vid) => {

  const str = `SELECT * FROM pgr_dijkstra('SELECT id,source,target,distance as cost, rcost as reverse_cost FROM tedges_noded',${start_vid},${end_vid},true);`
  const str2 = ` SELECT jsonb_build_object(
    'type',     'FeatureCollection',
    'features', jsonb_agg(features.feature)
) as json
FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'id',         id,
    'geometry',   ST_AsGeoJSON(the_geom)::jsonb,
    'properties', to_jsonb(inputs) - 'id' - 'the_geom'
  ) AS feature
  FROM (

    SELECT * FROM pgr_dijkstra('SELECT id,source,target,distance as cost, rcost as reverse_cost FROM tedges_noded',${start_vid},${end_vid},true) as dijkstra
    left join tedges_noded t_n
    on t_n.id= dijkstra.edge

  ) inputs) features;`
  const result = await db.query(`
  
  ${str2}

  
  `);
  const data = result.rows[0];

  return data;
  //res.render("index", { people: data });
};

