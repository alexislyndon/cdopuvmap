WITH recursive leg1 as (
	--INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	select e.route_code, e.route_id as itinerary, leg1 as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b4ff'::uuid as uuid, 'walk' as leg_type
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.645836353302, 8.483005111887035),4326)
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
), leg99 as (
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
    where (select ST_Length(ST_Transform(leg1,26986)) <= 3500)
    order by id desc
) 
INSERT INTO tedges (route_code, itinerary, the_geom,uuid, leg_type)
(
select distinct * from leg1
union
select distinct * from route
union
select distinct * from leg99
	)
