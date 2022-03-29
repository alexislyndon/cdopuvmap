with leg1 as (
    INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	select e.route_code, e.route_id as itinerary, leg1 as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400' as uuid, 'walk' as leg_type
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)
    ) e
    left join lateral
    ST_ShortestLine(st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326),e.the_geom) leg1
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 3500	)
    order by id desc
), route1 as (
    INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	select e.route_code, e.route_id as itinerary, leg1 as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400' as uuid, 'route' as leg_type
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)
    ) e
    left join lateral
    ST_ShortestLine(st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326),e.the_geom) leg1
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 3500	)
    order by id desc
) route2 as (
    INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	select e.route_code, e.route_id as itinerary, leg1 as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400' as uuid, 'walk' as leg_type
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)
    ) e
    left join lateral
    ST_ShortestLine(st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326),e.the_geom) leg1
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 3500	)
    order by id desc
), leg99 as (
    INSERT INTO tedges (route_code, itinerary, the_geom, uuid, leg_type)
	select e.route_code, e.route_id as itinerary, leg as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400' as uuid, 'walk' as leg_type
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)
    ) e
    left join lateral
    ST_ShortestLine(st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326),e.the_geom) leg
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 3500	)
    order by id desc
) select distinct 