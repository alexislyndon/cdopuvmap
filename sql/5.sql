with recursive xyz as (
	select e.route_code, e.route_id as itinerary, leg1, the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400'::uuid as uuid, 'walk' as leg_type, ST_Length(ST_Transform(leg1,26986))
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.65688705444335,8.481370943729583),4326)
    ) e
    inner join --lateral
    ST_ShortestLine(st_setsrid(st_makepoint(124.65688705444335,8.481370943729583),4326),e.the_geom) leg1
    on true
    where (select ST_Length(ST_Transform(leg1,26986)) <= 450)
    order by id ASC
	UNION
		select r.route_code, r.route_id as itinerary, leg1 as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400'::uuid as uuid, 'walk' as leg_type
		from routes r
		inner join 
		ST_ShortestLine(the_geom,r.the_geom) leg1 
		on route_code=r.route_code
		where (select ST_Length(ST_Transform(leg1,26986)) <= 250	)
		--where r.route_id != itinerary
) select * from xyz