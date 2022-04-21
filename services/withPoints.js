const db = require("./db");

module.exports = async (start_vid, end_vid) => {

    const result = await db.query(`
    SELECT jsonb_build_object(
        'type',     'FeatureCollection',
        'features', jsonb_agg(features.feature)
        ) json
    FROM (
    SELECT jsonb_build_object(
    'type',       'Feature',
    'id',         id,
    'geometry',   ST_AsGeoJSON(the_geom)::jsonb,
    'properties', to_jsonb(inputs) - 'id' - 'the_geom'
    ) feature
    FROM (
        
    
    
    SELECT *
    FROM   pgr_withPoints(
    'SELECT id, source, target, distance cost, rcost reverse_cost FROM routes_noded ORDER BY id',
    'SELECT pnt.id AS pid,
     edg.edge_id,
     edg.fraction
    FROM   points_table AS pnt
    CROSS JOIN LATERAL (
    SELECT id AS edge_id,
       ST_LineLocatePoint(the_geom, pnt.the_geom) AS fraction
    FROM   routes_noded
    ORDER BY
       the_geom <-> pnt.the_geom
    LIMIT  1
    ) AS edg',
    -1, -2,
    details := TRUE
    ) dijkstra
    
        
        left join routes_noded t_n
        on t_n.id= dijkstra.edge
            
    ) inputs 
    ) features;
    `);

    return result.rows[0];
}