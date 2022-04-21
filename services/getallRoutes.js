const db = require("./db");

module.exports = async () => {
    const result = await db.query(`
    
    SELECT jsonb_build_object(
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
      FROM (SELECT * FROM routescopy order by id) inputs) features;
    
    `);

    return result.rows[0];

}