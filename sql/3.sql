with routes as(select * from routes)
select leg1, r.the_geom, leg99
from routes r,
	lateral ST_ShortestLine(st_setsrid(st_makepoint(124.62158918380739,8.49143051788561),4326),r.the_geom) leg1,
	ST_ShortestLine(st_setsrid(st_makepoint(124.64174866676332,8.483960142007458),4326),r.the_geom) leg99,
	lateral (select the_geom ) route
	WHERE true
from routes r
on true
left join lateral
	ST_ShortestLine(r.the_geom,leg1.the_geom) leg99
on true
where (select ST_Length(ST_Transform(leg1,26986)) <= 350 )
order by id desc


WITH leg1 as (
        select * -- e.route_code, e.route_name, e.route_id as itinerary, leg1 as the_geom, '${uuid}'::uuid as uuid, 'walk1' as leg_type
        from (
        SELECT *
        FROM routes
        --ORDER BY the_geom <-> st_setsrid(st_makepoint($1,$2),4326)
        ) e
        left join lateral
        ST_ShortestLine(st_setsrid(st_makepoint(124.62158918380739,8.49143051788561),4326),e.the_geom) leg1
        on true
        where (select ST_Length(ST_Transform(leg1,26986)) <= 300 )
        order by id desc
    ), route as (
        SELECT route_code, route_name, route_id as itenerary, the_geom, '${uuid}'::uuid as uuid, 'route' as leg_type
        from routes
    ), leg99 as (
        select e.route_code, e.route_name, e.route_id as itinerary, leg1 as the_geom, '${uuid}'::uuid as uuid, 'walk99' as leg_type
        from (
        SELECT *
        FROM routes
        ORDER BY the_geom <-> st_setsrid(st_makepoint($3,$4),4326)
        ) e
        left join lateral
        ST_ShortestLine(e.the_geom, st_setsrid(st_makepoint($3,$4),4326)) as leg1
        on true
        where (select ST_Length(ST_Transform(leg1,26986)) <= ${maxwalk})
        order by id desc
    ) 
    INSERT INTO tedges (route_code, route_name, itinerary, the_geom, uuid, leg_type)
    (
    select distinct * from leg1
    union
    select distinct * from route
    union
    select distinct * from leg99
        )
		pgr_nodeNetwork('tedges', 0.00005
    