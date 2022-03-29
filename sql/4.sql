	select e.route_code, e.route_id as itinerary, leg1 as the_geom, 'e1414040-aa8a-4403-a9c8-df2f2393b400' as uuid, 'walk' as leg_type
    from (
    SELECT *
    FROM routes
    ORDER BY the_geom <-> st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326)
    ) e
    left join lateral
    ST_ShortestLine(st_setsrid(st_makepoint(124.64343309402464, 8.47716876512738),4326),e.the_geom) leg1
    on true
	-------------------------------------- for every itinerary, run pgr_nodeNetwork, save result to another table
select * from 
(
	select distinct itinerary, uuid
	from tedges 
) t
--e605a07e-c811-409d-a0dc-2b062963b0ed pgr_nodeNetwork('edge_table', 0.001, 'id', 'the_geom', 'noded', '',  f)
left join lateral
pgr_nodeNetwork('tedges', 0.00005, 'id', 'the_geom', 'noded', 'uuid=t.uuid AND itinerary=t.itinerary', true) nodenetwork
on true


-- 
select distinct itinerary
from tedges 
order by itinerary