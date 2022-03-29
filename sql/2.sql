--- goal: get the routes that are 250m away from destination
--- use the routes above to draw leg99
--- use routes above to draw leg1

with routeslist as (
	select route_code,route_id, route_name, the_geom --xx*cosd(8.481561950756083),
	from
		(select *  from routes) r
	inner join lateral --ST_Length(ST_Transform(leg1,26986))
		ST_Distance(ST_Transform(st_setsrid(st_makepoint(124.65665102005003, 8.481561950756083),4326),3857), ST_Transform(r.the_geom,3857)) xx
	on true
	where xx*cosd(8.481561950756083) < 250
    inner join 
),
	leg99 as (
	--INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	select e.route_code, e.route_id ,e.route_name, leg1 as the_geom --'e1414040-aa8a-4403-a9c8-df2f2393b400'::uuid as uuid, 'walk' as leg_type
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.65665102005003, 8.481561950756083),4326)
    ) e
    left join lateral
    ST_ShortestLine(e.the_geom, st_setsrid(st_makepoint(124.65665102005003, 8.481561950756083),4326)) leg1
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 450)
    order by id desc
) 
select distinct * from routeslist 
union
select distinct * from leg99
	
	
	select rr.route_id,rr.the_geom, rr.route_code,
	(ST_Distance(st_setsrid(st_makepoint(124.65665102005003, 8.481561950756083),4326), rr.the_geom) * cosd(42.3521) < 100 as asdf
	from routes rr
	)
select * from routeslist
with leg99 as (
	--INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	select e.route_code, e.route_id as itinerary, leg1 as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400'::uuid as uuid, 'walk' as leg_type
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.65665102005003, 8.481561950756083),4326)
    ) e
    left join lateral
    ST_ShortestLine(e.the_geom, st_setsrid(st_makepoint(124.65665102005003, 8.481561950756083),4326)) leg1
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 450)
    order by id desc
),
leg1 as (
	--INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	select e.route_code, e.route_id as itinerary, leg1 as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b4ff'::uuid as uuid, 'walk' as leg_type
    from (
--     SELECT *
--     FROM routes
--     ORDER BY the_geom <-> st_setsrid(st_makepoint(124.645836353302, 8.483005111887035),4326)
    ) e
    left join lateral
    ST_ShortestLine(st_setsrid(st_makepoint(124.645836353302, 8.483005111887035),4326),e.the_geom) leg1
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 3500	)
    order by id desc
), route as (
	--INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	SELECT route_code, route_id as itenerary, the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400'::uuid as uuid, 'route' as leg_type
	from routes
)
INSERT INTO tedges (route_code, itinerary, the_geom,uuid, leg_type)
(
select distinct * from leg1
union
select distinct * from route
union
select distinct * from leg99
	)


select distinct itinerary
from tedges
where
uuid='f64df0c1-eef4-4f3e-bfb0-65f099eb3cf8'
