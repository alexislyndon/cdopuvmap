(with routes as(select * from routes)
select route_id, leg1, r.the_geom, leg99
from routes r,
	lateral ST_ShortestLine(st_setsrid(st_makepoint(124.62158918380739,8.49143051788561),4326),r.the_geom) leg1,
	ST_ShortestLine(st_setsrid(st_makepoint(124.64174866676332,8.483960142007458),4326),r.the_geom) leg99
)
SELECT pgr_nodeNetwork('tedges', 0.00005, 'id', 'the_geom', 'noded', 'uuid=''${uuid}''');
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

-------------------------------- PG DIJKSTRA
SELECT * FROM pgr_dijkstra('SELECT id,source,target,distance as cost, rcost as reverse_cost FROM tedges_noded',${start_vid},${end_vid},true);`
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
-----------------------------------------------

SELECT  seq, id1, id2, cost, route_code, leg_type
FROM pgr_trsp(
        'SELECT id::integer, source, target, distance as cost, rcost as reverse_cost  FROM tedges_noded',
        301, 306, true, true
) p
left join tedges_noded t
on p.id2 = t.id