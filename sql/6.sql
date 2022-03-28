select distinct itinerary from tedges where uuid='5c1d8425-e51b-46fe-96ce-49c94af4dd4f'

SELECT pgr_nodeNetwork('tedges', 0.00005, 'id', 'the_geom', 'noded', 'uuid=''5c1d8425-e51b-46fe-96ce-49c94af4dd4f'' AND itinerary=29 ')

SELECT pgr_createTopology('tedges_noded', 0.00005, )
SELECT pgr_createTopology('tedge_table', 0.001, 'the_geom', 'id', 'source', 'target', rows_where := '', clean := f)

pgr_trsp('SELECT id,source,target,distance as cost, rcost as reverse_cost FROM tedges_noded WHERE ''uuid'=''' ', source integer, target integer,
                  directed boolean, has_rcost boolean [,restrict_sql text]);